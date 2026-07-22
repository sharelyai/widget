import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentMessage,
  ContentDeltaEvent,
  ErrorEvent,
  MessageStartEvent,
  Source,
  SourceEvent,
  SourcesEvent,
  SSEEventType,
  ThinkingEvent,
  ThinkingDeltaEvent,
  ThinkingEndEvent,
  ThinkingStartEvent,
  ThinkingStep,
  ToolCall,
  ToolCallEndEvent,
  ToolCallStartEvent,
  ToolUseEvent,
  ToolResultEvent,
  UseAgentChatReturn,
} from "../types/agent";
import { agentFetcher } from "../api/agentApi";
import {
  transformRawSourcesToMap,
  mergeSourcesWithRawData,
  processLoadedMessages,
  processLoadedMessageSources,
} from "../utils/sourceParser";
import { useAgentSSE } from "./useAgentSSE";
import { useGlobalStore } from "../stores/globalStore";

interface UseAgentChatOptions {
  spaceId: string;
  initialThreadId?: string;
}

interface ThreadResponse {
  id: string;
  title?: string;
  status?: string;
  messages?: AgentMessage[];
}

export function useAgentChat(options: UseAgentChatOptions): UseAgentChatReturn {
  const { spaceId, initialThreadId } = options;
  const { config, workspace } = useGlobalStore();
  const customerRoleId = useGlobalStore(
    (s) => s.userData?.metadata?.customerRoleId,
  );

  // Get workspaceId from config or workspace
  const workspaceId = config?.workspaceId || workspace?.id;

  // Use refs to track current state for callbacks (avoid stale closures)
  const threadIdRef = useRef<string | null>(initialThreadId || null);
  // Track threads created internally to avoid re-loading them when the prop echoes back
  const internallyCreatedThreadRef = useRef<Set<string>>(new Set());
  const streamingMessageIdRef = useRef<string | null>(null);
  const streamingContentRef = useRef<string>("");
  const thinkingStepsRef = useRef<ThinkingStep[]>([]);
  const activeToolCallsRef = useRef<ToolCall[]>([]);
  const activeSourcesRef = useRef<Source[]>([]);
  // Tracks whether the "done" SSE event was received so that onComplete
  // can act as a fallback without double-committing.
  const doneReceivedRef = useRef(false);

  // Ref for raw source data from tool_call_end/tool_result events
  const rawSourceDataRef = useRef<
    Map<string, { pageNumber: number; filename: string; text: string }>
  >(new Map());

  // Thread state
  const [threadId, setThreadId] = useState<string | null>(
    initialThreadId || null,
  );
  const [messages, setMessages] = useState<AgentMessage[]>([]);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const [streamingContent, setStreamingContent] = useState("");
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([]);
  const [activeSources, setActiveSources] = useState<Source[]>([]);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Suggested followups
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([]);

  const { startStream, stopStream } = useAgentSSE();

  const updateStreamingContent = useCallback(
    (updater: (prev: string) => string) => {
      const next = updater(streamingContentRef.current);
      streamingContentRef.current = next;
      setStreamingContent(next);
    },
    [],
  );

  const updateThinkingSteps = useCallback(
    (updater: (prev: ThinkingStep[]) => ThinkingStep[]) => {
      const next = updater(thinkingStepsRef.current);
      thinkingStepsRef.current = next;
      setThinkingSteps(next);
    },
    [],
  );

  const updateActiveToolCalls = useCallback(
    (updater: (prev: ToolCall[]) => ToolCall[]) => {
      const next = updater(activeToolCallsRef.current);
      activeToolCallsRef.current = next;
      setActiveToolCalls(next);
    },
    [],
  );

  const updateActiveSources = useCallback(
    (updater: (prev: Source[]) => Source[]) => {
      const next = updater(activeSourcesRef.current);
      activeSourcesRef.current = next;
      setActiveSources(next);
    },
    [],
  );

  // Build base path for agent API
  const getBasePath = useCallback(() => {
    if (!workspaceId) return null;
    return `/workspaces/${workspaceId}/agent`;
  }, [workspaceId]);

  // Load thread messages
  const loadThread = useCallback(
    async (tid: string) => {
      const basePath = getBasePath();
      if (!basePath) {
        return;
      }
      try {
        const data = await agentFetcher<ThreadResponse>(
          `${basePath}/threads/${tid}`,
        );
        threadIdRef.current = tid;
        setThreadId(tid);
        // Process loaded messages to merge sources with toolCalls data
        const processedMessages = processLoadedMessages(data.messages || []);
        setMessages(processedMessages);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [getBasePath],
  );

  // Create new thread
  const createThread = useCallback(
    async (title?: string): Promise<string> => {
      const basePath = getBasePath();
      if (!basePath) {
        throw new Error("Workspace ID not available");
      }
      const languageId = config?.langKnowledge;
      const data = await agentFetcher<ThreadResponse>(`${basePath}/threads`, {
        method: "POST",
        body: JSON.stringify({
          spaceId,
          title,
          ...(languageId ? { languageId } : {}),
        }),
      });
      internallyCreatedThreadRef.current.add(data.id);
      threadIdRef.current = data.id;
      setThreadId(data.id);
      setMessages([]);
      return data.id;
    },
    [spaceId, getBasePath, config],
  );

  // Handle SSE events (supports both new backend format and legacy format)
  const handleEvent = useCallback(
    (eventType: SSEEventType, data: unknown) => {
      switch (eventType) {
        case "message_start": {
          const event = data as MessageStartEvent;
          setStreamingMessageId(event.messageId);
          streamingMessageIdRef.current = event.messageId;
          doneReceivedRef.current = false;
          updateStreamingContent(() => "");
          updateThinkingSteps(() => []);
          updateActiveToolCalls(() => []);
          updateActiveSources(() => []);
          // Clear raw source data for new message
          rawSourceDataRef.current.clear();
          break;
        }

        // New backend format: single "thinking" event with content
        case "thinking": {
          const event = data as ThinkingEvent;
          updateThinkingSteps((prev) => {
            if (prev.length === 0) {
              return [
                {
                  id: `thinking-${Date.now()}`,
                  title: "Thinking...",
                  content: event.thinking,
                  status: "running",
                },
              ];
            }
            return prev.map((step, idx) =>
              idx === prev.length - 1
                ? { ...step, content: step.content + event.thinking }
                : step,
            );
          });
          break;
        }

        // New backend format: "tool_use" event when tool is called
        case "tool_use": {
          const event = data as ToolUseEvent;
          updateActiveToolCalls((prev) => [
            ...prev,
            {
              id: `tool-${event.tool}-${Date.now()}`,
              name: event.tool,
              input: event.input,
              status: "running",
            },
          ]);
          break;
        }

        // New backend format: "tool_result" event with tool output
        case "tool_result": {
          const event = data as ToolResultEvent;

          // Capture raw source data if present. Kept for backwards-compat with
          // legacy "sources" (plural) events that may need pageNumber/filename
          // enrichment. Do NOT push extracted sources into activeSources — the
          // backend now delivers the canonical unified sources via "source"
          // events. Mixing both produced duplicates and missing URLs in the UI
          // during streaming.
          const output = event.output as Record<string, unknown> | undefined;
          if (output?.dataArraySortedWithSource) {
            const rawSources = output.dataArraySortedWithSource as Array<{
              text: string;
              source: string;
            }>;
            const rawMap = transformRawSourcesToMap(rawSources);
            rawMap.forEach((value, key) => {
              rawSourceDataRef.current.set(key, value);
            });
          }

          updateActiveToolCalls((prev) =>
            prev.map((tc) =>
              tc.name === event.tool && tc.status === "running"
                ? {
                    ...tc,
                    output: event.output,
                    status: "completed",
                  }
                : tc,
            ),
          );
          updateThinkingSteps((prev) =>
            prev.map((step) =>
              step.status === "running"
                ? { ...step, status: "completed" }
                : step,
            ),
          );
          break;
        }

        // New backend format: single "source" event per source
        case "source": {
          const event = data as SourceEvent;
          updateActiveSources((prev) => [...prev, event.source]);
          break;
        }

        // Legacy format: thinking_start
        case "thinking_start": {
          const event = data as ThinkingStartEvent;
          updateThinkingSteps((prev) => [
            ...prev,
            {
              id: event.thinkingId,
              title: event.title,
              content: "",
              status: "running",
            },
          ]);
          break;
        }

        // Legacy format: thinking_delta
        case "thinking_delta": {
          const event = data as ThinkingDeltaEvent;
          updateThinkingSteps((prev) =>
            prev.map((step) =>
              step.id === event.thinkingId
                ? { ...step, content: step.content + event.delta }
                : step,
            ),
          );
          break;
        }

        // Legacy format: thinking_end
        case "thinking_end": {
          const event = data as ThinkingEndEvent;
          updateThinkingSteps((prev) =>
            prev.map((step) =>
              step.id === event.thinkingId
                ? {
                    ...step,
                    status: event.status,
                    durationMs: event.durationMs,
                  }
                : step,
            ),
          );
          break;
        }

        // Legacy format: tool_call_start
        case "tool_call_start": {
          const event = data as ToolCallStartEvent;
          updateActiveToolCalls((prev) => [
            ...prev,
            {
              id: event.toolCallId,
              name: event.name,
              input: event.input,
              status: "running",
            },
          ]);
          break;
        }

        // Legacy format: tool_call_end
        case "tool_call_end": {
          const event = data as ToolCallEndEvent;

          // Same shape as the new tool_result handler: capture rawData for
          // legacy "sources" event enrichment, but do NOT extract sources from
          // tool output. Canonical unified sources arrive via "source" events.
          const toolOutput = event.output as
            | Record<string, unknown>
            | undefined;
          if (toolOutput?.dataArraySortedWithSource) {
            const rawSources = toolOutput.dataArraySortedWithSource as Array<{
              text: string;
              source: string;
            }>;
            const rawMap = transformRawSourcesToMap(rawSources);
            rawMap.forEach((value, key) => {
              rawSourceDataRef.current.set(key, value);
            });
          }

          updateActiveToolCalls((prev) =>
            prev.map((tc) =>
              tc.id === event.toolCallId
                ? {
                    ...tc,
                    output: event.output,
                    error: event.error,
                    status: event.error ? "error" : "completed",
                    durationMs: event.durationMs,
                  }
                : tc,
            ),
          );
          break;
        }

        case "content_delta": {
          const event = data as ContentDeltaEvent;
          updateStreamingContent((prev) => prev + event.delta);
          break;
        }

        // Legacy format: sources (plural)
        case "sources": {
          const event = data as SourcesEvent;
          // The plural `sources` event is the canonical, unified list the
          // backend commits against the message — same shape that arrives in
          // `message.sources` on reload. Always replace activeSources with it
          // (rawDataMap may add pageNumber/filename for chunked-file ids that
          // happen to match; URLs on event.sources are preserved as-is).
          updateActiveSources(() =>
            mergeSourcesWithRawData(event.sources, rawSourceDataRef.current),
          );
          break;
        }

        case "message_end": {
          updateThinkingSteps((prev) =>
            prev.map((step) =>
              step.status === "running"
                ? { ...step, status: "completed" }
                : step,
            ),
          );
          updateActiveToolCalls((prev) =>
            prev.map((tc) =>
              tc.status === "running" ? { ...tc, status: "completed" } : tc,
            ),
          );
          break;
        }

        case "suggested_followups": {
          const event = data as { followups: string[] };
          if (event.followups) {
            setSuggestedFollowups(event.followups);
          }
          break;
        }

        case "error": {
          const event = data as ErrorEvent;
          setError(event.error);
          setIsStreaming(false);
          break;
        }

        case "done": {
          doneReceivedRef.current = true;

          // Finalize any steps/tool calls still in "running" state.
          // The backend may not always send "message_end" before "done",
          // which would leave items as "running" in the committed message
          // and cause the ThinkingIndicator spinner to spin indefinitely.
          const finalThinkingSteps = thinkingStepsRef.current.map((step) =>
            step.status === "running"
              ? { ...step, status: "completed" as const }
              : step,
          );
          const finalToolCalls = activeToolCallsRef.current.map((tc) =>
            tc.status === "running"
              ? { ...tc, status: "completed" as const }
              : tc,
          );
          const finalContent = streamingContentRef.current;
          const finalSources = processLoadedMessageSources({
            sources: activeSourcesRef.current,
            toolCalls: finalToolCalls,
          });

          setMessages((prev) => {
            const assistantMessage: AgentMessage = {
              id: streamingMessageIdRef.current || `msg-${Date.now()}`,
              role: "assistant",
              content: finalContent,
              thinkingSteps: finalThinkingSteps,
              toolCalls: finalToolCalls,
              sources: finalSources,
              tokenUsage: null,
              model: null,
              finishReason: "end_turn",
              createdAt: new Date().toISOString(),
            };
            return [...prev, assistantMessage];
          });

          updateStreamingContent(() => "");
          updateThinkingSteps(() => []);
          updateActiveToolCalls(() => []);
          updateActiveSources(() => []);
          setStreamingMessageId(null);
          setIsStreaming(false);
          break;
        }
      }
    },
    [
      updateStreamingContent,
      updateThinkingSteps,
      updateActiveToolCalls,
      updateActiveSources,
    ],
  );

  // Send message - returns the threadId used
  const sendMessage = useCallback(
    async (content: string): Promise<string | null> => {
      if (!content.trim()) return null;

      setSuggestedFollowups([]);

      const basePath = getBasePath();
      if (!basePath) {
        setError("Workspace ID not available");
        return null;
      }

      let tid = threadIdRef.current;

      // Create thread if needed
      if (!tid) {
        try {
          tid = await createThread();
        } catch (e) {
          setError((e as Error).message);
          return null;
        }
      }

      // Optimistically add user message
      const userMessage: AgentMessage = {
        id: `temp-${Date.now()}`,
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
      setMessages((prev) => [...prev, userMessage]);

      setIsStreaming(true);
      setError(null);

      const languageId = config?.langKnowledge;
      try {
        await startStream(
          `${basePath}/threads/${tid}/chat`,
          { message: content, ...(languageId ? { languageId } : {}) },
          {
            onEvent: handleEvent,
            onError: (e) => {
              setError(e.message);
              setIsStreaming(false);
            },
            onComplete: () => {
              // Normally handled by the 'done' SSE event. This is a safety
              // fallback in case the stream closes without sending 'done'
              // (e.g. network interruption, server timeout).
              if (!doneReceivedRef.current) {
                handleEvent("done" as SSEEventType, {});
              }
            },
          },
        );
      } catch (e) {
        setError((e as Error).message);
        setIsStreaming(false);
      }

      return tid;
    },
    [createThread, startStream, handleEvent, getBasePath, config],
  );

  // Stop streaming
  const handleStopStreaming = useCallback(() => {
    stopStream();
    setIsStreaming(false);
  }, [stopStream]);

  // Reset chat to fresh state without API call
  const resetChat = useCallback(() => {
    threadIdRef.current = null;
    setThreadId(null);
    setMessages([]);
    updateStreamingContent(() => "");
    updateThinkingSteps(() => []);
    updateActiveToolCalls(() => []);
    updateActiveSources(() => []);
    setStreamingMessageId(null);
    setIsStreaming(false);
    setError(null);
    setSuggestedFollowups([]);
  }, [
    updateStreamingContent,
    updateThinkingSteps,
    updateActiveToolCalls,
    updateActiveSources,
  ]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Retry last failed message
  const retryLastMessage = useCallback(() => {
    const msgs = [...messages];
    // Remove last assistant message (failed/incomplete)
    while (msgs.length > 0 && msgs[msgs.length - 1].role === "assistant") {
      msgs.pop();
    }
    // Find last user message
    const lastUserMsg = msgs[msgs.length - 1];
    if (lastUserMsg?.role === "user" && lastUserMsg.content) {
      setMessages(msgs.slice(0, -1));
      setError(null);
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  // Load initial thread or reset when cleared
  useEffect(() => {
    if (initialThreadId) {
      // Skip if this thread was just created internally (prop echoed back via onThreadChange)
      if (internallyCreatedThreadRef.current.has(initialThreadId)) {
        internallyCreatedThreadRef.current.delete(initialThreadId);
      } else {
        loadThread(initialThreadId);
      }
    } else if (threadIdRef.current !== null) {
      resetChat();
    }
  }, [initialThreadId, loadThread, resetChat]);

  const prevRoleIdRef = useRef(customerRoleId);
  useEffect(() => {
    if (prevRoleIdRef.current !== customerRoleId) {
      prevRoleIdRef.current = customerRoleId;
      resetChat();
    }
  }, [customerRoleId, resetChat]);

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
    stopStreaming: handleStopStreaming,
    createThread,
    loadThread,
    resetChat,
    clearError,
    suggestedFollowups,
    retryLastMessage,
  };
}
