'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export function CreditIndicator() {
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/credits');
                if (res.ok) {
                    const data = await res.json();
                    setCredits(data.creditsRemaining);
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

    const isLow = credits !== null && credits <= 3;
    const displayCredits = credits ?? 10;

    return (
        <Link
            href="/pricing"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all hover:scale-105 ${isLow
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-500/50'
                }`}
            title={`${displayCredits} credits remaining today`}
        >
            <Zap className={`w-4 h-4 ${isLow ? 'text-orange-400' : 'text-purple-400'}`} />
            <span>{displayCredits}/10</span>
            {isLow && (
                <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">
                    LOW
                </span>
            )}
        </Link>
    );
}
