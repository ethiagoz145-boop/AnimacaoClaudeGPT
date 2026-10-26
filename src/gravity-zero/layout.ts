import { PALETTE } from "./materials";
import { rng, Vec3 } from "./math";
import { Body, FloatSpec, impactOf } from "./physics";

/**
 * Layout da cidade: dados puros, compostos à mão para a câmera
 * (rua principal no eixo X, rua transversal no eixo Z, parque ao fundo).
 * Convenção: modelos olham para +X local; yaw 0 = andando para +X.
 */

export const ROAD_HALF = 2.5;
export const SIDEWALK = 1.5;
const PI = Math.PI;

type Weight = "light" | "medium" | "heavy" | "huge";

const floatFor = (seed: string, w: Weight, over: Partial<FloatSpec> = {}): FloatSpec => {
  const r = rng(`float-${seed}`);
  const base: Record<Weight, FloatSpec> = {
    light: {
      delay: r.range(0, 22),
      rise: 70,
      height: r.range(5, 10),
      bob: 0.25,
      spin: [r.range(-0.05, 0.05), r.range(-0.04, 0.04), r.range(-0.05, 0.05)],
      drift: [r.range(-1.5, 1.5), r.range(-1.5, 1.5)],
      fallDelay: r.range(5, 15),
      bounce: 0.45,
      again: r.range(1, 1.8),
    },
    medium: {
      delay: r.range(28, 58),
      rise: 90,
      height: r.range(4, 7.5),
      bob: 0.18,
      spin: [r.range(-0.012, 0.012), r.range(-0.01, 0.01), r.range(-0.014, 0.014)],
      drift: [r.range(-1, 1), r.range(-1, 1)],
      fallDelay: r.range(2, 10),
      bounce: 0.25,
      again: r.range(0.4, 0.7),
    },
    heavy: {
      delay: r.range(40, 75),
      rise: 110,
      height: r.range(3.5, 6.5),
      bob: 0.12,
      spin: [r.range(-0.006, 0.006), r.range(-0.005, 0.005), r.range(-0.008, 0.008)],
      drift: [r.range(-0.6, 0.6), r.range(-0.6, 0.6)],
      fallDelay: r.range(0, 5),
      bounce: 0.18,
      again: 0.2,
    },
    huge: {
      delay: 85,
      rise: 120,
      height: 4.5,
      bob: 0.08,
      spin: [0.0015, 0.001, -0.0025],
      drift: [0, 0],
      fallDelay: 2,
      bounce: 0.1,
      again: 0.06,
    },
  };
  return { ...base[w], ...over };
};

// ---------------------------------------------------------------- casas

export type HouseStyle = "gable" | "hip" | "shop";
export type House = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  yaw: number;
  style: HouseStyle;
  wall: string;
  roof: string;
  detail: boolean;
};

const house = (
  x: number,
  z: number,
  style: HouseStyle,
  seed: number,
  extra: Partial<House> = {},
): House => ({
  x,
  z,
  w: style === "shop" ? 5.2 : 4.6,
  d: style === "shop" ? 5 : 4.2,
  h: style === "shop" ? 5.4 : 2.9,
  yaw: z < 0 ? 0 : PI, // fachada voltada para a rua principal
  style,
  wall: PALETTE.walls[seed % PALETTE.walls.length],
  roof: PALETTE.roofs[seed % PALETTE.roofs.length],
  detail: true,
  ...extra,
});

const nearHouses: House[] = [
  house(-29, -9, "hip", 3),
  house(-22, -9, "gable", 0),
  house(-15, -9.4, "hip", 2),
  house(-8.3, -8.6, "shop", 1),
  house(24, -9, "gable", 4),
  house(31, -9.4, "hip", 5),
  house(-29, 9, "gable", 1),
  house(-22, 9, "hip", 5),
  house(-15, 9.2, "gable", 3),
  house(-8.3, 8.6, "shop", 2, { wall: "#ff8a73" }),
  house(8.3, 8.6, "shop", 4, { wall: "#5fbfb2", roof: "#c2464b" }),
  house(15, 9, "gable", 1),
  house(22, 9.2, "hip", 0),
  house(29, 9, "gable", 2),
  // segunda fileira
  house(-22, -17, "gable", 4),
  house(-14, -17.5, "gable", 5),
  house(-6.5, -17, "hip", 0),
  house(24, -17, "hip", 1),
  house(-22, 17, "hip", 2),
  house(-14, 17.5, "gable", 1),
  house(-6.5, 17, "gable", 3),
  house(8, 17, "hip", 4),
  house(16, 17.5, "gable", 0),
  house(24, 17, "hip", 3),
];

