# Prompts Vladou — à coller dans Gemini (1 image = 1 pose)

## Options interface Gemini (important)

1. **Mode image** : active la génération d’images (Imagen), pas seulement le chat texte.
2. **1 image à la fois** — ne demande jamais « 8 frames en une image ».
3. **Format / ratio** : **portrait** (3:4 ou 9:16). Objectif ≥ **1024 px de haut**.
4. **Style** : aucun filtre « photo / réaliste / cinematic ». Si tu as un curseur « créativité », reste **moyen**.
5. **Référence** (si l’UI le permet) : après une bonne `idle_face_0`, **uploade-la en référence** pour toutes les poses suivantes (même perso).
6. **Négatif / consignes à répéter** si l’UI a un champ dédié, sinon garde le bloc NEGATIF en bas de chaque prompt.
7. **Rejette** si : fond pas blanc uni, ombre au sol, perso coupé, style photo, ressemblance trop réaliste à une vraie personne, damier de transparence.

Nomme les fichiers : `raw/vladou/<anim>_<n>.png`  
Puis : `python3 tools/cutout.py raw/vladou assets/vladou`

---

## BLOC A — Style (identique à chaque fois)

⚠️ Ne jamais dire « character sheet » / « model sheet » / « turnaround » → Gemini sort une rangée de clones.

```
Single solo character illustration, ONE character only, centered, political editorial cartoon style. Thick even black ink outlines, flat cel-shading, flat color fills only (NO photo realism, NO gradients, NO ambient occlusion). Exaggerated caricature proportions: oversized head about one-third of total height, short stocky body, readable face at small size. Pure solid flat white background #FFFFFF only — no checkerboard, no backdrop, no floor, no ground shadow, no vignette. Full character visible with ~5% empty margin. High resolution, at least 1024px tall. Exactly one figure in the image — never a row, never duplicates, never a lineup.
```

## BLOC B — Personnage (identique à chaque fois)

⚠️ Ne pas citer de vrai nom de dirigeant (meilleure cohérence satire + moins de refus).

```
Character: "Tsar Vladou" — fictional satirical parody strongman emperor cartoon mascot (invented character, not a portrait of any real person). VERY recognizable editorial-caricature face: tiny cold pale eyes with heavy lids, thin unsmiling slit mouth, high forehead, thinning grey hair slicked tightly straight back (not a thick pompadour), pale porcelain skin, short neck, compact judo-wrestler build, barrel chest. Clothes: open crimson/red shirt (#b43a2e) showing bare torso, dark slate trousers/boots (#3a3f4a). Same stocky compact game proportions as the cast. Clean press-cartoon look — face must read instantly as THAT strongman caricature archetype.
```

## BLOC C — Négatif (colle à la fin de chaque prompt)

```
Avoid: multiple characters, character sheet, model sheet, turnaround, lineup, duplicates, clones, photorealism, real celebrity likeness, photographic skin, soft airbrush, grey background, transparent checkerboard, cast shadow on ground, cropped limbs, text, watermark, props clutter, 3D render, anime soft shading, white gaps between arm and torso, white triangles in armpits, hollow limbs, holes in the body silhouette.
```

---

## Template

Colle toujours : **A + B + POSE + C**

---

## idle_face_0 (menu — SEULE pose de face)

**POSE :**
```
Pose filename idle_face_0: three-quarter front view facing slightly toward camera, standing straight, arms crossed on chest, confident cold stare, feet planted, ready for character select screen. NOT profile.
```

## idle_0

**POSE :**
```
Pose filename idle_0: RIGHT-FACING PROFILE (looking right), standing idle ready for volleyball, arms relaxed at sides, weight on both feet, neutral breathing pose A.
```

## idle_1

**POSE :**
```
Pose filename idle_1: RIGHT-FACING PROFILE, same idle stance as idle_0 but subtle breathing variation — chest slightly higher, shoulders a bit more open. Same framing and scale as idle_0.
```

## walk_0 … walk_7 (une génération chacun)

