import { SmallSpark } from "./SparkleDecor.jsx";

export default function MessageBubble({ role, text, pending }) {
  const isUser = role === "user";
  return (
    <div className={`flex w-full animate-fade-up ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[75%] items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <div className="mb-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink/25 text-ink/60">
            <SmallSpark size={9} />
          </div>
        )}
        <div
          className={[
            "rounded-bubble px-4 py-2.5 text-[14.5px] leading-relaxed shadow-hairline",
            isUser ? "bg-blush/70 text-ink border border-blush-line/50" : "bg-white text-ink border border-ink/15",
            pending ? "opacity-60" : "",
          ].join(" ")}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
