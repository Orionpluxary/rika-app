import { useState } from "react";
import { Sparkle } from "./SparkleDecor.jsx";

export default function Composer({ onSend, disabled }) {
  const [value, setValue] = useState("");

  function submit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  }

  return (
    <form onSubmit={submit} className="relative border-t border-ink/12 bg-white/90 px-5 py-4 backdrop-blur">
      <div className="hairline-rule absolute -top-px left-0 right-0 text-ink/20" />
      <div className="mx-auto flex max-w-2xl items-end gap-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "waiting on a confirmation…" : "ask rika anything…"}
          disabled={disabled}
          rows={1}
          className="min-h-11 flex-1 resize-none rounded-2xl border border-ink/20 bg-white px-4 py-2.5 text-[14.5px] leading-6 text-ink placeholder:text-muted focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-blush-line/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/25 text-ink transition hover:bg-blush/50 disabled:opacity-30"
          aria-label="Send"
        >
          <Sparkle size={16} />
        </button>
      </div>
    </form>
  );
}
