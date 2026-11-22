"use client";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PAGES } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ed = PAGES.education;
const degree = ed.entries[0];

/** Education: full-screen campus photos with the text on top, pinned and scrubbed in three beats.
 *  Reduced motion: the three panels simply stack, each full screen. */
export default function EduStage() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      html.dataset.tone = "dark";
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        root.current!.classList.add("is-live");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=260%", pin: true, scrub: true, anticipatePin: 1 },
        });
        // beat 1: MSA, slow push-in, title rises out of its masks (also plays on load)
        gsap.fromTo(q(".edu-hero .ln"), { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: "power3.out", delay: 0.2 });
        gsap.fromTo(q(".edu-hero .after"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power2.out", delay: 0.7 });
        tl.fromTo(q(".edu-img-1 img"), { scale: 1.18 }, { scale: 1, duration: 40 }, 0);
        tl.to(q(".edu-hero, .edu-back"), { opacity: 0, y: -60, duration: 10 }, 22);
        // beat 2: Greenwich wipes up over it, the degree comes in
        tl.fromTo(q(".edu-img-2"), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 18, ease: "power2.inOut" }, 30);
        tl.fromTo(q(".edu-img-2 img"), { scale: 1.25 }, { scale: 1.02, duration: 40 }, 30);
        // staggered scroll: kicker, then the degree word by word out of its masks, then the small print line by line
        tl.fromTo(q(".edu-deg > *"), { opacity: 0 }, { opacity: 1, duration: 2 }, 42);
        tl.fromTo(q(".edu-deg .mono"), { y: 30 }, { y: 0, duration: 6 }, 42);
        tl.fromTo(q(".edu-deg .ln"), { yPercent: 110 }, { yPercent: 0, duration: 7, stagger: 1.2, ease: "power3.out" }, 43);
        tl.fromTo(q(".edu-deg .low, .edu-deg .k"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 6, stagger: 2.5 }, 50);
        // controlled parallax: the text drifts up faster than the photo behind it
        tl.fromTo(q(".edu-panel"), { yPercent: 0 }, { yPercent: -6, duration: 100 }, 0);
        tl.to(q(".edu-deg"), { opacity: 0, y: -60, duration: 8 }, 66);
        // beat 3: the photo goes dark, certifications land one by one
        tl.to(q(".edu-dim"), { opacity: 0.86, duration: 10 }, 68);
        tl.fromTo(q(".edu-cert-k, .edu-cert li"), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 6, stagger: 3 }, 74);
        tl.to({}, { duration: 6 }, 94);
        return () => root.current?.classList.remove("is-live");
      });
      return () => { mm.revert(); delete html.dataset.tone; };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="edu-stage" aria-label="Education">
      <figure className="edu-img edu-img-1" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/edu/msa.webp" alt="" width={588} height={234} />
      </figure>
      <figure className="edu-img edu-img-2" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/edu/greenwich-1.webp" alt="" width={783} height={391} />
      </figure>
      <div className="edu-dim" aria-hidden="true" />
      <div className="edu-grain" aria-hidden="true" />

      <Link className="k back edu-back" href="/#hub" data-magnetic data-cursor="back to orbit">← Back to the galaxy</Link>
      <div className="edu-panel edu-hero">
        <p className="k after">07 / Education</p>
        <h1 className="disp edu-title" aria-label="Where I learned.">
          <span className="mask" aria-hidden="true"><span className="ln">Where</span></span>
          <span className="mask" aria-hidden="true"><span className="ln thin">I learned.</span></span>
        </h1>
        <p className="k after">Cairo, Egypt · MSA University</p>
      </div>

      <div className="edu-panel edu-deg">
        <p className="mono">{degree.when}</p>
        <h2 className="disp edu-degree" aria-label={degree.title}>
          {degree.title.split(" ").map((w, i) => <span key={i} className="mask edu-w" aria-hidden="true"><span className="ln">{w}</span></span>)}
        </h2>
        <p className="low">{degree.org}</p>
        <p className="k">London, UK · University of Greenwich</p>
      </div>

      <div className="edu-panel edu-cert">
        <h2 className="k edu-cert-k">{ed.extra!.title}</h2>
        <ul>{ed.extra!.items.map((c) => <li key={c}>{c}</li>)}</ul>
      </div>
    </section>
  );
}
