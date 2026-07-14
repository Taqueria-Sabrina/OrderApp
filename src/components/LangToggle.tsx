import { useI18n, type Lang } from "../lib/i18n";

const OPTIONS: Lang[] = ["es", "en"];

export default function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center rounded-full bg-teal-soft p-0.5 text-[11px] font-black">
      {OPTIONS.map((o) => (
        <button
          key={o}
          onClick={() => setLang(o)}
          className="rounded-full px-2.5 py-1 uppercase tracking-wide transition"
          style={{
            backgroundColor: lang === o ? "#17b3ab" : "transparent",
            color: lang === o ? "#fff" : "#0b6d68",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
