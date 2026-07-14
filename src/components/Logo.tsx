/**
 * Taqueria Sabrina brand logo — a single PNG containing both the mark and the
 * name. Used everywhere the brand appears (public board, login, staff top bar).
 *
 * Drop the artwork at `public/logo.png` (served from the site root as
 * `/logo.png`). Swap the file to rebrand; no code change needed.
 */
export default function Logo({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const h = size === "lg" ? "h-28" : size === "sm" ? "h-8" : "h-14";
  return (
    <img
      src="/logo.png"
      alt="Taqueria Sabrina"
      className={`${h} w-auto object-contain ${className}`}
    />
  );
}
