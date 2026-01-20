"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
    Copy, Check, Sparkles, Zap, Clapperboard, ChevronDown,
    FileText, Wand2, RefreshCw, Video, Camera, Sun, Target, Cpu, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";
import { fetchWithCSRF } from "@/lib/api-client";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AI_MODELS = [
    { id: "xiaomi/mimo-v2-flash:free", name: "Xiaomi MIMO v2", icon: Zap },
    { id: "tngtech/deepseek-r1t2-chimera:free", name: "TNG Chimera", icon: Target },
];

const TARGET_MODELS = [
    { id: "kling", name: "Kling AI", color: "from-blue-500 to-cyan-500" },
    { id: "runway", name: "Runway", color: "from-purple-500 to-pink-500" },
    { id: "veo", name: "Veo", color: "from-green-500 to-teal-500" },
    { id: "luma", name: "Luma", color: "from-orange-500 to-red-500" },
];

interface HookResult {
    hook: string;
    prompt: string;
    fadeOut: string;
    viralHook: string;
    cameraWork: string;
    lighting: string;
    hookMoment: string;
    genre: string;
    difficulty: string;
    platformSpecific: {
        kling?: string;
        runway?: string;
        veo?: string;
    };
}

export default function HooksPage() {
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form State
    const [script, setScript] = useState("");
    const [stylePreference, setStylePreference] = useState("");
    const [mode, setMode] = useState<'chaos' | 'cinematic' | 'shocking'>('shocking');
    const [targetModel, setTargetModel] = useState("kling");
    const [aiModel, setAiModel] = useState(AI_MODELS[0].id);
    const [isAiDropdownOpen, setIsAiDropdownOpen] = useState(false);

    // Results State
    const [result, setResult] = useState<HookResult | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
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
            setError("Please enter your script (at least 20 characters)");
            return;
        }

        setError("");
        setIsGenerating(true);
        setResult(null);

        try {
            const response = await fetchWithCSRF('/api/hooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script,
                    stylePreference,
                    mode,
                    targetModel,
                    aiModel
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate hook prompt');
            }

            setResult({
                hook: data.hook,
                prompt: data.prompt,
                fadeOut: data.fadeOut,
                viralHook: data.viralHook,
                cameraWork: data.cameraWork,
                lighting: data.lighting,
                hookMoment: data.hookMoment,
                genre: data.genre,
                difficulty: data.difficulty,
                platformSpecific: data.platformSpecific || {}
            });

        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
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
                        Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Hook</span> Generator
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Generate viral opening scenes that fade-out into your main content
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
                            Your Video Script / Main Content
                        </label>
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="Paste your reel or shorts script here... What is your video about? What happens in it? The AI will create an attention-grabbing opening scene that fades out into this content."
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
                            Visual Style (Optional)
                        </label>
                        <input
                            type="text"
                            value={stylePreference}
                            onChange={(e) => setStylePreference(e.target.value)}
                            placeholder="e.g., mysterious, dramatic zoom, freeze frame, POV shot..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500/50 transition-all"
                            maxLength={200}
                        />
                    </div>

                    {/* Target Model Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Target Video AI
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {TARGET_MODELS.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => setTargetModel(model.id)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                                        targetModel === model.id
                                            ? `bg-gradient-to-r ${model.color} text-white border-transparent`
                                            : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                                    )}
                                >
                                    {model.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mode & AI Model */}
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
                                onClick={() => setIsAiDropdownOpen(!isAiDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/50 border border-white/10 rounded-xl text-xs font-medium text-gray-300 hover:text-white transition-all min-w-[160px]"
                            >
                                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                                <span className="truncate">{AI_MODELS.find(m => m.id === aiModel)?.name}</span>
                                <ChevronDown className={cn("w-3.5 h-3.5 ml-auto transition-transform", isAiDropdownOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isAiDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-2 right-0 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-1.5"
                                    >
                                        {AI_MODELS.map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    setAiModel(model.id);
                                                    setIsAiDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                                                    aiModel === model.id ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                <model.icon className="w-4 h-4" />
                                                {model.name}
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
                                Generating Hook Scene...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" />
                                Generate Video Hook Prompt
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {/* Genre & Difficulty Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full text-xs font-bold text-orange-300">
                                    {result.genre}
                                </span>
                                <span className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium border",
                                    result.difficulty === 'Easy' ? "bg-green-500/20 border-green-500/30 text-green-300" :
                                        result.difficulty === 'Hard' ? "bg-red-500/20 border-red-500/30 text-red-300" :
                                            "bg-yellow-500/20 border-yellow-500/30 text-yellow-300"
                                )}>
                                    {result.difficulty}
                                </span>
                                <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-medium text-purple-300">
                                    {targetModel.toUpperCase()} Ready
                                </span>
                            </div>

                            {/* Hook Text */}
                            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-orange-400">HOOK TEXT</span>
                                    <button
                                        onClick={() => copyToClipboard(result.hook, 'hook')}
                                        className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                                    >
                                        {copiedField === 'hook' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                    </button>
                                </div>
                                <p className="text-xl font-bold text-white">"{result.hook}"</p>
                            </div>

                            {/* Main Video Prompt */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                        <Video className="w-4 h-4" />
                                        VIDEO PROMPT (Copy to {targetModel.toUpperCase()})
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(result.prompt, 'prompt')}
                                        className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 text-xs font-bold hover:bg-orange-500/30 transition-all flex items-center gap-1.5"
                                    >
                                        {copiedField === 'prompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        Copy Prompt
                                    </button>
                                </div>
                                <p className="text-gray-200 leading-relaxed">{result.prompt}</p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Fade-Out */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
                                        <Target className="w-4 h-4" />
                                        FADE-OUT TRANSITION
                                    </div>
                                    <p className="text-gray-300 text-sm">{result.fadeOut}</p>
                                </div>

                                {/* Camera Work */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
                                        <Camera className="w-4 h-4" />
                                        CAMERA WORK
                                    </div>
                                    <p className="text-gray-300 text-sm">{result.cameraWork}</p>
                                </div>

                                {/* Lighting */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
                                        <Sun className="w-4 h-4" />
                                        LIGHTING
                                    </div>
                                    <p className="text-gray-300 text-sm">{result.lighting}</p>
                                </div>

                                {/* Hook Moment */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2">
                                        <Zap className="w-4 h-4" />
                                        HOOK MOMENT
                                    </div>
                                    <p className="text-gray-300 text-sm">{result.hookMoment}</p>
                                </div>
                            </div>

                            {/* Why It Works */}
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                                <div className="text-xs font-bold text-purple-400 mb-2">💡 WHY THIS HOOK WORKS</div>
                                <p className="text-gray-300 text-sm">{result.viralHook}</p>
                            </div>

                            {/* Platform Specific */}
                            {result.platformSpecific && Object.keys(result.platformSpecific).length > 0 && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="text-xs font-bold text-gray-400 mb-3">PLATFORM SETTINGS</div>
                                    <div className="space-y-2 text-sm">
                                        {result.platformSpecific.kling && (
                                            <div><span className="text-blue-400 font-medium">Kling:</span> <span className="text-gray-400">{result.platformSpecific.kling}</span></div>
                                        )}
                                        {result.platformSpecific.runway && (
                                            <div><span className="text-purple-400 font-medium">Runway:</span> <span className="text-gray-400">{result.platformSpecific.runway}</span></div>
                                        )}
                                        {result.platformSpecific.veo && (
                                            <div><span className="text-green-400 font-medium">Veo:</span> <span className="text-gray-400">{result.platformSpecific.veo}</span></div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
