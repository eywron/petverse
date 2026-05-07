"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

export default function InteractiveRoom() {
    const { currentPet, currentLocation, studyAtSchool, feedPet, playWithPet } = useGameStore();
    const mapRef = useRef<HTMLDivElement>(null);
    
    // State to track clicks around the 2D room boundaries
    const [petPosition, setPetPosition] = useState({ x: 50, y: 50 });

    if (!currentPet) {
        return (
            <div className="flex items-center justify-center h-80 bg-gray-800 rounded-3xl animate-pulse shadow-inner">
                <p className="text-gray-400">Loading your world...</p>
            </div>
        );
    }

    // Handles 'Point & Click' Movement Logic
    const handleRoomClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mapRef.current) return;
        
        const rect = mapRef.current.getBoundingClientRect();
        // Calculate percentage for responsiveness
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Prevent pet from completely walking out of bounds
        const constrainedX = Math.max(10, Math.min(x, 90));
        const constrainedY = Math.max(20, Math.min(y, 80));

        setPetPosition({ x: constrainedX, y: constrainedY });
    };

    // Styling Themes based on current Location
    const roomThemes: Record<string, { bgClass: string, overlayText: string }> = {
        bedroom: { bgClass: "from-blue-900 to-indigo-900", overlayText: "Welcome Home. Tap anywhere to walk." },
        kitchen: { bgClass: "from-orange-800 to-amber-900", overlayText: "Kitchen: Time for snacks!" },
        bathroom: { bgClass: "from-cyan-900 to-cyan-700", overlayText: "Bathroom: Let's get clean!" },
        park: { bgClass: "from-green-900 to-emerald-800", overlayText: "Park: So much space to run!" },
        school: { bgClass: "from-rose-900 to-red-900", overlayText: "School: Study hard to gain XP!" },
    };

    const currentTheme = roomThemes[currentLocation] || roomThemes.bedroom;

    // Base idle animation variants
    const variants = {
        normal: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 2 } },
        sleepy: { scale: [1, 0.95, 1], transition: { repeat: Infinity, duration: 4 } },
        excited: { y: [0, -20, 0], scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.5 } },
        weak: { opacity: [1, 0.7, 1], transition: { repeat: Infinity, duration: 3 } },
        sick: { x: [-5, 5, -5], transition: { repeat: Infinity, duration: 0.5 } },
    };
    const currentStateAnimation = variants[currentPet.current_state as keyof typeof variants] || variants.normal;

    return (
        <div className="flex flex-col mb-6">
            
            {/* Interactivity Context Menu (Changes per room) */}
            <div className="bg-gray-800/80 rounded-t-2xl p-4 flex justify-between items-center border border-gray-700 border-b-0">
                <span className="font-bold text-gray-300 ml-2">{currentTheme.overlayText}</span>
                <div className="flex gap-2">
                    {currentLocation === 'kitchen' && (
                        <button onClick={() => feedPet(15)} className="bg-emerald-600 px-4 py-1.5 rounded-lg text-white font-bold hover:bg-emerald-500 transition shadow hover:shadow-emerald-500/20">Eat 🍎</button>
                    )}
                    {currentLocation === 'park' && (
                        <button onClick={() => playWithPet(20)} className="bg-sky-600 px-4 py-1.5 rounded-lg text-white font-bold hover:bg-sky-500 transition shadow hover:shadow-sky-500/20">Play 🎾</button>
                    )}
                    {currentLocation === 'school' && (
                        <button onClick={studyAtSchool} className="bg-purple-600 px-4 py-1.5 rounded-lg text-white font-bold hover:bg-purple-500 transition shadow hover:shadow-purple-500/20">Study 📚</button>
                    )}
                    {currentLocation === 'bathroom' && (
                        <button className="bg-cyan-600 px-4 py-1.5 rounded-lg text-white font-bold hover:bg-cyan-500 transition shadow hover:shadow-cyan-500/20">Shower 🧼</button>
                    )}
                    {currentLocation === 'bedroom' && (
                        <button className="bg-amber-600 px-4 py-1.5 rounded-lg text-white font-bold hover:bg-amber-500 transition shadow hover:shadow-amber-500/20">Sleep 💤</button>
                    )}
                </div>
            </div>

            {/* Core 2D Navigable Map */}
            <div 
                ref={mapRef}
                onClick={handleRoomClick}
                className={`relative w-full h-[400px] bg-gradient-to-b ${currentTheme.bgClass} rounded-b-2xl shadow-xl overflow-hidden cursor-crosshair border border-gray-700`}
            >
                {/* Background Decor Layer */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-pattern.svg')] opacity-10 pointer-events-none"></div>
                
                {/* Floor perspective horizon line */}
                <div className="absolute bottom-0 w-full h-1/3 bg-black/20 pointer-events-none border-t border-white/5"></div>

                {/* Movable Pet Entity */}
                <motion.div
                    className="absolute ml-[-4rem] mt-[-4rem] flex flex-col items-center justify-center pointer-events-none drop-shadow-2xl"
                    initial={{ left: "50%", top: "50%" }}
                    animate={{ left: `${petPosition.x}%`, top: `${petPosition.y}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                >
                    {/* Pet Status Label Bubble */}
                    <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md mb-2 font-bold capitalize">
                        {currentPet.name} Lvl {currentPet.level}
                    </div>

                    <motion.div
                        className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/5 shadow-inner"
                        animate={currentStateAnimation}
                    >
                        <div className="text-6xl drop-shadow-lg filter">
                            {currentPet.current_state === 'sleepy' ? '😴' : 
                            currentPet.current_state === 'sick' ? '🤒' : 
                            currentPet.current_state === 'excited' ? '🤩' : 
                            currentPet.current_state === 'weak' ? '🥺' : '🐾'}
                        </div>
                    </motion.div>
                    
                    {/* Shadow underneath pet on map */}
                    <div className="w-16 h-4 bg-black/40 rounded-[100%] mt-2 blur-sm"></div>
                </motion.div>
            </div>
        </div>
    );
}
