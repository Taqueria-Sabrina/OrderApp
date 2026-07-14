import { createContext, useContext, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Lightweight staff gate for the back-of-house app.
 *
 * The public menu board (`/`) is open to anyone; everything under `/app` is
 * behind a shared crew passcode. This is a prototype-grade gate — the session
 * flag lives in localStorage and the passcode is checked client-side. In
 * production this would be a real auth provider, but the surface (login form +
 * RequireAuth wrapper) wouldn't change.
 */

const AUTH_KEY = "popup-orders/staff-auth";
// Shared crew passcode. Swap for real auth in production.
const PASSCODE = "sabrina";

/** Check a passcode without changing session state — used to gate destructive
 *  actions (e.g. closing out the day) behind a re-entry of the crew passcode. */
export function verifyPasscode(code: string): boolean {
  return code.trim().toLowerCase() === PASSCODE;
}

type Ctx = {
  authed: boolean;
  login: (code: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<Ctx | null>(null);

function initialAuthed(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(initialAuthed);

  const login = (code: string) => {
    if (code.trim().toLowerCase() !== PASSCODE) return false;
    setAuthed(true);
    try {
      localStorage.setItem(AUTH_KEY, "1");
    } catch {
      /* ignore */
    }
    return true;
  };

  const logout = () => {
    setAuthed(false);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
  };

  return <AuthContext.Provider value={{ authed, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Wraps protected routes: redirects to /login when the crew isn't signed in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const location = useLocation();
  if (!authed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
