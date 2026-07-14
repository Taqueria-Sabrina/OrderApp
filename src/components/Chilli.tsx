/**
 * Chilli heat indicator — a small inline SVG chilli (no emoji, per brand).
 * `Chillis` renders `level` filled out of 3; unfilled ones show as faint
 * outlines so the scale reads at a glance.
 */

function ChilliGlyph({ filled, size = 16 }: { filled: boolean; size?: number }) {
  const color = filled ? "#c8437f" : "#e2d5dd";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {/* stem */}
      <path
        d="M15 4c1.5-1.4 3-1.6 4.5-1"
        fill="none"
        stroke={filled ? "#0f8f88" : "#e2d5dd"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* pod */}
      <path
        d="M15 5c1.2 1.8.8 4-1 6.5-2.2 3-5 5.5-8 6.2-1.6.4-2.6-.9-1.7-2.2 2-3 4.2-6.6 6.7-9C12.4 5 13.8 4.4 15 5z"
        fill={color}
      />
    </svg>
  );
}

export default function Chillis({ level, size = 16 }: { level: number; size?: number }) {
  const n = Math.max(0, Math.min(3, level));
  if (n === 0) return null; // no chillis shown for mild (0)
  return (
    <span className="inline-flex items-center gap-0.5" title={`${n}/3`}>
      {Array.from({ length: n }, (_, i) => (
        <ChilliGlyph key={i} filled size={size} />
      ))}
    </span>
  );
}

/** Editable 0–3 selector for the back-office menu editor. */
export function ChilliPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? n - 1 : n)}
          className="p-0.5"
          aria-label={`Set heat ${n}`}
        >
          <ChilliGlyph filled={n <= value} size={22} />
        </button>
      ))}
    </div>
  );
}
