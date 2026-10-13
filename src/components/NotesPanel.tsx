import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState, type Ref } from 'react';
import { ancestorsOf, type Lang, type LaidOutNode } from '../data/flavors';
import type { Strings } from '../i18n';
import { colors, radii } from '../tokens.stylex';
import { shared } from './shared';

interface NotesPanelProps {
  lang: Lang;
  strings: Strings;
  notes: LaidOutNode[];
  sectionRef: Ref<HTMLElement>;
  onRemove: (node: LaidOutNode) => void;
  onLocate: (node: LaidOutNode) => void;
  onClear: () => void;
  onHover: (id: string | null) => void;
}

export function NotesPanel({ lang, strings, notes, sectionRef, onRemove, onLocate, onClear, onHover }: NotesPanelProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = async () => {
    const text = notes.map((node) => node.node.name[lang]).join(strings.separator);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="notes" ref={sectionRef} tabIndex={-1} aria-labelledby="notes-heading" {...stylex.props(shared.card, styles.panel)}>
      <div {...stylex.props(styles.header)}>
        <h2 id="notes-heading" {...stylex.props(shared.sectionTitle)}>
          {strings.notesTitle}
          {notes.length > 0 && <span {...stylex.props(styles.total)}>{notes.length}</span>}
        </h2>
        {notes.length > 0 && (
          <div {...stylex.props(styles.actions)}>
            <button type="button" onClick={copy} {...stylex.props(shared.focusable, styles.action, styles.actionPrimary)}>
              {copied ? strings.copied : strings.copy}
            </button>
            <button type="button" onClick={onClear} {...stylex.props(shared.focusable, styles.action)}>
              {strings.clear}
            </button>
          </div>
        )}
      </div>

      {notes.length === 0 ? (
        <p {...stylex.props(styles.empty)}>{strings.notesEmpty}</p>
      ) : (
        <ul role="list" {...stylex.props(styles.list)}>
          {notes.map((node) => {
            const name = node.node.name[lang];
            const path = ancestorsOf(node)
              .slice(1, -1)
              .map((n) => n.node.name[lang])
              .join(' › ');
            return (
              <li
                key={node.id}
                onPointerEnter={() => onHover(node.id)}
                onPointerLeave={() => onHover(null)}
                {...stylex.props(styles.chip)}
              >
                <button type="button" onClick={() => onLocate(node)} {...stylex.props(shared.focusable, styles.chipMain)}>
                  <span aria-hidden="true" {...stylex.props(shared.swatch)} style={{ backgroundColor: node.node.color }} />
                  <span {...stylex.props(styles.chipText)}>
                    <span {...stylex.props(styles.chipName)}>{name}</span>
                    {path && <span {...stylex.props(styles.chipPath)}>{path}</span>}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={strings.remove(name)}
                  onClick={() => onRemove(node)}
                  {...stylex.props(shared.focusable, styles.remove)}
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const styles = stylex.create({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    scrollMarginTop: '16px',
    outline: 'none',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  total: {
    marginInlineStart: '8px',
    paddingInline: '8px',
    paddingBlock: '1px',
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    color: colors.accentInk,
    fontSize: '0.8125rem',
    verticalAlign: '2px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  action: {
    minHeight: '36px',
    paddingInline: '14px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.surfaceHover,
    },
    color: colors.ink,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  actionPrimary: {
    borderColor: colors.accent,
    backgroundColor: {
      default: colors.accent,
      ':hover': colors.accent,
    },
    color: colors.accentInk,
    fontWeight: 600,
  },
  empty: {
    margin: 0,
    color: colors.inkMuted,
    fontSize: '0.9375rem',
    lineHeight: 1.6,
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  chip: {
    display: 'flex',
    alignItems: 'stretch',
    maxWidth: '100%',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSunken,
  },
  chipMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    minHeight: '44px',
    paddingBlock: '6px',
    paddingInlineStart: '12px',
    paddingInlineEnd: '6px',
    borderWidth: 0,
    borderRadius: radii.md,
    backgroundColor: 'transparent',
    textAlign: 'start',
    cursor: 'pointer',
  },
  chipText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  chipName: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: colors.ink,
    lineHeight: 1.25,
  },
  chipPath: {
    fontSize: '0.75rem',
    color: colors.inkMuted,
    lineHeight: 1.3,
  },
  remove: {
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    width: '36px',
    borderWidth: 0,
    borderRadius: radii.md,
    backgroundColor: {
      default: 'transparent',
      ':hover': colors.surfaceHover,
    },
    color: colors.inkMuted,
    cursor: 'pointer',
  },
});
