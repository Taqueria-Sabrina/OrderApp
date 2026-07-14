const TACOS = [
  { name: "Birria Beef", sold: 41, price: 7 },
  { name: "Al Pastor", sold: 38, price: 6 },
  { name: "Baja Cauliflower", sold: 24, price: 6 },
  { name: "Mushroom Barbacoa", sold: 17, price: 6 },
];

const MEDAL = ["#e6b800", "#c0c0c0", "#cd7f32", "#4a423b"];

export default function DashboardLeaderboard() {
  const sorted = [...TACOS].sort((a, b) => b.sold - a.sold);
  const max = sorted[0].sold;
  const revenue = TACOS.reduce((s, t) => s + t.sold * t.price, 0);

  return (
    <div className="flex h-full w-full flex-col bg-[#1a1614] px-5 py-6 font-sans text-[#f5ecd7]">
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e6b800]">Leaderboard</p>
        <h1 className="text-2xl font-black">Best Sellers</h1>
      </header>

      <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#e63b19] to-[#a52810] p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-[#ffd9cf]">Total Revenue</p>
        <p className="text-5xl font-black">${revenue}</p>
        <p className="mt-1 text-sm font-semibold text-[#ffd9cf]">120 tacos · 52 orders tonight</p>
      </div>

      <div className="flex-1 space-y-4">
        {sorted.map((t, i) => (
          <div key={t.name}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-black text-[#1a1614]"
                  style={{ backgroundColor: MEDAL[i] }}
                >
                  {i + 1}
                </span>
                <span className="text-base font-bold">{t.name}</span>
              </div>
              <span className="text-lg font-black tabular-nums">{t.sold}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#2a2320]">
              <div
                className="h-full rounded-full"
                style={{ width: `${(t.sold / max) * 100}%`, backgroundColor: MEDAL[i] }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-2xl bg-[#221d1a] p-4 text-sm font-semibold text-[#a99f8d]">
        🔥 <span className="text-[#f5ecd7]">Birria</span> is selling out fast — prep more for the 8pm rush.
      </p>
    </div>
  );
}
