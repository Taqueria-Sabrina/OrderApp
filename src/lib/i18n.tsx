import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "es" | "en";

/** Currency formatting differs by locale: "3€" (es) vs "€3" (en). */
export function money(n: number, lang: Lang) {
  const v = Math.round(n);
  return lang === "en" ? `€${v}` : `${v}€`;
}

/** Long, human date in the active locale, e.g. "viernes, 14 de julio". */
export function longDate(d: Date, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

type Str = string | ((p: Record<string, string | number>) => string);
type Dict = Record<string, Str>;

const ES: Dict = {
  "nav.order": "Pedido",
  "nav.queue": "Cocina",
  "nav.sales": "Ventas",
  "nav.history": "Historial",
  "nav.menu": "Menú",
  live: "EN VIVO",

  "board.today": "Hoy",
  "board.tagline": "Tacos. Tacos. Tacos.",
  "board.open": "Abierto ahora",
  "board.closed": "Cerrado",
  "board.soldout": "Agotado",
  "board.none": "Hoy descansamos — vuelve pronto",
  "board.next_event": "Próximo evento",
  "board.other": "Especiales",
  "board.event_today": "Hoy.",
  "board.at": "en",
  "board.ig_follow": "Síguenos en Instagram",
  "board.staff": "Entrar (equipo)",
  "board.copyright": "© 2026 Taqueria Sabrina",
  "board.orders_live": "Pedidos en marcha",
  "board.st_new": "Enviado a cocina",
  "board.st_cooking": "Cocinando",
  "board.st_ready": "¡Listo!",
  "board.sold": "Tacos vendidos",
  "board.special_default": "Evento Especial",

  "menu.storefront": "Escaparate",
  "menu.open_label": "Abierto ahora",
  "menu.open_sub": "Muestra “Abierto” u “Cerrado” en la web pública",
  "menu.location_label": "Ubicación",
  "menu.location_ph": "¿Dónde estamos hoy?",
  "menu.special_title": "Evento especial",
  "menu.special_toggle": "Mostrar cabecera de evento especial",
  "menu.special_sub": "Cabecera con brillo en la parte superior del menú público",
  "menu.special_label_ph": "Texto de la cabecera (p. ej. Fiesta de Verano)",
  "menu.event_date_label": "Fecha del próximo evento",
  "menu.hours_label": "Horario",
  "menu.time_from": "Desde",
  "menu.time_to": "Hasta",
  "menu.time_none": "—",
  "menu.heat": "Picante",
  "menu.color": "Color del artículo",
  "menu.taco": "Taco",
  "menu.taco_hint": "En la oferta",
  "menu.remove": "Quitar",
  "menu.add_title": "Añadir artículo",
  "menu.add_ph": "Nombre del artículo",
  "menu.add_is_taco": "Es un taco (entra en la oferta 1×3 · 2×5 · 3×7)",
  "menu.add_btn": "Añadir",
  "menu.settings_title": "Ajustes",
  "menu.visits_total": "Visitas totales",
  "menu.visitors_now": "Visitantes ahora",
  "menu.staff_connected": ({ n }) => `${n} dispositivo${Number(n) === 1 ? "" : "s"} del equipo conectado${Number(n) === 1 ? "" : "s"}`,
  "menu.demo_title": "Acceso demo (admin/admin)",
  "menu.demo_toggle": "Permitir acceso demo",
  "menu.demo_active": ({ n }) => `${n} dispositivo${Number(n) === 1 ? "" : "s"} en demo ahora`,
  "menu.demo_none": "Nadie en la demo ahora mismo",
  "menu.demo_boot": "Expulsar a todos",

  "login.title": "Trastienda",
  "login.sub": "Solo para el equipo de Sabrina",
  "login.user_ph": "Usuario",
  "login.ph": "Contraseña",
  "login.enter": "Entrar",
  "login.error": "Código incorrecto",
  "login.public": "← Ver el menú público",
  "logout": "Salir",
  "demo.banner": "Modo demostración · datos de prueba",
  "login.demo_hint": "Demo: admin / admin",

  "order.name_ph": "Nombre del cliente (opcional)",
  "order.noname": "Sin nombre",

  "hist.kicker": "Trastienda",
  "hist.title": "Pedidos Anteriores",
  "hist.sub": ({ n }) => `${n} pedido${Number(n) === 1 ? "" : "s"} en total`,
  "hist.empty": "Aún no hay pedidos.",
  "hist.done": "Entregado",
  "hist.active": "En curso",

  "home.subtitle": "La Cocina Lot · servicio del jueves",
  "home.revenue": "Ingresos",
  "home.sold": "Vendidos",
  "home.open": "Abiertos",
  "home.take_order": "Tomar Pedido",
  "home.take_order_sub": "Arma un ticket",
  "home.kitchen": "Cocina",
  "home.kitchen_sub": "Nuevo → Cocinando → Listo",
  "home.sales": "Ventas",
  "home.sales_sub": "Vendidos + ingresos",
  "home.week_menu": "Menú de la Semana",
  "home.week_menu_sub": "Edita los 4 tacos",
  "home.on_menu": "En el menú esta semana",
  "home.sync_note": "Abre esto en cada teléfono — los pedidos se sincronizan en vivo.",

  "order.kicker": "Nuevo Pedido",
  "order.title": "Toca y Arma",
  "order.note_ph": "Añade una nota (sin cebolla, extra crema…)",
  "order.tacos": ({ n }) => `${n} taco${Number(n) === 1 ? "" : "s"}`,
  "order.send": "Enviar Pedido →",
  "order.send_tab": "Añadir a la cuenta →",
  "order.sent": "¡Enviado! ✓",
  "order.save": ({ amt }) => `Ahorras ${amt}`,
  "order.tab_none": "— Sin cuenta / nueva",
  "order.tab_prefix": "Cuenta:",

  "pay.title": "Cobrar",
  "pay.how": "¿Cómo paga?",
  "pay.cash": "Efectivo",
  "pay.card": "Tarjeta",
  "pay.later": "Pagar después (cuenta)",
  "pay.comp": "Invitación (gratis)",
  "pay.comp_confirm": "Introduce el código para invitar este ticket. Se cuentan los tacos, pero el total es 0€.",
  "pay.total": "Total",
  "pay.received": "Efectivo recibido",
  "pay.change": "Cambio",
  "pay.paid": "Pagado · Enviar a cocina",
  "pay.back": "← Atrás",
  "pay.cancel": "Cancelar",
  "pay.clear": "Borrar",

  "tabs.btn": "Cuentas",
  "tabs.title": "Cuentas abiertas",
  "tabs.empty": "No hay cuentas abiertas",
  "tabs.settle": "Cobrar cuenta",
  "tabs.close_blocked": ({ n }) => `No se puede cerrar el día: ${n} cuenta${Number(n) === 1 ? "" : "s"} sin pagar. Cóbralas primero.`,

  "order.ready_btn": "Listos",
  "order.ready_title": "Pedidos listos",
  "order.ready_empty": "No hay pedidos listos",
  "order.deliver": "Entregado",

  "queue.title": "Cocina",
  "queue.sub": ({ n }) => `${n} ticket${Number(n) === 1 ? "" : "s"} · más antiguos primero`,
  "queue.new": "Nuevo",
  "queue.cooking": "Cocinando",
  "queue.ready": "Listo",
  "queue.start": "Empezar a Cocinar →",
  "queue.mark_ready": "Marcar Listo ✓",
  "queue.clear": "Entregado · Quitar",
  "queue.empty": "Nada por aquí",
  "queue.now": "ahora",
  "queue.min_ago": ({ m }) => `hace ${m} min`,
  "order.del": "Eliminar pedido",
  "order.del_confirm": ({ n }) => `Introduce el código para eliminar el pedido #${n}. Se descuenta de las ventas del día.`,
  "order.del_go": "Eliminar pedido",

  "dash.kicker": "Cocina · Trastienda",
  "dash.title": "Números de Hoy",
  "dash.revenue": "Ingresos",
  "dash.orders": ({ n }) => `${n} pedidos`,
  "dash.sold": "Tacos Vendidos",
  "dash.per_order": ({ x }) => `${x} / pedido`,
  "dash.sold_by": "Vendidos por Taco",
  "dash.in_sales": ({ x }) => `${x} en ventas`,
  "dash.off": "· off",
  "dash.note": "Los números se actualizan en vivo cuando entran pedidos del mostrador.",
  "dash.tacos_sold": ({ n }) => `${n} taco${Number(n) === 1 ? "" : "s"}`,
  "dash.close_day": "Cerrar el día",
  "dash.close_day_sub": "Archiva el servicio de hoy y reinicia el tablero",
  "dash.close_confirm": "Introduce el código para cerrar el día",
  "dash.close_ph": "Código del equipo",
  "dash.close_go": "Cerrar y archivar",
  "dash.close_cancel": "Cancelar",
  "dash.close_error": "Código incorrecto",
  "dash.closed": "¡Día cerrado y archivado! ✓",

  "dash.past_weeks": "Semanas Anteriores",
  "dash.past_empty": "Aún no hay servicios archivados.",
  "dash.past_orders": ({ n }) => `${n} pedido${Number(n) === 1 ? "" : "s"}`,
  "dash.this_week": "Esta semana (en curso)",
  "dash.view": "Ver",
  "dash.hide": "Ocultar",
  "dash.del": "Eliminar",
  "dash.del_confirm": "Introduce el código para eliminar este servicio archivado",
  "dash.del_go": "Eliminar para siempre",

  "menu.kicker": "Configuración Semanal",
  "menu.title": "Los 4 Tacos de la Semana",
  "menu.sub": "Renombra, cambia precio o 86 un taco. Se sincroniza a cada teléfono.",
  "menu.on_menu": "En el menú",
  "menu.hidden": "Oculto · 86'd",
  "menu.reset": "Reiniciar servicio (borrar pedidos)",
  "menu.reset_confirm": "¿Reiniciar el servicio? Borra todos los pedidos y restaura el menú por defecto.",
};

const EN: Dict = {
  "nav.order": "Order",
  "nav.queue": "Queue",
  "nav.sales": "Sales",
  "nav.history": "History",
  "nav.menu": "Menu",
  live: "LIVE",

  "board.today": "Today",
  "board.tagline": "Tacos. Tacos. Tacos.",
  "board.open": "Open now",
  "board.closed": "Closed",
  "board.soldout": "Sold out",
  "board.none": "We're resting today — come back soon",
  "board.next_event": "Next event",
  "board.other": "Other Stuff",
  "board.event_today": "Today.",
  "board.at": "at",
  "board.ig_follow": "Follow us on Instagram",
  "board.staff": "Staff sign in",
  "board.copyright": "© 2026 Taqueria Sabrina",
  "board.orders_live": "Orders in progress",
  "board.st_new": "Sent to kitchen",
  "board.st_cooking": "Now cooking",
  "board.st_ready": "Ready!",
  "board.sold": "Tacos sold",
  "board.special_default": "Special Event",

  "menu.storefront": "Storefront",
  "menu.open_label": "Open now",
  "menu.open_sub": "Shows “Open” or “Closed” on the public site",
  "menu.location_label": "Location",
  "menu.location_ph": "Where are we today?",
  "menu.special_title": "Special event",
  "menu.special_toggle": "Show special-event header",
  "menu.special_sub": "A sparkly header at the top of the public menu",
  "menu.special_label_ph": "Header text (e.g. Summer Fiesta)",
  "menu.event_date_label": "Next event date",
  "menu.hours_label": "Hours",
  "menu.time_from": "From",
  "menu.time_to": "To",
  "menu.time_none": "—",
  "menu.heat": "Heat",
  "menu.color": "Item color",
  "menu.taco": "Taco",
  "menu.taco_hint": "In the deal",
  "menu.remove": "Remove",
  "menu.add_title": "Add item",
  "menu.add_ph": "Item name",
  "menu.add_is_taco": "It's a taco (joins the 1×3 · 2×5 · 3×7 deal)",
  "menu.add_btn": "Add",
  "menu.settings_title": "Settings",
  "menu.visits_total": "Total visits",
  "menu.visitors_now": "Active now",
  "menu.staff_connected": ({ n }) => `${n} staff device${Number(n) === 1 ? "" : "s"} connected`,
  "menu.demo_title": "Demo access (admin/admin)",
  "menu.demo_toggle": "Allow demo access",
  "menu.demo_active": ({ n }) => `${n} device${Number(n) === 1 ? "" : "s"} on demo now`,
  "menu.demo_none": "Nobody on the demo right now",
  "menu.demo_boot": "Boot everyone",

  "login.title": "Back of House",
  "login.sub": "Sabrina crew only",
  "login.user_ph": "Username",
  "login.ph": "Password",
  "login.enter": "Enter",
  "login.error": "Wrong passcode",
  "login.public": "← View public menu",
  "logout": "Sign out",
  "demo.banner": "Demo mode · test data",
  "login.demo_hint": "Demo: admin / admin",

  "order.name_ph": "Customer name (optional)",
  "order.noname": "No name",

  "hist.kicker": "Back of House",
  "hist.title": "Past Orders",
  "hist.sub": ({ n }) => `${n} order${Number(n) === 1 ? "" : "s"} total`,
  "hist.empty": "No orders yet.",
  "hist.done": "Picked up",
  "hist.active": "In progress",

  "home.subtitle": "La Cocina Lot · Thursday service",
  "home.revenue": "Revenue",
  "home.sold": "Sold",
  "home.open": "Open",
  "home.take_order": "Take Order",
  "home.take_order_sub": "Build a ticket",
  "home.kitchen": "Kitchen",
  "home.kitchen_sub": "New → Cooking → Ready",
  "home.sales": "Sales",
  "home.sales_sub": "Sold + revenue",
  "home.week_menu": "This Week's Menu",
  "home.week_menu_sub": "Edit the 4 tacos",
  "home.on_menu": "On the menu this week",
  "home.sync_note": "Open this on every phone — orders sync live across all of them.",

  "order.kicker": "New Order",
  "order.title": "Tap to Build",
  "order.note_ph": "Add a note (no onions, extra crema…)",
  "order.tacos": ({ n }) => `${n} taco${Number(n) === 1 ? "" : "s"}`,
  "order.send": "Send Order →",
  "order.send_tab": "Add to tab →",
  "order.sent": "Sent! ✓",
  "order.save": ({ amt }) => `You save ${amt}`,
  "order.tab_none": "— No tab / new",
  "order.tab_prefix": "Tab:",

  "pay.title": "Checkout",
  "pay.how": "How are they paying?",
  "pay.cash": "Cash",
  "pay.card": "Card",
  "pay.later": "Pay later (tab)",
  "pay.comp": "Comp (free)",
  "pay.comp_confirm": "Enter the passcode to comp this ticket. Tacos still count, but the total is €0.",
  "pay.total": "Total",
  "pay.received": "Cash received",
  "pay.change": "Change",
  "pay.paid": "Paid · Send to kitchen",
  "pay.back": "← Back",
  "pay.cancel": "Cancel",
  "pay.clear": "Clear",

  "tabs.btn": "Tabs",
  "tabs.title": "Open tabs",
  "tabs.empty": "No open tabs",
  "tabs.settle": "Settle tab",
  "tabs.close_blocked": ({ n }) => `Can't close the day: ${n} unpaid tab${Number(n) === 1 ? "" : "s"}. Settle them first.`,

  "order.ready_btn": "Ready",
  "order.ready_title": "Ready orders",
  "order.ready_empty": "No ready orders",
  "order.deliver": "Delivered",

  "queue.title": "Kitchen",
  "queue.sub": ({ n }) => `${n} ticket${Number(n) === 1 ? "" : "s"} · oldest first`,
  "queue.new": "New",
  "queue.cooking": "Cooking",
  "queue.ready": "Ready",
  "queue.start": "Start Cooking →",
  "queue.mark_ready": "Mark Ready ✓",
  "queue.clear": "Picked Up · Clear",
  "queue.empty": "Nothing here",
  "queue.now": "just now",
  "queue.min_ago": ({ m }) => `${m} min ago`,
  "order.del": "Delete order",
  "order.del_confirm": ({ n }) => `Enter the passcode to delete order #${n}. Its total is backed out of today's sales.`,
  "order.del_go": "Delete order",

  "dash.kicker": "Back of House",
  "dash.title": "Tonight's Numbers",
  "dash.revenue": "Revenue",
  "dash.orders": ({ n }) => `${n} orders`,
  "dash.sold": "Tacos Sold",
  "dash.per_order": ({ x }) => `${x} / order`,
  "dash.sold_by": "Sold by Taco",
  "dash.in_sales": ({ x }) => `${x} in sales`,
  "dash.off": "· off",
  "dash.note": "Numbers update live as orders fire from the front counter.",
  "dash.tacos_sold": ({ n }) => `${n} taco${Number(n) === 1 ? "" : "s"}`,
  "dash.close_day": "Close out the day",
  "dash.close_day_sub": "Archive today's service and reset the board",
  "dash.close_confirm": "Enter the passcode to close out the day",
  "dash.close_ph": "Crew passcode",
  "dash.close_go": "Close & archive",
  "dash.close_cancel": "Cancel",
  "dash.close_error": "Wrong passcode",
  "dash.closed": "Day closed & archived! ✓",

  "dash.past_weeks": "Past Weeks",
  "dash.past_empty": "No archived services yet.",
  "dash.past_orders": ({ n }) => `${n} order${Number(n) === 1 ? "" : "s"}`,
  "dash.this_week": "This week (in progress)",
  "dash.view": "View",
  "dash.hide": "Hide",
  "dash.del": "Delete",
  "dash.del_confirm": "Enter the passcode to delete this archived service",
  "dash.del_go": "Delete forever",

  "menu.kicker": "Weekly Setup",
  "menu.title": "This Week's 4 Tacos",
  "menu.sub": "Rename, reprice, or 86 a taco. Changes sync to every phone.",
  "menu.on_menu": "On menu",
  "menu.hidden": "Hidden · 86'd",
  "menu.reset": "Reset service (clear orders)",
  "menu.reset_confirm": "Reset the service? Clears all orders and restores the default menu.",
};

const DICTS: Record<Lang, Dict> = { es: ES, en: EN };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof ES, params?: Record<string, string | number>) => string;
  money: (n: number) => string;
  longDate: (d: Date) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always default to Spanish on load (the stand is in Spain). The EN/ES toggle
  // still switches for the current session, but it isn't persisted — every fresh
  // load / new visitor starts in Spanish.
  const [lang, setLangState] = useState<Lang>("es");

  const setLang = (l: Lang) => setLangState(l);

  const t = (key: string, params?: Record<string, string | number>) => {
    const v = DICTS[lang][key] ?? key;
    return typeof v === "function" ? v(params ?? {}) : v;
  };

  const value: Ctx = { lang, setLang, t, money: (n) => money(n, lang), longDate: (d) => longDate(d, lang) };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
