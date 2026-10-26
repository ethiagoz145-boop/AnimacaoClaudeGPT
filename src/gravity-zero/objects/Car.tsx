import React from "react";
import { BUS_CENTER, Car as CarData, CAR_CENTER } from "../layout";
import { GEO } from "../materials";
import { Floating } from "./Floating";
import { M } from "./Box";

const GLASS = "#2c3e5c";

const Wheel: React.FC<{ x: number; z: number; r: number; spin: number }> = ({ x, z, r, spin }) => (
  <group position={[x, r, z]} rotation={[Math.PI / 2, 0, 0]}>
    <group rotation={[0, -spin, 0]}>
      <M geo={GEO.wheel} color="#1f1f29" s={[r * 2, 0.3, r * 2]} />
      <M geo={GEO.cyl6} color="#cfd6e3" s={[r * 1.0, 0.32, r * 1.0]} shadow={false} />
    </group>
  </group>
);

/** Carro low poly. Origem no centro de massa; frente para +X. */
const CarBody: React.FC<{ car: CarData; travel: number; airborne: number }> = ({ car, travel, airborne }) => {
  const c = car.kind === "bus" ? BUS_CENTER : CAR_CENTER;
  const wheelR = car.kind === "bus" ? 0.45 : 0.32;
  const spin = travel / wheelR;
  // sem chão, a suspensão estende e as rodas "caem" um pouco
  const droop = airborne * 0.08;

  if (car.kind === "bus") {
    const L = 7;
    return (
      <group position={[0, -c, 0]}>
        <M color={car.color} p={[0, 1.3, 0]} s={[L, 1.9, 2.2]} />
        <M color="#ffffff" p={[0, 2.32, 0]} s={[L - 0.2, 0.14, 2.1]} />
        <M color="#2b2d42" p={[0, 0.5, 0]} s={[L + 0.05, 0.2, 2.22]} />
        {[-2.6, -1.5, -0.4, 0.7, 1.8].map((x) => (
          <M key={x} color={GLASS} p={[x, 1.65, 1.11]} s={[0.9, 0.7, 0.04]} shadow={false} />
        ))}
        {[-2.6, -1.5, -0.4, 0.7, 1.8].map((x) => (
          <M key={x} color={GLASS} p={[x, 1.65, -1.11]} s={[0.9, 0.7, 0.04]} shadow={false} />
        ))}
        <M color={GLASS} p={[L / 2, 1.6, 0]} s={[0.04, 0.9, 1.9]} shadow={false} />
        <M color="#fff6c8" p={[L / 2 + 0.02, 0.75, 0.75]} s={[0.04, 0.22, 0.3]} shadow={false} emissive="#fff3b0" glow={0.6} />
        <M color="#fff6c8" p={[L / 2 + 0.02, 0.75, -0.75]} s={[0.04, 0.22, 0.3]} shadow={false} emissive="#fff3b0" glow={0.6} />
        <M color="#2b2d42" p={[0, 1.95, 1.12]} s={[2.4, 0.3, 0.02]} shadow={false} />
        {[-2.3, 2.1].map((x) => (
          <group key={x} position={[0, -droop, 0]}>
            <Wheel x={x} z={1.05} r={wheelR} spin={spin} />
            <Wheel x={x} z={-1.05} r={wheelR} spin={spin} />
          </group>
        ))}
      </group>
    );
  }

  const isVan = car.kind === "van";
  const isPickup = car.kind === "pickup";
  const L = isVan ? 2.8 : car.kind === "sedan" ? 2.7 : isPickup ? 2.9 : 2.3;
  const W = 1.3;
  return (
    <group position={[0, -c, 0]}>
      {/* chassi */}
      <M color={car.color} p={[0, 0.55, 0]} s={[L, 0.5, W]} />
      <M color="#2b2d42" p={[0, 0.32, 0]} s={[L + 0.06, 0.12, W + 0.04]} />
      {/* cabine */}
      {isVan ? (
        <group>
          <M color={car.color} p={[-0.15, 1.15, 0]} s={[L - 0.4, 0.75, W - 0.05]} />
          <M color={GLASS} p={[L / 2 - 0.36, 1.18, 0]} s={[0.06, 0.5, W - 0.2]} r={[0, 0, -0.35]} shadow={false} />
          <M color={GLASS} p={[0.4, 1.2, W / 2 - 0.02]} s={[0.8, 0.4, 0.04]} shadow={false} />
          <M color={GLASS} p={[0.4, 1.2, -W / 2 + 0.02]} s={[0.8, 0.4, 0.04]} shadow={false} />
        </group>
      ) : isPickup ? (
        <group>
          <M color={car.color} p={[0.35, 1.08, 0]} s={[1.05, 0.62, W - 0.1]} />
          <M color={GLASS} p={[0.35, 1.12, 0]} s={[1.07, 0.36, W - 0.06]} shadow={false} />
          <M color={car.color} p={[-0.85, 0.9, W / 2 - 0.06]} s={[1.1, 0.25, 0.08]} />
          <M color={car.color} p={[-0.85, 0.9, -W / 2 + 0.06]} s={[1.1, 0.25, 0.08]} />
        </group>
      ) : (
        <group>
          <M color={car.color} p={[-0.12, 1.05, 0]} s={[L * 0.55, 0.55, W - 0.12]} />
          <M color={GLASS} p={[-0.12, 1.07, 0]} s={[L * 0.56, 0.34, W - 0.08]} shadow={false} />
          <M color={GLASS} p={[L * 0.17, 1.0, 0]} s={[0.05, 0.38, W - 0.2]} r={[0, 0, -0.5]} shadow={false} />
        </group>
      )}
      {car.kind === "taxi" ? (
        <M color="#ffffff" p={[-0.1, 1.42, 0]} s={[0.45, 0.18, 0.3]} emissive="#fff3b0" glow={0.4} />
      ) : null}
      {car.kind === "taxi" ? (
        <M color="#2b2d42" p={[0, 0.6, W / 2 + 0.005]} s={[L * 0.7, 0.1, 0.01]} shadow={false} />
      ) : null}
      {/* faróis e lanternas */}
      <M color="#fff6c8" p={[L / 2 + 0.01, 0.6, 0.42]} s={[0.04, 0.15, 0.24]} shadow={false} emissive="#fff3b0" glow={0.7} />
      <M color="#fff6c8" p={[L / 2 + 0.01, 0.6, -0.42]} s={[0.04, 0.15, 0.24]} shadow={false} emissive="#fff3b0" glow={0.7} />
      <M color="#ff3b3b" p={[-L / 2 - 0.01, 0.62, 0.45]} s={[0.04, 0.13, 0.2]} shadow={false} emissive="#ff2a2a" glow={0.5} />
      <M color="#ff3b3b" p={[-L / 2 - 0.01, 0.62, -0.45]} s={[0.04, 0.13, 0.2]} shadow={false} emissive="#ff2a2a" glow={0.5} />
      <group position={[0, -droop, 0]}>
        <Wheel x={L * 0.32} z={W / 2} r={0.32} spin={spin} />
        <Wheel x={L * 0.32} z={-W / 2} r={0.32} spin={spin} />
        <Wheel x={-L * 0.32} z={W / 2} r={0.32} spin={spin} />
        <Wheel x={-L * 0.32} z={-W / 2} r={0.32} spin={spin} />
      </group>
    </group>
  );
};

export const Car: React.FC<{ car: CarData }> = ({ car }) => (
  <Floating body={car}>
    {(s) => <CarBody car={car} travel={s.travel} airborne={s.airborne} />}
  </Floating>
);

