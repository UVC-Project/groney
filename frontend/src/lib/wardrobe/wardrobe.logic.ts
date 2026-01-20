export function getGroenySrc(
  selectedItemId: string | null,
  groenyGifMap: Record<string, string>,
  defaultGif: string
): string {
  if (selectedItemId && groenyGifMap[selectedItemId]) {
    return groenyGifMap[selectedItemId];
  }
  return defaultGif;
}
