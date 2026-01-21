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

        // Get user credits using RPC
        const { data, error } = await supabase
            .rpc('get_user_credits', { p_user_id: user.id })
            .single();

        if (error) {
            // If user doesn't have a subscription yet, return free tier defaults
            if (error.code === 'PGRST116') {
                return NextResponse.json({
                    plan: 'free',
                    creditsRemaining: 10,
                    creditsMonthlyLimit: 10,
                    creditsUsedToday: 0,
                    dailyLimit: 50,
                    isUnlimited: false,
                });
            }
            throw error;
        }

        // Type assertion for RPC response
        const credits = data as {
            plan: string;
            credits_remaining: number;
            credits_monthly_limit: number;
            credits_used_today: number;
            daily_limit: number;
            is_unlimited: boolean;
        };

        return NextResponse.json({
            plan: credits.plan,
            creditsRemaining: credits.credits_remaining,
            creditsMonthlyLimit: credits.credits_monthly_limit,
            creditsUsedToday: credits.credits_used_today,
            dailyLimit: credits.daily_limit,
            isUnlimited: credits.is_unlimited,
        });
    } catch (error: any) {
        console.error('Credits API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch credits' },
            { status: 500 }
        );
    }
}
