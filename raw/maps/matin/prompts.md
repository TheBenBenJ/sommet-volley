# Prompts Gemini — Place du Matin (terrain Panda)

Process : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) · template
[`raw/maps/_TEMPLATE/`](../_TEMPLATE/).

**Layout jeu** : `bgFullHeight: true` — décor plein cadre ; baseline sur la
ligne de court (souvent `0` + `codeSeam` si traits PNG faibles).

Event lanternes : [`prompts-event.md`](prompts-event.md).

## skyline.png (16:9) — COLLE ÇA

```
Wide 2D game volleyball court background, political editorial cartoon style, thick clean black outlines, flat cel colors, no photorealism. Satirical dawn plaza stage called "Place du Matin": soft morning sky, parody East-Asian monumental gate / pavilion silhouette (fictional, NOT a real named square), warm stone plaza, red-and-gold abstract lantern mood, NO real national flags, NO text, NO political slogans.

CRITICAL gameplay strip (non-negotiable):
- Flat volleyball COURT in the LOWER portion with thick clear HORIZONTAL BASELINE and centered VERTICAL center line.
- Court surface: pale stone, mostly EMPTY.
- Architecture / gate sit ABOVE the court — never instead of the court.
- Extra pavement may extend below the baseline for full-bleed UI, but baseline must stay readable.
- Full-bleed 16:9, no people on court, no text, no logos, no watermarks.
```

Props : template `_TEMPLATE` (palette rouge / or / pierre). Cutout props only.
