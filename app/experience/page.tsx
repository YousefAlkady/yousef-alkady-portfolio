import type { Metadata } from "next";
import Contact from "@/components/Contact";
import ExperienceStrip from "@/components/ExperienceStrip";
import PageHead from "@/components/PageHead";
import type { StripItem } from "@/components/ExperienceStrip";
import { PAGES } from "@/lib/content";

export const metadata: Metadata = { title: "Experience · Yousef Alkady", description: PAGES.experience.kicker };

// photos from assets/keyframes/EXP_*.jpg, same order as the entries in content.ts; the single words between tiles are decoration only
const [aaib, cib, codeyssey, amit, encrypt] = PAGES.experience.entries;
const ITEMS: StripItem[] = [
  { label: "AAIB", img: "exp/aaib", pos: "50% 50%", word: "Secure", token: "aaib", entry: aaib }, // 3D head-office token above the text
  { label: "CIB", img: "exp/cib", pos: "62% 50%", word: "Build", entry: cib },
  { label: "Codeyssey", img: "exp/codeyssey", pos: "50% 50%", word: "Learn", entry: codeyssey },
  // logo tiles built from the logos Yousef sent (2026-11-18)
  { label: "AMIT", img: "exp/amit", pos: "50% 50%", word: "Ship", entry: amit },
  { label: "EncryptCore", img: "exp/encryptcore", pos: "50% 50%", entry: encrypt },
];

export default function Page() {
  return (
    <main className="page page-light">
      <ExperienceStrip items={ITEMS}>
        <PageHead kicker="06 / Where I've worked" lines={["Banking. Security.", "Startups."]}>
          <p className="low page-aside">it intern at aaib. ai intern at cib. partnerships lead at codeyssey. data science & ai trainee at amit. front-end intern at encryptcore.</p>
        </PageHead>
      </ExperienceStrip>
      <Contact />
    </main>
  );
}
