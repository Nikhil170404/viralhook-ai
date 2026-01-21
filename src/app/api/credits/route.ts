import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { }
                }
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's daily credits using RPC
        const { data: creditsRemaining, error } = await supabase.rpc(
            'get_daily_credits',
            { p_user_id: user.id }
        );

        if (error) {
            console.error('[Credits API] RPC Error:', error);
            // If RPC doesn't exist, return default free tier
            return NextResponse.json({
                creditsRemaining: 10,
                dailyLimit: 10,
                plan: 'free',
            });
        }

        return NextResponse.json({
            creditsRemaining: creditsRemaining ?? 10,
            dailyLimit: 10,
            plan: 'free',
        });
    } catch (error: any) {
        console.error('Credits API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch credits' },
            { status: 500 }
        );
    }
}
