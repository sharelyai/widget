import { create } from "zustand";

interface SearchContextState {
  searchText: string;
  setSearchText: (searchText: string) => void;
  isLoadingSearch: boolean;
  setIsLoadingSearch: (isLoadingSearch: boolean) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  responseSearch: any;
  setResponseSearch: (responseSearch: any) => void;
  responseTags: any;
  setResponseTags: (responseTags: any) => void;
  tagsSelected: any[];
  setTagsSelected: (tagsSelected: any[]) => void;
  customModal?: any;
  setCustomModal?: (customModal: any) => void;
}

export const useSearchStorage = create<SearchContextState>((set) => ({
  searchText: "",
  setSearchText: (searchText) => set({ searchText }),
  isLoadingSearch: false,
  setIsLoadingSearch: (isLoadingSearch) => set({ isLoadingSearch }),
  sortBy: "relevance",
  setSortBy: (sortBy) => set({ sortBy }),
  responseSearch: null,
  setResponseSearch: (responseSearch) =>
    typeof responseSearch === "function"
      ? set((prev) => ({
          responseSearch: responseSearch(prev.responseSearch || []),
        }))
      : set({ responseSearch }),
  responseTags: null,
  setResponseTags: (responseTags) => set({ responseTags }),
  tagsSelected: [],
  setTagsSelected: (tagsSelected) => set({ tagsSelected }),
  customModal: null,
  setCustomModal: (customModal) => set({ customModal }),
}));
