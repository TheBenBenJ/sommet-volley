# Regen WALKS only — Le Gourou (gourou)

QA ÉCHOUÉ : les 4 walks actuelles sont trop similaires (presque le même stride).
Corrige MAINTENANT. Ancre jointe = `assets/gourou/idle_1.png` (identité LOCK).

Appelle `image_gen` **4 fois** (une image par frame). Pas de lecture de skill,
pas de `ls` inutiles. Écrase `raw/gourou/walk_0.png` … `walk_3.png`.

## LOCK identité (toutes les frames)
Same character as the attached anchor: short white beard, round black glasses,
saffron-orange sleeveless vest with brown buttons over white long tunic + white
pants + brown loafers. Chibi big head, side view facing RIGHT, FULL BODY head to
feet, EMPTY HANDS, alone, thick black outlines, flat cel shading.
SOLID FLAT PURE MAGENTA #FF00FF background (no ground, no shadow, no text).

## walk_0.png — APPUI A (stride LARGE)
Side view facing RIGHT. **WIDE cartoon stride**:
**LEFT foot planted FLAT far FORWARD**, **RIGHT leg stretched far BACK** (toe
pointing down). Big clear gap between the two feet. **RIGHT arm swung FORWARD**,
left arm back. Calm serene face. NOT idle. NOT legs together.

## walk_1.png — PASSAGE (jambes COLLÉES) — critique
Side view facing RIGHT. **PASSING pose ONLY**:
BOTH legs **CLOSE together under the body**, feet nearly **SIDE-BY-SIDE /
overlapping** silhouette, soft knees, body slightly higher than stride frames.
Arms near torso (neutral). **NOT a wide stride**. If feet are far apart → WRONG.

## walk_2.png — APPUI B (miroir de walk_0) — critique
Side view facing RIGHT. **WIDE stride MIRROR of walk_0**:
**RIGHT foot planted FLAT far FORWARD**, **LEFT leg stretched far BACK**.
Big clear gap between feet. **LEFT arm swung FORWARD**, right arm back.
Must be obviously OPPOSITE foot forward vs walk_0.

## walk_3.png — PASSAGE bis
Side view facing RIGHT. Legs **CLOSE together** again (passing like walk_1),
but arms **OPPOSITE** to walk_1. Still **NOT** a wide stride.

## Après génération
```bash
# images → raw/gourou/walk_*.png puis :
python3 tools/cutout.py raw/gourou assets/gourou
```

QA obligatoire avant de finir :
1. walk_0 vs walk_2 = pieds OPPOSÉS (gauche devant ≠ droite devant)
2. walk_1 et walk_3 = passage (jambes rapprochées), PAS stride large
3. Les 4 silhouettes doivent se distinguer au premier coup d'œil

GO image_gen ×4 maintenant.
