import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { useI18n } from "../lib/i18n";
import LangToggle from "../components/LangToggle";
import Logo from "../components/Logo";
import Chillis from "../components/Chilli";

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

        {/* Logo / hero */}
        <header className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" />
          <p className="mt-4 text-sm font-bold text-ink-soft">{t("board.tagline")}</p>
          {/* Open / Closed badge — toggled by staff on the back-office menu editor */}
          <span
            className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide"
            style={{
              backgroundColor: state.open ? "#e6f6f4" : "#f0e3ea",
              color: state.open ? "#0b6d68" : "#8a7d97",
            }}
          >
            {state.open && <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />}
            {state.open ? t("board.open") : t("board.closed")}
          </span>
          {state.open && state.location.trim() && (
            <p className="mt-2 text-sm font-bold text-ink">{state.location}</p>
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
                <span className="h-12 w-2 shrink-0 rounded-full" style={{ backgroundColor: taco.tint }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl font-black leading-tight text-ink">{taco.name}</h2>
                    <Chillis level={taco.heat} size={18} />
                  </div>
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

        {/* Instagram follow card — stacks on narrow screens so the button drops
            below the text instead of crowding it, goes side-by-side at sm+ */}
        <a
          href="https://instagram.com/taqueriasabrina"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex flex-col gap-3 rounded-2xl border-2 border-line bg-paper p-3 shadow-sm transition active:scale-[0.99] sm:flex-row sm:items-center"
        >
          <div className="flex min-w-0 items-center gap-3 sm:flex-1">
            <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg font-black leading-tight text-ink">@taqueriasabrina</p>
              <p className="text-[13px] font-bold text-ink-soft">{t("board.ig_follow")}</p>
            </div>
          </div>
          <span
            className="shrink-0 rounded-full px-4 py-2 text-center text-xs font-extrabold uppercase tracking-wide text-white sm:py-1.5"
            style={{ backgroundColor: "#c8437f" }}
          >
            Instagram
          </span>
        </a>

        {/* Discreet staff entrance */}
        <div className="mt-10 text-center">
          <Link to="/login" className="text-xs font-bold text-ink-soft underline underline-offset-4">
            {t("board.staff")}
          </Link>
        </div>

        <p className="mt-6 text-center text-[11px] font-semibold text-ink-soft">{t("board.copyright")}</p>
      </div>
    </div>
  );
}
