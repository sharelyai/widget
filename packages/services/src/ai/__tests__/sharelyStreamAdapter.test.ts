import { describe, it, expect } from "vitest";
import { createSharelyStreamAdapter } from "../sharelyStreamAdapter";

/** Helper: encode SSE event as raw bytes */
function sse(event: string, data: object): Uint8Array {
  const str = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  return new TextEncoder().encode(str);
}

/** Helper: run a stream adapter on input chunks and collect output */
async function runAdapter(chunks: Uint8Array[]): Promise<string> {
  const adapter = createSharelyStreamAdapter();
  const writer = adapter.writable.getWriter();
  const reader = adapter.readable.getReader();

  const writePromise = (async () => {
    for (const chunk of chunks) {
      await writer.write(chunk);
    }
    await writer.close();
  })();

  const decoder = new TextDecoder();
  let output = "";

  const readPromise = (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output += decoder.decode(value, { stream: true });
    }
  })();

  await Promise.all([writePromise, readPromise]);
  return output;
}

/** Parse SSE data lines from output */
function parseOutputChunks(output: string): any[] {
  const lines = output.split("\n");
  const chunks: any[] = [];
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = line.slice(6);
      if (data === "[DONE]") {
        chunks.push({ type: "__DONE__" });
      } else {
        chunks.push(JSON.parse(data));
      }
    }
  }
  return chunks;
}

