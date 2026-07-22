import React, { useEffect, useRef, useState } from "react";
import { SHARELY_VERSION } from "./version";
import {
  SharelyProvider,
  useGlobalStore,
  useLanguage,
  useSpace,
  useWorkspace,
  useSpaceMessages,
  constants,
  useAuth,
  useSharelyContext,
  classNames,
  setCSSVariables,
} from "@sharelyai/widget-services";
import type { DisplayModeConfig } from "@sharelyai/widget-services";
import {
  ThemeProvider,
  GlobalStyle,
  Alert,
  Done,
  Spinner as AppLoader,
  PDFPreview,
  useResponsive,
} from "@sharelyai/widget-ui-shared";
import { ChatPanel } from "@sharelyai/widget-ui-chat";
import { SearchPanel } from "@sharelyai/widget-ui-search";
import { BrowsePanel } from "@sharelyai/widget-ui-browse";
import { Wrapper } from "./styles";
import { ChatHistory } from "./components/ChatHistory";
import { AgentView } from "./components/AgentView";
import { AboutModal } from "@sharelyai/widget-ui-agent-chat";
import { RbacBlocker } from "./components/RbacBlocker";
import { Launcher } from "./components/Launcher";
import { WebControlHeader } from "./components/WebControlHeader";
import { usePdfPreview } from "./hooks/usePdfPreview";
import { useHideInterferingElements } from "./hooks/useHideInterferingElements";

export interface WebControlProps {
  workspaceId?: string;
  baseUrl?: string;
  externalUserId?: string;
  lang?: string;
  defaultView?: string;
  theme?: any;
  onError?: (error: Error) => void;
  onReady?: () => void;
  displayMode?: DisplayModeConfig;
  mode?: string;
  justChat?: boolean;
  closedText?: string;
  avatarmodeDesktop?: string;
  avatarmodeMobile?: string;
}

// Helper to check if user has RBAC role in token
const hasRbacRole = (userData: any): boolean => {
  const metadata = userData?.user_metadata;
  return Boolean(metadata?.roleId || metadata?.customerRoleId);
};

export const WebControl = (props: WebControlProps) => {
  // Validate mode
  if (props.mode && !constants.POSITIONS.includes(props.mode)) {
    console.error(
      `[Sharely] Invalid mode "${
        props.mode
      }". Valid modes: ${constants.POSITIONS.join(", ")}`,
    );
  }

  // Build a partial config from explicitly provided props only
  const propConfig: Record<string, any> = {};
  if (props.workspaceId !== undefined)
    propConfig.workspaceId = props.workspaceId;
  if (props.baseUrl !== undefined) propConfig.baseUrl = props.baseUrl;
  if (props.externalUserId !== undefined)
    propConfig.externalUserId = props.externalUserId;
  if (props.lang !== undefined) {
    propConfig.lang = props.lang;
    propConfig.langKnowledge = props.lang;
  }
  if (props.displayMode !== undefined)
    propConfig.displayMode = props.displayMode;
  if (props.mode !== undefined) propConfig.mode = props.mode;
  if (props.justChat !== undefined) propConfig.justChat = props.justChat;
  if (props.closedText !== undefined) propConfig.closedText = props.closedText;
  if (props.avatarmodeDesktop !== undefined)
    propConfig.avatarmodeDesktop = props.avatarmodeDesktop;
  if (props.avatarmodeMobile !== undefined)
    propConfig.avatarmodeMobile = props.avatarmodeMobile;
  if (props.onError !== undefined) propConfig.onError = props.onError;

  return (
    <SharelyProvider config={propConfig}>
      <ThemeProvider theme={props.theme}>
        <GlobalStyle />
        <WebControlInner {...props} />
      </ThemeProvider>
    </SharelyProvider>
  );
};

