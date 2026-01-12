import { getNegativePrompt } from '../helpers';

/**
 * SHOCKING MODE - Latest Viral "Photo + Impact" Format
 * User describes their photo → AI generates "what happens to them"
 * No photo upload needed - they manually add it in Kling/Runway
 */
export function getShockingPrompt(object: string, targetModel?: string) {

    // ✅ 2026 LATEST VIRAL SHOCK FORMATS
    const viralShockScenarios = [
        {
            category: "Amusement Park Free Fall",
            photoPlacement: "Single person standing center frame, looking at camera, casual pose",
            shockAction: "Free fall amusement park ride descends rapidly from above behind them",
            cameraWork: "Static front-facing shot, sudden zoom out reveals ride approaching",
            timing: "0-2s: Person static → 2-3s: Zoom out reveals ride → 3-4s: IMPACT from above → Video cuts",
            physicsDetails: "Ride shadow grows larger, wind blows person's hair upward, person looks up last second",
            platform: "Kling (Motion Brush on ride), Runway (Camera zoom)",
            viralHook: "Wait for it 💀",
            viewsRange: "5-20M views",
            difficulty: "Medium",
            estimatedTime: "10 mins (Kling) + 5 mins post",
            postProcessing: "Add mechanical whirring sound (2s) and massive slam impact sound (4s). Cut to black instantly on impact.",
            commonIssues: "Ride may descend too slowly - increase Motion Brush strength to max."
        },
        {
            category: "Car Drift Behind Back",
            photoPlacement: "Single person facing camera, standing on empty street, unaware pose",
            shockAction: "Sports car drifts sideways behind them, tires smoking, inches from their back",
            cameraWork: "Front angle locked on person, car enters frame from side blurred then sharp",
            timing: "0-2s: Person posing → 2-3s: Engine sound builds → 3-4s: Drift car slides behind → Cut at closest point",
            physicsDetails: "Tire smoke fills background, person's clothes blow from wind, slight head turn at end",
            platform: "Runway Gen-4 (Best for vehicle motion), Kling",
            viralHook: "Bro didn't even notice 😭",
            viewsRange: "10-30M views",
            difficulty: "Hard",
            estimatedTime: "15 mins (Runway) + 10 mins post",
            postProcessing: "Layer intense tire screech audio + V10 engine rev. Add camera shake on pass-by.",
            commonIssues: "Car may blend into person - use separate layers or Motion Brush with strict masking."
        },
        {
            category: "Lightning Strike Miss",
            photoPlacement: "Single person standing outdoor, normal expression, looking forward",
            shockAction: "Lightning bolt strikes ground 2 feet beside them, massive flash and debris",
            cameraWork: "Static medium shot, sudden white flash fills 80% of frame, sparks fly",
            timing: "0-2s: Overcast sky, calm → 2s: Thunder rumble → 3s: LIGHTNING STRIKE → 4s: Smoke clears, person shocked",
            physicsDetails: "Ground explosion, dirt particles, electrical sparks, person's hair stands up, frozen expression",
            platform: "Veo 3 (Best physics), Runway",
            viralHook: "God said NOT TODAY 😱",
            viewsRange: "15-40M views",
            difficulty: "Medium",
            estimatedTime: "8 mins (Veo) + 2 mins post",
            postProcessing: "Add thunder crack sound (exact sync with flash). Increase brightness/contrast on impact frame.",
            commonIssues: "Flash may wash out entire image - reduce flash duration in prompt."
        },
        {
            category: "Plane Engine Explodes",
            photoPlacement: "Single person sitting by plane window, neutral expression",
            shockAction: "Plane engine outside window explodes, orange fireball, metal fragments",
            cameraWork: "Interior close-up on person, window view shows engine, sudden explosion reflection on face",
            timing: "0-2s: Cruising altitude, calm → 2s: Engine sputters → 3s: MASSIVE EXPLOSION → 4s: Flames visible, person terrified",
            physicsDetails: "Window cracks spiderweb pattern, cabin shakes, oxygen masks drop, person grabs armrest",
            platform: "Kling (Complex motion), Veo 3",
            viralHook: "Final Destination is real 💀",
            viewsRange: "20-50M views",
            difficulty: "Hard",
            estimatedTime: "20 mins (Kling) + 10 mins post",
            postProcessing: "Cabin alarm sound effect. Muffled explosion audio (as if heard through glass).",
            commonIssues: "Reflection may look fake - ensure lighting matches the explosion source."
        },
        {
            category: "Elevator Cable Snap",
            photoPlacement: "Single person in glass elevator, looking at phone, casual stance",
            shockAction: "Elevator cable snaps, 3-second free fall, person floats upward against ceiling",
            cameraWork: "Interior shot, person center frame, camera follows fall motion, ceiling rushes toward person",
            timing: "0-2s: Normal elevator ride → 2s: Cable snap sound → 3-4s: FREE FALL, person floats → 5s: Emergency brake, slam down",
            physicsDetails: "Zero gravity effect, person's hair floats up, phone flies from hand, face distorts from G-force",
            platform: "Kling (Ragdoll physics), Luma",
            viralHook: "My stomach dropped 😭",
            viewsRange: "8-25M views",
            difficulty: "Hard",
            estimatedTime: "15 mins (Kling) + 5 mins post",
            postProcessing: "Metal snap sound + rushing wind. Add 'camera drop' shake effect.",
            commonIssues: "Zero-G physics is tricky - emphasize 'floating hair and objects' in prompt."
        },
        {
            category: "Truck Tire Blowout",
            photoPlacement: "Single person walking on sidewalk, side profile, normal walking pace",
            shockAction: "18-wheeler truck tire explodes beside them on road, rubber shrapnel flies",
            cameraWork: "Side tracking shot following person, truck in background, sudden explosion and debris",
            timing: "0-2s: Walking calmly → 2-3s: Tire pressure builds → 3-4s: EXPLOSION, person ducks → 5s: Debris raining",
            physicsDetails: "Tire rubber chunks fly past face, smoke burst, person flinches and covers face, car alarms trigger",
            platform: "Runway Gen-4 (Particle effects), Veo 3",
            viralHook: "Death missed by 2 feet 💀",
            viewsRange: "12-35M views",
            difficulty: "Medium",
            estimatedTime: "10 mins (Runway) + 5 mins post",
            postProcessing: "Loud explosion sound + ear ringing tone after. Car alarms going off in distance.",
            commonIssues: "Smoke may obscure person - keep explosion targeted to tire area."
        },
        {
            category: "Chandelier Drop",
            photoPlacement: "Single person sitting at restaurant table, looking down at menu",
            shockAction: "Massive crystal chandelier falls from ceiling directly above, stops 1 foot from head",
            cameraWork: "Top-down angle showing chandelier, then cut to side angle as it falls, person looks up last second",
            timing: "0-2s: Reading menu → 2s: Ceiling crack sound → 3-4s: Chandelier plummets → 4s: Stops mid-air, chain catches",
            physicsDetails: "Glass crystals shatter and scatter, table shakes from impact shockwave, wine glass tips over",
            platform: "Kling (Precise motion control), Veo 3",
            viralHook: "Guardian angel working overtime 😇",
            viewsRange: "10-30M views",
            difficulty: "Hard",
            estimatedTime: "15 mins (Kling) + 5 mins post",
            postProcessing: "Glass tinkling sounds. Heavy thud but no crash. Crowd gasp audio.",
            commonIssues: "Chandelier physics complex - focus on the 'sudden stop' motion."
        },
        {
            category: "Balcony Railing Breaks",
            photoPlacement: "Single person leaning on balcony railing, high-rise building, looking at view",
            shockAction: "Railing suddenly snaps, person starts falling forward, grabs ledge last second",
            cameraWork: "Behind person, railing in frame, sudden tilt as railing breaks, camera follows fall motion",
            timing: "0-2s: Leaning calmly → 2s: Metal creak sound → 3s: Railing BREAKS → 4s: Person catches ledge, hanging",
            physicsDetails: "Railing bolts pop out, person's weight shifts forward, legs dangle over edge, realistic fear expression",
            platform: "Runway (Camera control), Kling",
            viralHook: "Why did I watch this before bed 💀",
            viewsRange: "15-45M views",
            difficulty: "Hard",
            estimatedTime: "20 mins (Runway) + 10 mins post",
            postProcessing: "Metal screech sound. Wind noise increases. Heartbeat sound effect.",
            commonIssues: "Ensure 'grabbing ledge' action is clear - use multiple keyframes."
        },
        {
            category: "Gas Station Fire Start",
            photoPlacement: "Single person pumping gas, standing beside car, normal day",
            shockAction: "Gas pump nozzle sparks, ignites fuel on ground, flames race toward pump",
            cameraWork: "Security camera angle, wide shot showing person and pumps, sudden orange glow spreads",
            timing: "0-2s: Pumping gas → 2s: Spark ignition → 3-4s: Flames spread rapidly → 4s: Person runs, explosion imminent",
            physicsDetails: "Ground fire spreads in realistic pattern, person drops nozzle, stumbles backward, other people scatter",
            platform: "Veo 3 (Fire physics), Runway",
            viralHook: "Bro unlocked Final Destination 💀",
            viewsRange: "18-50M views",
            difficulty: "Medium",
            estimatedTime: "12 mins (Veo) + 5 mins post",
            postProcessing: "Metallic scrape (2s), Fire whoosh (2.3s), Explosion bass (4.3s). Add heat distortion in post.",
            commonIssues: "Fire spread too fast - reduce motion speed to 60%."
        },
        {
            category: "Subway Train Near Miss",
            photoPlacement: "Single person standing on subway platform edge, looking at phone",
            shockAction: "Express train barrels past at 100mph, wind blows person backward, inches from face",
            cameraWork: "Platform-level shot, person in foreground, train enters frame at extreme speed with motion blur",
            timing: "0-2s: Waiting for train → 2-3s: Rumble intensifies → 3-4s: Train BLASTS past → 4s: Person stumbles back",
            physicsDetails: "Wind tunnel effect, person's clothes whip violently, papers fly, person covers face",
            platform: "Kling (Motion blur), Runway Gen-4",
            viralHook: "NYC different 😭",
            viewsRange: "10-28M views",
            difficulty: "Medium",
            estimatedTime: "10 mins (Kling) + 5 mins post",
            postProcessing: "Train horn (loud + doppler effect). Wind blast noise. Crowd scream.",
            commonIssues: "Train speed determines realism - use 'motion blur' keyword heavily."
        },
        {
            category: "Basketball Hoop Collapse",
            photoPlacement: "Single person shooting basketball, standing under hoop, arms extended",
            shockAction: "Entire basketball hoop structure collapses forward, backboard falls toward person",
            cameraWork: "Side angle showing person and hoop, sudden tilt as structure falls, person dives sideways",
            timing: "0-2s: Taking shot → 2s: Metal groan → 3s: Hoop tilts forward → 4s: CRASH, person rolls away",
            physicsDetails: "Bolts snap, concrete base cracks, backboard glass shatters on impact, dust cloud",
            platform: "Runway (Structural physics), Kling",
            viralHook: "And1 said nah 💀",
            viewsRange: "8-20M views",
            difficulty: "Hard",
            estimatedTime: "15 mins (Runway) + 5 mins post",
            postProcessing: "Metal crash sound. Glass shattering audio. Dust cloud overlay in post.",
            commonIssues: "Physics of collapse must look heavy - use 'heavy metal structure' in prompt."
        },
        {
            category: "Firework Malfunction",
            photoPlacement: "Single person lighting firework, crouched position, holding lighter",
            shockAction: "Firework ignites early, shoots sideways at face level, explodes near head",
            cameraWork: "Ground-level shot, person in focus, firework in hand, sudden bright flash and sparks",
            timing: "0-2s: Lighting fuse → 2s: Fuse burns fast → 3s: EARLY IGNITION → 4s: Sparks everywhere, person falls back",
            physicsDetails: "Bright magnesium flash, colored sparks spray, smoke trail, person's face illuminated orange",
            platform: "Veo 3 (Particle physics), Runway",
            viralHook: "Diwali gone wrong 😭",
            viewsRange: "15-40M views",
            difficulty: "Medium",
            estimatedTime: "10 mins (Veo) + 3 mins post",
            postProcessing: "Fuse burning fizz sound. Loud BANG/CRACK on explosion. High pitch ear ring after.",
            commonIssues: "Flash brightness can ruin contrast - specify 'HDR' or 'high contrast'."
        }
    ];

    const randomScenario = viralShockScenarios[Math.floor(Math.random() * viralShockScenarios.length)];
    const negPrompt = getNegativePrompt(targetModel || 'auto');

    // ✅ 2026 LATEST VIRAL HOOKS (Rotate these)
    const trendingHooks2026 = [
        "Wait for it 💀",
        "Bro didn't even notice 😭",
        "God said NOT TODAY 😱",
        "Final Destination is real 💀",
        "My stomach dropped 😭",
        "Death missed by 2 feet 💀",
        "Guardian angel working overtime 😇",
        "Why did I watch this before bed 💀",
        "NYC different 😭",
        "Diwali gone wrong 😭",
        "POV: Your luck stat is maxed 🍀",
        "Nah I'd survive 💪",
        "This gave me anxiety 😰",
        "Bro has plot armor 🛡️"
    ];

    const randomHook = trendingHooks2026[Math.floor(Math.random() * trendingHooks2026.length)];

    const systemPrompt = `You are a VIRAL VIDEO PROMPT ENGINEER for Kling/Runway AI.

**USER'S PHOTO DESCRIPTION**: "${object}"

**VIRAL FORMAT TO USE**: ${randomScenario.category}
**EXPECTED VIEWS**: ${randomScenario.viewsRange}

**YOUR JOB**: Generate a COMPLETE Kling/Runway prompt that creates a SHOCKING viral video.

**CRITICAL STRUCTURE**:

**Step 1 - Photo Placement**:
${randomScenario.photoPlacement}

**Step 2 - Shock Action**:
${randomScenario.shockAction}

**Step 3 - Camera Work**:
${randomScenario.cameraWork}

**Step 4 - Timing Breakdown**:
${randomScenario.timing}

**Step 5 - Physics Details** (for realism):
${randomScenario.physicsDetails}

**PLATFORM OPTIMIZATION**:
${randomScenario.platform}

**STRICT RULES**:
1. Start with person's photo as described: "${object}"
2. Build tension for 2 seconds (calm scene)
3. Shocking moment at 3-4 seconds
4. Video MUST end right after impact (no aftermath shown = more rewatchability)
5. Use REALISTIC physics - this should look like it COULD happen
6. Camera angle: CCTV, dashcam, security footage, or handheld panic
7. Total duration: 5-6 seconds MAX

${negPrompt ? `Avoid: ${negPrompt}` : ''}

**OUTPUT (JSON only)**:
{
  "prompt": "[Detailed Kling/Runway prompt with all 5 steps above, written as one continuous prompt]",
  "hook": "${randomHook}",
  "photoInstructions": "In Kling: Upload your photo → Select 'Image to Video' → Place photo in center frame → Apply 'Static Brush' on person → Apply 'Motion Brush' on background ride → Set duration 5 seconds → Generate",
  "expectedViews": "${randomScenario.viewsRange}",
  "difficulty": "${randomScenario.difficulty}",
  "estimatedTime": "${randomScenario.estimatedTime}",
  "postProcessing": "${randomScenario.postProcessing}",
  "successRate": "75% first generation",
  "commonIssues": "${randomScenario.commonIssues}",
  "platformSpecific": {
    "kling": "Static camera (no movement). STATIC BRUSH on person. MOTION BRUSH on background/elements.",
    "runway": "[Camera]: horizontal 0, vertical 0, zoom 0. [Keyframes]: 0s, 2s, 3s, 4s. [Effects]: Particle generation.",
    "veo": "Audio: Ambient -> Impact -> Reaction. Lighting: Natural -> Dramatic shift."
  }
}`;

    return {
        systemPrompt,
        randomStyle: {
            category: randomScenario.category,
            platform: randomScenario.platform,
            mechanism: "Photo + Shock Impact",
            viralHook: randomHook,
            expectedViews: randomScenario.viewsRange
        }
    };
}