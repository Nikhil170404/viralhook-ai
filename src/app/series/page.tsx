"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import {
    Copy, Check, Sparkles, Zap, ChevronDown, ChevronRight,
    Film, User, Play, Brain, Cpu, RefreshCw, Wand2, Edit3,
    Users, Trash2, Plus, ArrowRight, AlertCircle, FileText,
    Layers, Eye, Download, Settings2, Box
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";
import { parseStoryText, ParsedStory, ParsedCharacter, StoryAsset, regenerateVisualDNA } from "@/lib/prompts/story-parser";
import { ANIME_STYLES, MODES, AnimeStyle, Mode } from "@/lib/prompts/series-v2";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AI_MODELS = [
    { id: "xiaomi/mimo-v2-flash:free", name: "Fast (Instant)", icon: Zap },
    { id: "deepseek/deepseek-r1-0528:free", name: "Quality (Thinking)", icon: Brain },
    { id: "tngtech/deepseek-r1t-chimera:free", name: "Balanced", icon: Cpu }
];

const STORAGE_KEY = "viralhook_series_v2";

interface Scene {
    sceneNumber: number;
    sceneType: string;
    volume?: string;
    description: string;
    masterVisuals: string;
    charactersInvolved: string[];
    clipCount: number;
    seed: number;
    endState?: string;
    clips: Clip[];
}

interface Clip {
    clipNumber: number;
    status: 'pending' | 'generating' | 'completed';
    prompt?: string;
    negativePrompt?: string;
    seed?: number;
    continuityNote?: string;
    audioSuggestion?: string;
    narratorScript?: string;
}

interface Episode {
    episodeNumber: number;
    title: string;
    summary: string;
    scenes: Scene[];
    status: 'draft' | 'outlined' | 'generating' | 'completed';
    createdAt: string;
}

interface SeriesState {
    story: ParsedStory | null;
    episodes: Episode[];
    mode: Mode;
    style: AnimeStyle;
    totalEpisodes: number;
    assets: StoryAsset[];
}

