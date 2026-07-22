import {
  type SubmitEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useAgentChat,
  useAgentThreads,
  useAutoRenameThread,
} from "@sharelyai/widget-services";
import type { AgentFeedback, Source } from "@sharelyai/widget-services";
import { AgentMessage } from "../AgentMessage";
import { StreamingContent } from "../StreamingContent";
import { ThinkingIndicator } from "../ThinkingIndicator";
import { SourcesList } from "../SourcesList";
import { EmptyState } from "../EmptyState";
import { AboutModal, type VersionInfo } from "../AboutModal";
import { HistoryModal } from "../HistoryModal";
import { AllSourcesModal } from "../AllSourcesModal";
import {
  ChatWrapper,
  ChatHeader,
  ChatArea,
  MessagesContainer,
  AiRow,
  Avatar,
  AiContent,
  InputArea,
  InputRow,
  InputField,
  SendButton,
  DisclaimerText,
  VersionButton,
  ThinkingSpinner,
} from "../styles";
import { IconButton } from "../IconButton";
import { BotIcon, SendIcon, StopIcon, EditIcon, HistoryIcon } from "../icons";

interface AgentChatPanelProps {
  spaceId: string;
  initialThreadId?: string;
  className?: string;
  avatarSrc?: string;
  botName?: string;
  placeholder?: string;
  disclaimer?: string;
  version?: string;
  onVersionClick?: () => void;
  versionInfo?: VersionInfo;
  emptyTitle?: string;
  emptyDescription?: string;
  onThreadChange?: (threadId: string | null) => void;
  onSourceClick?: (source: Source) => void;
  onFeedback?: (feedback: AgentFeedback) => void;
  showHistory?: boolean;
  showHeader?: boolean;
}

