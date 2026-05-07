import { NextResponse } from "next/server";
// import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const { minigameId, score, petId } = await req.json();
        
        // 1. Authenticate user
        // const supabase = createClient();
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 2. Validate Anti-Cheat
        // Ensure the score is within mathematical bounds for the minigame duration and time since start.
        if (score > 10000) { 
            // Flag account / Reject payload
            return NextResponse.json({ error: "Suspicious activity detected" }, { status: 403 });
        }

        // 3. Process Rewards (Coins, XP, Random Item Drop)
        const baseXP = Math.floor(score / 10);
        const coinsEarned = Math.floor(score / 20);
        
        // TODO: Update Pet XP and User Coins in Supabase transaction
        // TODO: Call LootSystem.rollForLoot() to see if an item drops
        
        // 4. Return secure deterministic payload back to client
        return NextResponse.json({
            success: true,
            rewards: {
                xp: baseXP,
                coins: coinsEarned,
                itemDrop: null // Would be populated by LootSystem
            }
        });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
