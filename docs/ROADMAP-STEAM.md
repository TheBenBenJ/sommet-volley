# Roadmap vers Steam — priorités, packaging, sortie

> Feuille de route pragmatique. Le jeu tourne déjà (moteur, netcode, mode
> histoire, 8 persos/maps). Ce qui reste = **désamorcer le risque**, **polir la
> présentation**, **empaqueter** et **lancer un marketing minimal**.

## Priorités (par impact décroissant)

1. **Fictionnalisation** — décisif (juridique + blocages régionaux).
   → [FICTIONNALISATION.md]. ~1 j (texte) + retouche art (voir pt. 2).
2. **Cohérence artistique** — le point le plus visible en review. Passe de style
   unifié + détourages propres sur les 8 persos + maps (pipeline existant :
   PIPELINE-PERSONNAGE.md). Plusieurs jours.
3. **Quickplay + bot-backfill** — si on garde une promesse online.
   → [ONLINE-QUICKPLAY.md]. ~2 j. Sinon : assumer « party game local + bots ».
4. **Contenu & méta** — tournoi, déblocables (cosmétiques/persos), plus de
   chapitres d'histoire, statistiques. Étale la durée de vie.
5. **Juice & options** — feedbacks (écran, sons, particules), menu d'options
   complet (rebind, volume, accessibilité), pause propre, résolutions.

## Packaging (HTML5 → exécutable Steam)

Le jeu est du Canvas 2D → on l'emballe dans un runtime desktop.

- **Recommandé : Electron + `steamworks.js`** (bindings modernes de la
  Steamworks SDK). Fiable, overlay Steam OK, achievements/cloud/rich-presence.
  Contrepartie : binaire ~150 Mo (acceptable).
- Alternatives : **Tauri** (plus léger, webview système, mais intégration
  Steamworks moins clé-en-main + bizarreries de webview) ; **NW.js** (proche
  d'Electron).
- **Steamworks à intégrer** : succès (achievements), sauvegarde cloud (mapper le
  `localStorage` de progression histoire), overlay, éventuellement stats.
- Builds : Windows (priorité), puis macOS/Linux (Electron les gère presque
  gratuitement — bon rapport effort/couverture).

## Store & process Steam

- **Steam Direct** : 100 $ par app (récupérables après seuil de ventes).
- **Fiche boutique** à préparer : capsules (plusieurs tailles), **5+ captures**,
  **un trailer** (30–60 s, montrer le multi + l'angle satirique), descriptions
  courte/longue, tags, langues.
- **Classification d'âge** (questionnaire IARC) : satire politique, pas de
  gore/sexe → probablement *Everyone/Teen*. ⚠️ Déclarer honnêtement le thème
  politique.
- **Délai** : la fiche doit être en ligne **≥ 30 jours** avant la sortie.
- **Dépôts/builds** : SteamPipe (upload des binaires par branche default/beta).

## Marketing minimal (le nerf de la guerre = wishlists)

- **Fiche + trailer en ligne tôt** → accumuler des **wishlists** (le signal qui
  déclenche la visibilité Steam au lancement).
- **Démo jouable** (le mode Histoire acte I + un match rapide) — les démos
  boostent fortement les wishlists.
- **Steam Next Fest** : sortir la démo pendant un Next Fest = pic de visibilité.
- **Angle streamer/presse** : « le jeu de volley où des dirigeants (fictifs) se
  mettent sur la gueule » — pitch court, clippable, à envoyer à des créateurs.
- **Prix** conseillé : **4,99–7,99 €** (party game de niche). Éventuel bundle
  « à deux ».

## Séquencement proposé

| Phase | Contenu | Sortie de phase |
|-------|---------|-----------------|
| **0. Décision** | Choisir le curseur de fictionnalisation (A/B/C) | Go/No-go commercial |
| **1. Dérisquage** | Fictionnalisation texte + passe art | Build montrable sans risque |
| **2. Online** | Quickplay + bot-backfill (ou assumer local) | Online « vivant » ou promesse retirée |
| **3. Contenu/juice** | Tournoi, déblocables, options, polish | Verticale « qualité Steam » |
| **4. Packaging** | Electron + Steamworks, builds Win/Mac/Linux | Exécutable + succès + cloud |
| **5. Store** | Fiche, trailer, démo, wishlists, Next Fest | Page live ≥ 30 j avant sortie |
| **6. Lancement** | Sortie + suivi (patchs, reviews) | 🚀 |

## Verdict de faisabilité

Réaliste pour un projet solo/petit : **oui**, à condition de traiter la
fictionnalisation (sinon risque de refus/blocages) et d'accepter que ce soit un
**petit jeu de niche à ~5 €** — pas un carton, mais un vrai titre publiable,
« Très positif » possible s'il est poli. Le plus dur (le jeu qui tourne) est
déjà fait.

## Liens

- Critique complète : [STEAM-VIABILITE.md](STEAM-VIABILITE.md)
- Fictionnalisation : [FICTIONNALISATION.md](FICTIONNALISATION.md)
- Online : [ONLINE-QUICKPLAY.md](ONLINE-QUICKPLAY.md)
