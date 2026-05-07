"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import StatsSidebar from "@/components/game/StatsSidebar";
import CatchGame from "@/components/minigames/CatchGame";
import AIChat from "@/components/game/AIChat";
import WorldNavigation from "@/components/game/WorldNavigation";
import InteractiveRoom from "@/components/game/InteractiveRoom";
import SocialPanel from "@/components/social/SocialPanel";

export default function Home() {
  const { setPet, completeMinigame } = useGameStore();
  const [activeTab, setActiveTab] = useState<'hub' | 'minigames'>('hub');

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
          
          <div className="flex bg-gray-900 rounded-full p-1 border border-gray-800 mr-auto ml-8">
            <button 
              onClick={() => setActiveTab('hub')}
              className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${activeTab === 'hub' ? 'bg-sky-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              🏠 Hub
            </button>
            <button 
              onClick={() => setActiveTab('minigames')}
              className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${activeTab === 'minigames' ? 'bg-sky-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              🎮 Games
            </button>
          </div>

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
            <WorldNavigation />
            
            {activeTab === 'hub' ? (
              <>
                <InteractiveRoom />
                <AIChat />
              </>
            ) : (
              <CatchGame onComplete={(score) => {
                completeMinigame(score);
                // Optionally show a toast here
              }} />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <StatsSidebar />
            <SocialPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
