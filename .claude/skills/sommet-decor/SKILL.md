---
name: sommet-decor
description: >
  À partir d'une map (skyline) DÉJÀ intégrée dans Sommet Volley, produit TOUT ce
  dont la map a besoin en plus de la skyline : les props raccord générés par Grok
  (net_post, flag, prop(s) d'événement) dans le MÊME style, ET la miniature de
  menu (thumb) fabriquée localement. La cohérence de style vient d'une seule
  règle : on JOINT la skyline comme référence à chaque requête Grok. Fournit les
  PROMPTS canon (un élément par image, fond MAGENTA chroma-key) puis l'INTÉGRATION fiable
  (thumb local → cutout → manifest → loader → rendu). Utiliser après sommet-map,
  quand la skyline d'un terrain est en place.
---

# sommet-decor — peupler une map de props raccord

Complément de `sommet-map`. La skyline est déjà intégrée (`assets/maps/<key>/
skyline.png`) ; ici on fabrique les **objets détourés** posés par-dessus. **Grok
fait les pixels, ce skill fait l'intégration.** La cohérence de style ne se
décrit pas au mot près — elle vient du **fichier joint** : on attache la skyline
de la map à chaque prompt, Grok en copie le trait, les couleurs et le niveau de
détail.

## Ce qu'est un « prop » (contrat moteur — ne pas deviner)

- Un prop = **un PNG détouré**, dessiné par `drawMapProp(img, x, footY, drawH)` :
  **ancré au bas-centre** (les pieds/la base touchent `footY`). Hauteurs en jeu
  = table `PROP_H` dans `src/core.js` (réf. `CHAR_BASE_H` = 110). Ne pas inventer
  une hauteur magique à l'intégration — ajouter une clé `PROP_H` si besoin.
  Objet **debout, entier, cadré vertical**.
- Détourage par `tools/cutout.py` → `process_prop` : **fond uni MAGENTA #FF00FF**
  (chroma key), pas d'ancrage pieds, normalisé à 720 px de haut. Le magenta devient
  transparent (le blanc de l'objet est PRÉSERVÉ) → **aucune ombre, aucun sol, aucun
  décor** autour de l'objet.
- Les **fonds plein cadre** (`skyline.png`, `far.png`, `thumb.png`) ne sont PAS
  des props : ils ne se détourent pas (relève de `sommet-map`).

Mapping `TERRAINS.key` → dossier : neige→vladou, plage→trompette, prairie→micron,
parade→bebe ; matin/bosphore/ashram/amazon = même nom.

## Catalogue COMPLET — tout ce dont une map a besoin en plus de la skyline

Mêmes noms de fichier partout. La colonne « Source » dit qui le fabrique.

| Fichier          | Source        | Rôle en jeu                                          |
|------------------|---------------|------------------------------------------------------|
| `net_post.png`   | **Grok**      | Poteau de filet **seul** (pas de fanion), fût vertical **centré** dans le PNG (bas-centre, contre le filet). |
| `flag.png`       | **Grok**      | Bannière plantée sur la ligne de touche (agitée, léger bob). |
| *(prop d'event)* | **Grok**      | Objet de l'événement interactif, propre à la map (ex. `falcon`, `carpet`). |
| `thumb.png`      | **local**     | Miniature du menu terrain — simple réduction de la skyline (voir étape 2). |

**Pas besoin de générer** :
- `warn.png` : l'alerte d'événement utilise **toujours** celle de Micron
  (`mapEventWarnIcon` → `SPRITES.mapPalaisDuCoq.warn`) avec un fallback triangle « ! »
  dans le code. Inutile par map — **ne pas le demander à Grok**.
- `far.png` : couche de parallaxe lointaine **optionnelle**. `drawMapBackdrop`
  se contente de `skyline` seule. Ne l'ajouter que si on veut vraiment un plan
  arrière distinct.

Props d'événement existants (gabarits) : `carpet` (tapis, bosphore), `falcon`
(faucon, colline), `pigeon` (micron), `marchers_0/1` (cortège), `cannon` +
`cannon_fire`, `snowman`, `radar_0/1`, `cow`, `macaw`, `lantern`, `whistle`.
Un nouvel événement = un nouveau nom de prop (à déclarer, cf. étape 4).

## Étape 0 — AUTO-DÉTECTION (piloter le skill par le seul nom de map)

Invoqué avec une clé de map (`/sommet-decor bosphore`), l'agent déduit **tout seul**
quoi générer — ne rien demander à l'utilisateur, tout est dans le repo :

1. **Thème + nom** de la map : entrée `MAPS` dans `tools/genassets/casting.py`
   (`key == <map>`) → champs `name` et `theme` (palette, ambiance, motifs). Le
   perso associé (`char`) donne la nation ; son `look`/`nation` dans `CHARACTERS`
   affine les couleurs/symboles abstraits.
2. **Props attendus** : lire `assets/maps/<key>/manifest.json` → tableau `props`
   et champ `event`. C'est la liste à (re)générer via Grok. Si le manifest manque,
   viser le **socle** `net_post, flag` + un prop d'événement cohérent avec le
   thème (choisir un nom parlant, ex. `carpet`, `falcon`). Ne PAS inclure `warn`
   (partagé Micron + fallback code). Le `thumb` est toujours à faire, en local.
3. **Régénération vs création** : si `assets/maps/<key>/skyline.png` a été
   remplacée récemment (nouveau style), les props existants sont dans l'ancien
   style → **tous à régénérer**. Sinon, ne générer que les manquants.
4. **Remplir `[ÉLÉMENT]`** de chaque prop à partir du `theme` (motifs, palette) —
   pour le prop d'event, s'appuyer sur l'événement de la map (`docs/PIPELINE-MAP.md`
   / le rendu dans `src/terrains.js`).

Sortie de l'étape 0 = un prompt par prop, prêt (cf. étape 1). Ensuite, étape 1 :
générer les images.

## Étape 1 — GÉNÉRATION des images

**L'agent qui exécute ce skill génère lui-même les images s'il en est capable.**
Beaucoup de modèles (Grok, Gemini…) savent générer une image, souvent en prenant
une image jointe comme référence de style. Donc :

- **Si tu (l'agent) sais générer des images** : pour chaque prop, génère l'image
  avec le prompt ci-dessous **en fournissant `assets/maps/<key>/skyline.png` comme
  référence de style**, et **enregistre le résultat directement dans
  `raw/maps/<key>/<nom>.png`** (nom exact : `net_post.png`, `flag.png`,
  `<event>.png`). Ne renvoie PAS le prompt à l'utilisateur — fais-le.
- **Si tu ne sais PAS générer d'images** (ex. Claude Code) : copie la skyline hors
  repo (`cp assets/maps/<key>/skyline.png ~/Downloads/JOINDRE_<key>_skyline.png`)
  et remets les prompts + ce fichier à l'utilisateur pour qu'il génère dans l'app
  Grok/Gemini, puis dépose les PNG dans `raw/maps/<key>/`.

> Note style : la cohérence vient de la skyline fournie en référence. Un générateur
> qui n'accepte PAS d'image de référence (texte-seul) donnera un style plus
> approximatif — préférer un outil qui prend l'image jointe.

**Template DYNAMIQUE** du prompt, un par élément. Paramètre : remplir `[ÉLÉMENT]` ;
référence de style = `assets/maps/<key>/skyline.png` (jointe/fournie au générateur) :

```
En image jointe : le décor (skyline) d'un terrain de mon jeu de volley cartoon.
Génère UN SEUL objet de décor pour ce terrain, dans EXACTEMENT le même style que
l'image jointe : même trait (contours noirs épais), mêmes aplats plats de
couleur, mêmes teintes, même niveau de détail.

L'objet à générer : [ÉLÉMENT]

Contraintes STRICTES de rendu :
- fond UNI MAGENTA #FF00FF (chroma key), rien d'autre — PAS de blanc, PAS de sol,
  PAS d'ombre portée, PAS de décor ni de dégradé autour de l'objet ;
- objet SEUL, ENTIER, centré, debout, cadrage vertical, marge tout autour ;
- haute résolution, objet net aux bords ;
- aucun texte, aucun logo, aucun vrai drapeau national ni monument réel
  identifiable, aucun personnage humain.
```

> 🟪 **Fond MAGENTA #FF00FF** (pas blanc) : le détourage keye le magenta → le
> **blanc/clair des props (drapeaux, poteaux, plumage) est préservé**. Fini le
> blanc-sur-blanc qui rongeait les drapeaux.

Exemples de `[ÉLÉMENT]` (adapter au thème de la nation) :
- **net_post** : « un poteau de filet de volley SEUL, parfaitement VERTICAL et
  DROIT, fût centré dans l'image, décoré aux couleurs/motifs du décor joint
  (ornement/finial en haut OK), vu de face — SANS drapeau, SANS fanion, SANS
  bannière accrochée (le flag est un prop séparé) ».
- **flag** : « une bannière/drapeau de supporters sur sa hampe, tissu qui ondule,
  aux couleurs du décor joint (motif abstrait, PAS un vrai drapeau national) ».
- **prop d'event** : décrire l'objet interactif (ex. « un tapis volant à motifs,
  vu de profil, légèrement bombé » ; « un faucon en vol de profil, ailes
  déployées »).

⚠️ **Poteau (`net_post`) — contrat de cadrage (leçon acquise)** :
`drawNet` centre le PNG entier sur `NET_X`. Si le fût n'est pas au centre du
fichier (fanion latéral, lean, padding asymétrique), le poteau paraît de
travers en jeu. Donc : **objet = poteau seul**, axe vertical, fût au milieu
horizontal du cadre. Après détourage, **toujours** passer :

`python3 tools/genassets/fix_net_posts.py <key>`

(recentre le fût, redresse le lean, retire les appendices latéraux, hauteur 720).
Vérifier `off ≲ 3 px` et `|lean| ≲ 1°`. Backup auto dans
`assets/maps/<key>/_bak_net_post/`.

⚠️ **Steam-friendly** : jamais de vrai drapeau/monument/sceau/logo identifiable
(cf. `docs/FICTIONNALISATION.md`). Thèmes des nations : `tools/genassets/casting.py`.

💡 **Cohérence inter-props** : générer TOUS les props d'une map d'affilée, avec
la même skyline en référence, pour que la palette reste stable.

## Étape 2 — INTÉGRATION (sur les images rendues)

0. **Thumb (local, aucune génération)** : miniature du menu = réduction de la
   skyline. `sips --resampleWidth 640 assets/maps/<key>/skyline.png --out
   assets/maps/<key>/thumb.png`. Câbler ensuite : ajouter `thumb: "thumb.png"`
   au `loadMapPack` de `initMap<Nom>` (`src/assets.js`) ET une branche
   `if (t.key === "<key>" && SPRITES.map<Nom> && spriteReady(SPRITES.map<Nom>.thumb))
   img = SPRITES.map<Nom>.thumb;` dans `drawTerrainMenuThumb` (`src/assets.js`).
   Sans cette branche, le menu retombe sur un fallback canvas générique.
1. **Déposer** les PNG bruts Grok (fond MAGENTA #FF00FF) dans `raw/maps/<key>/`,
   nommés **exactement** comme le fichier cible : `net_post.png`, `flag.png`,
   `<event>.png` (PAS de `warn.png`).
2. **Détourer** : `python3 tools/cutout.py raw/maps/<key> assets/maps/<key>`
   → chroma-key magenta auto-détecté (le blanc des drapeaux est préservé
   nativement). Ouvrir `assets/maps/<key>/_contact.png` : bords nets, aucun
   liseré magenta, objet entier. Regénérer si le fond n'était pas magenta uni.
   - **Plus besoin de `FLAG_KEEP_WHITE_MAPS`** : le chroma-key gère les drapeaux
     à bandes blanches nativement (la rustine reste dans le code mais est inerte
     sur les raws magenta).
   - **Prop d'event nouveau** (nom absent de `PROP_NAMES`) : l'ajouter à
     `PROP_NAMES` (`tools/cutout.py`) AVANT de lancer, sinon il est traité en perso.
   - **`net_post.png` obligatoire** après cutout :
     `python3 tools/genassets/fix_net_posts.py <key>` puis contrôler que le
     fût est droit et centré (voir contrat poteau ci-dessus).
3. **Manifest** (`assets/maps/<key>/manifest.json`) : le tableau `"props"` doit
   lister `net_post, flag, <event>` (pas `warn`), et `"event": "<nom>"`.
4. **Loader** (`src/assets.js`, `initMap<Nom>` / `loadMapPack`) : ajouter la ligne
   `<prop>: "<fichier>.png"` dans l'objet passé à `loadMapPack`.
5. **Rendu** (`src/terrains.js`) : câbler le dessin.
   - `flag`/`net_post` : la plupart des `drawMap<Nom>` dessinent déjà `p.flag`
     via `drawMapProp(p.flag, x, GROUND_Y+2±bob, ~96)` — reprendre le gabarit
     d'une map voisine pour placer le nouveau prop. (Le rendu est souvent déjà
     gaté sur `spriteReady(p.<prop>)` → il s'active tout seul dès le PNG présent.)
     Le poteau est dessiné par `drawNet()` (centre du PNG = `NET_X`) — d'où
     l'obligation de fût centré dans le fichier.
   - Prop d'**event** : passer par la gate déterministe `mapEventsCanStep`
     (jamais en pause/service/point), cf. `docs/PIPELINE-MAP.md` §5. Pas de
     `Math.random` non seedé.
6. **Vérifier** : `npm test` vert, puis préviz — miniature au menu, prop posé au
   sol au bon endroit, à l'échelle, sans halo, **poteau droit sur la médiane**,
   event uniquement en `play`. Screenshot du rendu réel.

## Références

`sommet-map` (intégrer la skyline en amont) · `docs/PIPELINE-MAP.md` (contrat
props/events) · `docs/STYLE-REFERENCE.md` (style) · `docs/FICTIONNALISATION.md`
(Steam) · `tools/cutout.py` (`PROP_NAMES`, `FLAG_KEEP_WHITE_MAPS`) ·
`tools/genassets/fix_net_posts.py` (recentrage poteaux).
