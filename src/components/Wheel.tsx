import * as stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useRef, useState, type PointerEvent, type RefObject } from 'react';
import { allNodes, ancestorsOf, isAncestorOrSelf, nodesById, type Lang, type LaidOutNode } from '../data/flavors';
import type { Strings } from '../i18n';
import { textColorOn } from '../lib/color';
import {
  CENTER,
  R_CENTER,
  VIEWBOX,
  arcFor,
  arcPath,
  fitFont,
  layoutLabel,
  lerpView,
  ringIndex,
  viewFor,
  visibleLevels,
  type Arc,
  type View,
} from '../lib/geometry';
import { WHEEL_FONT, splitLabel } from '../lib/measureText';
import { colors } from '../tokens.stylex';

const ANIMATION_MS = 650;

interface WheelProps {
  lang: Lang;
  strings: Strings;
  focus: LaidOutNode;
  selected: ReadonlySet<string>;
  hoverId: string | null;
  onHover: (id: string | null) => void;
  onActivate: (node: LaidOutNode) => void;
  onBack: () => void;
}

export function Wheel({ lang, strings, focus, selected, hoverId, onHover, onActivate, onBack }: WheelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const widthPx = useElementWidth(wrapperRef);
  const scale = widthPx / VIEWBOX;
  const view = useAnimatedView(viewFor(focus));
  const hovered = hoverId ? (nodesById.get(hoverId) ?? null) : null;

  const levels = visibleLevels(view);
  const segments = useMemo(() => {
    const result: { node: LaidOutNode; arc: Arc }[] = [];
    for (const node of allNodes) {
      const arc = arcFor(node, view);
      if (arc) result.push({ node, arc });
    }
    return result;
  }, [view]);

  // Only highlight a path when the hovered node is actually on screen.
  const highlight = hovered && segments.some((segment) => segment.node === hovered) ? hovered : null;

  const handleEnter = (event: PointerEvent, id: string) => {
    if (event.pointerType !== 'touch') onHover(id);
  };
  const handleLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') onHover(null);
  };

  return (
    <div ref={wrapperRef} {...stylex.props(styles.wrapper)}>
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        role="img"
        aria-label={strings.wheelLabel}
        {...stylex.props(styles.svg)}
        style={{ fontFamily: WHEEL_FONT }}
      >
        {segments.map(({ node, arc }) => {
          const isSelected = selected.has(node.id);
          const dimmed = highlight !== null && !isAncestorOrSelf(node, highlight) && !isAncestorOrSelf(highlight, node);
          const ring = ringIndex(node, view);
          const badge = isSelected ? badgeLayout(arc, scale) : null;
          const labelArc = badge ? { ...arc, r1: badge.labelLimit } : arc;
          const weight = isSelected || ring === 0 ? 700 : 500;
          const label = layoutLabel(node.node.name[lang], labelArc, scale, ring, levels, weight);
          const ink = textColorOn(node.node.color);
          return (
            <g
              key={node.id}
              {...stylex.props(styles.segment, dimmed && styles.dimmed)}
              onClick={() => onActivate(node)}
              onPointerEnter={(event) => handleEnter(event, node.id)}
              onPointerLeave={handleLeave}
            >
              <path d={arcPath(arc)} fill={node.node.color} {...stylex.props(styles.arc)} />
              {isSelected && <path d={arcPath(arc)} {...stylex.props(styles.selectedOutline)} />}
              {label && (
                <text
                  transform={`translate(${label.x.toFixed(2)} ${label.y.toFixed(2)}) rotate(${label.rotate.toFixed(2)})`}
                  fontSize={label.fontSize.toFixed(2)}
                  fontWeight={weight}
                  fill={ink}
                  textAnchor="middle"
                  dominantBaseline="central"
                  {...stylex.props(styles.label)}
                >
                  {label.lines.length === 1 ? (
                    label.lines[0]
                  ) : (
                    <>
                      <tspan x="0" dy="-0.56em">
                        {label.lines[0]}
                      </tspan>
                      <tspan x="0" dy="1.12em">
                        {label.lines[1]}
                      </tspan>
                    </>
                  )}
                </text>
              )}
              {badge && (
                <g transform={`translate(${badge.x.toFixed(2)} ${badge.y.toFixed(2)})`} {...stylex.props(styles.label)}>
                  <circle r={badge.radius} {...stylex.props(styles.badge)} />
                  <path
                    d={`M ${-badge.radius * 0.45} 0 L ${-badge.radius * 0.1} ${badge.radius * 0.38} L ${badge.radius * 0.5} ${-badge.radius * 0.36}`}
                    strokeWidth={badge.radius * 0.26}
                    {...stylex.props(styles.check)}
                  />
                </g>
              )}
            </g>
          );
        })}
        <CenterDisc
          lang={lang}
          strings={strings}
          focus={focus}
          hovered={hovered && hovered !== focus ? hovered : null}
          scale={scale}
          onBack={onBack}
        />
      </svg>
    </div>
  );
}

interface CenterDiscProps {
  lang: Lang;
  strings: Strings;
  focus: LaidOutNode;
  hovered: LaidOutNode | null;
  scale: number;
  onBack: () => void;
}

