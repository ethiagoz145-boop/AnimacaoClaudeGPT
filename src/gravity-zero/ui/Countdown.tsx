import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COUNT_STEP, T } from "../timeline";
import { SAFE } from "./Captions";

const FONT = '"Segoe UI", "Arial Black", Arial, sans-serif';

/** HUD da contagem fictícia de 5 segundos (abaixo das legendas). */
export const Countdown: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = T.countdown - 6;
  const end = T.fallStart + 8;
  if (frame < start || frame >= end) return null;

  const elapsed = frame - T.countdown;
  const step = Math.max(0, Math.floor(elapsed / COUNT_STEP));
  const n = Math.max(0, 5 - step);
  const tickFrame = T.countdown + Math.min(step, 5) * COUNT_STEP;
  const pop = spring({ frame: frame - tickFrame, fps, config: { damping: 9, stiffness: 220, mass: 0.5 } });
  const within = n === 0 ? 1 : Math.max(0, elapsed - step * COUNT_STEP) / COUNT_STEP;
  const appear = spring({ frame: frame - start, fps, config: { damping: 14 } });
  const leave = interpolate(frame, [end - 8, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zero = n === 0;
  const R = 92;
  const C = 2 * Math.PI * R;
  const accent = zero ? "#FF5D73" : "#7DF9FF";

  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top + 300,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: appear * leave,
        transform: `scale(${(0.7 + appear * 0.3) * 0.72})`,
        transformOrigin: "50% 0%",
        fontFamily: FONT,
      }}
    >
      <div style={{ position: "relative", width: 230, height: 230 }}>
        <svg width={230} height={230} style={{ position: "absolute", inset: 0 }}>
          <circle cx={115} cy={115} r={R + 12} fill="rgba(27,21,48,0.72)" />
          <circle cx={115} cy={115} r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={10} />
          <circle
            cx={115}
            cy={115}
            r={R}
            fill="none"
            stroke={accent}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * within}
            transform="rotate(-90 115 115)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 128,
            fontWeight: 900,
            color: zero ? accent : "#FFFFFF",
            transform: `scale(${1.35 - pop * 0.35})`,
            textShadow: `0 0 30px ${accent}`,
          }}
        >
          {n}
        </div>
      </div>
      <div
        style={{
          marginTop: 18,
          padding: "10px 26px",
          borderRadius: 40,
          background: "rgba(27,21,48,0.72)",
          color: accent,
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: 4,
        }}
      >
        {zero ? "GRAVIDADE: ON" : "GRAVIDADE: OFF"}
      </div>
    </div>
  );
};
