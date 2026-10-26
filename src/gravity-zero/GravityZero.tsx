import { useTimelineFrame } from "./useTimelineFrame";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { z } from "zod";
import { audioSchema, NO_AUDIO, SoundLayer } from "./audio/SoundLayer";
import { CameraRig } from "./camera/CameraRig";
import { Birds, Clouds, FountainWater } from "./effects/Ambient";
import { Dust } from "./effects/Dust";
import { Leaves } from "./effects/Leaves";
import { Shockwave } from "./effects/Shockwave";
import { CARS, HOUSES, PEOPLE, PROPS, TREES } from "./layout";
import { Car } from "./objects/Car";
import { Dog } from "./objects/Dog";
import { House } from "./objects/House";
import { Person } from "./objects/Person";
import { Prop } from "./objects/Props";
import { Tree } from "./objects/Tree";
import { Atmosphere } from "./scene/Atmosphere";
import { Ground } from "./scene/Ground";
import { SceneTimeContext } from "./SceneTime";
import { sceneTimeFor } from "./timeline";
import { Captions } from "./ui/Captions";
import { Countdown } from "./ui/Countdown";
import { Overlay } from "./ui/Overlay";

export const gravityZeroSchema = z.object({
  showCaptions: z.boolean(),
  showSafeZones: z.boolean(),
  audio: audioSchema,
});

export type GravityZeroProps = z.infer<typeof gravityZeroSchema>;

export const gravityZeroDefaults: GravityZeroProps = {
  showCaptions: true,
  showSafeZones: false,
  audio: NO_AUDIO,
};

/** Cenário estático (não depende do tempo): memoizado para não re-renderizar. */
const StaticCity = React.memo(() => (
  <>
    <Ground />
    {HOUSES.map((h, i) => (
      <House key={i} h={h} />
    ))}
  </>
));

const World: React.FC = () => (
  <>
    <Atmosphere />
    <CameraRig />
    <StaticCity />
    {TREES.map((tree, i) => (
      <Tree key={i} tree={tree} />
    ))}
    {CARS.map((c) => (
      <Car key={c.id} car={c} />
    ))}
    {PEOPLE.map((p) => (
      <Person key={p.id} p={p} />
    ))}
    <Dog />
    {PROPS.map((p) => (
      <Prop key={p.id} prop={p} />
    ))}
    <Leaves />
    <FountainWater />
    <Clouds />
    <Birds />
    <Shockwave />
    <Dust />
  </>
);

export const GravityZero: React.FC<GravityZeroProps> = ({ showCaptions, showSafeZones, audio }) => {
  const frame = useTimelineFrame();
  const { width, height } = useVideoConfig();
  const t = sceneTimeFor(frame);
  return (
    <AbsoluteFill style={{ backgroundColor: "#4fa8e0" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        dpr={1}
        gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping, preserveDrawingBuffer: true }}
        camera={{ fov: 50, near: 0.1, far: 700, position: [20, 20, 30] }}
      >
        <SceneTimeContext.Provider value={t}>
          <World />
        </SceneTimeContext.Provider>
      </ThreeCanvas>
      <Overlay showSafeZones={showSafeZones} />
      {showCaptions ? (
        <>
          <Captions />
          <Countdown />
        </>
      ) : null}
      <SoundLayer audio={audio} />
    </AbsoluteFill>
  );
};
