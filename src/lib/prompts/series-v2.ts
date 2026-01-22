/**
 * ANIME SERIES PROMPT GENERATOR V2
 * Optimized for Google Veo with compressed, consistent prompts
 * Supports: Anime style (Jujutsu Kaisen/Demon Slayer quality) + Cartoon style
 */

import { ParsedCharacter, ParsedStory, StoryAsset, formatCharactersForPrompt, formatAssetsForPrompt, findCharacterByName } from './story-parser';

// ============================================================================
// TYPES
// ============================================================================

export interface SceneOutline {
    sceneNumber: number;
    sceneType: 'intro' | 'action' | 'dialogue' | 'flashback' | 'climax' | 'transition';
    volume?: 'INT' | 'EXT'; // Method 5: Scene Boxing
    description: string;
    masterVisuals: string; // Method 1: The "Source of Truth" block
    masterLayout: string; // Method 7: Geography Anchor (Left/Right/Center)
    charactersInvolved: string[];
    clipCount: number;
    seed?: number; // Method 3: Seed Locking for the entire scene
    referenceImageUrl?: string; // Method 4: Image Reference (optional)
    previousSceneEnd?: string; // For continuity
}

export interface ClipPrompt {
    clipNumber: number;
    sceneNumber: number;
    duration: '8 seconds';
    prompt: string; // The actual Veo prompt
    negativePrompt: string; // Method 2: The "Shield"
    seed: number;
    masterLayout?: string; // Method 7: Geography Anchor
    continuityNote: string; // How this connects to next clip
    audioSuggestion: string;
    narratorScript: string;
}

export interface EpisodeOutline {
    episodeNumber: number;
    title: string;
    summary: string;
    scenes: SceneOutline[];
    arcPosition: string;
    discoveredAssets?: { name: string; description: string }[];
}

export type AnimeStyle = 'jjk' | 'demonslayer' | 'deathnote' | 'aot' | 'standard';
export type Mode = 'anime' | 'cartoon';

// ============================================================================
// STYLE PRESETS (Compressed visual DNA for each style)
// ============================================================================

const STYLE_DNA = {
    anime: {
        jjk: 'MAPPA studio quality, cel-shaded, high contrast shadows, vibrant saturation, dynamic action lines, cursed energy aura effects, intense expressions',
        demonslayer: 'Ufotable quality, flowing water/flame effects, intricate patterns, dramatic lighting, particle effects, smooth 2D animation',
        deathnote: 'Madhouse quality, dramatic shadows, noir lighting, psychological tension, detailed eyes, minimal motion high impact',
        aot: 'WIT/MAPPA quality, ODM gear motion, titan scale, epic wide shots, detailed backgrounds, fluid combat',
        standard: 'high quality anime, cel-shaded, vibrant colors, expressive, detailed eyes, smooth animation'
    },
    cartoon: {
        standard: '2D cartoon animation, bold outlines, flat vibrant colors, squash-stretch physics, expressive, hand-drawn feel'
    }
};

const NEGATIVE_PROMPTS = {
    anime: 'photorealistic, realistic, 3D CGI, western cartoon, blurry, bad anatomy, disfigured, deformed',
    cartoon: 'realistic, 3D, photorealistic, anime, complex lighting, realistic shadows'
};

// ============================================================================
// ARC STRUCTURE (Kishōtenketsu for 24 episodes)
// ============================================================================

// ============================================================================
// ARC STRUCTURE (Kishōtenketsu - Scalable)
// ============================================================================

// Key milestones as percentage of total episodes (0.0 to 1.0)
const ARC_MILESTONES = [
    { pct: 0.1, phase: 'INTRO: Establish protagonist daily life, hint at hidden power' },
    { pct: 0.2, phase: 'INCITING INCIDENT: Normal world disrupted, first glimpse of threat' },
    { pct: 0.4, phase: 'RISING ACTION: Training, team assembly, first minor victories' },
    { pct: 0.6, phase: 'MIDPOINT: Major twist, enemy reveal, stakes escalate drastically' },
    { pct: 0.8, phase: 'ALL IS LOST: Lowest point, character backstory revealed, preparing for end' },
    { pct: 0.9, phase: 'CLIMAX: Final battle, all-out war, sacrifices' },
    { pct: 1.0, phase: 'RESOLUTION: Victory/bittersweet end, new dawn, sequel hook' }
];

function getArcGuidance(ep: number, totalEpisodes: number): string {
    const progress = ep / totalEpisodes;
    const stage = ARC_MILESTONES.find(m => progress <= m.pct) || ARC_MILESTONES[ARC_MILESTONES.length - 1];
    return stage.phase;
}

// ============================================================================
// CORE PROMPT BUILDER (Veo-Optimized)
// ============================================================================

