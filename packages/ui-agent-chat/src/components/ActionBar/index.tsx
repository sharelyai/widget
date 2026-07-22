import { useState, useCallback } from "react";
import { ActionBarWrapper } from "../styles";
import { IconButton } from "../IconButton";
import { FeedbackPanel } from "../FeedbackPanel";
import {
  ThumbUpIcon,
  ThumbDownIcon,
  ContentCopyIcon,
  CheckCircleIcon,
} from "../icons";
import type { AgentFeedback } from "@sharelyai/widget-services";

interface ActionBarProps {
  messageId: string;
  content: string;
  onFeedback?: (feedback: AgentFeedback) => void;
}

export function ActionBar({ messageId, content, onFeedback }: ActionBarProps) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = content;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const handleThumbUp = () => {
    const next = vote === "up" ? null : "up";
    setVote(next);
    setShowFeedback(false);
    onFeedback?.({ messageId, vote: next });
  };

  const handleThumbDown = () => {
    const next = vote === "down" ? null : "down";
    setVote(next);
    if (next === "down") setShowFeedback(true);
    else setShowFeedback(false);
    onFeedback?.({ messageId, vote: next });
  };

  return (
    <>
      <ActionBarWrapper>
        <IconButton
          icon={<ThumbUpIcon size={18} />}
          tooltip="Helpful"
          ariaLabel="Mark as helpful"
          active={vote === "up"}
          ariaPressed={vote === "up"}
          onClick={handleThumbUp}
        />
        <IconButton
          icon={<ThumbDownIcon size={18} />}
          tooltip="Not helpful"
          ariaLabel="Mark as not helpful"
          active={vote === "down"}
          ariaPressed={vote === "down"}
          onClick={handleThumbDown}
        />
        <IconButton
          icon={
            copied ? (
              <CheckCircleIcon size={18} />
            ) : (
              <ContentCopyIcon size={18} />
            )
          }
          tooltip={copied ? "Copied" : "Copy"}
          ariaLabel={copied ? "Copied" : "Copy response"}
          onClick={handleCopy}
        />
      </ActionBarWrapper>

      {showFeedback && vote === "down" && (
        <FeedbackPanel
          onSubmit={(data) => {
            onFeedback?.({
              messageId,
              vote: "down",
              reason: data.reason,
              detail: data.detail,
            });
            setShowFeedback(false);
          }}
          onCancel={() => setShowFeedback(false)}
        />
      )}
    </>
  );
}
