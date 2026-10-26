import { createContext, useContext } from "react";

/** Tempo da cena (em frames). Difere do frame do vídeo durante o gancho. */
export const SceneTimeContext = createContext(0);
export const useSceneTime = () => useContext(SceneTimeContext);
