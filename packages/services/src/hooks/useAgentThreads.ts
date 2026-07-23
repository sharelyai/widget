import { useCallback, useEffect, useState } from "react";
import type { AgentThread, UseAgentThreadsReturn } from "../types/agent";
import { agentFetcher } from "../api/agentApi";
import { useGlobalStore } from "../stores/globalStore";

interface UseAgentThreadsOptions {
  spaceId: string;
  autoFetch?: boolean;
}

interface ThreadsResponse {
  items: AgentThread[];
  nextCursor?: string;
  hasMore: boolean;
}

export function useAgentThreads(
  options: UseAgentThreadsOptions,
): UseAgentThreadsReturn {
  const { spaceId, autoFetch = true } = options;
  const workspaceId = useGlobalStore(
    (s) => s.config?.workspaceId || s.workspace?.id,
  );
  const customerRoleId = useGlobalStore(
    (s) => s.userData?.metadata?.customerRoleId,
  );

  const [threads, setThreads] = useState<AgentThread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build base path for agent API
  const getBasePath = useCallback(() => {
    return `/workspaces/${workspaceId}/agent`;
  }, [workspaceId]);

  const fetchThreads = useCallback(async () => {
    if (!workspaceId) {
      setError("Workspace ID not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await agentFetcher<ThreadsResponse>(
        `${getBasePath()}/threads?spaceId=${spaceId}`,
      );
      setThreads(data.items || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [spaceId, workspaceId, getBasePath, customerRoleId]);

  const createThread = useCallback(
    async (title?: string): Promise<AgentThread> => {
      if (!workspaceId) {
        throw new Error("Workspace ID not available");
      }
      const thread = await agentFetcher<AgentThread>(
        `${getBasePath()}/threads`,
        {
          method: "POST",
          body: JSON.stringify({
            spaceId,
            title,
          }),
        },
      );
      setThreads((prev) => [thread, ...prev]);
      return thread;
    },
    [spaceId, workspaceId, getBasePath],
  );

  const updateThread = useCallback(
    async (threadId: string, data: { title?: string; status?: string }) => {
      if (!workspaceId) {
        throw new Error("Workspace ID not available");
      }
      const updated = await agentFetcher<AgentThread>(
        `${getBasePath()}/threads/${threadId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      );
      setThreads((prev) => prev.map((t) => (t.id === threadId ? updated : t)));
    },
    [workspaceId, getBasePath],
  );

  const deleteThread = useCallback(
    async (threadId: string) => {
      if (!workspaceId) {
        throw new Error("Workspace ID not available");
      }
      await agentFetcher(`${getBasePath()}/threads/${threadId}`, {
        method: "DELETE",
      });
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
    },
    [workspaceId, getBasePath],
  );

  const deleteAllThreads = useCallback(async () => {
    if (!workspaceId) {
      throw new Error("Workspace ID not available");
    }
    // No bulk endpoint yet — loop over the per-thread DELETE. Swap this for a
    // single bulk request here once the backend provides one.
    await Promise.all(
      threads.map((t) =>
        agentFetcher(`${getBasePath()}/threads/${t.id}`, { method: "DELETE" }),
      ),
    );
    setThreads([]);
  }, [workspaceId, getBasePath, threads]);

  useEffect(() => {
    if (autoFetch) {
      fetchThreads();
    }
  }, [autoFetch, fetchThreads]);

  return {
    threads,
    isLoading,
    error,
    fetchThreads,
    createThread,
    updateThread,
    deleteThread,
    deleteAllThreads,
  };
}
