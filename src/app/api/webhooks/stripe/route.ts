import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Lazy initialize Stripe to avoid build-time errors
function getStripe() {
    return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2025-12-15.clover',
    });
}

// Supabase service role client (bypasses RLS for admin operations)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Credit configurations by plan
const PLAN_CREDITS = {
    starter: { monthly: 100, daily: 500 },
    pro: { monthly: 500, daily: 2000 },
    business: { monthly: -1, daily: -1 }, // Unlimited
};

export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing stripe-signature header' },
            { status: 400 }
        );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json(
            { error: 'Webhook not configured' },
            { status: 500 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    // Handle different event types
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutComplete(session);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentSucceeded(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(invoice);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as keyof typeof PLAN_CREDITS;

    if (!userId || !plan) {
        console.error('Missing userId or plan in session metadata');
        return;
    }

    const planConfig = PLAN_CREDITS[plan] || PLAN_CREDITS.starter;

    // Upsert user subscription
    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
            user_id: userId,
            plan: plan,
            credits_remaining: planConfig.monthly,
            credits_monthly_limit: planConfig.monthly,
            credits_used_today: 0,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: 'active',
            billing_cycle_start: new Date().toISOString(),
            billing_cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id',
        });

    if (error) {
        console.error('Error updating subscription:', error);
        throw error;
    }

    // Log credit transaction
    await supabaseAdmin.from('credit_transactions').insert({
        user_id: userId,
        amount: planConfig.monthly,
        type: 'purchase',
        description: `Subscribed to ${plan} plan`,
        balance_after: planConfig.monthly,
    });

    console.log(`✅ User ${userId} subscribed to ${plan}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const status = subscription.status === 'active' ? 'active' :
        subscription.status === 'past_due' ? 'past_due' :
            subscription.status === 'canceled' ? 'cancelled' : 'active';

    await supabaseAdmin
        .from('user_subscriptions')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    console.log(`✅ Subscription updated for user ${userId}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    // Downgrade to free plan
    await supabaseAdmin
        .from('user_subscriptions')
        .update({
            plan: 'free',
            credits_remaining: 10,
            credits_monthly_limit: 10,
            status: 'cancelled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    console.log(`✅ Subscription cancelled for user ${userId}, downgraded to free`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) return;

    // Get subscription to find userId
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;
    const plan = subscription.metadata?.plan as keyof typeof PLAN_CREDITS;

    if (!userId || !plan) return;

    const planConfig = PLAN_CREDITS[plan] || PLAN_CREDITS.starter;

    // Reset credits for new billing cycle
    await supabaseAdmin
        .from('user_subscriptions')
        .update({
            credits_remaining: planConfig.monthly,
            credits_used_today: 0,
            billing_cycle_start: new Date().toISOString(),
            billing_cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    // Log credit reset
    await supabaseAdmin.from('credit_transactions').insert({
        user_id: userId,
        amount: planConfig.monthly,
        type: 'reset',
        description: `Monthly credits reset for ${plan} plan`,
        balance_after: planConfig.monthly,
    });

    console.log(`✅ Credits reset for user ${userId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (!userId) return;

    await supabaseAdmin
        .from('user_subscriptions')
        .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

    console.log(`⚠️ Payment failed for user ${userId}`);
}
