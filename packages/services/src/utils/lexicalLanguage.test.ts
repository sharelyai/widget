import { describe, it, expect } from "vitest";
import { toLexicalLanguage } from "./lexicalLanguage";

describe("toLexicalLanguage", () => {
  it("passes en and es through", () => {
    expect(toLexicalLanguage("en")).toBe("en");
    expect(toLexicalLanguage("es")).toBe("es");
  });

  it("normalises regional variants and casing", () => {
    expect(toLexicalLanguage("EN")).toBe("en");
    expect(toLexicalLanguage("es-MX")).toBe("es");
    expect(toLexicalLanguage("en_US")).toBe("en");
  });

  it("defaults to en when no language is configured", () => {
    expect(toLexicalLanguage(undefined)).toBe("en");
    expect(toLexicalLanguage(null)).toBe("en");
    expect(toLexicalLanguage("")).toBe("en");
  });

  it("returns null for languages without a lexical index", () => {
    expect(toLexicalLanguage("pt")).toBeNull();
    expect(toLexicalLanguage("fr")).toBeNull();
    expect(toLexicalLanguage("zh-Hans")).toBeNull();
  });
});
