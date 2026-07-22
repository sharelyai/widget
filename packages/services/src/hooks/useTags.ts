import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";

export const useTags = (workspaceId?: string) => {
  const { config: storeConfig, token } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const targetWorkspaceId = workspaceId || storeConfig?.workspaceId;
  const isEnabled = Boolean(targetWorkspaceId) && Boolean(token);

  const response = useQuery({
    queryKey: ["tags", targetWorkspaceId],
    queryFn: async () => {
      if (!targetWorkspaceId) return [];
      return apiClient.workspaces.getTags(targetWorkspaceId);
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    tags: response.data || [],
    isLoadingTags: response.isLoading,
    tagsRefetch: response.refetch,
    tagsOptions: response,
  };
};
