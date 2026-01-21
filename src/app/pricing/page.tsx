'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Building2, ArrowRight, Globe } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';

type Currency = 'USD' | 'INR';
type BillingCycle = 'monthly' | 'annual';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        description: 'Perfect for trying out ViralHook',
        priceUSD: 0,
        priceINR: 0,
        credits: 10,
        icon: Zap,
        color: 'gray',
        features: [
            '10 prompts/month',
            '1 platform (Kling)',
            'Watermarked outputs',
            'Basic support',
        ],
        notIncluded: ['Commercial use', 'Advanced modes', 'Analytics'],
    },
    {
        id: 'starter',
        name: 'Starter',
        description: 'For creators getting started',
        priceUSD: 9,
        priceINR: 299,
        credits: 100,
        icon: Zap,
        color: 'blue',
        features: [
            '100 prompts/month',
            'All platforms',
            'No watermark',
            'Commercial license',
            '90-day credit rollover',
        ],
        notIncluded: ['Analytics', 'Priority support'],
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'Most popular for serious creators',
        priceUSD: 19,
        priceINR: 599,
        credits: 500,
        icon: Crown,
        color: 'purple',
        popular: true,
        features: [
            '500 prompts/month',
            'All platforms',
            'No watermark',
            'Commercial license',
            '90-day credit rollover',
            'Advanced AI modes',
            'Viral analytics',
            'Priority support',
        ],
        notIncluded: [],
    },
    {
        id: 'business',
        name: 'Business',
        description: 'For teams and agencies',
        priceUSD: 49,
        priceINR: 1499,
        credits: -1, // Unlimited
        icon: Building2,
        color: 'orange',
        features: [
            'Unlimited prompts',
            'All platforms',
            'No watermark',
            'Commercial license',
            '5 team seats',
            'API access',
            'Custom templates',
            'Dedicated support',
        ],
        notIncluded: [],
    },
];

