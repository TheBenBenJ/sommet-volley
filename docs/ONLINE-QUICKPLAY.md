# Online — Quickplay, lobby & bot-backfill

> Objectif : que l'online ne soit plus « entre amis avec un code », mais un
> bouton **Partie rapide** qui trouve un adversaire (ou un bot) en quelques
> secondes. C'est le point qui fait vivre ou mourir un party game en ligne.

## Le problème actuel

Le netcode existant (PeerJS / WebRTC, *soft ownership*, host/guest — voir
`src/net.js`) fonctionne bien, mais l'appariement est **manuel** : l'hôte crée
une partie et **partage un code**, l'invité **tape le code** (états `hostWait` /
`joinEntry`). Donc : jouable uniquement avec quelqu'un qu'on connaît déjà.
Conséquence classique : **population en ligne vide → online mort**.

Bonne nouvelle : tout le transport (connexion P2P, simulation déterministe,
handoff de balle) est déjà là. Il ne manque que **l'appariement automatique**.

## Architecture cible

```
  Joueur A ──"cherche partie"──►  ┌─────────────────┐
                                  │  Matchmaker      │  (petit service)
  Joueur B ──"cherche partie"──►  │  file d'attente  │
                                  └────────┬─────────┘
                                           │ paire A(host) ↔ B(guest)
                                           │ transmet peerId de A à B
                                           ▼
                        Flux PeerJS EXISTANT (net.js) inchangé
                        A = host, B = guest → partie lancée
```

Le matchmaker ne fait **que présenter** les deux joueurs. Une fois le peerId de
l'hôte transmis à l'invité, on réutilise **exactement** le chemin actuel
(`initHostPeer` côté A, connexion par id côté B). Zéro changement au gameplay/
transport.

## Le matchmaker (minimal)

Un micro-service (Node + `ws`, ~100 lignes) ou une fonction serverless avec un
store partagé. API :

- `POST /queue { mode, region? }` → renvoie soit `{ role:"host", ticket }` (tu
  attends), soit `{ role:"guest", hostPeerId }` (connecte-toi tout de suite).
- Logique : file d'attente par `mode` (1v1 / 2v2 / bombe). Deux joueurs en
  attente → le 1er devient **host** (on lui a demandé son peerId à l'entrée en
  file), le 2e reçoit ce peerId comme **guest**.
- Nettoyage : timeout des tickets abandonnés (heartbeat WebSocket).
- Peut tourner **sur le même serveur que le jeu** (beast / OVH) : un process
  Node derrière nginx, `wss://…/mm`. Coût quasi nul.

> Alternative sans backend : PeerServer héberge déjà le signaling ; on peut
> détourner un « id de rendez-vous » connu (salle publique) mais c'est fragile.
> Un vrai petit matchmaker WebSocket est plus propre et pas plus cher.

## Bot-backfill (le multiplicateur pour petite population)

Le point clé quand il y a peu de joueurs : **ne jamais laisser le joueur
coincé**. Flux « Partie rapide » :

1. Entrée en file → écran « Recherche d'adversaire… (Xs) ».
2. Match trouvé < T secondes → partie en ligne normale.
3. Pas de match après **~15 s** → proposer : **[Jouer contre un bot]** /
   [Continuer d'attendre]. Le bot lance une partie **locale vs IA** instantanée,
   même persos/règles, transition transparente.
4. Option « rester en file en tâche de fond » pendant qu'on joue le bot → si un
   humain arrive, proposer la bascule à la fin du set.

Effet : l'online est **toujours** jouable, même à 3 joueurs connectés dans le
monde. C'est ce qui distingue un online « vivant » d'un online « désert ».

## Lobby / navigateur de parties (bonus, phase 2)

Au-delà du quickplay : une liste de parties ouvertes (mode, région, ping,
1/2 joueurs) avec bouton Rejoindre. Utile pour le 2v2 et les parties entre amis
publiques. Réutilise le matchmaker (endpoint `GET /rooms`). Non prioritaire vs
le quickplay + bots.

## Ce qu'il faut toucher

1. **Nouveau service** `matchmaker/` (Node WS) + conf nginx (`wss://…/mm`).
2. **`src/net.js`** : un mode « quickplay » qui, au lieu d'afficher un code,
   parle au matchmaker puis retombe dans `initHostPeer` / connexion-par-id
   existants. States UI : `matchmaking` (recherche) réutilisant l'essentiel de
   `connecting` / `hostWait`.
3. **`src/menus.js`** : bouton « Partie rapide » (menu en ligne) + écran de
   recherche avec compteur + bouton « Jouer contre un bot ».
4. **Bot-backfill** : réutilise `newGame()` vs IA — trivial (le solo existe
   déjà). L'essentiel est la **transition douce** depuis l'écran de recherche.

Effort : matchmaker ~0,5–1 j, intégration client ~1 j, bot-backfill ~0,5 j.
Risque faible : le transport ne change pas.

## Priorité

**Quickplay + bot-backfill = must-have avant Steam** si on garde une promesse
« jouable en ligne ». Le lobby/navigateur est un plus ultérieur. Sans ça, mieux
vaut **assumer un positionnement « party game local + bots »** et ne pas
survendre l'online (un online vide fait plus de mal qu'une absence d'online).
