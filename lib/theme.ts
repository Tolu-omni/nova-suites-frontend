export const THEME_KEY = 'nova-admin-theme';

export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

/** Client snapshot — reads the class the pre-paint script already applied. */
export function getTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage unavailable — theme still applies for this session */
  }
  listeners.forEach(listener => listener());
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Runs before paint so a returning dark-mode admin never sees a light flash.
// The `.dark` class only affects styles scoped to `.admin-shell`, so the public
// site is unaffected even when the class is present on <html>.
export const themeInitScript = `try{if(localStorage.getItem('${THEME_KEY}')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;
