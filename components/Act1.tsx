"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ClipScrub from "./ClipScrub";
import { ACT1_START as S, ACT1_TOTAL } from "@/lib/scenes";
import { scroll } from "@/lib/scrollStore";

// H1 scrubs the stand beat; H2 scrubs the device beat (Act 1 units)
const H1_CLIP = true; // h1.mp4 / h1-m.mp4 = H1b (Kling 4.0, watermark removed); old clips kept as h1-v1.mp4 / h1-m-v1.mp4
const h1Progress = () => (scroll.act1 - S.stand) / (S.device - S.stand);
// H2 reaches its last frame 14 units before the end, so it can dissolve into the identical canvas plate
const h2Progress = () => (scroll.act1 - S.device) / (ACT1_TOTAL - 14 - S.device);

gsap.registerPlugin(ScrollTrigger, useGSAP);

const NAME = "YOUSEF ALKADY";

// headline revealed line by line: each line slides up inside its own mask
const Lines = ({ lines, thin }: { lines: string[]; thin?: number }) => (
  <>
    <span className="sr-only">{lines.join(" ")}</span>
    {lines.map((l, i) => (
      <span key={l} className="mask" aria-hidden="true">
        <span className={`ln${thin !== undefined && i >= thin ? " thin" : ""}`}>{l}</span>
      </span>
    ))}
  </>
);

