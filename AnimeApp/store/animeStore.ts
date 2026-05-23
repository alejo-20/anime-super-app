import { create } from 'zustand';

type Character = {
  id: number;
  name: string;
  age: string;
  power: string;
  images?: string[];
  images_count?: number;
};

type AnimeStore = {
  // Último personaje consultado por categoría
  lastCharacters: Record<string, Character | null>;
  setLastCharacter: (category: string, character: Character) => void;
  clearAll: () => void;
};

export const useAnimeStore = create<AnimeStore>((set) => ({
  lastCharacters: {
    saintseiya: null,
    hunterxhunter: null,
    onepiece: null,
    naruto: null,
  },
  setLastCharacter: (category, character) =>
    set((state) => ({
      lastCharacters: { ...state.lastCharacters, [category]: character },
    })),
  clearAll: () =>
    set({
      lastCharacters: {
        saintseiya: null,
        hunterxhunter: null,
        onepiece: null,
        naruto: null,
      },
    }),
}));