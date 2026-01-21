"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showText?: boolean;
    animated?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, showText = true, animated = false, size = "md" }: LogoProps) {
    const sizeMap = {
        sm: { icon: 20, text: "text-lg" },
        md: { icon: 32, text: "text-xl" },
        lg: { icon: 40, text: "text-2xl" },
        xl: { icon: 48, text: "text-3xl" }
    };

    const dims = sizeMap[size];

    return (
        <div className={cn("flex items-center gap-2 select-none", className)}>
            <div className={cn("relative flex items-center justify-center", animated ? "group" : "")}>
                {/* Glow Effect */}
                <div className={cn(
                    "absolute inset-0 bg-pink-500 rounded-lg blur-lg opacity-20 transition-opacity duration-300",
                    animated && "group-hover:opacity-40"
                )} />

                {/* SVG Logo Icon */}
                <svg
                    width={dims.icon}
                    height={dims.icon}
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10"
                >
                    {/* Gradient Definitions */}
                    <defs>
                        <linearGradient id="viralGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#A855F7" /> {/* Purple-500 */}
                            <stop offset="100%" stopColor="#EC4899" /> {/* Pink-500 */}
                        </linearGradient>
                        <linearGradient id="glowGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#D8B4FE" /> {/* Purple-300 */}
                            <stop offset="100%" stopColor="#F9A8D4" /> {/* Pink-300 */}
                        </linearGradient>
                    </defs>

                    {/* Main Bolt Shape */}
                    <path
                        d="M17.5 2L4 18H14.5L12 30L28 12H16L17.5 2Z"
                        fill="url(#viralGradient)"
                        stroke="white"
                        strokeOpacity="0.1"
                        strokeWidth="0.5"
                    />

                    {/* Inner Accent (Hook/Spark) */}
                    <path
                        d="M16 12L24 12L14 24L16 12Z"
                        fill="white"
                        fillOpacity="0.2"
                        className={cn(animated && "opacity-0 group-hover:opacity-100 transition-opacity duration-300")}
                    />
                </svg>
            </div>

            {/* Text Logo */}
            {showText && (
                <div className={cn("font-black tracking-tighter leading-none flex items-center", dims.text)}>
                    <span className="text-white">VIRAL</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">HOOK</span>
                    <span className="text-pink-500 text-[0.6em] ml-0.5 align-top opacity-80">.AI</span>
                </div>
            )}
        </div>
    );
}
