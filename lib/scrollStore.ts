// Plain mutable store. ScrollTrigger writes, R3F / clip-scrub read per frame. No React state.
export const scroll = {
  act1: 0, // Act 1 timeline position, in vh units (0..ACT1_TOTAL)
  reveal: 0, // 0..1, beat 4 colour reveal
  near: 0, // 1 once the drive-off starts: the hub warms its shaders and models
  hub: 0, clips: {} as Record<string, number>, // 0..1, galaxy fade-in as the hub section arrives
  invalidate: () => {}, // set by the Canvas (frameloop="demand")
};
