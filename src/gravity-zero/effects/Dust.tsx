import React, { useMemo } from "react";
import * as THREE from "three";
import { IMPACTS } from "../layout";
import { GEO } from "../materials";
import { easeOutCubic, rng } from "../math";
import { useSceneTime } from "../SceneTime";

const LIFE = 30;

const Puff: React.FC<{ x: number; z: number; frame: number; mass: number; seed: string }> = ({
  x,
  z,
  frame,
  mass,
  seed,
}) => {
  const t = useSceneTime();
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#fff4e0",
        emissive: "#fff4e0",
        emissiveIntensity: 0.35,
        flatShading: true,
        roughness: 1,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  const age = t - frame;
  if (age < 0 || age > LIFE) return null;
  const k = easeOutCubic(age / LIFE);
  const size = Math.min(1.5, 0.35 + mass * 0.22);
  const count = mass > 2 ? 9 : 6;
  material.opacity = 0.75 * Math.pow(1 - age / LIFE, 1.5);
  const r = rng(`puff-${seed}`);
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + r.range(0, 0.6);
        const dist = (0.5 + k * 2.4) * size;
        const s = size * (0.45 + k * 0.5) * r.range(0.7, 1.2);
        return (
          <mesh
            key={i}
            geometry={GEO.ico}
            material={material}
            position={[Math.cos(a) * dist, 0.15 + k * 0.6 * r.range(0.4, 1.2), Math.sin(a) * dist]}
            scale={s}
          />
        );
      })}
    </group>
  );
};

/** Nuvens de poeira estilizadas em cada impacto (momentos pré-calculados). */
export const Dust: React.FC = () => (
  <>
    {IMPACTS.filter((im) => im.mass >= 0.4).map((im) => (
      <Puff key={im.id} x={im.x} z={im.z} frame={im.frame} mass={im.mass} seed={im.id} />
    ))}
  </>
);
