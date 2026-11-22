"use client";
import { fileUrl, beatsReady } from "@/lib/beats";
import { usePlayer } from "./PlayerProvider";

const fmt = (t: number) => (isFinite(t) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}` : "0:00");
const tags = (b: { genre: string | null; bpm: number | null }) => [b.genre, b.bpm && `${b.bpm} bpm`].filter(Boolean).join(" · ");

/** Full player on the Music page: play / pause, previous / next, seek, track list. Shares state with the nav bubble. */
export default function BeatPlayer() {
  const { beats, i, beat, playing, t, dur, go, toggle, seek } = usePlayer();

  if (beats === null) return <div className="bp bp-empty"><p className="k">Loading beats…</p></div>;
  if (!beats.length || !beat) return (
    <div className="bp bp-empty">
      <p className="k">The player</p>
      <p className="disp bp-soon">Beats dropping soon.</p>
      <p className="low">{beatsReady ? "No beats published yet." : "The beat library is being connected."}</p>
    </div>
  );

  return (
    <div className={`bp${playing ? " is-playing" : ""}`}>
      <div className="bp-now">
        <div className="bp-art" aria-hidden="true">
          {beat.cover_path
            ? // eslint-disable-next-line @next/next/no-img-element
              <img src={fileUrl(beat.cover_path)} alt="" />
            : <span className="bp-bars">{Array.from({ length: 5 }, (_, k) => <i key={k} style={{ ["--k" as string]: k }} />)}</span>}
        </div>
        <div className="bp-meta">
          <p className="k">Now playing · {String(i + 1).padStart(2, "0")} / {String(beats.length).padStart(2, "0")}</p>
          <h3 className="disp bp-title">{beat.title}</h3>
          <p className="mono bp-tags">{tags(beat)}</p>
        </div>
      </div>
      <input
        className="bp-seek" type="range" min={0} max={dur || 0} step={0.1} value={t} aria-label="Seek"
        style={{ ["--p" as string]: `${dur ? (t / dur) * 100 : 0}%` }}
        onChange={(e) => seek(+e.target.value)}
      />
      <div className="bp-row">
        <span className="mono">{fmt(t)}</span>
        <div className="bp-ctrls">
          <button className="bp-btn" onClick={() => go(i - 1)} aria-label="Previous beat" data-cursor="run it back">⏮</button>
          <button className="bp-btn bp-play" onClick={toggle} aria-label={playing ? "Pause" : "Play"} data-cursor={playing ? "hold up" : "press play"}>
            {playing ? "❚❚" : "▶"}
          </button>
          <button className="bp-btn" onClick={() => go(i + 1)} aria-label="Next beat" data-cursor="next one">⏭</button>
        </div>
        <span className="mono">{fmt(dur)}</span>
      </div>
      <ol className="bp-list">
        {beats.map((b, n) => (
          <li key={b.id}>
            <button className={`bp-item${n === i ? " is-on" : ""}`} onClick={() => (n === i ? toggle() : go(n))} data-cursor="spin this">
              <span className="mono">{String(n + 1).padStart(2, "0")}</span>
              <span>{b.title}</span>
              <span className="mono">{tags(b)}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
