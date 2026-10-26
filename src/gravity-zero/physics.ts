import {
  clamp01,
  easeInOutCubic,
  easeInOutSine,
  easeOutCubic,
  lerp,
  progress,
  Vec3,
} from "./math";
import { T } from "./timeline";

/**
 * "Física" estilizada e 100% analítica: cada corpo tem uma curva de subida,
 * flutuação, suspensão e queda com quiques. Nada é integrado passo a passo,
 * então qualquer frame pode ser renderizado isoladamente.
 */

export const GRAVITY = 0.045; // unidades / frame² (queda rápida e enfática)

export type FloatSpec = {
  delay: number; // frames após o pulso até começar a subir
  rise: number; // duração da subida
  height: number; // altura máxima de flutuação
  bob: number; // amplitude da oscilação no ar
  spin: Vec3; // velocidade angular no ar (rad/frame)
  drift: [number, number]; // deriva horizontal total (x, z)
  fallDelay: number; // atraso de queda (cascata de impactos)
  bounce: number; // restituição
  again: number; // quanto sobe no "de novo" final
};

export type Body = {
  id: string;
  pos: Vec3; // posição de repouso (y = altura do centro)
  yaw: number;
  speed?: number; // movimento antes do pulso (ao longo do eixo +x local)
  float: FloatSpec;
  land: { y: number; rot: Vec3 };
  mass: number; // influencia poeira e tremor de câmera
};

export type BodyState = {
  pos: Vec3;
  rot: Vec3; // rotação interna (aplicada após o yaw)
  squash: number; // escala vertical (1 = neutro)
  airborne: number; // 0..1 o quanto "está no ar" (para poses)
  landed: boolean;
  travel: number; // distância percorrida (rodas, passos)
};

const MOMENTUM_TAU = 28;
const HANG = 0.45;

const liftStart = (b: Body) => T.shock + b.float.delay;
const fallStartOf = (b: Body) => T.fallStart + b.float.fallDelay;

const travelAt = (b: Body, t: number) => {
  const v = b.speed ?? 0;
  const tl = liftStart(b);
  if (t <= tl) return v * t;
  // após o pulso o corpo segue por inércia e desacelera suavemente
  return v * tl + v * MOMENTUM_TAU * (1 - Math.exp(-(t - tl) / MOMENTUM_TAU));
};

const liftAt = (b: Body, t: number) => {
  const f = b.float;
  const dt = t - liftStart(b);
  if (dt <= 0) return 0;
  const u = clamp01(dt / f.rise);
  return f.height * easeInOutSine(u) + f.bob * u * Math.sin(dt * 0.06 + f.delay);
};

/** Integral de uma rampa linear: ângulo acumulado com aceleração suave. */
const rampedAngle = (dt: number, rise: number) => {
  if (dt <= 0) return 0;
  if (dt < rise) return (dt * dt) / (2 * rise);
  return dt - rise / 2;
};

const airAngles = (b: Body, t: number): Vec3 => {
  const tl = liftStart(b);
  const tb = T.gravityBack;
  const tf = fallStartOf(b);
  let a = rampedAngle(Math.min(t, tb) - tl, b.float.rise);
  if (t > tb) {
    // na suspensão a rotação desacelera até quase parar
    const h = Math.min(t, tf) - tb;
    const span = tf - tb;
    a += h - (h * h) / (2 * span);
  }
  return [b.float.spin[0] * a, b.float.spin[1] * a, b.float.spin[2] * a];
};

const fallTime = (h0: number) => Math.sqrt((2 * Math.max(0, h0)) / GRAVITY);

const fallHeight = (h0: number, dt: number, e: number) => {
  const t1 = fallTime(h0);
  if (dt < t1) return h0 - 0.5 * GRAVITY * dt * dt;
  let v = GRAVITY * t1 * e;
  let tau = dt - t1;
  for (let k = 0; k < 3; k++) {
    const dur = (2 * v) / GRAVITY;
    if (tau < dur) return v * tau - 0.5 * GRAVITY * tau * tau;
    tau -= dur;
    v *= e;
  }
  return 0;
};

