import { random } from "remotion";

export type Vec3 = [number, number, number];

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const progress = (t: number, a: number, b: number) =>
  clamp01((t - a) / (b - a));

export const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
export const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInCubic = (x: number) => x * x * x;
export const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
export const smoothstep = (a: number, b: number, t: number) => {
  const x = progress(t, a, b);
  return x * x * (3 - 2 * x);
};

export const lerpVec = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/** Gerador determinístico: mesma semente, mesmos valores, em qualquer render. */
export const rng = (seed: string) => {
  let i = 0;
  const next = () => random(`${seed}-${i++}`);
  return {
    next,
    range: (a: number, b: number) => lerp(a, b, next()),
    pick: <X>(arr: readonly X[]): X => arr[Math.floor(next() * arr.length) % arr.length],
    sign: () => (next() < 0.5 ? -1 : 1),
  };
};

/** Ruído suave e determinístico (soma de senos incomensuráveis). */
export const wobble = (t: number, seed: number) =>
  Math.sin(t * 0.37 + seed * 1.7) * 0.5 +
  Math.sin(t * 0.83 + seed * 3.1) * 0.3 +
  Math.sin(t * 1.91 + seed * 5.3) * 0.2;
