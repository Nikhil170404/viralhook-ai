/**
 * PLATFORM-SPECIFIC INSTRUCTIONS (2026 STANDARDS)
 * Optimized for current generation Model capabilities.
 */

export const PLATFORMS = {
    KLING: 'kling',
    RUNWAY: 'runway',
    VEO: 'veo',
    LUMA: 'luma'
} as const;

export type PlatformType = typeof PLATFORMS[keyof typeof PLATFORMS];

export const getKlingInstructions = () => `
**KLING AI 2.6 PRO (4-Part Universal Structure):**

**Optimal Word Count:** 60-100 words (5-7 distinct elements).

**Syntax Structure:**
Subject (2-3 details) → Action (Speed/Manner) → Context (3-5 elements) → Style (Camera/Lighting/Mood)

**Critical Rules (2026):**
1. **Motion Endpoints**: ALWAYS end with "then settles", "comes to rest", or "gradually slowing" to prevent 99% generation hangs.
2. **Explicit Physics**: Unlike other models, Kling explicitly rewards physics keywords like "fluid dynamics", "realistic liquid dynamics", or "fabric flowing naturally".
3. **Inverted Terminology**: "tilt left" = "pan left". Use specific camera specification from the start.
4. **No Exact Numbers**: Use "a cluster" or "a flock" instead of "5".

**Example Kling Prompt:**
"Slow tracking shot. A 35-year-old woman with auburn hair in an emerald coat walks purposefully along an urban path at golden hour (Subject/Action). Autumn leaves scatter on pavement, ground-level mist (Context). Documentary realism, motion gradually slows as she reaching park bench (Style/Endpoint)."
`;

export const getRunwayInstructions = () => `
**RUNWAY GEN-4 (The "Simplicity" Engine):**

**Optimal Word Count:** 20-50 words (**Thrives on simplicity**).

**Syntax Structure:**
[Camera Movement]: [Establishing Scene]. [Additional Details]. [Style].

**Critical Rules (2026):**
1. **Describe Outcomes**: Use "Actor takes four steps to window, pauses" instead of technical jargon.
2. **Behavioral Physics**: Describe "Objects impact and bounce" instead of "collision detection".
3. **Information Hierarchy**: Lead with the critical element. Never redescribe what's in a reference image.
4. **No Negative Prompts**: Focusing on what you DON'T want causes model confusion.

**Example Runway Prompt:**
"Tracking shot: The camera follows the cyclist from a low angle as they pedal steadily along the coastal highway. Golden hour lighting, cinematic look."
`;

export const getVeoInstructions = () => `
**GOOGLE VEO 3.1 (Cinematic Verbosity):**

**Optimal Word Count:** 300-400 words (Rewards front-loaded detail).

**Syntax Structure:**
Timestamp-based Sequencing: [00:00-00:0X] Camera action + Subject behavior.

**Critical Features (2026):**
1. **Emergent Physics**: NEVER use physics jargon (ragdoll/collision). Describe outcomes like "sparks scatter" or "water flows naturally".
2. **Multi-Shot Sequencing**: Can handle complex sequences involving time-stamps.
3. **Native Audio**: Describe sound effects and ambient noise as part of the prompt.

**Example Veo Segment:**
"[00:00-00:02] Wide crane shot of explorer in vast temple complex. [00:02-00:05] Camera dollies in to freckled face expressing awe. Audio: Wind whistling, distance stone scraping."
`;

export const getLumaInstructions = () => `
**LUMA DREAM MACHINE RAY3 (Conversational Flow):**

**Optimal Word Count:** 3-4 natural language sentences.

**Critical Features (2026):**
1. **Reasoning Mode**: The model "thinks" about your prompt flow—be conversational but precise.
2. **Visual Annotation**: Describe motion as a trajectory (e.g., "Subject moves in a sweeping arc from camera left to right").
3. **Fluidity**: Excellent for loops and morphing.

**Example Luma Prompt:**
"A vibrant street performer in a sequined outfit dances in a graffiti-adorned alley. The camera starts at a low angle capturing the fabric flow, then smoothly transitions to a wide shot showing the environment. Confetti falls around them as they finish with a dramatic pose."
`;

export const getNegativePrompt = (model: string) => {
    const m = model.toLowerCase();

    // Runway HATES negative prompts - causes opposite effects
    if (m.includes('runway')) return '';

    const baseNegative = "distorted faces, morphing, unrealistic physics, floating objects, warping, blurry edges";

    if (m.includes('kling')) {
        return baseNegative + ", slow motion artifacts, flickering, jittery motion, frame stuttering, unnatural locomotion";
    }

    if (m.includes('luma')) {
        return baseNegative + ", static frozen frame, no motion, stuck elements, physics violations";
    }

    if (m.includes('veo')) {
        return baseNegative + ", low resolution, heavy compression, audio desync, muffled sound";
    }

    return baseNegative + ", low quality, amateur, unnatural";
};
