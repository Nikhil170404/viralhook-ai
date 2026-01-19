/**
 * Supabase Server Client Factory
 * Use this in server components, API routes, and middleware
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for server-side usage
 * Each request gets its own client with proper cookie handling
 */
export async function createServerSupabase() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
            },
        }
    );
}

/**
 * Creates a read-only Supabase client (no cookie mutations)
 * Useful for middleware where cookie setting is handled separately
 */
export function createServerSupabaseReadOnly(request: Request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookiesArray = cookieHeader.split(';').map(c => {
        const [name, ...rest] = c.trim().split('=');
        return { name, value: rest.join('=') };
    }).filter(c => c.name);

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookiesArray;
                },
                setAll() {
                    // No-op for read-only
                },
            },
        }
    );
}
