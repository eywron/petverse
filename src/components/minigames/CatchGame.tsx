"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

interface Item {
    id: number;
    x: number;
    delay: number;
    type: 'treat' | 'bomb';
}

export default function CatchGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [items, setItems] = useState<Item[]>([]);
    
    // Start game
    const startGame = () => {
        setIsPlaying(true);
        setScore(0);
        setTimeLeft(30);
        setItems([]);
    };

    // Game loop
    useEffect(() => {
        if (!isPlaying) return;

        // Timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsPlaying(false);
                    onComplete(score);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Spawn items
        const spawner = setInterval(() => {
            setItems((prev) => [
                ...prev,
                {
                    id: Date.now() + Math.random(),
                    x: Math.random() * 80 + 10, // 10% to 90% width
                    delay: 0,
                    type: Math.random() > 0.8 ? 'bomb' : 'treat'
                }
            ]);
        }, 800);

        return () => {
            clearInterval(timer);
            clearInterval(spawner);
        };
    }, [isPlaying, score, onComplete]);

    // Handle catch
    const handleCatch = (id: number, type: 'treat' | 'bomb') => {
        setItems((prev) => prev.filter(item => item.id !== id));
        if (type === 'treat') {
            setScore(s => s + 10);
        } else {
            setScore(s => Math.max(0, s - 20));
        }
    };

    return (
        <div className="relative w-full h-[400px] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-inner mt-6 flex flex-col items-center justify-center p-4">
            
            {/* UI Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between z-10 select-none">
                <div className="bg-black/50 px-4 py-2 rounded-full text-white font-bold backdrop-blur-sm border border-white/10">
                    ⏱️ {timeLeft}s
                </div>
                <div className="bg-black/50 px-4 py-2 rounded-full text-amber-400 font-bold backdrop-blur-sm border border-white/10">
                    ⭐ {score}
                </div>
            </div>

            {/* Game Area */}
            {isPlaying ? (
                <div className="absolute inset-0 overflow-hidden cursor-crosshair">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ top: "-10%", left: \`\${item.x}%\` }}
                                animate={{ top: "110%" }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 3, ease: "linear" }}
                                onAnimationComplete={() => {
                                    setItems(prev => prev.filter(i => i.id !== item.id));
                                }}
                                onClick={() => handleCatch(item.id, item.type)}
                                className="absolute text-4xl hover:scale-125 transition-transform"
                                style={{ left: \`\${item.x}%\` }}
                            >
                                {item.type === 'treat' ? '🍖' : '💣'}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center z-10 flex flex-col items-center">
                    <h3 className="text-2xl font-black text-white mb-2">Catch the Treats!</h3>
                    <p className="text-gray-400 mb-6 max-w-sm">Click the falling food to earn points. Avoid the bombs! High scores yield better rewards.</p>
                    <button 
                        onClick={startGame}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-[0_0_15px_rgba(5,150,105,0.5)]"
                    >
                        ▶️ Play Now
                    </button>
                    {timeLeft === 0 && (
                        <p className="mt-4 font-bold text-amber-400">Final Score: {score}</p>
                    )}
                </div>
            )}
        </div>
    );
}
