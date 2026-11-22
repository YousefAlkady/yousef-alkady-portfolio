"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LATER } from "@/lib/scenes";
import { scroll } from "@/lib/scrollStore";
import { lenisRef } from "@/lib/lenis";
import ClipScrub from "./ClipScrub";
import Hub from "./Hub";
import Contact from "./Contact";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// one stable progress getter per clip beat
const clipProgress = Object.fromEntries(
  LATER.filter((b) => "clip" in b).map((b) => [b.id, () => scroll.clips[b.id] ?? 0]),
);

export default function LaterBeats() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      // clip beats: fixed frames that dissolve in over the previous scene while their clip already plays,
      // with a light flash where the place changes; the previous frame is hidden once covered
      const clips = LATER.filter((b) => "clip" in b);
      const flash = document.querySelector<HTMLElement>(".flash");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const phone = window.matchMedia("(max-width: 767px)").matches;
      const dip = document.querySelector<HTMLElement>(".dip");
      const blur = (k: number) => (reduced || phone || k <= 0 ? "" : `blur(${(6 * k).toFixed(2)}px)`);
      clips.forEach((b, i) => {
        ScrollTrigger.create({
          trigger: `#${b.id}`,
          start: "top bottom",
          end: b.clipEnd,
          onEnter: () => { if (b.id === "beat-4c") scroll.near = 1; },
          onUpdate: (self) => { scroll.clips[b.id] = self.progress; },
        });
        const frame = document.querySelector<HTMLElement>(`#${b.id} .clip-frame`);
        const prev = i > 0 ? document.querySelector<HTMLElement>(`#${clips[i - 1].id} .clip-frame`) : null;
        if ("join" in b && frame && prev && dip) {
          // H4b -> H5: push in on H4b and darken to black, then H5 settles up out of black,
          // so two scenes are never on screen at once. Reduced motion: plain dip. Phone: no blur.
          const set = (p: number) => {
            const out = Math.min(1, p / 0.375), inn = Math.max(0, (p - 0.45) / 0.55), on = p >= 0.4;
            prev.style.visibility = on ? "hidden" : "visible";
            frame.style.opacity = on ? "1" : "0";
            prev.style.transform = reduced ? "" : `scale(${1 + 0.15 * out})`;
            prev.style.filter = blur(out);
            frame.style.transform = reduced ? "" : `scale(${1.08 - 0.08 * inn})`;
            frame.style.filter = blur(1 - inn);
            dip.style.opacity = String(on ? 1 - inn : out);
          };
          ScrollTrigger.create({ trigger: `#${b.id}`, start: "top 115%", end: "top 75%", onUpdate: (self) => set(self.progress), onLeave: () => set(1), onLeaveBack: () => set(0) });
          return;
        }
        ScrollTrigger.create({
          trigger: `#${b.id}`,
          start: "top bottom",
          end: "top 70%",
          onUpdate: (self) => {
            const p = self.progress;
            if (frame) frame.style.opacity = String(p);
            if (prev) prev.style.visibility = p >= 1 ? "hidden" : "visible";
            if (flash && i > 0) flash.style.opacity = String(Math.sin(Math.PI * p) * 0.55);
          },
          onLeave: () => { if (frame) frame.style.opacity = "1"; if (prev) prev.style.visibility = "hidden"; if (flash) flash.style.opacity = "0"; },
          onLeaveBack: () => { if (frame) frame.style.opacity = "0"; if (prev) prev.style.visibility = "visible"; if (flash) flash.style.opacity = "0"; },
        });
      });

      // drive-off -> space: the street pushes in and sinks to black, the galaxy rises out of it (no tunnel)
      const last = document.querySelector<HTMLElement>(`#${clips[clips.length - 1].id} .clip-frame`);
      if (last && dip) {
        const set = (p: number) => {
          const out = Math.min(1, p / 0.45), inn = Math.max(0, (p - 0.5) / 0.5), gone = p >= 0.47;
          last.style.visibility = gone ? "hidden" : "visible";
          last.style.transform = reduced ? "" : `scale(${1 + 0.12 * out})`;
          last.style.filter = blur(out);
          dip.style.opacity = String(gone ? 1 - inn : out);
        };
        ScrollTrigger.create({ trigger: "#hub", start: "top bottom", end: "top 30%", onUpdate: (self) => set(self.progress), onLeave: () => set(1), onLeaveBack: () => set(0) });
      }

      // nav + cursor tone: dark ink over the grey studio, bone from the night street on
      const tone = (t: string) => () => { document.documentElement.dataset.tone = t; };
      ScrollTrigger.create(reduced
        ? { trigger: ".frame", start: "bottom top+=60", onEnter: tone("dark"), onLeaveBack: tone("light") }
        : { trigger: "#beat-4", start: "32% bottom", onEnter: tone("dark"), onLeaveBack: tone("light") });

      // scene copy: fixed blocks that fade in beside him and out again, tied to scroll
      const show = (sel: string, trigger: string, start: string, endTrigger: string, end: string) => {
        const el = root.current?.querySelector<HTMLElement>(sel);
        if (!el) return;
        const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger, start, endTrigger, end, scrub: true } });
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, 0);
        if (!reduced) {
          tl.fromTo(el.querySelectorAll(".ln"), { yPercent: 105 }, { yPercent: 0, duration: 0.2, stagger: 0.06, ease: "power3.out" }, 0);
          tl.fromTo(el.querySelectorAll(".after"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.15, stagger: 0.05 }, 0.12);
        }
        tl.to(el, { autoAlpha: 0, duration: 0.12 }, 0.88);
      };
      show("#c-arrive", "#beat-4", "45% bottom", "#beat-4b", "top 40%");
      show("#c-work", "#beat-4", "82% bottom", "#beat-4c", "top 75%");
      show("#c-dest", "#beat-4c", "50% bottom", "#hub", "top 82%");

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // reveal runs while beat 4 scrolls through and is complete when H4 starts dissolving in
        ScrollTrigger.create({
          trigger: "#beat-4",
          start: "top bottom",
          end: "bottom bottom",
          onUpdate: (self) => { scroll.reveal = self.progress; scroll.invalidate(); },
          onLeaveBack: () => { scroll.reveal = 0; scroll.invalidate(); },
        });
      });
      // reduced motion: no scrubbed reveal, so the street scene is simply shown finished, in colour
      if (reduced) { scroll.reveal = 1; scroll.invalidate(); }
      // galaxy hub: shown in every motion mode
      ScrollTrigger.create({
        trigger: "#hub",
        start: "top bottom",
        end: "top top",
        onUpdate: (self) => { scroll.hub = self.progress; scroll.invalidate(); },
        onLeaveBack: () => { scroll.hub = 0; scroll.invalidate(); },
      });
      // planet buttons and the cursor ripple stay live while the galaxy is on screen, i.e. until contact comes up
      ScrollTrigger.create({
        trigger: "#hub", start: "top 60%", endTrigger: "#contact", end: "top bottom", // hide before contact's heading reaches the bottom bar
        toggleClass: { targets: ".hub-ui", className: "is-on" },
        onToggle: (self) => { if (self.isActive) document.documentElement.dataset.ripple = "1"; else delete document.documentElement.dataset.ripple; },
      });
      ScrollTrigger.create({ trigger: "#contact", start: "top 80%", end: "bottom top", toggleClass: "is-in" }); // weight sweep only while on screen
      // back from a planet page (/#hub, /#contact): the browser jumps before the pin spacers exist and lands short;
      // land on the target once every trigger is in place
      const hash = location.hash.slice(1);
      if (hash === "hub" || hash === "contact") requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const el = document.getElementById(hash);
        if (!el) return;
        lenisRef.current?.resize(); // Lenis still has the planet page's (short) scroll limit
        window.scrollTo(0, el.getBoundingClientRect().top + scrollY);
      });
      return () => { mm.revert(); delete document.documentElement.dataset.ripple; };
    },
    { scope: root },
  );
  return (
    <div ref={root}>
      <div className="flash" aria-hidden="true" />
      <div className="dip" aria-hidden="true" />

      <div className="scene-copy" id="c-arrive">
        <p className="k">03 / Experience</p>
        <h2 className="disp head" aria-label="Every project starts in the dark.">
          {["Every project", "starts", "in the dark."].map((l, i) => (
            <span key={l} className="mask" aria-hidden="true"><span className={`ln${i === 2 ? " thin" : ""}`}>{l}</span></span>
          ))}
        </h2>
      </div>
      <div className="scene-copy" id="c-work">
        <p className="k after">Banking. Security. Startups.</p>
        <ul className="chips">
          <li className="chip after"><b>AAIB</b> information technology intern</li>
          <li className="chip after"><b>CIB</b> artificial intelligence intern</li>
          <li className="chip after"><b>Codeyssey</b> partnerships lead</li>
        </ul>
      </div>
      <div className="scene-copy" id="c-dest">
        <p className="k">04 / Choose a destination</p>
        <h2 className="disp head" aria-label="Ready?"><span className="mask" aria-hidden="true"><span className="ln">Ready?</span></span></h2>
      </div>

      {LATER.map((b) =>
        b.id === "hub" ? (
          <Hub key={b.id} />
        ) : b.id === "contact" ? (
          <Contact key={b.id} />
        ) : "clip" in b ? (
          <section key={b.id} id={b.id} className="clip-beat" style={{ height: `${b.vh}vh` }} aria-label={b.label}>
            <div className="clip-frame">
              <ClipScrub className="clip" name={b.clip} progress={clipProgress[b.id]} />
              <p className="sr-only">{b.label}</p>
            </div>
          </section>
        ) : (
          // scene spacer: the canvas carries this beat, nothing scrolls over it
          <section key={b.id} id={b.id} className="spacer" style={{ minHeight: `${b.vh}vh` }} aria-label={b.label} />
        ),
      )}
    </div>
  );
}
