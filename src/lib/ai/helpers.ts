/**
 * 2026 AI Video Prompt Engineering Helpers
 * Advanced platform instructions, physics keywords, and optimization techniques
 */

// ===== PLATFORM-SPECIFIC INSTRUCTIONS (2026 LATEST) =====

export const getKlingInstructions = () => `
**KLING AI 1.6/2.6 PRO (Motion Control Leader):**

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
**RUNWAY GEN-3 ALPHA / GEN-4 (Camera Control Master):**

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

// ===== NEGATIVE PROMPTS (PLATFORM-SPECIFIC) =====

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

// ===== PHYSICS KEYWORDS LIBRARY (2026 ADVANCED) =====

export const getPhysicsKeywords = () => `
**2026 ADVANCED PHYSICS KEYWORD LIBRARY:**

**Fluid Dynamics:**
- Water: splash, cascade, ripple, pour, drip, stream, gush, wave, spray
- Viscosity: thick flow, viscous pour, syrupy motion, honey drip
- Surface: surface tension, ripple propagation, capillary waves
- Advanced: fluid simulation, caustic reflections, foam generation, buoyancy

**Collision & Impact:**
- Vehicle: T-bone, head-on, rollover, sideswipe, crumple zones, momentum transfer
- Breakage: shatter, fracture, spiderweb crack, fragment scatter
- Deformation: crumple, bend, compress, dent, permanent deformation
- Energy: kinetic energy, impact force, momentum exchange, inertia
- Bounce: rebound, elastic collision, coefficient of restitution

**Particle Effects:**
- Smoke: billowing smoke, smoke plumes, wispy trails, dissipation
- Dust: dust cloud, dust motes floating, debris cloud, particulate matter
- Fire: sparks, embers, ash, flame particles, combustion particles
- Celebration: confetti burst, balloon pop, glitter cascade
- Environmental: pollen drift, snow fall, rain drops, leaves scatter

**Cloth & Fabric:**
- Motion: billowing, flowing, rippling, draping, fluttering
- Wind: wind-blown, caught in breeze, fabric lift
- Physics: weight, gravity pull, inertia, resistance

**Destruction:**
- Glass: tempered glass shatter, safety glass crack, crystalline fragments
- Metal: metal fatigue, stress fracture, warp, buckle
- Concrete: crack propagation, chunk detachment, rebar exposure
- Wood: splinter, split, crack, grain separation

**Soft Body Physics:**
- Deformation: elastic recovery, jello bounce, compress, conform
- Properties: soft body simulation, squash and stretch, terminal velocity
- Materials: gelatin wobble, balloon deform, rubber bounce

**Rigid Body Physics:**
- Motion: tumbling, spinning, rolling, sliding, skidding
- Forces: gravity pull, air resistance, friction, drag
- Collision: impact moment, bounce trajectory, angular momentum

**Ragdoll Physics (Human/Character):**
- Fall: limp physics, balance failure, momentum transfer
- Articulation: joint articulation, limb flailing, weight distribution
- Impact: body crumple, defensive reflex, protective instinct

**Explosion & Fire:**
- Fireball: expansion rate, combustion, heat distortion, thermal bloom
- Shockwave: pressure wave, blast radius, air displacement, debris propulsion
- Smoke: thermal convection, smoke column, particle dispersion
- Secondary: ember shower, secondary ignition, fire spread

**Time & Motion:**
- Slow Motion: 60fps, 120fps, 240fps, time-stretched, frame-by-frame
- Fast Motion: time-lapse, hyper-speed, compressed time, rapid motion
- Freeze: bullet time, frozen moment, temporal distortion, time freeze
- Speed Ramp: acceleration, deceleration, speed variation

**Scale & Perspective:**
- Macro: extreme close-up, magnification, microscopic detail
- Miniature: tilt-shift effect, miniature world, toy aesthetic
- Giant: impossible scale, cathedral-sized, colossal proportions
- Contrast: scale juxtaposition, size comparison, perspective distortion

**Camera Physics:**
- Shake: camera shake, handheld jitter, earthquake rumble, impact vibration
- Motion: motion blur, directional blur, radial blur, zoom blur
- Stability: stabilized smooth, gimbal float, locked-off static
`;

// ===== VINTAGE EFFECTS (2026) =====

export const apply90sVintage = () => `
**90s BOLLYWOOD AESTHETIC (AUTO-APPLIED):**

**Film Stock:**
- Kodak Vision3 500T (tungsten balanced, fine grain)
- Kodak Portra 400 (warm skin tones, pastel palette)
- Alternative: Fuji Eterna (slightly cooler, vivid colors)

