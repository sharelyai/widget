import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";

interface UseWorkflowsProps {
  workspaceId: string;
  enabled?: boolean;
}

export const useWorkflows = (props: UseWorkflowsProps) => {
  const { enabled = true, workspaceId } = props;
  const isEnabled = enabled && Boolean(workspaceId);

  const { userData } = useGlobalStore();
  const { apiClient } = useSharelyContext();
  const customerRoleId = userData?.metadata?.customerRoleId;

  const { data, refetch, ...options } = useQuery({
    queryKey: ["workflows", workspaceId, customerRoleId],
    queryFn: () => {
      return apiClient.workspaces.getWorkflows(workspaceId);
    },
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    workflows: data || [],
    refetchWorkflows: refetch,
    optionsWorkflows: options,
  };
};
