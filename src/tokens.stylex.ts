import * as stylex from '@stylexjs/stylex';

/*
 * Colours follow the CSS `color-scheme` (system preference, or the manual override that
 * index.css maps from <meta name="color-scheme">) through light-dark(). Browsers without
 * light-dark() fall back to the prefers-color-scheme values and just follow the system.
 */
const DARK = '@media (prefers-color-scheme: dark)';
const LIGHT_DARK = '@supports (color: light-dark(white, black))';

export const colors = stylex.defineVars({
  bg: {
    default: '#f6efe4',
    [DARK]: '#14100d',
    [LIGHT_DARK]: 'light-dark(#f6efe4, #14100d)',
  },
  surface: {
    default: '#fffaf2',
    [DARK]: '#1e1814',
    [LIGHT_DARK]: 'light-dark(#fffaf2, #1e1814)',
  },
  surfaceSunken: {
    default: '#efe5d6',
    [DARK]: '#29211b',
    [LIGHT_DARK]: 'light-dark(#efe5d6, #29211b)',
  },
  surfaceHover: {
    default: '#f3e9db',
    [DARK]: '#2f261f',
    [LIGHT_DARK]: 'light-dark(#f3e9db, #2f261f)',
  },
  ink: {
    default: '#2a1c13',
    [DARK]: '#f2e8db',
    [LIGHT_DARK]: 'light-dark(#2a1c13, #f2e8db)',
  },
  inkMuted: {
    default: '#6e5a4a',
    [DARK]: '#b6a391',
    [LIGHT_DARK]: 'light-dark(#6e5a4a, #b6a391)',
  },
  border: {
    default: '#e0d1bd',
    [DARK]: '#3a2f27',
    [LIGHT_DARK]: 'light-dark(#e0d1bd, #3a2f27)',
  },
  borderStrong: {
    default: '#c9b49b',
    [DARK]: '#56473b',
    [LIGHT_DARK]: 'light-dark(#c9b49b, #56473b)',
  },
  accent: {
    default: '#6b4226',
    [DARK]: '#dca673',
    [LIGHT_DARK]: 'light-dark(#6b4226, #dca673)',
  },
  accentInk: {
    default: '#fffaf2',
    [DARK]: '#1a120c',
    [LIGHT_DARK]: 'light-dark(#fffaf2, #1a120c)',
  },
  focusRing: {
    default: '#b3541e',
    [DARK]: '#f2b47c',
    [LIGHT_DARK]: 'light-dark(#b3541e, #f2b47c)',
  },
  shadow: {
    default: '0 1px 2px rgb(60 35 15 / 0.06), 0 8px 24px rgb(60 35 15 / 0.07)',
    [DARK]: '0 1px 2px rgb(0 0 0 / 0.4), 0 8px 24px rgb(0 0 0 / 0.35)',
    [LIGHT_DARK]:
      '0 1px 2px light-dark(rgb(60 35 15 / 0.06), rgb(0 0 0 / 0.4)), 0 8px 24px light-dark(rgb(60 35 15 / 0.07), rgb(0 0 0 / 0.35))',
  },
});

export const fonts = stylex.defineVars({
  sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
  serif: '"Iowan Old Style", "Palatino Linotype", Palatino, "Noto Serif TC", "Songti TC", Georgia, serif',
});

export const radii = stylex.defineVars({
  sm: '8px',
  md: '12px',
  lg: '18px',
  pill: '999px',
});
