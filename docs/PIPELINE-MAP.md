# Pipeline map — process de référence

Objectif : intégrer **n'importe quelle map** (fond + props + event) en une
session, sans rediscuter baseline, détourage, météo ou timing d’event. Ce
document EST la référence ; chaque friction rencontrée en prod doit être
corrigée ICI (et dans les prompts `raw/maps/`), pas contournée au cas par cas.

> Compagnon de [`PIPELINE-PERSONNAGE.md`](PIPELINE-PERSONNAGE.md).  
> Template collable : [`raw/maps/_TEMPLATE/`](../raw/maps/_TEMPLATE/).

---

## Leçons déjà payées (ne pas rejouer)

| Symptôme | Cause | Règle dure |
|----------|-------|------------|
| Pieds / poteau / score mal calés | Court sans **ligne de fond** claire dans le skyline, ou trop haute | `skyline` = strip de jeu **bas**, baseline horizontale **épaisse**, mesurable |
| Fond « joli » mais injouable | Plaza / mosaïque sans court de volley | Le prompt skyline **exige** un court beige + lignes ; rejeter sinon |
| Halo / trou dans un drapeau violet | Cutout perce les blancs enfermés | Soit **pas de blanc** sur le drapeau, soit map dans `FLAG_KEEP_WHITE_MAPS` |
| Bras / torse percés (defeat…) | Blanc entre bras et corps → trou alpha | Prompts : **aplats solides**, pas de jour blanc dans la silhouette |
| Event pendant pause / point / battle | Step event sans garde | Events seulement en `play` (voir code `mapEventsCanStep`) |
| Aras « pluie verticale » | Prop + trajectoire mal spécifiées | Event volant = **vol horizontal** dans prompt + design |
| Parade / Matin : bandes sous le fond | `bgFullHeight` oublié ou baseline trop basse | Maps « décor jusqu’en bas du canvas » → `bgFullHeight` + baseline sur la ligne de court |
| Tempête / sable sur Pelouse Oval | Météo code sur map « calme » | Forcer `clear` (ou doc explicite) pour les maps qui doivent rester propres |
| Double bannières (PNG + dessin fond) | Props flag redondantes avec skyline | Décider : **soit** bannières dans le skyline, **soit** props `flag` — pas les deux saturés |
| Cutout sur skyline/far/thumb | Lance `cutout.py` sur tout le dossier | **Copie manuelle** des fonds plein cadre ; cutout **props only** |

---

## Étape 0 — Fiche map (AVANT tout pixel)

```yaml
key: bosphore                 # dossier assets/maps/<key>/  (= pack)
terrainKey: bosphore          # TERRAINS[].key (parfois ≠ : neige→vladou, plage→trompette…)
name: "Palais du Bosphore"    # nom affiché (parodie)
character: sultan             # perso attitré (roster)
palette: ["#…", "#…", "#…"]   # 3 tons max
mood: "jour clair / crépuscule / neige…"
weather: clear                # clear | dynamic — si clear, le code force le ciel calme
bgFullHeight: false           # true si le décor doit descendre sous GROUND_Y (matin, parade)
event:
  id: carpet
  prop: carpet.png
  motion: traverse_horizontal # traverse_horizontal | rain_zone | crowd_mask | …
  idleOffCourt: false         # true = prop visible hors terrain hors event (ex. vache)
layoutHint:
  baselineFromBottom: null    # mesuré APRÈS skyline (px sous la ligne de fond du court)
  codeSeam: false             # true si pas de trait de fond fiable dans le PNG
```

Mapping **terrainKey → dossier pack** actuel :

| `TERRAINS.key` | Dossier `assets/maps/` |
|----------------|------------------------|
| neige | vladou |
| plage | trompette |
| prairie | micron |
| parade | houn |
| matin / bosphore / ashram / amazon | même nom |

---

## Étape 1 — Style guide map (commun)

À coller / rappeler dans chaque prompt fond :

- cartoon éditorial politique, **contours noirs épais**, aplats (pas photo) ;
- composition **symétrique** centrée sur le filet (`NET_X`) ;
- **pas** de vrai drapeau national, sceau, texte lisible, vrai lieu nommé, vrai dirigeant ;
- symbole religieux / national : **interdits** (croissant+étoile, swastika, étoiles US, etc.) → motifs **abstraits** seulement ;
- une image à la fois ; skyline en **référence** pour far / crowd / thumb.

---

## Étape 2 — Assets requis

### Fonds (plein cadre — **PAS** de cutout)

| Fichier | Ratio | Rôle |
|---------|-------|------|
| `skyline.png` | **16:9** | Décor principal jouable |
| `far.png` | 16:9 | Couche lointaine soft (souvent peu / pas affichée si skyline suffit) |
| `crowd_0.png` | 16:9 | Bande public (souvent désactivée si déjà dans skyline) |
| `thumb.png` | 16:9 ou 1:1 | Vignette menu |

### Props (fond `#FFFFFF` — **cutout**)

| Fichier | Ratio typique | Notes |
|---------|---------------|-------|
| `flag.png` | 1:1 | Bannière ; éviter blanc pur si map hors `FLAG_KEEP_WHITE_MAPS` |
| `net_post.png` | 3:4 | Poteau seul, **sans** filet |
| `warn.png` | 1:1 | Icône d’annonce d’event |
| event prop | 1:1 ou 16:9 | Voir fiche (`carpet`, `cow`, `macaw`, `lantern`, …) |

Noms connus du loader / `cutout.py` : voir `PROP_NAMES` dans `tools/cutout.py`
et `loadMapPack(...)` dans `src/assets.js`. Nouveau prop → **les deux**.

