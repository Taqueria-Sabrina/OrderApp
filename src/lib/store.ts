import { useSyncExternalStore } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * Shared, realtime state for the pop-up order board.
 *
 * Two sync backends, chosen at startup by whether Supabase is configured:
 *
 * - **cloud** (Supabase set) — orders/archives/menu live in Postgres, one row
 *   per order. Every device subscribes to realtime changes, so an order fired
 *   on the counter phone shows up on the kitchen screen (a SEPARATE device)
 *   within a moment. Writes are optimistic locally, then pushed to the DB;
 *   localStorage is just an offline cache for instant first paint.
 *
 * - **local** (no Supabase) — falls back to same-origin BroadcastChannel +
 *   storage-event sync (same browser only). Used for local dev and the Tempo
 *   canvas sidecar, which don't have env vars.
 *
 * The store's public API (useStore + the action/selector exports) is identical
 * in both modes, so the pages never change.
 */

const MODE: "cloud" | "local" = isSupabaseConfigured ? "cloud" : "local";

/**
 * Demo mode. When a viewer logs in with the demo credentials (admin/admin),
 * auth sets this flag and reloads; the whole backend then reads/writes a
 * SEPARATE namespace so it can't touch or reveal the real (live) data:
 *   - app_state row id 2 (live is id 1)
 *   - orders/archives rows tagged env = 'demo' (live is 'live')
 * Demo devices still sync with each other in realtime. The public board always
 * reads live (see lib/liveBoard.ts).
 */
export const DEMO_KEY = "popup-orders/demo";
export const isDemo = (() => {
  try {
    return localStorage.getItem(DEMO_KEY) === "1";
  } catch {
    return false;
  }
})();
const ENV: "live" | "demo" = isDemo ? "demo" : "live";
const APP_STATE_ID = isDemo ? 2 : 1;

// A menu item. isTaco items share the 1×3/2×5/3×7 bundle deal; non-taco items
// (drinks, sides, …) are priced a la carte at their own price.
export type Taco = {
  id: string;
  name: string;
  note: string;
  price: number;
  tint: string; // brand color that stands in for the item visually
  heat: number; // chilli rating 0–3, shown on the public board
  isTaco: boolean; // in the taco bundle deal? (false = a la carte)
  active: boolean;
};

// "done" is a terminal, archived state: the ticket has left the live queue
// (picked up) but stays in the order log so sales totals include it.
export type OrderStatus = "new" | "cooking" | "ready" | "done";

export type Order = {
  id: string;
  number: number;
  name: string; // customer name on the ticket ("" if none given)
  items: Record<string, number>; // tacoId -> qty
  note: string;
  status: OrderStatus;
  createdAt: number;
  completedAt?: number; // set when the ticket is picked up / archived
};

/** A closed-out service — a snapshot of one day's orders, kept for the record. */
export type Archive = {
  id: string;
  closedAt: number; // when the day was closed out
  orders: Order[]; // the orders that were live when closed
};

export type State = {
  menu: Taco[];
  orders: Order[];
  nextNumber: number;
  archives: Archive[]; // past closed-out services, newest first
  open: boolean; // is the stand open right now (shown on the public board)
  location: string; // where the stand is today (shown under the open badge)
  eventDate: string; // next event date "YYYY-MM-DD" ("" if none set)
  openTime: string; // service start "HH:MM" ("" if none)
  closeTime: string; // service end "HH:MM" ("" if none)
};

const STORAGE_KEY = "popup-orders/v5";
const CHANNEL = "popup-orders";

const DEFAULT_MENU: Taco[] = [
  { id: "tortillero", name: "Tortillero", note: "tortilla de papas, chimichurri y crujiente de maíz", price: 3, tint: "#17b3ab", heat: 0, isTaco: true, active: true },
  { id: "adobada", name: "Adobada", note: "soja en chile guajillo y pasilla, salsa verde y cebolla", price: 3, tint: "#c8437f", heat: 2, isTaco: true, active: true },
  { id: "tinga", name: "Tinga", note: "soja en chipotle, crema y lechuga crujiente", price: 3, tint: "#ef92c0", heat: 1, isTaco: true, active: true },
  { id: "bbq", name: "BBQ", note: "Heura en salsa barbacoa casera, dulce y picante", price: 3, tint: "#e79a3a", heat: 2, isTaco: true, active: true },
];

