"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import PetDisplay from "@/components/game/PetDisplay";
import ActionMenu from "@/components/game/ActionMenu";
import StatsSidebar from "@/components/game/StatsSidebar";

export default function Home() {
  const { setPet } = useGameStore();

  // Mock initial load (normally fetches from Supabase using user auth)
  useEffect(() => {
    setPet({
      id: "123",
      name: "Luna",
      species: "cat",
      hunger: 60,
      energy: 40,
      happiness: 80,
      cleanliness: 90,
      level: 5,
      xp: 450,
      bond_level: 3,
      current_state: "normal",
      last_updated_at: new Date().toISOString()
    });
  }, [setPet]);

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-500">
            🐾 PetVerse
          </h1>
          <div className="flex items-center gap-4 bg-gray-900 rounded-full px-4 py-2 border border-gray-800">
            <span className="text-amber-400 font-bold">💰 1,250</span>
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border-2 border-white/10 text-center text-sm leading-8">
              👤
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 flex flex-col">
            <PetDisplay />
            <ActionMenu />
            
            {/* AI Comm Window Container */}
            <div className="mt-6 bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold text-white text-lg">AI Persona Engine</h3>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 min-h-[100px] flex items-center">
                <p className="text-gray-400 italic">"I'm feeling pretty good today! Do you want to play a game?"</p>
              </div>
              <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Talk to your pet..." 
                  className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500"
                />
                <button className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <StatsSidebar />
          </div>
        </div>
      </div>
    </main>
  );
}
