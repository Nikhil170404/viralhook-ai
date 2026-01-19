import {
    getNegativePrompt,
    getKlingInstructions,
    getRunwayInstructions,
    getVeoInstructions,
    getCameraMovements,
    getLightingSetups,
    apply90sVintage,
    enhancePersonDescription
} from '../helpers';

/**
 * CINEMATIC MODE - Photo + Beautiful Scene
 * User's face becomes the MAIN CHARACTER in a cinematic moment
 */
export function getCinematicPrompt(object: string, targetModel?: string, personDescription?: string) {

    // Select Platform Instructions
    let platformInstructions = "";
    if (targetModel?.toLowerCase().includes("kling")) platformInstructions = getKlingInstructions();
    else if (targetModel?.toLowerCase().includes("runway")) platformInstructions = getRunwayInstructions();
    else if (targetModel?.toLowerCase().includes("veo")) platformInstructions = getVeoInstructions();
    else platformInstructions = getKlingInstructions() + "\n" + getRunwayInstructions();

    // Select Camera & Lighting helpers
    const cameraMoves = getCameraMovements();
    const lightSetups = getLightingSetups();

    // 🆕 PERSON INTEGRATION LOGIC
    let subjectDescription = "A person";

    if (personDescription) {
        // Clean and enhance the description
        subjectDescription = enhancePersonDescription(personDescription);
    }

    const cinematicScenarios = [
        {
            category: "Main Character Moment",
            photoPlacement: personDescription
                ? `${subjectDescription} centered in frame, confident expression, slight wind movement.`
                : `Single ${object} centered in frame, confident expression, slight wind movement.`,
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
        },
        {
            category: "South Indian Mass Entry",
            photoPlacement: personDescription
                ? `${subjectDescription} standing in silhouette against a massive dust storm, back turned then slowly turning.`
                : `The ${object} standing in silhouette against a massive dust storm, back turned then slowly turning.`,
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
        },
        {
            category: "Royal Rajasthani Aesthetic",
            photoPlacement: personDescription
                ? `${subjectDescription} framed by an intricate sandstone Jharokha (archway), bathed in golden light.`
                : `The ${object} framed by an intricate sandstone Jharokha (archway), bathed in golden light.`,
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
        },
        {
            category: "Bollywood Romance",
            photoPlacement: personDescription
                ? `${subjectDescription} in a vast mustard field, traditional vibe, looking into distance.`
                : `The ${object} in a vast mustard field, traditional vibe, looking into distance.`,
            cinematicAction: "360-degree orbit camera, rose petals falling, warm 90s golden glow.",
            cameraWork: "Crane up revealing vast landscape, Pro-Mist diffusion filter",
            mood: "Romantic, nostalgic, 90s Bollywood vibes",
            platform: "Kling (Orbit motion), Veo 3",
            viralHook: "Udit Narayan in my head 🎵",
            aesthetic: "Kodak 500T film, 3200K warmth",
            expectedViews: "5-10M views",
            difficulty: "Medium",
            estimatedTime: "8 mins (Kling) + 5 mins post",
            postProcessing: "Add 90s soft focus effect (Pro-Mist). Sync with romantic Bollywood track.",
            commonIssues: "Orbit camera moves can distort faces - use 'slow orbit' keyword."
        },
        {
            category: "Anime Protagonist",
            photoPlacement: personDescription
                ? `${subjectDescription} in a dramatic pose, hair flowing against gravity, intense stare.`
                : `The ${object} in a dramatic pose, hair flowing against gravity, intense stare.`,
            cinematicAction: "Energy particle effects swirl around the subject, glowing aura expands, lightning strikes background.",
            cameraWork: "Low angle hero shot, Dutch angle, dramatic sky",
            mood: "Power-up moment, transformation scene",
            platform: "Runway Gen-4 (Effects), Luma",
            viralHook: "Domain Expansion vibes 💫",
            aesthetic: "Anime cinematography, high saturation, cel-shaded lighting",
            expectedViews: "3-8M views",
            difficulty: "Hard",
            estimatedTime: "15 mins (Runway) + 20 mins post",
            postProcessing: "Overlay anime speed lines. Add impact frames (black/white flash).",
            commonIssues: "AI struggles with specific anime effects - use general terms like 'energy aura'."
        },
        {
            category: "Cyberpunk Edge",
            photoPlacement: personDescription
                ? `${subjectDescription} in a neon city alley at night, rain reflection on surface.`
                : `The ${object} in a neon city alley at night, rain reflection on surface.`,
            cinematicAction: "Neon lights flicker on the subject, holographic signs glitch in background, steam rises.",
            cameraWork: "Tracking shot from side, wet pavement reflections, anamorphic flares",
            mood: "Edgy, futuristic, high-tech, cool",
            platform: "Kling AI, Runway Gen-3",
            viralHook: "Night City Legend 🌃",
            aesthetic: "Blade Runner style, teal and orange, neon noir",
            expectedViews: "4-9M views",
            difficulty: "Medium",
            estimatedTime: "10 mins (Kling) + 10 mins post",
            postProcessing: "Add glitch sound effects. Boost neon saturation. Add rain overlay.",
            commonIssues: "Neon light bleed can be messy - specify 'soft neon lighting'."
        },
        {
            category: "Fashion Editorial",
            photoPlacement: personDescription
                ? `${subjectDescription} in a high-fashion pose, clean background, fierce energy.`
                : `The ${object} in a high-fashion pose, clean background, fierce energy.`,
            cinematicAction: "Strobe light flashes rapidly, confetti explosion, wind machine effect on subject.",
            cameraWork: "Rapid zoom in and out, Dutch angles, dynamic rotation",
            mood: "Confident, powerful, runway energy",
            platform: "Runway Gen-4, Kling",
            viralHook: "ATE and left NO crumbs 💅",
            aesthetic: "High fashion photography, Vogue-style, studio lighting",
            expectedViews: "1-5M views",
            difficulty: "Easy",
            estimatedTime: "5 mins (Runway) + 5 mins post",
            postProcessing: "Fast rhythmic cuts to music beat. Flash transition effects.",
            commonIssues: "Rapid zoom can cause motion sickness - keep it controlled."
        },
        {
            category: "Dream Sequence",
            photoPlacement: personDescription
                ? `${subjectDescription} floating in a surreal cloudscape, peaceful atmosphere.`
                : `The ${object} floating in a surreal cloudscape, peaceful atmosphere.`,
            cinematicAction: "Clouds moving fast in background, subject levitating slightly, soft ethereal glow.",
            cameraWork: "Top-down spinning shot, slow motion, smooth camera",
            mood: "Surreal, peaceful, magical",
            platform: "Luma Dream Machine",
            viralHook: "Is this real life? ☁️",
            aesthetic: "Pastel colors, soft focus, dreamy",
            expectedViews: "2-6M views",
            difficulty: "Medium",
            estimatedTime: "8 mins (Luma) + 5 mins post",
            postProcessing: "Add reverb to audio. Slow down footage to 50% for extra smoothness.",
            commonIssues: "Levitation physics can look stiff - use 'weightless' keyword."
        }
    ];

    const randomScene = cinematicScenarios[Math.floor(Math.random() * cinematicScenarios.length)];
    const negPrompt = getNegativePrompt(targetModel || 'auto');

    // Add vintage instructions if Bollywood style
    const vintageInstructions = randomScene.category.includes("Bollywood") ? apply90sVintage() : "";

    const systemPrompt = `You are a HOLLYWOOD CINEMATOGRAPHER creating a viral cinematic video.

**INPUT SUBJECT**: "${object}"
${personDescription ? `**PERSON IN SCENE**: ${subjectDescription}` : ''}

**CINEMATIC STYLE**: ${randomScene.category}
**MOOD**: ${randomScene.mood}
**AESTHETIC**: ${randomScene.aesthetic}

**PLATFORM OPTIMIZATION**:
${platformInstructions}

**CINEMATOGRAPHY TOOLS**:
Use terms from this library if applicable:
${cameraMoves}
${lightSetups}

${vintageInstructions ? `**SPECIAL EFFECTS**:\n${vintageInstructions}` : ''}

**TASK Structure**:

**Step 1 - Subject Placement**:
${randomScene.photoPlacement}

**Step 2 - Cinematic Action**:
${randomScene.cinematicAction}
(Ensure the action interacts with the ${personDescription ? "person" : "object"} naturally)

**Step 3 - Camera Work**:
${randomScene.cameraWork}

**FEW-SHOT EXAMPLES (LEARN FROM THESE)**:

✅ **GOOD OUTPUT (Detailed + Professional)**:
{
  "prompt": "A traditional clay diya lamp (Subject) framed by a sandstone archway. Lighting: Golden hour backlighting creating a halo effect, with volumetric dust motes dancing in the god rays. Camera: Slow dolly push-in through the arch. Action: Soft curtains blow gently in the wind revealing the lamp. Style: Rajasthani Royal aesthetic, warm saffron tones, high contrast. Platform: Veo 3 4K.",
  "hook": "Royalty vibes 👑"
}

❌ **BAD OUTPUT (Generic)**:
{
  "prompt": "A lamp in an archway with nice lighting.",
  "hook": "Cool vibes"
}

**RULES**:
1. ${personDescription ? `The person MUST match this description: ${subjectDescription}` : `Make the "${object}" look AMAZING - this is about beauty, not shock.`}
2. Use professional cinematography techniques.
3. Duration: 5-8 seconds.
4. Focus on: lighting, camera movement, atmosphere.
5. NO chaos, NO disasters, PURE CINEMA.

${negPrompt ? `Avoid: ${negPrompt}` : ''}

**OUTPUT (JSON only)**:
{
  "prompt": "[Complete cinematic prompt covering placement, action, and camera work]",
  "hook": "${randomScene.viralHook}",
  "personNote": "${personDescription ? 'Custom character included' : 'Generic character'}",
  "photoInstructions": "Upload photo of ${object} -> Place in center -> Apply 'Cinematic' style -> Use 'Medium' motion bucket",
  "expectedViews": "${randomScene.expectedViews}",
  "difficulty": "${randomScene.difficulty}",
  "estimatedTime": "${randomScene.estimatedTime}",
  "postProcessing": "${randomScene.postProcessing}",
  "successRate": "85% first generation",
  "commonIssues": "${randomScene.commonIssues}",
  "platformSpecific": {
     "kling": "Professional Lighting, High Fidelity mode.",
     "runway": "Cinematic preset, 24fps.",
     "veo": "Photorealistic, 4k resolution."
  }
}`;

    return {
        systemPrompt,
        randomStyle: {
            category: randomScene.category,
            platform: randomScene.platform,
            mechanism: "Cinematic Beauty",
            viralHook: randomScene.viralHook,
            expectedViews: randomScene.expectedViews
        }
    };
}