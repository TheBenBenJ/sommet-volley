---
name: sommet-character
description: >
  Intègre un nouveau personnage (dirigeant caricaturé) dans Sommet Volley.
  Pipeline en DEUX étapes : (1) Grok = identité + quelques PNG d'ancrage
  (idle_1, idle_face, idle, poses de référence) ; (2) Gemini/Sora = 10 clips
  vidéo → WebM VP9+alpha (prompts préparés par l'agent, conversion
  tools/mp4_to_char_webm.py). Puis INTÉGRATION manifest/roster. Utiliser dès
  qu'on veut ajouter, remplacer, ou regénérer un perso (surtout ses anims vidéo).
---

# sommet-character — ajouter/intégrer un personnage

Pipeline canon **2026** :

1. **Grok** → identité + **quelques** images PNG (ancre + menus + refs pose)
2. **Gemini** (ou Sora) → **10 vidéos** gameplay → conversion **WebM alpha**
3. **Intégration** code / manifest / roster

Ne plus générer les 27 PNG une par une via Grok, ni dériver tout le set via
Codex par défaut. Les PNG restent un **filet** (menus + fallback si WebM KO) ;
le gameplay lit d'abord les WebM (`src/char-sprites.js`).

---

## Ce qu'attend le moteur

### Vidéos (priorité rendu)

`assets/<key>/manifest.json` → bloc `"videos"` :

| clé anim | fichier typique |
|----------|-----------------|
| `idle` `walk` `jump` `receive` `aim` `smash` `super` `panic` `victory` `defeat` | `<anim>.webm` |

- WebM **VP9 + alpha** (ou MP4 fond magenta → `tools/mp4_to_char_webm.py`)
- `idle_face` = **PNG seulement** (menus / dialogues) — pas de vidéo
- Optionnel : `"walkIntroSec": N` si le walk.webm commence par une intro idle

### PNG (toujours requis pour le pick d'anim)

`charPickAnim` ne choisit une anim que si les PNG de cette anim sont chargés
(`charAnimReady`). Ensuite `drawSpriteChar` préfère la **vidéo** si prête.

Donc après les WebM : soit un pack PNG complet, soit des **stills extraites**
des WebM pour remplir `anim_0..n-1` (voir étape 2C). Minimum absolu menus :
`idle_face_0` + `idle_0` + `idle_1`.

Structure PNG de référence (`CHAR_ANIM_DEFAULTS`) :

| anim | frames | notes |
|------|:--:|---|
| `idle_face` | 1 | FACE, buste (menus) |
| `idle` | 2 | côté, face DROITE |
| `walk` | 4 | appui / passage / appui / passage |
| `jump` | 3 | |
| `receive` `aim` | 2 | mains VIDES |
| `smash` | 3 | main ouverte, pas de balle |
| `super` | 4 | signature (`superName`) |
| `panic` `victory` `defeat` | 2 | |

Contraintes visuelles communes : fond **MAGENTA #FF00FF**, perso **SEUL**,
mains **VIDES**, côté face **DROITE** (sauf `idle_face`), grosse tête ~1/3,
tenue = casting. Style : `docs/STYLE-REFERENCE.md`. Fiction : `docs/FICTIONNALISATION.md`.

---

## Étape 0 — RÉSOUDRE le perso (casting = source de vérité)

Invoqué avec un nom (`/sommet-character timonier`, `volkoi`, …) :

1. Résoudre la **clé** dans `tools/genassets/casting.py` → `CHARACTERS`
   (`key` / `name` / alias).
2. Lire le `look` **VERBATIM** (+ `name` / `nation`) → c'est `<ARCHÉTYPE>`.
3. **Ne pas réécrire la tenue.** Compléter `casting.py` d'abord si le look
   est vague.
4. Aligner `docs/chars/<key>.yaml` sur le même look / nom.

---

## Étape 1 — GROK : identité + quelques images

**But** : verrouiller le perso une fois pour toutes, pas produire les 27 frames.

### Set minimal (obligatoire)

| fichier | rôle |
|---------|------|
| `idle_1.png` | **LOCK identité** (côté droite, corps entier, magenta) |
| `idle_face_0.png` | portrait FACE menus / Histoire |
| `idle_0.png` | 2ᵉ frame idle (variation légère) |

### Set utile (recommandé — refs pour Gemini)

