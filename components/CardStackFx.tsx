"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Card stacking animation on the Work page: the cards are sticky (CSS); as the next card slides up over one,
 *  the one underneath sinks back (scales down, tilts away, darkens), so each new card feels revealed on top. */
export default function CardStackFx() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    // every screen size: on phones the cards are long single columns, and fit() lets each one scroll fully before the next covers it
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".stack .card");
      // a card taller than the window sticks only once its bottom is on screen, so it can be read in full before the next covers it
      const fit = () => cards.forEach((c) => {
        c.style.top = "";
        const base = parseFloat(getComputedStyle(c).top);
        c.style.top = `${Math.min(base, window.innerHeight - c.offsetHeight - 12)}px`;
      });
      fit();
      ScrollTrigger.addEventListener("refreshInit", fit);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const depth = cards.length - 1 - i; // earlier cards end up further back
        gsap.fromTo(card, { scale: 1, rotateX: 0, "--stack-dim": 0 }, {
          scale: 1 - Math.min(0.1, 0.035 * depth), rotateX: 4, "--stack-dim": 0.55, ease: "none",
          transformOrigin: "50% 0%", transformPerspective: 1400,
          scrollTrigger: { trigger: next, start: "top bottom", end: () => `top ${parseFloat(getComputedStyle(next).top)}px`, scrub: true, invalidateOnRefresh: true },
        });
      });
      // the newest card rises in with a slight lift
      cards.slice(1).forEach((card) => {
        gsap.fromTo(card, { y: 80 }, { y: 0, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "top 40%", scrub: true } });
      });
      return () => { ScrollTrigger.removeEventListener("refreshInit", fit); cards.forEach((c) => { c.style.top = ""; }); };
    });
    return () => mm.revert();
  });
  return null;
}
