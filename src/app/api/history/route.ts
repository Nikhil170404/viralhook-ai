
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
    const search = searchParams.get('search') || '';
    const mode = searchParams.get('mode') || 'all';
    const type = searchParams.get('type') || 'all';
    const sort = searchParams.get('sort') || 'newest';

    const offset = page * limit;

    // 3. Build Query
    let query = supabase
        .from('generated_prompts')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id); // Strict ownership check

    // Filters
    if (mode !== 'all') {
        query = query.eq('mode', mode); // Or 'mechanism' depending on schematic consistency
    }

    if (type !== 'all') {
        query = query.eq('prompt_type', type);
    }

    if (search) {
        // Simple case-insensitive partial match
        query = query.or(`prompt_text.ilike.%${search}%,viral_hook.ilike.%${search}%,category.ilike.%${search}%`);
    }

    // Sort
    if (sort === 'oldest') {
        query = query.order('created_at', { ascending: true });
    } else if (sort === 'viral') {
        query = query.order('copy_count', { ascending: false });
    } else {
        // Default: newest
        query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    // 4. Execute
    const { data, error, count } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data,
        page,
        limit,
        total: count,
        hasMore: (offset + limit) < (count || 0)
    });
}
