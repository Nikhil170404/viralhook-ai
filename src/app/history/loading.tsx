import { Navbar } from "@/components/ui/navbar";

export default function Loading() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
                    <div className="space-y-4">
                        <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
                        <div className="h-4 w-32 bg-white/5 rounded-lg"></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-10 w-64 bg-white/5 rounded-xl"></div>
                    </div>
                </div>

                {/* Filters Skeleton */}
                <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-white/5 animate-pulse">
                    <div className="h-8 w-64 bg-white/5 rounded-lg"></div>
                    <div className="h-8 w-32 bg-white/5 rounded-lg ml-auto"></div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="h-[250px] rounded-2xl border border-white/10 bg-white/5 animate-pulse flex flex-col p-5 space-y-4"
                        >
                            <div className="flex justify-between">
                                <div className="h-5 w-20 bg-white/10 rounded-full"></div>
                                <div className="h-5 w-5 bg-white/10 rounded-lg"></div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                                <div className="h-4 w-full bg-white/10 rounded"></div>
                                <div className="h-4 w-5/6 bg-white/10 rounded"></div>
                            </div>
                            <div className="h-8 w-24 bg-white/10 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
