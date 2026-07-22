import { create } from "zustand";

interface BrowseContextState {
  treeCategoriesLevelData?: any;
  setTreeCategoriesLevelData?: (treeCategoriesLevel: any) => void;
  breadcrumb?: any[];
  setBreadcrumb?: (breadcrumb: any[]) => void;
  customModal?: any;
  setCustomModal?: (customModal: any) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
}

export const useBrowseStorage = create<BrowseContextState>((set) => ({
  treeCategoriesLevelData: null,
  setTreeCategoriesLevelData: (treeCategoriesLevelData) =>
    set({ treeCategoriesLevelData }),
  breadcrumb: [],
  setBreadcrumb: (breadcrumb) => set({ breadcrumb }),
  sortBy: "title-asc",
  setSortBy: (sortBy) => set({ sortBy }),
  customModal: null,
  setCustomModal: (customModal) => set({ customModal }),
}));
