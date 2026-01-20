"use client";

import { useState, useEffect, useCallback } from "react";
import { PromptTemplate } from "@/lib/prompts";
import { Copy, Check, Search, TrendingUp, Clock, Trash2, AlertTriangle, Share2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { Navbar } from "@/components/ui/navbar";
import Link from "next/link";


// Init Supabase with SSR client
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HistoryPage() {
    // State
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<'all' | 'prompt' | 'hook'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'viral'>('newest');

    // UI Feedback
    const [copiedId, setCopiedId] = useState<number | string | null>(null);
    const [deletingId, setDeletingId] = useState<number | string | null>(null);

    const PAGE_SIZE = 20;

    // Protect Route
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                window.location.href = '/login';
            }
        });
    }, []);

    // Fetch Prompts
    const fetchHistory = useCallback(async (pageNum: number, isInitial: boolean = false) => {
        if (isInitial) setIsLoading(true);
        else setIsLoadingMore(true);

        try {
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: PAGE_SIZE.toString(),
                sort: sortBy,
                type: selectedType,
                search: searchQuery
            });

            const res = await fetch(`/api/history?${params.toString()}`);
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            const mapped: PromptTemplate[] = data.data.map((p: any) => ({
                id: p.id,
                category: p.category || "Personal",
                platform: p.platform || "Unknown",
                template: p.prompt_text,
                viralHook: p.viral_hook,
                mechanism: p.mechanism,
                copyCount: p.copy_count || 0,
                isCommunity: false // Personal history
            }));

            setPrompts(prev => isInitial ? mapped : [...prev, ...mapped]);
            setHasMore(data.hasMore);

        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [sortBy, selectedType, searchQuery]);

    // Initial Fetch & Refetch on Filter Change
    useEffect(() => {
        setPage(0);
        setPrompts([]); // Clear list to avoid index confusion
        fetchHistory(0, true);
    }, [sortBy, selectedType, searchQuery, fetchHistory]);

    // Load More
    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistory(nextPage, false);
    };

    // Actions
    const handleCopy = (text: string, id: number | string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: number | string) => {
        if (!confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");

            // Remove from UI
            setPrompts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            alert("Failed to delete prompt");
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };



    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500 selection:text-white pt-32 px-6">
            <Navbar />



            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-900 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-900 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
                    <div className="flex flex-col gap-1 w-full md:w-auto text-center md:text-left">
                        <h1 className="text-4xl font-black tracking-tighter">MY <span className="text-blue-500">HISTORY</span></h1>
                        <p className="text-gray-500 text-sm font-medium">Manage your personal prompt library.</p>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto items-center md:items-end">
                        <div className="flex flex-wrap gap-3 justify-center md:justify-end w-full">
                            {/* Type Filter */}
                            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                                <button onClick={() => setSelectedType('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedType === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>All</button>
                                <button onClick={() => setSelectedType('prompt')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedType === 'prompt' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}>Prompts</button>
                                <button onClick={() => setSelectedType('hook')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedType === 'hook' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white'}`}>Hooks</button>
                            </div>

                            {/* Sort */}
                            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                                <button onClick={() => setSortBy('newest')} className={`px-2 py-1.5 rounded-lg transition-all ${sortBy === 'newest' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`} title="Newest"><Clock className="w-4 h-4" /></button>
                                <button onClick={() => setSortBy('viral')} className={`px-2 py-1.5 rounded-lg transition-all ${sortBy === 'viral' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`} title="Most Viral"><TrendingUp className="w-4 h-4" /></button>
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-48 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search history..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-xl leading-5 bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 sm:text-xs transition-all h-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
                    <AnimatePresence>
                        {prompts.map((prompt, index) => (
                            <motion.div
                                key={prompt.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 hover:border-blue-500/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-bold px-2 py-1 rounded border border-blue-500/30 bg-blue-900/20 text-blue-300 uppercase tracking-widest">
                                            {prompt.category}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {(prompt.copyCount || 0) > 0 && (
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                    <TrendingUp className="w-3 h-3 text-green-400" /> {prompt.copyCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {prompt.viralHook && (
                                        <div className="mb-3">
                                            <p className="text-white text-sm font-bold leading-tight border-l-2 border-orange-500 pl-3">
                                                {prompt.viralHook}
                                            </p>
                                        </div>
                                    )}

                                    <p className="text-gray-400 text-xs leading-relaxed mb-4 font-mono line-clamp-4 select-text">
                                        {prompt.template}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex gap-2">
                                    <button
                                        onClick={() => handleCopy(prompt.template, prompt.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 justify-center
                                            ${copiedId === prompt.id
                                                ? "bg-green-500 text-white"
                                                : "bg-white/10 hover:bg-white text-white hover:text-black"
                                            }`}
                                    >
                                        {copiedId === prompt.id ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                                    </button>



                                    <button
                                        onClick={() => handleDelete(prompt.id)}
                                        disabled={deletingId === prompt.id}
                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors"
                                        title="Delete Prompt"
                                    >
                                        {deletingId === prompt.id ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[250px] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && prompts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-xl font-medium mb-2">No history found</p>
                        <p className="text-sm mb-6">You haven't generated any prompts yet.</p>
                        <Link href="/generator" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-bold hover:scale-105 transition-transform">
                            Start Generating
                        </Link>
                    </div>
                )}

                {/* Load More */}
                {hasMore && !isLoading && prompts.length > 0 && (
                    <div className="flex justify-center pb-20">
                        <button
                            onClick={loadMore}
                            disabled={isLoadingMore}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors border border-white/10"
                        >
                            {isLoadingMore ? "Loading..." : <>Load More <ChevronDown className="w-4 h-4" /></>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
