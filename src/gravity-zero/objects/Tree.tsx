import React from "react";
import { Tree as TreeData } from "../layout";
import { GEO, PALETTE } from "../materials";
import { rng } from "../math";
import { zeroG } from "../physics";
import { useSceneTime } from "../SceneTime";
import { M } from "./Box";

/** Árvore enraizada: balança com o vento e treme quando a gravidade some. */
export const Tree: React.FC<{ tree: TreeData }> = ({ tree }) => {
  const t = useSceneTime();
  const r = rng(`tree-${tree.seed}`);
  const leaf = r.pick(PALETTE.leaves);
  const leaf2 = r.pick(PALETTE.leaves);
  const z = zeroG(t);
  const sway = Math.sin(t * 0.05 + tree.seed) * 0.025 + z * Math.sin(t * 0.7 + tree.seed) * 0.03;
  // sem gravidade, a copa "estica" levemente para cima
  const stretch = 1 + z * 0.08;
  return (
    <group position={[tree.x, 0, tree.z]} scale={tree.s} rotation={[0, r.range(0, 6), 0]}>
      <group rotation={[sway, 0, sway * 0.7]}>
        <M geo={GEO.cyl6} color={PALETTE.trunk} p={[0, 0.8, 0]} s={[0.28, 1.6, 0.28]} />
        {tree.kind === "round" ? (
          <group scale={[1, stretch, 1]}>
            <M geo={GEO.ico} color={leaf} p={[0, 2.25, 0]} s={2.1} />
            <M geo={GEO.ico} color={leaf2} p={[0.55, 2.0, 0.3]} s={1.3} />
            <M geo={GEO.ico} color={leaf} p={[-0.4, 2.7, -0.2]} s={1.25} />
          </group>
        ) : (
          <group scale={[1, stretch, 1]}>
            <M geo={GEO.cone7} color="#2f7d5b" p={[0, 1.9, 0]} s={[2.1, 1.7, 2.1]} />
            <M geo={GEO.cone7} color="#3a9467" p={[0, 2.8, 0]} s={[1.6, 1.4, 1.6]} />
            <M geo={GEO.cone7} color="#47a873" p={[0, 3.6, 0]} s={[1.0, 1.1, 1.0]} />
          </group>
        )}
      </group>
    </group>
  );
};