---

## Étape 3 — Bloc CRITICAL skyline (obligatoire)

Tout `skyline` **doit** contenir ce contrat gameplay (adapter couleurs / thème) :

```
CRITICAL gameplay strip (non-negotiable):
- Flat volleyball COURT in the LOWER ~30–35% of the image only.
- Court surface: warm sandstone / beige / packed earth (theme-consistent), mostly EMPTY.
- Thick clear HORIZONTAL court BASELINE near the bottom edge of the court (readable black or dark line).
- Centered VERTICAL center line from baseline up toward mid-court.
- Leave playable court empty: NO pots, NO mosaic hero carpet, NO people, NO giant props on the court.
- Midground architecture / plaza sits ABOVE the court, not instead of it.
- Full-bleed 16:9, no letterbox bars, no watermarks, no text, no logos.
```

**Critères de rejet immédiats** (regénérer avant d’installer) :

- [ ] Pas de ligne de fond horizontale nette dans le bas ;
- [ ] « Belle cour » / mosaïque / allée centrale **à la place** du court ;
- [ ] Court trop haut (personnages marcheraient dans l’architecture) ;
- [ ] Drapeaux / symboles nationaux réels ;
- [ ] Foule ou personnages sur la zone de jeu.

Mesure ensuite `baselineFromBottom` = distance en px entre le **bas du PNG** et
la **ligne de fond du court**, puis renseigne `MAP_LAYOUT[<terrainKey>]` dans
`src/terrains.js`.

- Maps classiques : `drawImgCoverBottom` + `baselineFromBottom`.
- Maps plein cadre (`matin`, `parade`) : `bgFullHeight: true` +
  `drawImgCoverBaseline` (la ligne de court source tombe sur `GROUND_Y`, le
  pavé peut descendre sous le score).

Si la ligne PNG est foireuse → `codeSeam: true` (trait code) **en plus** d’un
baseline raisonnable, pas à la place d’un bon skyline.

---

## Étape 4 — Props & cutout

```bash
# Props seulement (copie manuelle des fonds)
cp raw/maps/<key>/{skyline,far,thumb}.png assets/maps/<key>/   # + crowd_0 si besoin

# Détourage props (flag / warn / net_post / event…)
python3 tools/cutout.py raw/maps/<key> assets/maps/<key>
```

⚠️ Si tu lances `cutout.py` sur le dossier entier, **retire d’abord** skyline /
far / thumb / crowd du dossier raw **ou** copie-les après coup : le script
traite tout PNG non-prop comme un perso (ancrage pieds, etc.).

### Drapeaux

- Préférer champs **sans blanc pur** (crème, or, couleur unie) pour ashram /
  bosphore / amazon / matin / houn.
- Si blanc intentionnel (rayures US parody, etc.) → ajouter le dossier map dans
  `FLAG_KEEP_WHITE_MAPS` dans `cutout.py`.
- Prompt flag : *solid color field, NO white triangles, NO white gaps between
  pole and cloth, cloth attached to pole*.

### Poteau

- Base au sol visible, peu de padding transparent bas (sinon `netPost.footPad`).
- Pas de filet dans le PNG (le filet est code).

---

## Étape 5 — Event map

Règles produit (aussi dans `VISION.md`) :

1. **Annonce** visuelle + sonore ~2 s avant (`warn`).
2. **Déterministe** (RNG seedé) — jamais `Math.random()`.
3. **Step uniquement en échange jouable** (`mapEventsCanStep` : pas pause,
   pas écran service / point / battle).
4. Fréquence faible (twist, pas le cœur du jeu).

### Spécifier le mouvement dans le prompt prop

| Type | Exemples | Prompt prop doit dire |
|------|----------|------------------------|
| Traverse horizontal | tapis, vache event, aras | *side view facing right, readable silhouette for horizontal flight/walk* |
| Pluie de zone | lanternes, balles golf | *prop alone ; rain pattern is CODE* |
| Masque vue | marchers | *crowd strip / procession, not single hero* |
| Idle hors terrain | vache Ashram | *idle devant public* ; event = plus grand, sur le court |

Fiche event minimale dans `raw/maps/<key>/prompts-event.md` + entrée
`manifest.json` (`event`) + chargement dans `initMap*()` / `assets.js`.

---

## Étape 6 — Intégration code (checklist)

- [ ] `assets/maps/<key>/` : skyline (+ props) + `manifest.json`
- [ ] `initMap*()` / `loadMapPack` : toutes les clés props
- [ ] `TERRAINS` + sélection menu (thumb)
- [ ] `MAP_LAYOUT` : `baselineFromBottom`, `netPost`, `codeSeam`, `bgFullHeight?`
- [ ] Météo : `weather: clear` → forcer ciel calme dans `stepWeather` si besoin
- [ ] Event : spawn / step / draw / collision ; gate `mapEventsCanStep`
- [ ] `npm test`
- [ ] Check visuel : pieds sur la ligne, poteau au sol, score sous le court,
      pas de double bannières, event OK en play seulement

---

## Ordre de génération recommandé

1. `skyline` → **valider le CRITICAL strip** avant la suite  
2. `far` / `thumb` (skyline en référence)  
3. Props `flag` → `net_post` → `warn`  
4. Prop event (`prompts-event.md`)  
5. `crowd_0` seulement si le public n’est **pas** déjà dans le skyline  

---

## Template

Copier [`raw/maps/_TEMPLATE/`](../raw/maps/_TEMPLATE/) vers
`raw/maps/<key>/`, remplir la fiche, coller les prompts Gemini, puis suivre
les étapes 4–6.
