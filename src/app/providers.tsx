'use client';

import { CreditProvider } from '@/context/credits-context';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CreditProvider>
            {children}
        </CreditProvider>
    );
}
