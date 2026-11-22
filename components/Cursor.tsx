"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Custom cursor for fine pointers: a dot that swells slightly over [data-cursor="hint"] and shows the hint in a small pill beside it,
// pulls [data-magnetic] elements toward it, and leaves ripples while html[data-ripple] is set (the hub).
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el || !matchMedia("(pointer: fine)").matches) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const x = gsap.quickTo(el, "x", { duration: reduced ? 0 : 0.35, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: reduced ? 0 : 0.35, ease: "power3" });
    let mag: HTMLElement | null = null;
    let lastRipple = 0;
    const release = () => {
      if (mag) gsap.to(mag, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      mag = null;
    };
    const move = (e: PointerEvent) => {
      el.classList.add("is-on");
      x(e.clientX); y(e.clientY);
      const t = e.target as Element | null;
      const c = t?.closest?.<HTMLElement>("[data-cursor]");
      el.classList.toggle("is-label", !!c);
      if (c && label.current) label.current.textContent = c.dataset.cursor ?? "";
      if (reduced) return;
      const m = t?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (m !== mag) release();
      if (m) {
        mag = m;
        const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - (r.left + r.width / 2)) * 0.3, y: (e.clientY - (r.top + r.height / 2)) * 0.3, duration: 0.3, ease: "power3.out", overwrite: true });
      }
      if (document.documentElement.dataset.ripple && e.timeStamp - lastRipple > 140) {
        lastRipple = e.timeStamp;
        const r = document.createElement("i");
        r.className = "ripple";
        r.style.left = `${e.clientX}px`; r.style.top = `${e.clientY}px`;
        r.addEventListener("animationend", () => r.remove());
        document.body.appendChild(r);
      }
    };
    const leave = () => { el.classList.remove("is-on"); release(); };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => { window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, []);

  return (
    <div ref={dot} className="cursor" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
