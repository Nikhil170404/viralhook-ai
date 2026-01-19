/**
 * Health Check Endpoint
 * Monitors system components: Redis, Supabase, OpenRouter connectivity
 */

import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { createClient } from '@supabase/supabase-js';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    checks: {
        redis: ComponentHealth;
        supabase: ComponentHealth;
        openrouter: ComponentHealth;
    };
}

interface ComponentHealth {
    status: 'up' | 'down' | 'unknown';
    latencyMs?: number;
    error?: string;
}

const startTime = Date.now();

async function checkRedis(): Promise<ComponentHealth> {
    const start = Date.now();
    try {
        await redis.ping();
        return {
            status: 'up',
            latencyMs: Date.now() - start
        };
    } catch (error: any) {
        return {
            status: 'down',
            latencyMs: Date.now() - start,
            error: error.message
        };
    }
}

async function checkSupabase(): Promise<ComponentHealth> {
    const start = Date.now();
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Simple connectivity check
        const { error } = await supabase.from('generated_prompts').select('id').limit(1);

        if (error && !error.message.includes('permission')) {
            throw error;
        }

        return {
            status: 'up',
            latencyMs: Date.now() - start
        };
    } catch (error: any) {
        return {
            status: 'down',
            latencyMs: Date.now() - start,
            error: error.message
        };
    }
}

async function checkOpenRouter(): Promise<ComponentHealth> {
    const start = Date.now();
    try {
        // Just check if the API is reachable (HEAD request to status endpoint)
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'HEAD',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            signal: AbortSignal.timeout(5000)
        });

        return {
            status: response.ok ? 'up' : 'down',
            latencyMs: Date.now() - start
        };
    } catch (error: any) {
        return {
            status: 'down',
            latencyMs: Date.now() - start,
            error: error.message
        };
    }
}

export async function GET() {
    const [redisHealth, supabaseHealth, openrouterHealth] = await Promise.all([
        checkRedis(),
        checkSupabase(),
        checkOpenRouter()
    ]);

    const checks = {
        redis: redisHealth,
        supabase: supabaseHealth,
        openrouter: openrouterHealth
    };

    // Determine overall status
    const allUp = Object.values(checks).every(c => c.status === 'up');
    const anyDown = Object.values(checks).some(c => c.status === 'down');

    let overallStatus: HealthStatus['status'];
    if (allUp) {
        overallStatus = 'healthy';
    } else if (anyDown) {
        overallStatus = 'unhealthy';
    } else {
        overallStatus = 'degraded';
    }

    const health: HealthStatus = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        checks
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
}
