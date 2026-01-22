"use strict";

import { getPlatformRule } from './platforms';

/**
 * Anime Series Prompt Generator
 * Generates structured prompts for serialized anime content with character consistency
 */

// ============================================================================
// CHARACTER BIBLE BUILDER
// ============================================================================

export interface CharacterVisualSpec {
    age: number;
    height: string;
    build: string;
    hair: string;
    eyes: string;
    face: string;
    outfit: string;
    accessories: string;
}

export interface CharacterVoiceSpec {
    tone: string;
    speechPattern: string;
    verbalTics: string[];
}

export interface Character {
    id: string;
    name: string;
    visualSpec: CharacterVisualSpec;
    voiceSpec: CharacterVoiceSpec;
    personality: string;
    backstory: string;
}

export interface SeriesBible {
    title: string;
    genre: string;
    themes: string[];
    worldRules: string;
    toneGuide: string;
    totalEpisodes: number;
    arcStructure: string;
}

export interface EpisodeConfig {
    episodeNumber: number;
    arcPosition: string;
    requiredBeats: string[];
    charactersAppearing: string[];
    previousSummary: string;
    nextEpisodeHook: string;
}

// ============================================================================
// CHARACTER PROMPT BUILDER
// ============================================================================

export function buildCharacterDescription(char: Character): string {
    const v = char.visualSpec;
    // Handle case where visualSpec might be simplified from import
    if (!v) return `${char.name} (${char.id})`;
    return `${char.name}, a ${v.age || 'young'} ${v.build || ''}, ${v.height || ''}, with ${v.hair || ''}, ${v.eyes || ''}. Wearing ${v.outfit || ''}. ${v.accessories ? `Accessories: ${v.accessories}.` : ''}`.replace(/,\s*,/g, ',');
}

export function buildCharacterBlock(chars: Character[]): string {
    return chars.map(c => `- **${c.name}**: ${buildCharacterDescription(c)}\n  Personality: ${c.personality}`).join('\n');
}

// ============================================================================
// SCENE/CLIP PROMPT BUILDER (8-second clips for Veo/Kling)
// ============================================================================

export function buildClipPrompt(
    clipConfig: {
        shotType: string;
        camera: string;
        character: Character;
        action: string;
        context: string;
        style: string;
        ambiance: string;
        audio?: string;
    },
    targetPlatform: string
): string {
    const platformRule = getPlatformRule(targetPlatform);
    const charDesc = buildCharacterDescription(clipConfig.character);

    // Veo-optimized canonical structure
    return `[SHOT TYPE]: ${clipConfig.shotType}
[CAMERA]: ${clipConfig.camera}
[SUBJECT]: ${charDesc}
[ACTION]: ${clipConfig.action}
[CONTEXT]: ${clipConfig.context}
[STYLE]: ${clipConfig.style}
[AMBIANCE]: ${clipConfig.ambiance}
${clipConfig.audio ? `[AUDIO]: ${clipConfig.audio}` : ''}
(no subtitles, no text overlays, no watermarks)

${platformRule ? `Platform Notes: ${platformRule}` : ''}`.trim();
}

// ============================================================================
// KISHŌTENKETSU ARC TEMPLATES (24-episode structure)
// ============================================================================

export const ARC_TEMPLATES = {
    cour1: {
        episodes1_2: "World introduction, protagonist's normal life, establish stakes",
        episode3: "Inciting incident, call to adventure, first glimpse of power",
        episodes4_6: "Power system explained, team assembly, training montage",
        episodes7_9: "First major arc, initial villain confrontation, setback",
        episodes10_11: "Stakes escalate, secondary characters developed, preparation",
        episode12: "Mid-season climax, major revelation or cliffhanger"
    },
    cour2: {
        episode13: "New status quo established, often new OP/ED themes introduced",
        episodes14_17: "Deep character development, hidden truths revealed, bonding",
        episodes18_20: "Final arc setup, allies gather, resources obtained, planning",
        episodes21_22: "Final confrontation begins, losses occur, peak tension",
        episode23: "Peak climax, decisive battle, emotional culmination",
        episode24: "Resolution, aftermath, season cliffhanger or satisfying ending"
    }
};

