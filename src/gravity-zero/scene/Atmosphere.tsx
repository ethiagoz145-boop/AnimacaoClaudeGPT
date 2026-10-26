import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { PALETTE } from "../materials";
import { zeroG } from "../physics";
import { useSceneTime } from "../SceneTime";

const tmpA = new THREE.Color();
const tmpB = new THREE.Color();

export const mixColor = (a: string, b: string, t: number) =>
  "#" + tmpA.set(a).lerp(tmpB.set(b), t).getHexString();

/**
 * Céu em gradiente, neblina e luzes. Durante a gravidade zero o mundo
 * ganha um tom violeta/rosado: a "temperatura" emocional da cena muda.
 */
export const Atmosphere: React.FC = () => {
  const t = useSceneTime();
  const z = zeroG(t);
  const top = mixColor(PALETTE.skyTop, PALETTE.skyTopZero, z * 0.85);
  const horizon = mixColor(PALETTE.skyHorizon, PALETTE.skyHorizonZero, z * 0.8);

  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color() },
          horizon: { value: new THREE.Color() },
        },
        vertexShader: /* glsl */ `
          varying vec3 vPos;
          void main() {
            vPos = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 top;
          uniform vec3 horizon;
          varying vec3 vPos;
          void main() {
            float h = clamp(vPos.y * 1.6 + 0.05, 0.0, 1.0);
            vec3 c = mix(horizon, top, pow(h, 0.7));
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );

  useLayoutEffect(() => {
    (skyMat.uniforms.top.value as THREE.Color).set(top);
    (skyMat.uniforms.horizon.value as THREE.Color).set(horizon);
  }, [skyMat, top, horizon]);

  const sun = mixColor("#fff1d6", "#ffd0f0", z);
  const hemiSky = mixColor("#bfe3ff", "#b9a2ff", z);
  const hemiGround = mixColor("#9c8a6a", "#7a5a8a", z);

  return (
    <>
      <mesh material={skyMat} renderOrder={-1}>
        <sphereGeometry args={[400, 32, 16]} />
      </mesh>
      <fog attach="fog" args={[horizon, 45, 150]} />
      <hemisphereLight args={[hemiSky, hemiGround, 1.35]} />
      <directionalLight
        color={sun}
        intensity={2.6}
        position={[-22, 34, 18]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={38}
        shadow-camera-bottom={-38}
        shadow-camera-near={1}
        shadow-camera-far={120}
      />
      {/* contraluz fria para destacar silhuetas */}
      <directionalLight color={mixColor("#9fd0ff", "#ff9fe0", z)} intensity={0.6} position={[20, 12, -30]} />
    </>
  );
};
