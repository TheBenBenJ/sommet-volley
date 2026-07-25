# Le Grand Timonier — Panguo

## Biographie

On raconte qu'il n'a jamais couru. Ni pour attraper un bus, ni pour fuir une émeute, ni même, dit-on, pour saisir le pouvoir — il a simplement attendu, immobile, que le pouvoir vienne se poser sur son épaule comme une grue sur un pin. Le Grand Timonier, empereur sans couronne de la nation **Panguo**, a fait de l'immobilité une doctrine et de la patience une arme de destruction massive. Là où d'autres dirigeants s'agitent, klaxonnent, tweetent ou gèlent, lui respire. Lentement. Et le monde, autour de ce souffle, s'organise.

Sa capitale, la **Cité du Matin**, est un poème d'ordre. Derrière des **murs cramoisis** hauts comme le déni, sous des **toits d'or** courbés qui semblent sourire au ciel, s'étend un palais dont chaque tuile a été posée selon un plan vieux de mille ans et révisé chaque décennie par un comité de sept hommes identiques. À l'entrée, deux **lions gardiens de pierre** montent une garde qui ne finira jamais : l'un tient sous sa patte un globe, l'autre un lionceau, et tous deux fixent l'horizon de ce regard minéral que le Timonier a fini par copier à la perfection. On dit qu'il s'entraîne devant eux, le soir, à ne pas ciller.

Le soir, justement, la Cité s'allume de **lanternes rouges**. Elles montent le long des avenues comme une marée de braises disciplinées, et le peuple s'incline devant leur douceur ronde. Officiellement, elles célèbrent l'harmonie retrouvée du printemps éternel. Officieusement, chaque lanterne porte, gravé en tout petit sous sa base, un numéro de série, une caméra, et une opinion pré-approuvée. « La lumière rassure, aime répéter le Timonier. Et ce qui rassure surveille. » Sur le terrain de volley bâti au cœur du palais, ces mêmes lanternes se balancent au vent, chaudes et immobiles à la fois — comme lui.

Son emblème est un **panda**. C'est un choix de génie. Qui pourrait craindre un panda ? La créature est ronde, molle, herbivore, elle mange toute la journée et dort le reste ; elle est le triomphe absolu de la mignonnerie diplomatique. Panguo en prête aux zoos du monde entier, comme on prête de l'argent : jamais tout à fait gratuitement, jamais tout à fait rendu. Et derrière les grands yeux cernés de l'animal, il y a deux siècles d'humiliation ravalée et l'appétit tranquille d'un empire qui a décidé de reprendre, un bambou à la fois, tout ce qu'on lui avait pris.

Son parcours ? Une ascension sans bruit. Fils d'un dignitaire tombé puis réhabilité, envoyé jeune « à la campagne se rééduquer » dans une grotte de terre jaune, il en est ressorti sans une plainte et avec une conviction de fer : celui qui a connu la grotte ne craint plus rien du palais. Il a gravi les échelons du grand appareil comme on gravit une montagne sacrée — un pas, une pause, un pas — souriant aux uns, survivant aux autres, ne notant rien mais n'oubliant jamais. Le jour où il est arrivé au sommet, il a fait deux choses : abolir la limite qui l'aurait un jour forcé à partir, et faire ajouter son nom à la constitution, juste après celui des fondateurs. Puis il est allé nourrir les pandas.

Sur le terrain, sa signature est le super **« Grande Muraille »** : d'un geste patient, il fait surgir un rempart au beau milieu du camp adverse. Pas un mur devant lui — devant lui, tout est calme. Un mur chez l'autre, qui coupe le terrain de l'ennemi en deux, l'enferme dans sa propre moitié de moitié, l'oblige à jouer à l'étroit, cerné par sa propre géographie. C'est toute sa politique en une image : je ne t'attaque pas, je te contiens ; je ne franchis pas ta frontière, je la déplace ; je bâtis chez toi le mur que tu finiras par appeler ta maison. La muraille est vieille de deux mille ans et elle n'a jamais servi à sortir — seulement à décider qui reste dedans.

