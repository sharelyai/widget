// Provider
export { SharelyProvider, useSharelyContext } from './provider';

// API
export { createApiClient, ApiError } from './api/client';
export type { ApiClient } from './api/client';

// Hooks
export * from './hooks';

// i18n
export { useLanguage } from './i18n/useLanguage';

// Stores
export { useGlobalStore } from './stores/globalStore';
export type { GlobalState } from './stores/globalStore';

// Types
export * from './types';

// Constants
export * from './constants';

// Agent API
export * from './api/agentApi';

// AI SDK adapters
export * from './ai';

// Utils
export * from './utils/conversation';
export * from './utils/sourceParser';
export * from './utils/sortResults';
export * from './utils/messageAdapters';
export * from './utils/customEvents';
export * from './utils/tryParseJson';
export * from './utils/replaceMessageValue';
export * from './utils/getLastTimeAgo';
export * from './utils/formatDate';
export * from './utils/cookieManager';
export * from './utils/regex';
export * from './utils/getMessageCompletion';
export { classNames } from './utils/classNames';
export { schemas } from './utils/schemas';
export { setCSSVariables } from './utils/helpers';
export { setGlobalEnv, getGlobalEnv, getGlobalEnvStatus } from './utils/globalEnv';