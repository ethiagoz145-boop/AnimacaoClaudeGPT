import React, { useMemo } from "react";
import * as THREE from "three";
import { easeInCubic, easeOutCubic, progress } from "../math";
import { T } from "../timeline";
import { useSceneTime } from "../SceneTime";

const ringGeo = new THREE.RingGeometry(0.92, 1, 64);
const shellGeo = new THREE.IcosahedronGeometry(1, 2);

/**
 * Pulso que "desliga" a gravidade (expande a partir do cruzamento) e,
 * na volta, uma implosão rápida que a "religa".
 */
export const Shockwave: React.FC = () => {
  const t = useSceneTime();
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#c9f6ff",
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    [],
  );
  const shellMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#d9b8ff",
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    [],
  );

  const out = progress(t, T.shock, T.shock + 45);
  const back = progress(t, T.gravityBack, T.fallStart);
  let radius = 0;
  let alpha = 0;
  if (out > 0 && out < 1) {
    radius = 2 + easeOutCubic(out) * 90;
    alpha = 1 - out;
  } else if (back > 0 && back < 1) {
    radius = 90 * (1 - easeInCubic(back)) + 1;
    alpha = Math.sin(back * Math.PI);
  }
  if (alpha <= 0) return null;
  ringMat.opacity = alpha * 0.9;
  shellMat.opacity = alpha * 0.12;

  return (
    <group position={[0, 0.08, 0]}>
      <mesh geometry={ringGeo} material={ringMat} rotation={[-Math.PI / 2, 0, 0]} scale={radius} />
      <mesh geometry={ringGeo} material={ringMat} rotation={[-Math.PI / 2, 0, 0]} scale={radius * 0.8} />
      <mesh geometry={shellGeo} material={shellMat} scale={[radius, radius * 0.45, radius]} />
    </group>
  );
};
