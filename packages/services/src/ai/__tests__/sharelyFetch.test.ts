import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSharelyFetch } from "../sharelyFetch";

// Mock the store and dependencies
vi.mock("../../stores/globalStore", () => ({
  useGlobalStore: {
    getState: () => ({
      config: {
        agentApi: "https://api.test.com",
        baseUrl: "https://api.test.com",
      },
      token: "test-token-123",
    }),
  },
}));

describe("createSharelyFetch", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("creates a fetch function", () => {
    const fetchFn = createSharelyFetch();
    expect(typeof fetchFn).toBe("function");
  });

  it("prepends base URL for relative paths", async () => {
    let capturedUrl: string | URL = "";
    globalThis.fetch = vi.fn(async (url: string | URL | Request, _init?: RequestInit) => {
      capturedUrl = url as string | URL;
      return new Response(new ReadableStream(), { status: 200 });
    });

    const fetchFn = createSharelyFetch();
    await fetchFn("/workspaces/w1/agent/threads/t1/chat", { method: "POST" });

    expect(capturedUrl).toBe("https://api.test.com/workspaces/w1/agent/threads/t1/chat");
  });

  it("does not prepend for absolute URLs", async () => {
    let capturedUrl: string | URL = "";
    globalThis.fetch = vi.fn(async (url: string | URL | Request, _init?: RequestInit) => {
      capturedUrl = url as string | URL;
      return new Response(new ReadableStream(), { status: 200 });
    });

    const fetchFn = createSharelyFetch();
    await fetchFn("https://other.com/api", { method: "POST" });

    expect(capturedUrl).toBe("https://other.com/api");
  });

  it("injects auth header", async () => {
    let capturedHeaders: Headers | undefined;
    globalThis.fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      capturedHeaders = init?.headers as Headers;
      return new Response(new ReadableStream(), { status: 200 });
    });

    const fetchFn = createSharelyFetch();
    await fetchFn("/test", { method: "POST" });

    expect(capturedHeaders?.get("Authorization")).toBe("Bearer test-token-123");
  });

  it("sets content-type and accept headers", async () => {
    let capturedHeaders: Headers | undefined;
    globalThis.fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      capturedHeaders = init?.headers as Headers;
      return new Response(new ReadableStream(), { status: 200 });
    });

    const fetchFn = createSharelyFetch();
    await fetchFn("/test", { method: "POST" });

    expect(capturedHeaders?.get("Content-Type")).toBe("application/json");
    expect(capturedHeaders?.get("Accept")).toBe("text/event-stream");
  });

  it("returns response with x-vercel-ai-ui-message-stream header", async () => {
    const sseData = `event: content_delta\ndata: ${JSON.stringify({
      threadId: "t1",
      messageId: "m1",
      delta: "Hi",
    })}\n\n`;

    globalThis.fetch = vi.fn(async () => {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(sseData));
            controller.close();
          },
        }),
        { status: 200 },
      );
    });

    const fetchFn = createSharelyFetch();
    const response = await fetchFn("/test", { method: "POST" });

    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");
  });

  it("passes through non-OK responses as-is", async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response("Not Found", { status: 404, statusText: "Not Found" });
    });

    const fetchFn = createSharelyFetch();
    const response = await fetchFn("/test", { method: "POST" });

    expect(response.status).toBe(404);
  });
});
