"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("History Page Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <Navbar />

            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        We couldn't load your history. This might be a temporary connection issue.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-semibold hover:scale-105 transition-transform"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2.5 bg-white/5 text-white border border-white/10 rounded-full font-semibold hover:bg-white/10 transition-colors"
                    >
                        Reload Page
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-red-950/30 border border-red-900/50 rounded-lg max-w-2xl text-left overflow-auto">
                        <p className="text-red-400 font-mono text-xs">{error.message}</p>
                        {error.digest && <p className="text-red-500/50 font-mono text-xs mt-1">Digest: {error.digest}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
