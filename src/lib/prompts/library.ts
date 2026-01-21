/**
 * SHARED PROMPT LIBRARY (2026)
 * Reusable components for Physics, Camera, Lighting, and Aesthetics.
 */

// ===== CAMERA MOVEMENT LIBRARY =====
export const getCameraMovements = () => `
**PROFESSIONAL CAMERA MOVEMENTS (2026):**

**Push/Pull:**
- Dolly In: "Slow dolly push-in toward subject"
- Dolly Out: "Camera pulls back revealing environment"
- Zoom In: "Slow zoom in, subject grows larger"
- Zoom Out: "Wide zoom out, establishing scale"

**Vertical:**
- Crane Up: "Crane lifts skyward revealing vista"
- Crane Down: "Crane descends from high to low"
- Pedestal Up: "Camera rises vertically, subject stays centered"
- Pedestal Down: "Camera lowers, descending perspective"

**Horizontal:**
- Pan Left: "Camera rotates left on horizontal axis"
- Pan Right: "Camera pans right smoothly"
- Truck Left: "Camera physically moves left (lateral dolly)"
- Truck Right: "Camera tracks right alongside subject"

**Rotation:**
- Tilt Up: "Camera tilts upward on vertical axis"
- Tilt Down: "Camera tilts down looking toward ground"
- Roll Left: "Camera rolls counterclockwise on Z-axis (Dutch angle)"
- Roll Right: "Camera rolls clockwise, tilted perspective"

**Complex:**
- Orbit: "360 degree orbit around static subject"
- Arc Shot: "180 degree semicircle movement"
- Dolly Zoom: "Push-in while zoom-out (Vertigo effect)"
- Steadicam Float: "Smooth gliding follow, weaving through space"
- Whip Pan: "Violent fast pan with motion blur"
- Crash Zoom: "Aggressive rapid zoom with slight shake"
`;

// ===== LIGHTING SETUPS =====
export const getLightingSetups = () => `
**PROFESSIONAL LIGHTING SETUPS:**

**Dramatic:**
- Chiaroscuro: High contrast, Rembrandt triangle, deep shadows
- Low Key: Minimal fill, dramatic shadows, mystery mood
- Silhouette: Backlit subject, no frontal light, shape emphasis
- Rim Light: Edge lighting, separation from background

**Natural:**
- Golden Hour: 3200K warm sunset/sunrise, soft directional
- Blue Hour: 9000-12000K cool twilight, moody atmosphere
- Window Light: Soft natural daylight, direction from frame side
- Overcast: Diffused soft light, minimal shadows, even exposure

**Creative:**
- Volumetric: God rays, light shafts, fog beams, atmospheric
- Neon: Colored practical sources, wet reflections, cyberpunk
- Practical: Visible lamps/candles, motivated sources, realism
- Colored Gel: Theater-style colored lighting, bold mood
`;

// ===== PHYSICS KEYWORDS (2026 UPDATED) =====
export const getPhysicsKeywords = () => `
**2026 OUTCOME-BASED PHYSICS (The "Behavior" Library):**

*Note: For Kling AI, use technical terms. For others, describe behaviors.*

**Fluid & Liquid:**
- Behavioral: "water flows naturally", "ripples propagate outward", "liquid splashes and beads"
- Technical (Kling): "fluid dynamics", "realistic liquid viscosity", "surface tension simulation"

**Impact & Forces:**
- Behavioral: "objects impact and bounce realistically", "sparks scatter on hit", "shatters into sharp fragments"
- Technical (Kling): "rigid body collisions", "momentum transfer", "fragmentation simulation"

**Atmospheric & Particles:**
- Behavioral: "dust drifts in light", "smoke billows in plumes", "embers glow and fade"
- Technical (Kling): "particle simulation", "volumetric fog", "sub-surface scattering"

**Cloth & Hair:**
- Behavioral: "fabric sways in wind", "hair flows naturally with movement", "drapes over surfaces"
- Technical (Kling): "cloth physics", "hair collision detection", "soft body dynamics"
`;

// ===== TOKEN COMPRESSION PLAYBOOK (2026) =====
export const getCompressionGuidelines = () => `
**TOKEN COMPRESSION PLAYBOOK (Achieve 30-50% Reduction):**

**Phase 1: Remove Redundancy**
- Strip conversational filler ("please", "I would like").
- Replace multiple adjectives with one "Power Word".
- Remove quality modifiers ("high quality", "4k") unless mandatory.

**Phase 2: Information Hierarchy**
- Lead with [Style] + [Camera] + [Subject].
- Action must have a clear starting point and ENDPOINT.
- Focus on outcomes and behaviors, not mechanics.

**Phase 3: Image-to-Video Rules**
- NEVER describe what is already in the reference image.
- Focus exclusively on MOTION instructions (15-40 words).
`;

// ===== AESTHETIC FILTERS (2026 UPDATED) =====

export const applyBodycamComedy = () => `
**2026 BODYCAM COMEDY AESTHETIC:**
- **Visuals:** Distorted fish-eye lens (bodycam POV), chest-mounted perspective, shaky movement
- **Overlay:** Blurry timestamp, "POLICE" or "REC" indicators, low-bitrate artifacts
- **Vibe:** Absurd subject handled with extreme seriousness/professionalism
`;

export const applyDreamcore = () => `
**DREAMCORE / WEIRDCORE AESTHETIC:**
- **Visuals:** Liminal spaces, hazy pastels, nostalgic fog, slightly out-of-focus subjects
- **Details:** Cognitive dissonance, out-of-place objects, retro-digital textures
- **Vibe:** Nostalgic unease, surreal peace
`;

export const apply90sVintage = () => `
**90s BOLLYWOOD AESTHETIC:**
- **Film Stock:** Kodak Vision3 500T (warm golden bias)
- **Texture:** Fine 35mm grain, subtle halation, soft highlight rolloff
- **Color:** Warm 3200K tungsten correction, slight magenta shadows
- **Vibe:** Romantic, nostalgic, Udit Narayan style
`;

export const applyVHSEffect = () => `
**VHS ANALOG HORROR AESTHETIC:**
- **Visuals:** Horizontal scan lines, chroma noise/bleeding, tracking errors
- **Quality:** Low resolution (240p), soft focus, compression artifacts
- **Overlay:** 'REC' indicator, datestamp, battery display
- **Vibe:** Found footage, eerie, magnetic tape degradation
`;

export const apply80sSynthwave = () => `
**80s SYNTHWAVE AESTHETIC:**
- **Colors:** Magenta/purple and cyan/teal, hot pink accents
- **Visuals:** Neon geometric grids, laser beams, chrome reflections
- **Lighting:** Strong colored rim lighting, volumetric fog
- **Vibe:** Retro-futuristic, Miami Vice, Arcade
`;

export const apply70sFilmGrain = () => `
**70s FILM GRAIN AESTHETIC:**
- **Film:** Heavy 16mm grain structure, expired film look
- **Color:** Warm orange/amber cast, faded into pastels
- **Details:** Soft focus, slight gate weave (shake)
- **Vibe:** Documentary style, natural light, vintage
`;

export const enhancePersonDescription = (input: string): string => {
    if (!input) return "";
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (trimmed.toLowerCase().startsWith("a ") ||
        trimmed.toLowerCase().startsWith("an ") ||
        trimmed.toLowerCase().startsWith("the ")) {
        return trimmed;
    }
    return `a person who is ${trimmed}`;
};
