import React from "react";
import { Person as PersonData } from "../layout";
import { GEO } from "../materials";
import { lerp } from "../math";
import { useSceneTime } from "../SceneTime";
import { Floating } from "./Floating";
import { M } from "./Box";

const Limb: React.FC<{
  p: [number, number, number];
  rz: number;
  rx: number;
  len: number;
  thick: number;
  color: string;
  end?: string;
}> = ({ p, rz, rx, len, thick, color, end }) => (
  <group position={p} rotation={[rx, 0, rz]}>
    <M color={color} p={[0, -len / 2, 0]} s={[thick, len, thick]} />
    {end ? (
      <M color={end} p={[0.03, -len - 0.02, 0]} s={[thick * 1.25, thick * 0.7, thick * 1.1]} />
    ) : null}
  </group>
);

/** Personagem: proporções cartunescas, poses de andar, sentar, flutuar e cair. */
const Figure: React.FC<{
  p: PersonData;
  travel: number;
  airborne: number;
  landed: boolean;
}> = ({ p, travel, airborne, landed }) => {
  const t = useSceneTime();
  const seed = p.id.length * 1.7 + p.pos[0];
  const walking = p.pose === "walk";
  const phase = travel * 7;
  const walkAmt = walking && !landed ? 1 - airborne : 0;
  const sit = p.pose === "sit" && !landed ? 1 - airborne : 0;

  // pernas: passada ao andar, pedaladas no ar
  const kick = Math.sin(t * 0.16 + seed) * 0.55 * airborne;
  let legL = Math.sin(phase) * 0.6 * walkAmt + kick + sit * 1.5;
  let legR = -Math.sin(phase) * 0.6 * walkAmt - kick + sit * 1.5;
  let legSpread = 0.15 * airborne;

  // braços: balanço ao andar, erguidos e agitados no ar
  const flail = Math.sin(t * 0.22 + seed * 2) * 0.35;
  let armSwingL = -Math.sin(phase) * 0.5 * walkAmt + sit * 0.6;
  let armSwingR = Math.sin(phase) * 0.5 * walkAmt + sit * 0.6;
  let armUpL = lerp(0.12, 2.5 + flail, airborne);
  let armUpR = lerp(0.12, 2.5 - flail, airborne);

  if (landed && airborne < 0.05) {
    // caído, braços abertos, tonto
    legL = 0.1;
    legR = -0.1;
    legSpread = 0.25;
    armSwingL = 0;
    armSwingR = 0;
    armUpL = 1.3;
    armUpR = 1.3;
  }

  const bob = Math.abs(Math.sin(phase)) * 0.05 * walkAmt;
  const mouthOpen = airborne > 0.3 ? 1 : landed ? 0.6 : 0.15;

  return (
    <group position={[0, bob, 0]}>
      <Limb p={[0, -0.04, 0.11 + legSpread * 0.3]} rz={legL} rx={-legSpread} len={0.52} thick={0.17} color={p.pants} end="#2b2d42" />
      <Limb p={[0, -0.04, -0.11 - legSpread * 0.3]} rz={legR} rx={legSpread} len={0.52} thick={0.17} color={p.pants} end="#2b2d42" />
      <M geo={GEO.cyl6} color={p.shirt} p={[0, 0.22, 0]} s={[0.42, 0.56, 0.5]} />
      <Limb p={[0, 0.45, 0.29]} rz={armSwingL} rx={-armUpL} len={0.44} thick={0.12} color={p.shirt} end={p.skin} />
      <Limb p={[0, 0.45, -0.29]} rz={armSwingR} rx={armUpR} len={0.44} thick={0.12} color={p.shirt} end={p.skin} />
      {/* cabeça */}
      <group position={[0, 0.75, 0]}>
        <M geo={GEO.ico1} color={p.skin} s={0.52} />
        <M geo={GEO.ico1} color={p.hair} p={[-0.04, 0.12, 0]} s={[0.5, 0.32, 0.54]} />
        <M geo={GEO.sphere} color="#1b1530" p={[0.23, 0.03, 0.09]} s={[0.05, 0.08, 0.06]} shadow={false} />
        <M geo={GEO.sphere} color="#1b1530" p={[0.23, 0.03, -0.09]} s={[0.05, 0.08, 0.06]} shadow={false} />
        <M geo={GEO.sphere} color="#5a1e2e" p={[0.235, -0.1, 0]} s={[0.04, 0.03 + 0.06 * mouthOpen, 0.07]} shadow={false} />
      </group>
      {p.id === "corner" && airborne < 0.5 && !landed ? (
        <M color="#22223b" p={[0.22, 0.2, 0.18]} s={[0.04, 0.16, 0.1]} />
      ) : null}
    </group>
  );
};

/**
 * Estrelinhas de tontura girando sobre a cabeça.
 * `flat` = órbita no plano local XY (personagem deitado, onde +Z local aponta para cima).
 */
export const Stars: React.FC<{
  seed: number;
  position: [number, number, number];
  flat?: boolean;
}> = ({ seed, position, flat = true }) => {
  const t = useSceneTime();
  return (
    <group position={position} rotation={flat ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}>
      {[0, 1, 2].map((i) => {
        const a = t * 0.15 + (i * Math.PI * 2) / 3 + seed;
        return (
          <M
            key={i}
            geo={GEO.ico}
            color="#ffd23f"
            emissive="#ffb703"
            glow={0.8}
            p={[Math.cos(a) * 0.32, Math.sin(a) * 0.32, Math.sin(a * 2) * 0.05]}
            s={0.11}
            shadow={false}
          />
        );
      })}
    </group>
  );
};

export const Person: React.FC<{ p: PersonData }> = ({ p }) => (
  <Floating body={p}>
    {(s) => (
      <group scale={p.scale}>
        <Figure p={p} travel={s.travel} airborne={s.airborne} landed={s.landed} />
        {s.landed && s.airborne < 0.3 ? <Stars seed={p.pos[0]} position={[0, 0.75, 0.45]} /> : null}
      </group>
    )}
  </Floating>
);
