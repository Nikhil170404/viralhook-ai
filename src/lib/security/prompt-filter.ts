export class PromptInjectionFilter {
    private dangerousPatterns = [
        /ignore\s+(all\s+)?previous\s+instructions?/i,
        /you\s+are\s+now\s+(in\s+)?developer\s+mode/i,
        /system\s+override/i,
        /reveal\s+(your\s+)?prompt/i,
        /bypass\s+(all\s+)?restrictions?/i,
        /delete\s+all\s+files/i,
        /drop\s+table/i,
    ];

    private fuzzyTargets = ['ignore', 'bypass', 'override', 'reveal', 'delete', 'system'];

    detectInjection(text: string): { blocked: boolean; reason?: string } {
        // 1. Pattern matching
        for (const pattern of this.dangerousPatterns) {
            if (pattern.test(text)) {
                return { blocked: true, reason: 'dangerous_pattern' };
            }
        }

        // 2. Fuzzy Keyword Detection (Typoglycemia + Levenshtein)
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        for (const word of words) {
            for (const target of this.fuzzyTargets) {
                if (this.isFuzzyMatch(word, target)) {
                    return { blocked: true, reason: 'obfuscated_keyword' };
                }
            }
        }

        // 3. Encoding detection (Base64 heuristic)
        if (/[A-Za-z0-9+/]{40,}={0,2}/.test(text)) {
            // Increased length to 40 to avoid false positives on legitimate hashes/IDs
            return { blocked: true, reason: 'possible_encoding' };
        }

        return { blocked: false };
    }

    private isFuzzyMatch(word: string, target: string): boolean {
        if (word === target) return true;

        // Typoglycemia (Scrambled internal letters, same start/end, same length)
        if (word.length === target.length && word.length > 3) {
            if (word[0] === target[0] && word.slice(-1) === target.slice(-1)) {
                const sortedWord = [...word.slice(1, -1)].sort().join('');
                const sortedTarget = [...target.slice(1, -1)].sort().join('');
                if (sortedWord === sortedTarget) return true;
            }
        }

        // Levenshtein Distance (Allow 1 edit for words > 4 chars)
        // Avoids short word noise (e.g. 'pass' vs 'past')
        if (target.length > 4) {
            // If length diff > 1, impossible to be distance 1
            if (Math.abs(word.length - target.length) > 1) return false;
            return this.levenshtein(word, target) <= 1;
        }
        return false;
    }

    private levenshtein(a: string, b: string): number {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

        for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
                const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1, // deletion
                    matrix[j - 1][i] + 1, // insertion
                    matrix[j - 1][i - 1] + indicator // substitution
                );
            }
        }
        return matrix[b.length][a.length];
    }
}

export const promptInjectionFilter = new PromptInjectionFilter();
