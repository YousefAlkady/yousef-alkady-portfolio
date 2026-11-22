"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { type Beat, fileUrl, loadBeats } from "@/lib/beats";

// One <audio> for the whole site. It lives in the root layout, so music keeps playing across page changes;
// the Music page player and the nav bubble are two remotes for the same state.
type Player = {
  beats: Beat[] | null; i: number; beat?: Beat; playing: boolean; t: number; dur: number;
  go: (n: number) => void; toggle: () => void; seek: (s: number) => void;
};
const Ctx = createContext<Player | null>(null);
export const usePlayer = () => useContext(Ctx)!;

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [beats, setBeats] = useState<Beat[] | null>(null);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => { loadBeats().then(setBeats).catch(() => setBeats([])); }, []);

  const beat = beats?.[i];
  const go = (n: number) => {
    if (!beats?.length) return;
    setI((n + beats.length) % beats.length);
    setT(0);
    setPlaying(true);
  };
  const seek = (s: number) => { if (audio.current) audio.current.currentTime = s; setT(s); };

  useEffect(() => {
    const a = audio.current;
    if (!a || !beat) return;
    if (playing) a.play().catch(() => setPlaying(false)); else a.pause();
  }, [playing, beat]);

  return (
    <Ctx.Provider value={{ beats, i, beat, playing, t, dur, go, toggle: () => setPlaying((p) => !p), seek }}>
      {children}
      {beat && (
        <audio
          ref={audio}
          src={fileUrl(beat.audio_path)}
          preload="none" // no audio request on page load; metadata arrives when a beat is played
          onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
          onEnded={() => go(i + 1)}
        />
      )}
    </Ctx.Provider>
  );
}
