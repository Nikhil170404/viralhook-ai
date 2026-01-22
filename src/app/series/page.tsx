"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Trash2, Copy, Check, Sparkles, Zap, ChevronDown, ChevronRight,
    Film, User, BookOpen, Play, Brain, Cpu, Target, RefreshCw, Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";
import { fetchWithCSRF } from "@/lib/api-client";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Intelligence Models (same as main generator)
const AI_MODELS = [
    { id: "deepseek/deepseek-r1-0528:free", name: "Deepseek R1 (Thinking)", icon: Sparkles, desc: "Full reasoning visible" },
    { id: "deepseek/deepseek-r1-0528:free-fast", name: "Deepseek R1 (No Thinking)", icon: Zap, desc: "Faster results" },
    { id: "tngtech/deepseek-r1t2-chimera:free", name: "R1T2 Chimera (Thinking)", icon: Brain, desc: "Hybrid reasoning" },
    { id: "tngtech/deepseek-r1t2-chimera:free-fast", name: "R1T2 Chimera (No Thinking)", icon: Cpu, desc: "Hybrid fast" },
];

const TARGET_PLATFORMS = [
    { id: "veo", name: "Google Veo", color: "from-green-500 to-teal-500" },
    { id: "kling", name: "Kling AI", color: "from-blue-500 to-cyan-500" },
    { id: "runway", name: "Runway", color: "from-purple-500 to-pink-500" },
    { id: "luma", name: "Luma", color: "from-orange-500 to-red-500" },
];

const TABS = ["Series Bible", "Characters", "Generate Episode"];

// Default empty states
const DEFAULT_CHARACTER = {
    id: "",
    name: "",
    visualSpec: {
        age: 17,
        height: "170cm, athletic build",
        build: "athletic",
        hair: "",
        eyes: "",
        face: "",
        outfit: "",
        accessories: ""
    },
    voiceSpec: {
        tone: "",
        speechPattern: "",
        verbalTics: []
    },
    personality: "",
    backstory: ""
};

const DEFAULT_SERIES: {
    title: string;
    genre: string;
    themes: string[];
    worldRules: string;
    toneGuide: string;
    totalEpisodes: number;
    arcStructure: string;
} = {
    title: "",
    genre: "Action/Adventure",
    themes: [],
    worldRules: "",
    toneGuide: "",
    totalEpisodes: 24,
    arcStructure: ""
};

