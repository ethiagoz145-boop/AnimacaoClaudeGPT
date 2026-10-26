import React from "react";
import { DOG } from "../layout";
import { GEO } from "../materials";
import { useSceneTime } from "../SceneTime";
import { Floating } from "./Floating";
import { Stars } from "./Person";
import { M } from "./Box";

const FUR = "#d9a441";
const FUR_DARK = "#8c5a2b";
const LEGS: [number, number][] = [
  [0.22, 0.1],
  [0.22, -0.1],
  [-0.22, 0.1],
  [-0.22, -0.1],
];

/** O cachorro: anda ao lado do dono, depois "nada" no ar abanando o rabo. */
export const Dog: React.FC = () => {
  const t = useSceneTime();
  return (
    <Floating body={DOG}>
      {(s) => {
        const walk = s.landed ? 0 : 1 - s.airborne;
        const phase = s.travel * 14;
        const paddle = s.airborne * Math.sin(t * 0.45);
        const leg = (i: number) =>
          Math.sin(phase + (i % 2) * Math.PI + (i > 1 ? Math.PI / 2 : 0)) * 0.6 * walk +
          paddle * (i % 2 === 0 ? 0.9 : -0.9);
        const tail = Math.sin(t * (s.airborne > 0.5 ? 0.9 : 0.5)) * 0.6;
        const ears = 0.4 + s.airborne * 0.9;
        return (
          <group>
            <M color={FUR} s={[0.62, 0.3, 0.3]} />
            <M color="#e63946" p={[0.22, 0.08, 0]} s={[0.06, 0.08, 0.32]} shadow={false} />
            <group position={[0.36, 0.17, 0]} rotation={[0, 0, s.airborne * 0.3]}>
              <M color={FUR} s={[0.3, 0.28, 0.28]} />
              <M color={FUR_DARK} p={[0.17, -0.05, 0]} s={[0.12, 0.12, 0.16]} />
              <M geo={GEO.sphere} color="#1b1530" p={[0.23, -0.01, 0]} s={0.06} shadow={false} />
              <M geo={GEO.sphere} color="#1b1530" p={[0.12, 0.06, 0.1]} s={0.045} shadow={false} />
              <M geo={GEO.sphere} color="#1b1530" p={[0.12, 0.06, -0.1]} s={0.045} shadow={false} />
              <M color={FUR_DARK} p={[-0.04, 0.14, 0.15]} r={[ears, 0, 0]} s={[0.1, 0.18, 0.05]} />
              <M color={FUR_DARK} p={[-0.04, 0.14, -0.15]} r={[-ears, 0, 0]} s={[0.1, 0.18, 0.05]} />
              {s.airborne > 0.3 ? (
                <M color="#ff7a8a" p={[0.2, -0.14, 0.04]} s={[0.08, 0.03, 0.06]} shadow={false} />
              ) : null}
            </group>
            <group position={[-0.31, 0.08, 0]} rotation={[tail, 0, 0.7]}>
              <M color={FUR} p={[0, 0.1, 0]} s={[0.06, 0.22, 0.06]} />
            </group>
            {s.landed && s.airborne < 0.3 ? (
              <group scale={0.7}>
                <Stars seed={2} position={[0.5, 0.75, 0]} flat={false} />
              </group>
            ) : null}
            {LEGS.map(([x, z], i) => (
              <group key={i} position={[x, -0.1, z]} rotation={[0, 0, leg(i)]}>
                <M color={FUR} p={[0, -0.1, 0]} s={[0.09, 0.2, 0.09]} />
              </group>
            ))}
          </group>
        );
      }}
    </Floating>
  );
};
