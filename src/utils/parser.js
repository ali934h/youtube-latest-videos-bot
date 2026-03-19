// Parses user input to extract YouTube handle and video count
export function parseInput(text) {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const countStr = parts[parts.length - 1];
  const count = parseInt(countStr, 10);
  if (isNaN(count) || count < 1 || count > 50) return null;

  const rawHandle = parts.slice(0, parts.length - 1).join(' ');

  // Extract handle from full URL or @handle
  const urlMatch = rawHandle.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/@?([\w.-]+)/i);
  if (urlMatch) return { handle: urlMatch[1], count };

  const atMatch = rawHandle.match(/^@?([\w.-]+)$/);
  if (atMatch) return { handle: atMatch[1], count };

  return null;
}
