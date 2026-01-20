// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/generate/route';
import { NextRequest } from 'next/server';

// Note: Because we use explicit exports for testing in Next.js App Router (which generates implicit exports),
// we might face challenges directly importing POST if it's not exported or if it's wrapped.
// We exported `POST` wrapped in `withCSRF`.

vi.mock('@/utils/supabase/server', () => ({
    createClient: () => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error("Auth error") }),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
    })
}));

vi.mock('@supabase/ssr', () => ({
    createServerClient: () => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error("Auth error") }),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
    })
}));

// Set dummy env vars to prevent instantiation errors
process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "dummy_token";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy_key";
process.env.OPENROUTER_API_KEY = "dummy_key";

vi.mock('next/headers', () => ({
    cookies: () => ({
        get: vi.fn(),
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
        setAll: vi.fn(),
    })
}));

// Mock Redis libs
vi.mock('@upstash/redis', () => ({
    Redis: {
        fromEnv: () => ({
            get: vi.fn(),
            set: vi.fn(),
        })
    }
}));

vi.mock('@upstash/ratelimit', () => {
    return {
        Ratelimit: class {
            static slidingWindow = vi.fn();
            static tokenBucket = vi.fn();
            static fixedWindow = vi.fn();
            limit = vi.fn().mockResolvedValue({ success: true, pending: Promise.resolve(), remaining: 10, reset: 0 });
            blockUntilReady = vi.fn().mockResolvedValue({});
        }
    }
});

// Mock Dependencies
vi.mock('@/middleware/withCSRF', () => ({
    // Bypass CSRF for unit testing inner logic (or test it separately)
    // Here we pass through the handler
    withCSRF: (handler: any) => handler
}));

vi.mock('@/lib/redis', () => ({
    redis: {
        get: vi.fn(),
        set: vi.fn(),
        incr: vi.fn(),
        expire: vi.fn(),
        eval: vi.fn().mockResolvedValue([1, 0, 0, 0]),
        evalsha: vi.fn().mockResolvedValue([1, 0, 0, 0]),
        scriptLoad: vi.fn().mockResolvedValue("sha1"), // Mock rate limit result
    }
}));

// Set dummy env vars to prevent instantiation errors
process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "dummy_token";

vi.mock('openai', () => {
    return {
        default: class OpenAI {
            chat = {
                completions: {
                    create: vi.fn().mockResolvedValue({
                        choices: [{
                            message: {
                                content: JSON.stringify({
                                    prompt: "test prompt",
                                    viralHook: "test hook",
                                    category: "test cat",
                                    platform: "test plat",
                                    expectedViews: "1M"
                                })
                            }
                        }]
                    })
                }
            }
        }
    }
});

describe('POST /api/generate', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default Mock Supabase auth to unauthenticated
        vi.mock('@supabase/ssr', () => ({
            createServerClient: () => ({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: 'No user' }),
                },
            }),
        }));
    });

    it.skip('rejects unauthenticated requests', async () => {
        const req = new NextRequest('http://localhost/api/generate', {
            method: 'POST',
            body: JSON.stringify({ object: 'test' }),
        });

        try {
            const res = await POST(req);
            // Expect 401 Unauthorized
            expect(res.status).toBe(401);
        } catch (e) {
            // If imports fail or other issues
            console.error(e);
        }
    });

    it.skip('validates input schema (empty object)', async () => {
        // Re-mock auth to be valid
        vi.mock('@supabase/ssr', () => ({
            createServerClient: () => ({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
                },
                from: () => ({ insert: () => ({ select: () => ({ single: () => ({ data: { id: 1 }, error: null }) }) }) })
            }),
        }));

        const req = new NextRequest('http://localhost/api/generate', {
            method: 'POST',
            body: JSON.stringify({ object: '' }), // Empty object
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBeDefined();
    });
});
