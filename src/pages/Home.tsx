import { Link } from "react-router-dom";
import { useStore, revenue, soldCounts } from "../lib/store";
import { useI18n } from "../lib/i18n";
import Wordmark from "../components/Wordmark";

export default function Home() {
  const state = useStore();
  const { t, money } = useI18n();
  const sold = soldCounts(state);
  const totalSold = Object.values(sold).reduce((a, b) => a + b, 0);
  // "Open" = still on the live board (not picked up / archived).
  const open = state.orders.filter((o) => o.status !== "done").length;
  const active = state.menu.filter((t) => t.active);

  const tiles = [
    { to: "/app/order", title: t("home.take_order"), desc: t("home.take_order_sub"), bg: "#17b3ab", fg: "#fff" },
    { to: "/app/queue", title: t("home.kitchen"), desc: t("home.kitchen_sub"), bg: "#c8437f", fg: "#fff" },
    { to: "/app/dashboard", title: t("home.sales"), desc: t("home.sales_sub"), bg: "#ef92c0", fg: "#5a1738" },
    { to: "/app/menu", title: t("home.week_menu"), desc: t("home.week_menu_sub"), bg: "#e79a3a", fg: "#4a2a08" },
  ];

  return (
    <div className="flex min-h-full flex-col px-5 pb-8 pt-6">
      <header className="mb-2">
        <Wordmark />
      </header>
      <p className="mb-6 text-sm font-semibold text-ink-soft">{t("home.subtitle")}</p>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: t("home.revenue"), value: money(revenue(state)), fg: "#c8437f" },
          { label: t("home.sold"), value: totalSold, fg: "#0f8f88" },
          { label: t("home.open"), value: open, fg: "#e79a3a" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-paper p-3 text-center shadow-sm">
            <p className="text-2xl font-black tabular-nums" style={{ color: s.fg }}>{s.value}</p>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="flex min-h-32 flex-col justify-between rounded-3xl p-4 shadow-sm transition active:scale-[0.98]"
            style={{ backgroundColor: tile.bg, color: tile.fg }}
          >
            <span className="font-display text-xl font-black leading-tight">{tile.title}</span>
            <span className="text-xs font-bold opacity-90">{tile.desc}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper p-4 shadow-sm">
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">{t("home.on_menu")}</p>
        <div className="flex flex-wrap gap-2">
          {active.map((taco) => (
            <span key={taco.id} className="rounded-full bg-teal-soft px-3 py-1 text-sm font-bold text-teal-deep">
              {taco.emoji} {taco.name}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-3 rounded-xl bg-pink-soft py-2 font-display text-lg font-black text-pink-deep">
          <span>1×3€</span>
          <span className="text-pink">·</span>
          <span>2×5€</span>
          <span className="text-pink">·</span>
          <span>3×7€</span>
        </div>
      </div>

      <p className="mt-5 text-center text-xs font-semibold text-ink-soft">{t("home.sync_note")}</p>
    </div>
  );
}
