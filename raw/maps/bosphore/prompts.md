# Prompts Gemini — Palais du Bosphore (terrain Sultan)

Process : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) · template
[`raw/maps/_TEMPLATE/`](../_TEMPLATE/).

Régénération **arrière-plan** : `skyline` (+ `far` / `thumb`).  
Props à garder ou regénérer à part : `flag`, `warn`, `net_post`, `carpet`
(voir `prompts-event.md`).

## Options Gemini
1. Mode **image** (Imagen) · **1 image à la fois** · ratio **16:9** fonds.
2. Style cartoon éditorial, aplats, contours noirs — **pas photo**.
3. Après `skyline`, référence pour `far` / `thumb`.
4. Pas de vrai drapeau national, **pas de croissant+étoile**, pas de texte,
   pas de vrai nom de dirigeant / mosquée.
5. Fichiers : `raw/maps/bosphore/<nom>.png` — **ne pas** cutouter skyline/far/thumb.

---

## skyline.png (16:9) — COLLE ÇA

```
Wide 2D game volleyball court background, political editorial cartoon style, thick clean black outlines, flat cel colors, no photorealism. Satirical waterfront palace plaza stage called "Palais du Bosphore": bright clear day, pale blue sky with simple white clouds, wide SYMMETRIC composition centered on a fictional ornate palace with grey-blue domes and tall minaret-like towers (parody Ottoman palace, NOT a real named mosque, NOT a photo), calm blue Bosphorus-like water glimpses on the far sides behind low stone balustrades, twin stone gateways or colonnades left and right draped with deep PURPLE and gold abstract banners ONLY (NO crescent, NO star, NO real flag layout, NO emblems, NO text), empty midground stone plaza ABOVE the court.

CRITICAL gameplay strip (non-negotiable):
- Flat volleyball COURT in the LOWER ~30–35% of the image only.
- Court surface: warm sandstone / beige, mostly EMPTY.
- Thick clear HORIZONTAL court BASELINE near the bottom edge of the court (readable dark/black line).
- Centered VERTICAL center line from that baseline up toward mid-court.
- Leave playable court empty: NO pots, NO mosaic hero rugs, NO people, NO giant props on the court.
- Architecture / water / plaza sit ABOVE the court — never instead of the court.
- Full-bleed 16:9, no letterbox, no crowd on court, no text, no logos, no watermarks, no real celebrity.
```

**Rejet si** : pas de baseline, mosaïque/allée à la place du court, symboles nationaux.

## far.png (16:9) — optionnel

```
Wide soft far background layer for a cartoon volleyball game: pale blue sky, soft haze, distant grey-blue dome and tower silhouettes across a calm blue water band only, very low detail atmospheric layer matching a Bosphorus palace plaza, flat cel style, no characters, no text, no props in foreground, 16:9 landscape.
```

## thumb.png (16:9)

```
Wide 16:9 cartoon thumbnail of the same Bosphorus palace volleyball plaza: purple-and-gold abstract banners, domes, beige court with center line and baseline, thick black outlines, flat cel colors, readable at small size, no people, no text, no logos, no crescent-star.
```

## flag.png (1:1) — si regénération

```
Single 2D cartoon ceremonial banner on a dark pole with gold tip: deep PURPLE field with simple gold abstract ornament ONLY (NO crescent, NO star, NO text, NO pure-white cloth panels). Cloth fully attached to the pole — no white triangular gap between pole and fabric. Thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full flag visible.
```

---

## Après génération
1. Checklist CRITICAL (`PIPELINE-MAP.md`) — sinon **regénérer**, ne pas « arranger » en code.
2. `cp` skyline/far/thumb → `assets/maps/bosphore/` (pas de cutout).
3. Cutout props only si besoin ; flag bosphore : **pas** de blanc dans le tissu
   (map hors `FLAG_KEEP_WHITE_MAPS`).
4. Mesurer `baselineFromBottom` → `MAP_LAYOUT.bosphore` ; `codeSeam` seulement
   si la ligne PNG reste douteuse.
5. Météo : ciel clair (pas de tempête forcée sur cette map sauf design contraire).
