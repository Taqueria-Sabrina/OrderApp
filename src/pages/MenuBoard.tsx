import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLiveBoard, eventIsToday, hoursLabel, parseEventDate, recordVisit, startBoardPresence, stopBoardPresence, type Taco } from "../lib/store";
import { useI18n } from "../lib/i18n";
import LangToggle from "../components/LangToggle";
import Logo from "../components/Logo";
import Chillis from "../components/Chilli";

/** One menu row on the public board (used for both tacos and "Other Stuff"). */
function ItemCard({ item, money, soldOut }: { item: Taco; money: (n: number) => string; soldOut: string }) {
  return (
    <div
      className="flex items-center gap-4 rounded-3xl border-2 bg-paper p-4 shadow-sm"
      style={{ borderColor: item.soldOut ? "#f0e3ea" : `${item.tint}55`, opacity: item.soldOut ? 0.55 : 1 }}
    >
      <span className="h-12 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.tint }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl font-black leading-tight text-ink">{item.name}</h2>
          <Chillis level={item.heat} size={18} />
        </div>
        {item.note && <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{item.note}</p>}
      </div>
      {item.soldOut ? (
        <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
          {soldOut}
        </span>
      ) : (
        <span className="font-display text-2xl font-black" style={{ color: item.tint }}>
          {money(item.price)}
        </span>
      )}
    </div>
  );
}

/** A single white 4-point sparkle for the special-event header. */
function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="white" aria-hidden="true">
      <path d="M12 0c.6 6 5.4 11.4 12 12-6.6.6-11.4 6-12 12-.6-6-5.4-11.4-12-12C6.6 11.4 11.4 6 12 0z" />
    </svg>
  );
}

/**
 * Public storefront — no auth. Shows this week's tacos live (sold-out state
 * updates the instant the crew 86's a taco in the back office), today's date,
 * and the bundle deal. Classic Taqueria Sabrina look.
 */