function seedOrders(): Order[] {
  const now = Date.now();
  return [
    { id: "seed-0", number: 43, name: "Marco", items: { adobada: 3 }, note: "", status: "done", createdAt: now - 22 * 60000, completedAt: now - 14 * 60000 },
    { id: "seed-1", number: 44, name: "Lucía", items: { bbq: 2 }, note: "", status: "ready", createdAt: now - 6 * 60000 },
    { id: "seed-2", number: 45, name: "", items: { tortillero: 3 }, note: "sin cebolla", status: "cooking", createdAt: now - 5 * 60000 },
    { id: "seed-3", number: 46, name: "Ana", items: { adobada: 1, tinga: 1 }, note: "", status: "cooking", createdAt: now - 2 * 60000 },
    { id: "seed-4", number: 47, name: "", items: { tortillero: 2, bbq: 1 }, note: "extra salsa", status: "new", createdAt: now - 30000 },
  ];
}

const WEEK = 7 * 24 * 60 * 60 * 1000;

/** A couple of past services so "Past weeks" has history out of the box. */
function seedArchives(): Archive[] {
  const now = Date.now();
  const doneAt = (base: number, min: number) => base + min * 60000;
  const lastWeek = now - WEEK;
  const twoWeeks = now - 2 * WEEK;
  return [
    {
      id: "arch-1",
      closedAt: lastWeek,
      orders: [
        { id: "a1-1", number: 31, name: "Diego", items: { adobada: 3 }, note: "", status: "done", createdAt: lastWeek - 60 * 60000, completedAt: doneAt(lastWeek, -55) },
        { id: "a1-2", number: 32, name: "Sofía", items: { bbq: 2, tinga: 1 }, note: "sin picante", status: "done", createdAt: lastWeek - 50 * 60000, completedAt: doneAt(lastWeek, -45) },
        { id: "a1-3", number: 33, name: "", items: { tortillero: 2 }, note: "", status: "done", createdAt: lastWeek - 40 * 60000, completedAt: doneAt(lastWeek, -36) },
        { id: "a1-4", number: 34, name: "Marta", items: { tinga: 3, adobada: 3 }, note: "para llevar", status: "done", createdAt: lastWeek - 30 * 60000, completedAt: doneAt(lastWeek, -24) },
      ],
    },
    {
      id: "arch-2",
      closedAt: twoWeeks,
      orders: [
        { id: "a2-1", number: 18, name: "Pablo", items: { bbq: 4 }, note: "", status: "done", createdAt: twoWeeks - 55 * 60000, completedAt: doneAt(twoWeeks, -50) },
        { id: "a2-2", number: 19, name: "", items: { adobada: 1, tinga: 1, tortillero: 1 }, note: "", status: "done", createdAt: twoWeeks - 45 * 60000, completedAt: doneAt(twoWeeks, -41) },
        { id: "a2-3", number: 20, name: "Elena", items: { tortillero: 2, bbq: 1 }, note: "extra salsa", status: "done", createdAt: twoWeeks - 35 * 60000, completedAt: doneAt(twoWeeks, -30) },
      ],
    },
  ];
}

const DEFAULT_LOCATION = "La Cocina Lot";
const STOREFRONT_DEFAULTS = { open: true, location: DEFAULT_LOCATION, eventDate: "", openTime: "21:00", closeTime: "23:00" };

function defaultState(): State {
  return { menu: DEFAULT_MENU, orders: seedOrders(), nextNumber: 48, archives: seedArchives(), ...STOREFRONT_DEFAULTS };
}

/** Cloud mode's starting snapshot before the DB hydrates — no fake seed data,
 *  just the default menu so the first paint isn't empty. */
