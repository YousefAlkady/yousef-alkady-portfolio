"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { primeVideo } from "@/lib/primeVideo";
import * as THREE from "three";
import { scroll } from "@/lib/scrollStore";
import { ACT1_TOTAL } from "@/lib/scenes";
import Galaxy from "./Galaxy";

const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Beat 4 reveal. Screen shows the colour plate B (N0 wide / H3) zoomed by uZ around uFix; the B&W studio plate A
// is mapped onto it so Yousef keeps the same size and place in both. At uZ = uK the screen equals H2's last frame;
// at uZ = 1 it is the full wide shot. Outside its frame plate A clamps to its edge, i.e. pads with the grey backdrop.
const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA; uniform sampler2D uB;
uniform float uAspect; // plate B aspect (w/h)
uniform float uScreen; // screen aspect (w/h)
uniform vec2 uK; uniform vec2 uS0; uniform vec2 uT; uniform vec2 uFix; uniform vec2 uZ;
uniform float uFront; uniform float uMix;
uniform vec4 uH; uniform float uHW; uniform float uPhone; // Act 1 framing (scale.xy, offset.zw), blended out by uHW

vec2 cover(vec2 uv, float imgAspect){
  vec2 s = vec2(1.0);
  if (uScreen > imgAspect) s.y = imgAspect / uScreen; else s.x = uScreen / imgAspect;
  return (uv - 0.5) * s + 0.5;
}
void main(){
  vec2 uv0 = mix(vUv * uH.xy + uH.zw, vUv, uHW);    // start in Act 1's framing, end full-bleed
  vec2 n = uFix + (cover(uv0, uAspect) - uFix) * uZ; // plate B uv
  vec2 s = uS0 + (n - uT) / uK;                      // same point in plate A uv
  vec3 a = texture2D(uA, s).rgb;
  // above / below plate A, fade the clamped edge into flat backdrop grey (wall on top, floor below) to avoid streaks
  a = mix(a, vec3(0.65), smoothstep(1.0, 1.06, s.y));
  float ph = uPhone * (1.0 - uHW);                   // phone's black text band, only while still in Act 1 framing
  a = mix(a, vec3(0.92), smoothstep(0.0, -0.06, s.y) * (1.0 - ph));
  a *= mix(1.0, smoothstep(0.0, 0.12, s.y), ph);      // matches the CSS mask under his feet, then gives way to floor grey
  vec3 b = texture2D(uB, n).rgb;
  vec3 grey = vec3(dot(a, vec3(0.299, 0.587, 0.114)));
  // colour wipes in behind the car's front edge
  float m = 1.0 - smoothstep(uFront, uFront + 0.08, n.x);
  // same fine grain over both plates, so the sharp studio side and the video side read as one image
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  gl_FragColor = vec4((mix(grey, b, m) + g * 0.035) * uMix, 1.0);
}
`;

// Measured anchors, in each plate's uv (x from left, y from bottom): tie x, shoe-sole y, and Yousef's height
// (head to soles) as a share of plate height. N0_wide_final / H3: tie 1106/1920, soles 832/1072, head 490.
// Studio: H2's last frame, tie 636/1280, soles 658/720, head 83/720; desktop plate is the Kling crop (x 4-1116, y 42-668).
const PHONE = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
// phone plates are the 9:16 crop x 658-1261 of the 1920-wide frames (h3-m.mp4, nyc-m.webp)
const CROP_X = 658, CROP_W = 603;
const NYC = { x: PHONE ? (1106 - CROP_X) / CROP_W : 1106 / 1920, y: 1 - 832 / 1072, h: (832 - 490) / 1072 };
const STUDIO = PHONE
  ? { x: 636 / 1280, y: 1 - 658 / 720, h: (658 - 83) / 720 }
  : { x: (636 - 4) / 1112, y: 1 - (658 - 42) / 626, h: (658 - 83) / 626 };
// Car front edge in H3 (share of width) by clip time, measured from frame differences.
const CAR: [number, number][] = [[0.9, 0], [1.25, 0.134], [1.5, 0.209], [1.75, 0.278], [2, 0.331], [2.25, 0.381], [2.5, 0.416], [4.25, 0.478]];
const ONE = new THREE.Vector2(1, 1);
const T0 = 0.9; // car enters H3 here; earlier frames are the still plate
const carFront = (t: number) => {
  for (let i = 1; i < CAR.length; i++) {
    const [t1, x1] = CAR[i], [t0, x0] = CAR[i - 1];
    if (t <= t1) return x0 + ((x1 - x0) * Math.max(0, t - t0)) / (t1 - t0);
  }
  return CAR[CAR.length - 1][1];
};
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function useH3() {
  return useMemo(() => {
    const v = document.createElement("video");
    // h3s / nyc-s: the reveal re-composited onto the drive-off set (scripts/comp-h3d.py), so the street never changes
    Object.assign(v, { src: `/media/h3s${PHONE ? "-m" : ""}.mp4`, muted: true, playsInline: true, preload: "auto" });
    const tex = new THREE.VideoTexture(v);
    const redraw = () => { tex.needsUpdate = true; scroll.invalidate(); };
    v.addEventListener("loadeddata", redraw);
    v.addEventListener("seeked", redraw);
    primeVideo(v); // iPhone: without this the detached video never loads, so the car never appears
    return { v, tex };
  }, []);
}

function Reveal() {
  const [studio, nyc] = useLoader(THREE.TextureLoader, [`/media/studio${PHONE ? "-m" : ""}.webp`, `/media/nyc-s${PHONE ? "-m" : ""}.webp`]);
  const h3 = useH3();
  const size = useThree((s) => s.size);
  const uniforms = useMemo(() => {
    const aA = studio.image.width / studio.image.height, aB = nyc.image.width / nyc.image.height;
    const k = NYC.h / STUDIO.h;
    const K = new THREE.Vector2((k * aA) / aB, k);
    const S0 = new THREE.Vector2(STUDIO.x, STUDIO.y), T = new THREE.Vector2(NYC.x, NYC.y);
    // fixed point of the zoom, so that at uZ = K plate A fills the screen exactly as H2 did
    const fix = new THREE.Vector2((T.x - S0.x * K.x) / (1 - K.x), (T.y - S0.y * K.y) / (1 - K.y));
    return {
      uA: { value: studio }, uB: { value: nyc as THREE.Texture }, uAspect: { value: aB }, uScreen: { value: 1 },
      uK: { value: K }, uS0: { value: S0 }, uT: { value: T }, uFix: { value: fix }, uZ: { value: K.clone() },
      uFront: { value: -0.1 }, uMix: { value: 0 },
      uH: { value: new THREE.Vector4(1, 1, 0, 0) }, uHW: { value: 0 }, uPhone: { value: PHONE ? 1 : 0 },
    };
  }, [studio, nyc]);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!mat.current || !mesh.current) return;
    // the galaxy replaces this plate
    mesh.current.visible = scroll.hub <= 0;
    const u = mat.current.uniforms;
    const r = scroll.reveal;
    u.uScreen.value = size.width / size.height;
    // shown from the end of Act 1 (under its fading video) through the reveal
    u.uMix.value = r > 0 || scroll.act1 > ACT1_TOTAL - 12 ? 1 : 0;
    // Act 1 shows the whole studio frame height (pillarbox on wide screens, top-anchored 9:16 on phones); match it,
    // then blend to full-bleed as the shot pulls back
    const scr = size.width / size.height, aB = u.uAspect.value;
    let sx = 1, sy = 1, oy = 0;
    if (PHONE) {
      const f = Math.min(1, (size.width * 16) / 9 / size.height); // video height share, top-anchored
      sx = ((405 / 1280) * aB) / scr; sy = 1 / f; oy = -(1 - f) / f;
    } else if (scr > 16 / 9) {
      sx = scr / (16 / 9); sy = scr / aB; oy = 0.5 - 0.5 * sy;
    }
    u.uH.value.set(sx, sy, 0.5 - 0.5 * sx, oy);
    u.uHW.value = smooth(0.05, 0.9, r);
    // H3 scrubs from the car's entry to its end; until it has a frame, the still N0 plate stands in
    const { v, tex } = h3;
    const t = T0 + r * ((v.duration || 5) - 0.05 - T0);
    if (v.readyState >= 2) {
      u.uB.value = tex;
      if (!v.seeking && Math.abs(v.currentTime - t) > 1 / 48) v.currentTime = t;
    }
    // colour follows the car's front; once it has stopped, the wipe finishes across the frame
    const front = PHONE ? (carFront(t) * 1920 - CROP_X) / CROP_W : carFront(t); // car edge in this plate's width
    u.uFront.value = (r > 0 ? front : -0.1) + smooth(0.8, 1, r) * 1.3;
    // pull back from H2's framing to the wide shot
    u.uZ.value.lerpVectors(u.uK.value, ONE, smooth(0.05, 0.9, r));
  });
  return (
    <mesh ref={mesh} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} depthTest={false} />
    </mesh>
  );
}

function Bridge() {
  const invalidate = useThree((s) => s.invalidate);
  scroll.invalidate = invalidate;
  // keep rendering only while an animated scene is on screen
  useFrame((state) => {
    if (scroll.hub > 0) state.invalidate();
  });
  return null;
}

export default function RevealStage() {
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas dpr={[1, 2]} frameloop="demand" gl={{ antialias: false, powerPreference: "high-performance" }}>
        <Bridge />
        <Reveal />
        <Suspense fallback={null}>
          <Galaxy />
        </Suspense>
      </Canvas>
    </div>
  );
}
