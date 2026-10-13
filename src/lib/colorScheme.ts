import { useCallback, useEffect, useState } from 'react';

export type Scheme = 'light' | 'dark';

/** Must match the key read by the inline script in index.html. */
const STORAGE_KEY = 'coffee-wheel:color-scheme';
const DARK_QUERY = '(prefers-color-scheme: dark)';
const THEME_COLORS: Record<Scheme, string> = { light: '#f6efe4', dark: '#14100d' };

function readOverride(): Scheme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function writeOverride(value: Scheme | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: the override still applies for this page view.
  }
}

/** Reflects the override in <meta name="color-scheme">, which index.css maps onto `color-scheme`. */
function applyOverride(value: Scheme | null) {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (meta) meta.content = value ?? 'light dark';
  for (const theme of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const own = theme.media.includes('dark') ? 'dark' : 'light';
    theme.content = THEME_COLORS[value ?? own];
  }
}

/**
 * Two-state colour scheme toggle on top of the system preference. No stored value means "follow
 * the system"; toggling to the opposite of the system stores it, toggling back clears it.
 */
export function useColorScheme() {
  const [override, setOverride] = useState<Scheme | null>(readOverride);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const onChange = () => setSystemDark(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Keep other open tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) setOverride(readOverride());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => applyOverride(override), [override]);

  const system: Scheme = systemDark ? 'dark' : 'light';
  const resolved: Scheme = override ?? system;

  const toggle = useCallback(() => {
    const target: Scheme = resolved === 'dark' ? 'light' : 'dark';
    // Matching the system means the user is undoing their adjustment: go back to following it.
    const next = target === system ? null : target;
    writeOverride(next);
    setOverride(next);
  }, [resolved, system]);

  return { scheme: resolved, toggle };
}
