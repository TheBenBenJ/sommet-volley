# Architecture — Sommet Volley

Jeux canvas HTML5 **sans bundler** : scripts ES5-style chargés dans l’ordre
(`index.html`), partageant un scope global. Destiné à rester lisible pour une
revue externe (bibliothèques / forks).

## Modules (`src/`)

| Fichier | Responsabilité |
|---------|----------------|
| `00-version.js` | `GAME_VERSION` (bump CI) |
| `01-core.js` | Constantes, canvas Hi-DPI, RNG seedé |
| `01b-assets.js` | Chargement sprites maps / ballon |
| `01c-chars.js` | Pipeline sprites personnages (`assets/<key>/`) |
| `02-audio.js` | SFX + musique |
| `03-input.js` | Clavier + Gamepad |
| `04-state.js` | `CHARACTERS`, `TERRAINS`, `Blob`, état de partie |
| `05-chars.js` | Rendu perso (sprites + fallback) + FX SUPER |
| `06-physics.js` | Balle, collisions, service, filet |
| `07-scoring.js` | Points, streaks, SUPER charge |
| `08-ai.js` | IA (niveaux) |
| `09-particles.js` | Particules / marqueurs |
| `10-scenery.js` | Météo, grip, public |
| `11-terrains.js` | Décors maps + HUD score |
| `12-menus.js` | Menus / sélection |
| `13-simulation.js` | Boucle `stepGame` déterministe |
| `14-snapshots.js` | Snapshots net |
| `15-net.js` | PeerJS / host–guest |
| `16-render.js` | Compose le frame |
| `17-main.js` | `requestAnimationFrame` |

## Conventions

- `"use strict"` dans chaque fichier.
- Simulation à **tick fixe 60 Hz** (`STEP`) — pas d’horloge murale dans la logique.
- Identifiant perso : `blob.charId` → entrée de `CHARACTERS[]`.
- Terrains : `TERRAINS[].character` = index du perso « maison ».
- Tests headless : `tests/_load.js` concatène `src/*.js` (tri alpha).

## Hors scope volontaire

Pas de framework, pas de modules ESM natifs (compatibilité `file://` / hébergement
statique simple). Un bundler peut être ajouté en aval sans changer le gameplay.