Sa voix est un métronome. Il parle du **« tempo »** comme d'autres parlent de Dieu. « Contrôle le tempo, et tu contrôles le monde » : il l'a fait broder sur les rideaux de la salle du trône. Il ne hausse jamais le ton, ne rit jamais aux éclats, ne transpire pas. Face aux gesticulations du Baron Dorf, aux gels du Tsar, aux fanfaronnades du Maréchal, il oppose la même chose, toujours : **l'harmonie**. Un mot doux qui, dans sa bouche, signifie « fais silence ». Ses menaces sont des proverbes ; ses ultimatums, des invitations à prendre le thé. On sort de son bureau flatté, apaisé, souriant — et l'on s'aperçoit trois semaines plus tard qu'on a signé la reddition de ses ports.

Il a ses obsessions. La **ponctualité cosmique** : ses trains partent à l'heure, ses fleuves changent de lit à l'heure, ses recensements comptent tout, jusqu'aux nuages. Le **long terme** : il pense en dynasties, pas en mandats ; quand on lui demande le bilan d'une révolution vieille de deux siècles, il répond « c'est trop tôt pour juger ». Et une **nouvelle route de la soie** qu'il déroule autour de la planète comme un immense tapis, port après port, pont après pont, dette après dette — non pas pour conquérir, jure-t-il, mais pour « connecter ». Un jour, tout le monde sera connecté. Et le fil, forcément, remontera jusqu'à la Cité du Matin.

Son drapeau ne claque pas au vent ; il ondule. Rouge, comme les murs, comme les lanternes, comme la patience contenue d'un peuple immense. Le Grand Timonier le regarde monter chaque matin depuis la terrasse aux toits d'or, entre ses deux lions de pierre, et il sourit à peine. Il a le temps. Il a toujours eu le temps. Les Jeux du Sommet peuvent commencer : les autres viennent pour gagner un match. Lui vient pour gagner le siècle.

## Mode Histoire de Le Grand Timonier

