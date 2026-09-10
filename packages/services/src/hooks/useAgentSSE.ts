import { useCallback, useRef } from "react";
import type { SSEEventType } from "../types/agent";
import { getAgentApiUrl, getAuthToken } from "../api/agentApi";

/**
 * How a stream terminated. Every started stream reports exactly one of these,
 * except when it was superseded by a newer stream (that one stays silent, so
 * it cannot clobber the state the new stream is already building).
 *
 * "closed" means the response body ended. It does NOT mean the turn finished:
 * a body truncated by a proxy or a dropped connection looks identical to a
 * clean one from `reader.read()`. Only a "done" SSE event proves completion.
 */
export type StreamEnd =
  | { reason: "closed" }
  | { reason: "stalled" }
  | { reason: "aborted" }
  | { reason: "error"; error: Error };

interface UseAgentSSEOptions {
  onEvent: (eventType: SSEEventType, data: unknown) => void;
  onEnd: (end: StreamEnd) => void;
  stallTimeoutMs?: number;
}

const DEFAULT_STALL_TIMEOUT_MS = 45_000;

type CancelReason = "user" | "stall" | "superseded";

// Parse SSE messages from buffer, returns remaining unparsed content
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

export function useAgentSSE() {
  const activeRef = useRef<{ cancel: (reason: CancelReason) => void } | null>(
    null,
  );

  const startStream = useCallback(
    async (endpoint: string, body: object, options: UseAgentSSEOptions) => {
      const stallTimeoutMs = options.stallTimeoutMs ?? DEFAULT_STALL_TIMEOUT_MS;

      const controller = new AbortController();
      const cancelState: { reason: CancelReason | null } = { reason: null };
      const handle = {
        cancel: (reason: CancelReason) => {
          if (cancelState.reason) return;
          cancelState.reason = reason;
          controller.abort();
        },
      };

      // Abort any existing stream
      activeRef.current?.cancel("superseded");
      activeRef.current = handle;

      let ended = false;
      const end = (streamEnd: StreamEnd) => {
        if (ended) return;
        ended = true;
        options.onEnd(streamEnd);
      };

      let stallTimer: ReturnType<typeof setTimeout> | undefined;
      const armStallTimer = () => {
        if (!stallTimeoutMs) return;
        clearTimeout(stallTimer);
        stallTimer = setTimeout(() => handle.cancel("stall"), stallTimeoutMs);
      };

      const dispatch = (eventType: string, dataContent: string) => {
        let data: unknown;
        try {
          data = JSON.parse(dataContent);
        } catch (e) {
          console.error(
            "[useAgentSSE] Failed to parse SSE data:",
            e,
            dataContent,
          );
          return;
        }
        // Deliberately outside the parse try/catch: a throw in here is a bug
        // in our own event handling, not a malformed payload, and must not be
        // logged as a parse failure. It propagates to the outer catch, which
        // ends the stream as an error so the caller can recover.
        options.onEvent(eventType as SSEEventType, data);
      };

      const baseUrl = getAgentApiUrl();
      const url = `${baseUrl}${endpoint}`;
      const token = getAuthToken();

      try {
        armStallTimer();

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
          );
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          armStallTimer();
          buffer += decoder.decode(value, { stream: true });
          buffer = parseSSEMessages(buffer, dispatch);
        }

        // Flush any remaining content in the buffer (e.g. if the final
        // SSE message wasn't terminated with \n\n before the stream closed)
        if (buffer.trim()) {
          parseSSEMessages(buffer + "\n\n", dispatch);
        }

        end({ reason: "closed" });
      } catch (error) {
        const err = error as Error;
        if (err.name === "AbortError") {
          if (cancelState.reason === "stall") end({ reason: "stalled" });
          else if (cancelState.reason === "user") end({ reason: "aborted" });
        } else {
          end({ reason: "error", error: err });
        }
      } finally {
        clearTimeout(stallTimer);
        if (activeRef.current === handle) activeRef.current = null;
      }
    },
    [],
  );

  const stopStream = useCallback(() => {
    activeRef.current?.cancel("user");
    activeRef.current = null;
  }, []);

  return { startStream, stopStream };
}
