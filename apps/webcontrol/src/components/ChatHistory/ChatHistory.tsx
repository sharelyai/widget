import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

import { Wrapper } from "./styles";
import {
  AddChatBox,
  ArrowForward,
  Check,
  Close,
  MoreVert,
  Person,
  Loader,
  Dialog,
  Tooltip,
  ScrollBar,
  UserMenu,
  Portal,
} from "@sharelyai/widget-ui-shared";
import {
  useGlobalStore,
  useSpace,
  useAuth,
  useSharelyContext,
  useAgentThreads,
  classNames,
  constants,
  formatDate,
} from "@sharelyai/widget-services";

interface ChatHistoryProps {
  version?: string;
  isAgentMode?: boolean;
  onClose?: () => void;
  handleCreateNewChat: () => void;
}

export interface IGroupConversation {
  id: string;
  name: string;
  type?: string;
  lastMessageAt?: string;
  threadId?: string;
  hasMoreThanOneMessage?: boolean;
}

interface GroupedChats {
  date: string;
  chats: IGroupConversation[];
}

const initialValues = {
  id: "",
};

export const ChatHistory = (props: ChatHistoryProps) => {
  const { version, isAgentMode, onClose, handleCreateNewChat } = props;

  const [values, setValues] = useState(initialValues);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newChatName, setNewChatName] = useState<string>("");
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [optionsVisible, setOptionsVisible] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(false);

  const {
    currentInformation,
    setCurrentView,
    setStepActive,
    setCurrentInformation,
    userData,
  } = useGlobalStore();

  const { apiClient } = useSharelyContext();
  const { signOut } = useAuth();

  const { space, spaceOptions, spaceMutate } = useSpace({
    spaceId: currentInformation?.spaceId,
  });

  const agentThreads = useAgentThreads({
    spaceId: currentInformation?.spaceId || "",
    autoFetch: !!isAgentMode,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const regularGroups = (space as any)?.spaceGroupConversation as
    | IGroupConversation[]
    | undefined;

  // When in agent mode, map agent threads to IGroupConversation format
  const agentGroups: IGroupConversation[] | undefined = isAgentMode
    ? agentThreads.threads.map((thread) => ({
        id: thread.id,
        name: thread.title || "New chat",
        lastMessageAt: thread.updatedAt || thread.createdAt,
      }))
    : undefined;

  const groups = isAgentMode ? agentGroups : regularGroups;

  useEffect(() => {
    const updateButtonsHeight = () => {
      if (buttonsRef.current) {
        const buttonsHeight = buttonsRef.current.offsetHeight;
        document.documentElement.style.setProperty(
          "--buttons-height",
          `${buttonsHeight}px`,
        );
      }
    };

    updateButtonsHeight();
    window.addEventListener("resize", updateButtonsHeight);

    return () => {
      window.removeEventListener("resize", updateButtonsHeight);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".chat-history-actions-options")) {
        setOptionsVisible(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setTimeout(() => setIsExpanded(true), 0);
  }, []);

  const toggleOptions = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setOptionsVisible((prev) => (prev === chatId ? null : chatId));
  };

  const closeOptions = () => setOptionsVisible(null);

  const handleConfirmDeleteChat = async () => {
    setIsOpenModal(false);

    if (!values?.id) return;

    if (isAgentMode) {
      try {
        await agentThreads.deleteThread(values.id);
        // If the deleted thread was the current one, clear the selection
        if (currentInformation?.agentThreadId === values.id) {
          setCurrentInformation({
            agentThreadId: undefined,
            agentThreadName: undefined,
          });
        }
      } catch (error) {
        console.error(error);
      }
      onClose?.();
      return;
    }

    try {
      const response = await apiClient.fetcher(
        `/spaces/${currentInformation?.spaceId}/groups/${values?.id}`,
        { method: "DELETE" },
      );

      if (response) {
        const updatedGroups = groups?.filter((group) => group.id !== values.id);
        spaceMutate((prev: any) => {
          return {
            ...prev,
            spaceGroupConversation: updatedGroups,
          };
        });
        const spaceChat = updatedGroups?.find(
          (chat) => chat.type === constants.SPACE,
        );

        if (spaceChat) {
          setCurrentInformation({
            currentGroupId: spaceChat?.id,
            currentName: spaceChat?.name,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }

    onClose?.();
  };

  const handleRenameChat = async (groupId: string, name: string) => {
    if (isAgentMode) {
      try {
        await agentThreads.updateThread(groupId, { title: name });
        setEditingChatId(null);
      } catch (error) {
        console.error(error);
      }
      return;
    }

    try {
      const response = await apiClient.fetcher(
        `/spaces/${currentInformation?.spaceId}/groups/${groupId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name,
            groupId,
          }),
        },
      );

      if (response) {
        spaceMutate((prev: any) => {
          const updatedGroups = prev?.spaceGroupConversation?.map(
            (group: IGroupConversation) =>
              group.id === groupId ? { ...group, name } : group,
          );
          return {
            ...prev,
            spaceGroupConversation: updatedGroups,
          };
        });
        setEditingChatId(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetChat = (group: IGroupConversation) => {
    if (isAgentMode) {
      setCurrentInformation({
        agentThreadId: group.id,
        agentThreadName: group.name,
      });
      setCurrentView(constants.AGENT_VIEW);
      onClose?.();
      return;
    }

    const hasInteracted =
      groups?.find((chat) => chat?.id === group?.id)?.hasMoreThanOneMessage ??
      false;

    setCurrentInformation({
      currentGroupId: group?.id,
      currentName: group?.name,
      thread: {
        threadId: group?.threadId,
        hasInteracted: hasInteracted,
      },
      preview: true,
    });
    setCurrentView(constants.CHAT_VIEW);
    setStepActive(constants.CHAT_STEP);
    onClose?.();
  };

  const handleRename = (chatId: string, currentName: string) => {
    setEditingChatId(chatId);
    setNewChatName(currentName);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleEditChatTitle = (chatId: string) => {
    if (newChatName.trim().length > 0) {
      handleRenameChat(chatId, newChatName.trim());
    }
  };

  const handleDeleteChat = (id: string) => {
    setIsOpenModal(true);
    setValues({ id });
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setNewChatName(e.target.value);
  };

  const handleSaveEditName = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    handleEditChatTitle(chatId);
  };

  const handleCancelEditName = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  const handleOnKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    chatId: string,
  ) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleEditChatTitle(chatId);
    }
    if (e.key === "Escape") {
      setEditingChatId(null);
    }
  };

  const groupChatsByDate = (
    chats: IGroupConversation[] = [],
  ): GroupedChats[] => {
    if (!chats) return [];
    const grouped = chats?.reduce(
      (acc: Record<string, IGroupConversation[]>, chat) => {
        const dateKey = new Date(chat.lastMessageAt!).toLocaleDateString(
          "us-US",
        );
        acc[dateKey] = acc[dateKey] || [];
        acc[dateKey].push(chat);
        return acc;
      },
      {},
    );

    return Object.entries(grouped)
      .map(([date, chats]) => ({ date, chats }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const groupedChats = useMemo(() => {
    return groupChatsByDate(groups);
  }, [
    groups,
    isAgentMode,
    agentThreads.threads,
    (space as any)?.spaceGroupConversation,
  ]);

  const isLoadingData = isAgentMode
    ? agentThreads.isLoading
    : spaceOptions?.isLoading;
  const shouldBeShowOptions = isAgentMode
    ? (groups?.length ?? 0) > 0
    : (groups?.length ?? 0) > 1;
  const isPublicSpace =
    (space as any)?.status === constants.SPACE_STATUS_PUBLIC ||
    spaceOptions?.isLoading;

  return (
    <Portal>
      <Wrapper version={version}>
        {isOpenModal && (
          <Dialog
            isOpen={isOpenModal}
            onClose={() => setIsOpenModal(false)}
            onConfirm={handleConfirmDeleteChat}
            title="Are you sure you want to delete this chat?"
            description="Deleting this chat will permanently remove all messages. This action cannot be undone or reversed."
            buttonConfirmText="Yes, delete chat"
            buttonCancelText="No, do not delete"
          />
        )}
        {!isPublicSpace && (
          <UserMenu
            left={20}
            bottom={80}
            isOpen={openMenu}
            user={userData}
            signOut={() => {
              signOut();
              onClose?.();
            }}
            onClose={() => setOpenMenu(false)}
          />
        )}
        <div className="chat-history-background" onClick={onClose}></div>
        <div className={classNames("chat-history", { expanded: isExpanded })}>
          <div className="chat-history-header">
            <div className="chat-history-header-title">Threads</div>
            <div className="chat-history-header-close" onClick={onClose}>
              <Tooltip text="Close" placement="bottom">
                <Close />
              </Tooltip>
            </div>
          </div>
          <div ref={buttonsRef}>
            <button
              className="chat-history-menu-button"
              onClick={handleCreateNewChat}
              disabled={!!isLoadingData}
            >
              <AddChatBox />
              New chat
            </button>
          </div>
          <div className="chat-history-body">
            {isLoadingData && (
              <div className="loading-component">
                <Loader text="Loading..." type="card-loading" />
              </div>
            )}
            {!isLoadingData && (
              <ScrollBar options={{ suppressScrollX: true }}>
                {groupedChats?.map((group, index) => {
                  const isToday =
                    group?.date === new Date().toLocaleDateString("us-US");
                  const isYesterday =
                    group?.date ===
                    new Date(
                      new Date().setDate(new Date().getDate() - 1),
                    ).toLocaleDateString("us-US");

                  return (
                    <div
                      key={index}
                      className="chat-history-body-container-period"
                    >
                      <div className="chat-history-period-title">
                        {isYesterday && "Yesterday"}
                        {isToday && "Today"}
                        {!isToday &&
                          !isYesterday &&
                          formatDate(group?.date, "SHORT")}
                      </div>
                      <div className="chat-history-group-chats">
                        {group?.chats?.map((chat) => {
                          const isEditing = editingChatId === chat?.id;
                          const showOptions = optionsVisible === chat?.id;

                          return (
                            <div
                              role="tab"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleGetChat(chat);
                                }
                              }}
                              key={chat?.id}
                              className={classNames(
                                "chat-history-period-history",
                                {
                                  "selected-chat-preview": isAgentMode
                                    ? chat?.id ===
                                      currentInformation?.agentThreadId
                                    : chat?.id ===
                                      currentInformation?.currentGroupId,
                                },
                              )}
                              onClick={() => handleGetChat(chat)}
                            >
                              {isEditing && (
                                <div className="chat-history-edit-chat-name">
                                  <input
                                    ref={inputRef}
                                    type="text"
                                    value={newChatName}
                                    onChange={handleOnChange}
                                    onKeyDown={(e) => {
                                      handleOnKeyDown(e, chat?.id);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="chat-history-edit-chat-actions">
                                    <Check
                                      onClick={(e: React.MouseEvent) =>
                                        handleSaveEditName(e, chat?.id)
                                      }
                                    />
                                    <Close
                                      onClick={(e: React.MouseEvent) =>
                                        handleCancelEditName(e)
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                              {!isEditing && (
                                <div className="chat-history-chat-name">
                                  <span className="chat-history-chat-name-title">
                                    {chat?.name}
                                  </span>
                                  <div className="chat-history-actions">
                                    {shouldBeShowOptions && (
                                      <div
                                        className="chat-history-actions-menu"
                                        onClick={(e) =>
                                          toggleOptions(e, chat?.id)
                                        }
                                      >
                                        <Tooltip
                                          text="Options"
                                          placement="bottom"
                                        >
                                          <MoreVert />
                                        </Tooltip>
                                        {showOptions && (
                                          <div className="chat-history-actions-options">
                                            <button
                                              className="chat-history-actions-option"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRename(
                                                  chat?.id,
                                                  chat?.name,
                                                );
                                                closeOptions();
                                              }}
                                            >
                                              Rename
                                            </button>
                                            <button
                                              className="chat-history-actions-option"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteChat(chat?.id);
                                                closeOptions();
                                              }}
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </ScrollBar>
            )}
          </div>
          {version !== "v2" && (
            <div className="chat-history-footer">
              {!isPublicSpace && (
                <div
                  className="private-space"
                  onClick={() => setOpenMenu((prev) => !prev)}
                >
                  <div className="user-info">
                    <div className="photo">
                      {userData?.photo && (
                        <img src={userData?.photo} alt="User" />
                      )}
                      {!userData?.photo && <Person />}
                    </div>
                    <span>{userData?.name}</span>
                  </div>
                  <div className={classNames("icon", { open: openMenu })}>
                    <ArrowForward />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Wrapper>
    </Portal>
  );
};
