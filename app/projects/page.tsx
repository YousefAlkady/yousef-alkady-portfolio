import type { Metadata } from "next";
import Contact from "@/components/Contact";
import CardStackFx from "@/components/CardStackFx";
import PageHead from "@/components/PageHead";
import { PAGES } from "@/lib/content";
import { UNILINK_SOCIAL } from "@/lib/socials";

export const metadata: Metadata = { title: "Projects · Yousef Alkady", description: PAGES.projects.kicker };

// Per-project media, keyed by entry id. desktop = browser-framed shot; phone = small phone overlapping it.
type Img = { src: string; alt: string; w: number; h: number };
const MEDIA: Record<string, { logo?: Img; bar?: string; desktop: Img; phone?: Img; second?: Img }> = {
  unilink: {
    logo: { src: "/media/unilink/logo.webp", alt: "UniLink logo", w: 72, h: 72 },
    bar: "unilink · campus",
    desktop: { src: "/media/unilink/desktop-campus.jpg", alt: "UniLink campus page on desktop", w: 800, h: 499 },
    phone: { src: "/media/unilink/phone-home.jpg", alt: "UniLink home feed on a phone", w: 364, h: 787 },
  },
  crumbs: {
    logo: { src: "/media/crumbs/logo.webp", alt: "Crumb & Co. by Lana logo", w: 72, h: 72 },
    bar: "crumbsnco · menu",
    desktop: { src: "/media/crumbs/desktop.jpg", alt: "Crumbs & Co menu page on desktop", w: 800, h: 505 },
    phone: { src: "/media/crumbs/phone.jpg", alt: "Crumbs & Co menu on a phone", w: 364, h: 787 },
  },
  // main: Yousef's photo of the real prototype (Picture Assets/WhatsApp Image 2026-11-11 at 4.15.52 PM, cropped square);
  // second: a slide from his project presentation
  mesh: {
    desktop: { src: "/media/mesh/device.jpg", alt: "The prototype: ESP32 boards, LoRa radio, keypad and a small screen showing SECURE", w: 720, h: 720 },
    second: { src: "/media/mesh/architecture.jpg", alt: "Slide: dual-pipeline architecture for images and sensor data", w: 1000, h: 575 },
  },
};

// downloadable files per project
const PAPER: Record<string, { href: string; label: string }> = {
  mesh: { href: "/papers/Alkady-LoRa-Image-Delivery.pdf", label: "Read the paper (PDF)" },
};

// eslint-disable-next-line @next/next/no-img-element
const Pic = ({ i, className }: { i: Img; className?: string }) => <img className={className} src={i.src} alt={i.alt} width={i.w} height={i.h} loading="lazy" />;

// Card stacking: every card is sticky a little lower than the one before, so earlier cards stay as a titled edge behind it (CSS only).
export default function Page() {
  const { entries } = PAGES.projects;
  return (
    <main className="page">
      <PageHead kicker="05 / Selected work" lines={["Things", "I built."]} />
      <ol className="stack">
        {entries.map((e, i) => {
          const m = e.id ? MEDIA[e.id] : undefined;
          return (
            <li key={e.title} id={e.id} className={`card${i === 0 ? " card-lead" : ""}${m ? " has-shots" : ""}`} style={{ ["--i" as string]: i }}>
              <div className="card-top">
                <span className="mono">0{i + 1}</span>
                <span className="k">{e.title}</span>
                {e.when && <span className="mono">{e.when}</span>}
              </div>
              <div className="card-body">
                <div className="card-main">
                  {m?.logo && <Pic i={m.logo} className="ul-logo" />}
                  <h2 className="disp card-title">{e.title}</h2>
                  {e.org && <p className="low card-org">{e.org.toLowerCase()}</p>}
                  {e.id === "unilink" && (
                    <p className="ul-social">
                      <span className="k">Follow UniLink</span>
                      {UNILINK_SOCIAL.map(([n, h]) => <a key={n} className="chip" href={h} target="_blank" rel="noopener noreferrer" data-cursor="follow along">{n} ↗</a>)}
                      <span className="chip ul-soon">Facebook · soon</span>
                    </p>
                  )}
                  {e.tech && (
                    <ul className="tech" aria-label="Built with">
                      {e.tech.split(", ").map((t) => <li key={t} className="chip">{t}</li>)}
                    </ul>
                  )}
                  {e.id && PAPER[e.id] && (
                    <a className="pill card-paper" href={PAPER[e.id].href} download data-magnetic data-cursor="nerd mode">{PAPER[e.id].label} <span aria-hidden="true">↓</span></a>
                  )}
                </div>
                <ul className="points">
                  {e.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
                {m && (
                  <div className={`shots${m.second ? " shots-pair" : ""}`} aria-label={`${e.title} screenshots`} data-parallax="0.06">
                    <div className="shot-desktop">
                      {m.bar && <div className="shot-bar" aria-hidden="true"><i /><i /><i /><span>{m.bar}</span></div>}
                      <Pic i={m.desktop} />
                    </div>
                    {m.phone && <div className="shot-phone" data-parallax="-0.12"><Pic i={m.phone} /></div>}
                    {m.second && <div className="shot-desktop shot-second" data-parallax="-0.08"><Pic i={m.second} /></div>}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <CardStackFx />
      <Contact />
    </main>
  );
}
