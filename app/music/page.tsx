import type { Metadata } from "next";
import BeatPlayer from "@/components/BeatPlayer";
import Contact from "@/components/Contact";
import PageHead from "@/components/PageHead";
import { SOCIAL } from "@/lib/socials";

export const metadata: Metadata = { title: "Music · Yousef Alkady", description: "Freelance music producer since 2020: beats, mixing and mastering in FL Studio." };

// Wording from Yousef (2026-11-17).
const POINTS = [
  "Produced original music across multiple genres, tailoring soundscapes to each artist's style.",
  "Mixed and mastered tracks to professional standards for release-ready audio.",
  "Collaborated remotely with singers, rappers and bands, helping them refine their sound.",
  "Built a diverse portfolio, from underground singles to commercial work.",
  "Keep up with new production techniques, plugins and digital audio tools.",
];

export default function Page() {
  return (
    <main className="page">
      <PageHead kicker="08 / After hours" lines={["Beats", "by night."]}>
        <p className="low page-aside">freelance music producer since 2020. fl studio, mixing and mastering.</p>
      </PageHead>
      <section className="music">
        <BeatPlayer />
        <div className="music-story">
          <p className="k">Music production · Freelance · 2020 – Present</p>
          <p className="music-lede" data-parallax="0.08">
            Since 2020 I&rsquo;ve worked as a freelance music producer, crafting beats, mixing tracks and helping artists bring their ideas to life.
          </p>
          <ul className="points">{POINTS.map((p) => <li key={p}>{p}</li>)}</ul>
          <p className="low">It sharpened my ear for detail, my adaptability and my technical skills, and it still fuels me.</p>
          <div className="music-links">
            {SOCIAL.youtube && <a className="pill" href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="tune in">YouTube ↗</a>}
            <a className="pill" href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="come say hi">Instagram ↗</a>
          </div>
        </div>
      </section>
      <Contact />
    </main>
  );
}
