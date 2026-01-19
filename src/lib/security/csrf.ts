/**
 * CSRF Token Protection
 * Generates and validates CSRF tokens for mutation endpoints
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

// ===== GENERATE RANDOM TOKEN =====
function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const randomValues = new Uint8Array(TOKEN_LENGTH);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < TOKEN_LENGTH; i++) {
        token += chars[randomValues[i] % chars.length];
    }
    return token;
}

// ===== GET OR CREATE CSRF TOKEN (Server Action) =====
export async function getOrCreateCsrfToken(): Promise<string> {
    const cookieStore = await cookies();
    let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;

    if (!token) {
        token = generateToken();
        // Note: Setting cookie should be done in middleware or API route
        // This function returns the token for the caller to set
    }

    return token;
}

// ===== SET CSRF COOKIE (for API Route/Middleware) =====
export function setCsrfCookie(token: string, response: Response): Response {
    const cookieValue = `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Secure`;
    response.headers.append('Set-Cookie', cookieValue);
    return response;
}

// ===== VALIDATE CSRF TOKEN =====
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
    // Get token from cookie
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

    // Get token from header
    const headerToken = request.headers.get(CSRF_HEADER_NAME);

    // Both must exist and match
    if (!cookieToken || !headerToken) {
        return false;
    }

    // Constant-time comparison to prevent timing attacks
    if (cookieToken.length !== headerToken.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < cookieToken.length; i++) {
        result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
    }

    return result === 0;
}

// ===== MIDDLEWARE HELPER =====
export function isMutationMethod(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}
