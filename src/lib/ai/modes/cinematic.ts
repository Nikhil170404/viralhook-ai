import {
    getNegativePrompt,
    getKlingInstructions,
    getRunwayInstructions,
    getVeoInstructions,
    getCameraMovements,
    getLightingSetups,
    apply90sVintage
} from '../helpers';

/**
 * CINEMATIC MODE - Photo + Beautiful Scene
 * User's face becomes the MAIN CHARACTER in a cinematic moment
 */
export function getCinematicPrompt(object: string, targetModel?: string) {

    // Select Platform Instructions
    let platformInstructions = "";
    if (targetModel?.toLowerCase().includes("kling")) platformInstructions = getKlingInstructions();
    else if (targetModel?.toLowerCase().includes("runway")) platformInstructions = getRunwayInstructions();
    else if (targetModel?.toLowerCase().includes("veo")) platformInstructions = getVeoInstructions();
    else platformInstructions = getKlingInstructions() + "\n" + getRunwayInstructions();

    // Select Camera & Lighting helpers
    const cameraMoves = getCameraMovements();
    const lightSetups = getLightingSetups();

    const cinematicScenarios = [
        {
            category: "Main Character Moment",
            photoPlacement: `Single ${object} centered in frame, confident expression, slight wind movement.`,
            cinematicAction: `Slow motion, dramatic lighting change from dark to golden hour, anamorphic lens flares hitting the ${object}.`,
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
            category: "Bollywood Romance",
            photoPlacement: `The ${object} in a vast mustard field, traditional vibe, looking into distance.`,
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
            photoPlacement: `The ${object} in a dramatic pose, hair flowing against gravity, intense stare.`,
            cinematicAction: "Energy particle effects swirl around the ${object}, glowing aura expands, lightning strikes background.",
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
            photoPlacement: `The ${object} in a neon city alley at night, rain reflection on surface.`,
            cinematicAction: "Neon lights flicker on the ${object}, holographic signs glitch in background, steam rises.",
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
            photoPlacement: `The ${object} in a high-fashion pose, clean background, fierce energy.`,
            cinematicAction: "Strobe light flashes rapidly, confetti explosion, wind machine effect on ${object}.",
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
            photoPlacement: `The ${object} floating in a surreal cloudscape, peaceful atmosphere.`,
            cinematicAction: "Clouds moving fast in background, ${object} levitating slightly, soft ethereal glow.",
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
(Ensure the action interacts with the "${object}" naturally)

**Step 3 - Camera Work**:
${randomScene.cameraWork}

**RULES**:
1. Make the "${object}" look AMAZING - this is about beauty, not shock.
2. Use professional cinematography techniques.
3. Duration: 5-8 seconds.
4. Focus on: lighting, camera movement, atmosphere.
5. NO chaos, NO disasters, PURE CINEMA.

${negPrompt ? `Avoid: ${negPrompt}` : ''}

**OUTPUT (JSON only)**:
{
  "prompt": "[Complete cinematic prompt covering placement, action, and camera work]",
  "hook": "${randomScene.viralHook}",
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