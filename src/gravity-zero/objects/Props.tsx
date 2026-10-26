import React from "react";
import { Prop as PropData } from "../layout";
import { GEO } from "../materials";
import { Floating } from "./Floating";
import { M } from "./Box";

const PropModel: React.FC<{ prop: PropData }> = ({ prop }) => {
  switch (prop.kind) {
    case "ball":
      return (
        <group>
          <M geo={GEO.ico1} color={prop.color} s={0.44} />
          <M geo={GEO.ico} color="#22223b" p={[0.13, 0.12, 0.08]} s={0.13} shadow={false} />
          <M geo={GEO.ico} color="#22223b" p={[-0.12, -0.1, 0.12]} s={0.13} shadow={false} />
          <M geo={GEO.ico} color="#22223b" p={[0.02, 0.05, -0.18]} s={0.13} shadow={false} />
        </group>
      );
    case "cone":
      return (
        <group>
          <M color={prop.color} p={[0, -0.27, 0]} s={[0.5, 0.06, 0.5]} />
          <M geo={GEO.cone7} color={prop.color} p={[0, 0.03, 0]} s={[0.36, 0.6, 0.36]} />
          <M geo={GEO.cyl6} color="#ffffff" p={[0, 0.0, 0]} s={[0.25, 0.1, 0.25]} shadow={false} />
        </group>
      );
    case "bin":
      return (
        <group>
          <M geo={GEO.cyl} color={prop.color} s={[0.6, 0.85, 0.6]} />
          <M geo={GEO.cyl} color="#2b2d42" p={[0, 0.45, 0]} s={[0.66, 0.08, 0.66]} />
        </group>
      );
    case "bench":
      return (
        <group>
          <M color={prop.color} p={[0, 0.06, 0]} s={[1.7, 0.08, 0.5]} />
          <M color={prop.color} p={[0, 0.35, -0.24]} r={[-0.15, 0, 0]} s={[1.7, 0.3, 0.06]} />
          <M color="#3d405b" p={[0.7, -0.17, 0]} s={[0.08, 0.4, 0.45]} />
          <M color="#3d405b" p={[-0.7, -0.17, 0]} s={[0.08, 0.4, 0.45]} />
        </group>
      );
    case "crate":
      return (
        <group>
          <M color={prop.color} s={0.6} />
          <M color="#a86d28" p={[0, 0, 0.301]} s={[0.62, 0.1, 0.01]} shadow={false} />
          <M color="#a86d28" p={[0.301, 0, 0]} s={[0.01, 0.1, 0.62]} shadow={false} />
        </group>
      );
    case "mailbox":
      return (
        <group>
          <M color="#5c4d7d" p={[0, -0.25, 0]} s={[0.1, 0.7, 0.1]} />
          <M color={prop.color} p={[0, 0.25, 0]} s={[0.5, 0.35, 0.3]} />
          <M color="#e63946" p={[-0.1, 0.42, 0.17]} s={[0.04, 0.25, 0.04]} />
        </group>
      );
    case "umbrella":
      return (
        <group>
          <M color="#e9dcc4" p={[0, -0.25, 0]} s={[0.05, 1.7, 0.05]} />
          <M geo={GEO.cone7} color={prop.color} p={[0, 0.65, 0]} s={[2.2, 0.55, 2.2]} />
          <M geo={GEO.cyl} color="#f6ead6" p={[0, -0.5, 0]} s={[0.9, 0.06, 0.9]} />
          <M color="#3d405b" p={[0, -0.8, 0]} s={[0.08, 0.6, 0.08]} />
        </group>
      );
    case "cup":
      return (
        <group>
          <M geo={GEO.cyl6} color={prop.color} s={[0.14, 0.2, 0.14]} />
          <M geo={GEO.cyl6} color="#6b3e26" p={[0, 0.09, 0]} s={[0.12, 0.02, 0.12]} shadow={false} />
        </group>
      );
    default:
      return null;
  }
};

export const Prop: React.FC<{ prop: PropData }> = ({ prop }) => (
  <Floating body={prop}>{() => <PropModel prop={prop} />}</Floating>
);
