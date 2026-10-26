import React from "react";
import { Body, BodyState, bodyState } from "../physics";
import { useSceneTime } from "../SceneTime";

/**
 * Aplica o estado de flutuação a qualquer corpo.
 * Hierarquia: posição → squash (eixo Y do mundo) → yaw → rotação no ar.
 */
export const Floating: React.FC<{
  body: Body;
  children: (s: BodyState) => React.ReactNode;
}> = ({ body, children }) => {
  const t = useSceneTime();
  const s = bodyState(body, t);
  const side = 1 / Math.sqrt(s.squash);
  return (
    <group position={s.pos}>
      <group scale={[side, s.squash, side]}>
        <group rotation={[0, body.yaw, 0]}>
          <group rotation={s.rot}>{children(s)}</group>
        </group>
      </group>
    </group>
  );
};
