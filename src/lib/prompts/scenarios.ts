/**
 * SCENARIO DATA LIBRARY (2026)
 * Contains all predefined viral scenarios and hook styles.
 */

// ===== CINEMATIC SCENARIOS =====
export const cinematicScenarios = [
    {
        category: "Main Character Moment",
        template: (subject: string) => ({
            photoPlacement: `${subject} centered in frame, confident expression, slight wind movement.`,
            cinematicAction: `Slow motion, dramatic lighting change from dark to golden hour, anamorphic lens flares hitting the subject.`,
            cameraWork: "Slow dolly push-in, shallow depth of field, background bokeh",
            mood: "Heroic, empowering, 'that's the moment they became the protagonist'",
            platform: "Veo 3 (Photorealism), Runway Gen-4",
            viralHook: "Every frame is a painting 🎬",
            aesthetic: "Nolan-style blockbuster, IMAX format",
            expectedViews: "2-5M views",
            difficulty: "Easy",
            estimatedTime: "5 mins (Veo) + 3 mins post",
            postProcessing: "Color grade: Teal shadows, Orange highlights. Add 'Interstellar' style soundtrack.",
            commonIssues: "Face consistency can drop in wide shots - keep camera close."
        })
    },
    {
        category: "South Indian Mass Entry",
        template: (subject: string) => ({
            photoPlacement: `${subject} standing in silhouette against a massive dust storm, back turned then slowly turning.`,
            cinematicAction: `Dust and smoke billow around the subject, strong rim lighting creates a golden halo. Debris floats in slow motion.`,
            cameraWork: "Low angle 'Hero Shot', rapid zoom-in (crash zoom), slow motion walk",
            mood: "Hype, powerful, mass appeal, larger than life",
            platform: "Kling (Motion control), Runway",
            viralHook: "Goosebumps guaranteed 🔥",
            aesthetic: "High contrast, backlit smoke, warm color grading (Teal & Orange)",
            expectedViews: "10-50M views (Viral in India)",
            difficulty: "Medium",
            estimatedTime: "10 mins (Kling) + 5 mins post",
            postProcessing: "Add 'Mass BGM' (heavy drums). Ramping speed effect (slow -> fast -> slow).",
            commonIssues: "Smoke can obscure subject - specify 'rim lighting' to keep silhouette clear."
        })
    },
    {
        category: "Royal Rajasthani Aesthetic",
        template: (subject: string) => ({
            photoPlacement: `${subject} framed by an intricate sandstone Jharokha (archway), bathed in golden light.`,
            cinematicAction: `Soft curtains blowing in the wind, pigeons flying in background, sun rays (god rays) filtering through the arch.`,
            cameraWork: "Smooth gimbal tracking shot through the archway, revealing the subject",
            mood: "Regal, timeless, traditional elegance",
            platform: "Veo 3 (Detail), Kling",
            viralHook: "Royalty vibes 👑",
            aesthetic: "Saffron and Gold palette, intricate patterns, soft diffused daylight",
            expectedViews: "5-15M views",
            difficulty: "Medium",
            estimatedTime: "12 mins (Veo) + 8 mins post",
            postProcessing: "Add 'Padmaavat' style classical score. Enhance gold tones in grading.",
            commonIssues: "Intricate patterns can blur - use 'high resolution' and 'sharp focus' keywords."
        })
    },
    {
        category: "Bollywood Romance",
        template: (subject: string) => ({
            photoPlacement: `${subject} in a vast mustard field, traditional vibe, looking into distance.`,
            cinematicAction: "360-degree orbit camera, rose petals falling, warm 90s golden glow.",
            cameraWork: "Crane up revealing vast landscape, Pro-Mist diffusion filter",
            mood: "Romantic, nostalgic, 90s Bollywood vibes",
            platform: "Kling (Orbit motion), Veo 3",
            viralHook: "Udit Narayan in my head 🎵",
            aesthetic: "Kodak 500T film, 3200K warmth",
            expectedViews: "5-10M views",
            difficulty: "Medium",
            estimatedTime: "8 mins (Kling) + 5 mins post",
            postProcessing: "Add romantic strings BGM. Apply soft glow filter.",
            commonIssues: "Orbit motion can distort faces - keep rotation slow."
        })
    }
];