export default function SeriesPageV2() {
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Main state
    const [seriesState, setSeriesState] = useState<SeriesState>({
        story: null,
        episodes: [],
        mode: 'anime',
        style: 'jjk',
        totalEpisodes: 12, // Default standard season length
        assets: []
    });

    // UI state
    const [step, setStep] = useState<'import' | 'characters' | 'generate'>('import');
    const [importText, setImportText] = useState("");
    const [parseErrors, setParseErrors] = useState<string[]>([]);
    const [parseWarnings, setParseWarnings] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
    const [aiModel, setAiModel] = useState("deepseek/deepseek-r1-0528:free");
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [editingChar, setEditingChar] = useState<ParsedCharacter | null>(null);
    const [editingAsset, setEditingAsset] = useState<StoryAsset | null>(null);

    // Auth check
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session: s } } = await supabase.auth.getSession();
            if (!s) { window.location.href = '/login'; return; }
            setSession(s);
            setIsLoading(false);

            // Load saved state
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const data = JSON.parse(saved) as SeriesState;
                    setSeriesState(data);
                    if (data.story) {
                        setStep(data.episodes.length > 0 ? 'generate' : 'characters');
                    }
                } catch { }
            }
        };
        checkAuth();
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (seriesState.story) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seriesState));
        }
    }, [seriesState]);

    // Parse imported text
    const handleParse = useCallback(() => {
        const result = parseStoryText(importText);

        if (!result.success) {
            setParseErrors(result.errors);
            setParseWarnings(result.warnings);
            return;
        }

        setSeriesState(prev => ({
            ...prev,
            story: result.data!,
            episodes: [],
            assets: result.data!.assets || []
        }));
        setParseErrors([]);
        setParseWarnings(result.warnings);
        setStep('characters');
    }, [importText]);

    // Update character
    const handleSaveCharacter = useCallback(() => {
        if (!editingChar || !seriesState.story) return;

        // Regenerate visual DNA
        const updated = {
            ...editingChar,
            visualDNA: regenerateVisualDNA(editingChar)
        };

        setSeriesState(prev => ({
            ...prev,
            story: {
                ...prev.story!,
                characters: prev.story!.characters.map(c =>
                    c.id === updated.id ? updated : c
                )
            }
        }));
        setEditingChar(null);
    }, [editingChar, seriesState.story]);

    // Add new character
    const handleAddCharacter = useCallback(() => {
        const newChar: ParsedCharacter = {
            id: `char_${Date.now()}`,
            name: 'New Character',
            role: 'friend',
            gender: 'unknown',
            age: 18,
            hair: '',
            eyes: '',
            outfit: '',
            personality: '',
            powers: '',
            visualDNA: ''
        };
        setEditingChar(newChar);
    }, []);

    // Delete character
    const handleDeleteCharacter = useCallback((id: string) => {
        if (!confirm('Delete this character?')) return;
        setSeriesState(prev => ({
            ...prev,
            story: prev.story ? {
                ...prev.story,
                characters: prev.story.characters.filter(c => c.id !== id)
            } : null
        }));
    }, []);

    // Asset Management
    const handleSaveAsset = useCallback(() => {
        if (!editingAsset) return;

        setSeriesState(prev => {
            const exists = prev.assets.find(a => a.id === editingAsset.id);
            const newAssets = exists
                ? prev.assets.map(a => a.id === editingAsset.id ? editingAsset : a)
                : [...prev.assets, editingAsset];

            return {
                ...prev,
                assets: newAssets,
                story: prev.story ? { ...prev.story, assets: newAssets } : prev.story
            };
        });
        setEditingAsset(null);
    }, [editingAsset]);

    const handleDeleteAsset = useCallback((id: string) => {
        if (!confirm('Delete this asset?')) return;
        setSeriesState(prev => {
            const newAssets = prev.assets.filter(a => a.id !== id);
            return {
                ...prev,
                assets: newAssets,
                story: prev.story ? { ...prev.story, assets: newAssets } : prev.story
            };
        });
    }, []);

    // Generate episode outline
    const handleGenerateOutline = useCallback(async (episodeNumber: number) => {
        if (!seriesState.story) return;

        setIsGenerating(true);
        setSelectedEpisode(episodeNumber);

        try {
            const response = await fetch('/api/series', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'outline',
                    story: seriesState.story,
                    episodeNumber,
                    mode: seriesState.mode,
                    style: seriesState.style,
                    aiModel
                })
            });

            if (!response.ok) throw new Error('Generation failed');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No response body');

            let result: any = null;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });
                const lines = text.split('\n').filter(l => l.trim().startsWith('data:'));
                for (const line of lines) {
                    try {
                        const json = JSON.parse(line.replace('data:', '').trim());
                        if (json.result) result = json.result;
                        if (json.error) throw new Error(json.error);
                    } catch { }
                }
            }

            if (result) {
                const newEpisode: Episode = {
                    episodeNumber,
                    title: result.episodeTitle || `Episode ${episodeNumber}`,
                    summary: result.summary || '',
                    scenes: (result.scenes || []).map((s: any) => ({
                        ...s,
                        masterVisuals: s.masterVisuals || s.description,
                        seed: s.seed || Math.floor(Math.random() * 9000000) + 1000000,
                        clips: Array(s.clipCount || 2).fill(0).map((_, i) => ({
                            clipNumber: i + 1,
                            status: 'pending' as const
                        }))
                    })),
                    status: 'outlined',
                    createdAt: new Date().toISOString()
                };

                setSeriesState(prev => {
                    // Process discovered assets
                    let updatedAssets = [...prev.assets];
                    if (result.discoveredAssets && Array.isArray(result.discoveredAssets)) {
                        for (const discovered of result.discoveredAssets) {
                            const exists = updatedAssets.find(a => a.name.toLowerCase() === discovered.name.toLowerCase());
                            if (!exists) {
                                updatedAssets.push({
                                    id: `asset_auto_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                                    name: discovered.name,
                                    description: discovered.description,
                                    visualDNA: discovered.description
                                });
                            }
                        }
                    }

                    return {
                        ...prev,
                        assets: updatedAssets,
                        story: prev.story ? { ...prev.story, assets: updatedAssets } : prev.story,
                        episodes: [
                            ...prev.episodes.filter(e => e.episodeNumber !== episodeNumber),
                            newEpisode
                        ].sort((a, b) => a.episodeNumber - b.episodeNumber)
                    };
                });
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    }, [seriesState, aiModel]);

    // Generate single clip
    const handleGenerateClip = useCallback(async (
        episodeNumber: number,
        sceneIndex: number,
        clipIndex: number
    ) => {
        if (!seriesState.story) return;

        const episode = seriesState.episodes.find(e => e.episodeNumber === episodeNumber);
        if (!episode) return;

        const scene = episode.scenes[sceneIndex];
        if (!scene) return;

        // Get previous clip's continuity note
        let previousClipEnd: string | undefined;
        if (clipIndex > 0 && scene.clips[clipIndex - 1]?.continuityNote) {
            previousClipEnd = scene.clips[clipIndex - 1].continuityNote;
        } else if (clipIndex === 0 && sceneIndex > 0) {
            const prevScene = episode.scenes[sceneIndex - 1];
            const lastClip = prevScene.clips[prevScene.clips.length - 1];
            if (lastClip?.continuityNote) previousClipEnd = lastClip.continuityNote;
        }

        // Update status
        setSeriesState(prev => updateClipStatus(prev, episodeNumber, sceneIndex, clipIndex, 'generating'));

        try {
            const response = await fetch('/api/series', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'clip',
                    story: seriesState.story,
                    episodeNumber,
                    mode: seriesState.mode,
                    style: seriesState.style,
                    assets: seriesState.assets,
                    aiModel,
                    scene: {
                        sceneNumber: scene.sceneNumber,
                        sceneType: scene.sceneType,
                        volume: scene.volume,
                        description: scene.description,
                        masterVisuals: scene.masterVisuals,
                        seed: scene.seed,
                        charactersInvolved: scene.charactersInvolved,
                        clipCount: scene.clips.length
                    },
                    clipNumber: clipIndex + 1,
                    previousClipEnd
                })
            });

            if (!response.ok) throw new Error('Generation failed');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No response body');

            let result: any = null;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });
                const lines = text.split('\n').filter(l => l.trim().startsWith('data:'));
                for (const line of lines) {
                    try {
                        const json = JSON.parse(line.replace('data:', '').trim());
                        if (json.result) result = json.result;
                        if (json.error) throw new Error(json.error);
                    } catch { }
                }
            }

            if (result?.prompt) {
                setSeriesState(prev => updateClipData(prev, episodeNumber, sceneIndex, clipIndex, {
                    status: 'completed',
                    prompt: result.prompt,
                    negativePrompt: result.negativePrompt,
                    seed: result.seed,
                    continuityNote: result.continuityNote || result.endState,
                    audioSuggestion: result.audioSuggestion || result.audioNote,
                    narratorScript: result.narratorScript
                }));
            } else {
                setSeriesState(prev => updateClipStatus(prev, episodeNumber, sceneIndex, clipIndex, 'pending'));
            }
        } catch (err: any) {
            setSeriesState(prev => updateClipStatus(prev, episodeNumber, sceneIndex, clipIndex, 'pending'));
            alert('Error: ' + err.message);
        }
    }, [seriesState, aiModel]);

    // Helper functions
    const updateClipStatus = (state: SeriesState, epNum: number, sceneIdx: number, clipIdx: number, status: Clip['status']): SeriesState => ({
        ...state,
        episodes: state.episodes.map(e => {
            if (e.episodeNumber !== epNum) return e;
            return {
                ...e,
                scenes: e.scenes.map((s, si) => {
                    if (si !== sceneIdx) return s;
                    return {
                        ...s,
                        clips: s.clips.map((c, ci) => ci === clipIdx ? { ...c, status } : c)
                    };
                })
            };
        })
    });

    const updateClipData = (state: SeriesState, epNum: number, sceneIdx: number, clipIdx: number, data: Partial<Clip>): SeriesState => ({
        ...state,
        episodes: state.episodes.map(e => {
            if (e.episodeNumber !== epNum) return e;
            return {
                ...e,
                scenes: e.scenes.map((s, si) => {
                    if (si !== sceneIdx) return s;
                    return {
                        ...s,
                        clips: s.clips.map((c, ci) => ci === clipIdx ? { ...c, ...data } : c)
                    };
                })
            };
        })
    });

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleReset = () => {
        if (!confirm('Delete everything and start over?')) return;
        localStorage.removeItem(STORAGE_KEY);
        setSeriesState({ story: null, episodes: [], mode: 'anime', style: 'jjk', totalEpisodes: 12, assets: [] });
        setStep('import');
        setImportText('');
        setSelectedEpisode(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    const currentEpisode = seriesState.episodes.find(e => e.episodeNumber === selectedEpisode);

    return (
        <div className="min-h-screen bg-black text-white font-sans pt-24 pb-32">
            <Navbar />

            {/* Background */}
            <div className="fixed inset-0 -z-10 opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black">
                            {seriesState.story?.title || 'Anime Series'} <span className="text-purple-400">Generator</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {seriesState.story
                                ? `${seriesState.story.characters.length} characters • ${seriesState.episodes.length} episodes`
                                : 'Paste your story from ChatGPT to begin'}
                        </p>
                    </div>
                    {seriesState.story && (
                        <button onClick={handleReset} className="text-sm text-gray-500 hover:text-red-400 flex items-center gap-1">
                            <Trash2 className="w-4 h-4" /> Reset
                        </button>
                    )}
                </div>

                {/* Step Tabs */}
                <div className="flex gap-1 bg-gray-900/50 rounded-xl p-1 mb-6">
                    {[
                        { id: 'import', label: 'Import Story', icon: FileText, enabled: true },
                        { id: 'characters', label: 'Characters', icon: Users, enabled: !!seriesState.story },
                        { id: 'generate', label: 'Generate', icon: Film, enabled: !!seriesState.story && seriesState.story.characters.length > 0 }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => tab.enabled && setStep(tab.id as any)}
                            disabled={!tab.enabled}
                            className={cn(
                                "flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                step === tab.id
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                    : tab.enabled
                                        ? "text-gray-500 hover:text-white"
                                        : "text-gray-700 cursor-not-allowed"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* STEP 1: IMPORT */}
                {step === 'import' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                Paste Your Story from ChatGPT
                            </h2>

                            <p className="text-gray-400 text-sm mb-4">
                                Use this format in ChatGPT: "Create an anime series with SERIES TITLE:, GENRE:, WORLD RULES:, HERO CHARACTER: (with Name:, Hair:, Eyes:, Outfit:, Powers:), FRIEND 1:, MAIN VILLAIN:, and EPISODE BRIEF:"
                            </p>

                            <textarea
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder={`SERIES TITLE: Eclipse of the Silent Sky
GENRE: Action / Fantasy / Sci-Fi
WORLD RULES: The world is governed by floating sky-continents...

HERO CHARACTER:
Name: Kaito Tsukishiro
Role: hero
Gender: male
Age: 18
Hair: Jet-black with subtle silver tips, medium length
Eyes: Deep violet, calm but intense
Outfit: Long black combat coat with glowing purple runes
Personality: Determined, introspective
Powers: Eclipse Synchronization, gravity control

FRIEND 1:
Name: Mina Aoyama
...`}
                                className="w-full h-80 bg-black/50 border border-white/10 rounded-xl p-4 text-sm font-mono text-gray-300 placeholder:text-gray-600 resize-none focus:border-purple-500/50 outline-none"
                            />

                            {parseErrors.length > 0 && (
                                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                                        <AlertCircle className="w-4 h-4" /> Errors
                                    </div>
                                    <ul className="text-sm text-red-300 list-disc list-inside">
                                        {parseErrors.map((e, i) => <li key={i}>{e}</li>)}
                                    </ul>
                                </div>
                            )}

                            {parseWarnings.length > 0 && (
                                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                                    <ul className="text-xs text-yellow-300">
                                        {parseWarnings.map((w, i) => <li key={i}>⚠️ {w}</li>)}
                                    </ul>
                                </div>
                            )}

                            <button
                                onClick={handleParse}
                                disabled={importText.length < 100}
                                className={cn(
                                    "mt-4 w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                                    importText.length >= 100
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                )}
                            >
                                <Wand2 className="w-5 h-5" />
                                Parse Story & Extract Characters
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: CHARACTERS */}
                {step === 'characters' && seriesState.story && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {/* Mode & Style Selection */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Mode:</span>
                                {MODES.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSeriesState(prev => ({ ...prev, mode: m.id as Mode }))}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                            seriesState.mode === m.id
                                                ? "bg-purple-500 text-white"
                                                : "bg-white/5 text-gray-400 hover:text-white"
                                        )}
                                    >
                                        {m.name}
                                    </button>
                                ))}
                            </div>

                            {seriesState.mode === 'anime' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Style:</span>
                                    <select
                                        value={seriesState.style}
                                        onChange={(e) => setSeriesState(prev => ({ ...prev, style: e.target.value as AnimeStyle }))}
                                        className="bg-gray-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white [&>option]:bg-gray-900"
                                    >
                                        {ANIME_STYLES.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Character Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {seriesState.story.characters.map(char => (
                                <div key={char.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                                                char.role === 'hero' ? "bg-green-500/20 text-green-400" :
                                                    char.role === 'villain' ? "bg-red-500/20 text-red-400" :
                                                        char.role === 'friend' ? "bg-blue-500/20 text-blue-400" :
                                                            "bg-gray-500/20 text-gray-400"
                                            )}>{char.role}</span>
                                            <h3 className="text-lg font-bold mt-1">{char.name}</h3>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setEditingChar({ ...char })}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCharacter(char.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">
                                        {char.gender}, {char.age}yo • {char.hair.slice(0, 30)}...
                                    </p>
                                    <div className="bg-black/30 rounded-lg p-2 text-[10px] font-mono text-purple-300 break-all">
                                        {char.visualDNA || 'No visual DNA generated'}
                                    </div>
                                </div>
                            ))}

                        </div>

                        {/* Assets Section */}
                        <div className="mt-8 mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Box className="w-5 h-5 text-pink-400" />
                                Key Objects & Assets
                            </h2>
                            <button
                                onClick={() => setEditingAsset({ id: `asset_${Date.now()}`, name: '', description: '', visualDNA: '' })}
                                className="text-xs text-purple-400 hover:text-white flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Asset
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {seriesState.assets.map(asset => (
                                <div key={asset.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-pink-500/30 transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-sm font-bold text-pink-300">{asset.name}</h3>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setEditingAsset({ ...asset })}
                                                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAsset(asset.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2 truncate">{asset.description}</p>
                                    <div className="bg-black/30 rounded-lg p-2 text-[10px] font-mono text-pink-200/70 break-all h-12 overflow-y-auto">
                                        {asset.visualDNA}
                                    </div>
                                </div>
                            ))}

                            {seriesState.assets.length === 0 && (
                                <div className="col-span-full py-8 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
                                    <p className="text-xs text-gray-500 italic">No key objects defined. They help maintain consistency for buildings, artifacts, or locations.</p>
                                </div>
                            )}
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={() => setStep('generate')}
                            disabled={seriesState.story.characters.length === 0}
                            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50"
                        >
                            Continue to Episode Generation <ArrowRight className="w-4 h-4 inline ml-2" />
                        </button>

                        {/* Character Edit Modal */}
                        <AnimatePresence>
                            {editingChar && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                    onClick={() => setEditingChar(null)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0.9 }}
                                        className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <h3 className="text-xl font-bold mb-4">Edit Character</h3>

                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                                                    <input
                                                        type="text"
                                                        value={editingChar.name}
                                                        onChange={e => setEditingChar({ ...editingChar, name: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Role</label>
                                                    <select
                                                        value={editingChar.role}
                                                        onChange={e => setEditingChar({ ...editingChar, role: e.target.value as any })}
                                                        className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm [&>option]:bg-gray-800"
                                                    >
                                                        <option value="hero">Hero</option>
                                                        <option value="friend">Friend</option>
                                                        <option value="villain">Villain</option>
                                                        <option value="mentor">Mentor</option>
                                                        <option value="rival">Rival</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Gender</label>
                                                    <input
                                                        type="text"
                                                        value={editingChar.gender}
                                                        onChange={e => setEditingChar({ ...editingChar, gender: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Age</label>
                                                    <input
                                                        type="number"
                                                        value={editingChar.age}
                                                        onChange={e => setEditingChar({ ...editingChar, age: parseInt(e.target.value) || 18 })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Hair</label>
                                                <input
                                                    type="text"
                                                    value={editingChar.hair}
                                                    onChange={e => setEditingChar({ ...editingChar, hair: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Eyes</label>
                                                <input
                                                    type="text"
                                                    value={editingChar.eyes}
                                                    onChange={e => setEditingChar({ ...editingChar, eyes: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Outfit</label>
                                                <input
                                                    type="text"
                                                    value={editingChar.outfit}
                                                    onChange={e => setEditingChar({ ...editingChar, outfit: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Powers</label>
                                                <input
                                                    type="text"
                                                    value={editingChar.powers}
                                                    onChange={e => setEditingChar({ ...editingChar, powers: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Personality</label>
                                                <textarea
                                                    value={editingChar.personality}
                                                    onChange={e => setEditingChar({ ...editingChar, personality: e.target.value })}
                                                    className="w-full h-16 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => setEditingChar(null)}
                                                className="flex-1 py-2 rounded-lg border border-white/10 text-gray-400"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveCharacter}
                                                className="flex-1 py-2 rounded-lg bg-purple-500 text-white font-bold"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {editingAsset && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                    onClick={() => setEditingAsset(null)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0.9 }}
                                        className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <h3 className="text-xl font-bold mb-4 text-pink-400">Edit Key Object / Asset</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Asset Name (e.g., Aether Node)</label>
                                                <input
                                                    type="text"
                                                    value={editingAsset.name}
                                                    onChange={e => setEditingAsset({ ...editingAsset, name: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-pink-500/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Visual DNA / Description</label>
                                                <textarea
                                                    value={editingAsset.description}
                                                    onChange={e => setEditingAsset({
                                                        ...editingAsset,
                                                        description: e.target.value,
                                                        visualDNA: e.target.value
                                                    })}
                                                    placeholder="Detailed visual description to maintain consistency across shots..."
                                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white resize-none outline-none focus:border-pink-500/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={() => setEditingAsset(null)}
                                                className="flex-1 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveAsset}
                                                className="flex-1 py-2 rounded-lg bg-pink-500 text-white font-bold hover:bg-pink-600"
                                            >
                                                Save Asset
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* STEP 3: GENERATE */}
                {step === 'generate' && seriesState.story && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Episode List */}
                            <div className="lg:col-span-1 space-y-2">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-gray-400">EPISODES</h3>

                                    <div className="flex gap-2">
                                        {/* Total Episodes Selector */}
                                        <select
                                            value={seriesState.totalEpisodes}
                                            onChange={e => setSeriesState(prev => ({ ...prev, totalEpisodes: parseInt(e.target.value) }))}
                                            className="bg-gray-900 border border-white/10 rounded-lg px-2 py-1 text-xs [&>option]:bg-gray-900 w-20"
                                            title="Total Episodes in Season"
                                        >
                                            <option value="12">12 Eps</option>
                                            <option value="24">24 Eps</option>
                                            <option value="13">13 Eps</option>
                                            <option value="26">26 Eps</option>
                                        </select>

                                        <select
                                            value={aiModel}
                                            onChange={e => setAiModel(e.target.value)}
                                            className="bg-gray-900 border border-white/10 rounded-lg px-2 py-1 text-xs [&>option]:bg-gray-900 w-24"
                                            title="AI Model"
                                        >
                                            {AI_MODELS.map(m => (
                                                <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Existing Episodes */}
                                {seriesState.episodes.map(ep => (
                                    <button
                                        key={ep.episodeNumber}
                                        onClick={() => setSelectedEpisode(ep.episodeNumber)}
                                        className={cn(
                                            "w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3",
                                            selectedEpisode === ep.episodeNumber
                                                ? "bg-purple-500/20 border-purple-500/50"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                            ep.status === 'completed' ? "bg-green-500/20 text-green-400" :
                                                ep.status === 'outlined' ? "bg-purple-500/20 text-purple-400" :
                                                    "bg-gray-500/20 text-gray-400"
                                        )}>
                                            {ep.episodeNumber}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-bold truncate">{ep.title}</div>
                                            <div className="text-xs text-gray-500">{ep.scenes.length} scenes</div>
                                        </div>
                                    </button>
                                ))}

                                {/* Generate New Episode Button */}
                                <button
                                    onClick={() => handleGenerateOutline(seriesState.episodes.length + 1)}
                                    disabled={isGenerating}
                                    className={cn(
                                        "w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3",
                                        isGenerating
                                            ? "bg-purple-500/10 border-purple-500/30 animate-pulse"
                                            : "bg-white/5 border-dashed border-white/20 hover:bg-white/10 hover:border-purple-500/30"
                                    )}
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                                            <div>
                                                <div className="text-sm font-bold text-purple-300">Generating...</div>
                                                <div className="text-xs text-gray-500">Episode {seriesState.episodes.length + 1}</div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <div className="text-sm font-bold">New Episode</div>
                                                <div className="text-xs text-gray-500">Episode {seriesState.episodes.length + 1}</div>
                                            </div>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Episode Detail / Clip Generation */}
                            <div className="lg:col-span-2">
                                {currentEpisode ? (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="text-xs font-bold text-purple-400">EPISODE {currentEpisode.episodeNumber}</span>
                                                <h2 className="text-xl font-bold">{currentEpisode.title}</h2>
                                            </div>
                                        </div>

                                        {currentEpisode.summary && (
                                            <p className="text-gray-400 text-sm mb-6">{currentEpisode.summary}</p>
                                        )}

                                        {/* Scenes */}
                                        <div className="space-y-4">
                                            {currentEpisode.scenes.map((scene, sceneIdx) => (
                                                <div key={sceneIdx} className="bg-black/30 rounded-xl p-4 border border-white/5">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-bold text-gray-300">
                                                            SCENE {scene.sceneNumber}: <span className="text-purple-400">{scene.sceneType.toUpperCase()}</span>
                                                            {scene.volume && <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-600/30 text-[10px] text-gray-400 tracking-widest">{scene.volume}</span>}
                                                        </h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-mono text-gray-500">Seed: {scene.seed}</span>
                                                            <span className="text-xs text-gray-500">{scene.clips.length} clips</span>
                                                        </div>
                                                    </div>

                                                    {scene.masterVisuals && (
                                                        <div className="mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                                            <span className="text-[10px] font-bold text-purple-400 block mb-1 uppercase tracking-wider">Method 1: Scene Master (Environment DNA)</span>
                                                            <p className="text-[11px] text-gray-300 leading-relaxed italic">"{scene.masterVisuals}"</p>
                                                        </div>
                                                    )}

                                                    <p className="text-xs text-gray-500 mb-3">{scene.description}</p>

                                                    {/* Clips */}
                                                    <div className="space-y-2">
                                                        {scene.clips.map((clip, clipIdx) => (
                                                            <div key={clipIdx} className="bg-gray-900/50 rounded-lg p-3 border border-white/5">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-xs font-bold text-purple-400">CLIP {clip.clipNumber}</span>

                                                                    <div className="flex gap-2">
                                                                        {clip.status === 'completed' && clip.narratorScript && (
                                                                            <button
                                                                                onClick={() => copyToClipboard(clip.narratorScript!, `script-${sceneIdx}-${clipIdx}`)}
                                                                                className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs hover:bg-blue-500/30 flex items-center gap-1"
                                                                            >
                                                                                {copiedField === `script-${sceneIdx}-${clipIdx}` ? <Check className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                                                                Copy Script
                                                                            </button>
                                                                        )}
                                                                        {clip.status === 'completed' && clip.prompt && (
                                                                            <button
                                                                                onClick={() => copyToClipboard(clip.prompt!, `clip-${sceneIdx}-${clipIdx}`)}
                                                                                className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/30 flex items-center gap-1"
                                                                            >
                                                                                {copiedField === `clip-${sceneIdx}-${clipIdx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                                                Copy for Veo
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {clip.status === 'completed' ? (
                                                                    <div className="space-y-2">
                                                                        {clip.narratorScript && (
                                                                            <div className="text-xs text-blue-300 bg-blue-900/20 rounded p-2 border border-blue-500/30">
                                                                                <span className="font-bold opacity-70 block mb-1">NARRATOR:</span>
                                                                                "{clip.narratorScript}"
                                                                            </div>
                                                                        )}
                                                                        <div className="text-xs text-gray-400 font-mono bg-black/40 rounded p-2 max-h-32 overflow-y-auto">
                                                                            <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
                                                                                <span className="text-[10px] text-purple-400">VEOPROMPT V2</span>
                                                                                <span className="text-[10px] text-gray-600">Seed: {clip.seed}</span>
                                                                            </div>
                                                                            {clip.prompt}
                                                                        </div>
                                                                        {clip.negativePrompt && (
                                                                            <div className="p-2 bg-red-500/5 border border-red-500/10 rounded">
                                                                                <span className="text-[10px] font-bold text-red-400 block mb-1 uppercase tracking-wider">Method 2: Negative Shield</span>
                                                                                <p className="text-[10px] text-gray-500 font-mono">{clip.negativePrompt}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : clip.status === 'generating' ? (
                                                                    <div className="flex items-center gap-2 py-4 justify-center text-purple-400">
                                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                                        <span className="text-sm">Generating...</span>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleGenerateClip(currentEpisode.episodeNumber, sceneIdx, clipIdx)}
                                                                        className="w-full py-2 rounded-lg border border-dashed border-white/20 hover:bg-white/5 text-sm text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
                                                                    >
                                                                        <Sparkles className="w-3 h-3" />
                                                                        Generate Clip {clip.clipNumber}
                                                                    </button>
                                                                )}

                                                                {clip.continuityNote && (
                                                                    <div className="mt-2 text-[10px] text-gray-600">
                                                                        → Ends with: {clip.continuityNote}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                                        <Film className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-400 mb-2">No Episode Selected</h3>
                                        <p className="text-sm text-gray-500">
                                            Select an episode or generate a new one
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
