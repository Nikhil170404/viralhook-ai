import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

import { createRequestLogger } from '@/lib/logger';
import { checkBurstLimit } from '@/lib/rate-limit';
import { moderateContent } from '@/lib/security/content-filter';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an expert anime series creator. Generate a complete series setup based on user preferences.

OUTPUT FORMAT (JSON only, no markdown):
{
  "seriesBible": {
    "title": "Unique, catchy anime title",
    "genre": "Genre",
    "themes": ["theme1", "theme2", "theme3"],
    "worldRules": "2-3 sentences describing the world's unique rules/magic system",
    "toneGuide": "Describe the overall tone and feel",
    "totalEpisodes": 24,
    "arcOverview": "Brief overview of the 24-episode arc structure"
  },
  "characters": [
    {
      "role": "hero",
      "name": "Unique Japanese-style name",
      "age": 17,
      "gender": "male/female",
      "visualSpec": {
        "height": "Height and build description",
        "hair": "Detailed hair description with color and style",
        "eyes": "Eye color and expression",
        "face": "Facial features",
        "outfit": "Detailed outfit description",
        "accessories": "Any accessories"
      },
      "personality": "2-3 sentences about personality",
      "powers": "Special abilities or skills",
      "backstory": "Brief backstory"
    }
  ]
}

RULES:
1. Create unique, creative names - not generic ones
2. Make character designs visually distinct and memorable
3. Ensure villain is properly threatening and has clear motivation
4. Friends should have complementary but different abilities
5. World rules should enable interesting conflicts
6. Keep descriptions concise but specific enough for visual prompts`;

interface ConceptInput {
    genre: string;
    heroGender: string;
    heroAge: string;
    teamSize: string;
    villainType: string;
    style: string;
    customConcept?: string;
    aiModel?: string;
}

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
        const body: ConceptInput = await req.json();
        const { genre, heroGender, heroAge, teamSize, villainType, style, customConcept, aiModel } = body;
        const selectedModel = aiModel || 'xiaomi/mimo-v2-flash:free';

        // Content Moderation
        if (customConcept) {
            const modResult = moderateContent(customConcept);
            if (!modResult.isAllowed) {
                return new Response(JSON.stringify({ error: "Content policy violation" }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Build prompt
        const userPrompt = `Create an anime series with these specifications:
- Genre: ${genre}
- Hero: ${heroGender}, ${heroAge}
- Team: ${teamSize === 'solo' ? 'Hero works alone' : `Hero + ${teamSize} friends/allies`}
- Villain: ${villainType}
- Tone/Style: ${style}
${customConcept ? `- Additional concept: ${customConcept}` : ''}

Generate the complete series setup with:
1. Series Bible (title, world rules, themes)
2. Hero character with full visual specs
${teamSize !== 'solo' ? `3. ${teamSize} friend characters with full visual specs` : ''}
4. Main villain with full visual specs and motivation
5. 24-episode arc overview`;

        // AI Call with Streaming
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
                "X-Title": "Viral Hooks AI - Series Concept Generator",
            }
        });

        // Use streaming to avoid timeout - using selected model
        const stream = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
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

                    // Parse JSON
                    let result = { error: "Failed to parse" };
                    try {
                        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            result = JSON.parse(jsonMatch[0]);
                        }
                    } catch (e) {
                        log.error(`Failed to parse: ${cleanContent.substring(0, 100)}`);
                    }

                    // Send final result
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                        done: true,
                        success: true,
                        reasoning,
                        ...result
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
        log.error(`Concept Generation Error: ${error.message}`);
        return new Response(JSON.stringify({
            error: "Failed to generate series concept"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