// ===== SHOCKING SCENARIOS =====
export const viralShockScenarios = [
    {
        category: "Amusement Park Free Fall",
        template: (subject: string) => ({
            photoPlacement: `${subject} positioned center frame, looking calm/casual.`,
            shockAction: `A massive free-fall amusement park ride suddenly descends rapidly from above, directly behind the subject.`,
            cameraWork: "Static front-facing shot, sudden zoom out reveals ride approaching",
            timing: "0-2s: Subject static → 2-3s: Zoom out reveals ride → 3-4s: IMPACT from above → Video cuts",
            physicsDetails: "Ride shadow grows larger, wind blows upward, subject looks up last second",
            platform: "Kling (Motion Brush on ride), Runway (Camera zoom)",
            viralHook: "Wait for it 💀",
            viewsRange: "5-20M views",
            difficulty: "Medium",
            estimatedTime: "10 mins (Kling) + 5 mins post",
            postProcessing: "Add mechanical whirring sound (2s) and massive slam impact sound (4s). Cut to black instantly on impact.",
            commonIssues: "Ride may descend too slowly - increase Motion Brush strength to max."
        })
    },
    {
        category: "Car Drift Behind Back",
        template: (subject: string) => ({
            photoPlacement: `${subject} standing on an empty street, unaware of surroundings.`,
            shockAction: `A sports car drifts sideways behind the subject, tires smoking, inches from impact.`,
            cameraWork: "Front angle locked on subject, car enters frame from side blurred then sharp",
            timing: "0-2s: Subject posing → 2-3s: Engine sound builds → 3-4s: Drift car slides behind → Cut at closest point",
            physicsDetails: "Tire smoke fills background, wind from car blows clothes/hair, slight reaction at end",
            platform: "Runway Gen-4 (Best for vehicle motion), Kling",
            viralHook: "Bro didn't even notice 😭",
            viewsRange: "10-30M views",
            difficulty: "Hard",
            estimatedTime: "15 mins (Runway) + 10 mins post",
            postProcessing: "Layer intense tire screech audio + V10 engine rev. Add camera shake on pass-by.",
            commonIssues: "Car may blend into person - use separate layers or Motion Brush with strict masking."
        })
    },
    {
        category: "Lightning Strike Miss",
        template: (subject: string) => ({
            photoPlacement: `${subject} outdoors, normal lighting, calm atmosphere.`,
            shockAction: `A massive lightning bolt strikes the ground 2 feet beside the subject, creating a blinding flash.`,
            cameraWork: "Static medium shot, sudden white flash fills 80% of frame, camera shake",
            timing: "0-2s: Overcast sky, calm → 2s: Thunder rumble → 3s: LIGHTNING STRIKE → 4s: Smoke clears, subject shocked",
            physicsDetails: "Ground explosion, dirt particles, electrical sparks, hair/fur stands up from static",
            platform: "Veo 3 (Best physics), Runway",
            viralHook: "God said NOT TODAY 😱",
            viewsRange: "15-40M views",
            difficulty: "Medium",
            estimatedTime: "8 mins (Veo) + 2 mins post",
            postProcessing: "Add thunder crack sound (exact sync with flash). Increase brightness/contrast on impact frame.",
            commonIssues: "Flash may wash out entire image - reduce flash duration in prompt."
        })
    },
    {
        category: "Plane Engine Explodes",
        template: (subject: string) => ({
            photoPlacement: `${subject} near a window (implied plane interior), neutral expression.`,
            shockAction: `The plane engine visible outside the window explodes into an orange fireball, sending debris flying.`,
            cameraWork: "Interior close-up on subject, window view shows engine, sudden explosion reflection on subject",
            timing: "0-2s: Cruising altitude, calm → 2s: Engine sputters → 3s: MASSIVE EXPLOSION → 4s: Flames visible",
            physicsDetails: "Window cracks spiderweb pattern, cabin shakes, oxygen masks drop, subject grabs support",
            platform: "Kling (Complex motion), Veo 3",
            viralHook: "Final Destination is real 💀",
            viewsRange: "20-50M views",
            difficulty: "Hard",
            estimatedTime: "20 mins (Kling) + 10 mins post",
            postProcessing: "Cabin alarm sound effect. Muffled explosion audio (as if heard through glass).",
            commonIssues: "Reflection may look fake - ensure lighting matches the explosion source."
        })
    },
    {
        category: "Elevator Cable Snap",
        template: (subject: string) => ({
            photoPlacement: `${subject} inside a glass elevator, casual stance.`,
            shockAction: `The elevator cable snaps, causing a 3-second free fall where the subject floats upward.`,
            cameraWork: "Interior shot, subject center frame, camera follows fall motion, ceiling rushes down",
            timing: "0-2s: Normal ride → 2s: Cable snap sound → 3-4s: FREE FALL, subject floats → 5s: Emergency brake",
            physicsDetails: "Zero gravity effect, hair/loose items float up, G-force distortion on face",
            platform: "Kling (Ragdoll physics), Luma",
            viralHook: "My stomach dropped 😭",
            viewsRange: "8-25M views",
            difficulty: "Hard",
            estimatedTime: "15 mins (Kling) + 5 mins post",
            postProcessing: "Metal snap sound + rushing wind. Add 'camera drop' shake effect.",
            commonIssues: "Zero-G physics is tricky - emphasize 'floating hair and objects' in prompt."
        })
    },
    {
        category: "Truck Tire Blowout",
        template: (subject: string) => ({
            photoPlacement: `${subject} on a sidewalk, side profile, normal environment.`,
            shockAction: `An 18-wheeler truck tire explodes beside the subject on the road, with rubber shrapnel flying.`,
            cameraWork: "Side tracking shot following subject, truck in background, sudden explosion and debris",
            timing: "0-2s: Calm → 2-3s: Tire pressure builds → 3-4s: EXPLOSION, subject flinches → 5s: Debris raining",
            physicsDetails: "Tire rubber chunks fly past, smoke burst, subject flinches and covers up, car alarms trigger",
            platform: "Runway Gen-4 (Particle effects), Veo 3",
            viralHook: "Death missed by 2 feet 💀",
            viewsRange: "12-35M views",
            difficulty: "Medium",
            estimatedTime: "10 mins (Runway) + 5 mins post",
            postProcessing: "Loud explosion sound + ear ringing tone after. Car alarms going off in distance.",
            commonIssues: "Smoke may obscure subject - keep explosion targeted to tire area."
        })
    },
    {
        category: "Chandelier Drop",
        template: (subject: string) => ({
            photoPlacement: `${subject} indoors (restaurant/hall), looking down or away.`,
            shockAction: `A massive crystal chandelier falls from the ceiling directly above the subject, stopping 1 foot from impact.`,
            cameraWork: "Top-down angle showing chandelier, then cut to side angle as it falls",
            timing: "0-2s: Calm scene → 2s: Ceiling crack sound → 3-4s: Chandelier plummets → 4s: Stops mid-air, chain catches",
            physicsDetails: "Glass crystals shatter and scatter, table shakes from impact shockwave, objects tip over",
            platform: "Kling (Precise motion control), Veo 3",
            viralHook: "Guardian angel working overtime 😇",
            viewsRange: "10-30M views",
            difficulty: "Hard",
            estimatedTime: "15 mins (Kling) + 5 mins post",
            postProcessing: "Glass tinkling sounds. Heavy thud but no crash. Crowd gasp audio.",
            commonIssues: "Chandelier physics complex - focus on the 'sudden stop' motion."
        })
    },
    {
        category: "Balcony Railing Breaks",
        template: (subject: string) => ({
            photoPlacement: `${subject} leaning on a high-rise balcony railing, looking at view.`,
            shockAction: `The railing suddenly snaps, the subject starts falling forward but grabs the ledge last second.`,
            cameraWork: "Behind subject, railing in frame, sudden tilt as railing breaks, camera follows fall motion",
            timing: "0-2s: Leaning calmly → 2s: Metal creak sound → 3s: Railing BREAKS → 4s: Subject catches ledge, hanging",
            physicsDetails: "Railing bolts pop out, subject's weight shifts forward, legs dangle over edge, realistic fear",
            platform: "Runway (Camera control), Kling",
            viralHook: "Why did I watch this before bed 💀",
            viewsRange: "15-45M views",
            difficulty: "Hard",
            estimatedTime: "20 mins (Runway) + 10 mins post",
            postProcessing: "Metal screech sound. Wind noise increases. Heartbeat sound effect.",
            commonIssues: "Ensure 'grabbing ledge' action is clear - use multiple keyframes."
        })
    },
    {
        category: "Gas Station Fire Start",
        template: (subject: string) => ({
            photoPlacement: `${subject} near a gas pump, standing normally.`,
            shockAction: `The gas pump nozzle sparks, igniting fuel on the ground, flames race toward the subject.`,
            cameraWork: "Security camera angle, wide shot showing subject and pumps, sudden orange glow spreads",
            timing: "0-2s: Normal scene → 2s: Spark ignition → 3-4s: Flames spread rapidly → 4s: Subject reacts/retreats",
            physicsDetails: "Ground fire spreads in realistic pattern, subject drops items/stumbles back",
            platform: "Veo 3 (Fire physics), Runway",
            viralHook: "Bro unlocked Final Destination 💀",
            viewsRange: "18-50M views",
            difficulty: "Medium",
            estimatedTime: "12 mins (Veo) + 5 mins post",
            postProcessing: "Metallic scrape (2s), Fire whoosh (2.3s), Explosion bass (4.3s). Add heat distortion in post.",
            commonIssues: "Fire spread too fast - reduce motion speed to 60%."
        })
    },
    {
        category: "Subway Train Near Miss",
        template: (subject: string) => ({
            photoPlacement: `${subject} on subway platform edge, distracted.`,
            shockAction: `An express train barrels past at 100mph, wind blows the subject backward inches from the face.`,
            cameraWork: "Platform-level shot, subject in foreground, train enters frame at extreme speed with motion blur",
            timing: "0-2s: Waiting → 2-3s: Rumble intensifies → 3-4s: Train BLASTS past → 4s: Subject stumbles back",
            physicsDetails: "Wind tunnel effect, clothes/paper whip violently, subject covers face",
            platform: "Kling (Motion blur), Runway Gen-4",
            viralHook: "NYC different 😭",
            viewsRange: "10-28M views",
            difficulty: "Medium",
            estimatedTime: "10 mins (Kling) + 5 mins post",
            postProcessing: "Metro rumble sound. Intense wind whoosh. Distorted announcement.",
            commonIssues: "Train speed can look fake - use 'motion blur' and 'camera shake' keywords."
        })
    }
];

