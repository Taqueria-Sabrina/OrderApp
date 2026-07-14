export default function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-3xl";
  return (
    <div className="flex items-center gap-2">
      <h1 className={`font-display font-black leading-[0.95] text-pink-deep ${cls}`}>
        Taqueria
        <br />
        Sabrina
      </h1>
      <span className="text-2xl" aria-hidden>
        ✨🐩
      </span>
    </div>
  );
}
