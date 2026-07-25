# Regen Baron Dorf — identité verrouillée sur idle_1

Tu as l’image de référence jointe : `assets/dorf/idle_1.png` (Baron Dorf / Sommet Volley).

## Mission

Regénère **toutes les autres frames** du perso (PAS `idle_1` — celle-là reste la vérité).
Écris les PNG dans `raw/dorf/<anim>_<n>.png` (écrase si besoin).

## LOCK identité (OBLIGATOIRE — copie l’image, ne réinvente pas)

Même personnage que la référence, pixel-identity :
- grosse tête chibi, corps trapu
- cheveux platine/blond volumineux asymétriques (vague d’un côté)
- teint doré chaud (pas spray-tan orange criard)
- costume marine oversized, boutons or, chemise crème/blanche
- cravate OR courte OU pochette champagne (comme sur la ref — garder EXACTEMENT la tenue visible sur idle_1)
- chaussures noires
- même visage, mêmes proportions, même échelle, même trait (contours noirs, cel shading)

OUTFIT LOCK : tenue IDENTIQUE sur chaque frame.

## Format technique

- Fond **MAGENTA uni #FF00FF** (chroma key), PAS blanc, PAS de sol/ombre/texte
- Perso SEUL, mains VIDES, AUCUNE balle, aucun objet
- Vue de **côté face à DROITE** (sauf `idle_face_0` = buste de FACE)
- Corps entier tête→pieds, pieds visibles (sauf idle_face)
- Une image = une pose = un fichier

## Frames à générer (26)

| fichier | pose |
|---------|------|
| `idle_face_0.png` | portrait buste de FACE, grosse tête, expression caractéristique |
| `idle_0.png` | debout repos, poids sur les deux pieds (variation vs idle_1) |
| `walk_0.png` | LEFT foot planted flat forward, right leg stretched back, clear stride, right arm forward |
| `walk_1.png` | jambes rapprochées mid-step, pieds presque ensemble, bras neutres |
| `walk_2.png` | RIGHT foot planted flat forward, left leg back (miroir walk_0), left arm forward |
| `walk_3.png` | jambes rapprochées passage, bras opposés à walk_1 |
| `jump_0.png` | flexion / crouch prêt à sauter |
| `jump_1.png` | en l’air, montée |
| `jump_2.png` | sommet / apex du saut |
| `receive_0.png` | manchette : bras joints bas devant, mains vides |
| `receive_1.png` | dig / réception contact, bras joints bas, mains vides |
| `aim_0.png` | mains ouvertes levées au-dessus de la tête, regard haut, sans balle |
| `aim_1.png` | même geste set/passe variation, sans balle |
| `smash_0.png` | armé bras haut (en l’air), main ouverte, pas de balle |
| `smash_1.png` | frappe smash, main ouverte, pas de balle |
| `smash_2.png` | accompagnement / follow-through |
| `super_0.png` | pose spéciale — wind-up |
| `super_1.png` | pose spéciale — montée |
| `super_2.png` | pose spéciale — pic |
| `super_3.png` | pose spéciale — finish |
| `panic_0.png` | surpris, penché en arrière, bras en l’air |
| `panic_1.png` | panic plus marqué |
| `victory_0.png` | célébration, bras levés |
| `victory_1.png` | victory variation |
| `defeat_0.png` | abattu, épaules basses |
| `defeat_1.png` | defeat plus marqué |

## Walk QA

- walk_0 et walk_2 = pieds OPPOSÉS
- walk_1 et walk_3 = passage (jambes rapprochées), PAS debout
- PAS de thumbs-up, PAS de pose statue

## Outils

Utilise la génération d’images Codex. Pour chaque frame : génère, sauve dans `raw/dorf/`.
Quand les 26 sont là, lance :

```bash
python3 tools/cutout.py raw/dorf assets/dorf
```

Puis vérifie que `assets/dorf/manifest.json` a `walk: 4` et les comptes d’anims canoniques.
Ne touche PAS à `idle_1.png` (ni raw ni assets) — c’est la référence.
