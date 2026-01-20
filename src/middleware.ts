import { NextResponse, type NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { createServerClient } from '@supabase/ssr'

// Initialize Upstash Redis (Edge-compatible)
// Explicitly using separate client for Middleware to ensure Edge compatibility 
// (avoiding ioredis import from @/lib/redis)
const redis = Redis.fromEnv();

// Rate Limiter for IP usage (DoS protection)
const ipRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 req/min per IP
    analytics: true,
    prefix: "rl:ip",
});

const apiIpRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 req/min for API per IP
    analytics: true,
    prefix: "rl:api_ip",
});

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // ===== 1. SECURITY HEADERS =====
    // HSTS (Strict-Transport-Security)
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // X-Frame-Options (Clickjacking protection)
    response.headers.set('X-Frame-Options', 'DENY');

    // X-Content-Type-Options (MIME sniffing protection)
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Referrer-Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content-Security-Policy (CSP)
    // Permissive initially to ensure images/scripts don't break, but blocking object/base
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co https://*.hcaptcha.com https://hcaptcha.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data: https://*.supabase.co https://*.googleusercontent.com",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co https://*.hcaptcha.com https://hcaptcha.com https://api.openai.com https://openrouter.ai https://*.upstash.io",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);

    // ===== 2. IP RATE LIMITING =====
    // Skip for static assets and health checks
    if (
        !request.nextUrl.pathname.startsWith('/_next') &&
        !request.nextUrl.pathname.startsWith('/static') &&
        request.nextUrl.pathname !== '/api/health' &&
        !request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
    ) {
        // Get IP
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

        const isApi = request.nextUrl.pathname.startsWith('/api/');
        const limiter = isApi ? apiIpRateLimiter : ipRateLimiter;

        try {
            const { success, limit, remaining, reset } = await limiter.limit(ip);

            response.headers.set('X-RateLimit-Limit', limit.toString());
            response.headers.set('X-RateLimit-Remaining', remaining.toString());

            if (!success) {
                return NextResponse.json(
                    { error: 'Too many requests. Please slow down.' },
                    {
                        status: 429,
                        headers: {
                            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
                            'X-RateLimit-Limit': limit.toString(),
                            'X-RateLimit-Remaining': '0',
                            ...Object.fromEntries(response.headers)
                        }
                    }
                );
            }
        } catch (e) {
            // Fail open if Redis is down (to prevent blocking legit users during outage)
            console.error("Middleware RateLimit Error:", e);
        }
    }

    // ===== 3. SUPABASE AUTH SESSION REFRESH =====
    // This is critical for Server Components to work with updated cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // Refresh session if expired - required for Server Components
    // getUser() in pages will validate this token
    await supabase.auth.getSession()

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
