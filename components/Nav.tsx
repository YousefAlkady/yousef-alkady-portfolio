import Link from "next/link";
import MenuDismiss from "./MenuDismiss";
import MiniPlayer from "./MiniPlayer";

// [label, href, playful cursor hint]
const LINKS = [["Work", "/projects", "the good stuff"], ["Experience", "/experience", "where i've been"], ["Education", "/education", "school days"], ["Music", "/music", "turn it up"], ["Contact", "/#contact", "say hi"]] as const;

// Always on screen. Its colour follows html[data-tone] (set by the scene under it).
// Phones get the same links in a native <details> menu, so it works without JavaScript and with the keyboard.
export default function Nav() {
  return (
    <nav className="nav" aria-label="Main">
      <Link className="nav-mark disp" href="/" data-magnetic aria-label="YA, Yousef Alkady, home" data-cursor="from the top">YA</Link>
      <div className="nav-links">
        {LINKS.map(([t, h, c]) => <Link key={h} href={h} data-magnetic data-cursor={c}>{t}</Link>)}
      </div>
      <div className="nav-end">
        <MiniPlayer />
        <a className="pill nav-cv" href="/Yousef-Alkady-CV.pdf" download data-magnetic data-cursor="yours to keep">Download CV <span aria-hidden="true">↓</span></a>
        <details className="nav-menu">
          <summary className="pill">Menu</summary>
          <div className="nav-sheet">
            {LINKS.map(([t, h]) => <Link key={h} href={h}>{t}</Link>)}
            <a href="/Yousef-Alkady-CV.pdf" download>Download CV ↓</a>
          </div>
        </details>
        <MenuDismiss />
      </div>
    </nav>
  );
}