function emptyCloudState(): State {
  return { menu: DEFAULT_MENU, orders: [], nextNumber: 1, archives: [], ...STOREFRONT_DEFAULTS };
}

/** Backfill fields on menus saved before they existed (heat, isTaco). */
function normalizeMenu(menu: Taco[]): Taco[] {
  return menu.map((t) => ({
    ...t,
    heat: typeof t.heat === "number" ? t.heat : 0,
    isTaco: typeof t.isTaco === "boolean" ? t.isTaco : true,
  }));
}

function load(): State {
  const fallback = MODE === "cloud" ? emptyCloudState() : defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as State;
    if (!parsed.menu || !parsed.orders) return fallback;
    if (!parsed.archives) parsed.archives = []; // forward-compat with pre-archive state
    if (typeof parsed.open !== "boolean") parsed.open = true; // pre-open-flag state
    if (typeof parsed.location !== "string") parsed.location = DEFAULT_LOCATION;
    if (typeof parsed.eventDate !== "string") parsed.eventDate = "";
    if (typeof parsed.openTime !== "string") parsed.openTime = STOREFRONT_DEFAULTS.openTime;
    if (typeof parsed.closeTime !== "string") parsed.closeTime = STOREFRONT_DEFAULTS.closeTime;
    parsed.menu = normalizeMenu(parsed.menu);
    return parsed;
  } catch {
    return fallback;
  }
}

let state: State = load();
const listeners = new Set<() => void>();

const channel: BroadcastChannel | null =
  MODE === "local" && typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

function emit() {
  for (const l of listeners) l();
}

function cache() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors in prototype */
  }
}

/**
 * Apply a new state locally: update the in-memory snapshot, cache it, notify
 * React. In LOCAL mode we also broadcast to sibling tabs. In CLOUD mode we do
 * NOT broadcast — the DB write + realtime subscription fans the change out to
 * every device (including this one, idempotently).
 */
function setState(next: State) {
  state = next;
  cache();
  if (MODE === "local") {
    channel?.postMessage(state);
    // In local mode there's no cloud, so the main store IS the live board.
    if (!isDemo) setBoard(boardOf(next));
  }
  emit();
}

if (MODE === "local") {
  // Receive updates from other tabs on this device.
  channel?.addEventListener("message", (e: MessageEvent<State>) => {
    state = e.data;
    if (!isDemo) setBoard(boardOf(state));
    emit();
  });

  // Fallback sync for browsers without BroadcastChannel (storage event).
  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          state = JSON.parse(e.newValue) as State;
          if (!isDemo) setBoard(boardOf(state));
          emit();
        } catch {
          /* ignore */
        }
      }
    });
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

