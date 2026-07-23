---
name: sommet-map
description: >
  Ajoute une nouvelle map (terrain) dans le jeu Sommet Volley. L'agent pose les
  PRÉREQUIS (casting/thème SÉCURISÉ Steam, manifest, clé/nom) puis RESSORT un
  PROMPT Gemini blindé (16:9, décor 100 % STATIQUE, archi FICTIONNELLE — aucun
  monument réel, véhicule, foule) ; l'utilisateur génère dans Gemini. Puis
  INTÉGRATION seulement si QA Steam/cadrage OK : map_fit → MAP_LAYOUT, assets/,
  TERRAINS/loader. Utiliser dès qu'on veut ajouter ou remplacer un terrain.
---

# sommet-map — ajouter/intégrer un terrain

Découpage : **l'agent pose les PRÉREQUIS (code) et ressort un PROMPT pour Gemini ;
l'utilisateur génère la skyline dans Gemini.** ⚠️ Les skylines sont des scènes
complexes : **Grok les rate** (cadrage, cohérence). On les génère donc **dans
Gemini** — l'agent ne génère PAS l'image lui-même ici, il fabrique tout le reste
et livre le prompt. (À l'inverse, les props/persos isolés — `sommet-decor`,
`sommet-character` — se génèrent bien via Grok.)

## Constantes moteur (source `src/core.js` — ne pas deviner)

```
Canvas logique 900×500 · sol GROUND_Y=418 · filet NET_X=450, sommet NET_TOP=233
Perso debout ≈ 110 px · court attendu dans le TIERS BAS de l'image
```

Mapping `TERRAINS.key` → dossier `assets/maps/` : neige→vladou, plage→trompette,
prairie→micron, parade→bebe ; matin/bosphore/ashram/amazon/colline = même nom.

## Règle d'or Steam (lire AVANT de rédiger un theme / prompt)

Le modèle (Gemini) **sur-interprète** les indices culturels → il peint le
monument réel le plus célèbre. Donc :

1. **Décrire l'ARCHI POSITIVE** (forme, matériaux, couleurs unies) — jamais
   seulement « ambiance X ».
2. **Lister les INTERDITS NOMBRÉS** du pays-archétype dans le `theme` ET dans
   le prompt (sinon Gemini comble le vide avec Saint-Basile, Tour Eiffel, etc.).
3. **Pas de mot-piège** : `onion dome` / `cathedral` / `Kremlin` / `Eiffel` /
   `pagoda temple` / `Red Square` → refusés dans le casting. Préférer
   `rectangular fortress`, `plain bulb silhouette (solid single color)`,
   `ornamental stone spire (abstract, NOT the Eiffel tower)`.
4. **QA avant intégration** (étape 1.5) — un monument identifiable = **rejeter**,
   ne pas « presque ok ».

Anti-landmarks à injecter selon l'archétype (exemples, pas exhaustif) :

| Archétype / nation | Interdits NOMBRÉS (à écrire dans prompt + theme) |
|--------------------|--------------------------------------------------|
| Bourassie / neige | Saint-Basile, Kremlin, Place Rouge, coupoles rayées/spiralées multicolores |
| Gallardie / prairie | Tour Eiffel, Arc de Triomphe, Notre-Dame |
| Doria / plage | Maison Blanche, Capitol, Statue de la Liberté |
| Ryonganie / parade | portraits géants de dirigeants, sceaux d'État |
| Panguo / matin | Cité Interdite réelle, Muraille identifiable |
| Bosforie / bosphore | Sainte-Sophie, Mosquée Bleue, croissants religieux |
| Bharatie / ashram | Taj Mahal, temples + symboles religieux |
| Tropicalia / amazon | Christ du Corcovado, drapeaux BR |
| Levantie / colline | dômes + croissants, Kaaba, drapeaux nationaux |

---

## Étape 0 — PRÉREQUIS (l'agent les pose, code seulement)

