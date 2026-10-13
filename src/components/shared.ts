import * as stylex from '@stylexjs/stylex';
import { colors, radii } from '../tokens.stylex';

export const shared = stylex.create({
  focusable: {
    outlineStyle: {
      default: 'none',
      ':focus-visible': 'solid',
    },
    outlineWidth: '2.5px',
    outlineColor: colors.focusRing,
    outlineOffset: '2px',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    border: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: radii.lg,
    boxShadow: colors.shadow,
    padding: 'clamp(16px, 3vw, 22px)',
  },
  swatch: {
    flexShrink: 0,
    width: '14px',
    height: '14px',
    borderRadius: radii.pill,
    boxShadow: 'inset 0 0 0 1px rgb(0 0 0 / 0.14)',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.0625rem',
    fontWeight: 700,
    lineHeight: 1.3,
    color: colors.ink,
  },
});
