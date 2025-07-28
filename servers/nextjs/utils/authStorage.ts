export interface StoredAuthState {
  isLoggedIn: boolean;
  user?: string;
  pages: string[];
  linkedinPages: string[];
}

export function loadAuthState(): StoredAuthState | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const data = localStorage.getItem('auth');
    if (!data) return undefined;
    const parsed = JSON.parse(data) as StoredAuthState;
    parsed.linkedinPages = parsed.linkedinPages || [];
    return parsed;
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
