"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lenisRef } from "@/lib/lenis";
import { scroll } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

const LABEL: Record<string, string> = { "/": "Home", "/projects": "Work", "/experience": "Experience", "/education": "Education", "/music": "Music" };
const HASH_LABEL: Record<string, string> = { contact: "Contact", hub: "Galaxy" };
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Site-wide motion:
 *  1. Controlled parallax: any element with data-parallax="0.15" drifts against the scroll (positive = slower than the page).
 *  2. Page transitions: internal links close a curtain (with the destination's name), the route changes, the curtain lifts.
 *     Links inside [data-no-pt] (the galaxy planets, which fly in on their own) are left alone.
 *     Links to the page you are already on (YA on home, Contact on home) also close the curtain, jump while it is shut,
 *     then lift it: a plain jump left Lenis gliding against it and the scrubbed scenes visibly rewinding. */
export default function Motion() {
  const pathname = usePathname();
  const router = useRouter();
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const covering = useRef(false);

  // 1. parallax, rebuilt for every page
  useEffect(() => {
    if (reduced()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        if (el.closest(".xp")) return; // inside the pinned experience strip a long pin would pull the lines apart; the strip has its own parallax
        const s = parseFloat(el.dataset.parallax || "0.15");
        gsap.fromTo(el, { y: () => s * window.innerHeight * 0.5 }, {
          y: () => -s * window.innerHeight * 0.5, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
      });
    });
    const id = setTimeout(() => ScrollTrigger.refresh(), 300); // after page GSAP (pins) has set up
    return () => { clearTimeout(id); ctx.revert(); };
  }, [pathname]);

  const lift = () => {
    if (!covering.current || !curtain.current) return;
    covering.current = false;
    gsap.timeline()
      .to(label.current, { yPercent: -110, opacity: 0, duration: 0.35, ease: "power2.in" }, 0.15)
      .to(curtain.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "power4.inOut" }, 0.2)
      .set(curtain.current, { visibility: "hidden" });
  };

  // 2a. new page: back to the top (unless a #hash is the target), then lift the curtain
  useEffect(() => {
    const lenis = lenisRef.current;
    lenis?.resize(); // still has the previous page's length until its observer fires
    if (!location.hash) lenis?.scrollTo(0, { immediate: true, force: true }); // immediate also kills leftover glide
    lift();
  }, [pathname]);

  // 2b. intercept internal links before next/link handles them (capture phase)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduced()) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.closest("[data-no-pt]")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return; // external
      const here = url.pathname === location.pathname;
      const id = decodeURIComponent(url.hash.slice(1));
      if (here && id && !document.getElementById(id)) return; // unknown anchor: let the browser try
      if (here && id) window.dispatchEvent(new Event("stage:warm")); // start the 3D stage and clips while the curtain closes
      e.preventDefault();
      e.stopPropagation();
      if (covering.current) return;
      covering.current = true;
      const c = curtain.current!, l = label.current!;
      l.textContent = (here && HASH_LABEL[id]) || LABEL[url.pathname] || "";
      gsap.timeline({ onComplete: () => (here ? jump(url, id) : router.push(url.pathname + url.search + url.hash)) })
        .set(c, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" })
        .set(l, { yPercent: 110, opacity: 1 })
        .to(c, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power4.inOut" })
        .to(l, { yPercent: 0, duration: 0.45, ease: "power3.out" }, 0.3);
    };
    // same page, curtain shut: land on the target in one step, settle every scrubbed scene there, then lift
    const jump = (url: URL, id: string) => {
      const el = id ? document.getElementById(id) : null;
      const y = el ? el.getBoundingClientRect().top + scrollY : 0;
      document.querySelector(".nav-menu")?.removeAttribute("open"); // the phone menu only closes itself on a route change
      const lenis = lenisRef.current;
      lenis?.resize();
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
      ScrollTrigger.update();
      ScrollTrigger.getAll().forEach((t) => t.getTween()?.progress(1)); // no catch-up tweens left playing under the curtain
      scroll.invalidate();
      const to = url.pathname + url.search + url.hash;
      if (to !== location.pathname + location.search + location.hash) history.replaceState(history.state, "", to);
      gsap.delayedCall(0.15, lift); // a beat for the clips to seek to their new frame
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <div ref={curtain} className="pt-curtain" aria-hidden="true">
      <span className="mask"><span ref={label} className="disp pt-label" /></span>
    </div>
  );
}
