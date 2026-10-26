import React from "react";
import { House as HouseData } from "../layout";
import { GEO, PALETTE } from "../materials";
import { M } from "./Box";

const Window: React.FC<{ x: number; y: number; z: number }> = ({ x, y, z }) => (
  <group position={[x, y, z]}>
    <M color={PALETTE.windowFrame} s={[0.86, 0.86, 0.06]} shadow={false} />
    <M color={PALETTE.window} s={[0.68, 0.68, 0.08]} shadow={false} emissive="#9fd8ff" glow={0.25} />
    <M color={PALETTE.windowFrame} s={[0.06, 0.7, 0.1]} shadow={false} />
  </group>
);

/** Casa low poly: corpo, telhado (duas águas, quatro águas ou loja), portas e janelas. */
export const House: React.FC<{ h: HouseData }> = ({ h }) => {
  const { w, d } = h;
  const front = d / 2 + 0.01;
  return (
    <group position={[h.x, 0, h.z]} rotation={[0, h.yaw, 0]}>
      {/* base */}
      <M color="#d8cbb3" p={[0, 0.12, 0]} s={[w + 0.25, 0.24, d + 0.25]} receive />
      <M color={h.wall} p={[0, h.h / 2, 0]} s={[w, h.h, d]} receive />

      {h.style === "gable" ? (
        <group position={[0, h.h, 0]}>
          {/* prisma triangular deitado = telhado de duas águas (oitão para a rua) */}
          <M
            geo={GEO.prism}
            color={h.roof}
            p={[0, 0.25 * 1.9, 0]}
            r={[-Math.PI / 2, 0, 0]}
            s={[(w + 0.5) / 0.866, d + 0.4, 1.9]}
          />
          {h.detail ? <M color={h.roof} p={[w * 0.25, 0.9, -d * 0.15]} s={[0.4, 0.9, 0.4]} /> : null}
        </group>
      ) : null}

      {h.style === "hip" ? (
        <M
          geo={GEO.cone4}
          color={h.roof}
          p={[0, h.h + 0.8, 0]}
          r={[0, Math.PI / 4, 0]}
          s={[(w + 0.6) * 1.42, 1.6, (d + 0.6) * 1.42]}
        />
      ) : null}

      {h.style === "shop" ? (
        <group>
          <M color={h.roof} p={[0, h.h + 0.15, 0]} s={[w + 0.3, 0.3, d + 0.3]} />
          {/* toldo listrado */}
          {[-2, -1, 0, 1, 2].map((i) => (
            <M
              key={i}
              color={i % 2 === 0 ? "#ffffff" : h.roof}
              p={[i * (w / 5), 2.55, front + 0.5]}
              r={[0.45, 0, 0]}
              s={[w / 5, 0.08, 1.2]}
            />
          ))}
          <M color="#3b3355" p={[0, 1.1, front]} s={[w * 0.8, 1.8, 0.05]} shadow={false} />
          <M color={PALETTE.window} p={[0, 1.2, front + 0.02]} s={[w * 0.72, 1.4, 0.05]} shadow={false} emissive="#ffe0a3" glow={0.35} />
          <Window x={-w * 0.25} y={4} z={front} />
          <Window x={w * 0.25} y={4} z={front} />
        </group>
      ) : null}

      {h.detail && h.style !== "shop" ? (
        <group>
          <M color="#6b4f3f" p={[0, 0.85, front]} s={[0.9, 1.5, 0.08]} />
          <M color="#ffd166" p={[0.3, 0.85, front + 0.05]} s={[0.1, 0.1, 0.05]} shadow={false} />
          <Window x={-w * 0.3} y={1.6} z={front} />
          <Window x={w * 0.3} y={1.6} z={front} />
          {/* degrau e caminho até a calçada */}
          <M color="#cfc0a6" p={[0, 0.06, front + 1.2]} s={[1.1, 0.06, 2.4]} shadow={false} receive />
        </group>
      ) : null}
    </group>
  );
};
