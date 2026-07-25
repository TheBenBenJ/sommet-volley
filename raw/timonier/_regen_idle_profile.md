# Regen IDLE corps — Le Grand Timonier — PROFIL obligatoire

Images jointes :
1) `idle_face_0` = identité visage (LOCK)
2) `idle_0` actuel = tenue / proportions (référence outfit) — MAIS il est de FACE, ne PAS recopier l’angle

## Mission
Génère UNIQUEMENT 2 frames :
- `raw/timonier/idle_0.png`
- `raw/timonier/idle_1.png`

Appelle `image_gen` **2 fois** tout de suite. Pas de lecture de skill, pas de `ls` avant les gens.

## ANGLE (CRITIQUE — bug actuel)
Les idles actuelles sont DE FACE. Il FAUT :
**vue de CÔTÉ strict, face à DROITE (profil)** — un seul œil visible, nez de profil, oreille visible, corps de profil.
INTERDIT : face caméra, trois-quarts face, regard vers le spectateur.

`idle_face_0` reste le portrait FACE (ne le touche PAS).

## LOCK identité
Même perso que les références :
- empereur âgé, joues rondes, front haut, cheveux noirs fins peignés en arrière (pas de coupe au bol)
- yeux lourds mi-clos, expression stoïque contrôlée
- veste Zhongshan anthracite à 4 poches à rabat, petit pin rouge au revers, pantalon noir, chaussures noires
OUTFIT LOCK. Fond MAGENTA uni #FF00FF. Perso SEUL, mains VIDES, corps ENTIER tête→pieds, chibi grosse tête.

## Poses
| fichier | pose |
|---------|------|
| idle_0 | debout repos, profil DROIT strict, bras le long du corps, légère variation neutre |
| idle_1 | même profil DROIT, variation idle légère (léger balancement / poids sur l’autre jambe) — TOUJOURS profil, jamais face |

## Après gens
```bash
cp …/generated…png raw/timonier/idle_0.png   # dans l’ordre des appels
cp …/generated…png raw/timonier/idle_1.png
python3 tools/cutout.py raw/timonier assets/timonier
```
Ne touche PAS `idle_face_0.png`.

QA avant de finir :
1. idle_0 et idle_1 = profil strict face à droite (pas de 2e œil bien visible comme en face)
2. tenue = Zhongshan 4 poches + pin rouge
3. fond magenta avant cutout

GO — image_gen ×2 maintenant.
