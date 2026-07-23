// Agent Chat API Utilities

import { useGlobalStore } from "../stores/globalStore";

/**
 * Get the Agent API URL from config
 * Falls back to standard API if agentApi is not configured
 */
export function getAgentApiUrl(): string {
  const state = useGlobalStore.getState();
  const config = state.config;
  return config?.agentApi || config?.baseUrl || "";
}

/**
 * Get the standard API URL from config
 */
export function getStandardApiUrl(): string {
  const state = useGlobalStore.getState();
  return state.config?.baseUrl || "";
}

/**
 * Get the current auth token
 */
export function getAuthToken(): string | undefined {
  const state = useGlobalStore.getState();
  return state.token || state.temporalToken || undefined;
}

/**
 * Get common headers for agent API requests
 */
export function getAgentHeaders(): HeadersInit {
  const token = getAuthToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Agent API fetcher with common configuration
 */
export async function agentFetcher<T = unknown>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const baseUrl = getAgentApiUrl();
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAgentHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `HTTP ${response.status}: ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

  return response.json();
}

/**
 * Agent API fetcher that returns the raw response (for streaming)
 */
export async function agentFetcherRaw(
  endpoint: string,
  options?: RequestInit,
): Promise<Response> {
  const baseUrl = getAgentApiUrl();
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAgentHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `HTTP ${response.status}: ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`,
    );
  }

  return response;
}
