export interface StoredAuthState {
  isLoggedIn: boolean;
  user?: string;
  pages: string[];
}

export function loadAuthState(): StoredAuthState | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const data = localStorage.getItem('auth');
    if (!data) return undefined;
    return JSON.parse(data) as StoredAuthState;
  } catch {
    return undefined;
  }
}

export function saveAuthState(state: StoredAuthState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('auth', JSON.stringify(state));
  } catch {}
}

export function clearAuthState() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('auth');
  } catch {}
}
