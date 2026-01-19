import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { redis } from '@/lib/redis'

// ===== IP RATE LIMITING CONFIG =====
const IP_RATE_LIMIT = {
    MAX_REQUESTS: 60,     // 60 requests per minute per IP (generous for browsing)
    API_MAX_REQUESTS: 20, // 20 API requests per minute per IP (stricter)
    WINDOW_SECONDS: 60
};

// In-memory fallback for IP rate limiting
const memoryIpLimiter = new Map<string, { count: number; resetAt: number }>();

// ===== HELPER: Get Client IP =====
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }
    return 'unknown';
}

// ===== HELPER: Check IP Rate Limit =====
async function checkIpRateLimit(ip: string, maxRequests: number): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ip_limit:${ip}`;

    try {
        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, IP_RATE_LIMIT.WINDOW_SECONDS);
        }

        if (count > maxRequests) {
            return { allowed: false, remaining: 0 };
        }

        return { allowed: true, remaining: maxRequests - count };
    } catch (redisError) {
        // Fallback to memory-based limiting
        const now = Date.now();
        const record = memoryIpLimiter.get(ip);

        if (!record || record.resetAt < now) {
            memoryIpLimiter.set(ip, { count: 1, resetAt: now + 60000 });
            return { allowed: true, remaining: maxRequests - 1 };
        }

        if (record.count >= maxRequests) {
            return { allowed: false, remaining: 0 };
        }

        record.count++;
        return { allowed: true, remaining: maxRequests - record.count };
    }
}

export async function middleware(request: NextRequest) {
    const clientIP = getClientIP(request);

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // ===== 1. IP-BASED RATE LIMITING (Pre-Auth) =====
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
    const maxRequests = isApiRoute ? IP_RATE_LIMIT.API_MAX_REQUESTS : IP_RATE_LIMIT.MAX_REQUESTS;

    // Skip rate limiting for health check
    if (request.nextUrl.pathname !== '/api/health') {
        const ipCheck = await checkIpRateLimit(clientIP, maxRequests);

        if (!ipCheck.allowed) {
            return NextResponse.json(
                { error: 'Too many requests from this IP. Please slow down.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(IP_RATE_LIMIT.WINDOW_SECONDS),
                        'X-RateLimit-Limit': String(maxRequests),
                        'X-RateLimit-Remaining': '0'
                    }
                }
            );
        }

        // Add rate limit headers
        response.headers.set('X-RateLimit-Remaining', String(ipCheck.remaining));
    }

    // ===== 2. SECURITY HEADERS =====
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // ===== 3. SUPABASE SESSION REFRESH =====
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // ===== 4. PROTECTED ROUTES =====
    const protectedRoutes = ['/generator', '/library'];
    const isProtectedRoute = protectedRoutes.some(path => request.nextUrl.pathname.startsWith(path));

    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // ===== 5. AUTH ROUTES (Redirect logged-in users) =====
    const authRoutes = ['/login', '/signup'];
    const isAuthRoute = authRoutes.some(path => request.nextUrl.pathname.startsWith(path));

    if (isAuthRoute && user) {
        const url = request.nextUrl.clone()
        url.pathname = '/generator'
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
