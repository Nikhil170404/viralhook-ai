"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, RefreshCw, LogOut, Share2, Check } from "lucide-react";
import { viralPrompts } from "@/lib/prompts";
import { fetchWithCSRF } from "@/lib/api-client";
import { AIInputWithLoading } from "@/components/ui/ai-input-with-loading";
import { Navbar } from "@/components/ui/navbar";
import { createBrowserClient } from "@supabase/ssr";

type GeneratorClientProps = {
    initialSession: any;
};

export default function GeneratorClient({ initialSession }: GeneratorClientProps) {
    const [session, setSession] = useState<any>(initialSession);
    const [userObject, setUserObject] = useState("");
    const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
    const [generatedResult, setGeneratedResult] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [isShareCopied, setIsShareCopied] = useState(false);

    // Initialize Supabase client
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Listen for auth changes to keep session compliant
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (event === 'SIGNED_OUT' || !newSession) {
                window.location.href = '/login';
            } else if (event === 'TOKEN_REFRESHED') {
                setSession(newSession);
            }
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    const generatePrompt = () => {
        if (!userObject) return;
        const randomTemplate = viralPrompts[Math.floor(Math.random() * viralPrompts.length)];
        const finalPrompt = randomTemplate.template.replace("{OBJECT}", userObject);
        setSelectedPrompt(randomTemplate);
        setGeneratedResult(finalPrompt);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500 selection:text-white pt-24">
            <Navbar />
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-900 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center relative z-10">

                <main className="w-full max-w-xl lg:max-w-4xl mx-auto min-h-[60vh] flex flex-col justify-center py-10">

                    {/* Animated Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8 text-center"
                    >
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 leading-tight">
                            Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Viral</span> <br className="sm:hidden" /> Video Prompt.
                        </h1>
                        <p className="text-gray-400 text-base md:text-lg">One prompt. Millions of views.</p>
                    </motion.div>

                    {/* Input Section */}
                    <div className="w-full">
                        <AIInputWithLoading
                            placeholder="e.g. A Nike Shoe, A Slice of Pizza..."
                            onSubmit={async (val, mode, targetModel, aiModel, personDescription) => {
                                setUserObject(val);

                                // Call the new API
                                try {
                                    const token = session?.access_token;
                                    const response = await fetchWithCSRF('/api/generate', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                        },
                                        body: JSON.stringify({
                                            object: val,
                                            mode: mode,
                                            targetModel: targetModel,
                                            aiModel: aiModel,
                                            personDescription: personDescription
                                        })
                                    });

                                    const data = await response.json();

                                    setSelectedPrompt({
                                        id: data.id || 0,
                                        category: data.category || "Viral Hit",
                                        template: data.prompt,
                                        platform: data.platform || "AI Video",
                                        viralHook: data.viralHook,
                                        personNote: data.personNote // Capture the person note
                                    });

                                    setGeneratedResult(data.prompt);

                                } catch (e) {
                                    console.error("API Error", e);
                                    // Fallback to local
                                    const randomTemplate = viralPrompts[Math.floor(Math.random() * viralPrompts.length)];
                                    const finalPrompt = randomTemplate.template.replace("{OBJECT}", val);
                                    setSelectedPrompt(randomTemplate);
                                    setGeneratedResult(finalPrompt);
                                }
                            }}
                            loadingDuration={2000}
                            thinkingDuration={500}
                        />
                    </div>


                    {/* Result Card (Appears after generating) */}
                    <AnimatePresence>
                        {generatedResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-6"
                            >
                                <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-3xl p-6 relative overflow-hidden group hover:border-gray-700 transition-all duration-300">

                                    {/* Category & Stats Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                                            {selectedPrompt?.category || 'VIRAL MODE'}
                                        </h3>
                                        {selectedPrompt?.expectedViews && (
                                            <span className="text-xs font-mono text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
                                                📈 {selectedPrompt.expectedViews}
                                            </span>
                                        )}
                                    </div>

                                    {/* Custom Character Badge */}
                                    {selectedPrompt?.personNote && (
                                        <div className="mb-4 bg-purple-900/20 rounded-xl p-3 border border-purple-500/20">
                                            <div className="flex items-center gap-2 mb-1">
                                                {/* We need User icon here, but it's not imported. Use fallback or add import */}
                                                <span className="text-purple-400">👤</span>
                                                <p className="text-xs text-purple-300 uppercase font-bold tracking-wide">
                                                    Custom Character
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-300">
                                                This prompt includes your custom character description.
                                                The AI will generate a person matching your description.
                                            </p>
                                        </div>
                                    )}

                                    {/* Viral Hook Badge */}
                                    {selectedPrompt?.viralHook && (
                                        <div className="mb-6 bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/30 rounded-xl p-4 flex items-center gap-3">
                                            <div className="bg-pink-500/20 p-2 rounded-lg">
                                                <span className="text-xl">🔥</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-pink-300 uppercase font-bold tracking-wide mb-1">Viral Hook</p>
                                                <p className="text-sm font-bold text-white italic">"{selectedPrompt.viralHook}"</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Main Prompt */}
                                    <div className="mb-6">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-2 tracking-wide">Copy this Prompt:</p>
                                        <p className="text-base leading-relaxed text-gray-100 font-medium font-sans">
                                            {generatedResult}
                                        </p>
                                    </div>

                                    {/* Photo Instructions (New Feature) */}
                                    {selectedPrompt?.photoInstructions && (
                                        <div className="mb-6 bg-blue-900/20 rounded-xl p-4 border border-blue-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">📸</span>
                                                <p className="text-xs text-blue-300 uppercase font-bold tracking-wide">Photo Instructions</p>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                {selectedPrompt.photoInstructions}
                                            </p>
                                        </div>
                                    )}

                                    {/* Copy Bar */}
                                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                                        <span className="text-xs text-gray-500 font-mono">
                                            Optimized for {selectedPrompt?.platform || 'All Platforms'}
                                        </span>
                                        <div className="flex gap-3">
                                            {/* Share Button (Only if we have a real ID) */}
                                            {selectedPrompt?.id && selectedPrompt.id !== 0 && (
                                                <button
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/p/${selectedPrompt.id}`;
                                                        navigator.clipboard.writeText(url);
                                                        setIsShareCopied(true);
                                                        setTimeout(() => setIsShareCopied(false), 2000);
                                                    }}
                                                    className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition-all flex items-center gap-2 ${isShareCopied
                                                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    {isShareCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                                    {isShareCopied ? "Link Copied" : "Share Link"}
                                                </button>
                                            )}

                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(generatedResult);
                                                    setIsCopied(true);
                                                    setTimeout(() => setIsCopied(false), 2000);
                                                }}
                                                className={`
                            px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2
                            ${isCopied
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 scale-105'
                                                        : 'bg-white text-black hover:bg-gray-100 hover:scale-105 shadow-lg shadow-white/10'}
                        `}
                                            >
                                                {isCopied ? (
                                                    <>✓ Copied!</>
                                                ) : (
                                                    <><Copy className="w-4 h-4" /> Copy Prompt</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mt-4">
                                    <button
                                        onClick={generatePrompt}
                                        className="text-gray-500 text-sm hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Try a different style
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
