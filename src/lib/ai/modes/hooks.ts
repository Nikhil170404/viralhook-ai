/**
 * Hook Generation AI Mode
 * Analyzes video scripts and generates viral opening hooks
 */

import {
    getKlingInstructions,
    getRunwayInstructions,
    getVeoInstructions,
    getLumaInstructions
} from '../helpers';

// ===== HOOK TYPES =====
const HOOK_PATTERNS = [
    { type: "POV", template: "POV: [situation from script]", description: "First-person relatable scenario" },
    { type: "Mystery", template: "Nobody talks about this but...", description: "Creates curiosity gap" },
    { type: "Challenge", template: "I bet you can't watch without...", description: "Engagement trigger" },
    { type: "Story", template: "When I was [age], I discovered...", description: "Personal narrative hook" },
    { type: "Shock", template: "This changes everything about...", description: "Revelation hook" },
    { type: "Relatable", template: "Tell me you're [X] without telling me...", description: "Trend-based hook" },
    { type: "Question", template: "What would you do if...?", description: "Direct engagement" },
    { type: "Controversy", template: "Unpopular opinion:", description: "Debate trigger" },
    { type: "Tutorial", template: "Here's a trick they don't teach you...", description: "Value proposition" },
    { type: "Cliffhanger", template: "Wait for it...", description: "Anticipation builder" }
];

// ===== GENRE DETECTION =====
const GENRES = [
    "Comedy", "Motivation", "Tutorial", "Storytelling", "Lifestyle",
    "Drama", "Educational", "Entertainment", "News", "Review",
    "Fitness", "Cooking", "Travel", "Fashion", "Tech", "Gaming"
];

// ===== FADE OUT STYLES =====
const FADE_OUTS = [
    "Slow zoom out revealing the full scene",
    "Quick cut to black with text overlay",
    "Face freeze with dramatic music drop",
    "Smash cut to the main content",
    "Dolly out with motion blur transition",
    "Split-second flash to hook visual",
    "Audio fade with visual blur",
    "Snap zoom out with beat drop"
];

// ===== MAIN PROMPT GENERATOR =====
export function getHooksPrompt(
    script: string,
    stylePreference: string = "",
    mode: 'chaos' | 'cinematic' | 'shocking' = 'shocking'
): { systemPrompt: string; hookPatterns: typeof HOOK_PATTERNS } {

    const modeStyle = mode === 'chaos'
        ? "wild, unpredictable, high-energy, pattern-interrupt"
        : mode === 'cinematic'
            ? "dramatic, visually stunning, emotional, cinematic build-up"
            : "attention-grabbing, controversial, stop-scroll, shocking revelation";

    const systemPrompt = `You are a viral content strategist who specializes in creating HOOKS for social media shorts and reels.

**YOUR TASK:**
Analyze the provided video script and generate 5 powerful opening hooks that will:
1. Stop users from scrolling
2. Create an irresistible curiosity gap
3. Match the script's tone and genre
4. Lead naturally into the main content

**SCRIPT TO ANALYZE:**
"""
${script}
"""

${stylePreference ? `**USER'S STYLE PREFERENCE:** ${stylePreference}` : ''}

**MODE:** ${mode.toUpperCase()} - Your hooks should feel: ${modeStyle}

**HOOK PATTERNS TO CONSIDER:**
${HOOK_PATTERNS.map(p => `- ${p.type}: "${p.template}" (${p.description})`).join('\n')}

**FADE-OUT OPTIONS:**
${FADE_OUTS.map(f => `- ${f}`).join('\n')}

**ANALYSIS REQUIREMENTS:**
1. First, detect the GENRE of the script (choose from: ${GENRES.join(', ')})
2. Identify the EMOTIONAL CORE (what feeling should viewers have?)
3. Find the KEY REVEAL or CLIMAX that can be teased
4. Generate 5 hooks that would make people NEED to watch

**OUTPUT FORMAT (JSON ONLY):**
{
    "genre": "Detected genre",
    "emotionalCore": "Primary emotion this content evokes",
    "scriptSummary": "One-line summary of what this video is about",
    "hooks": [
        {
            "hook": "The actual hook text/opening line",
            "hookType": "POV/Mystery/Challenge/etc",
            "fadeOut": "Suggested fade-out transition",
            "whyItWorks": "Brief explanation of why this hook is effective",
            "style": "The vibe/energy of this hook"
        }
    ]
}

**STRICT RULES:**
1. Each hook MUST be under 15 words (for fast delivery)
2. Hooks should feel NATIVE to the platform (TikTok/Reels energy)
3. Avoid generic hooks - be SPECIFIC to this script
4. At least one hook should be a "pattern interrupt" (unexpected)
5. Include diverse hook types (don't repeat the same pattern)
6. Make sure hooks MATCH the ${mode} mode energy

Return ONLY valid JSON. No markdown, no explanation.`;

    return { systemPrompt, hookPatterns: HOOK_PATTERNS };
}

// ===== PARSE AI RESPONSE =====
export interface HookResult {
    genre: string;
    emotionalCore: string;
    scriptSummary: string;
    hooks: Array<{
        hook: string;
        hookType: string;
        fadeOut: string;
        whyItWorks: string;
        style: string;
    }>;
}

export function parseHooksResponse(content: string): HookResult {
    try {
        // Clean the response
        let cleanContent = content;
        cleanContent = cleanContent.replace(/<think>[\s\S]*?<\/think>/g, "");
        cleanContent = cleanContent.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1");
        cleanContent = cleanContent.trim();

        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(cleanContent);
    } catch (e) {
        // Fallback response
        return {
            genre: "Entertainment",
            emotionalCore: "Curiosity",
            scriptSummary: "Engaging content",
            hooks: [
                {
                    hook: "Wait till you see what happens next...",
                    hookType: "Cliffhanger",
                    fadeOut: "Quick cut to black",
                    whyItWorks: "Creates anticipation",
                    style: "Mysterious"
                },
                {
                    hook: "Nobody is talking about this...",
                    hookType: "Mystery",
                    fadeOut: "Slow zoom out",
                    whyItWorks: "Creates exclusivity",
                    style: "Intriguing"
                }
            ]
        };
    }
}
