# Prompts Gemini — Maison Blanche (terrain Trompette)

Process : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) · template
[`raw/maps/_TEMPLATE/`](../_TEMPLATE/).

Remplace le thème « Resort Doré / golf ». Même fichiers que le pack actuel
pour ne pas casser le loader (`skyline`, `far`, `crowd_0`, `cart_*`, `flag`,
`warn`, `net_post`, `thumb`). Le palmier n’est plus utile (prop désactivée) :
remplace-le par une **colonne / roseraie** si tu veux un décor latéral.

Nom de scène affiché :
**« Pelouse Oval »** ou **« Maison Blanche »** (parodie, pas de vrai nom de président).

**Météo** : cette map reste en ciel **clair** en jeu (pas de tempête / sable) —
ne pas peindre une tempête dans le skyline.

## Options Gemini
1. Mode **image** (Imagen).
2. **1 image à la fois**.
3. Ratio : **16:9** pour far / skyline / crowd / thumb ; **1:1** ou **3:4** pour props.
4. Style cartoon éditorial, aplats, contours noirs — **pas photo**.
5. Après `skyline`, uploade-le en **référence** pour far / crowd / thumb (même lieu).
6. Props : fond **blanc pur #FFFFFF**, pas d’ombre au sol.
7. Ne pas citer de vrai nom de dirigeant. Pas de sceau officiel, pas de logo, pas de texte lisible.
8. Nomme : `raw/maps/trompette/<nom>.png`  
   Puis détoure les **props** (pas skyline / far / thumb) — voir `PIPELINE-MAP.md`.

---

## skyline.png (16:9) — COLLE ÇA EN PREMIER

```
Wide 2D game volleyball court background, political editorial cartoon style, thick clean black outlines, flat cel colors, no photorealism. Satirical neoclassical white mansion lawn stage called "Pelouse Oval": bright pale blue sky, iconic white columned mansion facade centered in the background (fictional White House parody, NOT a photo, NOT labeled), wide green manicured lawn as midground ABOVE the court, low white balustrade, American-parade vibe with abstract red-white-blue bunting ONLY (NO stars, NO real flag layout, NO seals, NO text), a few cartoon rose bushes and lamp posts on the sides.

CRITICAL gameplay strip (non-negotiable):
- Flat volleyball COURT in the LOWER ~30–35% of the image only.
- Court surface: light sandy-beige / pale gravel, mostly EMPTY.
- Thick clear HORIZONTAL court BASELINE near the bottom edge of the court (readable dark/black line).
- Centered VERTICAL center line from that baseline up toward mid-court.
- Leave playable court empty: NO pots, NO vehicles, NO people, NO giant props on the court.
- Mansion / lawn / balustrade sit ABOVE the court — never instead of the court.
- Sunny clear-day satirical arcade sports stage (NO storm, NO sandstorm). Full-bleed 16:9, no people on court, no crowd yet, no text, no logos, no watermarks, no real celebrity.
```

## far.png (16:9)

```
Wide soft far background layer for a cartoon volleyball game: pale blue sky, soft haze, distant white neoclassical mansion silhouette with tiny columns only, faint green lawn band, very low detail atmospheric layer, flat cel style, no characters, no text, no props in foreground, 16:9 landscape.
```

## crowd_0.png (16:9)

```
Wide 2D cartoon spectator CROWD STRIP for a White House lawn volleyball match. Thick black outlines, flat cel colors, no photorealism. CRITICAL SCALE: dozens of SMALL distant spectators packed tightly — each head tiny (about 1/12–1/15 of image height), dense mass, NOT a short lineup of large portrait characters. Mix of tourists, press with blank cameras, staff in dark suits, a few red baseball caps (NO logos, NO slogans). Low thin white-and-gold railing at bottom of crowd band only. Entire crowd in UPPER 40%; LOWER 60% solid pure white #FFFFFF. No giant props, no hero poses, no text, no seals, no watermarks.
```

## cart_0.png (1:1) — event (même slot que l’ancienne voiturette)

```
Single 2D cartoon game prop: glossy black-and-gold mini motorcade cart / parody Secret Service golf cart, facing right, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, no floor, full vehicle visible, tiny dark-suited silhouette driver OK. Arcade satire, cute and readable, NOT a realistic armored vehicle. No text, no seals, no logos, no weapons.
```

## cart_1.png (1:1)

```
Single 2D cartoon game prop: same black-and-gold mini motorcade cart facing right as action/horn pose, slight bounce, tiny motion lines near a gold horn only, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow. No text, no logos, no weapons.
```

## palm.png (3:4) — OPTION A : garde le nom de fichier, change le sujet

(Le code charge encore `palm.png` ; tu peux y mettre une colonne / buisson à la place.)

```
Single 2D cartoon prop: white neoclassical garden column with a small gold capital, optional tiny rose bush at the base, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, no floor, full prop visible, game asset. No text, no seals.
```

## palm.png (3:4) — OPTION B : vrai palmier (si tu veux garder une touche « resort »)

```
Single 2D cartoon palm tree prop, thick black outlines, flat green fronds and brown trunk, pure solid white background #FFFFFF, no ground shadow, no floor, full tree visible, game asset. No text.
```

## flag.png (1:1)

```
Single 2D cartoon ceremonial flag on a white pole with gold tip: abstract red-white-blue horizontal stripes ONLY (NO stars, NO canton, NO seals, NO text), thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full flag visible. Parody patriotic banner, not a real national flag.
```

## net_post.png (3:4)

```
Single 2D cartoon volleyball net POST only (no mesh): white neoclassical column-style post with a small gold eagle-inspired ornament simplified to abstract curves (NO real seal, NO text), thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full post from base to tip, game asset. No net strings.
```

## warn.png (1:1)

```
Single 2D cartoon warning icon: yellow triangular warning sign with bold black exclamation mark, thick outlines, flat colors, pure solid white background #FFFFFF, no shadow, clean game UI prop.
```

## thumb.png (1:1)

```
Square game menu thumbnail of Pelouse Oval volleyball stage: white columned mansion facade, green lawn, pale court strip, abstract red-white-blue bunting, sunny satirical cartoon White House parody, thick outlines flat style, readable at small size, no text, no logos, no seals, no real celebrity.
```

---

## Ordre recommandé
1. `skyline.png`
2. `far.png` (skyline en référence)
3. `crowd_0.png` (skyline en référence)
4. `thumb.png` (skyline en référence)
5. props : `flag` → `net_post` → `cart_0` → `cart_1` → `palm` → `warn`

## Après génération
1. Checklist CRITICAL (`PIPELINE-MAP.md`) — sinon regénérer.
2. Cutout **props only** ; re-copie skyline/far/crowd/thumb si le script les a touchés :
   `cp raw/maps/trompette/{skyline,far,crowd_0,thumb}.png assets/maps/trompette/`
3. Mesurer `baselineFromBottom` → `MAP_LAYOUT.plage` (terrainKey `plage` → pack `trompette`).
4. Confirmer météo claire en code pour cette map.
