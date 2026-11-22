// Scroll length per beat in vh. Mirrors the Script table in docs/v3-plan.md.
export const ACT1 = { intro: 100, stand: 200, device: 150 } as const;
export const ACT1_START = { intro: 0, stand: ACT1.intro, device: ACT1.intro + ACT1.stand } as const;
export const ACT1_TOTAL = ACT1.intro + ACT1.stand + ACT1.device; // 450

export const LATER = [
  { id: "beat-4", label: "Car arrives, colour reveal", vh: 170, clear: true },
  // clip beats: the video sits in a fixed full-screen frame that dissolves in over the previous scene
  // and scrubs from the section entering ("top bottom") to clipEnd
  // h4c = H4 re-composited onto the drive-off set (H4b first frame), so the cut into H4b keeps one background
  { id: "beat-4b", label: "Gets in", vh: 60, clip: "h4c", clipEnd: "bottom bottom" },
  // last clip: he drives off down the street, then the screen sinks to black and the galaxy rises (H5, the tunnel shot, is not used)
  { id: "beat-4c", label: "Drive away", vh: 130, clip: "h4b", clipEnd: "bottom bottom" },
  { id: "hub", label: "Hub", vh: 100 },
  { id: "contact", label: "Contact", vh: 100 },
] as const;
