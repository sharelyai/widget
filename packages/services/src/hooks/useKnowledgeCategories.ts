import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";

interface UseKnowledgeCategoriesProps {
  enabled?: boolean;
  categoryId?: string;
}

export const useKnowledgeCategories = ({
  enabled = true,
  categoryId = "",
}: UseKnowledgeCategoriesProps = {}) => {
  const { config: storeConfig, userData, token } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const customerRoleId = userData?.metadata?.customerRoleId;
  const workspaceId = storeConfig?.workspaceId;
  const langKnowledge = storeConfig?.langKnowledge;

  const isEnabled = Boolean(workspaceId) && Boolean(token) && Boolean(enabled);

  const response = useQuery({
    queryKey: [
      "treeCategories",
      workspaceId,
      langKnowledge,
      categoryId,
      customerRoleId,
    ],
    queryFn: () => {
      if (!workspaceId) return [];
      return apiClient.knowledge.getCategories(
        workspaceId,
        langKnowledge,
        categoryId,
      );
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    treeCategories: response.data || [],
    isLoading: response.isLoading,
    treeCategoriesRefetch: response.refetch,
    treeCategoriesOptions: response,
  };
};
