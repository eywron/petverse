"use client";

import { useGameStore } from "@/store/gameStore";

export default function ActionMenu() {
    const { currentPet, feedPet, playWithPet } = useGameStore();

    if (!currentPet) return null;

    return (
        <div className="grid grid-cols-2 gap-4 sm:flex sm:justify-center p-6 bg-gray-900/50 rounded-2xl backdrop-blur-sm mt-6">
            <button 
                onClick={() => feedPet(20)}
                className="flex flex-col items-center p-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1"
            >
                <span className="text-2xl mb-2">🍎</span>
                <span className="font-bold text-white">Feed</span>
            </button>
            
            <button 
                onClick={() => playWithPet(20)}
                className="flex flex-col items-center p-4 bg-sky-600 hover:bg-sky-500 rounded-xl transition-all shadow-lg hover:shadow-sky-500/20 hover:-translate-y-1"
            >
                <span className="text-2xl mb-2">🎾</span>
                <span className="font-bold text-white">Play</span>
            </button>

            <button 
                className="flex flex-col items-center p-4 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1"
            >
                <span className="text-2xl mb-2">🧼</span>
                <span className="font-bold text-white">Clean</span>
            </button>

            <button 
                className="flex flex-col items-center p-4 bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 hover:-translate-y-1"
            >
                <span className="text-2xl mb-2">💤</span>
                <span className="font-bold text-white">Sleep</span>
            </button>
        </div>
    );
}
