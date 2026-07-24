// Hand-drawn-style, thin-line "kirakira" sparkle marks — the one recurring
// signature motif of the interface. Rendered as pure ink linework (no fill)
// so the whole app stays white-with-black-lines, per the brief.

export function Sparkle({ className = "", size = 18, animate = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`${className} ${animate ? "animate-twinkle" : ""}`}
      fill="none"
    >
      <path
        d="M12 2 C12.8 8 14.5 9.5 21 11 C14.5 12 12.8 14 12 20 C11.2 14 9.5 12 3 11 C9.5 9.5 11.2 8 12 2 Z"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SmallSpark({ className = "", size = 9 }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} className={className} fill="none">
      <path d="M6 0.5 L7 5 L11.5 6 L7 7 L6 11.5 L5 7 L0.5 6 L5 5 Z" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

/** Delicate trailing vine used along panel edges. */
export function VineRule({ className = "" }) {
  return (
    <svg viewBox="0 0 240 16" className={className} preserveAspectRatio="none" fill="none">
      <path
        d="M0 8 C 30 2, 40 14, 70 8 S 110 2, 140 8 S 180 14, 210 8 S 230 2, 240 8"
        stroke="currentColor"
        strokeWidth="0.75"
        fill="none"
      />
      <circle cx="70" cy="8" r="1.4" fill="currentColor" />
      <circle cx="140" cy="8" r="1.4" fill="currentColor" />
      <circle cx="210" cy="8" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Corner flourish used on panels and the modal. */
export function CornerFlourish({ className = "", flip = false }) {
  return (
    <svg
      viewBox="0 0 60 60"
      width={40}
      height={40}
      className={`${className} ${flip ? "scale-x-[-1] scale-y-[-1]" : ""}`}
      fill="none"
    >
      <path d="M2 40 C 2 16, 16 2, 40 2" stroke="currentColor" strokeWidth="0.8" />
      <path d="M2 28 C 2 13, 13 2, 28 2" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
      <SmallSparkPath x={38} y={6} />
    </svg>
  );
}

function SmallSparkPath({ x, y }) {
  return (
    <path
      d={`M${x} ${y - 3} L${x + 1} ${y} L${x + 4} ${y + 1} L${x + 1} ${y + 2} L${x} ${y + 5} L${x - 1} ${y + 2} L${x - 4} ${y + 1} L${x - 1} ${y} Z`}
      stroke="currentColor"
      strokeWidth="0.6"
      strokeLinejoin="round"
    />
  );
}