function CenterDisc({ lang, strings, focus, hovered, scale, onBack }: CenterDiscProps) {
  const shown = hovered ?? focus;
  const isRoot = shown.depth === 0;
  const radius = R_CENTER - 7;
  const maxWidthPx = radius * 1.55 * scale;

  const title = shown.node.name[lang];
  const titleSplit = splitLabel(title);
  let titleLines = [title];
  let titlePx = fitFont(titleLines, maxWidthPx, 22, 11, 700);
  if (titlePx === null && titleSplit) {
    titleLines = titleSplit;
    titlePx = fitFont(titleLines, maxWidthPx, 20, 9, 700);
  }
  titlePx ??= 9;

  let caption: string;
  if (hovered) {
    const path = ancestorsOf(hovered).slice(1, -1).map((n) => n.node.name[lang]);
    caption = path.join(' › ');
    if (caption && fitFont([caption], maxWidthPx, 11.5, 8.5, 500) === null) caption = path.at(-1) ?? '';
  } else {
    caption = focus.depth === 0 ? strings.wheelHintRoot : strings.wheelHintBack;
  }
  const captionPx = caption ? (fitFont([caption], maxWidthPx, 11.5, 8.5, 500) ?? 8.5) : 0;

  const titleSize = titlePx / scale || 0;
  const captionSize = captionPx / scale || 0;
  const titleHeight = titleSize * 1.15 * titleLines.length;
  const gap = caption ? captionSize * 0.7 : 0;
  const total = titleHeight + gap + (caption ? captionSize * 1.15 : 0);
  const top = CENTER - total / 2;

  const fill = isRoot ? undefined : shown.node.color;
  const ink = isRoot ? undefined : textColorOn(shown.node.color);
  const canGoBack = focus.depth > 0;

  return (
    <g
      onClick={canGoBack ? onBack : undefined}
      {...stylex.props(styles.center, canGoBack && styles.centerInteractive)}
    >
      <circle cx={CENTER} cy={CENTER} r={radius} fill={fill} {...stylex.props(isRoot && styles.centerRootFill)} />
      {scale > 0 && (
        <g fill={ink} {...stylex.props(styles.label, isRoot && styles.centerRootInk)}>
          <text x={CENTER} y={top} fontSize={titleSize.toFixed(2)} fontWeight={700} textAnchor="middle" dominantBaseline="hanging">
            {titleLines.map((line, i) => (
              <tspan key={i} x={CENTER} dy={i === 0 ? 0 : '1.15em'}>
                {line}
              </tspan>
            ))}
          </text>
          {caption && (
            <text
              x={CENTER}
              y={top + titleHeight + gap}
              fontSize={captionSize.toFixed(2)}
              fontWeight={500}
              textAnchor="middle"
              dominantBaseline="hanging"
              {...stylex.props(styles.caption)}
            >
              {canGoBack && !hovered ? `↩ ${caption}` : caption}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

/** Position and size of the "selected" check badge near the outer edge of an arc. */
function badgeLayout(arc: Arc, scale: number) {
  if (scale <= 0) return null;
  const sweep = arc.a1 - arc.a0;
  const margin = 5 / scale;
  let radius = 9 / scale;
  const radial = arc.r1 - margin - radius;
  const room = sweep >= Math.PI ? Infinity : radial * Math.sin(sweep / 2) - 1 / scale;
  radius = Math.max(5 / scale, Math.min(radius, room));
  const r = arc.r1 - margin - radius;
  const mid = (arc.a0 + arc.a1) / 2;
  return {
    x: CENTER + r * Math.sin(mid),
    y: CENTER - r * Math.cos(mid),
    radius,
    labelLimit: r - radius - 2 / scale,
  };
}

function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Tweens between views whenever the target changes; jumps straight there with reduced motion. */
function useAnimatedView(target: View): View {
  const [view, setView] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    const from = current.current;
    if (from.x0 === target.x0 && from.x1 === target.x1 && from.depth === target.depth) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      current.current = target;
      setView(target);
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / ANIMATION_MS);
      const next = t === 1 ? target : lerpView(from, target, easeInOutCubic(t));
      current.current = next;
      setView(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
    // The target is a fresh object each render; its fields are the real dependencies.
  }, [target.x0, target.x1, target.depth]);

  return view;
}

const styles = stylex.create({
  wrapper: {
    width: '100%',
    aspectRatio: '1',
    position: 'relative',
  },
  svg: {
    display: 'block',
    width: '100%',
    height: '100%',
    overflow: 'visible',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  segment: {
    cursor: 'pointer',
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: '160ms',
  },
  dimmed: {
    opacity: 0.32,
  },
  arc: {
    stroke: colors.bg,
    strokeWidth: 1.5,
    strokeLinejoin: 'round',
    vectorEffect: 'non-scaling-stroke',
    transitionProperty: 'filter',
    transitionDuration: '160ms',
    filter: {
      default: null,
      ':hover': 'brightness(1.06) saturate(1.05)',
    },
  },
  selectedOutline: {
    fill: 'none',
    stroke: colors.ink,
    strokeWidth: 2.5,
    strokeLinejoin: 'round',
    vectorEffect: 'non-scaling-stroke',
    pointerEvents: 'none',
  },
  label: {
    pointerEvents: 'none',
  },
  badge: {
    fill: '#ffffff',
    stroke: '#1d130c',
    strokeWidth: 1.25,
    vectorEffect: 'non-scaling-stroke',
  },
  check: {
    fill: 'none',
    stroke: '#1d130c',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  center: {
    cursor: 'default',
  },
  centerInteractive: {
    cursor: 'pointer',
  },
  centerRootFill: {
    fill: colors.accent,
  },
  centerRootInk: {
    fill: colors.accentInk,
  },
  caption: {
    opacity: 0.85,
  },
});
