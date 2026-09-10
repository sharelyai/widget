import { useMemo, useCallback } from "react";
import { ReactMarkdown } from "@sharelyai/widget-ui-shared";
import type {
  AgentMessage as AgentMessageType,
  AgentFeedback,
  Source,
} from "@sharelyai/widget-services";
import { UserBubble, AiRow, Avatar, AiContent, ResponseText } from "../styles";
import { ThinkingIndicator } from "../ThinkingIndicator";
import { SourcesList } from "../SourcesList";
import { ActionBar } from "../ActionBar";
import { SuggestedFollowups } from "../SuggestedFollowups";
import { ErrorMessage } from "../ErrorMessage";
import { BotIcon } from "../icons";
import { getCitationMarkdownComponents } from "../CitationRenderer";

interface AgentMessageProps {
  message: AgentMessageType;
  avatarSrc?: string;
  suggestedFollowups?: string[];
  onFollowupSelect?: (text: string) => void;
  onSourceClick?: (source: Source) => void;
  onShowAllSources?: (sources: Source[]) => void;
  onFeedback?: (feedback: AgentFeedback) => void;
  onRetry?: () => void;
  isLast?: boolean;
}

export function AgentMessage({
  message,
  avatarSrc,
  suggestedFollowups = [],
  onFollowupSelect,
  onSourceClick,
  onShowAllSources,
  onFeedback,
  onRetry,
  isLast = false,
}: AgentMessageProps) {
  const isUser = message.role === "user";

  const handleCitationClick = useCallback(
    (sourceId: string) => {
      const source = message.sources.find((s) => s.id === sourceId);
      if (source) onSourceClick?.(source);
    },
    [message.sources, onSourceClick],
  );

  const markdownComponents = useMemo(
    () => getCitationMarkdownComponents(message.sources, handleCitationClick),
    [message.sources, handleCitationClick],
  );

  // Strip [N] citation references from content when there are no sources to link
  const displayContent = useMemo(() => {
    if (!message.content || message.sources.length > 0) return message.content;
    return message.content.replace(/\s*\[(\d+(?:[,-]\d+)*)\]/g, "");
  }, [message.content, message.sources]);

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <UserBubble>{message.content}</UserBubble>
      </div>
    );
  }

  const isError = message.finishReason === "error";

  // Failed turn with nothing to show: the error card replaces the message.
  if (isError && !displayContent) {
    return (
      <AiRow>
        <Avatar>
          {avatarSrc ? <img src={avatarSrc} alt="" /> : <BotIcon size={18} />}
        </Avatar>
        <AiContent>
          <ErrorMessage
            message={message.errorMessage}
            onRetry={isLast ? onRetry : undefined}
          />
        </AiContent>
      </AiRow>
    );
  }

  return (
    <AiRow>
      <Avatar>
        {avatarSrc ? <img src={avatarSrc} alt="" /> : <BotIcon size={18} />}
      </Avatar>
      <AiContent>
        {/* Thinking Steps + Tool Calls */}
        {(message.thinkingSteps.length > 0 || message.toolCalls.length > 0) && (
          <div style={{ marginBottom: message.content ? 16 : 0 }}>
            <ThinkingIndicator
              steps={message.thinkingSteps}
              toolCalls={message.toolCalls}
              collapsed
              sourceCount={message.sources.length || undefined}
              onSourceClick={onSourceClick}
            />
          </div>
        )}

        {/* Message Content */}
        {displayContent && (
          <ResponseText>
            <ReactMarkdown components={markdownComponents}>
              {displayContent}
            </ReactMarkdown>
          </ResponseText>
        )}

        {/* Failed after partial output — keep the text, offer the retry */}
        {isError && (
          <ErrorMessage
            message={message.errorMessage}
            onRetry={isLast ? onRetry : undefined}
          />
        )}

        {/* Sources */}
        {message.sources.length > 0 && (
          <SourcesList
            sources={message.sources}
            onSourceClick={onSourceClick}
            onShowAllSources={onShowAllSources}
          />
        )}

        {/* Action Bar */}
        {displayContent && (
          <ActionBar
            messageId={message.id}
            content={displayContent}
            onFeedback={onFeedback}
          />
        )}

        {/* Suggested Followups (only for last message) */}
        {isLast && suggestedFollowups.length > 0 && onFollowupSelect && (
          <SuggestedFollowups
            questions={suggestedFollowups}
            onSelect={onFollowupSelect}
          />
        )}
      </AiContent>
    </AiRow>
  );
}
