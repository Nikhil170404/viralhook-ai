"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Trash2, Copy, Check, Sparkles, Zap, ChevronDown, ChevronRight,
    Film, User, BookOpen, Play, Brain, Cpu, RefreshCw, Wand2, Edit3,
    Users, Swords, Skull, Heart, Laugh, Moon, Settings, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";
import { fetchWithCSRF } from "@/lib/api-client";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Step indicators
const STEPS = ["Concept", "AI Review", "Generate"];

// Genre options
const GENRES = [
    { id: "action", name: "Action/Adventure", icon: Swords },
    { id: "fantasy", name: "Fantasy", icon: Wand2 },
    { id: "scifi", name: "Sci-Fi", icon: Cpu },
    { id: "romance", name: "Romance", icon: Heart },
    { id: "horror", name: "Horror", icon: Skull },
    { id: "comedy", name: "Comedy", icon: Laugh },
];

const HERO_AGES = ["teenager", "young adult", "adult"];
const TEAM_SIZES = [
    { id: "solo", name: "Solo Hero", desc: "Just the protagonist" },
    { id: "2", name: "Small Team", desc: "Hero + 2 allies" },
    { id: "4", name: "Full Squad", desc: "Hero + 4 allies" },
];
const VILLAIN_TYPES = [
    { id: "single", name: "Single Enemy", desc: "One powerful antagonist" },
    { id: "organization", name: "Evil Organization", desc: "Shadowy group with hierarchy" },
    { id: "monster", name: "Monster/Demon", desc: "Non-human threat" },
];
const STYLES = [
    { id: "dark", name: "Dark & Serious" },
    { id: "balanced", name: "Balanced" },
    { id: "light", name: "Light & Fun" },
];

// Intelligence Models (same as main generator)
const INTELLIGENCE_MODELS = [
    { id: "xiaomi/mimo-v2-flash:free", name: "Xiaomi MIMO v2 (Instant)", desc: "Fastest generation" },
    { id: "deepseek/deepseek-r1-0528:free", name: "Deepseek R1 (Thinking)", desc: "Best quality with reasoning" },
    { id: "tngtech/deepseek-r1t2-chimera:free", name: "R1T2 Chimera (Thinking)", desc: "Hybrid reasoning" },
    { id: "tngtech/deepseek-r1t-chimera:free", name: "R1T Chimera (Thinking)", desc: "Balanced reasoning" },
];

// Storage keys
const STORAGE_KEY = "viralhook_series_data";

