import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

import { getSeriesPrompt, parseSeriesResponse, Character, SeriesBible, EpisodeConfig } from '@/lib/prompts/series';
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

        // Credit Check
        const { data: creditsRemaining, error: creditError } = await supabase.rpc(
            'use_credit',
            { p_user_id: user.id }
        );

        if (creditError) {
            console.warn('[Credits] RPC warning:', creditError);
        } else if (creditsRemaining === -1) {
            return new Response(JSON.stringify({
                error: "Daily limit reached (10 prompts/day). Come back tomorrow!",
                creditsRemaining: 0
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse Request
        const body = await req.json();
        const {
            seriesBible,
            characters,
            episodeConfig,
            targetPlatform = 'veo',
            aiModel
        } = body as {
            seriesBible: SeriesBible;
            characters: Character[];
            episodeConfig: EpisodeConfig;
            targetPlatform: string;
            aiModel?: string;
        };

        // Validate
        if (!seriesBible?.title || !episodeConfig) {
            return new Response(JSON.stringify({ error: "Series bible and episode config are required" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Content Moderation
        const injectionCheck = advancedPromptFilter.detectInjection(seriesBible.title + ' ' + seriesBible.worldRules);
        if (injectionCheck.blocked) {
            return new Response(JSON.stringify({ error: "Security violation detected." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const modResult = moderateContent(seriesBible.title + ' ' + seriesBible.worldRules);
        if (!modResult.isAllowed) {
            return new Response(JSON.stringify({ error: "Content policy violation" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate Prompt
        const { systemPrompt } = getSeriesPrompt(seriesBible, characters, episodeConfig, targetPlatform);

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

        const selectedModel = aiModel?.replace('-fast', '') || 'xiaomi/mimo-v2-flash:free';
        const isFastMode = aiModel?.includes('-fast');

        // Use streaming to avoid timeout
        const stream = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate Episode ${episodeConfig.episodeNumber} prompt structure now.` }
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

                        // Send progress to client
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: content })}\n\n`));
                    }

                    // Process the complete response
                    let cleanContent = fullContent;
                    let reasoning = "";

                    // Extract reasoning
                    const thinkMatch = cleanContent.match(/<think>([\s\S]*?)<\/think>/);
                    if (thinkMatch) {
                        reasoning = thinkMatch[1].trim();
                        cleanContent = cleanContent.replace(/<think>[\s\S]*?<\/think>/g, "");
                    }

                    // Clean markdown
                    cleanContent = cleanContent.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();

                    // Parse Response
                    const episodeData = parseSeriesResponse(cleanContent);

                    // Save to DB
                    let savedId = null;
                    try {
                        const { data: insertedData, error: insertError } = await supabase
                            .from('generated_prompts')
                            .insert({
                                user_id: user.id,
                                prompt_text: JSON.stringify(episodeData.scenes || []),
                                viral_hook: episodeData.episodeTitle,
                                category: seriesBible.genre,
                                platform: targetPlatform,
                                mechanism: 'series',
                                prompt_type: 'series_episode',
                                target_model: targetPlatform,
                                mode: 'series',
                                creator_name: user.user_metadata?.full_name || "Anonymous",
                            })
                            .select('id')
                            .single();

                        if (!insertError && insertedData) {
                            savedId = insertedData.id;
                            incrementUserUsageDB(user.id, supabase);
                        }
                    } catch (saveError) {
                        log.error(`Database save error`);
                    }

                    // Send final result
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        done: true,
                        success: true,
                        requestId,
                        id: savedId,
                        reasoning: isFastMode ? undefined : reasoning,
                        episodeTitle: episodeData.episodeTitle,
                        episodeSummary: episodeData.episodeSummary,
                        scenes: episodeData.scenes,
                        characterStateChanges: episodeData.characterStateChanges,
                        plotThreadUpdates: episodeData.plotThreadUpdates,
                        cliffhanger: episodeData.cliffhanger,
                        targetPlatform,
                        aiModel: selectedModel
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
            error: "Failed to generate episode prompts"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
