import { describe, it, expect } from "vitest";
import { tryParseJSON } from "./tryParseJson";

describe("tryParseJSON", () => {
  it("parses a valid JSON object string", () => {
    expect(tryParseJSON('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses a valid JSON array string", () => {
    expect(tryParseJSON("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("handles double-encoded JSON", () => {
    const inner = JSON.stringify({ foo: "bar" });
    const doubleEncoded = JSON.stringify(inner);
    expect(tryParseJSON(doubleEncoded)).toEqual({ foo: "bar" });
  });

  it("returns null for invalid JSON", () => {
    expect(tryParseJSON("not json")).toBeNull();
  });

  it("returns null for primitive JSON values (number, boolean)", () => {
    expect(tryParseJSON("42")).toBeNull();
    expect(tryParseJSON("true")).toBeNull();
  });

  it("returns null for double-encoded invalid inner JSON", () => {
    // A string that looks like JSON but isn't valid on second parse
    const encoded = JSON.stringify("{bad json}");
    expect(tryParseJSON(encoded)).toBeNull();
  });
});
