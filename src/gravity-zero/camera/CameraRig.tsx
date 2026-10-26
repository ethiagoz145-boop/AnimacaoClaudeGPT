import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { CARS, DOG, IMPACTS, PEOPLE } from "../layout";
import {
  easeInOutCubic,
  easeInOutSine,
  easeOutCubic,
  lerp,
  lerpVec,
  progress,
  Vec3,
  wobble,
} from "../math";
import { bodyState, impactEnergy } from "../physics";
import { sceneTimeFor, T } from "../timeline";

type Shot = { pos: Vec3; target: Vec3; fov: number };

const HERO = CARS[0];
const WALKER = PEOPLE[0];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Enquadramento do gancho; o último plano termina aqui para fechar o loop. */
const hookShot = (f: number): Shot => {
  const t = sceneTimeFor(f);
  const hero = bodyState(HERO, t).pos;
  const k = easeInOutSine(progress(f, 0, T.hookEnd));
  // contra-plongée na rua transversal: a "torre" de carros contra o céu
  return {
    pos: [lerp(3.2, 1.6, k), lerp(0.8, 1.1, k), lerp(14.5, 13.2, k)],
    target: [hero[0] * 0.5, lerp(4.6, 5.0, k), hero[2] * 0.5],
    fov: lerp(54, 50, k),
  };
};

/**
 * Câmera dirigida por planos. Cada plano tem seu movimento com easing;
 * cortes acontecem nas fronteiras. Tremor vem da energia dos impactos.
 */
export const shotAt = (f: number): Shot => {
  const t = sceneTimeFor(f);

  if (f < T.hookEnd) return hookShot(f);

  if (f < T.street) {
    // estabelecimento: grua descendo sobre a rua principal (linhas de fuga)
    const k = easeInOutSine(progress(f, T.hookEnd, T.street));
    const whip = 1 - easeOutCubic(progress(f, T.hookEnd, T.hookEnd + 16));
    return {
      pos: add(lerpVec([27, 13, 7.5], [15, 5.5, 4.4], k), [whip * 6, whip * 8, 0]),
      target: lerpVec([-8, 0, -1.5], [-6, 1.6, 0.2], k),
      fov: lerp(44, 48, k),
    };
  }

  if (f < 300) {
    // rua: câmera de perseguição atrás do carro herói; após o pulso, freia e olha para cima
    const hx = bodyState(HERO, Math.min(t, 266)).pos[0];
    const look = easeInOutCubic(progress(f, 258, 300));
    return {
      pos: [hx - 6, lerp(1.6, 1.0, look), lerp(0.7, 0.3, look)],
      target: [hx + 4 + look * 1.5, lerp(1.0, 3.6, look), lerp(1.0, 1.6, look)],
      fov: lerp(48, 58, look),
    };
  }

  if (f < 420) {
    // por baixo: o carro verde decola ao lado, o herói sobe sobre o cruzamento
    const k = easeInOutSine(progress(f, 300, 420));
    const hero = bodyState(HERO, t).pos;
    return {
      pos: lerpVec([-2.5, 0.7, 11.5], [5.5, 1.6, 12], k),
      target: [lerp(-1, hero[0], k), lerp(2.2, hero[1] + 1.2, k), lerp(4, hero[2], k)],
      fov: 56,
    };
  }

  if (f < 540) {
    // revelação de escala: grua sobe e recua sobre a transversal
    const k = easeInOutCubic(progress(f, 420, 540));
    return {
      pos: lerpVec([0.8, 2.2, 16], [2, 36, 50], k),
      target: lerpVec([0, 5.5, 0], [0, 3, -6], k),
      fov: lerp(52, 38, k),
    };
  }

  if (f < T.fallStart) {
    // suspense: close no cachorro, o dono acima dele; tudo parado no ar
    const k = easeInOutSine(progress(f, 540, T.fallStart));
    const dog = bodyState(DOG, t).pos;
    const owner = bodyState(WALKER, t).pos;
    const mid = lerpVec(dog, owner, 0.5);
    return {
      // de frente: dono e cachorro empilhados na vertical do quadro 9:16
      pos: add(mid, lerpVec([7.5, -0.6, 1.2], [5.2, -0.3, 0.6], k)),
      target: add(mid, [0, 0.1, 0]),
      fov: 44,
    };
  }

  if (f < T.aftermath) {
    // a queda: plano aberto e elevado sobre a rua principal
    const k = easeOutCubic(progress(f, T.fallStart, T.aftermath));
    return {
      pos: lerpVec([-15, 11, 3.6], [-12, 7, 3.2], k),
      target: lerpVec([0, 3, 0.5], [-1, 0.6, 0.8], k),
      fov: 50,
    };
  }

  if (f < 772) {
    // rescaldo: rente ao chão, entre o cachorro tonto e o carro capotado
    const k = easeInOutSine(progress(f, T.aftermath, 772));
    return {
      // olhando ao longo da fila de "vítimas": dono, cachorro, bola, carro capotado
      pos: lerpVec([-14.2, 1.5, -0.4], [-12.8, 1.6, 0.1], k),
      target: lerpVec([-4, 0.7, 3.0], [-4, 0.8, 3.0], k),
      fov: 42,
    };
  }

  // fim: volta ao enquadramento do gancho, enquanto tudo começa a subir (loop)
  const k = easeInOutSine(progress(f, 772, T.end - 1));
  const end = hookShot(0);
  return {
    pos: lerpVec([4.2, 0.6, 17.5], end.pos, k),
    target: [end.target[0], lerp(1.6, end.target[1], easeInOutSine(progress(f, T.again, T.end - 1))), end.target[2]],
    fov: lerp(46, end.fov, k),
  };
};

const tmpTarget = new THREE.Vector3();

export const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  useLayoutEffect(() => {
    const t = sceneTimeFor(frame);
    const shot = shotAt(frame);
    const e = Math.min(2.5, impactEnergy(IMPACTS, t)) * 0.05;
    // respiração de câmera na mão, sutil
    const hand = 0.03;
    const sx = wobble(t * 1.2, 1) * hand + wobble(t * 9, 4) * e;
    const sy = wobble(t * 1.1, 2) * hand + wobble(t * 9, 5) * e;
    const sz = wobble(t * 9, 6) * e;
    camera.position.set(shot.pos[0] + sx, shot.pos[1] + sy, shot.pos[2] + sz);
    tmpTarget.set(shot.target[0], shot.target[1], shot.target[2]);
    camera.lookAt(tmpTarget);
    camera.fov = shot.fov;
    camera.near = 0.1;
    camera.far = 700;
    camera.updateProjectionMatrix();
  }, [frame, camera]);

  return null;
};
