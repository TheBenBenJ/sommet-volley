# Pipeline personnage — process de référence

Objectif : intégrer **n'importe quel personnage** de façon uniforme, en une
session, sans redécouvrir les pièges à chaque fois. Ce document EST la
référence : tout nouveau perso suit ces 6 étapes dans l'ordre. Le premier
perso (« pilote ») sert à valider le pipeline lui-même — chaque friction
rencontrée doit être corrigée ICI, pas contournée en douce.

> Leçons déjà payées qui motivent ce process :
> - une **planche** multi-poses à découper donne des cellules trop petites et
>   des cadrages ratés → **une pose = une image** ;
> - un détourage au seuil donne un **alpha binaire** (bords en escalier) →
>   détourage **anti-aliasé** obligatoire ;
> - un PNG plus petit que sa taille d'affichage ×dpr est **flou sans remède**
>   → générer grand, réduire ensuite (jamais l'inverse) ;
> - du code de chargement/rendu **par perso** (drawX, SPRITES.xIdle…) ne
>   passe pas à l'échelle → **manifest générique** + un seul chemin de code ;
> - un **jour blanc** entre bras et torse (ou jambe / manteau) devient un
>   **trou** après `cutout.py` → silhouettes en **aplats solides**, pas de
>   « triangle blanc » dans le corps (surtout `defeat`, `smash`, `super`) ;
> - map attitrée : suivre aussi [`PIPELINE-MAP.md`](PIPELINE-MAP.md) (court,
>   baseline, event), sinon le perso est beau mais le terrain est à refaire ;
> - `walk` = **4** frames distinctes (appui / passage / appui / passage). Un
>   défaut code à 8 frames faisait échouer `charAnimReady("walk")` (PNG
>   manquants) ; des walks trop similaires → marche qui saute.

---

## Étape 0 — Fiche personnage (à remplir AVANT tout pixel)

```yaml
key: vladou                 # identifiant technique (dossier assets/, roster)
name: "Tsar Vladou"         # nom affiché (parodique, jamais le vrai nom)
pays_theme: "Russie — hiver, ours, parade"
silhouette: "petit, massif, torse bombé, chemise ouverte, regard d'acier"
palette: ["#b43a2e", "#e8d9b0", "#3a3f4a"]   # 3 tons dominants max
stats: { vitesse: 3, detente: 3, puissance: 4, controle: 4 }
trait_passif: "Sang froid — insensible au gel/ralentissement"
super: { nom: "Hiver Général", effet: "gèle le camp adverse 6 s" }
sons: "voix grave, rire bref ; impact = coup sec"
map: "Place Grand-Rouge (voir VISION.md)"
```

## Étape 1 — Style guide commun (le même pour TOUS les persos)

À inclure tel quel dans chaque prompt de génération :

- caricature politique cartoon, **contour encré noir épais et régulier**,
  aplats de couleur plats (pas de dégradés photo), ombrage plat 1 ton ;
- proportions exagérées : **grosse tête (~1/3 de la hauteur)**, corps
  dynamique ; expression lisible à petite taille ;
- personnage vu de **profil orienté vers la droite** (le jeu miroite pour la
  gauche), SAUF `idle_face` (3/4 face, pour les menus) ;
- **fond blanc pur #FFFFFF uni** (jamais de damier, jamais de décor), aucune
  ombre portée au sol, le personnage entier dans le cadre avec ~5 % de marge ;
- **silhouette pleine** : bras, jambes et torse en aplats **continus** — pas
  de trou / jour blanc entre un bras levé et le corps (le cutout le percera) ;
  les blancs *internes* OK seulement s’ils sont des aplats de vêtement (chemise,
  yeux) clairement entourés de couleur, pas des gaps de composition ;
- **cohérence stricte** entre les poses : mêmes vêtements, mêmes couleurs,
  même épaisseur de trait (réutiliser la même description mot pour mot).

## Étape 2 — Liste des animations requises (gameplay V2)

Une pose = un fichier PNG **≥ 1024 px de hauteur** (réduit ensuite, jamais
agrandi). Nommage : `raw/<key>/<anim>_<n>.png`.

| anim        | frames | usage                                    |
|-------------|--------|------------------------------------------|
| idle_face   | 1      | menus / sélection                         |
| idle        | 2      | repos en jeu (respiration)                |
| walk        | 4      | cycle distinct : appui / passage / appui / passage |
| jump        | 3      | impulsion / apex / retombée               |
| receive     | 2      | réception (bras prêts / balle captée)     |
| aim         | 2      | contrôle + visée (regard vers la cible)   |
| smash       | 3      | armé / frappe / suivi                     |
| super       | 4      | incantation du SUPER (poses signature)    |
| panic       | 2      | balle perdue / bombe qui va sauter        |
| victory     | 2      | point gagné / match gagné                 |
| defeat      | 2      | match perdu                               |

Soit **27 images** par personnage. Le cycle `walk` : **4 poses vraiment
différentes** (pas 4 fois « walking ») — `walk_0` pied avant planté, `walk_1`
jambes serrées (passage), `walk_2` pied opposé planté, `walk_3` passage
opposé. Le moteur les joue toutes (`walkPhase % 4`).

## Étape 3 — Génération (Gemini)

Template de prompt = **A (style) + B (perso) + POSE + C (négatif)** — voir
`raw/vladou/prompts.md` comme référence complète ; pour un nouveau perso,
copier cette structure dans `raw/<key>/prompts.md`.

Une image à la fois ; après une bonne `idle_face_0`, la mettre en **référence**
pour les poses suivantes. Rejeter et regénérer si : fond non blanc, ombre au
sol, personnage coupé, style photo, **jour blanc dans la silhouette**,
membres douteux, sheet multi-poses.

**Bloc C à renforcer** (ajouter systématiquement) :

```
Avoid: white gaps between arm and torso, white triangles in armpits, hollow
limbs, holes in the body silhouette, multiple characters, character sheet,
model sheet, turnaround, lineup, photorealism, real celebrity likeness,
cast shadow on ground, cropped limbs, text, watermark, grey background,
transparent checkerboard.
```

Stocker le prompt exact dans `raw/<key>/prompts.md` (reproductibilité).

## Étape 4 — Post-traitement (`tools/cutout.py`)

```bash
python3 tools/cutout.py raw/<key> assets/<key>
```

Entrée `raw/<key>/*.png` → sortie `assets/<key>/*.png` :
1. détourage fond blanc **anti-aliasé** (flood depuis les bords) ;
2. **punch** des îlots blancs enfermés (jours bras/jambes) — d’où l’obligation
   de générer des silhouettes pleines ;
3. recadrage + **ancrage pieds** commun à toutes les poses debout ;
4. normalisation hauteur debout (~512 px) ;
5. planche `_contact.png` — **à relire** : trous torse/aisselles = regénérer
   la pose raw, pas « retoucher à la main » frame par frame.

## Étape 5 — Intégration code (générique, AUCUN code par perso)

1. `assets/<key>/manifest.json` :
   ```json
   { "anims": { "walk": 4, "idle": 2, "jump": 3, "receive": 2, "aim": 2,
                "smash": 3, "super": 4, "panic": 2, "victory": 2,
                "defeat": 2, "idle_face": 1 },
     "baseH": 110, "footPad": 2 }
   ```
2. Loader générique (remplace les SPRITES.xxx nominatifs) : charge le
   manifest → `SPRITES.chars[key][anim][n]`.
3. Rendu générique `drawSpriteChar(b)` : machine à états **état physique →
   anim** (au sol+vx→walk, en l'air→jump, ball.heldBy→aim, etc.) commune à
   tous les persos sprités — un seul endroit à déboguer.
4. Entrée roster dans `CHARACTERS` (fiche étape 0) + effet SUPER dans le
   framework `superEffects`.
5. Sons : cri de frappe + son de super (WebAudio, comme l'existant).

## Étape 6 — Checklist de validation (aucune étape sautée)

- [ ] `npm test` vert (+ test roster du nouveau perso) ;
- [ ] `_contact.png` : pas de trou torse / aisselle / entrejambes fantôme ;
- [ ] sélection : carte propre, idle_face net, stats/traits affichés ;
- [ ] en jeu : marche fluide (8 frames), pieds au sol ±2 px sur tout le cycle,
      aucun halo blanc sur fond sombre, netteté OK en fenêtre rétina ;
- [ ] réception/visée/smash : la bonne anim au bon état ;
- [ ] SUPER : effet + rendu + son, ET synchronisé en ligne (2 onglets) ;
- [ ] map attitrée : checklist [`PIPELINE-MAP.md`](PIPELINE-MAP.md) étape 6 ;
- [ ] perf : pas de chute de fps (images décodées une fois, pas de resize par
      frame) ;
- [ ] partie complète vs IA + partie en ligne 2 onglets sans erreur console.
