"use client";

import { useState, useEffect } from "react";
import { PromptTemplate } from "@/lib/prompts";
import { Copy, Check, Search, TrendingUp, Clock, Globe, ChevronDown, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { Navbar } from "@/components/ui/navbar";

// Init Supabase with SSR client for proper cookie handling
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LibraryPage() {
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [shareCopiedId, setShareCopiedId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [dbPrompts, setDbPrompts] = useState<PromptTemplate[]>([]);
    const [sortBy, setSortBy] = useState<'newest' | 'popular'>('popular');
    const [selectedMode, setSelectedMode] = useState<string>('all');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 30;

    // Protect Route
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                window.location.href = '/login';
            }
        });
    }, []);

    const fetchPrompts = async (pageNum: number, isInitial: boolean = false) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        if (isInitial) setIsLoading(true);
        else setIsLoadingMore(true);

        const primarySort = sortBy === 'popular' ? 'copy_count' : 'created_at';
        const secondarySort = sortBy === 'popular' ? 'created_at' : 'copy_count';

        let query = supabase
            .from('generated_prompts')
            .select('*');

        if (selectedMode !== 'all') {
            query = query.eq('mode', selectedMode);
        }

        const { data, error } = await query
            .order(primarySort, { ascending: false })
            .order(secondarySort, { ascending: false })
            .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

        if (error) {
            console.error("Fetch Error:", error);
            setIsLoading(false);
            setIsLoadingMore(false);
            return;
        }

        if (data) {
            const mapped: PromptTemplate[] = data.map((p) => ({
                id: p.id,
                category: p.category || "Community",
                platform: p.platform || "Unknown",
                template: p.prompt_text,
                viralHook: p.viral_hook,
                mechanism: p.mechanism,
                copyCount: p.copy_count || 0,
                isCommunity: true
            }));

            setDbPrompts(prev => isInitial ? mapped : [...prev, ...mapped]);
            setHasMore(data.length === PAGE_SIZE);
        }

        setIsLoading(false);
        setIsLoadingMore(false);
    };

    // Initial Fetch & Fetch on Sort Change
    useEffect(() => {
        setPage(0);
        setDbPrompts([]);
        setHasMore(true);
        fetchPrompts(0, true);
    }, [sortBy, selectedMode]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPrompts(nextPage);
    };

    // Combine Data
    let allPrompts = [...dbPrompts];

    // Search Logic (Local for current loaded set)
    let filtered = allPrompts.filter(prompt =>
        prompt.template.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.viralHook?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopy = async (text: string, id: number | string, isCommunity: boolean) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id as any);
        setTimeout(() => setCopiedId(null), 2000);

        // Increment Analytics
        if (isCommunity) {
            try {
                await supabase.rpc('increment_copy_count', { row_id: id });
                // Optimistic update
                setDbPrompts(prev => prev.map(p =>
                    p.id === id ? { ...p, copyCount: (p.copyCount || 0) + 1 } : p
                ));
            } catch (e) {
                console.error("Copy analytics failed", e);
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500 selection:text-white pt-32 px-6">
            <Navbar />
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-900 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-pink-900 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
                    <div className="flex flex-col gap-1 w-full md:w-auto">
                        <h1 className="text-4xl font-black tracking-tighter">THE <span className="text-pink-500">LIBRARY</span></h1>
                        <p className="text-gray-500 text-sm font-medium">Curated community hooks and viral prompts.</p>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-auto items-center md:items-end">

                        <div className="flex flex-wrap gap-3 justify-center md:justify-end w-full">
                            {/* Sort */}
                            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                                <button onClick={() => setSortBy('newest')} className={`px-2 py-1.5 rounded-lg transition-all ${sortBy === 'newest' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`} title="Newest"><Clock className="w-4 h-4" /></button>
                                <button onClick={() => setSortBy('popular')} className={`px-2 py-1.5 rounded-lg transition-all ${sortBy === 'popular' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`} title="Most Popular"><TrendingUp className="w-4 h-4" /></button>
                            </div>

                            {/* Mode Filter */}
                            {/* Custom Mode Filter Dropdown */}
                            <div className="relative z-50">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                                    className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-xs rounded-xl px-4 py-2 hover:bg-white/10 transition-all min-w-[140px] justify-between"
                                >
                                    <span className="flex items-center gap-2">
                                        {selectedMode === 'all' && "All Modes"}
                                        {selectedMode === 'chaos' && <>🌀 Chaos</>}
                                        {selectedMode === 'cinematic' && <>🎬 Cinematic</>}
                                        {selectedMode === 'shocking' && <>💀 Shocking</>}
                                    </span>
                                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={dropdownOpen ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={`absolute top-full mt-2 right-0 w-full min-w-[160px] bg-black border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl ${dropdownOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                                >
                                    {[
                                        { id: 'all', label: 'All Modes', icon: null },
                                        { id: 'chaos', label: 'Chaos', icon: '🌀' },
                                        { id: 'cinematic', label: 'Cinematic', icon: '🎬' },
                                        { id: 'shocking', label: 'Shocking', icon: '💀' }
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => {
                                                setSelectedMode(mode.id);
                                                setDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-white/10 transition-all flex items-center gap-2
                                                ${selectedMode === mode.id ? 'text-pink-400 bg-white/5' : 'text-gray-400'}
                                            `}
                                        >
                                            <span className="w-4">{mode.icon}</span>
                                            {mode.label}
                                        </button>
                                    ))}
                                </motion.div>
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-48 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-500 group-focus-within:text-pink-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-xl leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-pink-500/50 focus:border-pink-500/50 sm:text-xs transition-all h-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
                    {filtered.map((prompt, index) => (
                        <motion.div
                            key={prompt.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-white/5 backdrop-blur-md border rounded-2xl p-5 md:p-6 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group
                                ${prompt.isCommunity ? 'border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/10'}
                            `}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${prompt.isCommunity ? 'text-pink-300 border-pink-500/30 bg-pink-900/20' : 'text-purple-300 border-purple-500/30 bg-purple-900/20'}`}>
                                        {prompt.category}
                                    </span>
                                    {prompt.copyCount !== undefined && prompt.copyCount > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <TrendingUp className="w-3 h-3 text-green-400" /> {prompt.copyCount}
                                        </div>
                                    )}
                                </div>

                                {/* Viral Hook Highlight */}
                                {prompt.viralHook && (
                                    <div className="mb-3">
                                        <p className="text-white text-sm font-bold leading-tight">
                                            {prompt.viralHook}
                                        </p>
                                    </div>
                                )}

                                <p className="text-gray-400 text-xs leading-relaxed mb-4 font-mono line-clamp-4">
                                    {prompt.template}
                                </p>

                                {/* Mechanism Note */}
                                {prompt.mechanism && (
                                    <p className="text-[10px] text-gray-500 italic mt-2 flex items-center gap-1">
                                        💡 {prompt.mechanism}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5 flex gap-2">
                                <button
                                    onClick={() => handleCopy(prompt.template, prompt.id, !!prompt.isCommunity)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 justify-center
                                        ${copiedId === prompt.id
                                            ? "bg-green-500 text-white shadow-green-500/20 shadow-lg"
                                            : "bg-white/10 hover:bg-white text-white hover:text-black"
                                        }`}
                                >
                                    {copiedId === prompt.id ? (
                                        <>
                                            <Check className="w-3 h-3" /> Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" /> Copy
                                        </>
                                    )}
                                </button>
                                <span className="text-[10px] text-gray-600 flex items-center justify-center px-1">
                                    {prompt.isCommunity ? <Globe className="w-3 h-3 text-gray-500" /> : <Check className="w-3 h-3 text-blue-500" />}
                                </span>
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/p/${prompt.id}`;
                                        navigator.clipboard.writeText(url);
                                        setShareCopiedId(prompt.id);
                                        setTimeout(() => setShareCopiedId(null), 2000);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${shareCopiedId === prompt.id
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                                        }`}
                                    title="Copy Link to Clipboard"
                                >
                                    {shareCopiedId === prompt.id ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* --- PAGINATION & LOADING --- */}
                {hasMore && !searchQuery && (
                    <div className="flex flex-col items-center gap-6 pb-24 pt-8">
                        <button
                            onClick={loadMore}
                            disabled={isLoadingMore}
                            className={cn(
                                "relative flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-2xl overflow-hidden group border",
                                isLoadingMore
                                    ? "bg-gray-900/50 text-gray-500 cursor-not-allowed border-white/5"
                                    : "bg-white text-black hover:scale-105 active:scale-95 border-white/10 shadow-pink-500/10"
                            )}
                        >
                            {isLoadingMore ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                    Loading more...
                                </>
                            ) : (
                                <>
                                    Load More Prompts
                                    <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Initial Skeleton / Empty State */}
                {isLoading && filtered.length === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[250px] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                )}

                {!isLoading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 w-full">
                        <p className="text-xl">No prompts found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
