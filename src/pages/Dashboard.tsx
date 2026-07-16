import { useState } from "react";
import {
  useStore,
  soldCounts,
  revenue,
  revenueByTaco,
  revenueByPayment,
  soldCountsOf,
  revenueOf,
  closeOutDay,
  deleteArchive,
  type Archive,
} from "../lib/store";
import { useI18n } from "../lib/i18n";
import PasscodeModal from "../components/PasscodeModal";

/** One archived (past) service — collapsed to a summary row, expandable. */
function ArchiveRow({ archive }: { archive: Archive }) {
  const state = useStore();
  const { t, money, longDate } = useI18n();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const sold = soldCountsOf(archive.orders);
  const rev = revenueOf(archive.orders, state.menu);
  const totalSold = Object.values(sold).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-line bg-paper p-4 shadow-sm">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <div>
          <p className="font-display text-lg font-black text-ink">{longDate(new Date(archive.closedAt))}</p>
          <p className="text-xs font-semibold text-ink-soft">
            {t("dash.past_orders", { n: archive.orders.length })} · {t("dash.tacos_sold", { n: totalSold })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-black text-pink-deep">{money(rev)}</span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-teal-deep">
            {open ? t("dash.hide") : t("dash.view")}
          </span>
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-1.5 border-t border-line pt-3">
          {state.menu.map((taco) => {
            const n = sold[taco.id] ?? 0;
            if (n === 0) return null;
            return (
              <div key={taco.id} className="flex items-center justify-between text-sm font-bold text-ink">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: taco.tint }} />
                  {taco.name}
                </span>
                <span className="tabular-nums text-ink-soft">{n} ×</span>
              </div>
            );
          })}
          {Object.keys(sold).length === 0 && (
            <p className="text-sm font-semibold text-ink-soft">—</p>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            className="mt-2 text-xs font-extrabold uppercase tracking-wide text-pink-deep underline underline-offset-4"
          >
            {t("dash.del")}
          </button>
        </div>
      )}

      {confirmDelete && (
        <PasscodeModal
          title={t("dash.del")}
          prompt={t("dash.del_confirm")}
          confirmLabel={t("dash.del_go")}
          onConfirm={() => deleteArchive(archive.id)}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  const state = useStore();
  const { t, money } = useI18n();
  const [showClose, setShowClose] = useState(false);
  const [flash, setFlash] = useState(false);
  const sold = soldCounts(state);
  const byTaco = revenueByTaco(state);
  const totalSold = Object.values(sold).reduce((a, b) => a + b, 0);
  const orders = state.orders.length;
  const rev = revenue(state);
  const pay = revenueByPayment(state);
  const max = Math.max(1, ...state.menu.map((taco) => sold[taco.id] ?? 0));

  const onCloseConfirmed = () => {
    closeOutDay();
    setFlash(true);
    setTimeout(() => setFlash(false), 1600);
  };

  return (
    <div className="flex min-h-full flex-col px-5 pb-8 pt-6">
      <header className="mb-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-pink-deep">{t("dash.kicker")}</p>
        <h1 className="font-display text-3xl font-black text-ink">{t("dash.title")}</h1>
      </header>

      {flash && (
        <p className="mb-4 rounded-2xl bg-teal-soft p-3 text-center text-sm font-black text-teal-deep">
          {t("dash.closed")}
        </p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3">
        {[
          { label: t("dash.revenue"), value: money(rev), sub: t("dash.orders", { n: orders }), fg: "#c8437f" },
          { label: t("dash.sold"), value: totalSold, sub: t("dash.per_order", { x: (totalSold / (orders || 1)).toFixed(1) }), fg: "#0f8f88" },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl border border-line bg-paper p-5 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{s.label}</p>
            <p className="mt-1 font-display text-4xl font-black tabular-nums" style={{ color: s.fg }}>{s.value}</p>
            <p className="mt-1 text-xs font-semibold text-ink-soft">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Cash / card split */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-line bg-paper p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{t("pay.cash")}</p>
          <p className="mt-1 font-display text-3xl font-black tabular-nums text-teal-deep">{money(pay.cash.total)}</p>
          <p className="mt-1 text-xs font-semibold text-ink-soft">{t("dash.orders", { n: pay.cash.count })}</p>
        </div>
        <div className="rounded-3xl border border-line bg-paper p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{t("pay.card")}</p>
          <p className="mt-1 font-display text-3xl font-black tabular-nums text-pink-deep">{money(pay.card.total)}</p>
          <p className="mt-1 text-xs font-semibold text-ink-soft">{t("dash.orders", { n: pay.card.count })}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-paper p-5 shadow-sm">
        <h2 className="mb-4 font-display text-xl font-black text-ink">{t("dash.sold_by")}</h2>
        <div className="space-y-4">
          {state.menu.map((taco) => {
            const n = sold[taco.id] ?? 0;
            return (
              <div key={taco.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: taco.tint }} />
                    {taco.name}
                    {!taco.active && <span className="text-[10px] font-extrabold uppercase text-ink-soft">{t("dash.off")}</span>}
                  </span>
                  <span className="font-display text-lg font-black tabular-nums text-ink">{n}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-cream">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(n / max) * 100}%`, backgroundColor: taco.tint }}
                  />
                </div>
                <p className="mt-1 text-[11px] font-bold text-ink-soft">{t("dash.in_sales", { x: money(byTaco[taco.id] ?? 0) })}</p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-6 rounded-2xl border border-line bg-teal-soft p-4 text-sm font-bold text-teal-deep">{t("dash.note")}</p>

      {/* Past weeks */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-2xl font-black text-ink">{t("dash.past_weeks")}</h2>
        {state.archives.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line py-8 text-center text-sm font-semibold text-ink-soft">
            {t("dash.past_empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {state.archives.map((a) => (
              <ArchiveRow key={a.id} archive={a} />
            ))}
          </div>
        )}
      </section>

      {/* Close out the day */}
      <button
        onClick={() => setShowClose(true)}
        disabled={orders === 0}
        className="mt-8 w-full rounded-2xl border-2 border-pink-deep py-3.5 text-sm font-black uppercase tracking-wide text-pink-deep transition active:scale-[0.98] disabled:opacity-40"
      >
        {t("dash.close_day")}
      </button>
      <p className="mt-2 text-center text-xs font-semibold text-ink-soft">{t("dash.close_day_sub")}</p>

      {showClose && (
        <PasscodeModal
          title={t("dash.close_day")}
          prompt={t("dash.close_confirm")}
          confirmLabel={t("dash.close_go")}
          onConfirm={onCloseConfirmed}
          onClose={() => setShowClose(false)}
        />
      )}
    </div>
  );
}