export default function SeriesPage() {
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    // Project Management
    const [projects, setProjects] = useState<{ id: string; name: string; updatedAt: number }[]>([]);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [showProjectMenu, setShowProjectMenu] = useState(false);

    // Series Bible State
    const [seriesBible, setSeriesBible] = useState(DEFAULT_SERIES);
    const [themeInput, setThemeInput] = useState("");

    // Characters State
    const [characters, setCharacters] = useState<typeof DEFAULT_CHARACTER[]>([]);
    const [editingChar, setEditingChar] = useState<number | null>(null);

    // Episode Generator State
    const [episodeNumber, setEpisodeNumber] = useState(1);
    const [arcPosition, setArcPosition] = useState("Introduction");
    const [requiredBeats, setRequiredBeats] = useState("");
    const [previousSummary, setPreviousSummary] = useState("");
    const [nextHook, setNextHook] = useState("");
    const [selectedChars, setSelectedChars] = useState<string[]>([]);
    const [targetPlatform, setTargetPlatform] = useState("veo");
    const [aiModel, setAiModel] = useState("deepseek/deepseek-r1-0528:free");

    // Results
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // LocalStorage Keys
    const STORAGE_KEY = "viralhook_series_projects";
    const PROJECT_PREFIX = "viralhook_series_";

    // Load projects list on mount
    useEffect(() => {
        const savedProjects = localStorage.getItem(STORAGE_KEY);
        if (savedProjects) {
            const parsed = JSON.parse(savedProjects);
            setProjects(parsed);
            // Auto-load most recent project
            if (parsed.length > 0) {
                const mostRecent = parsed.sort((a: any, b: any) => b.updatedAt - a.updatedAt)[0];
                loadProject(mostRecent.id);
            }
        }
    }, []);

    // Auto-save current project on changes
    useEffect(() => {
        if (currentProjectId && seriesBible.title) {
            const timeoutId = setTimeout(() => {
                saveCurrentProject();
            }, 1000); // Debounce 1 second
            return () => clearTimeout(timeoutId);
        }
    }, [seriesBible, characters, episodeNumber, currentProjectId]);

    // Save current project to localStorage
    const saveCurrentProject = () => {
        if (!currentProjectId) return;

        const projectData = {
            seriesBible,
            characters,
            episodeNumber,
            arcPosition,
            previousSummary,
            targetPlatform
        };
        localStorage.setItem(PROJECT_PREFIX + currentProjectId, JSON.stringify(projectData));

        // Update project list with new timestamp
        const updatedProjects = projects.map(p =>
            p.id === currentProjectId
                ? { ...p, name: seriesBible.title || "Untitled", updatedAt: Date.now() }
                : p
        );
        setProjects(updatedProjects);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    };

    // Load a project
    const loadProject = (projectId: string) => {
        const saved = localStorage.getItem(PROJECT_PREFIX + projectId);
        if (saved) {
            const data = JSON.parse(saved);
            setSeriesBible(data.seriesBible || DEFAULT_SERIES);
            setCharacters(data.characters || []);
            setEpisodeNumber(data.episodeNumber || 1);
            setArcPosition(data.arcPosition || "Introduction");
            setPreviousSummary(data.previousSummary || "");
            setTargetPlatform(data.targetPlatform || "veo");
            setCurrentProjectId(projectId);
            setSelectedChars([]);
            setResult(null);
        }
        setShowProjectMenu(false);
    };

    // Create new project
    const createNewProject = () => {
        const newId = `project_${Date.now()}`;
        const newProject = { id: newId, name: "New Series", updatedAt: Date.now() };
        const updated = [newProject, ...projects];
        setProjects(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Reset state
        setSeriesBible({ ...DEFAULT_SERIES });
        setCharacters([]);
        setEpisodeNumber(1);
        setArcPosition("Introduction");
        setPreviousSummary("");
        setSelectedChars([]);
        setResult(null);
        setCurrentProjectId(newId);
        setActiveTab(0);
        setShowProjectMenu(false);
    };

    // Delete a project
    const deleteProject = (projectId: string) => {
        localStorage.removeItem(PROJECT_PREFIX + projectId);
        const updated = projects.filter(p => p.id !== projectId);
        setProjects(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        if (currentProjectId === projectId) {
            if (updated.length > 0) {
                loadProject(updated[0].id);
            } else {
                createNewProject();
            }
        }
    };

    // Auth
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session: s } } = await supabase.auth.getSession();
            if (!s) { window.location.href = '/login'; return; }
            setSession(s);
            setIsLoading(false);

            // If no projects exist, create one
            const savedProjects = localStorage.getItem(STORAGE_KEY);
            if (!savedProjects || JSON.parse(savedProjects).length === 0) {
                createNewProject();
            }
        };
        checkAuth();
    }, []);

    // Add character
    const addCharacter = () => {
        const newChar = { ...DEFAULT_CHARACTER, id: `char_${Date.now()}` };
        setCharacters([...characters, newChar]);
        setEditingChar(characters.length);
    };

    // Update character
    const updateCharacter = (index: number, field: string, value: any) => {
        const updated = [...characters];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            (updated[index] as any)[parent][child] = value;
        } else {
            (updated[index] as any)[field] = value;
        }
        setCharacters(updated);
    };

    // Add theme
    const addTheme = () => {
        if (themeInput.trim()) {
            setSeriesBible({ ...seriesBible, themes: [...seriesBible.themes, themeInput.trim()] });
            setThemeInput("");
        }
    };

    // Generate Episode
    const handleGenerate = async () => {
        if (!seriesBible.title) { setError("Please fill in the Series Bible first"); return; }
        if (characters.length === 0) { setError("Please add at least one character"); return; }

        setError("");
        setIsGenerating(true);
        setResult(null);

        try {
            const response = await fetchWithCSRF('/api/series', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seriesBible,
                    characters: characters.filter(c => selectedChars.includes(c.id)),
                    episodeConfig: {
                        episodeNumber,
                        arcPosition,
                        requiredBeats: requiredBeats.split(',').map(s => s.trim()).filter(Boolean),
                        charactersAppearing: selectedChars,
                        previousSummary,
                        nextEpisodeHook: nextHook
                    },
                    targetPlatform,
                    aiModel
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Generation failed');
            setResult(data);
        } catch (err: any) {
            setError(err.message);
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

            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-black mb-3">
                        Anime <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Series</span> Generator
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Create structured prompts for 24-episode serialized anime with character consistency
                    </p>
                </motion.div>

                {/* Project Switcher */}
                <div className="flex items-center justify-between mb-4 bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="relative flex-1">
                        <button
                            onClick={() => setShowProjectMenu(!showProjectMenu)}
                            className="flex items-center gap-2 text-left w-full"
                        >
                            <Film className="w-5 h-5 text-purple-400" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate">
                                    {seriesBible.title || "New Series"}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {characters.length} characters • Episode {episodeNumber}
                                </div>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", showProjectMenu && "rotate-180")} />
                        </button>

                        {/* Dropdown */}
                        <AnimatePresence>
                            {showProjectMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="max-h-64 overflow-y-auto">
                                        {projects.map(p => (
                                            <div
                                                key={p.id}
                                                className={cn(
                                                    "flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-all cursor-pointer",
                                                    currentProjectId === p.id && "bg-purple-500/20"
                                                )}
                                            >
                                                <button
                                                    onClick={() => loadProject(p.id)}
                                                    className="flex-1 text-left"
                                                >
                                                    <div className="text-sm font-medium text-white">{p.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(p.updatedAt).toLocaleDateString()}
                                                    </div>
                                                </button>
                                                {projects.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm(`Delete "${p.name}"?`)) deleteProject(p.id);
                                                        }}
                                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-white/10">
                                        <button
                                            onClick={createNewProject}
                                            className="w-full px-4 py-3 text-left text-sm font-medium text-purple-400 hover:bg-purple-500/10 flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> New Series Project
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-gray-500 hidden sm:block">Auto-saved</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-900/50 rounded-xl p-1 mb-6">
                    {TABS.map((tab, i) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(i)}
                            className={cn(
                                "flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                activeTab === i
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                    : "text-gray-500 hover:text-white"
                            )}
                        >
                            {i === 0 && <BookOpen className="w-4 h-4" />}
                            {i === 1 && <User className="w-4 h-4" />}
                            {i === 2 && <Play className="w-4 h-4" />}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {/* Series Bible Tab */}
                    {activeTab === 0 && (
                        <motion.div
                            key="bible"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Series Title *</label>
                                    <input
                                        type="text"
                                        value={seriesBible.title}
                                        onChange={(e) => setSeriesBible({ ...seriesBible, title: e.target.value })}
                                        placeholder="e.g., Shadow Hunters: The Last Light"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
                                    <select
                                        value={seriesBible.genre}
                                        onChange={(e) => setSeriesBible({ ...seriesBible, genre: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="Action/Adventure">Action/Adventure</option>
                                        <option value="Fantasy">Fantasy</option>
                                        <option value="Sci-Fi">Sci-Fi</option>
                                        <option value="Romance">Romance</option>
                                        <option value="Horror">Horror</option>
                                        <option value="Comedy">Comedy</option>
                                        <option value="Slice of Life">Slice of Life</option>
                                        <option value="Mecha">Mecha</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Themes</label>
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {seriesBible.themes.map((t, i) => (
                                        <span key={i} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300 flex items-center gap-1">
                                            {t}
                                            <button onClick={() => setSeriesBible({ ...seriesBible, themes: seriesBible.themes.filter((_, j) => j !== i) })}>
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={themeInput}
                                        onChange={(e) => setThemeInput(e.target.value)}
                                        placeholder="Add theme (e.g., redemption, friendship)"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && addTheme()}
                                    />
                                    <button onClick={addTheme} className="px-4 py-2 bg-purple-500/30 rounded-xl text-purple-300 text-sm font-bold">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">World Rules</label>
                                <textarea
                                    value={seriesBible.worldRules}
                                    onChange={(e) => setSeriesBible({ ...seriesBible, worldRules: e.target.value })}
                                    placeholder="Describe the rules of your world (magic system, technology level, society structure...)"
                                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Tone Guide</label>
                                <textarea
                                    value={seriesBible.toneGuide}
                                    onChange={(e) => setSeriesBible({ ...seriesBible, toneGuide: e.target.value })}
                                    placeholder="e.g., Dark and gritty with moments of levity, Demon Slayer-inspired emotional intensity"
                                    className="w-full h-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="text-sm text-gray-500">
                                    {seriesBible.title ? "✓ Series bible configured" : "Fill in at least the title to continue"}
                                </div>
                                <button
                                    onClick={() => setActiveTab(1)}
                                    disabled={!seriesBible.title}
                                    className={cn(
                                        "px-6 py-3 rounded-xl font-bold flex items-center gap-2",
                                        seriesBible.title
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    )}
                                >
                                    Next: Characters <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Characters Tab */}
                    {activeTab === 1 && (
                        <motion.div
                            key="chars"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Characters ({characters.length})</h3>
                                <button
                                    onClick={addCharacter}
                                    className="px-4 py-2 bg-purple-500/30 rounded-xl text-purple-300 text-sm font-bold flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add Character
                                </button>
                            </div>

                            {characters.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No characters yet. Add your first character to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {characters.map((char, i) => (
                                        <div key={char.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <input
                                                    type="text"
                                                    value={char.name}
                                                    onChange={(e) => updateCharacter(i, 'name', e.target.value)}
                                                    placeholder="Character Name"
                                                    className="bg-transparent text-lg font-bold text-white border-b border-transparent focus:border-purple-500 outline-none"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingChar(editingChar === i ? null : i)}
                                                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
                                                    >
                                                        {editingChar === i ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setCharacters(characters.filter((_, j) => j !== i))}
                                                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {editingChar === i && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="space-y-4 pt-4 border-t border-white/10"
                                                >
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Age</label>
                                                            <input
                                                                type="number"
                                                                value={char.visualSpec.age}
                                                                onChange={(e) => updateCharacter(i, 'visualSpec.age', parseInt(e.target.value))}
                                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Height & Build</label>
                                                            <input
                                                                type="text"
                                                                value={char.visualSpec.height}
                                                                onChange={(e) => updateCharacter(i, 'visualSpec.height', e.target.value)}
                                                                placeholder="e.g., 175cm, athletic build"
                                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Hair</label>
                                                            <input
                                                                type="text"
                                                                value={char.visualSpec.hair}
                                                                onChange={(e) => updateCharacter(i, 'visualSpec.hair', e.target.value)}
                                                                placeholder="e.g., Spiky black hair with red tips"
                                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Eyes</label>
                                                            <input
                                                                type="text"
                                                                value={char.visualSpec.eyes}
                                                                onChange={(e) => updateCharacter(i, 'visualSpec.eyes', e.target.value)}
                                                                placeholder="e.g., Sharp amber eyes, determined expression"
                                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Outfit</label>
                                                        <input
                                                            type="text"
                                                            value={char.visualSpec.outfit}
                                                            onChange={(e) => updateCharacter(i, 'visualSpec.outfit', e.target.value)}
                                                            placeholder="e.g., Black leather jacket with silver zippers, red t-shirt"
                                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Personality</label>
                                                        <textarea
                                                            value={char.personality}
                                                            onChange={(e) => updateCharacter(i, 'personality', e.target.value)}
                                                            placeholder="e.g., Confident but secretly insecure, fiercely loyal to friends"
                                                            className="w-full h-16 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4">
                                <button onClick={() => setActiveTab(0)} className="text-gray-400 hover:text-white flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4 rotate-180" /> Back to Series Bible
                                </button>
                                <button
                                    onClick={() => setActiveTab(2)}
                                    disabled={characters.length === 0}
                                    className={cn(
                                        "px-6 py-3 rounded-xl font-bold flex items-center gap-2",
                                        characters.length > 0
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    )}
                                >
                                    Next: Generate <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Generate Episode Tab */}
                    {activeTab === 2 && (
                        <motion.div
                            key="generate"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* Episode Config */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Episode Number</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={24}
                                        value={episodeNumber}
                                        onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Arc Position</label>
                                    <select
                                        value={arcPosition}
                                        onChange={(e) => setArcPosition(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="Introduction">Introduction</option>
                                        <option value="Rising Action">Rising Action</option>
                                        <option value="Midpoint Twist">Midpoint Twist</option>
                                        <option value="Climax">Climax</option>
                                        <option value="Resolution">Resolution</option>
                                    </select>
                                </div>
                            </div>

                            {/* Characters Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Characters in this Episode</label>
                                <div className="flex flex-wrap gap-2">
                                    {characters.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setSelectedChars(
                                                selectedChars.includes(c.id)
                                                    ? selectedChars.filter(id => id !== c.id)
                                                    : [...selectedChars, c.id]
                                            )}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                                                selectedChars.includes(c.id)
                                                    ? "bg-purple-500/30 border-purple-500/50 text-purple-300"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                            )}
                                        >
                                            {c.name || "Unnamed"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Target Platform */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Target Video Platform</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {TARGET_PLATFORMS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setTargetPlatform(p.id)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
                                                targetPlatform === p.id
                                                    ? `bg-gradient-to-r ${p.color} text-white border-transparent`
                                                    : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Required Beats */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Required Story Beats (comma-separated)</label>
                                <input
                                    type="text"
                                    value={requiredBeats}
                                    onChange={(e) => setRequiredBeats(e.target.value)}
                                    placeholder="e.g., Character reveals secret, First battle, Cliffhanger ending"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
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
                                onClick={handleGenerate}
                                disabled={isGenerating || selectedChars.length === 0}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3",
                                    isGenerating
                                        ? "bg-gray-700 text-gray-400 cursor-wait"
                                        : selectedChars.length === 0
                                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/20"
                                )}
                            >
                                {isGenerating ? (
                                    <><RefreshCw className="w-5 h-5 animate-spin" /> Generating Episode {episodeNumber}...</>
                                ) : (
                                    <><Film className="w-5 h-5" /> Generate Episode {episodeNumber} Prompts</>
                                )}
                            </button>

                            {/* Results */}
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4 mt-8"
                                >
                                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-purple-400">EPISODE {episodeNumber}</span>
                                        </div>
                                        <p className="text-xl font-bold text-white">{result.episodeTitle}</p>
                                        <p className="text-gray-400 text-sm mt-2">{result.episodeSummary}</p>
                                    </div>

                                    {/* Reasoning */}
                                    {result.reasoning && (
                                        <div className="bg-gray-800/20 rounded-2xl border border-white/5 overflow-hidden">
                                            <button
                                                onClick={() => {
                                                    const el = document.getElementById('series-think');
                                                    if (el) el.classList.toggle('hidden');
                                                }}
                                                className="w-full px-4 py-3 flex items-center justify-between text-gray-400 hover:text-white"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Brain className="w-4 h-4 text-purple-400" />
                                                    <span className="text-xs font-bold uppercase">AI Reasoning</span>
                                                </div>
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            <div id="series-think" className="hidden px-4 pb-4">
                                                <div className="text-xs text-gray-400 font-mono max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                                                    {result.reasoning}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scenes */}
                                    {result.scenes?.map((scene: any, si: number) => (
                                        <div key={si} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                            <h4 className="text-sm font-bold text-gray-400 mb-4">
                                                SCENE {scene.sceneNumber}: {scene.sceneType}
                                            </h4>
                                            <div className="space-y-4">
                                                {scene.clips?.map((clip: any, ci: number) => (
                                                    <div key={ci} className="bg-black/30 rounded-xl p-4 border border-white/5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-purple-400 font-bold">CLIP {clip.clipNumber} ({clip.duration})</span>
                                                            <button
                                                                onClick={() => copyToClipboard(
                                                                    `[SHOT TYPE]: ${clip.shotType}\n[CAMERA]: ${clip.camera}\n[SUBJECT]: ${clip.character}\n[ACTION]: ${clip.action}\n[CONTEXT]: ${clip.context}\n[STYLE]: ${clip.style}\n[AMBIANCE]: ${clip.ambiance}\n[AUDIO]: ${clip.audio}\n(no subtitles)`,
                                                                    `clip-${si}-${ci}`
                                                                )}
                                                                className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold"
                                                            >
                                                                {copiedField === `clip-${si}-${ci}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                        <div className="text-sm space-y-1 text-gray-300">
                                                            <p><span className="text-gray-500">Shot:</span> {clip.shotType}</p>
                                                            <p><span className="text-gray-500">Camera:</span> {clip.camera}</p>
                                                            <p><span className="text-gray-500">Action:</span> {clip.action}</p>
                                                            <p><span className="text-gray-500">Style:</span> {clip.style}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Cliffhanger */}
                                    {result.cliffhanger && (
                                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
                                            <span className="text-xs font-bold text-orange-400">CLIFFHANGER FOR NEXT EPISODE</span>
                                            <p className="text-gray-300 text-sm mt-1">{result.cliffhanger}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
