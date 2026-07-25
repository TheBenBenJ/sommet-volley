# Tsar Volkoï — Bourassie

> Clé roster : `volkoi` · Nation : **Bourassie** · Super : **Hiver Général** · Map : **Place Écarlate** (idx 0) · Event : canon d'apparat

## Biographie

On raconte en Bourassie que le Tsar Volkoï n'est pas né : il a *gelé* dans le ventre d'un glacier, un matin où le thermomètre lui-même avait renoncé. La légende est évidemment officielle — c'est le ministère de la Vérité Éternelle qui l'a rédigée, relue et rendue obligatoire dans les manuels scolaires. Ce qu'on sait de source plus tiède, c'est qu'il a grimpé tous les échelons de l'appareil sans jamais transpirer, passant du bureau des Ombres à la salle du trône avec la régularité d'un mercure qui descend. Aujourd'hui il règne sur la **Place Écarlate**, forteresse de briques cramoisies posée sous une neige qui ne fond jamais, un bulbe rouge scintillant au loin comme une bougie sur un gâteau qu'il est seul à pouvoir souffler.

Son visage est un lac gelé : lisse, plat, et vous savez qu'il y a quelque chose de très froid en dessous. Le Tsar ne crie pas, ne s'agite pas, ne fanfaronne pas — il laisse ce folklore aux magnats et aux maréchaux. Sa méthode est plus simple : il attend. Il a fait de la patience une arme de destruction massive. « L'hiver travaille pour moi », répète-t-il à qui veut, et à qui ne veut pas, d'une voix si posée qu'elle semble sortir d'un congélateur bien entretenu. Quand ses adversaires s'épuisent à courir, à klaxonner, à méditer, à bâtir des murs, lui reste immobile, et le froid fait le reste.

De là son fameux **Hiver Général**, ce super qui saisit d'un coup le camp d'en face et le transforme en patinoire pour blobs frigorifiés. Ce n'est pas une technique, insiste le protocole d'État : c'est un trait de caractère. Le Tsar *est* le gel. Il gèle les fronts, les négociations, les conflits qu'il appelle poétiquement « frozen » et qu'il ressort du congélateur quand ça l'arrange, encore emballés, à peine givrés. Ses adversaires jurent que le terrain se refroidit rien qu'à son arrivée, avant même qu'il ait servi. C'est faux, corrige la propagande : le terrain se refroidit *par respect*.

Sa nation, la **Bourassie**, est un empire qui déteste qu'on l'appelle un empire tout en agissant exactement comme tel. Immense, hérissée de fuseaux horaires, elle produit du gaz, des céréales, des champions d'échecs et une quantité industrielle de nostalgie. Sa bannière — bleu et vert sur héraldique compliquée, un aigle qui regarde des deux côtés à la fois pour ne jamais être pris par surprise — flotte sur des remparts que le Tsar aime décrire comme « défensifs », un adjectif qu'il applique aussi à ses parties de volley, ses invasions de gazon adverse, et sa collection de voisins inquiets.

Le clou du spectacle, sur la Place Écarlate, c'est le **canon d'apparat** monté sur traîneau, hérité d'un aïeul qui adorait tirer sur les choses pour marquer les grandes occasions — un couronnement, une victoire, un mardi. Officiellement, le canon ne sert qu'à la parade : une salve de fumée, un boum majestueux, les corbeaux qui décollent du bulbe rouge. Officieusement, tout le monde sur le terrain sait que le canon *peut* tirer autre chose que de la fumée, et cette ambiguïté est précisément le point. Le Tsar adore les objets qui font peur sans qu'on ait jamais à s'en servir. Le canon est sa diplomatie : bruyant, décoratif, chargé.

On lui prête une jeunesse d'agent de l'ombre dans les services de renseignement bourassiens, où il aurait appris l'art de ne jamais montrer sa main — ni au poker, ni au filet. Il joue au volley comme il gouverne : peu de mouvements, beaucoup de menace, et toujours ce sourire qui n'atteint jamais les yeux. Quand il gagne, il ne célèbre pas. Quand il perd, il ne concède pas ; il « suspend temporairement ». Chez lui, une défaite n'existe pas, il n'y a que des victoires qui prennent leur temps.