**Texture & Grain:**
- Fine 35mm grain structure
- Subtle halation (glow around bright areas)
- Soft highlight rolloff (gentle overexposure recovery)

**Color Science:**
- Warm 90s color timing with golden amber bias
- Color temperature: 3200K tungsten correction
- Slight magenta push in shadows (film characteristic)
- Kodak warm wrap (oranges/yellows slightly pushed)

**Aspect Ratio:**
- 4:3 (classic TV format) or 1.85:1 (theatrical)
- Vertical safe area consideration for TV broadcast

**Filtration:**
- Pro-Mist 1/4 or 1/2 (soft diffusion, glow on highlights)
- Soft glow on practicals and backlight
- Atmospheric haze for depth

**Camera Movement:**
- Smooth dolly or crane (not handheld shakiness)
- Romantic push-ins on close-ups
- Sweeping establishing shots

**Lighting:**
- Golden hour preferred (warm, soft, directional)
- Practical sources (lamps, candles) in frame
- Soft key with gentle fill (classic 1990s ratios)
- Rim/hair light for separation

**Music/Audio Vibe:**
- Udit Narayan style melodic vocals
- Sweeping strings (violins, cellos)
- Wind chimes, flute passages
- Tabla/dholak rhythmic elements
`;

export const applyVHSEffect = () => `
**VHS ANALOG HORROR AESTHETIC (AUTO-APPLIED):**

**Visual Artifacts:**
- Horizontal scan lines (interlaced video artifact)
- Chroma noise/bleeding (color separation errors)
- Tracking errors (horizontal distortion bands)
- Head switching noise (glitch at frame transitions)
- Dropout static (missing magnetic information)
- Frame ghosting (residual image trails)

**Color Characteristics:**
- Slight color shift (reds oversaturated, blues crushed)
- Reduced color saturation (magnetic tape degradation)
- Chroma crawling (color edges shimmer)
- Anaglyph-style RGB offset (tape misalignment)

**Image Quality:**
- Low resolution (240p-480p equivalent)
- Soft focus (analog blur, no sharp edges)
- Heavy compression artifacts (MPEG blocking)
- Reduced dynamic range (crushed blacks, blown whites)

**Temporal Effects:**
- Occasional frame judder (tape speed variation)
- Sync pulse glitches (image rolls/tears)
- Magnetic static bursts (white noise frames)
- Tape degradation (image fades/warps)

**Overlay Elements:**
- Datestamp (white text, bottom right corner)
- VCR on-screen display ("REC", "PLAY" indicators)
- Tape counter (incrementing numbers)
- Battery indicator, time display

**Camera Movement:**
- Handheld jitter (home video aesthetic)
- Occasional auto-focus hunt (lens searching)
- Zoom stuttering (motor-driven zoom artifact)

**Color Grading:**
- Slight magenta/green tint (fluorescent lighting)
- Elevated black levels (analog noise floor)
- Reduced contrast (tape compression)

**Audio Implications (Describe Separately for Veo):**
- Tape hiss (white noise floor)
- Muffled dialogue (frequency roll-off)
- VCR mechanical sounds (playback head, motor)
- Tracking noise (static pops, audio dropout)
`;

export const apply80sSynthwave = () => `
**80s SYNTHWAVE AESTHETIC (AUTO-APPLIED):**

**Color Palette:**
- Dominant: Magenta/purple and cyan/teal
- Accent: Hot pink, electric blue, neon orange
- Background: Deep purples, midnight blues
- Highlights: Bright neon glow, laser-like saturation

**Visual Style:**
- Neon lighting (colored tube lights, LED strips)
- Chrome/metallic surfaces (high reflectivity)
- Grid patterns (laser grid floor, geometric backgrounds)
- Wet reflections (rain-slicked streets, puddles)

**Aesthetic Elements:**
- Laser beams cutting through fog/haze
- Geometric shapes (triangles, hexagons, wireframes)
- Retro-futuristic tech (CRT screens, analog displays)
- Palm trees silhouettes (Miami Vice influence)

**Lighting:**
- Strong colored rim lighting (purple/cyan edge light)
- Volumetric fog with colored beams
- Practical neon sources (signs, tubes)
- High contrast (deep shadows, bright highlights)

**Camera & Composition:**
- Symmetrical framing (centered subjects)
- Low angles (heroic, dramatic perspectives)
- Slow dolly movements (smooth, deliberate)
- Lens flares (star filters, anamorphic style)

**Texture:**
- Slight VHS-style scan lines (optional)
- Bloom on bright colors (glow overflow)
- Film grain (vintage video texture)
`;

export const apply70sFilmGrain = () => `
**70s FILM GRAIN AESTHETIC (AUTO-APPLIED):**

