import { describe, expect, it } from "vitest";
import { shouldTriggerAutoRename } from "./conversation";

describe("shouldTriggerAutoRename", () => {
  it("returns false for empty / nullish input", () => {
    expect(shouldTriggerAutoRename([])).toBe(false);
    expect(shouldTriggerAutoRename(undefined)).toBe(false);
    expect(shouldTriggerAutoRename(null)).toBe(false);
  });

  it("returns false for greeting only", () => {
    expect(
      shouldTriggerAutoRename([{ role: "assistant" }])
    ).toBe(false);
  });

  it("returns false for greeting + user (no AI response yet)", () => {
    expect(
      shouldTriggerAutoRename([{ role: "assistant" }, { role: "user" }])
    ).toBe(false);
  });

  it("returns true for greeting + user + AI response", () => {
    expect(
      shouldTriggerAutoRename([
        { role: "assistant" },
        { role: "user" },
        { role: "assistant" },
      ])
    ).toBe(true);
  });

  it("returns true for user + AI (no greeting)", () => {
    expect(
      shouldTriggerAutoRename([{ role: "user" }, { role: "assistant" }])
    ).toBe(true);
  });

  it("returns false for user only", () => {
    expect(shouldTriggerAutoRename([{ role: "user" }])).toBe(false);
  });

  it("supports type-shaped messages (USER/AI)", () => {
    expect(
      shouldTriggerAutoRename([{ type: "USER" }, { type: "AI" }])
    ).toBe(true);
    expect(shouldTriggerAutoRename([{ type: "AI" }])).toBe(false);
  });

  it("handles desc-ordered (newest-first) arrays", () => {
    const newestFirst = [
      { type: "AI" },
      { type: "USER" },
      { type: "AI" },
    ];
    expect(shouldTriggerAutoRename(newestFirst, "desc")).toBe(true);

    const greetingOnlyDesc = [{ type: "AI" }];
    expect(shouldTriggerAutoRename(greetingOnlyDesc, "desc")).toBe(false);
  });
});