export function useStore(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ---- Public board snapshot (ALWAYS live, app_state id 1) ----
//
// The public `/` homepage must show LIVE data even on a demo device (whose main
// store points at the demo namespace). This is a small separate snapshot bound
// to app_state id 1, used only by the public MenuBoard.

export type BoardSnapshot = Pick<State, "menu" | "open" | "location" | "eventDate" | "openTime" | "closeTime">;

function boardOf(s: Pick<State, keyof BoardSnapshot>): BoardSnapshot {
  return { menu: s.menu, open: s.open, location: s.location, eventDate: s.eventDate, openTime: s.openTime, closeTime: s.closeTime };
}

let board: BoardSnapshot = boardOf(load());
const boardListeners = new Set<() => void>();
function setBoard(next: BoardSnapshot) {
  board = next;
  for (const l of boardListeners) l();
}

export function useLiveBoard(): BoardSnapshot {
  return useSyncExternalStore(
    (cb) => {
      boardListeners.add(cb);
      return () => boardListeners.delete(cb);
    },
    () => board,
    () => board,
  );
}

// ---- Cloud backend (Supabase) ----
//
// Row shapes mirror the SQL schema (see README / the setup snippet). Timestamps
// are stored as epoch-ms bigints to match the existing `createdAt` fields.

type OrderRow = {
  id: string;
  number: number;
  name: string;
  items: Record<string, number>;
  note: string;
  status: OrderStatus;
  created_at: number;
  completed_at: number | null;
  env?: string;
};

type ArchiveRow = { id: string; closed_at: number; orders: Order[] };

function orderToRow(o: Order): OrderRow {
  return {
    id: o.id,
    number: o.number,
    name: o.name,
    items: o.items,
    note: o.note,
    status: o.status,
    created_at: o.createdAt,
    completed_at: o.completedAt ?? null,
    env: ENV, // namespace tag so demo rows never mix with live
  };
}

function rowToOrder(r: OrderRow): Order {
  return {
    id: r.id,
    number: r.number,
    name: r.name,
    items: r.items,
    note: r.note,
    status: r.status,
    createdAt: r.created_at,
    completedAt: r.completed_at ?? undefined,
  };
}

/** Pull the full state from Supabase and hydrate the local snapshot. */
async function hydrateFromCloud() {
  if (!supabase) return;
  const [ordersRes, archivesRes, appRes] = await Promise.all([
    supabase.from("orders").select("*"),
    supabase.from("archives").select("*"),
    supabase.from("app_state").select("*").eq("id", APP_STATE_ID).maybeSingle(),
  ]);

  // Filter by namespace client-side so a missing `env` column (before the
  // one-time migration) reads as 'live' and never errors the whole request.
  const inEnv = (r: { env?: string | null }) => (r.env ?? "live") === ENV;

  const orders = ((ordersRes.data as OrderRow[] | null) ?? []).filter(inEnv).map(rowToOrder);
  orders.sort((a, b) => a.createdAt - b.createdAt);

  const archives = ((archivesRes.data as (ArchiveRow & { env?: string | null })[] | null) ?? [])
    .filter(inEnv)
    .map((r) => ({ id: r.id, closedAt: r.closed_at, orders: r.orders }));
  archives.sort((a, b) => b.closedAt - a.closedAt);

  const app = appRes.data as
    | {
        menu: Taco[];
        next_number: number;
        open?: boolean;
        location?: string;
        event_date?: string | null;
        open_time?: string | null;
        close_time?: string | null;
      }
    | null;

  // First run against an empty DB: seed it with the default menu so the stand
  // has tacos to sell (orders/archives start empty in the cloud).
  if (!app) {
    const seededStorefront = isDemo ? { ...STOREFRONT_DEFAULTS, location: "Demo Lot" } : STOREFRONT_DEFAULTS;
    await supabase.from("app_state").insert({
      id: APP_STATE_ID,
      menu: DEFAULT_MENU,
      next_number: 1,
      open: seededStorefront.open,
      location: seededStorefront.location,
      event_date: seededStorefront.eventDate,
      open_time: seededStorefront.openTime,
      close_time: seededStorefront.closeTime,
    });
    setState({ menu: DEFAULT_MENU, orders: [], nextNumber: 1, archives: [], ...seededStorefront });
    return;
  }

  setState({
    menu: normalizeMenu(app.menu),
    orders,
    nextNumber: app.next_number,
    archives,
    // Columns may be absent on a row seeded before these fields existed.
    open: app.open ?? STOREFRONT_DEFAULTS.open,
    location: app.location ?? STOREFRONT_DEFAULTS.location,
    eventDate: app.event_date ?? "",
    openTime: app.open_time ?? STOREFRONT_DEFAULTS.openTime,
    closeTime: app.close_time ?? STOREFRONT_DEFAULTS.closeTime,
  });
}

/** Refresh the always-live public board snapshot from app_state id 1. */
async function fetchLiveBoard() {
  if (!supabase) return;
  const { data } = await supabase.from("app_state").select("*").eq("id", 1).maybeSingle();
  const app = data as {
    menu: Taco[];
    open?: boolean;
    location?: string;
    event_date?: string | null;
    open_time?: string | null;
    close_time?: string | null;
  } | null;
  if (!app) return;
  setBoard({
    menu: normalizeMenu(app.menu),
    open: app.open ?? STOREFRONT_DEFAULTS.open,
    location: app.location ?? STOREFRONT_DEFAULTS.location,
    eventDate: app.event_date ?? "",
    openTime: app.open_time ?? STOREFRONT_DEFAULTS.openTime,
    closeTime: app.close_time ?? STOREFRONT_DEFAULTS.closeTime,
  });
}

// A short debounce collapses bursts of realtime events (e.g. an insert + an
// app_state update from the same action) into a single refetch.
let refetchTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleRefetch() {
  if (refetchTimer) clearTimeout(refetchTimer);
  refetchTimer = setTimeout(() => {
    refetchTimer = null;
    void hydrateFromCloud();
    void fetchLiveBoard(); // keep the public board current (live id 1)
  }, 120);
}

if (MODE === "cloud" && supabase) {
  void hydrateFromCloud();
  void fetchLiveBoard();
  // One channel covering all three tables; any change triggers a refetch so the
  // local snapshot converges to the DB across every device.
  supabase
    .channel("popup-orders-db")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, scheduleRefetch)
    .on("postgres_changes", { event: "*", schema: "public", table: "archives" }, scheduleRefetch)
    .on("postgres_changes", { event: "*", schema: "public", table: "app_state" }, scheduleRefetch)
    .subscribe();
}

