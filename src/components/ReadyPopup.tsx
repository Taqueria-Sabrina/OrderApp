import { useStore, bumpOrder, menuById, type Order } from "../lib/store";
import { useI18n } from "../lib/i18n";

/**
 * Popup of orders the kitchen has marked READY, so the counter can hand them
 * out. "Delivered" bumps the order to done (removes it from the board). Opened
 * from the "Ready" button in the global top bar (Layout).
 */
export default function ReadyPopup({ orders, onClose }: { orders: Order[]; onClose: () => void }) {
  const state = useStore();
  const { t } = useI18n();
  const byId = menuById(state);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-line bg-paper p-6 shadow-xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black text-ink">{t("order.ready_title")}</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-xl font-bold text-ink-soft"
            aria-label={t("pay.cancel")}
          >
            ×
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line py-10 text-center text-sm font-semibold text-ink-soft">
            {t("order.ready_empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-2xl border border-line border-l-4 border-l-teal bg-paper p-4 shadow-sm">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-display text-xl font-black text-ink">#{o.number}</span>
                  {o.name && <span className="text-sm font-bold text-pink-deep">{o.name}</span>}
                </div>
                <div className="mb-3 flex flex-wrap gap-x-3 text-sm font-bold text-ink">
                  {Object.entries(o.items).map(([id, q]) => (
                    <span key={id}><span className="text-teal-deep">{q}×</span> {byId[id]?.name ?? id}</span>
                  ))}
                </div>
                <button
                  onClick={() => bumpOrder(o.id)}
                  className="w-full rounded-xl py-2.5 text-sm font-black uppercase tracking-wide text-white active:scale-[0.98]"
                  style={{ backgroundColor: "#17b3ab" }}
                >
                  {t("order.deliver")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
