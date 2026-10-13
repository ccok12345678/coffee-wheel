export const WHEEL_FONT =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif';

let context: CanvasRenderingContext2D | null | undefined;
const cache = new Map<string, number>();

/** Width in CSS pixels of `text` rendered at `sizePx` in the wheel font. Falls back to an estimate. */
export function measureText(text: string, sizePx: number, weight = 500): number {
  const key = `${weight}|${sizePx}|${text}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  if (context === undefined) {
    context = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
  }
  let width: number;
  if (context) {
    context.font = `${weight} ${sizePx}px ${WHEEL_FONT}`;
    width = context.measureText(text).width;
  } else {
    // Rough estimate: CJK glyphs are ~1em wide, Latin ~0.56em.
    width = [...text].reduce((sum, ch) => sum + (ch.charCodeAt(0) > 0x2e80 ? 1 : 0.56), 0) * sizePx;
  }
  cache.set(key, width);
  return width;
}

/** Splits a label into two lines at a natural break, or returns null when there is none. */
export function splitLabel(text: string): [string, string] | null {
  const slash = Math.max(text.indexOf('/'), text.indexOf('／'));
  if (slash > 0 && slash < text.length - 1) return [text.slice(0, slash + 1), text.slice(slash + 1)];
  const comma = text.indexOf(', ');
  if (comma > 0) return [text.slice(0, comma + 1), text.slice(comma + 2)];
  const middle = Math.floor(text.length / 2);
  let best = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ' && (best < 0 || Math.abs(i - middle) < Math.abs(best - middle))) best = i;
  }
  if (best > 0) return [text.slice(0, best), text.slice(best + 1)];
  return null;
}
