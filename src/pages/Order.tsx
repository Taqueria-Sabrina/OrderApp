import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, fireOrder, dealPrice, tacoCountOf, alaCarteTotalOf, tacoListTotal, type PaymentMethod } from "../lib/store";
import { useI18n } from "../lib/i18n";

/**
 * Checkout step shown after "Send Order": pick Cash/Card, confirm payment,
 * then the order fires to the kitchen. Cash shows a numpad to enter the amount
 * received and computes change. `total` is in whole € (matches money()).
 */
function Checkout({ total, onPaid, onClose }: { total: number; onPaid: (m: PaymentMethod) => void; onClose: () => void }) {
  const { t, money } = useI18n();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [received, setReceived] = useState(""); // cash entered, as a string of digits (€)

  const receivedNum = received === "" ? 0 : parseInt(received, 10);
  const change = receivedNum - total;

  const tapKey = (k: string) => {
    if (k === "del") return setReceived((r) => r.slice(0, -1));
    if (k === "clr") return setReceived("");
    setReceived((r) => (r === "0" ? k : (r + k).slice(0, 5))); // cap at 5 digits
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
  const [flash, setFlash] = useState(false);
  const [checkout, setCheckout] = useState(false);

  const set = (id: string, delta: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + delta) }));

  const items = menu.reduce((s, taco) => s + (qty[taco.id] ?? 0), 0);
  // Tacos share the bundle deal; non-taco items are added a la carte.
  const tacoQty = tacoCountOf(qty, state.menu);
  const total = dealPrice(tacoQty) + alaCarteTotalOf(qty, state.menu);
  const savings = tacoListTotal(qty, state.menu) - dealPrice(tacoQty);

  const fire = (payment: PaymentMethod) => {
    fireOrder(qty, note, name, payment);
    setCheckout(false);
    setQty({});
    setName("");
    setNote("");
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      navigate("/app/queue");
    }, 550);
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-5 pb-4 pt-6">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-pink-deep">{t("order.kicker")}</p>
          <h1 className="font-display text-3xl font-black text-ink">{t("order.title")}</h1>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal text-lg font-black text-white">
          #{state.nextNumber}
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
              style={{
                borderColor: c ? taco.tint : "#f0e3ea",
                backgroundColor: c ? `${taco.tint}18` : "#ffffff",
              }}
            >
              {c > 0 && (
                <span
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white shadow"
                  style={{ backgroundColor: taco.tint }}
                >
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
          className="w-full rounded-xl border-2 border-line bg-paper px-4 py-3 text-sm font-semibold text-ink placeholder:text-ink-soft focus:border-teal focus:outline-none"
        />
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
          onClick={() => setCheckout(true)}
          disabled={items === 0}
          className="w-full rounded-2xl py-4 text-lg font-black uppercase tracking-wide transition disabled:opacity-40"
          style={{
            backgroundColor: flash ? "#17b3ab" : "#c8437f",
            color: "#fff",
            boxShadow: items === 0 ? "none" : flash ? "0 8px 0 #0f8f88" : "0 8px 0 #96225c",
          }}
        >
          {flash ? t("order.sent") : t("order.send")}
        </button>
      </div>

      {checkout && <Checkout total={total} onPaid={fire} onClose={() => setCheckout(false)} />}
    </div>
  );
}
