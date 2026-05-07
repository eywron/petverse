"use client";

import { useState } from "react";
import { useGameStore, Pet } from "@/store/gameStore";

export default function SocialPanel() {
    const { currentPet } = useGameStore();
    const [friends] = useState([
        { id: "f1", name: "Alex", petName: "Rex", state: "normal", needsHelp: false },
        { id: "f2", name: "Sarah", petName: "Bella", state: "critical", needsHelp: true },
    ]);

    const handleHelpFriend = (friendName: string, petName: string) => {
        alert(`You sent emergency food to ${friendName}'s pet, ${petName}! +50 Coins earned.`);
        // In a real app, this would trigger a Supabase RPC to update the friend's pet and grant rewards
    };

    const handleVisitFriend = (friendName: string) => {
        alert(`Visiting ${friendName}'s room...`);
        // In a real app, this would change the session's 'currentPet' to the friend's pet (read-only mode)
    };

    if (!currentPet) return null;

    return (
        <div className="bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-800">
            <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                <span>🧑‍🤝‍🧑</span> Friends List
            </h3>
            
            <div className="flex flex-col gap-4">
                {friends.map(friend => (
                    <div key={friend.id} className={`p-4 rounded-xl border ${friend.needsHelp ? 'bg-red-900/30 border-red-500/50' : 'bg-gray-800 border-gray-700'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-white">{friend.name}</span>
                            {friend.needsHelp ? (
                                <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full animate-pulse font-bold">EMERGENCY</span>
                            ) : (
                                <span className="text-xs bg-emerald-600/30 text-emerald-400 px-2 py-1 rounded-full font-bold">Online</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3 hover:text-sky-400 transition cursor-pointer" onClick={() => handleVisitFriend(friend.name)}>
                            Pet: <span className="font-medium">{friend.petName}</span> ({friend.state})
                        </p>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleVisitFriend(friend.name)}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold py-2 rounded-lg transition"
                            >
                                Visit
                            </button>
                            {friend.needsHelp && (
                                <button 
                                    onClick={() => handleHelpFriend(friend.name, friend.petName)}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-2 rounded-lg transition shadow-lg shadow-red-500/20"
                                >
                                    Rescue
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 bg-sky-900/30 hover:bg-sky-800/50 text-sky-400 text-sm font-bold py-3 rounded-xl transition border border-sky-900 border-dashed">
                + Add Friend
            </button>
        </div>
    );
}
