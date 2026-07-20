# Illustrations Mode Histoire — prompts prêts à coller (Gemini / Imagen)

> Le mode histoire tourne SANS ces images (dopage rendu par une teinte rouge
> procédurale + aura). Ces illustrations sont un **bonus** : dès qu'un fichier
> est déposé au bon chemin, le jeu l'utilise automatiquement (fallback sinon).
>
> ⚠️ Le CLI `gemini` de cette machine ne peut plus s'authentifier
> (« IneligibleTierError : migrate to Antigravity ») → génération impossible en
> ligne de commande. Utiliser l'**interface Gemini** (mode Imagen), comme pour
> le roster (voir `raw/<perso>/prompts.md`).

## A. Portraits « dopés » (priorité) — image-à-image

But : une version au regard injecté de sang / veines saillantes de l'adversaire
dopé, affichée dans les dialogues et cohérente avec le sprite existant.

Méthode : **uploader le portrait existant** `assets/<key>/idle_face_0.png`
comme référence, puis demander l'édition. Garder EXACTEMENT le même personnage,
mêmes habits, même cadrage, fond blanc pur #FFFFFF.

Chemin de sortie attendu par le jeu : `assets/story/<key>_doped.png`
(`houn_doped.png`, `yogi_doped.png`, `vladou_doped.png`).

Prompt (coller après avoir uploadé l'idle_face de référence) :

```
Edit this exact cartoon character, keep the SAME identity, same outfit, same
colors, same compact stocky proportions, same framing and pure solid white
background #FFFFFF. Only change: make him look DOPED / on illegal performance
enhancers — bloodshot glowing red eyes, bulging red veins on the temples and
neck, a menacing clenched grin, faint red energy aura hugging the silhouette,
slight sweat sheen. Thick even black ink outlines, flat cel-shading, flat color
fills, editorial political cartoon style (NO photorealism, NO gradients). Exactly
one figure, no duplicates, no text, no ground shadow. High resolution, ≥1024px tall.
```

Négatif : `photorealism, real celebrity likeness, extra characters, model sheet,
lineup, grey/checkerboard background, cast shadow, cropped limbs, text, watermark,
weapons, 3D render.`

Post-traitement (détourage, comme le roster) :
`python3 tools/cutout.py raw/story assets/story`  *(ou copie manuelle si le fond
est déjà blanc net — ces portraits ne sont pas des sprites de jeu, pas d'ancrage
pieds nécessaire).*

Personnages dopés dans la campagne : **houn** (ch. 6), **yogi** (ch. 7),
**vladou** (ch. 8 & finale).

## B. Splashs d'acte (optionnel, ambiance)

Grandes illustrations panoramiques d'ouverture d'acte (non encore branchées au
rendu — à câbler si tu les génères). Format paysage 16:9, ≥1600px de large.

Chemin : `assets/story/act1.png`, `act2.png`, `act3.png`.

- **Acte I — Petites rivalités** :
```
Wide cinematic editorial-cartoon establishing shot: a grand international summit
turned into a friendly beach-volleyball tournament, sunny, flags of many nations
as bunting, a golden net at center, cheering diplomats in the stands. Warm
optimistic mood. Thick black ink outlines, flat cel-shading, flat colors, NO
photorealism. No real logos, no real faces, no text. 16:9.
```
- **Acte II — Le froid revient** :
```
Wide cinematic editorial-cartoon shot: the same tournament under a cold grey sky,
snow starting to fall, the volleyball glowing like a ticking bomb at center, two
distant silhouettes squaring off, tense diplomatic mood, searchlights. Thick
black ink outlines, flat cel-shading, flat colors, NO photorealism, no real
faces, no text. 16:9.
```
- **Acte III — Jeux impitoyables** :
```
Wide cinematic editorial-cartoon shot: a stormy Olympic-style stadium at night,
red warning lights, a cracked podium, syringes and doping vials hinted in the
shadows, an ominous ruthless mood, a lone glowing red-eyed champion silhouette.
Thick black ink outlines, flat cel-shading, flat colors, NO photorealism, no real
faces, no text. 16:9.
```

## Intégration (rappel)

- Portraits dopés : `assets/story/<key>_doped.png` → utilisés automatiquement
  par `storyDrawPortrait()` (sinon teinte rouge procédurale).
- Splashs d'acte : à câbler (afficher au changement d'acte dans `drawStoryScene`
  ou sur le hub) — non branché tant que les images n'existent pas.
