# Le Sultan — Bosforie

## Biographie

On raconte, en Bosforie, qu'il n'est pas né dans un palais mais qu'il en a fait naître un. Fils d'un quartier populaire posé sur la rive du grand détroit, là où les barques de pêche remontent le courant à contre-cœur, le futur Sultan a grandi entre deux continents et n'a jamais pu choisir : il les voulait tous les deux. Petit vendeur de graines et de limonade à la criée, il apprit très tôt que la voix qui porte le plus loin sur le quai gagne le client — leçon qu'il n'a jamais désapprise, et qu'il applique aujourd'hui au filet, où il annonce ses smashs avant de les frapper.

Maire d'une capitale bruissante et coincée dans les embouteillages, il s'y fit une réputation d'homme qui fait couler l'eau, tourner les bus et pousser les tours comme des champignons de béton. « Les urnes sont un tramway, disait-il déjà : on descend quand on est arrivé à destination. » Il n'est jamais descendu. De mandat en mandat, de fonction en fonction, il a transformé chaque poste en marchepied et chaque marchepied en trône, jusqu'à réécrire les règles elles-mêmes pour que la fonction suprême — la sienne — concentre enfin tous les pouvoirs sous un seul dôme.

Ce dôme, justement. Le Sultan gouverne depuis un palais démesuré planté sur la ligne d'eau du **Pont des Deux Mondes**, un caprice architectural aux mille et une salles, hérissé de dômes ronds et de tours effilées, où l'on se perd exprès pour mieux le retrouver, lui, au centre. De ses fenêtres il compte les cargos qui payent le péage du détroit et sourit : « Le levant et le couchant se croisent chez moi. Chez MOI. » Sous ses balcons flottent en permanence les grandes **bannières violettes à liseré doré** de la Bosforie, pourpre impériale héritée d'un empire qu'il n'a jamais tout à fait admis mort et qu'il rejoue, à sa façon, à coups de mégaprojets et de discours-fleuves.

Car le Sultan est un homme de chantiers. Il a percé, comblé, bétonné, inauguré ; il a rêvé de doubler son détroit d'un canal artificiel juste pour le plaisir de posséder deux fois la même eau. Ses ingénieurs lancent dans le ciel des **faucons de fer** — de petits engins bourdonnants qui ont fait la fierté et l'exportation de la nation — pendant que ses économistes, eux, tremblent : le Sultan a une théorie bien à lui selon laquelle, pour faire baisser les prix, il faut baisser les taux, et il défend cette hérésie avec la même conviction que ses services au volley. La monnaie fond, l'inflation grimpe, et lui hausse les épaules : « Un empire ne se mesure pas en petite monnaie. »

Sa signature sur le terrain, c'est le **Séisme**. Là où les autres sautent, plongent, s'envolent, le Sultan, lui, reste ancré. Il frappe le sol du talon, une fois, sèchement, et toute la moitié de terrain adverse se met à trembler : le rival ne peut plus décoller, cloué au plancher comme une nation qu'on tient par les fondations. « Pourquoi sauter ? gronde-t-il. Le monde vient à moi. » C'est un super de tellurique orgueil : pas de la vitesse, pas de la ruse — de la masse, de la gravité, l'aplomb d'un homme qui a fait de l'immobilité au pouvoir un art martial.

Son terrain fétiche, le **Pont des Deux Mondes**, est à son image : un pont-monument jeté entre deux rives, entre deux mondes, sous lequel glissent des barques indolentes et au-dessus duquel, à chaque échange de haut vol, déboule l'**événement du tapis volant** — un vrai tapis de contes, franges et arabesques au vent, qui traverse le ciel du match comme un clin d'œil des mille et une légendes du détroit. Le Sultan adore : il prétend qu'à l'entraînement il s'assoit dessus pour surveiller ses adversaires de haut, jambes croisées, thé à la main. Personne n'a jamais pu prouver le contraire.

Diplomate à géométrie très variable, le Sultan a fait de l'ambiguïté une doctrine. Membre par la carte d'une grande alliance du Consortium, il achète pourtant ses systèmes de défense à l'autocrate des neiges de Bourassie ; il ferme et ouvre le robinet migratoire vers l'Union comme on négocie au bazar ; il tance le jeune technocrate du Palais Gallard à propos du détroit et de la mer intérieure, puis lui téléphone le lendemain pour parler affaires. « En même temps », ricane-t-il en l'imitant. Il joue sur tous les tableaux parce qu'il possède, littéralement, le pont entre les deux.

