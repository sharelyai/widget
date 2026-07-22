import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { ToggleTabs } from "./index";
import { theme } from "../../theme";

// Mock the hooks
const mockSetConfig = vi.fn();
const mockSetCurrentView = vi.fn();

vi.mock("../../hooks", () => ({
  useGlobalState: vi.fn(),
}));

vi.mock("../../hooks/useLanguage", () => ({
  useLanguage: () => ({
    langText: {
      BrowseTabText: "Browse",
      SearchTabText: "Search",
      ChatTabText: "Chat",
    },
  }),
}));

import { useGlobalState } from "../../hooks";

// Synthetic per-role tab table, injected via config.rolesTabs — the same
// shape hosts supply at initialize().
const RBAC_WORKSPACE_ID = "11111111-1111-4111-8111-111111111111";
const SAMPLE_ROLES_TABS = {
  workspaces: [
    {
      workspaceId: RBAC_WORKSPACE_ID,
      roles: [
        { customerRoleId: "1", tabs: { browse: { show: true }, search: { show: true }, chat: { show: true } } },
        { customerRoleId: "3", tabs: { browse: { show: false, comingSoon: true }, search: { show: true }, chat: { show: true } } },
        { customerRoleId: "20", tabs: { browse: { show: false }, search: { show: true }, chat: { show: true } } },
      ],
    },
  ],
};

