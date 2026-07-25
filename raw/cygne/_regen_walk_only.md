# Regen LOT WALK uniquement — Le Cygne

Tu as l’image de référence jointe : l’ancre d’identité du Cygne (idle / idle_face).

## Mission
Regénère UNIQUEMENT les 4 frames de marche :
`raw/cygne/walk_0.png` … `raw/cygne/walk_3.png`

Les walks actuelles sont TOUTES PAREILLES (bug) — il FAUT 4 poses de jambes DISTINCTES.

## LOCK identité
Même perso que la référence : jeune technocrate, cheveux noirs slicked-back, yeux bleus,
costume marine cintré, chemise blanche, cravate marine, pin tricolore abstrait au revers.
OUTFIT LOCK : tenue IDENTIQUE. Fond MAGENTA #FF00FF. Perso SEUL, mains VIDES, AUCUNE balle.
Vue CÔTÉ face à DROITE, corps entier tête→pieds, chibi grosse tête.

## Poses OBLIGATOIRES (une description ≠ les autres)
| fichier | jambes / bras |
|---------|----------------|
| walk_0 | LEFT foot planted flat FORWARD, right leg stretched BACK behind, clear long stride, right arm swung FORWARD |
| walk_1 | BOTH legs CLOSE together passing under the body mid-step, feet nearly together, arms near NEUTRAL |
| walk_2 | RIGHT foot planted flat FORWARD, left leg stretched BACK (mirror of walk_0), left arm swung FORWARD |
| walk_3 | BOTH legs CLOSE together mid-step (passage), arms OPPOSITE to walk_1 |

## QA avant de finir
1. walk_0 et walk_2 = pieds OPPOSÉS (gauche devant vs droite devant) — visible sans ambiguïté
2. walk_1 et walk_3 = passage (jambes rapprochées), PAS debout immobile
3. Aucune des 4 n’est une pose idle / geste signature

Génère les 4 images, copie-les dans `raw/cygne/walk_0.png` … `walk_3.png`, puis fabrique une planche :
`python3 tools/make_safran_contact_sheet.py tmp/cygne_regen/lot2_walk_contact.png raw/cygne/walk_0.png raw/cygne/walk_1.png raw/cygne/walk_2.png raw/cygne/walk_3.png`
Si QA walk échoue, regénère la/les frame(s) fautive(s) avec le même LOCK.
