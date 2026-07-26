# Regen Tsar Volkoï — passe art composite Steam (ancre idle_1)

Tu as l’image de référence jointe : `raw/volkoi/idle_1.png` (nouvelle ancre
composite / Sommet Volley). **C’est la vérité d’identité.**

## Mission

Regénère **toutes les autres frames** (PAS `idle_1` — ne l’écrase JAMAIS).
Écris dans `raw/volkoi/<anim>_<n>.png`. Travaille par **LOTS de 3–4** (ordre
ci-dessous). Après chaque lot : confirme les fichiers présents, puis lot suivant.

## LOCK identité (OBLIGATOIRE)

Même personnage que la référence, pixel-identity :
- chibi grosse tête (~1/3), corps trapu barrel-chest
- crâne ENTIÈREMENT chauve, forme RONDE/douce (composite, pas portrait réel)
- petits yeux bleu glacé écartés, sourcils épais droits, bouche fine
- overshirt bordeaux COL MANDARIN boutonnée SUR col roulé NOIR
- pantalon anthracite, chaussures noires
- PAS de tracksuit, PAS de médailles, PAS de chemise ouverte

OUTFIT LOCK : tenue IDENTIQUE à `idle_1` sur chaque frame.
Steam : mash-up caricature — must NOT look like any real politician.

## Format technique

- Fond **MAGENTA uni #FF00FF**, PAS blanc, PAS sol/ombre/texte
- Perso SEUL, mains VIDES, AUCUNE balle
- Vue **côté face à DROITE** (sauf `idle_face_0` = FACE)
- Corps entier tête→pieds (sauf idle_face), une image = une pose = un fichier

## Lots (séquentiels)

### Lot 1 — idle_face + idle_0
| fichier | pose |
|---------|------|
| `idle_face_0.png` | portrait buste de FACE, même tête/tenue, expression froide |
| `idle_0.png` | debout repos côté droite, légère variation vs idle_1 |

### Lot 2 — walk (CRITIQUE — QA avant de continuer)
| fichier | pose |
|---------|------|
| `walk_0.png` | WIDE stride: LEFT foot planted FLAT far FORWARD, RIGHT leg stretched far BACK, clear gap, RIGHT arm FORWARD |
| `walk_1.png` | PASSING: BOTH legs CLOSE under body, feet nearly SIDE-BY-SIDE, NOT wide stride, arms near torso |
| `walk_2.png` | WIDE stride MIRROR: RIGHT foot planted FLAT far FORWARD, LEFT leg BACK, LEFT arm FORWARD |
| `walk_3.png` | PASSING again: legs CLOSE, arms OPPOSITE to walk_1 |

Walk QA : walk_0≠walk_2 (pieds opposés) ; walk_1/walk_3 = passage collé.

### Lot 3 — jump
| `jump_0.png` | flexion / crouch prêt à sauter |
| `jump_1.png` | en l’air, montée |
| `jump_2.png` | sommet / apex |

### Lot 4 — receive + aim
| `receive_0.png` | manchette bras joints bas, mains vides |
| `receive_1.png` | dig contact, bras joints bas, mains vides |
| `aim_0.png` | mains ouvertes au-dessus de la tête, regard haut, sans balle |
| `aim_1.png` | variation set/passe, sans balle |

### Lot 5 — smash
| `smash_0.png` | armé bras haut (air), main ouverte, pas de balle |
| `smash_1.png` | frappe smash, main ouverte |
| `smash_2.png` | follow-through |

### Lot 6 — super (Hiver Général)
| `super_0.png` | wind-up dramatique |
| `super_1.png` | montée |
| `super_2.png` | pic |
| `super_3.png` | finish |

### Lot 7 — panic + victory
| `panic_0.png` | surpris, penché arrière, bras en l’air |
| `panic_1.png` | panic plus marqué |
| `victory_0.png` | célébration bras levés |
| `victory_1.png` | victory variation |

### Lot 8 — defeat + stop
| `defeat_0.png` | abattu, épaules basses |
| `defeat_1.png` | defeat plus marqué |

Quand les 26 + `idle_1` sont dans `raw/volkoi/`, **arrête** (ne lance pas cutout —
l’humain / l’agent parent s’en charge).
