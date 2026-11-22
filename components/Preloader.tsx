"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { lenisRef } from "@/lib/lenis";

const NAME = "YOUSEF ALKADY";

/** Intro on the first load of the home page: the studio still with the name rising letter by letter and a 0-100 count,
 *  held until the hero clip can play (at most ~4 s), then the cover wipes up onto the same studio frame. */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current!;
    let seen = false;
    try { seen = !!sessionStorage.getItem("intro-seen"); } catch {}
    if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches) { setGone(true); return; }
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";
    const q = gsap.utils.selector(el);
    const n = { v: 0 };
    const intro = gsap.timeline()
      .fromTo(q(".pl-img"), { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.4, ease: "power2.out" }, 0)
      .fromTo(q(".pl-name i"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.045, ease: "power3.out" }, 0.25)
      .to(n, { v: 90, duration: 1.8, ease: "power1.out", onUpdate: () => { if (count.current) count.current.textContent = String(Math.round(n.v)); } }, 0);

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try { sessionStorage.setItem("intro-seen", "1"); } catch {}
      gsap.timeline({ delay: Math.max(0, 1.6 - intro.time()) })
        .to(n, { v: 100, duration: 0.3, onUpdate: () => { if (count.current) count.current.textContent = String(Math.round(n.v)); } })
        .to(q(".pl-name i"), { yPercent: -110, duration: 0.5, stagger: 0.02, ease: "power2.in" }, "+=0.1")
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "power4.inOut" }, "-=0.2")
        .add(() => { document.documentElement.style.overflow = ""; lenisRef.current?.start(); setGone(true); });
    };
    const hero = document.querySelector<HTMLVideoElement>(".media-1");
    if (!hero || hero.readyState >= 3) finish();
    else hero.addEventListener("canplay", finish, { once: true });
    const cap = setTimeout(finish, 4000); // slow connection: never hold the site longer than this
    return () => { clearTimeout(cap); hero?.removeEventListener("canplay", finish); document.documentElement.style.overflow = ""; lenisRef.current?.start(); };
  }, []);

  // rendered by the page outside <main>, so it is in the first paint and sits above the nav
  if (gone) return null;
  return (
    <div ref={root} className="pl" aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" srcSet="/media/h1-m.webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pl-img" src="/media/h1.webp" alt="" />
      </picture>
      <p className="disp pl-name">{NAME.split(" ").map((w) => <span key={w} className="pl-word">{w.split("").map((c, i) => <span key={i} className="mask"><i>{c}</i></span>)}</span>)}</p>
      <p className="mono pl-count"><span ref={count}>0</span></p>
    </div>
  );
}