Ses relations avec le reste du roster sont un cours de géopolitique givrée. Avec l'Ouest — le mielleux **Cygne** de Gallardie, l'intraitable **Faucon** de Levantie — c'est la bombe : littéralement, dans le mode Bombe, une mèche qui grésille entre deux fronts qui ne veulent pas céder. Avec ses partenaires de l'entente froide — le **Grand Timonier** impassible, le jeune **Maréchal Bébé** et son radar, le mesuré **Safran** — c'est le volley d'affaires, poli, calculateur, chacun comptant les barils dans la tête de l'autre. Et puis il y a le **Baron Dorf**, cette bromance étrange faite de flatteries croisées où l'on ne sait jamais qui manipule qui : le Tsar sourit, le Baron se vante, et les analystes du monde entier prennent des notes affolées.

Ses manies sont célèbres. Il arrive systématiquement en retard aux sommets — parfois de plusieurs heures — pour que l'adversaire attende dans le froid et comprenne, avant même le service, qui contrôle le tempo. Il n'enlève jamais son manteau. Il tutoie ses ennemis et vouvoie la neige. Il collectionne les traités qu'il n'a pas l'intention de respecter comme d'autres collectionnent les timbres, et il appelle ça « garder le contact ». Et il possède, dit-on, une table de négociation si longue qu'un adversaire assis à l'autre bout renonce à la traverser et finit par signer.

Le Tsar Volkoï ne veut pas seulement gagner le tournoi des Jeux du Sommet. Il veut prouver une thèse : que la chaleur est une faiblesse, que l'agitation est une maladie, et que celui qui reste immobile assez longtemps finit par récupérer tout le terrain. « Renvoie la bombe si tu veux, ami, souffle-t-il en tapotant son canon. Moi, j'ai l'hiver. Et l'hiver, contrairement à toi, n'est jamais pressé. »

## Mode Histoire de Tsar Volkoï

Le Tsar rejoue sa géopolitique givrée en neuf manches, camp gauche. Trois actes : l'entente froide avec les partenaires de l'Est et du Sud (volley calculateur), la montée des tensions régionales, puis les grands duels avec l'Ouest où le ballon devient bombe et où le gel se fait impitoyable.

