// Agent Chat TypeScript Interfaces

export interface AgentThread {
  id: string;
  title: string | null;
  status: "ACTIVE" | "ARCHIVED";
  workspaceId: string;
  spaceId: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | null;
  thinkingSteps: ThinkingStep[];
  toolCalls: ToolCall[];
  sources: Source[];
  tokenUsage: TokenUsage | null;
  model: string | null;
  finishReason: string | null;
  createdAt: string;
}

export interface ThinkingStep {
  id: string;
  title: string;
  content: string;
  status: "running" | "completed" | "failed";
  durationMs?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  status: "running" | "completed" | "error";
  durationMs?: number;
}

export interface Source {
  id: string;
  type: "knowledge" | "atom" | "taxonomy" | "role" | "document" | "url";
  title: string;
  url?: string;
  snippet?: string;
  excerpt?: string;
  metadata?: {
    knowledgeType?: string;
    filename?: string;
    similarity?: number;
    atomType?: string;
    pageNumber?: number;
    knowledgeId?: string;
    sourceType?: string;
    sourceUrl?: string;
  };
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

// SSE Event Payloads (matching backend implementation)

export interface ThreadCreatedEvent {
  threadId: string;
  title?: string;
  createdAt: string;
}

export interface MessageStartEvent {
  threadId: string;
  messageId: string;
  role: "assistant";
  model: string;
}

export interface ThinkingEvent {
  threadId: string;
  messageId: string;
  thinking: string;
}

export interface ToolUseEvent {
  threadId: string;
  messageId: string;
  tool: string;
  input: Record<string, unknown>;
}

export interface ToolResultEvent {
  threadId: string;
  messageId: string;
  tool: string;
  output: unknown;
}

export interface ContentDeltaEvent {
  threadId: string;
  messageId: string;
  delta: string;
}

export interface ContentEndEvent {
  threadId: string;
  messageId: string;
}

export interface SourceEvent {
  threadId: string;
  messageId: string;
  source: Source;
}

export interface MessageEndEvent {
  threadId: string;
  messageId: string;
  finishReason: "end_turn" | "tool_use" | "error";
  tokenUsage?: TokenUsage;
}

export interface ErrorEvent {
  threadId: string;
  messageId?: string;
  error: string;
  code?: string;
}

export interface DoneEvent {
  threadId: string;
}

// Legacy event types for backwards compatibility
export interface ThinkingStartEvent {
  threadId: string;
  messageId: string;
  thinkingId: string;
  title: string;
}

export interface ThinkingDeltaEvent {
  threadId: string;
  messageId: string;
  thinkingId: string;
  delta: string;
}

export interface ThinkingEndEvent {
  threadId: string;
  messageId: string;
  thinkingId: string;
  status: "completed" | "failed";
  durationMs: number;
}

export interface ToolCallStartEvent {
  threadId: string;
  messageId: string;
  toolCallId: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolCallEndEvent {
  threadId: string;
  messageId: string;
  toolCallId: string;
  output?: unknown;
  error?: string;
  durationMs: number;
}

export interface SourcesEvent {
  threadId: string;
  messageId: string;
  sources: Source[];
}

// SSE Event types matching backend implementation
export type SSEEventType =
  | "thread_created"
  | "message_start"
  | "thinking"
  | "tool_use"
  | "tool_result"
  | "content_delta"
  | "content_end"
  | "source"
  | "message_end"
  | "error"
  | "done"
  | "suggested_followups"
  // Legacy event types for backwards compatibility
  | "thinking_start"
  | "thinking_delta"
  | "thinking_end"
  | "tool_call_start"
  | "tool_call_end"
  | "sources";

// Feedback & Follow-ups

export interface AgentFeedback {
  messageId: string;
  vote: "up" | "down" | null;
  reason?: string;
  detail?: string;
}

// Hook Return Types

export interface UseAgentChatReturn {
  threadId: string | null;
  messages: AgentMessage[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
  thinkingSteps: ThinkingStep[];
  activeToolCalls: ToolCall[];
  activeSources: Source[];
  error: string | null;
  sendMessage: (content: string) => Promise<string | null>;
  stopStreaming: () => void;
  createThread: (title?: string) => Promise<string>;
  loadThread: (threadId: string) => Promise<void>;
  resetChat: () => void;
  clearError: () => void;
  suggestedFollowups: string[];
  retryLastMessage: () => void;
}

export interface UseAgentThreadsReturn {
  threads: AgentThread[];
  isLoading: boolean;
  error: string | null;
  fetchThreads: () => Promise<void>;
  createThread: (title?: string) => Promise<AgentThread>;
  updateThread: (
    threadId: string,
    data: { title?: string; status?: string },
  ) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  deleteAllThreads: () => Promise<void>;
}