const farHouses: House[] = (() => {
  const r = rng("far-houses");
  const out: House[] = [];
  for (let i = 0; i < 70; i++) {
    const x = r.range(-70, 70);
    const z = r.range(-75, 45);
    const nearCore = Math.abs(x) < 34 && Math.abs(z) < 21;
    if (nearCore || Math.abs(x) < 5.5 || Math.abs(z) < 5.5) continue;
    const seed = Math.floor(r.range(0, 30));
    out.push(
      house(x, z, r.next() < 0.5 ? "gable" : "hip", seed, {
        yaw: r.pick([0, PI / 2, PI, -PI / 2]),
        detail: false,
        h: r.range(2.6, 3.6),
      }),
    );
  }
  return out;
})();

export const HOUSES = [...nearHouses, ...farHouses];

// ---------------------------------------------------------------- árvores

export type Tree = { x: number; z: number; s: number; kind: "round" | "pine"; seed: number };

const streetTrees: Tree[] = [
  [-25.5, -4.6],
  [-18.5, -4.6],
  [-12, -4.6],
  [-5.5, 4.6],
  [-12, 4.6],
  [-18.5, 4.6],
  [-25.5, 4.6],
  [5.5, 4.6],
  [12, 4.6],
  [18.5, 4.6],
  [25.5, 4.6],
  [21, -4.6],
  [27.5, -4.6],
].map(([x, z], i) => ({ x, z, s: 0.9 + (i % 3) * 0.12, kind: "round" as const, seed: i }));

const parkTrees: Tree[] = [
  { x: 6.5, z: -15.5, s: 1.25, kind: "round", seed: 20 },
  { x: 18, z: -15, s: 1.15, kind: "pine", seed: 21 },
  { x: 18.5, z: -7, s: 1.0, kind: "round", seed: 22 },
  { x: 6, z: -6.5, s: 0.9, kind: "pine", seed: 23 },
  { x: 12, z: -18.5, s: 1.3, kind: "pine", seed: 24 },
];

const farTrees: Tree[] = (() => {
  const r = rng("far-trees");
  const out: Tree[] = [];
  for (let i = 0; i < 90; i++) {
    const x = r.range(-75, 75);
    const z = r.range(-80, 50);
    if ((Math.abs(x) < 33 && Math.abs(z) < 20) || Math.abs(x) < 4.5 || Math.abs(z) < 4.5) continue;
    out.push({ x, z, s: r.range(0.9, 1.6), kind: r.next() < 0.45 ? "pine" : "round", seed: 100 + i });
  }
  return out;
})();

export const TREES = [...streetTrees, ...parkTrees, ...farTrees];
export const LEAF_TREES = [...streetTrees, ...parkTrees];

// ---------------------------------------------------------------- veículos

export type CarKind = "hatch" | "sedan" | "van" | "taxi" | "bus" | "pickup";
export type Car = Body & { kind: CarKind; color: string };

export const CAR_CENTER = 0.62;
export const BUS_CENTER = 1.15;

const car = (
  id: string,
  kind: CarKind,
  color: string,
  x: number,
  z: number,
  yaw: number,
  speed: number,
  landRot: Vec3,
  over: Partial<FloatSpec> = {},
): Car => {
  const c = kind === "bus" ? BUS_CENTER : CAR_CENTER;
  return {
    id,
    kind,
    color,
    pos: [x, c, z],
    yaw,
    speed,
    float: floatFor(id, kind === "bus" ? "huge" : "heavy", over),
    land: { y: c, rot: landRot },
    mass: kind === "bus" ? 6 : 2.5,
  };
};