```js
// =============================================================================
// MODE HISTOIRE — Le Grand Timonier (timonier) · « La Patience de l'Empire »
// left = "timonier" partout. À coller dans le STORY[] de src/story.js.
// =============================================================================
const STORY_TIMONIER = [
  // ===================== ACTE I — L'harmonie des vassaux (Volley) ==============
  {
    act: 1, title: "Le petit frère", sub: "Panguo–Ryonganie · parrainage & défilés",
    left: "timonier", right: "bebe", terrain: 3, mode: "volley", ai: 0, doped: null,
    pre: [
      { s: "narrator", t: "Esplanade du Défilé. Sous le radar qui tourne, le plus jeune des dirigeants reçoit le plus patient. On sait déjà qui paie l'électricité." },
      { s: "bebe", t: "Grand voisin ! Tu as vu mon défilé ? Mille pas à la seconde, tous parfaitement synchrones. J'ai même un nouveau radar !" },
      { s: "timonier", t: "Beau défilé. Belle énergie. Le charbon qui l'alimente, il vient de chez moi. Comme le riz. Comme le reste." },
      { s: "bebe", t: "Détail ! Ce soir je saute au filet, j'interdis à ta muraille de bouger, et je fanfaronne devant les caméras !" },
      { s: "timonier", t: "Saute autant que tu veux, petit frère. Je contrôle le tempo. Et j'éteins l'électricité quand tu dépasses la mesure." },
      { s: "narrator", t: "Volley d'entraînement entre patron et protégé. La bombe reste au vestiaire — pour l'instant." }
    ],
    win: [
      { s: "timonier", t: "Voilà. On te laisse fanfaronner, on te laisse défiler. Tant que tu sers dans mon tempo." },
      { s: "bebe", t: "J'ai perdu MAIS c'était magnifique ! Je remets ça dès que tu rallumes le courant, d'accord ?" }
    ],
    lose: [
      { s: "bebe", t: "Battu le grand voisin ! Nouveau bulletin spécial ! Défilé de la victoire à l'aube !" },
      { s: "timonier", t: "Amuse-toi. Le carburant de ta joie passe par mes gazoducs. L'harmonie revient toujours à moi." }
    ]
  },
  {
    act: 1, title: "L'amitié sans limites", sub: "Panguo–Bourassie · axe de revers",
    left: "timonier", right: "volkoi", terrain: 0, mode: "volley", ai: 1, doped: null,
    pre: [
      { s: "narrator", t: "Place Écarlate, sous la neige. Deux géants signent une amitié « sans limites »… en relisant deux fois les petites lignes." },
      { s: "volkoi", t: "L'hiver travaille pour moi, Timonier. Je gèle ton camp, et tu grelottes comme les autres." },
      { s: "timonier", t: "Gèle ce que tu veux. C'est encore moi qui t'achète ton pétrole, à mon prix, dans ma monnaie." },
      { s: "volkoi", t: "« Sans limites », avions-nous dit. J'aime ce mot. Il n'engage à rien de précis." },
      { s: "timonier", t: "« Sans limites » veut dire : ma limite à moi. Tu me vends ton gaz au rabais, je te vends ma patience. Sers." },
      { s: "volkoi", t: "Un partenaire junior qui se croit senior. Amusant. Balle au centre, camarade." }
    ],
    win: [
      { s: "timonier", t: "Une amitié équilibrée : tu offres le froid, j'offre le marché. Devine qui tient le portefeuille." },
      { s: "volkoi", t: "Tu gagnes le set. Moi je garde l'hiver. On se comprend. C'est déjà rare." }
    ],
    lose: [
      { s: "volkoi", t: "Le gel a eu raison de ta muraille. Même les empires patients grelottent, parfois." },
      { s: "timonier", t: "Un revers. Temporaire. Tu as l'hiver ; moi j'ai le siècle. Je patiente." }
    ]
  },
  {
    act: 1, title: "La route de la soie", sub: "Panguo–Bosforie · ports, ponts & dettes",
    left: "timonier", right: "sultan", terrain: 5, mode: "volley", ai: 1, doped: null,
    pre: [
      { s: "narrator", t: "Pont des Deux Mondes. Un tapis volant passe au-dessus du détroit — bientôt il y aura aussi un port, une autoroute, et une facture." },
      { s: "sultan", t: "Sur MON détroit, entre deux continents, c'est moi le carrefour du monde ! Je défonce au smash !" },
      { s: "timonier", t: "Beau carrefour. Je voudrais y bâtir un port. Et un pont. Et une gare. Je paie tout. Tu signes ici." },
      { s: "sultan", t: "Tu déroules ta route de la soie jusque sous mes dômes ! Grandiose… mais coûteux, non ?" },
      { s: "timonier", t: "Coûteux pour toi plus tard. Gratuit pour toi maintenant. C'est la beauté du tapis : on ne voit pas où il mène." },
      { s: "sultan", t: "Un néo-sultan et un empereur, à négocier sur un pont. L'Histoire adore ce genre de scène. Servons !" }
    ],
    win: [
      { s: "timonier", t: "Ton port est magnifique. Il m'appartiendra dans quatre-vingt-dix-neuf ans. Merci de l'entretenir d'ici là." },
      { s: "sultan", t: "J'ai perdu le match mais gardé ma superbe. Et… j'ai vraiment signé ce contrat de port ?" }
    ],
    lose: [
      { s: "sultan", t: "Le carrefour du monde reste debout ! Ton tapis s'arrête à mon pont, l'empereur !" },
      { s: "timonier", t: "Reste debout. Le fil de soie, lui, est déjà passé sous tes fondations. Je ne suis pas pressé." }
    ]
  },

  // ===================== ACTE II — Le monde résiste (Volley tendu) =============
  {
    act: 2, title: "Le dérisquage", sub: "Panguo–Gallardie · « en même temps » stratégique",
    left: "timonier", right: "cygne", terrain: 2, mode: "volley", ai: 2, doped: null,
    pre: [
      { s: "narrator", t: "Palais du Coq. Un coq héraldique doré fanfaronne sur sa bannière bleue. En face, un mur cramoisi patiente." },
      { s: "cygne", t: "Cher Timonier, nous ne nous découplons pas. Nous « dérisquons ». En même temps, nous restons partenaires." },
      { s: "timonier", t: "« Dérisquer », « découpler »… jolis verbes. Pendant que tu les conjugues, je livre tes voitures et tes panneaux solaires." },
      { s: "cygne", t: "L'Europe cherche son autonomie stratégique. En même temps, elle aime beaucoup ton marché. C'est subtil." },
      { s: "timonier", t: "C'est surtout contradictoire. Le coq chante fort et court peu. Moi je marche lentement et j'arrive partout." },
      { s: "cygne", t: "En même temps… un coq, ça réveille. Servons, empereur. On verra qui tient la distance." }
    ],
    win: [
      { s: "timonier", t: "Autonomie stratégique : le rêve de dépendre un peu moins de moi, tout en achetant un peu plus. Charmant." },
      { s: "cygne", t: "Match perdu, position nuancée. En même temps, la nuance est une victoire en soi. Non ?" }
    ],
    lose: [
      { s: "cygne", t: "Le coq a chanté juste ! Partenaires, rivaux, systémiques — tout à la fois. C'est ça, la Gallardie." },
      { s: "timonier", t: "Chante donc. Tes usines commandent mes batteries en coulisse. L'harmonie se moque des slogans." }
    ]
  },
  {
    act: 2, title: "Le grenier du monde", sub: "Panguo–Tropicalia · soja, minerais & BRICS",
    left: "timonier", right: "capitaine", terrain: 7, mode: "volley", ai: 2, doped: null,
    pre: [
      { s: "narrator", t: "Grande Forêt. Un ara traverse la canopée dorée. En bas, l'empereur commande — poliment — la moitié de la récolte." },
      { s: "capitaine", t: "Ma tronçonneuse rugit, l'empereur ! J'abats, je plante du soja, je te le vends. Pas de chichi entre nous." },
      { s: "timonier", t: "Ton soja, ton minerai de fer, ton bœuf : j'achète tout. Coupe autant d'arbres qu'il faut. Je regarde ailleurs." },
      { s: "capitaine", t: "Un client qui ne fait jamais la morale sur ma forêt ! Toi au moins tu comprends le business." },
      { s: "timonier", t: "La morale, je la laisse au Cygne. Moi je passe commande. Un partenaire, ça ne fait pas la leçon. Ça signe." },
      { s: "capitaine", t: "Deux fauves d'accord sur le fric ! Servons avant que l'écolo ne débarque avec ses pancartes." }
    ],
    win: [
      { s: "timonier", t: "Tu abats, je stocke. Ta forêt nourrit mes ports. Un partenariat sans questions gênantes." },
      { s: "capitaine", t: "Battu par l'empereur ! Bah, tant qu'il achète mon soja, je peux perdre au volley, moi." }
    ],
    lose: [
      { s: "capitaine", t: "Gagné contre le Timonier ! La tronçonneuse a smashé la muraille ! Grande soirée, patron !" },
      { s: "timonier", t: "Gagne le match. Je garde le carnet de commandes. C'est moi qui écris la fin de l'histoire." }
    ]
  },
  {
    act: 2, title: "Le pétrole sous embargo", sub: "Panguo–Ramenie · brut à prix d'ami",
    left: "timonier", right: "safran", terrain: 9, mode: "flame", ai: 2, doped: null,
    pre: [
      { s: "narrator", t: "Jardin des Roses. Un paon déploie sa roue sous les arcades turquoise. En face, un empereur qui n'admire jamais rien trop longtemps." },
      { s: "safran", t: "L'Occident m'étrangle de sanctions, empereur. Mais toi… toi tu achètes mon brut. Discrètement. Sagement." },
      { s: "timonier", t: "Sanctionné, tu vends moins cher. Moins cher, j'achète plus. Ta colère contre l'Ouest fait mes marges." },
      { s: "safran", t: "Le paon fait la roue, mais c'est toi qui comptes les plumes. Mesuré. Presque cruel." },
      { s: "timonier", t: "Pas cruel. Patient. Ton pétrole, ma monnaie, mon rythme. Un axe où j'écris le tempo. Sers." },
      { s: "safran", t: "Un partenariat de survie contre un partenariat de conquête. Faisons semblant que c'est le même. Balle au filet." }
    ],
    win: [
      { s: "timonier", t: "Un client fidèle vaut mieux qu'un allié bruyant. Ton isolement, vois-tu, est ma meilleure remise." },
      { s: "safran", t: "Tu gagnes, et tu gagnes encore sur mon dos. Le Safran retient. Le paon aussi a de la mémoire." }
    ],
    lose: [
      { s: "safran", t: "Le voile d'or a ralenti ta muraille, empereur. Même les patients trébuchent sur une roseraie." },
      { s: "timonier", t: "Un set perdu dans un jardin. Le baril, lui, coule toujours vers mes ports. Je patiente." }
    ]
  },

  // ===================== ACTE III — Les vraies frontières (Bombe) ==============
  {
    act: 3, title: "La puce et l'aigle", sub: "Panguo–Levantie · silicium, espions & drones",
    left: "timonier", right: "faucon", terrain: 8, mode: "bomb", ai: 3, doped: "R",
    pre: [
      { s: "narrator", t: "Citadelle du Levant. Sur les remparts de grès, un faucon guette. Le ballon est une bombe : ce soir, on ne parle plus commerce, mais secrets." },
      { s: "faucon", t: "Tes puces sont partout dans mes systèmes, empereur. Et tes ingénieurs copient les miens. Ça s'appelle un vol." },
      { s: "timonier", t: "« Vol », « copie »… Je préfère « transfert de technologie ». Tout ce qui traverse ma muraille devient mien. C'est la géographie." },
      { s: "faucon", t: "Je frappe vite et sans prévenir. Mon Raid Éclair t'interdit de sauter. Reste au sol, pendant que je vole tes brevets en retour." },
      { s: "narrator", t: "Le regard du Faucon vire au rouge. L'espionnage rend nerveux — et le carburant militaire, plus vif encore." },
      { s: "timonier", t: "Frappe vite. Moi je bâtis lent. Ma muraille coupe ton camp en deux avant que ton aigle n'ait battu de l'aile. Sers." }
    ],
    win: [
      { s: "timonier", t: "Tu voles mes puces ; je bâtis les tiennes. Devine qui, dans dix ans, tient encore l'usine." },
      { s: "faucon", t: "Une manche perdue. Mes drones connaissent le chemin de ta Cité, maintenant. On se reverra." }
    ],
    lose: [
      { s: "faucon", t: "Raid réussi, muraille percée. La vitesse mange la patience quand la patience s'endort." },
      { s: "timonier", t: "Tu perces un mur. J'en bâtis mille. Frappe l'éclair ; moi je grave le silicium. Le siècle nous départagera." }
    ]
  },
  {
    act: 3, title: "La guerre froide des tarifs", sub: "Panguo–Doria · muraille d'or contre muraille rouge",
    left: "timonier", right: "dorf", terrain: 4, mode: "bomb", ai: 3, doped: null,
    pre: [
      { s: "narrator", t: "Cité du Matin. Les lanternes rouges se balancent. Face à l'empereur, le Baron dresse un mur d'or contre un mur cramoisi. La bombe compte les points." },
      { s: "dorf", t: "Des tarifs ! Des tarifs colossaux ! Cent pour cent sur tes ballons, deux cents sur ton filet, mille pour cent sur ta muraille !" },
      { s: "timonier", t: "Taxe tout. Tes usines, tes jouets, tes drapeaux « fabriqués chez toi »… c'est encore ma Cité qui les assemble." },
      { s: "dorf", t: "Je bâtis LE plus beau mur du monde, un mur d'or, et je te ferme mon marché ! On se découple, empereur !" },
      { s: "timonier", t: "Tu bâtis un mur devant toi ; moi j'en bâtis un au milieu de ton camp. Le tien te protège. Le mien t'enferme." },
      { s: "dorf", t: "Guerre commerciale ! La plus grande guerre commerciale de l'histoire ! Et je vais la GAGNER, comme toujours !" }
    ],
    win: [
      { s: "timonier", t: "Deux murs, deux empires. Le tien brille ; le mien dure. Reviens quand tes rayons seront vides." },
      { s: "dorf", t: "Truqué ! Subventionné ! Manipulation de monnaie ! … Bon. Combien pour rouvrir tes chaînes, au fait ?" }
    ],
    lose: [
      { s: "dorf", t: "Boum ! Chez toi ! On gagne la guerre des tarifs ! On gagne tellement que la Cité en pleure !" },
      { s: "timonier", t: "Une manche pour l'or. Le temps, lui, joue en rouge. J'attends. J'ai deux mille ans d'entraînement." }
    ]
  },
  {
    act: 3, title: "Le toit du monde", sub: "Finale · Panguo–Bharatie · la crête et le tempo",
    left: "timonier", right: "gourou", terrain: 4, mode: "bomb", ai: 3, doped: "R",
    pre: [
      { s: "narrator", t: "Finale, à la Cité du Matin. Les lanternes rouges brûlent bas, les lions de pierre veillent. Deux milliards d'âmes retiennent leur souffle : c'est la frontière qui se joue." },
      { s: "gourou", t: "Namasté, empereur. Mais ce soir j'ai laissé le namasté au vestiaire. Sur la crête, tu as poussé ta ligne trop loin." },
      { s: "timonier", t: "La ligne passe où l'harmonie le décide. Et l'harmonie, c'est moi. Ta démographie ne joue pas au volley pour toi." },
      { s: "gourou", t: "Non. Mais elle carbure. Regarde mes veines : ce soir je ne médite plus, je brûle. Ta muraille va rencontrer ma colère." },
      { s: "narrator", t: "L'œil du Gourou s'injecte de rouge. La patience de l'empire contre la fureur ascétique — et une bombe entre les deux camps." },
      { s: "timonier", t: "Brûle donc. Le feu s'épuise ; la muraille reste. Je bâtis un mur au cœur de ton camp et je contrôle le tempo. Sers, voisin." }
    ],
    win: [
      { s: "timonier", t: "Le calme a tenu la crête. Deux mille ans de patience contre une nuit de carburant : le siècle a choisi la muraille." },
      { s: "gourou", t: "J'ai troqué mon souffle contre du feu, et j'ai perdu la ligne. La montagne, elle, se souviendra de tout." }
    ],
    lose: [
      { s: "gourou", t: "Le feu a fendu ta muraille, empereur. Même la patience du panda a un versant qui s'effondre." },
      { s: "timonier", t: "Une frontière cède un soir. L'empire compte en dynasties, pas en défaites. Je rentre au palais. Et je patiente." }
    ]
  }
];
```

