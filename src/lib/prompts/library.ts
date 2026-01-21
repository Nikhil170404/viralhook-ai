/**
 * MINIMAL LIBRARY (2026)
 * Only platform-specific technical needs
 */

// ===== KLING-SPECISTICS PHYSICS (Only platform that needs this) =====
export const KLING_PHYSICS_TERMS = [
    'fluid dynamics', 'realistic liquid viscosity', 'surface tension',
    'rigid body collision', 'momentum transfer', 'fragmentation simulation',
    'cloth physics', 'hair collision', 'soft body dynamics'
];

// ===== PERSON DESCRIPTION HELPER =====
export const enhancePersonDescription = (input: string): string => {
    if (!input) return "";
    const trimmed = input.trim();
    if (trimmed.toLowerCase().match(/^(a |an |the )/)) return trimmed;
    return `a person who is ${trimmed}`;
};

// ===== STYLE PRESETS (Quick application) =====
export const STYLE_PRESETS = {
    bodycam: "Bodycam POV, fish-eye distortion, chest-mounted, REC overlay, timestamp, scan lines",
    dreamcore: "Liminal space, hazy pastels, nostalgic fog, soft focus, cognitive dissonance",
    bollywood90s: "Kodak Vision3 500T, 35mm grain, warm 3200K, magenta shadows, romantic glow",
    vhs: "VHS analog, scan lines, chroma bleed, tracking errors, 240p, REC indicator",
    synthwave: "Magenta/cyan gradient, neon grids, chrome reflections, volumetric fog, retro-future",
    film70s: "Heavy 16mm grain, warm orange cast, faded pastels, soft focus, documentary"
} as const;

export function applyStylePreset(name: keyof typeof STYLE_PRESETS): string {
    return STYLE_PRESETS[name];
}