Il se pose en protecteur des opprimés d'une moitié du monde et en pyromane de l'autre : bruyant défenseur d'une cause régionale sur la scène du Levant, muet sur les tourments des peuples cousins quand l'argent d'un grand voisin d'Orient l'exige. Ses fidèles y voient une habileté de grand joueur d'échecs ; ses rivaux, l'opportunisme d'un marchand de tapis qui vend la même pièce à deux clients. Lui appelle ça « la profondeur stratégique » et frappe le sol : le Séisme, toujours, pour rappeler qui tient les fondations.

Sur le banc de touche, avant chaque match, le Sultan fait dérouler la **bannière pourpre à liseré doré**, embrasse le tissu, réajuste sa veste, et lance à la cantonade sa formule fétiche : « Trente ans qu'on me fait attendre à la porte. Ce soir, je la défonce au smash. » Puis il tape du talon. Le sol tremble. Le tapis volant passe. Et la partie commence, impériale.

## Mode Histoire de Le Sultan

```js
// ===================================================================
// MODE HISTOIRE — LE SULTAN (Bosforie) · left = "sultan"
// « Entre deux mondes, un seul maître du filet »
// FIL ROUGE : faire payer le péage à tout le monde — même au destin.
// RUNNING GAG : le péage s'étend match après match (le filet, la neige,
// l'attente, le karma…) jusqu'à la finale, où le destin lui-même passe à la caisse.
// Colères théâtrales, retour immédiat au business.
// ===================================================================
const STORY_SULTAN = [
  // ===================== ACTE I — Petites rivalités (Volley) =====================
  {
  act: 1, title: "Le marché à quatre", sub: "Bosforie–Bourassie vs Doria–Levantie · un partenaire sous contrat",
  left: "sultan", right: "dorf", ally: "volkoi", right2: "faucon", terrain: 1, mode: "2v2", ai: 0, doped: null,
  pre:  [
    { s: "narrator", t: "Country Club Doré. Le Sultan arrive au 2v2 avec un partenaire sous contrat : le Tsar, loué à la saison, assurance gel comprise. En face, le Baron et le Faucon comparent leurs factures." },
    { s: "sultan", t: "Tsar ! Tu me couvres au filet, je t'achète tes batteries Sentinelle, et je t'offre dix pour cent sur le péage du détroit. Le deal du siècle !" },
    { s: "volkoi", t: "Dix pour cent d'un péage que je paie déjà. Ta générosité est une boucle, Sultan. J'apprécie l'artisanat." },
    { s: "dorf", t: "Vous entendez ça ? Ils MARCHANDENT pendant l'échauffement ! Nous, on est une équipe SOLIDE. Hein, Faucon ? Dis que c'est solide." },
    { s: "faucon", t: "C'est une coalition d'intérêts à durée limitée. C'est déjà beaucoup, dans ce vestiaire." },
    { s: "sultan", t: "Messieurs, avant de commencer : le filet traverse MON terrain, spirituellement parlant. Chaque smash au-dessus paiera un droit de passage." },
    { s: "narrator", t: "Un double au sommet : deux vendeurs d'armes, un acheteur, et un homme qui taxe le ciel. Le filet, lui, reste gratuit — pour l'instant." },
  ],
  win:  [
    { s: "sultan", t: "Victoire ! Tsar, ta commission arrive — en monnaie bosforienne, cours du jour. Ne la change pas trop vite." },
    { s: "volkoi", t: "Je la change immédiatement. J'ai vu ton cours du jour. Il descend plus vite que mes températures." },
    { s: "dorf", t: "TRUQUÉ ! Ce filet penchait ! J'exige un filet neutre, doré, et à mon nom : le filet DORF !" },
    { s: "faucon", t: "Le filet était droit. C'est nous qui étions de travers. Je le consigne, on corrige, on revient." },
  ],
  lose:  [
    { s: "dorf", t: "GAGNÉ ! La meilleure alliance sécuritaire du MONDE ! Faucon, je te décore ! C'est moi qui fabrique les médailles — elles sont ÉNORMES !" },
    { s: "faucon", t: "Ligne tenue, double gagné. Pas de médaille : un rapport. C'est plus utile, et ça pèse moins." },
    { s: "sultan", t: "Perdre à quatre coûte moins cher que perdre seul : Tsar, la moitié de la facture est pour toi." },
    { s: "volkoi", t: "Envoie-la. Je la gèlerai avec le reste de nos comptes. Personne n'a jamais dégelé une facture chez moi." },
  ]
},
  {
    act: 1, title: "Deux fiertés sur l'esplanade", sub: "Bosforie–Ryonganie · deux orgueils de granit",
    left: "sultan", right: "bebe", terrain: 3, mode: "volley", ai: 0, doped: null,
    pre:  [
      { s: "narrator", t: "Esplanade du Défilé. Le radar tourne, les gradins de granit sont pleins de spectateurs parfaitement synchronisés. Deux hommes qui adorent qu'on les regarde." },
      { s: "bebe", t: "Bienvenue au plus grand défilé de tous les temps ! Chaque pas synchronisé, chaque cœur battant pour moi ! Impressionné, avoue !" },
      { s: "sultan", t: "Impressionné ? Petit, j'ai mille et une salles dans mon palais. Tes gradins tiendraient dans mon vestibule — et je leur ferais payer l'entrée." },
      { s: "bebe", t: "Personne ne fait payer MES gradins ! Le peuple applaudit gratuitement ! Enfin… obligatoirement. C'est encore mieux que gratuitement !" },
      { s: "sultan", t: "Tout ce qui est obligatoire devrait rapporter, mon garçon. Première leçon d'empire. Deuxième leçon : je ne saute jamais. Je frappe le sol — et c'est TON esplanade qui tremble." },
      { s: "bebe", t: "On verra qui tremble le premier ! Radar allumé, fanfare en position : servons pour le peuple !" }
    ],
    win:  [
      { s: "sultan", t: "Deux hommes qui s'interdisent mutuellement de sauter, et c'est le plus lourd qui gagne. L'expérience, gamin. Elle pèse." },
      { s: "bebe", t: "C'était un match d'entraînement ! Un vrai Maréchal ne perd jamais officiellement. On coupera cette séquence au montage." },
      { s: "sultan", t: "Coupe, coupe. Moi, je vends la version intégrale au détroit. Séance unique, péage plein tarif." }
    ],
    lose:  [
      { s: "bebe", t: "Cloué au sol ! Le grand Sultan cloué comme un simple soldat ! On le repassera au ralenti pendant dix défilés !" },
      { s: "sultan", t: "Une esplanade, ça se traverse. Une porte, ça se défonce. Je reviendrai par le pont — et le pont, c'est moi qui l'ai construit." },
      { s: "bebe", t: "Alors paie le péage de MON esplanade en sortant ! Ha ! Qui taxe qui, maintenant ?" }
    ]
  },
  {
    act: 1, title: "Deux voix qui portent", sub: "Bosforie–Tropicalia · tribuns de la jungle et du détroit",
    left: "sultan", right: "capitaine", terrain: 7, mode: "volley", ai: 1, doped: null,
    pre:  [
      { s: "narrator", t: "Grande Forêt. Un ara traverse la canopée dorée. Deux tribuns habitués à crier plus fort que la raison se retrouvent sur la terre rouge." },
      { s: "capitaine", t: "Alors c'est toi, le grand chef de l'Orient ! Ici c'est ma clairière, mon micro, ma tronçonneuse. Bienvenue, cousin." },
      { s: "sultan", t: "Cousin, nous nous ressemblons : deux voix que le monde voudrait baisser et qui montent le volume à la place." },
      { s: "capitaine", t: "Ha ! Sauf que moi j'abats des arbres, et toi t'abats des taux d'intérêt. On est fous tous les deux — mais ma folie, au moins, elle repousse pas." },
      { s: "sultan", t: "Baisser les taux fait baisser les prix ! C'est de la science ! MA science ! Mes économistes en doutaient — ils enseignent désormais la natation dans le détroit." },
      { s: "capitaine", t: "T'es aussi économiste que mon ara est chef d'orchestre. Sers, grand théoricien, qu'on rigole !" },
      { s: "sultan", t: "Je sers. Mais sache-le : j'ai fait du filet un détroit, et du détroit un métier. Chaque passage au-dessus te coûtera." }
    ],
    win:  [
      { s: "sultan", t: "Ta forêt a tremblé, ton ara s'est envolé sans payer — c'est noté — et toi tu es resté cloué. La gravité impériale, Capitaine." },
      { s: "capitaine", t: "Bon, bon, t'as gagné. Mais la prochaine fois, j'amène la tronçonneuse et on renégocie ton filet-péage à MA façon." },
      { s: "sultan", t: "Viens avec ta tronçonneuse. Je la taxe à l'entrée : outil à deux mains, tarif double." }
    ],
    lose:  [
      { s: "capitaine", t: "Déforestation totale ! Mur de troncs, plus de sol pour ton Séisme ! Rentre à tes dômes, cousin !" },
      { s: "sultan", t: "Profite de ta clairière. Le vrai carrefour du monde est chez moi — et tes troncs, je les rachète au poids. Prix cassé : ils ont perdu avec toi." },
      { s: "capitaine", t: "Vendus ! … Attends voir. Je viens de GAGNER et c'est toi qui fais l'affaire du jour ?!" }
    ]
  },

  // ===================== ACTE II — Les tensions montent (Ballon enflammé) =====================
  {
    act: 2, title: "Le toit et le tapis", sub: "Bosforie–Bharatie · le jour où le karma reçut une facture",
    left: "sultan", right: "gourou", terrain: 6, mode: "flame", ai: 1, doped: null,
    pre:  [
      { s: "narrator", t: "Stade Ashram. Guirlandes de soucis orange ; une vache traverse le court sans payer — le Sultan la suit d'un œil de contrôleur. Le ballon s'enflamme : chaque contact brûle — à zéro PV, le point est perdu." },
      { s: "gourou", t: "Namasté, Sultan. Tu prends parti sur ma crête, tu harangues les tribunes sur mes affaires… Le karma note tout, tu sais." },
      { s: "sultan", t: "Parfait ! Dis à ton karma que je lui ouvre un compte. Tout ce qui circule paie — même les conséquences spirituelles. Surtout elles." },
      { s: "gourou", t: "Taxer le karma… Voilà une innovation. Chez moi aussi l'éveil se facture, mais on appelle cela « donation suggérée ». Question d'élégance." },
      { s: "sultan", t: "Nous sommes du même bazar, sage ! Toi tu vends le silence, moi je vends le passage. Et du passage, personne ne peut se passer." },
      { s: "gourou", t: "Si. Cela s'appelle rester chez soi et respirer. Essaie un jour : le premier souffle est gratuit." },
      { s: "sultan", t: "Rien n'est gratuit ! Le jour où l'air m'appartiendra, tu recevras la facture. Sers — et que ta vache s'écarte du corridor commercial !" }
    ],
    win:  [
      { s: "sultan", t: "Ton calme est admirable, Gourou. Mon Séisme est facturable. Devine lequel des deux a fini le match debout." },
      { s: "gourou", t: "Une secousse passe, la montagne reste. Tu as gagné le point ; l'abonnement à la sagesse, lui, reste hors de ta portée. Et hors promotion." },
      { s: "sultan", t: "Je n'achète jamais plein tarif. Je repasserai aux soldes du solstice." }
    ],
    lose:  [
      { s: "gourou", t: "La sérénité use le tonnerre. Ton talon a fatigué avant mon souffle, ami du détroit. La statistique est cosmique et sans appel." },
      { s: "sultan", t: "Tu médites bien, mais tu ne possèdes pas de pont entre deux mondes. Moi si. Et j'y ajoute une voie réservée aux revanches." },
      { s: "gourou", t: "Réserve, réserve. Le karma, lui, ne fait pas la queue. Il est déjà passé — regarde le score." }
    ]
  },
  {
    act: 2, title: "Les amis du détroit gelé", sub: "Bosforie–Bourassie · Sentinelles, corridor & péage sur la neige",
    left: "sultan", right: "volkoi", terrain: 0, mode: "flame", ai: 2, doped: null,
    pre:  [
      { s: "narrator", t: "Place Écarlate sous la neige. Le canon d'apparat tonne au loin. Deux hommes qui se vendent des armes le matin et se marchent dessus l'après-midi. Le ballon s'enflamme : chaque contact brûle — à zéro PV, le point est perdu." },
      { s: "volkoi", t: "Sultan. Tu m'achètes mes défenses, puis tu envoies tes faucons de fer contre mes amis. Curieuse amitié." },
      { s: "sultan", t: "La meilleure sorte, Tsar : celle où chacun sait exactement combien l'autre lui coûte. Nous sommes le seul couple au monde avec une comptabilité à jour." },
      { s: "volkoi", t: "L'hiver travaille pour moi. Ici, ton talon frappe la glace : il glisse. Il ne tremble pas." },
      { s: "sultan", t: "Alors j'instaure un péage sur ta glace ! Chaque flocon qui traverse mon camp me devra un droit d'atterrissage !" },
      { s: "volkoi", t: "Taxer la neige. J'ai connu des hommes qui taxaient le vent. Ils sont enterrés dessous." },
      { s: "sultan", t: "Ils manquaient de conviction ! Sers, camarade : le grain, le gaz, les mercenaires — on se doit trop de choses pour se détester." }
    ],
    win:  [
      { s: "sultan", t: "Même sur ta glace, la terre m'obéit ! Et ta neige me doit trois sets d'arriérés de péage. Je me paie en gaz, cours du jour." },
      { s: "volkoi", t: "Un revers sans conséquence. Nous rejouerons. Nous rejouons toujours, toi et moi. C'est notre malédiction préférée." },
      { s: "sultan", t: "Malédiction facturée d'avance, camarade. J'ai déjà émis le reçu." }
    ],
    lose:  [
      { s: "volkoi", t: "La glace a eu ton talon. Le froid gagne à la patience ; l'agitation perd au bruit." },
      { s: "sultan", t: "Une manche pour l'hiver. Mais c'est mon détroit qui décide quand ton blé sort — et le tarif vient de doubler. Colère théâtrale, supplément inclus." },
      { s: "volkoi", t: "Double. Je répercuterai sur ton gaz. Nos factures s'aiment plus que nous." }
    ]
  },
  {
    act: 2, title: "La Route et le péage", sub: "Bosforie–Panguo · deux empires, un guichet",
    left: "sultan", right: "timonier", terrain: 4, mode: "flame", ai: 2, doped: null,
    pre:  [
      { s: "narrator", t: "Cité du Matin. Lanternes rouges, lions de pierre, toits d'or. Deux empereurs se jaugent au-dessus d'un carnet de commandes très épais. Le ballon s'enflamme : chaque contact brûle — à zéro PV, le point est perdu." },
      { s: "timonier", t: "Sultan. Tu te dis protecteur des peuples cousins de mes provinces du couchant… puis tu signes mes contrats de la Route. Le tempo te contredit." },
      { s: "sultan", t: "Un empire sait quand parler fort et quand compter bas, Timonier. Et j'ai relu tes contrats : nulle part il n'est écrit que ta Route ne paie pas de péage." },
      { s: "timonier", t: "Ma Route paie en patience. C'est une monnaie que tu n'as jamais eue." },
      { s: "sultan", t: "J'ai mieux : un détroit ! La patience attend ; le détroit ENCAISSE. Chaque jour, cargo après cargo, pendant que tu médites sur ton tempo." },
      { s: "timonier", t: "Un proverbe dit : le péager compte les navires ; l'empereur compte les péagers." },
      { s: "sultan", t: "Alors compte-moi ! Je coûte cher et je smashe fort ! Le talon d'abord, le tempo ensuite !" }
    ],
    win:  [
      { s: "sultan", t: "Ton rempart a tremblé, Timonier ! Belle pierre, mauvaises fondations. Pour la fissure : devis en trois exemplaires, main-d'œuvre bosforienne." },
      { s: "timonier", t: "Le tempo se rétablira. Il se rétablit toujours. Va compter tes péages, marchand de ponts." },
      { s: "sultan", t: "C'est déjà fait, et deux fois. On n'est jamais trahi que par ses propres additions." }
    ],
    lose:  [
      { s: "timonier", t: "Le rempart contient le tonnerre comme il contient les steppes. Patiemment. Définitivement." },
      { s: "sultan", t: "Un rempart finit toujours par avoir deux côtés, Timonier — et le mien aura un guichet. Je reviendrai encaisser." },
      { s: "timonier", t: "Reviens. Le guichet sera à moi dans quatre-vingt-dix-neuf ans. C'est dans le contrat que tu n'as pas relu." }
    ]
  },

  // ===================== ACTE III — Conflits ouverts (Bombe) =====================
  {
    act: 3, title: "La porte de l'Union", sub: "Bosforie–Gallardie · trente ans d'attente, intérêts composés",
    left: "sultan", right: "cygne", terrain: 5, mode: "bomb", ai: 2, doped: null,
    pre:  [
      { s: "narrator", t: "Pont des Deux Mondes. Le ballon est une bombe : le camp où elle tombe perd. Sous le pont glissent les barques ; au-dessus, le tapis volant fait mine de ne pas voir la mèche." },
      { s: "sultan", t: "Bienvenue chez moi, Cygne. Entre deux continents, sur MON pont. Trente ans que je frappe à votre porte. Ce soir, je la défonce au smash." },
      { s: "cygne", t: "Une porte, cher Sultan, ça respecte des critères. On ne défonce pas l'état de droit à coups de talon." },
      { s: "sultan", t: "L'état de droit ! Trente ans de formulaires ! J'ai rempli le premier dossier à l'encre — l'encre est devenue pièce de musée avant votre réponse !" },
      { s: "cygne", t: "L'instruction suit son cours. Lente, certes — mais souveraine, exigeante, et disons-le : élégante." },
      { s: "sultan", t: "Alors payez la lenteur ! J'instaure un péage sur l'attente : trente ans d'arriérés, intérêts composés, plus les frais de porte !" },
      { s: "cygne", t: "Facturer l'attente… En même temps, il fallait y penser : vous venez d'inventer la diplomatie à compteur. Renvoyez plutôt cette bombe, voulez-vous ?" }
    ],
    win:  [
      { s: "sultan", t: "BOUM, de ton côté, sur mon détroit ! Ajoute ça au dossier d'adhésion, rubrique « arguments récents » !" },
      { s: "cygne", t: "Reconnaissons-le : de la puissance, une vraie détente au talon, et un sens du théâtre. Les critères restent les critères — mais le spectacle était complet." },
      { s: "sultan", t: "Garde tes critères, Cygne. Un jour, c'est ton Union qui fera la queue à MA porte. Et j'aurai gardé tous les formulaires." }
    ],
    lose:  [
      { s: "cygne", t: "Critères respectés, bombe renvoyée, victoire enregistrée. La procédure a du bon, voyez-vous." },
      { s: "sultan", t: "Tu gagnes le match, pas le détroit. Je reste sur le pas de ta porte. Debout. Et le robinet, c'est moi qui l'ouvre." },
      { s: "cygne", t: "Nous le savons. C'est même la seule raison pour laquelle la porte a un judas." }
    ]
  },
  {
    act: 3, title: "Frères de bazar, rivaux de désert", sub: "Bosforie–Safranie · leadership du Berceau du monde",
    left: "sultan", right: "safran", terrain: 9, mode: "bomb", ai: 3, doped: "R",
    pre:  [
      { s: "narrator", t: "Jardin des Roses. Arcades turquoise, roseraie de palais, un paon qui fait la roue. Le ballon est une bombe : le camp où elle tombe perd — et une aura rouge nimbe le Safran." },
      { s: "safran", t: "Sultan. Nous regardons le même horizon, et nous ne voulons pas le même maître de maison. Fâcheux, n'est-ce pas ?" },
      { s: "sultan", t: "Deux capitales, une seule couronne du Berceau du monde, Safran. Et tes pions jouent contre les miens sur tous les échiquiers de la région." },
      { s: "safran", t: "Tes faucons de fer bourdonnent au-dessus de mes alliés. Chez nous, un quatrain dit que l'abeille mécanique fait un miel amer." },
      { s: "sultan", t: "Mon miel se vend très bien, merci ! Et j'annonce un péage nouveau : toute patience traversant mon camp sera taxée à la lenteur. Tu me dois déjà une fortune." },
      { s: "safran", t: "Taxer la patience… Tu taxerais le parfum des roses si tu savais l'attraper. C'est d'ailleurs pour cela que tu ne l'auras jamais." },
      { s: "narrator", t: "Le Voile d'Or scintille, l'aura rouge s'épaissit. Entre frères de bazar, la marchandise du soir est une mèche allumée." }
    ],
    win:  [
      { s: "sultan", t: "Ton voile a ralenti mes pas, jamais mon talon ! La couronne du Berceau reste sur le pont, entre deux mondes — chez MOI, avec vue sur les deux rives !" },
      { s: "safran", t: "Une manche. La patience est mon arme longue, Sultan. Le désert ne se fatigue jamais — il attend que les empires aient soif." },
      { s: "sultan", t: "Alors je vendrai de l'eau ! Aux deux rives ! Tu ne comprends donc rien au commerce de la fin du monde ?" }
    ],
    lose:  [
      { s: "safran", t: "Boum, sous ton propre tapis. La mesure use la grandiloquence comme l'eau use la pierre du pont — en silence, et sans facture." },
      { s: "sultan", t: "Tu ralentis un empire, tu ne l'arrêtes pas ! Ma bannière pourpre flottait avant ta roseraie. Elle flottera après." },
      { s: "safran", t: "Peut-être. Mais ce soir, elle flotte en berne — et c'est ma roseraie qui parfume ta défaite." }
    ]
  },
  {
    act: 3, title: "Le smash du Sultan", sub: "Bosforie–Levantie · FINALE · le destin passe à la caisse",
    left: "sultan", right: "faucon", terrain: 5, mode: "bomb", ai: 3, doped: "R",
    pre:  [
      { s: "narrator", t: "FINALE. Retour au Pont des Deux Mondes. La bannière pourpre à liseré doré couvre un continent entier du décor. Le ballon est une bombe : le camp où elle tombe perd. Le tapis volant fait un dernier passage — lui, il a payé." },
      { s: "sultan", t: "Faucon. Sur mon pont, entre le levant et le couchant, tu vas comprendre pourquoi le monde entier passe chez MOI." },
      { s: "faucon", t: "Le monde passe, et toi tu harangues les tribunes à mon sujet. Beaucoup de discours, Sultan. Peu de raids." },
      { s: "sultan", t: "Mes discours font tomber des gouvernements ! Ton Raid Éclair m'interdit de sauter ? Parfait : je ne saute jamais. Je reste. Je frappe le sol. Et le sol me rend la monnaie." },
      { s: "faucon", t: "Reste donc. Cloué. Moi, je frappe vite, sans préavis, et je ne négocie pas. La bombe non plus." },
      { s: "sultan", t: "TOUT se négocie ! J'ai taxé la neige, l'attente et le karma — ce soir, je taxe le destin lui-même : s'il veut passer, il paiera le péage comme les autres !" },
      { s: "narrator", t: "Deux supers qui clouent l'adversaire au sol, une mèche qui siffle, un pont entre deux mondes. Ne gardez pas la bombe de votre côté." }
    ],
    win:  [
      { s: "sultan", t: "BOUM ! De ton côté, sous ma bannière pourpre ! Le Levant a un maître — et il tient la caisse ET le pont !" },
      { s: "faucon", t: "Un revers. Tactique, pas stratégique. Je frappe toujours deux fois — la seconde, tu ne la verras pas venir." },
      { s: "sultan", t: "Je la verrai sur le relevé, Faucon : tout passe par mon détroit, même tes secondes frappes. Et pour info… le destin a payé. Cash. J'encadre le reçu à côté de la porte de l'Union." },
      { s: "narrator", t: "Le talon frappe une dernière fois ; tout le pont tremble ; le tapis volant s'incline. Le Sultan lève les bras : sa campagne s'achève, impériale — et rentable." }
    ],
    lose:  [
      { s: "faucon", t: "Raid éclair, bombe renvoyée, match plié. La grandiloquence n'a jamais arrêté un faucon en piqué." },
      { s: "sultan", t: "Tu gagnes un soir sur mon pont. Mais le détroit reste à moi, la bannière reste pourpre, et je frappe encore à toutes les portes. Debout." },
      { s: "faucon", t: "Frappe. Prends un ticket. Toi aussi, maintenant, tu attendras à une porte — et la mienne n'a même pas de sonnette." },
      { s: "sultan", t: "… Trente ans, s'il le faut. Je suis très bon pour attendre en défonçant." }
    ]
  }
];
```
