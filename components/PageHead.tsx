import Link from "next/link";

/** Shared top of a planet page: back link, kicker and a two-line wide-caps title (second line thin). */
export default function PageHead({ kicker, lines, children }: { kicker: string; lines: [string, string]; children?: React.ReactNode }) {
  return (
    <header className="page-head">
      <Link className="k back" href="/#hub" data-magnetic data-cursor="back to orbit">← Back to the galaxy</Link>
      <div className="page-head-row">
        <div>
          <p className="k">{kicker}</p>
          <h1 className="disp page-title" aria-label={lines.join(" ")}>
            <span aria-hidden="true" data-parallax="0.05">{lines[0]}</span>
            <span className="thin" aria-hidden="true" data-parallax="0.12">{lines[1]}</span>
          </h1>
        </div>
        {children && <div data-parallax="0.2">{children}</div>}
      </div>
    </header>
  );
}