export default function MenuBoard() {
  // Always the LIVE board (app_state id 1) — never demo data, even on a demo device.
  const state = useLiveBoard();
  const { t, money, longDate } = useI18n();

  // Analytics: count the visit (once per device) and join the live-visitor
  // presence channel while this public page is open.
  useEffect(() => {
    void recordVisit();
    startBoardPresence(true);
    return () => {
      void stopBoardPresence();
    };
  }, []);

  const today = longDate(new Date());
  // Only items that are ON THE MENU (active) appear at all. "Sold out" is a
  // separate flag handled per-card (grayed) and does NOT remove the item.
  const onMenu = state.menu.filter((m) => m.active);
  const anyActive = onMenu.length > 0;
  const tacos = onMenu.filter((m) => m.isTaco);
  const others = onMenu.filter((m) => !m.isTaco);
  // When NO taco is on the menu (a special event with only "other" items), the
  // deal banner + "Other Stuff" header drop away and the added items are it.
  const hasTacos = tacos.length > 0;
  const eventLabel = state.specialEventLabel.trim() || t("board.special_default");

  const hours = hoursLabel(state.openTime, state.closeTime);
  const eventDateObj = parseEventDate(state.eventDate);
  const isToday = eventIsToday(state.eventDate);
  const location = state.location.trim();

  // Live orders still in progress (not picked up), oldest first. When staff mark
  // an order done/picked-up it leaves this list and disappears from the board.
  const STATUS = {
    new: { label: t("board.st_new"), color: "#c8437f" },
    cooking: { label: t("board.st_cooking"), color: "#e79a3a" },
    ready: { label: t("board.st_ready"), color: "#17b3ab" },
  } as const;
  const liveOrders = state.orders.filter((o) => o.status !== "done");

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
          {state.open ? (
            // OPEN: location + hours
            <div className="mt-2 text-center">
              {location && <p className="text-base font-black text-ink">{location}</p>}
              {hours && <p className="text-sm font-bold text-ink-soft">{hours}</p>}
            </div>
          ) : (
            // CLOSED: show a "Next event" block only when a date OR location is
            // set — otherwise nothing (avoids advertising a stale/empty event).
            (state.eventDate || location) && (
              <div className="mt-3 text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-pink-deep">
                  {t("board.next_event")}
                </p>
                <p className="mt-1 font-display text-xl font-black text-ink">
                  {isToday ? t("board.event_today") : eventDateObj ? longDate(eventDateObj) : location}
                </p>
                {(isToday || eventDateObj) && location && (
                  <p className="text-sm font-bold text-ink-soft">
                    {t("board.at")} {location}
                  </p>
                )}
                {hours && <p className="mt-0.5 text-sm font-bold text-ink-soft">{hours}</p>}
              </div>
            )
          )}
        </header>

        {/* Special-event header — staff toggle, sparkly, sits atop the menu */}
        {state.specialEvent && (
          <div className="sparkle-banner relative mb-6 overflow-hidden rounded-2xl px-5 py-5 text-center shadow-md">
            <Star className="sparkle-star absolute left-4 top-2 h-4 w-4 [animation-delay:0ms]" />
            <Star className="sparkle-star absolute right-5 top-3 h-3 w-3 [animation-delay:600ms]" />
            <Star className="sparkle-star absolute bottom-2 left-8 h-3 w-3 [animation-delay:1100ms]" />
            <Star className="sparkle-star absolute bottom-3 right-8 h-4 w-4 [animation-delay:300ms]" />
            <p className="relative font-display text-2xl font-black uppercase tracking-wide text-white drop-shadow-sm">
              {eventLabel}
            </p>
          </div>
        )}

        {/* Menu — tacos lead when any taco is active; for a taco-less special
            event the "other" items become the menu (no deal, no header). */}
        {anyActive ? (
          <div className="space-y-3">
            {(hasTacos ? tacos : others).map((item) => (
              <ItemCard key={item.id} item={item} money={money} soldOut={t("board.soldout")} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border-2 border-dashed border-line bg-paper py-12 text-center text-base font-bold text-ink-soft">
            {t("board.none")}
          </p>
        )}

        {/* Deal banner — only when tacos are actually on the menu */}
        {hasTacos && (
          <div className="mt-6 flex items-center justify-center gap-4 rounded-2xl bg-pink-soft py-3 font-display text-xl font-black text-pink-deep">
            <span>1×3€</span>
            <span className="text-pink">·</span>
            <span>2×5€</span>
            <span className="text-pink">·</span>
            <span>3×7€</span>
          </div>
        )}

        {/* Orders in progress — live from the kitchen. Each card shows the
            ticket #, name, and current step; disappears when picked up. */}
        {liveOrders.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-center font-display text-xl font-black text-ink">{t("board.orders_live")}</h2>
            <div className="space-y-2">
              {liveOrders.map((o) => {
                const st = STATUS[o.status as keyof typeof STATUS] ?? STATUS.new;
                return (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-2xl border-2 bg-paper px-4 py-3 shadow-sm"
                    style={{ borderColor: `${st.color}55` }}
                  >
                    <span className="flex items-baseline gap-2">
                      <span className="font-display text-lg font-black text-ink">#{o.number}</span>
                      {o.name && <span className="text-sm font-bold text-ink-soft">{o.name}</span>}
                    </span>
                    <span
                      className="flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide"
                      style={{ backgroundColor: `${st.color}1a`, color: st.color }}
                    >
                      {o.status !== "ready" && <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: st.color }} />}
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Stuff — secondary section, only when tacos lead the menu
            (in a taco-less event the items already appear as the menu above). */}
        {hasTacos && others.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-center font-display text-2xl font-black text-ink">{t("board.other")}</h2>
            <div className="space-y-3">
              {others.map((item) => (
                <ItemCard key={item.id} item={item} money={money} soldOut={t("board.soldout")} />
              ))}
            </div>
          </div>
        )}

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

        {/* Tacos sold — cumulative counter, always shown */}
        <div className="mt-6 rounded-2xl bg-teal-soft py-5 text-center">
          <p className="font-display text-5xl font-black tabular-nums text-teal-deep">{state.tacosSold}</p>
          <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-teal-deep">{t("board.sold")}</p>
        </div>

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
