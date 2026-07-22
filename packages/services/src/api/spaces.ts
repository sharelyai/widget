import type { BaseClient } from './client';
import type { Message } from '../types';

export function createSpacesApi(client: BaseClient) {
  return {
    getMessages: (spaceId: string, groupId: string, languageId?: string) => {
      const query = new URLSearchParams();
      if (groupId) query.append('groupId', groupId);
      if (languageId) query.append('languageId', languageId);
      
      return client.fetcher<{ messages: Message[] }>(`/spaces/${spaceId}/messages?${query.toString()}`);
    },

    getGreeting: (spaceId: string, languageId?: string, saveMessage = true) => {
      const query = new URLSearchParams();
      if (languageId) query.append('languageId', languageId);
      if (saveMessage) query.append('saveMessage', 'true');

      return client.fetcher<{ greeting: { group: { id: string } } }>(`/spaces/${spaceId}/greeting?${query.toString()}`);
    },

    sendMessage: (spaceId: string, content: string, groupId?: string, languageId?: string, signal?: AbortSignal) => {
      const query = new URLSearchParams();
      if (languageId) query.append('languageId', languageId);

      return client.request(`/spaces/${spaceId}/messages?${query.toString()}`, {
        method: 'POST',
        body: JSON.stringify({
          newMessage: content,
          groupId,
        }),
        signal,
      });
    },

    updateGroup: (spaceId: string, groupId: string) => {
      return client.fetcher<{ groupName: string }>(`/spaces/${spaceId}/groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify({ groupId }),
      });
    },

    sendEvent: (spaceId: string, type: string, metadata?: Record<string, any>) => {
      return client.fetcher(`/spaces/${spaceId}/event`, {
        method: 'POST',
        body: JSON.stringify({
          type,
          metadata,
        }),
      });
    },
  };
}