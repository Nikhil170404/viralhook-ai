/**
 * Content Moderation - NSFW/Violence Filter
 * Blocks prohibited content before AI generation
 */

// ===== BLOCKLIST CATEGORIES =====
const NSFW_TERMS = [
    'nude', 'naked', 'porn', 'xxx', 'sexual', 'erotic', 'hentai',
    'explicit', 'adult content', 'nsfw', 'onlyfans', 'strip',
    'genitals', 'breasts', 'buttocks', 'sex act', 'orgasm',
    'masturbat', 'intercourse', 'fetish', 'bondage', 'bdsm'
];

const VIOLENCE_TERMS = [
    'murder', 'kill', 'torture', 'gore', 'mutilate', 'dismember',
    'decapitat', 'execution', 'assassinat', 'massacre', 'genocide',
    'terrorist', 'bomb', 'shooting', 'stabbing', 'blood splatter',
    'child abuse', 'child harm', 'pedophil', 'rape', 'assault'
];

const ILLEGAL_TERMS = [
    'drug deal', 'cocaine', 'heroin', 'methamphetamine', 'fentanyl',
    'hack into', 'steal credit', 'identity theft', 'fraud',
    'counterfeit', 'money launder', 'weapon', 'firearm illegal'
];

const HATE_SPEECH = [
    'racist', 'nazi', 'white supremac', 'ethnic cleansing',
    'homophobic', 'transphobic', 'slur', 'hate crime'
];

// Compile all into one list
const ALL_BLOCKED = [...NSFW_TERMS, ...VIOLENCE_TERMS, ...ILLEGAL_TERMS, ...HATE_SPEECH];

// ===== TYPES =====
export interface ModerationResult {
    isAllowed: boolean;
    category?: 'nsfw' | 'violence' | 'illegal' | 'hate' | 'unknown';
    flaggedTerms: string[];
    message?: string;
}

// ===== MAIN MODERATION FUNCTION =====
export function moderateContent(text: string): ModerationResult {
    if (!text) {
        return { isAllowed: true, flaggedTerms: [] };
    }

    const lowerText = text.toLowerCase();
    const flaggedTerms: string[] = [];
    let category: ModerationResult['category'];

    // Check each blocklist
    for (const term of NSFW_TERMS) {
        if (lowerText.includes(term)) {
            flaggedTerms.push(term);
            category = 'nsfw';
        }
    }

    for (const term of VIOLENCE_TERMS) {
        if (lowerText.includes(term)) {
            flaggedTerms.push(term);
            category = category || 'violence';
        }
    }

    for (const term of ILLEGAL_TERMS) {
        if (lowerText.includes(term)) {
            flaggedTerms.push(term);
            category = category || 'illegal';
        }
    }

    for (const term of HATE_SPEECH) {
        if (lowerText.includes(term)) {
            flaggedTerms.push(term);
            category = category || 'hate';
        }
    }

    if (flaggedTerms.length > 0) {
        return {
            isAllowed: false,
            category,
            flaggedTerms,
            message: `Content blocked: ${category} content detected`
        };
    }

    return { isAllowed: true, flaggedTerms: [] };
}

// ===== MODERATE ALL INPUTS =====
export function moderateAllInputs(object: string, personDescription?: string): ModerationResult {
    // Check object
    const objectResult = moderateContent(object);
    if (!objectResult.isAllowed) {
        return objectResult;
    }

    // Check person description
    if (personDescription) {
        const personResult = moderateContent(personDescription);
        if (!personResult.isAllowed) {
            return personResult;
        }
    }

    return { isAllowed: true, flaggedTerms: [] };
}
