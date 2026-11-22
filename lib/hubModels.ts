// Every downloaded hub model in one place, so any of them can be swapped by changing a file name here.
// Files live in /public/media/hub/<name>.glb. Set `droid` to null to remove him.
// OPEN (Yousef): cruiser and droid are Star Wars fan models; replace these two names to swap them.
export const HUB_MODELS = {
  projects: "planet-cut",
  experiences: "planet-stylized",
  cruiser: "ship-cruiser", // faces +X, normalised to 10 units long
  fighter: "harrower", // faces +X, normalised to 4 units long
  droid: "r2d2" as string | null, // needs a child named "dome" for the head spin (optional)
  rocks: ["rock-1", "rock-2", "rock-3", "rock-4"],
  hulls: ["hull-1", "hull-2"],
} as const;
export const hubUrl = (n: string) => `/media/hub/${n}.glb`;
