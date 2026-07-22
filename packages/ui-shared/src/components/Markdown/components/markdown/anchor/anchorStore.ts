import { create } from "zustand";

interface AnchorState {
  isHovered: { [key: string]: boolean };
  currentHref: string;
  knowledgeId: {
    isLoading: boolean;
  };
  setIsHovered: (value: { [key: string]: boolean }) => void;
  setCurrentHref: (value: string) => void;
  setKnowledgeId: (value: { isLoading: boolean }) => void;
}

export const useAnchorStore = create<AnchorState>((set) => ({
  isHovered: undefined,
  currentHref: "",
  knowledgeId: {
    isLoading: false,
  },
  setIsHovered: (value) => set({ isHovered: value }),
  setCurrentHref: (value) => set({ currentHref: value }),
  setKnowledgeId: (value) => set({ knowledgeId: value }),
}));
