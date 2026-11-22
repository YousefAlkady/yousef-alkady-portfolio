"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "./PlayerProvider";

/** Small bubble in the nav, on every page: the ring shows progress, a click opens play / pause / skip. */
export default function MiniPlayer() {
  const { beats, i, beat, playing, t, dur, go, toggle, seek } = usePlayer();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]); // close on page change; the music keeps playing

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);

  if (!beats?.length || !beat) return null;
  const p = `${dur ? (t / dur) * 100 : 0}%`;

  return (
    <div className={`mp${playing ? " is-playing" : ""}`} ref={box}>
      <button
        className="mp-bubble" style={{ ["--p" as string]: p }} onClick={() => setOpen((o) => !o)}
        aria-expanded={open} aria-label={`Music player${playing ? `, playing ${beat.title}` : ""}`}
        data-cursor={playing ? "what's this?" : "need a beat?"}
      >
        <span className="mp-core bp-bars" aria-hidden="true">{Array.from({ length: 4 }, (_, k) => <i key={k} style={{ ["--k" as string]: k }} />)}</span>
      </button>
      {open && (
        <div className="mp-pop" role="dialog" aria-label="Music player">
          <p className="k">Now playing · {String(i + 1).padStart(2, "0")} / {String(beats.length).padStart(2, "0")}</p>
          <p className="disp mp-title">{beat.title}</p>
          <input
            className="bp-seek mp-seek" type="range" min={0} max={dur || 0} step={0.1} value={t} aria-label="Seek"
            style={{ ["--p" as string]: p }} onChange={(e) => seek(+e.target.value)}
          />
          <div className="mp-row">
            <button className="bp-btn" onClick={() => go(i - 1)} aria-label="Previous beat" data-cursor="run it back">⏮</button>
            <button className="bp-btn bp-play" onClick={toggle} aria-label={playing ? "Pause" : "Play"} data-cursor={playing ? "hold up" : "press play"}>
              {playing ? "❚❚" : "▶"}
            </button>
            <button className="bp-btn" onClick={() => go(i + 1)} aria-label="Next beat" data-cursor="next one">⏭</button>
          </div>
          <Link className="mp-all mono" href="/music" onClick={() => setOpen(false)} data-cursor="the whole crate">All beats →</Link>
        </div>
      )}
    </div>
  );
}
