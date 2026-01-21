"use client";

import { CornerRightUp, Zap, Clapperboard, ChevronDown, Check, Sparkles, Video, Film, Camera, Cpu, Target, Layers, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";
import { motion, AnimatePresence } from "framer-motion";

interface AIInputWithLoadingProps {
    id?: string;
    placeholder?: string;
    minHeight?: number;
    maxHeight?: number;
    loadingDuration?: number;
    thinkingDuration?: number;
    onSubmit?: (value: string, mode: 'chaos' | 'cinematic' | 'shocking' | 'anime' | 'cartoon' | 'stickman', targetModel: string, aiModel: string, personDescription?: string) => void | Promise<void>;
    className?: string;
    autoAnimate?: boolean;
}

const INTELLIGENCE_MODELS = [
    { id: "xiaomi/mimo-v2-flash:free", name: "Xiaomi MIMO v2", icon: Zap, desc: "Fast & optimized for flash" },
    { id: "tngtech/deepseek-r1t2-chimera:free", name: "TNG Chimera", icon: Target, desc: "Specialized tuning" },
    { id: "deepseek/deepseek-r1-0528:free", name: "Deepseek R1", icon: Sparkles, desc: "Advanced reasoning & logic" },
];

const MODELS = [
    { id: "auto", name: "Auto (Best)", icon: Sparkles, desc: "Smartly selects best engine" },
    { id: "kling", name: "Kling AI", icon: Video, desc: "Superior motion & physics" },
    { id: "luma", name: "Luma Dream", icon: Camera, desc: "Fluid cinematic flow" },
    { id: "veo", name: "Google Veo", icon: Clapperboard, desc: "Hyper-realistic high fidelity" },
    { id: "runway", name: "Runway Gen-3", icon: Film, desc: "Precision camera control" },
];

export function AIInputWithLoading({
    id = "ai-input-with-loading",
    placeholder = "Ask me anything!",
    minHeight = 56,
    maxHeight = 200,
    loadingDuration = 3000,
    thinkingDuration = 1000,
    onSubmit,
    className,
    autoAnimate = false
}: AIInputWithLoadingProps) {
    const [inputValue, setInputValue] = useState("");
    const [personDescription, setPersonDescription] = useState("");
    const [showPersonInput, setShowPersonInput] = useState(false);
    const [submitted, setSubmitted] = useState(autoAnimate);
    const [isAnimating, setIsAnimating] = useState(autoAnimate);
    const [mode, setMode] = useState<'chaos' | 'cinematic' | 'shocking' | 'anime' | 'cartoon' | 'stickman'>('chaos');
    const [targetModel, setTargetModel] = useState<string>("auto");
    const [aiModel, setAiModel] = useState<string>(INTELLIGENCE_MODELS[0].id);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const intelligenceRef = useRef<HTMLDivElement>(null);

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight,
        maxHeight,
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (intelligenceRef.current && !intelligenceRef.current.contains(event.target as Node)) {
                setIsIntelligenceOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const runAnimation = () => {
            if (!isAnimating) return;
            setSubmitted(true);
            timeoutId = setTimeout(() => {
                setSubmitted(false);
                timeoutId = setTimeout(runAnimation, thinkingDuration);
            }, loadingDuration);
        };

        if (isAnimating) {
            runAnimation();
        }

        return () => clearTimeout(timeoutId);
    }, [isAnimating, loadingDuration, thinkingDuration]);

    const handleSubmit = async () => {
        if (!inputValue.trim() || submitted) return;

        setSubmitted(true);
        await onSubmit?.(inputValue, mode, targetModel, aiModel, personDescription || undefined);
        setInputValue("");
        setPersonDescription("");
        setShowPersonInput(false);
        adjustHeight(true);

        setTimeout(() => {
            setSubmitted(false);
        }, loadingDuration);
    };

    const currentModel = MODELS.find(m => m.id === targetModel) || MODELS[0];

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative max-w-xl lg:max-w-4xl w-full mx-auto flex items-center lg:items-center flex-col gap-4">

                {/* --- PREMIUM SELECTOR BAR --- */}
                <div className="flex flex-col items-center gap-3 w-full justify-center">

                    {/* Mode Segmented Control - Scrollable on mobile */}
                    <div className="flex overflow-x-auto no-scrollbar pb-2 lg:pb-0 w-full lg:w-auto justify-start md:justify-center">
                        <div className="flex bg-gray-900/40 backdrop-blur-md p-1 rounded-2xl border border-white/5 shadow-2xl flex-nowrap min-w-max">
                            {(['chaos', 'cinematic', 'shocking', 'anime', 'cartoon', 'stickman'] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={cn(
                                        "relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                                        mode === m ? "text-white" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    {mode === m && (
                                        <motion.div
                                            layoutId="activeMode"
                                            className={cn(
                                                "absolute inset-0 rounded-xl shadow-lg -z-10",
                                                m === 'chaos' ? "bg-gradient-to-r from-pink-500 to-purple-600" :
                                                    m === 'cinematic' ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                                                        m === 'shocking' ? "bg-gradient-to-r from-red-500 to-orange-500" :
                                                            m === 'anime' ? "bg-gradient-to-r from-indigo-500 to-purple-500" :
                                                                m === 'cartoon' ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                                                                    "bg-gradient-to-r from-gray-500 to-gray-700"
                                            )}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    {m === 'chaos' ? <Zap className="w-3.5 h-3.5" /> :
                                        m === 'cinematic' ? <Clapperboard className="w-3.5 h-3.5" /> :
                                            m === 'shocking' ? <Zap className="w-3.5 h-3.5 rotate-45" /> :
                                                m === 'anime' ? <Sparkles className="w-3.5 h-3.5" /> :
                                                    m === 'cartoon' ? <Layers className="w-3.5 h-3.5" /> :
                                                        <Cpu className="w-3.5 h-3.5" />}
                                    <span className="capitalize">{m}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-2 md:gap-3 justify-center">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(!isDropdownOpen);
                                    setIsIntelligenceOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl text-[10px] sm:text-xs font-bold text-gray-300 hover:text-white hover:border-white/10 transition-all shadow-xl min-w-[130px]"
                            >
                                <currentModel.icon className="w-3 md:w-3.5 h-3 md:h-3.5 text-blue-400" />
                                <span className="truncate max-w-[80px] sm:max-w-none">{currentModel.name}</span>
                                <ChevronDown className={cn("ml-auto w-3 md:w-3.5 h-3 md:h-3.5 transition-transform", isDropdownOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-64 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden p-1.5"
                                    >
                                        <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5 mb-1.5 flex items-center gap-2">
                                            <Video className="w-3 h-3" /> Video Engine
                                        </div>
                                        <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                                            {MODELS.map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => {
                                                        setTargetModel(m.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                                                        targetModel === m.id ? "bg-white/5 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "p-1.5 rounded-lg",
                                                        targetModel === m.id ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-500 group-hover:text-gray-300"
                                                    )}>
                                                        <m.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col items-start gap-0.5">
                                                        <span className="text-xs font-bold leading-tight">{m.name}</span>
                                                        <span className="text-[10px] text-gray-500 leading-tight">{m.desc}</span>
                                                    </div>
                                                    {targetModel === m.id && <Check className="ml-auto w-3.5 h-3.5 text-blue-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Intelligence Engine Dropdown */}
                        <div className="relative" ref={intelligenceRef}>
                            <button
                                onClick={() => {
                                    setIsIntelligenceOpen(!isIntelligenceOpen);
                                    setIsDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl text-[10px] sm:text-xs font-bold text-gray-300 hover:text-white hover:border-white/10 transition-all shadow-xl min-w-[130px]"
                            >
                                <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-purple-400" />
                                <span className="truncate max-w-[80px] sm:max-w-none">
                                    {INTELLIGENCE_MODELS.find(m => m.id === aiModel)?.name || "Auto Brain"}
                                </span>
                                <ChevronDown className={cn("ml-auto w-3 md:w-3.5 h-3 md:h-3.5 transition-transform", isIntelligenceOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {isIntelligenceOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full mt-2 right-0 w-64 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden p-1.5"
                                    >
                                        <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/5 mb-1.5 flex items-center gap-2">
                                            <Cpu className="w-3 h-3" /> Intelligence Engine
                                        </div>
                                        <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                                            {INTELLIGENCE_MODELS.map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => {
                                                        setAiModel(m.id);
                                                        setIsIntelligenceOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                                                        aiModel === m.id ? "bg-white/5 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "p-1.5 rounded-lg",
                                                        aiModel === m.id ? "bg-purple-500/20 text-purple-400" : "bg-gray-800 text-gray-500 group-hover:text-gray-300"
                                                    )}>
                                                        <m.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col items-start gap-0.5">
                                                        <span className="text-xs font-bold leading-tight">{m.name}</span>
                                                        <span className="text-[10px] text-gray-500 leading-tight">{m.desc}</span>
                                                    </div>
                                                    {aiModel === m.id && <Check className="ml-auto w-3.5 h-3.5 text-purple-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="relative max-w-xl w-full mx-auto">
                    <Textarea
                        id={id}
                        placeholder={
                            mode === 'chaos' ? "e.g. A Nike Shoe, A Slice of Pizza..." :
                                mode === 'cinematic' ? "e.g. A futuristic city, A calm ocean..." :
                                    mode === 'anime' ? "e.g. A samurai showdown, A magical transformation..." :
                                        mode === 'cartoon' ? "e.g. A running cat, A dancing toaster..." :
                                            mode === 'stickman' ? "e.g. A stick figure parkour run..." :
                                                "e.g. A ferris wheel ride, A guy crossing the street..."
                        }
                        className={cn(
                            "w-full bg-white/10 rounded-3xl pl-5 md:pl-6 pr-10 md:pr-12 py-3 md:py-4",
                            "placeholder:text-white/50 text-sm md:text-base",
                            "border-none ring-white/30",
                            "text-white resize-none text-wrap leading-[1.2]",
                            `min-h-[56px]`,
                            mode === 'cinematic' ? "focus:ring-cyan-500/50" :
                                mode === 'shocking' ? "focus:ring-orange-500/50" : "focus:ring-pink-500/50"
                        )}
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        disabled={submitted}
                    />
                    <button
                        onClick={handleSubmit}
                        className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 rounded-xl py-1 px-1",
                            submitted ? "bg-none" : "bg-white/5"
                        )}
                        type="button"
                        disabled={submitted}
                    >
                        {submitted ? (
                            <div
                                className="w-4 h-4 bg-white rounded-sm animate-spin transition duration-700"
                                style={{ animationDuration: "3s" }}
                            />
                        ) : (
                            <CornerRightUp
                                className={cn(
                                    "w-4 h-4 transition-opacity text-white",
                                    inputValue ? "opacity-100" : "opacity-30"
                                )}
                            />
                        )}
                    </button>
                </div>

                {/* 🆕 PERSON DESCRIPTION TOGGLE */}
                <div className="w-full max-w-xl">
                    <button
                        onClick={() => setShowPersonInput(!showPersonInput)}
                        className={cn(
                            "w-full px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                            showPersonInput
                                ? "bg-purple-500/20 border-2 border-purple-500/50 text-purple-300"
                                : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                        )}
                    >
                        <User className="w-4 h-4" />
                        {showPersonInput ? "Person Description Added ✓" : "Add Yourself to Scene (Optional)"}
                    </button>

                    <AnimatePresence>
                        {showPersonInput && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 overflow-hidden"
                            >
                                <Textarea
                                    placeholder="Describe yourself: age, clothing, appearance... Example: 25 year old, wearing black hoodie, brown skin, short hair"
                                    value={personDescription}
                                    onChange={(e) => setPersonDescription(e.target.value)}
                                    className="w-full bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-purple-300/50 resize-none"
                                    rows={3}
                                />
                                <p className="text-xs text-gray-500 mt-2 flex items-start gap-2">
                                    <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>We'll incorporate your description into the generated scene. The AI will create a person matching your description in the video.</span>
                                </p>

                                <div className="flex flex-wrap gap-2 mt-3 pl-1">
                                    <span className="text-[10px] text-gray-500 py-1">Try:</span>
                                    {[
                                        "24yo Indian male, black hoodie, jeans",
                                        "Blonde woman, red dress, elegant",
                                        "Cyberpunk character, neon jacket, mask",
                                        "Elderly man, glasses, grey suit"
                                    ].map((ex, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPersonDescription(ex)}
                                            className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-colors cursor-pointer"
                                        >
                                            {ex}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <p className="pl-4 h-4 text-xs mx-auto text-white/70 flex items-center gap-4">
                    <span>
                        {submitted
                            ? (mode === 'chaos' ? "AI is directing a chaotic scene..." : "Cinematographer is framing the shot...")
                            : personDescription
                                ? "Ready with your custom character!"
                                : "Ready to go viral!"}
                    </span>
                </p>
            </div>
        </div >
    );
}