// ===== CHAOS SCENARIOS =====
export const chaosScenarios = [
    {
        category: "Physics Break",
        template: (subject: string) => ({
            chaosAction: `${subject} suddenly turns into liquid mercury, splashes upward against gravity, then evaporates into floating geometric pyramids.`,
            visualStyle: "Datamoshing, glitch texture, RGB split, liquid simulation",
            viralHook: "My brain.exe stopped working 🧠",
            platform: "Kling (High motion)",
            difficulty: "Hard",
            estimatedTime: "10 mins (Kling) + 10 mins post",
            postProcessing: "Add glitch sound effects. Maximize saturation.",
            commonIssues: "Video might look like noise - keep subject recognizable for first 2 seconds."
        })
    },
    {
        category: "Mumbai Traffic Chaos",
        template: (subject: string) => ({
            chaosAction: `${subject} is stuck in a Mumbai traffic jam where rickshaws are flying in zero gravity and cows are walking vertically on walls.`,
            visualStyle: "Surrealism, saturated colors, chaotic motion, fisheye lens",
            viralHook: "Average day in Mumbai 🇮🇳",
            platform: "Runway Gen-4",
            difficulty: "Medium",
            estimatedTime: "10 mins (Runway) + 5 mins post",
            postProcessing: "Add traffic honking audio but distorted. Speed up footage 2x.",
            commonIssues: "Too many objects can crash the generation - focus on 3-4 main elements."
        })
    },
    {
        category: "Scale Manipulation",
        template: (subject: string) => ({
            chaosAction: `A tiny version of ${subject} is targeted by a giant hand, but then ${subject} suddenly grows 100x size and consumes the hand.`,
            visualStyle: "Fisheye lens, forced perspective, macro photography",
            viralHook: "Uno Reverse Card 🔄",
            platform: "Veo 3",
            difficulty: "Hard",
            estimatedTime: "15 mins (Veo) + 5 mins post",
            postProcessing: "Add cartoon chomping sounds. Screen shake on 'eating' moment.",
            commonIssues: "Scale consistency is hard - use 'macro photography' keyword."
        })
    },
    {
        category: "Digital Meltdown",
        template: (subject: string) => ({
            chaosAction: `${subject} starts pixelating, then the entire world dissolve into green binary code matrix rain and Windows XP error popups.`,
            visualStyle: "Cyberpunk, glitch art, VHS static, CRT monitor effect",
            viralHook: "Simulation Glitch 👾",
            platform: "Kling AI",
            difficulty: "Medium",
            estimatedTime: "8 mins (Kling) + 5 mins post",
            postProcessing: "Overlay Windows XP error sounds. Add CRT monitor filter.",
            commonIssues: "Text renders poorly - focus on binary 'rain' visuals."
        })
    },
    {
        category: "AI Hallucination Loop",
        template: (subject: string) => ({
            chaosAction: `${subject} continuously morphs into different related objects every 0.5 seconds (e.g., Cat -> Tiger -> Bread -> Cloud -> Cat) in a seamless, dream-like loop.`,
            visualStyle: "DeepDream aesthetic, morphing, surrealism, fluid transitions",
            viralHook: "Don't watch this while high 🍄",
            platform: "Luma (Loop mode)",
            difficulty: "Hard",
            estimatedTime: "12 mins (Luma) + 5 mins post",
            postProcessing: "Add psychedelic trance music. Loop the video perfectly.",
            commonIssues: "Morphing can look ugly - use 'smooth transition' keyword."
        })
    }
];

// ===== HOOK STYLES (Text/Script) =====
export const VISUAL_HOOK_STYLES = [
    { name: "Mystery Reveal", description: "Start with obscured/partial view, slowly reveal the unexpected" },
    { name: "Shock Freeze", description: "Dramatic freeze frame at peak moment, then fade to context" },
    { name: "POV Discovery", description: "First-person perspective discovering something unusual" },
    { name: "Impossible Scene", description: "Physically impossible or surreal opening that demands explanation" },
    { name: "Tension Build", description: "Slow zoom/push-in on subject with building suspense" },
    { name: "Before/After Tease", description: "Show the dramatic 'after' state first, fade to setup" },
    { name: "Chaos Freeze", description: "Freeze mid-action in chaotic moment, objects suspended" },
    { name: "Time Stop", description: "Everything frozen except one element, creating intrigue" }
];

export const FADE_OUT_STYLES = [
    "Slow dissolve to white/black as scene transitions",
    "Zoom out with motion blur into next scene",
    "Freeze frame with subtle vignette fade",
    "Objects slowly defocus as camera pulls back",
    "Light bloom effect consuming the frame",
    "Quick whip pan transitioning to main content",
    "Particles/dust settling as scene changes",
    "Depth of field shift blurring the hook scene"
];
