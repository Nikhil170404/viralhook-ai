import { withCSRF } from '@/middleware/withCSRF';
import { getCinematicPrompt, getShockingPrompt, getChaosPrompt, getAnimePrompt, getCartoonPrompt, getStickmanPrompt } from '@/lib/prompts/modes';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';
import { logger, createRequestLogger } from '@/lib/logger';
import { checkUserRateLimit, incrementUserUsageDB, checkBurstLimit } from '@/lib/rate-limit';

import { validateAndSanitizeInputs, escapeForPrompt } from '@/lib/security/sanitize';
import { moderateAllInputs } from '@/lib/security/content-filter';
import { validateGenerateRequest } from '@/lib/schemas/generate';
import { advancedPromptFilter } from '@/lib/security/advanced-prompt-filter';

export const maxDuration = 60; // Allow up to 60 seconds for Deepseek R1 reasoning

const CONFIG = {
    RATE_LIMIT: {
        MAX_REQUESTS: 5,
        WINDOW_MS: 60_000,
        FALLBACK_MAX: 3,
    },
    AI: {
        TIMEOUT_SECONDS: 60,
        MODEL: 'deepseek/deepseek-r1-0528:free',
    },
    CACHE: {
        TTL_SECONDS: 3600,
    }
} as const;



function getClientIP(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }
    return 'unknown';
}

function createCacheKey(object: string, mode: string, targetModel: string, aiModel: string): string {
    const normalized = `${object.toLowerCase().trim()}:${mode}:${targetModel || 'auto'}:${aiModel || 'default'}`;
    return `prompt_cache:${Buffer.from(normalized).toString('base64').slice(0, 50)}`;
}

