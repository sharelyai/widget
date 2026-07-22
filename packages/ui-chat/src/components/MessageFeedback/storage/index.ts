import { create } from "zustand";

interface FeedbackBoxState {
  shownMessageId: string | null;
  showFeedbackBox: boolean;
  showThanksBox: boolean;
  savedAt: number;
  setFeedbackBox: (messageId: string | null, show: boolean) => void;
  setThanksBox: (show: boolean) => void;
}

export const useFeedbackBoxStore = create<FeedbackBoxState>((set) => ({
  shownMessageId: null,
  showFeedbackBox: false,
  showThanksBox: false,
  savedAt: Date.now(),
  setFeedbackBox: (messageId, show) => {
    set({
      shownMessageId: show ? messageId : null,
      showFeedbackBox: show,
      showThanksBox: false,
      savedAt: Date.now(),
    });
  },
  setThanksBox: (show) =>
    set((state) => ({
      showThanksBox: show,
      showFeedbackBox: show ? false : state.showFeedbackBox,
      savedAt: Date.now(),
    })),
}));
