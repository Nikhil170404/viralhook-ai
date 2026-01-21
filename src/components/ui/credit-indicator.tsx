'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useCredits } from '@/context/credits-context';

export function CreditIndicator() {
    const { credits } = useCredits();

    const isLow = credits <= 3;

    return (
        <Link
            href="/pricing"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all hover:scale-105 ${isLow
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-500/50'
                }`}
            title={`${credits} credits remaining today`}
        >
            <Zap className={`w-4 h-4 ${isLow ? 'text-orange-400' : 'text-purple-400'}`} />
            <span>{credits}/10</span>
            {isLow && credits > 0 && (
                <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">
                    LOW
                </span>
            )}
            {credits === 0 && (
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                    EMPTY
                </span>
            )}
        </Link>
    );
}
