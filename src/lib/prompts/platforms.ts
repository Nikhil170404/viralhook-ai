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
**KLING AI 2.6 PRO (Motion Control Leader):**

**Syntax Structure:**
Subject Description → Action Description → Context/Environment → Cinematic Style

**Critical Rules (2026):**
1. **Inverted Terminology**: "tilt left" means "pan left" in other platforms
2. **Action Limit**: Keep to 1-3 actions per shot maximum
3. **Motion Endpoints**: ALWAYS add "then settles back" or "comes to rest" to prevent generation hangs
4. **No Exact Numbers**: Avoid "5 birds" - use "a flock of birds" instead
5. **Motion Keywords**: tilt, pan, orbit, tracking, following, glide, sweep

**Best For:**
- Complex motion sequences
- Physics simulation (soft body, ragdoll)
- Character locomotion with weight transfer
- 4-part structural prompts
- Extended videos (2+ minutes possible)

**Motion Brush Feature:**
- Use "Motion Brush on [element]" for selective animation
- "Static Brush on background" to freeze surroundings
- Draw trajectory paths for precise object motion

**Example Kling Prompt:**
"A sleek red convertible with chrome details (Subject). Camera tracks alongside as it drives along coastal highway at moderate speed, then gradually pulls back revealing cliffside (Action). Dramatic ocean sunset, golden hour lighting (Context). Cinematic color grading, 2.39:1 anamorphic (Style)."
`;

export const getRunwayInstructions = () => `
**RUNWAY GEN-4 (Camera Control Master):**

**Syntax Structure:**
[Camera Movement]: [Establishing Scene]. [Details]. [Style].

**Critical Rules (2026):**
1. **NO NEGATIVE PROMPTS**: Saying "no movement" causes unpredictable results
2. **Positive Description Only**: Describe what you WANT, not what you don't want
3. **Camera Sliders**: Use precise control (-10 to +10 scale)
   - Horizontal: Left/Right pan
   - Vertical: Up/Down tilt  
   - Zoom: In/Out
   - Pan: Camera rotation horizontal axis
   - Tilt: Camera rotation vertical axis
   - Roll: Camera rotation on Z-axis

**Best For:**
- Precise camera control
- Professional cinematography replication
- Creative effects and artistic styles
- Fast iteration (Gen-3 Turbo: 5 credits/second)

**Camera Control Examples:**
"[Camera Movement]: Dolly zoom, slow push-in while zooming out. [Establishing Scene]: Portrait of subject with realization. [Details]: Background expands, subject stays same size. [Style]: Hitchcock vertigo effect, dramatic lighting."

Camera Slider Format: "Camera: horizontal -3, vertical 0, zoom +5, pan +2, tilt 0, roll 0"
`;

export const getVeoInstructions = () => `
**GOOGLE VEO 3 (High Fidelity + Native Audio):**

**Syntax Structure:**
Hierarchical: Subject → Action → Context → Camera → Lighting → Audio

**Critical Features (2026):**
1. **Native Audio Generation**: First platform with synchronized sound
2. **Professional Cinematography**: Understands terms like "dolly zoom", "180-degree arc shot"
3. **Superior Physics**: Best physics accuracy in current generation
4. **4K Standard**: High resolution output default

**Audio Description:**
- Separate audio into sentences
- "Sound effects: [specific sounds]. Ambient noise: [atmosphere]. Dialogue: [if applicable]"
- Example: "Sound effects: glass clinking, footsteps echo. Ambient noise: gentle room tone, distant traffic."

**Best For:**
- Photorealistic scenes requiring audio
- Complex physics interactions
- Professional broadcast quality
- Dialogue and sound-critical content

**Cinematography Keywords:**
- Time-lapse, dolly zoom, 180-degree arc shot, crane up, tracking shot
- ARRI Alexa, wide-angle lens, shallow depth of field
- Volumetric fog, god rays, golden hour, practical lighting

**Example Veo Prompt:**
"Wide static shot of a misty mountain valley under fast-moving clouds. Time-lapse feel as shadows sweep across dunes. Camera: 180-degree slow arc around peak. Lighting: Early morning golden hour, volumetric fog in valleys. Audio: Wind whistling, distant bird calls. Ambient: Deep mountain silence between gusts. Style: National Geographic, 4K, anamorphic lens."
`;

export const getLumaInstructions = () => `
**LUMA DREAM MACHINE (RAY3) (Physics + Speed):**

**Syntax Structure:**
Concise 3-4 sentences focusing on visual flow

**Critical Features (2026):**
1. **Physics-Aware**: Realistic motion and fluid dynamics
2. **12 Camera Presets**: Predefined professional movements
3. **HDR Output**: 16-bit EXR format capability
4. **Speed**: Fast generation times
5. **Seamless Loops**: Excellent for looping content

**Best For:**
- Fluid simulations (water, smoke, paint)
- Morphing and transformation effects  
- Dreamy artistic aesthetics
- Quick iterations
- Looping animations

**Camera Presets:**
Static, Push In, Pull Out, Pan Left, Pan Right, Tilt Up, Tilt Down, Orbit Left, Orbit Right, Crane Up, Crane Down, Tracking

**Fluid Dynamics Keywords:**
- Splash, cascade, ripple, pour, flow, wave, viscosity
- Morph, dissolve, blend, transform, liquefy

**Example Luma Prompt:**
"Slow motion camera. A vibrant street performer in graffiti-adorned alley, colorful sequined outfit catching light. Camera starts low angle capturing outfit detail, smoothly transitions to wide shot showing urban surroundings. Energetic atmosphere, particle effects of confetti falling. Physics-aware fabric flow and hair movement."
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