Une image par geste, côté droite, magenta — sert de « ton de pose » joint au
prompt vidéo (pas besoin d'un cycle walk 4 frames ici) :

`walk_0`, `jump_0`, `receive_0`, `aim_0`, `smash_0`, `super_0`,
`panic_0`, `victory_0`, `defeat_0` (au choix, 3–6 refs suffisent).

Enregistrer dans `raw/<key>/`, puis :

```bash
python3 tools/cutout.py raw/<key> assets/<key>
```

Ne **jamais écraser** une bonne `idle_1` déjà validée.

### Prompt Grok (ancre `idle_1`)

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

Suffixe Steam : `(composite mascot archetype — must NOT resemble any real politician)`.

Négatif type : ball, props, photorealism, 3D, white/gradient background, real
politician likeness, real flags, wrong outfit, cropped limbs, text, watermark.

✅ **QA ancre** avant toute vidéo : tenue = casting, magenta, pieds visibles,
échelle OK, Steam OK. Sinon refaire Grok.

Pour `idle_face` : même identité, **buste de FACE**, grosse tête, magenta.
Pour les refs pose : même LOCK, une pose = une image (descriptions dans l'étape 2).

---

## Étape 2 — GEMINI : vidéos WebM (cœur gameplay)

L'agent **prépare les 10 prompts remplis** (look casting + règles communes) et
les donne à l'utilisateur. L'utilisateur génère dans Gemini (ou Sora) → MP4.
L'agent convertit / câble.

### 2A — Images à joindre (chaque génération)

1. `assets/<key>/idle_1.png` — **LOCK identité** (obligatoire)
2. (optionnel) `assets/<key>/<anim>_0.png` — ton du geste seulement
3. (optionnel) `idle_face_0.png` si le modèle dérive trop

### 2B — Kit de prompts (l'agent sort le kit COMPLET, déjà rempli)

Coller en tête de **chaque** prompt le bloc commun, avec `<LOOK>` = `look`
casting verbatim :

```
Using the attached image(s) as absolute IDENTITY LOCK (image 1 = character truth),
generate ONE short looping character animation video for a 2D cartoon volleyball game.

Character lock — match image 1 EXACTLY:
<LOOK>
(composite mascot archetype — must NOT resemble any real politician)

Style / framing (mandatory):
- Thick black ink outlines, flat cel shading, chibi oversized head ~1/3 height
- Side view facing RIGHT, FULL BODY head→shoes, feet visible
- EMPTY HANDS — NO ball, NO props, character ALONE
- Solid flat PURE MAGENTA #FF00FF chroma-key background (uniform, whole frame)
- No ground, no shadow, no text, no watermark
- Locked camera: NO zoom, NO pan, constant scale/framing
- Seamless loop: last frame ≈ first frame, NO hard cut, NO fade to black
- Duration: 1.2–2.0 seconds, ~24fps
- Prefer WebM VP9+alpha; if unavailable export MP4 with perfect flat #FF00FF magenta

Negative: real politician likeness, real flags, photorealism, 3D render, white
background, ground plane, camera move, volleyball, audience, captions, wrong outfit.
```

Puis **un prompt = une anim** (ordre recommandé) :

| # | slot moteur | Animation: … (corps du prompt) |
|---|-------------|--------------------------------|
| 1 | `idle` | IDLE — standing at rest facing right, tiny breathing / weight shift, gentle arm settle. Hands empty. No walking. Loop. |
| 2 | `walk` ← **RUN** | **RUN (recommandé)** — voir prompt dédié ci-dessous. Le moteur n’a qu’une clé `walk` ; `playbackRate` ralentit/accélère la vidéo (marche ↔ sprint). Brancher le MP4 sur `walk.webm`. |
| 3 | `jump` | JUMP — crouch → launch → apex → start of fall → loop to crouch. Full body in frame. |
| 4 | `receive` | RECEIVE / dig — arms joined low (forearm platform), knees soft, tiny ready bounce. EMPTY hands, NO ball. |
| 5 | `aim` | AIM / set — both open hands raised above head, looking up, small ready pulse. EMPTY hands, NO ball. |
| 6 | `smash` | SMASH (air attack) — arm cocked high → strike swing → follow-through, body in air, open empty hand, NO ball. Loop to cocked. |
| 7 | `super` | SUPER — dramatic signature for this character's `superName` (outfit LOCK), readable silhouette, short flourish, loop. EMPTY hands. Adapter le geste au super (ex. Rempart, Hiver…). |
| 8 | `panic` | PANIC — lean back, both arms up, startled bounce, loop. |
| 9 | `victory` | VICTORY — arms raise celebration, small bounce, loop. |
| 10 | `defeat` | DEFEAT — shoulders drop, head hangs, slight sway, loop. |

#### Prompt RUN (slot `walk` — à privilégier)

```
…[bloc commun]…
Animation: RUN cycle facing right — energetic cartoon sprint loop.
Clear LEFT-foot-forward stride → passing (legs close) → RIGHT-foot-forward
→ passing again. Big arm pump opposite to legs, forward lean, feet leave
ground briefly each step. Continuous seamless loop (NO idle intro, NO walk-to-run
transition, NO stop). EMPTY hands, NO ball.
Filename intent: run.mp4  (will be converted to walk.webm)
```

Fallback seulement si RUN trop extrême pour le perso :

```
…[bloc commun]…
Animation: WALK cycle facing right — LEFT-foot-forward → passing → RIGHT-foot-forward
→ passing. Exaggerated cartoon steps, arms opposite legs. Continuous loop
(no idle intro). Filename intent: walk.mp4
```

> Dorf : parfois `walk` = intro idle 0–2 s + course → alors
> `"walkIntroSec": 2` dans le manifest. **Nouveau perso : préférer RUN pur
> sans intro** (plus simple, boucle propre).

`Filename intent: <anim>.mp4` / `run.mp4` (ou préfixe Gemini `Animation_RUN_…` /
`Animation_<ANIM>_…`).

Documenter le mapping dans `raw/<key>/_video_map.md` (ex. `raw/volkoi/_video_map.md`).

### 2C — Conversion MP4 → WebM (+ PNG fallback)

Quand les fichiers sont dans `~/Downloads` :

> Préférer renommer en `<key>_<anim>.mp4` (ex. `timonier_run.mp4`) si
> plusieurs persos coexistent dans Downloads — les noms Gemini
> `Animation_RUN_…` / `Animation_WALK_…` sont ambigus (premier match gagne).
>
> Pour le slot **walk**, le batch accepte aussi `<key>_run.mp4` /
> `Animation_RUN_*.mp4` → écrit `walk.webm` (priorité RUN > WALK).

```bash
# Batch générique (<key>_<anim|run>.mp4 ou Animation_<ANIM|RUN>_*.mp4)
python3 tools/mp4_to_char_webm.py --batch <key>

# Ou unitaire (RUN → walk.webm)
python3 tools/mp4_to_char_webm.py ~/Downloads/<key>_run.mp4 assets/<key>/walk.webm
```

Le batch copie aussi vers `raw/<key>/<key>_<anim>.mp4` (gitignoré ; run →
`raw/<key>/<key>_run.mp4` + `walk.webm`).

**PNG fallback** (si pack PNG incomplet) : extraire N stills espacées de chaque
WebM vers `assets/<key>/<anim>_0.png` … pour satisfaire `charAnimReady`, **sans
écraser** `idle_1` / `idle_face_0` déjà validés par Grok. Ex. :

```bash
# N = compteur manifest (walk→4, jump→3, …)
ffmpeg -y -i assets/<key>/walk.webm -vf "fps=4" /tmp/w_%02d.png
# puis copier / renommer les N meilleures en walk_0..n-1 (cutout si besoin)
```

Ou régénérer les stills manquants via Grok (refs), pas via Codex par défaut.

### 2D — Manifest vidéos

Dans `assets/<key>/manifest.json` :

```json
"videos": {
  "idle": "idle.webm",
  "walk": "walk.webm",
  "jump": "jump.webm",
  "receive": "receive.webm",
  "aim": "aim.webm",
  "smash": "smash.webm",
  "super": "super.webm",
  "panic": "panic.webm",
  "victory": "victory.webm",
  "defeat": "defeat.webm"
}
```

Ajuster `lockAspect` à la largeur moyenne des WebM (évite le « pulse »).
Si le walk a une intro idle : `"walkIntroSec": 2` (comme Dorf).

---

## Étape 3 — INTÉGRATION roster

1. PNG menus + stills / pack fallback OK ; 10 WebM présents.
2. `manifest.json` : `anims` canoniques + `videos` + `baseH` / `footPad` /
   `lockAspect` / `serveHands` (calquer `assets/cygne/manifest.json`).
3. Roster `CHARACTERS` dans `src/state.js` : `key`, `name`, couleurs, stats,
   `trait`, `superName`, `superDesc`.
4. Story / sélection : `idle_face` pour portraits.
5. Vérif : hard refresh navigateur Chromium (WebM VP9+alpha), marche / saut /
   smash / super, pieds au sol, pas de halo magenta, **même tenue**.
6. `npm test`.

---

## Regen / cas particuliers

| Besoin | Action |
|--------|--------|
| Nouveau perso | Étapes 0 → 1 → 2 → 3 |
| Remplacer les anims (ex. Volkoï, Timonier) | Étape 2 seulement (LOCK = `idle_1` existante) |
| Corriger une seule anim | 1 prompt Gemini + convert unitaire |
| Fallback PNG sans vidéo (Safari / debug) | Pack PNG ; Codex lots **optionnel** (legacy, voir ci-dessous) |

### Legacy optionnel — Codex 27 PNG

Uniquement si on veut un pack PNG complet sans vidéos, ou regen walk 4 frames
pixel-perfect. Voir anciens prompts `raw/<key>/_regen_codex_prompt.md` /
`raw/dorf/_regen_codex_prompt.md`. **Une** session Codex à la fois, lots 3–4,
ancre `-i assets/<key>/idle_1.png`. Ce n'est **plus** le chemin par défaut.

---

## Checklist agent (quand l'utilisateur demande un perso)

- [ ] Casting résolu, look verbatim
- [ ] Kit prompts Gemini **rempli** (10 blocs) remis à l'utilisateur + images à joindre
- [ ] Après MP4 : `--batch <key>`, `_video_map.md`, bloc `videos` + `lockAspect`
- [ ] PNG menus + fallback stills si besoin
- [ ] Roster / tests si perso nouveau

## Références

- Conversion : `tools/mp4_to_char_webm.py`
- Exemples mapping : `raw/volkoi/_video_map.md`, `raw/dorf/_video_map.md`
- Casting : `tools/genassets/casting.py`
- Style / fiction : `docs/STYLE-REFERENCE.md`, `docs/FICTIONNALISATION.md`
- Runtime : `src/char-sprites.js` (`loadCharVideos`, `drawSpriteChar`)
