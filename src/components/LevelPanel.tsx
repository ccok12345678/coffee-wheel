import * as stylex from '@stylexjs/stylex';
import { Fragment, useEffect, useRef } from 'react';
import { ancestorsOf, type Lang, type LaidOutNode } from '../data/flavors';
import type { Strings } from '../i18n';
import { colors, radii } from '../tokens.stylex';
import { shared } from './shared';

interface LevelPanelProps {
  lang: Lang;
  strings: Strings;
  focus: LaidOutNode;
  selected: ReadonlySet<string>;
  onFocus: (node: LaidOutNode) => void;
  onToggle: (node: LaidOutNode) => void;
  onHover: (id: string | null) => void;
}

export function LevelPanel({ lang, strings, focus, selected, onFocus, onToggle, onHover }: LevelPanelProps) {
  const path = ancestorsOf(focus);
  const name = focus.node.name[lang];
  const generalPicked = selected.has(focus.id);

  // When navigation starts from this panel the pressed button disappears, so move focus to the
  // new level's heading instead of letting it fall back to <body>.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeading = useRef(false);
  const navigate = (node: LaidOutNode) => {
    focusHeading.current = true;
    onFocus(node);
  };
  useEffect(() => {
    if (!focusHeading.current) return;
    focusHeading.current = false;
    headingRef.current?.focus();
  }, [focus.id]);

  return (
    <section aria-labelledby="level-heading" {...stylex.props(shared.card, styles.panel)}>
      <nav aria-label={strings.breadcrumb}>
        <ol {...stylex.props(styles.crumbs)}>
          {path.map((node, i) => {
            const current = i === path.length - 1;
            return (
              <li key={node.id} {...stylex.props(styles.crumbItem)}>
                {i > 0 && (
                  <span aria-hidden="true" {...stylex.props(styles.crumbSep)}>
                    ›
                  </span>
                )}
                <button
                  type="button"
                  aria-current={current ? 'location' : undefined}
                  onClick={() => navigate(node)}
                  {...stylex.props(shared.focusable, styles.crumb, current && styles.crumbCurrent)}
                >
                  {node.depth > 0 && <span aria-hidden="true" {...stylex.props(shared.swatch, styles.crumbSwatch)} style={{ backgroundColor: node.node.color }} />}
                  {node.node.name[lang]}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div {...stylex.props(styles.headingRow)}>
        <h2 id="level-heading" ref={headingRef} tabIndex={-1} {...stylex.props(shared.sectionTitle, styles.heading)}>
          {strings.levelHeading(name)}
        </h2>
        <span {...stylex.props(styles.count)}>{strings.levelCount(focus.children.length)}</span>
      </div>

      {focus.depth > 0 && (
        <button
          type="button"
          aria-pressed={generalPicked}
          onClick={() => onToggle(focus)}
          onPointerEnter={() => onHover(focus.id)}
          onPointerLeave={() => onHover(null)}
          {...stylex.props(shared.focusable, styles.general, generalPicked && styles.generalOn)}
        >
          <CheckBox checked={generalPicked} />
          {generalPicked ? strings.pickedGeneral(name) : strings.pickGeneral(name)}
        </button>
      )}

      <ul role="list" {...stylex.props(styles.grid)}>
        {focus.children.map((child) => {
          const childName = child.node.name[lang];
          const hasChildren = child.children.length > 0;
          const isSelected = selected.has(child.id);
          const selectedInside = hasChildren ? countSelectedWithin(child, selected) : 0;
          return (
            <li key={child.id} {...stylex.props(styles.gridItem)}>
              <button
                type="button"
                aria-pressed={hasChildren ? undefined : isSelected}
                aria-label={hasChildren ? strings.goDeeper(childName) : undefined}
                onClick={() => (hasChildren ? navigate(child) : onToggle(child))}
                onPointerEnter={() => onHover(child.id)}
                onPointerLeave={() => onHover(null)}
                onFocus={() => onHover(child.id)}
                onBlur={() => onHover(null)}
                {...stylex.props(shared.focusable, styles.option, isSelected && styles.optionOn)}
              >
                <span aria-hidden="true" {...stylex.props(styles.optionSwatch)} style={{ backgroundColor: child.node.color }} />
                <span {...stylex.props(styles.optionName)}>{withSlashBreaks(childName)}</span>
                {hasChildren ? (
                  <span aria-hidden="true" {...stylex.props(styles.optionMeta)}>
                    {selectedInside > 0 && <span {...stylex.props(styles.innerCount)}>{selectedInside}</span>}
                    <span {...stylex.props(styles.leafCount)}>{strings.flavorCount(child.leafCount)}</span>
                    <span {...stylex.props(styles.chevron)}>›</span>
                  </span>
                ) : (
                  <CheckBox checked={isSelected} />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Lets long "A/B" names wrap after the slash instead of mid-word. */
function withSlashBreaks(text: string) {
  const parts = text.split(/(?<=[/／])/);
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ));
}

function countSelectedWithin(node: LaidOutNode, selected: ReadonlySet<string>): number {
  let count = selected.has(node.id) ? 1 : 0;
  for (const child of node.children) count += countSelectedWithin(child, selected);
  return count;
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden="true" {...stylex.props(styles.checkBox, checked && styles.checkBoxOn)}>
      {checked && (
        <svg viewBox="0 0 16 16" width="12" height="12">
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

const styles = stylex.create({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  crumbs: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '2px',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  crumbItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  crumbSep: {
    color: colors.inkMuted,
    paddingInline: '2px',
  },
  crumb: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    minHeight: '32px',
    paddingInline: '10px',
    borderWidth: 0,
    borderRadius: radii.pill,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.surfaceHover,
    },
    color: colors.inkMuted,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  crumbCurrent: {
    backgroundColor: colors.surfaceSunken,
    color: colors.ink,
    fontWeight: 600,
  },
  crumbSwatch: {
    width: '10px',
    height: '10px',
  },
  headingRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
  },
  heading: {
    fontSize: '1.375rem',
    outline: 'none',
  },
  count: {
    color: colors.inkMuted,
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  },
  general: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '44px',
    paddingBlock: '8px',
    paddingInline: '12px',
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.surfaceHover,
    },
    color: colors.ink,
    fontSize: '0.9375rem',
    textAlign: 'start',
    cursor: 'pointer',
  },
  generalOn: {
    borderStyle: 'solid',
    borderColor: colors.ink,
    backgroundColor: colors.surfaceSunken,
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 9.75rem), 1fr))',
    gap: '8px',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  gridItem: {
    display: 'flex',
  },
  option: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '48px',
    paddingBlock: '8px',
    paddingInline: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: {
      default: colors.surface,
      ':hover': colors.surfaceHover,
    },
    color: colors.ink,
    fontSize: '0.9375rem',
    textAlign: 'start',
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color',
    transitionDuration: '120ms',
  },
  optionOn: {
    borderColor: colors.ink,
    backgroundColor: {
      default: colors.surfaceSunken,
      ':hover': colors.surfaceSunken,
    },
    fontWeight: 600,
  },
  optionSwatch: {
    flexShrink: 0,
    width: '6px',
    alignSelf: 'stretch',
    minHeight: '22px',
    borderRadius: radii.pill,
    boxShadow: 'inset 0 0 0 1px rgb(0 0 0 / 0.12)',
  },
  optionName: {
    flexGrow: 1,
    minWidth: 0,
    lineHeight: 1.25,
    overflowWrap: 'break-word',
    wordBreak: 'keep-all',
  },
  optionMeta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: colors.inkMuted,
    fontSize: '0.8125rem',
    whiteSpace: 'nowrap',
  },
  innerCount: {
    minWidth: '20px',
    height: '20px',
    paddingInline: '6px',
    display: 'inline-grid',
    placeItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    color: colors.surface,
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  leafCount: {
    fontVariantNumeric: 'tabular-nums',
  },
  chevron: {
    fontSize: '1.25rem',
    lineHeight: 1,
  },
  checkBox: {
    flexShrink: 0,
    width: '20px',
    height: '20px',
    display: 'inline-grid',
    placeItems: 'center',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: colors.borderStrong,
    borderRadius: '6px',
    color: colors.surface,
  },
  checkBoxOn: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
  },
});