// ---- Demo namespace lifecycle (presence-based reset) ----
//
// Demo devices join a presence channel. The first one in (nobody else present)
// reseeds a clean demo; on explicit logout the last one out clears it. This
// keeps every demo showing tidy without touching live data.

async function wipeDemoRows() {
  if (!supabase) return;
  await supabase.from("orders").delete().eq("env", "demo");
  await supabase.from("archives").delete().eq("env", "demo");
}

/** Reseed a clean demo: empty orders/archives + default menu & storefront. */
async function resetDemo() {
  if (!supabase) return;
  await wipeDemoRows();
  await supabase.from("app_state").upsert({
    id: 2,
    menu: DEFAULT_MENU,
    next_number: 1,
    open: true,
    location: "Demo Lot",
    event_date: "",
    open_time: STOREFRONT_DEFAULTS.openTime,
    close_time: STOREFRONT_DEFAULTS.closeTime,
  });
  await hydrateFromCloud();
}

let demoPresence: RealtimeChannel | null = null;
let demoResetChecked = false;

if (isDemo && MODE === "cloud" && supabase) {
  // Vary the key per client so presence counts distinct devices.
  const key = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  demoPresence = supabase.channel("demo-presence", { config: { presence: { key } } });
  demoPresence
    .on("presence", { event: "sync" }, () => {
      if (demoResetChecked || !demoPresence) return; // only decide on first sync
      demoResetChecked = true;
      const members = Object.keys(demoPresence.presenceState()).length;
      if (members <= 1) void resetDemo(); // we're alone → fresh demo
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") void demoPresence?.track({ at: Date.now() });
    });
}

/** Called by auth on demo logout: if we're the last demo device, clear demo
 *  data; then leave the presence channel. */
export async function leaveDemo() {
  if (!isDemo || !supabase || !demoPresence) return;
  const members = Object.keys(demoPresence.presenceState()).length;
  if (members <= 1) await wipeDemoRows();
  await demoPresence.untrack();
  await supabase.removeChannel(demoPresence);
  demoPresence = null;
}

/** Fire-and-forget a Supabase write; log failures without breaking the UI. */
function push(p: PromiseLike<{ error: unknown }>) {
  Promise.resolve(p).then(({ error }) => {
    if (error) console.error("[store] Supabase write failed:", error);
  });
}

// ---- Actions ----
//
// Each action applies an optimistic local update (instant UI), then in cloud
// mode pushes the change to Supabase. Realtime reconciles all devices after.

