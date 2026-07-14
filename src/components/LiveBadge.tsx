import { useI18n } from "../lib/i18n";

export default function LiveBadge() {
  const { t } = useI18n();
  return (
    <span className="flex items-center gap-2 rounded-full bg-teal-soft px-3 py-1.5 text-xs font-extrabold text-teal-deep">
      <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
      {t("live")}
    </span>
  );
}
