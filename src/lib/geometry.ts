import { wheelDepth, type LaidOutNode } from '../data/flavors';
import { measureText, splitLabel } from './measureText';

export const VIEWBOX = 1000;
export const CENTER = VIEWBOX / 2;
export const R_OUTER = 494;
export const R_CENTER = 130;
const TAU = Math.PI * 2;

/**
 * The visible window of the wheel: an angular slice (fractions of the full circle), the zoom depth
 * and how many rings are drawn outward from the centre disc.
 */
export interface View {
  x0: number;
  x1: number;
  depth: number;
  levels: number;
}

export interface Arc {
  a0: number;
  a1: number;
  r0: number;
  r1: number;
}

/** `maxLevels` caps the rings shown, e.g. to keep a small screen's root view to the main categories. */
export function viewFor(node: LaidOutNode, maxLevels = Infinity): View {
  return { x0: node.x0, x1: node.x1, depth: node.depth, levels: Math.min(wheelDepth - node.depth, maxLevels) };
}

export function lerpView(from: View, to: View, t: number): View {
  return {
    x0: from.x0 + (to.x0 - from.x0) * t,
    x1: from.x1 + (to.x1 - from.x1) * t,
    depth: from.depth + (to.depth - from.depth) * t,
    levels: from.levels + (to.levels - from.levels) * t,
  };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Where a node sits for the given view. Rings share the space between the centre disc and the
 * outer edge evenly; nodes without children reach all the way to the outer edge, and nodes beyond
 * the last visible ring are hidden.
 */
export function arcFor(node: LaidOutNode, view: View): Arc | null {
  const span = view.x1 - view.x0;
  const a0 = clamp01((node.x0 - view.x0) / span) * TAU;
  const a1 = clamp01((node.x1 - view.x0) / span) * TAU;
  if (a1 - a0 < 1e-4) return null;

  const levels = view.levels;
  const ring = (R_OUTER - R_CENTER) / levels;
  const t0 = node.depth - 1 - view.depth;
  const t1 = node.children.length > 0 ? t0 + 1 : levels;
  const r0 = Math.min(R_CENTER + Math.max(t0, 0) * ring, R_OUTER);
  const r1 = Math.min(R_CENTER + Math.max(t1, 0) * ring, R_OUTER);
  if (r1 - r0 < 0.5) return null;
  return { a0, a1, r0, r1 };
}

/** Number of rings shown for a view (rounded while animating). */
export function visibleLevels(view: View): number {
  return Math.max(1, Math.round(view.levels));
}

/** Ring index (0 = innermost visible ring) of a node in the given view, rounded. */
export function ringIndex(node: LaidOutNode, view: View): number {
  return Math.max(0, Math.round(node.depth - 1 - view.depth));
}

function point(angle: number, radius: number): string {
  const x = CENTER + radius * Math.sin(angle);
  const y = CENTER - radius * Math.cos(angle);
  return `${x.toFixed(2)} ${y.toFixed(2)}`;
}

/** SVG path for an annular sector; angles are clockwise from 12 o'clock. */
export function arcPath({ a0, a1, r0, r1 }: Arc): string {
  const sweep = a1 - a0;
  if (sweep >= TAU - 1e-6) {
    // Full ring: two half circles for each edge, cut out with evenodd.
    const outer = `M ${point(0, r1)} A ${r1} ${r1} 0 1 1 ${point(Math.PI, r1)} A ${r1} ${r1} 0 1 1 ${point(0, r1)} Z`;
    const inner = `M ${point(0, r0)} A ${r0} ${r0} 0 1 0 ${point(Math.PI, r0)} A ${r0} ${r0} 0 1 0 ${point(0, r0)} Z`;
    return `${outer} ${inner}`;
  }
  const large = sweep > Math.PI ? 1 : 0;
  return [
    `M ${point(a0, r1)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${point(a1, r1)}`,
    `L ${point(a1, r0)}`,
    `A ${r0} ${r0} 0 ${large} 0 ${point(a0, r0)}`,
    'Z',
  ].join(' ');
}

export interface LabelLayout {
  x: number;
  y: number;
  rotate: number;
  lines: string[];
  /** Font size in viewBox units. */
  fontSize: number;
}

const MAX_LABEL_PX = [15, 13.5, 12.5];
const MIN_LABEL_PX = 9;

/**
 * Fits a radial label inside an arc. `scale` is CSS pixels per viewBox unit. Tries one line from
 * the largest size down, then two lines; returns null when the label cannot be made legible.
 */
export function layoutLabel(
  text: string,
  arc: Arc,
  scale: number,
  ring: number,
  levels: number,
  weight: number,
): LabelLayout | null {
  if (scale <= 0) return null;
  const sweep = arc.a1 - arc.a0;
  const padding = 6 / scale;
  const radialRoom = arc.r1 - arc.r0 - padding * 2;
  if (radialRoom <= 0) return null;

  const split = splitLabel(text);
  const candidates: string[][] = split ? [[text], split] : [[text]];
  // Zoomed-in views have fewer, thicker rings, so labels may grow a little.
  const zoomBonus = (MAX_LABEL_PX.length - levels) * 1.5;
  const maxPx = MAX_LABEL_PX[Math.min(ring, MAX_LABEL_PX.length - 1)] + zoomBonus;
  const midRadius = (arc.r0 + arc.r1) / 2;

  for (let px = maxPx; px >= MIN_LABEL_PX; px -= 0.5) {
    for (const lines of candidates) {
      const length = Math.max(...lines.map((line) => measureText(line, px, weight))) / scale;
      if (length > radialRoom) continue;
      const fontSize = px / scale;
      const thickness = fontSize * (lines.length === 1 ? 1.05 : 2.25);
      const innerEnd = midRadius - length / 2;
      const room = sweep >= Math.PI ? Infinity : 2 * innerEnd * Math.sin(sweep / 2) - 2 / scale;
      if (thickness > room) continue;

      const mid = (arc.a0 + arc.a1) / 2;
      let rotate = (mid * 180) / Math.PI - 90;
      if (mid > Math.PI) rotate += 180;
      return {
        x: CENTER + midRadius * Math.sin(mid),
        y: CENTER - midRadius * Math.cos(mid),
        rotate,
        lines,
        fontSize,
      };
    }
  }
  return null;
}

/** Largest font (in px) at which `lines` fit within `maxWidthPx`, between the given bounds. */
export function fitFont(lines: string[], maxWidthPx: number, maxPx: number, minPx: number, weight: number): number | null {
  for (let px = maxPx; px >= minPx; px -= 0.5) {
    if (Math.max(...lines.map((line) => measureText(line, px, weight))) <= maxWidthPx) return px;
  }
  return null;
}
