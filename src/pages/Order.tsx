import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useStore,
  fireOrder,
  createTab,
  settleTab,
  tabOrdersOf,
  tabTotalOf,
  menuById,
  dealPrice,
  tacoCountOf,
  alaCarteTotalOf,
  tacoListTotal,
  type PaymentMethod,
  type Tab,
} from "../lib/store";
import { useI18n } from "../lib/i18n";
import PasscodeModal from "../components/PasscodeModal";

/**
 * Checkout modal. Cash shows a numpad + change; Card confirms; "Pay later"
 * (only when a name is present) puts the order on a tab; "Comp" (password-gated)
 * fires it free. `total` is whole € (matches money()).
 */
function Checkout({
  total,
  canLater,
  onPaid,
  onClose,
}: {
  total: number;
  canLater: boolean;
  onPaid: (m: PaymentMethod) => void;
  onClose: () => void;
}) {
  const { t, money } = useI18n();
  const [method, setMethod] = useState<"cash" | "card" | null>(null);
  const [received, setReceived] = useState("");
  const [compAsk, setCompAsk] = useState(false);

  const receivedNum = received === "" ? 0 : parseInt(received, 10);
  const change = receivedNum - total;
  const tapKey = (k: string) => {
    if (k === "del") return setReceived((r) => r.slice(0, -1));
    if (k === "clr") return setReceived("");
    setReceived((r) => (r === "0" ? k : (r + k).slice(0, 5)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border border-line bg-paper p-6 shadow-xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black text-ink">{t("pay.title")}</h2>
          <span className="font-display text-2xl font-black text-pink-deep">{money(total)}</span>
        </div>

        {method === null && (
          <div>
            <p className="mb-3 text-sm font-semibold text-ink-soft">{t("pay.how")}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod("cash")}
                className="rounded-2xl py-6 text-lg font-black uppercase tracking-wide text-white"
                style={{ backgroundColor: "#17b3ab", boxShadow: "0 6px 0 #0f8f88" }}
              >
                {t("pay.cash")}
              </button>
              <button
                onClick={() => setMethod("card")}
                className="rounded-2xl py-6 text-lg font-black uppercase tracking-wide text-white"
                style={{ backgroundColor: "#c8437f", boxShadow: "0 6px 0 #96225c" }}
              >
                {t("pay.card")}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {canLater && (
                <button
                  onClick={() => onPaid("later")}
                  className="rounded-2xl border-2 border-amber py-3 text-sm font-black uppercase tracking-wide text-amber"
                  style={{ color: "#b7791f", borderColor: "#e79a3a" }}
                >
                  {t("pay.later")}
                </button>
              )}
              <button
                onClick={() => setCompAsk(true)}
                className={`rounded-2xl border-2 border-line py-3 text-sm font-black uppercase tracking-wide text-ink-soft ${canLater ? "" : "col-span-2"}`}
              >
                {t("pay.comp")}
              </button>
            </div>
            <button onClick={onClose} className="mt-4 w-full py-2 text-sm font-bold text-ink-soft">
              {t("pay.cancel")}
            </button>
          </div>
        )}

        {method === "card" && (
          <div>
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-cream px-4 py-4">
              <span className="text-sm font-extrabold uppercase tracking-wide text-ink-soft">{t("pay.card")}</span>
              <span className="font-display text-3xl font-black text-ink">{money(total)}</span>
            </div>
            <button
              onClick={() => onPaid("card")}
              className="w-full rounded-2xl py-4 text-lg font-black uppercase tracking-wide text-white"
              style={{ backgroundColor: "#c8437f", boxShadow: "0 6px 0 #96225c" }}
            >
              {t("pay.paid")}
            </button>
            <button onClick={() => setMethod(null)} className="mt-3 w-full py-2 text-sm font-bold text-ink-soft">
              {t("pay.back")}
            </button>
          </div>
        )}

        {method === "cash" && (
          <div>
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-cream px-2 py-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">{t("pay.total")}</p>
                <p className="font-display text-xl font-black text-ink">{money(total)}</p>
              </div>
              <div className="rounded-xl bg-cream px-2 py-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">{t("pay.received")}</p>
                <p className="font-display text-xl font-black text-teal-deep">{received === "" ? "—" : money(receivedNum)}</p>
              </div>
              <div className="rounded-xl px-2 py-2" style={{ backgroundColor: change >= 0 ? "#e6f6f4" : "#fdeaf3" }}>
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">{t("pay.change")}</p>
                <p className="font-display text-xl font-black" style={{ color: change >= 0 ? "#0b6d68" : "#c8437f" }}>
                  {received === "" ? "—" : money(change)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clr", "0", "del"].map((k) => (
                <button
                  key={k}
                  onClick={() => tapKey(k)}
                  className="rounded-xl bg-cream py-4 font-display text-2xl font-black text-ink active:scale-[0.97]"
                >
                  {k === "del" ? "⌫" : k === "clr" ? t("pay.clear") : k}
                </button>
              ))}
            </div>
            <button
              onClick={() => onPaid("cash")}
              disabled={receivedNum < total}
              className="mt-4 w-full rounded-2xl py-4 text-lg font-black uppercase tracking-wide text-white transition disabled:opacity-40"
              style={{ backgroundColor: "#17b3ab", boxShadow: receivedNum < total ? "none" : "0 6px 0 #0f8f88" }}
            >
              {t("pay.paid")}
            </button>
            <button onClick={() => setMethod(null)} className="mt-3 w-full py-2 text-sm font-bold text-ink-soft">
              {t("pay.back")}
            </button>
          </div>
        )}
      </div>

      {compAsk && (
        <PasscodeModal
          title={t("pay.comp")}
          prompt={t("pay.comp_confirm")}
          confirmLabel={t("pay.comp")}
          onConfirm={() => onPaid("comp")}
          onClose={() => setCompAsk(false)}
        />
      )}
    </div>
  );
}

