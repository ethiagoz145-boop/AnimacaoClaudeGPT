import { useTimelineFrame } from "../useTimelineFrame";
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { IMPACTS } from "../layout";
import { impactEnergy } from "../physics";
import { sceneTimeFor, T } from "../timeline";
import { SAFE } from "./Captions";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Flashes de transição, vinheta e aviso de ficção. */
export const Overlay: React.FC<{ showSafeZones: boolean }> = ({ showSafeZones }) => {
  const frame = useTimelineFrame();
  const t = sceneTimeFor(frame);

  // flash branco no "rebobinar" do gancho para o início do dia
  const hookFlash =
    interpolate(frame, [T.hookEnd - 6, T.hookEnd], [0, 1], clamp) *
    interpolate(frame, [T.hookEnd, T.hookEnd + 12], [1, 0], clamp);
  // pulso ciano quando a gravidade desliga
  const shock = interpolate(frame, [T.shock, T.shock + 2, T.shock + 16], [0, 0.55, 0], clamp);
  // pulso rosado quando ela volta
  const back = interpolate(frame, [T.gravityBack, T.gravityBack + 2, T.gravityBack + 14], [0, 0.4, 0], clamp);
  const hit = Math.min(0.35, impactEnergy(IMPACTS, t) * 0.03);
  const disclaimer = interpolate(frame, [T.again, T.again + 12], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(20,10,45,0.42) 100%)",
        }}
      />
      <AbsoluteFill style={{ background: "#ffffff", opacity: hookFlash }} />
      <AbsoluteFill style={{ background: "#bff6ff", opacity: shock, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#ffb3d1", opacity: back, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#fff3dd", opacity: hit, mixBlendMode: "soft-light" }} />
      {disclaimer > 0 ? (
        <div
          style={{
            position: "absolute",
            bottom: SAFE.bottom,
            left: SAFE.side,
            right: SAFE.side,
            textAlign: "center",
            opacity: disclaimer * 0.9,
            fontFamily: '"Segoe UI", Arial, sans-serif',
            fontSize: 30,
            fontWeight: 600,
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(20,10,40,0.8)",
          }}
        >
          Ficção hipotética — sem precisão física.
        </div>
      ) : null}
      {showSafeZones ? (
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              top: SAFE.top,
              bottom: SAFE.bottom,
              left: SAFE.side,
              right: SAFE.side,
              border: "4px dashed rgba(255,0,120,0.8)",
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
