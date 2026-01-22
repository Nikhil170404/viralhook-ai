/**
 * Story Parser - Parse ChatGPT story output into structured data
 * Handles various formats users might paste
 */

export interface ParsedCharacter {
    id: string;
    name: string;
    role: 'hero' | 'friend' | 'villain' | 'mentor' | 'rival' | 'other';
    gender: string;
    age: number;
    visualDNA: string; // Compressed visual description for consistency
    hair: string;
    eyes: string;
    outfit: string;
    personality: string;
    powers: string;
    backstory?: string;
}

export interface ParsedStory {
    title: string;
    genre: string;
    worldRules: string;
    characters: ParsedCharacter[];
    episodeBrief: string;
    totalEpisodes: number;
    themes: string[];
}

export interface ParseResult {
    success: boolean;
    data?: ParsedStory;
    errors: string[];
    warnings: string[];
}

/**
 * Build Visual DNA - Compressed character description for Veo consistency
 * This exact string is used in EVERY prompt to maintain character identity
 */
function buildVisualDNA(char: Partial<ParsedCharacter>): string {
    const parts: string[] = [];

    // Core identity
    if (char.name) parts.push(char.name);
    if (char.age) parts.push(`${char.age}yo`);
    if (char.gender) parts.push(char.gender);

    // Visual features (order matters for AI parsing)
    if (char.hair) parts.push(`hair: ${char.hair}`);
    if (char.eyes) parts.push(`eyes: ${char.eyes}`);
    if (char.outfit) parts.push(`wearing ${char.outfit}`);

    return parts.join(', ');
}

/**
 * Extract role from text
 */
function extractRole(text: string): ParsedCharacter['role'] {
    const lower = text.toLowerCase();
    if (lower.includes('hero') || lower.includes('protagonist') || lower.includes('main character')) return 'hero';
    if (lower.includes('villain') || lower.includes('antagonist') || lower.includes('enemy')) return 'villain';
    if (lower.includes('mentor') || lower.includes('teacher') || lower.includes('master')) return 'mentor';
    if (lower.includes('rival')) return 'rival';
    if (lower.includes('friend') || lower.includes('ally') || lower.includes('companion')) return 'friend';
    return 'other';
}

/**
 * Parse a character block from text
 */
function parseCharacterBlock(block: string): ParsedCharacter | null {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

    const char: Partial<ParsedCharacter> = {
        id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    };

    for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;

        const key = line.substring(0, colonIndex).toLowerCase().trim();
        const value = line.substring(colonIndex + 1).trim();

        if (!value) continue;

        switch (key) {
            case 'name':
                char.name = value;
                break;
            case 'role':
                char.role = extractRole(value);
                break;
            case 'gender':
                char.gender = value.toLowerCase();
                break;
            case 'age':
                char.age = parseInt(value) || 18;
                break;
            case 'hair':
                char.hair = value;
                break;
            case 'eyes':
                char.eyes = value;
                break;
            case 'outfit':
                char.outfit = value;
                break;
            case 'personality':
                char.personality = value;
                break;
            case 'powers':
            case 'abilities':
                char.powers = value;
                break;
            case 'backstory':
            case 'background':
                char.backstory = value;
                break;
        }
    }

    // Must have at least name
    if (!char.name) return null;

    // Set defaults
    char.role = char.role || 'other';
    char.gender = char.gender || 'unknown';
    char.age = char.age || 18;
    char.hair = char.hair || '';
    char.eyes = char.eyes || '';
    char.outfit = char.outfit || '';
    char.personality = char.personality || '';
    char.powers = char.powers || '';

    // Build visual DNA
    char.visualDNA = buildVisualDNA(char);

    return char as ParsedCharacter;
}

/**
 * Main parser function
 */
