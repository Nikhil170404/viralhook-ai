/**
 * Hook Generation AI Mode - Video Prompt Style
 * Generates VISUAL video hook prompts (like cinematic mode) that fade-out into main content
 */

import {
    getKlingInstructions,
    getRunwayInstructions,
    getVeoInstructions,
    getLumaInstructions,
    getPhysicsKeywords,
    getNegativePrompt
} from '../helpers';

// ===== HOOK STYLES FOR VISUAL PROMPTS =====
const VISUAL_HOOK_STYLES = [
    { name: "Mystery Reveal", description: "Start with obscured/partial view, slowly reveal the unexpected" },
    { name: "Shock Freeze", description: "Dramatic freeze frame at peak moment, then fade to context" },
    { name: "POV Discovery", description: "First-person perspective discovering something unusual" },
    { name: "Impossible Scene", description: "Physically impossible or surreal opening that demands explanation" },
    { name: "Tension Build", description: "Slow zoom/push-in on subject with building suspense" },
    { name: "Before/After Tease", description: "Show the dramatic 'after' state first, fade to setup" },
    { name: "Chaos Freeze", description: "Freeze mid-action in chaotic moment, objects suspended" },
    { name: "Time Stop", description: "Everything frozen except one element, creating intrigue" }
];

// ===== FADE-OUT TRANSITIONS =====
const FADE_OUT_STYLES = [
    "Slow dissolve to white/black as scene transitions",
    "Zoom out with motion blur into next scene",
    "Freeze frame with subtle vignette fade",
    "Objects slowly defocus as camera pulls back",
    "Light bloom effect consuming the frame",
    "Quick whip pan transitioning to main content",
    "Particles/dust settling as scene changes",
    "Depth of field shift blurring the hook scene"
];

// ===== MAIN PROMPT GENERATOR =====
export function getHooksPrompt(
    script: string,
    stylePreference: string = "",
    mode: 'chaos' | 'cinematic' | 'shocking' = 'shocking',
    targetModel: string = 'kling'
): { systemPrompt: string } {

    // Get platform-specific instructions
    let platformInstructions = '';
    switch (targetModel?.toLowerCase()) {
        case 'runway':
            platformInstructions = getRunwayInstructions();
            break;
        case 'veo':
            platformInstructions = getVeoInstructions();
            break;
        case 'luma':
            platformInstructions = getLumaInstructions();
            break;
        default:
            platformInstructions = getKlingInstructions();
    }

    const physicsKeywords = getPhysicsKeywords();
    const negativePrompts = getNegativePrompt(targetModel);

    const modeStyle = mode === 'chaos'
        ? "wild, chaotic, physics-defying, pattern-interrupt with suspended objects and impossible scenarios"
        : mode === 'cinematic'
            ? "dramatic, visually stunning, Hollywood-quality cinematography with emotional depth"
            : "attention-grabbing, controversial, stop-scroll, shocking revelation that demands answers";

    const systemPrompt = `You are an elite AI video prompt engineer specializing in creating VIRAL OPENING HOOKS for social media shorts and reels.

**YOUR TASK:**
Create a VISUAL VIDEO PROMPT that describes the OPENING HOOK SCENE for the user's content. This hook scene will FADE OUT into their main content, so it needs to:
1. STOP the scroll immediately
2. Create visual intrigue that demands the viewer watches more
3. Set up the content without revealing everything
4. Transition smoothly with a fade-out effect

**THE USER'S MAIN CONTENT/SCRIPT:**
"""
${script}
"""

${stylePreference ? `**USER'S STYLE PREFERENCE:** ${stylePreference}` : ''}

**MODE:** ${mode.toUpperCase()} - Your visual style should be: ${modeStyle}

**VISUAL HOOK STYLES TO CONSIDER:**
${VISUAL_HOOK_STYLES.map(s => `- ${s.name}: ${s.description}`).join('\n')}

**FADE-OUT TRANSITIONS:**
${FADE_OUT_STYLES.join('\n- ')}

**PLATFORM:** ${targetModel.toUpperCase()}
${platformInstructions}

**PHYSICS KEYWORDS FOR REALISM:**
${physicsKeywords}

**AVOID THESE IN YOUR PROMPT:**
${negativePrompts}

**GENERATE A VIDEO PROMPT WITH THIS EXACT JSON FORMAT:**
{
    "hook": "Short catchy text hook (under 10 words) that could appear on screen",
    "prompt": "EXTREMELY DETAILED video prompt describing the opening hook scene. Include: [Scene setup] [Subject/Object description] [Camera movement - slow dolly/push-in/crane] [Lighting - dramatic/golden hour/low-key] [Action/Movement in the scene] [Atmosphere/Mood] [The 'hook moment' that creates intrigue]. For ${targetModel} AI video generation. This scene will FADE OUT to the main content.",
    "fadeOut": "Detailed fade-out transition description. How does this hook scene dissolve/transition into the main content?",
    "viralHook": "Why this visual hook will stop scrolling (the psychological trigger)",
    "cameraWork": "Specific camera movement: start position → end position",
    "lighting": "Lighting setup description",
    "hookMoment": "The exact frame/moment that creates maximum intrigue",
    "genre": "Detected genre of the content",
    "difficulty": "Easy/Medium/Hard for video AI to generate",
    "platformSpecific": {
        "kling": "Kling-specific generation settings",
        "runway": "Runway-specific generation settings",
        "veo": "Veo-specific generation settings"
    }
}

**CRITICAL RULES:**
1. The "prompt" must be a COMPLETE video scene description (100-200 words)
2. Focus on VISUALS, not dialogue or text
3. Include specific camera movements (dolly, crane, push-in, whip pan)
4. The hook should CREATE A QUESTION in the viewer's mind
5. End with a clear FADE-OUT that transitions to main content
6. Make it physically possible for AI to generate (no impossible camera moves for the platform)
7. Match the ${mode} mode energy throughout

Return ONLY valid JSON. No markdown, no explanation.`;

    return { systemPrompt };
}

// ===== PARSE AI RESPONSE =====
export interface HookResult {
    hook: string;
    prompt: string;
    fadeOut: string;
    viralHook: string;
    cameraWork: string;
    lighting: string;
    hookMoment: string;
    genre: string;
    difficulty: string;
    platformSpecific: {
        kling?: string;
        runway?: string;
        veo?: string;
    };
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
            hook: "Wait for it...",
            prompt: "A dramatic scene unfolds with cinematic lighting. Camera slowly pushes in on the subject. Tension builds as details become clearer. The scene freezes at the peak moment of intrigue before fading out.",
            fadeOut: "Slow dissolve to white as the main content begins",
            viralHook: "Creates anticipation and curiosity",
            cameraWork: "Slow push-in from wide to close-up",
            lighting: "Dramatic side lighting with soft shadows",
            hookMoment: "The freeze frame at peak tension",
            genre: "Entertainment",
            difficulty: "Medium",
            platformSpecific: {
                kling: "Use dramatic mode, 5s duration",
                runway: "Gen-3 with motion brush on subject",
                veo: "Standard settings, high motion"
            }
        };
    }
}
