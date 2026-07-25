# Regen Le Faucon — identité verrouillée sur idle_0

Tu as l’image de référence jointe : `assets/faucon/idle_0.png` (Le Faucon / Sommet Volley).

## Mission

Regénère **toutes les autres frames** du perso (PAS `idle_0` — celle-là reste la vérité).
Écris les PNG dans `raw/faucon/<anim>_<n>.png` (écrase si besoin).

Travaille par **LOTS de 3–4 frames** (ordre ci-dessous). Après chaque lot : copie les
fichiers générés vers `raw/faucon/`, contact sheet rapide, puis enchaîne le lot suivant.
Ne lance PAS les 26 d’un coup sans lots.

## LOCK identité (OBLIGATOIRE — copie l’image, ne réinvente pas)

Même personnage que la référence, pixel-identity :
- grosse tête chibi, corps trapu carré
- crâne chauve dessus, cheveux gris courts sur les côtés
- sourcils gris épais, grosse moustache grise « mors », expression sévère
- teint clair / pêche
- costume gris ardoise **double-breasted**, boutons noirs (2 rangées), épingle argentée
  ronde sur le revers (comme sur idle_0)
- chemise blanche, cravate **bourgogne / bordeaux**
- chaussures noires
- même visage, mêmes proportions, même échelle, même trait (contours noirs, cel shading)

OUTFIT LOCK : tenue IDENTIQUE sur chaque frame (ne pas « améliorer », pas d’autre
tenue, pas de bras croisés sauf si la pose l’exige vraiment — l’idle_0 a les bras
le long du corps).

## Format technique

- Fond **MAGENTA uni #FF00FF** (chroma key), PAS blanc, PAS de sol/ombre/texte
- Perso SEUL, mains VIDES, AUCUNE balle, aucun objet
- Vue de **côté face à DROITE** (sauf `idle_face_0` = buste de FACE)
- Corps entier tête→pieds, pieds visibles (sauf idle_face)
- Une image = une pose = un fichier

## Lots (ordre fixe)

### Lot 1 — idle
| fichier | pose |
|---------|------|
| `idle_face_0.png` | portrait buste de FACE, grosse tête, expression sévère caractéristique |
| `idle_1.png` | debout repos, variation légère vs idle_0 (balancement), bras le long du corps |

### Lot 2 — walk (CRITIQUE — QA avant de continuer)
| fichier | pose |
|---------|------|
| `walk_0.png` | LEFT foot planted flat forward, right leg stretched back, clear stride, right arm forward |
| `walk_1.png` | jambes rapprochées mid-step, pieds presque ensemble, bras neutres |
| `walk_2.png` | RIGHT foot planted flat forward, left leg back (miroir walk_0), left arm forward |
| `walk_3.png` | jambes rapprochées passage, bras opposés à walk_1 |

Walk QA : walk_0/walk_2 = pieds OPPOSÉS ; walk_1/walk_3 = passage (PAS debout) ;
PAS de bras croisés statue, PAS de thumbs-up.

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

Quand les 26 sont dans `raw/faucon/` (et `idle_0` intact), lance :

```bash
python3 tools/cutout.py raw/faucon assets/faucon
```

Puis vérifie `assets/faucon/manifest.json` :
- `idle: 2`, `walk: 4`, et les autres comptes canoniques
- **Ne touche PAS** à `idle_0.png` (ni raw ni assets) — c’est la référence
