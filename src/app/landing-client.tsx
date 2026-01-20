"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Zap,
    Clapperboard,
    Sparkles,
    ArrowRight,
    Play,
    Camera,
    Layers,
    Cpu,
    Globe,
    TrendingUp
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useState, useEffect } from "react";

type LandingClientProps = {
    initialStats: {
        total_generated: number;
        total_creators: number;
        total_copies: number;
        top_mode: string;
    }
};

export default function LandingClient({ initialStats }: LandingClientProps) {
    const [stats] = useState(initialStats); // No need to fetch again, SSR provided it

    const DEMO_HOOKS = [
        {
            mode: "CHAOS MODE",
            icon: Zap,
            color: "text-pink-400",
            bg: "bg-pink-500/10",
            border: "border-pink-500/20",
            prompt: "A futuristic Indian street scene with neon rickshaws, 8k hyper-realistic, POV shot, chaos in Mumbai 2050..."
        },
        {
            mode: "CINEMATIC PRO",
            icon: Clapperboard,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            prompt: "Anamorphic wide shot of a rainy Tokyo alleyway, blade runner style, volumetric fog, Arri Alexa 65, golden hour..."
        },
        {
            mode: "SHOCK LOGIC",
            icon: Play,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            prompt: "CCTV footage of a pedestrian walking past a parked truck, tire suddenly explodes, shockwave rips clothes, debris flies, 4k raw footage.."
        }
    ];

    const [demoIndex, setDemoIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    // Rotation Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setDemoIndex((prev) => (prev + 1) % DEMO_HOOKS.length);
            setDisplayedText(""); // Reset text for new mode
            setIsTyping(true);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Typewriter Effect
    useEffect(() => {
        const targetText = DEMO_HOOKS[demoIndex].prompt;
        if (displayedText.length < targetText.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(targetText.slice(0, displayedText.length + 1));
            }, 30);
            return () => clearTimeout(timeout);
        } else {
            setIsTyping(false);
        }
    }, [displayedText, demoIndex]);

    const currentDemo = DEMO_HOOKS[demoIndex];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500 selection:text-white overflow-x-hidden">

            {/* --- BACKGROUND EFFECTS --- */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,#0a0a0a_0%,#000000_100%)]" />
            <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden opacity-40">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/40 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-900/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-40 pb-24 px-6" aria-label="Hero Section">
                <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-pink-400 mb-8 backdrop-blur-sm">
                            <Sparkles className="w-3 h-3" />
                            <span>THE 2026 VIDEO PROMPT ENGINE</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                            PROMPTS THAT <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500">
                                GO VIRAL.
                            </span>
                        </h1>

                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            Turn any script into a <span className="text-white">high-retention video hook</span>. Generate professional-grade AI prompts optimized for
                            <span className="text-white"> Kling, Luma, Veo, and Runway</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/generator"
                                aria-label="Start Generating Viral Prompts"
                                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-lg font-black shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Start Generating <Zap className="w-5 h-5 fill-current" />
                            </Link>
                            <Link
                                href="/library"
                                aria-label="View Prompt Library"
                                className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-black hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-md"
                            >
                                View Library <Globe className="w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* --- FLOATING PREVIEW CARD --- */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="mt-20 w-full max-w-4xl relative"
                        role="presentation"
                    >
                        <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-white/20 to-transparent shadow-2xl">
                            <div className="bg-gray-950 rounded-[2.3rem] overflow-hidden border border-white/5 p-4 md:p-8">
                                {/* Mock UI */}
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    <div className="ml-4 h-6 w-32 bg-white/5 rounded-full" />
                                </div>

                                <div className="flex flex-col gap-6 text-left">
                                    <div className={`p-6 rounded-3xl min-h-[140px] flex flex-col justify-center transition-all duration-500 ${currentDemo.bg} ${currentDemo.border} border`}>
                                        <p className={`text-sm font-bold mb-2 flex items-center gap-2 ${currentDemo.color}`}>
                                            <currentDemo.icon className="w-4 h-4" /> {currentDemo.mode} ACTIVATED
                                        </p>
                                        <p className="text-lg md:text-xl font-medium text-gray-200">
                                            "{displayedText}"<span className={`${isTyping ? 'opacity-100' : 'opacity-0'} animate-pulse`}>|</span>
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-10 w-32 bg-purple-500/20 rounded-xl" />
                                        <div className="h-10 w-32 bg-white/10 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative background glow */}
                        <div className="absolute inset-0 bg-pink-500/20 blur-[100px] -z-10" />
                    </motion.div>
                </div>
            </section>

            {/* --- STATS --- */}
            <section className="py-20 border-y border-white/5 bg-white/[0.02]" aria-label="Platform Statistics">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    <div>
                        <div className="text-4xl font-black mb-1">{stats.total_generated > 0 ? stats.total_generated.toLocaleString() : '...'}</div>
                        <div className="text-gray-500 text-sm font-bold uppercase tracking-widest">Generations</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-1">{stats.total_creators > 0 ? stats.total_creators.toLocaleString() : '...'}</div>
                        <div className="text-gray-500 text-sm font-bold uppercase tracking-widest">Active Creators</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-1">{stats.total_copies > 0 ? stats.total_copies.toLocaleString() : '...'}</div>
                        <div className="text-gray-500 text-sm font-bold uppercase tracking-widest">Viral Copies</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                            {stats.top_mode || 'CHAOS'}
                        </div>
                        <div className="text-gray-500 text-sm font-bold uppercase tracking-widest">Trending Mode</div>
                    </div>
                </div>
            </section>

            {/* --- MODES SHOWCASE --- */}
            <section id="modes" className="py-32 px-6 relative" aria-label="Prompt Modes">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                                CHOOSE YOUR <br />
                                <span className="text-pink-500">INTELLIGENCE.</span>
                            </h2>
                            <p className="text-gray-400 text-lg">
                                Three distinct logic engines built for different viral goals.
                                Whether it's raw chaos or cinematic perfection, we've got the math for it.
                            </p>
                        </div>
                        <Link
                            href="/generator"
                            aria-label="Try All Modes"
                            className="text-pink-500 font-bold flex items-center gap-2 hover:gap-4 transition-all"
                        >
                            Try them all <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Chaos Card */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="relative group p-1 rounded-[3rem] bg-gradient-to-b from-pink-500/20 to-transparent"
                        >
                            <div className="bg-gray-950 rounded-[2.8rem] p-8 h-full border border-white/5 flex flex-col">
                                <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(236,72,153,0.6)]">
                                    <Zap className="w-7 h-7 text-white fill-current" />
                                </div>
                                <h3 className="text-2xl font-black mb-4">CHAOS ENGINE</h3>
                                <p className="text-gray-400 mb-8 flex-grow">
                                    Engineered for short-form retention. Uses Hinglish slang, aggressive motion vectors, and trending audio cues to hack the FYP algorithms.
                                </p>
                                <div className="space-y-3">
                                    {['Hinglish Mixed', 'Meme Physics', 'Aggressive POV'].map((tag) => (
                                        <div key={tag} className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Cinematic Card */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="relative group p-1 rounded-[3rem] bg-gradient-to-b from-blue-500/20 to-transparent"
                        >
                            <div className="bg-gray-950 rounded-[2.8rem] p-8 h-full border border-white/5 flex flex-col">
                                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(59,130,246,0.6)]">
                                    <Clapperboard className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-black mb-4">CINEMATIC PRO</h3>
                                <p className="text-gray-400 mb-8 flex-grow">
                                    Hollywood in a prompt. High-end camera specifications (Arri Alexa, Red Komodo), master-class lighting, and 8K surface textures.
                                </p>
                                <div className="space-y-3">
                                    {['8K Photoreal', 'Anamorphic Lens', 'Studio Lighting'].map((tag) => (
                                        <div key={tag} className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Shock Card */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="relative group p-1 rounded-[3rem] bg-gradient-to-b from-orange-500/20 to-transparent"
                        >
                            <div className="bg-gray-950 rounded-[2.8rem] p-8 h-full border border-white/5 flex flex-col">
                                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(249,115,22,0.6)]">
                                    <Zap className="w-7 h-7 text-white rotate-45" />
                                </div>
                                <h3 className="text-2xl font-black mb-4">SHOCK LOGIC</h3>
                                <p className="text-gray-400 mb-8 flex-grow">
                                    Built to break the scroll. Specializes in "Sudden Impact" scenarios and physics-defying plot twists that demand re-watches.
                                </p>
                                <div className="space-y-3">
                                    {['Plot Twists', 'Abrupt Ending', 'Gravity Breaker'].map((tag) => (
                                        <div key={tag} className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> {tag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-32 px-6" aria-label="Key Features">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">ENGINEERED FOR ATTENTION.</h2>
                        <p className="text-gray-500 text-lg">Four specialized intelligence engines at your fingertips.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Chaos Engine",
                                desc: "Hinglish mixed, meme-centric prompts designed to trigger the Instagram algorithm.",
                                icon: Zap,
                                color: "text-pink-500",
                                bg: "bg-pink-500/10"
                            },
                            {
                                title: "Cinematic Pro",
                                desc: "Arri Alexa settings, 8K textures, and professional lighting for world-class realism.",
                                icon: Camera,
                                color: "text-blue-500",
                                bg: "bg-blue-500/10"
                            },
                            {
                                title: "Shock Logic",
                                desc: "Unexpected plot twists and physics-breaking visuals that stop the scroll instantly.",
                                icon: Play,
                                color: "text-orange-500",
                                bg: "bg-orange-500/10"
                            },
                            {
                                title: "Platform Native",
                                desc: "Optimized syntax for Kling, Runway Gen-3, and Google Veo. Direct API injection.",
                                icon: Cpu,
                                color: "text-purple-500",
                                bg: "bg-purple-500/10"
                            },
                            {
                                title: "Physics Control",
                                desc: "Advanced motion vectors and fluid dynamics built into every single prompt.",
                                icon: Layers,
                                color: "text-green-500",
                                bg: "bg-green-500/10"
                            },
                            {
                                title: "Script Retention Engine",
                                desc: "Convert any script into a retention-optimized video prompt automatically.",
                                icon: TrendingUp,
                                color: "text-cyan-500",
                                bg: "bg-cyan-500/10"
                            }
                        ].map((f, i) => (
                            <motion.div
                                whileHover={{ y: -5 }}
                                key={i}
                                className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                            >
                                <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-20 px-6 border-t border-white/5" role="contentinfo">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-6 h-6 text-pink-500" />
                            <span className="text-xl font-black tracking-tighter">VIRALHOOK</span>
                        </div>
                        <p className="text-gray-500 text-sm max-w-xs">
                            Empowering the next generation of AI video creators with physics-accurate, attention-grabbing prompts.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-10 text-sm font-bold text-gray-400">
                        <div className="flex flex-col gap-4">
                            <span className="text-white">Product</span>
                            <Link href="/generator" className="hover:text-white transition-colors text-gray-500">Generator</Link>
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-white">Community</span>
                            <a href="#" className="hover:text-white transition-colors text-gray-500">Instagram</a>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center text-gray-600 text-xs">
                    © 2026 ViralHook AI. All rights reserved. Created for World-Class Attention.
                </div>
            </footer>
        </div>
    );
}
