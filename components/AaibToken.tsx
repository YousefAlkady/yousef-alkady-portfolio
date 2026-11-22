"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// three.js loads only when the AAIB card comes near the screen, so /experience stays light at load
const Scene = dynamic(() => import("./AaibTokenScene"), { ssr: false });

/** Small floating token above the AAIB card's text: the AAIB head-office model (assets/3d/aaib_tower.glb ->
 *  /media/planets/aaib.glb) turning 360 and bobbing. It only animates while on screen. */
export default function AaibToken() {
  const el = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { setOnScreen(e.isIntersecting); if (e.isIntersecting) setNear(true); }, { rootMargin: "200px" });
    if (el.current) io.observe(el.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={el} className="xp-token" role="img" aria-label="AAIB head office, 3D model">
      {near && <Scene run={onScreen} />}
    </div>
  );
}
