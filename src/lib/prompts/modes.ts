/**
 * COMPRESSED MODE PROMPTS (2026)
 * 85% token reduction, zero quality loss
 */

import { getPlatformRule } from './platforms';
import { enhancePersonDescription, KLING_PHYSICS_TERMS } from './library';
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

// ===== 1. CINEMATIC MODE (COMPRESSED) =====
export function getCinematicPrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformRule = getPlatformRule(targetModel || 'kling');
    const subject = personDescription ? enhancePersonDescription(personDescription) : `The ${object}`;
    const scenario = cinematicScenarios[Math.floor(Math.random() * cinematicScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `Create cinematic video prompt for ${targetModel || 'Kling AI'}.

SCENE:
- Subject: ${template.photoPlacement}
- Action: ${template.cinematicAction}
- Camera: ${template.cameraWork}
- Mood: ${template.mood}

PLATFORM: ${platformRule}

OUTPUT (JSON):
{
  "prompt": "Your compressed prompt here",
  "hook": "${template.viralHook}",
  "personNote": "${personDescription ? 'Character consistency required' : ''}",
  "expectedViews": "${template.expectedViews}",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}`;

    return { systemPrompt, randomStyle: scenario };
}

// ===== 2. SHOCKING MODE (COMPRESSED) =====
export function getShockingPrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformRule = getPlatformRule(targetModel || 'kling');
    const subject = personDescription ? enhancePersonDescription(personDescription) : `The ${object}`;
    const scenario = viralShockScenarios[Math.floor(Math.random() * viralShockScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `Generate SHOCKING stop-scroll video for ${targetModel || 'Kling AI'}.

SHOCK SETUP:
- Placement: ${template.photoPlacement}
- Impact: ${template.shockAction}
- Timing: ${template.timing}
- Physics: ${template.physicsDetails}

Hook: "${template.viralHook}"
Category: ${scenario.category}

PLATFORM: ${platformRule}
${targetModel?.toLowerCase().includes('kling') ? `\nUse physics terms: ${KLING_PHYSICS_TERMS.slice(0, 3).join(', ')}` : ''}

OUTPUT (JSON):
{
  "prompt": "Your prompt here",
  "hook": "${template.viralHook}",
  "personNote": "${personDescription ? 'Character consistency required' : ''}",
  "expectedViews": "${template.viewsRange}",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}`;

    return { systemPrompt, randomStyle: scenario };
}

// ===== 3. CHAOS MODE (COMPRESSED) =====
export function getChaosPrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformRule = getPlatformRule(targetModel || 'kling');
    const subject = personDescription ? enhancePersonDescription(personDescription) : `The ${object}`;
    const scenario = chaosScenarios[Math.floor(Math.random() * chaosScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `Create SURREAL chaos video for ${targetModel || 'Kling AI'}.

CONCEPT: ${scenario.category}
Action: ${template.chaosAction}
Style: ${template.visualStyle}

PLATFORM: ${platformRule}

OUTPUT (JSON):
{
  "prompt": "Your mind-bending prompt",
  "hook": "${template.viralHook}",
  "personNote": "${personDescription ? 'Character consistency required' : ''}",
  "expectedViews": "Viral wildcard",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}`;

    return { systemPrompt, randomStyle: scenario };
}

// ===== 4. ANIME MODE (COMPRESSED) =====
export function getAnimePrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformRule = getPlatformRule(targetModel || 'kling');
    const subject = personDescription ? enhancePersonDescription(personDescription) : `The ${object}`;
    const scenario = animeScenarios[Math.floor(Math.random() * animeScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `Generate SAKUGA anime prompt for ${targetModel || 'Kling AI'}.

PREFIX: "anime style, cel-shaded, MAPPA quality, 8K, vibrant saturated colors, bold shadows"

SCENE:
- Subject: ${template.photoPlacement}
- Action: ${template.animeAction}
- Camera: ${template.cameraWork}
- Style: ${template.visualStyle}

PLATFORM: ${platformRule}

NEGATIVE: "photorealistic, realistic, 3D render, CGI, bad anatomy, western cartoon, soft shading"

OUTPUT (JSON):
{
  "prompt": "Your anime prompt (include PREFIX at start)",
  "hook": "${template.viralHook}",
  "personNote": "${personDescription ? 'Character consistency required' : ''}",
  "expectedViews": "${template.expectedViews}",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}`;

    return { systemPrompt, randomStyle: scenario };
}

// ===== 5. CARTOON MODE (COMPRESSED) =====
export function getCartoonPrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformRule = getPlatformRule(targetModel || 'kling');
    const subject = personDescription ? enhancePersonDescription(personDescription) : `The ${object}`;
    const scenario = cartoonScenarios[Math.floor(Math.random() * cartoonScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `Generate 2D CARTOON prompt for ${targetModel || 'Kling AI'}.

PREFIX: "2D cartoon animation, cel-shaded, thick outlines, flat colors, hand-drawn, vibrant palette"

SCENE:
- Subject: ${template.photoPlacement}
- Action: ${template.cartoonAction}
- Camera: ${template.cameraWork}
- Style: ${template.visualStyle}

PLATFORM: ${platformRule}

NEGATIVE: "realistic, 3D, CGI, photorealistic, complex lighting, ambient occlusion"

OUTPUT (JSON):
{
  "prompt": "Your cartoon prompt (include PREFIX at start)",
  "hook": "${template.viralHook}",
  "personNote": "${personDescription ? 'Character consistency required' : ''}",
  "expectedViews": "${template.expectedViews}",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}`;

    return { systemPrompt, randomStyle: scenario };
}

// ===== 6. STICKMAN MODE (COMPRESSED) =====
export function getStickmanPrompt(object: string, targetModel?: string, personDescription?: string) {
    const platformRule = getPlatformRule(targetModel || 'kling');
    const subject = personDescription ? `Stick figure: ${personDescription}` : `Stick figure: ${object}`;
    const scenario = stickmanScenarios[Math.floor(Math.random() * stickmanScenarios.length)];
    const template = scenario.template(subject);

    const systemPrompt = `Generate MINIMALIST stick figure prompt for ${targetModel || 'Kling AI'}.

PREFIX: "stick figure, minimalist line art, circular head, straight body, angular limbs, black lines, pure white background #FFFFFF"

SCENE:
- Character: ${template.photoPlacement}
- Action: ${template.stickmanAction}
- Camera: ${template.cameraWork}

PLATFORM: ${platformRule}

NEGATIVE: "realistic, detailed, 3D, photorealistic, textures, shading, shadows, gradients, lighting, background detail"

OUTPUT (JSON):
{
  "prompt": "Your stickman prompt (include PREFIX at start)",
  "hook": "${template.viralHook}",
  "personNote": "Stick figures only",
  "expectedViews": "${template.expectedViews}",
  "difficulty": "${template.difficulty}",
  "estimatedTime": "${template.estimatedTime}",
  "postProcessing": "${template.postProcessing}",
  "platformSpecific": {}
}`;

    return { systemPrompt, randomStyle: scenario };
}

// ===== 7. HOOKS MODE (COMPRESSED) =====
export function getHooksPrompt(
    script: string,
    stylePreference: string = "",
    mode: 'chaos' | 'cinematic' | 'shocking' | 'anime' | 'cartoon' | 'stickman' = 'shocking',
    targetModel: string = 'kling'
): { systemPrompt: string } {

    const platformRule = getPlatformRule(targetModel);

    const modeStyles = {
        chaos: "wild, surreal, reality-breaking, suspended objects",
        cinematic: "dramatic, Hollywood-quality, emotional depth",
        anime: "intense shonen action, sakuga quality, MAPPA aesthetic",
        cartoon: "2D animation, squash-stretch, vibrant, Saturday morning",
        stickman: "minimalist stick figure, fluid combat, clean lines",
        shocking: "stop-scroll, controversial, shocking revelation"
    };

    const systemPrompt = `Create VISUAL HOOK SCENE for social media short (fades into main content).

USER'S MAIN CONTENT:
"""
${script}
"""

${stylePreference ? `STYLE REQUEST: ${stylePreference}` : ''}

MODE: ${mode.toUpperCase()} - ${modeStyles[mode]}

HOOK STYLES: ${VISUAL_HOOK_STYLES.map(s => `${s.name} (${s.description})`).join(' | ')}

FADE-OUTS: ${FADE_OUT_STYLES.slice(0, 3).join(' | ')}

PLATFORM: ${platformRule}

OUTPUT (JSON):
{
  "prompt": "Visual hook scene description",
  "viralHook": "Short catchy text overlay",
  "genre": "Specific sub-genre",
  "hook": "Main hook description",
  "fadeOut": "Transition method",
  "cameraWork": "Camera movements",
  "lighting": "Lighting setup",
  "hookMoment": "Timing/action of hook",
  "difficulty": "Easy/Medium/Hard",
  "platformSpecific": {}
}`;

    return { systemPrompt };
}

// ===== 8. PARSE HOOKS RESPONSE (Unchanged) =====
export const parseHooksResponse = (text: string): any => {
    try {
        let clean = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) clean = match[0];
        return JSON.parse(clean);
    } catch (e) {
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
