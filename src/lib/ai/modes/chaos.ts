import {
    getNegativePrompt,
    getKlingInstructions,
    getRunwayInstructions,
    getVeoInstructions,
    getPhysicsKeywords,
    applyVHSEffect,
    getGlitchKeywords
} from '../helpers';

/**
 * CHAOS MODE - Maximum Virality, Glitch, and Physics Breaking
 * Optimized for "Wait what just happened?" reactions
 */
export function getChaosPrompt(object: string, targetModel?: string) {

    // Select Platform Instructions
    let platformInstructions = "";
    if (targetModel?.toLowerCase().includes("kling")) platformInstructions = getKlingInstructions();
    else if (targetModel?.toLowerCase().includes("runway")) platformInstructions = getRunwayInstructions();
    else if (targetModel?.toLowerCase().includes("veo")) platformInstructions = getVeoInstructions();
    else platformInstructions = getKlingInstructions() + "\n" + getRunwayInstructions();

    // ✅ 2026 LATEST CHAOS TRENDS (Expanded to 6 scenarios)
    const chaosScenarios = [
        {
            category: "Physics Break",
            chaosAction: `The ${object} suddenly turns into liquid mercury, splashes upward against gravity, then evaporates into floating geometric pyramids.`,
            visualStyle: "Datamoshing, glitch texture, RGB split, liquid simulation",
            viralHook: "My brain.exe stopped working 🧠",
            platform: "Kling (High motion)",
            difficulty: "Hard",
            estimatedTime: "10 mins (Kling) + 10 mins post",
            postProcessing: "Add glitch sound effects. Maximize saturation.",
            commonIssues: "Video might look like noise - keep subject recognizable for first 2 seconds."
        },
        {
            category: "Mumbai Traffic Chaos",
            chaosAction: `The ${object} is stuck in a Mumbai traffic jam where rickshaws are flying in zero gravity and cows are walking vertically on walls.`,
            visualStyle: "Surrealism, saturated colors, chaotic motion, fisheye lens",
            viralHook: "Average day in Mumbai 🇮🇳",
            platform: "Runway Gen-4",
            difficulty: "Medium",
            estimatedTime: "10 mins (Runway) + 5 mins post",
            postProcessing: "Add traffic honking audio but distorted. Speed up footage 2x.",
            commonIssues: "Too many objects can crash the generation - focus on 3-4 main elements."
        },
        {
            category: "Scale Manipulation",
            chaosAction: `A tiny version of the ${object} is targeted by a giant hand, but then the ${object} suddenly grows 100x size and consumes the hand.`,
            visualStyle: "Fisheye lens, forced perspective, macro photography",
            viralHook: "Uno Reverse Card 🔄",
            platform: "Veo 3",
            difficulty: "Hard",
            estimatedTime: "15 mins (Veo) + 5 mins post",
            postProcessing: "Add cartoon chomping sounds. Screen shake on 'eating' moment.",
            commonIssues: "Scale consistency is hard - use 'macro photography' keyword."
        },
        {
            category: "Digital Meltdown",
            chaosAction: `The ${object} starts pixelating, then the entire world behind it dissolves into green binary code matrix rain and Windows XP error popups.`,
            visualStyle: "Cyberpunk, glitch art, VHS static, CRT monitor effect",
            viralHook: "Simulation Glitch 👾",
            platform: "Kling AI",
            difficulty: "Medium",
            estimatedTime: "8 mins (Kling) + 5 mins post",
            postProcessing: "Overlay Windows XP error sounds. Add CRT monitor filter.",
            commonIssues: "Text renders poorly - focus on binary 'rain' visuals."
        },
        {
            category: "AI Hallucination Loop",
            chaosAction: `The ${object} continuously morphs into different related objects every 0.5 seconds (e.g., Cat -> Tiger -> Bread -> Cloud -> Cat) in a seamless, dream-like loop.`,
            visualStyle: "DeepDream aesthetic, morphing, surrealism, fluid transitions",
            viralHook: "Don't watch this while high 🍄",
            platform: "Luma (Loop mode)",
            difficulty: "Hard",
            estimatedTime: "12 mins (Luma) + 5 mins post",
            postProcessing: "Add psychedelic trance music. Loop the video perfectly.",
            commonIssues: "Morphing can look ugly - use 'smooth transition' keyword."
        },
        {
            category: "Frozen Time Glitch",
            chaosAction: `Time freezes for the background, but the ${object} continues moving at 10x speed, vibrating and leaving 'ghost' trails behind it.`,
            visualStyle: "Long exposure light trails, motion after-image, ghosting effect",
            viralHook: "Ping: 999ms 🔴",
            platform: "Runway Gen-4 (Motion Brush)",
            difficulty: "Medium",
            estimatedTime: "8 mins (Runway) + 3 mins post",
            postProcessing: "Add dial-up internet sound. Add lag/buffering icon overlay.",
            commonIssues: "If background moves, the effect fails. 'Static Brush' is mandatory."
        }
    ];

    const randomChaos = chaosScenarios[Math.floor(Math.random() * chaosScenarios.length)];
    const negPrompt = getNegativePrompt(targetModel || 'auto');

    // Add VHS effect if specific style
    const vhsInstructions = randomChaos.visualStyle.includes("VHS") ? applyVHSEffect() : "";

    const systemPrompt = `You are a CHAOS AGENT for Viral Video AI.

**OBJECT INPUT**: "${object}"
**SELECTED STYLE**: ${randomChaos.category}

**PLATFORM INSTRUCTIONS**:
${platformInstructions}

**PHYSICS/GLITCH VOCABULARY**:
${getPhysicsKeywords()}
(Use 'Physics Breakdown' and 'Glitch' categories specifically)

**GLITCH KEYWORDS**:
${getGlitchKeywords()}

${vhsInstructions ? `**VHS EFFECTS**:\n${vhsInstructions}` : ''}

**TASK**:
Generate a specific viral video prompt where the "${object}" is the central element.
Integrate the object naturally into the following action:
"${randomChaos.chaosAction}"

**VISUAL STYLE**:
${randomChaos.visualStyle}

**FEW-SHOT EXAMPLES (LEARN FROM THESE)**:

✅ **GOOD OUTPUT (Platform-Specific + Detailed)**:
{
  "prompt": "A rusted 1998 Toyota Corolla (Subject) melting into liquid chrome puddle on the asphalt. Physics: 'Viscosity', 'Fluid Simulation'. The liquid then defies gravity involving 'Datamoshing' artifacts to reform into a floating geometric cube. Camera: Static locked-off shot (Kling requirement). Lighting: Neon purple strobe. Duration: 5s. Style: Glitch art.",
  "hook": "Physics.exe has left the chat 💀"
}

❌ **BAD OUTPUT (Generic + Lazy)**:
{
  "prompt": "The car melts and glitches out wildly.",
  "hook": "So crazy"
}

**STRICT RULES**:
1. Break physics completely.
2. Maximize visual confusion and surprise.
3. Duration: 5 seconds.
4. NO logic, pure content.
5. Use the provided Physics/Glitch vocabulary to enhance the prompt.
6. **Integrate the object** naturally into the chaos (don't just paste the name).

${negPrompt ? `Avoid: ${negPrompt}` : ''}

**OUTPUT (JSON)**:
{
  "prompt": "[Detailed chaotic prompt instructions integrating the object]",
  "hook": "${randomChaos.viralHook}",
  "photoInstructions": "Upload photo of ${object} -> Set Chaos Level to MAX (10) -> Use '${randomChaos.visualStyle}' preset",
  "expectedViews": "5-50M views (High variance)",
  "difficulty": "${randomChaos.difficulty}",
  "estimatedTime": "${randomChaos.estimatedTime}",
  "postProcessing": "${randomChaos.postProcessing}",
  "successRate": "50% (Results vary wildly)",
  "commonIssues": "${randomChaos.commonIssues}",
  "platformSpecific": {
    "kling": "Set Motion to 10. Use 'Surreal' style.",
    "runway": "Motion Brush everything in different directions.",
    "veo": "Prompt for 'glitch art', 'datamosh'."
  }
}`;

    return {
        systemPrompt,
        randomStyle: {
            category: randomChaos.category,
            platform: randomChaos.platform,
            mechanism: "Chaos Engine",
            viralHook: randomChaos.viralHook,
            expectedViews: "5-50M views"
        }
    };
}