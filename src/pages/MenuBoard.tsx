import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { useI18n } from "../lib/i18n";
import LangToggle from "../components/LangToggle";

/**
 * Public storefront — no auth. Shows this week's tacos live (sold-out state
 * updates the instant the crew 86's a taco in the back office), today's date,
 * and the bundle deal. Classic Taqueria Sabrina look.
 */
export default function MenuBoard() {
  const state = useStore();
  const { t, money, longDate } = useI18n();
  const today = longDate(new Date());
  const anyActive = state.menu.some((taco) => taco.active);

  return (
    <div className="min-h-full bg-cream">
      <div className="papel h-4 text-teal" />

      <div className="mx-auto max-w-lg px-6 pb-16 pt-8">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-teal-deep">{today}</p>
          </div>
          <LangToggle />
        </div>

        {/* Wordmark / hero */}
        <header className="mb-8 text-center">
          <h1 className="font-display text-6xl font-black leading-[0.9] text-pink-deep">
            Taqueria
            <br />
            Sabrina
          </h1>
          <div className="mt-2 text-4xl" aria-hidden>✨🐩</div>
          <p className="mt-3 text-sm font-bold text-ink-soft">{t("board.tagline")}</p>
          {anyActive && (
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-soft px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-teal-deep">
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
              {t("board.open")}
            </span>
          )}
        </header>

        {/* Live menu */}
        {anyActive ? (
          <div className="space-y-3">
            {state.menu.map((taco) => (
              <div
                key={taco.id}
                className="flex items-center gap-4 rounded-3xl border-2 bg-paper p-4 shadow-sm"
                style={{
                  borderColor: taco.active ? `${taco.tint}55` : "#f0e3ea",
                  opacity: taco.active ? 1 : 0.55,
                }}
              >
                <span className="text-4xl">{taco.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-2xl font-black leading-tight text-ink">{taco.name}</h2>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{taco.note}</p>
                </div>
                {taco.active ? (
                  <span className="font-display text-2xl font-black" style={{ color: taco.tint }}>
                    {money(taco.price)}
                  </span>
                ) : (
                  <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
                    {t("board.soldout")}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border-2 border-dashed border-line bg-paper py-12 text-center text-base font-bold text-ink-soft">
            {t("board.none")}
          </p>
        )}

        {/* Deal banner */}
        <div className="mt-6 flex items-center justify-center gap-4 rounded-2xl bg-pink-soft py-3 font-display text-xl font-black text-pink-deep">
          <span>1×3€</span>
          <span className="text-pink">·</span>
          <span>2×5€</span>
          <span className="text-pink">·</span>
          <span>3×7€</span>
        </div>

        {/* Discreet staff entrance */}
        <div className="mt-10 text-center">
          <Link to="/login" className="text-xs font-bold text-ink-soft underline underline-offset-4">
            {t("board.staff")}
          </Link>
        </div>
      </div>
    </div>
  );
}
