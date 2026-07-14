const ORDERS = [
  {
    n: 47, ago: "just now", state: "new",
    items: [["2×", "Al Pastor"], ["1×", "Birria Beef"]], note: "extra consommé",
  },
  {
    n: 46, ago: "2 min", state: "cooking",
    items: [["1×", "Baja Cauliflower"], ["1×", "Mushroom Barbacoa"]], note: null,
  },
  {
    n: 45, ago: "5 min", state: "cooking",
    items: [["3×", "Al Pastor"]], note: "no onions",
  },
];

const STATE: Record<string, { label: string; bg: string; fg: string }> = {
  new: { label: "NEW", bg: "#e63b19", fg: "#fff" },
  cooking: { label: "COOKING", bg: "#e6b800", fg: "#1a1614" },
};

export default function LiveQueueCards() {
  return (
    <div className="flex h-full w-full flex-col bg-[#12100e] font-sans text-[#f5ecd7]">
      <header className="flex items-center justify-between border-b border-[#2a2320] px-5 pb-4 pt-6">
        <div>
          <h1 className="text-2xl font-black">Kitchen Queue</h1>
          <p className="text-sm text-[#a99f8d]">3 open · oldest first</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-[#1f1a17] px-3 py-1.5 text-xs font-bold text-[#b7d13a]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#b7d13a]" /> LIVE
        </span>
      </header>

      <div className="flex-1 space-y-4 overflow-hidden px-5 py-5">
        {ORDERS.map((o) => {
          const s = STATE[o.state];
          return (
            <div key={o.n} className="rounded-3xl border border-[#2a2320] bg-[#1c1815] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xl font-black">#{o.n}</span>
                <span className="rounded-full px-3 py-1 text-[11px] font-black tracking-wide" style={{ backgroundColor: s.bg, color: s.fg }}>
                  {s.label}
                </span>
              </div>
              <ul className="space-y-1.5">
                {o.items.map(([q, name]) => (
                  <li key={name} className="flex items-baseline gap-3 text-lg font-bold">
                    <span className="text-[#e63b19]">{q}</span>
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
              {o.note && (
                <p className="mt-3 rounded-lg bg-[#2a2016] px-3 py-1.5 text-sm font-semibold text-[#e6b800]">
                  ⚑ {o.note}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[#7a7264]">{o.ago}</span>
                <button className="rounded-xl bg-[#b7d13a] px-5 py-2 text-sm font-black text-[#1a1614]">
                  Mark Ready ✓
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
