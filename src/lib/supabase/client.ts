/**
 * Supabase Browser Client (Singleton)
 * Use this in client components - only one instance created
 */

import { createBrowserClient } from '@supabase/ssr';

// Singleton instance
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
    if (browserClient) {
        return browserClient;
    }

    browserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return browserClient;
}

// Convenience export for simpler imports
export const supabase = getSupabaseBrowserClient();