export function parseStoryText(text: string): ParseResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!text || text.length < 100) {
        return { success: false, errors: ['Text too short. Paste your full story from ChatGPT.'], warnings };
    }

    const result: Partial<ParsedStory> = {
        characters: [],
        themes: [],
        totalEpisodes: 24
    };

    // === EXTRACT TITLE ===
    const titleMatch = text.match(/(?:SERIES\s+)?TITLE\s*:\s*(.+?)(?:\n|$)/i);
    if (titleMatch) {
        result.title = titleMatch[1].trim();
    } else {
        warnings.push('Could not find SERIES TITLE. Using default.');
        result.title = 'Untitled Series';
    }

    // === EXTRACT GENRE ===
    const genreMatch = text.match(/GENRE\s*:\s*(.+?)(?:\n|$)/i);
    if (genreMatch) {
        result.genre = genreMatch[1].trim();
    } else {
        result.genre = 'Action / Fantasy';
    }

    // === EXTRACT WORLD RULES ===
    const worldMatch = text.match(/WORLD\s*RULES?\s*:\s*([\s\S]+?)(?=\n\s*(?:HERO|FRIEND|VILLAIN|MENTOR|RIVAL|CHARACTER|EPISODE|$))/i);
    if (worldMatch) {
        result.worldRules = worldMatch[1].trim().replace(/\n+/g, ' ');
    } else {
        result.worldRules = '';
    }

    // === EXTRACT EPISODE BRIEF ===
    const episodeMatch = text.match(/EPISODE\s*(?:\d+[-–]\d+)?\s*(?:BRIEF|OVERVIEW|SUMMARY)?\s*:\s*([\s\S]+?)$/i);
    if (episodeMatch) {
        result.episodeBrief = episodeMatch[1].trim();
    } else {
        // Try to find episode descriptions anywhere
        const epLines = text.match(/Ep(?:isode)?\s*\d+[-–]?\d*\s*[:(]\s*[^)]+\)?/gi);
        if (epLines) {
            result.episodeBrief = epLines.join('\n');
        }
    }

    // === EXTRACT CHARACTERS ===
    // Split by character headers
    const characterPatterns = [
        /(?:HERO|MAIN)\s*(?:CHARACTER)?\s*:/gi,
        /FRIEND\s*\d*\s*:/gi,
        /(?:MAIN\s*)?VILLAIN\s*:/gi,
        /MENTOR\s*:/gi,
        /RIVAL\s*:/gi,
        /(?:SIDE\s*)?CHARACTER\s*\d*\s*:/gi,
        /ALLY\s*\d*\s*:/gi
    ];

    // Find all character block starts
    const blockStarts: { index: number; type: string }[] = [];

    for (const pattern of characterPatterns) {
        let match;
        const regex = new RegExp(pattern.source, 'gi');
        while ((match = regex.exec(text)) !== null) {
            blockStarts.push({ index: match.index, type: match[0] });
        }
    }

    // Sort by position
    blockStarts.sort((a, b) => a.index - b.index);

    // Extract each character block
    for (let i = 0; i < blockStarts.length; i++) {
        const start = blockStarts[i].index;
        const end = blockStarts[i + 1]?.index || text.length;
        const block = text.substring(start, end);

        const char = parseCharacterBlock(block);
        if (char) {
            // Set role based on header if not explicit
            if (!char.role || char.role === 'other') {
                const header = blockStarts[i].type.toLowerCase();
                char.role = extractRole(header);
            }
            result.characters!.push(char);
        }
    }

    // === VALIDATION ===
    if (result.characters!.length === 0) {
        errors.push('No characters found. Make sure to include character blocks with Name:, Hair:, Eyes:, etc.');
    }

    if (!result.title || result.title === 'Untitled Series') {
        warnings.push('Title not found or using default.');
    }

    if (!result.worldRules) {
        warnings.push('World rules not found. Add WORLD RULES: section for better consistency.');
    }

    // Extract themes from genre
    if (result.genre) {
        result.themes = result.genre.split(/[\/,]/).map(t => t.trim()).filter(Boolean);
    }

    if (errors.length > 0) {
        return { success: false, errors, warnings };
    }

    return {
        success: true,
        data: result as ParsedStory,
        errors: [],
        warnings
    };
}

/**
 * Regenerate Visual DNA for a character (after edits)
 */
export function regenerateVisualDNA(char: ParsedCharacter): string {
    return buildVisualDNA(char);
}

/**
 * Format characters for prompt injection
 * Returns compressed string optimized for Veo
 */
export function formatCharactersForPrompt(characters: ParsedCharacter[]): string {
    return characters.map(c =>
        `[${c.name.toUpperCase()}]: ${c.visualDNA}${c.powers ? ` | Powers: ${c.powers}` : ''}`
    ).join('\n');
}

/**
 * Get character by name (case-insensitive)
 */
export function findCharacterByName(characters: ParsedCharacter[], name: string): ParsedCharacter | undefined {
    const lower = name.toLowerCase();
    return characters.find(c => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase()));
}
