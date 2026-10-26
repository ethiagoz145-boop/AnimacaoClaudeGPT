// Mapa de tempo do curta (frames a 30 fps). Tudo no vídeo deriva destes marcos.
export const TIMELINE_FPS = 30;
export const FPS = 60;
export const DURATION = 28 * FPS; // 1680 frames, 28 s
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const T = {
  // 0–60: gancho (flash-forward da cidade flutuando)
  hookEnd: 60,
  // 60–210: um dia normal
  street: 210, // plano de rua
  shock: 255, // pulso: gravidade desliga
  countdown: 270, // contagem fictícia de 5 s (60 frames por "segundo")
  gravityBack: 570, // gravidade volta
  fallStart: 588, // fim da suspensão, começa a queda
  aftermath: 665,
  again: 785, // ...e começa de novo (loop)
  end: 28 * TIMELINE_FPS,
};

export const COUNT_STEP = (T.gravityBack - T.countdown) / 5;

/** O gancho mostra o futuro: um trecho do estado flutuante em câmera lenta. */
export const sceneTimeFor = (frame: number): number => {
  if (frame < T.hookEnd) {
    return 470 + frame * 0.55;
  }
  return frame;
};
