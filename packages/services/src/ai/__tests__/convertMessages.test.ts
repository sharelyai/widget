import { describe, it, expect } from "vitest";
import {
  agentMessagesToUIMessages,
  reasoningPartsToThinkingSteps,
  toolInvocationPartsToToolCalls,
  sourcePartsToSources,
} from "../convertMessages";
import type { AgentMessage } from "../../types/agent";

function makeAgentMessage(overrides: Partial<AgentMessage> = {}): AgentMessage {
  return {
    id: "msg-1",
    role: "assistant",
    content: "Hello world",
    thinkingSteps: [],
    toolCalls: [],
    sources: [],
    tokenUsage: null,
    model: null,
    finishReason: null,
    createdAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("agentMessagesToUIMessages", () => {
  it("converts a simple text message", () => {
    const messages = [makeAgentMessage({ content: "Hello" })];
    const result = agentMessagesToUIMessages(messages);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("msg-1");
    expect(result[0].role).toBe("assistant");

    const textParts = result[0].parts.filter((p) => p.type === "text");
    expect(textParts).toHaveLength(1);
    expect((textParts[0] as any).text).toBe("Hello");
  });

  it("converts a user message", () => {
    const messages = [
      makeAgentMessage({ role: "user", content: "How are you?" }),
    ];
    const result = agentMessagesToUIMessages(messages);

    expect(result[0].role).toBe("user");
  });

  it("converts system to assistant role", () => {
    const messages = [
      makeAgentMessage({ role: "system", content: "System prompt" }),
    ];
    const result = agentMessagesToUIMessages(messages);

    expect(result[0].role).toBe("assistant");
  });

  it("includes reasoning parts from thinkingSteps", () => {
    const messages = [
      makeAgentMessage({
        thinkingSteps: [
          {
            id: "tk1",
            title: "Thinking...",
            content: "Let me analyze this",
            status: "completed",
          },
        ],
      }),
    ];

    const result = agentMessagesToUIMessages(messages);
    const reasoningParts = result[0].parts.filter(
      (p) => p.type === "reasoning",
    );
    expect(reasoningParts).toHaveLength(1);
    expect((reasoningParts[0] as any).text).toBe("Let me analyze this");
  });

  it("includes tool invocation parts from toolCalls", () => {
    const messages = [
      makeAgentMessage({
        toolCalls: [
          {
            id: "tc1",
            name: "search",
            input: { query: "test" },
            output: { results: [] },
            status: "completed",
          },
        ],
      }),
    ];

    const result = agentMessagesToUIMessages(messages);
    const toolParts = result[0].parts.filter((p) => p.type === "dynamic-tool");
    expect(toolParts).toHaveLength(1);
    expect((toolParts[0] as any).toolName).toBe("search");
    expect((toolParts[0] as any).state).toBe("output-available");
  });

  it("includes source parts", () => {
    const messages = [
      makeAgentMessage({
        sources: [
          {
            id: "s1",
            type: "knowledge",
            title: "Doc A",
            url: "https://example.com/a",
          },
        ],
      }),
    ];

    const result = agentMessagesToUIMessages(messages);
    const sourceParts = result[0].parts.filter((p) => p.type === "source-url");
    expect(sourceParts).toHaveLength(1);
    expect((sourceParts[0] as any).sourceId).toBe("s1");
  });

  it("generates source-document for sources without URL", () => {
    const messages = [
      makeAgentMessage({
        sources: [
          {
            id: "s1",
            type: "document",
            title: "Internal Doc",
          },
        ],
      }),
    ];

    const result = agentMessagesToUIMessages(messages);
    const sourceParts = result[0].parts.filter(
      (p) => p.type === "source-document",
    );
    expect(sourceParts).toHaveLength(1);
  });

  it("creates a text part for empty messages", () => {
    const messages = [makeAgentMessage({ content: null })];
    const result = agentMessagesToUIMessages(messages);

    const textParts = result[0].parts.filter((p) => p.type === "text");
    expect(textParts).toHaveLength(1);
    expect((textParts[0] as any).text).toBe("");
  });

  it("preserves part order: reasoning -> tool -> text -> sources", () => {
    const messages = [
      makeAgentMessage({
        content: "Result",
        thinkingSteps: [
          {
            id: "tk1",
            title: "Think",
            content: "thinking...",
            status: "completed",
          },
        ],
        toolCalls: [
          {
            id: "tc1",
            name: "search",
            input: {},
            output: {},
            status: "completed",
          },
        ],
        sources: [
          { id: "s1", type: "knowledge", title: "A", url: "https://a.com" },
        ],
      }),
    ];

    const result = agentMessagesToUIMessages(messages);
    const types = result[0].parts.map((p) => p.type);

    expect(types[0]).toBe("reasoning");
    expect(types[1]).toBe("dynamic-tool");
    expect(types[2]).toBe("text");
    expect(types[3]).toBe("source-url");
  });
});

describe("reasoningPartsToThinkingSteps", () => {
  it("extracts thinking steps from reasoning parts", () => {
    const parts: any[] = [
      { type: "reasoning", text: "Step 1" },
      { type: "text", text: "hello" },
      { type: "reasoning", text: "Step 2" },
    ];

    const steps = reasoningPartsToThinkingSteps(parts);
    expect(steps).toHaveLength(2);
    expect(steps[0].content).toBe("Step 1");
    expect(steps[0].status).toBe("completed");
    expect(steps[1].content).toBe("Step 2");
  });

  it("returns empty array when no reasoning parts", () => {
    const parts: any[] = [{ type: "text", text: "hello" }];
    const steps = reasoningPartsToThinkingSteps(parts);
    expect(steps).toHaveLength(0);
  });
});

describe("toolInvocationPartsToToolCalls", () => {
  it("extracts tool calls from dynamic-tool parts", () => {
    const parts: any[] = [
      {
        type: "dynamic-tool",
        toolName: "search",
        toolCallId: "tc1",
        state: "output-available",
        input: { query: "test" },
        output: { results: [] },
      },
    ];

    const calls = toolInvocationPartsToToolCalls(parts);
    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe("search");
    expect(calls[0].status).toBe("completed");
    expect(calls[0].output).toEqual({ results: [] });
  });

  it("handles running state", () => {
    const parts: any[] = [
      {
        type: "dynamic-tool",
        toolName: "search",
        toolCallId: "tc1",
        state: "input-available",
        input: { query: "test" },
      },
    ];

    const calls = toolInvocationPartsToToolCalls(parts);
    expect(calls[0].status).toBe("running");
  });

  it("handles error state", () => {
    const parts: any[] = [
      {
        type: "dynamic-tool",
        toolName: "search",
        toolCallId: "tc1",
        state: "output-error",
        input: {},
        errorText: "Failed",
      },
    ];

    const calls = toolInvocationPartsToToolCalls(parts);
    expect(calls[0].status).toBe("error");
    expect(calls[0].error).toBe("Failed");
  });
});

describe("sourcePartsToSources", () => {
  it("extracts sources from source-url parts", () => {
    const parts: any[] = [
      {
        type: "source-url",
        sourceId: "s1",
        url: "https://example.com",
        title: "Example",
        providerMetadata: {
          sharely: {
            type: "knowledge",
            snippet: "Some text",
            metadata: { pageNumber: 5 },
          },
        },
      },
    ];

    const sources = sourcePartsToSources(parts);
    expect(sources).toHaveLength(1);
    expect(sources[0].id).toBe("s1");
    expect(sources[0].type).toBe("knowledge");
    expect(sources[0].title).toBe("Example");
    expect(sources[0].url).toBe("https://example.com");
    expect(sources[0].metadata?.pageNumber).toBe(5);
  });

  it("extracts sources from source-document parts", () => {
    const parts: any[] = [
      {
        type: "source-document",
        sourceId: "s2",
        title: "Doc",
        providerMetadata: {
          sharely: { type: "document" },
        },
      },
    ];

    const sources = sourcePartsToSources(parts);
    expect(sources).toHaveLength(1);
    expect(sources[0].type).toBe("document");
  });

  it("returns empty for no source parts", () => {
    const parts: any[] = [{ type: "text", text: "hello" }];
    const sources = sourcePartsToSources(parts);
    expect(sources).toHaveLength(0);
  });
});
