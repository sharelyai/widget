import type { AgentMessage } from "../types/agent";

interface RecoveryContext {
  /** Assistant messages the client already had before this turn started. */
  assistantsBefore: number;
  /** Message id from "message_start", or null if the stream died before it. */
  expectedId: string | null;
}

/**
 * Decide whether a thread fetched after a broken stream actually contains the
 * answer for the turn that broke.
 *
 * The client is recovering from a hole, so it cannot simply render the last
 * message it sees: on a turn that failed before the server wrote anything,
 * that would silently present the *previous* answer as a reply to the new
 * question. The turn only counts as recovered when the thread ends in an
 * assistant message that has content, that did not exist before this turn,
 * and — when the stream got far enough to name it — that has the expected id.
 */
export function isRecoveredTurn(
  serverMessages: AgentMessage[],
  { assistantsBefore, expectedId }: RecoveryContext,
): boolean {
  const last = serverMessages[serverMessages.length - 1];
  if (!last || last.role !== "assistant") return false;
  if (!last.content?.trim()) return false;

  const assistantsAfter = serverMessages.filter(
    (m) => m.role === "assistant",
  ).length;
  if (assistantsAfter <= assistantsBefore) return false;

  if (expectedId && last.id !== expectedId) return false;

  return true;
}