export default function Act1() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const html = document.documentElement;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const phone = window.matchMedia("(max-width: 767px)").matches;
      // nav + cursor are dark over the grey studio; LaterBeats flips them once the night street has taken over
      html.dataset.tone = "light";

      // cursor repel: the tagline's words slide away from the pointer and settle back
      const words = q<HTMLElement>(".repel i");
      const movers = words.map((w) => ({
        w,
        x: gsap.quickTo(w, "x", { duration: 0.6, ease: "power3" }),
        y: gsap.quickTo(w, "y", { duration: 0.6, ease: "power3" }),
        r: gsap.quickTo(w, "rotation", { duration: 0.6, ease: "power3" }),
      }));
      const repel = (e: PointerEvent) => {
        if (reduced || scroll.act1 > 90) return;
        movers.forEach(({ w, x, y, r }) => {
          const b = w.getBoundingClientRect();
          // rest position = current box minus its current offset
          const cx = b.left + b.width / 2 - (gsap.getProperty(w, "x") as number), cy = b.top + b.height / 2 - (gsap.getProperty(w, "y") as number);
          const dx = cx - e.clientX, dy = cy - e.clientY, d = Math.hypot(dx, dy), R = 150;
          const f = d < R ? (1 - d / R) ** 2 * 70 : 0;
          x(d ? (dx / d) * f : 0); y(d ? (dy / d) * f : 0); r(d ? (dx / d) * f * 0.2 : 0);
        });
      };
      window.addEventListener("pointermove", repel, { passive: true });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const L = (id: string) => `[data-l="${id}"]`;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${ACT1_TOTAL}%`,
            pin: true,
            scrub: true, // Lenis already smooths; a scrub delay here put the text up to 1 s behind the clips
            onUpdate: (self) => {
              scroll.act1 = self.progress * ACT1_TOTAL;
              root.current?.classList.toggle("is-past", scroll.act1 > 95); // stops the name's weight sweep off screen
              if (scroll.act1 > ACT1_TOTAL - 20) scroll.invalidate(); // canvas plate takes over at the end
            },
          },
        });
        // timeline length = ACT1_TOTAL units (1 unit = 1vh of scroll)
        tl.to({}, { duration: 0 }, ACT1_TOTAL);
        const fadeIn = (sel: string, at: number, d = 10) => tl.fromTo(q(sel), { opacity: 0 }, { opacity: 1, duration: d }, at);
        const fadeOut = (sel: string, at: number, d = 10) => tl.to(q(sel), { opacity: 0, duration: d }, at);
        // staggered scroll: lines rise out of their masks, then the small print fades in
        const lines = (id: string, at: number) => {
          fadeIn(L(id), at, 4);
          tl.fromTo(q(`${L(id)} .ln`), { yPercent: 105 }, { yPercent: 0, duration: 14, stagger: 5, ease: "power3.out" }, at);
          tl.fromTo(q(`${L(id)} .after`), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 12, stagger: 5, ease: "power2.out" }, at + 14);
        };

        gsap.set(q(".copy, .media-2, .msg, .msg-dots, .msg-bub, .msg-del"), { opacity: 0 });

        // Beat 0: name + tagline over the seated frame, 0-100
        tl.to(q(".name span"), { yPercent: -120, opacity: 0, duration: 22, stagger: 1.4, ease: "power2.in" }, 52);
        fadeOut(".hero-meta", 40, 20);
        fadeOut(".shade", 60, 30);

        // Beat 1: he stands up (media 1 scrubs the whole range), 100-300. Controlled parallax: a small push-in on him,
        // the copy drifts the other way.
        tl.fromTo(q(".media-1"), { scale: 1 }, { scale: 1.035, duration: S.device, ease: "none" }, 0);
        lines("origin", S.stand + 6);
        if (!phone) tl.fromTo(q(L("origin")), { y: 24 }, { y: -24, duration: 190 }, S.stand + 6);
        fadeOut(L("origin"), S.device - 24, 12);

        // Beat 2: he looks at the device; the message arrives, then the builder copy, 300-450
        tl.set(q(".media-2"), { opacity: 1 }, S.device);
        tl.set(q(".media-1"), { opacity: 0 }, S.device);
        fadeIn(".msg", S.device + 22, 4);
        fadeIn(".msg-dots", S.device + 24, 5);
        fadeOut(".msg-dots", S.device + 42, 3);
        tl.fromTo(q(".msg-bub"), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 7, ease: "back.out(2)" }, S.device + 44);
        fadeIn(".msg-del", S.device + 56, 5);
        lines("builder", S.device + 8);
        const chip = { n: 0 };
        tl.to(chip, {
          n: 500, duration: 30, ease: "power2.out",
          onUpdate: () => { const e = q(".count")[0]; if (e) e.textContent = `${Math.round(chip.n)}+`; },
        }, S.device + 26);
        // hand-off to the street: text and bubble fade, then the video dissolves into the identical canvas plate
        fadeOut(`${L("builder")}, .msg`, ACT1_TOTAL - 28, 10);
        fadeOut(".frame", ACT1_TOTAL - 11, 9);
      });
      return () => { mm.revert(); window.removeEventListener("pointermove", repel); delete html.dataset.tone; };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="act1" id="act1" aria-label="Introduction">
      <div className="frame">
        <div className="pad" />
        {/* until the new H1b clip (sits up from the K1c still) is in, hold the K1c still: the old h1 clip is off-centre and softer */}
        {H1_CLIP ? <ClipScrub className="media media-1" name="h1" progress={h1Progress} eager /> : <div className="media media-1" aria-hidden="true" />}
        <ClipScrub className="media media-2" name="h2" progress={h2Progress} />
        <div className="shade" />
        {/* incoming message, beside his head: plain system-style bubble */}
        <div className="msg" aria-hidden="true">
          <span className="msg-from">OMEGA Link</span>
          <span className="msg-dots"><i /><i /><i /></span>
          <span className="msg-bub">Your car has arrived</span>
          <span className="msg-del">Delivered</span>
        </div>
      </div>

      <h1 className="name disp" aria-label={NAME}>
        {NAME.split("").map((c, i) => (c === " " ? <b key={i} className="sp" aria-hidden="true" /> : <span key={i} aria-hidden="true" style={{ ["--i" as string]: i }}>{c}</span>))}
      </h1>
      <div className="hero-meta">
        <div>
          <p className="k">Cairo, Egypt</p>
          <p className="tagline repel">
            <span className="sr-only">builds and runs live software.</span>
            {"builds and runs live software.".split(" ").map((w) => <i key={w} aria-hidden="true">{w}</i>)}
          </p>
        </div>
        {/* a real #hub link: Motion closes the curtain, jumps there while it is shut and lifts it (flying through the whole
            film in 1.6 s made every clip seek at once and stuttered on phones) */}
        <a className="k skip" href="#hub" data-magnetic data-cursor="fast forward">Skip to the galaxy ↓</a>
      </div>

      <div className="copy" data-l="origin">
        <p className="k">01 / Origin</p>
        <h2 className="disp head"><Lines lines={["Computer", "science,", "by obsession."]} thin={2} /></h2>
        <p className="low after">bsc computer science, msa university. expected 2028.</p>
      </div>

      <div className="copy" data-l="builder">
        <p className="k">02 / Builder</p>
        <h2 className="disp head"><Lines lines={["I ship things", "people use."]} thin={1} /></h2>
        <div className="cols">
          <div className="after">
            <p className="k">UniLink</p>
            <p className="low">executive lead developer of unilink campus, a campus social network.</p>
            <p className="chip"><b className="count">500+</b> verified students</p>
          </div>
          <div className="after">
            <p className="k">Omega Link // off-grid</p>
            <p className="low">made by hand. works with no signal. my lora mesh device relays text and images between esp32 nodes with no internet.</p>
            <p className="chip">ieee-style paper: manuscript complete</p>
          </div>
        </div>
      </div>
      <p className="sr-only">Message from OMEGA Link: Your car has arrived.</p>
    </section>
  );
}
