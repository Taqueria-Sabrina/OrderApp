import { useEffect, useState } from "react";
import { useStore, menuById, advanceOrder, bumpOrder, deleteOrder, type Order, type OrderStatus } from "../lib/store";
import { useI18n } from "../lib/i18n";
import PasscodeModal from "../components/PasscodeModal";

const LANES: { status: OrderStatus; key: "queue.new" | "queue.cooking" | "queue.ready"; accent: string }[] = [
  { status: "new", key: "queue.new", accent: "#c8437f" },
  { status: "cooking", key: "queue.cooking", accent: "#e79a3a" },
  { status: "ready", key: "queue.ready", accent: "#17b3ab" },
];

function Card({ order, accent, now }: { order: Order; accent: string; now: number }) {
  const state = useStore();
  const { t } = useI18n();
  const byId = menuById(state);
  const isReady = order.status === "ready";
  const [confirmDelete, setConfirmDelete] = useState(false);

  const secs = Math.max(0, Math.floor((now - order.createdAt) / 1000));
  const timeLabel = secs < 60 ? t("queue.now") : t("queue.min_ago", { m: Math.floor(secs / 60) });

  return (
    <div className="rounded-2xl border border-line border-l-4 bg-paper p-4 shadow-sm" style={{ borderLeftColor: accent }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-baseline gap-2">
          <span className="font-display text-xl font-black text-ink">#{order.number}</span>
          {order.name && <span className="text-sm font-bold text-pink-deep">{order.name}</span>}
        </span>
        <span className="text-xs font-semibold text-ink-soft">{timeLabel}</span>
      </div>
      <ul className="space-y-1">
        {Object.entries(order.items).map(([id, qty]) => (
          <li key={id} className="flex items-baseline gap-3 text-base font-bold text-ink">
            <span className="font-black" style={{ color: accent }}>{qty}×</span>
            <span>{byId[id]?.name ?? id}</span>
          </li>
        ))}
      </ul>
      {order.note && (
        <p className="mt-2 rounded bg-pink-soft px-2 py-1 text-xs font-bold text-pink-deep">{order.note}</p>
      )}
      <button
        onClick={() => (isReady ? bumpOrder(order.id) : advanceOrder(order.id))}
        className="mt-3 w-full rounded-xl py-2.5 text-sm font-black text-white transition active:scale-[0.98]"
        style={{ backgroundColor: accent }}
      >
        {order.status === "new" ? t("queue.start") : order.status === "cooking" ? t("queue.mark_ready") : t("queue.clear")}
      </button>
      <button
        onClick={() => setConfirmDelete(true)}
        className="mt-2 w-full text-center text-[11px] font-extrabold uppercase tracking-wide text-ink-soft underline underline-offset-4"
      >
        {t("order.del")}
      </button>

      {confirmDelete && (
        <PasscodeModal
          title={t("order.del")}
          prompt={t("order.del_confirm", { n: order.number })}
          confirmLabel={t("order.del_go")}
          onConfirm={() => deleteOrder(order.id)}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

export default function Queue() {
  const state = useStore();
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Only live tickets belong on the board; picked-up ones move to History.
  const sorted = state.orders
    .filter((o) => o.status !== "done")
    .sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-cream/95 px-5 pb-4 pt-6 backdrop-blur">
        <div>
          <h1 className="font-display text-3xl font-black text-ink">{t("queue.title")}</h1>
          <p className="text-sm font-semibold text-ink-soft">{t("queue.sub", { n: sorted.length })}</p>
        </div>
      </header>

      <div className="space-y-6 px-5 py-5">
        {LANES.map((lane) => {
          const cards = sorted.filter((o) => o.status === lane.status);
          return (
            <section key={lane.status}>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: lane.accent }} />
                <h2 className="font-display text-xl font-black text-ink">{t(lane.key)}</h2>
                <span className="text-sm font-black text-ink-soft">{cards.length}</span>
              </div>
              {cards.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line py-6 text-center text-sm font-semibold text-ink-soft">
                  {t("queue.empty")}
                </p>
              ) : (
                <div className="space-y-3">
                  {cards.map((o) => (
                    <Card key={o.id} order={o} accent={lane.accent} now={now} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
