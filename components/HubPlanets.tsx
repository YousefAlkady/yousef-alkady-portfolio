"use client";
// Act 3 hub extra built in code: ShatteringMoon (UniLink, a moon breaking apart in purple lightning).
// Projects/Experiences planets themselves are downloaded GLBs (Galaxy).
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

const L = /* glsl */ `normalize(vec3(6.0, 2.0, 1.5))`; // hub key light, matches the directionalLight in Galaxy

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;} vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return mod289(((x*34.)+1.)*x);} vec4 tis(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i);
  vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx; vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_); vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw); vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 nr=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))); p0*=nr.x; p1*=nr.y; p2*=nr.z; p3*=nr.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ return snoise(p)*0.55 + snoise(p*2.1)*0.28 + snoise(p*4.3)*0.17; }
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// surface relief: tilt the normal by the screen-space slope of a height value (bump mapping without a normal map)
vec3 bump(vec3 n, vec3 pos, float h, float k){
  vec3 dpx = dFdx(pos), dpy = dFdy(pos); float dhx = dFdx(h), dhy = dFdy(h);
  vec3 r1 = cross(dpy, n), r2 = cross(n, dpx); float det = dot(dpx, r1);
  vec3 g = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * n - k * g);
}
vec3 spin(vec3 p, vec3 ax, float a){ return p * cos(a) + cross(ax, p) * sin(a) + ax * dot(ax, p) * (1.0 - cos(a)); }
`;

// object-space position, world normal, view direction, uv
const VERT = /* glsl */ `
varying vec3 vP; varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying vec3 vW;
void main(){
  vP = position; vUv = uv;
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
  vV = normalize(cameraPosition - w.xyz);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

/* ---------- UniLink: moon shattering in purple lightning ---------- */
const moonFrag = /* glsl */ `
uniform sampler2D uMap; uniform vec3 uS; uniform float uR; uniform float uTime;
varying vec3 vP; varying vec3 vN; varying vec3 vV; varying vec2 vUv; varying vec3 vW;
${NOISE}
void main(){
  vec3 p = normalize(vP);
  float crack = dot(p, uS) - 0.45 - snoise(p * 4.0) * 0.18;  // jagged break facing the blast
  if (crack > 0.0) discard;
  vec3 purple = vec3(0.65, 0.3, 1.0);
  if (!gl_FrontFacing) {                                     // looking into the broken interior: molten purple core
    gl_FragColor = vec4(purple * (0.6 + 0.4 * snoise(p * 8.0 + uTime * 0.5)), 1.0);
    #include <colorspace_fragment>
    return;
  }
  vec2 muv = vUv + vec2(uTime * 0.004, 0.0);              // surface turns slowly; the break stays put
  float tone = texture2D(uMap, muv).r;
  vec3 n = bump(normalize(vN), vW, tone * uR * 0.06, 1.0); // craters from the texture's own shading
  vec3 col = vec3(tone) * vec3(0.95, 0.93, 1.0) * (0.05 + smoothstep(-0.1, 1.0, dot(n, ${L})) * 1.15);
  float edge = smoothstep(-0.12, 0.0, crack);
  col += purple * edge * 2.0;
  col += purple * pow(1.0 - max(dot(normalize(vN), vV), 0.0), 3.0) * 0.5;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,230,255,1)");
  grd.addColorStop(0.25, "rgba(190,90,255,0.55)");
  grd.addColorStop(1, "rgba(80,0,160,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const BOLT_SEG = 18;
export function ShatteringMoon({ r }: { r: number }) {
  const map = useLoader(THREE.TextureLoader, "/media/planets/moon.webp");
  const S = useMemo(() => new THREE.Vector3(-0.75, -0.25, 0.6).normalize(), []);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const rocks = useRef<THREE.InstancedMesh>(null);
  const bolts = useRef<THREE.Line[]>([]);
  const uniforms = useMemo(() => ({ uMap: { value: map }, uS: { value: S }, uR: { value: r }, uTime: { value: 0 } }), [map, S, r]);
  const glow = useMemo(glowTexture, []);
  const N = 70;
  // each rock: direction (cone around S), speed, phase, size
  const seeds = useMemo(() => Array.from({ length: N }, () => {
    const dir = S.clone().add(new THREE.Vector3().randomDirection().multiplyScalar(0.55)).normalize();
    return { dir, speed: 0.05 + Math.random() * 0.1, phase: Math.random(), size: r * (0.03 + Math.random() ** 2 * 0.16), rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, 0) };
  }), [S, r]);
  const boltGeos = useMemo(() => [0, 1].map(() => new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array((BOLT_SEG + 1) * 3), 3))), []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const lastBolt = useRef(-1);
  useLayoutEffect(() => { if (rocks.current) rocks.current.frustumCulled = false; }, []);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (mat.current) mat.current.uniforms.uTime.value = t;
    const m = rocks.current;
    if (m) {
      seeds.forEach((k, i) => {
        const f = (t * k.speed + k.phase) % 1; // 0..1 along its flight, then respawn at the break
        o.position.copy(k.dir).multiplyScalar(r * (0.75 + f * 3.2));
        o.rotation.set(k.rot.x + t * 0.5, k.rot.y + t * 0.3, 0);
        o.scale.setScalar(k.size * (1 - f * 0.6));
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    }
    // lightning re-strikes about 8 times a second along a diagonal through the break
    if (Math.floor(t * 8) !== lastBolt.current) {
      lastBolt.current = Math.floor(t * 8);
      boltGeos.forEach((g, b) => {
        const a = g.attributes.position as THREE.BufferAttribute;
        const from = new THREE.Vector3(-3.2, 2.6 + b * 0.5, 0.4).multiplyScalar(r);
        const to = new THREE.Vector3(3.0, -2.8 + b * 0.4, 0.2).multiplyScalar(r);
        for (let i = 0; i <= BOLT_SEG; i++) {
          const p = from.clone().lerp(to, i / BOLT_SEG);
          if (i > 0 && i < BOLT_SEG) p.add(new THREE.Vector3().randomDirection().multiplyScalar(r * 0.18));
          a.setXYZ(i, p.x, p.y, p.z);
        }
        a.needsUpdate = true;
        if (bolts.current[b]) bolts.current[b].visible = Math.random() > 0.25;
      });
    }
  });
  const geo = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[r, 96, 64]} />
        <shaderMaterial ref={mat} vertexShader={VERT} fragmentShader={moonFrag} uniforms={uniforms} side={THREE.DoubleSide} />
      </mesh>
      <instancedMesh ref={rocks} args={[geo, undefined, N]}>
        <meshStandardMaterial color="#2b2236" roughness={0.9} emissive="#7a2cff" emissiveIntensity={0.35} flatShading />
      </instancedMesh>
      <sprite position={S.clone().multiplyScalar(r * 0.9)} scale={[r * 4.5, r * 4.5, 1]}>
        <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {boltGeos.map((g, b) => (
        <primitive
          key={b}
          ref={(el: THREE.Line | null) => { if (el) bolts.current[b] = el; }}
          object={new THREE.Line(g, new THREE.LineBasicMaterial({ color: b ? "#f0c8ff" : "#b56bff", transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }))}
        />
      ))}
    </group>
  );
}
