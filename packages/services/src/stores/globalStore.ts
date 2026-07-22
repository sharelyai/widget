import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SharelyConfig, Workspace } from "../types";
import {
  CHAT_VIEW,
  CHAT_STEP,
  POSITION_TOP_CENTER_FLOATING,
  AVATAR_MODE_EXPANDED,
  DISPLAY_MODE,
} from "../constants";

export interface GlobalState {
  // Config
  config: SharelyConfig;
  setConfig: (config: SharelyConfig) => void;

  // Auth
  token: string | undefined;
  loginToken: string | undefined;
  temporalToken: string | undefined;
  externalToken: string | undefined;
  setToken: (token: string | undefined) => void;
  setLoginToken: (token: string | undefined) => void;
  setTemporalToken: (token: string | undefined) => void;
  setExternalToken: (token: string | undefined) => void;

  sessionInvalid: boolean;
  setSessionInvalid: (value: boolean) => void;

  // User
  userData: any;
  setUserData: (user: any) => void;

  // Context
  currentInformation: any;
  setCurrentInformation: (info: any) => void;

  currentView: string;
  stepActive: string;
  prevStepActive: string[];
  setCurrentView: (view: string) => void;
  setStepActive: (step: string) => void;
  setPrevStepActive: (step: string) => void;

  // Workspace
  workspace: Workspace | undefined;
  setWorkspace: (workspace: Workspace | undefined) => void;

  // Reset
  reset: () => void;
}

const defaultConfig: SharelyConfig = {
  baseUrl: "https://api.sharely.ai",
  saveSpaceNumMgs: 0,
  mode: POSITION_TOP_CENTER_FLOATING,
  avatarmodeDesktop: AVATAR_MODE_EXPANDED,
  avatarmodeMobile: AVATAR_MODE_EXPANDED,
  displayMode: {
    OPEN_BY_DEFAULT: false,
    MODE: DISPLAY_MODE.MODE.PUBLIC,
    Z_INDEX: "9999",
    VIEWS: {
      CHAT: { SHOW: true },
      SEARCH: {
        SHOW: false,
        SHOW_TAGS: false,
      },
      BROWSE: { SHOW: false },
      AGENT: { SHOW: false },
    },
  },
};

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      config: { ...defaultConfig },
      setConfig: (config) => set({ config }),

      token: undefined,
      loginToken: undefined,
      temporalToken: undefined,
      externalToken: undefined,
      setToken: (token) => set({ token }),
      setLoginToken: (loginToken) =>
        set({ loginToken, externalToken: loginToken, token: loginToken }),
      setTemporalToken: (temporalToken) => set({ temporalToken }),
      setExternalToken: (externalToken) => set({ externalToken }),

      sessionInvalid: false,
      setSessionInvalid: (sessionInvalid) => set({ sessionInvalid }),

      userData: undefined,
      setUserData: (userData) => set({ userData }),

      currentInformation: undefined,
      setCurrentInformation: (currentInformation) =>
        set({
          currentInformation: {
            ...get().currentInformation,
            ...currentInformation,
          },
        }),

      currentView: CHAT_VIEW,
      setCurrentView: (currentView) => set({ currentView }),

      stepActive: CHAT_STEP,
      setStepActive: (stepActive) =>
        set({
          stepActive,
          prevStepActive: [...get().prevStepActive, stepActive],
        }),

      prevStepActive: [],
      setPrevStepActive: (step) =>
        set((state) => ({ prevStepActive: [...state.prevStepActive, step] })),

      workspace: undefined,
      setWorkspace: (workspace) => set({ workspace }),

      reset: () =>
        set({
          token: undefined,
          loginToken: undefined,
          temporalToken: undefined,
          userData: undefined,
          currentInformation: undefined,
          prevStepActive: [],
          sessionInvalid: false,
        }),
    }),
    {
      name: "sharely-global",
      partialize: (state) => ({
        token: state.token,
        loginToken: state.loginToken,
        temporalToken: state.temporalToken,
      }),
    },
  ),
);
