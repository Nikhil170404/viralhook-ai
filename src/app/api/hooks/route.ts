import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';
import { getHooksPrompt, parseHooksResponse } from '@/lib/ai/modes/hooks';
import { sanitizeInput, SANITIZE_CONFIG } from '@/lib/security/sanitize';
import { moderateContent } from '@/lib/security/content-filter';

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

// Memory fallback for rate limiting
const memoryRateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkMemoryRateLimit(userId: string, maxRequests: number): { allowed: boolean } {
    const now = Date.now();
    const record = memoryRateLimiter.get(userId);

    if (!record || record.resetAt < now) {
        memoryRateLimiter.set(userId, { count: 1, resetAt: now + 60000 });
        return { allowed: true };
    }

    if (record.count >= maxRequests) {
        return { allowed: false };
    }

    record.count++;
    return { allowed: true };
}

export async function POST(req: Request) {
    const requestId = crypto.randomUUID().slice(0, 8);

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

        // 2. Rate Limiting
        const rateLimitKey = `hooks_limit:${user.id}`;
        try {
            const count = await redis.incr(rateLimitKey);
            if (count === 1) {
                await redis.expire(rateLimitKey, CONFIG.RATE_LIMIT.WINDOW_SECONDS);
            }
            if (count > CONFIG.RATE_LIMIT.MAX_REQUESTS) {
                return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
            }
        } catch {
            const memCheck = checkMemoryRateLimit(user.id, CONFIG.RATE_LIMIT.MAX_REQUESTS);
            if (!memCheck.allowed) {
                return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
            }
        }

        // 3. Parse Request
        const body = await req.json();
        const { script, stylePreference = '', mode = 'shocking', aiModel } = body;

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
        const modResult = moderateContent(script);
        if (!modResult.isAllowed) {
            return NextResponse.json({
                error: "Content policy violation",
                category: modResult.category
            }, { status: 400 });
        }

        // 6. Sanitize Input
        const sanitizedScript = sanitizeInput(script, CONFIG.SCRIPT.MAX_LENGTH);
        if (!sanitizedScript.isValid) {
            return NextResponse.json({ error: "Invalid script content" }, { status: 400 });
        }

        // 7. Generate Prompt
        const { systemPrompt } = getHooksPrompt(
            sanitizedScript.sanitized,
            stylePreference,
            mode as 'chaos' | 'cinematic' | 'shocking'
        );

        // 8. Call AI
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "API configuration error" }, { status: 500 });
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": "https://viralhook.ai",
                "X-Title": "Viral Hooks AI - Script Hooks",
            }
        });

        const selectedModel = aiModel || CONFIG.AI.MODEL;

        const completion = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Generate hooks for this script." }
            ],
        });

        const content = completion.choices[0].message.content || "";

        // 9. Parse Response
        const hooksResult = parseHooksResponse(content);

        // 10. Return
        return NextResponse.json({
            success: true,
            requestId,
            genre: hooksResult.genre,
            emotionalCore: hooksResult.emotionalCore,
            scriptSummary: hooksResult.scriptSummary,
            hooks: hooksResult.hooks,
            mode,
            aiModel: selectedModel
        });

    } catch (error: any) {
        console.error(`[${requestId}] Hooks API Error:`, error);
        return NextResponse.json(
            { error: "Failed to generate hooks", debug: process.env.NODE_ENV === 'development' ? error.message : undefined },
            { status: 500 }
        );
    }
}
