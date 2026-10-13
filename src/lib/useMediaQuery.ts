import { useSyncExternalStore } from 'react';

/** Phone-sized screens, where the wheel and the sidebar start out pared down. */
export const COMPACT_QUERY = '(max-width: 599.98px)';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );
}