function uid() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function fireOrder(items: Record<string, number>, note: string, name = "") {
  const cleaned: Record<string, number> = {};
  for (const [id, qty] of Object.entries(items)) if (qty > 0) cleaned[id] = qty;
  if (Object.keys(cleaned).length === 0) return;
  const order: Order = {
    id: uid(),
    number: state.nextNumber,
    name: name.trim(),
    items: cleaned,
    note: note.trim(),
    status: "new",
    createdAt: Date.now(),
  };
  const nextNumber = state.nextNumber + 1;
  setState({ ...state, orders: [...state.orders, order], nextNumber });
  if (MODE === "cloud" && supabase) {
    push(supabase.from("orders").insert(orderToRow(order)));
    push(supabase.from("app_state").update({ next_number: nextNumber }).eq("id", APP_STATE_ID));
  }
}

export function advanceOrder(id: string) {
  const flow: OrderStatus[] = ["new", "cooking", "ready"];
  const current = state.orders.find((o) => o.id === id);
  if (!current) return;
  const i = flow.indexOf(current.status);
  const status = flow[Math.min(i + 1, flow.length - 1)];
  setOrderStatus(id, status);
}

export function setOrderStatus(id: string, status: OrderStatus) {
  setState({
    ...state,
    orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
  });
  if (MODE === "cloud" && supabase) {
    push(supabase.from("orders").update({ status }).eq("id", id));
  }
}

export function bumpOrder(id: string) {
  // Archive a picked-up ticket: it leaves the live queue but stays in the
  // order log so it still counts toward sales and shows up in history.
  const completedAt = Date.now();
  setState({
    ...state,
    orders: state.orders.map((o) =>
      o.id === id ? { ...o, status: "done", completedAt } : o,
    ),
  });
  if (MODE === "cloud" && supabase) {
    push(supabase.from("orders").update({ status: "done", completed_at: completedAt }).eq("id", id));
  }
}

/**
 * Permanently delete an order (mistake / cancellation) from anywhere on the
 * line — new, cooking, ready, or already picked up. Because revenue and sold
 * counts are derived from the orders list, removing the order automatically
 * backs its total out of the day's sales. Password-gated in the UI.
 */
export function deleteOrder(id: string) {
  setState({ ...state, orders: state.orders.filter((o) => o.id !== id) });
  if (MODE === "cloud" && supabase) {
    push(supabase.from("orders").delete().eq("id", id));
  }
}

/** Toggle whether the stand is open (drives the public board's Open/Closed badge). */
export function setOpen(open: boolean) {
  setState({ ...state, open });
  if (MODE === "cloud" && supabase) {
    push(supabase.from("app_state").update({ open }).eq("id", APP_STATE_ID));
  }
}

/** Set today's location, shown under the Open badge on the public board. */
export function setLocation(location: string) {
  setState({ ...state, location });
  if (MODE === "cloud" && supabase) {
    push(supabase.from("app_state").update({ location }).eq("id", APP_STATE_ID));
  }
}

/** Update the next-event schedule (date + service hours), shown on the board. */
export function setSchedule(patch: Partial<Pick<State, "eventDate" | "openTime" | "closeTime">>) {
  setState({ ...state, ...patch });
  if (MODE === "cloud" && supabase) {
    const row: Record<string, string> = {};
    if (patch.eventDate !== undefined) row.event_date = patch.eventDate;
    if (patch.openTime !== undefined) row.open_time = patch.openTime;
    if (patch.closeTime !== undefined) row.close_time = patch.closeTime;
    push(supabase.from("app_state").update(row).eq("id", APP_STATE_ID));
  }
}

export function updateTaco(id: string, patch: Partial<Taco>) {
  const menu = state.menu.map((t) => (t.id === id ? { ...t, ...patch } : t));
  setState({ ...state, menu });
  if (MODE === "cloud" && supabase) {
    push(supabase.from("app_state").update({ menu }).eq("id", APP_STATE_ID));
  }
}

// Brand palette cycled through for new items' color swatch.
const ITEM_TINTS = ["#17b3ab", "#c8437f", "#ef92c0", "#e79a3a", "#0f8f88"];

