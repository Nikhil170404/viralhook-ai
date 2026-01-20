import { withCSRF } from '@/middleware/withCSRF';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

import { getHooksPrompt, parseHooksResponse } from '@/lib/prompts/modes';
import { sanitizeInput } from '@/lib/security/sanitize';
import { moderateContent } from '@/lib/security/content-filter';
import { logger, createRequestLogger } from '@/lib/logger';
import { checkUserRateLimit, incrementUserUsageDB, checkBurstLimit } from '@/lib/rate-limit';
import { advancedPromptFilter } from '@/lib/security/advanced-prompt-filter';

// --- CONFIGURATION ---
const CONFIG = {
    RATE_LIMIT: {
        MAX_REQUESTS: 10,
        WINDOW_SECONDS: 60,
    },
    AI: {
        MODEL: 'tngtech/deepseek-r1t2-chimera:free',
    },
    SCRIPT: {
        MIN_LENGTH: 20,
        MAX_LENGTH: 2000,
    }
} as const;

export const maxDuration = 60;
export const dynamic = 'force-dynamic';



async function hooksHandler(req: Request) {
    const requestId = crypto.randomUUID().slice(0, 8);
    const log = createRequestLogger(requestId);

    try {
        const cookieStore = await cookies();

        // 1. Auth Check
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { }
                }
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (user) log.child({ userId: user.id });

        // 2. Rate Limiting (Burst Protection via Upstash)
        const burstLimit = await checkBurstLimit(user.id, 'aiGeneration');
        if (!burstLimit.success) {
            return NextResponse.json(
                { error: "Rate limit exceeded" },
                { status: 429, headers: burstLimit.headers }
            );
        }

        // Daily Quota Check
        const quota = await checkUserRateLimit(user.id, 'free');
        if (!quota.allowed) {
            return NextResponse.json(
                { error: "Daily quota exceeded. Upgrade to Pro for unlimited prompts." },
                { status: 429 }
            );
        }

        // 3. Parse Request
        const body = await req.json();
        const { script, stylePreference = '', mode = 'shocking', aiModel, targetModel = 'kling' } = body;

        // 4. Validate Script
        if (!script || typeof script !== 'string') {
            return NextResponse.json({ error: "Script is required" }, { status: 400 });
        }

        if (script.length < CONFIG.SCRIPT.MIN_LENGTH) {
            return NextResponse.json({ error: "Script is too short (min 20 chars)" }, { status: 400 });
        }

        if (script.length > CONFIG.SCRIPT.MAX_LENGTH) {
            return NextResponse.json({ error: "Script is too long (max 2000 chars)" }, { status: 400 });
        }

        // 5. Content Moderation
        // 5. Security: Prompt Injection Check
        const injectionCheck = advancedPromptFilter.detectInjection(script);
        if (injectionCheck.blocked) {
            log.warn(`Prompt Injection Blocked (Score: ${injectionCheck.score}): ${injectionCheck.reason}`, { input: script });
            return NextResponse.json({
                error: "Security Violation: Unsafe content detected.",
                category: injectionCheck.reason,
                score: process.env.NODE_ENV === 'development' ? injectionCheck.score : undefined
            }, { status: 400 });
        }

        // 6. Content Moderation
        const modResult = moderateContent(script);
        if (!modResult.isAllowed) {
            log.warn(`Content moderation blocked: ${modResult.category}`, { category: modResult.category });
            return NextResponse.json({
                error: "Content policy violation",
                category: modResult.category
            }, { status: 400 });
        }

        // 6. Sanitize Input
        const sanitizedScript = sanitizeInput(script, CONFIG.SCRIPT.MAX_LENGTH);
        if (!sanitizedScript.isValid) {
            log.warn(`Sanitization blocked script`, { errors: sanitizedScript });
            return NextResponse.json({ error: "Invalid script content" }, { status: 400 });
        }

        // 7. Generate Prompt with targetModel for platform-specific instructions
        const { systemPrompt } = getHooksPrompt(
            sanitizedScript.sanitized,
            stylePreference,
            mode as 'chaos' | 'cinematic' | 'shocking',
            targetModel
        );

        // 8. Call AI
        if (!process.env.OPENROUTER_API_KEY) {
            log.error("API Key Missing");
            return NextResponse.json({ error: "API configuration error" }, { status: 500 });
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": "https://viralhook.ai",
                "X-Title": "Viral Hooks AI - Video Hook Prompts",
            }
        });

        const selectedModel = aiModel || CONFIG.AI.MODEL;

        const completion = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Generate a visual video hook prompt for this script." }
            ],
        });

        const content = completion.choices[0].message.content || "";

        // 9. Parse Response (now returns single video prompt, not array of text hooks)
        const hookResult = parseHooksResponse(content);

        // 10. Save to Database (like main generator)
        let savedId = null;
        try {
            const { data: insertedData, error: insertError } = await supabase
                .from('generated_prompts')
                .insert({
                    user_id: user.id,
                    prompt_text: hookResult.prompt,
                    viral_hook: hookResult.viralHook,
                    category: hookResult.genre,
                    platform: targetModel,
                    mechanism: mode,
                    prompt_type: 'hook',
                    hook_text: hookResult.hook,
                    fade_out: hookResult.fadeOut,
                    camera_work: hookResult.cameraWork,
                    lighting: hookResult.lighting,
                    hook_moment: hookResult.hookMoment,
                    target_model: targetModel,
                    mode: mode,
                    creator_name: user.user_metadata?.full_name || "Anonymous",
                    creator_avatar: user.user_metadata?.avatar_url || null
                })
                .select('id')
                .single();

            if (!insertError && insertedData) {
                savedId = insertedData.id;
                // Add DB Usage Sync
                incrementUserUsageDB(user.id, supabase);
            } else {
                log.error(`Failed to save hook:`, insertError as any);
            }
        } catch (saveError) {
            log.error(`Database save error:`, saveError as any);
            // Continue even if save fails
        }

        // 11. Return the video prompt format
        return NextResponse.json({
            success: true,
            requestId,
            id: savedId,
            hook: hookResult.hook,
            prompt: hookResult.prompt,
            fadeOut: hookResult.fadeOut,
            viralHook: hookResult.viralHook,
            cameraWork: hookResult.cameraWork,
            lighting: hookResult.lighting,
            hookMoment: hookResult.hookMoment,
            genre: hookResult.genre,
            difficulty: hookResult.difficulty,
            platformSpecific: hookResult.platformSpecific,
            mode,
            targetModel,
            aiModel: selectedModel
        });

    } catch (error: any) {
        logger.error(`[${requestId}] Hooks API Error: ${error.message}`, error);
        return NextResponse.json(
            { error: "Failed to generate hook prompt", debug: process.env.NODE_ENV === 'development' ? error.message : undefined },
            { status: 500 }
        );
    }
}

export const POST = withCSRF(hooksHandler as any);
