const TACOS = [
  { name: "Al Pastor", note: "pineapple, chili crema", price: 6, emoji: "🌮", count: 2, tint: "#e63b19" },
  { name: "Baja Cauliflower", note: "crispy, lime slaw", price: 6, emoji: "🥬", count: 0, tint: "#7fae1b" },
  { name: "Birria Beef", note: "consommé dip", price: 7, emoji: "🥩", count: 1, tint: "#b8471f" },
  { name: "Mushroom Barbacoa", note: "smoked, salsa verde", price: 6, emoji: "🍄", count: 0, tint: "#c98a2b" },
];

export default function OrderEntryGrid() {
  const total = TACOS.reduce((s, t) => s + t.count * t.price, 0);
  const items = TACOS.reduce((s, t) => s + t.count, 0);
  return (
    <div className="flex h-full w-full flex-col bg-[#1a1614] font-sans text-[#f5ecd7]">
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e63b19]">New Order</p>
          <h1 className="text-2xl font-black tracking-tight">Tap to Build</h1>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2a2320] text-lg font-bold">
          #47
        </div>
      </header>

      <div className="grid flex-1 grid-cols-2 gap-3 px-5 pb-4">
        {TACOS.map((t) => (
          <button
            key={t.name}
            className="relative flex flex-col justify-between rounded-3xl border-2 p-4 text-left transition"
            style={{
              borderColor: t.count ? t.tint : "#332b27",
              backgroundColor: t.count ? `${t.tint}22` : "#221d1a",
            }}
          >
            {t.count > 0 && (
              <span
                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-[#1a1614]"
                style={{ backgroundColor: t.tint }}
              >
                {t.count}
              </span>
            )}
            <span className="text-4xl">{t.emoji}</span>
            <div className="mt-3">
              <p className="text-base font-bold leading-tight">{t.name}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-[#a99f8d]">{t.note}</p>
              <p className="mt-2 text-sm font-bold" style={{ color: t.tint }}>${t.price}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-[#332b27] bg-[#211c19] px-5 pb-6 pt-4">
        <div className="mb-3 flex items-end justify-between">
          <span className="text-sm text-[#a99f8d]">{items} items</span>
          <span className="text-3xl font-black">${total}.00</span>
        </div>
        <button className="w-full rounded-2xl bg-[#e63b19] py-4 text-lg font-black uppercase tracking-wide text-[#fff] shadow-[0_8px_0_#a52810]">
          Fire Order →
        </button>
      </div>
    </div>
  );
}
