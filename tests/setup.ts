import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js Navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(),
    }),
}));

// Mock Supabase to avoid hitting real DB during tests
vi.mock('@supabase/ssr', () => ({
    createBrowserClient: () => ({
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        }),
    }),
    createServerClient: () => ({
        auth: {
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        },
    }),
}));
