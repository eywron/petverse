"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

export default function PetDisplay() {
    const { currentPet } = useGameStore();

    if (!currentPet) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-800 rounded-2xl animate-pulse">
                <p className="text-gray-400">Loading your pet...</p>
            </div>
        );
    }

    // Animation variants based on pet state
    const variants = {
        normal: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 2 } },
        sleepy: { scale: [1, 0.95, 1], transition: { repeat: Infinity, duration: 4 } },
        excited: { y: [0, -20, 0], scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.5 } },
        weak: { opacity: [1, 0.7, 1], transition: { repeat: Infinity, duration: 3 } },
        sick: { x: [-5, 5, -5], transition: { repeat: Infinity, duration: 0.5 } },
    };

    const currentStateAnimation = variants[currentPet.current_state as keyof typeof variants] || variants.normal;

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-900 to-indigo-900 rounded-3xl shadow-xl relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-pattern.svg')] opacity-10 pointer-events-none"></div>

            {/* Pet Sprite */}
            <motion.div
                className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner"
                animate={currentStateAnimation}
            >
                <div className="text-8xl select-none">
                    {currentPet.current_state === 'sleepy' ? '😴' : 
                     currentPet.current_state === 'sick' ? '🤒' : 
                     currentPet.current_state === 'excited' ? '🤩' : 
                     currentPet.current_state === 'weak' ? '🥺' : '🐾'}
                </div>
            </motion.div>

            {/* Pet Info */}
            <div className="mt-8 text-center z-10">
                <h2 className="text-3xl font-bold text-white capitalize">{currentPet.name}</h2>
                <p className="text-blue-200 mt-2 font-medium">Level {currentPet.level} • {currentPet.species}</p>
                <p className="text-sm mt-1 px-3 py-1 bg-white/20 rounded-full inline-block text-white backdrop-blur-md capitalize">
                    {currentPet.current_state}
                </p>
            </div>
        </div>
    );
}