### Notes de campagne

- **Acte I (Volley, ai 0→1)** — L'empereur range ses vassaux et partenaires *dociles* : le petit frère **Maréchal Bébé** (parrainage énergétique), l'ami « sans limites » **Tsar Volkoï** (axe de revers, pétrole au rabais), le carrefour **Le Sultan** (route de la soie, ports & dettes). Ton : patience-menace souriante, aucune bombe.
- **Acte II (Volley tendu, ai 2)** — Le monde *résiste* poliment : **Le Cygne** et son « dérisquage » (en même temps), **Le Capitaine** grenier-du-monde (soja/minerais, zéro leçon de morale), **Le Safran** sous embargo (brut à prix d'ami). Rivalités commerciales, encore sans mèche.
- **Acte III (Bombe, ai 3)** — Les *vraies* lignes : la guerre du silicium/espionnage avec **Le Faucon** (`doped: "R"`), la guerre froide des tarifs avec **Baron Dorf** (mur d'or contre mur rouge, non dopé — il fanfaronne, il ne « carbure » pas), puis la **finale** de frontière contre **Le Gourou** (`doped: "R"`) à domicile, sur la crête himalayenne transposée.
- **Voix du Timonier** : jamais un cri. « Le tempo », « l'harmonie », « je patiente », « le siècle nous départagera ». Chaque menace est un proverbe ; chaque contrat, une politesse. Son super **Grande Muraille** revient comme un leitmotiv : *il ne se protège pas, il enferme l'autre*.
