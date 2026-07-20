# Sommet Volley — Vision

Jeu de volley 2D **satirique** : les grandes figures politiques mondiales,
caricaturées façon dessin de presse, s'affrontent au filet. Fork d’un
moteur HTML5 existant (même base : physique déterministe, netcode soft-ownership,
manettes, modes 1v1/2v2/Bombe/en ligne), avec un nouveau casting, un nouveau
gameplay (voir GAMEPLAY-V2.md) et une direction artistique 100 % cartoon
générée par IA via un pipeline reproductible (voir PIPELINE-PERSONNAGE.md).

## Ton de la satire

Caricature politique classique : traits physiques exagérés, clichés nationaux
assumés, pouvoirs basés sur l'imagerie publique de chaque dirigeant/pays.
Moqueur mais bon enfant — on vise le rire, pas la diffamation : pas
d'accusations factuelles, pas de contenu haineux. Les personnages portent des
**noms parodiques** (jamais les vrais noms).

## Titre

Titre de travail : **Sommet Volley** (le « sommet international » qui dégénère
en tournoi de volley). Alternatives si tu préfères : *Diplo Volley*,
*G-Smash*, *Volley des Puissants*. → à valider par Benjamin.

## Casting v1 (3 personnages — noms à valider)

Chaque perso = silhouette reconnaissable + 1 trait passif + 1 SUPER tactique
+ 1 map attitrée avec son événement interactif. Les stats suivent le gabarit
existant (vitesse/détente/puissance/contrôle sur 5).

### 1. Tsar Vladou (Russie)
- **Silhouette** : torse bombé (chemise ouverte), regard d'acier, petit mais
  massif. Monte parfois à cheval ou sur un ours dans les poses de victoire.
- **Trait passif** : *Sang froid* — insensible aux effets de gel/ralentissement.
- **SUPER « Hiver Général »** : gèle le sol du camp adverse ~6 s (glisse
  extrême, comme l'orage actuel mais localisé), flocons plein écran côté
  adverse. Tactique : à déclencher quand l'adversaire doit défendre.
- **Map « Place Grand-Rouge »** : neige, coupoles en fond, parade au loin.
  **Événement interactif** : un canon d'apparat tire un boulet en cloche qui
  traverse le terrain (annoncé 2 s avant par une mèche sonore) — toucher le
  boulet dévie la balle, l'esquiver fait partie du jeu.

### 2. Ronald Trompette (USA)
- **Silhouette** : grand, mèche dorée impossible, cravate rouge trop longue,
  bronzage orange, pouce levé.
- **Trait passif** : *Ego en béton* — la jauge de SUPER se charge aussi quand
  il PERD un point (il se venge).
- **SUPER « Le Mur »** : élève un mur doré au milieu du camp adverse pendant
  ~5 s : l'adversaire doit le contourner/sauter par-dessus pour défendre.
  Tactique : coupe les déplacements, à combiner avec un smash croisé.
- **Map « Pelouse Oval »** : façade néoclassique blanche, pelouse, drapeaux
  stylisés. **Événement interactif** : un mini-cortège (voiturette) traverse
  le fond et klaxonne ; au passage, pluie de balles sur une zone annoncée.

### 3. Manu Micron (France)
- **Silhouette** : costume cintré impeccable, mèche laquée, gestuelle de
  meeting (bras écartés), écharpe tricolore parfois.
- **Trait passif** : *En même temps* — après chaque point, échange
  aléatoirement (seedé) un cran de vitesse contre un cran de puissance ou
  l'inverse (imprévisible pour l'adversaire).
- **SUPER « 49.3 »** : passage en force — pendant 4 s, ses frappes ne peuvent
  pas être smashées en retour (l'adversaire ne peut que rattraper/relancer).
  Tactique : fenêtre d'attaque sans risque de contre.
- **Map « Palais de l'Hexagone »** : cour de palais, Tour de fer au fond,
  drapeaux, pigeons. **Événement interactif** : un cortège de manifestants
  traverse le premier plan avec des pancartes (annoncé par des sifflets) —
  il masque partiellement la vue du terrain pendant ~3 s des deux côtés.

### Extension future
Le pipeline doit permettre d'ajouter un perso en ~1 session : candidats
suivants (Kim, Boris, Silvio, Angela…) — chacun via la même fiche.

## Événements de map — règles communes

- Toujours **annoncés** (signal visuel + sonore ~2 s avant) : jamais d'aléa
  qui punit sans prévenir.
- **Déterministes** : déclenchés par le rng seedé de la partie (compatibles
  netcode et replays), jamais par `Math.random()`.
- Fréquence faible (1 événement / 20–40 s) pour rester un twist, pas le cœur
  du jeu. Désactivables dans les options de partie (« terrain calme »).

## Roadmap (ordre volontaire)

- **Phase 0 — Base saine** ✅ : fork nettoyé (roster hérité retiré), docs.
- **Phase 1 — Gameplay V2 d'abord** ✅ : cloche / smash / service (lancer X),
  IA adaptée, sauts au-dessus du filet.
- **Phase 2 — Pipeline + perso pilote** 🚧 : roster satirique + loader
  générique + `tools/cutout.py` + canvas Vladou. Génération PNG complète
  de **Tsar Vladou** (Gemini CLI) à finaliser.
- **Phase 3 — Casting + maps** : les 2 autres persos, leurs maps animées,
  les événements interactifs.
- **Phase 4 — Supers tactiques & équilibrage** : framework d'effets de
  statut/zone, tuning, online, polish.

## Besoins côté Benjamin

1. **Valider** : titre, noms des persos, casting v1.
2. **Accès Gemini CLI** configuré (génération d'images) + budget/quota.
3. Arbitrages gameplay listés en fin de GAMEPLAY-V2.md.
