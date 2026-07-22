import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";

interface UseGreetingProps {
  enabled?: boolean;
  spaceId: string;
  saveMessage?: boolean;
}

export const useSpaceGreeting = (props: UseGreetingProps) => {
  const { enabled = true, spaceId, saveMessage = false } = props;

  const { config: storeConfig, userData, token } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const isEnabled = enabled && Boolean(spaceId) && Boolean(token);
  const customerRoleId = userData?.metadata?.customerRoleId;
  const langKnowledge = storeConfig?.langKnowledge;

  const spaceGreetingResponse = useQuery({
    queryKey: [
      "spaceGreeting",
      spaceId,
      saveMessage,
      langKnowledge,
      customerRoleId,
    ],
    queryFn: async () => {
      return apiClient.spaces.getGreeting(spaceId, langKnowledge, saveMessage);
    },
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    staleTime: saveMessage ? 0 : 1000 * 60 * 5, // 5 minutes
  });

  return {
    spaceGreeting: spaceGreetingResponse.data?.greeting,
    isSpaceGreetingLoading: spaceGreetingResponse.isLoading,
    spaceGreetingRefetch: spaceGreetingResponse.refetch,
    spaceGreetingOptions: spaceGreetingResponse,
  };
};
