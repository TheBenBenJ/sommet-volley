# Brief — Histoires & Mode Histoire par personnage (Sommet Volley)

Ce document est la **référence commune** pour rédiger l'histoire de chaque personnage.
Chaque perso a son propre fichier `docs/histoires/<key>.md`.

## But
Le jeu est un volley 2D satirique où des **caricatures parodiques de dirigeants
mondiaux** s'affrontent. On veut, pour CHAQUE personnage, une **biographie riche,
parfois farfelue, mais qui ressemble quand même à celle du vrai dirigeant
représenté**, et un **mode Histoire dédié** : le perso (joué par le joueur, camp
gauche) rencontre **TOUS ses rivaux** (les 9 autres) ; une fois tous battus, son
mode Histoire est terminé.

Même procédé que le mode Histoire actuel (`src/story.js`) — **⅓ / ⅓ / ⅓** :
- **Acte I** (3 rencontres) → mode **Volley** (rivalités légères).
- **Acte II** (3 rencontres) → mode **Ballon enflammé** (`flame`) — chaque contact brûle, PV à 0 = point perdu.
- **Acte III** (3 rencontres) → mode **Bombe** (la balle est une bombe à mèche).
- Dialogues **adaptés au mode** (mécanique nommée au moins une fois par le narrateur).
- Certains adversaires se **« dopent »** aux gros enjeux (IA impitoyable, aura rouge) : `doped: "R"`.

## ⚠️ Steam-safe (IMPÉRATIF)
Utiliser **UNIQUEMENT les noms fictionnels** (jamais les vrais noms de dirigeants,
partis, pays réels dans le texte du jeu). Pas de vrais drapeaux/emblèmes. La satire
vise l'archétype, pas la personne réelle. On peut évoquer les faits/relations
réels de façon **transposée** (fiction). Le « vrai dirigeant » ci-dessous n'est
qu'une clé d'inspiration pour toi — il ne doit PAS apparaître littéralement.

## Roster (clé · nom · nation fictive · inspiration · super · map)

