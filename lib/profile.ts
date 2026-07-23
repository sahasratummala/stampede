function parseInterestValue(value: unknown, depth = 0): string[] {
  if (depth > 6 || value == null) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => parseInterestValue(item, depth + 1));
  }

  if (typeof value !== "string") return [];

  const text = value.trim();
  if (!text) return [];

  // Handles JSON arrays and values that were JSON-stringified more than once.
  if (
    (text.startsWith("[") && text.endsWith("]")) ||
    (text.startsWith('"') && text.endsWith('"'))
  ) {
    try {
      const parsed = JSON.parse(text);
      if (parsed !== text) return parseInterestValue(parsed, depth + 1);
    } catch {
      // Some legacy values look like [Indie, Rock], which is not valid JSON.
    }
  }

  const hasWrapper =
    (text.startsWith("[") && text.endsWith("]")) ||
    (text.startsWith("{") && text.endsWith("}")) ||
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"));

  if (hasWrapper) {
    return parseInterestValue(text.slice(1, -1), depth + 1);
  }

  return text.split(",").map((item) =>
    item
      .trim()
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/^[\s"'[\]{}\\]+|[\s"'[\]{}\\]+$/g, "")
  );
}

export function normalizeInterests(value: unknown): string[] {
  const unique = new Map<string, string>();

  for (const interest of parseInterestValue(value)) {
    const cleaned = interest.trim();
    if (cleaned) unique.set(cleaned.toLocaleLowerCase(), cleaned);
  }

  return [...unique.values()];
}
