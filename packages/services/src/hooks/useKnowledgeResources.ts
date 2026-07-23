import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";

interface UseKnowledgeResourcesProps {
  enabled?: boolean;
  categoryIds: string[];
}

export const useKnowledgeResources = ({
  enabled = true,
  categoryIds = [],
}: UseKnowledgeResourcesProps) => {
  const { config: storeConfig } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const isEnabled =
    Boolean(storeConfig?.workspaceId) &&
    categoryIds?.length > 0 &&
    Boolean(enabled);

  const response = useQuery({
    queryKey: [
      "treeCategoriesknowledge",
      storeConfig?.workspaceId,
      categoryIds,
    ],
    queryFn: () => {
      if (!storeConfig?.workspaceId) return [];
      return apiClient.knowledge.getCategoryResources(
        storeConfig.workspaceId,
        categoryIds,
      );
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    knowledgeResources: response.data || [],
    isLoading: response.isPending,
    refetch: response.refetch,
    options: response,
  };
};
