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

// ===== PHYSICS KEYWORDS =====
export const getPhysicsKeywords = () => `
**2026 ADVANCED PHYSICS KEYWORD LIBRARY:**

**Fluid Dynamics:**
- Water: splash, cascade, ripple, pour, drip, stream, gush, wave, spray
- Viscosity: thick flow, viscous pour, syrupy motion, honey drip
- Surface: surface tension, ripple propagation, capillary waves

**Collision & Impact:**
- Vehicle: T-bone, head-on, rollover, sideswipe, crumple zones
- Breakage: shatter, fracture, spiderweb crack, fragment scatter
- Deformation: crumple, bend, compress, dent

**Particle Effects:**
- Smoke: billowing smoke, smoke plumes, wispy trails
- Dust: dust cloud, dust motes floating, debris cloud
- Fire: sparks, embers, ash, flame particles

**Cloth & Fabric:**
- Motion: billowing, flowing, rippling, draping, fluttering
- Wind: wind-blown, caught in breeze, fabric lift
`;

// ===== AESTHETIC FILTERS =====

export const apply90sVintage = () => `
**90s BOLLYWOOD AESTHETIC:**
- **Film Stock:** Kodak Vision3 500T (warm golden bias)
- **Texture:** Fine 35mm grain, subtle halation, soft highlight rolloff
- **Color:** Warm 3200K tungsten correction, slight magenta shadows
- **Lighting:** Golden hour, rim/hair light, soft key
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
