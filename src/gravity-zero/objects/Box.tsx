import React from "react";
import * as THREE from "three";
import { GEO, mat } from "../materials";
import { Vec3 } from "../math";

type MeshProps = {
  geo?: THREE.BufferGeometry;
  color: string;
  p?: Vec3;
  s?: Vec3 | number;
  r?: Vec3;
  shadow?: boolean;
  receive?: boolean;
  emissive?: string;
  glow?: number;
};

/** Malha curta: geometria compartilhada + material por cor. */
export const M: React.FC<MeshProps> = ({
  geo = GEO.box,
  color,
  p,
  s,
  r,
  shadow = true,
  receive = false,
  emissive,
  glow,
}) => (
  <mesh
    geometry={geo}
    material={mat(color, { emissive, emissiveIntensity: glow })}
    position={p}
    scale={typeof s === "number" ? [s, s, s] : s}
    rotation={r}
    castShadow={shadow}
    receiveShadow={receive}
  />
);
