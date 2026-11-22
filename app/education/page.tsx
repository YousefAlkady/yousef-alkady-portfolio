import type { Metadata } from "next";
import Contact from "@/components/Contact";
import EduStage from "@/components/EduStage";
import { PAGES } from "@/lib/content";

export const metadata: Metadata = { title: "Education · Yousef Alkady", description: PAGES.education.kicker };

// photos from Yousef: MSA University campus, then the University of Greenwich (London), which awards the degree
export default function Page() {
  return (
    <main className="page">
      <EduStage />
      <Contact />
    </main>
  );
}