Invoqué avec une clé/nom de map (`/sommet-map <nom>`), l'agent prépare **tout le
code** avant l'image — c'est ce qui alimente le prompt et l'intégration :

1. **Décider** `key` (technique, dossier `assets/maps/<key>/`) + `name` affiché
   (fictionnalisé, cf. `docs/FICTIONNALISATION.md`).
2. **Casting** : ajouter (ou vérifier) l'entrée `MAPS` dans
   `tools/genassets/casting.py` — `key`, `char`, `name`, et surtout `theme`.

   **Contrat du champ `theme` (Steam-sécure)** — 1 phrase composite qui contient :
   - **archi positive** : volumes, matériaux, toits, palette (aplats unis) ;
   - **ambiance** : ciel, saison, lumière ;
   - **court** : surface unie + lignes (neige / sable / pierre…) ;
   - **anti-landmark** : `(no real X, no Y, no multicolored striped domes…)` ;
   - **anti-mouvement** implicite : rien qui bouge (véhicules/foules = props).

   ❌ Mauvais theme (trop vague → Gemini peint Saint-Basile) :
   `a snowy red-walled fortress square, abstract onion-dome silhouettes…`

   ✅ Bon theme :
   `a monumental snowy crimson-brick rectangular fortress palace with flat
   snow-covered roofs and square towers (cream trim), ONE distant plain
   dark-red bulb silhouette solid single color — NO cathedral, NO Saint Basil,
   NO candy-stripe/spiral domes, NO Kremlin ; crenellated walls, plain blue/green
   parade banners, frosted lamp posts, bare snowy trees, packed white snow
   volleyball court, pale grey overcast sky`

3. **Manifest** `assets/maps/<key>/manifest.json` : déclarer dès maintenant
   `"props": ["net_post","flag","<event>"]` + `"event": "<event>"` (relais vers
   `sommet-decor`).
4. **Copier la map de référence** hors repo pour la joindre dans Gemini :
   `cp assets/maps/micron/skyline.png ~/Downloads/JOINDRE_ref_style_map.png`.

(Le reste du câblage — `TERRAINS`, `MAP_LAYOUT`, loader — se fait à l'étape 2,
une fois l'image en main.)

## Étape 1 — PROMPT pour Gemini (l'agent le ressort, l'utilisateur génère)

⚠️ **La skyline se génère dans Gemini, pas via l'agent ni Grok** (Grok rate ces
scènes complexes). L'agent **ressort le prompt rempli** ci-dessous + le fichier à
joindre (étape 0.4) ; l'utilisateur génère dans Gemini et dépose l'image, puis
l'agent fait la **QA (étape 1.5)** avant l'étape 2.

**Avant de sortir le prompt**, l'agent DOIT :
- reprendre le `theme` sécure de l'étape 0 (pas une version raccourcie) ;
- ajouter le bloc **Architecture rule** + les anti-landmarks de la nation ;
- rappeler explicitement : court de **volley** (pas patinoire / foot / autre).

**Template DYNAMIQUE** du prompt. Paramètres : (1) map de référence à JOINDRE =
style + cadrage ; (2) `[DESCRIPTION]` = le `theme` sécure de l'étape 0 ;
(3) `[ANTI_LANDMARKS]` = ligne du tableau ci-dessus pour cette map :