const createMockState = (overrides: {
  customerRoleId?: string;
  workspaceId?: string;
  displayModeViews?: {
    CHAT: { SHOW: boolean };
    SEARCH: { SHOW: boolean };
    BROWSE: { SHOW: boolean };
  };
}) => ({
  externalToken: "test-token",
  config: {
    workspaceId: overrides.workspaceId ?? "test-workspace",
    rolesTabs: SAMPLE_ROLES_TABS,
    displayMode: {
      MODE: "PUBLIC",
      VIEWS: overrides.displayModeViews ?? {
        CHAT: { SHOW: true },
        SEARCH: { SHOW: true },
        BROWSE: { SHOW: true },
      },
    },
  },
  setConfig: mockSetConfig,
  currentView: "CHAT_VIEW",
  setCurrentView: mockSetCurrentView,
  userData: overrides.customerRoleId
    ? { user_metadata: { customerRoleId: overrides.customerRoleId } }
    : undefined,
});

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe("ToggleTabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Non-RBAC mode (no customerRoleId)", () => {
    it("shows all tabs when all VIEWS.SHOW are true", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: true },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);

      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    it("hides Search and Browse when only CHAT.SHOW is true", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: false },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      // With only one tab visible, component returns null (hides tab bar)
      const { container } = renderWithTheme(<ToggleTabs />);
      expect(container.firstChild).toBeNull();
    });

    it("hides Chat when CHAT.SHOW is false", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: false },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: true },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);

      expect(screen.queryByText("Chat")).not.toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    it("shows only Chat and Search when Browse.SHOW is false", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);

      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.queryByText("Browse")).not.toBeInTheDocument();
    });
  });

  describe("RBAC mode (with customerRoleId)", () => {
    it("uses the role table from config.rolesTabs when role found", () => {
      // customerRoleId "1" in the injected table shows all tabs
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          customerRoleId: "1",
          workspaceId: RBAC_WORKSPACE_ID, // matches the injected rolesTabs table
          displayModeViews: {
            CHAT: { SHOW: false }, // Config says hide, but role overrides
            SEARCH: { SHOW: false },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);

      // Role config shows all tabs regardless of displayMode.VIEWS
      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    it("uses role config when role has restricted tabs (comingSoon)", () => {
      // customerRoleId "3" in the injected table (browse has comingSoon: true)
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          customerRoleId: "3",
          workspaceId: RBAC_WORKSPACE_ID,
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: true }, // Config says show, but role hides it (with comingSoon)
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);

      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      // Browse tab appears because comingSoon: true makes the condition true
      // (tabVisibility.browse?.show || Boolean(tabVisibility.browse?.["comingSoon"]))
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    it("shows only Search and Chat when Browse is disabled without comingSoon", () => {
      // customerRoleId "20" in the injected table (browse.show=false, no comingSoon)
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          customerRoleId: "20",
          workspaceId: RBAC_WORKSPACE_ID,
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);

      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.queryByText("Browse")).not.toBeInTheDocument();
    });

    it("falls back to displayMode.VIEWS when workspace not in config", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          customerRoleId: "1",
          workspaceId: "unknown-workspace-id",
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: false },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      // Falls back to defaultBehavior, only one tab visible = returns null
      const { container } = renderWithTheme(<ToggleTabs />);
      expect(container.firstChild).toBeNull();
    });

    it("falls back to displayMode.VIEWS when role not found in workspace", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          customerRoleId: "999", // Non-existent role
          workspaceId: RBAC_WORKSPACE_ID,
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);

      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.queryByText("Browse")).not.toBeInTheDocument();
    });
  });

  describe("Single tab visibility (hide tab bar)", () => {
    it("returns null when only Chat tab is visible", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: false },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      const { container } = renderWithTheme(<ToggleTabs />);
      expect(container.firstChild).toBeNull();
    });

    it("returns null when only Search tab is visible", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: false },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      const { container } = renderWithTheme(<ToggleTabs />);
      expect(container.firstChild).toBeNull();
    });

    it("returns null when only Browse tab is visible", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: false },
            SEARCH: { SHOW: false },
            BROWSE: { SHOW: true },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      const { container } = renderWithTheme(<ToggleTabs />);
      expect(container.firstChild).toBeNull();
    });

    it("returns null when zero tabs are visible", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: false },
            SEARCH: { SHOW: false },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      const { container } = renderWithTheme(<ToggleTabs />);
      expect(container.firstChild).toBeNull();
    });

    it("shows tab bar when Chat and Search are visible", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);
      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    it("shows tab bar when Chat and Browse are visible", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: false },
            BROWSE: { SHOW: true },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);
      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    it("shows tab bar when Search and Browse are visible", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: false },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: true },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    it("shows tab bar when all three tabs are visible", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: true },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);
      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    it("counts Browse with comingSoon as visible for tab count", () => {
      // When Browse has comingSoon: true (not show: true), it should still count
      // This tests the RBAC scenario where browse has { show: false, comingSoon: true }
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          customerRoleId: "3",
          workspaceId: RBAC_WORKSPACE_ID,
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: true },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      // Role "3" has browse.comingSoon: true, so 3 tabs should show
      renderWithTheme(<ToggleTabs />);
      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles missing workspaceId by using displayMode.VIEWS", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          workspaceId: undefined,
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: false },
            BROWSE: { SHOW: false },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      // Only one tab visible = returns null
      const { container } = renderWithTheme(<ToggleTabs />);
      expect(container.firstChild).toBeNull();
    });

    it("sets displayModeJSON in config for downstream components", () => {
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: false },
            BROWSE: { SHOW: true },
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);

      expect(mockSetConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          displayModeJSON: expect.objectContaining({
            chat: { show: true },
            search: { show: false },
            browse: { show: true },
          }),
        })
      );
    });

    it("handles undefined userData by using displayMode.VIEWS", () => {
      const mockState = createMockState({
        displayModeViews: {
          CHAT: { SHOW: true },
          SEARCH: { SHOW: true },
          BROWSE: { SHOW: false },
        },
      });
      // Explicitly set userData to undefined
      mockState.userData = undefined;

      vi.mocked(useGlobalState).mockReturnValue(
        mockState as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);

      expect(screen.getByText("Chat")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.queryByText("Browse")).not.toBeInTheDocument();
    });

    it("handles userData without user_metadata by using displayMode.VIEWS", () => {
      const mockState = createMockState({
        displayModeViews: {
          CHAT: { SHOW: false },
          SEARCH: { SHOW: true },
          BROWSE: { SHOW: true },
        },
      });
      // Set userData without user_metadata
      (mockState as { userData: unknown }).userData = { email: "test@example.com" };

      vi.mocked(useGlobalState).mockReturnValue(
        mockState as unknown as ReturnType<typeof useGlobalState>
      );

      renderWithTheme(<ToggleTabs />);

      expect(screen.queryByText("Chat")).not.toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });
  });

  describe("Regression test for the bug fix", () => {
    it("respects displayMode.VIEWS when customerRoleId is not present (THE FIX)", () => {
      // This is the exact scenario that was broken before the fix:
      // - No customerRoleId in token
      // - displayMode.VIEWS configured to hide Search and Browse
      // BEFORE FIX: All tabs would show (rolesTabsConfig.defaultBehavior)
      // AFTER FIX: Only Chat shows (respects config.displayMode.VIEWS)
      vi.mocked(useGlobalState).mockReturnValue(
        createMockState({
          // No customerRoleId - simulating non-RBAC workspace
          customerRoleId: undefined,
          workspaceId: "some-non-rbac-workspace",
          displayModeViews: {
            CHAT: { SHOW: true },
            SEARCH: { SHOW: false }, // Should hide Search tab
            BROWSE: { SHOW: false }, // Should hide Browse tab
          },
        }) as unknown as ReturnType<typeof useGlobalState>
      );

      // With the fix, only Chat should be visible - but since only 1 tab, returns null
      const { container } = renderWithTheme(<ToggleTabs />);
      expect(container.firstChild).toBeNull();
    });
  });
});
