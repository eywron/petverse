"use client";

import { useGameStore, Location } from "@/store/gameStore";

export default function WorldNavigation() {
    const { currentLocation, setLocation } = useGameStore();

    const destinations: { id: Location; label: string; icon: string }[] = [
        { id: "bedroom", label: "Bedroom", icon: "🛏️" },
        { id: "kitchen", label: "Kitchen", icon: "🍳" },
        { id: "bathroom", label: "Bathroom", icon: "🛁" },
        { id: "park", label: "Park", icon: "🌳" },
        { id: "school", label: "School", icon: "🏫" },
    ];

    return (
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 mb-6 shadow-lg flex gap-2 overflow-x-auto scroolbar-hide">
            <div className="flex items-center text-gray-400 font-bold mr-2 whitespace-nowrap">
                🗺️ Map:
            </div>
            {destinations.map((dest) => (
                <button
                    key={dest.id}
                    onClick={() => setLocation(dest.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap shadow-sm hover:scale-105 active:scale-95 ${
                        currentLocation === dest.id
                            ? "bg-sky-600 text-white shadow-sky-500/20"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                >
                    <span>{dest.icon}</span> {dest.label}
                </button>
            ))}
        </div>
    );
}
