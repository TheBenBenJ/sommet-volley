# Prompts Gemini — Stade Ashram (terrain Yogi)

Process : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) · template
[`raw/maps/_TEMPLATE/`](../_TEMPLATE/).

La map actuelle est **trop claire / monochrome jaune**. On régénère avec une palette
**plus sombre et contrastée** : safran profond, terracotta, ombres indigo, ciel crépuscule.

Fichiers à remplacer (mêmes noms pour le loader) :
`skyline`, `far`, `thumb`, `flag`, `warn`, `net_post`  
(`crowd_0` optionnel — non affiché pour l’instant)  
Event : `prompts-event.md` (`cow.png`).

## Options Gemini
1. Mode **image** (Imagen).
2. **1 image à la fois**.
3. Ratio : **16:9** pour far / skyline / crowd / thumb ; **1:1** ou **3:4** pour props.
4. Style cartoon éditorial, aplats, contours noirs — **pas photo**.
5. Après `skyline`, uploade-le en **référence** pour far / thumb / crowd.
6. Props : fond **blanc pur #FFFFFF**, pas d’ombre au sol.
7. Pas de vrai temple nommé, pas de swastika, pas de drapeau national réel, pas de texte lisible.
8. Nomme : `raw/maps/ashram/<nom>.png`  
   Puis props uniquement (cutout) + copie manuelle skyline/far/thumb — voir `PIPELINE-MAP.md`.

---

## skyline.png (16:9) — COLLE ÇA EN PREMIER

```
Wide 2D game volleyball court background, political editorial cartoon style, thick clean black outlines, flat cel colors, NO photorealism. Satirical outdoor ashram stadium stage called "Stade Ashram": RICH DARK palette — deep saffron orange (#c45a12), burnt terracotta (#8b3a1a), warm brown stone, indigo-purple twilight sky (#2a1f4a to #5a3a6a) NOT pale yellow. Ornate twin gateway arches left and right with heavy carved shadows, hanging deep-orange banners (NO text, NO real religious symbols), dark sandstone steps and empty midground bleachers ABOVE the court, distant dusky hills in muted plum-brown.

CRITICAL gameplay strip (non-negotiable):
- Flat volleyball COURT in the LOWER ~30–35% of the image only.
- Court surface: warm mid-brown packed earth, mostly EMPTY.
- Thick clear HORIZONTAL court BASELINE near the bottom edge of the court (readable white or dark line).
- Centered VERTICAL center line from that baseline up toward mid-court.
- Leave playable court empty: NO pots, NO rugs, NO people, NO giant props on the court.
- Architecture sits ABOVE the court — never instead of the court.
- Moody satirical arcade sports stage, denser shading, stronger silhouettes, NOT washed-out, NOT pastel, NOT all-yellow. Full-bleed 16:9, no people on court, no crowd yet, no text, no logos, no watermarks, no real celebrity.
```

**Rejet si** : pas de baseline, palette jaune lavé, symboles religieux réels.
## far.png (16:9)

```
Wide soft far background layer for a cartoon volleyball game: deep indigo-violet dusk sky, soft haze, distant dark terracotta temple-gate silhouettes and low plum hills only, very low detail atmospheric layer, RICH DARK palette matching a saffron stadium, flat cel style, no characters, no text, no props in foreground, 16:9 landscape. NOT pale yellow, NOT washed out.
```

## thumb.png (16:9)

```
Wide 16:9 cartoon thumbnail of the same dark saffron ashram volleyball stadium: twin ornate arches, dusk indigo sky, warm brown court with white lines, thick black outlines, flat cel colors, readable at small size, no people, no text, no logos. Same rich dark palette as the skyline reference — NOT pale yellow.
```

## crowd_0.png (16:9) — optionnel

```
Wide 2D cartoon spectator CROWD STRIP for an ashram stadium volleyball match. Thick black outlines, flat cel colors, no photorealism. CRITICAL SCALE: dozens of SMALL distant spectators packed tightly — each head tiny (about 1/12–1/15 of image height), dense mass, saffron and white robes, dark jackets, NO readable text, NO real religious symbols. Low dark railing at bottom of crowd band only. Entire crowd in UPPER 40%; LOWER 60% solid pure white #FFFFFF. Rich evening lighting, not washed out. No giant props, no text, no watermarks.
```

## flag.png (1:1)

```
Single 2D cartoon ceremonial banner on a dark wooden pole with gold tip: deep saffron-orange field with a simple dark mandala-like circle ornament ONLY (NO swastika, NO real national symbols, NO text, NO pure-white cloth panels). Cloth fully attached to the pole — no white triangular gap between pole and fabric. Thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full flag visible. Parody ashram banner.
```

## net_post.png (3:4)

```
Single 2D cartoon volleyball net POST only (no mesh): carved dark sandstone / teak post with a small saffron-gold lotus-inspired tip simplified to abstract curves (NO real religious symbols, NO text), thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full post from base to tip, game asset. Rich dark wood/stone, NOT pale yellow.
```

## warn.png (1:1)

```
Single 2D cartoon warning icon for a map event: bold saffron-orange triangle with dark brown exclamation mark, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no shadow, readable game UI prop. No text other than the exclamation mark.
```

---

## Ordre recommandé
1. `skyline.png` (le plus important — palette sombre)
2. `far.png` (skyline en référence)
3. `thumb.png` (skyline en référence)
4. props : `flag` → `net_post` → `warn`
5. `crowd_0.png` si tu veux (non affiché pour l’instant)

## Après génération
1. Checklist CRITICAL (`PIPELINE-MAP.md`) — sinon regénérer.
2. Copier skyline/far/thumb **sans** cutout ; cutout props only.
3. Mesurer `baselineFromBottom` → `MAP_LAYOUT.ashram`.
4. Event vache : `prompts-event.md`.
