# Regen Baron Dorf — passe art (ancre idle_1 v3, polish roster)

Tu as l’image de référence jointe : `raw/dorf/idle_1.png` (nouvelle ancre
Dorf / Sommet Volley). **C’est la vérité d’identité.**

## Mission

Regénère **toutes les autres frames** (PAS `idle_1` — ne l’écrase JAMAIS).
Écris dans `raw/dorf/<anim>_<n>.png`. Travaille par **LOTS de 3–4**.
Après chaque lot : confirme les fichiers, puis lot suivant.

## LOCK identité (OBLIGATOIRE)

Même personnage que la référence, **même niveau de polish** (traits nets,
cel shading pro — PAS style enfant / joues roses / dents cartoon) :
- chibi-lite grosse tête, corps trapu
- cheveux platine-crème volumineux, vague ASYMÉTRIQUE d’un côté
- teint doré chaud (pas spray-tan orange criard)
- costume marine, boutons or, chemise crème/blanche
- cravate OR courte + pochette blanche (EXACTEMENT comme sur idle_1)
- chaussures noires, smirk confiant
- même visage, proportions, échelle, trait

OUTFIT LOCK : tenue IDENTIQUE à `idle_1` sur chaque frame.

## Format technique

- Fond **MAGENTA uni #FF00FF**, PAS blanc, PAS sol/ombre/texte
- Perso SEUL, mains VIDES, AUCUNE balle
- Vue **côté face à DROITE** (sauf `idle_face_0` = FACE)
- Corps entier tête→pieds (sauf idle_face)

## Lots

### Lot 1 — idle_face + idle_0
| `idle_face_0.png` | portrait buste FACE, même tête/tenue, smirk |
| `idle_0.png` | debout repos côté droite, légère variation vs idle_1 |

### Lot 2 — walk (CRITIQUE)
| `walk_0.png` | WIDE stride: LEFT foot FORWARD, RIGHT back, RIGHT arm FORWARD |
| `walk_1.png` | PASSING: legs CLOSE, feet nearly side-by-side, NOT wide stride |
| `walk_2.png` | WIDE stride MIRROR: RIGHT foot FORWARD, LEFT back, LEFT arm FORWARD |
| `walk_3.png` | PASSING: legs CLOSE, arms opposite walk_1 |

### Lot 3 — jump
| `jump_0.png` | flexion / crouch |
| `jump_1.png` | montée |
| `jump_2.png` | apex |

### Lot 4 — receive + aim
| `receive_0.png` / `receive_1.png` | manchette, mains vides |
| `aim_0.png` / `aim_1.png` | mains ouvertes au-dessus de la tête, sans balle |

### Lot 5 — smash
| `smash_0..2.png` | armé / frappe / follow-through, main ouverte, pas de balle |

### Lot 6 — super (Le Mur)
| `super_0..3.png` | wind-up → finish |

### Lot 7 — panic + victory
| `panic_0..1.png` | surpris |
| `victory_0..1.png` | célébration |

### Lot 8 — defeat
| `defeat_0.png` / `defeat_1.png` | abattu |

Quand les 26 + `idle_1` sont dans `raw/dorf/`, **arrête** (pas de cutout).
