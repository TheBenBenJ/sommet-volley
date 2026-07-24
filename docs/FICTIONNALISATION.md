# Fictionnalisation — désamorcer le risque « personnes réelles »

> Le changement le plus important pour une sortie Steam. Objectif : **garder le
> sel comique (les archetypes, les clichés nationaux) en supprimant la
> ressemblance avec une personne réelle nommable**. Pas un avis juridique.

## Le principe

Un dirigeant réel = risque (droit à l'image, diffamation, blocages régionaux).
Un **archétype** (l'autocrate glacial, le magnat à la mèche, le technocrate « en
même temps »…) = satire légitime et intemporelle. On vise donc :

1. **Nations fictives** (inventées, jamais un pays réel nommé).
2. **Noms parodiques non-identifiables** (évoquent l'archétype, pas la personne).
3. **Design « composite »** : mélanger des traits pour qu'aucun visage ne soit le
   portrait 1:1 d'un individu (⚠️ c'est ça qui protège, pas juste le nom).

On garde intacts : le gameplay, les kits/supers, les maps, le mode histoire —
tout est *data-driven*, donc c'est surtout de l'édition de texte.

## Le spectre (à toi de choisir le curseur)

- **Option A — Fictionnalisation forte** *(recommandée pour Steam)* : nations +
  noms + designs composites. Safe juridiquement ET région-safe. Perd ~10 % de
  mordant, gagne l'intemporalité.
- **Option B — Milieu** : nations fictives, mais caricatures qui évoquent encore
  fortement l'archétype réel. Plus drôle, un peu plus risqué.
- **Option C — Tel quel** (personnes réelles) : réservé à itch.io / diffusion
  gratuite non commerciale. À éviter sur Steam.

## Proposition concrète (Option A — à amender)

Clés techniques internes **inchangées** (`volkoi`, `dorf`… = dossiers
assets/, packs sprites) — on ne touche qu'au **nom affiché** + textes.

| Clé | Archétype | Nation fictive | Nom proposé | Kit / Super (inchangé) |
|-----|-----------|----------------|-------------|------------------------|
| vladou | L'autocrate glacial, torse bombé, ours & parades | **Bourassie** | Tsar Volkoï | Sang froid · Hiver Général |
| trompette | Le magnat doré, mèche, cravate rouge, golf | **Doria** | Le Doré / Baron Dorf | Ego en béton · Le Mur |
| micron | Le technocrate « en même temps », énarque | **Gallardie** | Le Cygne / Manu-Ordinateur | En même temps · Passage en Force |
| bebe | L'héritier dynastique, uniforme, défilés | **Ryonganie** | Maréchal Bébé | Applaudissements · Batterie AA |
| panda | L'empereur du contrôle, parti unique, muraille | **Panguo** | Le Grand Timonier | Mur invisible · Grande Muraille |
| sultan | Le néo-sultan, deux continents, ambitions | **Bosforie** | Le Sultan (titre, OK) | Séisme · Séisme |
| yogi | L'ascète-manager, méditation, démographie | **Bharatie** | Le Gourou / Swami | Ashram · Méditation |
| jair | Le capitaine populiste, forêt, tronçonneuse | **Tropicalia** | Le Capitaine / Général Tronço | Tronçonneuse · Déforestation |
| faucon | Le faucon sécuritaire, citadelle méditerranéenne | **Levantie** | Le Faucon | Ego · Raid Éclair |

Maps (renommer le `name` du terrain, l'archétype reste) : Place Grand-Rouge →
**Place Écarlate** ; Pelouse Oval → **Country Club Doré** ; Palais de l'Hexagone
→ **Palais du Coq** ; Esplanade du Défilé → inchangé ; Place du Matin → **Cité
Interdite-bis** ; Palais du Bosphore → **Pont des Deux Mondes** ; Stade Ashram →
inchangé ; Amazonie Dorée → **Grande Forêt** ; Citadelle du Levant → inchangé
(Levantie / Le Faucon).

## Ce qu'il faut toucher dans le code (data-driven → rapide)

Renommer les **noms affichés** propage automatiquement partout où `storyCharName`
/ `sideLabel` sont utilisés (HUD, dialogues, hub). À éditer :

1. **`src/state.js`** — `CHARACTERS[].name` (8), `CHARACTERS[].trait/superName/
   superDesc` où un terme est trop identifiable (`49.3` → « Passage en Force »).
   `TERRAINS[].name` (8).
2. **`src/story.js`** — le **texte des dialogues** contient des références en dur
   à corriger : « le plus beau gazon », « 49.3 », « en même temps », « carburant
   militaire », « tronçonneuse », noms de pays implicites, ACT_META. C'est le
   gros du travail rédactionnel (~1 passe sur les 9 chapitres).
3. **Sprites** : idéalement une retouche « composite » des visages (voir plus
   bas). À défaut, les sprites actuels + noms/nations fictifs réduisent déjà
   beaucoup l'identifiabilité.
4. **Tests** : `tests/game.test.js` référence des clés (`bebe`, `dorf`…),
   PAS les noms affichés → **rien à changer** si on garde les clés internes.
5. **Titres/README/store** : « caricatures de dirigeants fictifs ».

Effort estimé : ~1 journée (dont l'essentiel = réécriture des dialogues). Le
moteur ne bouge pas.

## Note artistique (le point qui protège vraiment)

Un nom fictif sur un visage qui EST clairement M. X ne protège pas. Pour chaque
perso, pousser le design **d'un cran vers le composite** :
- exagérer 1–2 traits d'archétype (la mèche, l'uniforme, le costume cintré) ;
- neutraliser les traits d'identification 1:1 (proportions du visage, signes
  trop précis) ;
- assumer le mash-up (« un autocrate d'Europe de l'Est » plutôt que « lui »).

C'est aussi l'occasion de la **passe de cohérence artistique** que réclament les
reviews (cf. STEAM-VIABILITE.md).

## Recommandation

Partir sur **Option A**, garder les clés internes, faire d'abord la passe
texte (noms + nations + dialogues) — jouable et démontrable en une journée —
puis planifier la retouche visuelle composite via le pipeline existant
(PIPELINE-PERSONNAGE.md). On conserve 100 % du gameplay et l'essentiel de
l'humour, on supprime le risque et les blocages régionaux.
