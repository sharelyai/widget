import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";
import { tokenManager } from "../auth/tokenManager";
import { SPACE_SOURCE_TYPE_WEB_CONTROL } from "../constants";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const {
    config,
    token,
    setToken,
    setTemporalToken,
    setUserData,
    workspace,
    setCurrentInformation,
  } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  // Token sync logic
  useEffect(() => {
    const initTokens = async () => {
      if (!config?.workspaceId) return;

      // External token was set via embed API — don't overwrite from cookies
      const { externalToken } = useGlobalStore.getState();
      if (externalToken) {
        const decoded = tokenManager.decodeToken(externalToken);
        if (decoded) setUserData(decoded as any);
        return;
      }

      const temporal = tokenManager.getTemporalToken(config.workspaceId);
      if (temporal) {
        setTemporalToken(temporal);
        setToken(temporal);
        const decoded = tokenManager.decodeToken(temporal);
        if (decoded) setUserData(decoded as any);
      }
    };

    initTokens();
  }, [config?.workspaceId]);

  const signOut = async () => {
    queryClient.clear();
    setUserData(undefined);
    tokenManager.removeTokens(config?.workspaceId);

    // Create a new anonymous space after sign out if workspaceId exists
    if (config?.workspaceId) {
      try {
        const createNewSpaceResponse = await apiClient.fetcher<any>(
          `/workspaces/${config.workspaceId}/spaces`,
          {
            method: "POST",
            body: JSON.stringify({
              customSource: SPACE_SOURCE_TYPE_WEB_CONTROL,
            }),
          },
        );

        if (createNewSpaceResponse?.token) {
          tokenManager.setTemporalToken(
            createNewSpaceResponse.token,
            config.workspaceId,
          );
          setTemporalToken(createNewSpaceResponse.token);
          setToken(createNewSpaceResponse.token);

          setCurrentInformation({
            spaceId: createNewSpaceResponse?.id,
            temporalUserId: createNewSpaceResponse?.temporalUserId,
            startMode: workspace?.webControlStartMode || "QUESTIONS",
          });
        }
      } catch (e) {
        console.error("Failed to create new space after sign out", e);
      }
    }
  };

  return {
    token,
    isAuthenticated: !!token,
    signOut,
  };
};
