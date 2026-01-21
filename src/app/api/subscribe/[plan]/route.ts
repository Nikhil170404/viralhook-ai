import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

// Lazy initialize Stripe to avoid build-time errors
function getStripe() {
    return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2025-12-15.clover',
    });
}

// Plan configurations
const PLAN_CONFIGS = {
    starter: {
        name: 'Starter',
        priceIdUSD: process.env.STRIPE_STARTER_PRICE_ID,
        priceIdINR: process.env.STRIPE_STARTER_PRICE_ID_INR,
        credits: 100,
    },
    pro: {
        name: 'Pro',
        priceIdUSD: process.env.STRIPE_PRO_PRICE_ID,
        priceIdINR: process.env.STRIPE_PRO_PRICE_ID_INR,
        credits: 500,
    },
    business: {
        name: 'Business',
        priceIdUSD: process.env.STRIPE_BUSINESS_PRICE_ID,
        priceIdINR: process.env.STRIPE_BUSINESS_PRICE_ID_INR,
        credits: -1, // Unlimited
    },
};

export async function POST(
    request: Request,
    { params }: { params: Promise<{ plan: string }> }
) {
    try {
        const { plan } = await params;
        const { currency = 'USD', annual = false } = await request.json();

        // Validate plan
        if (!['starter', 'pro', 'business'].includes(plan)) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            );
        }

        // Get auth session
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll() { },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Please login to subscribe' },
                { status: 401 }
            );
        }

        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Payment system is being configured. Please try again later.' },
                { status: 503 }
            );
        }

        const planConfig = PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS];
        const priceId = currency === 'INR' ? planConfig.priceIdINR : planConfig.priceIdUSD;

        if (!priceId) {
            return NextResponse.json(
                { error: 'Plan pricing not configured. Please contact support.' },
                { status: 503 }
            );
        }

        // Create or get Stripe customer
        let customerId: string;

        // Check if user already has a Stripe customer ID
        const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        if (subscription?.stripe_customer_id) {
            customerId = subscription.stripe_customer_id;
        } else {
            // Create new Stripe customer
            const customer = await getStripe().customers.create({
                email: user.email,
                metadata: {
                    userId: user.id,
                },
            });
            customerId = customer.id;
        }

        // Create Stripe checkout session
        const session = await getStripe().checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/generator?success=true&plan=${plan}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/pricing?cancelled=true`,
            metadata: {
                userId: user.id,
                plan: plan,
                credits: planConfig.credits.toString(),
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                    plan: plan,
                },
            },
            allow_promotion_codes: true,
        });

        return NextResponse.json({
            url: session.url,
            sessionId: session.id,
        });

    } catch (error: any) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'Unable to process subscription. Please try again.' },
            { status: 500 }
        );
    }
}
