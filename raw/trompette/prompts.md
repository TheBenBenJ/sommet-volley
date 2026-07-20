# Prompts Trompette — à coller dans Gemini (1 image = 1 pose)

## Options interface Gemini (important)

1. **Mode image** : active la génération d’images (Imagen), pas seulement le chat texte.
2. **1 image à la fois** — ne demande jamais « 8 frames en une image ».
3. **Format / ratio** : **portrait** (3:4 ou 9:16). Objectif ≥ **1024 px de haut**.
4. **Style** : aucun filtre « photo / réaliste / cinematic ». Si tu as un curseur « créativité », reste **moyen**.
5. **Référence** (si l’UI le permet) : après une bonne `idle_face_0`, **uploade-la en référence** pour toutes les poses suivantes (même perso).
6. **Négatif / consignes à répéter** si l’UI a un champ dédié, sinon garde le bloc NEGATIF en bas de chaque prompt.
7. **Rejette** si : fond pas blanc uni, ombre au sol, perso coupé, style photo, ressemblance trop réaliste à une vraie personne, damier de transparence.

Nomme les fichiers : `raw/trompette/<anim>_<n>.png`  
Puis : `python3 tools/cutout.py raw/trompette assets/trompette`

---

## BLOC A — Style (identique à chaque fois)

⚠️ Ne jamais dire « character sheet » / « model sheet » / « turnaround » → Gemini sort une rangée de clones.

```
Single solo character illustration, ONE character only, centered, political editorial cartoon style. Thick even black ink outlines, flat cel-shading, flat color fills only (NO photo realism, NO gradients, NO ambient occlusion). Exaggerated caricature proportions MATCHING the game cast: oversized head about one-third of total height, SHORT STOCKY compact body (same body mass / silhouette fill as a barrel-chested volleyball mascot — NOT tall, NOT lanky, NOT skinny, NOT stretched). Same framing scale as other cast characters: character fills most of the vertical frame with ~5% margin. Pure solid flat white background #FFFFFF only — no checkerboard, no backdrop, no floor, no ground shadow, no vignette. High resolution, at least 1024px tall. Exactly one figure — never a row, never duplicates, never a lineup.
```

## BLOC B — Personnage (identique à chaque fois)

⚠️ Ne pas citer de vrai nom de dirigeant (meilleure cohérence satire + moins de refus).

```
Character: "Ronald Trompette" — fictional satirical parody resort tycoon cartoon mascot (invented character, not a portrait of any real person). Same compact stocky proportions as the rest of the cast (short powerful legs, wide torso, big head). Impossible golden-blond swept hair swoop, heavy orange tan skin (#f0a060), tiny eyes, smug pout, bright red necktie (#c62828) — long but NOT ridiculously floor-length; ends around mid-thigh. Clothes: navy blue suit jacket (fitted, bulky shoulders), white dress shirt, red tie, dark trousers, black dress shoes. Gold accents (#c9a227) optional on cufflinks only. Volleyball athlete vibe in absurd formal outfit. Clean graphic novel / press cartoon look. Ego and showmanship in every pose. CRITICAL: same visual weight and scale as a short stocky strongman teammate — never a thin stick figure.
```

## BLOC C — Négatif (colle à la fin de chaque prompt)

```
Avoid: tall lanky proportions, skinny stick figure, stretched body, tiny head, multiple characters, character sheet, model sheet, turnaround, lineup, duplicates, clones, photorealism, real celebrity likeness, photographic skin, soft airbrush, grey background, transparent checkerboard, cast shadow on ground, cropped limbs, text, watermark, props clutter, 3D render, anime soft shading, American flag filling the background, floor-length necktie dragging on ground.
```

---

## Template

Colle toujours : **A + B + POSE + C**

---

## idle_face_0 (menu — SEULE pose de face)

**POSE :**
```
Pose filename idle_face_0: three-quarter front view facing slightly toward camera, standing straight, one hand giving a thumbs-up, smug confident grin, feet planted, ready for character select screen. NOT profile. Long red tie clearly visible.
```

## idle_0

**POSE :**
```
Pose filename idle_0: RIGHT-FACING PROFILE (looking right), standing idle ready for volleyball, arms relaxed at sides, weight on both feet, smug neutral breathing pose A, long red tie hanging straight.
```

## idle_1

**POSE :**
```
Pose filename idle_1: RIGHT-FACING PROFILE, same idle stance as idle_0 but subtle breathing variation — chest slightly higher, shoulders a bit more open, tie shifts slightly. Same framing and scale as idle_0.
```

## walk_0 … walk_7 (une génération chacun)

**walk_0**
```
Pose filename walk_0: RIGHT-FACING PROFILE walk cycle frame 1/8 — right foot forward contact with ground, left foot back toe pushing, left arm forward, right arm back, long red tie swinging, clear silhouette.
```

**walk_1**
```
Pose filename walk_1: RIGHT-FACING PROFILE walk cycle frame 2/8 — passing pose, legs closer, right leg swinging forward mid-step, arms opposite swing, tie motion.
```