function formatPrice(amount: number, currency: Currency): string {
    if (amount === 0) return 'Free';
    if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`;
    return `$${amount}`;
}

function getAnnualPrice(monthlyPrice: number): number {
    // 20% discount = 10 months price
    return monthlyPrice * 10;
}

export default function PricingPage() {
    const [currency, setCurrency] = useState<Currency>('USD');
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

    // Geo-detect currency
    useEffect(() => {
        const detectCurrency = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data.country_code === 'IN') {
                    setCurrency('INR');
                }
            } catch {
                // Default to USD
            }
        };
        detectCurrency();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Background */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,#0a0a0a_0%,#000000_100%)]" />
            <div className="fixed inset-0 -z-10 overflow-hidden opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-900/40 rounded-full blur-[120px]" />
            </div>

            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
                            Simple, transparent{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                pricing
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                            Start free, upgrade when you're ready. Save 20% with annual billing.
                        </p>

                        {/* Toggles */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            {/* Currency Toggle */}
                            <div className="flex items-center gap-3 bg-white/5 rounded-full p-1.5">
                                <button
                                    onClick={() => setCurrency('USD')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${currency === 'USD'
                                        ? 'bg-white text-black'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    $ USD
                                </button>
                                <button
                                    onClick={() => setCurrency('INR')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${currency === 'INR'
                                        ? 'bg-white text-black'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    ₹ INR <Globe className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Billing Cycle Toggle */}
                            <div className="flex items-center gap-3 bg-white/5 rounded-full p-1.5">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly'
                                        ? 'bg-white text-black'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('annual')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'annual'
                                        ? 'bg-white text-black'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Annual
                                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                        -20%
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                        {PLANS.map((plan, index) => {
                            const monthlyPrice = currency === 'INR' ? plan.priceINR : plan.priceUSD;
                            const displayPrice =
                                billingCycle === 'annual' && monthlyPrice > 0
                                    ? getAnnualPrice(monthlyPrice)
                                    : monthlyPrice;

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative rounded-3xl p-1 ${plan.popular
                                        ? 'bg-gradient-to-b from-purple-500 to-pink-500'
                                        : 'bg-white/10'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                                            MOST POPULAR
                                        </div>
                                    )}

                                    <div className="bg-gray-950 rounded-[22px] p-6 h-full flex flex-col">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.color === 'gray'
                                                    ? 'bg-gray-800'
                                                    : plan.color === 'blue'
                                                        ? 'bg-blue-500/20'
                                                        : plan.color === 'purple'
                                                            ? 'bg-purple-500/20'
                                                            : 'bg-orange-500/20'
                                                    }`}
                                            >
                                                <plan.icon
                                                    className={`w-5 h-5 ${plan.color === 'gray'
                                                        ? 'text-gray-400'
                                                        : plan.color === 'blue'
                                                            ? 'text-blue-400'
                                                            : plan.color === 'purple'
                                                                ? 'text-purple-400'
                                                                : 'text-orange-400'
                                                        }`}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">{plan.name}</h3>
                                                <p className="text-xs text-gray-500">{plan.description}</p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black">
                                                    {formatPrice(displayPrice, currency)}
                                                </span>
                                                {displayPrice > 0 && (
                                                    <span className="text-gray-500">
                                                        /{billingCycle === 'annual' ? 'year' : 'mo'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {plan.credits === -1
                                                    ? 'Unlimited prompts'
                                                    : `${plan.credits} prompts/month`}
                                            </p>
                                        </div>

                                        {/* CTA */}
                                        {plan.id === 'free' ? (
                                            <Link
                                                href="/login"
                                                className="w-full py-3 rounded-xl font-bold text-center transition-all mb-6 flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white/20"
                                            >
                                                Start Free
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch(`/api/subscribe/${plan.id}`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ currency, annual: billingCycle === 'annual' }),
                                                        });
                                                        const data = await res.json();
                                                        if (data.url) {
                                                            window.location.href = data.url;
                                                        } else {
                                                            alert(data.error || 'Unable to start checkout');
                                                        }
                                                    } catch (e) {
                                                        alert('Please try again later');
                                                    }
                                                }}
                                                className={`w-full py-3 rounded-xl font-bold text-center transition-all mb-6 flex items-center justify-center gap-2 ${plan.popular
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                                                    : 'bg-white text-black hover:bg-gray-200'
                                                    }`}
                                            >
                                                Get Started
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Features */}
                                        <div className="flex-grow">
                                            <ul className="space-y-3">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm">
                                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                        <span className="text-gray-300">{feature}</span>
                                                    </li>
                                                ))}
                                                {plan.notIncluded.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm opacity-40">
                                                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                                            <div className="w-1 h-1 bg-gray-500 rounded-full" />
                                                        </div>
                                                        <span className="line-through">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Trust Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                    >
                        <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    🔒
                                </div>
                                <span>SSL Secured</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    💳
                                </div>
                                <span>Stripe & Razorpay</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    ↩️
                                </div>
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* FAQ Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-20 max-w-3xl mx-auto"
                    >
                        <h2 className="text-2xl font-bold text-center mb-10">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {[
                                {
                                    q: 'What counts as a credit?',
                                    a: 'Each prompt generation (including hooks) uses 1 credit. Edits to existing prompts are free.',
                                },
                                {
                                    q: 'Do unused credits roll over?',
                                    a: 'Yes! Starter and Pro plans have 90-day credit rollover. Credits expire after 90 days of non-use.',
                                },
                                {
                                    q: 'Can I upgrade or downgrade anytime?',
                                    a: 'Absolutely. Changes take effect immediately. You\'ll be prorated for upgrades.',
                                },
                                {
                                    q: 'What payment methods do you accept?',
                                    a: 'We accept all major credit cards via Stripe internationally, and UPI, PhonePe, Google Pay, and cards via Razorpay in India.',
                                },
                            ].map((faq, i) => (
                                <div key={i} className="bg-white/5 rounded-2xl p-6">
                                    <h3 className="font-bold mb-2">{faq.q}</h3>
                                    <p className="text-gray-400 text-sm">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
