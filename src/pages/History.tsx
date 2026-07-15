import { useState } from "react";
import { useStore, menuById, orderQty, orderTotal, deleteOrder, type Order } from "../lib/store";
import { useI18n } from "../lib/i18n";
import PasscodeModal from "../components/PasscodeModal";

function timeOf(ms: number, lang: string) {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function Row({ order }: { order: Order }) {
  const state = useStore();
  const { t, money, lang } = useI18n();
  const byId = menuById(state);
  const done = order.status === "done";
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="rounded-2xl border border-line bg-paper p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-black text-ink">#{order.number}</span>
          <span className="text-sm font-bold text-ink">{order.name || t("order.noname")}</span>
        </div>
        <div className="text-right">
          <span className="font-display text-lg font-black text-pink-deep">{money(orderTotal(order, state.menu))}</span>
          <p className="text-[11px] font-semibold text-ink-soft">{timeOf(order.completedAt ?? order.createdAt, lang)}</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-ink">
        {Object.entries(order.items).map(([id, qty]) => (
          <span key={id}>
            <span className="text-teal-deep">{qty}×</span> {byId[id]?.name ?? id}
          </span>
        ))}
        <span className="text-xs font-semibold text-ink-soft">· {orderQty(order)}</span>
      </div>

      {order.note && (
        <p className="mt-2 rounded bg-pink-soft px-2 py-1 text-xs font-bold text-pink-deep">{order.note}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide"
          style={{
            backgroundColor: done ? "#e6f6f4" : "#fdeaf3",
            color: done ? "#0b6d68" : "#c8437f",
          }}
        >
          {done ? t("hist.done") : t("hist.active")}
        </span>
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-[11px] font-extrabold uppercase tracking-wide text-ink-soft underline underline-offset-4"
        >
          {t("order.del")}
        </button>
      </div>

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

export default function History() {
  const state = useStore();
  const { t } = useI18n();

  // Newest first, keyed by when the ticket last moved (completed, else created).
  const sorted = [...state.orders].sort(
    (a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt),
  );

  return (
    <div className="flex min-h-full flex-col px-5 pb-8 pt-6">
      <header className="mb-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-deep">{t("hist.kicker")}</p>
        <h1 className="font-display text-3xl font-black text-ink">{t("hist.title")}</h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">{t("hist.sub", { n: sorted.length })}</p>
      </header>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line py-10 text-center text-sm font-semibold text-ink-soft">
          {t("hist.empty")}
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((o) => (
            <Row key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
