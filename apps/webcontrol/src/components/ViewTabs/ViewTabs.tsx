import { useEffect, useMemo, useRef } from "react";
import { ToggleButton, ToggleWrapper } from "./styles";

import {
  useGlobalStore,
  useLanguage,
  constants,
} from "@sharelyai/widget-services";
import { useBrowseStorage } from "@sharelyai/widget-ui-browse";
import rolesTabsConfig from "./roles-tabs-config.json";

interface TabConfig {
  show: boolean;
  comingSoon?: boolean;
}

interface TabVisibility {
  browse: TabConfig;
  search: TabConfig;
  chat: TabConfig;
  agent: TabConfig;
  [key: string]: TabConfig;
}

export const ViewTabs = () => {
  const {
    externalToken,
    config,
    setConfig,
    currentView,
    setCurrentView,
    userData,
  } = useGlobalStore();
  const { t } = useLanguage();
  const { setTreeCategoriesLevelData, setBreadcrumb } = useBrowseStorage();
  const syncedRef = useRef<TabVisibility | null>(null);

  const tabVisibility = useMemo<TabVisibility>(() => {
    const customerRoleId = userData?.metadata?.customerRoleId;
    const views = config?.displayMode?.VIEWS;
    const defaultBehavior: TabVisibility = {
      ...rolesTabsConfig.defaultBehavior,
      browse: {
        show:
          views?.BROWSE?.SHOW ?? rolesTabsConfig.defaultBehavior.browse.show,
      },
      search: {
        show:
          views?.SEARCH?.SHOW ?? rolesTabsConfig.defaultBehavior.search.show,
      },
      chat: {
        show: views?.CHAT?.SHOW ?? rolesTabsConfig.defaultBehavior.chat.show,
      },
      agent: {
        show: views?.AGENT?.SHOW ?? false,
      },
    };

    if (!config?.workspaceId || !customerRoleId) {
      return defaultBehavior;
    }
    // The per-role table is supplied by the host at initialize() — the
    // bundled JSON only carries defaultBehavior.
    const workspace = (config?.rolesTabs?.workspaces ?? []).find(
      (w) => w.workspaceId === config.workspaceId,
    );
    if (!workspace) {
      return defaultBehavior;
    }
    const role = workspace.roles.find(
      (r) => r.customerRoleId === String(customerRoleId),
    );
    if (!role) {
      return defaultBehavior;
    }
    return (role.tabs || defaultBehavior) as TabVisibility;
  }, [
    config?.workspaceId,
    config?.displayMode?.VIEWS,
    config?.rolesTabs,
    userData?.metadata?.customerRoleId,
  ]);

  // Sync computed tab visibility to store — only when it actually changes
  useEffect(() => {
    if (config && tabVisibility !== syncedRef.current) {
      syncedRef.current = tabVisibility;
      setConfig({ ...config, displayModeJSON: tabVisibility });
    }
  }, [tabVisibility]);

  // Count visible tabs to determine if tab bar should be shown
  const visibleTabCount = [
    tabVisibility.browse?.show || Boolean(tabVisibility.browse?.["comingSoon"]),
    tabVisibility.search?.show,
    tabVisibility.chat?.show,
    tabVisibility.agent?.show,
  ].filter(Boolean).length;

  useEffect(() => {
    if (externalToken) {
      if (tabVisibility.browse?.show) {
        setCurrentView(constants.BROWSE_VIEW);
      } else if (tabVisibility.search?.show) {
        setCurrentView(constants.SEARCH_VIEW);
      } else if (tabVisibility.chat?.show) {
        setCurrentView(constants.CHAT_VIEW);
      } else if (tabVisibility.agent?.show) {
        setCurrentView(constants.AGENT_VIEW);
      }
    } else if (tabVisibility.agent?.show && !tabVisibility.chat?.show) {
      setCurrentView(constants.AGENT_VIEW);
    } else {
      setCurrentView(constants.CHAT_VIEW);
    }
  }, [externalToken, setCurrentView, tabVisibility.browse]);

  // If only one or zero tabs are visible, don't render the tab bar
  if (visibleTabCount <= 1) {
    return null;
  }

  return (
    <ToggleWrapper>
      {(tabVisibility.browse?.show ||
        Boolean(tabVisibility.browse?.["comingSoon"])) && (
        <ToggleButton
          $active={currentView === constants.BROWSE_VIEW}
          onClick={() => {
            setTreeCategoriesLevelData?.(null);
            setBreadcrumb?.([]);
            setCurrentView(constants.BROWSE_VIEW);
          }}
        >
          {t("BrowseTabText")}
        </ToggleButton>
      )}
      {tabVisibility.search?.show && (
        <ToggleButton
          $active={currentView === constants.SEARCH_VIEW}
          onClick={() => setCurrentView(constants.SEARCH_VIEW)}
        >
          {t("SearchTabText")}
        </ToggleButton>
      )}
      {tabVisibility.chat?.show && (
        <ToggleButton
          $active={currentView === constants.CHAT_VIEW}
          onClick={() => setCurrentView(constants.CHAT_VIEW)}
        >
          {t("ChatTabText")}
        </ToggleButton>
      )}
      {tabVisibility.agent?.show && (
        <ToggleButton
          $active={currentView === constants.AGENT_VIEW}
          onClick={() => setCurrentView(constants.AGENT_VIEW)}
        >
          {t("AgentTabText")}
        </ToggleButton>
      )}
    </ToggleWrapper>
  );
};
