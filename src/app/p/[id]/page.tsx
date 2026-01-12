import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Copy, Sparkles, TrendingUp, Share2, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import { Metadata, ResolvingMetadata } from 'next';

// Init Supabase (Server Side)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
    params: { id: string }
}

// SEO Metadata
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { data: prompt } = await supabase
        .from('generated_prompts')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!prompt) {
        return { title: 'Prompt Not Found - ViralHook' };
    }

    return {
        title: `${prompt.category} Viral Prompt | ViralHook`,
        description: `Check out this viral video prompt: "${prompt.viral_hook}". Generate your own with AI.`,
        openGraph: {
            title: `Viral Prompt: ${prompt.viral_hook}`,
            description: prompt.prompt_text.substring(0, 100) + '...',
        }
    };
}

export default async function ShareablePromptPage({ params }: Props) {
    // Fetch Prompt
    const { data: prompt, error } = await supabase
        .from('generated_prompts')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !prompt) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500 selection:text-white pt-24 pb-20 px-6">
            <Navbar />

            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-40">
                <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-purple-900 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] bg-pink-900 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-3xl mx-auto pt-12 md:pt-20">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 mb-6">
                        <Share2 className="w-3 h-3" /> Shared via ViralHook Library
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">

                    {/* Top Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border uppercase tracking-widest bg-pink-500/10 border-pink-500/20 text-pink-400`}>
                                {prompt.category || 'COMMUNITY'}
                            </span>
                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-gray-400">
                                {prompt.platform || 'General'}
                            </span>
                        </div>
                        {prompt.copy_count > 0 && (
                            <div className="flex items-center gap-2 text-sm font-bold text-green-400 bg-green-900/20 px-3 py-1.5 rounded-full">
                                <TrendingUp className="w-4 h-4" /> Used {prompt.copy_count} times
                            </div>
                        )}
                    </div>

                    {/* Viral Hook */}
                    {prompt.viral_hook && (
                        <div className="mb-8">
                            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Target Viral Hook</h2>
                            <p className="text-3xl md:text-4xl font-black text-white leading-tight">
                                "{prompt.viral_hook}"
                            </p>
                        </div>
                    )}

                    {/* The Prompt */}
                    <div className="bg-black/30 rounded-2xl p-6 border border-white/5 mb-8">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-purple-400" /> The Prompt
                        </h3>
                        <p className="text-gray-300 font-mono text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                            {prompt.prompt_text}
                        </p>
                    </div>

                    {/* Copy Button (Client-side logic required? Or just simple text selection) */}
                    {/* Since this is a server component, we can make a simple copy area or just a client component button. 
                        For simplicity in v1, we use a link to generator. 
                    */}

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/generator"
                            className="flex-1 bg-white hover:bg-gray-100 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                        >
                            <Sparkles className="w-4 h-4" /> Generate Similar
                        </Link>
                        <Link
                            href="/library"
                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            Browse Library <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm">
                        Generated with <strong>ViralHook AI</strong>. <br />
                        Logic Engine: {prompt.mode?.toUpperCase() || prompt.mechanism || 'STANDARD'}
                    </p>
                </div>
            </div>
        </div>
    );
}
