import React from "react";
import ReactDOM from "react-dom/client";
import {
  constants,
  setGlobalEnv,
  getGlobalEnv,
  useGlobalStore,
} from "@sharelyai/widget-services";
import type { SharelyConfig } from "@sharelyai/widget-services";
import { WebControl } from "../WebControl";
import { SHARELY_VERSION } from "../version";

declare global {
  interface Window {
    sharelyai: typeof sharelyai;
    __sharelyaiRoot?: ReturnType<typeof ReactDOM.createRoot>;
  }
}

export const sharelyai = {
  version: SHARELY_VERSION,

  initialize(
    config: SharelyConfig & { externalToken?: string; spaceId?: string },
  ) {
    // Destroy any previous instance before initializing
    sharelyai.destroy();

    const { externalToken, spaceId, ...userConfig } = config;

    // Backward compatibility: map `api` → `baseUrl`
    if (userConfig.api && !userConfig.baseUrl) {
      userConfig.baseUrl = userConfig.api;
    }

    // Set global environment for API headers
    setGlobalEnv(userConfig?.env?.toUpperCase() || null);

    if (userConfig?.mode) {
      if (!constants.POSITIONS.includes(userConfig.mode)) {
        throw new Error(
          `The mode ${
            userConfig.mode
          } is not valid. The valid modes are: ${constants.POSITIONS.join(
            ", ",
          )}`,
        );
      }
    }

    useGlobalStore.setState((state) => ({
      ...state,
      config: {
        lang: constants.LANGUAGE_EN,
        langKnowledge: constants.LANGUAGE_EN,
        ...state.config,
        ...userConfig,
      } as SharelyConfig,
      ...(Boolean(externalToken) &&
        Boolean(spaceId) && {
          currentInformation: {
            ...state.currentInformation,
            spaceId,
          },
        }),
      ...(Boolean(externalToken) && {
        externalToken: externalToken || state.externalToken,
        token: externalToken || state.token,
      }),
    }));
  },

  render() {
    const rootElement = document.getElementById("sharelyai-webcontroller-id");
    if (rootElement) {
      rootElement.style.height = "auto";

      if (!window.__sharelyaiRoot) {
        window.__sharelyaiRoot = ReactDOM.createRoot(rootElement);
      }

      const state = useGlobalStore.getState();
      const config = state.config;

      window.__sharelyaiRoot.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(WebControl, {
            workspaceId: config?.workspaceId || "",
            baseUrl: config?.baseUrl,
            externalUserId: config?.externalUserId,
            lang: config?.lang,
            theme: undefined,
            mode: config?.mode,
            displayMode: config?.displayMode,
            justChat: config?.justChat,
            closedText: config?.closedText,
            avatarmodeDesktop: config?.avatarmodeDesktop,
            avatarmodeMobile: config?.avatarmodeMobile,
          }),
        ),
      );
    }
  },

  destroy() {
    if (window.__sharelyaiRoot) {
      window.__sharelyaiRoot.unmount();
      window.__sharelyaiRoot = undefined;
    } else {
      const rootElement = document.getElementById("sharelyai-webcontroller-id");
      if (rootElement) {
        rootElement.innerHTML = "";
      }
    }
  },

  config() {
    const state = useGlobalStore.getState();
    return {
      ...state.config,
      env: getGlobalEnv(),
    };
  },

  updateConfig(newConfig: Partial<SharelyConfig>) {
    // Backward compatibility: map `api` → `baseUrl`
    if (newConfig.api && !newConfig.baseUrl) {
      newConfig.baseUrl = newConfig.api;
    }

    if (newConfig.env) {
      setGlobalEnv(newConfig.env.toUpperCase());
    }

    useGlobalStore.setState((state) => ({
      ...state,
      config: {
        ...state.config,
        ...newConfig,
      } as SharelyConfig,
    }));
  },
};

// Expose on window
if (typeof window !== "undefined") {
  window.sharelyai = sharelyai;
}
