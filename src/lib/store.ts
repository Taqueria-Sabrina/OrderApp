import { useSyncExternalStore } from "react";

/**
 * Shared, realtime state for the pop-up order board.
 *
 * State is persisted to localStorage and broadcast across every open tab /
 * phone (same browser origin) over a BroadcastChannel, so an order fired on one
 * device shows up on all the others within a frame. In production this same
 * shape would sit behind a websocket / hosted realtime DB; the store API below
 * wouldn't change.
 */

export type Taco = {
  id: string;
  name: string;
  note: string;
  price: number;
  emoji: string;
  tint: string;
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
};

const STORAGE_KEY = "popup-orders/v4";
const CHANNEL = "popup-orders";

const DEFAULT_MENU: Taco[] = [
  { id: "tortillero", name: "Tortillero", note: "tortilla de papas, chimichurri y crujiente de maíz", price: 3, emoji: "🥔", tint: "#17b3ab", active: true },
  { id: "adobada", name: "Adobada", note: "soja en chile guajillo y pasilla, salsa verde y cebolla", price: 3, emoji: "🌶️", tint: "#c8437f", active: true },
  { id: "tinga", name: "Tinga", note: "soja en chipotle, crema y lechuga crujiente", price: 3, emoji: "🌮", tint: "#ef92c0", active: true },
  { id: "bbq", name: "BBQ", note: "Heura en salsa barbacoa casera, dulce y picante", price: 3, emoji: "🍖", tint: "#e79a3a", active: true },
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

function defaultState(): State {
  return { menu: DEFAULT_MENU, orders: seedOrders(), nextNumber: 48, archives: seedArchives() };
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as State;
    if (!parsed.menu || !parsed.orders) return defaultState();
    if (!parsed.archives) parsed.archives = []; // forward-compat with pre-archive state
    return parsed;
  } catch {
    return defaultState();
  }
}

let state: State = load();
const listeners = new Set<() => void>();

const channel: BroadcastChannel | null =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

function emit() {
  for (const l of listeners) l();
}

function persist(broadcast: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors in prototype */
  }
  if (broadcast) channel?.postMessage(state);
  emit();
}

function setState(next: State, broadcast = true) {
  state = next;
  persist(broadcast);
}

// Receive updates from other tabs/devices.
channel?.addEventListener("message", (e: MessageEvent<State>) => {
  state = e.data;
  emit();
});

// Fallback sync for browsers without BroadcastChannel (storage event).
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        state = JSON.parse(e.newValue) as State;
        emit();
      } catch {
        /* ignore */
      }
    }
  });
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

// ---- Actions ----

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
  setState({ ...state, orders: [...state.orders, order], nextNumber: state.nextNumber + 1 });
}

export function advanceOrder(id: string) {
  const flow: OrderStatus[] = ["new", "cooking", "ready"];
  setState({
    ...state,
    orders: state.orders.map((o) => {
      if (o.id !== id) return o;
      const i = flow.indexOf(o.status);
      return { ...o, status: flow[Math.min(i + 1, flow.length - 1)] };
    }),
  });
}

export function setOrderStatus(id: string, status: OrderStatus) {
  setState({
    ...state,
    orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
  });
}

export function bumpOrder(id: string) {
  // Archive a picked-up ticket: it leaves the live queue but stays in the
  // order log so it still counts toward sales and shows up in history.
  setState({
    ...state,
    orders: state.orders.map((o) =>
      o.id === id ? { ...o, status: "done", completedAt: Date.now() } : o,
    ),
  });
}

export function updateTaco(id: string, patch: Partial<Taco>) {
  setState({ ...state, menu: state.menu.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
}

export function resetService() {
  setState(defaultState());
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
}

/** Permanently remove one archived service (e.g. to clear a test run). */
export function deleteArchive(id: string) {
  setState({ ...state, archives: state.archives.filter((a) => a.id !== id) });
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

export function orderTotal(order: Order): number {
  return dealPrice(orderQty(order));
}

/** A-la-carte value at the per-taco list price (used to show the savings). */
export function listTotal(state: State, items: Record<string, number>): number {
  const byId = menuById(state);
  let total = 0;
  for (const [id, qty] of Object.entries(items)) total += (byId[id]?.price ?? 0) * qty;
  return total;
}

export function revenueOf(orders: Order[]) {
  return orders.reduce((sum, o) => sum + orderTotal(o), 0);
}

export function revenue(state: State) {
  return revenueOf(state.orders);
}

/** Actual revenue attributed to each taco, splitting each order's deal price
 *  across its tacos in proportion to quantity (so the parts sum to revenue). */
export function revenueByTacoOf(orders: Order[]) {
  const out: Record<string, number> = {};
  for (const o of orders) {
    const q = orderQty(o);
    if (q === 0) continue;
    const total = orderTotal(o);
    for (const [id, n] of Object.entries(o.items)) {
      out[id] = (out[id] ?? 0) + total * (n / q);
    }
  }
  return out;
}

export function revenueByTaco(state: State) {
  return revenueByTacoOf(state.orders);
}
