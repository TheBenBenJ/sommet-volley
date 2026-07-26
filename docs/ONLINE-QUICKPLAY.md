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

## Implémentation (livré)

| Élément | Emplacement |
|---------|-------------|
| Service WS | [`matchmaker/server.js`](../matchmaker/server.js) + [`queue.js`](../matchmaker/queue.js) |
| Client | `startQuickplay` / `startQuickplayBot` dans [`src/net.js`](../src/net.js) |
| UI | menu En ligne → **Partie rapide** ; état `matchmaking` |
| Deploy | rsync `matchmaker/` + `systemctl restart sommet-mm` (si unit installée) |

### Dev local

```bash
cd matchmaker && npm install && npm start
# → ws://127.0.0.1:8787/mm
# Client : ouvrir le jeu ; override optionnel :
#   window.SOMMET_MM_URL = "ws://127.0.0.1:8787/mm"
```

Sans matchmaker joignable, l'écran propose **Jouer contre un bot** (bot-backfill).

### Prod (une fois)

1. Copier [`matchmaker/systemd/sommet-mm.service`](../matchmaker/systemd/sommet-mm.service) vers `/etc/systemd/system/sommet-mm.service`, remplacer `DEPLOY_USER`, puis :
   `sudo systemctl enable --now sommet-mm`
2. Ajouter le bloc [`matchmaker/nginx.conf.example`](../matchmaker/nginx.conf.example) au vhost HTTPS (`location /mm`), `nginx -t && reload`.
3. Health : `curl -s https://TON_DOMAINE/mm/health` ou `http://127.0.0.1:8787/health`.

### Steam / Electron

Même client : pointer `window.SOMMET_MM_URL = "wss://TON_DOMAINE/mm"` au boot. Pas de serveur de simu à embarquer.

## Priorité

**Quickplay + bot-backfill = must-have avant Steam** si on garde une promesse
« jouable en ligne ». Le lobby/navigateur est un plus ultérieur.
