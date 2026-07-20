import { useCallback, useEffect, useState } from "react";
import {
  useStore,
  menuById,
  fetchRecovery,
  restoreRecovery,
  purgeRecovery,
  type RecoveryEntry,
  type Order,
  type Taco,
  type Archive,
} from "../lib/store";
import { useI18n } from "../lib/i18n";
import PasscodeModal from "../components/PasscodeModal";

const KINDS: { key: RecoveryEntry["kind"]; title: string }[] = [
  { key: "order", title: "recovery.orders" },
  { key: "menu_item", title: "recovery.items" },
  { key: "archive", title: "recovery.archives" },
];

/** Back-office "Recovery" — every deleted order, menu item, and archived
 *  service is kept here so it can be restored. Nothing is truly gone. */
export default function Recovery() {
  const state = useStore();
  const { t, money, longDate } = useI18n();
  const byId = menuById(state);
  const [entries, setEntries] = useState<RecoveryEntry[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [purge, setPurge] = useState<RecoveryEntry | null>(null);

  const refresh = useCallback(async () => setEntries(await fetchRecovery()), []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onRestore = async (e: RecoveryEntry) => {
    setBusy(e.id);
    await restoreRecovery(e);
    await refresh();
    setBusy(null);
  };
  const onPurge = async (e: RecoveryEntry) => {
    await purgeRecovery(e.id);
    await refresh();
  };

  // Human summary of one deleted thing.
  const describe = (e: RecoveryEntry): { title: string; sub: string } => {
    if (e.kind === "order") {
      const o = e.payload as Order;
      const items = Object.entries(o.items)
        .map(([id, q]) => `${q}× ${byId[id]?.name ?? id}`)
        .join(", ");
      return { title: `#${o.number}${o.name ? ` · ${o.name}` : ""}`, sub: items || "—" };
    }
    if (e.kind === "menu_item") {
      const m = e.payload as Taco;
      return { title: m.name, sub: `${money(m.price)} · ${m.isTaco ? t("menu.taco") : t("board.other")}` };
    }
    const a = e.payload as Archive;
    return { title: longDate(new Date(a.closedAt)), sub: t("dash.past_orders", { n: a.orders.length }) };
  };

  return (
    <div className="flex min-h-full flex-col px-5 pb-8 pt-6">
      <header className="mb-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-pink-deep">{t("recovery.kicker")}</p>
        <h1 className="font-display text-3xl font-black text-ink">{t("recovery.title")}</h1>
        <p className="mt-1 text-sm font-semibold text-ink-soft">{t("recovery.sub")}</p>
      </header>

      {entries === null ? (
        <p className="rounded-2xl border border-dashed border-line py-10 text-center text-sm font-semibold text-ink-soft">
          {t("recovery.loading")}
        </p>
      ) : entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line py-10 text-center text-sm font-semibold text-ink-soft">
          {t("recovery.empty")}
        </p>
      ) : (
        <div className="space-y-6">
          {KINDS.map(({ key, title }) => {
            const list = entries.filter((e) => e.kind === key);
            if (list.length === 0) return null;
            return (
              <section key={key}>
                <h2 className="mb-2 font-display text-lg font-black text-ink">
                  {t(title)} <span className="text-ink-soft">· {list.length}</span>
                </h2>
                <div className="space-y-2">
                  {list.map((e) => {
                    const d = describe(e);
                    return (
                      <div key={e.id} className="rounded-2xl border border-line bg-paper p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-display text-base font-black text-ink">{d.title}</p>
                            <p className="truncate text-[13px] font-semibold text-ink-soft">{d.sub}</p>
                            <p className="mt-0.5 text-[11px] font-bold text-ink-soft">
                              {t("recovery.deleted_on", { d: longDate(new Date(e.deletedAt)) })}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-stretch gap-2">
                            <button
                              onClick={() => onRestore(e)}
                              disabled={busy === e.id}
                              className="rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition active:scale-[0.98] disabled:opacity-50"
                              style={{ backgroundColor: "#17b3ab" }}
                            >
                              {busy === e.id ? t("recovery.restoring") : t("recovery.restore")}
                            </button>
                            <button
                              onClick={() => setPurge(e)}
                              className="rounded-xl px-4 py-2 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft"
                            >
                              {t("recovery.purge")}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {purge && (
        <PasscodeModal
          title={t("recovery.purge")}
          prompt={t("recovery.purge_confirm")}
          confirmLabel={t("recovery.purge")}
          onConfirm={() => onPurge(purge)}
          onClose={() => setPurge(null)}
        />
      )}
    </div>
  );
}