```
En image jointe : un décor de terrain de mon jeu de volley cartoon.
Génère une NOUVELLE map dans EXACTEMENT le même style et le même cadrage que
cette image jointe :
- même trait (contours noirs épais), mêmes aplats plats, même niveau de détail ;
- ratio 16:9, haute résolution (1920×1080) ;
- un terrain de VOLLEY plat occupe le TIERS INFÉRIEUR (surface unie, VIDE —
  aucune patinoire, aucun autre sport, aucun équipement/rack au premier plan —
  avec une ligne de fond horizontale nette + une ligne centrale), vue de face —
  surtout PAS de vue de dessus, pas incliné ;
- l'architecture et le ciel occupent les deux tiers du haut, sommets des
  bâtiments ENTIÈREMENT visibles (rien de coupé) ;
- décor RICHE et détaillé : plusieurs plans de bâtiments, végétation, relief,
  petits éléments FIXES d'ambiance (urnes, lampadaires, bannières abstraites sur
  mât) — un fond vivant, pas vide.

La nouvelle map représente : [DESCRIPTION]

ARCHITECTURE RULE (Steam / fiction) — OBLIGATOIRE :
- buildings must be ORIGINAL composites, not copies of real landmarks ;
- forbidden real places / lookalikes : [ANTI_LANDMARKS] ;
- if the culture suggests domes/spires : use at most 1–2 PLAIN solid-color
  silhouettes far away — NO stripes, spirals, candy patterns, mosaics that
  evoke a famous cathedral/mosque/temple ;
- prefer rectangular palaces, flat or gently pitched roofs, simple towers.

Interdits ABSOLUS — aucun élément CENSÉ BOUGER (ils seront ajoutés séparément en
props animés par le moteur) : AUCUN oiseau/animal vivant, AUCUN personnage ni
foule, AUCUN véhicule (voiture, camion, Zamboni, bateau, avion…), ballon ou
objet volant, rien qui suggère le mouvement. Le décor doit être 100 % STATIQUE.
Interdits aussi : aucun vrai drapeau national, aucun monument réel identifiable,
aucun texte, aucun logo, aucun symbole religieux.
```

> **Pourquoi « rien qui bouge »** : oiseaux, foules, cortèges, véhicules, ballons
> sont des **props/événements** détourés que le moteur anime par-dessus la skyline
> (cf. `sommet-decor`). S'ils sont peints dans le fond, on a des doublons figés
> qui jurent avec les props animés. Le fond = décor fixe uniquement.

> **Pourquoi l'ARCHITECTURE RULE** : un theme vague (« onion domes », « palace »)
> fait coller à Gemini le monument touristique n°1. On force une archi
> **composite** + une blacklist **nommée**. Leçon Place Écarlate (2026-07) :
> 2 gens refusées pour Saint-Basile + Zamboni + « patinoire ».

