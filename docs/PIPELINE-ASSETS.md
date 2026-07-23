# Pipeline d'assets — génération Grok + intégration locale

> **Les images sont générées dans Grok** (app Grok / X, ou API xAI) — Grok fait
> les pixels. Le repo ne contient **aucun générateur d'images** : seulement les
> outils d'**intégration**. Le pipeline de génération locale (ComfyUI + LoRA +
> ControlNet) a été **essayé puis abandonné** (rendu en dessous du niveau
> attendu, complexité, incohérences) — tout son outillage a été supprimé.
> Ne pas le réintroduire : générer directement avec le modèle de Grok.

## Le découpage

| Étape | Où | Comment |
|-------|-----|---------|
| **Pixels** (persos, maps) | **Grok** (app ou API) | Coller le prompt canon des skills |
| **Intégration** | Repo (ce projet) | Skills `sommet-map` / `sommet-character` |

## Workflow

1. **Générer dans Grok** avec le prompt canon (dans les skills
   `.claude/skills/sommet-map/` et `sommet-character/`) — style, perspective
   court (maps), garde-fous Steam (fictionnalisation) déjà intégrés.
2. **Déposer** l'image dans le repo.
3. **Intégrer** via le skill :
   - persos : `tools/cutout.py` (détourage/ancrage) → `manifest.json` → roster
     `CHARACTERS` (`src/state.js`) → portraits/sélection → vérif.
   - maps : install `assets/maps/<key>/` → `tools/genassets/map_fit.py` (baseline)
     → `MAP_LAYOUT` (`src/terrains.js`) → cutout props → vérif en jeu.

## Références

- Prompts canon + procédures : **skills** `.claude/skills/sommet-map`, `sommet-character`.
- Style visuel cible : [STYLE-REFERENCE.md](STYLE-REFERENCE.md).
- Contrats d'intégration détaillés : [PIPELINE-MAP.md](PIPELINE-MAP.md),
  [PIPELINE-PERSONNAGE.md](PIPELINE-PERSONNAGE.md).
- Fictionnalisation / Steam : [FICTIONNALISATION.md](FICTIONNALISATION.md).
- Casting fictionnalisé (données) : `tools/genassets/casting.py`.
