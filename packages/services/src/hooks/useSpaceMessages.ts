import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";
import type { Message } from "../types";

interface UseSpaceMessagesProps {
  enabled?: boolean;
  spaceId: string;
  groupId?: string;
  stopInterval?: boolean;
}

export const useSpaceMessages = ({
  enabled = true,
  spaceId,
  groupId,
  stopInterval = false,
}: UseSpaceMessagesProps) => {
  const { config: storeConfig, userData } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const isEnabled = enabled && Boolean(spaceId) && Boolean(groupId);
  const customerRoleId = userData?.metadata?.customerRoleId;
  const langKnowledge = storeConfig?.langKnowledge;

  const queryKey = [
    "spaces-messages",
    spaceId,
    groupId,
    langKnowledge,
    customerRoleId,
  ];

  const { data, refetch, ...options } = useQuery({
    queryKey,
    queryFn: async (options) => {
      const prevData = options.client.getQueryData(queryKey) as
        { messages: Message[] } | undefined;

      if (!groupId) return prevData ?? { messages: [] };

      const response = await apiClient.spaces.getMessages(
        spaceId,
        groupId,
        langKnowledge,
      );

      const prevMessages = prevData?.messages || [];
      const responseMessagesArr = response?.messages || [];

      if (prevMessages?.length < 3 && responseMessagesArr.length < 3) {
        return prevData || { messages: [] }; // Ensure return type match
      }

      // Build a map of response messages by id for quick lookup
      const responseMap = new Map(
        responseMessagesArr.map((msg) => [msg.id, msg]),
      );

      // Create a map to track merged messages by id to avoid duplicates
      const mergedMap = new Map();

      prevMessages.forEach((msg, index) => {
        if (msg?.id && responseMap.has(msg.id)) {
          const responseMessage = responseMap.get(msg.id);
          const isTemp = responseMessage ? undefined : true;
          mergedMap.set(msg.id, {
            ...msg,
            ...(typeof responseMessage === "object" && responseMessage !== null
              ? responseMessage
              : {}),
            temp: isTemp,
          });
        } else if ((msg as any)?.temp && !msg?.id && index > 0) {
          // check if the next message is an ai message
          const beforeMsg = prevMessages[index - 1];
          if (beforeMsg?.type === "AI" && beforeMsg?.id) {
            const indexOfBeforeMsg = responseMessagesArr.findIndex(
              (m) => m.id === beforeMsg.id,
            );
            const messageToMerge = responseMessagesArr[indexOfBeforeMsg + 1];
            if (messageToMerge) {
              mergedMap.set(messageToMerge.id, {
                ...msg,
                ...messageToMerge,
                temp: undefined,
              });
            }
          } else {
            mergedMap.set(msg.id || index, msg); // Use index as fallback key if id missing
          }
        } else {
          mergedMap.set(msg.id, msg);
        }
      });

      return {
        messages:
          mergedMap.size > 0
            ? Array.from(mergedMap.values())
            : responseMessagesArr,
      };
    },
    enabled: isEnabled,
    refetchInterval: stopInterval || !isEnabled ? false : 3000,
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 2, // 2 minutes,
  });

  return {
    messages: data?.messages || [],
    refetchMessages: refetch,
    optionsMessages: options,
  };
};