/**
 * Build Veo-optimized prompt (300-400 words, front-loaded detail)
 */
function buildVeoPrompt(
    mode: Mode,
    style: AnimeStyle,
    scene: {
        characters: ParsedCharacter[];
        action: string;
        setting: string;
        masterVisuals?: string;
        masterLayout?: string;
        negativePrompt?: string;
        seed?: number;
        camera: string;
        mood: string;
        continuityFrom?: string;
    }
): string {
    const styleDNA = mode === 'anime' ? STYLE_DNA.anime[style] : STYLE_DNA.cartoon.standard;
    const baseNegatives = NEGATIVE_PROMPTS[mode];
    const combinedNegatives = scene.negativePrompt
        ? `${baseNegatives}, ${scene.negativePrompt}`
        : baseNegatives;

    // Build character block (exact visual DNA for consistency)
    const charBlock = scene.characters.map(c => `**${c.name.toUpperCase()}** (${c.visualDNA})`).join('. ');

    // Front-load important details
    const prompt = `[STYLE]: ${styleDNA} ${scene.seed ? `| Seed: ${scene.seed}` : ''}

[SCENE MASTER]: ${scene.masterVisuals || scene.setting}

${scene.masterLayout ? `[MASTER LAYOUT]: ${scene.masterLayout}\n` : ''}
[CHARACTERS]: ${charBlock}

[ACTION]: ${scene.action}

[CAMERA]: ${scene.camera}

[MOOD/LIGHTING]: ${scene.mood}

${scene.continuityFrom ? `[CONTINUITY]: Continues from: ${scene.continuityFrom}` : ''}

[NEGATIVE]: ${combinedNegatives}

(no subtitles, no text overlays, no watermarks, consistent character design throughout)`.trim();

    return prompt;
}

// ============================================================================
// EPISODE OUTLINE GENERATOR
// ============================================================================

export function getEpisodeOutlineSystemPrompt(
    story: ParsedStory,
    episodeNumber: number,
    totalEpisodes: number,
    mode: Mode
): string {
    const arcGuide = getArcGuidance(episodeNumber, totalEpisodes);
    const charList = formatCharactersForPrompt(story.characters);
    const assetList = formatAssetsForPrompt(story.assets || []);

    return `You are an expert ${mode === 'anime' ? 'anime' : 'cartoon'} scriptwriter. Create Episode ${episodeNumber} outline for "${story.title}".

=== SERIES INFO ===
Title: ${story.title}
Genre: ${story.genre}
Total Episodes: ${totalEpisodes}
World: ${story.worldRules}

=== CHARACTERS ===
${charList}

=== KEY OBJECTS / ASSETS ===
${assetList}

=== EPISODE ${episodeNumber} CONTEXT ===
Arc Guidance: ${arcGuide}
${story.episodeBrief ? `\nSeries Brief:\n${story.episodeBrief}` : ''}

=== YOUR TASK ===
Generate a 4-scene episode outline. Each scene will become 2-3 video clips (8 seconds each).

CRITICAL PACING RULES:
1. "SLOW BURN" START: Episode 1 MUST start with establishing shots (city, world, atmosphere) BEFORE showing the main character. Do not rush into action.
2. ATMOSPHERE FIRST: Build the mood. Show the setting details (weather, lighting, background crowds) to ground the viewer.
3. SHOW, DON'T JUST TELL: Use visual storytelling for the first scene.
4. TRANSITIONS: Do NOT jump time of day (e.g., Dawn to Night) within a single scene. Create a new "Transition" scene for time jumps.

CRITICAL ACTION RULES:
1. NO GROUP FIGHTS: In action scenes, break the clips down to focus on ONE character's specific move per clip. Do not ask for "The team fights the monster" in one shot (AI will glitch).
2. EXAMPLE: Clip 1: Hero attacks. Clip 2: Villain reacts. Clip 3: Support character casts spell.
3. **ASSET DISCOVERY (NEW)**: If you mention a specific building, vehicle, or unique object that is NOT in the "KEY OBJECTS" list above, you MUST add it to the "discoveredAssets" list in your JSON output with a detailed visual description. This ensures it stays consistent in future clips.

OUTPUT (JSON only, no markdown):
{
  "episodeTitle": "string",
  "summary": "2-3 sentence episode summary",
  "discoveredAssets": [
    { "name": "Object Name", "description": "Detailed visual description for Veo injection" }
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneType": "intro|action|dialogue|flashback|climax|transition",
      "volume": "INT|EXT",
      "masterVisuals": "A technical 'Source of Truth' description of the setting materials and lighting.",
      "masterLayout": "A strict 3D map (Method 7). Define: LEFT SIDE: [Object], RIGHT SIDE: [Object], CENTER/BACKGROUND: [Landmarks]. Who is where? ALWAYS maintain these positions.",
      "description": "What happens in this scene.",
      "charactersInvolved": ["Character Name 1"],
      "clipCount": 3,
      "seed": 1234567,
      "endState": "Brief description of how scene ends"
    }
  ],
  "cliffhanger": "Episode ending hook"
}

CRITICAL CONSISTENCY RULES:
1. SCENE BOXING (Method 5): Strictly separate interior (INT) and exterior (EXT). Do not describe the outside street in an INT scene unless it is 'visible through a window'.
2. MASTER VISUALS (Method 1): The masterVisuals block MUST be technical and static (no movements, no characters).
3. SEED LOCKING (Method 3): Generate a unique seed for each scene to ensure 'genetic' style consistency.
4. SPATIAL LAYERING (Method 6): Plan scenes with depth. Identify what is in the [FOREGROUND] and what is in the [BACKGROUND] to avoid the "Time vs Space" conflation.
5. CAMERA GEOMETRY (Method 8): If a scene involves movement (e.g. 'Walking Down'), the plan MUST specify a "High Angle" or "Low Angle" that matches the vector. Avoid placing 'steps' in the foreground if the camera is high.

RULES:
1. Use EXACT character names from the list above
2. Scene 2 should continue from Scene 1's endState
3. Include at least one action scene
4. End with hook for next episode`;
}

