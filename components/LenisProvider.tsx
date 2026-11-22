"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lenisRef } from "@/lib/lenis";

gsap.registerPlugin(ScrollTrigger);
// Phones: the address bar showing/hiding resizes the window on every scroll direction change. Without this,
// each resize re-measured every pin and parallax and the page jumped in small steps while scrolling.
ScrollTrigger.config({ ignoreMobileResize: true });

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: false });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    // first in every frame, so the scrubbed clips and the 3D stage read this frame's scroll, not the last one
    gsap.ticker.add(tick, false, true);
    gsap.ticker.lagSmoothing(0);
    // pins add and remove spacer height on every refresh: give Lenis the new page length straight away,
    // otherwise it keeps the old limit (e.g. a short planet page's) and the scroll stops short or snaps
    const fit = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", fit);
    return () => {
      ScrollTrigger.removeEventListener("refresh", fit);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);
  return <>{children}</>;
}
