# Contribution — Benjamin Mille

Document pour **garder la trace** de ton travail sur *Sommet Volley* et pouvoir
montrer clairement que le projet n’est pas « fait uniquement par une IA ».

**Période couverte :** 19–20 juillet 2026 (jusqu’à ~minuit le 20)  
**Sources :** historique git du dépôt + transcripts Cursor du workspace  
**Auteur des commits produit :** Benjamin Mille (`benjamin.mille@6tm.com`)  
*(les commits `chore: bump version` sont le bot GitHub Actions après deploy)*

---

## En une phrase

Tu as **dirigé** le jeu (game design, art direction, playtest, prod, critères
qualité assets).  
L’IA a **exécuté** sous consignes (code, intégration, docs techniques).

---

## Chiffres clés

| Métrique | Valeur |
|----------|--------|
| Commits auteur Benjamin | **62** |
| Commits bot version bump | ~49 |
| Fichiers versionnés (dépôt) | **~394** |
| PNG dans `assets/` | **~305** (dont ~75 maps) |
| Insertions / suppressions (commits Benjamin, cumul) | ~**20,5k** / ~**5,9k** |
| Fiches personnages (`docs/chars/`) | **8** |
| Packs maps jouables | **8** |
| Prompts versionnés (`raw/**/*.md`) | **19** |
| Pipelines doc | `PIPELINE-PERSONNAGE.md` + `PIPELINE-MAP.md` |

### Roster livré

| Perso | Map |
|-------|-----|
| Tsar Vladou | Place Grand-Rouge |
| Ronald Trompette | Pelouse Oval |
| Manu Micron | Palais de l’Hexagone |
| Kim Houn | Esplanade du Défilé |
| Président Panda | Place du Matin |
| Recep Sultan | Palais du Bosphore |
| Narendra Yogi | Stade Ashram |
| Jair Tronço | Amazonie Dorée |

---

## Ce que **toi** as fait

### 1. Direction produit & identité
- Pivot depuis Crabby Volley → **Sommet Volley** (roster satirique, ton, titres).
- Validation des fiches perso (8), nettoyage des références « animaux ».
- Licence **MIT © Benjamin Mille** (toi seul).

### 2. Game design & playtest
- Lancement et itération du **Gameplay V2**.
- Feel service / cloche / smash / clavier / manette jusqu’à ce que ce soit jouable
  (ex. action **F**, service anti-triche, smash piqué, Smash Battle plus décisif).
- Hitboxes, auto-réception, filet, rythme des transitions, IA, HUD score / SUPER.
- Décisions produit du type : events map **pas** pendant pause / point / battle ;
  Pelouse Oval en ciel clair (pas de tempête) ; aras en **vol horizontal** ; etc.

### 3. Art direction (Gemini — travail manuel)
- Demandes de **prompts prêts à coller**, génération **de ton côté**.
- Envoi / sélection des `Gemini_Generated_Image_*`, rejets et itérations
  (« trop fin », « pas le style », public raté, fond Bosphore à reprendre,
  détourage defeat Tronço, drapeaux violets, etc.).
- Validation visuelle map par map (baseline court, plein cadre parade/matin,
  vignettes menu).

### 4. Qualité pipeline (fin de session 20 juil.)
- Exigence de **prompts carrés** pour maps et persos, afin d’éviter les
  allers-retours de retouche.
- Codification dans :
  - [`docs/PIPELINE-MAP.md`](PIPELINE-MAP.md) — court CRITICAL, baseline,
    cutout, events, `MAP_LAYOUT` ;
  - [`docs/PIPELINE-PERSONNAGE.md`](PIPELINE-PERSONNAGE.md) — silhouettes
    pleines anti-trous cutout ;
  - [`raw/maps/_TEMPLATE/`](../raw/maps/_TEMPLATE/) + prompts par map/event ;
  - versioning des `.md` / `.txt` sous `raw/` (PNG bruts toujours hors git).

### 5. Production
- Repo GitHub, deploy vers **`/sommet-volley/`**.
- Consigne récurrente : **pousser en prod** après validation.

---

## Timeline condensée

| Quand | Toi |
|-------|-----|
| 19 juil. ~19h | « Continuer le plan » → Phase 1 Gameplay V2 |
| 19 juil. soir | Playtest pad : service, cloche, IA, sauts |
| 19 juil. soir | Validation fiches → Vladou + pipeline assets |
| 19→20 juil. | Génération Gemini persos / maps / filets |
| 20 juil. journée–soir | Trompette, Micron, Houn + 4 maps « extension » (Panda, Sultan, Yogi, Jair) |
| 20 juil. soir | Events map (aras, vache, tapis, lanternes…), feel smash / clavier, décors |
| 20 juil. ~minuit | Pipelines map/perso documentés + skyline Bosphore + push prod |

---

## Phrase type à dire / écrire

> Sur une session intensive (19–20 juillet), j’ai dirigé le game design et
> l’art direction de Sommet Volley : gameplay V2 itéré au pad et au clavier,
> roster satirique de 8 personnages et 8 maps validés asset par asset via
> Gemini, critères qualité formalisés (pipelines map/perso), puis mise en prod.
> L’IA a servi d’outil de code sous ma direction — commits produit et licence
> sont à mon nom.

---

## Fichiers utiles à montrer

- Ce document : `docs/CONTRIBUTION-BENJAMIN.md`
- Vision / design : `docs/VISION.md`, `docs/GAMEPLAY-V2.md`, `docs/chars/*.yaml`
- Pipelines : `docs/PIPELINE-PERSONNAGE.md`, `docs/PIPELINE-MAP.md`
- Prompts : `raw/maps/`, `raw/vladou/prompts.md`, `raw/_SHARED/`
- Licence : `LICENSE`
- Prod : https://ns3104412.ip-37-187-139.eu/sommet-volley/

*Mis à jour le 20 juillet 2026 (soir) à partir des transcripts Cursor et de
l’historique git.*
