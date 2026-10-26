import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FOUNTAIN } from "../layout";
import { GEO, mat, PALETTE } from "../materials";
import { progress, rng } from "../math";
import { T } from "../timeline";
import { useSceneTime } from "../SceneTime";
import { M } from "../objects/Box";

// ------------------------------------------------------------- nuvens

const CLOUDS = (() => {
  const r = rng("clouds");
  return Array.from({ length: 12 }).map(() => ({
    x: r.range(-140, 140),
    y: r.range(55, 80),
    z: r.range(-220, -90),
    s: r.range(9, 16),
    puffs: Array.from({ length: 4 }).map(() => [r.range(-1.2, 1.2), r.range(-0.2, 0.4), r.range(-0.6, 0.6), r.range(0.7, 1.2)]),
  }));
})();

export const Clouds: React.FC = () => {
  const t = useSceneTime();
  return (
    <>
      {CLOUDS.map((c, i) => (
        <group key={i} position={[c.x + t * 0.012, c.y, c.z]} scale={c.s}>
          {c.puffs.map(([x, y, z, s], j) => (
            <M key={j} geo={GEO.dodeca} color="#ffffff" p={[x, y, z]} s={s} shadow={false} emissive="#ffffff" glow={0.55} />
          ))}
        </group>
      ))}
    </>
  );
};

// ------------------------------------------------------------- pássaros

/** Pássaros circulando: alheios ao caos (eles já sabiam voar). */
export const Birds: React.FC = () => {
  const t = useSceneTime();
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = t * 0.008 + i * 0.5;
        const rad = 16 + i * 1.5;
        const flap = Math.sin(t * 0.5 + i * 1.3) * 0.7;
        return (
          <group
            key={i}
            position={[Math.cos(a) * rad + 4, 19 + Math.sin(t * 0.03 + i) * 0.8 + i * 0.8, Math.sin(a) * rad - 6]}
            rotation={[0, -a, 0]}
          >
            <group rotation={[0, Math.PI / 2, 0]}>
              <M color="#2b2d42" s={[0.5, 0.14, 0.16]} />
              <group rotation={[flap, 0, 0]}>
                <M color="#3d405b" p={[0, 0, 0.35]} s={[0.25, 0.04, 0.6]} />
              </group>
              <group rotation={[-flap, 0, 0]}>
                <M color="#3d405b" p={[0, 0, -0.35]} s={[0.25, 0.04, 0.6]} />
              </group>
            </group>
          </group>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------- fonte

const DROPS = 40;
const PERIOD = 34;
const G = 0.009;
const dummy = new THREE.Object3D();

/**
 * Água da fonte: arcos parabólicos normais; sem gravidade, as gotas
 * seguem em linha reta e viram bolhas flutuantes; na volta, despencam.
 */
export const FountainWater: React.FC = () => {
  const t = useSceneTime();
  const ref = useRef<THREE.InstancedMesh>(null);
  const material = useMemo(() => mat(PALETTE.water, { emissive: "#5fc0ff", emissiveIntensity: 0.35, roughness: 0.3 }), []);
  const drops = useMemo(() => {
    const r = rng("drops");
    return Array.from({ length: DROPS }).map((_, i) => ({
      phase: (i / DROPS) * PERIOD,
      ang: i * 2.39996,
      vh: r.range(0.03, 0.05),
      vy: r.range(0.13, 0.16),
      size: r.range(0.14, 0.26),
    }));
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const off = T.shock + 6;
    drops.forEach((d, i) => {
      // última emissão antes do desligamento (ou antes de agora, em gravidade normal)
      const restart = T.fallStart + 50;
      const zero = t >= off && t < restart;
      const ref0 = zero ? off : t;
      const emitted = ref0 - ((((ref0 - d.phase) % PERIOD) + PERIOD) % PERIOD);
      const tau = (zero ? off : t) - emitted;
      let x = Math.cos(d.ang) * d.vh * tau;
      let z = Math.sin(d.ang) * d.vh * tau;
      let y = 1.4 + d.vy * tau - 0.5 * G * tau * tau;
      let scale = d.size;
      if (zero) {
        const vy = d.vy - G * tau;
        const damp = 70 * (1 - Math.exp(-(Math.min(t, T.gravityBack) - off) / 70));
        x += Math.cos(d.ang) * d.vh * damp * 0.6;
        z += Math.sin(d.ang) * d.vh * damp * 0.6;
        y += Math.max(vy, 0.02) * damp * 0.5;
        scale = d.size * (1 + 0.6 * progress(t, off, off + 60)); // gotas viram bolhas
        if (t > T.fallStart) {
          const dt = t - T.fallStart;
          y -= 0.5 * 0.045 * dt * dt;
          if (y < 0.5) scale = 0;
        }
      } else if (y < 0.5) {
        scale = 0;
      }
      dummy.position.set(FOUNTAIN[0] + x, y, FOUNTAIN[1] + z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(Math.max(0, scale));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [t, drops]);

  return <instancedMesh ref={ref} args={[GEO.ico1, material, DROPS]} frustumCulled={false} />;
};
