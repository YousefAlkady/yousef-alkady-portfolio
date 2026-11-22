"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function Tower({ spin }: { spin: boolean }) {
  const gltf = useLoader(GLTFLoader, "/media/planets/aaib.glb");
  // normalise: 1 unit across its footprint, centred on the origin (the head office is wide and low, so it is sized by
  // width, as the old site's token did; sizing by the largest side left it a thin sliver)
  const obj = useMemo(() => {
    const o = gltf.scene.clone(true);
    const b = new THREE.Box3().setFromObject(o), sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const k = 1 / Math.max(sz.x, sz.z);
    o.scale.setScalar(k);
    o.position.copy(c).multiplyScalar(-k);
    return o;
  }, [gltf]);
  const g = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (!g.current || !spin) return;
    g.current.rotation.y += dt * 0.6; // one full turn about every 10 s
    g.current.position.y = Math.sin(state.clock.elapsedTime * 1.6) * 0.035; // float
  });
  return <group ref={g} rotation={[0, -0.5, 0]}><primitive object={obj} /></group>;
}

export default function AaibTokenScene({ run }: { run: boolean }) {
  const reduced = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  return (
    <Canvas dpr={[1, 2]} camera={{ fov: 35, position: [0, 0.55, 1.45] }} frameloop={run && !reduced ? "always" : "demand"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }} onCreated={({ camera }) => camera.lookAt(0, -0.02, 0)}>
      <hemisphereLight args={["#cfe3ff", "#b9a78c", 1.6]} />
      <directionalLight position={[2, 3, 2]} intensity={2.6} color="#fff3e0" />
      <Suspense fallback={null}><Tower spin={!reduced} /></Suspense>
    </Canvas>
  );
}
