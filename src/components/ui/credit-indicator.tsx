'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

export function CreditIndicator() {
    // Free tier is unlimited - always show infinity
    return (
        <Link
            href="/pricing"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all hover:scale-105 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-500/50"
            title="Unlimited Free Plan"
        >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>∞ Unlimited</span>
        </Link>
    );
}