describe("createSharelyStreamAdapter", () => {
  it("converts message_start to start + start-step", async () => {
    const output = await runAdapter([
      sse("message_start", {
        threadId: "t1",
        messageId: "m1",
        role: "assistant",
        model: "gpt-4",
      }),
    ]);

    const chunks = parseOutputChunks(output);
    expect(chunks.some((c) => c.type === "start")).toBe(true);
    expect(chunks.some((c) => c.type === "start-step")).toBe(true);
  });

  it("converts content_delta to text-start + text-delta", async () => {
    const output = await runAdapter([
      sse("message_start", {
        threadId: "t1",
        messageId: "m1",
        role: "assistant",
        model: "gpt-4",
      }),
      sse("content_delta", { threadId: "t1", messageId: "m1", delta: "Hello" }),
      sse("content_delta", {
        threadId: "t1",
        messageId: "m1",
        delta: " world",
      }),
    ]);

    const chunks = parseOutputChunks(output);
    const textStart = chunks.find((c) => c.type === "text-start");
    const textDeltas = chunks.filter((c) => c.type === "text-delta");

    expect(textStart).toBeDefined();
    expect(textDeltas).toHaveLength(2);
    expect(textDeltas[0].delta).toBe("Hello");
    expect(textDeltas[1].delta).toBe(" world");
  });

  it("converts new-format thinking event to reasoning chunks", async () => {
    const output = await runAdapter([
      sse("thinking", {
        threadId: "t1",
        messageId: "m1",
        thinking: "Let me think...",
      }),
      sse("thinking", {
        threadId: "t1",
        messageId: "m1",
        thinking: " about this.",
      }),
    ]);

    const chunks = parseOutputChunks(output);
    expect(chunks.some((c) => c.type === "reasoning-start")).toBe(true);
    const deltas = chunks.filter((c) => c.type === "reasoning-delta");
    expect(deltas).toHaveLength(2);
    expect(deltas[0].delta).toBe("Let me think...");
    expect(deltas[1].delta).toBe(" about this.");
  });

  it("converts legacy thinking_start/delta/end events", async () => {
    const output = await runAdapter([
      sse("thinking_start", {
        threadId: "t1",
        messageId: "m1",
        thinkingId: "tk1",
        title: "Analyzing...",
      }),
      sse("thinking_delta", {
        threadId: "t1",
        messageId: "m1",
        thinkingId: "tk1",
        delta: "Step 1",
      }),
      sse("thinking_end", {
        threadId: "t1",
        messageId: "m1",
        thinkingId: "tk1",
        status: "completed",
        durationMs: 500,
      }),
    ]);

    const chunks = parseOutputChunks(output);
    expect(chunks.some((c) => c.type === "reasoning-start")).toBe(true);
    expect(
      chunks.some((c) => c.type === "reasoning-delta" && c.delta === "Step 1"),
    ).toBe(true);
    expect(chunks.some((c) => c.type === "reasoning-end")).toBe(true);
  });

  it("converts new-format tool_use + tool_result events", async () => {
    const output = await runAdapter([
      sse("tool_use", {
        threadId: "t1",
        messageId: "m1",
        tool: "search",
        input: { query: "hello" },
      }),
      sse("tool_result", {
        threadId: "t1",
        messageId: "m1",
        tool: "search",
        output: { results: ["a", "b"] },
      }),
    ]);

    const chunks = parseOutputChunks(output);
    const inputAvail = chunks.find((c) => c.type === "tool-input-available");
    const outputAvail = chunks.find((c) => c.type === "tool-output-available");

    expect(inputAvail).toBeDefined();
    expect(inputAvail.toolName).toBe("search");
    expect(inputAvail.input).toEqual({ query: "hello" });

    expect(outputAvail).toBeDefined();
    expect(outputAvail.output).toEqual({ results: ["a", "b"] });
  });

  it("converts legacy tool_call_start/end events", async () => {
    const output = await runAdapter([
      sse("tool_call_start", {
        threadId: "t1",
        messageId: "m1",
        toolCallId: "tc1",
        name: "lookup",
        input: { id: "123" },
      }),
      sse("tool_call_end", {
        threadId: "t1",
        messageId: "m1",
        toolCallId: "tc1",
        output: { value: 42 },
        durationMs: 100,
      }),
    ]);

    const chunks = parseOutputChunks(output);
    const inputAvail = chunks.find((c) => c.type === "tool-input-available");
    const outputAvail = chunks.find((c) => c.type === "tool-output-available");

    expect(inputAvail).toBeDefined();
    expect(inputAvail.toolCallId).toBe("tc1");
    expect(inputAvail.toolName).toBe("lookup");

    expect(outputAvail).toBeDefined();
    expect(outputAvail.toolCallId).toBe("tc1");
    expect(outputAvail.output).toEqual({ value: 42 });
  });

  it("handles tool_call_end with error", async () => {
    const output = await runAdapter([
      sse("tool_call_end", {
        threadId: "t1",
        messageId: "m1",
        toolCallId: "tc1",
        error: "Not found",
        durationMs: 50,
      }),
    ]);

    const chunks = parseOutputChunks(output);
    const errorChunk = chunks.find((c) => c.type === "tool-output-error");
    expect(errorChunk).toBeDefined();
    expect(errorChunk.errorText).toBe("Not found");
  });

  it("converts new-format source event", async () => {
    const output = await runAdapter([
      sse("source", {
        threadId: "t1",
        messageId: "m1",
        source: {
          id: "s1",
          type: "knowledge",
          title: "Doc A",
          url: "https://example.com/a",
          snippet: "Some text",
        },
      }),
    ]);

    const chunks = parseOutputChunks(output);
    const sourceChunk = chunks.find((c) => c.type === "source-url");
    expect(sourceChunk).toBeDefined();
    expect(sourceChunk.sourceId).toBe("s1");
    expect(sourceChunk.url).toBe("https://example.com/a");
    expect(sourceChunk.title).toBe("Doc A");
  });

  it("converts source without URL as source-document", async () => {
    const output = await runAdapter([
      sse("source", {
        threadId: "t1",
        messageId: "m1",
        source: {
          id: "s2",
          type: "document",
          title: "Internal Doc",
        },
      }),
    ]);

    const chunks = parseOutputChunks(output);
    const sourceChunk = chunks.find((c) => c.type === "source-document");
    expect(sourceChunk).toBeDefined();
    expect(sourceChunk.sourceId).toBe("s2");
    expect(sourceChunk.title).toBe("Internal Doc");
  });

  it("converts legacy sources (plural) event", async () => {
    const output = await runAdapter([
      sse("sources", {
        threadId: "t1",
        messageId: "m1",
        sources: [
          { id: "s1", type: "knowledge", title: "A", url: "https://a.com" },
          { id: "s2", type: "knowledge", title: "B", url: "https://b.com" },
        ],
      }),
    ]);

    const chunks = parseOutputChunks(output);
    const sourceChunks = chunks.filter((c) => c.type === "source-url");
    expect(sourceChunks).toHaveLength(2);
  });

  it("converts message_end to finish-step + finish", async () => {
    const output = await runAdapter([
      sse("message_end", {
        threadId: "t1",
        messageId: "m1",
        finishReason: "end_turn",
      }),
    ]);

    const chunks = parseOutputChunks(output);
    expect(chunks.some((c) => c.type === "finish-step")).toBe(true);
    expect(
      chunks.some((c) => c.type === "finish" && c.finishReason === "stop"),
    ).toBe(true);
  });

  it("converts error event", async () => {
    const output = await runAdapter([
      sse("error", {
        threadId: "t1",
        error: "Something went wrong",
      }),
    ]);

    const chunks = parseOutputChunks(output);
    const errorChunk = chunks.find((c) => c.type === "error");
    expect(errorChunk).toBeDefined();
    expect(errorChunk.errorText).toBe("Something went wrong");
  });

  it("converts done event to [DONE]", async () => {
    const output = await runAdapter([sse("done", { threadId: "t1" })]);

    const chunks = parseOutputChunks(output);
    expect(chunks.some((c) => c.type === "__DONE__")).toBe(true);
  });

  it("handles partial chunks (split across writes)", async () => {
    const fullMessage = `event: content_delta\ndata: ${JSON.stringify({
      threadId: "t1",
      messageId: "m1",
      delta: "Hi",
    })}\n\n`;
    const bytes = new TextEncoder().encode(fullMessage);
    const mid = Math.floor(bytes.length / 2);

    const output = await runAdapter([bytes.slice(0, mid), bytes.slice(mid)]);

    const chunks = parseOutputChunks(output);
    const textDelta = chunks.find((c) => c.type === "text-delta");
    expect(textDelta).toBeDefined();
    expect(textDelta.delta).toBe("Hi");
  });

  it("handles multiple events in a single chunk", async () => {
    const event1 = `event: content_delta\ndata: ${JSON.stringify({
      threadId: "t1",
      messageId: "m1",
      delta: "A",
    })}\n\n`;
    const event2 = `event: content_delta\ndata: ${JSON.stringify({
      threadId: "t1",
      messageId: "m1",
      delta: "B",
    })}\n\n`;

    const combined = new TextEncoder().encode(event1 + event2);
    const output = await runAdapter([combined]);

    const chunks = parseOutputChunks(output);
    const textDeltas = chunks.filter((c) => c.type === "text-delta");
    expect(textDeltas).toHaveLength(2);
    expect(textDeltas[0].delta).toBe("A");
    expect(textDeltas[1].delta).toBe("B");
  });

  it("merges raw source data from tool_result into sources", async () => {
    const output = await runAdapter([
      sse("tool_result", {
        threadId: "t1",
        messageId: "m1",
        tool: "search",
        output: {
          dataArraySortedWithSource: [
            {
              text: "Some content",
              source: "5:report.pdf:knowledge-id-123",
            },
          ],
        },
      }),
      sse("source", {
        threadId: "t1",
        messageId: "m1",
        source: {
          id: "knowledge-id-123",
          type: "knowledge",
          title: "Report",
          url: "https://example.com/report",
        },
      }),
    ]);

    const chunks = parseOutputChunks(output);
    const sourceChunk = chunks.find((c) => c.type === "source-url");
    expect(sourceChunk).toBeDefined();
    expect(sourceChunk.providerMetadata.sharely.metadata.pageNumber).toBe(5);
    expect(sourceChunk.providerMetadata.sharely.metadata.filename).toBe(
      "report.pdf",
    );
  });

  it("closes open reasoning on message_end", async () => {
    const output = await runAdapter([
      sse("thinking", {
        threadId: "t1",
        messageId: "m1",
        thinking: "hmm",
      }),
      sse("message_end", {
        threadId: "t1",
        messageId: "m1",
        finishReason: "end_turn",
      }),
    ]);

    const chunks = parseOutputChunks(output);
    expect(chunks.some((c) => c.type === "reasoning-end")).toBe(true);
  });

  it("emits flush [DONE] at end of stream", async () => {
    const output = await runAdapter([]);

    expect(output).toContain("data: [DONE]");
  });
});
