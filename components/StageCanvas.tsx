"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const RevealStage = dynamic(() => import("./RevealStage"), { ssr: false });

// The 3D stage is first needed 4.5 screens down, so it loads on the first scroll/key/touch instead of at page load
// (keeps the hero fast). Arriving on /#hub or /#contact, or already scrolled, it loads at once.
// The wrapper keeps a stable parent: GSAP moves the pinned Act 1 into a spacer, so React must not insert next to it.
export default function StageCanvas() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (location.hash || scrollY > 0) return setOn(true);
    const go = () => setOn(true);
    const ev = ["scroll", "wheel", "touchstart", "keydown", "pointerdown"] as const;
    ev.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    return () => ev.forEach((e) => window.removeEventListener(e, go));
  }, []);
  return <div>{on && <RevealStage />}</div>;
}
