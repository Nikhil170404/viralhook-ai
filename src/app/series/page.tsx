"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Trash2, Copy, Check, Sparkles, Zap, ChevronDown, ChevronRight,
    Film, User, BookOpen, Play, Brain, Cpu, RefreshCw, Wand2, Edit3,
    Users, Swords, Skull, Heart, Laugh, Settings, ArrowRight, MessageSquare,
    CheckCircle, Clock, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Constants
const GENRES = [
    { id: "action", name: "Action/Adventure", icon: Swords },
    { id: "fantasy", name: "Fantasy", icon: Wand2 },
    { id: "scifi", name: "Sci-Fi", icon: Cpu },
    { id: "romance", name: "Romance", icon: Heart },
    { id: "horror", name: "Horror", icon: Skull },
    { id: "comedy", name: "Comedy", icon: Laugh },
];

const INTELLIGENCE_MODELS = [
    { id: "xiaomi/mimo-v2-flash:free", name: "Xiaomi MIMO v2 (Instant)", desc: "Fastest" },
    { id: "deepseek/deepseek-r1-0528:free", name: "Deepseek R1 (Thinking)", desc: "Best quality" },
    { id: "tngtech/deepseek-r1t2-chimera:free", name: "R1T2 Chimera", desc: "Hybrid" },
];

const STORAGE_KEY = "viralhook_series_data";

interface Character {
    id: string;
    name: string;
    role: "hero" | "friend" | "villain" | "other";
    gender: string;
    age: number;
    hair: string;
    eyes: string;
    outfit: string;
    personality: string;
    powers: string;
}

interface Episode {
    episodeNumber: number;
    title: string;
    summary: string;
    scenes: any[];
    createdAt: string;
}

interface SeriesData {
    seriesBible: {
        title: string;
        genre: string;
        worldRules: string;
        themes: string[];
    } | null;
    characters: Character[];
    episodes: Episode[];
}

const DEFAULT_CHARACTER: Character = {
    id: "",
    name: "",
    role: "hero",
    gender: "male",
    age: 17,
    hair: "Black, spiky",
    eyes: "Brown, determined",
    outfit: "School uniform with special accessory",
    personality: "Brave, loyal, never gives up",
    powers: "Hidden power awakening"
};

