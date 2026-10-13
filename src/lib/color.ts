const DARK_TEXT = '#1d130c';
const LIGHT_TEXT = '#ffffff';

function channel(hex: string, index: number): number {
  const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);
}

function contrast(a: number, b: number): number {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

const cache = new Map<string, string>();

/** Picks whichever of near-black or white reads better on the given #rrggbb background. */
export function textColorOn(background: string): string {
  let result = cache.get(background);
  if (!result) {
    const lum = luminance(background);
    result = contrast(lum, luminance(DARK_TEXT)) >= contrast(lum, 1) ? DARK_TEXT : LIGHT_TEXT;
    cache.set(background, result);
  }
  return result;
}
