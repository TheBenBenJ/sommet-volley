# Architecture — Sommet Volley

Jeux canvas HTML5 **sans bundler** : scripts ES5-style chargés dans l’ordre
(`index.html`), partageant un scope global. Destiné à rester lisible pour une
revue externe (bibliothèques / forks).

## Modules (`src/`)

Ordre de chargement (identique à `index.html` et `tests/_load.js`) :

| Fichier | Responsabilité |
|---------|----------------|
| `version.js` | `GAME_VERSION` (bump CI) |
| `core.js` | Constantes, canvas Hi-DPI, RNG seedé |
| `assets.js` | Chargement sprites maps / ballon |
| `char-sprites.js` | Pipeline sprites personnages (`assets/<key>/`) |
| `audio.js` | SFX + musique |
| `input.js` | Clavier + Gamepad |
| `state.js` | `CHARACTERS`, `TERRAINS`, `Blob`, état de partie |
| `characters.js` | Rendu perso (sprites + fallback) + FX SUPER |
| `physics.js` | Balle, collisions, service, filet |
| `scoring.js` | Points, streaks, SUPER charge |
| `ai.js` | IA (niveaux) |
| `particles.js` | Particules / marqueurs |
| `scenery.js` | Météo, grip, public |
| `terrains.js` | Décors maps + HUD score |
| `menus.js` | Menus / sélection |
| `simulation.js` | Boucle `stepGame` déterministe |
| `snapshots.js` | Snapshots net |
| `net.js` | PeerJS / host–guest |
| `render.js` | Compose le frame |
| `main.js` | `requestAnimationFrame` |

## Conventions

- `"use strict"` dans chaque fichier.
- Simulation à **tick fixe 60 Hz** (`STEP`) — pas d’horloge murale dans la logique.
- Identifiant perso : `blob.charId` → entrée de `CHARACTERS[]`.
- Terrains : `TERRAINS[].character` = index du perso « maison ».
- Tests headless : `tests/_load.js` concatène `src/` via `SRC_ORDER` (pas de tri alpha).

## Hors scope volontaire

Pas de framework, pas de modules ESM natifs (compatibilité `file://` / hébergement
statique simple). Un bundler peut être ajouté en aval sans changer le gameplay.
