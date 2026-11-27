const DARK_TEXT = '#1b1d24';
const LIGHT_TEXT = '#ffffff';

// Tag colours are picked freely in the admin panel, so the label colour has to be
// derived: whichever of dark/light text has the higher WCAG contrast on the swatch.
export function getReadableTextColor(background: string): string | null {
  const rgb = parseHex(background);
  if (!rgb) return null;

  const bgLuminance = relativeLuminance(rgb);
  const contrastWithDark = (bgLuminance + 0.05) / (relativeLuminance(parseHex(DARK_TEXT)!) + 0.05);
  const contrastWithLight = 1.05 / (bgLuminance + 0.05);
  return contrastWithDark >= contrastWithLight ? DARK_TEXT : LIGHT_TEXT;
}

function parseHex(value: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const hex = match[1].length === 3 ? [...match[1]].map(c => c + c).join('') : match[1];
  return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [r, g, b].map(channel => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}
