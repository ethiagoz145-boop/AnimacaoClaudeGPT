import { useCurrentFrame, useVideoConfig } from "remotion";
import { TIMELINE_FPS } from "./timeline";

/** Tempo contínuo na base original de 30 fps, sem arredondar subframes. */
export const timelineFrameFor = (frame: number, fps: number): number =>
  (frame * TIMELINE_FPS) / fps;

export const useTimelineFrame = (): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return timelineFrameFor(frame, fps);
};
