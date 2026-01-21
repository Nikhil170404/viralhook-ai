/**
 * COMPRESSED SCENARIO TEMPLATES (2026)
 * Removed redundant fields, kept creative direction
 */

// ===== CINEMATIC SCENARIOS (COMPRESSED) =====
export const cinematicScenarios = [
    {
        category: "Main Character Moment",
        template: (subject: string) => ({
            photoPlacement: `${subject} centered, confident, slight wind`,
            cinematicAction: `Slow motion, dark to golden hour transition, anamorphic flares`,
            cameraWork: "Slow dolly push-in, shallow DOF, bokeh background",
            mood: "Heroic empowerment",
            viralHook: "Every frame is a painting 🎬",
            expectedViews: "2-5M",
            difficulty: "Easy",
            estimatedTime: "5 mins + 3 post",
            postProcessing: "Teal shadows, orange highlights, Interstellar soundtrack"
        })
    },
    {
        category: "South Indian Mass Entry",
        template: (subject: string) => ({
            photoPlacement: `${subject} silhouette against dust storm, slow turn`,
            cinematicAction: `Dust billows, rim lighting golden halo, debris slow-mo`,
            cameraWork: "Low angle hero shot, crash zoom, slow walk",
            mood: "Hype, mass appeal, larger than life",
            viralHook: "Goosebumps guaranteed 🔥",
            expectedViews: "10-50M",
            difficulty: "Medium",
            estimatedTime: "10 mins + 5 post",
            postProcessing: "Mass BGM heavy drums, ramping speed (slow→fast→slow)"
        })
    },
    {
        category: "Royal Rajasthani",
        template: (subject: string) => ({
            photoPlacement: `${subject} framed by sandstone Jharokha, golden light`,
            cinematicAction: `Curtains blowing, pigeons flying, sun rays filtering through arch`,
            cameraWork: "Gimbal tracking through archway",
            mood: "Regal, timeless elegance",
            viralHook: "Royalty vibes 👑",
            expectedViews: "5-15M",
            difficulty: "Medium",
            estimatedTime: "12 mins + 8 post",
            postProcessing: "Padmaavat classical score, enhance gold tones"
        })
    },
    {
        category: "Bollywood 90s Romance",
        template: (subject: string) => ({
            photoPlacement: `${subject} in mustard field, traditional, looking into distance`,
            cinematicAction: "360° orbit, rose petals falling, warm golden glow",
            cameraWork: "Crane up revealing landscape, Pro-Mist diffusion",
            mood: "Romantic nostalgic 90s Bollywood",
            viralHook: "Udit Narayan in my head 🎵",
            expectedViews: "5-10M",
            difficulty: "Medium",
            estimatedTime: "8 mins + 5 post",
            postProcessing: "Romantic strings BGM, soft glow filter"
        })
    }
];

// ===== SHOCKING SCENARIOS (COMPRESSED - Top 5) =====
export const viralShockScenarios = [
    {
        category: "Amusement Park Free Fall",
        template: (subject: string) => ({
            photoPlacement: `${subject} center frame, calm/casual`,
            shockAction: `Massive free-fall ride descends rapidly from above behind subject`,
            timing: "0-2s static → 2-3s zoom reveals ride → 3-4s impact → cut",
            physicsDetails: "Shadow grows, wind blows upward, subject looks up last second",
            viralHook: "Wait for it 💀",
            viewsRange: "5-20M",
            difficulty: "Medium",
            estimatedTime: "10 mins + 5 post",
            postProcessing: "Mechanical whir (2s), massive slam (4s), cut black instantly"
        })
    },
    {
        category: "Car Drift Behind",
        template: (subject: string) => ({
            photoPlacement: `${subject} standing empty street, unaware`,
            shockAction: `Sports car drifts sideways behind, tires smoking, inches from impact`,
            timing: "0-2s posing → 2-3s engine builds → 3-4s drift slide → cut at closest",
            physicsDetails: "Tire smoke fills background, wind blows clothes/hair, slight reaction",
            viralHook: "Bro didn't even notice 😭",
            viewsRange: "10-30M",
            difficulty: "Hard",
            estimatedTime: "15 mins + 10 post",
            postProcessing: "Tire screech + V10 rev, camera shake on pass"
        })
    },
    {
        category: "Lightning Strike Miss",
        template: (subject: string) => ({
            photoPlacement: `${subject} outdoors, normal lighting, calm`,
            shockAction: `Lightning bolt strikes ground 2 feet beside subject, blinding flash`,
            timing: "0-2s overcast calm → 2s rumble → 3s STRIKE → 4s smoke clears, shocked",
            physicsDetails: "Ground explosion, dirt particles, sparks, hair stands from static",
            viralHook: "God said NOT TODAY 😱",
            viewsRange: "15-40M",
            difficulty: "Medium",
            estimatedTime: "8 mins + 2 post",
            postProcessing: "Thunder crack (sync with flash), boost brightness on impact"
        })
    },
    {
        category: "Gas Station Fire",
        template: (subject: string) => ({
            photoPlacement: `${subject} near gas pump, standing normally`,
            shockAction: `Pump nozzle sparks, ignites ground fuel, flames race toward subject`,
            timing: "0-2s normal → 2s spark → 3-4s flames spread → 4s react/retreat",
            physicsDetails: "Ground fire spreads realistic pattern, subject drops items/stumbles",
            viralHook: "Final Destination unlocked 💀",
            viewsRange: "18-50M",
            difficulty: "Medium",
            estimatedTime: "12 mins + 5 post",
            postProcessing: "Metallic scrape (2s), fire whoosh (2.3s), bass drop (4.3s), heat distortion"
        })
    },
    {
        category: "Subway Train Near Miss",
        template: (subject: string) => ({
            photoPlacement: `${subject} on platform edge, distracted`,
            shockAction: `Express train barrels past 100mph, wind blows subject backward`,
            timing: "0-2s waiting → 2-3s rumble → 3-4s train BLASTS → 4s stumbles back",
            physicsDetails: "Wind tunnel, clothes/paper whip violently, covers face",
            viralHook: "NYC different 😭",
            viewsRange: "10-28M",
            difficulty: "Medium",
            estimatedTime: "10 mins + 5 post",
            postProcessing: "Metro rumble, intense wind whoosh, distorted announcement"
        })
    }
];

