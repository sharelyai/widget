import { describe, it, expect } from "vitest";
import { isRecoveredTurn } from "./streamRecovery";
import type { AgentMessage } from "../types/agent";

function msg(
  role: AgentMessage["role"],
  content: string | null,
  id = `${role}-${content}`,
): AgentMessage {
  return {
    id,
    role,
    content,
    thinkingSteps: [],
    toolCalls: [],
    sources: [],
    tokenUsage: null,
    model: null,
    finishReason: null,
    createdAt: new Date().toISOString(),
  };
}

describe("isRecoveredTurn", () => {
  it("recovers the answer the server persisted for this turn", () => {
    const server = [
      msg("user", "what do i need to do as a new TL?"),
      msg("assistant", "Here are the steps...", "answer-1"),
    ];
    expect(
      isRecoveredTurn(server, { assistantsBefore: 0, expectedId: "answer-1" }),
    ).toBe(true);
  });

  it("recovers when the stream died before message_start named the id", () => {
    const server = [
      msg("user", "question"),
      msg("assistant", "Here are the steps..."),
    ];
    expect(
      isRecoveredTurn(server, { assistantsBefore: 0, expectedId: null }),
    ).toBe(true);
  });

  it("does not pass off the previous turn's answer as this one", () => {
    // Turn 2 failed before the server wrote anything: the thread still ends
    // in turn 1's answer, which must not be rendered as the new reply.
    const server = [
      msg("user", "first"),
      msg("assistant", "first answer"),
      msg("user", "second"),
    ];
    expect(
      isRecoveredTurn(server, { assistantsBefore: 1, expectedId: null }),
    ).toBe(false);
  });

  it("rejects a persisted row that has no content yet", () => {
    const server = [msg("user", "question"), msg("assistant", "")];
    expect(
      isRecoveredTurn(server, { assistantsBefore: 0, expectedId: null }),
    ).toBe(false);
    const nullContent = [msg("user", "question"), msg("assistant", null)];
    expect(
      isRecoveredTurn(nullContent, { assistantsBefore: 0, expectedId: null }),
    ).toBe(false);
  });

  it("rejects whitespace-only content", () => {
    const server = [msg("user", "question"), msg("assistant", "   \n ")];
    expect(
      isRecoveredTurn(server, { assistantsBefore: 0, expectedId: null }),
    ).toBe(false);
  });

  it("rejects a message whose id is not the streaming one", () => {
    const server = [
      msg("user", "question"),
      msg("assistant", "some other answer", "answer-2"),
    ];
    expect(
      isRecoveredTurn(server, { assistantsBefore: 0, expectedId: "answer-1" }),
    ).toBe(false);
  });

  it("rejects an empty or user-terminated thread", () => {
    expect(
      isRecoveredTurn([], { assistantsBefore: 0, expectedId: null }),
    ).toBe(false);
    expect(
      isRecoveredTurn([msg("user", "question")], {
        assistantsBefore: 0,
        expectedId: null,
      }),
    ).toBe(false);
  });
});
