import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";
import { regex } from "../utils/regex";
import { getMessageCompletion } from "../utils/getMessageCompletion";
import {
  CONVERSATIONS_TYPE_USER,
  CONVERSATIONS_TYPE_AI,
  SPACE,
} from "../constants";

interface SendMessageProps {
  message: string;
  spaceId: string;
  currentGroupId?: string;
  currentSpace?: any;
  setMessage: (message: string) => void;
  setCurrentGroupId: (id: string) => void;
  setStatusMessage: (status: string) => void;
}

let abortController: AbortController | null = null;

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { config: storeConfig, userData } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const handleGreetingAndGroup = async (props: {
    spaceId: string;
    languageId?: string;
    setStatusMessage: (status: string) => void;
  }) => {
    const { spaceId, languageId, setStatusMessage } = props;
    const responseGreeting = await apiClient.spaces.getGreeting(
      spaceId,
      languageId,
      true,
    );

    if (!responseGreeting?.greeting?.group) {
      setStatusMessage("resolved");
      return null;
    }

    return responseGreeting.greeting.group.id;
  };

  const handleStream = async (
    response: Response,
    signal: AbortSignal,
    queryClient: any,
    queryKey: any,
  ) => {
    let messageString = "";
    let id = "";

    for await (let token of getMessageCompletion(response, signal)) {
      const match = regex.MATCH_TOKEN_PARAMS_MESSAGE.exec(token);
      const hasSharelyTags = regex.SHARELYAI_TAGS.test(token);
      if (match?.[0].includes("id")) {
        try {
          const info = JSON.parse(match[0])?.[0];
          id = info.id;
        } catch {
          // ignore parse error
        }
        if (!hasSharelyTags) continue;
        if (hasSharelyTags) {
          token = token.replace(match[0], "");
        }
      }

      messageString += token;

      queryClient.setQueryData(queryKey, (prev: any) => ({
        messages: [
          {
            id,
            type: CONVERSATIONS_TYPE_AI,
            message: messageString,
            temp: true,
          },
          {
            ...(prev?.messages?.[1] || {}),
          },
          ...(prev?.messages?.slice(2) || []),
        ],
      }));
    }
  };

  const sendMessage = useMutation({
    mutationFn: async ({
      message,
      spaceId,
      currentGroupId,
      currentSpace,
      setMessage,
      setCurrentGroupId,
      setStatusMessage,
    }: SendMessageProps) => {
      if (!message) return;
      const customerRoleId = userData?.metadata?.customerRoleId;
      const langKnowledge = storeConfig?.langKnowledge;

      let currentGroup = currentGroupId;
      let useSpacesMessagesKey = [
        "spaces-messages",
        spaceId,
        currentGroupId,
        langKnowledge,
        customerRoleId,
      ];
      const emptyQuery = [
        "spaces-messages",
        spaceId,
        null,
        langKnowledge,
        customerRoleId,
      ];

      setStatusMessage("message_pending");
      setMessage("");
      await queryClient.cancelQueries({ queryKey: useSpacesMessagesKey });

      if (!currentGroup) {
        const messages = [
          {
            type: CONVERSATIONS_TYPE_USER,
            message,
            temp: true,
          },
          {
            type: CONVERSATIONS_TYPE_AI,
            message: "&nbsp;",
            temp: true,
          },
        ];
        queryClient.setQueryData(emptyQuery, () => ({ messages }));
        const newGroupId = await handleGreetingAndGroup({
          spaceId,
          languageId: langKnowledge,
          setStatusMessage,
        });
        if (!newGroupId) return;
        currentGroup = newGroupId;

        useSpacesMessagesKey = [
          "spaces-messages",
          spaceId,
          currentGroup,
          langKnowledge,
          customerRoleId,
        ];
        queryClient.setQueryData(useSpacesMessagesKey, () => ({ messages }));
        setCurrentGroupId(currentGroup);
      } else {
        queryClient.setQueryData(useSpacesMessagesKey, (prev: any) => ({
          messages: [
            {
              type: CONVERSATIONS_TYPE_USER,
              message,
              temp: true,
            },
            ...(prev?.messages || []),
          ],
        }));
      }

      if (abortController) abortController.abort();
      const controller = new AbortController();
      abortController = controller;
      const signal = controller.signal;

      const response = await apiClient.spaces.sendMessage(
        spaceId,
        message,
        currentGroup,
        langKnowledge,
        signal,
      );

      queryClient.setQueryData(emptyQuery, null);
      queryClient.setQueryData(useSpacesMessagesKey, (prev: any) => ({
        messages: [
          {
            type: CONVERSATIONS_TYPE_AI,
            message: "&nbsp;",
            temp: true,
          },
          ...(prev?.messages || []),
        ],
      }));

      await handleStream(response, signal, queryClient, useSpacesMessagesKey);

      abortController = null;
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!currentGroupId && currentGroup) {
        const countMessages = queryClient.getQueryData<{ messages: any[] }>(
          useSpacesMessagesKey,
        );

        if (countMessages?.messages?.length === 3) {
          try {
            const res = await apiClient.spaces.updateGroup(
              spaceId,
              currentGroup,
            );
            const spacesKey = ["spaces", currentSpace?.id];
            // Also need to handle public-spaces key if applicable, matching original logic
            const spacesData = queryClient.getQueryData(spacesKey);
            const targetKey = spacesData
              ? spacesKey
              : ["public-spaces", currentSpace?.id];

            queryClient.setQueryData(targetKey, (prev: any) => ({
              ...prev,
              spaceGroupConversation: [
                ...(prev?.spaceGroupConversation || []),
                {
                  id: currentGroup,
                  name: res?.groupName || "New Group",
                  hasMoreThanOneMessage: true,
                  type: SPACE,
                },
              ],
            }));
          } catch (error) {
            console.error(error);
          }
        }
      }

      setStatusMessage("resolved");
    },
    onError: (error, _variables) => {
      console.error(error);
    },
  });

  return {
    sendMessageAction: sendMessage.mutateAsync,
  };
};
