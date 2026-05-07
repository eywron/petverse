"use client";

import { useGameStore } from "@/store/gameStore";

function StatBar({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="mb-4">
            <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-bold text-white">{value}%</span>
            </div>
            <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden shadow-inner">
                <div 
                    className={`h-full ${color} transition-all duration-500 ease-out`} 
                    style={{ width: \`\${value}%\` }}
                ></div>
            </div>
        </div>
    );
}

export default function StatsSidebar() {
    const { currentPet } = useGameStore();

    if (!currentPet) return null;

    return (
        <div className="bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-800 h-full">
            <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Vitals
            </h3>
            
            <StatBar label="Hunger" value={currentPet.hunger} color={currentPet.hunger > 30 ? "bg-emerald-500" : "bg-red-500"} />
            <StatBar label="Energy" value={currentPet.energy} color={currentPet.energy > 30 ? "bg-sky-500" : "bg-red-500"} />
            <StatBar label="Happiness" value={currentPet.happiness} color={currentPet.happiness > 30 ? "bg-pink-500" : "bg-red-500"} />
            <StatBar label="Cleanliness" value={currentPet.cleanliness} color={currentPet.cleanliness > 30 ? "bg-purple-500" : "bg-red-500"} />

            <div className="mt-8 pt-6 border-t border-gray-800">
                <h3 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
                    <span>❤️</span> Bond
                </h3>
                <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-xl">
                    <div className="w-12 h-12 bg-pink-500/20 text-pink-500 rounded-full flex items-center justify-center text-xl font-black">
                        {currentPet.bond_level}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Bond Level</p>
                        <p className="text-white text-sm font-medium">Keep caring to level up!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
