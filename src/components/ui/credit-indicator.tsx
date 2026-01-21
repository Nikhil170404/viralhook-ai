'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

interface CreditData {
    plan: string;
    creditsRemaining: number;
    creditsMonthlyLimit: number;
    isUnlimited: boolean;
}

export function CreditIndicator() {
    const [credits, setCredits] = useState<CreditData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/credits');
                if (res.ok) {
                    const data = await res.json();
                    setCredits(data);
                }
            } catch (error) {
                console.error('Failed to fetch credits:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCredits();
    }, []);

    if (loading) {
        return (
            <div className="h-8 w-16 bg-white/5 rounded-full animate-pulse" />
        );
    }

    if (!credits) {
        return null;
    }

    const isLow = !credits.isUnlimited && credits.creditsRemaining <= 3;
    const percentage = credits.isUnlimited
        ? 100
        : (credits.creditsRemaining / credits.creditsMonthlyLimit) * 100;

    return (
        <Link
            href="/pricing"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all hover:scale-105 ${isLow
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
            title={credits.isUnlimited ? 'Unlimited plan' : `${credits.creditsRemaining} of ${credits.creditsMonthlyLimit} credits remaining`}
        >
            <Zap className={`w-4 h-4 ${isLow ? 'text-orange-400' : 'text-purple-400'}`} />
            <span>
                {credits.isUnlimited ? '∞' : credits.creditsRemaining}
                {!credits.isUnlimited && (
                    <span className="text-gray-500">/{credits.creditsMonthlyLimit}</span>
                )}
            </span>
            {isLow && !credits.isUnlimited && (
                <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">
                    LOW
                </span>
            )}
        </Link>
    );
}
