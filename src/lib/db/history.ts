import { SupabaseClient } from '@supabase/supabase-js';

export type HistoryFilterParams = {
    userId: string;
    page?: number;
    limit?: number;
    search?: string;
    mode?: string;
    type?: string;
    sort?: string;
};

export async function getPromptHistory(supabase: SupabaseClient, params: HistoryFilterParams) {
    const {
        userId,
        page = 0,
        limit = 20,
        search = '',
        mode = 'all',
        type = 'all',
        sort = 'newest'
    } = params;

    const offset = page * limit;

    // 1. Build Query
    let query = supabase
        .from('generated_prompts')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

    // 2. Filters
    if (mode !== 'all') {
        const modeValue = mode === 'viral' ? 'shocking' : mode; // normalize if needed
        query = query.eq('mode', modeValue);
    }

    if (type !== 'all') {
        query = query.eq('prompt_type', type);
    }

    if (search) {
        query = query.or(`prompt_text.ilike.%${search}%,viral_hook.ilike.%${search}%,category.ilike.%${search}%`);
    }

    // 3. Sort
    if (sort === 'oldest') {
        query = query.order('created_at', { ascending: true });
    } else if (sort === 'viral') {
        query = query.order('copy_count', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    // 4. Pagination
    query = query.range(offset, offset + limit - 1);

    // 5. Execute
    const { data, error, count } = await query;

    if (error) {
        throw new Error(error.message);
    }

    return {
        data: data || [],
        hasMore: (offset + limit) < (count || 0),
        total: count || 0
    };
}
