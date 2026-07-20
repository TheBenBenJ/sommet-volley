# Sommet Volley

Volley 2D satirique : Tsar Vladou, Ronald Trompette et Manu Micron s’affrontent
sur Place Grand-Rouge, Pelouse Oval ou Palais de l’Hexagone. Techniques signature,
météo dynamique, public en délire… et un **mode multijoueur en ligne** (1v1 et
2v2) en pair-à-pair.

Le jeu tient dans une page HTML + Canvas, **sans build ni dépendance à installer** :
la seule librairie externe est [PeerJS](https://peerjs.com/) (chargée via CDN)
pour la signalisation du mode en ligne.

## ▶️ Jouer

Le jeu doit être servi en HTTP (le chargement des modules `src/` échoue en
`file://`). Depuis la racine du dépôt :

```bash
npm start          # sert le dossier sur http://localhost:8000
# ou
python3 -m http.server 8000
```

Puis ouvre <http://localhost:8000>. Le mode **en ligne** nécessite en plus une
connexion Internet (CDN PeerJS) et, entre machines distantes, un accès en **HTTPS**.

> 🌐 **Connectivité** — la connexion est en P2P direct (WebRTC), avec repli sur
> un serveur TURN public si le direct échoue (NAT strict, pare-feu). Si la
> négociation n'aboutit pas sous 20 s, un message d'erreur s'affiche (avec un
> diagnostic technique en petit, utile pour signaler un problème) plutôt que de
> rester bloqué indéfiniment sur "Recherche de la partie…".

### Modes de jeu

L'écran d'accueil propose 3 grandes catégories ; chacune débouche sur ses
propres sous-choix plutôt qu'un mur d'options :

| Accueil | Puis... |
|---------|---------|
| **1 — Solo** | choix de la difficulté (Facile/Normale/Difficile/Impitoyable), puis du format : Classique, En équipes (toi + IA vs 2 IA), ou Bombe (qui demande ensuite 1v1 ou en équipes) |
| **2 — Multijoueur local** | même écran/clavier (ou 2 manettes) : Classique ou Bombe (1v1 uniquement, pas d'équipes en local) |
| **3 — Multijoueur en ligne** | *Créer une partie* → même écran de format que le solo (Classique/En équipes/Bombe), puis partage le code ; ou *Rejoindre avec un code* |
| **R — Règles** | rappel des commandes, techniques SUPER et fiche de chaque personnage |

> **Mode Bombe** — La balle devient une bombe à mèche (durée réglable, 3
> intensités). Elle explose au bout du délai choisi *ou* dès qu'elle touche
> le sol. Dans les deux cas, **le camp où se trouve la bombe au moment de
> l'explosion perd le point**. Un compte à rebours central et un voile rouge
> indiquent le camp en danger. (Le Smash Battle est désactivé dans ce mode :
> la mèche, elle, ne s'arrête jamais.)

### Commandes & navigation

Voir l’écran **Règles** en jeu (touche R). En résumé : Q/D pour bouger,
Z / Espace pour sauter, **F** pour l’action (lancer au service ; au sol = cloche
selon ta position ; en l’air = smash auto au contact), E pour SUPER. Manette :
stick + X/Y. **P** pause · **M** son · **N** musique.

## Développement

```bash
npm test           # filet de sécurité (simulation déterministe)
```

Structure principale :

| Fichier | Rôle |
|---------|------|
| `index.html` | Page d’accueil, charge les scripts `src/` dans l’ordre |
| `src/core.js` | Constantes, canvas, RNG seedé |
| `src/assets.js` | Sprites PNG (balle, maps) |
| `src/char-sprites.js` | Pipeline sprites personnages |
| `src/audio.js` | Sons, musique chiptune, volume |
| `src/state.js` | Terrains, casting, Blob, supers |
| `src/characters.js` | Rendu personnages (sprites + fallback) |
| `src/physics.js` | Balle & collisions |
| `src/ai.js` | IA |
| `src/terrains.js` | Décors des maps |
| `src/menus.js` | Menus & sélection |
| `src/simulation.js` | Boucle de jeu déterministe |
| `src/net.js` | Multijoueur PeerJS |
| `docs/` | Vision, gameplay V2, architecture, pipeline perso |

Liste complète et ordre de dépendance : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Déploiement

Le jeu est un site statique : n'importe quel serveur web suffit. Copier
`index.html` + les dossiers `src/` et `assets/` (et servir en HTTPS pour le
multijoueur en ligne).

### Déploiement continu (push sur `main` → prod)

Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
lance les tests puis, s'ils passent, synchronise `index.html` + `src/` +
`assets/` vers le serveur en SSH (`rsync`). Il se déclenche à chaque push sur
`main` (ou manuellement via *Run workflow*). Au passage, il remplace le suffixe
`?v=DEV` des balises `<script>` par le SHA du commit (anti-cache) et incrémente
le patch SemVer.

Configurer les secrets du dépôt dans **Settings → Secrets and variables → Actions**
(ne pas les committer ni les coller ici) :

| Secret | Rôle |
|--------|------|
| `DEPLOY_HOST` | Hôte SSH |
| `DEPLOY_USER` | Utilisateur SSH |
| `DEPLOY_SSH_KEY` | Clé privée SSH, encodée en base64 |
| `DEPLOY_WEB_ROOT` | Répertoire web distant |
| `DEPLOY_URL` | URL publique après déploiement |

## Licence

MIT © Benjamin Mille — voir `LICENSE`.
