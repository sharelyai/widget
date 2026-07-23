export function tryParseJSON<T = any>(input: string): T | null {
  const isLikelyJson = (str: string): boolean => {
    const trimmed = str.trim();
    return (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    );
  };

  try {
    const firstParse = JSON.parse(input);

    // If it's still a string, might be double-encoded
    if (typeof firstParse === "string" && isLikelyJson(firstParse)) {
      try {
        const secondParse = JSON.parse(firstParse);
        return secondParse as T;
      } catch {
        // Not valid JSON on second parse
        return null;
      }
    }

    // If already an object or array
    if (typeof firstParse === "object" && firstParse !== null) {
      return firstParse as T;
    }

    return null;
  } catch {
    return null; // Not valid JSON
  }
}
