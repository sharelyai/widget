/**
 * Vercel AI SDK v6 based chat hook for Sharely agent.
 * Wraps useChat with Sharely-specific concerns:
 * - Thread lifecycle (create on first message, load from history)
 * - Auth via custom fetch
 * - Message format adaptation via custom transport
 *
 * Returns UseAgentChatReturn for drop-in compatibility with AgentView.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useGlobalStore } from "../stores/globalStore";
import { agentFetcher } from "../api/agentApi";
import { isRecoveredTurn } from "../utils/streamRecovery";
import { createSharelyFetch } from "../ai/sharelyFetch";
import {
  agentMessagesToUIMessages,
  uiMessageToAgentMessage,
  reasoningPartsToThinkingSteps,
  toolInvocationPartsToToolCalls,
  sourcePartsToSources,
} from "../ai/convertMessages";
import type { AgentMessage, UseAgentChatReturn } from "../types/agent";

const RECOVERY_DELAYS_MS = [0, 1500, 4000];
const CONNECTION_LOST_MESSAGE =
  "The connection dropped before the answer arrived.";

interface UseSharelyChatOptions {
  spaceId: string;
  initialThreadId?: string;
}

interface ThreadResponse {
  id: string;
  title?: string;
  status?: string;
  messages?: AgentMessage[];
}

export function useSharelyChat(
  options: UseSharelyChatOptions,
): UseAgentChatReturn {
  const { spaceId, initialThreadId } = options;
  const { config, workspace } = useGlobalStore();
  const customerRoleId = useGlobalStore(
    (s) => s.userData?.metadata?.customerRoleId,
  );

  const workspaceId = config?.workspaceId || workspace?.id;

  const [threadId, setThreadId] = useState<string | null>(
    initialThreadId || null,
  );
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [hookError, setHookError] = useState<string | null>(null);
  const [pendingUserMessage, setPendingUserMessage] =
    useState<AgentMessage | null>(null);
  const [isCreatingThread, setIsCreatingThread] = useState(false);

  const threadIdRef = useRef<string | null>(initialThreadId || null);
  const prevChatStatusRef = useRef<string>("ready");
  const assistantsBeforeTurnRef = useRef(0);
  const [turnFailure, setTurnFailure] = useState<string | null>(null);

  const getBasePath = useCallback(() => {
    if (!workspaceId) return null;
    return `/workspaces/${workspaceId}/agent`;
  }, [workspaceId]);

  // Stable fetch wrapper
  const sharelyFetch = useMemo(() => createSharelyFetch(), []);

  // Create transport with dynamic URL via prepareSendMessagesRequest
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "", // never used directly — overridden by prepareSendMessagesRequest
        fetch: sharelyFetch,
        prepareSendMessagesRequest({ messages }) {
          const basePath = getBasePath();
          const tid = threadIdRef.current;
          const lastMessage = messages[messages.length - 1];
          const textPart = lastMessage?.parts?.find((p) => p.type === "text");
          const messageText = (textPart as any)?.text || "";

          return {
            api: `${basePath}/threads/${tid}/chat`,
            body: { message: messageText },
          };
        },
      }),
    [sharelyFetch, getBasePath],
  );

  const chat = useChat({
    transport,
    messages: initialMessages,
  });

  // Keep a ref to the latest chat so async callbacks never use stale closures.
  const chatRef = useRef(chat);
  chatRef.current = chat;

  // Internal: create thread on backend, returns ID. Only sets the ref (not state)
  // so callers can control when the React state update happens.
  const createThreadOnServer = useCallback(
    async (title?: string): Promise<string> => {
      const basePath = getBasePath();
      if (!basePath) {
        throw new Error("Workspace ID not available");
      }
      const data = await agentFetcher<ThreadResponse>(`${basePath}/threads`, {
        method: "POST",
        body: JSON.stringify({ spaceId, title }),
      });
      threadIdRef.current = data.id;
      return data.id;
    },
    [spaceId, getBasePath],
  );

  // Public createThread: creates on backend AND updates UI state (clears messages).
  // Used by AgentView's handleCreateNewChat.
  const createThread = useCallback(
    async (title?: string): Promise<string> => {
      const id = await createThreadOnServer(title);
      setThreadId(id);
      setInitialMessages([]);
      chatRef.current.setMessages([]);
      setHookError(null);
      return id;
    },
    [createThreadOnServer],
  );

  // Load an existing thread
  const loadThread = useCallback(
    async (tid: string) => {
      const basePath = getBasePath();
      if (!basePath) return;

      try {
        const data = await agentFetcher<ThreadResponse>(
          `${basePath}/threads/${tid}`,
        );
        threadIdRef.current = tid;
        setThreadId(tid);

        const uiMessages = agentMessagesToUIMessages(data.messages || []);
        setInitialMessages(uiMessages);
        chatRef.current.setMessages(uiMessages);
        setHookError(null);
      } catch (e) {
        setHookError((e as Error).message);
      }
    },
    [getBasePath],
  );

  // Send message, creating thread if needed.
  // For new threads: creates thread silently (ref only, no state), then queues
  // the message and sets threadId state together — so React batches them into
  // a single render and the greeting transitions directly to showing the message.
  const sendMessage = useCallback(
    async (content: string): Promise<string | null> => {
      if (!content.trim()) return null;

      let tid = threadIdRef.current;

      if (!tid) {
        // Show user message optimistically BEFORE thread creation
        const optimistic: AgentMessage = {
          id: `pending-${Date.now()}`,
          role: "user",
          content,
          thinkingSteps: [],
          toolCalls: [],
          sources: [],
          tokenUsage: null,
          model: null,
          finishReason: null,
          createdAt: new Date().toISOString(),
        };
        setPendingUserMessage(optimistic);
        setIsCreatingThread(true);

        try {
          tid = await createThreadOnServer();
        } catch (e) {
          setPendingUserMessage(null);
          setIsCreatingThread(false);
          setHookError((e as Error).message);
          return null;
        }
      }

      chatRef.current.sendMessage({ text: content });
      setThreadId(tid);
      // Don't clear pendingUserMessage here — chat.messages may not have the
      // real user message yet. It gets cleared reactively by the effect below.

      return tid;
    },
    [createThreadOnServer],
  );

  // Clear the optimistic user message once the SDK has committed it AND
  // progressed past "submitted" — prevents the visual gap where the optimistic
  // message disappears before the real one is rendered.
  useEffect(() => {
    if (!pendingUserMessage) return;

    const sdkProgressed =
      chat.status === "streaming" ||
      chat.status === "ready" ||
      chat.status === "error";

    const matchingUserMsg = chat.messages.some(
      (m) =>
        m.role === "user" &&
        m.parts?.some(
          (p) =>
            p.type === "text" && (p as any).text === pendingUserMessage.content,
        ),
    );

    if (sdkProgressed && matchingUserMsg) {
      setPendingUserMessage(null);
      setIsCreatingThread(false);
    }
  }, [chat.messages, chat.status, pendingUserMessage]);

  // Fallback: clear isCreatingThread once the SDK is actively streaming/submitted
  useEffect(() => {
    if (
      isCreatingThread &&
      (chat.status === "streaming" || chat.status === "submitted")
    ) {
      setIsCreatingThread(false);
    }
  }, [chat.status, isCreatingThread]);

  // After a turn ends, read it back from the server: that copy carries the
  // definitive database IDs and full metadata, and — when the stream ended
  // early — the answer the client never received.
  //
  // The re-read is deliberately not a single shot. A healthy turn is already
  // persisted by the time the SDK reports "ready", so the first attempt
  // succeeds; a turn whose stream died can beat the server's write by several
  // seconds, so the later attempts cover that window. Nothing is committed
  // until the thread actually ends in a completed assistant message, because
  // replacing the messages with a half-written thread is what silently
  // discarded the answer before.
  useEffect(() => {
    const wasActive =
      prevChatStatusRef.current === "streaming" ||
      prevChatStatusRef.current === "submitted";
    if (chat.status === "submitted") {
      assistantsBeforeTurnRef.current = chatRef.current.messages.filter(
        (m) => m.role === "assistant",
      ).length;
      setTurnFailure(null);
    }
    const isNowDone = chat.status === "ready" || chat.status === "error";
    prevChatStatusRef.current = chat.status;

    if (!wasActive || !isNowDone) return;

    const tid = threadIdRef.current;
    const basePath = getBasePath();
    if (!tid || !basePath) return;

    let cancelled = false;
    const assistantsBefore = assistantsBeforeTurnRef.current;

    (async () => {
      for (const delayMs of RECOVERY_DELAYS_MS) {
        if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
        if (cancelled || threadIdRef.current !== tid) return;

        let data: ThreadResponse;
        try {
          data = await agentFetcher<ThreadResponse>(
            `${basePath}/threads/${tid}`,
          );
        } catch {
          continue;
        }
        if (cancelled || threadIdRef.current !== tid) return;

        const serverMessages = data.messages || [];
        if (
          !isRecoveredTurn(serverMessages, {
            assistantsBefore,
            // The SDK generates its own message ids, so there is nothing to
            // match against here — the assistant count is the guard.
            expectedId: null,
          })
        ) {
          continue;
        }

        chatRef.current.setMessages(agentMessagesToUIMessages(serverMessages));
        setTurnFailure(null);
        return;
      }

      // The turn produced no answer we can show. Say so, rather than leaving
      // an empty bubble behind.
      if (!cancelled && threadIdRef.current === tid) {
        setTurnFailure(
          chatRef.current.error?.message || CONNECTION_LOST_MESSAGE,
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chat.status, getBasePath]);

  // Load initial thread on mount
  useEffect(() => {
    if (initialThreadId) {
      loadThread(initialThreadId);
    }
  }, [initialThreadId]);

  // --- Compatibility layer: derive UseAgentChatReturn fields from UIMessage[] ---

  const isStreaming =
    chat.status === "streaming" ||
    chat.status === "submitted" ||
    isCreatingThread;

  // The streaming assistant message is ONLY the last message in chat.messages
  // when it's actually an assistant message. If the last message is a user message
  // (request sent, no response yet), there's nothing streaming to show.
  const lastMsg =
    isStreaming && chat.messages.length > 0
      ? chat.messages[chat.messages.length - 1]
      : null;
  const lastAssistantMsg = lastMsg?.role === "assistant" ? lastMsg : null;

  // Convert UIMessages to AgentMessages.
  // Exclude the last assistant message while streaming — AgentView renders it
  // separately via StreamingMessage, so including it here would cause a duplicate.
  // Only exclude when the last message IS an assistant (i.e., lastAssistantMsg is set).
  // This prevents briefly hiding a completed assistant message when isStreaming flips
  // true but the new user message hasn't been added to chat.messages yet.
  const messages: AgentMessage[] = useMemo(() => {
    const all = chat.messages.map(uiMessageToAgentMessage);

    // Check if the SDK already has the pending user message content —
    // if so, don't append the optimistic duplicate.
    const sdkHasPendingMsg =
      pendingUserMessage &&
      chat.messages.some(
        (m) =>
          m.role === "user" &&
          m.parts?.some(
            (p) =>
              p.type === "text" &&
              (p as any).text === pendingUserMessage.content,
          ),
      );
    const effectivePending = sdkHasPendingMsg ? null : pendingUserMessage;

    const base =
      isStreaming &&
      lastAssistantMsg &&
      all.length > 0 &&
      all[all.length - 1].role === "assistant"
        ? all.slice(0, -1)
        : all;
    const withPending = effectivePending ? [...base, effectivePending] : base;

    if (!turnFailure) return withPending;

    // Attach the failure to this turn's assistant message so the UI can show
    // an error with a retry. If the turn never produced one, stand in for it —
    // an assistant row with no content and no explanation is the bug.
    const last = withPending[withPending.length - 1];
    if (last?.role === "assistant") {
      return [
        ...withPending.slice(0, -1),
        { ...last, finishReason: "error", errorMessage: turnFailure },
      ];
    }
    return [
      ...withPending,
      {
        id: `error-${last?.id ?? "turn"}`,
        role: "assistant",
        content: "",
        thinkingSteps: [],
        toolCalls: [],
        sources: [],
        tokenUsage: null,
        model: null,
        finishReason: "error",
        errorMessage: turnFailure,
        createdAt: new Date().toISOString(),
      },
    ];
  }, [
    chat.messages,
    isStreaming,
    lastAssistantMsg,
    pendingUserMessage,
    turnFailure,
  ]);

  const lastParts = (lastAssistantMsg?.parts as any[]) || [];

  const streamingMessageId = lastAssistantMsg?.id ?? null;

  const streamingContent = isStreaming
    ? lastParts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("")
    : "";

  const thinkingSteps = isStreaming
    ? reasoningPartsToThinkingSteps(lastParts)
    : [];

  const activeToolCalls = isStreaming
    ? toolInvocationPartsToToolCalls(lastParts)
    : [];

  const activeSources = isStreaming ? sourcePartsToSources(lastParts) : [];

  // Reset chat to fresh state without making an API call (for "new chat" button)
  const resetChat = useCallback(() => {
    threadIdRef.current = null;
    setThreadId(null);
    setInitialMessages([]);
    chatRef.current.setMessages([]);
    setHookError(null);
    setPendingUserMessage(null);
  }, []);

  const prevRoleIdRef = useRef(customerRoleId);
  useEffect(() => {
    if (prevRoleIdRef.current !== customerRoleId) {
      prevRoleIdRef.current = customerRoleId;
      resetChat();
    }
  }, [customerRoleId, resetChat]);

  const error = hookError || (chat.error ? chat.error.message : null);

  const clearError = useCallback(() => {
    chatRef.current.clearError();
    setHookError(null);
  }, []);

  const stopStreaming = useCallback(() => {
    chatRef.current.stop();
  }, []);

  // Re-ask the last question. The SDK owns the message list, so the failed
  // turn has to come off it before sending again.
  const retryLastMessage = useCallback(() => {
    const msgs = [...chatRef.current.messages];
    while (msgs.length > 0 && msgs[msgs.length - 1].role === "assistant") {
      msgs.pop();
    }
    const lastUser = msgs[msgs.length - 1];
    const text = (lastUser?.parts as { type: string; text?: string }[])?.find(
      (part) => part.type === "text",
    )?.text;
    if (lastUser?.role !== "user" || !text) return;

    chatRef.current.setMessages(msgs.slice(0, -1));
    setTurnFailure(null);
    setHookError(null);
    chatRef.current.sendMessage({ text });
  }, []);

  return {
    threadId,
    messages,
    isStreaming,
    streamingMessageId,
    streamingContent,
    thinkingSteps,
    activeToolCalls,
    activeSources,
    error,
    sendMessage,
    stopStreaming,
    createThread,
    loadThread,
    resetChat,
    clearError,
    suggestedFollowups: [],
    retryLastMessage,
  };
}
