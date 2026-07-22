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
}: HistoryModalProps) {
  if (!open) return null;

  const grouped = groupByDate(threads);

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
      </ModalContainer>
    </ModalBackdrop>
  );
}
