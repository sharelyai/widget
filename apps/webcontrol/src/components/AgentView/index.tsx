import { useEffect, useRef, useState } from "react";

import { Wrapper, StreamingMessageWrapper, GreetingWrapper } from "./styles";
import { ChatHistory } from "../ChatHistory";
import {
  useSharelyChat,
  useGlobalStore,
  useLanguage,
  constants,
  classNames,
  agentMessageToBodyMessage,
} from "@sharelyai/widget-services";
import type {
  ThinkingStep,
  ToolCall,
  Source,
} from "@sharelyai/widget-services";
import {
  ScrollBar,
  Person,
  ArrowUpward,
  Logo,
} from "@sharelyai/widget-ui-shared";
import { MessageBubble } from "@sharelyai/widget-ui-chat";
import {
  ThinkingIndicator,
  SourcesList,
  AllSourcesModal,
  AgentMessageContent,
} from "@sharelyai/widget-ui-agent-chat";

interface AgentViewProps {
  spaceId: string;
  showChatHistory?: boolean;
  onCloseChatHistory?: () => void;
  onCreateNewChat?: () => void;
  version?: string;
  onVersionClick?: () => void;
}

// Inline streaming message component
function StreamingMessage({
  content,
  thinkingSteps,
  activeToolCalls,
  activeSources = [],
  imageAI,
  name,
  onShowAllSources,
}: {
  content: string;
  thinkingSteps: ThinkingStep[];
  activeToolCalls: ToolCall[];
  activeSources?: Source[];
  imageAI?: string;
  name?: string;
  onShowAllSources?: (sources: Source[]) => void;
}) {
  const hasContent = content.length > 0;
  const hasThinking = thinkingSteps.length > 0;
  const hasToolCalls = activeToolCalls.length > 0;
  const hasSources = activeSources.length > 0;
  const isPending = !hasContent && !hasThinking && !hasToolCalls;

  return (
    <StreamingMessageWrapper>
      <div className="sharelyai-webcontroller-content-message-image-ai">
        {imageAI ? <img src={imageAI} alt="logo" /> : <Logo />}
      </div>
      <div className="sharelyai-webcontroller-streaming-content">
        <p className="sharelyai-webcontroller-content-message-name">
          {name || "AI Bot"}
        </p>

        {isPending && (
          <div className="sharelyai-webcontroller-streaming-pending">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}

        {(hasThinking || hasToolCalls) && (
          <div className="sharelyai-webcontroller-streaming-thinking">
            <ThinkingIndicator
              steps={thinkingSteps}
              toolCalls={activeToolCalls}
            />
          </div>
        )}

        {hasContent && (
          <div className="sharelyai-webcontroller-streaming-text">
            <AgentMessageContent content={content} sources={activeSources} />
            <span className="sharelyai-webcontroller-streaming-cursor" />
          </div>
        )}

        {hasSources && (
          <div className="sharelyai-webcontroller-streaming-sources">
            <SourcesList
              sources={activeSources}
              defaultCollapsed={false}
              onShowAllSources={onShowAllSources}
            />
          </div>
        )}
      </div>
    </StreamingMessageWrapper>
  );
}

export const AgentView = ({
  spaceId,
  showChatHistory = false,
  onCloseChatHistory,
  onCreateNewChat,
  version,
  onVersionClick,
}: AgentViewProps) => {
  const [message, setMessage] = useState("");
  const [allSourcesData, setAllSourcesData] = useState<Source[] | null>(null);

  const {
    config,
    workspace,
    currentInformation,
    setCurrentInformation,
    userData,
  } = useGlobalStore();
  const customerRoleId = userData?.metadata?.customerRoleId;
  const { t } = useLanguage();

  const agentChat = useSharelyChat({
    spaceId,
    initialThreadId: currentInformation?.agentThreadId,
  });

  // Track previous thread ID to detect changes
  const prevThreadIdRef = useRef<string | undefined>(
    currentInformation?.agentThreadId,
  );

  // Load thread when agentThreadId changes (e.g., from chat history selection)
  // Reset chat when agentThreadId is cleared (e.g., header "New chat" button)
  useEffect(() => {
    const currentThreadId = currentInformation?.agentThreadId;

    if (currentThreadId && currentThreadId !== prevThreadIdRef.current) {
      agentChat.loadThread(currentThreadId);
    } else if (!currentThreadId && prevThreadIdRef.current) {
      // Thread ID was cleared — reset to fresh state without API call
      agentChat.resetChat();
    }

    prevThreadIdRef.current = currentThreadId;
  }, [currentInformation?.agentThreadId]);

  const prevRoleIdRef = useRef(customerRoleId);
  useEffect(() => {
    if (prevRoleIdRef.current !== customerRoleId) {
      prevRoleIdRef.current = customerRoleId;
      if (currentInformation?.agentThreadId) {
        setCurrentInformation({
          agentThreadId: undefined,
          agentThreadName: undefined,
        });
      }
    }
  }, [
    customerRoleId,
    currentInformation?.agentThreadId,
    setCurrentInformation,
  ]);

  const customConfig = workspace?.spaceStyling?.customConfig?.views?.chat;
  const hasCustomConfig = Boolean(customConfig);
  const showPersonIcon = hasCustomConfig
    ? customConfig?.inputChat?.showPersonIcon
    : true;
  const inputPlaceholder = hasCustomConfig
    ? t(customConfig?.inputChat?.placeholderText) || t("IndexSmallChatText")
    : t("IndexSmallChatText");

  // Convert agent messages for display
  const convertedMessages = agentChat.messages.map(agentMessageToBodyMessage);
  // Reverse for column-reverse display
  const messages = [...convertedMessages].reverse();
  const hasMessages = messages.length > 0 || agentChat.isStreaming;
  const hasJustGreeting =
    !agentChat.threadId && messages.length === 0 && !agentChat.isStreaming;

  const handleChangeMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter") return;
    sendMessage();
  };

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || message;
    if (!messageToSend.trim() || agentChat.isStreaming) return;

    setMessage("");
    const newThreadId = await agentChat.sendMessage(messageToSend);

    // Update thread ID if a new thread was created
    if (newThreadId && newThreadId !== currentInformation?.agentThreadId) {
      setCurrentInformation({
        agentThreadId: newThreadId,
      });
    }
  };

  const handleCreateNewChat = () => {
    onCloseChatHistory?.();
    setCurrentInformation({
      agentThreadId: undefined,
      agentThreadName: undefined,
    });
    // Reset the agent chat state
    agentChat.createThread();
    onCreateNewChat?.();
  };

  const renderInputSection = () => {
    return (
      <div className="sharelyai-webcontroller-container-input">
        <div className="sharelyai-webcontroller-content-input-container">
          <div
            className={classNames("sharelyai-webcontroller-content-input", {
              "sharelyai-webcontroller-disabled": agentChat.isStreaming,
              "sharelyai-webcontroller-icon-disabled": !message,
            })}
          >
            {showPersonIcon ? (
              <div className="sharelyai-webcontroller-image-user">
                <Person />
              </div>
            ) : (
              <span />
            )}
            <input
              placeholder={inputPlaceholder}
              value={message}
              onChange={handleChangeMessage}
              onKeyDown={handleSendMessage}
              disabled={agentChat.isStreaming}
            />
            <div
              className={classNames(
                "sharelyai-webcontroller-content-input-icon",
                { disabled: !message || agentChat.isStreaming },
              )}
              onClick={() =>
                handleSendMessage({
                  key: "Enter",
                } as React.KeyboardEvent<HTMLInputElement>)
              }
            >
              <ArrowUpward />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Wrapper mode={config?.mode} hasMessages={hasMessages}>
      {showChatHistory && (
        <ChatHistory
          onClose={() => onCloseChatHistory?.()}
          handleCreateNewChat={handleCreateNewChat}
          isAgentMode={true}
          version="v2"
        />
      )}
      <ScrollBar
        className="scrollbar-container"
        scrollBottom={true}
        disableComponent={config?.mode === constants.POSITION_PLACED_INLINE}
        options={{
          suppressScrollX: true,
          suppressScrollY: config?.mode === constants.POSITION_PLACED_INLINE,
        }}
      >
        <div className="sharelyai-webcontroller-content-chat">
          {/* Error display */}
          {agentChat.error && (
            <div className="sharelyai-webcontroller-agent-error">
              <span>Error: {agentChat.error}</span>
              <button onClick={agentChat.clearError}>Dismiss</button>
            </div>
          )}

          {/* Streaming message */}
          {agentChat.isStreaming && (
            <StreamingMessage
              content={agentChat.streamingContent}
              thinkingSteps={agentChat.thinkingSteps}
              activeToolCalls={agentChat.activeToolCalls}
              activeSources={agentChat.activeSources}
              imageAI={workspace?.photo}
              name={workspace?.defaultSpaceName || workspace?.name || "AI Bot"}
              onShowAllSources={setAllSourcesData}
            />
          )}

          {/* Messages list */}
          {!hasJustGreeting &&
            messages.map((msg: any) => {
              const isAi = msg.type === constants.CONVERSATIONS_TYPE_AI;
              const hasThinking = isAi && msg.thinkingSteps?.length > 0;
              const hasToolCalls = isAi && msg.toolCalls?.length > 0;
              const hasSources = isAi && msg.sources?.length > 0;

              return (
                <div key={msg.id}>
                  <MessageBubble
                    messageId={msg.id}
                    type={msg.type}
                    message={msg.message}
                    imageAI={workspace?.photo ?? ""}
                    name={
                      workspace?.defaultSpaceName || workspace?.name || "AI Bot"
                    }
                    sourcesMetadata={msg.sourcesMetadata}
                    showThumbUpIcon={false}
                    showSourcesButton={customConfig?.message?.showSourcesButton}
                    renderContent={
                      hasSources ? (
                        <AgentMessageContent
                          content={msg.rawContent ?? msg.message}
                          sources={msg.sources}
                        />
                      ) : undefined
                    }
                    footer={
                      hasThinking || hasToolCalls || hasSources ? (
                        <div className="sharelyai-webcontroller-agent-content">
                          {(hasThinking || hasToolCalls) && (
                            <ThinkingIndicator
                              steps={msg.thinkingSteps || []}
                              toolCalls={msg.toolCalls}
                              collapsed={true}
                            />
                          )}
                          {hasSources && (
                            <SourcesList
                              sources={msg.sources}
                              defaultCollapsed={true}
                              onShowAllSources={setAllSourcesData}
                            />
                          )}
                        </div>
                      ) : undefined
                    }
                  />
                </div>
              );
            })}

          {/* Initial greeting state */}
          {hasJustGreeting && (
            <GreetingWrapper>
              <div className="sharelyai-webcontroller-greeting-heading">
                <p className="sharelyai-webcontroller-greeting-text">
                  {t("AgentTabText")}
                </p>
                <p className="sharelyai-webcontroller-greeting-description">
                  {t("AgentInDepthAnswersText")}
                </p>
              </div>
              {renderInputSection()}
              <div className="sharelyai-webcontroller-greeting-note">
                <span>
                  {t("NoteChatPoweredByAIText")}
                  {version && (
                    <>
                      {" "}
                      <button type="button" onClick={onVersionClick}>
                        (v{version})
                      </button>
                    </>
                  )}
                </span>
              </div>
            </GreetingWrapper>
          )}
        </div>
      </ScrollBar>
      {!hasJustGreeting && renderInputSection()}

      {/* All Sources Modal */}
      <AllSourcesModal
        open={!!allSourcesData}
        onClose={() => setAllSourcesData(null)}
        sources={allSourcesData || []}
      />
    </Wrapper>
  );
};
