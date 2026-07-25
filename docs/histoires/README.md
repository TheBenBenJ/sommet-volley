# Histoires & Mode Histoire par personnage

Contenu narratif pour **Sommet Volley** : une biographie riche (farfelue mais
reconnaissable, satire d'archétypes de dirigeants — 100 % fiction, Steam-safe) et
un **mode Histoire dédié** pour chacun des 10 personnages. Dans le mode Histoire
d'un perso, le joueur pilote ce perso (camp gauche) et affronte **ses 9 rivaux** ;
une fois tous battus, la campagne du perso est terminée.

Même procédé que `src/story.js` : rivalité/allié → **Volley**, conflit ouvert →
**Bombe**, gros duels d'Acte III → adversaire **dopé** (IA impitoyable, aura rouge).

## Fichiers

| Perso | Nom | Nation | Map | Super | Fichier |
|---|---|---|---|---|---|
| volkoi | Tsar Volkoï | Bourassie | Place Écarlate | Hiver Général | [volkoi.md](volkoi.md) |
| dorf | Baron Dorf | Doria | Country Club Doré | Le Mur | [dorf.md](dorf.md) |
| cygne | Le Cygne | Gallardie | Palais du Coq | Passage en Force | [cygne.md](cygne.md) |
| bebe | Maréchal Bébé | Ryonganie | Esplanade du Défilé | Batterie AA | [bebe.md](bebe.md) |
| timonier | Le Grand Timonier | Panguo | Cité du Matin | Grande Muraille | [timonier.md](timonier.md) |
| sultan | Le Sultan | Bosforie | Pont des Deux Mondes | Séisme | [sultan.md](sultan.md) |
| gourou | Le Gourou | Bharatie | Stade Ashram | Méditation | [gourou.md](gourou.md) |
| capitaine | Le Capitaine | Tropicalia | Grande Forêt | Déforestation | [capitaine.md](capitaine.md) |
| faucon | Le Faucon | Levantie | Citadelle du Levant | Raid Éclair | [faucon.md](faucon.md) |
| safran | Le Safran | Ramenie | Jardin des Roses | Voile d'Or | [safran.md](safran.md) |

Le brief de rédaction commun : [_BRIEF.md](_BRIEF.md).

## Structure de chaque fichier
1. `## Biographie` — 9 à 11 paragraphes.
2. `## Mode Histoire de <Nom>` — les 9 rencontres en **3 actes**, chacune au format
   exact d'un chapitre `src/story.js` :
   ```js
   { act, title, sub, left:"<ce perso>", right:"<rival>", terrain, mode:"volley"|"bomb"|"flame",
     ai:0..3, doped:null|"R", pre:[{s,t}…], win:[{s,t}…], lose:[{s,t}…] }
   ```

**90 rencontres** au total (10 persos × 9 rivaux), avec dialogues pre/win/lose.

## Intégration (à faire)
Le mode Histoire actuel (`src/story.js`) expose une campagne unique `STORY[]`.
Pour brancher un mode Histoire **par personnage** :
1. Charger la campagne du perso choisi (ces blocs `left:"<perso>"`), p. ex. dans
   un objet `STORY_BY_CHAR = { volkoi:[…], dorf:[…], … }`.
2. Ajouter au hub un choix de personnage avant de jouer la campagne.
3. Réutiliser tel quel le moteur existant (dialogues, lancement de match,
   dopage `doped:"R"`, progression) : les blocs sont au même format.

Les clés perso/terrain/mode sont conformes à `src/state.js` (roster + TERRAINS).
