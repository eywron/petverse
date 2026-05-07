import { create } from 'zustand';

export type PetState = 'normal' | 'sleepy' | 'bored' | 'weak' | 'sick' | 'critical' | 'excited';
export type Location = 'bedroom' | 'kitchen' | 'bathroom' | 'school' | 'park';

export interface Pet {
  id: string;
  name: string;
  hunger: number;
  energy: number;
  happiness: number;
  cleanliness: number;
  level: number;
  xp: number;
  bond_level: number;
  current_state: PetState;
  last_updated_at: string;
}

interface GameState {
  currentPet: Pet | null;
  currentLocation: Location;
  isLoading: boolean;
  setPet: (pet: Pet) => void;
  setLocation: (loc: Location) => void;
  updatePetStats: (updates: Partial<Pet>) => void;
  feedPet: (foodValue: number) => void;
  playWithPet: (happinessValue: number) => void;
  studyAtSchool: () => void;
  completeMinigame: (score: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentPet: null,
  currentLocation: 'bedroom',
  isLoading: true,
  setPet: (pet) => set({ currentPet: pet, isLoading: false }),
  setLocation: (loc) => set({ currentLocation: loc }),
  
  // Optimistic UI updates
  updatePetStats: (updates) => set((state) => {
    if (!state.currentPet) return state;
    return { currentPet: { ...state.currentPet, ...updates } };
  }),

  feedPet: (foodValue) => set((state) => {
    if (!state.currentPet) return state;
    const newHunger = Math.min(100, state.currentPet.hunger + foodValue);
    // TODO: Send to Supabase
    return { currentPet: { ...state.currentPet, hunger: newHunger } };
  }),

  playWithPet: (happinessValue) => set((state) => {
    if (!state.currentPet) return state;
    const newHappiness = Math.min(100, state.currentPet.happiness + happinessValue);
    const newEnergy = Math.max(0, state.currentPet.energy - 10);
    return { currentPet: { ...state.currentPet, happiness: newHappiness, energy: newEnergy } };
  }),

  studyAtSchool: () => set((state) => {
    if (!state.currentPet) return state;
    // Studying costs 20 energy, decreases happiness by 5, but grants 50 XP
    const newEnergy = Math.max(0, state.currentPet.energy - 20);
    const newHappiness = Math.max(0, state.currentPet.happiness - 5);
    const newXp = state.currentPet.xp + 50;
    
    // Level up logic (every 100 XP)
    let newLevel = state.currentPet.level;
    let finalXp = newXp;
    if (newXp >= newLevel * 100) {
      newLevel += 1;
      finalXp = 0; // Reset XP for new level
    }

    return { 
      currentPet: { 
        ...state.currentPet, 
        energy: newEnergy, 
        happiness: newHappiness, 
        xp: finalXp, 
        level: newLevel 
      } 
    };
  }),

  // Add minigame completion handler
  completeMinigame: (score: number) => set((state) => {
    if (!state.currentPet) return state;
    const newHappiness = Math.min(100, state.currentPet.happiness + Math.floor(score / 5));
    const newXp = state.currentPet.xp + score;
    // TODO: Send to Supabase API for validation and Loot drop mapping
    return { currentPet: { ...state.currentPet, happiness: newHappiness, xp: newXp } };
  }),
}));