**walk_0**
```
Pose filename walk_0: RIGHT-FACING PROFILE walk cycle frame 1/8 — right foot forward contact with ground, left foot back toe pushing, left arm forward, right arm back, clear silhouette.
```

**walk_1**
```
Pose filename walk_1: RIGHT-FACING PROFILE walk cycle frame 2/8 — passing pose, legs closer, right leg swinging forward mid-step, arms opposite swing.
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
Pose filename walk_4: RIGHT-FACING PROFILE walk cycle frame 5/8 — right foot forward contact again (second step), energetic volleyball hustle.
```

**walk_5**
```
Pose filename walk_5: RIGHT-FACING PROFILE walk cycle frame 6/8 — mid-stride passing, compact powerful steps.
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
Pose filename jump_0: RIGHT-FACING PROFILE jump takeoff — knees bent, arms swinging up, still near ground, about to leave the floor.
```

**jump_1**
```
Pose filename jump_1: RIGHT-FACING PROFILE jump apex — fully airborne, body stretched upward, arms up ready to spike, feet off the ground.
```

**jump_2**
```
Pose filename jump_2: RIGHT-FACING PROFILE jump landing — descending, knees preparing to bend, arms coming down for balance.
```

## receive_0 / receive_1

**receive_0**
```
Pose filename receive_0: RIGHT-FACING PROFILE volleyball receive ready — knees bent, forearms joined platform in front of body, focused eyes, waiting for the ball.
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
Pose filename smash_0: RIGHT-FACING PROFILE spike wind-up — airborne or rising, hitting arm drawn back behind head, bow-and-arrow spike preparation.
```

**smash_1**
```
Pose filename smash_1: RIGHT-FACING PROFILE spike contact — arm fully extended smashing down-forward to the right, powerful contact frame, fierce expression.
```

**smash_2**
```
Pose filename smash_2: RIGHT-FACING PROFILE spike follow-through — arm continuing down across body after the hit, landing start.
```

## super_0 … super_3 (Hiver Général)

**super_0**
```
Pose filename super_0: RIGHT-FACING PROFILE super start — plants feet, raises one fist, cold commanding gesture, winter general vibe (NO ice particles filling the white background — keep BG pure white).
```

**super_1**
```
Pose filename super_1: RIGHT-FACING PROFILE super cast — both arms open wide as if freezing the opponent court, stern shout, still pure white background.
```

**super_2**
```
Pose filename super_2: RIGHT-FACING PROFILE super peak — dramatic strongman pose, fist forward, icy stare, minimal frost only ON the character edges if any, background stays pure white.
```

**super_3**
```
Pose filename super_3: RIGHT-FACING PROFILE super end — returns toward ready stance, residual intensity, white background.
```

## panic_0 / panic_1

**panic_0**
```
Pose filename panic_0: RIGHT-FACING PROFILE panic — eyes wide, hands up, body recoiling, still the same character design.
```

**panic_1**
```
Pose filename panic_1: RIGHT-FACING PROFILE panic scramble — ducking slightly, looking up at falling ball, frantic but readable silhouette.
```

## victory_0 / victory_1

**victory_0**
```
Pose filename victory_0: RIGHT-FACING PROFILE victory — arms raised, small triumphant smirk, celebrating a point.
```

**victory_1**
```
Pose filename victory_1: RIGHT-FACING PROFILE victory flex — short strongman chest flex / fist pump, same outfit.
```

## defeat_0 / defeat_1

**defeat_0**
```
Pose filename defeat_0: RIGHT-FACING PROFILE defeat — shoulders slumped, looking down, frustrated cold anger. SOLID continuous body fills — arms and torso connected with NO white gap / NO white triangle in the armpit or between arm and chest (cutout would punch a hole).
```

**defeat_1**
```
Pose filename defeat_1: RIGHT-FACING PROFILE defeat kneel/hands on knees — exhausted after match loss, still same design. SOLID silhouette, no white holes between limbs and body.
```
