# Le Sultan — Bosforie

## Biographie

On raconte, en Bosforie, qu'il n'est pas né dans un palais mais qu'il en a fait naître un. Fils d'un quartier populaire posé sur la rive du grand détroit, là où les barques de pêche remontent le courant à contre-cœur, le futur Sultan a grandi entre deux continents et n'a jamais pu choisir : il les voulait tous les deux. Petit vendeur de graines et de limonade à la criée, il apprit très tôt que la voix qui porte le plus loin sur le quai gagne le client — leçon qu'il n'a jamais désapprise, et qu'il applique aujourd'hui au filet, où il annonce ses smashs avant de les frapper.

Maire d'une capitale bruissante et coincée dans les embouteillages, il s'y fit une réputation d'homme qui fait couler l'eau, tourner les bus et pousser les mosquées comme des champignons de béton. « Les urnes sont un tramway, disait-il déjà : on descend quand on est arrivé à destination. » Il n'est jamais descendu. De mandat en mandat, de fonction en fonction, il a transformé chaque poste en marchepied et chaque marchepied en trône, jusqu'à réécrire les règles elles-mêmes pour que la fonction suprême — la sienne — concentre enfin tous les pouvoirs sous un seul dôme.

Ce dôme, justement. Le Sultan gouverne depuis un palais démesuré planté sur la ligne d'eau du **Pont des Deux Mondes**, un caprice architectural aux mille et une salles, hérissé de dômes ronds et de tours effilées, où l'on se perd exprès pour mieux le retrouver, lui, au centre. De ses fenêtres il compte les cargos qui payent le péage du détroit et sourit : « L'Orient et l'Occident se croisent chez moi. Chez MOI. » Sous ses balcons flottent en permanence les grandes **bannières violettes à liseré doré** de la Bosforie, pourpre impériale héritée d'un empire qu'il n'a jamais tout à fait admis mort et qu'il rejoue, à sa façon, à coups de mégaprojets et de discours-fleuves.

Car le Sultan est un homme de chantiers. Il a percé, comblé, bétonné, inauguré ; il a rêvé de doubler son détroit d'un canal artificiel juste pour le plaisir de posséder deux fois la même eau. Ses ingénieurs lancent dans le ciel des **faucons de fer** — de petits engins bourdonnants qui ont fait la fierté et l'exportation de la nation — pendant que ses économistes, eux, tremblent : le Sultan a une théorie bien à lui selon laquelle, pour faire baisser les prix, il faut baisser les taux, et il défend cette hérésie avec la même conviction que ses services au volley. La monnaie fond, l'inflation grimpe, et lui hausse les épaules : « Un empire ne se mesure pas en petite monnaie. »

Sa signature sur le terrain, c'est le **Séisme**. Là où les autres sautent, plongent, s'envolent, le Sultan, lui, reste ancré. Il frappe le sol du talon, une fois, sèchement, et toute la moitié de terrain adverse se met à trembler : le rival ne peut plus décoller, cloué au plancher comme une nation qu'on tient par les fondations. « Pourquoi sauter ? gronde-t-il. Le monde vient à moi. » C'est un super de tellurique orgueil : pas de la vitesse, pas de la ruse — de la masse, de la gravité, l'aplomb d'un homme qui a fait de l'immobilité au pouvoir un art martial.

Son terrain fétiche, le **Pont des Deux Mondes**, est à son image : un pont-monument jeté entre deux rives, entre deux mondes, sous lequel glissent des barques indolentes et au-dessus duquel, à chaque échange de haut vol, déboule l'**événement du tapis volant** — un vrai tapis de contes, franges et arabesques au vent, qui traverse le ciel du match comme un clin d'œil des Mille et Une Nuits. Le Sultan adore : il prétend qu'à l'entraînement il s'assoit dessus pour surveiller ses adversaires de haut, jambes croisées, thé à la main. Personne n'a jamais pu prouver le contraire.

