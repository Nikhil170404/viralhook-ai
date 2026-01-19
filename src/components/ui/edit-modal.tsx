"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, AlertTriangle } from "lucide-react";

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: number | string, newText: string, newHook?: string) => Promise<void>;
    promptId: number | string | null;
    initialText: string;
    initialHook?: string;
}

export function EditModal({ isOpen, onClose, onSave, promptId, initialText, initialHook }: EditModalProps) {
    const [text, setText] = useState(initialText);
    const [hook, setHook] = useState(initialHook || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!promptId || !text.trim()) return;
        setIsSaving(true);
        try {
            await onSave(promptId, text, hook);
            onClose();
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-blue-500">Edit</span> Prompt
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Viral Hook (Title)</label>
                                    <input
                                        type="text"
                                        value={hook}
                                        onChange={(e) => setHook(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="E.g. The 3-Second Rule..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Prompt Instructions</label>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors min-h-[200px] leading-relaxed font-mono text-sm"
                                        placeholder="Describe the video prompt..."
                                    />
                                </div>

                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                    <p className="text-xs text-yellow-200/80 leading-relaxed">
                                        Editing does not regenerate the video. This only updates the saved text in your library.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !text.trim()}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>Updating...</>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
