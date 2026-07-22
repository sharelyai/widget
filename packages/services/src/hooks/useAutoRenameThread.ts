import { useEffect, useRef } from "react";
import type { AgentMessage } from "../types/agent";
import { shouldTriggerAutoRename } from "../utils/conversation";

interface UseAutoRenameThreadOptions {
  threadId: string | null;
  messages: AgentMessage[];
  updateThread: (threadId: string, data: { title?: string }) => Promise<void>;
  currentTitle?: string | null;
}

export function useAutoRenameThread({
  threadId,
  messages,
  updateThread,
  currentTitle,
}: UseAutoRenameThreadOptions): void {
  const renamedThreadsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!threadId) return;
    if (renamedThreadsRef.current.has(threadId)) return;
    if (currentTitle) return;

    if (!shouldTriggerAutoRename(messages)) return;

    renamedThreadsRef.current.add(threadId);

    updateThread(threadId, {}).catch(() => {
      renamedThreadsRef.current.delete(threadId);
    });
  }, [threadId, messages, updateThread, currentTitle]);
}
