"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight, LogOut, Layout, Sparkles } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function Navbar() {
    const [session, setSession] = useState<any>(null);
    const pathname = usePathname();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-4 md:py-6 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
                    <div className="w-7 md:w-8 h-7 md:h-8 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Zap className="w-4 md:w-5 h-4 md:h-5 text-white" />
                    </div>
                    <span className="text-lg md:text-xl font-black tracking-tighter">VIRALHOOK<span className="text-pink-500">.AI</span></span>
                </Link>

                <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="/#modes" className="hover:text-white transition-colors">Modes</Link>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {session ? (
                        <>
                            {pathname !== "/generator" && (
                                <Link
                                    href="/generator"
                                    className="bg-white text-black px-3 md:px-5 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-1.5 md:gap-2 shadow-lg shadow-white/5 flex-shrink-0"
                                >
                                    <Zap className="w-3 md:w-4 h-3 md:h-4 fill-current" /> <span>Go to App</span>
                                </Link>
                            )}

                            <Link
                                href="/hooks"
                                className={cn(
                                    "flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-all flex-shrink-0",
                                    pathname === "/hooks"
                                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Sparkles className="w-4 h-4" /> <span className="hidden md:inline">Hooks</span>
                            </Link>

                            <Link
                                href="/library"
                                className={cn(
                                    "flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-all flex-shrink-0",
                                    pathname === "/library"
                                        ? "bg-pink-500/10 text-pink-500 border border-pink-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Layout className="w-4 h-4" /> <span className="hidden md:inline">Library</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-red-400 text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-xl hover:bg-red-500/10 flex-shrink-0"
                            >
                                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-white text-black px-5 md:px-8 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2 shadow-lg shadow-white/5"
                        >
                            Login <ArrowRight className="w-3 md:w-4 h-3 md:h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
