---
name: sommet-event
description: >
  Câble l'ÉVÉNEMENT interactif de map et la MÉTÉO d'un terrain de Sommet Volley,
  de façon DÉTERMINISTE, en réutilisant les 5 archétypes d'events existants
  (crosser / rain / radar / cannon / flock). Skill 100 % CODE — aucune image :
  le PNG du prop de l'event est délégué à `sommet-decor` (fallback canvas en
  attendant). Donne la recette exacte (6 points de câblage), les règles de
  déterminisme et les tests à garder verts. Utiliser après sommet-map, quand un
  terrain existe et doit avoir son event + sa météo.
---

# sommet-event — événement de map + météo (déterministe)

Skill de **câblage code**. On ne crée PAS de nouvel archétype ici : on **réutilise**
un des 5 existants et on le branche sur un terrain. Le **prop visuel** (le paon, le
faucon…) est généré par `sommet-decor` ; ici on câble la logique + un **fallback
canvas** pour que l'event soit jouable/visible avant le PNG.

## Comment le moteur marche (vérifié — ne pas deviner)

- **Déterminisme** : tout tourne dans `stepGame` → `stepWeather()`
  (`src/simulation.js`) et `stepMapEvent()` (idem), avec le RNG **seedé** `rng()`.
  **JAMAIS `Math.random`** dans cette chaîne (casse l'egalité hôte/invité en ligne
  et le rejouable). Timestamps interdits (`Date.now`).
- **Gate** `mapEventsCanStep()` : un event ne trigge/avance QUE si `state==="play"`,
  pas en pause, pas pendant un Smash Battle, pas pendant le décompte `serveCountdown`.
  Hors gate, `abortMapEventInFlight()` coupe l'event en cours (sinon boulet figé au
  service). Toggle joueur `mapEventsQuiet` (touche C) = events off.
- **Machine à états** (`mapEvent.phase`) : `idle` → `warn` (`MAP_EVENT_WARN_T=120`
  t ≈ 2 s) → `fire` (`MAP_EVENT_FIRE_T=10` t) → `flying` → `scheduleNextMapEvent()`
  (retour idle, `timer` = 1200–2400 t ≈ 20–40 s ; premier via `resetMapEvent`,
  900–1800 t). `flashMapEventAnnounce(kind, phase)` affiche le bandeau.
- **1 `kind` UNIQUE par terrain** — `mapEventKind()` mappe `TERRAINS[].key → kind`.
  Le test « chaque terrain a un événement » impose : non-null ET unique. Réutiliser
  un kind existant sur 2 terrains = test rouge.
- **Collision unique** : `deflectBallFromMap(px,py,pvx,pvy,pr)` — repousse la balle,
  borne à `MAX_BALL_SPEED`, `sfxCannonHit` + shake ; ignore balle `frozen/popped/
  inHands`. Tous les archétypes l'appellent.

## Les 5 archétypes (en choisir UN)

| kind (ex.) | archétype | comportement | params à régler |
|-----------|-----------|--------------|-----------------|
| `cannon` | **projectile** | un tir balistique traverse (`stepMapShotPhysics`), dévie au contact | vitesse/angle initiaux |
| `march`,`carpet`,`cow`,`falcon`,`peacock` | **crosser** | un objet traverse le court L→R à une hauteur, dévie au contact | `halfW`, `topY` (`collideMapCrosser`), vitesse (`stepMapCrosserEvent`) |
| `cart`,`lantern` | **rain** | zone de danger + projectiles qui tombent dedans | `zoneX`/`zoneW`, cadence |
| `radar` | **zone** | zone de détection statique, dévie si la balle entre | `zoneW`, pulses |
| `macaw` | **flock** | nuée en vol horizontal, chaque oiseau dévie | nb, vitesse (`stepMapMacawEvent`) |

Le plus simple et lisible pour une nouvelle map = **crosser** (comme falcon/peacock).

## Recette — les 6 points de câblage (kind = `<k>`, terrain = `<key>`)

**`src/scenery.js`**
1. **`mapEventKind()`** : `if (k === "<key>") return "<k>";` (kind unique).
2. **Classification** : ajouter `<k>` à `mapEventIsCrosser()` (ou `mapEventIsRain()`)
   selon l'archétype. (cannon/radar/macaw : pas de helper, gérés par `if` dédiés
   dans `stepMapEvent` — suivre le gabarit du kind voisin.)
