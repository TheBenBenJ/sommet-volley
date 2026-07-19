# Pipeline personnage — process de référence

Objectif : intégrer **n'importe quel personnage** de façon uniforme, en une
session, sans redécouvrir les pièges à chaque fois. Ce document EST la
référence : tout nouveau perso suit ces 6 étapes dans l'ordre. Le premier
perso (« pilote ») sert à valider le pipeline lui-même — chaque friction
rencontrée doit être corrigée ICI, pas contournée en douce.

> Leçons déjà payées (l’ancien moteur Crabby (fork)) qui motivent ce process :
> - une **planche** multi-poses à découper donne des cellules trop petites et
>   des cadrages ratés → **une pose = une image** ;
> - un détourage au seuil donne un **alpha binaire** (bords en escalier) →
>   détourage **anti-aliasé** obligatoire ;
> - un PNG plus petit que sa taille d'affichage ×dpr est **flou sans remède**
>   → générer grand, réduire ensuite (jamais l'inverse) ;
> - du code de chargement/rendu **par perso** (drawX, SPRITES.xIdle…) ne
>   passe pas à l'échelle → **manifest générique** + un seul chemin de code.

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
- **cohérence stricte** entre les poses : mêmes vêtements, mêmes couleurs,
  même épaisseur de trait (réutiliser la même description mot pour mot).

## Étape 2 — Liste des animations requises (gameplay V2)

Une pose = un fichier PNG **≥ 1024 px de hauteur** (réduit ensuite, jamais
agrandi). Nommage : `raw/<key>/<anim>_<n>.png`.

| anim        | frames | usage                                    |
|-------------|--------|------------------------------------------|
| idle_face   | 1      | menus / sélection                         |
| idle        | 2      | repos en jeu (respiration)                |
| walk        | 8      | cycle de marche (2 contacts, 2 passages)  |
| jump        | 3      | impulsion / apex / retombée               |
| receive     | 2      | réception (bras prêts / balle captée)     |
| aim         | 2      | contrôle + visée (regard vers la cible)   |
| smash       | 3      | armé / frappe / suivi                     |
| super       | 4      | incantation du SUPER (poses signature)    |
| panic       | 2      | balle perdue / bombe qui va sauter        |
| victory     | 2      | point gagné / match gagné                 |
| defeat      | 2      | match perdu                               |

Soit **31 images** par personnage. Le cycle `walk` se génère pose par pose en
décrivant la phase (« jambe droite en contact au sol, bras gauche en avant »…)
— pas « génère un cycle de marche » en une image.

## Étape 3 — Génération (Gemini CLI)

Template de prompt = `[STYLE GUIDE (étape 1)] + [FICHE (étape 0) : silhouette,
palette, vêtements] + [POSE précise]`. Une image à la fois, garder la même
formulation de base entre les poses. Rejeter et regénérer si : fond non blanc,
personnage coupé, style incohérent, membres douteux. Stocker le prompt exact
utilisé dans `raw/<key>/prompts.md` (reproductibilité).

## Étape 4 — Post-traitement (`tools/cutout.py`, à créer en Phase 2)

Entrée `raw/<key>/*.png` → sortie `assets/<key>/*.png` :
1. détourage du fond blanc en **alpha anti-aliasé** : distance à blanc →
   rampe d'alpha (pas de seuil binaire), en protégeant les blancs INTERNES
   (yeux, chemise) par remplissage depuis les bords uniquement ;
2. recadrage au contenu + marge fixe 4 % ;
3. **ancrage pieds** : la ligne de sol détectée est alignée sur le bas du
   canvas pour TOUTES les poses d'un même perso (sinon le perso « saute »
   d'une frame à l'autre) ;
4. normalisation : hauteur debout commune (512 px) — les poses aériennes
   gardent leur échelle relative ;
5. génération d'une **planche de contrôle** (`assets/<key>/_contact.png`)
   pour valider d'un coup d'œil cohérence/ancrage/détourage.

## Étape 5 — Intégration code (générique, AUCUN code par perso)

1. `assets/<key>/manifest.json` :
   ```json
   { "anims": { "walk": 8, "idle": 2, "jump": 3, "receive": 2, "aim": 2,
                "smash": 3, "super": 4, "panic": 2, "victory": 2,
                "defeat": 2, "idle_face": 1 },
     "baseH": 110, "footPad": 2 }
   ```
2. Loader générique (remplace les SPRITES.xxx nominatifs) : charge le
   manifest → `SPRITES.chars[key][anim][n]`.
3. Rendu générique `drawSpriteChar(b)` : machine à états **état physique →
   anim** (au sol+vx→walk, en l'air→jump, ball.heldBy→aim, etc.) commune à
   tous les persos sprités — un seul endroit à déboguer.
4. Entrée roster dans `ANIMALS` (fiche étape 0) + effet SUPER dans le
   framework `superEffects`.
5. Sons : cri de frappe + son de super (WebAudio, comme l'existant).

## Étape 6 — Checklist de validation (aucune étape sautée)

- [ ] `npm test` vert (+ test roster du nouveau perso) ;
- [ ] sélection : carte propre, idle_face net, stats/traits affichés ;
- [ ] en jeu : marche fluide (8 frames), pieds au sol ±2 px sur tout le cycle,
      aucun halo blanc sur fond sombre, netteté OK en fenêtre rétina ;
- [ ] réception/visée/smash : la bonne anim au bon état ;
- [ ] SUPER : effet + rendu + son, ET synchronisé en ligne (2 onglets) ;
- [ ] perf : pas de chute de fps (images décodées une fois, pas de resize par
      frame) ;
- [ ] partie complète vs IA + partie en ligne 2 onglets sans erreur console.
