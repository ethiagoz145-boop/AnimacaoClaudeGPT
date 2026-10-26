import React from "react";
import { FOUNTAIN, HYDRANT, LAMPS, ROAD_HALF, SIDEWALK } from "../layout";
import { GEO, PALETTE } from "../materials";
import { M } from "../objects/Box";

const FAR = 140;
const SW = ROAD_HALF + SIDEWALK / 2;

const dashes = (axis: "x" | "z") => {
  const out: React.ReactNode[] = [];
  for (let i = -FAR; i <= FAR; i += 3.2) {
    if (Math.abs(i) < ROAD_HALF + 2.5) continue;
    out.push(
      <M
        key={`${axis}${i}`}
        color={PALETTE.roadLine}
        p={axis === "x" ? [i, 0.025, 0] : [0, 0.025, i]}
        s={axis === "x" ? [1.4, 0.01, 0.16] : [0.16, 0.01, 1.4]}
        shadow={false}
        receive
      />,
    );
  }
  return out;
};

const Crosswalk: React.FC<{ x: number; z: number; alongX: boolean }> = ({ x, z, alongX }) => (
  <group position={[x, 0.026, z]}>
    {[-2, -1.2, -0.4, 0.4, 1.2, 2].map((o) => (
      <M
        key={o}
        color={PALETTE.roadLine}
        p={alongX ? [0, 0, o] : [o, 0, 0]}
        s={alongX ? [1.6, 0.01, 0.45] : [0.45, 0.01, 1.6]}
        shadow={false}
        receive
      />
    ))}
  </group>
);

const Lamp: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  const dir = z > 0 ? -1 : 1;
  return (
    <group position={[x, 0, z]}>
      <M geo={GEO.cyl6} color="#3d405b" p={[0, 1.7, 0]} s={[0.12, 3.4, 0.12]} />
      <M color="#3d405b" p={[0, 3.35, dir * 0.35]} s={[0.08, 0.08, 0.7]} />
      <M color="#fff3c4" p={[0, 3.25, dir * 0.65]} s={[0.3, 0.12, 0.3]} emissive="#ffe08a" glow={0.5} />
    </group>
  );
};

const TrafficLight: React.FC<{ x: number; z: number; yaw: number }> = ({ x, z, yaw }) => (
  <group position={[x, 0, z]} rotation={[0, yaw, 0]}>
    <M geo={GEO.cyl6} color="#2b2d42" p={[0, 1.5, 0]} s={[0.12, 3, 0.12]} />
    <M color="#2b2d42" p={[0, 3.1, 0]} s={[0.36, 0.95, 0.3]} />
    <M geo={GEO.sphere} color="#4a1a1a" p={[0, 3.4, 0.16]} s={0.2} shadow={false} />
    <M geo={GEO.sphere} color="#4a3a1a" p={[0, 3.1, 0.16]} s={0.2} shadow={false} />
    <M geo={GEO.sphere} color="#4dff8a" p={[0, 2.8, 0.16]} s={0.2} shadow={false} emissive="#3dff7a" glow={1.2} />
  </group>
);

