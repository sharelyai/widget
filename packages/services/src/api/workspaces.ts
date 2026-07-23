import type { BaseClient } from "./client";
import type { Workspace } from "../types";

export function createWorkspacesApi(client: BaseClient) {
  return {
    getWorkspace: (workspaceId: string) => {
      return client.fetcher<Workspace>(`/workspaces/${workspaceId}`);
    },

    getTags: (workspaceId: string) => {
      return client.fetcher<string[]>(`/workspaces/${workspaceId}/tags`);
    },

    getWorkflows: (workspaceId: string) => {
      return client.fetcher<any[]>(`/workspaces/${workspaceId}/workflows`);
    },
  };
}
