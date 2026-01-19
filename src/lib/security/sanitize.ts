/**
 * Input Sanitization & Prompt Injection Defense
 * Protects against malicious AI prompt manipulation
 */

// ===== INJECTION PATTERN BLOCKLIST =====
const INJECTION_PATTERNS = [
    // Direct instruction override attempts
    /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i,
    /disregard\s+(all\s+)?(previous|prior|above)/i,
    /forget\s+(everything|all|what)/i,

    // Role manipulation
    /you\s+are\s+(now|actually|really)/i,
    /pretend\s+(to\s+be|you('re|\s+are))/i,
    /act\s+as\s+(if|though)/i,
    /roleplay\s+as/i,

    // System prompt extraction
    /reveal\s+(your|the)\s+(system|initial)\s+prompt/i,
    /show\s+(me\s+)?(your|the)\s+instructions/i,
    /what\s+(are|were)\s+your\s+(original\s+)?instructions/i,
    /print\s+(your\s+)?(system\s+)?prompt/i,

    // Code/command injection
    /```[\s\S]*?(eval|exec|system|os\.|subprocess)/i,
    /<script[\s\S]*?>/i,
    /\$\{[\s\S]*?\}/,  // Template literal injection

    // Data exfiltration attempts
    /return\s+(the\s+)?(api|secret|key|token|password)/i,
    /output\s+(the\s+)?(api|secret|key|token|password)/i,
    /what('s|\s+is)\s+(the|your)\s+(api|secret)\s*key/i,

    // Jailbreak patterns
    /DAN\s*mode/i,
    /developer\s*mode/i,
    /jailbreak/i,
    /bypass\s+(safety|filter|restriction)/i,
];

// ===== CONFIGURATION =====
export const SANITIZE_CONFIG = {
    MAX_OBJECT_LENGTH: 500,
    MAX_PERSON_LENGTH: 300,
    MAX_TOTAL_LENGTH: 1000,
} as const;

// ===== TYPES =====
export interface SanitizeResult {
    isValid: boolean;
    sanitized: string;
    violations: string[];
}

// ===== MAIN SANITIZATION FUNCTION =====
export function sanitizeInput(input: string, maxLength: number = 500): SanitizeResult {
    const violations: string[] = [];

    if (!input || typeof input !== 'string') {
        return { isValid: false, sanitized: '', violations: ['Empty or invalid input'] };
    }

    let sanitized = input.trim();

    // 1. Length check
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
        violations.push(`Input truncated to ${maxLength} characters`);
    }

    // 2. Check for injection patterns
    for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(sanitized)) {
            violations.push(`Blocked injection pattern detected`);
            return { isValid: false, sanitized: '', violations };
        }
    }

    // 3. Remove dangerous characters (keep basic punctuation)
    // Allow: letters, numbers, spaces, basic punctuation (, . ! ? ' " - :)
    sanitized = sanitized.replace(/[<>{}$\\`]/g, '');

    // 4. Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // 5. Block empty after sanitization
    if (sanitized.length < 2) {
        return { isValid: false, sanitized: '', violations: ['Input too short after sanitization'] };
    }

    return { isValid: true, sanitized, violations };
}

// ===== OBJECT SANITIZATION =====
export function sanitizeObject(object: string): SanitizeResult {
    return sanitizeInput(object, SANITIZE_CONFIG.MAX_OBJECT_LENGTH);
}

// ===== PERSON DESCRIPTION SANITIZATION =====
export function sanitizePersonDescription(description: string | undefined): SanitizeResult {
    if (!description) {
        return { isValid: true, sanitized: '', violations: [] };
    }
    return sanitizeInput(description, SANITIZE_CONFIG.MAX_PERSON_LENGTH);
}

// ===== ESCAPE FOR AI PROMPT =====
export function escapeForPrompt(text: string): string {
    // Escape quotes and backslashes to prevent prompt breaking
    return text
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, ' ')
        .trim();
}

// ===== VALIDATE ALL INPUTS =====
export interface ValidateInputsResult {
    isValid: boolean;
    object: string;
    personDescription?: string;
    errors: string[];
}

export function validateAndSanitizeInputs(
    object: string,
    personDescription?: string
): ValidateInputsResult {
    const errors: string[] = [];

    // Sanitize object (required)
    const objectResult = sanitizeObject(object);
    if (!objectResult.isValid) {
        errors.push(`Object: ${objectResult.violations.join(', ')}`);
    }

    // Sanitize person description (optional)
    let sanitizedPerson: string | undefined;
    if (personDescription) {
        const personResult = sanitizePersonDescription(personDescription);
        if (!personResult.isValid) {
            errors.push(`Person description: ${personResult.violations.join(', ')}`);
        } else {
            sanitizedPerson = personResult.sanitized || undefined;
        }
    }

    return {
        isValid: errors.length === 0,
        object: objectResult.sanitized,
        personDescription: sanitizedPerson,
        errors
    };
}
