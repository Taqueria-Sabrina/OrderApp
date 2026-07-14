import { useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import Logo from "../components/Logo";

export default function Login() {
  const { authed, login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const dest = (location.state as { from?: string } | null)?.from ?? "/app";
  // Already signed in? Skip straight to the app.
  if (authed) return <Navigate to={dest} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(username, password)) {
      navigate(dest, { replace: true });
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link to="/">
            <Logo size="md" />
          </Link>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-line bg-paper p-6 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-deep">{t("login.sub")}</p>
          <h1 className="mb-5 font-display text-2xl font-black text-ink">{t("login.title")}</h1>

          <input
            autoFocus
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(false);
            }}
            placeholder={t("login.user_ph")}
            className="w-full rounded-xl border-2 border-line bg-cream px-4 py-3 text-base font-semibold text-ink placeholder:text-ink-soft focus:border-teal focus:outline-none"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder={t("login.ph")}
            className="mt-3 w-full rounded-xl border-2 border-line bg-cream px-4 py-3 text-base font-semibold text-ink placeholder:text-ink-soft focus:border-teal focus:outline-none"
          />
          {error && <p className="mt-2 text-sm font-bold text-pink-deep">{t("login.error")}</p>}

          <button
            type="submit"
            className="mt-4 w-full rounded-2xl py-3.5 text-base font-black uppercase tracking-wide text-white transition active:scale-[0.98]"
            style={{ backgroundColor: "#c8437f", boxShadow: "0 6px 0 #96225c" }}
          >
            {t("login.enter")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs font-bold text-ink-soft underline underline-offset-4">
            {t("login.public")}
          </Link>
        </div>
      </div>
    </div>
  );
}
