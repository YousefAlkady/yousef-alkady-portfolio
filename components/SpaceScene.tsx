"use client";
// Hub backdrop: nebula sky, a few pulsing novas, a drifting asteroid field and original ships on patrol.
// Sky and novas are built in code; ships, rocks and hull debris are downloaded CC BY models (see HubModels).
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { scroll } from "@/lib/scrollStore";
import { HUB_MODELS } from "@/lib/hubModels";

const nebulaFrag = /* glsl */ `
varying vec3 vP;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;} vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return mod289(((x*34.)+1.)*x);}
float n3(vec3 p){ vec3 a=floor(p); vec3 d=p-a; d=d*d*(3.-2.*d);
  vec4 b=a.xxyy+vec4(0.,1.,0.,1.); vec4 k1=perm(b.xyxy); vec4 k2=perm(k1.xyxy+b.zzww);
  vec4 c=k2+a.zzzz; vec4 k3=perm(c); vec4 k4=perm(c+1.);
  vec4 o1=fract(k3*(1./41.)); vec4 o2=fract(k4*(1./41.));
  vec4 o3=o2*d.z+o1*(1.-d.z); vec2 o4=o3.yw*d.x+o3.xz*(1.-d.x); return o4.y*d.y+o4.x*(1.-d.y); }
float fbm(vec3 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*n3(p); p*=2.03; a*=.5; } return v; }
void main(){
  vec3 d = normalize(vP);
  float n = fbm(d * 2.2);
  float m = fbm(d * 4.0 + n * 1.5);
  float clouds = smoothstep(0.45, 0.85, m);
  vec3 col = mix(vec3(0.16, 0.04, 0.28), vec3(0.04, 0.14, 0.3), smoothstep(0.3, 0.7, n));   // violet to deep blue
  col = mix(col, vec3(0.55, 0.15, 0.35), smoothstep(0.7, 0.95, m) * 0.6);                    // magenta knots
  float lane = smoothstep(0.55, 0.35, fbm(d * 6.0 + 3.0));                                  // dark dust lanes
  gl_FragColor = vec4(col * clouds * 0.55 * (0.5 + 0.5 * lane), 1.0);
  #include <colorspace_fragment>
}`;
const skyVert = /* glsl */ `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

function flareTexture(spikes: boolean) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.12, "rgba(255,240,220,0.8)");
  grd.addColorStop(0.4, "rgba(160,170,255,0.18)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  if (spikes) {
    g.globalCompositeOperation = "lighter";
    for (const [w, h] of [[128, 3], [3, 128]]) {
      const l = g.createLinearGradient(64 - w / 2, 64 - h / 2, 64 + w / 2, 64 + h / 2);
      l.addColorStop(0, "rgba(255,255,255,0)"); l.addColorStop(0.5, "rgba(255,255,255,0.9)"); l.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = l;
      g.fillRect(64 - w / 2, 64 - h / 2, w, h);
    }
  }
  return new THREE.CanvasTexture(c);
}

const NOVAS: { pos: [number, number, number]; size: number; color: string; speed: number }[] = [
  { pos: [-9, 5, -14], size: 3.2, color: "#ffd7f0", speed: 0.7 },
  { pos: [11, -3, -16], size: 2.6, color: "#c9dcff", speed: 1.1 },
  { pos: [4, 7, -18], size: 2.0, color: "#ffe2b8", speed: 0.5 },
  { pos: [-13, -6, -12], size: 1.6, color: "#d9c4ff", speed: 1.4 },
];

function Novas() {
  const spike = useMemo(() => flareTexture(true), []);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    NOVAS.forEach((n, i) => {
      const sp = refs.current[i];
      if (!sp) return;
      const k = 0.8 + 0.25 * Math.sin(t * n.speed + i * 2) + 0.1 * Math.sin(t * n.speed * 3.7);
      sp.scale.setScalar(n.size * k);
      (sp.material as THREE.SpriteMaterial).opacity = 0.75 + 0.25 * k;
    });
  });
  return (
    <>
      {NOVAS.map((n, i) => (
        <sprite key={i} position={n.pos} ref={(el) => { refs.current[i] = el; }}>
          <spriteMaterial map={spike} color={n.color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </>
  );
}

// Sketchfab models (CC BY, credited in the contact section), exported light for the web into /media/hub.
// Ships face +X with engines at -X; cruiser is 10 units long, fighter 4; rocks and hull pieces about 1-3.
const HUB = (n: string) => `/media/hub/${n}.glb`;
const ROCKS = HUB_MODELS.rocks;

function firstMesh(scene: THREE.Object3D) {
  let m: THREE.Mesh | undefined;
  scene.traverse((o) => { if (!m && (o as THREE.Mesh).isMesh) m = o as THREE.Mesh; });
  return m!;
}

// one instanced mesh per rock model: a few draw calls for the whole field
function RockField({ url, count, seed }: { url: string; count: number; seed: number }) {
  const gltf = useLoader(GLTFLoader, url);
  const src = useMemo(() => firstMesh(gltf.scene), [gltf]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const rocks = useMemo(() => {
    let r = seed;
    const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: count }, () => {
      const a = rnd() * Math.PI * 2, d = 5 + rnd() * 7;
      return {
        p: new THREE.Vector3(Math.cos(a) * d, (rnd() - 0.5) * 6, -3 - rnd() * 9 + Math.sin(a) * 2),
        s: 0.02 + rnd() ** 3 * 0.22, r: new THREE.Euler(rnd() * 6, rnd() * 6, 0), w: (rnd() - 0.5) * 0.5,
      };
    });
  }, [count, seed]);
  const o = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => { if (ref.current) ref.current.frustumCulled = false; }, []);
  useFrame((st) => {
    const m = ref.current;
    if (!m) return;
    const t = st.clock.elapsedTime;
    rocks.forEach((k, i) => {
      o.position.set(k.p.x + Math.sin(t * 0.05 + i) * 0.3, k.p.y + t * 0.02 * k.w, k.p.z);
      o.rotation.set(k.r.x + t * k.w, k.r.y + t * k.w * 0.7, 0);
      o.scale.setScalar(k.s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[src.geometry, src.material, count]} />;
}

// broken hull plates tumbling slowly near the planets
const HULLS: { n: string; pos: [number, number, number]; s: number; spin: [number, number, number] }[] = [
  { n: "hull-1", pos: [-4.2, -2.2, -2.5], s: 0.22, spin: [0.11, 0.07, 0.05] },
  { n: "hull-2", pos: [4.6, 2.6, -3.5], s: 0.2, spin: [-0.06, 0.09, 0.04] },
  { n: "hull-1", pos: [1.5, 3.4, -6], s: 0.16, spin: [0.05, -0.08, 0.06] },
  { n: "hull-2", pos: [-2.8, 3.0, -7], s: 0.14, spin: [0.08, 0.05, -0.07] },
];
function Hulls() {
  const g1 = useLoader(GLTFLoader, HUB("hull-1"));
  const g2 = useLoader(GLTFLoader, HUB("hull-2"));
  const objs = useMemo(() => HULLS.map((h) => (h.n === "hull-1" ? g1 : g2).scene.clone(true)), [g1, g2]);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((st, dt) => {
    HULLS.forEach((h, i) => {
      const g = refs.current[i];
      if (!g) return;
      g.rotation.x += h.spin[0] * dt; g.rotation.y += h.spin[1] * dt; g.rotation.z += h.spin[2] * dt;
      g.position.y = h.pos[1] + Math.sin(st.clock.elapsedTime * 0.2 + i) * 0.15;
    });
  });
  return (
    <>
      {HULLS.map((h, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} position={h.pos} scale={h.s}>
          <primitive object={objs[i]} />
        </group>
      ))}
    </>
  );
}

function Engine({ pos, size, color }: { pos: [number, number, number]; size: number; color: string }) {
  const tex = useMemo(() => flareTexture(false), []);
  return (
    <sprite position={pos} scale={[size, size, 1]}>
      <spriteMaterial map={tex} color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

// speed streak behind a moving ship: two crossed fading planes along -X (reads as motion blur from any angle)
function trailTexture() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 16;
  const g = c.getContext("2d")!;
  const l = g.createLinearGradient(0, 0, 256, 0);
  l.addColorStop(0, "rgba(255,255,255,0)"); l.addColorStop(1, "rgba(255,255,255,0.9)");
  g.fillStyle = l; g.fillRect(0, 0, 256, 16);
  const v = g.createLinearGradient(0, 0, 0, 16);
  v.addColorStop(0, "rgba(0,0,0,1)"); v.addColorStop(0.5, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = v; g.fillRect(0, 0, 256, 16);
  return new THREE.CanvasTexture(c);
}
function Trail({ x, len, width, color }: { x: number; len: number; width: number; color: string }) {
  const tex = useMemo(trailTexture, []);
  const mat = <meshBasicMaterial map={tex} color={color} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />;
  return (
    <group position={[x - len / 2, 0, 0]}>
      <mesh><planeGeometry args={[len, width]} />{mat}</mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[len, width]} />{mat}</mesh>
    </group>
  );
}

function Ship({ kind, color }: { kind: "cruiser" | "fighter"; color?: string }) {
  const gltf = useLoader(GLTFLoader, HUB(kind === "cruiser" ? HUB_MODELS.cruiser : HUB_MODELS.fighter));
  // normalise to the lengths the routes expect (cruiser 10, fighter 4) so models can be swapped under the same name
  const obj = useMemo(() => {
    const o = gltf.scene.clone(true);
    const len = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()).x || 1;
    o.scale.setScalar((kind === "cruiser" ? 10 : 4) / len);
    return o;
  }, [gltf, kind]);
  return kind === "cruiser" ? (
    <group>
      <primitive object={obj} />
      {[-0.7, 0, 0.7].map((z) => <Engine key={z} pos={[-5.1, -0.1, z]} size={z === 0 ? 2.2 : 1.6} color="#7fb4ff" />)}
    </group>
  ) : (
    <group>
      <primitive object={obj} />
      <Engine pos={[-2.05, 0, 0]} size={1.4} color={color ?? "#ff4a3c"} />
      <Trail x={-2.0} len={9} width={0.5} color={color ?? "#ff7a60"} />
    </group>
  );
}

type Route = { kind: "cruiser" | "fighter"; from: THREE.Vector3; to: THREE.Vector3; speed: number; phase: number; scale: number; color?: string };
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const ROUTES: Route[] = [
  { kind: "cruiser", from: v3(-14, 3.2, -9), to: v3(14, 2.4, -10), speed: 0.012, phase: 0.3, scale: 0.27 },
  { kind: "cruiser", from: v3(13, -3.5, -13), to: v3(-13, -2.5, -12), speed: 0.009, phase: 0.6, scale: 0.39 },
  { kind: "fighter", from: v3(-8, -1.5, -3), to: v3(9, 1.8, -5), speed: 0.06, phase: 0.1, scale: 0.09 },
  { kind: "fighter", from: v3(-8.4, -1.2, -3.4), to: v3(8.6, 2.1, -5.4), speed: 0.06, phase: 0.13, scale: 0.09 },
  { kind: "fighter", from: v3(9, 3.5, -6), to: v3(-9, -0.5, -4), speed: 0.045, phase: 0.55, scale: 0.08 },
  { kind: "fighter", from: v3(6, -4, -8), to: v3(-7, 4, -7), speed: 0.035, phase: 0.8, scale: 0.075 },
];

function Ships() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const X = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    ROUTES.forEach((r, i) => {
      const g = refs.current[i];
      if (!g) return;
      const f = (t * r.speed + r.phase) % 1;
      g.position.lerpVectors(r.from, r.to, f);
      g.quaternion.setFromUnitVectors(X, dir.subVectors(r.to, r.from).normalize());
      g.visible = f > 0.02 && f < 0.98;
    });
  });
  return (
    <>
      {ROUTES.map((r, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }} scale={r.scale}>
          <Ship kind={r.kind} color={r.color} />
        </group>
      ))}
    </>
  );
}

// R2-D2, lost in space: drifts on a lazy loop, tumbles head over feet, spins his dome in fits and wobbles
function R2({ file }: { file: string }) {
  const gltf = useLoader(GLTFLoader, HUB(file));
  const obj = useMemo(() => gltf.scene.clone(true), [gltf]);
  const dome = useMemo(() => obj.getObjectByName("dome") ?? null, [obj]);
  const g = useRef<THREE.Group>(null);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    const o = g.current;
    if (!o) return;
    const k = Math.min(1, (st.size.width / st.size.height) * 0.55); // pull him in on portrait screens
    o.position.set((2.6 + Math.sin(t * 0.13) * 1.0) * k, (-1.5 + Math.sin(t * 0.21) * 0.5) * (k < 1 ? 0.8 : 1), 2.0 + Math.cos(t * 0.11) * 0.6);
    o.rotation.set(t * 0.35, Math.sin(t * 0.5) * 0.6, Math.sin(t * 0.9) * 0.35); // slow somersault plus a wobble
    if (dome) dome.rotation.y = Math.sin(t * 1.3) * 2.2 + (Math.sin(t * 0.37) > 0.8 ? t * 6 : 0); // looks around, sometimes spins out
  });
  return (
    <group ref={g} scale={0.55}>
      <primitive object={obj} />
    </group>
  );
}

// the downloaded models mount during the drive-off, so the fetch/parse hitch lands before the hub is on screen
function HubModels({ phone }: { phone: boolean }) {
  const [on, setOn] = useState(false);
  useFrame(() => { if (!on && (scroll.near > 0 || scroll.hub > 0)) setOn(true); });
  // fetch + parse every hub model while the browser is idle after load, long before anyone scrolls there
  useEffect(() => {
    const files = [...ROCKS, ...HUB_MODELS.hulls, HUB_MODELS.cruiser, HUB_MODELS.fighter, HUB_MODELS.projects, HUB_MODELS.experiences, ...(HUB_MODELS.droid ? [HUB_MODELS.droid] : [])];
    const go = () => files.forEach((n) => useLoader.preload(GLTFLoader, HUB(n)));
    const id = "requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 4000 }) : (setTimeout(go, 2000) as unknown as number);
    return () => ("cancelIdleCallback" in window ? cancelIdleCallback(id) : clearTimeout(id));
  }, []);
  if (!on) return null;
  const per = phone ? 12 : 26;
  return (
    <Suspense fallback={null}>
      {ROCKS.map((n, i) => <RockField key={n} url={HUB(n)} count={per} seed={11 + i * 97} />)}
      <Hulls />
      <Ships />
      {HUB_MODELS.droid && <R2 file={HUB_MODELS.droid} />}
    </Suspense>
  );
}

export default function SpaceScene({ phone }: { phone: boolean }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[45, 48, 32]} />
        <shaderMaterial vertexShader={skyVert} fragmentShader={nebulaFrag} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <Novas />
      <HubModels phone={phone} />
    </group>
  );
}
