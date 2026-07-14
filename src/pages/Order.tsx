import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, fireOrder, dealPrice, listTotal } from "../lib/store";
import { useI18n } from "../lib/i18n";

export default function Order() {
  const state = useStore();
  const { t, money } = useI18n();
  const navigate = useNavigate();
  const menu = state.menu.filter((taco) => taco.active);

  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [flash, setFlash] = useState(false);

  const set = (id: string, delta: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) + delta) }));

  const items = menu.reduce((s, taco) => s + (qty[taco.id] ?? 0), 0);
  const total = dealPrice(items);
  const savings = listTotal(state, qty) - total;

  const fire = () => {
    fireOrder(qty, note, name);
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
              <span className="text-4xl">{taco.emoji}</span>
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
            <span className="text-sm font-semibold text-ink-soft">{t("order.tacos", { n: items })}</span>
            {savings > 0 && (
              <span className="ml-2 rounded-full bg-teal-soft px-2 py-0.5 text-[11px] font-black text-teal-deep">
                {t("order.save", { amt: money(savings) })}
              </span>
            )}
          </div>
          <span className="font-display text-3xl font-black text-ink">{money(total)}</span>
        </div>
        <button
          onClick={fire}
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
    </div>
  );
}
