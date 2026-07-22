type ConversationMessage = {
  type?: string;
  role?: string;
};

const isUser = (m: ConversationMessage): boolean =>
  m?.type === "USER" || m?.role === "user";

const isAssistant = (m: ConversationMessage): boolean =>
  m?.type === "AI" || m?.role === "assistant";

export const shouldTriggerAutoRename = (
  messages: ConversationMessage[] | undefined | null,
  order: "asc" | "desc" = "asc"
): boolean => {
  if (!messages || messages.length === 0) return false;
  const ordered = order === "desc" ? [...messages].reverse() : messages;
  const firstUserIdx = ordered.findIndex(isUser);
  if (firstUserIdx === -1) return false;
  return ordered.slice(firstUserIdx + 1).some(isAssistant);
};