export default function SeriesPage() {
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Series Data
    const [seriesData, setSeriesData] = useState<SeriesData>({
        seriesBible: null,
        characters: [],
        episodes: []
    });

    // UI State
    const [activePanel, setActivePanel] = useState<"setup" | "characters" | "episodes">("setup");
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
    const [error, setError] = useState("");
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Setup Form
    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState("action");
    const [worldRules, setWorldRules] = useState("");
    const [aiModel, setAiModel] = useState("xiaomi/mimo-v2-flash:free");

    // Character Form
    const [editingChar, setEditingChar] = useState<Character | null>(null);
    const [showCharForm, setShowCharForm] = useState(false);

    // Import Mode
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState("");

    // Parse imported story text
    const parseImportedStory = (text: string) => {
        try {
            // Extract series info
            const titleMatch = text.match(/SERIES TITLE:\s*(.+)/i);
            const genreMatch = text.match(/GENRE:\s*(.+)/i);
            // Use [\s\S] instead of dotAll flag for compatibility
            const worldMatch = text.match(/WORLD RULES:\s*([\s\S]+?)(?=\n\n|---|\n[A-Z])/i);

            if (!titleMatch) {
                setError("Could not find SERIES TITLE in the text");
                return;
            }

            const parsedTitle = titleMatch[1].trim();
            const parsedGenre = genreMatch ? genreMatch[1].trim() : "Action/Adventure";
            const parsedWorld = worldMatch ? worldMatch[1].trim() : "";

            // Extract all characters (HERO, FRIEND, VILLAIN patterns)
            const characterBlocks = text.split(/(?=(?:HERO|FRIEND|MAIN VILLAIN|VILLAIN|ALLY|MENTOR|RIVAL)\s*(?:\d*\s*)?CHARACTER:|(?:HERO|FRIEND|MAIN VILLAIN|VILLAIN|ALLY|MENTOR|RIVAL)\s*\d*:)/i);

            const characters: Character[] = [];

            for (const block of characterBlocks) {
                if (!block.trim()) continue;

                const nameMatch = block.match(/Name:\s*(.+)/i);
                if (!nameMatch) continue;

                const roleMatch = block.match(/Role:\s*(.+)/i) || block.match(/(hero|friend|villain|ally|mentor|rival)/i);
                const genderMatch = block.match(/Gender:\s*(.+)/i);
                const ageMatch = block.match(/Age:\s*(\d+)/i);
                const hairMatch = block.match(/Hair:\s*(.+)/i);
                const eyesMatch = block.match(/Eyes:\s*(.+)/i);
                const outfitMatch = block.match(/Outfit:\s*(.+)/i);
                const personalityMatch = block.match(/Personality:\s*(.+)/i);
                const powersMatch = block.match(/Powers:\s*(.+)/i);

                let role: "hero" | "friend" | "villain" | "other" = "other";
                const roleText = roleMatch ? roleMatch[1].toLowerCase() : "";
                if (roleText.includes("hero")) role = "hero";
                else if (roleText.includes("friend") || roleText.includes("ally")) role = "friend";
                else if (roleText.includes("villain")) role = "villain";

                characters.push({
                    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: nameMatch[1].trim(),
                    role,
                    gender: genderMatch ? genderMatch[1].trim().toLowerCase() : "male",
                    age: ageMatch ? parseInt(ageMatch[1]) : 17,
                    hair: hairMatch ? hairMatch[1].trim() : "",
                    eyes: eyesMatch ? eyesMatch[1].trim() : "",
                    outfit: outfitMatch ? outfitMatch[1].trim() : "",
                    personality: personalityMatch ? personalityMatch[1].trim() : "",
                    powers: powersMatch ? powersMatch[1].trim() : ""
                });
            }

            if (characters.length === 0) {
                setError("Could not find any characters in the text. Make sure format includes 'Name:', 'Role:', etc.");
                return;
            }

            // Set all data
            setSeriesData({
                seriesBible: {
                    title: parsedTitle,
                    genre: parsedGenre,
                    worldRules: parsedWorld,
                    themes: []
                },
                characters,
                episodes: []
            });

            setTitle(parsedTitle);
            setWorldRules(parsedWorld);
            setShowImport(false);
            setImportText("");
            setActivePanel("characters");
            setError("");

            alert(`✅ Imported successfully!\n\n📖 Series: ${parsedTitle}\n👥 Characters: ${characters.length}\n\nReview your characters and start generating episodes!`);

        } catch (err: any) {
            setError("Failed to parse story: " + err.message);
        }
    };

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
                const data = JSON.parse(saved) as SeriesData;
                setSeriesData(data);
                if (data.seriesBible) {
                    setTitle(data.seriesBible.title);
                    setGenre(data.seriesBible.genre || "action");
                    setWorldRules(data.seriesBible.worldRules || "");
                    if (data.episodes.length > 0) {
                        setActivePanel("episodes");
                    } else if (data.characters.length > 0) {
                        setActivePanel("characters");
                    }
                }
            }
        };
        checkAuth();
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (seriesData.seriesBible || seriesData.characters.length > 0 || seriesData.episodes.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seriesData));
        }
    }, [seriesData]);

    // Save series setup
    const handleSaveSetup = () => {
        if (!title.trim()) {
            setError("Please enter a series title");
            return;
        }
        setSeriesData(prev => ({
            ...prev,
            seriesBible: {
                title,
                genre: GENRES.find(g => g.id === genre)?.name || genre,
                worldRules,
                themes: []
            }
        }));
        setActivePanel("characters");
        setError("");
    };

    // Character management
    const handleSaveCharacter = () => {
        if (!editingChar?.name.trim()) {
            setError("Please enter character name");
            return;
        }

        const charWithId = {
            ...editingChar,
            id: editingChar.id || `char_${Date.now()}`
        };

        setSeriesData(prev => ({
            ...prev,
            characters: editingChar.id
                ? prev.characters.map(c => c.id === editingChar.id ? charWithId : c)
                : [...prev.characters, charWithId]
        }));
        setEditingChar(null);
        setShowCharForm(false);
        setError("");
    };

    const handleDeleteCharacter = (id: string) => {
        if (confirm("Delete this character?")) {
            setSeriesData(prev => ({
                ...prev,
                characters: prev.characters.filter(c => c.id !== id)
            }));
        }
    };

    // Generate episode
    const handleGenerateEpisode = async () => {
        if (seriesData.characters.length === 0) {
            setError("Please add at least one character first");
            return;
        }

        setError("");
        setIsGenerating(true);
        const nextEpisodeNumber = seriesData.episodes.length + 1;

        try {
            const response = await fetch('/api/series', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seriesBible: seriesData.seriesBible,
                    characters: seriesData.characters.map(c => ({
                        name: c.name,
                        role: c.role,
                        age: c.age,
                        gender: c.gender,
                        visualSpec: {
                            hair: c.hair,
                            eyes: c.eyes,
                            outfit: c.outfit
                        },
                        personality: c.personality,
                        powers: c.powers
                    })),
                    episodeConfig: {
                        episodeNumber: nextEpisodeNumber,
                        arcPosition: nextEpisodeNumber <= 3 ? "Introduction" : nextEpisodeNumber <= 12 ? "Rising Action" : nextEpisodeNumber <= 18 ? "Climax" : "Resolution",
                        requiredBeats: [],
                        charactersAppearing: seriesData.characters.map(c => c.name),
                        previousSummary: seriesData.episodes.length > 0
                            ? seriesData.episodes[seriesData.episodes.length - 1].summary
                            : "",
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

            // Handle streaming
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
                            if (parsed.done && parsed.success) result = parsed;
                            else if (parsed.error) throw new Error(parsed.error);
                        }
                    } catch (e) { /* continue */ }
                }
            }

            if (result) {
                const newEpisode: Episode = {
                    episodeNumber: nextEpisodeNumber,
                    title: result.episodeTitle || `Episode ${nextEpisodeNumber}`,
                    summary: result.episodeSummary || "",
                    scenes: result.scenes || [],
                    createdAt: new Date().toISOString()
                };
                setSeriesData(prev => ({
                    ...prev,
                    episodes: [...prev.episodes, newEpisode]
                }));
                setSelectedEpisode(newEpisode);
            } else {
                throw new Error("Failed to generate episode");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // Reset series
    const handleReset = () => {
        if (confirm("Delete this series and start over?")) {
            localStorage.removeItem(STORAGE_KEY);
            setSeriesData({ seriesBible: null, characters: [], episodes: [] });
            setTitle("");
            setWorldRules("");
            setActivePanel("setup");
            setSelectedEpisode(null);
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

            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black">
                                {seriesData.seriesBible?.title || "New Series"}
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                {seriesData.characters.length} characters • {seriesData.episodes.length} episodes
                            </p>
                        </div>
                        {seriesData.seriesBible && (
                            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-400 flex items-center gap-1">
                                <Trash2 className="w-4 h-4" /> Reset
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="flex gap-1 bg-gray-900/50 rounded-xl p-1 mb-6">
                    {[
                        { id: "setup", label: "Setup", icon: Settings },
                        { id: "characters", label: "Characters", icon: Users },
                        { id: "episodes", label: "Episodes", icon: Film }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActivePanel(tab.id as any)}
                            className={cn(
                                "flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                activePanel === tab.id
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                    : "text-gray-500 hover:text-white"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.id === "characters" && seriesData.characters.length > 0 && (
                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{seriesData.characters.length}</span>
                            )}
                            {tab.id === "episodes" && seriesData.episodes.length > 0 && (
                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{seriesData.episodes.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                {/* Content */}
                <AnimatePresence mode="wait">
                    {/* SETUP PANEL */}
                    {activePanel === "setup" && (
                        <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold">Series Setup</h2>
                                    <button
                                        onClick={() => setShowImport(true)}
                                        className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-500/30 font-medium flex items-center gap-1.5"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Import from Story
                                    </button>
                                </div>


                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Series Title *</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Shadow Hunters: The Last Light"
                                            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Genre</label>
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                            {GENRES.map(g => (
                                                <button
                                                    key={g.id}
                                                    onClick={() => setGenre(g.id)}
                                                    className={cn(
                                                        "p-3 rounded-xl border transition-all flex flex-col items-center gap-1",
                                                        genre === g.id
                                                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                                                            : "bg-white/5 border-white/10 text-gray-400"
                                                    )}
                                                >
                                                    <g.icon className="w-5 h-5" />
                                                    <span className="text-xs">{g.name.split('/')[0]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">World Rules (Optional)</label>
                                        <textarea
                                            value={worldRules}
                                            onChange={(e) => setWorldRules(e.target.value)}
                                            placeholder="e.g., Magic exists but is forbidden. Society is divided into guilds..."
                                            className="w-full h-24 bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">AI Model</label>
                                        <select
                                            value={aiModel}
                                            onChange={(e) => setAiModel(e.target.value)}
                                            className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-white [&>option]:bg-gray-900"
                                        >
                                            {INTELLIGENCE_MODELS.map(m => (
                                                <option key={m.id} value={m.id}>{m.name} - {m.desc}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleSaveSetup}
                                        className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                    >
                                        Continue to Characters <ArrowRight className="w-4 h-4 inline ml-2" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CHARACTERS PANEL */}
                    {activePanel === "characters" && (
                        <motion.div key="characters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            {/* Character List */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {seriesData.characters.map(char => (
                                    <div key={char.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <span className={cn(
                                                    "text-xs font-bold uppercase px-2 py-0.5 rounded",
                                                    char.role === 'hero' ? "bg-green-500/20 text-green-400" :
                                                        char.role === 'villain' ? "bg-red-500/20 text-red-400" :
                                                            "bg-blue-500/20 text-blue-400"
                                                )}>{char.role}</span>
                                                <h3 className="text-lg font-bold mt-1">{char.name}</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingChar(char); setShowCharForm(true); }} className="text-gray-500 hover:text-white">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteCharacter(char.id)} className="text-gray-500 hover:text-red-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400">{char.gender}, {char.age}yo • {char.hair}</p>
                                        <p className="text-sm text-gray-500 mt-1">{char.personality}</p>
                                    </div>
                                ))}

                                {/* Add Character Button */}
                                <button
                                    onClick={() => { setEditingChar({ ...DEFAULT_CHARACTER }); setShowCharForm(true); }}
                                    className="bg-white/5 border border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all"
                                >
                                    <Plus className="w-8 h-8 text-purple-400" />
                                    <span className="text-gray-400">Add Character</span>
                                </button>
                            </div>

                            {/* Continue Button */}
                            {seriesData.characters.length > 0 && (
                                <button
                                    onClick={() => setActivePanel("episodes")}
                                    className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                >
                                    Continue to Episodes <ArrowRight className="w-4 h-4 inline ml-2" />
                                </button>
                            )}

                            {/* Character Form Modal */}
                            <AnimatePresence>
                                {showCharForm && editingChar && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                        onClick={() => setShowCharForm(false)}
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0.9 }}
                                            className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <h3 className="text-xl font-bold mb-4">{editingChar.id ? "Edit" : "Add"} Character</h3>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-1">Name *</label>
                                                        <input
                                                            type="text"
                                                            value={editingChar.name}
                                                            onChange={e => setEditingChar({ ...editingChar, name: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-1">Role</label>
                                                        <select
                                                            value={editingChar.role}
                                                            onChange={e => setEditingChar({ ...editingChar, role: e.target.value as any })}
                                                            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 [&>option]:bg-gray-800"
                                                        >
                                                            <option value="hero">Hero</option>
                                                            <option value="friend">Friend/Ally</option>
                                                            <option value="villain">Villain</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-1">Gender</label>
                                                        <select
                                                            value={editingChar.gender}
                                                            onChange={e => setEditingChar({ ...editingChar, gender: e.target.value })}
                                                            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 [&>option]:bg-gray-800"
                                                        >
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-1">Age</label>
                                                        <input
                                                            type="number"
                                                            value={editingChar.age}
                                                            onChange={e => setEditingChar({ ...editingChar, age: parseInt(e.target.value) || 17 })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Hair</label>
                                                    <input
                                                        type="text"
                                                        value={editingChar.hair}
                                                        onChange={e => setEditingChar({ ...editingChar, hair: e.target.value })}
                                                        placeholder="e.g., Black, spiky, shoulder-length"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Eyes</label>
                                                    <input
                                                        type="text"
                                                        value={editingChar.eyes}
                                                        onChange={e => setEditingChar({ ...editingChar, eyes: e.target.value })}
                                                        placeholder="e.g., Brown, determined expression"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Outfit</label>
                                                    <input
                                                        type="text"
                                                        value={editingChar.outfit}
                                                        onChange={e => setEditingChar({ ...editingChar, outfit: e.target.value })}
                                                        placeholder="e.g., Black cloak, leather armor"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Personality</label>
                                                    <textarea
                                                        value={editingChar.personality}
                                                        onChange={e => setEditingChar({ ...editingChar, personality: e.target.value })}
                                                        placeholder="e.g., Brave, loyal, protective of friends"
                                                        className="w-full h-16 bg-white/5 border border-white/10 rounded-lg px-3 py-2 resize-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm text-gray-400 mb-1">Powers/Abilities</label>
                                                    <input
                                                        type="text"
                                                        value={editingChar.powers}
                                                        onChange={e => setEditingChar({ ...editingChar, powers: e.target.value })}
                                                        placeholder="e.g., Fire manipulation, super speed"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                                                    />
                                                </div>

                                                <div className="flex gap-3 pt-2">
                                                    <button
                                                        onClick={() => setShowCharForm(false)}
                                                        className="flex-1 py-2 rounded-lg border border-white/10 text-gray-400"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSaveCharacter}
                                                        className="flex-1 py-2 rounded-lg bg-purple-500 text-white font-bold"
                                                    >
                                                        Save Character
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* EPISODES PANEL */}
                    {activePanel === "episodes" && (
                        <motion.div key="episodes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Episode Timeline */}
                                <div className="md:col-span-1 space-y-2">
                                    <h3 className="text-sm font-bold text-gray-400 mb-3">EPISODE TIMELINE</h3>

                                    {seriesData.episodes.map(ep => (
                                        <button
                                            key={ep.episodeNumber}
                                            onClick={() => setSelectedEpisode(ep)}
                                            className={cn(
                                                "w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3",
                                                selectedEpisode?.episodeNumber === ep.episodeNumber
                                                    ? "bg-purple-500/20 border-purple-500/50"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold">Episode {ep.episodeNumber}</div>
                                                <div className="text-xs text-gray-500 truncate">{ep.title}</div>
                                            </div>
                                        </button>
                                    ))}

                                    {/* Generate Next Episode */}
                                    <button
                                        onClick={handleGenerateEpisode}
                                        disabled={isGenerating || seriesData.characters.length === 0}
                                        className={cn(
                                            "w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3",
                                            isGenerating
                                                ? "bg-purple-500/10 border-purple-500/30 animate-pulse"
                                                : "bg-white/5 border-dashed border-white/20 hover:bg-white/10"
                                        )}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 text-purple-400 animate-spin flex-shrink-0" />
                                                <div>
                                                    <div className="text-sm font-bold text-purple-300">Generating...</div>
                                                    <div className="text-xs text-gray-500">Episode {seriesData.episodes.length + 1}</div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                                <div>
                                                    <div className="text-sm font-bold">Generate Episode {seriesData.episodes.length + 1}</div>
                                                    <div className="text-xs text-gray-500">Click to create</div>
                                                </div>
                                            </>
                                        )}
                                    </button>

                                    {seriesData.characters.length === 0 && (
                                        <p className="text-xs text-yellow-400 mt-2">⚠️ Add characters first</p>
                                    )}
                                </div>

                                {/* Episode Viewer */}
                                <div className="md:col-span-2">
                                    {selectedEpisode ? (
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <span className="text-xs font-bold text-purple-400">EPISODE {selectedEpisode.episodeNumber}</span>
                                                    <h2 className="text-xl font-bold">{selectedEpisode.title}</h2>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(selectedEpisode.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {selectedEpisode.summary && (
                                                <p className="text-gray-400 text-sm mb-6">{selectedEpisode.summary}</p>
                                            )}

                                            {/* Scenes */}
                                            <div className="space-y-4">
                                                {selectedEpisode.scenes?.map((scene: any, si: number) => (
                                                    <div key={si} className="bg-black/30 rounded-xl p-4">
                                                        <h4 className="text-sm font-bold text-gray-300 mb-3">
                                                            SCENE {scene.sceneNumber || si + 1}: {scene.sceneType || "Action"}
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {scene.clips?.map((clip: any, ci: number) => (
                                                                <div key={ci} className="bg-gray-900/50 rounded-lg p-3 border border-white/5">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-xs text-purple-400 font-bold">CLIP {clip.clipNumber || ci + 1}</span>
                                                                        <button
                                                                            onClick={() => copyToClipboard(
                                                                                `[SHOT]: ${clip.shotType || "Medium"}\n[CAMERA]: ${clip.camera || "Static"}\n[SUBJECT]: ${clip.character || "Character"}\n[ACTION]: ${clip.action || ""}\n[STYLE]: ${clip.style || "Anime"}\n(no subtitles)`,
                                                                                `clip-${si}-${ci}`
                                                                            )}
                                                                            className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/30"
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
                                        </div>
                                    ) : (
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                                            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold text-gray-400 mb-2">No Episode Selected</h3>
                                            <p className="text-sm text-gray-500">
                                                {seriesData.episodes.length > 0
                                                    ? "Click an episode from the timeline to view"
                                                    : "Generate your first episode to get started"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* IMPORT MODAL */}
                    {showImport && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowImport(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full"
                                onClick={e => e.stopPropagation()}
                            >
                                <h3 className="text-xl font-bold mb-2">Import from Story</h3>
                                <p className="text-sm text-gray-400 mb-4">Paste your full story text (series info + characters) below. We'll automatically parse it.</p>

                                <textarea
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    placeholder="Paste output from ChatGPT here..."
                                    className="w-full h-64 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono resize-none focus:border-purple-500/50 outline-none"
                                />

                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        onClick={() => setShowImport(false)}
                                        className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => parseImportedStory(importText)}
                                        disabled={!importText.trim()}
                                        className="px-6 py-2 rounded-lg bg-purple-500 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Import Everything
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
