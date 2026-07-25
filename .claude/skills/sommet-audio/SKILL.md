---
name: sommet-audio
description: >
  Pack audio de Sommet Volley : musique par map (TERRAINS.key), SFX gameplay,
  events de map, stingers mode Histoire. Manifest assets/audio/manifest.json,
  câblage src/audio.js (musicForTerrain, loadSfx, fallback synth). Génération
  locale via tools/gen_audio_synth.py (fallback) ou remplacement Gemini/web
  des MP3. Utiliser pour nouvelle map, nouveau SFX, regen pack, spike QA, ou
  réparation d'encodage (afplay / MP3 illisible).
---

# sommet-audio — musique & SFX

Codex CLI **n’a pas** d’outil audio natif (`imagegen` seulement). Ce skill
orchestre le pack : fichiers + manifest + câblage. Génération réelle =

1. **Synth procédural** — `tools/gen_audio_synth.py` (défaut si pas d’API)
2. **Fichiers fournis** — Gemini / outil web (comme `mayor-parade.mp3`)

Style cible : fanfares / marches / ambiances légères cartoon. **Aucune VO**,
aucune voix reconnaissable (Steam).

## Quand l’invoquer

- Nouvelle map (`sommet-map`) → `assets/audio/maps/<terrainKey>.mp3` + manifest
- Nouvel event (`sommet-event`) → SFX `event_<prop>` + entrée manifest
- Regen / spike → `python3 tools/gen_audio_synth.py spike|full`
- Remplacer un placeholder synth par une vraie boucle Gemini
- QA écoute ou MP3 illisible (`afplay` → `'wht?'` / `'fmt?'`)

## Contrat fichiers

| Rôle | Chemin |
|------|--------|
| Manifest | `assets/audio/manifest.json` |
| Musique map | `assets/audio/maps/<TERRAINS.key>.mp3` (~30–45 s, loop) |
| SFX core / events | `assets/audio/sfx/<name>.mp3` |
| Histoire | `assets/audio/story/<sting>.mp3` (`hub`, `act`, `win`, `lose`, `blip`) |
| Fallback musique | `assets/audio/mayor-parade.mp3` |
| Spike / go-nogo | `raw/audio/_spike/` (+ `GO_NOGO.md`) |

Clés map = **slugs officiels** (`place-ecarlate`, `country-club-dore`,
`palais-gallard`, `esplanade-du-defile`, `cite-du-matin`, `pont-des-deux-mondes`,
`stade-ashram`, `grande-foret`, `citadelle-du-levant`, `jardin-des-roses`) —
**pas** les anciens `neige` / `vladou` / `plage` / etc.

### Encodage MP3 obligatoire (macOS / afplay / navigateur)

Tout MP3 du pack doit être :

- **stéréo** (`-ac 2`)
- **44.1 kHz**
- **CBR 128 kbps** lame (`-b:a 128k`)

`tools/gen_audio_synth.py` → `maybe_mp3()` applique déjà ces flags.

**Pièges connus :**

| Erreur `afplay` | Cause | Fix |
|-----------------|-------|-----|
| `'wht?'` | mauvais chemin (ex. lancé depuis `~` avec chemin relatif) | se placer dans le repo **ou** chemin absolu |
| `'fmt?'` | mono / VBR / bitrate exotique | réencoder (commande ci-dessous) |

Écoute depuis le repo :

```bash
cd /chemin/vers/sommet-volley
afplay raw/audio/_spike/place-ecarlate_loop.mp3
afplay assets/audio/maps/place-ecarlate.mp3
```

Réencoder un MP3 cassé :

```bash
ffmpeg -y -i broken.mp3 -ac 2 -ar 44100 -codec:a libmp3lame -b:a 128k fixed.mp3
mv fixed.mp3 broken.mp3
```

Réencoder tout le pack (hors `mayor-parade.mp3` si déjà OK) :

```bash
find assets/audio -name '*.mp3' ! -name 'mayor-parade.mp3' -print0 \
  | while IFS= read -r -d '' f; do
      ffmpeg -y -loglevel error -i "$f" -ac 2 -ar 44100 -c:a libmp3lame -b:a 128k /tmp/reenc.mp3
      mv /tmp/reenc.mp3 "$f"
    done
```

### Manifest

Régénéré par `gen_audio_synth.py full`, ou édité à la main après un ajout.

```json
{
  "version": 1,
  "fallbackMusic": "mayor-parade.mp3",
  "musicGain": 0.32,
  "maps": {
    "place-ecarlate": { "file": "maps/place-ecarlate.mp3", "gain": 0.32, "loop": true }
  },
  "sfx": { "hit": { "file": "sfx/hit.mp3", "gain": 1.0 } },
  "story": { "hub": { "file": "story/hub.mp3", "gain": 0.9 } }
}
```