/** Add a new menu item. `isTaco` decides whether it joins the bundle deal. */
export function addMenuItem(name: string, isTaco: boolean) {
  const clean = name.trim();
  if (!clean) return;
  const item: Taco = {
    id: `item-${uid()}`,
    name: clean,
    note: "",
    price: 3,
    tint: ITEM_TINTS[state.menu.length % ITEM_TINTS.length],
    heat: 0,
    isTaco,
    active: true,
  };
  const menu = [...state.menu, item];
  setState({ ...state, menu });
  if (MODE === "cloud" && supabase) {
    push(supabase.from("app_state").update({ menu }).eq("id", APP_STATE_ID));
  }
}

/** Remove a menu item (e.g. one added by mistake). */
export function removeMenuItem(id: string) {
  const menu = state.menu.filter((t) => t.id !== id);
  setState({ ...state, menu });
  if (MODE === "cloud" && supabase) {
    push(supabase.from("app_state").update({ menu }).eq("id", APP_STATE_ID));
  }
}

export function resetService() {
  // Capture current ids first so we delete exactly this namespace's rows
  // (by id — avoids depending on the env column existing).
  const orderIds = state.orders.map((o) => o.id);
  const archiveIds = state.archives.map((a) => a.id);
  const fresh: State = MODE === "cloud"
    ? { menu: DEFAULT_MENU, orders: [], nextNumber: 1, archives: [], ...STOREFRONT_DEFAULTS }
    : defaultState();
  setState(fresh);
  if (MODE === "cloud" && supabase) {
    // Wipe this namespace's orders + archives, restore defaults.
    if (orderIds.length) push(supabase.from("orders").delete().in("id", orderIds));
    if (archiveIds.length) push(supabase.from("archives").delete().in("id", archiveIds));
    push(
      supabase
        .from("app_state")
        .update({
          menu: DEFAULT_MENU,
          next_number: 1,
          open: STOREFRONT_DEFAULTS.open,
          location: STOREFRONT_DEFAULTS.location,
          event_date: STOREFRONT_DEFAULTS.eventDate,
          open_time: STOREFRONT_DEFAULTS.openTime,
          close_time: STOREFRONT_DEFAULTS.closeTime,
        })
        .eq("id", APP_STATE_ID),
    );
  }
}

/**
 * Close out the day: snapshot every current order into a dated archive (so it
 * shows up under "Past weeks"), then clear the live board and reset ticket
 * numbers. The menu is kept as-is for the next service. No-op if there are no
 * orders to close.
 */
export function closeOutDay() {
  if (state.orders.length === 0) return;
  const archive: Archive = { id: uid(), closedAt: Date.now(), orders: state.orders };
  setState({
    ...state,
    orders: [],
    nextNumber: 1,
    archives: [archive, ...state.archives],
  });
  if (MODE === "cloud" && supabase) {
    const orderIds = archive.orders.map((o) => o.id);
    push(supabase.from("archives").insert({ id: archive.id, closed_at: archive.closedAt, orders: archive.orders, env: ENV }));
    if (orderIds.length) push(supabase.from("orders").delete().in("id", orderIds));
    push(supabase.from("app_state").update({ next_number: 1 }).eq("id", APP_STATE_ID));
  }
}

/** Permanently remove one archived service (e.g. to clear a test run). */
export function deleteArchive(id: string) {
  setState({ ...state, archives: state.archives.filter((a) => a.id !== id) });
  if (MODE === "cloud" && supabase) {
    push(supabase.from("archives").delete().eq("id", id));
  }
}

// ---- Selectors ----

export function menuById(state: State) {
  return Object.fromEntries(state.menu.map((t) => [t.id, t]));
}

// The sales selectors below accept a plain order list so they work on both the
// live board (state.orders) and any archived service. The `*Of` helpers take
// the list; the original names stay as thin wrappers over state.orders.
export function soldCountsOf(orders: Order[]) {
  const counts: Record<string, number> = {};
  for (const o of orders) {
    for (const [id, qty] of Object.entries(o.items)) {
      counts[id] = (counts[id] ?? 0) + qty;
    }
  }
  return counts;
}

export function soldCounts(state: State) {
  return soldCountsOf(state.orders);
}