// ============================================================================
// SINGLE CLIP GENERATOR
// ============================================================================

export function getClipSystemPrompt(
    story: ParsedStory,
    scene: SceneOutline,
    clipNumber: number,
    totalClipsInScene: number,
    mode: Mode,
    style: AnimeStyle,
    previousClipEnd?: string
): string {
    // Get characters for this scene
    const sceneChars = scene.charactersInvolved
        .map(name => findCharacterByName(story.characters, name))
        .filter(Boolean) as ParsedCharacter[];

    const charBlock = sceneChars.map(c => `${c.name}: ${c.visualDNA}`).join('\n');
    const styleDNA = mode === 'anime' ? STYLE_DNA.anime[style] : STYLE_DNA.cartoon.standard;

    return `Generate ONE 8-second video clip prompt for ${mode === 'anime' ? 'anime' : 'cartoon'} series.

=== VISUAL STYLE ===
${styleDNA}

=== CHARACTERS IN SCENE ===
${charBlock || 'No characters - Establishing Shot'}

=== WORLD ASSETS ===
${formatAssetsForPrompt(story.assets || [])}

=== SCENE CONTEXT ===
Scene ${scene.sceneNumber}: ${scene.sceneType.toUpperCase()}
Description: ${scene.description}
This is Clip ${clipNumber} of ${totalClipsInScene} in this scene.

${previousClipEnd ? `=== CONTINUITY ===\nPrevious clip ended with: ${previousClipEnd}\nThis clip must START from that exact moment.` : '=== START ===\nThis is the first clip of the scene.'}

=== TASK ===
1. Generate the Veo Video Prompt (visuals only).
2. Generate a NARRATOR SCRIPT (voiceover).
3. Generate a DYNAMIC NEGATIVE PROMPT (Method 2: The Shield) to ban unwanted elements (e.g., 'no wood' if concrete).

=== OUTPUT FORMAT (JSON only) ===
{
  "clipNumber": ${clipNumber},
  "action": "Specific 8-second action.",
  "camera": "One simple move.",
  "setting": "Environment details.",
  "mood": "Lighting and atmosphere.",
  "negativePrompt": "Comma separated list of things to EXCLUDE (Method 2). e.g., 'wood, planks, bright daylight'",
  "seed": ${scene.seed || 'Generate random 7-digit integer if not provided'},
  "endState": "Exactly how this clip ends",
  "audioNote": "Sound effect suggestion",
  "narratorScript": "Voiceover line",
  "prompt": "The complete Veo-ready prompt. MUST START WITH [SCENE MASTER]: followed by the Master Visuals Block."
}

CRITICAL RULES FOR PRODUCTION CONSISTENCY:
1. THE "MASTER ASSET" BLOCK (Method 1): Every prompt MUST start with the [SCENE MASTER] block provided in the scene context. Do not change a single word of it between clips.
2. NEGATIVE PROMPTING (Method 2): Use the "negativePrompt" field to ban materials or lighting that might drift (e.g., ban 'wood' if the bridge is concrete).
3. SEED LOCKING (Method 3): Use the same Seed provided in the scene context for all clips in this scene.
4. IMAGE ANCHORING (Method 4): If this is Clip 2 or 3, refer to the "previousClipEnd" visually to ensure the camera angle change feels logical.
5. SCENE BOXING (Method 5): Verify the 'Volume' of the scene. If INT, do not describe any exterior terrain unless it is specifically 'through a window' or 'visible outside'.
6. SPATIAL LAYERING (Method 6): Define layers: [FOREGROUND], [MIDGROUND], [BACKGROUND]. Use "Extreme Depth of Field".
7. GEOGRAPHY ANCHORING (Method 7): To prevent objects from swapping sides, use the [MASTER LAYOUT] block.
8. CAMERA GEOMETRY & VECTOR CONTROL (Method 8 - THE FIX): To prevent the "Foreground Trap" (e.g., looking UP while moving DOWN):
   - RULE: If the action is "Going Down" (stairs, slopes), the camera MUST be "High Angle" or "Bird's Eye," looking down from the top.
   - RULE: If High Angle, the Foreground must be "The Top Landing" or "Character's Shoulders." NEVER put steps/risers in the foreground of a high-angle shot.
   - RULE: Ensure the "Visual Vector" (where the character is moving) matches the "Camera Vector" (where the camera is looking).
9. CHARACTER TOKENS: You MUST include full visual DNA for every character.
   - Example: "**Haru Aizawa** (messy ash-brown hair, dark gray coat, faded scarf)"
8. SPATIAL BLOCKING: Define foreground/background layout clearly.
9. LOCATION BRIDGING: Mention established landmarks in the distant background.
10. NO TEXT: Include "(no subtitles, no text)" at the end.`;
}

