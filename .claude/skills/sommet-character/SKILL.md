---
name: sommet-character
description: >
  Intègre un nouveau personnage (dirigeant caricaturé) dans le jeu Sommet Volley.
  Pipeline pixels : Grok crée l'ANCRE d'identité (idle_0 / idle_1 / idle_face_0),
  puis Codex CLI dérive les 26 autres poses par LOTS de 3–4 (référence image +
  LOCK identité), fond MAGENTA chroma-key — une session Codex à la fois. Ensuite
  INTÉGRATION : détourage, manifest (idle:2 walk:4), roster CHARACTERS, vérif.
  Utiliser dès qu'on veut ajouter, remplacer, ou regénérer un perso.
---

# sommet-character — ajouter/intégrer un personnage

Découpage pixels : **Grok = identité (1 ancre)** → **Codex = poses dérivées
(lots de 3–4)** → **ce skill = intégration fiable**. Ne plus faire générer les
27 frames une par une par Grok (identité dérive) ; ne plus lancer Codex sur les
26 d’un coup sans lots (trop lent / risque de dérive).

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

### Cycle `walk` — 4 frames DISTINCTES (LE point qui rate le plus souvent)

Le moteur charge `walk_0..3` (`manifest.anims.walk: 4`, défaut code aussi **4**)
et avance `walkPhase` d'1 toutes les 6 ticks → les 4 images sont jouées en boucle.
Si les 4 se ressemblent → marche « gelée » / tremblote : **rejeter**.

**Générer le lot `walk` ensemble** (4 frames). Chaque frame a sa propre
description de jambes — **ne JAMAIS** écrire « walking pose » / « mid-stride »
identique 4 fois. Exagérer le cartoon (jambes bien écartées vs collées).

| frame | rôle | `<POSE JAMBES>` (vue de côté, face à DROITE) — obligatoire VERBATIM |
|-------|------|---------------------------------------------------------------------|
| `walk_0` | **APPUI A** | `WIDE stride: LEFT foot planted FLAT far FORWARD, RIGHT leg stretched far BACK (toe down), clear gap between feet, RIGHT arm swung FORWARD, left arm back` |
| `walk_1` | **PASSAGE** | `PASSING pose ONLY: BOTH legs CLOSE together under the body, feet nearly SIDE-BY-SIDE / overlapping silhouette, knees soft, NOT a wide stride, arms near torso (neutral)` |
| `walk_2` | **APPUI B** | `WIDE stride MIRROR of walk_0: RIGHT foot planted FLAT far FORWARD, LEFT leg stretched far BACK, clear gap between feet, LEFT arm swung FORWARD, right arm back` |
| `walk_3` | **PASSAGE** | `PASSING pose again: legs CLOSE together under body (like walk_1), but arms OPPOSITE to walk_1; still NOT a wide stride` |

🚫 **INTERDIT** :
- 4× le même demi-pas (le défaut n°1) — si `walk_0`≈`walk_1`≈`walk_2`≈`walk_3` → **rejeter le lot**
- `walk_1` / `walk_3` en stride large (pieds écartés) — ce n'est PAS un passage
- `walk_0` et `walk_2` avec le **même** pied devant
- pose idle / debout / geste signature / saut

✅ **QA walk OBLIGATOIRE** (ouvrir les 4 PNG côte à côte, ou `_contact.png`) :
1. Silhouette `walk_0` ≠ `walk_2` : pied **gauche** devant vs pied **droit** devant (miroir).
2. Silhouette `walk_1` et `walk_3` : jambes **collées** (écart pieds << stride) — si on voit un grand écart = échec.
3. En lecture rapide 0→1→2→3→0 : on doit lire clairement **appui → passage → appui opposé → passage**.
4. **Heuristique post-cutout** : largeur canvas `walk_1`/`walk_3` ≪ `walk_0`/`walk_2`
   (ex. ~200 px vs ~380–400 px). Si les 4 largeurs sont proches → lot trop homogène, **rejeter**.
→ Échec → **regénérer le lot walk** (ou frames fautives) via Codex, même `-i` ancre
(`idle_1` de préférence). Prompt type : `raw/cygne/_regen_walk_fix.md` /
`raw/<key>/_regen_walk_only.md` — forcer les mots `WIDE stride` / `PASSING` /
`feet nearly SIDE-BY-SIDE` / `MIRROR`.

Contraintes communes à TOUTES les frames : même personnage (même visage, coupe,
**tenue exacte du casting / de l’ancre**), couleurs ; **vue de côté face à DROITE**
(sauf `idle_face` de face) ; corps ENTIER tête→pieds, pieds visibles, échelle et
cadrage constants ; contours noirs épais, cel shading ; **fond MAGENTA uni
#FF00FF** (chroma key, JAMAIS blanc), aucune ombre portée, aucun texte. Style =
`docs/STYLE-REFERENCE.md` (grosse tête ~1/3, corps trapu chibi).