// ---- Bundle pricing ----
// Deal: 1 for 3€, 2 for 5€, 3 for 7€. Tacos are one flat price, so the deal is
// applied to the TOTAL taco count in an order. We pack greedily into 3-packs
// (cheapest per taco) and price the remainder at the best small-bundle rate —
// e.g. 4 tacos = one 3-pack (7€) + one single (3€) = 10€.
const REMAINDER_PRICE = [0, 3, 5]; // 0, 1, or 2 leftover tacos
const TRIPLE_PRICE = 7;

export function dealPrice(qty: number): number {
  if (qty <= 0) return 0;
  const triples = Math.floor(qty / 3);
  const rem = qty % 3;
  return triples * TRIPLE_PRICE + REMAINDER_PRICE[rem];
}

export function orderQty(order: Order): number {
  return Object.values(order.items).reduce((a, b) => a + b, 0);
}

/** How many of an order's items are tacos (the ones in the bundle deal). */
export function tacoCountOf(items: Record<string, number>, menu: Taco[]): number {
  const byId = Object.fromEntries(menu.map((t) => [t.id, t]));
  let n = 0;
  for (const [id, qty] of Object.entries(items)) if (byId[id]?.isTaco ?? true) n += qty;
  return n;
}

/** Sum of a la carte (non-taco) items at their own price. */
export function alaCarteTotalOf(items: Record<string, number>, menu: Taco[]): number {
  const byId = Object.fromEntries(menu.map((t) => [t.id, t]));
  let total = 0;
  for (const [id, qty] of Object.entries(items)) {
    const item = byId[id];
    if (item && !item.isTaco) total += item.price * qty;
  }
  return total;
}

/** Order total = taco bundle price (by taco count) + a la carte items. */
export function orderTotal(order: Order, menu: Taco[]): number {
  return dealPrice(tacoCountOf(order.items, menu)) + alaCarteTotalOf(order.items, menu);
}

/** A-la-carte value of the TACO items at their individual price (for the
 *  "you save" badge — only tacos have deal savings). */
export function tacoListTotal(items: Record<string, number>, menu: Taco[]): number {
  const byId = Object.fromEntries(menu.map((t) => [t.id, t]));
  let total = 0;
  for (const [id, qty] of Object.entries(items)) {
    const item = byId[id];
    if (item && item.isTaco) total += item.price * qty;
  }
  return total;
}

export function revenueOf(orders: Order[], menu: Taco[]) {
  return orders.reduce((sum, o) => sum + orderTotal(o, menu), 0);
}

export function revenue(state: State) {
  return revenueOf(state.orders, state.menu);
}

/** Revenue attributed to each item so the parts sum to total revenue: taco
 *  items split their order's bundle price by taco-quantity share; non-taco
 *  items get their own price × qty. */
export function revenueByTacoOf(orders: Order[], menu: Taco[]) {
  const byId = Object.fromEntries(menu.map((t) => [t.id, t]));
  const out: Record<string, number> = {};
  for (const o of orders) {
    const tacoQ = tacoCountOf(o.items, menu);
    const dealPart = dealPrice(tacoQ);
    for (const [id, n] of Object.entries(o.items)) {
      const item = byId[id];
      if (item && !item.isTaco) {
        out[id] = (out[id] ?? 0) + item.price * n;
      } else if (tacoQ > 0) {
        out[id] = (out[id] ?? 0) + dealPart * (n / tacoQ);
      }
    }
  }
  return out;
}

export function revenueByTaco(state: State) {
  return revenueByTacoOf(state.orders, state.menu);
}

// ---- Storefront schedule helpers ----

/** Today's date as a local "YYYY-MM-DD" (matches the <input type=date> value). */
export function localTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Parse a "YYYY-MM-DD" string into a LOCAL Date (avoids UTC off-by-one). */
export function parseEventDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

/** True when the configured event date is today. */
export function eventIsToday(eventDate: string): boolean {
  return eventDate !== "" && eventDate === localTodayISO();
}

/** "21:00 – 23:00" when both times are set, else "". */
export function hoursLabel(openTime: string, closeTime: string): string {
  return openTime && closeTime ? `${openTime} – ${closeTime}` : "";
}
