import { useEffect, useMemo, useRef, useState } from "react";
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
  classNames,
  constants,
  formatDate,
  useGlobalStore,
  useSpace,
  useSharelyContext,
} from "@sharelyai/widget-services";

import { Wrapper } from "./styles";

interface ChatHistoryProps {
  version?: string;
  onClose: () => void;
  handleCreateNewChat: () => void;
}

export interface IGroupConversation {
  id: string;
  name: string;
  type?: string;
  lastMessageAt?: string;
  threadId?: string;
}

interface GroupedChats {
  date: string;
  chats: IGroupConversation[];
}

export const ChatHistory = (props: ChatHistoryProps) => {
  const { version, onClose, handleCreateNewChat } = props;

  const [values, setValues] = useState({ id: "" });
  const [isExpanded, setIsExpanded] = useState(false);
  const [newChatName, setNewChatName] = useState<string>("");
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [optionsVisible, setOptionsVisible] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState(false);

  const {
    userData,
    currentInformation,
    setCurrentView,
    setStepActive,
    setCurrentInformation,
  } = useGlobalStore();

  const { space, spaceOptions, spaceMutate } = useSpace({
    spaceId: currentInformation?.spaceId,
  }) as { space: any; spaceOptions: any; spaceMutate: any };

  const { apiClient } = useSharelyContext();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const groups = space?.spaceGroupConversation;

  useEffect(() => {
    setTimeout(() => setIsExpanded(true), 0);
  }, []);

  const toggleOptions = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setOptionsVisible((prev) => (prev === chatId ? null : chatId));
  };

  const handleConfirmDeleteChat = async () => {
    setIsOpenModal(false);

    if (!values?.id) return;

    try {
      await apiClient.fetcher(
        `/spaces/${currentInformation?.spaceId}/groups/${values?.id}`,
        {
          method: "DELETE",
        },
      );

      const updatedGroups = groups?.filter(
        (group: any) => group.id !== values.id,
      );
      spaceMutate({
        ...space,
        spaceGroupConversation: updatedGroups,
      });

      const spaceChat = updatedGroups?.find(
        (chat: any) => chat.type === constants.SPACE,
      );

      if (spaceChat) {
        setCurrentInformation({
          currentGroupId: spaceChat?.id,
          currentName: spaceChat?.name,
        });
      }
    } catch (error) {
      console.error(error);
    }

    onClose();
  };

  const handleRenameChat = async (groupId: string, name: string) => {
    try {
      await apiClient.fetcher(
        `/spaces/${currentInformation?.spaceId}/groups/${groupId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name,
            groupId,
          }),
        },
      );

      spaceMutate({
        ...space,
        spaceGroupConversation: space?.spaceGroupConversation?.map(
          (group: any) => (group.id === groupId ? { ...group, name } : group),
        ),
      });
      setEditingChatId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetChat = (group: IGroupConversation) => {
    const hasInteracted =
      groups?.find((chat: any) => chat?.id === group?.id)
        ?.hasMoreThanOneMessage ?? false;

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
    onClose();
  };

  const groupChatsByDate = (
    chats: IGroupConversation[] = [],
  ): GroupedChats[] => {
    if (!chats) return [];
    const grouped = chats?.reduce(
      (acc: Record<string, IGroupConversation[]>, chat) => {
        if (!chat.lastMessageAt) return acc;
        const dateKey = new Date(chat.lastMessageAt).toLocaleDateString(
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
  }, [groups]);

  const shouldBeShowOptions = groups && groups.length > 1;
  const isPublicSpace =
    space?.status === constants.SPACE_STATUS_PUBLIC || spaceOptions?.isLoading;

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
              // auth handle signOut
              onClose();
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
              disabled={spaceOptions?.isLoading}
            >
              <AddChatBox />
              New chat
            </button>
          </div>
          <div className="chat-history-body">
            {spaceOptions?.isLoading && (
              <div className="loading-component">
                <Loader text="Loading..." type="card-loading" />
              </div>
            )}
            {!spaceOptions?.isLoading && (
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
                                  "selected-chat-preview":
                                    chat?.id ===
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
                                    onChange={(e) =>
                                      setNewChatName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter")
                                        handleRenameChat(chat.id, newChatName);
                                      if (e.key === "Escape")
                                        setEditingChatId(null);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="chat-history-edit-chat-actions">
                                    <Check
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRenameChat(chat.id, newChatName);
                                      }}
                                    />
                                    <Close
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingChatId(null);
                                      }}
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
                                      </div>
                                    )}
                                    {showOptions && (
                                      <div className="chat-history-actions-options">
                                        <button
                                          className="chat-history-actions-option"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingChatId(chat.id);
                                            setNewChatName(chat.name);
                                            setOptionsVisible(null);
                                          }}
                                        >
                                          Rename
                                        </button>
                                        <button
                                          className="chat-history-actions-option"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setValues({ id: chat.id });
                                            setIsOpenModal(true);
                                            setOptionsVisible(null);
                                          }}
                                        >
                                          Delete
                                        </button>
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
                        <img src={userData.photo} alt="User" />
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
