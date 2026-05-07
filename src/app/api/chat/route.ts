import { NextResponse } from "next/server";
import { generatePetResponse } from "@/services/ai/geminiService";

export async function POST(req: Request) {
    try {
        const { pet, memories, userInput } = await req.json();

        if (!pet || !userInput) {
            return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
        }

        // Call the secure server-side Gemini generation service
        const responseText = await generatePetResponse(pet, memories || [], userInput);

        return NextResponse.json({ success: true, text: responseText });
    } catch (error) {
        console.error("AI Chat Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
