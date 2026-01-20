
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPromptHistory } from '@/lib/db/history';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) { /* No-op for read-only */ }
            },
        }
    );

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Query Params
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 3. Execute Query using generic helper
    try {
        const result = await getPromptHistory(supabase, {
            userId: user.id,
            page,
            limit,
            search: searchParams.get('search') || '',
            mode: searchParams.get('mode') || 'all',
            type: searchParams.get('type') || 'all',
            sort: searchParams.get('sort') || 'newest'
        });

        return NextResponse.json({
            data: result.data,
            page,
            limit,
            total: result.total,
            hasMore: result.hasMore
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
