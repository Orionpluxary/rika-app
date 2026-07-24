import { SmallSpark } from "./SparkleDecor.jsx";

/**
 * Reserved logo space. Deliberately empty — drop an <img> or inline SVG in
 * here (see the comment below) once you have a mark for Rika.
 */
export default function LogoFrame() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-ink/25">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-ink/20 text-[9px] uppercase tracking-[0.2em] text-muted">
        {/* ---- Place your logo here, e.g.: --------------------------
              <img src="/logo.svg" alt="Rika" className="h-8 w-8" />
           ------------------------------------------------------------ */}
        logo
      </div>
      <SmallSpark className="absolute -right-1 -top-1 text-ink/70" />
      <SmallSpark className="absolute -bottom-1 -left-1 text-ink/40" size={7} />
    </div>
  );
}