export function getArcGuidance(episodeNumber: number): string {
    if (episodeNumber <= 2) return ARC_TEMPLATES.cour1.episodes1_2;
    if (episodeNumber === 3) return ARC_TEMPLATES.cour1.episode3;
    if (episodeNumber <= 6) return ARC_TEMPLATES.cour1.episodes4_6;
    if (episodeNumber <= 9) return ARC_TEMPLATES.cour1.episodes7_9;
    if (episodeNumber <= 11) return ARC_TEMPLATES.cour1.episodes10_11;
    if (episodeNumber === 12) return ARC_TEMPLATES.cour1.episode12;
    if (episodeNumber === 13) return ARC_TEMPLATES.cour2.episode13;
    if (episodeNumber <= 17) return ARC_TEMPLATES.cour2.episodes14_17;
    if (episodeNumber <= 20) return ARC_TEMPLATES.cour2.episodes18_20;
    if (episodeNumber <= 22) return ARC_TEMPLATES.cour2.episodes21_22;
    if (episodeNumber === 23) return ARC_TEMPLATES.cour2.episode23;
    return ARC_TEMPLATES.cour2.episode24;
}

// ============================================================================
// STEP 1: EPISODE OUTLINE GENERATOR
// ============================================================================

export function getEpisodeOutlinePrompt(
    seriesBible: SeriesBible,
    characters: Character[],
    episodeConfig: EpisodeConfig
): { systemPrompt: string } {
    const arcGuidance = getArcGuidance(episodeConfig.episodeNumber);
    const characterBlock = buildCharacterBlock(
        // Allow using raw string IDs if imports were used
        characters.length > 0 ? characters : []
    );

    const systemPrompt = `You are an expert anime scriptwriter. Create a detailed outline for Episode ${episodeConfig.episodeNumber} of "${seriesBible.title}".

=== SERIES BIBLE ===
Title: ${seriesBible.title}
Genre: ${seriesBible.genre}
World Rules: ${seriesBible.worldRules}

=== CHARACTERS AVAILABLE ===
${characterBlock}

=== EPISODE CONTEXT ===
- Number: ${episodeConfig.episodeNumber}
- Arc Position: ${episodeConfig.arcPosition}
- Guidance: ${arcGuidance}
- Prev Summary: ${episodeConfig.previousSummary}

=== OUTPUT FORMAT ===
Generate ONLY valid JSON:
{
  "episodeTitle": "string",
  "episodeSummary": "string",
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneType": "string (e.g. Intro/Action/Dialogue)",
      "description": "Short description of what happens in this scene",
      "charactersInvolved": ["name1", "name2"],
      "estimatedClips": 3
    },
    // Generate 3-4 scenes total
  ]
}`;
    return { systemPrompt };
}

// ============================================================================
// STEP 2: SINGLE CLIP GENERATOR
// ============================================================================

export function getSingleClipPrompt(
    seriesBible: SeriesBible,
    characters: Character[],
    episodeConfig: EpisodeConfig,
    sceneContext: {
        sceneNumber: number;
        sceneType: string;
        description: string;
    },
    clipNumber: number,
    previousClipsSummary: string,
    targetPlatform: string
): { systemPrompt: string } {
    const platformRule = getPlatformRule(targetPlatform);
    const characterBlock = buildCharacterBlock(characters);

    const systemPrompt = `You are an expert AI video prompt engineer. Generate ONE detailed video prompt for Clip ${clipNumber} of Scene ${sceneContext.sceneNumber} in Episode ${episodeConfig.episodeNumber}.

=== SERIES CONTEXT ===
Title: ${seriesBible.title}
Genre: ${seriesBible.genre}
World Rules: ${seriesBible.worldRules}

=== CHARACTERS ===
${characterBlock}

=== SCENE CONTEXT ===
Scene Type: ${sceneContext.sceneType}
Description: ${sceneContext.description}

=== PREVIOUS ACTION ===
${previousClipsSummary || "This is the first clip of the scene."}

=== TASK ===
Generate the prompt for Clip ${clipNumber}.
Target Platform: ${targetPlatform} (8 seconds duration)

=== OUTPUT FORMAT ===
Generate ONLY valid JSON:
{
  "clipNumber": ${clipNumber},
  "duration": "8 seconds",
  "data": {
    "shotType": "string",
    "camera": "string",
    "subject": "detailed visual description of characters provided in CHARACTERS block",
    "action": "specific movement",
    "context": "environment details",
    "style": "anime art style details",
    "ambiance": "lighting and mood",
    "audio": "sound effects"
  },
  "fullPrompt": "The complete compiled prompt string ready for copy-pasting"
}`;

    return { systemPrompt };
}

