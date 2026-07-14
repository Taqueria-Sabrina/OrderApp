const LANES = [
  {
    key: "new", title: "New", accent: "#e63b19",
    cards: [
      { n: 47, items: ["2× Al Pastor", "1× Birria Beef"], ago: "just now" },
      { n: 48, items: ["3× Baja Cauliflower"], ago: "1 min" },
    ],
  },
  {
    key: "cooking", title: "Cooking", accent: "#e6b800",
    cards: [
      { n: 46, items: ["1× Baja Cauliflower", "1× Mushroom"], ago: "2 min" },
      { n: 45, items: ["3× Al Pastor"], ago: "5 min", note: "no onions" },
    ],
  },
  {
    key: "ready", title: "Ready", accent: "#b7d13a",
    cards: [
      { n: 44, items: ["2× Birria Beef"], ago: "6 min" },
    ],
  },
];

export default function LiveQueueKanban() {
  return (
    <div className="flex h-full w-full flex-col bg-[#12100e] font-sans text-[#f5ecd7]">
      <header className="flex items-center justify-between border-b border-[#2a2320] px-7 pb-4 pt-6">
        <div>
          <h1 className="text-2xl font-black">Service Board</h1>
          <p className="text-sm text-[#a99f8d]">Friday Night Pop-Up · La Cocina Lot</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-[#1f1a17] px-3 py-1.5 text-xs font-bold text-[#b7d13a]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#b7d13a]" /> LIVE · syncing
        </span>
      </header>

      <div className="grid flex-1 grid-cols-3 gap-5 overflow-hidden p-7">
        {LANES.map((lane) => (
          <div key={lane.key} className="flex flex-col rounded-3xl bg-[#1a1613] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: lane.accent }} />
                <h2 className="text-lg font-black">{lane.title}</h2>
              </div>
              <span className="text-sm font-bold text-[#7a7264]">{lane.cards.length}</span>
            </div>
            <div className="space-y-3">
              {lane.cards.map((c) => (
                <div
                  key={c.n}
                  className="rounded-2xl border-l-4 bg-[#241f1b] p-4"
                  style={{ borderColor: lane.accent }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-lg font-black">#{c.n}</span>
                    <span className="text-xs text-[#7a7264]">{c.ago}</span>
                  </div>
                  {c.items.map((it) => (
                    <p key={it} className="text-sm font-bold leading-relaxed">{it}</p>
                  ))}
                  {"note" in c && c.note && (
                    <p className="mt-2 rounded bg-[#2a2016] px-2 py-1 text-xs font-semibold text-[#e6b800]">
                      ⚑ {c.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
