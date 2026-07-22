import type { BaseClient } from './client';
import type { Category, Resource } from '../types';

export function createKnowledgeApi(client: BaseClient) {
  return {
    getCategories: (workspaceId: string, languageId?: string, categoryId?: string) => {
      const query = new URLSearchParams();
      if (languageId) query.append('languageId', languageId);
      if (categoryId) query.append('categoryId', categoryId);

      return client.fetcher<Category[]>(`/workspaces/${workspaceId}/category-navigation-private?${query.toString()}`);
    },

    getCategoryResources: (workspaceId: string, categoryIds: string[]) => {
      return client.fetcher<Resource[]>(`/workspaces/${workspaceId}/category-navigation-private/knowledge`, {
        method: 'POST',
        body: JSON.stringify({ categories: categoryIds }),
      });
    },

    downloadFile: (knowledgeId: string, pageNumber = 1) => {
      return client.fetcher<{ url: string }>(`/knowledges-content-key/${knowledgeId}?pageNumber=${pageNumber}`);
    },
  };
}