import { useState } from "react";
import { useStore, updateTaco, resetService, setOpen, setLocation, setSchedule, addMenuItem, removeMenuItem, isDemo, useDemoControl, setDemoEnabled, bootDemo } from "../lib/store";
import { useI18n } from "../lib/i18n";
import { ChilliPicker } from "../components/Chilli";

// Half-hour time slots for the service-hours dropdowns (00:00 … 23:30).
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-12 items-center rounded-full p-0.5 transition"
      style={{ backgroundColor: on ? "#17b3ab" : "#e2d5dd", justifyContent: on ? "flex-end" : "flex-start" }}
    >
      <span className="h-6 w-6 rounded-full bg-white shadow" />
    </button>
  );
}

function AddItem() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [isTaco, setIsTaco] = useState(true);

  const add = () => {
    if (!name.trim()) return;
    addMenuItem(name, isTaco);
    setName("");
    setIsTaco(true);
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-line bg-paper p-4 shadow-sm">
      <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-deep">{t("menu.add_title")}</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
        placeholder={t("menu.add_ph")}
        className="w-full rounded-xl border-2 border-line bg-cream px-3 py-2.5 text-sm font-semibold text-ink placeholder:text-ink-soft focus:border-teal focus:outline-none"
      />
      <div className="mt-3 flex items-center gap-2">
        <Toggle on={isTaco} onClick={() => setIsTaco((v) => !v)} />
        <span className="text-[13px] font-bold text-ink-soft">{t("menu.add_is_taco")}</span>
      </div>
      <button
        onClick={add}
        disabled={!name.trim()}
        className="mt-3 w-full rounded-2xl py-3 text-sm font-black uppercase tracking-wide text-white transition active:scale-[0.98] disabled:opacity-40"
        style={{ backgroundColor: "#17b3ab" }}
      >
        {t("menu.add_btn")}
      </button>
    </div>
  );
}

