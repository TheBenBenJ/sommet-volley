# Sommet Volley sur Steam — viabilité & critique honnête

> Note de travail (assistant), à relire à froid. Ce n'est **pas un avis
> juridique** : le point « personnes réelles » ci-dessous doit être validé par
> un vrai juriste avant toute sortie commerciale.

## Réponse courte

**Oui, techniquement, ça peut sortir sur Steam** (empaqueter le HTML5, payer
les 100 $ de Steam Direct). Mais *sortir* et *bien sortir* sont deux choses.
Le principal obstacle n'est **pas technique — il est juridique et politique**.

## Le vrai risque : des dirigeants réels et vivants

Les persos sont reconnaissables au premier coup d'œil malgré les noms changés
(Poutine, Trump, Macron, Xi, Kim, Erdoğan, Modi, Bolsonaro). La parodie
politique est généralement protégée, **mais** :

- Valve est prudent sur le contenu visant des personnes réelles → refus
  possible, ou passage puis signalement.
- **Droits à l'image / à la personnalité** de personnes vivantes : existent dans
  plusieurs pays, la défense « parodie » varie selon les juridictions.
- Angles sensibles au-delà de l'humour : un dirigeant « dopé », des « conflits »
  qui renvoient à de **vraies guerres en cours**, le nucléaire, un scandale de
  dopage d'État réel → drôle pour certains, diffamatoire/déplacé pour d'autres.
- **Blocages régionaux quasi garantis** (toute caricature de Xi = bloquée en
  Chine, etc.).

➡️ **Décision structurante** : voir [FICTIONNALISATION.md](FICTIONNALISATION.md).
C'est le seul changement qui fait passer de « projet risqué » à « produit
shippable » sans perdre le sel comique.

## Ce qui joue POUR (critique positive plausible)

- **Boucle éprouvée** : volley façon Blobby = « facile à apprendre, dur à
  maîtriser ». Le Gameplay V2 (réception / smash / tir dirigé) ajoute une
  profondeur que l'original n'a pas.
- **Multi local + manette** : créneau canapé/soirée en or (cf. Duck Game,
  Stick Fight, Overcooked).
- **Netcode P2P** : rare et impressionnant pour un projet solo.
- **Crochet satirique mémable / streamer-friendly** : « des chefs d'État dopés
  au volley » est un pitch qui peut faire un buzz organique — meilleure arme
  marketing.
- **Mode Histoire** : du contenu solo, que 90 % des party games n'ont pas.

## Ce qui joue CONTRE (critique négative plausible)

- **Genre petit et encombré** : jeu à ~5 €, les joueurs Steam attendent de la
  matière ; un 1v1 de volley peut sembler mince après 2 h.
- **Cœur dérivatif** : reconnaissablement du Blobby Volley.
- **Cohérence artistique** : sprites générés/retouchés → l'incohérence de style
  entre 8 persos + 8 maps se fait démonter dans les reviews. Point de qualité le
  plus visible.
- **Online mort-né sans matchmaking** : rejoindre par code = « entre amis ». Un
  party game en ligne vit ou meurt sur « est-ce que je trouve une partie ? ».
  Voir [ONLINE-QUICKPLAY.md](ONLINE-QUICKPLAY.md).
- **Longévité / méta** : peu de progression, déblocables, rejouabilité hors
  histoire.
- **Humour politique** : divise, vieillit vite, et attire le *review-bombing*
  hors-sujet (des deux bords) indépendamment de la qualité.

## Scénarios de réception

| Scénario | Conditions | Résultat probable |
|----------|-----------|-------------------|
| **Bon** | Fictionnalisé, art cohérent, bon local + quickplay | « Très positif », niche culte, quelques milliers de ventes à 4,99–7,99 €, moment streamer |
| **Moyen** | Sorti tel quel mais poli | « Plutôt positif », vagues à cause de l'online vide et du contenu mince |
| **Mauvais** | Personnes réelles + jank | Refus/blocages régionaux, review-bomb politique, ventes faibles |

Côté presse : un petit jeu de volley n'est pas couvert… **sauf si l'angle
satirique est repris comme un sujet** (« le jeu où on joue des dirigeants dopés
au volley ») — accroche plausible, qui peut jouer positivement ou négativement.

## Verdict

- **Tel quel** : excellent projet portfolio / jeu gratuit itch.io ; candidat
  Steam **risqué** surtout à cause des personnes réelles.
- **Pour un vrai produit Steam bien reçu**, par ordre d'impact :
  1. **Fictionnaliser** les personnages — décisif ([FICTIONNALISATION.md]).
  2. **Passe de cohérence artistique** (style unifié, détourages pro).
  3. **Quickplay/lobby + bons bots** ([ONLINE-QUICKPLAY.md]).
  4. **Contenu** (tournoi, déblocables, cosmétiques, plus d'histoire).
  5. **Démo + campagne de wishlists** avant sortie ([ROADMAP-STEAM.md]).

Le plus dur est déjà fait (moteur, netcode, mode histoire, identité). Le chemin
vers Steam passe surtout par **désamorcer le risque juridique** et **polir la
présentation**, pas par réécrire le jeu.
