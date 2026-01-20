export class AdvancedPromptFilter {
    private readonly DANGER_THRESHOLD = 70;

    // Multi-score detection system
    private patterns = {
        CRITICAL: {
            score: 100,
            patterns: [
                /ignore\s+(all\s+)?(previous|prior|system)\s+(instructions?|prompts?|rules?)/i,
                /you\s+are\s+(now|actually)\s+(a|in)\s+developer\s+mode/i,
                /system\s*:\s*(override|bypass|disable)/i,
                /<\|im_start\|>|<\|im_end\|>/i, // ChatML tokens
                /\[INST\]|\[\/INST\]/i, // Llama tokens
                /```python[\s\S]*?(?:eval|exec|__import__)/i,
            ]
        },
        HIGH: {
            score: 60,
            patterns: [
                /pretend\s+(?:to\s+be|you'?re)\s+(?:an?|the)/i,
                /act\s+as\s+(?:if|though|a)/i,
                /forget\s+(?:all|everything|previous)/i,
                /from\s+now\s+on/i,
                /new\s+(?:rule|instruction|system)/i,
            ]
        },
        MEDIUM: {
            score: 40,
            patterns: [
                /bypass\s+(?:filter|safety|moderation)/i,
                /jailbreak|DAN\s+mode/i,
                /sudo\s+mode/i,
            ]
        }
    };

    // Unicode obfuscation detection
    private detectUnicodeObfuscation(text: string): number {
        // Check for lookalike characters (e.g., Cyrillic 'а' vs Latin 'a')
        // A simple heuristic is to check for mixed scripts or specific homoglyphs
        const suspiciousUnicode = [
            /ɪɢɴᴏʀᴇ/gi,      // Small caps
            /іɡпоrе/gi,      // Cyrillic lookalikes
            /ｉｇｎｏｒｅ/gi,    // Fullwidth
        ];

        for (const pattern of suspiciousUnicode) {
            if (pattern.test(text)) return 80;
        }
        return 0;
    }

    // Base64/Hex encoding detection
    private detectEncoding(text: string): number {
        // Base64 (require 50+ chars to avoid false positives on IDs)
        if (/[A-Za-z0-9+/]{50,}={0,2}/.test(text)) {
            try {
                const match = text.match(/[A-Za-z0-9+/]{50,}={0,2}/);
                if (match) {
                    let decoded = '';
                    // Try explicit Buffer first (Node env) then atob (Browser/Edge)
                    if (typeof Buffer !== 'undefined') {
                        decoded = Buffer.from(match[0], 'base64').toString('utf-8');
                    } else if (typeof atob === 'function') {
                        decoded = atob(match[0]);
                    }

                    // Check if decoded contains dangerous patterns
                    if (/ignore|bypass|system|prompt/i.test(decoded)) {
                        return 80;
                    }
                    return 30; // Suspicious encoding but generic content
                }
            } catch {
                return 0;
            }
        }

        // Hex encoding (e.g., \x69\x67\x6e\x6f\x72\x65)
        if (/(?:\\[xX][0-9a-fA-F]{2}){5,}/.test(text)) return 70;

        return 0;
    }

    // Typosquatting detection (Levenshtein distance)
    private detectTyposquatting(text: string): number {
        const dangerWords = ['ignore', 'bypass', 'override', 'reveal', 'system'];
        const words = text.toLowerCase().match(/\b\w{5,}\b/g) || [];

        for (const word of words) {
            for (const danger of dangerWords) {
                if (this.levenshtein(word, danger) <= 2 && word !== danger) {
                    // Basic check to ensure it's not a common valid word? 
                    // For "ignore", typos could be "ignor", "ignore", "ignoe".
                    // "System" -> "systm".
                    // This is a naive check but effective for targeted typos.
                    return 50;
                }
            }
        }
        return 0;
    }

    private levenshtein(a: string, b: string): number {
        const matrix: number[][] = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // Main detection method
    detectInjection(text: string): { blocked: boolean; score: number; reason: string } {
        let totalScore = 0;
        const reasons: string[] = [];

        // 1. Pattern matching
        for (const [severity, config] of Object.entries(this.patterns)) {
            for (const pattern of config.patterns) {
                if (pattern.test(text)) {
                    totalScore += config.score;
                    reasons.push(`${severity} pattern detected`);
                    break; // Only count once per severity level
                }
            }
        }

        // 2. Unicode obfuscation
        const unicodeScore = this.detectUnicodeObfuscation(text);
        if (unicodeScore > 0) {
            totalScore += unicodeScore;
            reasons.push('Unicode obfuscation');
        }

        // 3. Encoding detection
        const encodingScore = this.detectEncoding(text);
        if (encodingScore > 0) {
            totalScore += encodingScore;
            reasons.push('Suspicious encoding');
        }

        // 4. Typosquatting
        const typoScore = this.detectTyposquatting(text);
        if (typoScore > 0) {
            totalScore += typoScore;
            reasons.push('Typosquatting detected');
        }

        // 5. Excessive length (potential complexity attack)
        if (text.length > 2000) {
            totalScore += 20;
            reasons.push('Excessive length');
        }

        return {
            blocked: totalScore >= this.DANGER_THRESHOLD,
            score: totalScore,
            reason: reasons.join(', ') || 'Safe'
        };
    }
}

export const advancedPromptFilter = new AdvancedPromptFilter();
