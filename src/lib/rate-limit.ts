import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Redis client (re-used from existing config if possible, but Ratelimit needs Upstash client)
// We use the one imported from @/lib/redis or create new if needed.
// Create a dedicated Upstash Redis client for Rate Limiting
// ensuring compatibility with @upstash/ratelimit
const redis = Redis.fromEnv();

// --- Burst Rate Limiters (DoS Protection) ---
// Uses @upstash/ratelimit for sliding window consistency
export const rateLimiters = {
    anonymous: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 req/min
        prefix: "rl:anon",
        analytics: true,
    }),
    authenticated: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 req/min
        prefix: "rl:auth",
    }),
    aiGeneration: new Ratelimit({
        redis,
        limiter: Ratelimit.tokenBucket(10, "1 m", 2), // 10 tokens, refill 2/min (Strict)
        prefix: "rl:ai",
    }),
};

export async function checkBurstLimit(identifier: string, type: keyof typeof rateLimiters) {
    const { success, limit, remaining, reset } = await rateLimiters[type].limit(identifier);
    return {
        success,
        headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
        }
    };
}

// --- Daily Usage Quota (Business Logic) ---
// Explicitly Redis-only (No memory fallback) to prevent inconsistencies in serverless.
const LIMITS = {
    FREE: 10,
    PRO: 1000,
};

export async function checkUserRateLimit(userId: string, plan: 'free' | 'pro' = 'free') {
    const limit = plan === 'pro' ? LIMITS.PRO : LIMITS.FREE;
    // Daily key: usage:user_id:2023-10-27
    const key = `usage:${userId}:${new Date().toISOString().split('T')[0]}`;

    try {
        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, 86400); // 24h
        }

        return {
            allowed: count <= limit,
            remaining: Math.max(0, limit - count),
            count
        };
    } catch (e) {
        console.error("Redis User Quota Error:", e);
        // Fail closed for security/consistency in Redis-only mode?
        // Or fail open to allow user access if Redis down?
        // Request said "Redis-only rate limiting... Remove in-memory fallback".
        // This implies if Redis fails, we might blocking or erroring is better than inconsistent memory state.
        // However, usually Fail Open is better for UX.
        // But strict security request implies consistency.
        // I will return Not Allowed if system error, to be safe?
        // No, I'll return allowed: false with error log.
        return { allowed: false, remaining: 0, count: -1, error: true };
    }
}

export async function incrementUserUsageDB(userId: string, supabaseClient: any) {
    try {
        const { error } = await supabaseClient.rpc('increment_user_usage', { target_user_id: userId });
        if (error) {
            console.error("Failed to increment DB usage stats:", error);
        }
    } catch (e) {
        console.error("DB Usage Update Exception:", e);
    }
}
