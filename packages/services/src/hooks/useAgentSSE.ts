import { useCallback, useRef } from "react";
import type { SSEEventType } from "../types/agent";
import { getAgentApiUrl, getAuthToken } from "../api/agentApi";

interface UseAgentSSEOptions {
  onEvent: (eventType: SSEEventType, data: unknown) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

// Parse SSE messages from buffer, returns remaining unparsed content
function parseSSEMessages(
  buffer: string,
  onMessage: (event: string, data: string) => void
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (endpoint: string, body: object, options: UseAgentSSEOptions) => {
      // Abort any existing stream
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const baseUrl = getAgentApiUrl();
      const url = `${baseUrl}${endpoint}`;
      const token = getAuthToken();

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ""}`
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

          buffer += decoder.decode(value, { stream: true });

          buffer = parseSSEMessages(buffer, (eventType, dataContent) => {
            try {
              const data = JSON.parse(dataContent);
              options.onEvent(eventType as SSEEventType, data);
            } catch (e) {
              console.error("[useAgentSSE] Failed to parse SSE data:", e, dataContent);
            }
          });
        }

        // Flush any remaining content in the buffer (e.g. if the final
        // SSE message wasn't terminated with \n\n before the stream closed)
        if (buffer.trim()) {
          parseSSEMessages(buffer + "\n\n", (eventType, dataContent) => {
            try {
              const data = JSON.parse(dataContent);
              options.onEvent(eventType as SSEEventType, data);
            } catch (e) {
              console.error("[useAgentSSE] Failed to parse remaining SSE data:", e, dataContent);
            }
          });
        }

        options.onComplete();
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          options.onError(error as Error);
        }
      }
    },
    []
  );

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  return { startStream, stopStream };
}