/** Open tabs list — settle each (cash/card/comp) at its combined running total. */
function TabsPopup({ onClose }: { onClose: () => void }) {
  const state = useStore();
  const { t, money } = useI18n();
  const byId = menuById(state);
  const [settling, setSettling] = useState<Tab | null>(null);
  const openTabs = state.tabs.filter((tb) => tb.status === "open");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-line bg-paper p-6 shadow-xl sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-black text-ink">{t("tabs.title")}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-xl font-bold text-ink-soft">×</button>
        </div>

        {openTabs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line py-10 text-center text-sm font-semibold text-ink-soft">{t("tabs.empty")}</p>
        ) : (
          <div className="space-y-3">
            {openTabs.map((tb) => {
              const ords = tabOrdersOf(tb.id, state.orders);
              const items: Record<string, number> = {};
              for (const o of ords) for (const [id, n] of Object.entries(o.items)) items[id] = (items[id] ?? 0) + n;
              return (
                <div key={tb.id} className="rounded-2xl border border-line border-l-4 border-l-amber bg-paper p-4 shadow-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-display text-lg font-black text-ink">{tb.name}</span>
                    <span className="font-display text-xl font-black text-pink-deep">{money(tabTotalOf(ords, state.menu))}</span>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-x-3 text-sm font-bold text-ink">
                    {Object.entries(items).map(([id, q]) => (
                      <span key={id}><span className="text-teal-deep">{q}×</span> {byId[id]?.name ?? id}</span>
                    ))}
                    {ords.length === 0 && <span className="text-ink-soft">—</span>}
                  </div>
                  <button
                    onClick={() => setSettling(tb)}
                    className="w-full rounded-xl py-2.5 text-sm font-black uppercase tracking-wide text-white active:scale-[0.98]"
                    style={{ backgroundColor: "#c8437f" }}
                  >
                    {t("tabs.settle")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {settling && (
        <Checkout
          total={tabTotalOf(tabOrdersOf(settling.id, state.orders), state.menu)}
          canLater={false}
          onPaid={(m) => {
            settleTab(settling.id, m as "cash" | "card" | "comp");
            setSettling(null);
          }}
          onClose={() => setSettling(null)}
        />
      )}
    </div>
  );
}

export default function Order() {
  const state = useStore();
  const { t, money } = useI18n();
  const navigate = useNavigate();
  const menu = state.menu.filter((taco) => taco.active);

  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [tabId, setTabId] = useState(""); // selected existing tab ("" = none/new)
  const [flash, setFlash] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [showTabs, setShowTabs] = useState(false);

  const openTabs = state.tabs.filter((tb) => tb.status === "open");
  const set = (id: string, delta: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + delta) }));

  const items = menu.reduce((s, taco) => s + (qty[taco.id] ?? 0), 0);
  const tacoQty = tacoCountOf(qty, state.menu);
  const total = dealPrice(tacoQty) + alaCarteTotalOf(qty, state.menu);
  const savings = tacoListTotal(qty, state.menu) - dealPrice(tacoQty);

  const reset = () => {
    setCheckout(false);
    setQty({});
    setName("");
    setNote("");
    setTabId("");
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      navigate("/app/queue");
    }, 550);
  };

  // Fire a standalone order paid now / comp.
  const fire = (payment: PaymentMethod) => {
    fireOrder(qty, note, name, payment);
    reset();
  };
  // Send to kitchen; either onto a chosen tab, a brand-new tab, or checkout.
  const send = () => {
    if (tabId) {
      const tab = openTabs.find((tb) => tb.id === tabId);
      fireOrder(qty, note, tab?.name ?? name, "later", tabId);
      reset();
      return;
    }
    setCheckout(true);
  };
  const onPaid = (m: PaymentMethod) => {
    if (m === "later") {
      const id = createTab(name);
      fireOrder(qty, note, name, "later", id);
      reset();
      return;
    }
    fire(m);
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-5 pb-4 pt-6">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-pink-deep">{t("order.kicker")}</p>
          <h1 className="font-display text-3xl font-black text-ink">{t("order.title")}</h1>
        </div>
        <div className="flex items-center gap-3">
          {openTabs.length > 0 && (
            <button
              onClick={() => setShowTabs(true)}
              className="relative flex items-center gap-1.5 rounded-full border-2 border-amber bg-paper px-3 py-2 text-xs font-extrabold uppercase tracking-wide"
              style={{ borderColor: "#e79a3a", color: "#b7791f" }}
            >
              {t("tabs.btn")}
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-amber px-1.5 text-xs font-black text-white shadow" style={{ backgroundColor: "#e79a3a" }}>
                {openTabs.length}
              </span>
            </button>
          )}
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal text-lg font-black text-white">
            #{state.nextNumber}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 px-5 pb-4">
        {menu.map((taco) => {
          const c = qty[taco.id] ?? 0;
          return (
            <button
              key={taco.id}
              onClick={() => set(taco.id, 1)}
              className="relative flex flex-col justify-between rounded-3xl border-2 bg-paper p-4 text-left shadow-sm transition active:scale-[0.98]"
              style={{ borderColor: c ? taco.tint : "#f0e3ea", backgroundColor: c ? `${taco.tint}18` : "#ffffff" }}
            >
              {c > 0 && (
                <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white shadow" style={{ backgroundColor: taco.tint }}>
                  {c}
                </span>
              )}
              <span className="h-10 w-10 rounded-2xl" style={{ backgroundColor: taco.tint }} />
              <div className="mt-3">
                <p className="font-display text-lg font-black leading-tight text-ink">{taco.name}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-ink-soft">{taco.note}</p>
                <p className="mt-2 text-sm font-black" style={{ color: taco.tint }}>{money(taco.price)}</p>
              </div>
              {c > 0 && (
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    set(taco.id, -1);
                  }}
                  className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-cream text-lg font-bold text-ink-soft"
                >
                  −
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 px-5 pb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("order.name_ph")}
          disabled={tabId !== ""}
          className="w-full rounded-xl border-2 border-line bg-paper px-4 py-3 text-sm font-semibold text-ink placeholder:text-ink-soft focus:border-teal focus:outline-none disabled:opacity-50"
        />
        {/* Tab picker appears only once at least one tab is open for the day */}
        {openTabs.length > 0 && (
          <select
            value={tabId}
            onChange={(e) => setTabId(e.target.value)}
            className="w-full rounded-xl border-2 border-line bg-cream px-3 py-3 text-sm font-semibold text-ink focus:border-teal focus:outline-none"
          >
            <option value="">{t("order.tab_none")}</option>
            {openTabs.map((tb) => (
              <option key={tb.id} value={tb.id}>{t("order.tab_prefix")} {tb.name}</option>
            ))}
          </select>
        )}
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("order.note_ph")}
          className="w-full rounded-xl border-2 border-dashed border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-teal focus:outline-none"
        />
      </div>

      <div className="mt-auto border-t border-line bg-paper px-5 pb-6 pt-4">
        <div className="mb-3 flex items-center justify-center gap-3 rounded-xl bg-pink-soft py-1.5 font-display text-sm font-black text-pink-deep">
          <span>1×3€</span>
          <span className="text-pink">·</span>
          <span>2×5€</span>
          <span className="text-pink">·</span>
          <span>3×7€</span>
        </div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <span className="text-sm font-semibold text-ink-soft">{t("order.tacos", { n: tacoQty })}</span>
            {savings > 0 && (
              <span className="ml-2 rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-black text-teal-deep">
                {t("order.save", { amt: money(savings) })}
              </span>
            )}
          </div>
          <span className="font-display text-3xl font-black text-ink">{money(total)}</span>
        </div>
        <button
          onClick={send}
          disabled={items === 0}
          className="w-full rounded-2xl py-4 text-lg font-black uppercase tracking-wide transition disabled:opacity-40"
          style={{
            backgroundColor: flash ? "#17b3ab" : "#c8437f",
            color: "#fff",
            boxShadow: items === 0 ? "none" : flash ? "0 8px 0 #0f8f88" : "0 8px 0 #96225c",
          }}
        >
          {flash ? t("order.sent") : tabId ? t("order.send_tab") : t("order.send")}
        </button>
      </div>

      {checkout && <Checkout total={total} canLater={name.trim() !== ""} onPaid={onPaid} onClose={() => setCheckout(false)} />}
      {showTabs && <TabsPopup onClose={() => setShowTabs(false)} />}
    </div>
  );
}
