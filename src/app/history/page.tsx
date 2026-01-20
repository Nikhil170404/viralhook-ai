export const dynamic = "force-dynamic";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HistoryClient from "./history-client";
import { getPromptHistory } from '@/lib/db/history';
import { Navbar } from "@/components/ui/navbar";

export default async function HistoryPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Await params
    const params = await searchParams;

    // Initial Fetch on Server
    let initialData: { data: any[], hasMore: boolean, total: number } = { data: [], hasMore: false, total: 0 };

    try {
        const result = await getPromptHistory(supabase, {
            userId: user.id,
            page: 0,
            limit: 20,
            search: typeof params.search === 'string' ? params.search : '',
            mode: typeof params.mode === 'string' ? params.mode : 'all',
            type: typeof params.type === 'string' ? params.type : 'all',
            sort: typeof params.sort === 'string' ? params.sort : 'newest',
        });

        initialData = {
            data: result.data || [],
            hasMore: result.hasMore,
            total: result.total || 0,
        };

    } catch (e) {
        console.error("Server fetch error:", e);
        // We let the client component handle the "empty" state or error toast if needed
        // but passing empty array is safer than crashing
    }

    // Map to simple structure if needed by client (Client expects DB format mostly)
    // The DB helper returns exactly what the API returns, so we are good.

    return (
        <HistoryClient
            initialPrompts={initialData.data}
            initialHasMore={initialData.hasMore}
            initialTotal={initialData.total}
        />
    );
}
