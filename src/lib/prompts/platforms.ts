/**
 * PLATFORM-SPECIFIC RULES (2026)
 * Compressed to essential constraints only
 */

export const PLATFORMS = {
    KLING: 'kling',
    RUNWAY: 'runway',
    VEO: 'veo',
    LUMA: 'luma'
} as const;

export type PlatformType = typeof PLATFORMS[keyof typeof PLATFORMS];

// ===== COMPRESSED PLATFORM RULES =====

export const PLATFORM_RULES = {
    kling: {
        wordCount: '60-100',
        structure: 'Subject → Action → Context → Style',
        critical: [
            'End with motion stop: "then settles" / "comes to rest" / "slowing"',
            'Use physics terms: "fluid dynamics", "realistic liquid", "fabric flows naturally"',
            'Camera terms inverted: "tilt left" = "pan left"'
        ],
        avoid: 'Exact numbers (use "cluster", "flock")'
    },
    runway: {
        wordCount: '20-50',
        structure: '[Camera Movement]: [Scene]. [Details]. [Style].',
        critical: [
            'Describe outcomes not mechanics: "bounces" not "collision detection"',
            'Never redescribe reference image',
            'NO negative prompts (causes opposite effect)'
        ],
        avoid: 'Technical jargon, complex physics terms'
    },
    veo: {
        wordCount: '300-400',
        structure: '[00:00-00:0X] Action + behavior (timestamp sequencing)',
        critical: [
            'Use outcomes: "sparks scatter" not "particle simulation"',
            'Describe audio: ambient noise, sound effects',
            'Front-load detail (first 100 words most important)'
        ],
        avoid: 'Physics jargon (ragdoll, collision, etc)'
    },
    luma: {
        wordCount: '3-4 natural sentences',
        structure: 'Conversational flow with trajectory description',
        critical: [
            'Describe motion as arc/trajectory: "sweeps from left to right"',
            'Excellent for loops and morphing',
            'Natural language preferred'
        ],
        avoid: 'Robotic instruction style'
    }
} as const;

export function getPlatformRule(model: string): string {
    const m = model.toLowerCase();
    const platform = m.includes('kling') ? 'kling'
        : m.includes('runway') ? 'runway'
            : m.includes('veo') ? 'veo'
                : m.includes('luma') ? 'luma'
                    : 'kling'; // default

    const rules = PLATFORM_RULES[platform];
    return `${rules.wordCount} words. ${rules.structure}
Critical: ${rules.critical.join('; ')}
Avoid: ${rules.avoid}`;
}

export function getNegativePrompt(model: string): string {
    if (model.toLowerCase().includes('runway')) return ''; // Runway breaks with negatives
    return "distorted faces, morphing, unrealistic physics, floating objects, warping, blurry";
}
