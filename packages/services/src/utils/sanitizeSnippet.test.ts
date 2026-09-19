import { describe, it, expect } from "vitest";
import { sanitizeSnippet, snippetToSegments } from "./sanitizeSnippet";

describe("snippetToSegments", () => {
  it("splits ts_headline output into plain and highlighted segments", () => {
    expect(
      snippetToSegments("must complete 40 <mark>hours</mark> of approved"),
    ).toEqual([
      { text: "must complete 40 ", highlighted: false },
      { text: "hours", highlighted: true },
      { text: " of approved", highlighted: false },
    ]);
  });

  it("handles several highlights and a leading highlight", () => {
    expect(
      snippetToSegments("<mark>Hours</mark> are reported. 10 <mark>hours</mark>"),
    ).toEqual([
      { text: "Hours", highlighted: true },
      { text: " are reported. 10 ", highlighted: false },
      { text: "hours", highlighted: true },
    ]);
  });

  it("drops every tag other than <mark> but keeps its text", () => {
    expect(
      snippetToSegments('<b>bold</b> <img src=x onerror="alert(1)"> <mark>x</mark>'),
    ).toEqual([
      { text: "bold  ", highlighted: false },
      { text: "x", highlighted: true },
    ]);
  });

  it("neutralises script tags", () => {
    const segments = snippetToSegments("<script>alert(1)</script>fee");
    expect(segments).toEqual([{ text: "alert(1)fee", highlighted: false }]);
    expect(segments.some((s) => s.text.includes("<"))).toBe(false);
  });

  it("decodes common entities", () => {
    expect(snippetToSegments("dues &amp; fees &lt;$75&gt;")).toEqual([
      { text: "dues & fees <$75>", highlighted: false },
    ]);
  });

  it("returns an empty list for empty input", () => {
    expect(snippetToSegments("")).toEqual([]);
    expect(snippetToSegments(null)).toEqual([]);
    expect(snippetToSegments(undefined)).toEqual([]);
  });

  it("leaves plain text untouched", () => {
    expect(snippetToSegments("no highlights here")).toEqual([
      { text: "no highlights here", highlighted: false },
    ]);
  });
});

describe("sanitizeSnippet", () => {
  it("returns the plain text with all tags removed", () => {
    expect(sanitizeSnippet("a <mark>b</mark> <i>c</i>")).toBe("a b c");
  });
});
