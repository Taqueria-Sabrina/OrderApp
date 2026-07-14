const TACOS = [
  { name: "Al Pastor", note: "pineapple, chili crema", price: "6", on: true },
  { name: "Baja Cauliflower", note: "crispy, lime slaw", price: "6", on: true },
  { name: "Birria Beef", note: "consommé dip", price: "7", on: true },
  { name: "Mushroom Barbacoa", note: "smoked, salsa verde", price: "6", on: false },
];

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className="flex h-7 w-12 items-center rounded-full p-0.5 transition"
      style={{ backgroundColor: on ? "#b7d13a" : "#3a322d", justifyContent: on ? "flex-end" : "flex-start" }}
    >
      <span className="h-6 w-6 rounded-full bg-white shadow" />
    </span>
  );
}

export default function MenuEditor() {
  return (
    <div className="flex h-full w-full flex-col bg-[#1a1614] font-sans text-[#f5ecd7]">
      <header className="px-5 pb-4 pt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b7d13a]">Weekly Setup</p>
        <h1 className="text-2xl font-black">This Week's 4 Tacos</h1>
        <p className="mt-1 text-sm text-[#a99f8d]">Rename, reprice, or 86 an item before service.</p>
      </header>

      <div className="flex-1 space-y-3 px-5">
        {TACOS.map((t) => (
          <div
            key={t.name}
            className="rounded-2xl border border-[#2f2723] p-4"
            style={{ opacity: t.on ? 1 : 0.55, backgroundColor: t.on ? "#221d1a" : "#191512" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <input
                  defaultValue={t.name}
                  className="w-full bg-transparent text-lg font-bold text-[#f5ecd7] outline-none"
                />
                <input
                  defaultValue={t.note}
                  className="mt-0.5 w-full bg-transparent text-[13px] text-[#a99f8d] outline-none"
                />
              </div>
              <Toggle on={t.on} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-[#12100e] px-3 py-2">
                <span className="text-lg font-bold text-[#9c8f72]">$</span>
                <input
                  defaultValue={t.price}
                  className="w-10 bg-transparent text-lg font-black text-[#f5ecd7] outline-none"
                />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#7a7264]">
                {t.on ? "Live on menu" : "Hidden · 86'd"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#2f2723] px-5 pb-6 pt-4">
        <button className="mb-3 w-full rounded-2xl border-2 border-dashed border-[#3a322d] py-3 text-sm font-bold text-[#a99f8d]">
          + Swap in a new taco
        </button>
        <button className="w-full rounded-2xl bg-[#b7d13a] py-4 text-lg font-black uppercase tracking-wide text-[#1a1614]">
          Publish Menu
        </button>
      </div>
    </div>
  );
}
