# Prompts Houn — à coller dans Gemini (1 image = 1 pose)

## Options interface Gemini (important)

1. **Mode image** : active la génération d’images (Imagen), pas seulement le chat texte.
2. **1 image à la fois** — ne demande jamais « 8 frames en une image ».
3. **Format / ratio** : **portrait** (3:4 ou 9:16). Objectif ≥ **1024 px de haut**.
4. **Style** : aucun filtre « photo / réaliste / cinematic ».
5. **Référence** : après une bonne `idle_face_0`, uploade-la pour toutes les poses suivantes.
6. **Rejette** si : fond pas blanc uni, ombre au sol, perso coupé, style photo, damier.

Nomme les fichiers : `raw/houn/<anim>_<n>.png`  
Puis : `python3 tools/cutout.py raw/houn assets/houn`

---

## BLOC A — Style

```
Single solo character illustration, ONE character only, centered, political editorial cartoon style. Thick even black ink outlines, flat cel-shading, flat color fills only (NO photo realism, NO gradients, NO ambient occlusion). Exaggerated caricature proportions MATCHING the game cast: oversized head about one-third of total height, SHORT STOCKY compact body (same body mass / silhouette fill as a barrel-chested volleyball mascot — NOT tall, NOT lanky, NOT skinny, NOT stretched). Same framing scale as other cast characters: character fills most of the vertical frame with ~5% margin. Pure solid flat white background #FFFFFF only — no checkerboard, no backdrop, no floor, no ground shadow, no vignette. High resolution, at least 1024px tall. Exactly one figure — never a row, never duplicates, never a lineup.
```

## BLOC B — Personnage

⚠️ Ne pas citer de vrai nom de dirigeant.

```
Character: "Kim Jong Houn" — fictional satirical cartoon volleyball mascot (invented character, not a portrait of any real person). Same compact stocky proportions as the rest of the cast (short powerful legs, wide torso, big round head). Jet-black bowl-cut hair with sharp bangs, pale skin (#f0d5c0), tiny squinted eyes, chubby cheeks, thin lips, solemn or smug tiny smile. Clothes: dark olive-grey Mao-style tunic suit (#2d3a2e) with mandarin collar, bright red circular pin/badge on left chest (#c62828), dark trousers matching the tunic, black dress shoes. Volleyball athlete vibe in absurd formal parade outfit. Clean graphic novel / press cartoon look. CRITICAL: same visual weight and scale as a short stocky strongman teammate — never a thin stick figure.
```

## BLOC C — Négatif

```
Avoid: tall lanky proportions, skinny stick figure, stretched body, tiny head, multiple characters, character sheet, model sheet, turnaround, lineup, duplicates, clones, photorealism, real celebrity likeness, photographic skin, soft airbrush, grey background, transparent checkerboard, cast shadow on ground, cropped limbs, text, watermark, props clutter, 3D render, anime soft shading, missiles, flags filling the background, military hardware.
```

---

## Template

Colle toujours : **A + B + POSE + C**

## idle_face_0

**POSE :**
```
Pose filename idle_face_0: three-quarter front view facing slightly toward camera, standing straight, arms at sides or one hand in a stiff parade wave, solemn confident tiny smile, feet planted, ready for character select screen. NOT profile. Red chest pin clearly visible.
```

(Other poses: same RIGHT-FACING PROFILE set as trompette/vladou — idle, walk×8, jump×3, receive×2, aim×2, smash×3, super×4, panic×2, victory×2, defeat×2.)