| key | Nom | Nation | Inspiration (interne) | Super | Map (terrain idx) | Event de map | Décor/drapeau |
|---|---|---|---|---|---|---|---|
| volkoi | Tsar Volkoï | Bourassie | autocrate slave | **Hiver Général** (gèle/glace le camp adverse) | Place Écarlate (0) | canon d'apparat (tir) | forteresse de briques cramoisies enneigée, bulbe rouge lointain, bannières bleu/vert, canon sur traîneau, drapeau héraldique |
| dorf | Baron Dorf | Doria | magnat-président | **Le Mur** (mur d'or bloque le sol adverse) | Country Club Doré (1) | voiturette de golf klaxon | resort doré, tour hôtel dorée à toit plat, fontaine, palmiers, gazon |
| cygne | Le Cygne | Gallardie | jeune technocrate | **Passage en Force** (tes frappes ne peuvent + être smashées) | Palais Gallard (2) | pigeons | palais néoclassique, obélisque abstrait, cygne stylisé doré sur bannière bleue |
| bebe | Maréchal Bébé | Ryonganie | héritier dynastique | **Batterie AA** (interdit de sauter au camp adverse) | Esplanade du Défilé (3) | radar (allumé/éteint) | esplanade brutaliste, gradins de granit, arc abstrait, bannières unies, radar militaire |
| timonier | Le Grand Timonier | Panguo | empereur impassible | **Le Rempart** (mur au milieu du camp adverse) | Cité du Matin (4) | lanternes | palais aux murs cramoisis, toits d'or, lanternes rouges, lions gardiens de pierre |
| sultan | Le Sultan | Bosforie | néo-sultan | **Séisme** (interdit de sauter + tremblement) | Pont des Deux Mondes (5) | tapis volant | palais sur détroit entre deux continents, dômes/tours, barques, bannière violette à liseré doré |
| gourou | Le Gourou | Bharatie | gourou-manager | **Méditation** (gèle/glace le camp adverse, façon zen) | Stade Ashram (6) | vache qui traverse | stade de grès miel, façade à arches festonnées, guirlandes de soucis orange, palmiers, vache qui traverse |
| capitaine | Le Capitaine | Tropicalia | ex-militaire populiste | **Déforestation** (mur de troncs bloque le sol) | Grande Forêt (7) | ara (macaw) | clairière de jungle dorée, huttes sur pilotis, canopée, court en terre rouge |
| faucon | Le Faucon | Levantie | faucon composite | **Raid Éclair** (interdit de sauter au camp adverse) | Citadelle du Levant (8) | faucon en vol | citadelle de grès sur colline désertique face à la mer, dômes anciens + tours de verre, remparts, faucon |
| safran | Le Safran | Safranie | premier composite des hautes terres | **Voile d'Or** (ralentit le camp adverse) | Jardin des Roses (9) | paon | jardin de roses de palais, arcades à tuiles turquoise, dômes en dôme, roseraie |

### Inspirations internes (NE PAS écrire dans le jeu — repère pour toi)
volkoi≈Poutine/Russie · dorf≈Trump/USA · cygne≈Macron/France · bebe≈Kim/Corée du Nord ·
timonier≈Xi/Chine · sultan≈Erdoğan/Turquie · gourou≈Modi/Inde · capitaine≈Bolsonaro/Brésil ·
faucon≈Netanyahou/composite Israël · safran≈composite Iran.

### Pistes de relations réelles (transposées) pour choisir Volley / Flamme / Bombe
- **Bourassie (volkoi)** : conflit ouvert avec le Consortium (Cygne, Faucon) → *bombe* ; entente froide avec Panguo, Ryonganie, Safranie → *volley* ; rivalité-flatterie ambiguë avec Baron Dorf → *volley*.
- **Baron Dorf (dorf)** : bravade/rivalité avec presque tous (*volley*), guerre commerciale avec le Timonier, « bromance » étrange avec Maréchal Bébé, tension d'alliance avec Le Cygne ; duel plus dur avec Le Safran (*bombe* possible).
- **Le Cygne (cygne)** : allié du Consortium (*volley*), friction mer intérieure/adhésion avec Le Sultan, clash écolo célèbre avec Le Capitaine (forêt !), *bombe* avec le Tsar.
- **Maréchal Bébé (bebe)** : nucléaire/isolé → beaucoup de *bombe* avec le Consortium ; entente avec Panguo, Bourassie.
- **Le Grand Timonier (timonier)** : rivalité de frontière avec Le Gourou → *bombe* ; guerre froide commerciale avec Baron Dorf ; alliances Bourassie/Ryonganie.
- **Le Sultan (sultan)** : tensions Union/Cygne, mer intérieure, dossiers régionaux.
- **Le Gourou (gourou)** : conflit de crête avec Le Timonier (*bombe*), rivalités régionales.
- **Le Capitaine (capitaine)** : forêt vs Cygne (le fameux clash — *bombe* ou volley musclé), style populiste.
- **Le Faucon (faucon)** : Moyen-Orient → **grand duel *bombe* avec Le Safran** ; tensions multiples.
- **Le Safran (safran)** : conflit avec Le Faucon (*bombe*) et Baron Dorf (*bombe*) ; ententes Bourassie/Panguo.

> Garde la montée en tension : 3 *volley* → 3 *flame* → 3 *bombe* (ordre des
> chapitres = ordre de rivalité croissante). Les pistes ci-dessus aident à
> choisir QUELS rivaux mettre dans quel acte, pas à casser le ⅓ / ⅓ / ⅓.

## Format du fichier `<key>.md`
Deux parties :

### 1) Biographie (`## Biographie`)
6 à 12 paragraphes riches. Ton : satirique, drôle, cultivé. **Farfelu mais
reconnaissable**. Fais référence à : sa nation fictive, son parcours transposé,
sa **map** et son **décor** (ex. le canon de la Place Écarlate, l'obélisque du Palais,
la vache du Stade Ashram, le tapis volant du Pont des Deux Mondes…), son **drapeau**,
son **super** (comme un « trait de caractère » : le Tsar qui gèle tout, le Baron
qui bâtit des murs, etc.), son **event de map**. Invente une mythologie personnelle
cocasse (surnoms, manies, obsessions) qui colle à l'archétype réel transposé.

### 2) Mode Histoire (`## Mode Histoire de <Nom>`)
Le perso rencontre **les 9 autres**. Organise en **3 actes × 3 rencontres** :
Acte I *volley* → Acte II *flame* → Acte III *bomb* (+ dopage possible en finale).
Pour CHAQUE rencontre, un bloc au format `src/story.js` (données JS, prêtes à coller) :

```js
{
  act: 1, title: "…", sub: "…thème transposé…",
  left: "<CE PERSO>", right: "<clé rival>", terrain: <idx>, mode: "volley"|"flame"|"bomb", ai: 0..3, doped: null|"R",
  pre:  [ { s: "narrator", t: "…" }, { s: "<perso>", t: "…" }, … ],
  win:  [ { s: "…", t: "…" }, … ],   // dialogue quand LE JOUEUR (ce perso) gagne
  lose: [ { s: "…", t: "…" }, … ]    // dialogue quand le joueur perd
}
```
- `left` = TOUJOURS ce perso (le protagoniste). `right` = le rival.
- `terrain` = souvent la map du rival OU une map neutre thématique (idx dans le tableau ci-dessus).
- `ai` monte au fil des actes (0→3). `doped: "R"` sur 1-2 gros adversaires d'Acte III.
- `s` = clé perso (`volkoi`, `cygne`, …) ou `"narrator"`.
- **Dialogues riches** : 4-6 répliques en `pre`, 2-3 en `win`/`lose`. Drôles, mordants,
  référencés (géopolitique transposée + éléments de jeu : le super, l'event, le décor,
  le drapeau). Chaque voix doit être caractérisée (le Baron se vante, le Cygne fait du
  « en même temps », le Tsar est glacial, le Maréchal fanfaronne, le Timonier est zen-menaçant,
  le Sultan est grandiloquent, le Gourou est serein-piquant, le Capitaine est rude-blagueur,
  le Faucon est intransigeant, le Safran est mesuré-sardonique).

## 2v2 / alliances (IMPÉRATIF)
Le chapitre d'ouverture (acte I, mode `2v2`) doit coller à des **alliances plausibles**
(transposées) : `ally` = partenaire crédible du protagoniste ; `right`+`right2` = camp
adverse cohérent. Exemples stables :
- Consortium : Cygne ↔ Dorf ; Faucon ↔ Dorf
- Axe Est : Volkoï ↔ Timonier ; Bébé sous tutelle du Timonier ; Safran ↔ Volkoï
- Gourou ↔ Faucon (sécurité) ; Capitaine ↔ Dorf (populistes) ; Sultan ↔ Volkoï (deal froid)
Éviter les absurdes (ex. Cygne+Safran contre Dorf, Bébé qui affronte le Timonier en binôme adverse).

## Rappels de style (voix existantes, à réutiliser)
- **Baron Dorf** : superlatifs, « le plus beau … du monde », « match truqué ! », vantardise.
- **Le Cygne** : « en même temps… », posture de premier de la classe, formules diplomatiques.
- **Tsar Volkoï** : glacial, laconique, menaçant, ironie froide, « l'hiver travaille pour moi ».
- **Le Grand Timonier** : calme impérial, « le tempo », « l'harmonie », patience-menace.
- **Le Sultan** : grandiloquent, « je défonce au smash », fierté impériale.
- **Le Gourou** : « Namasté », sérénité + pique, endurance, méditation.
- Invente/prolonge pour les autres dans le même esprit.

Écris en **français**. Sois généreux (c'est du contenu riche et marrant qui est demandé).
