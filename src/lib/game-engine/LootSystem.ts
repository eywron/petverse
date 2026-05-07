import { z } from "zod";

// Shared loot table logic executed strictly on the server
export const LootTableSchema = z.array(z.object({
    itemId: z.string(),
    weight: z.number(),      // Probability weighting
    rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']),
    dropChance: z.number()  // Percentage 0-100
}));

export type LootTable = z.infer<typeof LootTableSchema>;

export class DropSystem {
    /**
     * Executes a randomized roll to determine if a user gets loot.
     * Incorporates Player/Pet Luck and active World Event Multipliers.
     */
    static rollForLoot(
        table: LootTable, 
        baseDropChance: number, 
        petLuckSkill: number = 1, 
        worldEventMultiplier: number = 1.0
    ) {
        // 1. Determine if a drop occurs at all
        const adjustedChance = baseDropChance + (petLuckSkill * 0.5); 
        const finalChance = adjustedChance * worldEventMultiplier;

        if (Math.random() * 100 > finalChance) {
            return null; // No drop
        }

        // 2. Select specific item based on weighted probability
        const totalWeight = table.reduce((acc, item) => acc + item.weight, 0);
        let randomWeight = Math.random() * totalWeight;

        for (const item of table) {
            randomWeight -= item.weight;
            if (randomWeight <= 0) {
                return item; // Selected item
            }
        }
        return null;
    }
}
