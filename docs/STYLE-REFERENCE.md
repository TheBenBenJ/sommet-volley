# Référence de style — le « moule » visuel de Sommet Volley

> Style de référence = le personnage **Micron** + la map **Micron (Palais de
> l'Hexagone)**. Tout nouvel asset (perso, map, ballon) doit tomber dans ce
> moule. **Les images sont générées dans Grok** — ce document décrit le style à
> obtenir dans tes prompts (le prompt canon est dans les skills `sommet-map` /
> `sommet-character`). Pas de LoRA/génération locale.

## ADN visuel (extrait des assets Micron)

- **Trait** : contour encré **noir épais et régulier**, fermé (pas de trait qui
  bave). Épaisseur constante quel que soit le zoom.
- **Ombrage** : **cel-shading plat**, 1 ton d'ombre max. Aucun dégradé photo,
  aucune occlusion ambiante, aucun rendu 3D.
- **Aplats** : couleurs pleines, saturées mais pas fluo. Lisibles à petite
  taille (le jeu affiche les persos à ~110 px de haut).
- **Proportions perso** : caricature — **grosse tête (~1/3 de la hauteur)**,
  corps compact et trapu, expression lisible.
- **Lumière** : neutre, frontale, pas de source dramatique.

### Palette de référence (mesurée sur les assets Micron)

| Rôle | Tons observés |
|------|---------------|
| Contour | `#000000` (noir encré) |
| Perso — costume | bleu marine `#001848` |
| Perso — peau | `#f0c078` / `#f0a878` |
| Map — ciel | bleu clair `#90d8f0` / `#a8d8f0` |
| Map — pierre / sol | beige-gris `#c0c0a8` / `#909078` |

Chaque nouveau perso a **sa** palette (3 tons dominants max, cf. sa fiche), mais
le **trait, l'ombrage plat et le niveau de saturation** restent identiques —
c'est ça, « le même style que la map Micron ».

## Deux familles d'assets, un seul style

1. **Personnages** (fond blanc → détourés) : voir specs dans
   [PIPELINE-PERSONNAGE.md](PIPELINE-PERSONNAGE.md).
2. **Maps** (plein cadre → PAS détourées) : voir specs + **contrat de
   perspective** dans [PIPELINE-MAP.md](PIPELINE-MAP.md).

Pour prompter Grok, **montre-lui les assets Micron en référence visuelle**
(`assets/micron/idle_face_0.png` pour un perso, `assets/maps/micron/skyline.png`
pour une map) et exige le même trait/aplats. Le prompt canon exact est dans les
skills `sommet-map` / `sommet-character`.

## Éléments de décor dynamiques (on n'est pas limité)

Le style autorise — et on encourage — beaucoup de props animés dans les maps
(drapeaux qui flottent, oiseaux, cortèges, véhicules, lanternes, feuilles…).
Rappel dur : **les props vivent au-dessus du court, jamais sur la zone de jeu**,
et tout élément mobile passe par le système d'events (annoncé, déterministe —
cf. PIPELINE-MAP.md étape 5). Générer généreusement, intégrer avec discipline.

## Interdits transverses (rappel légal — cf. FICTIONNALISATION.md)

- Aucun **vrai dirigeant** identifiable, aucun **vrai drapeau national**, sceau,
  texte lisible réel, vrai lieu nommé.
- Symboles nationaux/religieux réels → **motifs abstraits** équivalents.
- Personnages = **archétypes fictifs** (nations inventées).

## Images-témoins (à égaler dans tes prompts Grok)

- Perso : `assets/micron/idle_face_0.png`.
- Map : `assets/maps/micron/skyline.png`.

Tout nouvel asset doit pouvoir **cohabiter avec Micron sans jurer** (même trait,
mêmes aplats). C'est le test de validation.
