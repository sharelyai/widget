/**
 * Custom fetch wrapper for Vercel AI SDK's useChat hook.
 * Injects Sharely auth, constructs the correct URL,
 * and pipes the response through the stream adapter.
 */

import { getAuthToken, getAgentApiUrl } from "../api/agentApi";
import { createSharelyStreamAdapter } from "./sharelyStreamAdapter";

export function createSharelyFetch(): typeof fetch {
  return async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const baseUrl = getAgentApiUrl();
    const token = getAuthToken();

    // The `input` from useChat is the `api` prop value (the endpoint path).
    // We need to prepend the base URL.
    const url =
      typeof input === "string"
        ? input.startsWith("http")
          ? input
          : `${baseUrl}${input}`
        : input;

    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "text/event-stream");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...init,
      headers,
    });

    if (!response.ok) {
      // Return the response as-is so useChat can handle the error
      return response;
    }

    if (!response.body) {
      return response;
    }

    // Pipe through the stream adapter
    const transformedStream = response.body.pipeThrough(
      createSharelyStreamAdapter(),
    );

    return new Response(transformedStream, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    });
  };
}
