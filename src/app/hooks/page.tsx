"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
    Copy, Check, Sparkles, Zap, Clapperboard, ChevronDown,
    FileText, Wand2, RefreshCw, ArrowRight, Cpu, Target, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const INTELLIGENCE_MODELS = [
    { id: "tngtech/deepseek-r1t2-chimera:free", name: "DeepSeek R1 (Speed)", icon: Sparkles },
    { id: "xiaomi/mimo-v2-flash:free", name: "Xiaomi MIMO v2", icon: Zap },
    { id: "deepseek/deepseek-r1-0528:free", name: "DeepSeek R1 Pro", icon: Cpu },
    { id: "tngtech/deepseek-r1t-chimera:free", name: "DeepSeek Chimera", icon: Layers },
];

interface HookResult {
    hook: string;
    hookType: string;
    fadeOut: string;
    whyItWorks: string;
    style: string;
}

export default function HooksPage() {
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form State
    const [script, setScript] = useState("");
    const [stylePreference, setStylePreference] = useState("");
    const [mode, setMode] = useState<'chaos' | 'cinematic' | 'shocking'>('shocking');
    const [aiModel, setAiModel] = useState(INTELLIGENCE_MODELS[0].id);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    // Results State
    const [genre, setGenre] = useState("");
    const [emotionalCore, setEmotionalCore] = useState("");
    const [scriptSummary, setScriptSummary] = useState("");
    const [hooks, setHooks] = useState<HookResult[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [error, setError] = useState("");

    // Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (!currentSession) {
                window.location.href = '/login';
                return;
            }
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                window.location.href = '/login';
                return;
            }
            setSession(currentSession);
            setIsLoading(false);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (event === 'SIGNED_OUT' || !newSession) {
                window.location.href = '/login';
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleGenerate = async () => {
        if (!script.trim() || script.length < 20) {
            setError("Please enter a script (at least 20 characters)");
            return;
        }

        setError("");
        setIsGenerating(true);
        setHooks([]);

        try {
            const response = await fetch('/api/hooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script,
                    stylePreference,
                    mode,
                    aiModel
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate hooks');
            }

            setGenre(data.genre);
            setEmotionalCore(data.emotionalCore);
            setScriptSummary(data.scriptSummary);
            setHooks(data.hooks || []);

        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyHook = (hook: string, index: number) => {
        navigator.clipboard.writeText(hook);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pt-24 pb-32">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 -z-10 opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-900 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl md:text-5xl font-black mb-3">
                        Script <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Hook</span> Generator
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Paste your script → Get viral opening hooks
                    </p>
                </motion.div>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4 mb-6"
                >
                    {/* Script Input */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Your Script / Video Content
                        </label>
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="Paste your reel or shorts script here... What is your video about? What happens in it?"
                            className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-500 resize-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                            maxLength={2000}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                            {script.length}/2000
                        </div>
                    </div>

                    {/* Style Preference */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <Wand2 className="w-4 h-4" />
                            Style Preference (Optional)
                        </label>
                        <input
                            type="text"
                            value={stylePreference}
                            onChange={(e) => setStylePreference(e.target.value)}
                            placeholder="e.g., funny, mysterious, dramatic, relatable..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500/50 transition-all"
                            maxLength={200}
                        />
                    </div>

                    {/* Mode & Model Selectors */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Mode Selector */}
                        <div className="flex bg-gray-900/50 rounded-xl p-1 flex-1">
                            {(['shocking', 'cinematic', 'chaos'] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all",
                                        mode === m
                                            ? m === 'shocking' ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                                                : m === 'cinematic' ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                                    : "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                            : "text-gray-500 hover:text-white"
                                    )}
                                >
                                    {m === 'shocking' && <Zap className="w-3.5 h-3.5" />}
                                    {m === 'cinematic' && <Clapperboard className="w-3.5 h-3.5" />}
                                    {m === 'chaos' && <Sparkles className="w-3.5 h-3.5" />}
                                    <span className="capitalize">{m}</span>
                                </button>
                            ))}
                        </div>

                        {/* AI Model Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-xl text-xs font-medium text-gray-300 hover:text-white transition-all min-w-[160px]"
                            >
                                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                                <span className="truncate">{INTELLIGENCE_MODELS.find(m => m.id === aiModel)?.name}</span>
                                <ChevronDown className={cn("w-3.5 h-3.5 ml-auto transition-transform", isModelDropdownOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isModelDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-2 right-0 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-1.5"
                                    >
                                        {INTELLIGENCE_MODELS.map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    setAiModel(model.id);
                                                    setIsModelDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                                                    aiModel === model.id ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                <model.icon className="w-4 h-4" />
                                                {model.name}
                                                {aiModel === model.id && <Check className="w-3.5 h-3.5 ml-auto text-purple-400" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || script.length < 20}
                        className={cn(
                            "w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3",
                            isGenerating
                                ? "bg-gray-700 text-gray-400 cursor-wait"
                                : script.length < 20
                                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 shadow-lg shadow-orange-500/20"
                        )}
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Analyzing Script...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" />
                                Generate Viral Hooks
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Results Section */}
                <AnimatePresence>
                    {hooks.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {/* Genre & Summary */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full text-xs font-bold text-orange-300">
                                    {genre}
                                </span>
                                {emotionalCore && (
                                    <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-medium text-purple-300">
                                        {emotionalCore}
                                    </span>
                                )}
                            </div>

                            {scriptSummary && (
                                <p className="text-gray-400 text-sm mb-6 italic">
                                    "{scriptSummary}"
                                </p>
                            )}

                            {/* Hook Cards */}
                            <div className="grid gap-4">
                                {hooks.map((hook, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all group"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold px-2 py-1 bg-orange-500/20 text-orange-300 rounded-lg">
                                                    {hook.hookType}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {hook.style}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => copyHook(hook.hook, index)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                            >
                                                {copiedIndex === index ? (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>

                                        <p className="text-lg font-medium text-white mb-3 leading-relaxed">
                                            "{hook.hook}"
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <ArrowRight className="w-3 h-3" />
                                                <span className="text-gray-400">Fade-out:</span>
                                                {hook.fadeOut}
                                            </div>
                                        </div>

                                        {hook.whyItWorks && (
                                            <p className="mt-3 text-xs text-gray-500 italic">
                                                💡 {hook.whyItWorks}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