**Film Characteristics:**
- Heavy 16mm grain structure (visible texture)
- Warm orange/amber color cast
- Soft focus edges (vintage glass character)
- Expired film look (color shifts, fading)

**Color Science:**
- Warm bias (oranges, yellows pushed)
- Faded pastels (desaturated primaries)
- Earthy tones (browns, ochres, burnt sienna)
- Vintage Kodachrome palette (slightly expired)

**Texture:**
- Visible film grain (medium to heavy)
- Slight halation on highlights
- Soft contrast (gentle rolloff)
- Gate weave (subtle frame shake)

**Aesthetic:**
- Documentary style (observational, handheld)
- Natural lighting preference
- Practical sources in frame
- 1970s fashion, props, environments
`;

// ===== CATEGORY FILTERING =====

export const filterCategories = (cats: any[], targetModel?: string) => {
    if (!targetModel || targetModel === 'auto') return cats;

    const modelMap: Record<string, string> = {
        'kling': 'Kling',
        'luma': 'Luma',
        'veo': 'Veo',
        'google veo': 'Veo',
        'runway': 'Runway'
    };

    const keyword = modelMap[targetModel.toLowerCase()];
    if (!keyword) return cats;

    const filtered = cats.filter(c => c.platform.includes(keyword));

    // If no matches for specific platform, return all categories
    // This allows AI to adapt prompt for the selected platform
    return filtered.length > 0 ? filtered : cats;
};

// ===== CAMERA MOVEMENT LIBRARY (2026) =====

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

**Specialized:**
- FPV Drone: "First-person drone dive, high-speed navigation"
- Gimbal Track: "Smooth following shot, minimal shake"
- Handheld: "Documentary-style natural camera movement"
- Locked Off: "Static tripod shot, no movement"
`;

// ===== LIGHTING SETUPS (2026) =====

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

**Technical:**
- Three-Point: Key + Fill + Back, classic studio setup
- Soft Light: Large sources, diffused, minimal shadows, beauty
- Hard Light: Small sources, defined shadows, dramatic contrast
- Mixed Temperature: Warm/cool contrast, visual interest
`;

// ===== 2026 TRENDING AUDIO (for Veo/Audio-capable platforms) =====

export const getTrendingAudio2026 = () => [
    "Moye Moye (Dzanum) - Serbian viral hit",
    "Tauba Tauba by Karan Aujla - Punjabi dance",
    "After Dark x Sweater Weather mashup - TikTok trend",
    "Just A Chill Guy audio - calm chaos trend",
    "Ice Spice Munch - NPC behavior trend",
    "Money Trees slowed + reverb - sigma grindset",
    "Carnival by Kanye West - hypnotic loop",
    "My Ordinary Life by Living Tombstone - existential calm",
    "Unstoppable by Sia - motivational montage",
    "Bloody Mary by Lady Gaga (pitched down) - POV main character",
    "Apna Time Aayega - Gully Boy anthem",
    "Bhaag DK Bose remix - chaotic energy"
];

// ===== GLITCH & CHAOS VISUALS (2026) =====

export const getGlitchKeywords = () => `
**GLITCH EFFECTS VOCABULARY:**
- **Datamoshing**: pixel bleeding, motion vector destruction, frame blending
- **Digital Decay**: compression artifacts, jpeg crust, bit-rot, signal noise
- **Color Glitch**: RGB split, chromatic aberration, channel shift, hue cycle
- **Structure Break**: pixel sorting, voronoi fracture, vertex displacement, geometric dissolve
- **Retro Glitch**: VHS tracking error, CRT scanlines, magnetic strip distortion, analog static
- **AI Hallucination**: deepdream patterns, morphing geometry, uncanny valley distortion
`;

// ===== PLATFORM COMPARISON MATRIX =====

export const getPlatformComparison = () => `
**2026 PLATFORM STRENGTH MATRIX:**

| Feature | Kling 2.6 | Runway Gen-4 | Veo 3 | Luma Ray3 |
|---------|-----------|--------------|-------|-----------|
| Physics Realism | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Camera Control | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Motion Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Visual Quality | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Speed | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Audio | ❌ | ❌ | ✅ Native | ❌ |
| Max Length | 2+ min | 10s | 30s | 10s |
| Price/Quality | High | Fast/Affordable | Premium | Balanced |

**Use Case Recommendations:**
- **Kling**: Complex motion, character animation, physics-heavy
- **Runway**: Creative control, artistic effects, fast iteration
- **Veo**: Photorealism, audio-critical, broadcast quality
- **Luma**: Fluid dynamics, dreamy aesthetics, quick turnaround
`;