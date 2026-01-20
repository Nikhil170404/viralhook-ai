import { Redis } from '@upstash/redis';

// Use same client as Rate Limiter (HTTP-based, Edge compatible)
export const redis = Redis.fromEnv();

export default redis;
