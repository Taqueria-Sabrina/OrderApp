const TACOS = [
  { name: "Al Pastor", sold: 38, price: 6, tint: "#e63b19" },
  { name: "Baja Cauliflower", sold: 24, price: 6, tint: "#7fae1b" },
  { name: "Birria Beef", sold: 41, price: 7, tint: "#b8471f" },
  { name: "Mushroom Barbacoa", sold: 17, price: 6, tint: "#c98a2b" },
];

export default function DashboardStats() {
  const tacos = TACOS.reduce((s, t) => s + t.sold, 0);
  const revenue = TACOS.reduce((s, t) => s + t.sold * t.price, 0);
  const orders = 52;
  const max = Math.max(...TACOS.map((t) => t.sold));

  return (
    <div className="flex h-full w-full flex-col bg-[#f5ecd7] px-8 py-7 font-sans text-[#1a1614]">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e63b19]">Back of House</p>
          <h1 className="text-3xl font-black">Tonight's Numbers</h1>
        </div>
        <span className="rounded-full bg-[#1a1614] px-4 py-2 text-sm font-bold text-[#f5ecd7]">Fri · 6:00–10:00pm</span>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-5">
        {[
          { label: "Revenue", value: `$${revenue}`, sub: "+18% vs last week", fg: "#e63b19" },
          { label: "Tacos Sold", value: tacos, sub: `across ${orders} orders`, fg: "#7fae1b" },
          { label: "Avg Ticket", value: `$${(revenue / orders).toFixed(2)}`, sub: "2.3 tacos / order", fg: "#c98a2b" },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl border border-[#e3d6b8] bg-white p-6 shadow-[0_2px_0_#e3d6b8]">
            <p className="text-sm font-bold uppercase tracking-wide text-[#9c8f72]">{s.label}</p>
            <p className="mt-2 text-5xl font-black tabular-nums" style={{ color: s.fg }}>{s.value}</p>
            <p className="mt-2 text-sm font-semibold text-[#6f8a2e]">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 rounded-3xl border border-[#e3d6b8] bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black">Sold by Taco</h2>
          <span className="text-sm font-semibold text-[#9c8f72]">This week's rotation</span>
        </div>
        <div className="flex h-[300px] items-end gap-8 px-2">
          {TACOS.map((t) => (
            <div key={t.name} className="flex flex-1 flex-col items-center justify-end">
              <span className="mb-2 text-2xl font-black tabular-nums">{t.sold}</span>
              <div
                className="w-full rounded-t-xl"
                style={{ height: `${(t.sold / max) * 240}px`, backgroundColor: t.tint }}
              />
              <span className="mt-3 text-center text-sm font-bold leading-tight">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
