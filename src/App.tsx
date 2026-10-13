import * as stylex from '@stylexjs/stylex';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { LevelPanel } from './components/LevelPanel';
import { NotesPanel } from './components/NotesPanel';
import { shared } from './components/shared';
import { Wheel } from './components/Wheel';
import { nodesById, wheelRoot, type Lang, type LaidOutNode } from './data/flavors';
import { getStrings, htmlLang } from './i18n';
import { useColorScheme, type Scheme } from './lib/colorScheme';
import { COMPACT_QUERY, useMediaQuery } from './lib/useMediaQuery';
import { colors, fonts, radii } from './tokens.stylex';

const LANG_KEY = 'coffee-wheel:lang';
const NOTES_KEY = 'coffee-wheel:notes';

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode, blocked site data); preferences just won't persist.
  }
}

function initialLang(): Lang {
  const saved = readStorage(LANG_KEY);
  if (saved === 'zh' || saved === 'en') return saved;
  for (const lang of navigator.languages ?? [navigator.language]) {
    const code = lang.toLowerCase();
    if (code.startsWith('zh')) return 'zh';
    if (code.startsWith('en')) return 'en';
  }
  return 'zh';
}

function initialNotes(): string[] {
  try {
    const parsed: unknown = JSON.parse(readStorage(NOTES_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string' && nodesById.has(id)) : [];
  } catch {
    return [];
  }
}

export function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [focusId, setFocusId] = useState('root');
  const [notes, setNotes] = useState<string[]>(initialNotes);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [notesInView, setNotesInView] = useState(false);
  // On phones the list and notes start folded away below the wheel.
  const compact = useMediaQuery(COMPACT_QUERY);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarCollapsed = compact && !sidebarOpen;
  const notesRef = useRef<HTMLElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const strings = getStrings(lang);
  const { scheme, toggle: toggleScheme } = useColorScheme();
  const schemeLabel = scheme === 'dark' ? strings.themeToLight : strings.themeToDark;
  const focus = nodesById.get(focusId) ?? wheelRoot;
  const selected = useMemo(() => new Set(notes), [notes]);
  const noteNodes = useMemo(
    () => notes.map((id) => nodesById.get(id)!).sort((a, b) => a.order - b.order),
    [notes],
  );

  useEffect(() => {
    document.documentElement.lang = htmlLang[lang];
    document.title = strings.docTitle;
    writeStorage(LANG_KEY, lang);
  }, [lang, strings.docTitle]);

  useEffect(() => writeStorage(NOTES_KEY, JSON.stringify(notes)), [notes]);

  const toggle = (node: LaidOutNode) => {
    const name = node.node.name[lang];
    const has = selected.has(node.id);
    setAnnouncement(has ? strings.announceRemove(name) : strings.announceAdd(name));
    setNotes((current) => (has ? current.filter((id) => id !== node.id) : [...current, node.id]));
  };

  const goBack = useCallback(() => setFocusId((id) => nodesById.get(id)?.parent?.id ?? 'root'), []);

  const activate = (node: LaidOutNode) => {
    if (node.children.length > 0) setFocusId(node.id);
    else toggle(node);
  };

  const locate = (node: LaidOutNode) => {
    setFocusId(node.children.length > 0 ? node.id : (node.parent?.id ?? 'root'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    wheelRef.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  };

  const showNotes = () => {
    if (sidebarCollapsed) flushSync(() => setSidebarOpen(true));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    notesRef.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    notesRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) goBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goBack]);

  useEffect(() => {
    const element = notesRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setNotesInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.container, styles.header)}>
        <BrandMark />
        <h1 {...stylex.props(styles.title)}>{strings.title}</h1>
        <p {...stylex.props(styles.subtitle)}>{strings.subtitle}</p>
        <div {...stylex.props(styles.controls)}>
          <div role="group" aria-label={strings.language} {...stylex.props(styles.langSwitch)}>
            {(['zh', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                lang={htmlLang[code]}
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
                {...stylex.props(shared.focusable, styles.langButton, lang === code && styles.langButtonOn)}
              >
                {code === 'zh' ? '中文' : 'English'}
              </button>
            ))}
          </div>
          <button
            type="button"
            title={schemeLabel}
            onClick={toggleScheme}
            {...stylex.props(shared.focusable, styles.themeButton)}
          >
            <SchemeIcon scheme={scheme} />
            <span {...stylex.props(shared.visuallyHidden)}>{schemeLabel}</span>
          </button>
        </div>
      </header>

      <main {...stylex.props(styles.container, styles.layout)}>
        <div ref={wheelRef} {...stylex.props(styles.wheelColumn)}>
          <div {...stylex.props(styles.wheelBox)}>
            <Wheel
              lang={lang}
              strings={strings}
              focus={focus}
              selected={selected}
              hoverId={hoverId}
              onHover={setHoverId}
              onActivate={activate}
              onBack={goBack}
            />
          </div>
        </div>

        {compact && (
          <button
            type="button"
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            onClick={() => setSidebarOpen((open) => !open)}
            {...stylex.props(shared.focusable, styles.sidebarToggle)}
          >
            {sidebarOpen ? strings.sidebarHide : strings.sidebarShow}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...stylex.props(styles.chevron, sidebarOpen && styles.chevronOpen)}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        )}

        <div id="sidebar" {...stylex.props(styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed)}>
          <LevelPanel
            lang={lang}
            strings={strings}
            focus={focus}
            selected={selected}
            onFocus={(node) => setFocusId(node.id)}
            onToggle={toggle}
            onHover={setHoverId}
          />
          <NotesPanel
            lang={lang}
            strings={strings}
            notes={noteNodes}
            sectionRef={notesRef}
            onRemove={toggle}
            onLocate={locate}
            onClear={() => setNotes([])}
            onHover={setHoverId}
          />
        </div>
      </main>

      <footer {...stylex.props(styles.container, styles.footer)}>{strings.footer}</footer>

      {noteNodes.length > 0 && !notesInView && (
        <div {...stylex.props(styles.tray)}>
          <span aria-hidden="true" {...stylex.props(styles.trayDots)}>
            {noteNodes.slice(0, 5).map((node) => (
              <span key={node.id} {...stylex.props(styles.trayDot)} style={{ backgroundColor: node.node.color }} />
            ))}
          </span>
          <span {...stylex.props(styles.trayText)}>{strings.selectedSummary(noteNodes.length)}</span>
          <button type="button" onClick={showNotes} {...stylex.props(shared.focusable, styles.trayButton)}>
            {strings.viewNotes}
          </button>
        </div>
      )}

      <p aria-live="polite" {...stylex.props(shared.visuallyHidden)}>
        {announcement}
      </p>
    </div>
  );
}

