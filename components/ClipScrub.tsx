"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { primeVideo } from "@/lib/primeVideo";

type Props = {
  name: string; // /media/<name>.mp4 (desktop 16:9) or <name>-m.mp4 (phone 9:16), poster <name>.webp
  progress: () => number; // 0..1, read every tick
  className?: string;
  eager?: boolean; // load with the page (the hero clip); others wait for the first scroll
};

/** Scrubs a video's currentTime from scroll. If the file fails, the poster stays up. */
export default function ClipScrub({ name, progress, className, eager }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  // chosen after mount so SSR markup matches; the element itself never changes (GSAP targets it)
  const [base, setBase] = useState<string>();

  useEffect(() => {
    setBase(`/media/${name}${window.matchMedia("(max-width: 767px)").matches ? "-m" : ""}`);
  }, [name]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !base) return;
    const load = () => primeVideo(v);
    if (eager || scrollY > 0 || location.hash) return load();
    window.addEventListener("scroll", load, { once: true, passive: true });
    return () => window.removeEventListener("scroll", load);
  }, [eager, base]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !base) return;
    const tick = () => {
      if (!v.duration || isNaN(v.duration)) return;
      const t = Math.min(1, Math.max(0, progress())) * (v.duration - 0.05);
      if (Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [base, progress]);

  return (
    <video
      ref={ref}
      className={className}
      src={base && `${base}.mp4`}
      poster={base && `${base}.webp`}
      muted
      playsInline
      preload={eager ? "auto" : "none"}
    />
  );
}