🚫 **Le perso est SEUL — aucun objet, aucune balle.** Même pour
`receive`/`aim`/`smash` : **mains vides**. Pas d’accessoire tenu, sol, filet.

---

## Étape 0 — RÉSOUDRE le perso (casting = source de vérité)

Invoqué avec un nom (`/sommet-character volkoi`, `safran`, …), l'agent :

1. **Résout la clé** : cherche dans `tools/genassets/casting.py` → `CHARACTERS`
   par `key`, `name` (insensible à la casse / accents) ou alias évident.
   La **clé technique** = dossier `raw/<key>/` + `assets/<key>/`.
2. **Lit le `look` VERBATIM** + `name` / `nation`. Ce texte EST `<ARCHÉTYPE>`.
3. **Ne réécrit PAS la tenue.** Si c'est dans le `look`, c'est **voulu**.
4. Si le `look` est absent ou trop vague → **compléter `casting.py` d'abord**,
   puis seulement générer.
5. Fiche miroir : aligner `docs/chars/<key>.yaml` sur le même look / nom.

> **Fictionnalisation ≠ libre-échange à la génération.** Casser les marqueurs
> d'un vrai dirigeant se fait **dans le casting**. Ensuite le skill **obéit**.

---

## Étape 1 — GÉNÉRATION pixels (Grok → Codex)

### 1A — Grok : ancre d’identité = `idle_1`

**Grok génère UNE image** (idéalement `idle_1` : debout repos, côté face à droite,
corps entier, fond MAGENTA #FF00FF) et l’enregistre dans
`raw/<key>/idle_1.png` (puis cutout partiel ou copie vers `assets/<key>/idle_1.png`
après QA visuelle).

Cette image est la **vérité d’identité** (visage, cheveux, tenue, proportions,
échelle, trait). Tout le reste en découle.

Optionnel : Grok peut aussi poser `idle_face_0` (portrait face) si on veut valider
le look menu avant les lots Codex — sinon Codex le dérive du lot 1.

Prompt Grok (ancre) = bloc FIXE + `<ARCHÉTYPE>` (= `look` verbatim) + pose idle :

```
ONE single HUMAN cartoon MAN, chibi political caricature, VERY big head and
small stocky body, super-deformed cute proportions, FULL BODY from head to
shoes, feet visible, EMPTY HANDS, the character ALONE with NO ball and NO other
object, thick even black ink outlines, clean flat cel shading, flat color fills,
<ARCHÉTYPE>, OUTFIT LOCK: wear EXACTLY the clothes described above, standing
idle at rest facing right, consistent character, isolated on a SOLID FLAT PURE
MAGENTA #FF00FF chroma-key background (uniform magenta, fills the whole frame),
no ground shadow, no text.
```

Suffixe Steam en fin de `<ARCHÉTYPE>` :
`(composite mascot archetype — must NOT resemble any real politician)`.

Négatif : `ball, volleyball, sports ball, any ball, held object, prop, equipment,
furniture, net, ground, floor, photorealism, 3d render, sketch, painterly, soft
shading, animal, cat, furry, anthropomorphic, mascot costume, gradient background,
textured background, scenery background, white background, cropped limbs, text,
watermark, recognizable real politician, real person likeness, real national flag,
national emblem, brand logo, religious symbol, wrong outfit, formal business suit
(unless look says suit)`.

⚠️ Fictionnalisation / Steam : détail dans `docs/FICTIONNALISATION.md`. Si le
rendu est immédiatement identifiable → regénérer l’ancre (exagérer chibi),
**sans changer la tenue du casting**.

✅ **QA ancre** avant Codex : tenue = casting, fond magenta, pieds visibles,
échelle OK, Steam OK. Sinon refaire Grok — ne pas empiler 26 poses sur une
mauvaise ancre.

### 1B — Codex CLI : dériver les autres poses par lots de 3–4

**Ancre LOCK** (choisie par l’utilisateur / l’agent) = **une** de :
`idle_0` | `idle_1` | `idle_face_0`. Joindre **cette** image (`-i`).
**Ne jamais écraser l’ancre** (ni raw ni assets).

| Ancre | Frames à générer (26) | Lot 1 adapté |
|-------|------------------------|--------------|
| `idle_1` | tout sauf `idle_1` | `idle_face_0`, `idle_0` |
| `idle_0` | tout sauf `idle_0` | `idle_face_0`, `idle_1` |
| `idle_face_0` | tout sauf `idle_face_0` | `idle_0`, `idle_1` (corps entier dérivés du visage + tenue visible / casting) |

Si l’ancre est `idle_face_0` (buste face) : les poses corps = **même visage /
cheveux / tenue**, vue côté face à droite, proportions chibi cohérentes — ne
pas inventer une autre tête.

Écrire `raw/<key>/_regen_codex_prompt.md` (ex. `raw/dorf/`, `raw/faucon/`),
puis **une session Codex par perso** (ne pas paralléliser 2+ gens image — rate
limit / WS drop). Lots **séquentiels** dans la session :

```bash
codex exec \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -C "$(pwd)" \
  -i "assets/<key>/<ANCRE>.png" \
  - \
  < "raw/<key>/_regen_codex_prompt.md"
```

**Resume** (si coupure mid-flight) — **pas de `-C`** sur `resume` :

```bash
codex exec resume <session_id> \
  --dangerously-bypass-approvals-and-sandbox \
  --skip-git-repo-check \
  -i "assets/<key>/<ANCRE>.png" \
  - <<'EOF'
…lots restants + rappel LOCK…
EOF
```

Récupérer `session id:` dans le log. Relancer seulement les lots manquants ;
copier d’abord les PNG déjà générés dans `~/.codex/generated_images/<session>/`.

#### Lots canoniques (3–4 frames) — ordre fixe

| lot | fichiers | notes |
|-----|----------|--------|
| 1 | selon ancre (table ci-dessus) | Manifest final `idle: 2` |
| 2 | `walk_0`..`walk_3` | **critique** — QA walk avant de continuer |
| 3 | `jump_0`..`jump_2` | |
| 4 | `receive_0`, `receive_1`, `aim_0`, `aim_1` | mains vides |
| 5 | `smash_0`..`smash_2` | main ouverte, pas de balle |
| 6 | `super_0`..`super_3` | |
| 7 | `panic_0`, `panic_1`, `victory_0`, `victory_1` | |
| 8 | `defeat_0`, `defeat_1` | puis cutout global |

Après **chaque lot** : `cp` → `raw/<key>/`, contact sheet, QA. Frame
fautive → **regénérer le lot** (même `-i` ancre), pas tout le set.

#### LOCK identité (à coller dans chaque prompt Codex)

- Même perso que la référence jointe : visage, cheveux, **tenue EXACTE**
  (celle de l’ancre, pas une « amélioration » casting), proportions, trait.
- Fond MAGENTA #FF00FF, perso SEUL, mains VIDES, face à DROITE (sauf
  `idle_face` = FACE), corps entier tête→pieds (sauf portrait).