// ===== CHAOS SCENARIOS (COMPRESSED) =====
export const chaosScenarios = [
    {
        category: "Bodycam Comedy",
        template: (subject: string) => ({
            visualStyle: "Bodycam POV, fish-eye, shaky, REC overlay",
            chaosAction: `Police bodycam of traffic stop, but driver is ${subject} in business suit, presents tiny briefcase, negotiates with legal jargon`,
            viralHook: "POV: You pulled over a professional taco",
            difficulty: "Hard",
            estimatedTime: "25 mins",
            postProcessing: "Radio static, muffled dialogue"
        })
    },
    {
        category: "Character Role Swap",
        template: (subject: string) => ({
            visualStyle: "Cinematic, high-budget movie",
            chaosAction: `Darth Vader in flight attendant uniform, walking airplane aisle, demonstrating safety with ${subject}`,
            viralHook: "The Dark Side has snack service",
            difficulty: "Medium",
            estimatedTime: "15 mins",
            postProcessing: "Heavy breathing SFX"
        })
    },
    {
        category: "Sentient Interaction",
        template: (subject: string) => ({
            visualStyle: "Dreamcore, hazy, surreal",
            chaosAction: `Professional lawyer in 90s office, negotiating contract with ${subject}. ${subject} is sentient with small mustache`,
            viralHook: "My lawyer is a potato (and winning)",
            difficulty: "Hard",
            estimatedTime: "20 mins",
            postProcessing: "90s film grain, soft highlights"
        })
    },
    {
        category: "Wabi-Sabi Loop",
        template: (subject: string) => ({
            visualStyle: "Wabi-sabi aesthetic celebrating imperfection",
            chaosAction: `${subject} slowly breaking and repairing with liquid gold (Kintsugi), looping, beautiful flawed hypnotic`,
            viralHook: "Flaws are the feature",
            difficulty: "Medium",
            estimatedTime: "12 mins",
            postProcessing: "Slow motion, golden glow"
        })
    }
];

// ===== ANIME SCENARIOS (COMPRESSED) =====
export const animeScenarios = [
    {
        category: "Shonen Power Up",
        template: (subject: string) => ({
            photoPlacement: `${subject} standing resolute, fists clenched`,
            animeAction: `Glowing blue aura erupts, ground cracks beneath feet, hair floats, electrical sparks`,
            cameraWork: "Dutch angle looking up, shake on burst, radial speed lines",
            visualStyle: "MAPPA style, high contrast, vivid, cel-shaded",
            viralHook: "Domain Expansion 🤞",
            expectedViews: "5-15M",
            difficulty: "Medium",
            estimatedTime: "8 mins + 5 post",
            postProcessing: "Energy aura overlay, crank contrast/saturation"
        })
    },
    {
        category: "Sakuga Combat",
        template: (subject: string) => ({
            photoPlacement: `${subject} mid-air combat pose`,
            animeAction: `Devastating punch with impact frames (B&W flash), shockwave ripples air`,
            cameraWork: "Dynamic tracking, smash zoom on impact, motion blur",
            visualStyle: "Ufotable style, particle effects, fluid 2D",
            viralHook: "That animation budget 💸",
            expectedViews: "8-20M",
            difficulty: "Hard",
            estimatedTime: "15 mins + 5 post",
            postProcessing: "Impact sound/bass, flash white frame on hit"
        })
    },
    {
        category: "Slice of Life",
        template: (subject: string) => ({
            photoPlacement: `${subject} by window, soft rain outside`,
            animeAction: `Gently turns to camera, soft smile, hair sways in breeze, warm light hits dust motes`,
            cameraWork: "Static medium with subtle zoom, focus pull",
            visualStyle: "KyoAni style, soft edges, emotional lighting, detailed eyes",
            viralHook: "Main character energy ✨",
            expectedViews: "2-8M",
            difficulty: "Easy",
            estimatedTime: "5 mins + 2 post",
            postProcessing: "Lo-fi hip hop, soft glow"
        })
    }
];

