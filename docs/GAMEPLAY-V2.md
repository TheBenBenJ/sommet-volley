# Gameplay V2 — Réception, smash, tir dirigé

## Constat sur le système actuel (hérité de crabby-volley)

La frappe est **passive** : la balle rebondit automatiquement au contact du
corps/de la tête, l'angle du renvoi découle de la géométrie du contact, et le
seul levier du joueur est *où* il se place et *quand* il saute. Résultat :
peu d'intentions offensives possibles, pas de « choix » au moment de toucher
la balle.

## Objectif V2

Au contact de la balle, le joueur **choisit** :

1. **RATTRAPER (réception/contrôle)** — sécuriser la balle pour préparer ;
2. **TIRER DIRIGÉ** — placer la balle où il veut, avec une visée explicite ;
3. **SMASHER** — frappe puissante en l'air, au timing.

Le contact passif actuel reste comme filet de sécurité **affaibli** (renvoi
mou en cloche vers son propre camp) : un débutant/une IA basique peut encore
jouer, mais tout l'intérêt bascule vers les actions actives.

## Les trois actions

### 1. Réception (au sol ou en l'air, bouton Action quand la balle est proche)
- Fenêtre de réussite : balle à ≤ R px du perso ET appui dans une fenêtre de
  ±6 ticks autour du contact idéal. Réussie → la balle est **contrôlée** :
  elle flotte au-dessus du perso.
- Pendant le contrôle (durée max **~45 ticks / 0,75 s**, jauge visible) :
  - le perso peut encore se déplacer (vitesse réduite ~60 %) ;
  - la direction (gauche/droite/haut/bas) règle l'**angle de visée**, affiché
    par une **flèche + arc de trajectoire prévisualisé** (simulation projetée
    de la vraie physique — le même intégrateur, donc la préviz est honnête) ;
  - appui Action → **tir dirigé** selon l'angle (vitesse standard) ;
  - jauge expirée → lob faible automatique tout droit (punition douce).
- Compte pour **une touche** (réception + tir = 1 touche, comme une passe).
- Rater la fenêtre = contact passif classique (renvoi mou).

### 2. Tir dirigé (sortie de contrôle)
- Angle libre dans un cône de ~150° orienté vers le camp adverse (impossible
  de tirer derrière soi — anti-anti-jeu).
- Deux régimes selon la durée d'appui : appui court = balle tendue rapide,
  appui long (≤ 0,4 s de charge) = plus puissant mais l'arc de préviz
  s'affiche aussi pour l'adversaire (risque/lisibilité).

### 3. Smash (en l'air uniquement, bouton Action)
- Fenêtre de timing serrée (±4 ticks) quand la balle est au-dessus de la
  ligne d'épaules → frappe **puissante** (x1.6) vers le bas ;
- L'inclinaison se règle avec la direction tenue : ← → = rasant ↔ piqué ;
- Timing raté = contact passif mou. Le risque/récompense est le cœur du skill.

## Contrôles (2 boutons + directions, manette-friendly)

| Contexte                  | Bouton **Saut** | Bouton **Action**            |
|---------------------------|-----------------|------------------------------|
| Au sol, balle loin        | saute           | rien                         |
| Au sol/air, balle proche  | saute           | **réception** (fenêtre)      |
| En l'air, balle haute     | double saut     | **smash** (fenêtre)          |
| Pendant le contrôle       | annule (lob)    | **tir dirigé**               |

- Clavier gauche : Q/D bouger · Z saut · **S action** · (E = SUPER, déplacé).
- Clavier droit : ←/→ bouger · ↑ saut · **↓ action** · (Shift droit = SUPER).
- Manette : stick bouger · A saut · **X action** · gâchette SUPER.
- ⚠ le SUPER change de touche (S/↓ deviennent Action) → écrans d'aide à jour.

## SUPERS « beaucoup plus puissants et tactiques »

Les supers actuels (buff de frappe/vitesse) deviennent des **effets de zone /
de statut** qui changent la lecture du terrain (voir le casting dans
VISION.md : gel du camp adverse, mur au milieu du camp, interdiction de
smash…). Framework technique :

- `superEffects[]` : liste d'effets actifs `{ kind, side, t, data }` tickée
  dans stepGame (déterministe), sérialisée dans les snapshots (netcode) ;
- chaque effet expose : impact physique (grip, obstacles de collision,
  restrictions d'action), rendu (overlay), sons ;
- la jauge se charge toujours au combo de points, mais le déclenchement
  devient un **choix de moment** (les effets durent, donc se gaspillent si
  mal timés).

## Impacts moteur à traiter

- **Balle contrôlée** : nouvel état `ball.heldBy` (index blob) + jauge —
  entre dans les snapshots ET dans `packBallState` (soft ownership : la balle
  contrôlée est par définition dans le camp du porteur → même côté
  propriétaire, pas de conflit).
- **Préviz de trajectoire** : simulation locale pure rendu (jamais
  synchronisée) ; réutiliser `predictLandingX` généralisé en `simulateArc()`.
- **Touches** : réception+tir = 1 touche ; le smash = 1 touche ; le contact
  passif = 1 touche (inchangé).
- **IA** : nouveaux comportements (choisir réception vs smash, viser les coins,
  varier). Prévoir 2 itérations : IA fonctionnelle (Phase 1), IA maligne
  (Phase 4).
- **Smash Battle existant** : à re-évaluer — le duel de martelage fait doublon
  avec le smash actif. Proposition : le garder uniquement comme événement
  rare (les deux smashent la même balle dans la même fenêtre).
- **Bombe** : compatible tel quel (la bombe se rattrape aussi — tension ++ :
  contrôler une bombe qui tictaque est un choix risqué : la mèche continue).
- **Netcode** : toutes les actions passent par les inputs existants
  (left/right/jump/action/super) → rien à changer au transport ; ajouter
  `action` au paquet d'inputs et aux replays.

## Stratégie de développement

- Feature flag `GAMEPLAY_V2` (const dans 01-core) : V1 reste jouable pendant
  toute la transition ; bascule via menu dev (touche cachée) pour comparer.
- Ordre : 1) état balle contrôlée + réception, 2) tir dirigé + préviz,
  3) smash au timing, 4) affaiblissement du contact passif, 5) IA, 6) supers
  tactiques, 7) retrait du flag une fois validé manette en main.
- Chaque étape : tests unitaires (fenêtres de timing, cône de tir, jauges) +
  partie réelle au clavier ET à la manette.

## Arbitrages à valider par Benjamin

1. Réception + tir = **1 touche** (proposé) ou 2 touches ?
2. Contact passif conservé en filet de sécurité (proposé) ou supprimé (tout
   contact raté = balle perdue — hardcore) ?
3. Le Smash Battle actuel : garder en événement rare, ou retirer ?
4. Durée de contrôle 0,75 s : plus court (nerveux) / plus long (posé) ?
