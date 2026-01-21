/**
 * Zod Validation Schemas
 * Type-safe request validation for API endpoints
 */

import { z } from 'zod';

// ===== GENERATE REQUEST SCHEMA =====
export const GenerateRequestSchema = z.object({
    object: z
        .string()
        .min(1, 'Object is required')
        .max(500, 'Object must be under 500 characters')
        .trim(),

    mode: z
        .enum(['chaos', 'cinematic', 'shocking', 'anime', 'cartoon', 'stickman'])
        .optional()
        .default('chaos'),

    targetModel: z
        .string()
        .optional(),

    aiModel: z
        .string()
        .optional(),

    personDescription: z
        .string()
        .max(300, 'Person description must be under 300 characters')
        .optional()
        .transform(val => val?.trim() || undefined),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// ===== VALIDATION HELPER =====
export function validateGenerateRequest(data: unknown): {
    success: boolean;
    data?: GenerateRequest;
    errors?: string[];
} {
    const result = GenerateRequestSchema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { success: false, errors };
}