/** Shows the scheme currently in effect: a sun in light mode, a moon in dark mode. */
function SchemeIcon({ scheme }: { scheme: Scheme }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...stylex.props(styles.schemeIcon)}>
      {scheme === 'light' ? (
        <>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.55 1.55M17.15 17.15l1.55 1.55M5.3 18.7l1.55-1.55M17.15 6.85l1.55-1.55" />
        </>
      ) : (
        <path d="M20.2 14.6A8.5 8.5 0 0 1 9.4 3.8a8.5 8.5 0 1 0 10.8 10.8Z" />
      )}
    </svg>
  );
}

function BrandMark() {
  const slices = ['#ee000c', '#f4b100', '#017c22', '#01a6b9', '#da3d20', '#be013b', '#b17962', '#f94a1c', '#ef0168'];
  const step = (Math.PI * 2) / slices.length;
  const point = (angle: number, r: number) => `${(24 + r * Math.sin(angle)).toFixed(2)} ${(24 - r * Math.cos(angle)).toFixed(2)}`;
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...stylex.props(styles.mark)}>
      {slices.map((color, i) => (
        <path key={color} d={`M 24 24 L ${point(i * step, 23)} A 23 23 0 0 1 ${point((i + 1) * step, 23)} Z`} fill={color} />
      ))}
      <circle cx="24" cy="24" r="9.5" {...stylex.props(styles.markHole)} />
      <ellipse cx="24" cy="24" rx="3.6" ry="5.4" {...stylex.props(styles.markBean)} />
    </svg>
  );
}

const MEDIUM_HEADER = '@media (min-width: 520px) and (max-width: 639.98px)';
const WIDE_HEADER = '@media (min-width: 640px)';
const TWO_COLUMNS = '@media (min-width: 960px), (min-width: 600px) and (orientation: landscape)';

