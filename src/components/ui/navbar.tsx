"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight, LogOut, Layout, Sparkles, Clock, Menu, X } from "lucide-react";
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
    const [isOpen, setIsOpen] = useState(false);
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

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const navItems = [
        { href: '/generator', label: 'Generator', icon: Zap, match: '/generator', hideIfExists: true }, // Logic handled in render
        { href: '/hooks', label: 'Hooks', icon: Sparkles, match: '/hooks' },
        { href: '/library', label: 'Library', icon: Layout, match: '/library' },
        { href: '/history', label: 'History', icon: Clock, match: '/history' },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-4 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0 z-50 relative">
                    <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter">VIRALHOOK<span className="text-pink-500">.AI</span></span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    {!session ? (
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
                                <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
                                <Link href="/#modes" className="hover:text-white transition-colors">Modes</Link>
                            </div>
                            <Link
                                href="/login"
                                className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                            >
                                Login <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <>
                            {navItems.map((item) => {
                                if (item.hideIfExists && pathname === item.match) return null;
                                const isActive = pathname === item.match;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                                            isActive
                                                ? "bg-white/10 text-white border border-white/10"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <item.icon className={cn("w-4 h-4", isActive ? "text-pink-500" : "")} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            <button
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-red-400 text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 ml-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden z-50 relative p-2 text-white/80 hover:text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-xl z-40 flex flex-col pt-24 px-6 gap-8 md:hidden"
                        >
                            {!session ? (
                                <div className="flex flex-col gap-6">
                                    <Link href="/#features" className="text-2xl font-bold text-gray-400 hover:text-white">Features</Link>
                                    <Link href="/#modes" className="text-2xl font-bold text-gray-400 hover:text-white">Modes</Link>
                                    <hr className="border-white/10" />
                                    <Link
                                        href="/login"
                                        className="bg-white text-black px-6 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2"
                                    >
                                        Login <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.match;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-medium transition-all",
                                                    isActive
                                                        ? "bg-white/10 text-white border border-white/10"
                                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <item.icon className={cn("w-6 h-6", isActive ? "text-pink-500" : "")} />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}

                                    <hr className="border-white/10 my-2" />

                                    <button
                                        onClick={handleLogout}
                                        className="text-red-400 hover:text-red-300 text-lg font-medium flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-red-500/10"
                                    >
                                        <LogOut className="w-6 h-6" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
