QA ÉCHOUÉ — les 4 walks ont le MÊME appui (jambe gauche devant). Corrige MAINTENANT.

Ancre jointe = idle_1 (identité LOCK). Appelle `image_gen` **3 fois** tout de suite. Pas de lecture de skill, pas de `ls`.

Garde `raw/cygne/walk_0.png` tel quel (stride OK).

Regénère UNIQUEMENT :

### walk_1.png — PASSAGE (jambes COLÉES)
Side view facing RIGHT. Legs ALMOST TOGETHER under the body, mid-step passing pose.
Front foot and back foot nearly side-by-side / one heel lifting. NOT a wide stride.
Arms near neutral. Magenta #FF00FF. Empty hands. Same navy suit identity as anchor.

### walk_2.png — APPUI OPPOSÉ à walk_0 (CRITIQUE)
Side view facing RIGHT. **RIGHT foot planted flat FORWARD**, **LEFT leg stretched BACK** behind.
This MUST be the MIRROR of a left-foot-forward stride. Wide clear stride.
Left arm swung FORWARD, right arm back. Magenta #FF00FF. Empty hands. Same identity.

### walk_3.png — PASSAGE bis
Side view facing RIGHT. Legs CLOSE together again (passing), but arms OPPOSITE to walk_1.
NOT a wide stride. Magenta #FF00FF. Empty hands.

Après gens : copie vers `raw/cygne/walk_1.png` `walk_2.png` `walk_3.png`, puis :
`python3 tools/cutout.py raw/cygne assets/cygne`

QA obligatoire avant de finir :
- walk_0 vs walk_2 = pieds OPPOSÉS (gauche devant ≠ droite devant)
- walk_1 et walk_3 = passage (jambes rapprochées), PAS stride large
GO image_gen ×3 maintenant.
