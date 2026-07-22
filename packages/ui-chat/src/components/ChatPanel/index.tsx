import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGlobalStore,
  useLanguage,
  useSpaceGreeting,
  useSpaceMessages,
  useSendMessage,
  useMutationQueue,
  constants,
  useSharelyContext,
  classNames,
} from "@sharelyai/widget-services";
import {
  ScrollBar as ScrollArea,
  Loader,
  InputSkeleton,
  useResponsive,
} from "@sharelyai/widget-ui-shared";

import { Wrapper } from "./styles";
import { MessageBubble } from "../MessageBubble";
import { ChatInput } from "../ChatInput";
import { SuggestedQuestions } from "../SuggestedQuestions";
import { useWorkflowProgressStore } from "../../stores/workflowProgressStore";

export interface ChatPanelProps {
  spaceId: string;
  status: string;
  isLoading: boolean;
  setStatus: (status: string) => void;
  className?: string;
  version?: string;
  onVersionClick?: () => void;
}

export const ChatPanel = ({
  spaceId,
  status,
  isLoading,
  setStatus,
  className,
  version,
  onVersionClick,
}: ChatPanelProps) => {
  const [message, setMessage] = useState("");
  const {
    config,
    currentInformation,
    workspace,
    userData,
    setCurrentInformation,
    externalToken,
  } = useGlobalStore();

  const { t } = useLanguage();
  const { messages: messagesData, refetchMessages } = useSpaceMessages({
    spaceId,
    stopInterval: status === "message_pending",
    groupId: currentInformation?.currentGroupId,
  });

  const { sendMessageAction } = useSendMessage();
  const { spaceGreeting } = useSpaceGreeting({ spaceId });
  const { addMutation } = useMutationQueue();
  const { workflowId } = useWorkflowProgressStore();
  const { apiClient } = useSharelyContext();
  const queryClient = useQueryClient();

  const groupId = currentInformation?.currentGroupId;
  const messages = messagesData || [];
  const hasJustGreeting = !groupId && messages.length === 0;
  const hasQuestions =
    (spaceGreeting as any)?.questions?.length > 0 && messages.length === 0;

  const customConfig = workspace?.spaceStyling?.customConfig?.views?.chat;
  const showFirstChatViewInMiddle = Boolean(customConfig) && hasJustGreeting;
  const showPersonIcon = customConfig?.inputChat?.showPersonIcon ?? true;
  const inputPlaceholder = customConfig?.inputChat?.placeholderText
    ? t(customConfig.inputChat.placeholderText)
    : t("IndexSmallChatText");

  useResponsive();

  const handleSendMessage = async (customMessage?: string) => {
    await sendMessageAction({
      message: customMessage || message,
      spaceId,
      currentGroupId: groupId,
      currentSpace: currentInformation?.currentSpaceId,
      setMessage,
      setCurrentGroupId: (id: string) => {
        setCurrentInformation({
          currentGroupId: id,
        });
      },
      setStatusMessage: setStatus,
    });
  };

  const handleThumbService = async (props: {
    thumbType: string;
    spaceConversationId: string;
  }) => {
    try {
      const { thumbType, spaceConversationId } = props;
      const customerRoleId = userData?.metadata?.customerRoleId;
      const langKnowledge = config?.langKnowledge;

      const queryKey = [
        "spaces-messages",
        spaceId,
        groupId,
        langKnowledge,
        customerRoleId,
      ];

      setStatus("message_pending");

      queryClient.setQueryData(queryKey, (prevValues: any) => {
        return {
          messages: prevValues?.messages?.map((msg: any) => {
            if (msg?.id === spaceConversationId) {
              const userThumbIndex = msg?.thumbSignals?.findIndex(
                (thumb: any) =>
                  thumb?.user?.id === userData?.id ||
                  thumb?.temporalUserId === (userData as any)?.sub,
              );

              if (
                userThumbIndex !== undefined &&
                userThumbIndex > -1 &&
                msg?.thumbSignals?.[userThumbIndex]?.thumbType === thumbType
              ) {
                return {
                  ...msg,
                  thumbSignals: msg?.thumbSignals?.filter(
                    (_: any, idx: number) => idx !== userThumbIndex,
                  ),
                };
              }

              let newThumbSignals;
              if (userThumbIndex !== undefined && userThumbIndex > -1) {
                newThumbSignals = msg?.thumbSignals?.map(
                  (thumb: any, idx: number) => {
                    if (idx === userThumbIndex) {
                      return { ...thumb, thumbType };
                    }
                    return thumb;
                  },
                );
              } else {
                newThumbSignals = [
                  ...(msg?.thumbSignals || []),
                  { thumbType, user: { id: userData?.id } },
                ];
              }

              return { ...msg, thumbSignals: newThumbSignals };
            }
            return msg;
          }),
        };
      });

      await apiClient.fetcher(`/spaces/${spaceId}/thumb-signal`, {
        method: "POST",
        body: JSON.stringify({
          spaceConversationId,
          thumbType,
          groupId,
        }),
      });

      setStatus("resolved");
    } catch (error) {
      console.error("Error on handleThumbService", error);
    }
  };

  const handleSendFeedback = async (props: {
    messageId: string;
    feedback: string;
  }) => {
    try {
      const { messageId, feedback } = props;
      const customerRoleId = userData?.metadata?.customerRoleId;
      const langKnowledge = config?.langKnowledge;

      const queryKey = [
        "spaces-messages",
        spaceId,
        groupId,
        langKnowledge,
        customerRoleId,
      ];

      addMutation(async () => {
        const getMessage = await refetchMessages();
        const getMessageData = (getMessage?.data as any)?.messages?.find(
          (m: any) => m?.id === messageId,
        );
        const getLastSignalId =
          getMessageData?.thumbSignals?.[
            getMessageData?.thumbSignals?.length - 1
          ]?.id;

        if (!getLastSignalId) return;

        await apiClient.fetcher(
          `/spaces/${spaceId}/thumb-signal/${getLastSignalId}/feedback`,
          {
            method: "POST",
            body: JSON.stringify({
              feedback,
              spaceConversationId: messageId,
              groupId,
            }),
          },
        );

        queryClient.setQueryData(queryKey, (prevValues: any) => {
          return {
            messages: prevValues?.messages?.map((msg: any) => {
              if (msg?.id === messageId) {
                return {
                  ...msg,
                  thumbSignals: msg?.thumbSignals?.map((thumb: any) => {
                    if (thumb?.id === getLastSignalId) {
                      return { ...thumb, feedback };
                    }
                    return thumb;
                  }),
                };
              }
              return msg;
            }),
          };
        });
      });
    } catch (error) {
      console.error("Error on handleSendFeedback", error);
    }
  };

  const renderInputSection = () => {
    if (isLoading) {
      return <InputSkeleton height={60} />;
    }
    return (
      <div className="sharelyai-webcontroller-container-input">
        {hasQuestions && (
          <div className="sharelyai-webcontroller-content-message-questions">
            {((spaceGreeting as any)?.questions || [])?.map(
              (question: { id: string; content: string }) => (
                <button
                  key={question?.id}
                  className="sharelyai-webcontroller-content-message-question"
                  onClick={() => {
                    setMessage(question.content);
                    handleSendMessage(question.content);
                  }}
                >
                  {question.content}
                </button>
              ),
            )}
          </div>
        )}
        <ChatInput
          message={message}
          onChange={setMessage}
          onSend={handleSendMessage}
          isLoading={status === "message_pending"}
          placeholder={inputPlaceholder}
          showPersonIcon={showPersonIcon}
        />
      </div>
    );
  };

  return (
    <Wrapper className={classNames("sharely-chat-panel", className)}>
      <ScrollArea
        className="scrollbar-container"
        scrollBottom={true}
        disableComponent={config?.mode === constants.POSITION_PLACED_INLINE}
      >
        <div className="sharelyai-webcontroller-content-chat">
          {(status === "message_pending" && !workflowId) || isLoading ? (
            <Loader text={t("LoaderText")} imageAi={workspace?.photo ?? ""} />
          ) : null}
          {!isLoading &&
            !hasJustGreeting &&
            messages.map((msg: any, index: number) => {
              if (
                messages.length > 1 &&
                msg?.type === constants.CONVERSATIONS_TYPE_AI &&
                index === messages.length - 1
              ) {
                return null;
              }

              const userName =
                msg?.user?.id === userData?.id ? "You" : msg?.user?.name;
              const userPhoto = userData?.photo || msg?.user?.photo;

              const thumbsSignals = msg?.thumbSignals?.filter((item: any) => {
                return (
                  item?.user?.id === userData?.id ||
                  (userData as any)?.sub ||
                  item?.temporalUserId
                );
              });
              const thumbsData =
                thumbsSignals?.[thumbsSignals?.length - 1] || {};
              const workflowProgressData =
                index + 1 < messages.length
                  ? (messages[index + 1] as any)?.workflowProgresses
                  : null;

              return (
                <MessageBubble
                  key={msg.id}
                  workflowProgressProps={{
                    groupId: groupId!,
                    workspaceId: workspace?.id || "",
                    messageFrom: constants.WORKFLOW_MESSAGE_FROM_TYPE_SPACE,
                    data: workflowProgressData,
                  }}
                  messageId={msg.id}
                  sourcesMetadata={msg.sourcesMetadata}
                  type={msg.type}
                  message={msg.message}
                  imageAI={workspace?.photo ?? ""}
                  name={
                    workspace?.defaultSpaceName || workspace?.name || "AI Bot"
                  }
                  user={{
                    id: msg.user?.id,
                    name: externalToken ? undefined : userName,
                    photo: userPhoto,
                  }}
                  userName={
                    externalToken
                      ? undefined
                      : msg.space?.spaceTemporalUser?.[0]?.email
                  }
                  threadUsers={msg.threads || []}
                  thumbType={thumbsData.thumbType}
                  feedback={thumbsData.feedback}
                  showThumbUpIcon={true}
                  handleThumbUp={() => {
                    handleThumbService({
                      thumbType: constants.THUMB_UP,
                      spaceConversationId: msg.id,
                    });
                  }}
                  handleThumbDown={() => {
                    handleThumbService({
                      thumbType: constants.THUMB_DOWN,
                      spaceConversationId: msg.id,
                    });
                  }}
                  handleSendFeedback={handleSendFeedback}
                  showSourcesButton={customConfig?.message?.showSourcesButton}
                />
              );
            })}
          {!isLoading && hasJustGreeting && (
            <SuggestedQuestions
              imageAI={workspace?.photo ?? ""}
              greeting={(spaceGreeting as any)?.content}
              version={version}
              onVersionClick={onVersionClick}
              renderInputSection={
                showFirstChatViewInMiddle ? renderInputSection : undefined
              }
            />
          )}
        </div>
      </ScrollArea>
      {!showFirstChatViewInMiddle && renderInputSection()}
    </Wrapper>
  );
};