const horizontalAt = (b: Body, t: number): [number, number] => {
  const s = travelAt(b, t);
  const fx = Math.cos(b.yaw);
  const fz = -Math.sin(b.yaw);
  const tl = liftStart(b);
  const d = easeInOutSine(progress(t, tl, T.fallStart));
  return [
    b.pos[0] + fx * s + b.float.drift[0] * d,
    b.pos[2] + fz * s + b.float.drift[1] * d,
  ];
};

const peakHeight = (b: Body) => b.pos[1] + liftAt(b, T.gravityBack) + HANG;

export const impactOf = (b: Body) => {
  const tf = fallStartOf(b);
  const h0 = peakHeight(b) - b.land.y;
  const [x, z] = horizontalAt(b, tf);
  return { frame: tf + fallTime(h0), x, z, mass: b.mass };
};

const nearestTurn = (from: number, target: number) =>
  target + Math.PI * 2 * Math.round((from - target) / (Math.PI * 2));

export const bodyState = (b: Body, t: number): BodyState => {
  const tl = liftStart(b);
  const tb = T.gravityBack;
  const tf = fallStartOf(b);
  const [x, z] = horizontalAt(b, t);
  const travel = travelAt(b, t);

  // antecipação: leve agachada antes de descolar do chão
  const antic = progress(t, tl - 8, tl);
  let squash = 1 - 0.1 * Math.sin(antic * Math.PI);

  if (t < tb) {
    const lift = liftAt(b, t);
    const stretch = t > tl ? 0.06 * Math.sin(progress(t, tl, tl + 14) * Math.PI) : 0;
    return {
      pos: [x, b.pos[1] + lift, z],
      rot: airAngles(b, t),
      squash: squash + stretch,
      airborne: easeInOutSine(progress(t, tl, tl + b.float.rise * 0.6)),
      landed: false,
      travel,
    };
  }

  if (t < tf) {
    const hang = HANG * easeOutCubic(progress(t, tb, tf));
    return {
      pos: [x, b.pos[1] + liftAt(b, tb) + hang, z],
      rot: airAngles(b, t),
      squash: 1,
      airborne: 1,
      landed: false,
      travel,
    };
  }

  const h0 = peakHeight(b) - b.land.y;
  const dt = t - tf;
  const t1 = fallTime(h0);
  const y = b.land.y + fallHeight(h0, dt, b.float.bounce);
  const a0 = airAngles(b, tf);
  const target = b.land.rot;
  const k = easeInOutCubic(clamp01(dt / (t1 * 1.15)));
  const rot: Vec3 = [
    lerp(a0[0], nearestTurn(a0[0], target[0]), k),
    lerp(a0[1], nearestTurn(a0[1], target[1]), k),
    lerp(a0[2], nearestTurn(a0[2], target[2]), k),
  ];

  if (dt < t1) {
    // esticado pela velocidade durante a queda
    squash = 1 + 0.1 * clamp01(dt / t1);
  } else {
    // amassado no impacto, com recuperação elástica
    const since = dt - t1;
    squash = 1 - 0.28 * Math.exp(-since / 4) * Math.cos(since * 0.55);
  }

  // final: tudo começa a subir de novo, devagar (gancho do loop)
  const again = b.float.again * Math.pow(progress(t, T.again + b.float.delay * 0.3, T.end + 10), 2);
  const againWobble = again > 0 ? Math.sin(t * 0.21 + b.float.delay) * 0.04 * again : 0;

  return {
    pos: [x, y + again, z],
    rot: [rot[0] + againWobble, rot[1], rot[2] - againWobble],
    squash,
    airborne: dt < t1 ? 1 : again > 0.05 ? Math.min(1, again) : 0,
    landed: dt >= t1,
    travel,
  };
};

/** Intensidade de impacto global num instante (tremor de câmera, flashes). */
export const impactEnergy = (
  impacts: readonly { frame: number; mass: number }[],
  t: number,
) => {
  let e = 0;
  for (const im of impacts) {
    const d = t - im.frame;
    if (d >= 0 && d < 30) e += im.mass * Math.exp(-d / 5);
  }
  return e;
};

/** Grau global de gravidade zero (0 = normal, 1 = flutuando) para luz e cor. */
export const zeroG = (t: number) =>
  progress(t, T.shock, T.shock + 30) * (1 - progress(t, T.gravityBack, T.fallStart + 20)) +
  Math.pow(progress(t, T.again, T.end), 1.5);
