/**
 * Simple session management für Demo-Login
 * Speichert Nutzer-Info in localStorage
 */

export interface Session {
  personalNr: string;
  name: string;
  role: "PKL" | "MA";
}

const SESSION_KEY = "bembe-app-session";

export function setSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as Session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return !!getSession();
}
