"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Initialize Supabase Client with SSR for proper cookie handling
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN") {
                router.push("/generator");
            }
        });
        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-900/30 rounded-full blur-[120px]" />

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">
                        Viral Hooks AI
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Professional Grade Viral Content Engine
                    </p>
                </div>

                <Auth
                    supabaseClient={supabase}
                    onlyThirdPartyProviders={true}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: '#ec4899',
                                    brandAccent: '#db2777',
                                    inputBackground: 'rgba(255,255,255,0.05)',
                                    inputText: 'white',
                                    inputBorder: 'rgba(255,255,255,0.1)',
                                }
                            }
                        },
                        className: {
                            container: 'w-full',
                            button: 'rounded-xl',
                            input: 'rounded-xl',
                        }
                    }}
                    providers={['google']}
                    redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=/generator`}
                    theme="dark"
                />
            </div>
        </div>
    );
}
