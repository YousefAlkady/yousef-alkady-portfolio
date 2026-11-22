"use client";
import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Entry } from "@/lib/content";
import AaibToken from "./AaibToken";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type StripItem = { label: string; img?: string; pos: string; word?: string; token?: "aaib"; entry: Entry };

/** Horizontal scroll strip. Wide screens with motion allowed: the section pins and vertical scroll moves the strip sideways.
 *  Phones and reduced motion: a plain sideways-scrolling row (touch, trackpad, arrow keys). */
export default function ExperienceStrip({ items, children }: { items: StripItem[]; children: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // light page: dark nav and cursor until the dark contact section comes up under them
      const html = document.documentElement, contact = document.getElementById("contact");
      html.dataset.tone = "light";
      // a thin band under the nav: dark tone while the contact section covers it
      const io = new IntersectionObserver(([e]) => { html.dataset.tone = e.isIntersecting ? "dark" : "light"; }, { rootMargin: "-40px 0px -92% 0px" });
      if (contact) io.observe(contact);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (min-height: 380px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!, el = root.current!;
        const dist = () => Math.max(0, t.scrollWidth - window.innerWidth);
        el.classList.add("is-pinned");
        // weight sweep marquee: each letter's weight rides a wave that travels with the scroll
        const letters = gsap.utils.toArray<HTMLElement>(".xp-mq i", el);
        const sweep = (p: number) => letters.forEach((l, i) => { l.style.fontWeight = String(Math.round(510 + 390 * Math.sin(p * Math.PI * 6 - i * 0.32))); });
        sweep(0);
        const strip = gsap.to(t, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: el, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: true, invalidateOnRefresh: true,
            onUpdate: (self) => { if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`; sweep(self.progress); },
          },
        });
        // controlled parallax: the marquee runs the other way at a third of the speed; photos drift inside their frames
        gsap.fromTo(el.querySelector(".xp-mq-row"), { xPercent: -30 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true } });
        gsap.utils.toArray<HTMLElement>(".xp-tile img, .xp-type", el).forEach((img) => {
          gsap.fromTo(img, { xPercent: -9 }, { xPercent: 9, ease: "none", scrollTrigger: { trigger: img.parentElement!, containerAnimation: strip, start: "left right", end: "right left", scrub: true } });
        });
        gsap.utils.toArray<HTMLElement>(".xp-word .disp", el).forEach((w) => {
          gsap.fromTo(w, { xPercent: 40 }, { xPercent: -40, ease: "none", scrollTrigger: { trigger: w.parentElement!, containerAnimation: strip, start: "left right", end: "right left", scrub: true } });
        });
        return () => el.classList.remove("is-pinned");
      });
      // phones / narrow windows: the strip is a vertical list, so animate it vertically:
      // photos drift inside their frames and each role's text rises in line by line
      mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
        const el = root.current!;
        gsap.utils.toArray<HTMLElement>(".xp-tile img", el).forEach((img) => {
          gsap.fromTo(img, { yPercent: -7, scale: 1.16 }, { yPercent: 7, scale: 1.16, ease: "none", scrollTrigger: { trigger: img.parentElement!, start: "top bottom", end: "bottom top", scrub: true } });
        });
        gsap.utils.toArray<HTMLElement>(".xp-text", el).forEach((txt) => {
          gsap.from(txt.children, { opacity: 0, y: 28, duration: 0.7, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: txt, start: "top 85%", once: true } });
        });
      });
      return () => { mm.revert(); io.disconnect(); delete html.dataset.tone; };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="xp">
      {children}
      <div className="xp-scroll" tabIndex={0} role="region" aria-label="Experience, scroll sideways">
        <div ref={track} className="xp-track">
          {items.map((it, i) => (
            <Fragment key={it.label}>
              <figure className={`xp-tile${it.img ? "" : " xp-tile-type"}`}>
                {it.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/media/${it.img}.webp`} alt="" width={1376} height={768} style={{ objectPosition: it.pos }} loading={i ? "lazy" : "eager"} />
                ) : (
                  <span className="disp xp-type" aria-hidden="true">{it.label}</span>
                )}
                <span className="mono xp-no">0{i + 1}</span>
                <figcaption><span className="disp">{it.label}</span></figcaption>
              </figure>
              <article className="xp-text">
                {it.token === "aaib" && <AaibToken />}
                {it.entry.when && <p className="mono">{it.entry.when}</p>}
                <h2 className="disp">{it.entry.title}</h2>
                {it.entry.org && <p className="low">{it.entry.org}</p>}
                {it.entry.link && (
                  <p className="xp-link">
                    <a className="chip" href={it.entry.link.href} target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="see the site">{it.entry.link.label} ↗</a>
                  </p>
                )}
                <ul className="points">{it.entry.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </article>
              {it.word && <div className="xp-word" aria-hidden="true"><span className="disp">{it.word}</span></div>}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="xp-mq" aria-hidden="true">
        <div className="xp-mq-row disp">
          {Array.from({ length: 3 }, () => "Banking · Security · Startups · ").join("").split("").map((c, i) => <i key={i}>{c === " " ? " " : c}</i>)}
        </div>
      </div>
      <div className="xp-foot" aria-hidden="true">
        <span className="xp-bar"><i ref={bar} /></span>
        <span className="k">Scroll →</span>
      </div>
    </section>
  );
}
