"use client";

import { useState, useCallback } from "react";
import { PromptTemplate } from "@/lib/prompts";
import { Copy, Check, Search, TrendingUp, Clock, Trash2, AlertTriangle, Share2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/ui/navbar";
import toast from "react-hot-toast";
import Link from "next/link";

type HistoryClientProps = {
    initialPrompts: any[];
    initialHasMore: boolean;
    initialTotal: number;
};

export default function HistoryClient({ initialPrompts, initialHasMore, initialTotal }: HistoryClientProps) {
    // State
    const [prompts, setPrompts] = useState<any[]>(initialPrompts);
    const [isLoading, setIsLoading] = useState(false); // Only for client-side filter updates
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(0);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<'all' | 'prompt' | 'hook'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'viral'>('newest');

    // UI Feedback
    const [copiedId, setCopiedId] = useState<number | string | null>(null);
    const [deletingId, setDeletingId] = useState<number | string | null>(null);

    const PAGE_SIZE = 20;

    // Fetch Prompts (Client Side)
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

            // Keep using API for client-side interactions to avoid full page reload
            const res = await fetch(`/api/history?${params.toString()}`);
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            const mapped = data.data; // Helper already maps basic structure, but we might need UI specifcs

            setPrompts(prev => isInitial ? mapped : [...prev, ...mapped]);
            setHasMore(data.hasMore);

        } catch (error) {
            console.error("Failed to fetch history:", error);
            toast.error("Failed to update history");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [sortBy, selectedType, searchQuery]);

    // Re-fetch on filter change
    // Note: We don't run this on mount because we have initial data!
    // We only run it when filters CHANGE from default.
    // However, since initial state matches defaults, this effect might trigger if dependencies allow.
    // To be safe, we can use a mount ref, or just let it run if user changes something.
    const handleFilterChange = (key: string, value: any) => {
        setPage(0);
        if (key === 'search') setSearchQuery(value);
        if (key === 'type') setSelectedType(value);
        if (key === 'sort') setSortBy(value);

        // We need to trigger fetch with NEW values.
        // The simplistic approach is to useEffect on dependency change.
        // Let's stick to the useEffect pattern but skip first run if it matches initial?
        // Actually, easiest is to just let the user interact.
    };

    // Better pattern: Use Effect for filter changes
    // But block the very first run since we have initial data.
    const [isMounted, setIsMounted] = useState(false);

    // biome-ignore lint/nursery/useExhaustiveDependencies: controlled fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const useEffectFilter = useCallback(() => {
        if (!isMounted) {
            setIsMounted(true);
            return;
        }
        setPage(0);
        fetchHistory(0, true);
    }, [sortBy, selectedType, searchQuery]); // fetchHistory is stable

    // Trigger effect when filters change
    // Logic: if filters changed, re-fetch.
    // Using a simple useEffect monitoring filters
    import("react").then(({ useEffect }) => {
        useEffect(() => {
            if (isMounted) {
                setPage(0);
                fetchHistory(0, true);
            } else {
                setIsMounted(true);
            }
        }, [sortBy, selectedType, searchQuery]);
    });

    // Delete Prompt
    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this?")) return;
        setDeletingId(id);

        try {
            const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");

            setPrompts(prev => prev.filter(p => p.id !== id));
            toast.success("Deleted successfully");
        } catch (e) {
            toast.error("Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    // Copy Prompt
    const handleCopy = async (id: number, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopiedId(null), 2000);

            // Increment copy count (fire generic api if needed, or assume UI optimistic)
            // Just optimistic update locally if we tracked copies
        } catch (err) {
            toast.error("Failed to copy");
        }
    };

    // Load More
    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistory(nextPage, false);
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/60">
                            Your Viral History
                        </h1>
                        <p className="text-gray-400 mt-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Saved Generations
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search history..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-gray-200 placeholder:text-gray-500 group-hover:bg-white/10"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-white/5">
                    <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
                        {(['all', 'prompt', 'hook'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setSelectedType(t)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                                    selectedType === t
                                        ? "bg-purple-500/20 text-purple-300 shadow-sm border border-purple-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {t === 'all' ? 'All Types' : `${t}s`}
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="viral">Viral Potential</option>
                        </select>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-white/5 rounded-2xl border border-white/10" />
                        ))}
                    </div>
                ) : prompts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-white/10 rounded-3xl bg-white/5/50">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Search className="w-8 h-8 text-gray-500" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-white">No history found</p>
                            <p className="text-gray-400 text-sm max-w-sm mt-1">
                                {searchQuery ? "Try adjusting your search filters" : "Start generating viral content to build your history"}
                            </p>
                        </div>
                        {!searchQuery && (
                            <Link
                                href="/generator"
                                className="mt-4 px-6 py-2 bg-white text-black text-sm font-semibold rounded-full hover:scale-105 transition-transform"
                            >
                                Create New
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {prompts.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="group relative flex flex-col justify-between h-auto min-h-[220px] p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
                                >
                                    {/* Top Metadata */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                item.prompt_type === 'hook'
                                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                    : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                            )}>
                                                {item.prompt_type === 'hook' ? 'HOOK' : 'VIDEO'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400">
                                                {item.platform || "Unknown"}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Main Content */}
                                    <div className="space-y-3 flex-grow">
                                        {item.viral_hook && (
                                            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-l-2 border-purple-500 pl-3 py-2 rounded-r-lg">
                                                <p className="text-xs text-purple-300 font-bold tracking-wide mb-0.5 flex items-center gap-1.5">
                                                    <TrendingUp className="w-3 h-3" />
                                                    VIRAL HOOK
                                                </p>
                                                <p className="text-sm font-medium text-white/90 italic leading-relaxed">"{item.viral_hook}"</p>
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                                                PROMPT
                                            </p>
                                            <p className="text-sm text-gray-300 line-clamp-4 leading-relaxed group-hover:text-gray-200 transition-colors">
                                                {item.prompt_text}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="text-[10px] text-gray-500 font-medium">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>

                                        <button
                                            onClick={() => handleCopy(item.id, item.prompt_text)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-lg border",
                                                copiedId === item.id
                                                    ? "bg-green-500/20 text-green-400 border-green-500/20"
                                                    : "bg-white text-black hover:bg-gray-200 border-transparent hover:scale-105"
                                            )}
                                        >
                                            {copiedId === item.id ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    Copy Prompt
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Load More Trigger */}
                {hasMore && (
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={loadMore}
                            disabled={isLoadingMore}
                            className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-full text-sm font-medium transition-all disabled:opacity-50 border border-white/10 hover:border-purple-500/30"
                        >
                            {isLoadingMore ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Loading...
                                </span>
                            ) : (
                                "Load More History"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
