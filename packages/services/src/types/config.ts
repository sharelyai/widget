export interface DisplayModeConfig {
  OPEN_BY_DEFAULT?: boolean;
  MODE: string; // 'PUBLIC' | 'PRIVATE'
  WIDTH?: string;
  HEIGHT?: string;
  Z_INDEX?: string;
  VIEWS?: {
    CHAT: { SHOW: boolean };
    SEARCH: {
      SHOW: boolean;
      SHOW_TAGS?: boolean;
      SHOW_SORT?: boolean;
    };
    BROWSE: { SHOW: boolean; SHOW_SORT?: boolean };
    AGENT?: { SHOW: boolean };
  };
}

export interface RoleTabVisibility {
  show: boolean;
  comingSoon?: boolean;
}

export interface RolesTabsWorkspace {
  workspaceId: string;
  roles: Array<{
    customerRoleId: string;
    displayName?: string;
    tabs?: { [tab: string]: RoleTabVisibility };
  }>;
}

export interface SharelyConfig {
  baseUrl?: string;
  /** @deprecated Use `baseUrl` instead. Kept for backward compatibility. */
  api?: string;
  workspaceId?: string;
  externalUserId?: string;
  closedText?: string;
  saveSpaceNumMgs?: number;
  mode?: string;
  justChat?: boolean;
  lang?: string;
  langKnowledge?: string;
  avatarmodeDesktop?: string;
  avatarmodeMobile?: string;
  displayMode?: DisplayModeConfig;
  displayModeJSON?: {
    [key: string]: any;
  };
  agentMode?: boolean;
  agentApi?: string;
  env?: string | null;
  onError?: (error: Error) => void;
  /** Per-role tab visibility, supplied by the embedding page at initialize(). */
  rolesTabs?: { workspaces: RolesTabsWorkspace[] };
  /** Host-page selectors to hide on mobile while the widget is mounted. */
  hideHostElements?: string[];
  /** Search across all knowledge languages instead of filtering by langKnowledge. */
  searchAllLanguages?: boolean;
}
