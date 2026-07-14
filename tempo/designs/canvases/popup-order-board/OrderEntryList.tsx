const TACOS = [
  { name: "Al Pastor", price: 6, count: 2 },
  { name: "Baja Cauliflower", price: 6, count: 1 },
  { name: "Birria Beef", price: 7, count: 0 },
  { name: "Mushroom Barbacoa", price: 6, count: 0 },
];

function Stepper({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3">
      <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#3a322d] text-xl font-bold text-[#a99f8d]">
        −
      </button>
      <span className="w-6 text-center text-xl font-black tabular-nums">{count}</span>
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e63b19] text-xl font-bold text-white">
        +
      </button>
    </div>
  );
}

export default function OrderEntryList() {
  const total = TACOS.reduce((s, t) => s + t.count * t.price, 0);
  return (
    <div className="flex h-full w-full flex-col bg-[#f5ecd7] font-sans text-[#1a1614]">
      <header className="bg-[#1a1614] px-5 pb-5 pt-6 text-[#f5ecd7]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e6b800]">Front Counter</p>
        <h1 className="text-2xl font-black">Order #48</h1>
      </header>

      <div className="flex-1 divide-y divide-[#e3d6b8] px-5">
        {TACOS.map((t) => (
          <div key={t.name} className="flex items-center justify-between py-5">
            <div>
              <p className="text-lg font-bold leading-tight">{t.name}</p>
              <p className="text-sm font-semibold text-[#9c7a2e]">${t.price}.00</p>
            </div>
            <Stepper count={t.count} />
          </div>
        ))}

        <div className="py-5">
          <button className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-[#c9b68a] py-3 text-sm font-bold text-[#9c7a2e]">
            <span className="pl-4 text-lg">+</span> Add note (no onions, extra crema…)
          </button>
        </div>
      </div>

      <div className="bg-[#1a1614] px-5 pb-6 pt-5 text-[#f5ecd7]">
        <div className="mb-3 flex items-center justify-between text-sm text-[#a99f8d]">
          <span>3 tacos</span>
          <span>Table / Pickup</span>
        </div>
        <div className="mb-4 flex items-end justify-between">
          <span className="text-sm uppercase tracking-wide text-[#a99f8d]">Total</span>
          <span className="text-4xl font-black">${total}.00</span>
        </div>
        <button className="w-full rounded-2xl bg-[#b7d13a] py-4 text-lg font-black uppercase tracking-wide text-[#1a1614]">
          Send to Kitchen
        </button>
      </div>
    </div>
  );
}
