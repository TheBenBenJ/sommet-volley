# Prompts Gemini — Palais de l'Hexagone (terrain Micron)

Process : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) · template
[`raw/maps/_TEMPLATE/`](../_TEMPLATE/).

## Options Gemini
1. Mode **image** (Imagen).
2. **1 image à la fois**.
3. Ratio : **16:9** pour far / skyline / crowd / thumb / marchers ; **1:1** ou **3:4** pour props.
4. Style cartoon éditorial, aplats, contours noirs — **pas photo**.
5. Après `skyline`, uploade-le en **référence** pour far / crowd / thumb.
6. Props : fond **blanc pur #FFFFFF**, pas d’ombre au sol.
7. Ne pas citer de vrai nom de dirigeant ni de monument sous son vrai nom commercial.
8. Nomme : `raw/maps/palais-du-coq/<nom>.png` — cutout props only (pas skyline/far/thumb).

---

## skyline.png (16:9) — COLLE ÇA

```
Wide 2D game volleyball court background, political editorial cartoon style, thick clean black outlines, flat cel colors, no photorealism. French palace courtyard stage "Palais de l'Hexagone": pale blue sky, elegant pale limestone palace wings left and right with classic columns and mansard roofs, distant iconic iron lattice tower silhouette in the background (fictional Paris landmark parody, not a photo), blue-white-red abstract banners on poles (NO real flag canton/stars layout if any white is used carefully), a few cartoon pigeons, trimmed hedges ABOVE the court.

CRITICAL gameplay strip (non-negotiable):
- Flat volleyball COURT in the LOWER ~30–35% of the image only.
- Court surface: light-grey gravel/sand, mostly EMPTY.
- Thick clear HORIZONTAL court BASELINE near the bottom edge of the court (readable dark line).
- Centered VERTICAL center line from that baseline up toward mid-court.
- Leave playable court empty: NO pots, NO people, NO giant props on the court.
- Palace wings / tower sit ABOVE the court — never instead of the court.
- Sunny institutional France vibe, satirical arcade sports stage. Full-bleed 16:9, no text, no logos, no real celebrity, no watermarks.
```

## far.png (16:9)

```
Wide soft far background layer for a cartoon volleyball game: pale blue sky, soft haze, distant pale city rooftops and a faint iron lattice tower silhouette only, very low detail atmospheric layer, flat cel style, no characters, no text, no props in foreground, 16:9 landscape.
```

## crowd_0.png (16:9)

```
Wide 2D cartoon spectator crowd strip for a palace courtyard volleyball match: row of well-dressed guests, journalists, and fans behind a low gold-and-navy railing, French chic clothes with a few blue-white-red accents, thick black outlines, flat cel colors. Put the crowd in the UPPER half; LOWER half solid pure white #FFFFFF for cropping. No text, no logos, no photorealism, no readable protest slogans.
```

## flag.png (1:1)

```
Single 2D cartoon prop: ceremonial flag on a gold pole with blue-white-red vertical stripes (abstract tricolor, no emblems), thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full flag visible. No text, no seals, no logos.
```

## pigeon.png (1:1)

```
Single 2D cartoon grey pigeon prop, side view facing right, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, simple readable silhouette for a sports game. No text.
```

## net_post.png (3:4)

```
Single 2D cartoon volleyball net POST only (no mesh): elegant navy and gold institutional post with a small decorative top (hint of palace/lamp motif), thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, full post from base to tip. No net strings, no text.
```

## warn.png (1:1)

```
Single 2D cartoon warning icon: yellow triangular warning sign with bold black exclamation mark, thick outlines, flat colors, pure solid white background #FFFFFF, no shadow, clean game UI prop.
```

## whistle.png (1:1) — optionnel (annonce event)

```
Single 2D cartoon referee whistle prop, silver/grey, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow. No text.
```

## marchers_0.png (16:9) — cortège event

```
Wide 2D cartoon protest march strip for a satirical volleyball game event: a line of stylized cartoon demonstrators walking left-to-right in the LOWER half of the image, holding blank or abstract colored placards (NO readable words, NO real slogans, NO party logos), thick black outlines, flat cel colors. UPPER half solid pure white #FFFFFF. Friendly arcade satire, not violent, no police, no weapons. No photorealism.
```

## marchers_1.png (16:9)

```
Wide 2D cartoon protest march strip, same style as a previous marchers frame: demonstrators mid-step alternate pose walking left-to-right in the LOWER half, blank abstract placards only (NO readable text), thick black outlines, flat cel colors. UPPER half solid pure white #FFFFFF. Same character designs energy, friendly arcade satire, no violence, no logos.
```

## thumb.png (1:1)

```
Square game menu thumbnail of Palais de l'Hexagone volleyball stage: limestone palace courtyard, distant iron lattice tower silhouette, tricolor flags, gravel court, sunny institutional cartoon France, thick outlines flat style, readable at small size, no text, no logos.
```