export const CARS: Car[] = [
  // carro herói: atravessa o cruzamento e flutua sobre ele
  car("hero", "hatch", "#e63946", -30, 1.25, 0, 0.09, [PI, 0.5, 0], {
    delay: 45,
    height: 3.4,
    spin: [0.004, 0.003, 0.009],
    drift: [0.2, 0.9],
  }),
  car("taxi", "taxi", "#ffb703", 26, -1.25, PI, 0.08, [0, -0.6, 0], { delay: 60, height: 6, drift: [-0.4, -0.9] }),
  car("green", "sedan", "#7ad3a8", 1.25, 30, PI / 2, 0.07, [0, 0.3, 0], { delay: 55, height: 2.0, drift: [2.2, 0] }),
  car("white", "hatch", "#f1f1f1", -1.25, -30, -PI / 2, 0.075, [0, -0.4, PI], { delay: 50, height: 4.6 }),
  car("mint", "sedan", "#219ebc", -58, 1.25, 0, 0.09, [0, 0.2, 0], { delay: 70 }),
  car("purple", "hatch", "#8e6cd8", 48, -1.25, PI, 0.085, [PI, 0.2, 0], { delay: 65 }),
  car("bus", "bus", "#ffc233", 60, -1.25, PI, 0.07, [0, 0.08, 0]),
  car("far1", "sedan", "#ff7f50", 1.25, 55, PI / 2, 0.075, [0, 0.5, 0], { delay: 75 }),
  car("far2", "hatch", "#e63946", -1.25, -55, -PI / 2, 0.08, [0, -0.3, 0], { delay: 70 }),
  // estacionados
  car("van", "van", "#219ebc", -18.5, 7, PI / 2, 0, [0, 0.25, 0], { delay: 62 }),
  car("pickup", "pickup", "#ff7f50", 18.5, 7.2, PI / 2, 0, [PI, -0.3, 0], { delay: 58 }),
  car("parked3", "sedan", "#f1f1f1", -18.5, -7.2, -PI / 2, 0, [0, 0.4, 0], { delay: 66 }),
];

// ---------------------------------------------------------------- pessoas

export type PersonPose = "walk" | "stand" | "sit";
export type Person = Body & {
  pose: PersonPose;
  shirt: string;
  pants: string;
  skin: string;
  hair: string;
  scale: number;
};

export const PERSON_CENTER = 0.62;

const person = (
  id: string,
  x: number,
  z: number,
  yaw: number,
  speed: number,
  pose: PersonPose,
  i: number,
  over: Partial<FloatSpec> = {},
  scale = 1,
): Person => {
  const r = rng(`person-${id}`);
  return {
    id,
    pos: [x, PERSON_CENTER * scale + (pose === "sit" ? 0.0 : 0), z],
    yaw,
    speed,
    pose,
    float: floatFor(id, "medium", over),
    land: { y: 0.24 * scale, rot: [-PI / 2, r.range(-0.6, 0.6), r.range(-0.3, 0.3)] },
    mass: 0.8,
    shirt: PALETTE.shirts[i % PALETTE.shirts.length],
    pants: PALETTE.pants[i % PALETTE.pants.length],
    skin: PALETTE.skin[i % PALETTE.skin.length],
    hair: PALETTE.hair[(i * 3) % PALETTE.hair.length],
    scale,
  };
};

export const PEOPLE: Person[] = [
  person("walker", -14, 3.3, 0, 0.022, "walk", 0, { delay: 40, height: 4.4, drift: [-0.6, -0.3] }),
  person("p2", 8, 3.6, PI, 0.02, "walk", 1, { height: 7.4 }),
  person("p3", -20, -3.3, 0, 0.02, "walk", 2),
  person("cafe1", 7.2, 5.6, -PI / 2, 0, "sit", 3),
  person("cafe2", 10.6, 5.8, PI / 2 + 0.3, 0, "sit", 4),
  person("kid1", 9, -8, -0.6, 0, "stand", 5, { delay: 20 }, 0.75),
  person("kid2", 11.4, -9.6, PI - 0.4, 0, "stand", 6, { delay: 26 }, 0.75),
  person("bench", 14.5, -6.7, -PI / 2, 0, "sit", 7),
  person("p9", -3.3, 14, PI / 2, 0.02, "walk", 8),
  person("corner", -3.5, -3.7, -PI / 2 - 0.5, 0, "stand", 9, { height: 8.2 }),
  person("p11", 16, -3.6, PI, 0.021, "walk", 10),
  person("gardener", -15, 6.4, PI / 2, 0, "stand", 11),
];

