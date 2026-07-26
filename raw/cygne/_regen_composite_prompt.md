# Regen Le Cygne — passe COMPOSITE, identité verrouillée sur l'ancre jointe

Tu as l'image de référence jointe : `raw/cygne/idle_1_composite_new.png`
(= la NOUVELLE ancre d'identité `idle_1` du Cygne, Sommet Volley).

## Mission

Génère les **26 autres frames** (PAS `idle_1` — c'est l'ancre, vérité absolue).
Écris dans `raw/cygne/<anim>_<n>.png`. Travaille par **LOTS de 3–4** (ordre
ci-dessous), séquentiellement. Après chaque lot : copie les images vers
`raw/cygne/` puis passe au lot suivant.

## LOCK identité (OBLIGATOIRE, à respecter sur CHAQUE frame)

Même personnage que la référence jointe, pixel-identity :
- COMPOSITE young technocrat mascot (mash-up, NOT a real person), slim chibi
  build, OVAL face with slightly oversized forehead, soft jaw
- short wavy dark hair with a SIDE PART (PAS de slicked-back / wet look)
- round thin wire glasses, bright curious eyes, small polite smile
- tenue EXACTE de l'ancre : sharp navy tailored suit, white shirt, navy tie,
  ONE tiny plain gold circle lapel pin (PAS de couleurs de drapeau national,
  PAS de tricolore), black shoes
- proportions chibi identiques (grosse tête ~1/3, corps trapu), trait noir
  épais, cel shading plat, mêmes couleurs

OUTFIT LOCK : tenue IDENTIQUE sur chaque frame — pas d'« amélioration ».

## Format technique

- Fond **MAGENTA uni #FF00FF** plein cadre, PAS blanc, PAS de sol/ombre/texte
- Perso SEUL, mains VIDES, AUCUNE balle, aucun objet tenu
- Vue **côté face à DROITE** (sauf `idle_face_0` = portrait de FACE)
- Corps entier tête→pieds, pieds visibles (sauf idle_face = buste)
- Une image = une pose = un fichier `raw/cygne/<anim>_<n>.png`

## Lots (ordre fixe)

### Lot 1 — idle_face + idle_0
| fichier | pose |
|---------|------|
| `idle_face_0.png` | portrait de FACE, buste, grosse tête, même visage/lunettes/cheveux/costume que l'ancre |
| `idle_0.png` | debout repos corps entier, côté face à DROITE, variation respiration légère de l'ancre |

### Lot 2 — walk (CRITIQUE — QA avant de continuer)
| fichier | pose |
|---------|------|
| `walk_0.png` | WIDE stride: LEFT foot planted FLAT far FORWARD, RIGHT leg stretched far BACK (toe down), clear gap between feet, RIGHT arm swung FORWARD, left arm back |
| `walk_1.png` | PASSING pose ONLY: BOTH legs CLOSE together under the body, feet nearly SIDE-BY-SIDE / overlapping silhouette, knees soft, NOT a wide stride, arms near torso (neutral) |
| `walk_2.png` | WIDE stride MIRROR of walk_0: RIGHT foot planted FLAT far FORWARD, LEFT leg stretched far BACK, clear gap between feet, LEFT arm swung FORWARD, right arm back |
| `walk_3.png` | PASSING pose again: legs CLOSE together under body (like walk_1), but arms OPPOSITE to walk_1; still NOT a wide stride |

Walk QA OBLIGATOIRE : walk_0/walk_2 = pieds opposés (miroir) ; walk_1/walk_3 =
passage jambes COLLÉES (pas de stride). Si les 4 se ressemblent → refaire le lot.

### Lot 3 — jump
| `jump_0.png` | flexion / crouch prêt à décoller |
| `jump_1.png` | en l'air, montée, jambes repliées |
| `jump_2.png` | sommet / apex du saut |

### Lot 4 — receive + aim
| `receive_0.png` | manchette : bras joints tendus bas devant, mains vides |
| `receive_1.png` | réception contact, bras joints bas, genoux fléchis, mains vides |
| `aim_0.png` | mains ouvertes levées au-dessus de la tête, regard vers le haut, SANS balle |
| `aim_1.png` | même geste passe/set, variation doigts écartés, SANS balle |

### Lot 5 — smash
| `smash_0.png` | en l'air, armé bras haut derrière la tête, main ouverte, pas de balle |
| `smash_1.png` | frappe smash bras tendu, main ouverte, pas de balle |
| `smash_2.png` | accompagnement / follow-through, en l'air |

### Lot 6 — super (« Passage en Force » : geste théâtral autoritaire)
| `super_0.png` | wind-up dramatique, bras croisés puis ouverture |
| `super_1.png` | montée en puissance, bras levé index tendu (geste de tribune) |
| `super_2.png` | pic : posture cambrée impérieuse, aura de puissance |
| `super_3.png` | finish : réajuste sa cravate, sourire satisfait |

### Lot 7 — panic + victory
| `panic_0.png` | surpris, penché en arrière, bras en l'air |
| `panic_1.png` | panique plus marquée, lunettes de travers |
| `victory_0.png` | célébration, bras levés |
| `victory_1.png` | variation victoire, poing serré |

### Lot 8 — defeat
| `defeat_0.png` | abattu, épaules basses, tête baissée |
| `defeat_1.png` | défaite plus marquée, retire ses lunettes de dépit |

## Fin

Quand les 26 sont dans `raw/cygne/` : STOP. Ne lance PAS le cutout (fait par
l'agent après QA). Ne touche JAMAIS à `raw/cygne/idle_1_composite_new.png`.
