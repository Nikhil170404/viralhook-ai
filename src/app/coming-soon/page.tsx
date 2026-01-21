'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Bell, Sparkles, Zap, Crown } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { useState } from 'react';

export default function ComingSoonPage() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleNotify = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would call an API to store the email
        setSubscribed(true);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Background */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,#0a0a0a_0%,#000000_100%)]" />
            <div className="fixed inset-0 -z-10 overflow-hidden opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-900/40 rounded-full blur-[120px]" />
            </div>

            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Icon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-8"
                    >
                        <Crown className="w-10 h-10 text-purple-400" />
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-black tracking-tighter mb-6"
                    >
                        Premium Plans{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Coming Soon
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-400 text-lg mb-8"
                    >
                        We're working hard to bring you premium features. In the meantime, enjoy{' '}
                        <span className="text-white font-bold">unlimited free access</span> to all current features!
                    </motion.p>

                    {/* Features Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                            <p className="text-sm font-medium">More Credits</p>
                            <p className="text-xs text-gray-500">100-500/month</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <p className="text-sm font-medium">Advanced AI</p>
                            <p className="text-xs text-gray-500">Better prompts</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <p className="text-sm font-medium">Priority Support</p>
                            <p className="text-xs text-gray-500">24/7 help</p>
                        </div>
                    </motion.div>

                    {/* Notify Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-10"
                    >
                        {!subscribed ? (
                            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                >
                                    <Bell className="w-4 h-4" />
                                    Notify Me
                                </button>
                            </form>
                        ) : (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-green-400">
                                <p className="font-bold">🎉 You're on the list!</p>
                                <p className="text-sm text-green-300/70">We'll notify you when premium plans launch.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Back Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link
                            href="/generator"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Generator (Unlimited Free Access)
                        </Link>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
