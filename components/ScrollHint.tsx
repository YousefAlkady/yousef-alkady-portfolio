"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Phones only (CSS): a small pulsing line at the bottom that says "keep scrolling" whenever the page has more to play.
 *  Hidden while you scroll and at the end of the page; it comes back after a short pause. */
export default function ScrollHint() {
  const el = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout>;
    const atEnd = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 40;
    const show = () => el.current?.classList.toggle("is-on", !atEnd());
    const onScroll = () => { el.current?.classList.remove("is-on"); clearTimeout(idle); idle = setTimeout(show, 900); };
    idle = setTimeout(show, 1800);
    addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(idle); removeEventListener("scroll", onScroll); el.current?.classList.remove("is-on"); };
  }, [path]);

  return (
    <div ref={el} className="scroll-hint" aria-hidden="true">
      <span className="mono">scroll</span>
      <i />
    </div>
  );
}
