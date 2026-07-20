# Contribution — Benjamin Mille

Document pour **garder la trace** de ton travail sur *Sommet Volley* et pouvoir
montrer clairement que le projet n’est pas « fait uniquement par une IA ».

**Période couverte :** 19–20 juillet 2026  
**Sources :** historique git du dépôt + transcripts Cursor du workspace  
**Auteur de tous les commits :** Benjamin Mille (`benjamin.mille@6tm.com`)

---

## En une phrase

Tu as **dirigé** le jeu (game design, art direction, playtest, prod).  
L’IA a **exécuté** sous consignes (code, intégration, docs techniques).

---

## Chiffres clés

| Métrique | Valeur |
|----------|--------|
| Prompts Cursor (toi, hors explorations agent) | **129** |
| Dont avec images jointes (feedback visuel) | **5+** |
| Répartition jour | **80** le 19 juil. · **49** le 20 juil. |
| Durée de session active | ~**7 h** (19h → ~2h) |
| Commits sur `main` | **4** (tous à ton nom) |
| Fichiers touchés (git) | **245** |
| Insertions / suppressions (cumul commits) | ~**14,7k** / ~**3,9k** |
| PNG livrés dans `assets/` | **203** |
| Images Gemini présentes dans Downloads (pipeline) | **~122** |
| Fiches personnages (`docs/chars/`) | **4** (Vladou, Trompette, Micron, Houn) |

### Où vont tes prompts (thèmes)

| Thème | ≈ prompts |
|-------|-----------|
| Direction artistique / génération assets (Gemini) | 45 |
| Gameplay / feel / physique | 22 |
| Autres décisions produit | 15 |
| Personnages / animations | 13 |
| UI / UX / identité | 10 |
| Gameplay IA / équilibrage | 10 |
| Terrains / décors | 6 |
| Validation / go / ok | 5 |
| Infra / déploiement | 2 |
| Audio | 1 |

≈ **1 prompt sur 3** = art direction & assets (prompts Gemini, tri, intégration).

---

## Ce que **toi** as fait

### 1. Direction produit & identité
- Pivot depuis Crabby Volley → **Sommet Volley** (roster satirique, ton, titres).
- Validation des fiches perso, nettoyage des références « animaux ».
- Licence **MIT © Benjamin Mille** (toi seul).

### 2. Game design & playtest (manette)
- Lancement et itération du **Gameplay V2** (plans `.md`).
- Feel service / cloche / smash / joystick jusqu’à ce que ce soit jouable.
- Hitboxes, auto-réception, filet, rythme des transitions, IA.
- Décisions du type : « pas de pause au smash », « cloche = touche simple », etc.

### 3. Art direction (Gemini — travail manuel)
- Demandes de **prompts prêts à coller**, génération **de ton côté**.
- Envoi des fichiers `Gemini_Generated_Image_*`, rejets (« trop fin », « pas le style Vlad », public raté, etc.).
- Sélection des bons fonds (resort, Macron, Kim) et des filets.

### 4. Production
- Repo GitHub, deploy type Crabby vers **`/sommet-volley/`**.
- Demande explicite : **pousser à chaque fois**.

---

## Timeline condensée

| Quand | Toi |
|-------|-----|
| 19 juil. ~19h | « Continuer le plan » → Phase 1 Gameplay V2 |
| 19 juil. soir | Playtest pad : service, cloche, IA, sauts |
| 19 juil. soir | Validation fiches → Vladou + pipeline assets |
| 19→20 juil. | Génération Gemini persos / maps / filets |
| 20 juil. nuit | Trompette, Micron, Houn + terrains |
| 20 juil. ~2h | Menus cartoon, scores, marche, deploy, push |

---

## Phrase type à dire / écrire

> Sur une session intensive (~7 h, ~130 prompts), j’ai dirigé le game design et
> l’art direction de Sommet Volley : gameplay V2 itéré au pad, roster satirique
> validé, assets générés et sélectionnés via Gemini, puis intégration et mise en
> prod. L’IA a servi d’outil de code sous ma direction — tous les commits et la
> licence sont à mon nom.

---

## Fichiers utiles à montrer

- Ce document : `docs/CONTRIBUTION-BENJAMIN.md`
- Vision / design : `docs/VISION.md`, `docs/GAMEPLAY-V2.md`, `docs/chars/*.yaml`
- Licence : `LICENSE`
- Prod : https://ns3104412.ip-37-187-139.eu/sommet-volley/

*Généré le 20 juillet 2026 à partir des transcripts Cursor et de l’historique git.*
