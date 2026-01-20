export const dynamic = "force-dynamic";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import LandingClient from "./landing-client";

export default async function LandingPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Initial Fetch on Server
  let initialStats = {
    total_generated: 0,
    total_creators: 0,
    total_copies: 0,
    top_mode: 'CHAOS'
  };

  try {
    const { data, error } = await supabase.rpc('get_stats');
    if (data && !error) {
      initialStats = data;
    }
  } catch (e) {
    console.error("Failed to fetch landing stats in SSR", e);
  }

  return (
    <LandingClient initialStats={initialStats} />
  );
}
