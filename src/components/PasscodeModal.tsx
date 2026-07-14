import { useState } from "react";
import { verifyPasscode } from "../lib/auth";
import { useI18n } from "../lib/i18n";

/**
 * Reusable password-gated confirmation modal for destructive actions
 * (close out the day, delete an archive, delete an order). Runs `onConfirm`
 * only when the crew passcode is entered correctly.
 */
export default function PasscodeModal({
  title,
  prompt,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  prompt: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPasscode(code)) {
      setError(true);
      return;
    }
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-line bg-paper p-6 shadow-xl"
      >
        <h2 className="font-display text-2xl font-black text-ink">{title}</h2>
        <p className="mt-1 mb-4 text-sm font-semibold text-ink-soft">{prompt}</p>
        <input
          autoFocus
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(false);
          }}
          placeholder={t("dash.close_ph")}
          className="w-full rounded-xl border-2 border-line bg-cream px-4 py-3 text-base font-semibold text-ink placeholder:text-ink-soft focus:border-teal focus:outline-none"
        />
        {error && <p className="mt-2 text-sm font-bold text-pink-deep">{t("dash.close_error")}</p>}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border-2 border-line py-3 text-sm font-bold text-ink-soft"
          >
            {t("dash.close_cancel")}
          </button>
          <button
            type="submit"
            className="flex-1 rounded-2xl py-3 text-sm font-black uppercase tracking-wide text-white"
            style={{ backgroundColor: "#c8437f" }}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
