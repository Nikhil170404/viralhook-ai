import { getNegativePrompt } from '../helpers';

/**
 * CINEMATIC MODE - Photo + Beautiful Scene
 * User's face becomes the MAIN CHARACTER in a cinematic moment
 */
export function getCinematicPrompt(object: string, targetModel?: string) {

    const cinematicScenarios = [
        {
            category: "Main Character Moment",
            photoPlacement: "Single person center frame, confident expression, slight wind in hair",
            cinematicAction: "Slow motion, dramatic lighting change from dark to golden hour, lens flares",
            cameraWork: "Slow dolly push-in, shallow depth of field, background bokeh",
            mood: "Heroic, empowering, 'that's the moment they became the protagonist'",
            platform: "Veo 3 (Photorealism), Runway Gen-4",
            viralHook: "Every frame is a painting 🎬",
            aesthetic: "Nolan-style blockbuster",
            expectedViews: "2-5M views",
            difficulty: "Easy",
            estimatedTime: "5 mins (Veo) + 3 mins post",
            postProcessing: "Color grade: Teal shadows, Orange highlights. Add 'Interstellar' style soundtrack.",
            commonIssues: "Face consistency can drop in wide shots - keep camera close."
        },
        {
            category: "Bollywood Romance",
            photoPlacement: "Single person in mustard field, traditional outfit, looking into distance",
            cinematicAction: "360-degree orbit camera, petals falling, warm golden glow",
            cameraWork: "Crane up revealing vast landscape, Pro-Mist diffusion filter",
            mood: "Romantic, nostalgic, 90s Bollywood vibes",
            platform: "Kling (Orbit motion), Veo 3",
            viralHook: "Udit Narayan in my head 🎵",
            aesthetic: "Kodak 500T film, 3200K warmth",
            expectedViews: "5-10M views",
            difficulty: "Medium",
            estimatedTime: "8 mins (Kling) + 5 mins post",
            postProcessing: "Add 90s soft focus effect. Sync with romantic Bollywood track.",
            commonIssues: "Orbit camera moves can distort faces - use 'slow orbit' keyword."
        },
        {
            category: "Anime Protagonist",
            photoPlacement: "Single person dramatic pose, hair flowing, intense stare",
            cinematicAction: "Particle effects swirl around person, aura glow expands",
            cameraWork: "Low angle hero shot, dramatic sky, lightning in background",
            mood: "Power-up moment, transformation scene",
            platform: "Runway Gen-4 (Effects), Luma",
            viralHook: "Domain Expansion vibes 💫",
            aesthetic: "Anime cinematography, oversaturated",
            expectedViews: "3-8M views",
            difficulty: "Hard",
            estimatedTime: "15 mins (Runway) + 20 mins post",
            postProcessing: "Overlay anime speed lines. Add impact frames (black/white flash).",
            commonIssues: "AI struggles with specific anime effects - use general terms like 'energy aura'."
        },
        {
            category: "Cyberpunk Edge",
            photoPlacement: "Single person in neon city alley, rain reflection, serious look",
            cinematicAction: "Neon lights flicker on face, holographic signs glitch in background",
            cameraWork: "Tracking shot from side, wet pavement reflections, anamorphic flares",
            mood: "Edgy, futuristic, high-tech, cool",
            platform: "Kling AI, Runway Gen-3",
            viralHook: "Night City Legend 🌃",
            aesthetic: "Blade Runner style, teal and orange",
            expectedViews: "4-9M views",
            difficulty: "Medium",
            estimatedTime: "10 mins (Kling) + 10 mins post",
            postProcessing: "Add glitch sound effects. Boost neon saturation. Add rain overlay.",
            commonIssues: "Neon light bleed on face - specify 'soft neon lighting' in prompt."
        },
        {
            category: "Fashion Editorial",
            photoPlacement: "Single person in designer outfit, fierce expression, high fashion pose",
            cinematicAction: "Strobe light flashes, confetti explosion, smoke machines",
            cameraWork: "Rapid zoom in and out, Dutch angles, dynamic rotation",
            mood: "Confident, powerful, runway energy",
            platform: "Runway Gen-4, Kling",
            viralHook: "ATE and left NO crumbs 💅",
            aesthetic: "High fashion photography, Vogue-style",
            expectedViews: "1-5M views",
            difficulty: "Easy",
            estimatedTime: "5 mins (Runway) + 5 mins post",
            postProcessing: "Fast rhythmic cuts to music beat. Flash transition effects.",
            commonIssues: "Rapid zoom can cause motion sickness - keep it controlled."
        },
        {
            category: "Dream Sequence",
            photoPlacement: "Single person floating or lying down, peaceful expression",
            cinematicAction: "Clouds moving fast in background, person levitating slightly, soft glow",
            cameraWork: "Top-down spinning shot, slow motion, ethereal movement",
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

    const systemPrompt = `You are a HOLLYWOOD CINEMATOGRAPHER creating a viral cinematic video.

**USER'S PHOTO**: "${object}"

**CINEMATIC STYLE**: ${randomScene.category}
**MOOD**: ${randomScene.mood}
**AESTHETIC**: ${randomScene.aesthetic}

**STRUCTURE**:

**Step 1 - Photo Placement**:
${randomScene.photoPlacement}

**Step 2 - Cinematic Action**:
${randomScene.cinematicAction}

**Step 3 - Camera Work**:
${randomScene.cameraWork}

**RULES**:
1. Make the person look AMAZING - this is about beauty, not shock
2. Use professional cinematography techniques
3. Duration: 5-8 seconds
4. Focus on: lighting, camera movement, atmosphere
5. NO chaos, NO disasters, PURE CINEMA

${negPrompt ? `Avoid: ${negPrompt}` : ''}

**OUTPUT (JSON only)**:
{
  "prompt": "[Complete cinematic prompt with camera, lighting, and action details]",
  "hook": "${randomScene.viralHook}",
  "photoInstructions": "Upload photo -> Place in center -> Apply 'Cinematic' style -> Use 'Medium' motion bucket",
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