```js
// ===================== ACTE I — L'entente froide (Volley) =====================
{
  act: 1, title: "Deux empires patients", sub: "Bourassie–Panguo · axe de la patience",
  left: "volkoi", right: "timonier", terrain: 4, mode: "volley", ai: 0, doped: null,
  pre: [
    { s: "narrator", t: "Cité du Matin. Murs cramoisis, toits d'or, lanternes rouges. Deux empires qui n'aiment pas le mot 'empire' se saluent sous les lions de pierre." },
    { s: "timonier", t: "Bienvenue, voisin du Nord. Ici, l'harmonie a un tempo. Le tien est un peu… glacé." },
    { s: "volkoi", t: "Le froid ne discute pas, il attend. Comme toi. Nous nous ressemblons plus que nos drapeaux ne l'admettent." },
    { s: "timonier", t: "Un partenariat 'sans limites', disent nos communiqués. Sans limites, sauf celles que je décide." },
    { s: "volkoi", t: "Joli. Tu bâtis des murailles, je gèle les fronts. Servons, et voyons quelle patience craque la première." },
    { s: "narrator", t: "Match d'apparat entre alliés qui se surveillent. Sourires longs, comptes précis." }
  ],
  win: [
    { s: "volkoi", t: "Le gel prend même l'harmonie, à la longue. Beau match, camarade de circonstance." },
    { s: "timonier", t: "Un set. Le tempo est long. Je te laisse le Nord ; je prends le siècle." }
  ],
  lose: [
    { s: "timonier", t: "La patience du panda gèle plus fort que ton hiver. L'harmonie corrige toujours." },
    { s: "volkoi", t: "Suspension temporaire. Rien n'est perdu quand on a des fuseaux horaires en réserve." }
  ]
},
{
  act: 1, title: "Le radar et le manteau", sub: "Bourassie–Ryonganie · le protégé nucléaire",
  left: "volkoi", right: "bebe", terrain: 3, mode: "volley", ai: 1, doped: null,
  pre: [
    { s: "narrator", t: "Esplanade du Défilé. Granit, arc abstrait, bannières unies, et le radar militaire qui clignote comme un cœur nerveux." },
    { s: "bebe", t: "Grand voisin ! Le Maréchal t'a préparé un défilé de douze mille pas de l'oie. Rien que pour un match amical !" },
    { s: "volkoi", t: "Range ta parade, petit. Garde le carburant. Tu m'envoies des caisses, je t'envoie du blé. On appelle ça l'amitié moderne." },
    { s: "bebe", t: "Ma Batterie AA t'interdit de sauter chez moi ! Personne ne saute chez le Maréchal !" },
    { s: "volkoi", t: "Je n'ai pas besoin de sauter. Je reste au sol, et le sol vient à moi. Allume ton radar, il ne verra que de la neige." },
    { s: "narrator", t: "Le radar tourne. Le manteau du Tsar ne bouge pas." }
  ],
  win: [
    { s: "volkoi", t: "Bon petit. Continue de fournir, continue de fanfaronner. L'un compense l'autre." },
    { s: "bebe", t: "Le Maréchal DÉCRÈTE que c'était un entraînement ! Un entraînement glorieux ! Défilé quand même !" }
  ],
  lose: [
    { s: "bebe", t: "VICTOIRE ! Le radar l'avait prédit ! Le Maréchal a battu le Tsar ! Gravez-le dans le granit !" },
    { s: "volkoi", t: "Profite, gamin. Un jour tu comprendras qui tient la clé du carburant. Ce jour-là, tu défileras plus doucement." }
  ]
},
{
  act: 1, title: "Le baril et la rose", sub: "Bourassie–Ramenie · pétro-partenaires sanctionnés",
  left: "volkoi", right: "safran", terrain: 9, mode: "volley", ai: 1, doped: null,
  pre: [
    { s: "narrator", t: "Jardin des Roses. Arcades turquoise, dômes en dôme, roseraie d'un rouge trop parfait. Un paon traverse, indifférent aux sanctions." },
    { s: "safran", t: "Deux parias au même banquet. On nous ferme les portes ; nous, on ouvre des roseraies. Quelle élégance, non ?" },
    { s: "volkoi", t: "Tu vends discret, je vends au rabais, l'Ouest fulmine et achète quand même. L'hypocrisie a un bon rendement." },
    { s: "safran", t: "Mon Voile d'Or ralentit tes gestes. La patience, tu connais ; la lenteur, tu vas l'apprendre." },
    { s: "volkoi", t: "Ralentis-moi tant que tu veux. Je suis déjà l'hiver. Personne ne va plus lentement que la banquise, et pourtant elle avance." },
    { s: "narrator", t: "Volley feutré entre alliés de contrainte. Chacun compte les barils de l'autre." }
  ],
  win: [
    { s: "volkoi", t: "Belle roseraie. Continue de me couvrir les flancs, je te couvrirai au conseil. Entre parias, on se tient chaud." },
    { s: "safran", t: "Sardonique, le Nord. Note bien : la rose a des épines, et l'épine, elle, ne gèle pas." }
  ],
  lose: [
    { s: "safran", t: "Le Voile d'Or a figé l'hiver. Mesuré, patient, victorieux. On m'avait dit le Tsar imbattable ; on m'a menti." },
    { s: "volkoi", t: "Un revers entre amis. Rien de grave. Sers-moi encore du thé, et parlons de nos ennemis communs." }
  ]
},

// ===================== ACTE II — Tensions régionales (montée) =====================
{
  act: 2, title: "Le gaz et le gourou", sub: "Bourassie–Bharatie · neutralité intéressée",
  left: "volkoi", right: "gourou", terrain: 6, mode: "volley", ai: 1, doped: null,
  pre: [
    { s: "narrator", t: "Stade Ashram. Grès miel, guirlandes de soucis orange, palmiers. Une vache sacrée traverse le court avec l'autorité d'un arbitre." },
    { s: "gourou", t: "Namasté, ami du froid. Le monde te boude, et moi je t'achète ton pétrole au rabais. La neutralité est un yoga." },
    { s: "volkoi", t: "Le seul qui reste debout quand tout le monde choisit un camp. Souple. Presque bourassien." },
    { s: "gourou", t: "Ma Méditation gèle ton camp façon zen. Tu gèles par la peur ; moi, par la sérénité. Même patinoire, autre température d'âme." },
    { s: "volkoi", t: "Zen ou glace, le résultat est le même : l'autre ne bouge plus. Servons, gourou. La vache attend, elle." },
    { s: "narrator", t: "Deux immobilités s'affrontent. La plus froide gagnera. Ou la plus calme." }
  ],
  win: [
    { s: "volkoi", t: "L'hiver bat la méditation quand la méditation ferme les yeux. Continue d'acheter, ami neutre." },
    { s: "gourou", t: "Un revers m'enseigne. Respirons. Je reviendrai, et j'aurai encore besoin de ton gaz." }
  ],
  lose: [
    { s: "gourou", t: "Le calme absorbe le gel. Namasté, Tsar. La montagne ne prend pas parti, et pourtant elle gagne." },
    { s: "volkoi", t: "Match nul pour l'histoire, victoire pour toi. Garde ta neutralité. Elle m'arrange plus que la tienne." }
  ]
},
{
  act: 2, title: "Le blé et l'ara", sub: "Bourassie–Tropicalia · céréales, engrais, populisme",
  left: "volkoi", right: "capitaine", terrain: 7, mode: "volley", ai: 2, doped: null,
  pre: [
    { s: "narrator", t: "Grande Forêt. Clairière de jungle dorée, huttes sur pilotis, court en terre rouge. Un ara traverse en hurlant comme un supporter." },
    { s: "capitaine", t: "Alors le Tsar ! On me vend ton engrais, ton blé, ta nostalgie de fer. Ici on aime les gars qui parlent fort et taillent le bois !" },
    { s: "volkoi", t: "Tu abats des arbres, je gèle des fronts. Deux façons de faire du vide et d'appeler ça de la grandeur." },
    { s: "capitaine", t: "Ma Déforestation te dresse un mur de troncs ! Bon courage pour geler ça, l'ami du Nord !" },
    { s: "volkoi", t: "Un mur de bois ? J'en fais du gel qui craque. Le tien tombe ; le mien reste. Sers, capitaine." },
    { s: "narrator", t: "Populistes des deux hémisphères. L'un vend le grain, l'autre le rugit." }
  ],
  win: [
    { s: "volkoi", t: "Le froid porte plus loin que la tronçonneuse. Continue de m'acheter mes engrais, tribun." },
    { s: "capitaine", t: "Truqué ! Fraude ! … Bon, remets-moi une cargaison, on oublie. Entre durs, on se comprend." }
  ],
  lose: [
    { s: "capitaine", t: "HA ! La forêt a bouffé l'hiver ! Le Capitaine plante un ballon en pleine banquise ! On coupe, on gagne !" },
    { s: "volkoi", t: "Tu gagnes une manche et tu coupes tes propres poumons. Chacun sa méthode pour se refroidir." }
  ]
},
{
  act: 2, title: "L'avion abattu", sub: "Bourassie–Bosforie · l'incident du détroit",
  left: "volkoi", right: "sultan", terrain: 5, mode: "bomb", ai: 2, doped: null,
  pre: [
    { s: "narrator", t: "Pont des Deux Mondes. Détroit, dômes, bannière violette à liseré doré, tapis volant en approche. Le ballon est une bombe : le camp où elle tombe perd." },
    { s: "sultan", t: "Tu m'achètes des dômes, tu me vends des fusées, et un jour l'un de nos oiseaux tombe. On appelle ça une amitié compliquée." },
    { s: "volkoi", t: "Tu contrôles le détroit, moi le robinet. Tant qu'on a besoin l'un de l'autre, la mèche brûle lentement." },
    { s: "sultan", t: "Mon Séisme te secoue et t'interdit de sauter ! Sur mon pont, c'est MOI qui fais trembler la terre !" },
    { s: "volkoi", t: "Tremble tant que tu veux. Le gel, lui, ne saute pas : il glisse. Et il glisse toujours vers ton camp." },
    { s: "narrator", t: "Ne laisse pas la bombe de ton côté. Entre le froid et le séisme, une seule mèche décidera." }
  ],
  win: [
    { s: "volkoi", t: "Le sang-froid éteint la mèche. On reste amis, Sultan — amis qui gardent un doigt sur le robinet." },
    { s: "sultan", t: "Tu gagnes le pont ce soir. Mais le détroit reste à moi, et le détroit se souvient." }
  ],
  lose: [
    { s: "sultan", t: "BOUM sur la banquise ! Le séisme a fissuré l'hiver ! Le détroit couronne son maître !" },
    { s: "volkoi", t: "Grandiose, comme toujours. Profite. Le gaz continue de couler, et l'hiver a de la mémoire." }
  ]
},

// ===================== ACTE III — Grands duels de l'Ouest (Bombe) =====================
{
  act: 3, title: "La bromance de glace", sub: "Bourassie–Doria · flatteries croisées",
  left: "volkoi", right: "dorf", terrain: 1, mode: "volley", ai: 2, doped: null,
  pre: [
    { s: "narrator", t: "Country Club Doré. Resort clinquant, tour à toit plat, fontaine, palmiers en pot. Le magnat déroule le tapis, et personne ne sait qui manipule qui." },
    { s: "dorf", t: "Le Tsar ! Un type fort. Très fort. Les gens disent qu'il est fort. On s'entend super bien, tout le monde en parle." },
    { s: "volkoi", t: "Tu bâtis un Mur d'or, je bâtis l'hiver. Deux hommes qui adorent bloquer le camp d'en face. Presque touchant." },
    { s: "dorf", t: "Ton hiver, ton hiver… moi j'ai le plus beau gazon du monde et un Mur en OR. De l'or ! Ça brille plus que ta neige !" },
    { s: "volkoi", t: "L'or fond, ami. La neige revient. Devine lequel de nous deux joue la longue partie." },
    { s: "narrator", t: "Volley de flatteries. Chacun croit tenir l'autre en laisse. Les analystes, eux, ne dorment plus." }
  ],
  win: [
    { s: "volkoi", t: "Bon match, associé. Continue de te vanter ; ça me laisse le temps de préparer l'hiver." },
    { s: "dorf", t: "Truqué ! Mais élégamment truqué. On refait ça au sommet, entre gars forts. Les plus forts !" }
  ],
  lose: [
    { s: "dorf", t: "GAGNÉ ! Le plus grand match de tous les temps ! J'ai battu le Tsar ! Personne n'avait jamais fait ça, personne !" },
    { s: "volkoi", t: "Savoure, associé. Je préfère te laisser la coupe et garder la partie. C'est plus chaud pour toi, plus utile pour moi." }
  ]
},
{
  act: 3, title: "Le faucon dans la neige", sub: "Bourassie–Levantie · fronts croisés",
  left: "volkoi", right: "faucon", terrain: 8, mode: "bomb", ai: 3, doped: "R",
  pre: [
    { s: "narrator", t: "Citadelle du Levant. Grès sur colline désertique, remparts, dômes anciens et tours de verre. Un faucon fend le ciel. La bombe est armée — et l'aura de l'adversaire vire au rouge." },
    { s: "faucon", t: "Tu armes mes ennemis, tu couvres mes rivaux au conseil. Ce soir, pas de neutralité, pas de dégel." },
    { s: "volkoi", t: "Intransigeant jusqu'à l'os. J'aime. Ça rend le froid plus utile. Toi tu frappes vite, moi je frappe tard." },
    { s: "faucon", t: "Mon Raid Éclair t'interdit de sauter chez moi. Frappe préventive : je ne laisse pas l'hiver arriver." },
    { s: "volkoi", t: "Frappe avant, si tu veux. On ne devance pas une saison. Elle arrive de toute façon, et elle te trouve fatigué." },
    { s: "narrator", t: "Le rapace se dope à l'enjeu. Renvoie la bombe. Ne laisse jamais la mèche finir dans ton camp." }
  ],
  win: [
    { s: "volkoi", t: "Le raid s'essouffle, l'hiver dure. Tu es rapide, faucon. Moi, je suis inévitable." },
    { s: "faucon", t: "Une manche. Rien n'est réglé. Le rapace revient toujours, et il revient plus bas." }
  ],
  lose: [
    { s: "faucon", t: "Frappe nette, cible neutralisée. L'hiver n'aura pas le temps de s'installer. Jamais." },
    { s: "volkoi", t: "Rapide, brutal, précis. Et pressé. C'est ta faiblesse : tu comptes en secondes, je compte en siècles." }
  ]
},
{
  act: 3, title: "Le dégel n'aura pas lieu", sub: "Bourassie–Gallardie · le grand front de l'Ouest",
  left: "volkoi", right: "cygne", terrain: 0, mode: "bomb", ai: 3, doped: "R",
  pre: [
    { s: "narrator", t: "Finale. Place Écarlate, forteresse cramoisie sous la neige, bulbe rouge au loin, bannières bleu-vert claquant au gel. Le canon d'apparat pivote sur son traîneau. La bombe grésille, l'aura du Cygne rougeoit." },
    { s: "cygne", t: "En même temps, un ennemi, ça se combat ET ça se parle. Je suis venu jusque sur ta place, Tsar. Le dialogue et le contre." },
    { s: "volkoi", t: "Chez moi. Sous ma neige. Tu parles, tu proposes, tu tends la main… et moi j'attends que le froid réponde à ta place." },
    { s: "cygne", t: "Ton Passage en Force, tes fronts gelés, ton canon décoratif… La Gallardie ne cédera pas un pouce de gazon." },
    { s: "volkoi", t: "Ton Passage en Force à toi empêche mes smashes ? Parfait. Je n'ai pas besoin de smasher. J'ai besoin que tu aies froid." },
    { s: "cygne", t: "En même temps… il fait vraiment très froid ici. Servons avant que je ne sente plus mes doigts." },
    { s: "narrator", t: "Le canon tonne pour l'ouverture. Le Cygne se dope à l'enjeu. Le dégel de l'Ouest se joue en un dernier échange." }
  ],
  win: [
    { s: "volkoi", t: "Le canon a parlé, l'hiver a répondu. Rentre au Palais du Coq, Cygne. Dis-leur que la neige, elle, ne négocie pas." },
    { s: "volkoi", t: "J'ai gelé tous les fronts, un par un, sans jamais courir. On appelle ça la patience. Vous appelez ça un problème." },
    { s: "cygne", t: "Ce n'est pas une fin, c'est un front de plus. La diplomatie est un sport d'endurance — et l'endurance, je la garde." }
  ],
  lose: [
    { s: "cygne", t: "Le dégel a eu lieu. Sur ta propre place, sous ton propre canon. En même temps, il fallait bien que quelqu'un rallume le printemps." },
    { s: "volkoi", t: "Une manche perdue chez moi. Je ne concède pas : je suspends. L'hiver, contrairement à ta victoire, reviendra. Il revient toujours." }
  ]
}
```

**Répartition :** 9 rencontres — 6 volley (timonier, bebe, safran, gourou, capitaine, dorf) · 3 bombe (sultan, faucon, cygne). Deux adversaires dopés en Acte III (faucon, cygne). Finale à domicile sur la Place Écarlate, canon d'apparat à l'appui.
