import * as THREE from "three";

/** Paleta: manhã quente, pastéis saturados, sombras azuladas. */
export const PALETTE = {
  grass: "#86c96a",
  grassDark: "#6db35a",
  road: "#454b5c",
  roadLine: "#f4ecd6",
  sidewalk: "#e9dcc4",
  curb: "#cfc0a6",
  skyTop: "#4fa8e0",
  skyHorizon: "#ffd9a8",
  skyTopZero: "#3b2f7a",
  skyHorizonZero: "#ff9fc4",
  walls: ["#ff8a73", "#ffc857", "#5fbfb2", "#a493e8", "#f6ead6", "#7fb7e8"],
  roofs: ["#c2464b", "#3d5a80", "#8a4f7d", "#2f6f73", "#b5633a"],
  cars: ["#e63946", "#ffb703", "#219ebc", "#f1f1f1", "#7ad3a8", "#8e6cd8", "#ff7f50"],
  shirts: ["#ef476f", "#118ab2", "#ffd166", "#06d6a0", "#f78c6b", "#9b5de5", "#ffffff"],
  pants: ["#2b2d42", "#3d405b", "#5c4d7d", "#264653"],
  skin: ["#f2c6a0", "#d9a07a", "#a8714f", "#7a4a32", "#f6d5b8"],
  hair: ["#2b1d14", "#5a3825", "#d9a441", "#1a1a1a", "#8c3b2a"],
  trunk: "#8b5a3c",
  leaves: ["#4caf50", "#6cc04a", "#3e9a5a", "#9ccc3c"],
  window: "#bfe6ff",
  windowFrame: "#ffffff",
  dark: "#22223b",
  metal: "#9aa3b5",
  water: "#7fd3ff",
};

const matCache = new Map<string, THREE.MeshStandardMaterial>();

/** Material compartilhado por cor (evita centenas de materiais duplicados). */
export const mat = (
  color: string,
  opts: { emissive?: string; emissiveIntensity?: number; roughness?: number } = {},
) => {
  const key = `${color}|${opts.emissive ?? ""}|${opts.emissiveIntensity ?? 0}|${opts.roughness ?? 0.85}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness ?? 0.85,
      metalness: 0,
      flatShading: true,
      emissive: opts.emissive ?? "#000000",
      emissiveIntensity: opts.emissiveIntensity ?? 0,
    });
    matCache.set(key, m);
  }
  return m;
};

/** Geometrias unitárias compartilhadas; o tamanho vem do `scale` da malha. */
export const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 10),
  cyl6: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
  cone4: new THREE.ConeGeometry(0.5, 1, 4),
  cone7: new THREE.ConeGeometry(0.5, 1, 7),
  prism: new THREE.CylinderGeometry(0.5, 0.5, 1, 3),
  ico: new THREE.IcosahedronGeometry(0.5, 0),
  ico1: new THREE.IcosahedronGeometry(0.5, 1),
  sphere: new THREE.SphereGeometry(0.5, 10, 8),
  dodeca: new THREE.DodecahedronGeometry(0.5, 0),
  wheel: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
  plane: new THREE.PlaneGeometry(1, 1),
};
