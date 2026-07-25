# Regen Le Safran — identité verrouillée sur idle_0

Tu as l’image de référence jointe : `assets/safran/idle_0.png` (Le Safran / Sommet Volley).

## Mission

Regénère **toutes les autres frames** (PAS `idle_0` — vérité).
Écris dans `raw/safran/<anim>_<n>.png`. Travaille par **LOTS de 3–4** (ordre ci-dessous).
Après chaque lot : copie vers `raw/safran/` + contact sheet, puis lot suivant.

## LOCK identité (OBLIGATOIRE)

Même personnage que la référence, pixel-identity :
- grosse tête chibi, corps trapu
- cheveux sombre sel-et-poivre peignés, barbe soignée sel-et-poivre
- costume anthracite / charcoal, chemise blanche, cravate noire fine
- pochette SAFRAN-ORANGE dans la poche poitrine (signature)
- chaussures noires cirées
- expression calme, mesurée

OUTFIT LOCK : tenue IDENTIQUE sur chaque frame.

## Format technique

- Fond **MAGENTA uni #FF00FF**, PAS blanc, PAS sol/ombre/texte
- Perso SEUL, mains VIDES, AUCUNE balle
- Vue **côté face à DROITE** (sauf `idle_face_0` = FACE)
- Corps entier tête→pieds (sauf idle_face), une image = une pose = un fichier

## Lots

### Lot 1 — idle
| fichier | pose |
|---------|------|
| `idle_face_0.png` | portrait buste de FACE, grosse tête, expression caractéristique |
| `idle_1.png` | debout repos, variation légère vs idle_0, même tenue |

### Lot 2 — walk (CRITIQUE — QA avant de continuer)
| fichier | pose |
|---------|------|
| `walk_0.png` | LEFT foot planted flat forward, right leg stretched back, clear stride, right arm forward |
| `walk_1.png` | jambes rapprochées mid-step, pieds presque ensemble, bras neutres |
| `walk_2.png` | RIGHT foot planted flat forward, left leg back (miroir walk_0), left arm forward |
| `walk_3.png` | jambes rapprochées passage, bras opposés à walk_1 |

Walk QA : walk_0/walk_2 = pieds OPPOSÉS ; walk_1/walk_3 = passage (PAS debout).

### Lot 3 — jump
| `jump_0.png` | flexion / crouch prêt à sauter |
| `jump_1.png` | en l’air, montée |
| `jump_2.png` | sommet / apex du saut |

### Lot 4 — receive + aim
| `receive_0.png` | manchette : bras joints bas devant, mains vides |
| `receive_1.png` | dig / réception contact, bras joints bas, mains vides |
| `aim_0.png` | mains ouvertes levées au-dessus de la tête, regard haut, sans balle |
| `aim_1.png` | même geste set/passe variation, sans balle |

### Lot 5 — smash
| `smash_0.png` | armé bras haut (en l’air), main ouverte, pas de balle |
| `smash_1.png` | frappe smash, main ouverte, pas de balle |
| `smash_2.png` | accompagnement / follow-through |

### Lot 6 — super
| `super_0.png` | pose spéciale — wind-up |
| `super_1.png` | pose spéciale — montée |
| `super_2.png` | pose spéciale — pic |
| `super_3.png` | pose spéciale — finish |

### Lot 7 — panic + victory
| `panic_0.png` | surpris, penché en arrière, bras en l’air |
| `panic_1.png` | panic plus marqué |
| `victory_0.png` | célébration, bras levés |
| `victory_1.png` | victory variation |

### Lot 8 — defeat + cutout
| `defeat_0.png` | abattu, épaules basses |
| `defeat_1.png` | defeat plus marqué |


Quand les 26 sont dans `raw/safran/` (et `idle_0` intact) :

```bash
python3 tools/cutout.py raw/safran assets/safran
```

Corrige `assets/safran/manifest.json` : `idle: 2`, `walk: 4`, comptes canoniques.
**Ne touche PAS** à `idle_0.png` (raw ni assets).