3. **`mapEventAnnounceCopy(kind, phase)`** : bloc `if (kind === "<k>")` →
   `{title, sub}` pour `phase === "warn"` et sinon (fire). Texte satirique court.
4. **Params collision** (si crosser) : dans `collideMapCrosser()`, étendre les
   ternaires `halfW` et `topY` avec une branche `<k>` (hauteur de passage / largeur
   de hitbox). Vitesse dans `stepMapCrosserEvent()` (ternaire `spd`).

**`src/terrains.js`**
5. **`mapEventWarnPack(kind)`** : `if (kind === "<k>") return SPRITES.map<Nom>;`
   (le pack de la map — pour retrouver le prop).
6. **`drawMapEventCrosser(kind)`** : branche `else if (kind === "<k>")` →
   `if (pack && spriteReady(pack.<prop>)) drawMapProp(pack.<prop>, 0, <footY>, <h>);
   else { …fallback canvas… }`. Le fallback = forme simple (silhouette) tant que
   `sommet-decor` n'a pas produit `<prop>.png`.

**Manifest** (`assets/maps/<key>/manifest.json`) : `"event": "<k>"` +
`"props": [..., "<prop>"]` → c'est le relais vers `sommet-decor` (qui génère
`<prop>.png`). Ne PAS générer d'image ici.

> ⚠️ `<prop>` nouveau → l'ajouter à `PROP_NAMES` (`tools/cutout.py`) pour le futur
> détourage (sinon `sommet-decor` le traitera en perso). Le loader (`initMap<Nom>`
> dans `src/assets.js`) doit lister `<prop>: "<prop>.png"`.

## Météo

FSM déterministe `stepWeather()` (`src/scenery.js`) : `clear → rain → storm → rain`
par terrain, transitions via `rng()` + `weatherTimer`. Consommée par les
`drawBg<Nom>` (voiles `rain`/`storm` + `drawRain()`), pas par la simulation.

- **Terrain qui doit rester au beau fixe** (jardin ensoleillé, désert…) : ajouter sa
  clé à la liste en tête de `stepWeather()` : `if (key === "country-club-dore" || key === "<key>")
  { weather = "clear"; weatherTimer = 99999; return; }`.
- **Terrain avec météo** : rien à faire (FSM par défaut) ; juste gérer les voiles
  `raining`/`storm` dans son `drawBg<Nom>Png` (copier un voisin).
- Météo = **habillage** : elle ne doit rien changer à la physique (déterminisme).

## Déterminisme — règles dures

- Aléa = `rng()` seedé UNIQUEMENT (jamais `Math.random`/`Date.now`) dans
  `stepMapEvent`/`stepWeather` et tout ce qu'ils appellent.
- Toute mutation d'état d'event se fait dans `stepMapEvent` (appelé par `stepGame`),
  pas dans le rendu. Le rendu (`drawMapEventOverlay`, `drawBg*`) lit, ne décide pas.
- Respecter la gate `mapEventsCanStep()` : pas de trigger hors `play`.

## Tests (garder verts + étendre)

`npm test` — surveiller : « chaque terrain a un événement de map » (kind unique
par terrain), « events map : pas de trigger en pause / service / point », « boulet
en vol coupé au passage en service ». Pour un nouvel event, ajouter au moins un test
« annonce → phase déterministe » et « collision dévie la balle » (gabarits :
`event canon` / `event cortège` dans `tests/game.test.js`).

## Vérifier (préviz)

Lancer un match sur le terrain, forcer l'event (`mapEvent.phase="flying"`, geler
`stepMapEvent` pour capturer), vérifier : bandeau d'annonce, prop/fallback au bon
endroit, déviation de balle, event UNIQUEMENT en `play` (pas au service/point),
console propre. Screenshot du rendu réel.

## Références

`sommet-map` (crée le terrain en amont) · `sommet-decor` (génère le prop de l'event)
· `docs/PIPELINE-MAP.md` §5 (contrat events) · moteur : `src/scenery.js`
(`stepMapEvent`/`stepWeather`), `src/terrains.js` (`drawMapEventOverlay`),
`src/simulation.js` (appels dans `stepGame`).