const styles = stylex.create({
  page: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.bg,
    color: colors.ink,
    fontFamily: fonts.sans,
    lineHeight: 1.5,
  },
  container: {
    width: '100%',
    maxWidth: '1320px',
    marginInline: 'auto',
    paddingInline: 'max(clamp(16px, 4vw, 40px), env(safe-area-inset-left))',
  },
  header: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    gridTemplateAreas: {
      // Phones: logo and controls share the top row so the title gets the full width.
      default: '"mark . controls" "title title title" "sub sub sub"',
      [MEDIUM_HEADER]: '"mark title controls" "sub sub sub"',
      [WIDE_HEADER]: '"mark title controls" "mark sub controls"',
    },
    alignItems: 'center',
    columnGap: 'clamp(10px, 2vw, 18px)',
    rowGap: '6px',
    paddingBlock: 'clamp(14px, 3vw, 28px)',
  },
  mark: {
    gridArea: 'mark',
    width: 'clamp(40px, 7vw, 56px)',
    height: 'clamp(40px, 7vw, 56px)',
  },
  markHole: {
    fill: colors.bg,
  },
  markBean: {
    fill: colors.accent,
  },
  title: {
    gridArea: 'title',
    alignSelf: { default: 'center', [WIDE_HEADER]: 'end' },
    marginTop: { default: '6px', [MEDIUM_HEADER]: 0, [WIDE_HEADER]: 0 },
    margin: 0,
    fontFamily: fonts.serif,
    fontSize: 'clamp(1.375rem, 1rem + 1.8vw, 2.375rem)',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '0.01em',
    textWrap: 'balance',
  },
  subtitle: {
    gridArea: 'sub',
    alignSelf: 'start',
    margin: 0,
    maxWidth: '56ch',
    color: colors.inkMuted,
    fontSize: 'clamp(0.875rem, 0.82rem + 0.25vw, 1rem)',
    lineHeight: 1.45,
  },
  controls: {
    gridArea: 'controls',
    justifySelf: 'end',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  langSwitch: {
    display: 'inline-flex',
    padding: '3px',
    gap: '2px',
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceSunken,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  langButton: {
    minHeight: '34px',
    paddingInline: 'clamp(10px, 2vw, 16px)',
    borderWidth: 0,
    borderRadius: radii.pill,
    backgroundColor: 'transparent',
    color: {
      default: colors.inkMuted,
      ':hover': colors.ink,
    },
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  langButtonOn: {
    backgroundColor: colors.surface,
    color: colors.ink,
    boxShadow: colors.shadow,
  },
  themeButton: {
    position: 'relative',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    width: '42px',
    height: '42px',
    padding: 0,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: {
      default: colors.surfaceSunken,
      ':hover': colors.surfaceHover,
    },
    color: colors.ink,
    cursor: 'pointer',
  },
  schemeIcon: {
    fill: 'currentColor',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  },
  layout: {
    flexGrow: 1,
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      [TWO_COLUMNS]: 'minmax(0, 1fr) minmax(300px, 410px)',
    },
    gap: 'clamp(16px, 3vw, 44px)',
    alignItems: 'start',
    paddingBottom: '24px',
  },
  wheelColumn: {
    display: 'flex',
    justifyContent: 'center',
    position: {
      default: 'static',
      [TWO_COLUMNS]: 'sticky',
    },
    top: '16px',
    scrollMarginTop: '12px',
  },
  wheelBox: {
    width: {
      default: 'min(100%, 640px)',
      [TWO_COLUMNS]: 'min(100%, 860px, max(320px, 100dvh - 170px))',
    },
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: 0,
  },
  sidebarCollapsed: {
    display: 'none',
  },
  sidebarToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    minHeight: '44px',
    paddingInline: '18px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: {
      default: colors.surfaceSunken,
      ':hover': colors.surfaceHover,
    },
    color: colors.ink,
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  chevron: {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    transitionProperty: 'transform',
    transitionDuration: '200ms',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  footer: {
    paddingBlock: '20px 28px',
    color: colors.inkMuted,
    fontSize: '0.8125rem',
    textAlign: 'center',
  },
  tray: {
    position: 'fixed',
    insetInline: 0,
    bottom: 'max(12px, env(safe-area-inset-bottom))',
    marginInline: 'auto',
    width: 'min(100% - 24px, 480px)',
    display: {
      default: 'flex',
      [TWO_COLUMNS]: 'none',
    },
    alignItems: 'center',
    gap: '10px',
    paddingBlock: '6px',
    paddingInlineStart: '14px',
    paddingInlineEnd: '6px',
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    color: colors.surface,
    boxShadow: '0 10px 30px rgb(0 0 0 / 0.25)',
  },
  trayDots: {
    display: 'inline-flex',
    paddingInlineStart: '4px',
  },
  trayDot: {
    width: '16px',
    height: '16px',
    marginInlineStart: '-5px',
    borderRadius: radii.pill,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: colors.ink,
  },
  trayText: {
    flexGrow: 1,
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  trayButton: {
    minHeight: '38px',
    paddingInline: '16px',
    borderWidth: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
});