- Une image = une pose = `raw/<key>/<anim>_<n>.png`.

Quand les 26 + ancre sont là → cutout (étape 2). Forcer `idle: 2`, `walk: 4`
dans le manifest (Codex laisse parfois `idle: 1`).

### Regen d’un perso existant (cohérence)

Sans Grok si l’ancre est bonne : `-i` sur l’ancre choisie, lots 1→8, cutout.
Ex. Dorf (`idle_1`), Faucon (`idle_0`). File d’attente multi-persos =
**séquentielle** (un `codex exec` à la fois).

---

## Étape 2 — INTÉGRATION (sur les 27 PNG rendus)

1. **Vérifier** que `raw/<key>/` contient les 27 frames (noms exacts). Manquantes
   → regénérer le lot concerné AVANT d'intégrer.
2. **Détourer** : `python3 tools/cutout.py raw/<key> assets/<key>` → alpha,
   ancrage pieds, planche `_contact.png` (halo, pieds, **tenue stable**,
   identité). **Ne pas écraser `idle_1`** si le raw idle_1 est l’ancienne ancre
   volontairement figée — sinon re-cutouter aussi idle_1 depuis raw.
3. **manifest** `assets/<key>/manifest.json` : bloc `anims` canonique
   (`idle_face` 1, **`idle` 2**, **`walk` 4**, jump 3, receive 2, aim 2,
   smash 3, super 4, panic 2, victory 2, defeat 2) + `baseH: 110`, `footPad: 2`,
   `lockAspect`, `serveHands` (calquer `assets/cygne/manifest.json`).
   ⚠️ Codex peut laisser `idle: 1` — **corriger à 2** si `idle_0` + `idle_1`
   existent.
4. **Roster** : entrée dans `CHARACTERS` (`src/state.js`) — `key`, `name`,
   `color`/`darkColor`, `stats`, multiplicateurs, `trait`, `superName`,
   `superDesc`.
5. **Story/sélection** : `idle_face` → portrait Histoire + sélection.
6. **Vérifier** : `npm test` + préviz marche/saut/smash/super, pieds au sol,
   pas de halo, **même tenue** partout.

## Références

`docs/PIPELINE-PERSONNAGE.md` · `docs/PIPELINE-ASSETS.md` · `docs/STYLE-REFERENCE.md`
· `docs/FICTIONNALISATION.md` · casting : `tools/genassets/casting.py`
· exemple prompt Codex : `raw/dorf/_regen_codex_prompt.md`.