async function generateHandler(req: Request) {
    const requestId = crypto.randomUUID().slice(0, 8);
    console.log('[DEBUG] Handler Started', requestId);
    const clientIP = getClientIP(req);
    console.log('[DEBUG] IP got', clientIP);
    const log = createRequestLogger(requestId);

    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) { }
                }
            }
        );

        let user = null;
        let dbClient = supabase;

        const { data: { user: cookieUser } } = await supabase.auth.getUser();
        user = cookieUser;

        if (!user) {
            const authHeader = req.headers.get('Authorization');
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '');
                const supabaseStateless = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    { global: { headers: { Authorization: `Bearer ${token}` } } }
                );
                const { data: { user: tokenUser } } = await supabaseStateless.auth.getUser();
                user = tokenUser;
                if (user) dbClient = supabaseStateless;
            }
        }

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized. Please log in again." },
                { status: 401 }
            );
        }

        if (user) log.child({ userId: user.id });

        // Rate Limiting (Burst Protection via Upstash)
        const burstLimit = await checkBurstLimit(user.id, 'aiGeneration');
        if (!burstLimit.success) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Please wait." },
                { status: 429, headers: burstLimit.headers }
            );
        }

        // ===== DAILY CREDIT CHECK (10 free credits/day) =====
        const { data: creditsRemaining, error: creditError } = await dbClient.rpc(
            'use_credit',
            { p_user_id: user.id }
        );

        if (creditError) {
            console.error('[Credit Error]', creditError);
            // If RPC doesn't exist yet, allow the request (graceful degradation)
            console.warn('[Credits] RPC not found, allowing request');
        } else if (creditsRemaining === -1) {
            return NextResponse.json(
                {
                    error: "Daily limit reached (10 prompts/day). Come back tomorrow!",
                    creditsRemaining: 0
                },
                { status: 429 }
            );
        }

        let rawBody;
        try {
            rawBody = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const validation = validateGenerateRequest(rawBody);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.errors },
                { status: 400 }
            );
        }

        const { object: rawObject, mode, targetModel, aiModel, personDescription: rawPerson } = validation.data!;

        const sanitizeResult = validateAndSanitizeInputs(rawObject, rawPerson);
        if (!sanitizeResult.isValid) {
            log.warn(`Sanitization blocked input: ${sanitizeResult.errors.join(', ')}`, { input: rawObject });
            return NextResponse.json(
                { error: "Invalid input detected", details: sanitizeResult.errors },
                { status: 400 }
            );
        }

        const object = sanitizeResult.object;
        const personDescription = sanitizeResult.personDescription;

        // 5. Security: Prompt Injection Check (Advanced)
        const combinedInput = object + " " + (personDescription || "");
        const injectionCheck = advancedPromptFilter.detectInjection(combinedInput);

        if (injectionCheck.blocked) {
            log.warn(`Injection Blocked (Score: ${injectionCheck.score}): ${injectionCheck.reason}`, { input: object });
            return NextResponse.json({
                error: "Security Violation: Unsafe content detected.",
                category: injectionCheck.reason,
                score: process.env.NODE_ENV === 'development' ? injectionCheck.score : undefined
            }, { status: 400 });
        }

        const moderationResult = moderateAllInputs(object, personDescription);
        if (!moderationResult.isAllowed) {
            log.warn(`Content moderation blocked: ${moderationResult.category}`, { category: moderationResult.category });
            return NextResponse.json(
                { error: "Content policy violation", category: moderationResult.category },
                { status: 400 }
            );
        }

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: "Server Configuration Error: API Key Missing" },
                { status: 500 }
            );
        }

        const cacheKey = createCacheKey(object, mode!, targetModel || 'auto', aiModel || CONFIG.AI.MODEL);
        let cachedResponse = null;

        try {
            const cached = await redis.get(cacheKey);
            if (cached && typeof cached === 'string') {
                cachedResponse = JSON.parse(cached);
                log.info(`Cache hit for ${cacheKey}`);
            }
        } catch (e) {
            // Ignore cache read errors
        }

        if (cachedResponse) {
            return NextResponse.json({
                ...cachedResponse,
                cached: true,
                dbError: null
            });
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": "https://viralhook.ai",
                "X-Title": "Viral Hooks AI",
            }
        });

        let systemPrompt = "";
        let randomStyle: any = {};

        switch (mode) {
            case 'cinematic':
                ({ systemPrompt, randomStyle } = getCinematicPrompt(object, targetModel, personDescription));
                break;
            case 'shocking':
                ({ systemPrompt, randomStyle } = getShockingPrompt(object, targetModel, personDescription));
                break;
            case 'anime':
                ({ systemPrompt, randomStyle } = getAnimePrompt(object, targetModel, personDescription));
                break;
            case 'cartoon':
                ({ systemPrompt, randomStyle } = getCartoonPrompt(object, targetModel, personDescription));
                break;
            case 'stickman':
                ({ systemPrompt, randomStyle } = getStickmanPrompt(object, targetModel, personDescription));
                break;
            case 'chaos':
            default:
                ({ systemPrompt, randomStyle } = getChaosPrompt(object, targetModel, personDescription));
                break;
        }

        const escapedObject = escapeForPrompt(object);

        // Strip -fast suffix from model ID before calling OpenRouter
        const selectedModel = aiModel?.replace('-fast', '') || CONFIG.AI.MODEL;
        const isFastMode = aiModel?.includes('-fast');
        let content = "";

        try {
            const completion = await openai.chat.completions.create({
                model: selectedModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Generate strictly for object: ${escapedObject}` }
                ],
            });
            content = completion.choices[0].message.content || "";
        } catch (openaiError: any) {
            log.error(`AI Generation Failed for ${selectedModel}: ${openaiError.message}`, openaiError);
            return NextResponse.json(
                { error: `AI Generation Failed: ${openaiError.message}` },
                { status: 500 }
            );
        }

        let aiContent: any = { prompt: "Error generating", hook: "Error" };
        let reasoning = "";

        try {
            let cleanContent = content;

            // Extract reasoning (between <think> tags)
            const thinkMatch = cleanContent.match(/<think>([\s\S]*?)<\/think>/);
            if (thinkMatch) {
                reasoning = thinkMatch[1].trim();
                cleanContent = cleanContent.replace(/<think>[\s\S]*?<\/think>/g, "");
            }

            // Clean markdown blocks
            cleanContent = cleanContent.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1");
            cleanContent = cleanContent.trim();

            if (!cleanContent || cleanContent.length < 2) {
                throw new Error("AI returned empty content after stripping reasoning.");
            }

            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiContent = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: treat cleanContent as the prompt
                aiContent = {
                    prompt: cleanContent,
                    hook: "Viral Hook Built",
                    photoInstructions: "See platform specific guides.",
                    expectedViews: "10M+",
                    difficulty: "Medium",
                    estimatedTime: "10 mins",
                    postProcessing: "Add audio.",
                    successRate: "High",
                    commonIssues: "None",
                    platformSpecific: {}
                };
            }
        } catch (parseError: any) {
            log.warn(`AI Parse Warning: ${parseError.message}`);
            aiContent = {
                prompt: content.replace(/<think>[\s\S]*?<\/think>/g, "").trim() || "Generation failed.",
                hook: "Viral Content Generated",
                photoInstructions: "Manual prompt entry required.",
                expectedViews: "10M+",
                difficulty: "Medium",
                estimatedTime: "10 mins",
                postProcessing: "Add sound effects.",
                successRate: "High",
                commonIssues: "None",
                platformSpecific: {}
            };
        }

        let { data: existing } = await dbClient
            .from('generated_prompts')
            .select('id')
            .eq('user_id', user.id)
            .eq('prompt_text', aiContent.prompt)
            .maybeSingle();

        let saveError = null;

        if (!existing) {
            const { data: insertedData, error } = await dbClient.from('generated_prompts').insert({
                user_id: user.id,
                prompt_text: aiContent.prompt,
                viral_hook: aiContent.hook,
                category: randomStyle.category,
                platform: randomStyle.platform,
                mechanism: randomStyle.mechanism,
                mode: mode,
                creator_name: user.user_metadata?.full_name || "Anonymous",
                creator_avatar: user.user_metadata?.avatar_url || null
            }).select('id').single();

            if (insertedData) {
                existing = { id: insertedData.id } as any;
            }
            saveError = error;
        }

        if (saveError) {
            log.error(`DB Save Error:`, saveError);
        } else if (existing) {
            // Sync usage stats to DB (Fire and forget)
            incrementUserUsageDB(user.id, dbClient);
        }

        const responseData = {
            id: existing?.id,
            prompt: aiContent.prompt,
            reasoning: isFastMode ? undefined : reasoning, // Extract reasoning for Think mode
            category: randomStyle.category,
            platform: randomStyle.platform,
            viralHook: aiContent.hook,
            mechanism: randomStyle.mechanism,
            personNote: aiContent.personNote || (personDescription ? "Custom character included" : null),
            expectedViews: aiContent.expectedViews || "10M+ views",
            photoInstructions: aiContent.photoInstructions || "Upload photo to Kling/Runway first.",
            difficulty: aiContent.difficulty || "Medium",
            estimatedTime: aiContent.estimatedTime || "10 mins",
            postProcessing: aiContent.postProcessing || "Add sound effects in post.",
            successRate: aiContent.successRate || "High",
            commonIssues: aiContent.commonIssues || "None",
            platformSpecific: aiContent.platformSpecific || {},
        };

        if (!saveError) {
            try {
                await redis.set(cacheKey, JSON.stringify(responseData), { ex: CONFIG.CACHE.TTL_SECONDS });
            } catch (e) {
                // Ignore cache write errors
            }
        }

        return NextResponse.json({
            ...responseData,
            cached: false,
            dbError: saveError ? saveError.message : null
        });

    } catch (error: any) {
        logger.error(`[${requestId}] Unhandled API Error: ${error.message}`, error);

        let errorMessage = "An unexpected error occurred.";
        let statusCode = 500;

        if (error.message?.includes("timeout")) {
            errorMessage = "AI took too long to respond. Please try a simpler prompt.";
            statusCode = 504;
        } else if (error.message?.includes("rate")) {
            errorMessage = "Too many requests. Please wait a moment.";
            statusCode = 429;
        } else if (error.code === "ECONNREFUSED") {
            errorMessage = "AI service is temporarily unavailable. Please try again later.";
            statusCode = 503;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

export const POST = generateHandler;
