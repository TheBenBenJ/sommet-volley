---
name: sommet-character
description: >
  Intègre un nouveau personnage (dirigeant caricaturé) dans le jeu Sommet Volley.
  L'agent capable de générer des images (Grok — c'est lui qui a fait tout le
  roster actuel) génère le JEU DE POSES COMPLET (27 frames, EXACTEMENT la même
  structure que les persos existants) via le PROMPT canon (chibi grosse-tête,
  look casting VERBATIM y compris la tenue, fictionnalisé Steam-friendly, fond
  MAGENTA chroma-key), puis exécute l'INTÉGRATION : détourage, manifest, entrée roster
  CHARACTERS, portraits/sélection, vérif. Utiliser dès qu'on veut ajouter ou
  remplacer un perso.
---

# sommet-character — ajouter/intégrer un personnage

Découpage : **Grok génère les pixels, ce skill fait l'intégration fiable.** Tout
le roster actuel a été généré avec Grok — un nouveau perso se génère PAREIL.

## Ce qu'attend le moteur (ne pas deviner — c'est vérifié)

Un perso = **un jeu de poses complet, IDENTIQUE pour tous** (`src/char-sprites.js`
lit ces anims, `charPickAnim` choisit selon l'état). Fichiers
`assets/<key>/<anim>_<n>.png` (n commence à 0). Structure canonique (celle de
TOUS les persos, ex. `assets/cygne/`) :

| anim | frames | fichiers | action (vue de CÔTÉ, face à droite) |
|------|:--:|---|---|
| `idle_face` | 1 | `idle_face_0` | portrait de FACE, buste, grosse tête (menus/dialogues) |
| `idle` | 2 | `idle_0..1` | debout au repos, léger balancement |
| `walk` | 4 | `walk_0..3` | cycle de marche 4 poses distinctes (appui/passage/appui opposé/passage) — voir ci-dessous |
| `jump` | 3 | `jump_0..2` | 0 = flexion/décollage, 1 = montée, 2 = sommet/descente |
| `receive` | 2 | `receive_0..1` | réception : bras joints bas devant (manchette), **mains VIDES** |
| `aim` | 2 | `aim_0..1` | mains levées ouvertes au-dessus de la tête, regard vers le haut (comme pour recevoir/passer), **SANS balle** |
| `smash` | 3 | `smash_0..2` | attaque sautée : armé bras haut / frappe / accompagnement (en l'air), **main ouverte, AUCUNE balle** |
| `super` | 4 | `super_0..3` | pose spéciale dramatique (le `superName` du perso) |
| `panic` | 2 | `panic_0..1` | surpris, bras en l'air, penché en arrière |
| `victory` | 2 | `victory_0..1` | célébration, bras levés |
| `defeat` | 2 | `defeat_0..1` | abattu, épaules basses |

= **27 frames** (walk = 4). ⚠️ **Tout ou rien** : un set PARTIEL (ex. juste `idle_face`)
FIGE le perso sur cette image en jeu — pire que rien (sans sprites, le moteur
tombe sur le blob canvas animé). Générer les 27, ou aucun.

### Cycle `walk` — 4 frames distinctes (LE point qui rate le plus souvent)

Le moteur charge `walk_0..3` (`manifest.anims.walk: 4`, défaut code aussi **4**)
et avance `walkPhase` d'1 toutes les 6 ticks → les 4 images sont jouées en boucle.
**Échec récurrent de Grok** : il sort 2 vraies enjambées + 2 poses debout (ou 2×
le même pied) → la marche « saute » / n'alterne pas. Pour l'éviter :

**Générer chaque frame walk SÉPARÉMENT avec sa propre description de jambes** (ne
JAMAIS écrire « walking » 4 fois). Un prompt par frame = bloc de base +
`<POSE JAMBES>` ci-dessous :

| frame | `<POSE JAMBES>` (vue de côté, face à DROITE) — obligatoire |
|-------|-----------------------------------------------------------|
| `walk_0` | `LEFT foot planted flat forward, right leg stretched back behind, clear stride, right arm swung forward` |
| `walk_1` | `both legs close together passing under the body mid-step, feet nearly together, arms near neutral` |
| `walk_2` | `RIGHT foot planted flat forward, left leg stretched back (mirror of walk_0), left arm swung forward` |
| `walk_3` | `both legs close together passing under the body, arms opposite to walk_1` |

🚫 **INTERDIT dans les 4 frames walk** : pose debout/immobile, pieds côte à côte au
repos, geste de bras signature (pouce levé, salut, bras croisés), saut. Ce sont des
poses de MARCHE, jambes en mouvement.

✅ **QA walk OBLIGATOIRE avant d'intégrer** (sinon Dorf-effet) :
1. `walk_0` et `walk_2` = pieds **OPPOSÉS** (gauche devant vs droite devant), pas
   le même pied 2×.
2. `walk_1` et `walk_3` = jambes **rapprochées** (passage), PAS une pose debout.
3. Aucune des 4 n'est une pose statique/geste.
→ Si un critère échoue, **regénérer la ou les frames fautives** (frame par frame),
ne pas intégrer un cycle bancal. Contrôle visuel : monter les 4 côte à côte, les
jambes doivent raconter gauche→passage→droite→passage.

Même personnage, même tenue, même échelle, pieds visibles sur les 4.

Contraintes communes à TOUTES les frames : même personnage (même visage, coupe,
**tenue exacte du casting**, couleurs) ; **vue de côté face à DROITE** (le moteur
mirroir pour le camp gauche) sauf `idle_face` de face ; corps ENTIER tête→pieds,
pieds visibles, échelle et cadrage constants d'une frame à l'autre ; contours
noirs épais, aplats plats (cel shading) ; **fond MAGENTA uni #FF00FF** (chroma key,
JAMAIS blanc), aucune ombre portée, aucun texte. Style de réf = cast Micron (`docs/STYLE-REFERENCE.md`) :
grosse tête ~1/3, corps trapu chibi. **La cohérence vient de la description FIXE
du perso (`look` casting), répétée à l'identique dans chaque prompt** (Grok ne
prend pas d'image de référence — c'est le texte identique qui tient l'identité).

🚫 **Le perso est SEUL — aucun objet, aucune balle.** La balle de volley est un
objet du **moteur** (dessiné séparément) : elle ne doit JAMAIS être dans le sprite.
Même pour `receive`/`aim`/`smash`, le perso **mime** le geste **mains vides**.
Aussi : pas d'accessoire tenu, pas de mobilier, pas de sol, pas de filet — juste
le personnage détouré.

---

## Étape 0 — RÉSOUDRE le perso (casting = source de vérité)

Invoqué avec un nom (`/sommet-character volkoi`, `safran`, …), l'agent :

1. **Résout la clé** : cherche dans `tools/genassets/casting.py` → `CHARACTERS`
   par `key`, `name` (insensible à la casse / accents) ou alias évident
   (`volkoi` / `Volkoï` → `volkoi`). La **clé technique** (`volkoi`, `safran`…)
   = dossier `raw/<key>/` + `assets/<key>/`. Ne pas inventer une 2ᵉ clé.
2. **Lit le `look` VERBATIM** (champ `look` de l'entrée) + `name` / `nation`.
   Ce texte EST `<ARCHÉTYPE>`. Il inclut déjà silhouette + **tenue complète**.
3. **Ne réécrit PAS la tenue.** Costume / col montant / tunique / cravate :
   si c'est dans le `look`, c'est **voulu**. Ex. Volkoï = **overshirt bordeaux
   col montant + col roulé** — PAS de jogging/tracksuit, PAS chemise ouverte.
4. Si le `look` est absent ou trop vague → **compléter `casting.py` d'abord**
   (avec l'utilisateur si besoin), puis seulement générer. Jamais improviser
   une tenue pendant la gen.
5. Fiche miroir : aligner `docs/chars/<key>.yaml` sur le même look / nom.

> **Fictionnalisation ≠ libre-échange à la génération.** Casser les marqueurs
> d'un vrai dirigeant se fait **dans le casting** (une fois). Ensuite le skill
> **obéit** au casting. Ne pas « améliorer » le look en cours de gen.

---

## Étape 1 — GÉNÉRATION des 27 poses

**L'agent capable de générer des images (Grok) génère lui-même les 27 frames** et
les enregistre dans `raw/<key>/<anim>_<n>.png` (fond MAGENTA #FF00FF). Il NE renvoie PAS les
prompts à l'utilisateur. (Un agent sans génération d'images — ex. Claude Code —
remet le prompt canon + la table de poses à l'utilisateur.)

**Avant de lancer les 27** : coller une fois `<ARCHÉTYPE>` = `look` casting
**mot pour mot** (plus le suffixe Steam ci-dessous). Vérifier que la **tenue**
y figure en clair. Si l'utilisateur remarque une tenue « bizarre » (ex. « il
est en jogging ») → ce n'est un bug **que si** le casting dit autre chose ;
sinon rappeler le casting et proposer de **modifier `casting.py`**, pas de
tricher dans les prompts.

Base de prompt : bloc FIXE + `<ARCHÉTYPE>` (= `look` verbatim) + `<POSE>`
(colonne « action » du tableau) :

```
ONE single HUMAN cartoon MAN, chibi political caricature, VERY big head and
small stocky body, super-deformed cute proportions, FULL BODY from head to
shoes, feet visible, EMPTY HANDS, the character ALONE with NO ball and NO other
object, thick even black ink outlines, clean flat cel shading, flat color fills,
<ARCHÉTYPE>, OUTFIT LOCK: wear EXACTLY the clothes described above on EVERY
frame (do not switch to a suit, uniform, or other outfit), <POSE>, side view
facing right (except a front bust for the face portrait), consistent same
character and same scale across all frames, isolated on a SOLID FLAT PURE
MAGENTA #FF00FF chroma-key background (uniform magenta, fills the whole frame),
no ground shadow, no text.
```

> 🟪 **Fond MAGENTA #FF00FF obligatoire** (chroma key), PAS blanc. Raison : le
> détourage keye le magenta → le **blanc/clair des vêtements et cheveux est
> préservé** (le fond blanc les mangeait — chemises, kurta, cheveux blancs).
> Le magenta n'existe sur aucun perso (le violet du Sultan passe sous le seuil).

Suffixe Steam à ajouter **à la fin** de `<ARCHÉTYPE>` (sans toucher au look) :
`(composite mascot archetype — must NOT resemble any real politician)`.

Négatif : `ball, volleyball, sports ball, any ball, held object, prop, equipment,
furniture, net, ground, floor, photorealism, 3d render, sketch, painterly, soft
shading, animal, cat, furry, anthropomorphic, mascot costume, gradient background,
textured background, scenery background, white background, cropped limbs, text,
watermark, recognizable real politician, real person likeness, real national flag,
national emblem, brand logo, religious symbol, wrong outfit, formal business suit
(unless look says suit)`.

⚠️ **Fictionnalisation / Steam — dé-identification (au CASTING, pas à la gen).**
Le perso est un **archétype de RÔLE**, jamais un portrait reconnaissable. Test :
*« si on montre l'image, on ne doit PAS pouvoir nommer le vrai dirigeant. »*

Quand on **écrit / amende** une entrée `CHARACTERS` dans `casting.py` :

1. Type générique (« autocrate glacial », « tycoon fanfaron »…), pas le vrai nom.
2. **Casser la combinaison signature** : au moins **3** marqueurs différents du
   cliché réel (coiffure, pilosité, carrure, **tenue**, accessoire). Une tenue
   atypique (col montant, overshirt, pochette…) EST un bon levier — on la
   **garde** ensuite. Éviter les tenues qui redeviennent le cliché photo.
3. Déformation chibi assumée (grosse tête).
4. Interdits : drapeaux/emblèmes nationaux, symboles religieux, slogans réels.
5. Nation + `name` inventés.

Quand on **génère** : si le rendu est immédiatement identifiable → regénérer en
**exagérant le chibi** / le regard / les proportions, **sans changer la tenue
du casting**. Si la tenue elle-même est le problème Steam → amender `casting.py`
avec l'utilisateur, puis regénérer le set entier.

Détail dans `docs/FICTIONNALISATION.md`. Fond **magenta #FF00FF** obligatoire (sinon le
détourage échoue).

## Étape 2 — INTÉGRATION (sur les 27 PNG rendus)

1. **Vérifier** que `raw/<key>/` contient bien les 27 frames (noms exacts du
   tableau). S'il en manque → regénérer les manquantes AVANT d'intégrer.
2. **Détourer** : `python3 tools/cutout.py raw/<key> assets/<key>` → alpha
   anti-aliasé, ancrage pieds (hauteur normalisée), planche `_contact.png` à
   relire (halo, pieds, netteté, **tenue stable**, identité pose à pose).
3. **manifest** `assets/<key>/manifest.json` : bloc `anims` canonique (idle_face
   1, idle 2, walk 4, jump 3, receive 2, aim 2, smash 3, super 4, panic 2,
   victory 2, defeat 2) + `baseH: 110` (= `CHAR_BASE_H` dans `src/core.js` —
   référence d'échelle pour tous les props `PROP_H`), `footPad: 2`, `lockAspect`,
   `serveHands` (calquer sur `assets/cygne/manifest.json`).
4. **Roster** : entrée dans `CHARACTERS` (`src/state.js`) — `key`, `name`
   (fictif, aligné casting), `color`/`darkColor`, `stats`, multiplicateurs
   (`speed/jump/power/control`), `trait`, `superName`, `superDesc`.
5. **Story/sélection** : le portrait `idle_face` alimente `storyDrawPortrait`
   (mode Histoire) et l'écran de sélection ; vérifier net en menu.
6. **Vérifier** : `npm test` vert (+ test roster du perso) puis préviz — marche/
   saut/smash/super OK, pieds au sol, pas de halo blanc, **même tenue** sur
   toutes les poses.

## Références

`docs/PIPELINE-PERSONNAGE.md` · `docs/PIPELINE-ASSETS.md` · `docs/STYLE-REFERENCE.md`
· `docs/FICTIONNALISATION.md` · casting : `tools/genassets/casting.py`.
