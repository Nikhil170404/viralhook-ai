import { redis } from '@/lib/redis';

const LIMITS = {
    FREE: 10,
    PRO: 1000, // Effectively unlimited for now
};

// In-memory fallback
const memoryStore = new Map<string, { count: number, resetAt: number }>();
const CLEANUP_INTERVAL = 60000; // 1 min (Lazy check limit)
let lastCleanup = Date.now();

function cleanupMemory() {
    const now = Date.now();
    // Only cleanup max once per minute to avoid CPU spikes
    if (now - lastCleanup < CLEANUP_INTERVAL) return;

    for (const [key, val] of memoryStore.entries()) {
        if (val.resetAt < now) {
            memoryStore.delete(key);
        }
    }
    lastCleanup = now;
}

export async function checkUserRateLimit(userId: string, plan: 'free' | 'pro' = 'free') {
    cleanupMemory(); // Lazy cleanup trigger

    const limit = plan === 'pro' ? LIMITS.PRO : LIMITS.FREE;
    // Daily key: usage:user_id:2023-10-27
    const key = `usage:${userId}:${new Date().toISOString().split('T')[0]}`;

    try {
        // Redis Atomic Increment
        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, 86400); // 24h expiration
        }

        return {
            allowed: count <= limit,
            remaining: Math.max(0, limit - count),
            count
        };

    } catch (e) {
        console.error("Redis Rate Limit Error (User)", e);

        // Memory Fallback
        const now = Date.now();
        let record = memoryStore.get(key);

        // Initialize or Reset if expired
        // Note: Memory store key includes date, so explicit expiry check is redundant but good for robustness
        if (!record) {
            record = { count: 0, resetAt: now + 86400000 };
            memoryStore.set(key, record);
        }

        record.count++;

        return {
            allowed: record.count <= limit,
            remaining: Math.max(0, limit - record.count),
            count: record.count
        };
    }
}

export async function incrementUserUsageDB(userId: string, supabaseClient: any) {
    // Sync to persistent DB (User Analytics)
    // This should be called after successful generation
    try {
        const { error } = await supabaseClient.rpc('increment_user_usage', { target_user_id: userId });
        if (error) {
            console.error("Failed to increment DB usage stats:", error);
        }
    } catch (e) {
        console.error("DB Usage Update Exception:", e);
    }
}
