import { describe, it, expect } from "vitest";
import { mergeSearchResults } from "./mergeSearchResults";

const ids = (arr: any[]) => arr.map((i) => i.id);
const sources = (arr: any[]) => arr.map((i) => i.source);

// Shapes from the spec's "hours" sample on the Riverside estate.
const title = [{ id: "ce", title: "How to Report Your CE Hours" }];
const lexical = [
  { id: "ce", title: "How to Report Your CE Hours", snippet: "<mark>CE</mark>" },
  { id: "req", title: "Continuing Education Requirements", snippet: "40 <mark>hours</mark>" },
  { id: "renewal", title: "Certification Renewal Policy", snippet: "50 <mark>hours</mark>" },
];
const semantic = [
  { id: "ce", score: 0.8, description: "…" },
  { id: "req", score: 0.75, description: "…" },
  { id: "dues", score: 0.71, description: "…" },
  { id: "ethics", score: 0.69, description: "…" },
];

describe("mergeSearchResults", () => {
  it("orders title → lexical → semantic", () => {
    const out = mergeSearchResults({ title, lexical, semantic });
    expect(ids(out)).toEqual(["ce", "req", "renewal", "dues", "ethics"]);
    expect(sources(out)).toEqual([
      "title",
      "lexical",
      "lexical",
      "semantic",
      "semantic",
    ]);
  });

  it("keeps an item once, from the earliest list that returned it", () => {
    const out = mergeSearchResults({ title, lexical, semantic });
    const ce = out.filter((i) => i.id === "ce");
    expect(ce).toHaveLength(1);
    expect(ce[0].source).toBe("title");
    // The lexical snippet for "ce" is dropped with its duplicate row.
    expect(ce[0].snippet).toBeUndefined();
  });

  it("dedupes by id, not by title", () => {
    const out = mergeSearchResults({
      title: [{ id: "a", title: "Same title" }],
      lexical: [{ id: "b", title: "Same title" }],
    });
    expect(ids(out)).toEqual(["a", "b"]);
  });

  it("dedupes within a single list", () => {
    const out = mergeSearchResults({
      semantic: [{ id: "a" }, { id: "a" }, { id: "b" }],
    });
    expect(ids(out)).toEqual(["a", "b"]);
  });

  it("with no lexical results is identical to the title + semantic merge", () => {
    const withEmpty = mergeSearchResults({ title, lexical: [], semantic });
    const withoutKey = mergeSearchResults({ title, semantic });
    expect(withEmpty).toEqual(withoutKey);
    expect(ids(withEmpty)).toEqual(["ce", "req", "dues", "ethics"]);
  });

  it("treats a non-array lexical response as empty", () => {
    const out = mergeSearchResults({
      title,
      lexical: { code: "LEXICAL_SEARCH_DISABLED" },
      semantic,
    });
    expect(ids(out)).toEqual(["ce", "req", "dues", "ethics"]);
  });

  it("falls back to title dedupe for rows without an id", () => {
    const out = mergeSearchResults({
      title: [{ title: "Legacy" }],
      semantic: [{ title: "Legacy" }, { title: "Other" }],
    });
    expect(out.map((i) => i.title)).toEqual(["Legacy", "Other"]);
  });

  it("does not mutate the input arrays", () => {
    const copy = JSON.parse(JSON.stringify(lexical));
    mergeSearchResults({ lexical });
    expect(lexical).toEqual(copy);
  });
});
