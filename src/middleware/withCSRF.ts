import { NextRequest, NextResponse } from 'next/server';

const CSRF_SECRET = process.env.CSRF_SECRET || 'your-secret-key-change-in-production';
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf_token';

function generateToken(): string {
    if (typeof crypto === 'undefined') {
        // Fallback for environments without crypto (should not happen in Next.js Edge/Node)
        return Math.random().toString(36).substring(2);
    }
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function verifyToken(cookie: string, header: string): boolean {
    if (!cookie || !header || cookie.length !== header.length) return false;

    // Constant-time comparison
    let result = 0;
    for (let i = 0; i < cookie.length; i++) {
        result |= cookie.charCodeAt(i) ^ header.charCodeAt(i);
    }
    return result === 0;
}

export function withCSRF(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
        const method = req.method.toUpperCase();

        // Protect all mutation operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
            const headerToken = req.headers.get(CSRF_TOKEN_HEADER);

            // Detailed validation logs
            console.log(`[CSRF] ${method} ${req.nextUrl.pathname} | Cookie: ${cookieToken ? 'OK' : 'MISSING'} | Header: ${headerToken ? 'OK' : 'MISSING'}`);

            if (!cookieToken || !headerToken || !verifyToken(cookieToken, headerToken)) {
                // If it's production and the cookie is missing, we might have a cold start / first visit issue.
                // However, security first. Let's just ensure we set it on GET.
                return NextResponse.json(
                    { error: 'Security validation failed. Please refresh the page.' },
                    { status: 403 }
                );
            }
        }

        const response = await handler(req);

        // Set CSRF token cookie if not present (for GET requests or initial load)
        // Note: In API routes, we might not always want to set it if it's a pure API call from non-browser
        // But for Next.js app, setting it on safe methods is standard double-submit pattern.
        if (!req.cookies.get(CSRF_COOKIE)) {
            const token = generateToken();
            response.cookies.set(CSRF_COOKIE, token, {
                httpOnly: false, // Must be accessible by JS to read and send in header
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24, // 24 hours
            });
        }

        return response;
    };
}