export const DOG: Body = {
  id: "dog",
  pos: [-12.8, 0.32, 2.95],
  yaw: 0,
  speed: 0.022,
  float: floatFor("dog", "medium", { delay: 34, height: 2.4, spin: [0.006, 0.004, -0.01], drift: [0.3, -0.4] }),
  land: { y: 0.32, rot: [0, 0.8, 0] },
  mass: 0.4,
};

// ---------------------------------------------------------------- objetos

export type PropKind = "ball" | "cone" | "bin" | "bench" | "crate" | "mailbox" | "umbrella" | "cup";
export type Prop = Body & { kind: PropKind; color: string };

const PROP_CENTER: Record<PropKind, number> = {
  ball: 0.22,
  cone: 0.3,
  bin: 0.45,
  bench: 0.38,
  crate: 0.3,
  mailbox: 0.6,
  umbrella: 1.1,
  cup: 0.1,
};

const prop = (
  id: string,
  kind: PropKind,
  color: string,
  x: number,
  z: number,
  yaw: number,
  over: Partial<FloatSpec> = {},
  yOffset = 0,
): Prop => {
  const r = rng(`prop-${id}`);
  const c = PROP_CENTER[kind];
  const heavyish = kind === "bench" || kind === "umbrella" || kind === "mailbox";
  return {
    id,
    kind,
    color,
    pos: [x, c + yOffset, z],
    yaw,
    float: floatFor(id, heavyish ? "medium" : "light", over),
    land: {
      y: kind === "umbrella" ? 0.3 : kind === "mailbox" ? 0.25 : c,
      rot:
        kind === "ball"
          ? [0, 0, 0]
          : kind === "umbrella" || kind === "mailbox" || kind === "cone" || kind === "bin"
            ? [PI / 2, r.range(-1, 1), 0]
            : [r.next() < 0.5 ? PI : 0, r.range(-0.8, 0.8), 0],
    },
    mass: kind === "ball" || kind === "cup" ? 0.1 : heavyish ? 0.8 : 0.3,
  };
};

export const PROPS: Prop[] = [
  prop("ball", "ball", "#ffffff", 10.1, -8.7, 0, { delay: 0, height: 8, bounce: 0.62 }),
  prop("cone1", "cone", "#ff7a1a", 6.2, -2.15, 0, { delay: 6 }),
  prop("cone2", "cone", "#ff7a1a", 7.6, -2.15, 0, { delay: 12 }),
  prop("bin1", "bin", "#3e9a5a", -5.2, 4.2, 0, { delay: 10 }),
  prop("bin2", "bin", "#3d5a80", 5.2, -4.2, 0, { delay: 16 }),
  prop("bench1", "bench", "#b5633a", 14.5, -6.3, 0),
  prop("bench2", "bench", "#b5633a", -9, -4.3, 0),
  prop("crate1", "crate", "#d9a441", -6.8, 5.9, 0.2, { delay: 4 }),
  prop("crate2", "crate", "#c98f35", -6.1, 6.1, -0.3, { delay: 9 }),
  prop("crate3", "crate", "#d9a441", -6.5, 6.0, 0.5, { delay: 2 }, 0.6),
  prop("mailbox", "mailbox", "#3d5a80", -13, 4.25, PI / 2, { delay: 30 }),
  prop("umbrella1", "umbrella", "#ef476f", 8.9, 5.7, 0, { delay: 24 }),
  prop("cup1", "cup", "#ffffff", 7.9, 5.6, 0, { delay: 1, height: 5 }),
  prop("cup2", "cup", "#ffd166", 9.9, 5.8, 0, { delay: 3, height: 5.6 }),
  prop("ball2", "ball", "#ff6b6b", -3.2, 3.8, 0, { delay: 4, height: 9.5, bounce: 0.6 }),
];

export const BODIES: Body[] = [...CARS, ...PEOPLE, DOG, ...PROPS];

/** Impactos pré-calculados: alimentam poeira e tremor de câmera. */
export const IMPACTS = BODIES.map((b) => ({ id: b.id, ...impactOf(b) }));

// ---------------------------------------------------------------- mobiliário fixo

export const LAMPS: [number, number][] = [
  [-21, 3.0],
  [-9, 3.0],
  [9.5, 3.0],
  [21, 3.0],
  [-15, -3.0],
  [-3, -3.0],
  [15, -3.0],
];

export const HYDRANT: [number, number] = [3.6, 3.6];
export const FOUNTAIN: [number, number] = [12.4, -11.6];
