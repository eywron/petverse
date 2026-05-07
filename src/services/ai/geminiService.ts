import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pet } from "@/store/gameStore";
import { buildAIPrompt } from "./promptBuilder";

// Initialize Gemini client
// Note: Ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generatePetResponse(pet: Pet, memories: string[], userInput: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = buildAIPrompt(pet, memories, userInput);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "I'm feeling a bit confused right now... *tilts head*";
    }
}