Diplomate à géométrie très variable, le Sultan a fait de l'ambiguïté une doctrine. Membre par la carte d'une grande alliance de l'Ouest, il achète pourtant ses systèmes de défense à l'autocrate des neiges de Bourassie ; il ferme et ouvre le robinet migratoire vers l'Union comme on négocie au bazar ; il tance le jeune technocrate du Palais Gallard à propos du détroit et de la mer intérieure, puis lui téléphone le lendemain pour parler affaires. « En même temps », ricane-t-il en l'imitant. Il joue sur tous les tableaux parce qu'il possède, littéralement, le pont entre les deux.

Il se pose en protecteur des opprimés d'une moitié du monde et en pyromane de l'autre : bruyant défenseur d'une cause régionale sur la scène du Levant, muet sur les tourments des peuples cousins quand l'argent d'un grand voisin d'Orient l'exige. Ses fidèles y voient une habileté de grand joueur d'échecs ; ses rivaux, l'opportunisme d'un marchand de tapis qui vend la même pièce à deux clients. Lui appelle ça « la profondeur stratégique » et frappe le sol : le Séisme, toujours, pour rappeler qui tient les fondations.

Sur le banc de touche, avant chaque match, le Sultan fait dérouler la **bannière pourpre à liseré doré**, embrasse le tissu, réajuste sa veste, et lance à la cantonade sa formule fétiche : « Trente ans qu'on me fait attendre à la porte. Ce soir, je la défonce au smash. » Puis il tape du talon. Le sol tremble. Le tapis volant passe. Et la partie commence, impériale.

## Mode Histoire de Le Sultan

