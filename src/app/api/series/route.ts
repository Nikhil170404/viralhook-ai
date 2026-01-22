/**
 * SERIES API V2 - Optimized for Veo with streaming
 * Handles: outline generation, clip generation
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { createRequestLogger, logger } from '@/lib/logger';
import { checkBurstLimit } from '@/lib/rate-limit';
import { moderateContent } from '@/lib/security/content-filter';
import {
    getEpisodeOutlineSystemPrompt,
    getClipSystemPrompt,
    parseOutlineResponse,
    parseClipResponse,
    SceneOutline,
    AnimeStyle,
    Mode
} from '@/lib/prompts/series-v2';
import { ParsedStory, ParsedCharacter, findCharacterByName } from '@/lib/prompts/story-parser';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const AI_MODELS = {
    fast: 'xiaomi/mimo-v2-flash:free',
    quality: 'deepseek/deepseek-r1-0528:free',
    balanced: 'tngtech/deepseek-r1t-chimera:free'
};

interface SeriesRequest {
    action: 'outline' | 'clip';
    story: ParsedStory;
    episodeNumber: number;
    totalEpisodes?: number;
    mode: Mode;
    style: AnimeStyle;
    aiModel?: string;
    // For clip generation
    scene?: {
        sceneNumber: number;
        sceneType: string;
        description: string;
        masterVisuals?: string;
        seed?: number;
        charactersInvolved: string[];
        clipCount: number;
    };
    clipNumber?: number;
    previousClipEnd?: string;
}

export async function POST(req: Request) {
    const requestId = crypto.randomUUID().slice(0, 8);
    const log = createRequestLogger(requestId);

    try {
        const cookieStore = await cookies();

        // Auth
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll() { }
                }
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limit
        // const burstLimit = await checkBurstLimit(user.id, 'aiGeneration');
        // if (!burstLimit.success) {
        //     return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
        // }

        // Parse body
        const body: SeriesRequest = await req.json();
        const { action, story, episodeNumber, totalEpisodes, mode, style, aiModel, scene, clipNumber, previousClipEnd } = body;

        // Validate
        if (!story?.title || !story?.characters?.length) {
            return Response.json({ error: 'Invalid story data' }, { status: 400 });
        }

        if (!['outline', 'clip'].includes(action)) {
            return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Content moderation
        const modCheck = moderateContent(story.title + ' ' + story.worldRules);
        if (!modCheck.isAllowed) {
            return Response.json({ error: 'Content policy violation' }, { status: 400 });
        }

        // API setup
        if (!process.env.OPENROUTER_API_KEY) {
            return Response.json({ error: 'API configuration error' }, { status: 500 });
        }

        const openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                'HTTP-Referer': 'https://viralhook.ai',
                'X-Title': 'Viral Hooks AI - Series V2'
            }
        });

        // Build prompt based on action
        let systemPrompt: string;
        let userPrompt: string;

        if (action === 'outline') {
            systemPrompt = getEpisodeOutlineSystemPrompt(story, episodeNumber, totalEpisodes || 12, mode);
            userPrompt = `Generate Episode ${episodeNumber} outline now.`;
        } else {
            // Clip generation
            if (!scene || clipNumber === undefined) {
                return Response.json({ error: 'Scene and clipNumber required for clip action' }, { status: 400 });
            }
            systemPrompt = getClipSystemPrompt(
                story,
                {
                    sceneNumber: scene.sceneNumber,
                    sceneType: scene.sceneType as any,
                    description: scene.description,
                    masterVisuals: scene.masterVisuals || scene.description,
                    charactersInvolved: scene.charactersInvolved,
                    clipCount: scene.clipCount,
                    seed: scene.seed
                },
                clipNumber,
                scene.clipCount,
                mode,
                style,
                previousClipEnd
            );
            userPrompt = `Generate Clip ${clipNumber} prompt now.`;
        }

        // Select model - simplified as we updated frontend default already
        const selectedModel = aiModel?.replace('-fast', '') || AI_MODELS.quality;

        // Stream response
        const stream = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: action === 'outline' ? 2000 : 1500,
            stream: true
        });

        // Create streaming response
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                let fullContent = '';
                let reasoning = '';

                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        fullContent += content;

                        // Stream chunks to client
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ chunk: content })}\n\n`)
                        );
                    }

                    // Extract reasoning if present
                    const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/);
                    if (thinkMatch) {
                        reasoning = thinkMatch[1].trim();
                        fullContent = fullContent.replace(/<think>[\s\S]*?<\/think>/g, '');
                    }

                    // Parse result based on action
                    let result: any;
                    if (action === 'outline') {
                        result = parseOutlineResponse(fullContent);
                        if (!result) {
                            throw new Error('Failed to parse outline');
                        }
                        result.episodeNumber = episodeNumber;
                    } else {
                        result = parseClipResponse(fullContent);
                        if (!result) {
                            throw new Error('Failed to parse clip');
                        }
                        result.sceneNumber = scene!.sceneNumber;
                    }

                    // Send final result
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({
                            done: true,
                            success: true,
                            requestId,
                            action,
                            result,
                            reasoning: aiModel?.includes('-fast') ? undefined : reasoning
                        })}\n\n`)
                    );

                } catch (err: any) {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
                    );
                }

                controller.close();
            }
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });

    } catch (error: any) {
        logger.error(`[${requestId}] Series V2 Error: ${error.message}`, error);
        return Response.json({ error: 'Generation failed' }, { status: 500 });
    }
}
