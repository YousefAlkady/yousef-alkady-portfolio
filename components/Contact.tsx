import Link from "next/link";
import { SOCIAL } from "@/lib/socials";

// CC BY credits, copied from assets/3d/LICENCES.md: [title, source, author]
const CREDITS = [
  ["BMW M4 CS G82 2021 (Sapphire Black Metallic)", "https://sketchfab.com/3d-models/bmw-m4-cs-g82-2021-sapphire-black-metallic-a05107b16891426c98d0ab4b271acf03", "eldaaar"],
  ["Street Bench", "https://sketchfab.com/3d-models/street-bench-1ddafec2fda5430697aaf403b3deba96", "donnichols"],
  ["Asian Themed Low Poly Night City Buildings", "https://sketchfab.com/3d-models/asian-themed-low-poly-night-city-buildings-9f0343aff4814b758dc6e905aba5b5e0", "99.Miles"],
  ["Day#49: Manhole cover", "https://sketchfab.com/3d-models/day49-manhole-cover-5a3692f7df6c46548821a8ad29fdd3b9", "JuanG3D"],
  ["Fire Hydrant", "https://sketchfab.com/3d-models/fire-hydrant-cc6968cdaec44f7c8f82b0b4f38a1e1b", "iedalton"],
  ["spaceship", "https://sketchfab.com/models/781e531c00d94c9e89dcc8ad9b967d87", "easyidpyj"],
  ["Star Wars; Imperial-Class Star Destroyer (fan model, Sketchfab Free Standard licence, simplified for the web)", "https://sketchfab.com/3d-models/star-wars-imperial-class-star-destroyer-fa18d537db4d4020a443c1802ec0f88e", "Heataker"],
  ["Planet (CC BY-NC 4.0)", "https://sketchfab.com/3d-models/planet-0104234961624b7aa0cb85d03161babe", "PounUP"],
  ["Stylized planet (volcube_planet), source unknown", "#", "unknown author"],
  ["Harrower Sith Ship", "https://sketchfab.com/3d-models/harrower-sith-ship-26a93eed56f64e5d8356f755c2cbb7cd", "Cpt.Kirk"],
  ["r2d2 starwars fanart", "https://sketchfab.com/3d-models/r2d2-starwars-fanart-0bcc8566756543d396dec37a8c425e7b", "eknightger"],
  ["Meteorite", "https://sketchfab.com/models/0a503e5bec784cbc9082e2f6b2d9f701", "hailphilly"],
  ["Asteroid 01", "https://sketchfab.com/models/df95d3da67aa4c769ec81394e0b0ffef", "Oziry"],
  ["Asteroids Pack (rocky version)", "https://sketchfab.com/models/adde1ecf129e4509be8af61b84bafa85", "SebastianSosnowski"],
  ["Earth and Moon textures", "https://www.solarsystemscope.com/textures/", "Solar System Scope"],
] as const;

const TITLE = ["Let's build", "something."];

/** Closing section, used on the home page and under every planet page. Links from docs/copy.md. */
export default function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="horizon" aria-hidden="true" data-parallax="0.18" />
      <p className="k">Contact</p>
      <h2 className="disp contact-title" aria-label="Let's build something.">
        {TITLE.map((l, r) => (
          <span key={l} className={`row${r ? " thin" : ""}`} aria-hidden="true" data-parallax={r ? "0.14" : "0.06"}>
            {l.split("").map((c, i) => <span key={i} style={{ ["--i" as string]: i + r * 3 }}>{c === " " ? " " : c}</span>)}
          </span>
        ))}
      </h2>
      <div className="contact-row">
        <ul className="contact-links">
          <li><span className="k">Email</span><a href="mailto:yousufalkady@gmail.com" data-magnetic data-cursor="say hello">yousufalkady@gmail.com</a></li>
          <li><span className="k">GitHub</span><a href="https://github.com/YousefAlkady" target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="peek at the code"><i>github.com/</i>YousefAlkady</a></li>
          <li><span className="k">LinkedIn</span><a href="https://www.linkedin.com/in/yousef-alkady-a23773324" target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="let's connect"><i>in/</i>yousef-alkady-a23773324</a></li>
          <li><span className="k">Instagram</span><a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="slide in"><i>@</i>yousef.alkadyy</a></li>
          {SOCIAL.youtube && <li><span className="k">YouTube</span><a href={SOCIAL.youtube} target="_blank" rel="noopener noreferrer" data-magnetic data-cursor="tune in">My beats</a></li>}
        </ul>
        <a className="pill solid big" href="/Yousef-Alkady-CV.pdf" download data-magnetic data-cursor="yours to keep">Download CV <span aria-hidden="true">↓</span></a>
      </div>
      <div className="contact-foot">
        <span className="k">Cairo, Egypt</span>
        <details className="credit">
          <summary className="k">3D credits</summary>
          <p>3D assets (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> unless noted):</p>
          <ul>
            {CREDITS.map(([title, url, author]) => (
              <li key={title}>&ldquo;{url === "#" ? title : <a href={url} target="_blank" rel="noopener noreferrer">{title}</a>}&rdquo; by {author}</li>
            ))}
          </ul>
        </details>
        <Link className="k" href="/" data-magnetic data-cursor="going up">↑ Back to top</Link>
      </div>
    </section>
  );
}
