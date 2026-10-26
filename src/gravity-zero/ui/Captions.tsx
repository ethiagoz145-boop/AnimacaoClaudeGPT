import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../timeline";

/** Margens seguras para Shorts/Reels/TikTok (px em 1080x1920). */
export const SAFE = { top: 230, bottom: 420, side: 110 };

type Caption = {
  from: number;
  to: number;
  lines: string[]; // *palavra* = destaque
  size: number;
};

export const CAPTIONS: Caption[] = [
  { from: 3, to: 58, lines: ["E se a *gravidade*", "sumisse por", "*5 segundos?*"], size: 104 },
  { from: 82, to: 200, lines: ["Uma manhã", "*qualquer.*"], size: 84 },
  { from: 218, to: 256, lines: ["Até que..."], size: 92 },
  { from: 262, to: 330, lines: ["A gravidade", "*desligou.*"], size: 92 },
  { from: 340, to: 414, lines: ["Primeiro, o", "que é *leve.*"], size: 84 },
  { from: 424, to: 506, lines: ["Depois os *carros.*", "As *pessoas.*", "*Tudo.*"], size: 80 },
  { from: 514, to: 566, lines: ["Mas 5 segundos", "passam *rápido...*"], size: 80 },
  { from: 571, to: 600, lines: ["...e ela *volta.*"], size: 100 },
  { from: 684, to: 772, lines: ["Tudo isso em", "*5 segundos.*"], size: 88 },
  { from: T.again + 5, to: T.end + 8, lines: ["E se acontecesse", "*de novo?*"], size: 92 },
];

const Word: React.FC<{ text: string; delay: number; local: number; size: number }> = ({
  text,
  delay,
  local,
  size,
}) => {
  const { fps } = useVideoConfig();
  const hot = text.startsWith("*") && text.endsWith("*");
  const clean = text.replace(/\*/g, "");
  const s = spring({ frame: local - delay, fps, config: { damping: 12, stiffness: 180, mass: 0.6 } });
  return (
    <span
      style={{
        display: "inline-block",
        margin: `0 ${size * 0.13}px`,
        transform: `translateY(${(1 - s) * size * 0.45}px) scale(${0.6 + s * 0.4})`,
        opacity: Math.min(1, s * 1.4),
        color: hot ? "#FFD23F" : "#FFFFFF",
        WebkitTextStroke: `${size * 0.11}px #1b1530`,
        paintOrder: "stroke fill",
        textShadow: `0 ${size * 0.08}px 0 #1b1530, 0 ${size * 0.14}px ${size * 0.3}px rgba(20,10,40,0.45)`,
      }}
    >
      {clean}
    </span>
  );
};

/** Legendas curtas, palavra a palavra, com contorno grosso para contraste. */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const active = CAPTIONS.find((c) => frame >= c.from && frame < c.to);
  if (!active) return null;
  const local = frame - active.from;
  const out = interpolate(frame, [active.to - 7, active.to], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  let wordIndex = 0;
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top,
        left: SAFE.side,
        right: SAFE.side,
        textAlign: "center",
        fontFamily: '"Segoe UI", "Arial Black", "Helvetica Neue", Arial, sans-serif',
        fontWeight: 900,
        letterSpacing: -1,
        lineHeight: 1.08,
        opacity: out,
        transform: `scale(${0.96 + out * 0.04})`,
      }}
    >
      {active.lines.map((line, li) => (
        <div key={li} style={{ fontSize: active.size }}>
          {line.split(" ").map((w, wi) => {
            const delay = wordIndex++ * 3;
            return <Word key={wi} text={w} delay={delay} local={local} size={active.size} />;
          })}
        </div>
      ))}
    </div>
  );
};