// ============================================================================
// LEGACY MASTER PROMPT (Keep for backward compatibility)
// ============================================================================

export function getSeriesPrompt(
    seriesBible: SeriesBible,
    characters: Character[],
    episodeConfig: EpisodeConfig,
    targetPlatform: string
): { systemPrompt: string } {
    const platformRule = getPlatformRule(targetPlatform);
    const arcGuidance = getArcGuidance(episodeConfig.episodeNumber);
    const characterBlock = buildCharacterBlock(
        // Filter if IDs work, otherwise use all
        characters.filter(c => episodeConfig.charactersAppearing.includes(c.id) || episodeConfig.charactersAppearing.includes(c.name))
    );

    const systemPrompt = `You are an expert anime scriptwriter and prompt engineer. Generate 9 video prompts (3 scenes × 3 clips of 8 seconds each) for Episode ${episodeConfig.episodeNumber} of "${seriesBible.title}".

=== SERIES BIBLE ===
Title: ${seriesBible.title}
Genre: ${seriesBible.genre}
Themes: ${seriesBible.themes?.join(', ') || ''}
Tone: ${seriesBible.toneGuide || ''}
World Rules: ${seriesBible.worldRules}

=== CHARACTERS THIS EPISODE ===
${characterBlock}

=== EPISODE REQUIREMENTS ===
- Episode Number: ${episodeConfig.episodeNumber} of ${seriesBible.totalEpisodes || 12}
- Arc Position: ${episodeConfig.arcPosition}
- Arc Guidance: ${arcGuidance}
- Required Story Beats: ${episodeConfig.requiredBeats?.join(', ') || 'Standard progression'}
- Previous Episode Summary: ${episodeConfig.previousSummary || 'First episode'}
- Setup for Next Episode: ${episodeConfig.nextEpisodeHook || ''}

=== TARGET PLATFORM ===
${targetPlatform.toUpperCase()} - ${platformRule || 'Standard settings'}

=== OUTPUT FORMAT ===
Generate EXACTLY this JSON structure:
{
  "episodeTitle": "string",
  "episodeSummary": "100-word summary",
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneType": "Introduction/Setup",
      "clips": [
        {
          "clipNumber": 1,
          "duration": "8 seconds",
          "shotType": "string (e.g., Wide tracking shot)",
          "camera": "string (e.g., Dolly forward, low angle)",
          "character": "character name",
          "action": "detailed action description",
          "context": "environment and setting",
          "style": "anime style details (cell-shaded, lighting, colors)",
          "ambiance": "mood, time of day, weather",
          "audio": "sound effects and music cues",
          "dialogue": "if any dialogue, include here"
        }
      ]
    }
  ],
  "characterStateChanges": {
    "characterName": { "emotional_state": "string", "knowledge_gained": "string" }
  },
  "plotThreadUpdates": {
    "threadName": "status update"
  },
  "cliffhanger": "setup for next episode"
}

CRITICAL RULES:
1. Each clip is EXACTLY 8 seconds - pace accordingly
2. Keep character descriptions IDENTICAL across all clips (copy-paste exact text)
3. Include "(no subtitles)" in every clip prompt
4. Use the Kishōtenketsu structure: Setup → Development → Twist → Resolution
5. End with a hook that makes viewers want the next episode`;

    return { systemPrompt };
}

// ============================================================================
// RESPONSE PARSER
// ============================================================================

export function parseSeriesResponse(content: string): any {
    try {
        // Clean markdown blocks
        let cleaned = content.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1").trim();
        // Extract JSON (find first { and last })
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(cleaned);
    } catch (e) {
        return {
            error: "Failed to parse episode structure",
            raw: content
        };
    }
}
