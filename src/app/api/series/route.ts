import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

import {
    getSeriesPrompt,
    parseSeriesResponse,
    Character,
    SeriesBible,
    EpisodeConfig,
    getEpisodeOutlinePrompt,
    getSingleClipPrompt,
    buildClipPrompt
} from '@/lib/prompts/series';
import { moderateContent } from '@/lib/security/content-filter';
import { createRequestLogger, logger } from '@/lib/logger';
import { checkBurstLimit, incrementUserUsageDB } from '@/lib/rate-limit';
import { advancedPromptFilter } from '@/lib/security/advanced-prompt-filter';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const requestId = crypto.randomUUID().slice(0, 8);
    const log = createRequestLogger(requestId);

    try {
        const cookieStore = await cookies();

        // Auth Check
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
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Rate Limiting
        const burstLimit = await checkBurstLimit(user.id, 'aiGeneration');
        if (!burstLimit.success) {
            return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
                status: 429,
                headers: { ...burstLimit.headers, 'Content-Type': 'application/json' }
            });
        }

        // Parse Request
        const body = await req.json();
        const {
            seriesBible,
            characters,
            episodeConfig,
            targetPlatform = 'veo',
            aiModel,
            mode = 'full', // 'full' | 'outline' | 'clip'
            sceneContext,
            clipNumber,
            previousClipsSummary
        } = body as {
            seriesBible: SeriesBible;
            characters: Character[];
            episodeConfig: EpisodeConfig;
            targetPlatform: string;
            aiModel?: string;
            mode?: 'full' | 'outline' | 'clip';
            sceneContext?: any;
            clipNumber?: number;
            previousClipsSummary?: string;
        };

        // Validate
        if (!seriesBible?.title || !episodeConfig) {
            return new Response(JSON.stringify({ error: "Series bible and episode config are required" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Content Moderation
        const modResult = moderateContent(seriesBible.title + ' ' + seriesBible.worldRules);
        if (!modResult.isAllowed) {
            return new Response(JSON.stringify({ error: "Content policy violation" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate Prompt based on mode
        let systemPrompt = "";
        let userPrompt = "";

        if (mode === 'outline') {
            const p = getEpisodeOutlinePrompt(seriesBible, characters, episodeConfig);
            systemPrompt = p.systemPrompt;
            userPrompt = `Generate outline for Episode ${episodeConfig.episodeNumber} now.`;
        } else if (mode === 'clip') {
            if (!sceneContext || !clipNumber) {
                return new Response(JSON.stringify({ error: "Scene context and clip number required for clip mode" }), { status: 400 });
            }
            const p = getSingleClipPrompt(seriesBible, characters, episodeConfig, sceneContext, clipNumber, previousClipsSummary || "", targetPlatform);
            systemPrompt = p.systemPrompt;
            userPrompt = `Generate prompt for Clip ${clipNumber} now.`;
        } else {
            // Legacy full generation
            const p = getSeriesPrompt(seriesBible, characters, episodeConfig, targetPlatform);
            systemPrompt = p.systemPrompt;
            userPrompt = `Generate Episode ${episodeConfig.episodeNumber} prompt structure now.`;
        }

        // AI Call
        if (!process.env.OPENROUTER_API_KEY) {
            return new Response(JSON.stringify({ error: "API configuration error" }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": "https://viralhook.ai",
                "X-Title": "Viral Hooks AI - Series Generator",
            }
        });

        // Use streaming
        const selectedModel = aiModel?.replace('-fast', '') || 'xiaomi/mimo-v2-flash:free';
        const isFastMode = aiModel?.includes('-fast');

        const stream = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 4000,
            stream: true,
        });

        // Create a ReadableStream for the response
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                let fullContent = "";

                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        fullContent += content;

                        // Send progress
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: content })}\n\n`));
                    }

                    // Process complete response
                    let cleanContent = fullContent;
                    let reasoning = "";

                    const thinkMatch = cleanContent.match(/<think>([\s\S]*?)<\/think>/);
                    if (thinkMatch) {
                        reasoning = thinkMatch[1].trim();
                        cleanContent = cleanContent.replace(/<think>[\s\S]*?<\/think>/g, "");
                    }

                    // Parse
                    const parsedData = parseSeriesResponse(cleanContent);

                    // If clip mode, we might need to construct the full string manually if the AI didn't return it perfectly
                    if (mode === 'clip' && parsedData.data && !parsedData.fullPrompt) {
                        // Reconstruct full prompt using helper if specific format needed, 
                        // but ideally the AI returned it.
                        // For now, trust the AI output or fallback
                        if (!parsedData.fullPrompt) {
                            parsedData.fullPrompt = buildClipPrompt({
                                shotType: parsedData.data.shotType,
                                camera: parsedData.data.camera,
                                character: characters.find(c => parsedData.data.subject.includes(c.name)) || characters[0], // fallback
                                action: parsedData.data.action,
                                context: parsedData.data.context,
                                style: parsedData.data.style,
                                ambiance: parsedData.data.ambiance,
                                audio: parsedData.data.audio
                            }, targetPlatform);
                        }
                    }

                    // Save logic could be here, but for granular generation, we might want to save on the client side 
                    // or save "fragments" to the DB. For now, let's just return the data and let client manage state.
                    // We only save completely finished episodes to the 'generated_prompts' table usually.

                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        done: true,
                        success: true,
                        requestId,
                        result: parsedData,
                        reasoning: isFastMode ? undefined : reasoning,
                        mode
                    })}\n\n`));

                } catch (err: any) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
                }

                controller.close();
            }
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: any) {
        logger.error(`[${requestId}] Series API Error: ${error.message}`, error);
        return new Response(JSON.stringify({
            error: "Failed to generate"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
