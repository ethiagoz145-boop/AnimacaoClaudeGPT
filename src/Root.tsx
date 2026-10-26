import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import {
  GravityZero,
  gravityZeroDefaults,
  gravityZeroSchema,
} from "./gravity-zero/GravityZero";
import { DURATION, FPS, HEIGHT, WIDTH } from "./gravity-zero/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition
        id="GravityZero"
        component={GravityZero}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={gravityZeroSchema}
        defaultProps={gravityZeroDefaults}
      />
    </>
  );
};
