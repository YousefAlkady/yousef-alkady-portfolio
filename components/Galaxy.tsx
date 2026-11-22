"use client";
import { useMemo, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PLANETS, galaxy } from "@/lib/galaxy";
import { HUB_MODELS, hubUrl } from "@/lib/hubModels";
import SpaceScene from "./SpaceScene";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// downloaded planet models, normalised to radius 1 by the export; slow self-rotation, lit by the hub sun
function HubPlanet({ file, r }: { file: string; r: number }) {
  const gltf = useLoader(GLTFLoader, hubUrl(file));
  const obj = useMemo(() => gltf.scene.clone(true), [gltf]);
  const clouds = useMemo(() => obj.getObjectByName("stylized_clouds") ?? null, [obj]);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12;
    if (clouds) clouds.rotation.y += dt * 0.08; // clouds drift over the ground
  });
  return <group ref={ref} scale={r}><primitive object={obj} /></group>;
}
import { ShatteringMoon } from "./HubPlanets";
import { scroll } from "@/lib/scrollStore";

const HOME = new THREE.Vector3(0, 0, 6);
const ORIGIN = new THREE.Vector3();
const parentIndex = PLANETS.map((p) => (p.orbit ? PLANETS.findIndex((q) => q.id === p.orbit) : -1));

function starGeometry(count: number) {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(20 + Math.random() * 20);
    a.set([v.x, v.y, v.z], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(a, 3));
  return g;
}

// Surface maps: Solar System Scope (CC BY 4.0), credited in the contact section. Other worlds are built in code (HubPlanets.tsx).
const TEX = ["earth-day", "earth-night", "earth-clouds"].map((n) => `/media/planets/${n}.webp`);
const GLOW: Record<string, string> = { projects: "#ff4f7a", unilink: "#a36bff", experiences: "#ffb347", education: "#5aa8ff" };
// fresnel rim: a thin atmosphere that glows at the planet's edge
const rimVert = /* glsl */ `varying vec3 vN; varying vec3 vV;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const rimFrag = /* glsl */ `uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
void main(){ float f = pow(clamp(0.75 + dot(vN, vV), 0.0, 1.0), 3.0); gl_FragColor = vec4(uColor * f * 1.4, f); }`;
function Rim({ r, color }: { r: number; color: string }) {
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color(color) } }), [color]);
  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[r, 48, 32]} />
      <shaderMaterial vertexShader={rimVert} fragmentShader={rimFrag} uniforms={uniforms} transparent depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export default function Galaxy() {
  const maps = useLoader(THREE.TextureLoader, TEX);
  useMemo(() => maps.forEach((t, i) => { if (i !== 2) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; }), [maps]);
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Object3D | null)[]>([]);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const world = useMemo(() => PLANETS.map(() => new THREE.Vector3()), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const goal = useMemo(() => new THREE.Vector3(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const warmed = useRef(false);
  const reduced = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const stars = useMemo(() => starGeometry(window.innerWidth < 768 ? 300 : 700), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const h = scroll.hub;
    // compile the hub's shaders during the drive-off, so the first hub frame doesn't stall on them
    if (!warmed.current && scroll.near > 0) { g.visible = true; state.gl.compileAsync(state.scene, state.camera); warmed.current = true; }
    g.visible = h > 0;
    if (!g.visible) return;
    g.scale.setScalar(Math.max(0.001, 1 - Math.pow(1 - h, 3)));
    const t = state.clock.elapsedTime;
    const narrow = size.width / size.height < 0.85, ks = narrow ? 0.6 : 1; // portrait: stacked layout, smaller planets

    PLANETS.forEach((p, i) => {
      const m = meshes.current[i];
      if (!m) return;
      const pi = parentIndex[i];
      if (pi >= 0) {
        const c = meshes.current[pi]!.position;
        const a = reduced ? 0.8 : 0.8 + t * 0.25;
        const o = PLANETS[pi].r * ks * 1.7; // orbit radius follows the parent's size
        m.position.set(c.x + Math.cos(a) * o, c.y + o * 0.3, c.z + Math.sin(a) * o);
      } else {
        const at = narrow && p.m ? p.m : p.pos;
        m.position.set(at[0], at[1], at[2]);
      }
      m.scale.setScalar(ks);
      if (!reduced && p.id === "education") m.rotation.y += dt * 0.2; // the others keep their designed angle and spin inside
      m.getWorldPosition(world[i]);
    });

    // camera: short jump to the focused planet, or back to the overview
    const f = galaxy.focus;
    if (f >= 0) goal.copy(world[f]).add(v.set(0, galaxy.dive ? 0 : 0.2, PLANETS[f].r * (galaxy.dive ? 1.15 : 4))); // dive = fly into it
    else goal.copy(HOME);
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4);
    camera.position.lerp(goal, k);
    look.lerp(f >= 0 ? world[f] : ORIGIN, k);
    camera.lookAt(look);

    // place the DOM buttons over the planets (hover, click and keyboard live in the DOM)
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    PLANETS.forEach((p, i) => {
      const el = galaxy.els[i];
      if (!el) return;
      v.copy(world[i]).project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      const dist = camera.position.distanceTo(world[i]);
      const rad = Math.max(22, ((p.r * ks * g.scale.x) / (dist * tanHalf)) * (size.height / 2));
      el.style.transform = `translate(${x - rad}px, ${y - rad}px)`;
      el.style.width = el.style.height = `${rad * 2}px`;
      el.style.display = v.z > 1 ? "none" : "";
    });
  });

  return (
    <group ref={group} visible={false}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 2, 1.5]} intensity={2.4} />
      <points geometry={stars}>
        <pointsMaterial size={0.08} color="#cfd2ff" sizeAttenuation />
      </points>
      <SpaceScene phone={size.width < 768} />
      {PLANETS.map((p, i) => (
        <group key={p.id} ref={(el) => { meshes.current[i] = el; }}>
          {p.id === "education" ? (
            <mesh>
              <sphereGeometry args={[p.r, 64, 48]} />
              <meshStandardMaterial map={maps[0]} emissiveMap={maps[1]} emissive="#ffd9a0" emissiveIntensity={0.9} roughness={0.75} metalness={0} />
            </mesh>
          ) : p.id === "projects" ? (
            <HubPlanet file={HUB_MODELS.projects} r={p.r} />
          ) : p.id === "experiences" ? (
            <HubPlanet file={HUB_MODELS.experiences} r={p.r} />
          ) : (
            <ShatteringMoon r={p.r} />
          )}
          {p.id === "education" && (
            <mesh scale={1.012}>
              <sphereGeometry args={[p.r, 64, 48]} />
              <meshStandardMaterial alphaMap={maps[2]} color="#ffffff" transparent depthWrite={false} roughness={1} />
            </mesh>
          )}
          <Rim r={p.r} color={GLOW[p.id]} />
        </group>
      ))}
    </group>
  );
}
