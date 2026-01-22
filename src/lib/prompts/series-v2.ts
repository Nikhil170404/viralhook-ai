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
    volume?: 'INT' | 'EXT'; // Scene Boxing
    shotType?: 'Wide' | 'Medium' | 'Close-Up' | 'Extreme Close-Up'; // V3: Shot Type Lock
    aspectRatio?: '16:9' | '9:16'; // V4: Vertical Video Support
    description: string;
    masterVisuals: string; // Source of Truth block
    masterLayout: string; // Geography Anchor (Left/Right/Center)
    charactersInvolved: string[];
    clipCount: number;
    seed?: number; // Seed Locking for the entire scene
    referenceImageUrl?: string; // Image Reference (optional)
    previousSceneEnd?: string; // For continuity
}

export interface ClipPrompt {
    clipNumber: number;
    sceneNumber: number;
    duration: '8 seconds';
    shotType?: string; // Wide/Medium/Close-Up/XCU
    motionDescription?: string; // 8-second motion description for Veo VIDEO
    aspectRatio?: '16:9' | '9:16'; // V4: Vertical Video Support
    prompt: string; // The actual Veo prompt
    negativePrompt: string; // The "Shield"
    seed: number;
    masterLayout?: string; // Geography Anchor
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
 * Build Veo-optimized prompt (Camera-First Structure)
 * Formula: [Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]
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
        aspectRatio?: '16:9' | '9:16';
    }
): string {
    const styleDNA = mode === 'anime' ? STYLE_DNA.anime[style] : STYLE_DNA.cartoon.standard;
    const baseNegatives = NEGATIVE_PROMPTS[mode];
    const combinedNegatives = scene.negativePrompt
        ? `${baseNegatives}, ${scene.negativePrompt}`
        : baseNegatives;

    // Subject Block
    const charBlock = scene.characters.map(c => `**${c.name.toUpperCase()}** (${c.visualDNA})`).join('. ');

    // V4: Veo 2026 "Camera First" Structure
    // 1. Cinematography (PRIORITY 1)
    // 2. Subject
    // 3. Action
    // 4. Context (Setting + Layout)
    // 5. Style
    const prompt = `(Cinematography) ${scene.camera}. ${scene.aspectRatio === '9:16' ? 'Vertical 9:16 aspect ratio.' : 'Cinematic 16:9 aspect ratio.'}

(Subject) ${charBlock || 'No characters present.'}

(Action) ${scene.action}

(Context) ${scene.masterVisuals || scene.setting}
${scene.masterLayout ? `Spatial Layout: ${scene.masterLayout}` : ''}
${scene.mood}

(Style) ${styleDNA}. Seed: ${scene.seed || 'auto'}.
${scene.continuityFrom ? `Continues from: ${scene.continuityFrom}` : ''}

Exclude: ${combinedNegatives}. (no subtitles, use colon syntax for dialogue, no text overlays)`.trim();

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
      "shotType": "Wide|Medium|Close-Up|Extreme Close-Up",
      "masterVisuals": "Technical description of setting materials and lighting.",
      "masterLayout": "Spatial map: LEFT SIDE: [Object], RIGHT SIDE: [Object], CENTER/BACKGROUND: [Landmarks].",
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
    previousClipEnd?: string,
    aspectRatio?: '16:9' | '9:16'
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
Aspect Ratio: ${aspectRatio === '9:16' ? 'Vertical 9:16 (TikTok/Shorts)' : 'Cinematic 16:9 (TV/Youtube)'}

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
  "shotType": "Wide|Medium|Close-Up|Extreme Close-Up",
  "motionDescription": "Describe the 8-SECOND MOTION. What moves? How does it move? Example: 'Haru walks slowly down the rain-slicked street. His coat sways in the wind. Camera tracks alongside him.'",
  "action": "What is happening in this 8-second moment.",
  "camera": "One camera movement over 8 seconds. Examples: 'Slow pan left to right', 'Static wide shot', 'Tracking shot following character'",
  "setting": "Environment details.",
  "mood": "Lighting and atmosphere.",
  "negativePrompt": "Comma separated list of things to EXCLUDE. e.g., 'wood, planks, bright daylight'",
  "seed": ${scene.seed || 'Generate random 7-digit integer if not provided'},
  "endState": "Exactly how this clip ends (final frame description)",
  "audioNote": "Sound effect suggestion",
  "narratorScript": "Voiceover line",
  "prompt": "The complete Veo-ready VIDEO prompt. NO BRACKETS. Natural language. Describe 8 seconds of continuous motion."
}

CRITICAL RULES FOR VEO VIDEO GENERATION:
1. MASTER ASSET BLOCK: Every prompt MUST include the Scene Master description unchanged.
2. NEGATIVE PROMPTING: Use the "negativePrompt" field to ban materials that might drift.
3. SEED LOCKING: Use the same Seed for all clips in this scene.
4. IMAGE ANCHORING: If Clip 2+, reference the "previousClipEnd" visually.
5. SCENE BOXING: If INT, no exterior terrain unless 'through a window'.
6. SPATIAL LAYERING: Define FOREGROUND, MIDGROUND, BACKGROUND layers.
7. GEOGRAPHY ANCHORING: Use the MASTER LAYOUT block to lock Left/Right/Center.
8. CAMERA GEOMETRY: If "Going Down", use High Angle. If "Going Up", use Low Angle.
9. VEO VIDEO MOTION (IMPORTANT):
   - Veo generates 8-SECOND VIDEO CLIPS, not static images.
   - Motion verbs ARE ALLOWED: "walks", "runs", "flies", "camera tracks left".
   - Describe CONTINUOUS MOTION over 8 seconds, not frozen poses.
   - Use natural video language: "Camera slowly pans from A to B over 8 seconds."
10. SHOT TYPE: Specify one of: Wide, Medium, Close-Up, Extreme Close-Up.
    - RULE: If "Wide", do NOT describe objects smaller than a human torso.
    - RULE: If "Close-Up", do NOT describe distant landmarks.
11. CHARACTER TOKENS: Include full visual DNA for every character.
    - Example: "**Haru Aizawa** (messy ash-brown hair, dark gray coat, faded scarf)"
12. LOCATION BRIDGING: Mention established landmarks in the distant background.
13. NO TEXT: Include "(no subtitles, no text)" at the end.`;
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
        aspectRatio?: '16:9' | '9:16';
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
        continuityFrom: clipData.endState,
        aspectRatio: clipData.aspectRatio
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
            shotType: data.shotType,
            motionDescription: data.motionDescription,
            aspectRatio: data.aspectRatio,
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
