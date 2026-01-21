/**
 * PROMPT MODES AGGREGATOR (2026)
 * Main entry point for generating AI video prompts.
 */

import {
    getKlingInstructions,
    getRunwayInstructions,
    getVeoInstructions,
    getLumaInstructions,
    getNegativePrompt,
    PlatformType
} from './platforms';

import {
    enhancePersonDescription,
    getCameraMovements,
    getLightingSetups,
    getPhysicsKeywords,
    apply90sVintage,
    applyVHSEffect
} from './library';

import {
    cinematicScenarios,
    viralShockScenarios,
    chaosScenarios,
    animeScenarios,
    cartoonScenarios,
    stickmanScenarios,
    VISUAL_HOOK_STYLES,
    FADE_OUT_STYLES
} from './scenarios';

// ===== HELPER: Select Platform Instructions =====
function getPlatformInstructions(targetModel?: string): string {
    const tm = targetModel?.toLowerCase() || '';
    if (tm.includes('kling')) return getKlingInstructions();
    if (tm.includes('runway')) return getRunwayInstructions();
    if (tm.includes('veo')) return getVeoInstructions();
    if (tm.includes('luma')) return getLumaInstructions();

    // Default fallback combo
    return getKlingInstructions() + "\n" + getRunwayInstructions();
}

