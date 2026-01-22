import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

import { getSeriesPrompt, parseSeriesResponse, Character, SeriesBible, EpisodeConfig } from '@/lib/prompts/series';
import { sanitizeInput } from '@/lib/security/sanitize';
import { moderateContent } from '@/lib/security/content-filter';
import { logger, createRequestLogger } from '@/lib/logger';
import { checkBurstLimit, incrementUserUsageDB } from '@/lib/rate-limit';
import { advancedPromptFilter } from '@/lib/security/advanced-prompt-filter';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const CONFIG = {
    AI: {
        MODEL: 'deepseek/deepseek-r1-0528:free',
    }
} as const;

async function seriesHandler(req: Request) {
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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate Limiting
        const burstLimit = await checkBurstLimit(user.id, 'aiGeneration');
        if (!burstLimit.success) {
            return NextResponse.json(
                { error: "Rate limit exceeded" },
                { status: 429, headers: burstLimit.headers }
            );
        }

        // Credit Check
        const { data: creditsRemaining, error: creditError } = await supabase.rpc(
            'use_credit',
            { p_user_id: user.id }
        );

        if (creditError) {
            console.warn('[Credits] RPC warning:', creditError);
        } else if (creditsRemaining === -1) {
            return NextResponse.json(
                { error: "Daily limit reached (10 prompts/day). Come back tomorrow!", creditsRemaining: 0 },
                { status: 429 }
            );
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
            return NextResponse.json({ error: "Series bible and episode config are required" }, { status: 400 });
        }

        // Content Moderation
        const injectionCheck = advancedPromptFilter.detectInjection(seriesBible.title + ' ' + seriesBible.worldRules);
        if (injectionCheck.blocked) {
            return NextResponse.json({ error: "Security violation detected." }, { status: 400 });
        }

        const modResult = moderateContent(seriesBible.title + ' ' + seriesBible.worldRules);
        if (!modResult.isAllowed) {
            return NextResponse.json({ error: "Content policy violation", category: modResult.category }, { status: 400 });
        }

        // Generate Prompt
        const { systemPrompt } = getSeriesPrompt(seriesBible, characters, episodeConfig, targetPlatform);

        // AI Call
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "API configuration error" }, { status: 500 });
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": "https://viralhook.ai",
                "X-Title": "Viral Hooks AI - Series Generator",
            }
        });

        const selectedModel = aiModel?.replace('-fast', '') || CONFIG.AI.MODEL;
        const isFastMode = aiModel?.includes('-fast');

        const completion = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate Episode ${episodeConfig.episodeNumber} prompt structure now.` }
            ],
        });

        const content = completion.choices[0].message.content || "";
        let reasoning = "";
        let cleanContent = content;

        // Extract reasoning
        const thinkMatch = cleanContent.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
            reasoning = thinkMatch[1].trim();
            cleanContent = cleanContent.replace(/<think>[\s\S]*?<\/think>/g, "");
        }

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
            log.error(`Database save error:`, saveError as any);
        }

        return NextResponse.json({
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
        });

    } catch (error: any) {
        logger.error(`[${requestId}] Series API Error: ${error.message}`, error);
        return NextResponse.json(
            { error: "Failed to generate episode prompts", debug: process.env.NODE_ENV === 'development' ? error.message : undefined },
            { status: 500 }
        );
    }
}

export const POST = seriesHandler;
