# tools/genassets — données de casting + outils d'INTÉGRATION

> ⚠️ **On ne génère PAS d'images ici.** Les visuels (persos, maps) sont créés
> **dans Grok** (app ou API xAI) — c'est Grok qui fait les pixels. Ce dossier ne
> contient que le **casting** et les outils pour **intégrer** les images fournies
> dans le jeu. Le pipeline de génération locale (ComfyUI / LoRA / ControlNet) a
> été abandonné (résultats en dessous du niveau attendu) et supprimé.

## Contenu

| Fichier | Rôle |
|---------|------|
| `casting.py` | Données du casting fictionnalisé (nations/noms inventés, archétypes, thèmes de map) — sert de source aux prompts Grok. |
| `map_fit.py` | Vérifie/cale la perspective d'une skyline sur le jeu (superpose sol/filet/joueurs). Sert à trouver `baselineFromBottom` pour `MAP_LAYOUT`. |

Outil de détourage : `../cutout.py` (fond blanc → PNG transparent + ancrage pieds).

## Le workflow (simple)

1. **Génère dans Grok** avec le prompt canon → voir les skills **`sommet-map`** /
   **`sommet-character`** (`.claude/skills/`) qui contiennent le prompt exact.
2. **Dépose l'image** dans le repo (`raw/<key>/` pour un perso, `assets/maps/<key>/`
   pour une skyline).
3. **Intègre** via le skill correspondant : détourage (`cutout.py`), calage
   perspective (`map_fit.py` → `MAP_LAYOUT`), câblage roster/terrain, vérif préviz.

Point d'entrée unique = les deux skills. Grok = pixels ; ici = intégration.
