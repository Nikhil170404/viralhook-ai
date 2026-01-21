'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface CreditContextType {
    credits: number;
    setCredits: (credits: number) => void;
    decrementCredit: () => void;
    refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | null>(null);

export function CreditProvider({ children }: { children: React.ReactNode }) {
    const [credits, setCredits] = useState(10);

    const refreshCredits = useCallback(async () => {
        try {
            const res = await fetch('/api/credits');
            if (res.ok) {
                const data = await res.json();
                setCredits(data.creditsRemaining ?? 10);
            }
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        }
    }, []);

    const decrementCredit = useCallback(() => {
        setCredits(prev => Math.max(0, prev - 1));
    }, []);

    // Initial fetch
    useEffect(() => {
        refreshCredits();
    }, [refreshCredits]);

    return (
        <CreditContext.Provider value={{ credits, setCredits, decrementCredit, refreshCredits }}>
            {children}
        </CreditContext.Provider>
    );
}

export function useCredits() {
    const context = useContext(CreditContext);
    if (!context) {
        // Return default values if not in provider
        return {
            credits: 10,
            setCredits: () => { },
            decrementCredit: () => { },
            refreshCredits: async () => { },
        };
    }
    return context;
}
