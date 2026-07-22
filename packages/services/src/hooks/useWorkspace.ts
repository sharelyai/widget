import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";
import { START_MODE_QUESTIONS } from "../constants";

export const useWorkspace = () => {
  const { config: storeConfig, setWorkspace, setCurrentInformation } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const workspaceId = storeConfig?.workspaceId;

  const response = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      if (!workspaceId) throw new Error("You need to configure a workspace id");

      const res = await apiClient.workspaces.getWorkspace(workspaceId);

      setWorkspace(res);
      setCurrentInformation({
        startMode: res?.webControlStartMode || START_MODE_QUESTIONS,
      });
      return res;
    },
    enabled: Boolean(workspaceId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    workspace: response.data,
    isLoading: response.isLoading,
    workspaceRefetch: response.refetch,
    workspaceOptions: response,
  };
};
