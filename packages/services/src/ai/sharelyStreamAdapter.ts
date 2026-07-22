/**
 * Stream adapter that converts Sharely SSE events to
 * AI SDK v6 UI Message Stream Protocol.
 *
 * The AI SDK v6 expects SSE format: `data: <UIMessageChunk JSON>\n\n`
 * parsed by EventSourceParserStream + uiMessageChunkSchema.
 *
 * Handles both new and legacy backend event formats.
 */

import type {
  ContentDeltaEvent,
  ErrorEvent as SharelyErrorEvent,
  MessageStartEvent,
  Source,
  SourceEvent,
  SourcesEvent,
  ThinkingEvent,
  ThinkingStartEvent,
  ThinkingDeltaEvent,
  ThinkingEndEvent,
  ToolCallEndEvent,
  ToolCallStartEvent,
  ToolResultEvent,
  ToolUseEvent,
} from "../types/agent";
import {
  transformRawSourcesToMap,
  mergeSourcesWithRawData,
  extractSourcesFromSemanticSearch,
  extractSourcesFromSearchKnowledge,
} from "../utils/sourceParser";

// Re-use the same SSE parsing logic from useAgentSSE.ts
function parseSSEMessages(
  buffer: string,
  onMessage: (event: string, data: string) => void,
): string {
  const messages = buffer.split("\n\n");
  const remaining = messages.pop() || "";

  for (const message of messages) {
    if (!message.trim()) continue;

    let eventType = "";
    let dataContent = "";

    const lines = message.split("\n");
    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataContent = line.slice(5).trim();
      }
    }

    if (eventType && dataContent) {
      onMessage(eventType, dataContent);
    }
  }

  return remaining;
}

/** Encode a UIMessageChunk as an SSE data line */
function encodeChunk(chunk: Record<string, unknown>): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

/** Generate a unique ID */
function generateId(): string {
  return Math.random().toString(36).slice(2, 12);
}

export function createSharelyStreamAdapter(): TransformStream<
  Uint8Array,
  Uint8Array
> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let reasoningStarted = false;
  let stepStarted = false;
  let textStarted = false;
  const reasoningId = generateId();
  const textId = generateId();

  // Track tool call IDs for matching tool_use -> tool_result (new format)
  const toolCallIds = new Map<string, string>(); // tool name -> toolCallId

  // Track raw source data for merging (same pattern as useAgentChat)
  const rawSourceDataMap = new Map<
    string,
    { pageNumber: number; filename: string; text: string }
  >();

  function processEvent(
    eventType: string,
    dataContent: string,
  ): string {
    let output = "";

    try {
      const data = JSON.parse(dataContent);

      switch (eventType) {
        case "message_start": {
          const _event = data as MessageStartEvent;
          if (!stepStarted) {
            output += encodeChunk({ type: "start", messageId: generateId() });
            output += encodeChunk({ type: "start-step" });
            stepStarted = true;
          }
          break;
        }

        // New format: cumulative thinking
        case "thinking": {
          const event = data as ThinkingEvent;
          if (!reasoningStarted) {
            output += encodeChunk({ type: "reasoning-start", id: reasoningId });
            reasoningStarted = true;
          }
          output += encodeChunk({
            type: "reasoning-delta",
            id: reasoningId,
            delta: event.thinking,
          });
          break;
        }

        // Legacy format: thinking_start/delta/end
        case "thinking_start": {
          const _event = data as ThinkingStartEvent;
          if (!reasoningStarted) {
            output += encodeChunk({ type: "reasoning-start", id: reasoningId });
            reasoningStarted = true;
          }
          break;
        }

        case "thinking_delta": {
          const event = data as ThinkingDeltaEvent;
          output += encodeChunk({
            type: "reasoning-delta",
            id: reasoningId,
            delta: event.delta,
          });
          break;
        }

        case "thinking_end": {
          const _event = data as ThinkingEndEvent;
          output += encodeChunk({ type: "reasoning-end", id: reasoningId });
          reasoningStarted = false;
          break;
        }

        // New format: tool_use
        case "tool_use": {
          const event = data as ToolUseEvent;
          const toolCallId = `call_${generateId()}`;
          toolCallIds.set(event.tool, toolCallId);
          output += encodeChunk({
            type: "tool-input-available",
            toolCallId,
            toolName: event.tool,
            input: event.input,
            dynamic: true,
          });
          break;
        }

        // New format: tool_result
        case "tool_result": {
          const event = data as ToolResultEvent;
          // Capture raw source data for later merging
          const resultOutput = event.output as
            | Record<string, unknown>
            | undefined;
          if (resultOutput?.dataArraySortedWithSource) {
            const rawSources = resultOutput.dataArraySortedWithSource as Array<{
              text: string;
              source: string;
            }>;
            const rawMap = transformRawSourcesToMap(rawSources);
            rawMap.forEach((value, key) => {
              rawSourceDataMap.set(key, value);
            });
          }

          // Extract and emit sources from semantic_search sourcesMetadata
          if (resultOutput?.sourcesMetadata && Array.isArray(resultOutput.sourcesMetadata)) {
            const extracted = extractSourcesFromSemanticSearch(
              resultOutput.sourcesMetadata as any[],
            );
            const merged = mergeSourcesWithRawData(extracted, rawSourceDataMap);
            for (const src of merged) {
              output += emitSource(src);
            }
          }

          // Extract and emit sources from search_knowledge results
          if (resultOutput?.results && Array.isArray(resultOutput.results)) {
            const extracted = extractSourcesFromSearchKnowledge(
              resultOutput.results as any[],
            );
            for (const src of extracted) {
              output += emitSource(src);
            }
          }

          const toolCallId =
            toolCallIds.get(event.tool) || `call_${generateId()}`;
          output += encodeChunk({
            type: "tool-output-available",
            toolCallId,
            output: event.output,
            dynamic: true,
          });
          break;
        }

        // Legacy format: tool_call_start
        case "tool_call_start": {
          const event = data as ToolCallStartEvent;
          output += encodeChunk({
            type: "tool-input-available",
            toolCallId: event.toolCallId,
            toolName: event.name,
            input: event.input,
            dynamic: true,
          });
          break;
        }

        // Legacy format: tool_call_end
        case "tool_call_end": {
          const event = data as ToolCallEndEvent;
          // Capture raw source data for later merging
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
              rawSourceDataMap.set(key, value);
            });
          }

          // Extract and emit sources from semantic_search sourcesMetadata
          if (toolOutput?.sourcesMetadata && Array.isArray(toolOutput.sourcesMetadata)) {
            const extracted = extractSourcesFromSemanticSearch(
              toolOutput.sourcesMetadata as any[],
            );
            const merged = mergeSourcesWithRawData(extracted, rawSourceDataMap);
            for (const src of merged) {
              output += emitSource(src);
            }
          }

          // Extract and emit sources from search_knowledge results
          if (toolOutput?.results && Array.isArray(toolOutput.results)) {
            const extracted = extractSourcesFromSearchKnowledge(
              toolOutput.results as any[],
            );
            for (const src of extracted) {
              output += emitSource(src);
            }
          }

          if (event.error) {
            output += encodeChunk({
              type: "tool-output-error",
              toolCallId: event.toolCallId,
              errorText: event.error,
              dynamic: true,
            });
          } else {
            output += encodeChunk({
              type: "tool-output-available",
              toolCallId: event.toolCallId,
              output: event.output,
              dynamic: true,
            });
          }
          break;
        }

        case "content_delta": {
          const event = data as ContentDeltaEvent;
          if (!textStarted) {
            output += encodeChunk({ type: "text-start", id: textId });
            textStarted = true;
          }
          output += encodeChunk({
            type: "text-delta",
            id: textId,
            delta: event.delta,
          });
          break;
        }

        // New format: single source
        case "source": {
          const event = data as SourceEvent;
          const merged = mergeSourcesWithRawData(
            [event.source],
            rawSourceDataMap,
          );
          const src = merged[0];
          output += emitSource(src);
          break;
        }

        // Legacy format: sources (plural)
        case "sources": {
          const event = data as SourcesEvent;
          const merged = mergeSourcesWithRawData(
            event.sources,
            rawSourceDataMap,
          );
          for (const src of merged) {
            output += emitSource(src);
          }
          break;
        }

        case "message_end": {
          // Close any open reasoning
          if (reasoningStarted) {
            output += encodeChunk({ type: "reasoning-end", id: reasoningId });
            reasoningStarted = false;
          }
          // Close any open text
          if (textStarted) {
            output += encodeChunk({ type: "text-end", id: textId });
            textStarted = false;
          }
          output += encodeChunk({ type: "finish-step" });
          output += encodeChunk({
            type: "finish",
            finishReason: "stop",
          });
          break;
        }

        case "error": {
          const event = data as SharelyErrorEvent;
          output += encodeChunk({
            type: "error",
            errorText: event.error,
          });
          break;
        }

        case "done": {
          // Signal end of stream
          output += `data: [DONE]\n\n`;
          break;
        }

        case "thread_created":
        case "content_end": {
          // No mapping needed
          break;
        }
      }
    } catch (e) {
      console.error(
        "[sharelyStreamAdapter] Failed to parse SSE data:",
        e,
        dataContent,
      );
    }

    return output;
  }

  function emitSource(src: Source): string {
    if (src.url) {
      return encodeChunk({
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
      });
    }
    return encodeChunk({
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
    });
  }

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });

      buffer = parseSSEMessages(buffer, (eventType, dataContent) => {
        const output = processEvent(eventType, dataContent);
        if (output) {
          controller.enqueue(encoder.encode(output));
        }
      });
    },
    flush(controller) {
      // Process any remaining buffer
      if (buffer.trim()) {
        parseSSEMessages(buffer + "\n\n", (eventType, dataContent) => {
          const output = processEvent(eventType, dataContent);
          if (output) {
            controller.enqueue(encoder.encode(output));
          }
        });
      }
      // Ensure stream terminates
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
    },
  });
}