/** Chão, ruas, calçadas, parque e mobiliário urbano fixo. */
export const Ground: React.FC = () => (
  <group>
    <M geo={GEO.plane} color={PALETTE.grass} r={[-Math.PI / 2, 0, 0]} s={[600, 600, 1]} shadow={false} receive />

    {/* ruas */}
    <M color={PALETTE.road} p={[0, 0.01, 0]} s={[FAR * 2, 0.02, ROAD_HALF * 2]} shadow={false} receive />
    <M color={PALETTE.road} p={[0, 0.012, 0]} s={[ROAD_HALF * 2, 0.02, FAR * 2]} shadow={false} receive />
    {dashes("x")}
    {dashes("z")}
    <Crosswalk x={-ROAD_HALF - 1.1} z={0} alongX />
    <Crosswalk x={ROAD_HALF + 1.1} z={0} alongX />
    <Crosswalk x={0} z={-ROAD_HALF - 1.1} alongX={false} />
    <Crosswalk x={0} z={ROAD_HALF + 1.1} alongX={false} />

    {/* calçadas com meio-fio */}
    {[-1, 1].map((side) => (
      <group key={side}>
        {[-1, 1].map((half) => (
          <group key={half}>
            <M
              color={PALETTE.sidewalk}
              p={[half * (FAR / 2 + ROAD_HALF / 2), 0.07, side * SW]}
              s={[FAR - ROAD_HALF, 0.14, SIDEWALK]}
              shadow={false}
              receive
            />
            <M
              color={PALETTE.sidewalk}
              p={[side * SW, 0.07, half * (FAR / 2 + ROAD_HALF / 2)]}
              s={[SIDEWALK, 0.14, FAR - ROAD_HALF]}
              shadow={false}
              receive
            />
          </group>
        ))}
      </group>
    ))}

    {/* entradas de garagem */}
    {[
      [-18.5, 6.8],
      [18.5, 6.9],
      [-18.5, -6.9],
    ].map(([x, z]) => (
      <M key={`${x}${z}`} color="#8d8a8a" p={[x, 0.03, z]} s={[2.2, 0.04, 5.2]} shadow={false} receive />
    ))}

    {/* parque */}
    <group>
      <M color={PALETTE.grassDark} p={[12.5, 0.04, -11.75]} s={[15.5, 0.08, 13.5]} shadow={false} receive />
      <M color={PALETTE.sidewalk} p={[12.5, 0.09, -11.75]} s={[1.4, 0.02, 13.5]} shadow={false} receive />
      <M color={PALETTE.sidewalk} p={[12.5, 0.09, -11.75]} s={[15.5, 0.02, 1.4]} shadow={false} receive />
      {[
        [12.5, -4.9, 15.5, 0.5],
        [4.95, -11.75, 0.5, 13.5],
        [20.05, -11.75, 0.5, 13.5],
      ].map(([x, z, w, d]) => (
        <M key={`${x}${z}`} color="#4f9a4a" p={[x, 0.3, z]} s={[w, 0.6, d]} />
      ))}
      {/* fonte */}
      <group position={[FOUNTAIN[0], 0, FOUNTAIN[1]]}>
        <M geo={GEO.cyl} color="#d8cbb3" p={[0, 0.25, 0]} s={[3.4, 0.5, 3.4]} receive />
        <M geo={GEO.cyl} color={PALETTE.water} p={[0, 0.45, 0]} s={[3.0, 0.1, 3.0]} shadow={false} emissive="#6fc8ff" glow={0.15} />
        <M geo={GEO.cyl6} color="#d8cbb3" p={[0, 0.8, 0]} s={[0.35, 1.1, 0.35]} />
        <M geo={GEO.cyl6} color="#d8cbb3" p={[0, 1.3, 0]} s={[1.0, 0.15, 1.0]} />
      </group>
      {/* canteiros de flores */}
      {[
        [8, -16, "#ff6b9d"],
        [17, -10, "#ffd23f"],
        [9.5, -7, "#ff8a5b"],
        [16, -17, "#c77dff"],
      ].map(([x, z, c]) => (
        <group key={`${x}${z}`} position={[x as number, 0, z as number]}>
          <M geo={GEO.ico} color="#3e9a5a" p={[0, 0.3, 0]} s={[1.4, 0.6, 1.1]} />
          <M geo={GEO.ico} color={c as string} p={[0.2, 0.55, 0.1]} s={0.3} shadow={false} />
          <M geo={GEO.ico} color={c as string} p={[-0.3, 0.5, -0.2]} s={0.26} shadow={false} />
          <M geo={GEO.ico} color={c as string} p={[0.1, 0.52, -0.35]} s={0.24} shadow={false} />
        </group>
      ))}
    </group>

    {/* café: cadeiras fixas */}
    {[
      [7.6, 5.6],
      [10.2, 5.8],
    ].map(([x, z]) => (
      <group key={x} position={[x, 0, z]}>
        <M color="#3d405b" p={[0, 0.22, 0]} s={[0.45, 0.06, 0.45]} />
        <M color="#3d405b" p={[0, 0.11, 0]} s={[0.06, 0.22, 0.06]} />
      </group>
    ))}

    {LAMPS.map(([x, z]) => (
      <Lamp key={`${x}${z}`} x={x} z={z} />
    ))}
    <TrafficLight x={3.3} z={3.3} yaw={Math.PI / 2} />
    <TrafficLight x={-3.3} z={-3.3} yaw={-Math.PI / 2} />

    <group position={[HYDRANT[0], 0.14, HYDRANT[1]]}>
      <M geo={GEO.cyl6} color="#e63946" p={[0, 0.3, 0]} s={[0.28, 0.6, 0.28]} />
      <M geo={GEO.sphere} color="#e63946" p={[0, 0.62, 0]} s={0.3} />
      <M geo={GEO.cyl6} color="#c22f3b" p={[0, 0.35, 0]} r={[Math.PI / 2, 0, 0]} s={[0.12, 0.42, 0.12]} />
    </group>
  </group>
);
