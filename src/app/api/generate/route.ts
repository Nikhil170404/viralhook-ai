import { getCinematicPrompt } from '@/lib/ai/modes/cinematic';
import { getShockingPrompt } from '@/lib/ai/modes/shocking';
import { getChaosPrompt } from '@/lib/ai/modes/chaos';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { redis } from '@/lib/redis';

// Define the interface for the request body
interface GenerateRequest {
    object: string;
    mode?: 'chaos' | 'cinematic' | 'shocking';
    targetModel?: string; // Video model (Kling, Luma, etc.)
    aiModel?: string;     // Intelligence engine (DeepSeek, Xiaomi, etc.)
}

// --- CONFIGURATION CONSTANTS ---
const CONFIG = {
    RATE_LIMIT: {
        MAX_REQUESTS: 5,
        WINDOW_MS: 60_000,
    },
    AI: {
        TIMEOUT_SECONDS: 60,
        MODEL: 'tngtech/deepseek-r1t2-chimera:free',
    },
} as const;

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();

        // 1. Initialize Supabase Server Client
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

        // 2. Check Authentication
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
            return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });
        }

        // 3. Redis Rate Limiting (Ultra Fast)
        const rateLimitKey = `rate_limit:${user.id}`;
        let currentCount = 0;
        let ttl = 0;

        try {
            currentCount = await redis.incr(rateLimitKey);
            if (currentCount === 1) {
                await redis.expire(rateLimitKey, 60); // 1 minute window
            }
            ttl = await redis.ttl(rateLimitKey);
        } catch (redisError) {
            console.error("Redis Rate Limit Error:", redisError);
            // Fallback: allow request if Redis is down? 
            // Or use Supabase as backup? For now, we'll allow it but log.
            currentCount = 0;
        }

        if (currentCount > CONFIG.RATE_LIMIT.MAX_REQUESTS) {
            return NextResponse.json(
                { error: `Rate limit exceeded. Please wait ${ttl}s.` },
                { status: 429, headers: { 'Retry-After': String(ttl), 'X-RateLimit-Limit': String(CONFIG.RATE_LIMIT.MAX_REQUESTS), 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(ttl) } }
            );
        }

        // 4. Parse Request
        const { object, mode = 'chaos', targetModel, aiModel }: GenerateRequest = await req.json();

        if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "Server Configuration Error: API Key Missing" }, { status: 500 });
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": "https://viralhook.ai",
                "X-Title": "Viral Hooks AI",
            }
        });

        // 5. Select Mode Logic (Separation of Concerns)
        let systemPrompt = "";
        let randomStyle: any = {};

        switch (mode) {
            case 'cinematic':
                ({ systemPrompt, randomStyle } = getCinematicPrompt(object, targetModel));
                break;
            case 'shocking':
                ({ systemPrompt, randomStyle } = getShockingPrompt(object, targetModel));
                break;
            case 'chaos':
            default:
                ({ systemPrompt, randomStyle } = getChaosPrompt(object, targetModel));
                break;
        }

        // 6. Call AI
        const selectedModel = aiModel || CONFIG.AI.MODEL;
        let content = "";
        try {
            const completion = await openai.chat.completions.create({
                model: selectedModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Generate strictly for object: ${object}` }
                ],
            });
            content = completion.choices[0].message.content || "";
        } catch (openaiError: any) {
            return NextResponse.json({ error: `AI Generation Failed: ${openaiError.message}` }, { status: 500 });
        }

        let aiContent: any = { prompt: "Error generating", hook: "Error" };
        try {
            // Robust JSON Extraction for AI models (handles thinking tags, markdown code blocks)
            let cleanContent = content;

            // 1. Strip <think>...</think> tags (DeepSeek R1)
            cleanContent = cleanContent.replace(/<think>[\s\S]*?<\/think>/g, "");

            // 2. Strip markdown code blocks (```json ... ``` or ``` ... ```)
            cleanContent = cleanContent.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1");

            // 3. Trim whitespace
            cleanContent = cleanContent.trim();

            // 4. Extract JSON object using regex (finds first { ... })
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                aiContent = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback: try parsing the whole cleaned string
                aiContent = JSON.parse(cleanContent);
            }
        } catch (parseError: any) {
            console.error("AI Parse Error:", parseError.message);
            console.error("Raw AI Content:", content.substring(0, 500));
            // Provide helpful fallback
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

        // 5. DUPLICATE CHECK
        // If we generated the exact same prompt for this user, don't save it again.
        const { data: existing } = await dbClient
            .from('generated_prompts')
            .select('id')
            .eq('user_id', user.id)
            .eq('prompt_text', aiContent.prompt)
            .maybeSingle();

        let saveError = null;

        if (!existing) {
            // 6. SERVER-SIDE SAVE (using dbClient)
            const { error } = await dbClient.from('generated_prompts').insert({
                user_id: user.id,
                prompt_text: aiContent.prompt,
                viral_hook: aiContent.hook,
                category: randomStyle.category,
                platform: randomStyle.platform,
                mechanism: randomStyle.mechanism,
                mode: mode
            });
            saveError = error;
        }

        if (saveError) {
            console.error("DB Save Error:", saveError);
        }

        // 7. Save to database (optional, non-blocking)


        // 8. Return result
        return NextResponse.json({
            prompt: aiContent.prompt,
            category: randomStyle.category, // Assuming data.category is not available here, using randomStyle
            platform: randomStyle.platform, // Assuming data.platform is not available here, using randomStyle
            viralHook: aiContent.hook,
            mechanism: randomStyle.mechanism, // Assuming data.mechanism is not available here, using randomStyle

            // ✅ NEW FIELDS FOR VIRAL SHOCK FORMAT
            expectedViews: aiContent.expectedViews || "10M+ views",
            photoInstructions: aiContent.photoInstructions || "Upload photo to Kling/Runway first.",
            difficulty: aiContent.difficulty || "Medium",
            estimatedTime: aiContent.estimatedTime || "10 mins",
            postProcessing: aiContent.postProcessing || "Add sound effects in post.",
            successRate: aiContent.successRate || "High",
            commonIssues: aiContent.commonIssues || "None",
            platformSpecific: aiContent.platformSpecific || {},

            dbError: saveError ? saveError.message : null
        });

    } catch (error: any) {
        console.error("Unhandled API Error:", error);

        // Provide specific error messages based on error type
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
            { error: errorMessage, debug: process.env.NODE_ENV === 'development' ? error.message : undefined },
            { status: statusCode }
        );
    }
}
