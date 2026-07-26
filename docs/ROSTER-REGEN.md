# File d’attente — passe art composite Steam (phase 1)

> **DÉCISION 2026-07-26 : passe composite SUSPENDUE pour volkoi et dorf.**
> Test utilisateurs : personne ne reconnaît de vraies personnes dans les
> sprites d'origine → on GARDE les anciens persos en jeu (`assets/` restaurés
> depuis git). Les 26 poses composites restent disponibles dans `raw/volkoi`
> et `raw/dorf` si on veut y revenir.

> Objectif : visages / silhouettes **mash-up chibi**, plus de portrait 1:1.
> Pipeline : ancre (imagegen) → Codex lots 1–8 → `cutout.py` → assets.

## Casting

Looks durcis dans `tools/genassets/casting.py` (suffixe COMPOSITE, pins
nationaux interdits, mash-up facial explicite).

## Progression

| Clé | Ancre composite | Codex 26 poses | Cutout assets | Notes |
|-----|-----------------|----------------|---------------|-------|
| volkoi | **OK** `raw/volkoi/idle_1.png` | **26 poses OK** | **annulé** — anciens sprites gardés | composite dispo dans raw/ si besoin |
| dorf | **OK** v3 → `raw/dorf/idle_1.png` | **26 poses OK** Codex `019f9bfd-…` | **annulé** — anciens sprites gardés | v2 rejetée ; composite v3 dispo dans raw/ |
| cygne | **OK** lunettes `raw/cygne/idle_1_composite_new.png` | en attente | — | à arbitrer (même logique que volkoi/dorf ?) |
| bebe | — | — | — | |
| timonier | — | — | — | |
| sultan | — | — | — | |
| gourou | — | — | — | |
| capitaine | — | — | — | |
| faucon | — | — | — | |
| safran | — | — | — | |

**Règle** : un seul `codex exec` à la fois. Après Volkoï → cutout → Dorf → …

## Session Volkoï

```bash
# log
raw/volkoi/_regen_composite_codex_log.txt
# resume si besoin
codex exec resume 019f9be4-e8ce-71f2-a338-33a262c523d4 \
  --dangerously-bypass-approvals-and-sandbox --skip-git-repo-check \
  -i "raw/volkoi/idle_1.png"
```