**walk_2**
```
Pose filename walk_2: RIGHT-FACING PROFILE walk cycle frame 3/8 — left foot forward contact, right foot back, right arm forward, left arm back.
```

**walk_3**
```
Pose filename walk_3: RIGHT-FACING PROFILE walk cycle frame 4/8 — passing pose opposite, left leg swinging forward mid-step.
```

**walk_4**
```
Pose filename walk_4: RIGHT-FACING PROFILE walk cycle frame 5/8 — right foot forward contact again (second step), energetic volleyball hustle in a suit.
```

**walk_5**
```
Pose filename walk_5: RIGHT-FACING PROFILE walk cycle frame 6/8 — mid-stride passing, compact showman steps.
```

**walk_6**
```
Pose filename walk_6: RIGHT-FACING PROFILE walk cycle frame 7/8 — left foot forward contact, strong push-off.
```

**walk_7**
```
Pose filename walk_7: RIGHT-FACING PROFILE walk cycle frame 8/8 — final passing pose closing the loop back to walk_0, same scale as other walk frames.
```

## jump_0 / jump_1 / jump_2

**jump_0**
```
Pose filename jump_0: RIGHT-FACING PROFILE jump takeoff — knees bent, arms swinging up, still near ground, about to leave the floor, tie flipping up slightly.
```

**jump_1**
```
Pose filename jump_1: RIGHT-FACING PROFILE jump apex — fully airborne, body stretched upward, arms up ready to spike, feet off the ground, hair and tie flying.
```

**jump_2**
```
Pose filename jump_2: RIGHT-FACING PROFILE jump landing — descending, knees preparing to bend, arms coming down for balance.
```

## receive_0 / receive_1

**receive_0**
```
Pose filename receive_0: RIGHT-FACING PROFILE volleyball receive ready — knees bent, forearms joined platform in front of body (suit sleeves), focused smug eyes, waiting for the ball, tie hanging between arms.
```

**receive_1**
```
Pose filename receive_1: RIGHT-FACING PROFILE volleyball receive contact — same forearm platform angled slightly up, body leaning into a bump pass, impact pose.
```

## aim_0 / aim_1

**aim_0**
```
Pose filename aim_0: RIGHT-FACING PROFILE set/aim pose — ball imaginary above head height, hands up framing a set, looking toward the right (attack direction).
```

**aim_1**
```
Pose filename aim_1: RIGHT-FACING PROFILE aim release — hands finishing the set forward-right, body extended, still looking right.
```

## smash_0 / smash_1 / smash_2

**smash_0**
```
Pose filename smash_0: RIGHT-FACING PROFILE spike wind-up — airborne or rising, hitting arm drawn back behind head, bow-and-arrow spike preparation, smug determination.
```

**smash_1**
```
Pose filename smash_1: RIGHT-FACING PROFILE spike contact — arm fully extended smashing down-forward to the right, powerful contact frame, fierce showman expression.
```

**smash_2**
```
Pose filename smash_2: RIGHT-FACING PROFILE spike follow-through — arm continuing down across body after the hit, landing start, tie whipping.
```

## super_0 … super_3 (Le Mur)

**super_0**
```
Pose filename super_0: RIGHT-FACING PROFILE super start — plants feet, raises both palms forward as if pushing a golden wall into existence, showman stance (NO wall filling the white background — keep BG pure white; gold glow only on hands if any).
```

**super_1**
```
Pose filename super_1: RIGHT-FACING PROFILE super cast — arms thrust forward harder, smug shout, tiny gold spark accents on fingertips only, still pure white background.
```

**super_2**
```
Pose filename super_2: RIGHT-FACING PROFILE super peak — dramatic tycoon pose, one thumb up + other hand still pushing, golden cuff accents, background stays pure white.
```

**super_3**
```
Pose filename super_3: RIGHT-FACING PROFILE super end — returns toward ready stance, residual smug intensity, white background.
```

## panic_0 / panic_1

**panic_0**
```
Pose filename panic_0: RIGHT-FACING PROFILE panic — eyes wide, hands up, body recoiling, hair mussed, still the same character design.
```

**panic_1**
```
Pose filename panic_1: RIGHT-FACING PROFILE panic scramble — ducking slightly, looking up at falling ball, frantic but readable silhouette, tie askew.
```

## victory_0 / victory_1

**victory_0**
```
Pose filename victory_0: RIGHT-FACING PROFILE victory — both arms raised, big thumbs-up, triumphant smirk, celebrating a point.
```

**victory_1**
```
Pose filename victory_1: RIGHT-FACING PROFILE victory flex — fist pump / showman chest puff, same outfit, long red tie.
```

## defeat_0 / defeat_1

**defeat_0**
```
Pose filename defeat_0: RIGHT-FACING PROFILE defeat — shoulders slumped, looking down, wounded ego, tie hanging limp.
```

**defeat_1**
```
Pose filename defeat_1: RIGHT-FACING PROFILE defeat hands on knees — exhausted after match loss, still same design, slightly smaller silhouette than standing poses is OK but keep consistent head size.
```
