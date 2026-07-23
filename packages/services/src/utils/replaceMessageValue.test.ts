import { describe, it, expect } from "vitest";
import { replaceMessageValue } from "./replaceMessageValue";

describe("replaceMessageValue", () => {
  it("returns plain text unchanged", () => {
    expect(replaceMessageValue({ message: "Hello world" })).toBe("Hello world");
  });

  it("strips ::0 and ::1 markers", () => {
    expect(replaceMessageValue({ message: "text::0" })).toBe("text");
    expect(replaceMessageValue({ message: "text::1" })).toBe("text");
  });

  it("removes AI_TOOL_MARKER", () => {
    expect(
      replaceMessageValue({ message: "before AI_TOOL_MARKER after" }),
    ).toBe("before  after");
  });

  it("removes !API! loading markers", () => {
    expect(replaceMessageValue({ message: "loading !API! done" })).toBe(
      "loading  done",
    );
  });

  it("removes [source] without parentheses", () => {
    expect(replaceMessageValue({ message: "text [source] more" })).toBe(
      "text  more",
    );
  });

  it("transforms document anchor [label](pageNum:file:uuid)", () => {
    const result = replaceMessageValue({
      message: "[click](3:report.pdf:abc-123)",
    });
    expect(result).toContain("report.pdf");
    expect(result).toContain("P3");
  });

  it("preserves full URL markdown links with path", () => {
    // URLs with 3+ colon-separated parts (https://host/path) hit the URL check
    const result = replaceMessageValue({
      message: "[Google](https://google.com/search)",
    });
    expect(result).toContain("google.com");
  });

  it("handles JSON content with result markdown", () => {
    const json = JSON.stringify({ result: { markdown: "formatted content" } });
    const result = replaceMessageValue({ message: json });
    expect(result).toContain("formatted content");
  });
});
