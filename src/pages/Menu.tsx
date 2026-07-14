import { useStore, updateTaco, resetService } from "../lib/store";
import { useI18n } from "../lib/i18n";

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

      <div className="space-y-3 px-5">
        {state.menu.map((taco) => (
          <div
            key={taco.id}
            className="rounded-2xl border-2 bg-paper p-4 shadow-sm transition"
            style={{ opacity: taco.active ? 1 : 0.6, borderColor: taco.active ? `${taco.tint}55` : "#f0e3ea" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <span className="text-2xl">{taco.emoji}</span>
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
            <div className="mt-3 flex items-center gap-2">
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
              <span className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">
                {taco.active ? t("menu.on_menu") : t("menu.hidden")}
              </span>
            </div>
          </div>
        ))}
      </div>

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
