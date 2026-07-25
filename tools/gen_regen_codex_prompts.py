#!/usr/bin/env python3
"""Génère raw/<key>/_regen_codex_prompt.md pour une regen Codex ancrée."""
from pathlib import Path

CHARS = {
  "gourou": {
    "name": "Le Gourou",
    "anchor": "idle_0",
    "lock": """- grosse tête chibi, corps mince/ascète
- cheveux blancs peignés en arrière, barbe blanche soignée, sourcils blancs
- lunettes rondes à monture fine noire, teint moyen
- gilet/veste safran-orange col montant (4 boutons bruns) SUR tunique blanche longue
- pantalon blanc, mocassins brun foncé
- expression sereine / intense""",
  },
  "safran": {
    "name": "Le Safran",
    "anchor": "idle_0",
    "lock": """- grosse tête chibi, corps trapu
- cheveux sombre sel-et-poivre peignés, barbe soignée sel-et-poivre
- costume anthracite / charcoal, chemise blanche, cravate noire fine
- pochette SAFRAN-ORANGE dans la poche poitrine (signature)
- chaussures noires cirées
- expression calme, mesurée""",
  },
  "sultan": {
    "name": "Le Sultan",
    "anchor": "idle_0",
    "lock": """- grosse tête chibi, corps imposant
- cheveux noirs slicked-back, grosse moustache noire épaisse (style guidon)
- sourcils noirs froncés, teint olive, expression sévère
- costume marine sombre, chemise blanche, cravate sombre
- chaussures noires, poings légèrement serrés
- PAS de fez / turban / croissant religieux""",
  },
  "volkoi": {
    "name": "Tsar Volkoï",
    "anchor": "idle_0",
    "lock": """- grosse tête chibi (~1/3 hauteur), corps trapu barrel-chest
- crâne ENTIÈREMENT chauve brillant, sourcils noirs épais anguleux
- yeux gris/bleus froids, mâchoire carrée, teint pâle
- overshirt / veste bordeaux ouverte SUR col roulé NOIR
- pantalon anthracite, ceinture noire boucle argent, chaussures noires
- PAS de tracksuit, PAS de chemise ouverte""",
  },
  "cygne": {
    "name": "Le Cygne",
    "anchor": "idle_face_0",
    "lock": """- identité = portrait face joint : jeune technocrate, cheveux noirs slicked-back,
  grands yeux bleus, sourcils noirs, sourire assuré
- tenue (corps dérivé) : costume marine cintré, chemise blanche, cravate marine,
  petit pin tricolore (rouge/blanc/bleu abstrait) au revers — PAS de vrai drapeau national
- pour idle_0/idle_1 et toutes poses : corps entier chibi cohérent,
  vue côté face à DROITE, même visage/cheveux/tenue que le portrait""",
  },
  "capitaine": {
    "name": "Le Capitaine",
    "anchor": "idle_0",
    "lock": """- grosse tête chibi, corps trapu
- cheveux noirs courts/hérissés, barbe de 3 jours, grand sourire denté
- veste militaire olive (col montant, épaulettes, 4 poches) sur t-shirt vert foncé
- pantalon cargo olive, bottes tactiques beige/tan
- teint hâlé, expression populiste confiante""",
  },
}

LOT1 = {
  "idle_0": """### Lot 1 — idle
| fichier | pose |
|---------|------|
| `idle_face_0.png` | portrait buste de FACE, grosse tête, expression caractéristique |
| `idle_1.png` | debout repos, variation légère vs idle_0, même tenue |""",
  "idle_1": """### Lot 1 — idle
| fichier | pose |
|---------|------|
| `idle_face_0.png` | portrait buste de FACE, grosse tête, expression caractéristique |
| `idle_0.png` | debout repos, variation légère vs idle_1, même tenue |""",
  "idle_face_0": """### Lot 1 — idle corps (dérivés du portrait)
| fichier | pose |
|---------|------|
| `idle_0.png` | debout repos corps entier, côté face à DROITE, identité du portrait |
| `idle_1.png` | variation idle légère, même identité |""",
}

COMMON_LOTS = """
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
"""


def write_prompt(key: str) -> Path:
    meta = CHARS[key]
    anchor = meta["anchor"]
    raw = Path(f"raw/{key}")
    raw.mkdir(parents=True, exist_ok=True)
    body = f"""# Regen {meta['name']} — identité verrouillée sur {anchor}

Tu as l’image de référence jointe : `assets/{key}/{anchor}.png` ({meta['name']} / Sommet Volley).

## Mission

Regénère **toutes les autres frames** (PAS `{anchor}` — vérité).
Écris dans `raw/{key}/<anim>_<n>.png`. Travaille par **LOTS de 3–4** (ordre ci-dessous).
Après chaque lot : copie vers `raw/{key}/` + contact sheet, puis lot suivant.

## LOCK identité (OBLIGATOIRE)

Même personnage que la référence, pixel-identity :
{meta['lock']}

OUTFIT LOCK : tenue IDENTIQUE sur chaque frame.

## Format technique

- Fond **MAGENTA uni #FF00FF**, PAS blanc, PAS sol/ombre/texte
- Perso SEUL, mains VIDES, AUCUNE balle
- Vue **côté face à DROITE** (sauf `idle_face_0` = FACE)
- Corps entier tête→pieds (sauf idle_face), une image = une pose = un fichier

## Lots

{LOT1[anchor]}
{COMMON_LOTS}

Quand les 26 sont dans `raw/{key}/` (et `{anchor}` intact) :

```bash
python3 tools/cutout.py raw/{key} assets/{key}
```

Corrige `assets/{key}/manifest.json` : `idle: 2`, `walk: 4`, comptes canoniques.
**Ne touche PAS** à `{anchor}.png` (raw ni assets).
"""
    out = raw / "_regen_codex_prompt.md"
    out.write_text(body)
    return out


if __name__ == "__main__":
    import sys
    keys = sys.argv[1:] or list(CHARS)
    for k in keys:
        print(write_prompt(k))