// ===== 1. CINEMATIC MODE =====
export function getCinematicPrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformInstructions = getPlatformInstructions(targetModel);
    const cameraMoves = getCameraMovements();
    const lightSetups = getLightingSetups();

    const subject = personDescription ? enhancePersonDescription(personDescription) : `The ${object}`;

    const scenario = cinematicScenarios[Math.floor(Math.random() * cinematicScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `
You are a world-class CINEMATOGRAPHER and AI PROMPT ENGINEER.
Your goal is to turn a simple object/person into a HOLLYWOOD-LEVEL CINEMATIC MASTERPIECE.

**TARGET PLATFORM:** ${targetModel?.toUpperCase() || 'GENERAL'}
${platformInstructions}

**SCENARIO:** ${scenario.category}
**MOOD:** ${template.mood}

**YOUR TASK:**
Write a highly detailed, professional video prompt following the syntax structure above.
The prompt must describe:
1. **SUBJECT:** ${template.photoPlacement}
2. **ACTION:** ${template.cinematicAction}
3. **CAMERA:** ${template.cameraWork}
4. **LIGHTING:** Dramatic, professional lighting matching the mood.

**AVAILABLE CAMERA MOVES:**
${cameraMoves}

**AVAILABLE LIGHTING SETUPS:**
${lightSetups}

**OUTPUT FORMAT:**
Return a JSON object with:
{
  "prompt": "The detailed prompt text...",
  "hook": "${template.viralHook}",
  "personNote": "${personDescription ? 'Ensure character consistency' : ''}",
  "expectedViews": "${template.expectedViews}",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {
     "kling": "Specific tips for Kling...",
     "runway": "Specific tips for Runway..."
  }
}
`;

    return { systemPrompt, randomStyle: scenario };
}

// ===== 2. SHOCKING MODE =====
export function getShockingPrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformInstructions = getPlatformInstructions(targetModel);
    const physics = getPhysicsKeywords();

    const subject = personDescription ? enhancePersonDescription(personDescription) : `The ${object}`;
    const scenario = viralShockScenarios[Math.floor(Math.random() * viralShockScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `
You are a VIRAL CONTENT SPECIALIST specializing in "SHOCK FACTOR" short-form videos.
Your goal is to create a prompt that stops the scroll instantly.

**TARGET PLATFORM:** ${targetModel?.toUpperCase() || 'GENERAL'}
${platformInstructions}

**SCENARIO:** ${scenario.category}
**VIRAL HOOK:** ${template.viralHook}

**YOUR TASK:**
Write a prompt that generates a SHOCKING, HIGH-IMPACT video.
The prompt must describe:
1. **SETUP:** ${template.photoPlacement}
2. **THE SHOCK:** ${template.shockAction}
3. **TIMING:** ${template.timing}
4. **PHYSICS:** ${template.physicsDetails}

**PHYSICS KEYWORDS TO USE:**
${physics}

**OUTPUT FORMAT:**
Return a JSON object with:
{
  "prompt": "The detailed prompt text...",
  "hook": "${template.viralHook}",
  "personNote": "${personDescription ? 'Ensure character consistency' : ''}",
  "expectedViews": "${template.viewsRange}",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}
`;
    return { systemPrompt, randomStyle: scenario };
}

// ===== 3. CHAOS MODE =====
export function getChaosPrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformInstructions = getPlatformInstructions(targetModel);

    const subject = personDescription ? enhancePersonDescription(personDescription) : `The ${object}`;
    const scenario = chaosScenarios[Math.floor(Math.random() * chaosScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `
You are a SURREALIST ARTIST and GLITCH EXPERT.
Your goal is to create a video that breaks reality and confuses the viewer (in a fun way).

**TARGET PLATFORM:** ${targetModel?.toUpperCase() || 'GENERAL'}
${platformInstructions}

**SCENARIO:** ${scenario.category}
**VISUAL STYLE:** ${template.visualStyle}

**YOUR TASK:**
Write a prompt that generates a MIND-BENDING, CHAOTIC video.
1. **ACTION:** ${template.chaosAction}
2. **STYLE:** Use glitch art and surrealist keywords.

**OUTPUT FORMAT:**
Return a JSON object with:
{
  "prompt": "The detailed prompt text...",
  "hook": "${template.viralHook}",
  "personNote": "${personDescription ? 'Ensure character consistency' : ''}",
  "expectedViews": "Unknown (Viral Wildcard)",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}
`;
    return { systemPrompt, randomStyle: scenario };
}

// ===== 4. ANIME MODE (NEW) =====
export function getAnimePrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformInstructions = getPlatformInstructions(targetModel);

    // Default subject if none provided
    const subject = personDescription ? enhancePersonDescription(personDescription) : `The ${object}`;
    const scenario = animeScenarios[Math.floor(Math.random() * animeScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `
You are a LEAD ANIMATOR at MAPPA/UFOTABLE studios.
Your goal is to create a prompt for a high-budget SHONEN ANIME action scene.

**TARGET PLATFORM:** ${targetModel?.toUpperCase() || 'GENERAL'}
${platformInstructions}

**SCENARIO:** ${scenario.category}
**VISUAL STYLE:** ${template.visualStyle}

**CRITICAL STYLE RULES:**
- Style Prefix: "anime style, cel-shaded, Japanese animation, MAPPA studio quality"
- Quality Modifiers: "8K, fluid dynamic pose, sakuga animation quality, highly detailed"
- Colors: "vibrant saturated colors, high contrast, bold graphic shadows"
- Camera: "dutch angle, crash zoom, speed lines"

**NEGATIVE PROMPTS (MUST AVOID):**
"photorealistic, realistic, 3D render, CGI, hyperrealistic, realistic skin texture, bad anatomy, bad hands, extra fingers, deformed, blurry, low quality, western cartoon style, soft shading"

**YOUR TASK:**
Write a prompt that generates a SAKUGA-LEVEL ANIME video.
1. **SUBJECT:** ${template.photoPlacement}
2. **ACTION:** ${template.animeAction}
3. **CAMERA:** ${template.cameraWork}

**OUTPUT FORMAT:**
Return a JSON object with:
{
  "prompt": "The detailed prompt text...",
  "hook": "${template.viralHook}",
  "personNote": "${personDescription ? 'Ensure character consistency' : ''}",
  "expectedViews": "${template.expectedViews}",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}
`;
    return { systemPrompt, randomStyle: scenario };
}

// ===== 5. CARTOON MODE (NEW) =====
export function getCartoonPrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformInstructions = getPlatformInstructions(targetModel);

    const subject = personDescription ? enhancePersonDescription(personDescription) : `The ${object}`;
    const scenario = cartoonScenarios[Math.floor(Math.random() * cartoonScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `
You are a CLASSIC 2D ANIMATION DIRECTOR (Saturday Morning Cartoons / Studio Ghibli).
Your goal is to create a prompt for a 2D CARTOON animation.

**TARGET PLATFORM:** ${targetModel?.toUpperCase() || 'GENERAL'}
${platformInstructions}

**SCENARIO:** ${scenario.category}
**VISUAL STYLE:** ${template.visualStyle}

**CRITICAL STYLE RULES:**
- Style Prefix: "2D cartoon animation, cel-shaded coloring, flat color fields, thick bold outlines"
- Visual Modifiers: "clean lines, minimal texture, hand-drawn look, vibrant color palette"
- Animation Principles: "squash and stretch, exaggerated motion, bouncy timing"

**NEGATIVE PROMPTS (MUST AVOID):**
"realistic, 3D, CGI, hyperrealistic, photorealistic, uncanny, deformed, extra limbs, realistic shadows, ambient occlusion, complex lighting"

**YOUR TASK:**
Write a prompt that generates a CLEAN 2D CARTOON video.
1. **SUBJECT:** ${template.photoPlacement}
2. **ACTION:** ${template.cartoonAction}
3. **CAMERA:** ${template.cameraWork}

**OUTPUT FORMAT:**
Return a JSON object with:
{
  "prompt": "The detailed prompt text...",
  "hook": "${template.viralHook}",
  "personNote": "${personDescription ? 'Ensure character consistency' : ''}",
  "expectedViews": "${template.expectedViews}",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}
`;
    return { systemPrompt, randomStyle: scenario };
}

// ===== 6. STICKMAN MODE (NEW) =====
export function getStickmanPrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformInstructions = getPlatformInstructions(targetModel);

    // Stickman mode ignores person description mostly, but uses it for context
    const subject = personDescription ? `A stick figure representing a ${personDescription}` : `A stick figure representing ${object}`;
    const scenario = stickmanScenarios[Math.floor(Math.random() * stickmanScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `
You are a MINIMALIST ANIMATOR (Xiao Xiao / Pivot Animator style).
Your goal is to create a prompt for a STICK FIGURE animation.

**TARGET PLATFORM:** ${targetModel?.toUpperCase() || 'GENERAL'}
${platformInstructions}

**SCENARIO:** ${scenario.category}
**VISUAL STYLE:** ${template.visualStyle}

**CRITICAL STYLE RULES:**
- Style Prefix: "simple stick figure, minimalist line art"
- Character Spec: "circular head, straight line body, angular limbs, black lines only"
- Background: "solid flat white canvas, pure #FFFFFF background, empty white space"

**NEGATIVE PROMPTS (MUST AVOID):**
"realistic, detailed, 3D render, photorealistic, complex background, textures, shading, shadows, gradients, lighting effects, high detail"

**YOUR TASK:**
Write a prompt that generates a MINIMALIST STICKMAN video.
1. **SUBJECT:** ${template.photoPlacement}
2. **ACTION:** ${template.stickmanAction}
3. **CAMERA:** ${template.cameraWork}

**OUTPUT FORMAT:**
Return a JSON object with:
{
  "prompt": "The detailed prompt text...",
  "hook": "${template.viralHook}",
  "personNote": "Stick figures only",
  "expectedViews": "${template.expectedViews}",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}
`;
    return { systemPrompt, randomStyle: scenario };
}


// ===== 7. HOOKS MODE (Script/Text) - Unchanged =====
export function getHooksPrompt(
    script: string,
    stylePreference: string = "",
    mode: 'chaos' | 'cinematic' | 'shocking' = 'shocking',
    targetModel: string = 'kling'
): { systemPrompt: string } {

    const platformInstructions = getPlatformInstructions(targetModel);
    const physicsKeywords = getPhysicsKeywords();

    const modeStyle = mode === 'chaos'
        ? "wild, chaotic, political-defying, pattern-interrupt with suspended objects and impossible scenarios"
        : mode === 'cinematic'
            ? "dramatic, visually stunning, Hollywood-quality cinematography with emotional depth"
            : "attention-grabbing, controversial, stop-scroll, shocking revelation that demands answers";

    const systemPrompt = `
You are an elite AI video prompt engineer specializing in creating VIRAL OPENING HOOKS for social media shorts and reels.

**YOUR TASK:**
Create a VISUAL VIDEO PROMPT that describes the OPENING HOOK SCENE for the user's content. This hook scene will FADE OUT into their main content.

**THE USER'S MAIN CONTENT/SCRIPT:**
"""
${script}
"""

${stylePreference ? `**USER'S STYLE PREFERENCE:** ${stylePreference}` : ''}

**MODE:** ${mode.toUpperCase()} - Your visual style should be: ${modeStyle}

**VISUAL HOOK STYLES:**
${VISUAL_HOOK_STYLES.map(s => `- ${s.name}: ${s.description}`).join('\n')}

**FADE-OUT TRANSITIONS:**
${FADE_OUT_STYLES.join('\n- ')}

**PLATFORM:** ${targetModel.toUpperCase()}
${platformInstructions}

**PHYSICS KEYWORDS:**
${physicsKeywords}

**OUTPUT FORMAT:**
Return a JSON object with the following structure:
{
  "prompt": "The detailed visual prompt description...",
  "viralHook": "The short catchy text overlay/concept",
  "genre": "The specific sub-genre or style category",
  "hook": "The main hook description",
  "fadeOut": "How the scene transitions/fades out",
  "cameraWork": "Specific camera movements used",
  "lighting": "Lighting setup used",
  "hookMoment": "The specific timing/action of the hook",
  "difficulty": "Easy/Medium/Hard",
  "platformSpecific": {}
}
`;

    return { systemPrompt };
}

// ===== 8. PARSE HOOKS RESPONSE =====
export const parseHooksResponse = (text: string): any => {
    try {
        // Clean markdown code blocks if present
        let clean = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();

        // Find JSON object
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
            clean = match[0];
        }

        return JSON.parse(clean);
    } catch (e) {
        // Fallback for non-JSON response (legacy compat)
        console.error("Failed to parse hooks JSON:", e);
        return {
            prompt: text,
            viralHook: "Viral Hook Generated",
            genre: "General",
            hook: text.slice(0, 50) + "...",
            fadeOut: "Fade to black",
            cameraWork: "Dynamic",
            lighting: "Cinematic",
            hookMoment: "Start",
            difficulty: "Medium",
            platformSpecific: {}
        };
    }
};