// ============================================================================
// COMPILE FINAL PROMPT (for copy-paste to Veo)
// ============================================================================

export function compileFinalPrompt(
    clipData: {
        action: string;
        camera: string;
        setting: string;
        mood: string;
        masterVisuals?: string;
        masterLayout?: string;
        negativePrompt?: string;
        seed?: number;
        characters: ParsedCharacter[];
        endState?: string;
    },
    mode: Mode,
    style: AnimeStyle
): string {
    return buildVeoPrompt(mode, style, {
        characters: clipData.characters,
        action: clipData.action,
        setting: clipData.setting,
        masterVisuals: clipData.masterVisuals,
        masterLayout: clipData.masterLayout,
        negativePrompt: clipData.negativePrompt,
        seed: clipData.seed,
        camera: clipData.camera,
        mood: clipData.mood,
        continuityFrom: clipData.endState
    });
}

// ============================================================================
// PARSE AI RESPONSE
// ============================================================================

export function parseOutlineResponse(content: string): EpisodeOutline | null {
    try {
        let clean = content.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();
        clean = clean.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        return JSON.parse(jsonMatch[0]);
    } catch {
        return null;
    }
}

export function parseClipResponse(content: string): ClipPrompt | null {
    try {
        let clean = content.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();
        clean = clean.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const data = JSON.parse(jsonMatch[0]);
        return {
            clipNumber: data.clipNumber,
            sceneNumber: data.sceneNumber || 1,
            duration: '8 seconds',
            prompt: data.prompt || '',
            negativePrompt: data.negativePrompt || '',
            seed: data.seed || Math.floor(Math.random() * 9000000) + 1000000,
            masterLayout: data.masterLayout,
            continuityNote: data.endState || '',
            audioSuggestion: data.audioNote || '',
            narratorScript: data.narratorScript || ''
        };
    } catch {
        return null;
    }
}

// ============================================================================
// UTILITY: Scene Type Visual Hints
// ============================================================================

export const SCENE_TYPE_HINTS = {
    intro: 'Establish setting, character entrance, calm before storm',
    action: 'Dynamic movement, impact frames, speed lines, intense',
    dialogue: 'Close-ups, emotional expressions, subtle movements',
    flashback: 'Desaturated colors, soft edges, memory filter',
    climax: 'Maximum intensity, all effects, dramatic lighting',
    transition: 'Environmental shot, time passing, mood shift'
};

// ============================================================================
// AVAILABLE STYLES FOR UI
// ============================================================================

export const ANIME_STYLES = [
    { id: 'jjk', name: 'Jujutsu Kaisen', desc: 'MAPPA quality, cursed energy effects' },
    { id: 'demonslayer', name: 'Demon Slayer', desc: 'Ufotable quality, flowing elements' },
    { id: 'deathnote', name: 'Death Note', desc: 'Psychological, dramatic shadows' },
    { id: 'aot', name: 'Attack on Titan', desc: 'Epic scale, fluid combat' },
    { id: 'standard', name: 'Standard Anime', desc: 'High quality general anime' }
];

export const MODES = [
    { id: 'anime', name: 'Anime', desc: 'Japanese animation style' },
    { id: 'cartoon', name: 'Cartoon', desc: '2D Western cartoon style' }
];