export default function SeriesPage() {
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    // Step 1: Concept Form
    const [genre, setGenre] = useState("action");
    const [heroGender, setHeroGender] = useState("male");
    const [heroAge, setHeroAge] = useState("teenager");
    const [teamSize, setTeamSize] = useState("2");
    const [villainType, setVillainType] = useState("organization");
    const [style, setStyle] = useState("balanced");
    const [customConcept, setCustomConcept] = useState("");
    const [aiModel, setAiModel] = useState("xiaomi/mimo-v2-flash:free");


    // Step 2: AI-Generated Data
    const [isGenerating, setIsGenerating] = useState(false);
    const [seriesBible, setSeriesBible] = useState<any>(null);
    const [characters, setCharacters] = useState<any[]>([]);
    const [editingField, setEditingField] = useState<string | null>(null);

    // Step 3: Episode Generation
    const [episodeNumber, setEpisodeNumber] = useState(1);
    const [isGeneratingEpisode, setIsGeneratingEpisode] = useState(false);
    const [episodeResult, setEpisodeResult] = useState<any>(null);

    // Errors and UI
    const [error, setError] = useState("");
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Auth check
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session: s } } = await supabase.auth.getSession();
            if (!s) { window.location.href = '/login'; return; }
            setSession(s);
            setIsLoading(false);

            // Load saved data
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.seriesBible) {
                    setSeriesBible(data.seriesBible);
                    setCharacters(data.characters || []);
                    setCurrentStep(1);
                }
            }
        };
        checkAuth();
    }, []);

    // Save to localStorage when data changes
    useEffect(() => {
        if (seriesBible) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ seriesBible, characters }));
        }
    }, [seriesBible, characters]);

    // Step 1: Generate concept (with streaming to avoid timeout)
    const handleGenerateConcept = async () => {
        setError("");
        setIsGenerating(true);

        try {
            const response = await fetch('/api/series/generate-concept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    genre: GENRES.find(g => g.id === genre)?.name || genre,
                    heroGender,
                    heroAge,
                    teamSize,
                    villainType: VILLAIN_TYPES.find(v => v.id === villainType)?.name || villainType,
                    style: STYLES.find(s => s.id === style)?.name || style,
                    customConcept,
                    aiModel
                })
            });


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Generation failed');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("No response body");

            let result: any = null;
            let allChunks = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                allChunks += text;
                const lines = text.split('\n').filter(line => line.trim().startsWith('data:'));

                for (const line of lines) {
                    try {
                        const jsonStr = line.replace('data:', '').trim();
                        if (jsonStr) {
                            const parsed = JSON.parse(jsonStr);
                            console.log("Parsed chunk:", parsed);
                            if (parsed.done && parsed.success) {
                                result = parsed;
                            } else if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                        }
                    } catch (e) {
                        // Continue reading, but log for debugging
                        console.log("Parse error on line:", line);
                    }
                }
            }

            console.log("Final result:", result);
            console.log("All chunks:", allChunks);

            if (result && result.seriesBible) {
                setSeriesBible(result.seriesBible);
                setCharacters(result.characters || []);
                setCurrentStep(1);
            } else {
                console.error("No valid seriesBible found. Result:", result);
                throw new Error("AI response parsing failed. Check console for details.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // Step 3: Generate episode (with streaming to avoid timeout)
    const handleGenerateEpisode = async () => {
        setError("");
        setIsGeneratingEpisode(true);

        try {
            const response = await fetch('/api/series', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seriesBible,
                    characters,
                    episodeConfig: {
                        episodeNumber,
                        arcPosition: episodeNumber <= 3 ? "Introduction" : episodeNumber <= 12 ? "Rising Action" : episodeNumber <= 18 ? "Climax" : "Resolution",
                        requiredBeats: [],
                        charactersAppearing: characters.map((c: any) => c.name),
                        previousSummary: "",
                        nextEpisodeHook: ""
                    },
                    targetPlatform: "veo",
                    aiModel
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Generation failed');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("No response body");

            let result: any = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                const lines = text.split('\n').filter(line => line.trim().startsWith('data:'));

                for (const line of lines) {
                    try {
                        const jsonStr = line.replace('data:', '').trim();
                        if (jsonStr) {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed.done && parsed.success) {
                                result = parsed;
                            } else if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                        }
                    } catch (e) {
                        // Continue reading
                    }
                }
            }

            if (result) {
                setEpisodeResult(result);
            } else {
                throw new Error("Failed to generate episode. Please try again.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGeneratingEpisode(false);
        }
    };

    // Reset and start over
    const handleReset = () => {
        localStorage.removeItem(STORAGE_KEY);
        setSeriesBible(null);
        setCharacters([]);
        setEpisodeResult(null);
        setCurrentStep(0);
    };

    // Copy helper
    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans pt-24 pb-32">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 -z-10 opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-black mb-3">
                        Anime <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Series</span> Generator
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Tell us your concept → AI creates everything → You generate episodes
                    </p>
                </motion.div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {STEPS.map((step, i) => (
                        <div key={step} className="flex items-center gap-2">
                            <button
                                onClick={() => i < currentStep && setCurrentStep(i)}
                                disabled={i > currentStep}
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                    i === currentStep ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" :
                                        i < currentStep ? "bg-purple-500/30 text-purple-300 cursor-pointer hover:bg-purple-500/50" :
                                            "bg-gray-800 text-gray-500"
                                )}
                            >
                                {i + 1}
                            </button>
                            <span className={cn(
                                "text-sm font-medium hidden sm:block",
                                i === currentStep ? "text-white" : "text-gray-500"
                            )}>{step}</span>
                            {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-gray-700" />}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {/* STEP 0: Concept Form */}
                    {currentStep === 0 && (
                        <motion.div
                            key="concept"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* Genre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">Genre</label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {GENRES.map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => setGenre(g.id)}
                                            className={cn(
                                                "p-3 rounded-xl border transition-all flex flex-col items-center gap-1",
                                                genre === g.id
                                                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                            )}
                                        >
                                            <g.icon className="w-5 h-5" />
                                            <span className="text-xs">{g.name.split('/')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hero */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Hero Gender</label>
                                    <div className="flex gap-2">
                                        {["male", "female"].map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setHeroGender(g)}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl border text-sm font-medium transition-all",
                                                    heroGender === g
                                                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                                        : "bg-white/5 border-white/10 text-gray-400"
                                                )}
                                            >
                                                {g.charAt(0).toUpperCase() + g.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Hero Age</label>
                                    <div className="flex gap-2">
                                        {HERO_AGES.map(a => (
                                            <button
                                                key={a}
                                                onClick={() => setHeroAge(a)}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl border text-xs font-medium transition-all capitalize",
                                                    heroAge === a
                                                        ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                                        : "bg-white/5 border-white/10 text-gray-400"
                                                )}
                                            >
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Team Size */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Team Size</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {TEAM_SIZES.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTeamSize(t.id)}
                                            className={cn(
                                                "p-3 rounded-xl border transition-all text-left",
                                                teamSize === t.id
                                                    ? "bg-purple-500/20 border-purple-500/50"
                                                    : "bg-white/5 border-white/10"
                                            )}
                                        >
                                            <div className={cn("text-sm font-medium", teamSize === t.id ? "text-purple-300" : "text-gray-300")}>{t.name}</div>
                                            <div className="text-xs text-gray-500">{t.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Villain */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Villain Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {VILLAIN_TYPES.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => setVillainType(v.id)}
                                            className={cn(
                                                "p-3 rounded-xl border transition-all text-left",
                                                villainType === v.id
                                                    ? "bg-purple-500/20 border-purple-500/50"
                                                    : "bg-white/5 border-white/10"
                                            )}
                                        >
                                            <div className={cn("text-sm font-medium", villainType === v.id ? "text-purple-300" : "text-gray-300")}>{v.name}</div>
                                            <div className="text-xs text-gray-500">{v.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Style */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Tone/Style</label>
                                <div className="flex gap-2">
                                    {STYLES.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setStyle(s.id)}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl border text-sm font-medium transition-all",
                                                style === s.id
                                                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                                    : "bg-white/5 border-white/10 text-gray-400"
                                            )}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AI Model Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">AI Model</label>
                                <select
                                    value={aiModel}
                                    onChange={(e) => setAiModel(e.target.value)}
                                    className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white [&>option]:bg-gray-900 [&>option]:text-white"
                                >
                                    {INTELLIGENCE_MODELS.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} - {m.desc}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Concept */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Custom Concept (Optional)</label>
                                <textarea
                                    value={customConcept}
                                    onChange={(e) => setCustomConcept(e.target.value)}
                                    placeholder="Add any specific ideas: 'The hero has fire powers', 'Set in ancient Japan', 'The villain is the hero's brother'..."
                                    className="w-full h-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none text-sm"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    {error}
                                </div>
                            )}

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerateConcept}
                                disabled={isGenerating}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3",
                                    isGenerating
                                        ? "bg-gray-700 text-gray-400 cursor-wait"
                                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/20"
                                )}
                            >
                                {isGenerating ? (
                                    <><RefreshCw className="w-5 h-5 animate-spin" /> AI is creating your series...</>
                                ) : (
                                    <><Wand2 className="w-5 h-5" /> Generate Series with AI</>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1: AI Review */}
                    {currentStep === 1 && seriesBible && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* Series Bible Card */}
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-purple-400 uppercase">Series Bible</span>
                                    <button onClick={handleReset} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1">
                                        <Trash2 className="w-3 h-3" /> Start Over
                                    </button>
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2">{seriesBible.title}</h2>
                                <p className="text-gray-400 text-sm mb-4">{seriesBible.worldRules}</p>
                                <div className="flex flex-wrap gap-2">
                                    {seriesBible.themes?.map((t: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300">{t}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Characters */}
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-400" /> Characters ({characters.length})
                                </h3>
                                <div className="space-y-3">
                                    {characters.map((char: any, i: number) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <span className={cn(
                                                        "text-xs font-bold uppercase px-2 py-0.5 rounded",
                                                        char.role === 'hero' ? "bg-green-500/20 text-green-400" :
                                                            char.role === 'villain' ? "bg-red-500/20 text-red-400" :
                                                                "bg-blue-500/20 text-blue-400"
                                                    )}>
                                                        {char.role}
                                                    </span>
                                                    <h4 className="text-lg font-bold text-white mt-1">{char.name}</h4>
                                                </div>
                                                <span className="text-xs text-gray-500">{char.age} years old</span>
                                            </div>
                                            <div className="text-sm text-gray-400 space-y-1">
                                                <p><span className="text-gray-500">Look:</span> {char.visualSpec?.hair}, {char.visualSpec?.eyes}</p>
                                                <p><span className="text-gray-500">Outfit:</span> {char.visualSpec?.outfit}</p>
                                                <p><span className="text-gray-500">Personality:</span> {char.personality}</p>
                                                {char.powers && <p><span className="text-gray-500">Powers:</span> {char.powers}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Arc Overview */}
                            {seriesBible.arcOverview && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-gray-400 mb-2">24-Episode Arc Overview</h4>
                                    <p className="text-sm text-gray-300">{seriesBible.arcOverview}</p>
                                </div>
                            )}

                            {/* Continue Button */}
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 flex items-center justify-center gap-3"
                            >
                                Continue to Episode Generation <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: Generate Episodes */}
                    {currentStep === 2 && (
                        <motion.div
                            key="generate"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold">{seriesBible?.title}</h3>
                                    <p className="text-sm text-gray-500">{characters.length} characters ready</p>
                                </div>
                                <button onClick={() => setCurrentStep(1)} className="text-sm text-purple-400 hover:text-purple-300">
                                    Edit Setup
                                </button>
                            </div>

                            {/* Episode Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Select Episode</label>
                                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                                    {Array.from({ length: 24 }, (_, i) => i + 1).map(ep => (
                                        <button
                                            key={ep}
                                            onClick={() => setEpisodeNumber(ep)}
                                            className={cn(
                                                "py-2 rounded-lg text-sm font-bold transition-all",
                                                episodeNumber === ep
                                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                                    : "bg-white/5 text-gray-500 hover:text-white"
                                            )}
                                        >
                                            {ep}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    {error}
                                </div>
                            )}

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerateEpisode}
                                disabled={isGeneratingEpisode}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3",
                                    isGeneratingEpisode
                                        ? "bg-gray-700 text-gray-400 cursor-wait"
                                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                                )}
                            >
                                {isGeneratingEpisode ? (
                                    <><RefreshCw className="w-5 h-5 animate-spin" /> Generating Episode {episodeNumber}...</>
                                ) : (
                                    <><Film className="w-5 h-5" /> Generate Episode {episodeNumber} Prompts</>
                                )}
                            </button>

                            {/* Results */}
                            {episodeResult && (
                                <div className="space-y-4 mt-6">
                                    <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-2xl p-5">
                                        <span className="text-xs font-bold text-green-400">EPISODE {episodeNumber}</span>
                                        <h3 className="text-xl font-bold text-white">{episodeResult.episodeTitle}</h3>
                                        <p className="text-gray-400 text-sm mt-2">{episodeResult.episodeSummary}</p>
                                    </div>

                                    {episodeResult.scenes?.map((scene: any, si: number) => (
                                        <div key={si} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <h4 className="text-sm font-bold text-gray-400 mb-3">
                                                SCENE {scene.sceneNumber}: {scene.sceneType}
                                            </h4>
                                            <div className="space-y-3">
                                                {scene.clips?.map((clip: any, ci: number) => (
                                                    <div key={ci} className="bg-black/30 rounded-lg p-3 border border-white/5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-purple-400 font-bold">CLIP {clip.clipNumber}</span>
                                                            <button
                                                                onClick={() => copyToClipboard(
                                                                    `[SHOT]: ${clip.shotType}\n[CAMERA]: ${clip.camera}\n[SUBJECT]: ${clip.character}\n[ACTION]: ${clip.action}\n[CONTEXT]: ${clip.context}\n[STYLE]: ${clip.style}\n(no subtitles)`,
                                                                    `clip-${si}-${ci}`
                                                                )}
                                                                className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs"
                                                            >
                                                                {copiedField === `clip-${si}-${ci}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-gray-300">{clip.action}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
