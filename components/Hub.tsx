"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PLANET_ROUTE } from "@/lib/content";
import { PLANETS, galaxy } from "@/lib/galaxy";
import { scroll } from "@/lib/scrollStore";

const fullName = (i: number) => {
  const p = PLANETS[i];
  return p.label ? `${p.name}: ${p.label}` : p.name;
};

/** Act 3 hub UI. The planets are drawn in the shared Canvas; these buttons sit on top of them. */
export default function Hub() {
  const [focus, setFocus] = useState(-1);
  const [list, setList] = useState(false);

  const router = useRouter();
  const [diving, setDiving] = useState(false);
  const diveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const go = (i: number) => {
    galaxy.focus = i;
    setFocus(i);
    scroll.invalidate();
  };
  // click a planet: fly into it, fade to black, then open its page (a real link, so Enter, back and sharing work)
  const open = (e: React.MouseEvent, i: number) => {
    const href = PLANET_ROUTE[PLANETS[i].id];
    if (!href || e.metaKey || e.ctrlKey || e.shiftKey) return; // let the browser open new tabs as usual
    e.preventDefault();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
    if (galaxy.dive) return; // already diving: ignore a second tap
    galaxy.dive = true;
    go(i);
    setDiving(true);
    diveTimer.current = setTimeout(() => router.push(href), 1100);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setList(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && galaxy.focus >= 0) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(diveTimer.current);
      galaxy.focus = -1;
      galaxy.dive = false;
    };
  }, []);

  return (
    <section id="hub" className="hub" aria-label="Galaxy hub">
      <h2 className="sr-only">Choose a destination</h2>
      <div className="hub-ui" data-no-pt>
        <p className="k hub-kicker" aria-hidden="true">04 / Choose a destination</p>
        {PLANETS.map((p, i) => (
          <a
            key={p.id}
            ref={(el) => {
              galaxy.els[i] = el;
            }}
            className="planet-btn"
            href={PLANET_ROUTE[p.id]}
            aria-label={`${fullName(i)}: open page`}
            onClick={(e) => open(e, i)}
            data-cursor="land here"
          >
            <span className={`pname${p.orbit ? " tag" : ""}`} aria-hidden="true">
              <b>{p.name}</b>
              {p.label && <span>{p.label}</span>}
            </span>
          </a>
        ))}

        <div className="hub-bar">
          {focus >= 0 && (
            <button className="btn" onClick={() => go(-1)}>
              Back
            </button>
          )}
          <button className="btn" aria-expanded={list} aria-controls="hub-list" onClick={() => setList((v) => !v)}>
            List view ☰
          </button>
        </div>
        <p className="k hub-hint" aria-hidden="true">Click a planet</p>

        <div className={`dive-fade${diving ? " is-on" : ""}`} aria-hidden="true" />
        {list && (
          <ul id="hub-list" className="hub-list">
            {PLANETS.map((p, i) => (
              <li key={p.id}>
                <a className="btn" href={PLANET_ROUTE[p.id]} onClick={(e) => open(e, i)}>
                  {fullName(i)}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
