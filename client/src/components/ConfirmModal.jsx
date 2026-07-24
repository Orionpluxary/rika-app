import { CornerFlourish, Sparkle } from "./SparkleDecor.jsx";

export default function ConfirmModal({ pending, onResolve }) {
  if (!pending) return null;
  const { summary, tier, actions } = pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/10 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-ink/20 bg-white p-6 shadow-xl animate-fade-up">
        <CornerFlourish className="absolute -left-2 -top-2 text-ink/50" />
        <CornerFlourish className="absolute -bottom-2 -right-2 text-ink/50" flip />

        <div className="mb-3 flex items-center gap-2">
          <Sparkle size={16} className="text-ink/70" />
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {tier === "money" ? "money action — needs your go-ahead" : "needs your go-ahead"}
          </span>
        </div>

        <h2 className="font-display text-xl italic text-ink">Rika wants to:</h2>
        <p className="mt-2 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-soft">{summary}</p>

        {actions?.length > 1 && (
          <p className="mt-2 text-[11px] text-muted">
            {actions.length} actions bundled together — approving covers all of them.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => onResolve(false)}
            className="rounded-full border border-ink/25 px-4 py-2 text-[13px] text-ink-soft transition hover:bg-ink/5"
          >
            not now
          </button>
          <button
            onClick={() => onResolve(true)}
            className="rounded-full border border-ink bg-ink px-5 py-2 text-[13px] text-white transition hover:bg-ink/85"
          >
            go ahead
          </button>
        </div>
      </div>
    </div>
  );
}
