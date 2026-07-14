import { NavLink, Outlet, Link } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import LangToggle from "./LangToggle";
import LiveBadge from "./LiveBadge";

const NAV = [
  { to: "/app/order", key: "nav.order" as const, icon: "＋" },
  { to: "/app/queue", key: "nav.queue" as const, icon: "☰" },
  { to: "/app/dashboard", key: "nav.sales" as const, icon: "▤" },
  { to: "/app/history", key: "nav.history" as const, icon: "🕑" },
  { to: "/app/menu", key: "nav.menu" as const, icon: "✎" },
];

export default function Layout() {
  const { t } = useI18n();
  const { logout } = useAuth();
  return (
    <div className="mx-auto flex h-full max-w-md flex-col bg-cream">
      {/* Festive papel-picado teal edge */}
      <div className="papel h-4 shrink-0 text-teal" />
      {/* Global top bar: brand · live status · language */}
      <div className="flex shrink-0 items-center justify-between border-b border-line bg-cream px-4 py-2">
        <Link to="/app" className="font-display text-lg font-black italic leading-none text-pink-deep">
          Sabrina <span aria-hidden>🐩</span>
        </Link>
        <div className="flex items-center gap-2">
          <LiveBadge />
          <LangToggle />
          <button
            onClick={logout}
            className="rounded-full bg-cream px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft"
          >
            {t("logout")}
          </button>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>
      <nav className="grid shrink-0 grid-cols-5 border-t border-line bg-paper">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] font-extrabold uppercase tracking-wide transition ${
                isActive ? "text-teal-deep" : "text-ink-soft"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-base transition"
                  style={{
                    backgroundColor: isActive ? "#17b3ab" : "#f0e3ea",
                    color: isActive ? "#fff" : "#8a7d97",
                  }}
                >
                  {n.icon}
                </span>
                {t(n.key)}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
