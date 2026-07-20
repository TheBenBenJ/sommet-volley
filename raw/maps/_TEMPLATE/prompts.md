# Template prompts map — à copier vers `raw/maps/<key>/`

Référence process : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md).

Remplace `<KEY>`, `<DISPLAY_NAME>`, `<THEME_BLURB>`, couleurs, et le bloc
thématique. **Ne pas** affaiblir le bloc CRITICAL.

---

## Options Gemini

1. Mode **image** (Imagen).
2. **1 image à la fois**.
3. Ratio : **16:9** fonds / thumb large ; **1:1** ou **3:4** props.
4. Style cartoon éditorial, aplats, contours noirs — **pas photo**.
5. Après un bon `skyline`, uploade-le en **référence** pour far / thumb / crowd.
6. Props : fond **blanc pur #FFFFFF**, pas d’ombre au sol.
7. Pas de vrai drapeau / sceau / texte / lieu nommé / dirigeant réel.
8. Fichiers : `raw/maps/<KEY>/<nom>.png`

---

## skyline.png (16:9) — EN PREMIER

```
Wide 2D game volleyball court background, political editorial cartoon style, thick clean black outlines, flat cel colors, no photorealism. Satirical stage called "<DISPLAY_NAME>": <THEME_BLURB>.

CRITICAL gameplay strip (non-negotiable):
- Flat volleyball COURT in the LOWER ~30–35% of the image only.
- Court surface: warm sandstone / beige / packed earth (theme-consistent), mostly EMPTY.
- Thick clear HORIZONTAL court BASELINE near the bottom edge of the court (readable dark/black line).
- Centered VERTICAL center line from that baseline up toward mid-court.
- Leave playable court empty: NO pots, NO mosaic hero rugs, NO people, NO giant props on the court.
- Architecture, water, plaza, bleachers sit ABOVE the court — never instead of the court.
- Full-bleed 16:9 landscape, no letterbox bars, no people on the court, no crowd yet, no text, no logos, no watermarks, no real celebrity, no real national flags or religious emblems.
```

### Rejet immédiat si…
- pas de baseline horizontale nette en bas du court ;
- belle allée / mosaïque / pergola **à la place** du court ;
- court trop haut dans le cadre ;
- symboles nationaux / religieux réels.

---

## far.png (16:9)

```
Wide soft far background layer for a cartoon volleyball game matching "<DISPLAY_NAME>": pale atmospheric sky, soft haze, distant landmark silhouettes only, very low detail, flat cel style, no characters, no text, no foreground props, 16:9 landscape.
```

## thumb.png (16:9 ou 1:1)

```
Cartoon menu thumbnail of the same "<DISPLAY_NAME>" volleyball stage: readable court strip + landmark, thick black outlines, flat cel colors, no people, no text, no logos, no real flags.
```

## flag.png (1:1)

```
Single 2D cartoon ceremonial banner on a pole with simple tip: solid or simple abstract motifs ONLY (NO real national flag layout, NO crescent-star, NO swastika, NO stars-and-canton, NO text). Prefer NO pure white in the cloth (cream/gold/color OK). Cloth fully attached to the pole — no white triangular gap between pole and fabric. Thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full flag visible.
```

## net_post.png (3:4)

```
Single 2D cartoon volleyball net POST only (no mesh/net strings): theme-consistent post from base to tip, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full post visible, game asset.
```

## warn.png (1:1)

```
Single 2D cartoon warning icon for a map event: bold triangular warning sign with exclamation mark, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no shadow, readable UI prop. No extra text.
```

---

## Après génération

1. Valider le CRITICAL strip (checklist `PIPELINE-MAP.md`).
2. Copier skyline/far/thumb **sans** cutout → `assets/maps/<KEY>/`.
3. Cutout props only :
   `python3 tools/cutout.py raw/maps/<KEY> assets/maps/<KEY>`
   (si le script voit aussi les fonds, re-copie skyline/far/thumb après).
4. Mesurer `baselineFromBottom` → `MAP_LAYOUT` dans `src/terrains.js`.
5. Prop event : voir `prompts-event.md`.
