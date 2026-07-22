import { describe, it, expect } from "vitest";
import { sortResults } from "./sortResults";

const items = [
  { title: "Banana", score: 0.4, createdAt: "2024-01-10T00:00:00Z" },
  { title: "apple", score: 0.9, createdAt: "2024-03-01T00:00:00Z" },
  { title: "Cherry", score: 0.6, createdAt: "2023-12-01T00:00:00Z" },
];

const titles = (arr: any[]) => arr.map((i) => i.title);

describe("sortResults", () => {
  it("relevance preserves the native API order (identity)", () => {
    const out = sortResults(items, "relevance");
    expect(titles(out)).toEqual(["Banana", "apple", "Cherry"]);
  });

  it("does not mutate the input array", () => {
    const copy = [...items];
    sortResults(items, "title-asc");
    expect(items).toEqual(copy);
  });

  it("title-asc sorts case-insensitively A→Z", () => {
    expect(titles(sortResults(items, "title-asc"))).toEqual([
      "apple",
      "Banana",
      "Cherry",
    ]);
  });

  it("title-desc sorts Z→A", () => {
    expect(titles(sortResults(items, "title-desc"))).toEqual([
      "Cherry",
      "Banana",
      "apple",
    ]);
  });

  it("date-desc sorts newest createdAt first", () => {
    expect(titles(sortResults(items, "date-desc"))).toEqual([
      "apple",
      "Banana",
      "Cherry",
    ]);
  });

  it("date-asc sorts oldest createdAt first", () => {
    expect(titles(sortResults(items, "date-asc"))).toEqual([
      "Cherry",
      "Banana",
      "apple",
    ]);
  });

  it("reads title from metadata.title when top-level title is absent", () => {
    const withMeta = [
      { metadata: { title: "Zed" } },
      { metadata: { title: "Alpha" } },
    ];
    expect(sortResults(withMeta, "title-asc")[0].metadata.title).toBe("Alpha");
  });

  it("reads createdAt from fallback paths (coreKnowledge / metadata)", () => {
    const mixed = [
      { title: "a", coreKnowledge: { createdAt: "2024-05-01T00:00:00Z" } },
      { title: "b", metadata: { createdAt: "2024-01-01T00:00:00Z" } },
    ];
    expect(sortResults(mixed, "date-desc").map((i) => i.title)).toEqual([
      "a",
      "b",
    ]);
  });

  it("treats missing/invalid dates as oldest", () => {
    const mixed = [
      { title: "hasDate", createdAt: "2024-01-01T00:00:00Z" },
      { title: "noDate" },
    ];
    expect(sortResults(mixed, "date-desc").map((i) => i.title)).toEqual([
      "hasDate",
      "noDate",
    ]);
  });

  it("returns non-array input unchanged", () => {
    expect(sortResults(undefined as any, "title-asc")).toBeUndefined();
  });
});