// ===== CARTOON SCENARIOS (COMPRESSED) =====
export const cartoonScenarios = [
    {
        category: "Rubber Hose Dance",
        template: (subject: string) => ({
            photoPlacement: `${subject} as 1930s cartoon character`,
            cartoonAction: `Bouncy rhythmic dance, rubbery limbs, bouncing to beat`,
            cameraWork: "Static wide, slight film grain",
            visualStyle: "Fleischer style, B&W, pie-cut eyes",
            viralHook: "Vintage vibes 📺",
            expectedViews: "3-10M",
            difficulty: "Medium",
            estimatedTime: "10 mins + 3 post",
            postProcessing: "Film scratch overlay, ragtime piano"
        })
    },
    {
        category: "Saturday Morning Action",
        template: (subject: string) => ({
            photoPlacement: `${subject} running toward camera, determined`,
            cartoonAction: `Runs with speed lines, jumps obstacle with squash-stretch`,
            cameraWork: "Tracking low angle, fast",
            visualStyle: "90s X-Men style, bold outlines, flat shading",
            viralHook: "Nostalgia hit ⚡",
            expectedViews: "5-12M",
            difficulty: "Medium",
            estimatedTime: "8 mins + 2 post",
            postProcessing: "Rock guitar intro, boost vibrance"
        })
    }
];

// ===== STICKMAN SCENARIOS (COMPRESSED) =====
export const stickmanScenarios = [
    {
        category: "Parkour",
        template: (subject: string) => ({
            photoPlacement: `Black stick figure, white background`,
            stickmanAction: `Runs, wall-jumps off edge, backflips, lands superhero pose`,
            cameraWork: "Side scrolling, fluid follow",
            visualStyle: "Alan Becker style, minimalist, smooth",
            viralHook: "Parkour pro 🏃‍♂️",
            expectedViews: "10-25M",
            difficulty: "Hard",
            estimatedTime: "15 mins + 5 post",
            postProcessing: "Whoosh sounds for jumps"
        })
    },
    {
        category: "Epic Fight",
        template: (subject: string) => ({
            photoPlacement: `Two stick figures (Red vs Blue) facing off`,
            stickmanAction: `Red throws fireball, Blue Matrix-dodges and high kicks`,
            cameraWork: "Static wide for action clarity",
            visualStyle: "Xiao Xiao style, fast, simple impact lines",
            viralHook: "Top 10 Anime Battles ⚔️",
            expectedViews: "8-30M",
            difficulty: "Hard",
            estimatedTime: "12 mins + 5 post",
            postProcessing: "8-bit fight sounds, impact stars"
        })
    }
];

// ===== HOOK STYLES (Unchanged - already minimal) =====
export const VISUAL_HOOK_STYLES = [
    { name: "Mystery Reveal", description: "Obscured view, slow reveal unexpected" },
    { name: "Shock Freeze", description: "Freeze peak moment, fade to context" },
    { name: "POV Discovery", description: "First-person discovering unusual" },
    { name: "Impossible Scene", description: "Physically impossible opening" },
    { name: "Tension Build", description: "Slow zoom with building suspense" },
    { name: "Before/After Tease", description: "Show 'after' first, fade to setup" },
    { name: "Chaos Freeze", description: "Freeze mid-action, objects suspended" },
    { name: "Time Stop", description: "Everything frozen except one element" }
];

export const FADE_OUT_STYLES = [
    "Slow dissolve to white/black",
    "Zoom out with motion blur",
    "Freeze with vignette fade",
    "Objects defocus, camera pulls",
    "Light bloom consuming frame",
    "Quick whip pan transition",
    "Particles settling, scene changes",
    "Depth shift blurring hook"
];
