import { getCinematicPrompt } from '@/lib/ai/modes/cinematic';
import { getShockingPrompt } from '@/lib/ai/modes/shocking';
import { getChaosPrompt } from '@/lib/ai/modes/chaos';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';
import { logger, createRequestLogger } from '@/lib/logger';

import { validateAndSanitizeInputs, escapeForPrompt } from '@/lib/security/sanitize';
import { moderateAllInputs } from '@/lib/security/content-filter';
import { validateGenerateRequest } from '@/lib/schemas/generate';

const CONFIG = {
    RATE_LIMIT: {
        MAX_REQUESTS: 5,
        WINDOW_MS: 60_000,
        FALLBACK_MAX: 3,
    },
    AI: {
        TIMEOUT_SECONDS: 60,
        MODEL: 'tngtech/deepseek-r1t2-chimera:free',
    },
    CACHE: {
        TTL_SECONDS: 3600,
    }
} as const;

const memoryRateLimiter = new Map<string, { count: number; resetAt: number }>();

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

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

function checkMemoryRateLimit(userId: string, maxRequests: number): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = memoryRateLimiter.get(userId);

    if (!record || record.resetAt < now) {
        memoryRateLimiter.set(userId, { count: 1, resetAt: now + 60000 });
        return { allowed: true, remaining: maxRequests - 1 };
    }

    if (record.count >= maxRequests) {
        return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: maxRequests - record.count };
}

function createCacheKey(object: string, mode: string, targetModel: string): string {
    const normalized = `${object.toLowerCase().trim()}:${mode}:${targetModel || 'auto'}`;
    return `prompt_cache:${Buffer.from(normalized).toString('base64').slice(0, 50)}`;
}

export async function POST(req: Request) {
    const requestId = crypto.randomUUID().slice(0, 8);
    const clientIP = getClientIP(req);
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

        // We can't easily re-assign context to 'log', but we can just use log as is, 
        // OR rely on logger middleware (future). 
        // For now, simple logging is better than no logging.

        const rateLimitKey = `rate_limit:${user.id}`;
        let currentCount = 0;
        let ttl = 60;
        let redisAvailable = true;

        try {
            currentCount = await redis.incr(rateLimitKey);
            if (currentCount === 1) {
                await redis.expire(rateLimitKey, 60);
            }
            ttl = await redis.ttl(rateLimitKey);
        } catch (redisError) {
            log.error(`Redis Rate Limit Error:`, redisError as Error);
            redisAvailable = false;

            const memoryCheck = checkMemoryRateLimit(user.id, CONFIG.RATE_LIMIT.FALLBACK_MAX);
            if (!memoryCheck.allowed) {
                return NextResponse.json(
                    { error: "Rate limit exceeded (degraded mode). Please wait." },
                    { status: 429 }
                );
            }
            currentCount = CONFIG.RATE_LIMIT.FALLBACK_MAX - memoryCheck.remaining;
        }

        const maxRequests = redisAvailable ? CONFIG.RATE_LIMIT.MAX_REQUESTS : CONFIG.RATE_LIMIT.FALLBACK_MAX;
        if (currentCount > maxRequests) {
            return NextResponse.json(
                { error: `Rate limit exceeded. Please wait ${ttl}s.` },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(ttl),
                        'X-RateLimit-Limit': String(maxRequests),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(ttl)
                    }
                }
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

        const cacheKey = createCacheKey(object, mode!, targetModel || 'auto');
        let cachedResponse = null;

        if (redisAvailable) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached && typeof cached === 'string') {
                    cachedResponse = JSON.parse(cached);
                    log.info(`Cache hit for ${cacheKey}`);
                }
            } catch (e) {
            }
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
            case 'chaos':
            default:
                ({ systemPrompt, randomStyle } = getChaosPrompt(object, targetModel, personDescription));
                break;
        }

        const escapedObject = escapeForPrompt(object);
        const selectedModel = aiModel || CONFIG.AI.MODEL;
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
            log.error(`AI Generation Failed: ${openaiError.message}`, openaiError);
            return NextResponse.json(
                { error: `AI Generation Failed: ${openaiError.message}` },
                { status: 500 }
            );
        }

        let aiContent: any = { prompt: "Error generating", hook: "Error" };
        try {
            let cleanContent = content;
            cleanContent = cleanContent.replace(/<think>[\s\S]*?<\/think>/g, "");
            cleanContent = cleanContent.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1");
            cleanContent = cleanContent.trim();

            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiContent = JSON.parse(jsonMatch[0]);
            } else {
                aiContent = JSON.parse(cleanContent);
            }
        } catch (parseError: any) {
            log.error(`AI Parse Error: ${parseError.message}`, parseError);
            aiContent = {
                prompt: content,
                hook: "Viral Content Generated",
                photoInstructions: "See platform specific guides below.",
                expectedViews: "10M+",
                difficulty: "Medium",
                estimatedTime: "10 mins",
                postProcessing: "Add sound effects.",
                successRate: "High",
                commonIssues: "None",
                platformSpecific: { kling: "Standard settings", runway: "Standard settings", veo: "Standard settings" }
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
        }

        const responseData = {
            id: existing?.id,
            prompt: aiContent.prompt,
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

        if (redisAvailable && !saveError) {
            try {
                await redis.setex(cacheKey, CONFIG.CACHE.TTL_SECONDS, JSON.stringify(responseData));
            } catch (e) {
            }
        }

        return NextResponse.json({
            ...responseData,
            cached: false,
            dbError: saveError ? saveError.message : null
        });

    } catch (error: any) {
        // Use global logger for safety in catch block
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
