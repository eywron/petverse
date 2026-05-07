"use client";

import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

type Message = {
    role: "user" | "pet";
    text: string;
};

export default function AIChat() {
    const { currentPet } = useGameStore();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "pet", text: "I'm feeling pretty good today! Do you want to play a game?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !currentPet) return;

        const userText = input;
        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: userText }]);
        setIsLoading(true);

        try {
            // Ping the Next.js API route to securely contact Gemini
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pet: currentPet,
                    memories: [], // In full version, fetch real memories from Supabase
                    userInput: userText
                })
            });

            if (!res.ok) throw new Error("Failed to fetch AI response");

            const data = await res.json();
            setMessages((prev) => [...prev, { role: "pet", text: data.text }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [...prev, { role: "pet", text: "*Confused noises* Connection error..." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentPet) return null;

    return (
        <div className="mt-6 bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-4">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold text-white text-lg">AI Persona Engine</h3>
                <span className="ml-auto text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">GEMINI FLASH</span>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 h-64 overflow-y-auto flex flex-col gap-3 mb-4 shadow-inner">
                {messages.map((msg, idx) => (
                    <div 
                        key={idx} 
                        className={`p-3 rounded-2xl max-w-[85%] ${
                            msg.role === 'user' 
                            ? 'bg-sky-600 text-white self-end rounded-br-sm' 
                            : 'bg-gray-700 text-gray-200 self-start rounded-bl-sm'
                        }`}
                    >
                        {msg.role === 'pet' && <span className="font-bold text-sky-400 capitalize mr-2">{currentPet.name}:</span>}
                        {msg.text}
                    </div>
                ))}
                {isLoading && (
                    <div className="bg-gray-700 text-gray-400 self-start p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={`Talk to ${currentPet.name}...`}
                    className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    disabled={isLoading}
                />
                <button 
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-sky-500/20"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