const WebControlInner = (_props: WebControlProps) => {
  const { config, userData } = useGlobalStore();
  const mode = config?.mode || constants.POSITION_TOP_CENTER_FLOATING;
  const isInline = mode === constants.POSITION_PLACED_INLINE;
  const [isOpen, setIsOpen] = useState(
    isInline || config?.displayMode?.OPEN_BY_DEFAULT || false,
  );
  const [status, setStatus] = useState("idle");
  const [showAlert, setShowAlert] = useState(false);
  const [isRbacBlocked, setIsRbacBlocked] = useState(false);
  const { pdfPreview, closePdfPreview } = usePdfPreview();
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showAgentChatHistory, setShowAgentChatHistory] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const {
    currentInformation,
    stepActive,
    currentView,
    workspace,
    token,
    externalToken,
    sessionInvalid,
    setCurrentInformation,
    setStepActive,
    setCurrentView,
    setToken,
    setTemporalToken,
    setExternalToken,
    setSessionInvalid,
  } = useGlobalStore();

  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const { isLoading: isLoadingWorkspace } = useWorkspace();
  const { isAuthenticated } = useAuth();
  const { apiClient } = useSharelyContext();

  const { refetchMessages } = useSpaceMessages({
    spaceId: currentInformation?.spaceId || "",
    groupId: currentInformation?.currentGroupId,
    enabled: stepActive === constants.CHAT_STEP,
    stopInterval: true,
  });

  const { space, spaceOptions } = useSpace({
    spaceId: currentInformation?.spaceId,
  });

  // Avatar compact mode: check desktop/mobile setting
  const avatarCompact =
    !isOpen &&
    ((isMobile && config?.avatarmodeMobile === constants.AVATAR_MODE_COMPACT) ||
      (!isMobile &&
        config?.avatarmodeDesktop === constants.AVATAR_MODE_COMPACT));

  // Display mode (from store — already merged by SharelyProvider)
  const displayMode = config?.displayMode;
  const isPrivate = displayMode?.MODE === constants.DISPLAY_MODE.MODE.PRIVATE;

  // Header derived state
  const groups = (space as any)?.spaceGroupConversation;
  const isChatView = currentView === constants.CHAT_VIEW;
  const isAgentView = currentView === constants.AGENT_VIEW;
  const hasGroups = groups && groups.length > 0;

  // RBAC check
  useEffect(() => {
    if (workspace?.rbacStatus === "ACTIVE" && !hasRbacRole(userData)) {
      setIsRbacBlocked(true);
    } else {
      setIsRbacBlocked(false);
    }
  }, [workspace?.rbacStatus, userData]);

  // CSS variable injection from workspace styles
  useEffect(() => {
    if (workspace?.spaceStyling?.styles) {
      setCSSVariables(workspace.spaceStyling.styles);
      if (workspace.spaceStyling.styles?.global?.importFont) {
        const link = document.createElement("link");
        link.href = workspace.spaceStyling.styles.global.importFont;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
    }
  }, [workspace]);

  // OPEN_BY_DEFAULT from config (may arrive async from workspace)
  useEffect(() => {
    if (config?.displayMode?.OPEN_BY_DEFAULT) {
      handleIsOpen(true);
    }
  }, [config?.displayMode?.OPEN_BY_DEFAULT]);

  // Scroll to top on mobile when opening
  useEffect(() => {
    if (isOpen && isMobile) {
      window?.scrollTo(0, 0);
    }
  }, [isOpen, isMobile]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (config?.displayMode?.OPEN_BY_DEFAULT) return;
      if (
        ref.current &&
        !(ref.current as HTMLDivElement).contains(event.target as Node)
      ) {
        handleIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [config?.displayMode?.OPEN_BY_DEFAULT]);

  // Auto-open first group on space load
  useEffect(() => {
    if (!spaceOptions.isLoading && isOpen) {
      const groups = (space as any)?.spaceGroupConversation;
      const firstGroup = groups?.[0];

      if (firstGroup && !currentInformation?.currentGroupId) {
        const hasInteracted =
          groups?.find((chat: any) => chat?.id === firstGroup?.id)
            ?.hasMoreThanOneMessage ?? false;
        setCurrentInformation({
          currentGroupId: firstGroup?.id,
          currentName: firstGroup?.name,
          thread: {
            threadId: firstGroup?.threadId,
            hasInteracted: hasInteracted,
          },
          preview: true,
        });
        setStepActive(constants.CHAT_STEP);
        refetchMessages();
      }
    }
  }, [isOpen, spaceOptions.isLoading]);

  // Refetch messages when group changes
  useEffect(() => {
    refetchMessages();
  }, [currentInformation?.currentGroupId]);

  // Hide host-page elements that overlap the widget on mobile.
  useHideInterferingElements(isMobile, config?.hideHostElements);

  const handleInitWithToken = async (authToken?: string) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    try {
      const validateResponse = await apiClient.fetcher<any>(
        `/spaces/validate-temporal-token`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${currentToken}` },
        },
      );

      if (!validateResponse?.error) {
        if (validateResponse?.spaceId) {
          setCurrentInformation({
            spaceId: validateResponse.spaceId,
            temporalUserId: validateResponse.temporalUserId,
            startMode:
              workspace?.webControlStartMode ?? constants.START_MODE_QUESTIONS,
          });
          setStatus("resolved");
          return validateResponse;
        }
      }

      // Fallback: fetch spaces
      const spaceResponse = await apiClient.fetcher<any>(
        `/spaces?` +
          new URLSearchParams({
            roles: JSON.stringify(["GUEST"]),
            sortBy: "desc",
            lastMessageSortBy: "true",
            workspaces: JSON.stringify([config?.workspaceId]),
          }).toString(),
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );

      if (spaceResponse?.[0]?.id) {
        setCurrentInformation({
          spaceId: spaceResponse[0].id,
          startMode:
            workspace?.webControlStartMode ?? constants.START_MODE_QUESTIONS,
        });
        setStatus("resolved");
      }

      return spaceResponse;
    } catch (e) {
      console.error(e);
      setSessionInvalid(true);
      return { invalid: true } as any;
    }
  };

  const handleCreateNewSpace = async () => {
    try {
      // Only assert externalUserId when we also have a host-asserted token.
      // Otherwise sending it would tag an anonymous space with that userId —
      // impersonation-by-string. Server must also enforce this.
      const body: Record<string, unknown> = {
        customSource: constants.SPACE_SOURCE_TYPE_WEB_CONTROL,
      };
      if (externalToken && config?.externalUserId) {
        body.externalUserId = config.externalUserId;
      }

      const res = await apiClient.fetcher<any>(
        `/workspaces/${config?.workspaceId}/spaces`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );

      if (res?.id) {
        setToken(res.token);
        // Fresh token minted — the session is valid again, clear the banner.
        setSessionInvalid(false);
        setCurrentInformation({
          spaceId: res.id,
          temporalUserId: res.temporalUserId,
          startMode:
            workspace?.webControlStartMode ?? constants.START_MODE_QUESTIONS,
        });
        await refetchMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Banner action: the persisted token was rejected. Drop every stored token
  // first so the new-space request goes out clean (re-sending the rejected
  // token would 500/401 the recovery too), then mint a fresh anonymous space.
  const handleStartNewSpace = async () => {
    setToken(undefined);
    setTemporalToken(undefined);
    setExternalToken(undefined);
    await handleCreateNewSpace();
  };

  const initializeSpace = async () => {
    if (isRbacBlocked) return;
    if (
      status === "pending" ||
      status === "rejected" ||
      status === "pending_message"
    )
      return;

    try {
      setStatus("pending");

      if (!config?.workspaceId) {
        throw new Error("You need to configure a workspace id");
      }

      // External token flow: token and spaceId already set by embed API
      if (externalToken && currentInformation?.spaceId) {
        setStatus("resolved");
        return;
      }

      // Resume from an existing anonymous temporal token, if any
      if (token) {
        const validation = await handleInitWithToken();
        if (validation?.spaceId || validation?.[0]?.id) {
          setStatus("resolved");
          return;
        }
        // Stored token was rejected — stop here and let the banner prompt a
        // fresh start instead of re-sending the bad token to create a space.
        if (validation?.invalid) {
          setStatus("rejected");
          return;
        }
      }

      if (!currentInformation?.spaceId) {
        await handleCreateNewSpace();
      }
      setStatus("resolved");
    } catch (error) {
      console.error(error);
      setStatus("rejected");
      // We had a stored session token but still couldn't initialize a space —
      // the token is outdated/invalid. Surface the banner so the user can start
      // a new space. (The backend may answer an expired token with 500, not just
      // 401/403, so we can't rely on the provider's status-based hook alone.)
      if (token && config?.workspaceId) {
        setSessionInvalid(true);
      }
    }
  };

  useEffect(() => {
    if (isOpen || isInline || config?.justChat) {
      initializeSpace();
    }
  }, [isOpen, isInline, config?.justChat]);

  const handleIsOpen = (value: boolean) => {
    setIsOpen(value);
    if (value) {
      setStepActive(constants.CHAT_STEP);
    }
  };

  const handleCreateNewChat = () => {
    setShowChatHistory(false);
    setStepActive(constants.CHAT_STEP);
    setCurrentView(constants.CHAT_VIEW);
    setTimeout(() => {
      setCurrentInformation({
        currentGroupId: undefined,
        currentName: undefined,
        thread: undefined,
        preview: true,
      });
    }, 0);
  };

  // Header actions — toggle the threads drawer / start a new chat for the
  // active view (chat vs agent).
  const handleToggleThreads = () =>
    isAgentView
      ? setShowAgentChatHistory(!showAgentChatHistory)
      : setShowChatHistory(!showChatHistory);

  const handleHeaderNewChat = () => {
    if (isAgentView) {
      setShowAgentChatHistory(false);
      setCurrentInformation({
        agentThreadId: undefined,
        agentThreadName: undefined,
      });
    } else {
      handleCreateNewChat();
    }
  };

  const containerStyle: React.CSSProperties = {
    ...(displayMode?.Z_INDEX
      ? { zIndex: parseInt(displayMode.Z_INDEX, 10) }
      : {}),
  };

  const isWidgetOpen = isOpen || isInline || config?.justChat;

  return (
    <Wrapper
      ref={ref}
      $mode={mode}
      $avatarCompact={avatarCompact}
      $displayWidth={displayMode?.WIDTH}
      $displayHeight={displayMode?.HEIGHT}
      className={classNames(
        "sharely-web-control sharelyai-webcontroller-chat",
        {
          "is-open sharelyai-webcontroller-is-open": isWidgetOpen,
          "is-inline": isInline,
          "display-private sharelyai-webcontroller-displayMode-privated":
            isPrivate,
        },
      )}
      style={containerStyle}
    >
      {showAlert && isAuthenticated && (
        <Alert
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
          icon={<Done />}
        >
          {t("IndexAlertText")}
        </Alert>
      )}

      {!isInline && (
        <Launcher
          workspace={workspace}
          isOpen={isOpen}
          closedText={config?.closedText}
          defaultText={t("IndexSmallChatText")}
          onToggle={() => handleIsOpen(!isOpen)}
        />
      )}

      {isLoadingWorkspace && isWidgetOpen && <AppLoader />}

      {/* Invalid/outdated session takes precedence over everything else: a
          stale token fails to decode (so RBAC would falsely block) and poisons
          every request. Show a clear notice + a way to start a fresh space. */}
      {!isLoadingWorkspace && isWidgetOpen && sessionInvalid && (
        <div className="web-control-container sharelyai-webcontroller-container">
          <div
            className="sharelyai-webcontroller-session-banner"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              height: "100%",
              padding: 24,
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 14, color: "#475467" }}>
              {t("SessionExpiredText")}
            </span>
            <button
              type="button"
              onClick={handleStartNewSpace}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: 8,
                background: "#b54708",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("StartNewSpaceText")}
            </button>
          </div>
        </div>
      )}

      {!isLoadingWorkspace &&
        isWidgetOpen &&
        !sessionInvalid &&
        isRbacBlocked && <RbacBlocker />}

      {!isLoadingWorkspace &&
        isWidgetOpen &&
        !sessionInvalid &&
        !isRbacBlocked && (
          <div className="web-control-container sharelyai-webcontroller-container">
            <WebControlHeader
              workspace={workspace}
              isInline={isInline}
              isChatView={isChatView}
              isAgentView={isAgentView}
              hasGroups={Boolean(hasGroups)}
              onToggleThreads={handleToggleThreads}
              onNewChat={handleHeaderNewChat}
              onClose={() => handleIsOpen(false)}
            />

            <div className="web-control-content">
              {currentView === constants.CHAT_VIEW && (
                <ChatPanel
                  spaceId={currentInformation?.spaceId || ""}
                  status={status}
                  isLoading={status === "pending"}
                  setStatus={setStatus}
                  version={SHARELY_VERSION}
                  onVersionClick={() => setShowAboutModal(true)}
                />
              )}
              {currentView === constants.AGENT_VIEW && (
                <AgentView
                  spaceId={currentInformation?.spaceId || ""}
                  showChatHistory={showAgentChatHistory}
                  onCloseChatHistory={() => setShowAgentChatHistory(false)}
                  onCreateNewChat={() => setShowAgentChatHistory(false)}
                  version={SHARELY_VERSION}
                  onVersionClick={() => setShowAboutModal(true)}
                />
              )}
              {currentView === constants.SEARCH_VIEW && <SearchPanel />}
              {currentView === constants.BROWSE_VIEW && <BrowsePanel />}
            </div>

            {showChatHistory && isChatView && (
              <ChatHistory
                onClose={() => setShowChatHistory(false)}
                handleCreateNewChat={handleCreateNewChat}
              />
            )}
          </div>
        )}

      {pdfPreview.open && (
        <PDFPreview
          url={pdfPreview.url}
          open={pdfPreview.open}
          onClose={closePdfPreview}
          fileName={pdfPreview.fileName}
          initialPage={pdfPreview.pageNumber}
        />
      )}

      <AboutModal
        open={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        version={SHARELY_VERSION}
        versionInfo={{
          chatType: isAgentView ? "Agent" : "Regular",
          agentId: (config as any)?.agentId || (workspace as any)?.agentId,
        }}
      />

      {/* Portal mount point for modals, chat history, etc. */}
      <div id="modal"></div>
    </Wrapper>
  );
};