```js
// ===================================================================
// MODE HISTOIRE — LE SULTAN (Bosforie) · left = "sultan"
// « Entre deux mondes, un seul maître du filet »
// ===================================================================
const STORY_SULTAN = [
  // ===================== ACTE I — Petites rivalités (Volley) =====================
  {
  act: 1, title: "Le marché à quatre", sub: "Bosforie–Libertaria · double contre l'or",
  left: "sultan", right: "dorf", ally: "safran", right2: "cygne", terrain: 1, mode: "2v2", ai: 0, doped: null,
  pre:  [
    { s: "narrator", t: "Pont des Deux Mondes. Le Sultan s'allie à Safran pour un 2v2 contre le Baron et le Cygne — commerce, détroit, et filet." },
    { s: "sultan", t: "Toi, Safran, tu es mon partenaire. On vend, on digue, on ouvre les portes — les leurs." },
    { s: "safran", t: "Alliance de mesure. Tant que ton marché de missiles ne devient pas mon problème au milieu du set." },
    { s: "dorf", t: "J'ai le Cygne en partenaire ! Le plus cher ! Il paie enfin sa part — en points !" },
    { s: "cygne", t: "En même temps partenaire, en même temps critique. C'est ça, une alliance exigeante." },
    { s: "narrator", t: "Mode double : le détroit se joue à quatre mains." },
  ],
  win:  [
    { s: "sultan", t: "Le marché est conclu : notre camp marque. Merci, partenaire." },
    { s: "safran", t: "Élégant. Leur or a moins bien digué que notre patience." },
    { s: "dorf", t: "Truqué ! Mon partenaire parlait trop !" },
    { s: "cygne", t: "Défaite de binôme. On renégocie les critères. En même temps." },
  ],
  lose:  [
    { s: "dorf", t: "GAGNÉ ! Meilleure alliance payante du monde !" },
    { s: "cygne", t: "Partenariat efficace. Même avec un Baron. Surtout avec un Baron." },
    { s: "sultan", t: "La porte a tenu… contre nous. On reviendra plus nombreux — enfin, à deux." },
    { s: "safran", t: "Recalons la table. Les doubles, ça se renégocie." },
  ]
},
  {
    act: 1, title: "Deux fiertés sur l'esplanade", sub: "Bosforie–Ryonganie · deux orgueils de granit",
    left: "sultan", right: "bebe", terrain: 3, mode: "volley", ai: 0, doped: null,
    pre:  [
      { s: "narrator", t: "Esplanade du Défilé. Le radar tourne, les gradins de granit sont pleins de figurants immobiles. Deux hommes qui adorent qu'on les regarde." },
      { s: "bebe", t: "Bienvenue au plus grand défilé de tous les temps ! Chaque pas synchronisé. Chaque cœur battant pour moi. Tu es impressionné, avoue." },
      { s: "sultan", t: "Impressionné ? J'ai mille salles dans mon palais, petit maréchal. Tes gradins tiendraient dans mon vestibule." },
      { s: "bebe", t: "Ha ! Mais mes gradins ne s'écroulent jamais. Ma Batterie t'interdira de sauter, vieux Sultan." },
      { s: "sultan", t: "Sauter ? Je ne saute pas, mon garçon. Je reste. Je frappe le sol. Et c'est TON esplanade qui tremble." },
      { s: "bebe", t: "On verra qui tremble le premier. Radar allumé, servons pour le peuple !" }
    ],
    win:  [
      { s: "sultan", t: "Deux hommes qui s'interdisent mutuellement de sauter, et c'est le plus lourd qui gagne. L'expérience, gamin." },
      { s: "bebe", t: "C'était un match d'entraînement ! Un vrai maréchal ne perd jamais officiellement. On coupera cette séquence." }
    ],
    lose:  [
      { s: "bebe", t: "Cloué au sol ! Le grand Sultan cloué comme tout le monde ! On le repassera au ralenti pendant le défilé !" },
      { s: "sultan", t: "Une esplanade, ça se traverse. Une porte, ça se défonce. Je reviendrai par le pont, maréchal." }
    ]
  },
  {
    act: 1, title: "Deux voix qui portent", sub: "Bosforie–Tropicalia · populistes de la jungle et du détroit",
    left: "sultan", right: "capitaine", terrain: 7, mode: "volley", ai: 1, doped: null,
    pre:  [
      { s: "narrator", t: "Grande Forêt. Un ara traverse la canopée dorée. Deux tribuns habitués à crier plus fort que la raison se retrouvent sur la terre rouge." },
      { s: "capitaine", t: "Alors comme ça t'es le grand chef de l'Orient ? Ici c'est ma clairière, mon micro, ma tronçonneuse. Bienvenue, cousin." },
      { s: "sultan", t: "Capitaine, nous nous ressemblons : deux voix que le monde voudrait baisser et qui montent le volume à la place." },
      { s: "capitaine", t: "Ha ! Sauf que moi j'abats des arbres, toi t'abats des taux d'intérêt. On est fous tous les deux, mais moi j'assume mieux." },
      { s: "sultan", t: "Baisser les taux fait baisser les prix. C'est de la science. MA science. Comme mon talon fait trembler ta terre rouge." },
      { s: "capitaine", t: "T'es aussi économiste que je suis forestier. Servons, grand théoricien !" }
    ],
    win:  [
      { s: "sultan", t: "Ta forêt a tremblé, ton ara s'est envolé, et toi tu es resté cloué. La gravité impériale, Capitaine." },
      { s: "capitaine", t: "Bon, bon. T'as gagné. Mais je te préviens : la prochaine fois j'amène la tronçonneuse au filet." }
    ],
    lose:  [
      { s: "capitaine", t: "Déforestation totale ! Mur de troncs, plus de sol pour ton Séisme ! Rentre chez tes dômes, cousin !" },
      { s: "sultan", t: "Profite de ta clairière. Le vrai carrefour du monde est chez moi, pas sous tes arbres." }
    ]
  },

  // ===================== ACTE I — Petites rivalités (Volley) =====================
  {
    act: 2, title: "Le toit et le tapis", sub: "Bosforie–Bharatie · deux civilisations, une seule scène",
    left: "sultan", right: "gourou", terrain: 6, mode: "flame", ai: 1, doped: null,
    pre:  [
      { s: "narrator", t: "Stade Ashram. Guirlandes de soucis orange, une vache traverse tranquillement le terrain. Deux hommes qui parlent au nom de civilisations millénaires. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu." },
      { s: "gourou", t: "Namasté, Sultan. Tu prends parti pour mon rival du nord sur la question de la crête. Le karma note tout, tu sais." },
      { s: "sultan", t: "Je prends parti pour l'équilibre, Gourou. Et l'équilibre, ces temps-ci, penche du côté de ceux qui m'achètent des faucons de fer." },
      { s: "gourou", t: "Toujours le marchand. Ici on médite avant de frapper. Toi tu factures avant de servir." },
      { s: "sultan", t: "Médite tant que tu veux : quand je frappe le sol, même ta vache qui traverse s'arrête de mâcher." },
      { s: "gourou", t: "Elle s'arrête par politesse, pas par peur. Servons, et respirons." }
    ],
    win:  [
      { s: "sultan", t: "Ton calme est une belle chose, Gourou. Mon Séisme est une chose plus lourde. Nul rancune : namasté à mon tour." },
      { s: "gourou", t: "Une secousse passe, la montagne reste. Tu as gagné le point, pas le sommet." },
      { s: "narrator", t: "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu." }
    ],
    lose:  [
      { s: "gourou", t: "La sérénité use le tonnerre. Ton talon a fatigué avant mon souffle, ami du détroit." },
      { s: "sultan", t: "Tu médites bien, mais tu ne possèdes pas de pont entre deux mondes. Moi si. On se retrouvera." },
      { s: "narrator", t: "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu." }
    ]
  },
  {
    act: 2, title: "Les amis du détroit gelé", sub: "Bosforie–Bourassie · S-400, corridor & manœuvres croisées",
    left: "sultan", right: "volkoi", terrain: 0, mode: "flame", ai: 2, doped: null,
    pre:  [
      { s: "narrator", t: "Place Écarlate sous la neige. Le canon d'apparat tonne au loin. Deux hommes qui se vendent des armes le matin et se marchent dessus l'après-midi. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu." },
      { s: "volkoi", t: "Sultan. Tu m'achètes mes défenses, puis tu envoies tes faucons de fer contre mes amis. Curieuse amitié." },
      { s: "sultan", t: "La meilleure sorte, Tsar : celle où chacun sait exactement combien l'autre lui coûte. Tu gèles le camp, je fais trembler le sol. À forces égales." },
      { s: "volkoi", t: "L'hiver travaille pour moi. Ici, ton talon frappe la glace : il glisse. Il ne tremble pas." },
      { s: "sultan", t: "La glace se fissure aussi, Tsar. Demande à ton corridor. Je contrôle le détroit par où passe ton blé." },
      { s: "volkoi", t: "Le grain, le gaz, les mercenaires… on se doit trop de choses pour se détester. Sers, marchand de ponts." }
    ],
    win:  [
      { s: "sultan", t: "Même sur ta glace, la terre m'obéit. Bon partenariat, Tsar : je garde tes défenses, tu gardes ta rancune." },
      { s: "volkoi", t: "Un revers sans conséquence. Nous rejouerons. Nous rejouons toujours, toi et moi. C'est notre malédiction." },
      { s: "narrator", t: "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu." }
    ],
    lose:  [
      { s: "volkoi", t: "La glace a eu ton talon. Le froid gagne à la patience, l'agitation perd au bruit." },
      { s: "sultan", t: "Une manche pour l'hiver. Mais c'est mon détroit qui décide quand ton blé sort. Souviens-t'en." },
      { s: "narrator", t: "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu." }
    ]
  },
  {
    act: 2, title: "La route commerciale et du silence", sub: "Bosforie–Panguo · peuples cousins, gros contrats",
    left: "sultan", right: "timonier", terrain: 4, mode: "flame", ai: 2, doped: null,
    pre:  [
      { s: "narrator", t: "Cité du Matin. Lanternes rouges, lions de pierre, toits d'or. Deux empereurs se jaugent au-dessus d'un carnet de commandes très épais. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu." },
      { s: "timonier", t: "Sultan. Tu te dis protecteur des peuples cousins de mes provinces de l'ouest. Puis tu signes mes contrats de la Route. Le tempo te contredit." },
      { s: "sultan", t: "Un empire sait quand parler fort et quand compter bas, Timonier. Sur le terrain, au moins, je frappe franc." },
      { s: "timonier", t: "Franc et bruyant. Mon Rempart montera au milieu de ton camp. Il n'a pas besoin de trembler pour tenir." },
      { s: "sultan", t: "Ma bannière pourpre a régné quand ton rempart n'arrêtait déjà plus rien. Le talon d'abord, le tempo ensuite." },
      { s: "timonier", t: "L'orgueil est un bruit. L'harmonie est un silence. Servons, et écoutons lequel dure." }
    ],
    win:  [
      { s: "sultan", t: "Ton rempart a tremblé, Timonier. Belle pierre, mauvaises fondations. Le carrefour du monde reste chez moi." },
      { s: "timonier", t: "Le tempo se rétablira. Il se rétablit toujours. Va compter tes péages, marchand de ponts." },
      { s: "narrator", t: "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu." }
    ],
    lose:  [
      { s: "timonier", t: "Le rempart contient le tonnerre comme il contient les steppes. Patiemment. Définitivement." },
      { s: "sultan", t: "Un rempart finit toujours par avoir deux côtés, Timonier. Je reviendrai par l'autre." },
      { s: "narrator", t: "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu." }
    ]
  },

  // ===================== ACTE I — Petites rivalités (Volley) =====================
  {
    act: 3, title: "La porte de l'Union", sub: "Bosforie–Gallardie · adhésion, détroit & mer intérieure",
    left: "sultan", right: "cygne", terrain: 5, mode: "bomb", ai: 2, doped: null,
    pre:  [
      { s: "narrator", t: "Pont des Deux Mondes. La balle est une bombe à mèche. Sous le pont glissent les barques ; au-dessus, le tapis volant traverse le ciel du soir." },
      { s: "sultan", t: "Bienvenue chez moi, Cygne. Entre deux continents, sur MON pont. Trente ans que je frappe à votre porte. Ce soir je la défonce au smash." },
      { s: "cygne", t: "En même temps, cher Sultan, une porte, ça respecte des critères. On ne défonce pas l'état de droit à coups de talon." },
      { s: "sultan", t: "L'état de droit ! Pendant que vous délibérez sur la mer intérieure, moi je fais des forages, des drones, des faits accomplis." },
      { s: "cygne", t: "En même temps il faut du dialogue, et en même temps il faut des limites. Cette bombe, par exemple : ne la gardez pas de votre côté." },
      { s: "sultan", t: "Je ne garde rien, technocrate. Je renvoie. Toujours. Et je fais trembler le pont sous tes pieds bien élevés." }
    ],
    win:  [
      { s: "sultan", t: "Boum, de ton côté, sur mon détroit. Un jour, Cygne, c'est ton Union qui demandera à entrer chez MOI." },
      { s: "cygne", t: "Reconnaissons-le : de la puissance, et une vraie détente au talon. On reparlera des critères. En même temps." }
    ],
    lose:  [
      { s: "cygne", t: "Critères respectés, bombe renvoyée, victoire accordée. La procédure a du bon, voyez-vous." },
      { s: "sultan", t: "Tu gagnes le match, pas le détroit. Je reste sur le pas de ta porte. Debout. Et j'ouvre ou je ferme le robinet quand je veux." }
    ]
  },
  {
    act: 3, title: "Frères de mosquée, rivaux de désert", sub: "Bosforie–Ramenie · leadership du croissant régional",
    left: "sultan", right: "safran", terrain: 9, mode: "bomb", ai: 3, doped: "R",
    pre:  [
      { s: "narrator", t: "Jardin des Roses. Arcades turquoise, roseraie du palais, un paon fait la roue. La balle-bombe siffle entre deux prétendants au même trône spirituel." },
      { s: "safran", t: "Sultan. Nous prions vers le même horizon et pourtant nous ne voulons pas le même maître de maison. Fâcheux, n'est-ce pas ?" },
      { s: "sultan", t: "Deux capitales, une seule couronne régionale, Safran. Et ta Ramenie, en Syrie comme ailleurs, joue contre mes pions." },
      { s: "safran", t: "Tes pions ? Tes faucons de fer bourdonnent au-dessus de mes alliés. Mon Voile d'Or ralentira ton talon jusqu'à l'immobilité." },
      { s: "sultan", t: "Ralentis tant que tu veux : plus je suis lourd, plus la terre tremble. Le Séisme n'a pas besoin de vitesse, il a besoin de MASSE." },
      { s: "safran", t: "Alors voyons si ta masse résiste à la patience. Mesurée. Longue. Et à cette bombe. Servons, frère-rival." }
    ],
    win:  [
      { s: "sultan", t: "Ton voile a ralenti mes pas, pas mon talon. La couronne du croissant reste sur le pont, entre deux mondes. Chez moi." },
      { s: "safran", t: "Une manche. La patience est mon arme longue, Sultan. Le désert, lui, ne se fatigue jamais. Nous rejouerons." },
      { s: "narrator", t: "Le ballon est une bombe : le camp où elle tombe perd." }
    ],
    lose:  [
      { s: "safran", t: "Boum, sous ton voile ralenti. La mesure use la grandiloquence, comme l'eau use la pierre du pont." },
      { s: "sultan", t: "Tu ralentis un empire, tu ne l'arrêtes pas. Ma bannière pourpre flottait avant ta roseraie. Elle flottera après." }
    ]
  },
  {
    act: 3, title: "Le smash du Sultan", sub: "Bosforie–Levantie · FINALE · le duel de tout le Levant",
    left: "sultan", right: "faucon", terrain: 5, mode: "bomb", ai: 3, doped: "R",
    pre:  [
      { s: "narrator", t: "FINALE. Retour au Pont des Deux Mondes. La bannière pourpre à liseré doré couvre tout un continent du décor. La bombe attend. Le tapis volant fait un dernier passage." },
      { s: "sultan", t: "Faucon. Sur mon pont, entre l'Orient et l'Occident, tu vas comprendre pourquoi le monde entier attend chez MOI." },
      { s: "faucon", t: "Le monde attend, et pendant ce temps toi tu haranges les foules à mon sujet. Beaucoup de discours, Sultan. Peu de raids." },
      { s: "sultan", t: "Mes discours font tomber des gouvernements. Ton Raid Éclair m'interdit de sauter ? Parfait : je ne saute jamais. Je reste. Je frappe le sol." },
      { s: "faucon", t: "Reste donc. Cloué. Moi je frappe vite, sans prévenir, et je ne négocie pas. La bombe non plus ne négocie pas." },
      { s: "sultan", t: "Alors nous nous interdirons mutuellement de sauter, faucon contre séisme, et c'est le plus lourd, le plus fier, qui restera debout." },
      { s: "narrator", t: "Deux supers qui clouent l'adversaire au sol, une bombe entre eux, un pont entre deux mondes. Ne la gardez pas de votre côté." }
    ],
    win:  [
      { s: "sultan", t: "BOUM ! De ton côté, sur mon détroit, sous ma bannière pourpre ! Le Levant a un maître, et il tient le pont entre les deux mondes !" },
      { s: "faucon", t: "Un revers. Tactique, pas stratégique. Je frappe toujours deux fois, Sultan. La seconde, tu ne la verras pas venir." },
      { s: "narrator", t: "Le talon frappe une dernière fois. Tout le pont tremble. Le tapis volant s'incline. Le Sultan lève les bras : sa campagne s'achève, impériale." }
    ],
    lose:  [
      { s: "faucon", t: "Raid éclair, bombe renvoyée, match plié. La grandiloquence n'a jamais arrêté un faucon en piqué." },
      { s: "sultan", t: "Tu gagnes un soir sur mon pont. Mais le détroit reste à moi, la bannière reste pourpre, et je frappe encore à toutes les portes. Debout." }
    ]
  }
];
```