Map de référence par défaut : `assets/maps/micron/skyline.png` (≈16:9, bon
cadrage). Thèmes des nations : `tools/genassets/casting.py` (doivent déjà être
sécures — sinon les corriger à l'étape 0).

🚨 **RATIO 16:9 OBLIGATOIRE (le piège n°1).** L'écran de jeu ≈ 16:9 (900×500).
Une source **3:2 ou carrée est TROP HAUTE** → le moteur rogne le HAUT des
bâtiments (effet zoomé) et ne remplit pas bien le bas. Générer en **16:9 strict**
— ex. **1920×1080** ou **1536×864** — sinon perte des sommets garantie.
À l'intégration, **vérifier le ratio** : `sips -g pixelWidth -g pixelHeight
assets/maps/<key>/skyline.png` → largeur/hauteur doit valoir ~**1.78**. Si c'est
~1.5 (3:2) ou 1.0 (carré) → **regénérer en 16:9**, ne pas intégrer.

💡 **Qualité** : la skyline remplit tout l'écran → générer à la **résolution la
plus haute possible**. Basse déf + sur-zoom = flou.

## Étape 1.5 — QA avant intégration (OBLIGATOIRE)

Dès que l'utilisateur dépose un PNG, l'agent **vérifie avant toute copie** dans
`assets/maps/` :

| Check | Seuil | Si échec |
|-------|-------|----------|
| Ratio | `w/h ≈ 1.78` (±0.08) | Regénérer 16:9 |
| Court volley | Tiers bas, surface unie, lignes fond + centre, **vide** | Regénérer (pas patinoire / autre sport / racks) |
| Statique | Aucun véhicule, foule, animal vivant, objet volant | Regénérer |
| Steam archi | Aucun monument réel identifiable ; pas de coupoles/motifs « carte postale » | Regénérer + durcir `[ANTI_LANDMARKS]` |
| Symboles | Pas de vrai drapeau, texte, logo, symbole religieux | Regénérer |

**Procédure QA** : `sips` pour le ratio ; crops bas / centre archi (`_qa_*.png`
temporaires) + lecture visuelle ; **supprimer les crops** ensuite.

Si **un seul** check échoue → **ne pas intégrer**. Ressortir un prompt de regen
(template ci-dessus) avec anti-landmarks **plus explicites** et expliquer les
échecs en 2–3 bullets. Ne pas négocier un « presque ».

## Étape 2 — INTÉGRATION (seulement si QA 1.5 OK)

1. **Installer** : `assets/maps/<key>/skyline.png` (+ `far.png`, `thumb.png` si
   fournis — ces fonds plein cadre ne se détourent PAS, copie directe).
2. **Caler la perspective — TOUJOURS avec `--full`** (défaut pour les maps Grok) :
   `python3 tools/genassets/map_fit.py assets/maps/<key>/skyline.png --full --auto`
   → ouvre le `_fit.png` : les 2 silhouettes doivent avoir les **pieds sur la
   ligne rouge**. Sinon, relancer avec une valeur explicite : `map_fit.py
   <skyline> <baselineFromBottom> --full`. Nettoyer le `_fit.png`.
   > **Pourquoi `--full` par défaut** : une skyline Grok/Gemini est en ~16:9 ;
   > la zone de jeu seule (900×418) est trop large/courte → un rendu normal
   > **rogne le haut des bâtiments** (effet zoomé) et **coupe le bas au score**.
   > Le mode plein hauteur (900×500 ≈ 16:9) préserve le haut ET fait descendre
   > le terrain derrière le score. C'est le rendu correct pour ces maps.
3. **MAP_LAYOUT** (`src/terrains.js`) : renseigner `<terrainKey>` avec
   `bgFullHeight: true` (**défaut maps Gemini/Grok** — cf. ci-dessus),
   `baselineFromBottom` (valeur validée en 2, > 0 pour que le court tombe sur
   GROUND_Y), `netPost {footPad,xOff,scale}`, `codeSeam` (true si pas de ligne
   de court fiable).
4. **Props** (si générés : flag/net_post + prop d'event, fond blanc ; pas de warn) :
   `python3 tools/cutout.py raw/maps/<key> assets/maps/<key>` (props only ;
   jamais sur skyline/far/thumb). Nouveau prop → l'ajouter à `PROP_NAMES`
   (`tools/cutout.py`) ET au loader (`loadMapPack`/`initMap*` dans `src/assets.js`).
5. **Câblage** : entrée `TERRAINS` (`src/state.js`) + `manifest.json` + météo
   (`weather: clear` → forcer ciel calme si besoin) + event éventuel (gate
   `mapEventsCanStep`, déterministe, cf. `docs/PIPELINE-MAP.md` §5).
   > 🔗 **Passage de relais vers `sommet-decor`** : dans le `manifest.json`,
   > déclarer **dès maintenant** les props visés + l'event, même si les PNG
   > n'existent pas encore — ex. `"props": ["net_post","flag","<event>"]`,
   > `"event": "<event>"` (PAS de `warn` : partagé Micron + fallback code).
   > Vérifier aussi que la map a bien une entrée `MAPS` (thème/palette) dans
   > `tools/genassets/casting.py`. C'est ce que `sommet-decor` lira pour savoir
   > quoi générer et dans quel style. Manifest vide → `sommet-decor` retombe sur
   > le socle par défaut (`net_post,flag` + event deviné).
6. **Vérifier** : `npm test` vert, puis préviz — pieds sur la ligne, poteau au
   sol, score sous le court, pas de double bannières, event en `play` seulement.

## Références

`docs/PIPELINE-MAP.md` (contrat détaillé) · `docs/PIPELINE-ASSETS.md` (pipeline)
· `docs/STYLE-REFERENCE.md` (style) · `docs/FICTIONNALISATION.md` (Steam).
