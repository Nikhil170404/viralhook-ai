import { getNegativePrompt } from '../helpers';

/**
 * CHAOS MODE - Maximum Virality, Glitch, and Physics Breaking
 * Optimized for "Wait what just happened?" reactions
 */
export function getChaosPrompt(object: string, targetModel?: string) {

    // ✅ 2026 LATEST CHAOS TRENDS
    const chaosScenarios = [
        {
            category: "Physics Break",
            chaosAction: "Object turns into liquid then evaporates into geometric shapes",
            visualStyle: "Datamoshing, glitch texture, RGB split",
            viralHook: "My brain.exe stopped working 🧠",
            platform: "Kling (High motion)",
            difficulty: "Hard",
            estimatedTime: "10 mins (Kling) + 10 mins post",
            postProcessing: "Add glitch sound effects. Maximize saturation.",
            commonIssues: "Video might look like noise - keep subject recognizing for first 2 seconds."
        },
        {
            category: "Mumbai Traffic Chaos",
            chaosAction: "Rickshaws flying in zero gravity, cows walking on walls",
            visualStyle: "Surrealism, saturated colors, chaotic motion",
            viralHook: "Average day in Mumbai 🇮🇳",
            platform: "Runway Gen-4",
            difficulty: "Medium",
            estimatedTime: "10 mins (Runway) + 5 mins post",
            postProcessing: "Add traffic honking audio but distorted. Speed up footage 2x.",
            commonIssues: "Too many objects can crash the generation - focus on 3-4 main elements."
        },
        {
            category: "Scale Manipulation",
            chaosAction: "Tiny person eats a giant burger, then burger eats person",
            visualStyle: "Fisheye lens, forced perspective",
            viralHook: "Uno Reverse Card 🔄",
            platform: "Veo 3",
            difficulty: "Hard",
            estimatedTime: "15 mins (Veo) + 5 mins post",
            postProcessing: "Add cartoon chomping sounds. Screen shake on 'eating' moment.",
            commonIssues: "Scale consistency is hard - use 'macro photography' keyword."
        },
        {
            category: "Digital Meltdown",
            chaosAction: "World dissolves into binary code, matrix rain, error popups",
            visualStyle: "Cyberpunk, glitch art, VHS static",
            viralHook: "Simulation Glitch 👾",
            platform: "Kling AI",
            difficulty: "Medium",
            estimatedTime: "8 mins (Kling) + 5 mins post",
            postProcessing: "Overlay Windows XP error sounds. Add CRT monitor filter.",
            commonIssues: "Text renders poorly - focus on binary 'rain' visuals."
        }
    ];

    const randomChaos = chaosScenarios[Math.floor(Math.random() * chaosScenarios.length)];
    const negPrompt = getNegativePrompt(targetModel || 'auto');

    const systemPrompt = `You are a CHAOS AGENT for Viral Video AI.

**OBJECT**: "${object}"

**CHAOS STYLE**: ${randomChaos.category}
**ACTION**: ${randomChaos.chaosAction}

**RULES**:
1. Break physics completely
2. Maximize visual confusion and surprise
3. Duration: 5 seconds
4. NO logic, pure content

${negPrompt ? `Avoid: ${negPrompt}` : ''}

**OUTPUT (JSON only)**:
{
  "prompt": "[Detailed chaotic prompt instructions]",
  "hook": "${randomChaos.viralHook}",
  "photoInstructions": "Upload photo -> Set Chaos Level to MAX (10) -> Use 'Glitch' preset",
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