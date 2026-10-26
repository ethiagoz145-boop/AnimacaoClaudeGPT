# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i --loglevel=error
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

## GRAVITY ZERO (`GravityZero`)

Short vertical (1080x1920, 30 fps, 28 s) em 3D low poly: "E se a gravidade desaparecesse por 5 segundos?"

```console
npm run dev                                   # Studio → composição GravityZero
npx remotion render GravityZero out/gravity-zero.mp4
```

Estrutura em `src/gravity-zero/`:

| Pasta / arquivo | Papel |
| --- | --- |
| `timeline.ts` | marcos de tempo (pulso, contagem, retorno, queda, loop) |
| `physics.ts` | "física" analítica e determinística (subida, flutuação, queda com quiques) |
| `layout.ts` | dados da cidade: casas, árvores, carros, pessoas, objetos |
| `scene/`, `objects/` | cenário, iluminação e modelos low poly |
| `camera/CameraRig.tsx` | planos de câmera dirigidos + tremor nos impactos |
| `effects/` | onda de choque, poeira, folhas, fonte, nuvens, pássaros |
| `ui/` | legendas em PT-BR, contagem, flashes e vinheta |
| `audio/SoundLayer.tsx` | pontos de entrada para narração/trilha/SFX (vazios por padrão) |

Áudio: preencha as props `audio.*` no Studio com caminhos dentro de `public/`
(ex.: `sfx/impact.wav`) ou URLs. Os momentos de sincronia estão em `CUES`.
Ative `showSafeZones` para visualizar as margens seguras de Shorts/Reels/TikTok.

## Exportar e validar

```console
npm ci
npm run lint
npm run build
npm run render
```

`npm run render` exporta a composição `GravityZero` para `out/gravity-zero.mp4`.
`npm run still -- --frame=470` exporta uma imagem da cidade flutuando.
A instalação escolhe automaticamente o compositor do Remotion para seu sistema operacional.

### Áudio pendente

O vídeo está sem áudio por padrão. Para usar sua voz do ElevenLabs, salve o
arquivo em `public/audio/narracao.mp3` e informe `audio/narracao.mp3` na prop
`audio.narration` no Studio. Faça o mesmo com trilha e efeitos nas outras props
`audio.*`. Não coloque chaves de API nos arquivos do projeto.

Para exportar com os mesmos áudios pela linha de comando, crie um arquivo
`props.json` com todas as props (`showCaptions`, `showSafeZones` e `audio`,
incluindo os sete campos do esquema em `SoundLayer.tsx`) e execute:

```console
npm run render -- --props=props.json
```

A contagem de cinco segundos é exibida em câmera lenta: cada número dura dois
segundos do vídeo. A física é estilizada, não uma simulação científica.
