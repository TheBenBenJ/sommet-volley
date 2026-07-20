# Prompts Gemini — Esplanade du Défilé (terrain Houn)

Process : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) · template
[`raw/maps/_TEMPLATE/`](../_TEMPLATE/).

**Layout jeu** : `bgFullHeight: true` — le décor descend sous la ligne de score ;
la **ligne de court** dans le PNG doit être assez haute pour caler `GROUND_Y`
(baseline typiquement large, ex. ~300+ px from bottom — mesurer après génération).

## Options Gemini

1. Mode **image** (Imagen).
2. **1 image à la fois**.
3. Ratio : **16:9** pour far / skyline / crowd / thumb / parade ; **1:1** ou **3:4** pour props.
4. Style cartoon éditorial, aplats, contours noirs — **pas photo**.
5. Après `skyline`, uploade-le en **référence** pour far / crowd / thumb.
6. Props : fond **blanc pur #FFFFFF**, pas d’ombre au sol.
7. Ne pas citer de vrai nom de dirigeant, de pays, ni de drapeau réel. Pas d’armes réalistes, pas de missiles.
8. Nomme : `raw/maps/houn/<nom>.png`  
   Puis détoure les **props** (pas skyline / far / thumb) — voir `PIPELINE-MAP.md`.

---

## skyline.png (16:9) — COLLE ÇA EN PREMIER

```
Wide 2D game volleyball court background, political editorial cartoon style, thick clean black outlines, flat cel colors, no photorealism. Monumental parade plaza stage called "Esplanade du Défilé": pale grey-blue sky, massive grey stone grandstands left and right with red-and-gold abstract banners (NO real flags, NO emblems, NO stars, NO text), oversized cartoon stone statues of anonymous strongmen holding volleyballs, distant blocky government palace silhouette with a tall pointed ornamental tower, rows of small cartoon lamp posts, solemn satirical arcade sports stage.

CRITICAL gameplay strip (non-negotiable):
- Flat volleyball COURT pavement in the LOWER portion with a thick clear HORIZONTAL BASELINE (dark line) and centered VERTICAL center line.
- Court mostly EMPTY for gameplay; grandstands and palace sit ABOVE the court.
- Extra paved apron may extend BELOW the baseline (full-bleed bg for UI score band) but the baseline itself must stay clearly readable.
- Full-bleed 16:9, no text, no logos, no real celebrity, no watermarks, no weapons, no missiles, no people on the court.
```



## far.png (16:9)

```
Wide soft far background layer for a cartoon volleyball game: pale grey-blue sky, soft haze, distant blocky palace and pointed tower silhouettes only, very low detail atmospheric layer, flat cel style, no characters, no text, no props in foreground, 16:9 landscape.
```



## crowd_0.png (16:9)

```
Wide 2D cartoon spectator crowd strip for a parade-plaza volleyball match: dense row of fans in dark olive tunics and grey coats behind a low red-and-gold railing, many tiny raised hands clapping in unison, a few red pompons or blank placards (NO readable text, NO emblems), thick black outlines, flat cel colors. Put the crowd in the UPPER half; LOWER half solid pure white #FFFFFF for cropping. No photorealism, no logos, no weapons.
```



## flag.png (1:1)

```
Single 2D cartoon prop: ceremonial parade banner on a dark pole, solid red field with a simple gold circle ornament only (NO stars, NO seals, NO text, NO real national symbols), thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full banner visible.
```



## flower.png (1:1)

```
Single 2D cartoon prop: oversized bouquet of red and pink flowers with green leaves (parade gift vibe), thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, readable game silhouette. No text, no ribbons with writing.
```



## net_post.png (3:4)

```
Single 2D cartoon volleyball net POST only (no mesh): monumental grey stone post with a small red-and-gold ornamental top (parade plaza motif), thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full post from base to tip. No net strings, no text, no weapons.
```



## warn.png (1:1)

```
Single 2D cartoon warning icon: yellow triangular warning sign with bold black exclamation mark, thick outlines, flat colors, pure solid white background #FFFFFF, no shadow, clean game UI prop.
```



## radar_0.png (1:1) — event Batterie AA (idle)

```
Single 2D cartoon game prop: toy-like anti-air radar dish on a short wheeled base, olive-grey and dark metal colors, dish facing right, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, cute arcade satire (NOT realistic military hardware), no missiles, no barrels firing, no text, no logos.
```



## radar_1.png (1:1) — event Batterie AA (actif)

```
Single 2D cartoon game prop: same toy-like olive-grey radar dish facing right as active pose, dish tilted up slightly, tiny red ping/blink accents near the dish only, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow. Arcade satire only — no missiles, no explosions, no realistic weapons, no text.
```

