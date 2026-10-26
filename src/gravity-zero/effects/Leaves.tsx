import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { LEAF_TREES } from "../layout";
import { GEO, PALETTE } from "../materials";
import { easeOutCubic, progress, rng } from "../math";
import { T } from "../timeline";
import { useSceneTime } from "../SceneTime";

const COUNT = 180;

type Leaf = {
  ox: number;
  oy: number;
  oz: number;
  release: number;
  height: number;
  radius: number;
  a0: number;
  w: number;
  fallSpeed: number;
  spin: number;
  color: string;
};

const LEAVES: Leaf[] = (() => {
  const r = rng("leaves");
  return Array.from({ length: COUNT }).map((_, i) => {
    const tree = LEAF_TREES[i % LEAF_TREES.length];
    return {
      ox: tree.x + r.range(-1, 1) * tree.s,
      oy: (2.2 + r.range(-0.5, 0.8)) * tree.s,
      oz: tree.z + r.range(-1, 1) * tree.s,
      release: T.shock + 4 + r.range(0, 80),
      height: r.range(2.5, 9),
      radius: r.range(0.5, 2.5),
      a0: r.range(0, Math.PI * 2),
      w: r.range(0.008, 0.03) * r.sign(),
      fallSpeed: r.range(0.05, 0.09),
      spin: r.range(0.03, 0.09),
      color: r.pick([...PALETTE.leaves, "#f4a259", "#e9c46a"]),
    };
  });
})();

const dummy = new THREE.Object3D();
const color = new THREE.Color();

const leafPos = (l: Leaf, t: number): [number, number, number] => {
  const k = easeOutCubic(progress(t, l.release, l.release + 160));
  const ang = l.a0 + Math.max(0, t - l.release) * l.w;
  return [l.ox + Math.cos(ang) * l.radius * k, l.oy + l.height * k, l.oz + Math.sin(ang) * l.radius * k];
};

/** Folhas soltas das copas: espiralam para cima e depois caem planando. */
export const Leaves: React.FC = () => {
  const t = useSceneTime();
  const ref = useRef<THREE.InstancedMesh>(null);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9, side: THREE.DoubleSide }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    LEAVES.forEach((l, i) => {
      if (t < l.release) {
        dummy.scale.setScalar(0);
        dummy.position.set(l.ox, l.oy, l.oz);
      } else {
        const tumble = (t - l.release) * l.spin;
        let [x, y, z] = leafPos(l, Math.min(t, T.gravityBack));
        let rx = tumble;
        let rz = tumble * 0.7;
        const fallFrom = T.fallStart + (i % 9);
        if (t > fallFrom) {
          // planam devagar: as folhas ainda caem quando todo o resto já pousou
          const dt = Math.min(t - fallFrom, (y - 0.18) / l.fallSpeed);
          y -= dt * l.fallSpeed;
          x += Math.sin(dt * 0.12 + l.a0) * 0.6;
          z += Math.cos(dt * 0.09 + l.a0) * 0.3;
          if (dt < t - fallFrom) {
            rx = 0;
            rz = 0;
          } else {
            rx = Math.sin(dt * 0.12 + l.a0) * 0.8;
          }
          if (t > T.again) y += Math.pow(progress(t, T.again, T.end), 2) * 1.5 * (0.5 + (i % 5) * 0.2);
        }
        dummy.position.set(x, y, z);
        dummy.rotation.set(rx, l.a0, rz);
        const grow = Math.min(1, (t - l.release) / 10);
        dummy.scale.set(0.34 * grow, 0.06 * grow, 0.22 * grow);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(l.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [t]);

  return <instancedMesh ref={ref} args={[GEO.ico, material, COUNT]} castShadow frustumCulled={false} />;
};