Après changement de fichiers → `npm test` (test « audio : musique par terrain… »).

### Catalogue SFX (noms canon)

**Core** (wrappers `sfx*` dans `src/audio.js`) : `hit`, `smash`, `wall`, `net`,
`point`, `match_win`, `battle_start`, `battle_end`, `bomb_tick`, `bomb_blast`,
`jump`, `cannon_warn`, `cannon_fire`, `cannon_hit`.

**Events** (fichiers `sfx/event_<name>.mp3`) : `warn`, `cannon_impact`, `cart`,
`macaw`, `peacock`, `lantern`, `carpet`, `cow`, `radar`, `march`.

**Story** (`sfxStory`) : `hub`, `act`, `win`, `lose`, `blip`.

## Câblage runtime (`src/audio.js`)

- `musicForTerrain(key)` → URL ; `musicTick()` suit `TERRAINS[terrain].key`
  (menus inclus) ; crossfade court via `musicGain`
- `loadAudioManifest()` / `preloadAudioPack()` au chargement page
- `loadSfx(name)` → `AudioBuffer` ; `playSfxBuffer` ; **sinon** synth
  (`beep` / `noiseBurst` / corps des `sfx*`)
- `sfxStory(kind)` branché dans `story.js` (hub, intro d’acte, win/lose, blip ligne)
- `musicVolume` persisté avec `volume` / `musicOn` / `muted` (`localStorage`)

Ne **pas** retirer les fallbacks synth tant qu’un fichier peut manquer.

## Prompts canon (Gemini / outil web)

Helper : `python3 tools/gen_audio_prompts.py` (`maps` | `sfx` | défaut = tout).

**Musique map (~36 s, loopable) :**

```
Instrumental only cartoon political satire theme, short marching band / light
chiptune hybrid loop, ~36 seconds, seamless loop, no vocals, no lyrics, no
spoken voice, no real national anthem, playful not dark. Mood: <theme casting.py>.
```

**SFX one-shot :**

```
Short game sound effect, <0.5s, cartoon volleyball / arcade, no voice, no speech.
Description: <hit ball | smash spike | warning siren soft | point chime>.
```

Après téléchargement Gemini : **réencoder** au contrat stéréo 128k avant de
poser le fichier dans `assets/audio/…` (certains exports web cassent `afplay`).

## Recette agent

### Spike (go / no-go)

1. Inventaire : `openai` CLI / clé API / ffmpeg. Sans API → fallback synth.
2. `python3 tools/gen_audio_synth.py spike`
3. Écouter depuis le **repo** (voir commande `afplay` ci-dessus)
4. Checklist : boucle propre, pas de VO, poids OK (~<1 Mo / map), licence OK
5. Noter le verdict dans `raw/audio/_spike/GO_NOGO.md`

### Full pack

```bash
python3 tools/gen_audio_synth.py full   # maps + sfx + story + manifest
# ffmpeg requis pour MP3 ; sinon WAV laissés sur place
npm test
```

### Nouvelle map seule

1. Générer ou synth : piste `assets/audio/maps/<key>.mp3` (encodage contrat)
2. Entrée `manifest.maps[<key>]`
3. Pas de changement code si `musicForTerrain` + convention de chemin suffisent
4. `npm test`

### Nouveau SFX

1. Fichier sous `assets/audio/sfx/` + entrée `manifest.sfx`
2. Wrapper optionnel : `playSfxBuffer("name")` avant le synth dans `sfx*()`
3. Events scenery : réutiliser `cannon_*` ou ajouter `event_<prop>`

### Remplacement Gemini d’une map

1. Prompt via `gen_audio_prompts.py maps`
2. Copier → `assets/audio/maps/<key>.mp3` (écrase le synth)
3. Réencoder si besoin + `afplay` de contrôle
4. Pas toucher au fallback `mayor-parade.mp3` sauf intention explicite

## Relais skills

| Après | Proposer |
|-------|----------|
| `sommet-map` | musique `maps/<key>.mp3` |
| `sommet-event` | SFX `event_<prop>` |
| `sommet-decor` | rien d’audio (props image seulement) |

## Hors scope

- VO parlée des dirigeants (Steam / likeness)
- Remplacer d’un coup tous les beeps perso (`charHitSound`) — lot optionnel
- Bloquer un batch regen persos pour l’audio
- Renommer / toucher les backups `_bak_*`