export function AgentChatPanel({
  spaceId,
  initialThreadId,
  className,
  avatarSrc,
  botName,
  placeholder = "Ask a question...",
  disclaimer = "AI-generated — always verify with original materials.",
  version,
  onVersionClick,
  versionInfo,
  emptyTitle,
  emptyDescription,
  onThreadChange,
  onSourceClick,
  onFeedback,
  showHistory = true,
  showHeader = true,
}: AgentChatPanelProps) {
  const agentChat = useAgentChat({ spaceId, initialThreadId });
  const {
    threadId,
    messages,
    isStreaming,
    streamingContent,
    thinkingSteps,
    activeToolCalls,
    activeSources,
    error,
    sendMessage,
    stopStreaming,
    resetChat,
    clearError,
    suggestedFollowups,
    retryLastMessage,
  } = agentChat;

  // If the host doesn't take over the version click, open the built-in modal.
  const [showAbout, setShowAbout] = useState(false);
  const handleVersionClick = onVersionClick ?? (() => setShowAbout(true));

  const { threads, fetchThreads, updateThread, deleteAllThreads } =
    useAgentThreads({ spaceId });

  const currentThread = threadId
    ? threads.find((t) => t.id === threadId)
    : null;

  useAutoRenameThread({
    threadId,
    messages,
    updateThread,
    currentTitle: currentThread?.title ?? null,
  });

  const [inputValue, setInputValue] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [allSourcesData, setAllSourcesData] = useState<Source[] | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevThreadIdRef = useRef<string | null>(threadId);

  // Track thread changes
  useEffect(() => {
    if (threadId !== prevThreadIdRef.current) {
      prevThreadIdRef.current = threadId;
      onThreadChange?.(threadId);
    }
  }, [threadId, onThreadChange]);

  // Auto-scroll
  const scroll = useCallback(() => {
    if (chatRef.current) {
      requestAnimationFrame(() => {
        chatRef.current?.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  }, []);

  useEffect(scroll, [
    messages.length,
    streamingContent,
    thinkingSteps,
    activeToolCalls,
    scroll,
  ]);

  // Elapsed timer during streaming
  useEffect(() => {
    if (isStreaming && !streamingContent) {
      setElapsed(0);
      const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isStreaming, streamingContent]);

  // Fetch threads when history opens
  useEffect(() => {
    if (historyOpen) {
      fetchThreads();
    }
  }, [historyOpen, fetchThreads]);

  const handleSubmit = async (e?: SubmitEvent) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    setInputValue("");
    setElapsed(0);
    await sendMessage(text);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFollowup = (text: string) => {
    setInputValue("");
    setElapsed(0);
    sendMessage(text);
  };

  const handleNewChat = () => {
    resetChat();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleHistorySelect = (thread: { id: string }) => {
    agentChat.loadThread(thread.id);
  };

  const isEmpty = messages.length === 0 && !isStreaming;
  const canSend = inputValue.trim().length > 0 && !isStreaming;
  const hasStreamingThinking =
    isStreaming && thinkingSteps.length > 0 && !streamingContent;

  return (
    <ChatWrapper className={className}>
      {/* Header */}
      {showHeader && (
        <ChatHeader>
          {showHistory ? (
            <IconButton
              icon={<HistoryIcon size={22} />}
              tooltip="Chat history"
              ariaLabel="Chat history"
              onClick={() => setHistoryOpen(true)}
            />
          ) : (
            <div />
          )}
          {botName && (
            <span style={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
              {botName}
            </span>
          )}
          <IconButton
            icon={<EditIcon size={22} />}
            tooltip="New chat"
            ariaLabel="New chat"
            onClick={handleNewChat}
          />
        </ChatHeader>
      )}

      {/* Web Control Info Modal (opens from the version control) */}
      <AboutModal
        open={showAbout}
        onClose={() => setShowAbout(false)}
        version={version}
        versionInfo={versionInfo}
      />

      {/* History Modal */}
      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        threads={threads}
        activeThreadId={threadId}
        onSelectThread={handleHistorySelect}
        onNewChat={handleNewChat}
        onClearAll={async () => {
          await deleteAllThreads();
          resetChat();
          setHistoryOpen(false);
        }}
      />

      {/* All Sources Modal */}
      <AllSourcesModal
        open={!!allSourcesData}
        onClose={() => setAllSourcesData(null)}
        sources={allSourcesData || []}
        onSourceClick={onSourceClick}
      />

      {/* Chat Area */}
      <ChatArea ref={chatRef} role="log" aria-label="Conversation">
        {isEmpty && (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            disclaimer={disclaimer}
            version={version}
            onVersionClick={handleVersionClick}
            placeholder={placeholder}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={() => handleSubmit()}
          />
        )}

        {messages.length > 0 && (
          <MessagesContainer>
            {messages.map((msg, i) => (
              <AgentMessage
                key={msg.id}
                message={msg}
                avatarSrc={avatarSrc}
                isLast={i === messages.length - 1}
                suggestedFollowups={
                  i === messages.length - 1 ? suggestedFollowups : []
                }
                onFollowupSelect={handleFollowup}
                onSourceClick={onSourceClick}
                onShowAllSources={setAllSourcesData}
                onFeedback={onFeedback}
                onRetry={retryLastMessage}
              />
            ))}

            {/* Streaming state */}
            {isStreaming && (
              <AiRow>
                <Avatar>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" />
                  ) : (
                    <BotIcon size={18} />
                  )}
                </Avatar>
                <AiContent>
                  {(thinkingSteps.length > 0 || activeToolCalls.length > 0) && (
                    <div
                      style={{
                        marginBottom: streamingContent ? 16 : 0,
                      }}
                    >
                      <ThinkingIndicator
                        steps={thinkingSteps}
                        toolCalls={activeToolCalls}
                        collapsed
                        elapsed={hasStreamingThinking ? elapsed : undefined}
                        onSourceClick={onSourceClick}
                      />
                    </div>
                  )}

                  {/* Pending indicator when streaming just started */}
                  {!streamingContent &&
                    thinkingSteps.length === 0 &&
                    activeToolCalls.length === 0 && <ThinkingSpinner />}

                  {streamingContent && (
                    <StreamingContent
                      content={streamingContent}
                      sources={activeSources}
                      onSourceClick={(sourceId) => {
                        const source = activeSources.find(
                          (s) => s.id === sourceId,
                        );
                        if (source) onSourceClick?.(source);
                      }}
                    />
                  )}

                  {activeSources.length > 0 && (
                    <SourcesList
                      sources={activeSources}
                      onSourceClick={onSourceClick}
                      onShowAllSources={setAllSourcesData}
                    />
                  )}
                </AiContent>
              </AiRow>
            )}
          </MessagesContainer>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              width: "100%",
              margin: "16px 0",
              padding: "12px 16px",
              background: "rgba(240,68,56,0.06)",
              borderRadius: 12,
              border: "1px solid rgba(240,68,56,0.2)",
              fontSize: 14,
              color: "#F04438",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              style={{
                background: "none",
                border: "none",
                color: "#F04438",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div style={{ flex: 1, minHeight: 20 }} aria-hidden="true" />
      </ChatArea>

      {/* Input — hidden when empty state shows centered input */}
      {!isEmpty && (
        <InputArea>
          <InputRow>
            <InputField
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isStreaming ? "Generating response..." : placeholder}
              disabled={isStreaming}
              onKeyDown={handleKeyDown}
              rows={1}
              aria-label={placeholder}
            />
            {isStreaming ? (
              <SendButton
                type="button"
                onClick={stopStreaming}
                $variant="danger"
                aria-label="Stop generating"
              >
                <StopIcon size={18} />
              </SendButton>
            ) : (
              <SendButton
                type="button"
                onClick={() => handleSubmit()}
                disabled={!canSend}
                aria-label="Send message"
              >
                <SendIcon size={18} />
              </SendButton>
            )}
          </InputRow>
          <DisclaimerText>
            {disclaimer}
            {version && (
              <>
                {" "}
                <VersionButton type="button" onClick={handleVersionClick}>
                  (v{version})
                </VersionButton>
              </>
            )}
          </DisclaimerText>
        </InputArea>
      )}
    </ChatWrapper>
  );
}
