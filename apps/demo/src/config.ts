import { useGlobalStore } from '@sharelyai/widget-services';

// Initialize the global store with environment variables.
// This file is imported as a side-effect in main.tsx before the app renders.
const storeConfig = useGlobalStore.getState().config;

useGlobalStore.getState().setConfig({
  ...storeConfig,
  workspaceId: import.meta.env.VITE_WORKSPACE_ID || '',
  baseUrl: import.meta.env.VITE_API_DEFAULT_URL || 'https://api.sharely.ai',
});
