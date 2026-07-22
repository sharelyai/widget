import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createApiClient, type ApiClient } from "./api/client";
import { useGlobalStore } from "./stores/globalStore";
import type { SharelyConfig } from "./types";

interface SharelyContextValue {
  apiClient: ApiClient;
  config: SharelyConfig;
}

const SharelyContext = createContext<SharelyContextValue | null>(null);

const queryClient = new QueryClient();

interface SharelyProviderProps {
  config?: Partial<SharelyConfig>;
  children: ReactNode;
}

export function SharelyProvider({
  config: propConfig,
  children,
}: SharelyProviderProps) {
  const storeConfig = useGlobalStore((s) => s.config);
  const setConfig = useGlobalStore((s) => s.setConfig);

  // Merge prop config onto store defaults
  const mergedConfig = useMemo<SharelyConfig>(
    () => ({
      ...storeConfig,
      ...propConfig,
    }),
    [storeConfig, propConfig],
  );

  // Sync merged config back to the store
  useEffect(() => {
    if (propConfig) {
      setConfig(mergedConfig);
    }
  }, [propConfig]);

  const value = useMemo(() => {
    const apiClient = createApiClient({
      baseUrl: mergedConfig.baseUrl || "https://api.sharely.ai",
      getToken: () => {
        const state = useGlobalStore.getState();
        return state.externalToken ?? state.token ?? null;
      },
      onError: (error) => {
        if (error.status === 401 || error.status === 403) {
          useGlobalStore.getState().setSessionInvalid(true);
        }
        mergedConfig.onError?.(error);
      },
    });

    return {
      apiClient,
      config: mergedConfig,
    };
  }, [mergedConfig]);

  return (
    <QueryClientProvider client={queryClient}>
      <SharelyContext.Provider value={value}>
        {children}
      </SharelyContext.Provider>
    </QueryClientProvider>
  );
}

export function useSharelyContext() {
  const context = useContext(SharelyContext);
  if (!context) {
    throw new Error("useSharelyContext must be used within SharelyProvider");
  }
  return context;
}
