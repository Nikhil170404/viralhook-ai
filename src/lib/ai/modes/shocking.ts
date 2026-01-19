import {
    getNegativePrompt,
    getKlingInstructions,
    getRunwayInstructions,
    getVeoInstructions,
    getPhysicsKeywords,
    enhancePersonDescription
} from '../helpers';

/**
 * SHOCKING MODE - Latest Viral "Photo + Impact" Format
 * User describes their photo → AI generates "what happens to them"
 * No photo upload needed - they manually add it in Kling/Runway
 */
export function getShockingPrompt(object: string, targetModel?: string, personDescription?: string) {

    // Select Platform Instructions
    let platformInstructions = "";
    if (targetModel?.toLowerCase().includes("kling")) platformInstructions = getKlingInstructions();
    else if (targetModel?.toLowerCase().includes("runway")) platformInstructions = getRunwayInstructions();
    else if (targetModel?.toLowerCase().includes("veo")) platformInstructions = getVeoInstructions();
    else platformInstructions = getKlingInstructions() + "\n" + getRunwayInstructions();

    // 🆕 PERSON INTEGRATION LOGIC
    let subjectDescription = "A person";

    if (personDescription) {
        // Clean and enhance the description
        subjectDescription = enhancePersonDescription(personDescription);
    }

    // ✅ 2026 LATEST VIRAL SHOCK FORMATS
    // Refactored to integrate "object" into descriptions dynamically
    const viralShockScenarios = [
        {
            category: "Amusement Park Free Fall",
            photoPlacement: personDescription
                ? `${subjectDescription} positioned center frame, looking calm/casual.`
                : `Single ${object} positioned center frame, looking calm/casual.`,
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
        },
        {
            category: "Car Drift Behind Back",
            photoPlacement: personDescription
                ? `${subjectDescription} standing on an empty street, unaware of surroundings.`
                : `Single ${object} standing on an empty street, unaware of surroundings.`,
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
        },
        {
            category: "Lightning Strike Miss",
            photoPlacement: personDescription
                ? `${subjectDescription} outdoors, normal lighting, calm atmosphere.`
                : `Single ${object} outdoors, normal lighting, calm atmosphere.`,
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
        },
        {
            category: "Plane Engine Explodes",
            photoPlacement: personDescription
                ? `${subjectDescription} near a window (implied plane interior), neutral expression.`
                : `Single ${object} near a window (implied plane interior), neutral expression.`,
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
        },
        {
            category: "Elevator Cable Snap",
            photoPlacement: personDescription
                ? `${subjectDescription} inside a glass elevator, casual stance.`
                : `Single ${object} inside a glass elevator, casual stance.`,
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
        },
        {
            category: "Truck Tire Blowout",
            photoPlacement: personDescription
                ? `${subjectDescription} on a sidewalk, side profile, normal environment.`
                : `Single ${object} on a sidewalk, side profile, normal environment.`,
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
        },
        {
            category: "Chandelier Drop",
            photoPlacement: personDescription
                ? `${subjectDescription} indoors (restaurant/hall), looking down or away.`
                : `Single ${object} indoors (restaurant/hall), looking down or away.`,
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
        },
        {
            category: "Balcony Railing Breaks",
            photoPlacement: personDescription
                ? `${subjectDescription} leaning on a high-rise balcony railing, looking at view.`
                : `Single ${object} leaning on a high-rise balcony railing, looking at view.`,
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
        },
        {
            category: "Gas Station Fire Start",
            photoPlacement: personDescription
                ? `${subjectDescription} near a gas pump, standing normally.`
                : `Single ${object} near a gas pump, standing normally.`,
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
        },
        {
            category: "Subway Train Near Miss",
            photoPlacement: personDescription
                ? `${subjectDescription} on subway platform edge, distracted.`
                : `Single ${object} on subway platform edge, distracted.`,
            shockAction: `An express train barrels past at 100mph, wind blows the subject backward inches from the face.`,
            cameraWork: "Platform-level shot, subject in foreground, train enters frame at extreme speed with motion blur",
            timing: "0-2s: Waiting → 2-3s: Rumble intensifies → 3-4s: Train BLASTS past → 4s: Subject stumbles back",
            physicsDetails: "Wind tunnel effect, clothes/paper whip violently, subject covers face",
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
            photoPlacement: personDescription
                ? `${subjectDescription} under a basketball hoop.`
                : `Single ${object} under a basketball hoop.`,
            shockAction: `The entire basketball hoop structure collapses forward, backboard falling toward the subject.`,
            cameraWork: "Side angle showing subject and hoop, sudden tilt as structure falls, subject dives",
            timing: "0-2s: Normal scene → 2s: Metal groan → 3s: Hoop tilts forward → 4s: CRASH, subject rolls away",
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
            photoPlacement: personDescription
                ? `${subjectDescription} near a firework setup, lighting a fuse.`
                : `Single ${object} near a firework setup, lighting a fuse.`,
            shockAction: `The firework ignites early, shooting sideways at face level, exploding near the subject.`,
            cameraWork: "Ground-level shot, subject in focus, firework in foreground, sudden bright flash",
            timing: "0-2s: Lighting fuse → 2s: Fuse burns fast → 3s: EARLY IGNITION → 4s: Sparks fly, subject falls back",
            physicsDetails: "Bright magnesium flash, colored sparks spray, smoke trail, bright illumination on subject",
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

    // ✅ 2026 LATEST VIRAL HOOKS
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

**INPUT SUBJECT**: "${object}"
${personDescription ? `**PERSON IN SCENE**: ${subjectDescription}` : ''}

**VIRAL FORMAT**: ${randomScenario.category}
**EXPECTED VIEWS**: ${randomScenario.viewsRange}

**PLATFORM INSTRUCTIONS**:
${platformInstructions}

**PHYSICS VOCABULARY**:
${getPhysicsKeywords()}
(Use 'Impact', 'Debris', and 'Motion' keywords effectively)

**TASK**:
Generate a COMPLETE Kling/Runway prompt that creates a SHOCKING viral video featuring the "${object}".

**CRITICAL STRUCTURE**:

**Step 1 - Subject Placement**:
${randomScenario.photoPlacement}

**Step 2 - Shock Action**:
${randomScenario.shockAction}

**Step 3 - Camera Work**:
${randomScenario.cameraWork}

**Step 4 - Timing Breakdown**:
${randomScenario.timing}

**Step 5 - Physics Details** (for realism):
${randomScenario.physicsDetails}

**FEW-SHOT EXAMPLES (LEARN FROM THESE)**:

✅ **GOOD OUTPUT (Precise Timing + Details)**:
{
  "prompt": "A delivery drone (Subject) hovering at front door. Camera: CCTV high angle. Action: Drone battery explodes. Timing: 0-2s hover, 2s spark, 3s EXPLOSION fireball, 4s debris hits lens. Physics: 'Thermal bloom', 'Shockwave', 'Plastic fragmentation'. Duration: 5s. Platform: Kling Motion Brush on explosion. Audio: Rotor hum -> Pop -> Boom.",
  "hook": "No tip today 💀"
}

❌ **BAD OUTPUT (Generic)**:
{
  "prompt": "The drone explodes loudly.",
  "hook": "Scary"
}

**STRICT RULES**:
1. Start with the subject: "${object}"
2. Build tension for 2 seconds (calm scene)
3. Shocking moment at 3-4 seconds
4. Video MUST end right after impact (no aftermath shown = more rewatchability)
5. Use REALISTIC physics - this should look like it COULD happen
6. Camera angle: CCTV, dashcam, security footage, or handheld panic
7. Total duration: 5-6 seconds MAX
8. ${personDescription ? `The person MUST match this description: ${subjectDescription}` : ''}

${negPrompt ? `Avoid: ${negPrompt}` : ''}

**OUTPUT (JSON only)**:
{
  "prompt": "[Detailed prompt incorporating all steps and strict rules above]",
  "hook": "${randomHook}",
  "personNote": "${personDescription ? 'Custom character included' : 'Generic character'}",
  "photoInstructions": "In Kling: Upload photo of ${object} → Select 'Image to Video' → Place in center → Apply 'Static Brush' on subject → Apply 'Motion Brush' on background hazard → Set duration 5s",
  "expectedViews": "${randomScenario.viewsRange}",
  "difficulty": "${randomScenario.difficulty}",
  "estimatedTime": "${randomScenario.estimatedTime}",
  "postProcessing": "${randomScenario.postProcessing}",
  "successRate": "75% first generation",
  "commonIssues": "${randomScenario.commonIssues}",
  "platformSpecific": {
    "kling": "Static camera (no movement). STATIC BRUSH on subject. MOTION BRUSH on background.",
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