function DemoControl() {
  const { t } = useI18n();
  const { demoEnabled, demoCount } = useDemoControl();
  const active = demoCount > 0;

  return (
    <div className="rounded-2xl border-2 border-line bg-paper p-4 shadow-sm">
      <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-deep">{t("menu.demo_title")}</p>
      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-black text-ink">{t("menu.demo_toggle")}</span>
        <Toggle on={demoEnabled} onClick={() => setDemoEnabled(!demoEnabled)} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${active ? "animate-pulse" : ""}`} style={{ backgroundColor: active ? "#c8437f" : "#e2d5dd" }} />
        <span className="text-[13px] font-bold text-ink-soft">
          {active ? t("menu.demo_active", { n: demoCount }) : t("menu.demo_none")}
        </span>
      </div>
      {active && (
        <button
          onClick={bootDemo}
          className="mt-3 w-full rounded-2xl border-2 border-pink-deep py-2.5 text-sm font-black uppercase tracking-wide text-pink-deep transition active:scale-[0.98]"
        >
          {t("menu.demo_boot")}
        </button>
      )}
    </div>
  );
}

export default function Menu() {
  const state = useStore();
  const { t } = useI18n();

  return (
    <div className="flex min-h-full flex-col">
      <header className="px-5 pb-4 pt-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-deep">{t("menu.kicker")}</p>
        <h1 className="font-display text-3xl font-black text-ink">{t("menu.title")}</h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">{t("menu.sub")}</p>
      </header>

      {/* Storefront controls — drive the public menu board */}
      <div className="mb-4 px-5">
        <div className="rounded-2xl border-2 border-teal-soft bg-paper p-4 shadow-sm">
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-deep">
            {t("menu.storefront")}
          </p>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-display text-lg font-black text-ink">{t("menu.open_label")}</p>
              <p className="text-[12px] text-ink-soft">{t("menu.open_sub")}</p>
            </div>
            <Toggle on={state.open} onClick={() => setOpen(!state.open)} />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              {t("menu.location_label")}
            </label>
            <input
              value={state.location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("menu.location_ph")}
              className="w-full rounded-xl border-2 border-line bg-cream px-3 py-2.5 text-sm font-semibold text-ink placeholder:text-ink-soft focus:border-teal focus:outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              {t("menu.event_date_label")}
            </label>
            <input
              type="date"
              value={state.eventDate}
              onChange={(e) => setSchedule({ eventDate: e.target.value })}
              className="block w-full min-w-0 max-w-full appearance-none box-border rounded-xl border-2 border-line bg-cream px-3 py-2.5 text-sm font-semibold text-ink focus:border-teal focus:outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              {t("menu.hours_label")}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-ink-soft">{t("menu.time_from")}</span>
              <select
                value={state.openTime}
                onChange={(e) => setSchedule({ openTime: e.target.value })}
                className="flex-1 rounded-xl border-2 border-line bg-cream px-2 py-2.5 text-sm font-semibold text-ink focus:border-teal focus:outline-none"
              >
                <option value="">{t("menu.time_none")}</option>
                {TIME_OPTIONS.map((tm) => (
                  <option key={tm} value={tm}>{tm}</option>
                ))}
              </select>
              <span className="text-[11px] font-bold text-ink-soft">{t("menu.time_to")}</span>
              <select
                value={state.closeTime}
                onChange={(e) => setSchedule({ closeTime: e.target.value })}
                className="flex-1 rounded-xl border-2 border-line bg-cream px-2 py-2.5 text-sm font-semibold text-ink focus:border-teal focus:outline-none"
              >
                <option value="">{t("menu.time_none")}</option>
                {TIME_OPTIONS.map((tm) => (
                  <option key={tm} value={tm}>{tm}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-5">
        {state.menu.map((taco) => (
          <div
            key={taco.id}
            className="rounded-2xl border-2 bg-paper p-4 shadow-sm transition"
            style={{ opacity: taco.active ? 1 : 0.6, borderColor: taco.active ? `${taco.tint}55` : "#f0e3ea" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <span className="mt-1 h-7 w-7 shrink-0 rounded-xl" style={{ backgroundColor: taco.tint }} />
                <div className="min-w-0 flex-1">
                  <input
                    value={taco.name}
                    onChange={(e) => updateTaco(taco.id, { name: e.target.value })}
                    className="w-full bg-transparent font-display text-lg font-black text-ink outline-none"
                  />
                  <input
                    value={taco.note}
                    onChange={(e) => updateTaco(taco.id, { note: e.target.value })}
                    className="mt-0.5 w-full bg-transparent text-[13px] text-ink-soft outline-none"
                  />
                </div>
              </div>
              <Toggle on={taco.active} onClick={() => updateTaco(taco.id, { active: !taco.active })} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center rounded-xl bg-cream px-3 py-2">
                <input
                  type="number"
                  min={0}
                  value={taco.price}
                  onChange={(e) => updateTaco(taco.id, { price: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-10 bg-transparent text-lg font-black text-ink outline-none"
                />
                <span className="text-lg font-black text-ink-soft">€</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{t("menu.heat")}</span>
                <ChilliPicker value={taco.heat} onChange={(v) => updateTaco(taco.id, { heat: v })} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <div className="flex items-center gap-2">
                <Toggle on={taco.isTaco} onClick={() => updateTaco(taco.id, { isTaco: !taco.isTaco })} />
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
                  {taco.isTaco ? `${t("menu.taco")} · ${t("menu.taco_hint")}` : t("menu.taco")}
                </span>
              </div>
              <button
                onClick={() => removeMenuItem(taco.id)}
                className="text-[11px] font-extrabold uppercase tracking-wide text-pink-deep underline underline-offset-4"
              >
                {t("menu.remove")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add a new item */}
      <div className="mt-4 px-5">
        <AddItem />
      </div>

      {/* Demo access control — live backend only */}
      {!isDemo && (
        <div className="mt-4 px-5">
          <DemoControl />
        </div>
      )}

      <div className="mt-auto px-5 pb-8 pt-6">
        <button
          onClick={() => {
            if (confirm(t("menu.reset_confirm"))) resetService();
          }}
          className="w-full rounded-2xl border-2 border-line py-3 text-sm font-bold text-ink-soft transition active:scale-[0.98]"
        >
          {t("menu.reset")}
        </button>
      </div>
    </div>
  );
}
