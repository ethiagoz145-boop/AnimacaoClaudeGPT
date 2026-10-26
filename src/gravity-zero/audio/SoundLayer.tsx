import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile } from "remotion";
import { z } from "zod";
import { IMPACTS } from "../layout";
import { COUNT_STEP, T } from "../timeline";

/**
 * Pontos de entrada para narração, trilha e efeitos sonoros.
 * Nenhum arquivo é incluído: preencha as props com caminhos dentro de
 * `public/` (ex.: "sfx/whoosh.wav") ou URLs. Vazio = sem som.
 */
export const audioSchema = z.object({
  narration: z.string(),
  music: z.string(),
  sfxWhoosh: z.string(),
  sfxShock: z.string(),
  sfxTick: z.string(),
  sfxReturn: z.string(),
  sfxImpact: z.string(),
});

export type AudioProps = z.infer<typeof audioSchema>;

export const NO_AUDIO: AudioProps = {
  narration: "",
  music: "",
  sfxWhoosh: "",
  sfxShock: "",
  sfxTick: "",
  sfxReturn: "",
  sfxImpact: "",
};

/** Momentos-chave para sincronizar som (frames do vídeo). */
export const CUES = {
  whoosh: T.hookEnd - 6,
  shock: T.shock,
  ticks: [0, 1, 2, 3, 4].map((i) => T.countdown + i * COUNT_STEP),
  return: T.gravityBack,
  firstImpact: Math.floor(Math.min(...IMPACTS.map((i) => i.frame))),
};

const src = (s: string) => (/^https?:\/\//.test(s) ? s : staticFile(s));

const Cue: React.FC<{ from: number; file: string; volume?: number }> = ({ from, file, volume = 1 }) =>
  file ? (
    <Sequence from={from} layout="none">
      <Audio src={src(file)} volume={volume} />
    </Sequence>
  ) : null;

export const SoundLayer: React.FC<{ audio: AudioProps }> = ({ audio }) => (
  <>
    {audio.music ? <Audio src={src(audio.music)} volume={0.35} /> : null}
    {audio.narration ? <Audio src={src(audio.narration)} /> : null}
    <Cue from={CUES.whoosh} file={audio.sfxWhoosh} />
    <Cue from={CUES.shock} file={audio.sfxShock} />
    {CUES.ticks.map((f) => (
      <Cue key={f} from={f} file={audio.sfxTick} volume={0.6} />
    ))}
    <Cue from={CUES.return} file={audio.sfxReturn} />
    <Cue from={CUES.firstImpact} file={audio.sfxImpact} />
  </>
);
