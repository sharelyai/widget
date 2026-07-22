import { useState } from "react";
import type { AgentThread } from "@sharelyai/widget-services";
import {
  ModalBackdrop,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalDateGroup,
  ModalThreadItem,
  ModalNewChatButton,
} from "../styles";
import { IconButton } from "../IconButton";
import { CloseIcon, AddIcon } from "../icons";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  threads: AgentThread[];
  activeThreadId?: string | null;
  onSelectThread?: (thread: AgentThread) => void;
  onNewChat?: () => void;
  onClearAll?: () => void | Promise<void>;
}

function groupByDate(threads: AgentThread[]): Record<string, AgentThread[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  const groups: Record<string, AgentThread[]> = {};

  for (const thread of threads) {
    const date = new Date(thread.updatedAt || thread.createdAt);
    const threadDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    let label: string;
    if (threadDay.getTime() === today.getTime()) {
      label = "Today";
    } else if (threadDay.getTime() === yesterday.getTime()) {
      label = "Yesterday";
    } else {
      label = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(thread);
  }

  return groups;
}

export function HistoryModal({
  open,
  onClose,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onClearAll,
}: HistoryModalProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!open) return null;

  const grouped = groupByDate(threads);
  const canClear = Boolean(onClearAll) && threads.length > 0;

  const handleClear = async () => {
    setConfirmClear(false);
    await onClearAll?.();
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Chat history</ModalTitle>
          <IconButton
            icon={<CloseIcon size={20} />}
            ariaLabel="Close"
            onClick={onClose}
          />
        </ModalHeader>
        <ModalNewChatButton
          onClick={() => {
            onNewChat?.();
            onClose();
          }}
        >
          <AddIcon size={20} />
          New chat
        </ModalNewChatButton>
        <ModalBody>
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <ModalDateGroup>{date}</ModalDateGroup>
              {items.map((thread) => (
                <ModalThreadItem
                  key={thread.id}
                  $active={thread.id === activeThreadId}
                  onClick={() => {
                    onSelectThread?.(thread);
                    onClose();
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {thread.title || "Untitled chat"}
                  </span>
                </ModalThreadItem>
              ))}
            </div>
          ))}
        </ModalBody>
        {canClear &&
          (confirmClear ? (
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #EEF0F4",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 13, color: "#475467" }}>
                This will delete all of your threads and is not reversable.
              </span>
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  style={{
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    border: "1px solid #E0E7EF",
                    borderRadius: 8,
                    background: "transparent",
                    color: "#475467",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 8,
                    background: "#F04438",
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  Yes, clear all
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "12px 16px",
                borderTop: "1px solid #EEF0F4",
                borderLeft: "none",
                borderRight: "none",
                borderBottom: "none",
                background: "transparent",
                color: "#F04438",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ fill: "none" }}
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
              Clear all history
            </button>
          ))}
      </ModalContainer>
    </ModalBackdrop>
  );
}
