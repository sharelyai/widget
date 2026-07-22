/**
 * Converters between Sharely AgentMessage and AI SDK v6 UIMessage formats.
 *
 * - agentMessagesToUIMessages: for loading thread history into useChat initialMessages
 * - Part-to-legacy adapters: for reusing existing UI components with AI SDK parts
 */

import type { UIMessage, UIMessagePart } from "ai";
import type {
  AgentMessage,
  ThinkingStep,
  ToolCall,
  Source,
} from "../types/agent";
import { processLoadedMessages } from "../utils/sourceParser";

type AnyPart = UIMessagePart<any, any>;

/**
 * Convert an array of AgentMessages (from thread history) to UIMessages
 * for use as initialMessages in useChat.
 */
export function agentMessagesToUIMessages(
  messages: AgentMessage[],
): UIMessage[] {
  const processed = processLoadedMessages(messages);

  return processed.map((msg) => {
    const parts: AnyPart[] = [];

    // Add reasoning parts from thinkingSteps
    if (msg.thinkingSteps && msg.thinkingSteps.length > 0) {
      for (const step of msg.thinkingSteps) {
        parts.push({
          type: "reasoning",
          text: step.content,
          state: "done",
        } as AnyPart);
      }
    }

    // Add tool invocation parts from toolCalls (as dynamic tools)
    if (msg.toolCalls && msg.toolCalls.length > 0) {
      for (const tc of msg.toolCalls) {
        if (tc.status === "running") {
          parts.push({
            type: "dynamic-tool",
            toolName: tc.name,
            toolCallId: tc.id,
            state: "input-available",
            input: tc.input,
          } as AnyPart);
        } else {
          parts.push({
            type: "dynamic-tool",
            toolName: tc.name,
            toolCallId: tc.id,
            state: tc.status === "error" ? "output-error" : "output-available",
            input: tc.input,
            ...(tc.status === "error"
              ? { errorText: tc.error || "Unknown error" }
              : { output: tc.output }),
          } as AnyPart);
        }
      }
    }

    // Add text part
    if (msg.content) {
      parts.push({
        type: "text",
        text: msg.content,
      });
    }

    // Add source parts
    if (msg.sources && msg.sources.length > 0) {
      for (const src of msg.sources) {
        if (src.url) {
          parts.push({
            type: "source-url",
            sourceId: src.id,
            url: src.url,
            title: src.title,
            providerMetadata: {
              sharely: {
                type: src.type,
                snippet: src.snippet,
                excerpt: src.excerpt,
                metadata: src.metadata,
              },
            },
          } as AnyPart);
        } else {
          parts.push({
            type: "source-document",
            sourceId: src.id,
            mediaType: "text/plain",
            title: src.title,
            providerMetadata: {
              sharely: {
                type: src.type,
                snippet: src.snippet,
                excerpt: src.excerpt,
                metadata: src.metadata,
              },
            },
          } as AnyPart);
        }
      }
    }

    // Ensure there's at least a text part
    if (parts.length === 0) {
      parts.push({ type: "text", text: msg.content || "" });
    }

    return {
      id: msg.id,
      role: msg.role === "system" ? "assistant" : msg.role,
      parts,
    } as UIMessage;
  });
}

/**
 * Extract ThinkingStep[] from UIMessage parts (for existing ThinkingIndicator component)
 */
export function reasoningPartsToThinkingSteps(
  parts: AnyPart[],
): ThinkingStep[] {
  const steps: ThinkingStep[] = [];
  let idx = 0;

  for (const part of parts) {
    if (part.type === "reasoning") {
      const p = part as any;
      steps.push({
        id: `thinking-${idx++}`,
        title: "Thinking...",
        content: p.text || "",
        // AI SDK reasoning parts use state: "streaming" | "done"
        // Map to ThinkingStep status so ThinkingIndicator shows the spinner
        status: p.state === "streaming" ? "running" : "completed",
      });
    }
  }

  return steps;
}

/**
 * Extract ToolCall[] from UIMessage parts (for existing ToolCallCard component)
 */
export function toolInvocationPartsToToolCalls(
  parts: AnyPart[],
): ToolCall[] {
  const calls: ToolCall[] = [];

  for (const part of parts) {
    // Handle both static tool parts (type: "tool-*") and dynamic tool parts
    if (part.type === "dynamic-tool" || (typeof part.type === "string" && part.type.startsWith("tool-") && part.type !== "tool-input-available")) {
      const p = part as any;
      const toolCallId = p.toolCallId || `tool-${calls.length}`;
      const toolName = p.toolName || part.type.replace("tool-", "");

      let status: ToolCall["status"] = "running";
      let output: unknown;
      let error: string | undefined;

      if (p.state === "output-available") {
        status = "completed";
        output = p.output;
      } else if (p.state === "output-error") {
        status = "error";
        error = p.errorText;
      } else if (p.state === "input-available" || p.state === "input-streaming") {
        status = "running";
      }

      calls.push({
        id: toolCallId,
        name: toolName,
        input: (p.input as Record<string, unknown>) || {},
        output,
        error,
        status,
      });
    }
  }

  return calls;
}

/**
 * Extract Source[] from UIMessage parts (for existing SourcesList component)
 */
export function sourcePartsToSources(
  parts: AnyPart[],
): Source[] {
  const sources: Source[] = [];

  for (const part of parts) {
    if (part.type === "source-url" || part.type === "source-document") {
      const p = part as any;
      const sharely = p.providerMetadata?.sharely;

      sources.push({
        id: p.sourceId,
        type: sharely?.type || "knowledge",
        title: p.title || "",
        url: p.url,
        snippet: sharely?.snippet,
        excerpt: sharely?.excerpt,
        metadata: sharely?.metadata,
      });
    }
  }

  return sources;
}

/**
 * Convert a UIMessage back to an AgentMessage (reverse of agentMessagesToUIMessages).
 * Used by the compatibility layer in useSharelyChat.
 */
export function uiMessageToAgentMessage(msg: UIMessage): AgentMessage {
  const parts = msg.parts as AnyPart[];

  return {
    id: msg.id,
    role: msg.role as AgentMessage["role"],
    content:
      parts
        .filter((p) => p.type === "text")
        .map((p) => (p as any).text)
        .join("") || null,
    thinkingSteps: reasoningPartsToThinkingSteps(parts),
    toolCalls: toolInvocationPartsToToolCalls(parts),
    sources: sourcePartsToSources(parts),
    tokenUsage: null,
    model: null,
    finishReason: null,
    createdAt: new Date().toISOString(),
  };
}
