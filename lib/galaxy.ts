// Act 3 hub destinations. Names and labels from docs/copy.md. Positions are layout only.
export type Planet = {
  id: string;
  name: string;
  label?: string;
  color: string;
  pos: [number, number, number];
  m?: [number, number, number]; // position on portrait screens
  r: number;
  orbit?: string; // id of the planet it circles (must come earlier in the list)
};

export const PLANETS: Planet[] = [
  { id: "projects", name: "Projects", label: "Things I built", color: "#8b6cff", pos: [-4.4, 0.55, 0], m: [-1.0, 1.25, 0], r: 1.35 },
  { id: "unilink", name: "UniLink", color: "#d9c8ff", pos: [0, 0, 0], r: 0.3, orbit: "projects" },
  { id: "experiences", name: "Experiences", label: "Where I've worked", color: "#ff9a5c", pos: [0.1, 0.35, -0.6], m: [0.25, -1.65, -1], r: 1.25 },
  { id: "education", name: "Education", label: "Where I learned", color: "#4f9dff", pos: [4.4, 0.6, 0.3], m: [1.1, 1.45, 0.3], r: 1.3 },
];

// Shared between the DOM hub UI and the R3F scene. No React state per frame.
export const galaxy = {
  els: [] as (HTMLElement | null)[], // one button per planet, positioned by the scene
  focus: -1, // index of the planet the camera jumped to, -1 = overview
  dive: false, // true while flying into the focused planet on the way to its page
};
