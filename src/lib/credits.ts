/**
 * Credit System for ViralHook AI
 * Handles credit checking, deduction, and plan enforcement
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Plan configurations
export const PLAN_CONFIGS = {
    free: {
        name: 'Free',
        monthlyCredits: 10,
        dailyLimit: 50,
        requestsPerMinute: 5,
        priceUSD: 0,
        priceINR: 0,
        features: {
            platforms: 1,
            watermark: true,
            commercial: false,
        }
    },
    starter: {
        name: 'Starter',
        monthlyCredits: 100,
        dailyLimit: 500,
        requestsPerMinute: 20,
        priceUSD: 9,
        priceINR: 299,
        features: {
            platforms: 'all',
            watermark: false,
            commercial: true,
            rolloverDays: 90,
        }
    },
    pro: {
        name: 'Pro',
        monthlyCredits: 500,
        dailyLimit: 2000,
        requestsPerMinute: 60,
        priceUSD: 19,
        priceINR: 599,
        features: {
            platforms: 'all',
            watermark: false,
            commercial: true,
            rolloverDays: 90,
            analytics: true,
            priority: true,
        }
    },
    business: {
        name: 'Business',
        monthlyCredits: -1, // Unlimited
        dailyLimit: -1, // Unlimited
        requestsPerMinute: 120,
        priceUSD: 49,
        priceINR: 1499,
        features: {
            platforms: 'all',
            watermark: false,
            commercial: true,
            teamSeats: 5,
            apiAccess: true,
            customTemplates: true,
        }
    }
} as const;

export type PlanType = keyof typeof PLAN_CONFIGS;

export interface UserCredits {
    plan: PlanType;
    creditsRemaining: number;
    creditsMonthlyLimit: number;
    creditsUsedToday: number;
    dailyLimit: number;
    isUnlimited: boolean;
}

export interface CreditCheckResult {
    allowed: boolean;
    remaining: number;
    message: string;
    shouldUpgrade: boolean;
}

// Type for RPC responses
interface GetUserCreditsRPC {
    plan: string;
    credits_remaining: number;
    credits_monthly_limit: number;
    credits_used_today: number;
    daily_limit: number;
    is_unlimited: boolean;
}

interface DeductCreditRPC {
    success: boolean;
    remaining: number;
    message: string;
}

/**
 * Get user's current credit balance and plan info
 */
export async function getUserCredits(
    supabase: SupabaseClient,
    userId: string
): Promise<UserCredits | null> {
    const { data, error } = await supabase
        .rpc('get_user_credits', { p_user_id: userId })
        .single();

    if (error || !data) {
        console.error('Error fetching user credits:', error);
        return null;
    }

    const rpcData = data as GetUserCreditsRPC;

    return {
        plan: rpcData.plan as PlanType,
        creditsRemaining: rpcData.credits_remaining,
        creditsMonthlyLimit: rpcData.credits_monthly_limit,
        creditsUsedToday: rpcData.credits_used_today,
        dailyLimit: rpcData.daily_limit,
        isUnlimited: rpcData.is_unlimited,
    };
}

/**
 * Check if user has enough credits for a generation
 */
export async function checkCredits(
    supabase: SupabaseClient,
    userId: string
): Promise<CreditCheckResult> {
    const credits = await getUserCredits(supabase, userId);

    if (!credits) {
        return {
            allowed: false,
            remaining: 0,
            message: 'Unable to fetch credit balance',
            shouldUpgrade: false,
        };
    }

    // Business plan = unlimited
    if (credits.isUnlimited) {
        return {
            allowed: true,
            remaining: -1,
            message: 'Unlimited plan',
            shouldUpgrade: false,
        };
    }

    // Check daily limit
    if (credits.dailyLimit > 0 && credits.creditsUsedToday >= credits.dailyLimit) {
        return {
            allowed: false,
            remaining: credits.creditsRemaining,
            message: 'Daily limit reached. Try again tomorrow or upgrade.',
            shouldUpgrade: true,
        };
    }

    // Check credits
    if (credits.creditsRemaining <= 0) {
        return {
            allowed: false,
            remaining: 0,
            message: 'No credits remaining. Please upgrade your plan.',
            shouldUpgrade: true,
        };
    }

    return {
        allowed: true,
        remaining: credits.creditsRemaining,
        message: 'OK',
        shouldUpgrade: credits.creditsRemaining <= 3, // Suggest upgrade when low
    };
}

/**
 * Deduct a credit after successful generation
 */
export async function deductCredit(
    supabase: SupabaseClient,
    userId: string,
    description: string = 'Prompt generation'
): Promise<{ success: boolean; remaining: number; message: string }> {
    const { data, error } = await supabase
        .rpc('deduct_credit', {
            p_user_id: userId,
            p_description: description
        })
        .single();

    if (error) {
        console.error('Error deducting credit:', error);
        return { success: false, remaining: 0, message: 'Database error' };
    }

    const rpcData = data as DeductCreditRPC;

    return {
        success: rpcData.success,
        remaining: rpcData.remaining,
        message: rpcData.message,
    };
}

/**
 * Initialize subscription for a new user (fallback if trigger doesn't fire)
 */
export async function initializeUserSubscription(
    supabase: SupabaseClient,
    userId: string
): Promise<boolean> {
    const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
            user_id: userId,
            plan: 'free',
            credits_remaining: 10,
            credits_monthly_limit: 10,
        }, {
            onConflict: 'user_id',
            ignoreDuplicates: true,
        });

    return !error;
}

/**
 * Get price based on currency
 */
export function getPrice(plan: PlanType, currency: 'USD' | 'INR', isAnnual: boolean = false): number {
    const config = PLAN_CONFIGS[plan];
    const monthlyPrice = currency === 'INR' ? config.priceINR : config.priceUSD;

    if (isAnnual) {
        // 20% discount for annual (2 months free)
        return monthlyPrice * 10;
    }

    return monthlyPrice;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: 'USD' | 'INR'): string {
    if (amount === 0) return 'Free';

    if (currency === 'INR') {
        return `₹${amount.toLocaleString('en-IN')}`;
    }

    return `$${amount}`;
}
