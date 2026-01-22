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
    description: string;
    charactersInvolved: string[];
    clipCount: number;
    previousSceneEnd?: string; // For continuity
}

export interface ClipPrompt {
    clipNumber: number;
    sceneNumber: number;
    duration: '8 seconds';
    prompt: string; // The actual Veo prompt
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
        camera: string;
        mood: string;
        continuityFrom?: string;
    }
): string {
    const styleDNA = mode === 'anime' ? STYLE_DNA.anime[style] : STYLE_DNA.cartoon.standard;
    const negatives = NEGATIVE_PROMPTS[mode];

    // Build character block (exact visual DNA for consistency)
    const charBlock = scene.characters.map(c => c.visualDNA).join('. ');

    // Front-load important details (Veo prioritizes first 100 words)
    const prompt = `[STYLE]: ${styleDNA}

[CHARACTERS]: ${charBlock}

[SCENE]: ${scene.setting}

[ACTION]: ${scene.action}

[CAMERA]: ${scene.camera}

[MOOD/LIGHTING]: ${scene.mood}

${scene.continuityFrom ? `[CONTINUITY]: Continues from: ${scene.continuityFrom}` : ''}

[AUDIO ATMOSPHERE]: ${mode === 'anime' ? 'Epic orchestral, dramatic strings, impact bass' : 'Dynamic cartoon score, whoosh effects'}

(no subtitles, no text overlays, no watermarks, consistent character design throughout)

[NEGATIVE]: ${negatives}`.trim();

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

OUTPUT (JSON only, no markdown):
{
  "episodeTitle": "string",
  "summary": "2-3 sentence episode summary",
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneType": "intro|action|dialogue|flashback|climax|transition",
      "description": "What happens in this scene. IF ACTION: Focus on specific isolated beats.",
      "charactersInvolved": ["Character Name 1" (or empty if landscape shot)],
      "clipCount": 3,
      "endState": "Brief description of how scene ends (for continuity)"
    }
  ],
  "cliffhanger": "Episode ending hook"
}

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

=== OUTPUT FORMAT (JSON only) ===
{
  "clipNumber": ${clipNumber},
  "action": "Specific 8-second action. KEEP IT SIMPLE.",
  "camera": "One simple move (e.g. 'Pan Right'). NO orbital/compound moves.",
  "setting": "Environment details. MUST MATCH SCENE TIME OF DAY.",
  "mood": "Lighting and atmosphere. MUST MATCH SCENE.",
  "endState": "Exactly how this clip ends",
  "audioNote": "Sound effect suggestion",
  "narratorScript": "Voiceover line",
  "prompt": "The complete Veo-ready prompt. MUST INCLUDE FULL VISUAL DNA FOR CHARACTERS."
}

CRITICAL RULES FOR VEO:
1. CHARACTER TOKENS (VITAL): You MUST include the full visual description (DNA) for every character mentioned in the prompt. NEVER just use a name. Even if you've mentioned them before, the AI resets every shot.
   - WRONG: "Kaito looks up."
   - RIGHT: "**Kaito Tsukishiro** (Jet-black hair with silver tips, deep violet eyes, long black combat coat with glowing runes) looks up."
2. ASSET TOKENS (VITAL): You MUST include the full visual description (DNA) for every Key Object/Asset mentioned in the prompt.
   - Example: "**Aether Node** (A colossal, translucent blue crystalline tower with jagged edges and a glowing golden core)"
3. SPATIAL BLOCKING & BACKGROUND: You MUST define the layout of the scene. Who is in the foreground? Who is in the background ("person behind")? Describe their relative positions and poses to ensure the composition doesn't jump.
   - Example: "Kaito is in the foreground, while Mina stands 10 feet behind him, looking over her shoulder."
3. LOCATION ANCHORING: If the scene moves, describe the transition. Use landmarks from the previous clip to "anchor" the viewer. If the camera cuts to a new angle, explicitly state what is now visible in the background from the old position.
4. CAMERA STABILITY: Use ONLY simple movements (Static, Pan, Tilt, Dolly, Zoom). NO "Orbital" or compound moves.
5. ACTION CLARITY: Focus action on ONE character per clip.
6. NPC DEFINITION: For generic NPCs (child, crowd), you MUST create a visual description (e.g. "Child: 10yo girl, yellow sweater") to avoid glitches.
7. LIGHTING: Maintain strict continuity with previous clips (Day/Dusk/Night).
8. NO TEXT: Include "(no subtitles, no text)" at the end.`;
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
