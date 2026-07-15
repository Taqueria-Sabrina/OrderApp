import { createContext, useContext, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { DEMO_KEY, isDemo, leaveDemo } from "./store";

/**
 * Staff gate for the back-of-house app.
 *
 * The public menu board (`/`) is open; everything under `/app` requires a staff
 * login (username + password). Credentials are NOT stored in plaintext — only
 * their SHA-256 hashes live in the source, so the literal password never
 * appears in the repo or the shipped bundle.
 *
 * Honest limitation: this is a static site with no backend, so verification
 * happens in the browser. Hashing defeats casual "grep the source" theft, but a
 * determined attacker could still bypass a client-side gate. For real security,
 * move to Supabase Auth (server-verified sessions + row-level policies).
 */

const AUTH_KEY = "popup-orders/staff-auth";

// SHA-256 hashes (hex). Plaintext lives only in the operators' heads.
// - CREDENTIAL_HASH: sha256("<username>:<password>"), case-sensitive.
// - PASSWORD_HASH: sha256("<password>"), used to re-confirm destructive actions.
const CREDENTIAL_HASH = "3ef6f858bd8979fafae9e59c49b0a25fc98604f6c189f1ed8454aaa9663d4539";
const PASSWORD_HASH = "a9c92dc7a265d1610c1a9529cac0795c98cb6f6d7eaf9b3c75358921e97a4e49";
// Demo login (admin/admin) → sandboxed demo namespace, isolated from live.
const DEMO_CREDENTIAL_HASH = "8da193366e1554c08b2870c50f737b9587c3372b656151c4a96028af26f51334";

async function sha256Hex(input: string): Promise<string> {
  // Web Crypto is only exposed in a SECURE context (HTTPS / localhost). The app
  // force-redirects http→https at startup (see main.tsx) and the host enforces
  // HTTPS, so crypto.subtle is always present by the time this runs.
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Verify a username + password pair against the stored credential hash. */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const hash = await sha256Hex(`${username.trim()}:${password}`);
  return hash === CREDENTIAL_HASH;
}

/** Verify just the password — used to re-confirm destructive actions (close out
 *  the day, delete an order/archive) without re-entering the username. */
export async function verifyPasscode(password: string): Promise<boolean> {
  const hash = await sha256Hex(password);
  return hash === PASSWORD_HASH;
}

type Ctx = {
  authed: boolean;
  login: (username: string, password: string) => Promise<boolean>;
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

  const login = async (username: string, password: string) => {
    const combined = await sha256Hex(`${username.trim()}:${password}`);
    const live = combined === CREDENTIAL_HASH;
    const demo = combined === DEMO_CREDENTIAL_HASH;
    if (!live && !demo) return false;

    try {
      localStorage.setItem(AUTH_KEY, "1");
      if (demo) localStorage.setItem(DEMO_KEY, "1");
      else localStorage.removeItem(DEMO_KEY);
    } catch {
      /* ignore */
    }

    // The store binds its data namespace (live vs demo) at page load, so when
    // the session's namespace must change we do a full reload into /app.
    if (demo !== isDemo) {
      location.assign(`${import.meta.env.BASE_URL}app`);
      return true; // page is reloading
    }

    setAuthed(true);
    return true;
  };

  const logout = () => {
    // Demo: let the store leave presence + clear demo data if we're the last one.
    const wasDemo = isDemo;
    const finish = () => {
      try {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(DEMO_KEY);
      } catch {
        /* ignore */
      }
      // Reload back to the public board (also resets the store namespace to live).
      location.assign(import.meta.env.BASE_URL);
    };
    if (wasDemo) {
      void leaveDemo().finally(finish);
    } else {
      setAuthed(false);
      finish();
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
