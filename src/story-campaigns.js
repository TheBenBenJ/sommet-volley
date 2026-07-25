// sommet-volley · Campagnes du Mode Histoire PAR PERSONNAGE
// GÉNÉRÉ depuis docs/histoires/<key>.md par tools/extract_campaigns.js — ne pas éditer à la main.
// Chaque clé = une campagne (le perso affronte ses 9 rivaux, 3 actes, volley/2v2/flamme/bombe/dopage).
"use strict";

const STORY_BY_CHAR = {
  "volkoi": [
    {
      "act": 1,
      "title": "Le double gelé",
      "sub": "Bourassie–Panguo · alliance à quatre au filet",
      "left": "volkoi",
      "right": "timonier",
      "ally": "bebe",
      "right2": "dorf",
      "terrain": 4,
      "mode": "2v2",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Cité du Matin. Pour une fois, ce n'est plus un duel : c'est un 2 contre 2. Le Tsar amène le Maréchal ; le Timonier a recruté le Baron doré."
        },
        {
          "s": "bebe",
          "t": "Grand voisin ! Le Maréchal est TON partenaire ! On défile en double, et mon radar couvre les deux camps !"
        },
        {
          "s": "volkoi",
          "t": "Reste dans ton couloir, petit. Tu digues, je gèle. C'est ça, une alliance moderne."
        },
        {
          "s": "timonier",
          "t": "Deux contre deux. L'harmonie aime les symétries. Toi, Baron, tu joues derrière moi — et tu te tais."
        },
        {
          "s": "dorf",
          "t": "Je parle quand je veux. J'ai le plus beau filet du monde. Et le plus beau partenaire… euh… panda."
        },
        {
          "s": "narrator",
          "t": "Match en double : équipe de gauche contre équipe de droite. Les partenaires comptent autant que les rivaux."
        }
      ],
      "win": [
        {
          "s": "volkoi",
          "t": "Le gel à deux, ça tient mieux. Beau travail, gamin — pour une fois."
        },
        {
          "s": "bebe",
          "t": "VICTOIRE DU BINÔME ! Gravez nos deux noms dans le granit ! Côte à côte !"
        },
        {
          "s": "timonier",
          "t": "Un set. La patience à quatre se compte autrement. On rejouera."
        },
        {
          "s": "dorf",
          "t": "Match truqué. Totalement. Mais j'étais magnifique en partenaire."
        }
      ],
      "lose": [
        {
          "s": "timonier",
          "t": "L'harmonie en double bat le gel en solo. Tempo corrigé."
        },
        {
          "s": "dorf",
          "t": "ON A GAGNÉ ! Le plus grand 2v2 de l'histoire ! Les gens pleuraient en orc !"
        },
        {
          "s": "volkoi",
          "t": "Suspension. Même à deux, parfois l'hiver attend. On reviendra."
        },
        {
          "s": "bebe",
          "t": "Ce n'était PAS une défaite ! C'était un entraînement de partenaires !"
        }
      ]
    },
    {
      "act": 1,
      "title": "Le radar et le manteau",
      "sub": "Bourassie–Ryonganie · le protégé nucléaire",
      "left": "volkoi",
      "right": "bebe",
      "terrain": 3,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé. Granit, arc abstrait, bannières unies, et le radar militaire qui clignote comme un cœur nerveux."
        },
        {
          "s": "bebe",
          "t": "Grand voisin ! Le Maréchal t'a préparé un défilé de douze mille pas de l'oie. Rien que pour un match amical !"
        },
        {
          "s": "volkoi",
          "t": "Range ta parade, petit. Garde le carburant. Tu m'envoies des caisses, je t'envoie du blé. On appelle ça l'amitié moderne."
        },
        {
          "s": "bebe",
          "t": "Ma Batterie AA t'interdit de sauter chez moi ! Personne ne saute chez le Maréchal !"
        },
        {
          "s": "volkoi",
          "t": "Je n'ai pas besoin de sauter. Je reste au sol, et le sol vient à moi. Allume ton radar, il ne verra que de la neige."
        },
        {
          "s": "narrator",
          "t": "Le radar tourne. Le manteau du Tsar ne bouge pas."
        }
      ],
      "win": [
        {
          "s": "volkoi",
          "t": "Bon petit. Continue de fournir, continue de fanfaronner. L'un compense l'autre."
        },
        {
          "s": "bebe",
          "t": "Le Maréchal DÉCRÈTE que c'était un entraînement ! Un entraînement glorieux ! Défilé quand même !"
        }
      ],
      "lose": [
        {
          "s": "bebe",
          "t": "VICTOIRE ! Le radar l'avait prédit ! Le Maréchal a battu le Tsar ! Gravez-le dans le granit !"
        },
        {
          "s": "volkoi",
          "t": "Profite, gamin. Un jour tu comprendras qui tient la clé du carburant. Ce jour-là, tu défileras plus doucement."
        }
      ]
    },
    {
      "act": 1,
      "title": "Le baril et la rose",
      "sub": "Bourassie–Ramenie · pétro-partenaires sanctionnés",
      "left": "volkoi",
      "right": "safran",
      "terrain": 9,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses. Arcades turquoise, dômes en dôme, roseraie d'un rouge trop parfait. Un paon traverse, indifférent aux sanctions."
        },
        {
          "s": "safran",
          "t": "Deux parias au même banquet. On nous ferme les portes ; nous, on ouvre des roseraies. Quelle élégance, non ?"
        },
        {
          "s": "volkoi",
          "t": "Tu vends discret, je vends au rabais, l'Ouest fulmine et achète quand même. L'hypocrisie a un bon rendement."
        },
        {
          "s": "safran",
          "t": "Mon Voile d'Or ralentit tes gestes. La patience, tu connais ; la lenteur, tu vas l'apprendre."
        },
        {
          "s": "volkoi",
          "t": "Ralentis-moi tant que tu veux. Je suis déjà l'hiver. Personne ne va plus lentement que la banquise, et pourtant elle avance."
        },
        {
          "s": "narrator",
          "t": "Volley feutré entre alliés de contrainte. Chacun compte les barils de l'autre."
        }
      ],
      "win": [
        {
          "s": "volkoi",
          "t": "Belle roseraie. Continue de me couvrir les flancs, je te couvrirai au conseil. Entre parias, on se tient chaud."
        },
        {
          "s": "safran",
          "t": "Sardonique, le Nord. Note bien : la rose a des épines, et l'épine, elle, ne gèle pas."
        }
      ],
      "lose": [
        {
          "s": "safran",
          "t": "Le Voile d'Or a figé l'hiver. Mesuré, patient, victorieux. On m'avait dit le Tsar imbattable ; on m'a menti."
        },
        {
          "s": "volkoi",
          "t": "Un revers entre amis. Rien de grave. Sers-moi encore du thé, et parlons de nos ennemis communs."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le gaz et le gourou",
      "sub": "Bourassie–Bharatie · neutralité intéressée",
      "left": "volkoi",
      "right": "gourou",
      "terrain": 6,
      "mode": "flame",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Stade Ashram. Grès miel, guirlandes de soucis orange, palmiers. Une vache qui traverse traverse le court avec l'autorité d'un arbitre."
        },
        {
          "s": "gourou",
          "t": "Namasté, ami du froid. Le monde te boude, et moi je t'achète ton pétrole au rabais. La neutralité est un yoga."
        },
        {
          "s": "volkoi",
          "t": "Le seul qui reste debout quand tout le monde choisit un camp. Souple. Presque bourassien."
        },
        {
          "s": "gourou",
          "t": "Ma Méditation gèle ton camp façon zen. Tu gèles par la peur ; moi, par la sérénité. Même patinoire, autre température d'âme."
        },
        {
          "s": "volkoi",
          "t": "Zen ou glace, le résultat est le même : l'autre ne bouge plus. Servons, gourou. La vache attend, elle."
        },
        {
          "s": "narrator",
          "t": "Deux immobilités s'affrontent. La plus froide gagnera. Ou la plus calme. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "win": [
        {
          "s": "volkoi",
          "t": "L'hiver bat la méditation quand la méditation ferme les yeux. Continue d'acheter, ami neutre."
        },
        {
          "s": "gourou",
          "t": "Un revers m'enseigne. Respirons. Je reviendrai, et j'aurai encore besoin de ton gaz."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "gourou",
          "t": "Le calme absorbe le gel. Namasté, Tsar. La montagne ne prend pas parti, et pourtant elle gagne."
        },
        {
          "s": "volkoi",
          "t": "Match nul pour l'histoire, victoire pour toi. Garde ta neutralité. Elle m'arrange plus que la tienne."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le blé et l'ara",
      "sub": "Bourassie–Tropicalia · céréales, engrais, populisme",
      "left": "volkoi",
      "right": "capitaine",
      "terrain": 7,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Grande Forêt. Clairière de jungle dorée, huttes sur pilotis, court en terre rouge. Un ara traverse en hurlant comme un supporter."
        },
        {
          "s": "capitaine",
          "t": "Alors le Tsar ! On me vend ton engrais, ton blé, ta nostalgie de fer. Ici on aime les gars qui parlent fort et taillent le bois !"
        },
        {
          "s": "volkoi",
          "t": "Tu abats des arbres, je gèle des fronts. Deux façons de faire du vide et d'appeler ça de la grandeur."
        },
        {
          "s": "capitaine",
          "t": "Ma Déforestation te dresse un mur de troncs ! Bon courage pour geler ça, l'ami du Nord !"
        },
        {
          "s": "volkoi",
          "t": "Un mur de bois ? J'en fais du gel qui craque. Le tien tombe ; le mien reste. Sers, capitaine."
        },
        {
          "s": "narrator",
          "t": "Populistes des deux hémisphères. L'un vend le grain, l'autre le rugit. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "win": [
        {
          "s": "volkoi",
          "t": "Le froid porte plus loin que la tronçonneuse. Continue de m'acheter mes engrais, tribun."
        },
        {
          "s": "capitaine",
          "t": "Truqué ! Fraude ! … Bon, remets-moi une cargaison, on oublie. Entre durs, on se comprend."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "capitaine",
          "t": "HA ! La forêt a bouffé l'hiver ! Le Capitaine plante un ballon en pleine banquise ! On coupe, on gagne !"
        },
        {
          "s": "volkoi",
          "t": "Tu gagnes une manche et tu coupes tes propres poumons. Chacun sa méthode pour se refroidir."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "L'avion abattu",
      "sub": "Bourassie–Bosforie · l'incident du détroit",
      "left": "volkoi",
      "right": "sultan",
      "terrain": 5,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Pont des Deux Mondes. Détroit, dômes, bannière violette à liseré doré, tapis volant en approche. Le ballon s’enflamme : chaque contact brûle — à zéro PV, c’est perdu."
        },
        {
          "s": "sultan",
          "t": "Tu m'achètes des dômes, tu me vends des fusées, et un jour l'un de nos oiseaux tombe. On appelle ça une amitié compliquée."
        },
        {
          "s": "volkoi",
          "t": "Tu contrôles le détroit, moi le robinet. Tant qu'on a besoin l'un de l'autre, la braise couve lentement."
        },
        {
          "s": "sultan",
          "t": "Mon Séisme te secoue et t'interdit de sauter ! Sur mon pont, c'est MOI qui fais trembler la terre !"
        },
        {
          "s": "volkoi",
          "t": "Tremble tant que tu veux. Le gel, lui, ne saute pas : il glisse. Et il glisse toujours vers ton camp."
        },
        {
          "s": "narrator",
          "t": "Ne te brûle pas les doigts : renvoie avant d’être à zéro. Entre le froid et le séisme, une seule braise décidera."
        }
      ],
      "win": [
        {
          "s": "volkoi",
          "t": "Le sang-froid éteint la brûlure. On reste amis, Sultan — amis qui gardent un doigt sur le robinet."
        },
        {
          "s": "sultan",
          "t": "Tu gagnes le pont ce soir. Mais le détroit reste à moi, et le détroit se souvient."
        }
      ],
      "lose": [
        {
          "s": "sultan",
          "t": "BOUM sur la banquise ! Le séisme a fissuré l'hiver ! Le détroit couronne son maître !"
        },
        {
          "s": "volkoi",
          "t": "Grandiose, comme toujours. Profite. Le gaz continue de couler, et l'hiver a de la mémoire."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 3,
      "title": "La bromance de glace",
      "sub": "Bourassie–Doria · flatteries croisées",
      "left": "volkoi",
      "right": "dorf",
      "terrain": 1,
      "mode": "bomb",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Country Club Doré. Resort clinquant, tour à toit plat, fontaine, palmiers en pot. Le magnat déroule le tapis, et personne ne sait qui manipule qui."
        },
        {
          "s": "dorf",
          "t": "Le Tsar ! Un type fort. Très fort. Les gens disent qu'il est fort. On s'entend super bien, tout le monde en parle."
        },
        {
          "s": "volkoi",
          "t": "Tu bâtis un Mur d'or, je bâtis l'hiver. Deux hommes qui adorent bloquer le camp d'en face. Presque touchant."
        },
        {
          "s": "dorf",
          "t": "Ton hiver, ton hiver… moi j'ai le plus beau gazon du monde et un Mur en OR. De l'or ! Ça brille plus que ta neige !"
        },
        {
          "s": "volkoi",
          "t": "L'or fond, ami. La neige revient. Devine lequel de nous deux joue la longue partie."
        },
        {
          "s": "narrator",
          "t": "Volley de flatteries. Chacun croit tenir l'autre en laisse. Les analystes, eux, ne dorment plus. Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "win": [
        {
          "s": "volkoi",
          "t": "Bon match, associé. Continue de te vanter ; ça me laisse le temps de préparer l'hiver."
        },
        {
          "s": "dorf",
          "t": "Truqué ! Mais élégamment truqué. On refait ça au sommet, entre gars forts. Les plus forts !"
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "dorf",
          "t": "GAGNÉ ! Le plus grand match de tous les temps ! J'ai battu le Tsar ! Personne n'avait jamais fait ça, personne !"
        },
        {
          "s": "volkoi",
          "t": "Savoure, associé. Je préfère te laisser la coupe et garder la partie. C'est plus chaud pour toi, plus utile pour moi."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le faucon dans la neige",
      "sub": "Bourassie–Levantie · fronts croisés",
      "left": "volkoi",
      "right": "faucon",
      "terrain": 8,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Citadelle du Levant. Grès sur colline désertique, remparts, dômes anciens et tours de verre. Un faucon fend le ciel. La bombe est armée — et l'aura de l'adversaire vire au rouge."
        },
        {
          "s": "faucon",
          "t": "Tu armes mes ennemis, tu couvres mes rivaux au conseil. Ce soir, pas de neutralité, pas de dégel."
        },
        {
          "s": "volkoi",
          "t": "Intransigeant jusqu'à l'os. J'aime. Ça rend le froid plus utile. Toi tu frappes vite, moi je frappe tard."
        },
        {
          "s": "faucon",
          "t": "Mon Raid Éclair t'interdit de sauter chez moi. Frappe préventive : je ne laisse pas l'hiver arriver."
        },
        {
          "s": "volkoi",
          "t": "Frappe avant, si tu veux. On ne devance pas une saison. Elle arrive de toute façon, et elle te trouve fatigué."
        },
        {
          "s": "narrator",
          "t": "Le rapace se dope à l'enjeu. Renvoie la bombe. Ne laisse jamais la mèche finir dans ton camp."
        }
      ],
      "win": [
        {
          "s": "volkoi",
          "t": "Le raid s'essouffle, l'hiver dure. Tu es rapide, faucon. Moi, je suis inévitable."
        },
        {
          "s": "faucon",
          "t": "Une manche. Rien n'est réglé. Le rapace revient toujours, et il revient plus bas."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "faucon",
          "t": "Frappe nette, cible neutralisée. L'hiver n'aura pas le temps de s'installer. Jamais."
        },
        {
          "s": "volkoi",
          "t": "Rapide, brutal, précis. Et pressé. C'est ta faiblesse : tu comptes en secondes, je compte en siècles."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le dégel n'aura pas lieu",
      "sub": "Bourassie–Gallardie · le grand front de l'Ouest",
      "left": "volkoi",
      "right": "cygne",
      "terrain": 0,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Finale. Place Écarlate, forteresse cramoisie sous la neige, bulbe rouge au loin, bannières bleu-vert claquant au gel. Le canon d'apparat pivote sur son traîneau. La bombe grésille, l'aura du Cygne rougeoit."
        },
        {
          "s": "cygne",
          "t": "En même temps, un ennemi, ça se combat ET ça se parle. Je suis venu jusque sur ta place, Tsar. Le dialogue et le contre."
        },
        {
          "s": "volkoi",
          "t": "Chez moi. Sous ma neige. Tu parles, tu proposes, tu tends la main… et moi j'attends que le froid réponde à ta place."
        },
        {
          "s": "cygne",
          "t": "Ton Passage en Force, tes fronts gelés, ton canon décoratif… La Gallardie ne cédera pas un pouce de gazon."
        },
        {
          "s": "volkoi",
          "t": "Ton Passage en Force à toi empêche mes smashes ? Parfait. Je n'ai pas besoin de smasher. J'ai besoin que tu aies froid."
        },
        {
          "s": "cygne",
          "t": "En même temps… il fait vraiment très froid ici. Servons avant que je ne sente plus mes doigts."
        },
        {
          "s": "narrator",
          "t": "Le canon tonne pour l'ouverture. Le Cygne se dope à l'enjeu. Le dégel de l'Ouest se joue en un dernier échange."
        }
      ],
      "win": [
        {
          "s": "volkoi",
          "t": "Le canon a parlé, l'hiver a répondu. Rentre au Palais Gallard, Cygne. Dis-leur que la neige, elle, ne négocie pas."
        },
        {
          "s": "volkoi",
          "t": "J'ai gelé tous les fronts, un par un, sans jamais courir. On appelle ça la patience. Vous appelez ça un problème."
        },
        {
          "s": "cygne",
          "t": "Ce n'est pas une fin, c'est un front de plus. La diplomatie est un sport d'endurance — et l'endurance, je la garde."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "cygne",
          "t": "Le dégel a eu lieu. Sur ta propre place, sous ton propre canon. En même temps, il fallait bien que quelqu'un rallume le printemps."
        },
        {
          "s": "volkoi",
          "t": "Une manche perdue chez moi. Je ne concède pas : je suspends. L'hiver, contrairement à ta victoire, reviendra. Il revient toujours."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    }
  ],
  "dorf": [
    {
      "act": 1,
      "title": "L'Alliance qui coûte cher",
      "sub": "Alliance élargie · double contre le Cygne",
      "left": "dorf",
      "right": "cygne",
      "ally": "faucon",
      "right2": "volkoi",
      "terrain": 1,
      "mode": "2v2",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Resort doré. Aujourd'hui l'Alliance joue en double : le Baron et le Faucon d'un côté, le Cygne et le Tsar de l'autre. Personne n'avait prévu ce tableau."
        },
        {
          "s": "dorf",
          "t": "Toi, Faucon, tu es mon partenaire. Le meilleur. Le plus dur. On paie l'Alliance… en smashs."
        },
        {
          "s": "faucon",
          "t": "Je ne paie rien. Je sécurise. Toi, tu parles ; moi, je digue. Deal."
        },
        {
          "s": "cygne",
          "t": "En même temps alliés, en même temps adversaires… et en même temps en 2v2. C'est dense."
        },
        {
          "s": "volkoi",
          "t": "Tu m'as mis avec l'oiseau bavard. Parfait. Je gèle, il parle, vous perdez."
        },
        {
          "s": "narrator",
          "t": "Deux équipes, quatre egos. L'alliance se joue aussi entre partenaires de filet."
        }
      ],
      "win": [
        {
          "s": "dorf",
          "t": "ÉNORME ! Meilleure alliance du monde ! Faucon, t'es pas mauvais — pour un allié."
        },
        {
          "s": "faucon",
          "t": "On a tenu la ligne. Le reste est du bruit de sommet."
        },
        {
          "s": "cygne",
          "t": "Défaite instructive. Mon partenaire gelé et moi, on retiendra la leçon. En même temps."
        },
        {
          "s": "volkoi",
          "t": "Un revers. Temporaire. Même en double, l'hiver revient."
        }
      ],
      "lose": [
        {
          "s": "cygne",
          "t": "Voilà : un partenariat exigeant, et un point décisif. En même temps ferme, en même temps élégant."
        },
        {
          "s": "volkoi",
          "t": "Le gel à deux, ça marche. Tu peux garder ton Alliance, Baron — elle vient de geler."
        },
        {
          "s": "dorf",
          "t": "Truqué ! Mon partenaire a… enfin, LE filet était de travers !"
        },
        {
          "s": "faucon",
          "t": "On recommence. Sans discours. Avec plus de digues."
        }
      ]
    },
    {
      "act": 1,
      "title": "Les belles lettres",
      "sub": "Doria–Ryonganie · la bromance improbable",
      "left": "dorf",
      "right": "bebe",
      "terrain": 3,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé. Le radar tourne, les gradins de granit sont pleins. Deux hommes qui s'écrivent des lettres d'amour se retrouvent au filet."
        },
        {
          "s": "bebe",
          "t": "Grand Baron. Nous nous étions écrit de si belles lettres, toi et moi. Les plus belles. Presque aussi belles que les miennes."
        },
        {
          "s": "dorf",
          "t": "Grand leader ! Très grand ! On est tombés amoureux, tu sais. Par courrier. Le plus beau courrier de tous les temps."
        },
        {
          "s": "bebe",
          "t": "Alors joue avec discipline. Ici, on défile au millimètre. Un pas de travers et la Batterie AA t'interdit de sauter."
        },
        {
          "s": "dorf",
          "t": "Interdit de sauter ? Moi je saute quand je veux, où je veux. Mais pour toi, mon ami, je resterai au sol. Par amour. Sers."
        }
      ],
      "win": [
        {
          "s": "dorf",
          "t": "Battu le petit maréchal ! Mais gentiment. Entre amoureux. Je t'écrirai ce soir, la plus belle lettre, tu vas pleurer."
        },
        {
          "s": "bebe",
          "t": "Une défaite temporaire. Le programme continue, le défilé aussi. Écris-moi quand même. J'aime tes majuscules."
        }
      ],
      "lose": [
        {
          "s": "bebe",
          "t": "La discipline écrase l'improvisation. Même l'amour a un défilé, Baron. Reste dans le rang."
        },
        {
          "s": "dorf",
          "t": "Il triche ! Enfin… il triche merveilleusement bien. Quel talent. On s'aime toujours ? On s'aime toujours."
        }
      ]
    },
    {
      "act": 1,
      "title": "Le grand show",
      "sub": "Doria–Bharatie · deux vendeurs, une vache",
      "left": "dorf",
      "right": "gourou",
      "terrain": 6,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Stade Ashram, grès couleur miel, guirlandes de soucis. Une vache qui traverse traverse le court avec la sérénité d'un arbitre neutre."
        },
        {
          "s": "dorf",
          "t": "Regarde cette foule ! Immense ! On dit que tu remplis les stades. Moi aussi je remplis les stades. On devrait faire un stade ensemble. Le plus grand."
        },
        {
          "s": "gourou",
          "t": "Namasté, Baron. Toi tu vends des tours ; moi je vends du souffle. Devine lequel des deux ne tombe jamais en faillite."
        },
        {
          "s": "dorf",
          "t": "La faillite ! Six fois ! Sept ! Et je suis toujours là, plus doré que jamais. C'est ça, un vrai champion."
        },
        {
          "s": "gourou",
          "t": "Médite là-dessus pendant que la vache traverse. Ta grande gueule ne renverra pas mes ballons. Servons."
        }
      ],
      "win": [
        {
          "s": "dorf",
          "t": "Le plus grand show du monde ! Même la vache a applaudi. Enfin, elle m'a regardé. C'est pareil. Beau jeu, le gourou."
        },
        {
          "s": "gourou",
          "t": "Tu gagnes le match et tu perds ton calme à chaque point. Étrange économie. Respire un peu, ça se vend aussi."
        }
      ],
      "lose": [
        {
          "s": "gourou",
          "t": "Le calme bat le tapage. Toujours. La vache l'avait compris avant toi. Namasté, Baron."
        },
        {
          "s": "dorf",
          "t": "Truqué par un homme en pyjama ! Incroyable. La vache était de son côté. Complot bovin. J'ouvre une enquête."
        }
      ]
    },
    {
      "act": 2,
      "title": "La guerre des tours",
      "sub": "Doria–Bosforie · qui a la plus haute ?",
      "left": "dorf",
      "right": "sultan",
      "terrain": 5,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Pont des Deux Mondes. Un tapis volant survole le détroit. Deux bâtisseurs de tours se toisent, chacun persuadé d'avoir la plus grande. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "sultan",
          "t": "Je bâtis des dômes, des tours, des ponts entre deux continents ! Ma skyline défie le ciel. Et la tienne ? Un hôtel doré à toit plat."
        },
        {
          "s": "dorf",
          "t": "Toit plat, mais or MASSIF ! La plus haute tour du monde, tout le monde le dit. La tienne, elle est jolie. Pour une deuxième place."
        },
        {
          "s": "sultan",
          "t": "Deuxième place ? Je contrôle le détroit du monde et tu me parles de classement immobilier ? Je vais te défoncer au smash."
        },
        {
          "s": "dorf",
          "t": "Tu smashes, je bâtis Le Mur. Un mur d'or au milieu de ton beau tapis. On verra qui vole encore. Sers, le bâtisseur."
        }
      ],
      "win": [
        {
          "s": "dorf",
          "t": "La plus haute tour, le plus grand mur, le plus beau match ! Ta skyline est jolie, mais la mienne gagne. Négocie ta reddition."
        },
        {
          "s": "sultan",
          "t": "Un point pour ta tour. Le détroit reste à moi. On rebâtira, Baron. Plus haut. Toujours plus haut."
        }
      ],
      "lose": [
        {
          "s": "sultan",
          "t": "Grandeur contre grandeur, la mienne a smashé la tienne. Mon dôme salue ton toit plat. De haut."
        },
        {
          "s": "dorf",
          "t": "Il a gagné parce que le tapis trichait ! Un tapis étranger ! Je le taxe. Je taxe tous les tapis. Croyez-moi."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le deal du siècle",
      "sub": "Doria–Levantie · l'art de la négociation",
      "left": "dorf",
      "right": "faucon",
      "terrain": 8,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Citadelle du Levant, grès sur colline désertique. Un faucon décrit des cercles. En bas, on prépare non pas un match, mais un « accord historique ». Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "dorf",
          "t": "Mon ami ! On va signer le plus grand accord de tous les temps. La paix, le volley, l'immobilier. Tu me donnes le point, je te donne mon amitié éternelle."
        },
        {
          "s": "faucon",
          "t": "Je ne donne pas de points, Baron. Je les sécurise. Un Raid Éclair et tu ne sautes plus. La sécurité d'abord, l'amitié ensuite."
        },
        {
          "s": "dorf",
          "t": "La sécurité ! J'adore. Je te vends un mur d'or, clé en main, financé par tes voisins. Le plus beau mur défensif du monde."
        },
        {
          "s": "faucon",
          "t": "Garde ton mur. J'ai des remparts, un faucon et zéro état d'âme. On signe sur le terrain. Debout. Sers."
        }
      ],
      "win": [
        {
          "s": "dorf",
          "t": "Deal conclu ! Le plus grand deal ! Tu as perdu, mais tu as gagné mon respect, ce qui vaut de l'or. Beaucoup d'or. Le mien."
        },
        {
          "s": "faucon",
          "t": "Tu gagnes le point, pas la région. Je reste debout, comme toujours. On se reverra, marchand de murs."
        }
      ],
      "lose": [
        {
          "s": "faucon",
          "t": "Raid, contre, sécurisé. Ton grand deal tenait sur du vent doré. La citadelle, elle, tient sur la pierre."
        },
        {
          "s": "dorf",
          "t": "Il a rompu l'accord ! Après tout ce que j'ai promis de ne jamais tenir ! Une trahison. La plus belle trahison. Enquête."
        }
      ]
    },
    {
      "act": 2,
      "title": "La guerre des puces",
      "sub": "Doria–Panguo · tarifs, silicium & mèche courte",
      "left": "dorf",
      "right": "timonier",
      "terrain": 4,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Cité du Matin, murs cramoisis, toits d'or. Le ballon n'est plus un ballon : c'est un ballon enflammé à brûlure. Enjeu : qui fabrique le monde ?"
        },
        {
          "s": "dorf",
          "t": "Des taxes ! Des taxes sur tout ! Sur tes puces, ton filet, tes lanternes, l'air que tu respires ! On gagne tellement, tu vas être fatigué de perdre."
        },
        {
          "s": "timonier",
          "t": "Taxe ce que tu veux, Baron. Tes tours, tes voiturettes, tes bombes dorées… c'est encore mon atelier qui les assemble. Patience."
        },
        {
          "s": "dorf",
          "t": "On se découple ! On rapatrie tout à Doria ! Enfin… après ce match. J'ai un peu besoin de tes ballons. Beaucoup. Tous, en fait."
        },
        {
          "s": "timonier",
          "t": "Le tempo, l'harmonie, la brûlure qui brûle. Tu klaxonnes ; moi je livre à l'heure. Renvoie le ballon enflammé si tu peux."
        }
      ],
      "win": [
        {
          "s": "dorf",
          "t": "Made in Doria ! On gagne ! On gagne tellement que le monde entier est jaloux ! le ballon enflammé a explosé chez toi, le plus beau boum du monde."
        },
        {
          "s": "timonier",
          "t": "Une manche. La chaîne, elle, ne s'arrête jamais. Tu reviendras à l'atelier, l'or à la main. Ils reviennent tous."
        }
      ],
      "lose": [
        {
          "s": "timonier",
          "t": "Le tempo écrase le klaxon. Découple donc ; commande-moi de nouvelles usines pour le faire. Je patiente. Toujours."
        },
        {
          "s": "dorf",
          "t": "Subventionné ! Déloyal ! Il fabrique même mes bombes ! … Combien pour le prochain lot ? Je paie. Discrètement."
        }
      ]
    },
    {
      "act": 3,
      "title": "Deux populistes, un selfie",
      "sub": "Doria–Tropicalia · frères d'esbroufe",
      "left": "dorf",
      "right": "capitaine",
      "terrain": 7,
      "mode": "bomb",
      "ai": 3,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Grande Forêt, clairière de jungle dorée, court en terre rouge. Un ara pousse un cri. Deux fanfarons se reconnaissent — et se méfient d'autant plus. Le ballon est une bombe : le camp où elle tombe perd."
        },
        {
          "s": "capitaine",
          "t": "Baron ! Le seul type sur cette planète qui parle plus fort que moi. Ça m'énerve. Ça me plaît. Ma tronçonneuse a soif de ton gazon doré."
        },
        {
          "s": "dorf",
          "t": "Le Capitaine ! On est pareils, toi et moi. Les meilleurs. Sauf que moi je suis un peu plus le meilleur. Range ta tronçonneuse près de mon mur."
        },
        {
          "s": "capitaine",
          "t": "Ton mur d'or ? Je le débite en bûches. Ici c'est ma forêt, mes règles, mon bazar. Deux brutes, une balle, une clairière."
        },
        {
          "s": "dorf",
          "t": "Deux légendes, tu veux dire. On fait le point d'abord, le selfie ensuite. Le plus beau selfie de l'histoire. Sers, mon frère."
        }
      ],
      "win": [
        {
          "s": "dorf",
          "t": "Battu le bûcheron ! Sur SON terrain rouge ! Énorme ! On reste amis, hein ? Les meilleurs restent amis. Souris pour la photo."
        },
        {
          "s": "capitaine",
          "t": "Volé chez moi par un marchand de tours ! Bon… c'était du beau bazar. Reviens quand tu veux, j'aurai deux tronçonneuses."
        }
      ],
      "lose": [
        {
          "s": "capitaine",
          "t": "La brute a parlé, et c'était moi ! Ton mur d'or fait un joli tas de bois. Ha ! On se refait un selfie, champion ?"
        },
        {
          "s": "dorf",
          "t": "Truqué par un homme à la tronçonneuse ! Dans une forêt ! Personne n'était prévenu. Personne. C'est un scandale magnifique."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le duel doré",
      "sub": "Doria–Ramenie · tension sous les roses",
      "left": "dorf",
      "right": "safran",
      "terrain": 9,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses, arcades turquoise, roseraie de palais. Un paon déploie sa roue. La bombe tourne. L'adversaire arrive… l'œil injecté, l'aura rouge."
        },
        {
          "s": "safran",
          "t": "Tu bâtis des murs d'or, Baron. Nous, on tisse des Voiles d'Or. Le tien clinquant, le mien patient. Devine lequel ralentit l'autre."
        },
        {
          "s": "dorf",
          "t": "Un voile ? J'ai un MUR ! Le plus grand mur du monde ! Ton voile, c'est du rideau de douche. Je vais te sanctionner. Tarifs. Tout."
        },
        {
          "s": "narrator",
          "t": "Regarde ses veines. Il carbure. On murmure que les grands enjeux le « dopent » — et que ce soir, l'enjeu est immense."
        },
        {
          "s": "safran",
          "t": "Mesuré, sardonique, et ce soir… concentré. Ton klaxon ne me fera pas sursauter. La cour est patiente. La bombe, non. Sers."
        }
      ],
      "win": [
        {
          "s": "dorf",
          "t": "Battu son truc dopé ! Sous les roses ! Sans carburant, juste avec MOI ! Le plus grand exploit du sport, croyez-moi, les gens pleuraient."
        },
        {
          "s": "safran",
          "t": "Un point pour le clinquant. Le voile retombera, patient, sur ton or trop pressé. On se retrouvera, marchand."
        }
      ],
      "lose": [
        {
          "s": "safran",
          "t": "Le voile a ralenti le klaxon, et la bombe a fait le reste. Mesure-toi à la patience, Baron. Tu n'en as aucune."
        },
        {
          "s": "dorf",
          "t": "Il était DOPÉ ! Aura rouge ! Match volé ! La plus grande injustice depuis la dernière ! Enquête, sanctions, tarifs sur les roses !"
        }
      ]
    },
    {
      "act": 3,
      "title": "Le sommet à domicile",
      "sub": "Doria–Bourassie · flatterie, bombe et mèche courte",
      "left": "dorf",
      "right": "volkoi",
      "terrain": 1,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Finale. Retour au Country Club Doré, fontaine allumée, palmiers au garde-à-vous. Le Tsar glacial débarque sur le gazon le plus vert du monde. La bombe attend."
        },
        {
          "s": "volkoi",
          "t": "Alors c'est ici ton palais. Beaucoup d'or. Beaucoup de bruit. J'apporte le froid. Ton gazon va geler pendant que tu klaxonnes."
        },
        {
          "s": "dorf",
          "t": "Grand Tsar ! On s'aime bien, toi et moi, tout le monde le dit — enfin, personne le dit, mais moi je le dis. Sur MON terrain, c'est MOI qui gagne."
        },
        {
          "s": "volkoi",
          "t": "T'aimer ? Je te tolère tant que tu m'es utile. Ce soir tu ne l'es plus. Le froid ne négocie pas. La mèche fait le travail."
        },
        {
          "s": "narrator",
          "t": "Ses veines pulsent, l'aura rouge irradie. Le dopage d'État, à ciel ouvert, sur la plus belle pelouse du monde. Baron Dorf, pour une fois, joue pour lui seul."
        },
        {
          "s": "dorf",
          "t": "Le plus grand match de tous les temps. Le froid contre l'or. Et je vais gagner. Sans carburant. Juste avec MOI, ma mèche et Le Mur. Servons."
        }
      ],
      "win": [
        {
          "s": "dorf",
          "t": "CHAMPION ! À domicile ! Sans dopage ! Le plus grand vainqueur de l'histoire des sommets ! J'ai gelé le glacier ! On construit une tour pour fêter ça !"
        },
        {
          "s": "volkoi",
          "t": "Une défaite. Sur ton gazon, sous tes palmiers dorés. Profite, bavard. L'hiver est patient, et il connaît le chemin de ta fontaine."
        },
        {
          "s": "narrator",
          "t": "La machine glacée tombe au bout du monde doré. Baron Dorf lève les bras, salue une foule immense — et pour une fois, elle existe vraiment. Générique."
        }
      ],
      "lose": [
        {
          "s": "volkoi",
          "t": "Le froid a éteint la fontaine. Ton or brille encore, mais il ne renvoie pas les bombes. Prévu. Comme toujours."
        },
        {
          "s": "dorf",
          "t": "Truqué ! Le plus grand vol de l'histoire ! Sur MON terrain ! Une enquête, la plus grande enquête ! Je reviendrai, plus doré, plus fort. Croyez-moi."
        }
      ]
    }
  ],
  "cygne": [
    {
      "act": 1,
      "title": "La poignée de main à quatre",
      "sub": "Gallardie–Libertaria · double diplomatique",
      "left": "cygne",
      "right": "dorf",
      "ally": "safran",
      "right2": "volkoi",
      "terrain": 1,
      "mode": "2v2",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Resort doré. Le Cygne a invité Safran comme partenaire de double. En face : le Baron et le Tsar. La poignée de main devient un nœud à quatre mains."
        },
        {
          "s": "cygne",
          "t": "Cher Safran, vous diguez avec élégance, je passe en force. Ensemble, en même temps."
        },
        {
          "s": "safran",
          "t": "Un partenariat mesuré. Tant que ton allié doré ne déchire pas encore un accord au milieu du set."
        },
        {
          "s": "dorf",
          "t": "Deux contre deux ! J'ai le meilleur partenaire… euh… le plus froid. Ça compte."
        },
        {
          "s": "volkoi",
          "t": "Je n'aime pas les poignées de main. Je préfère les points. Digue, Baron."
        },
        {
          "s": "narrator",
          "t": "Mode 2v2 : une équipe, un filet, quatre ambitions."
        }
      ],
      "win": [
        {
          "s": "cygne",
          "t": "Partenariat réussi. Fermeté et protocole, en même temps. Merci, Safran."
        },
        {
          "s": "safran",
          "t": "Beau double. La table des négociations reste ouverte — contrairement à leur camp."
        },
        {
          "s": "dorf",
          "t": "Truqué. Mon partenaire gelait trop. Ou pas assez. Les deux."
        },
        {
          "s": "volkoi",
          "t": "Un set. L'hiver, lui, ne joue jamais en double : il joue seul contre tout le monde."
        }
      ],
      "lose": [
        {
          "s": "dorf",
          "t": "GAGNÉ ! Meilleur 2v2 du monde ! Volkoï, t'es… correct. Pour un Tsar."
        },
        {
          "s": "volkoi",
          "t": "Le gel a deux visages ce soir. Le vôtre a craqué."
        },
        {
          "s": "cygne",
          "t": "Défaite de binôme. On retient la main, on retend la corde. Ensemble."
        },
        {
          "s": "safran",
          "t": "Mesure ta prochaine alliance, Cygne. Même les partenaires ont besoin d'accords tenus."
        }
      ]
    },
    {
      "act": 1,
      "title": "Le tempo et le bavard",
      "sub": "Gallardie–Panguo · dialogue des mondes",
      "left": "cygne",
      "right": "timonier",
      "terrain": 4,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Cité du Matin. Murs cramoisis, toits d'or, lions de pierre. Le Cygne arrive avec une délégation, un discours et trois contre-discours de rechange."
        },
        {
          "s": "timonier",
          "t": "Tu parles beaucoup, oiseau. Chez moi, on parle peu et on dure mille ans. Le tempo, toujours le tempo."
        },
        {
          "s": "cygne",
          "t": "J'entends votre patience, et en même temps je vous propose un partenariat exigeant : ni naïf, ni hostile. Un dialogue lucide."
        },
        {
          "s": "timonier",
          "t": "Un dialogue lucide. Joli. Chez moi ça veut dire : tu achètes, tu ne critiques pas, tu souris aux lions."
        },
        {
          "s": "cygne",
          "t": "Je souris à tout le monde, c'est mon problème. Mais je passe en force quand il le faut. Regardez ce service : imparable."
        },
        {
          "s": "timonier",
          "t": "Sers donc. Le rempart attend. Elle a le temps. Elle a toujours le temps."
        }
      ],
      "win": [
        {
          "s": "cygne",
          "t": "Vous voyez ? On peut être ferme et courtois. En même temps. C'est toute ma doctrine, résumée en un point gagnant."
        },
        {
          "s": "timonier",
          "t": "Un revers mineur. L'harmonie corrigera la trajectoire. Reviens dans mille ans, on recomptera."
        }
      ],
      "lose": [
        {
          "s": "timonier",
          "t": "Trop de mots, pas assez de points. Le silence a gagné, comme d'habitude."
        },
        {
          "s": "cygne",
          "t": "Défaite instructive. J'ai beaucoup appris. Et en même temps, je referai exactement pareil au prochain set."
        }
      ]
    },
    {
      "act": 1,
      "title": "La leçon de sérénité",
      "sub": "Gallardie–Bharatie · deux premiers de la classe",
      "left": "cygne",
      "right": "gourou",
      "terrain": 6,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Stade Ashram, grès couleur miel, guirlandes de soucis orange, une vache qui traverse qui décide de traverser le court quand ça lui chante."
        },
        {
          "s": "gourou",
          "t": "Namasté, Cygne. Tu cours vite à la surface. Mais le mental, en dessous ? Agité comme un étang à pigeons."
        },
        {
          "s": "cygne",
          "t": "Vous méditez, j'admire ; et en même temps, j'agis. Je suis un contemplatif qui n'a pas le temps de contempler."
        },
        {
          "s": "gourou",
          "t": "Voilà ton mal, ami. Tu veux tenir les deux bouts de la corde, et la corde te tient."
        },
        {
          "s": "cygne",
          "t": "La corde et moi, nous avons un accord. Elle me fatigue, je la fais passer en force. Balle au centre."
        },
        {
          "s": "gourou",
          "t": "Attention à la vache. Elle ne connaît ni ta gauche ni ta droite. Elle est déjà au-delà des clivages."
        }
      ],
      "win": [
        {
          "s": "cygne",
          "t": "Vous voyez, la sérénité et l'action se rejoignent au sommet. En même temps zen, en même temps efficace."
        },
        {
          "s": "gourou",
          "t": "Beau point. On respire, on s'incline, on revient. La montagne, elle, ne s'incline devant personne."
        }
      ],
      "lose": [
        {
          "s": "gourou",
          "t": "Le calme a couru plus longtemps que l'ambition. Namasté, premier de la classe."
        },
        {
          "s": "cygne",
          "t": "Défaite. Recentrage. Verticale. Je note tout ça, et en même temps, je repars conquérant."
        }
      ]
    },
    {
      "act": 2,
      "title": "La porte du détroit",
      "sub": "Gallardie–Bosforie · l'adhésion sans fin",
      "left": "cygne",
      "right": "sultan",
      "terrain": 5,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Pont des Deux Mondes, entre deux continents. Une candidature qui dure depuis si longtemps qu'on a arrêté de compter les décennies. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "sultan",
          "t": "Trente ans que je frappe à ta porte, Cygne. Ce soir, je la défonce au smash devant tout le détroit."
        },
        {
          "s": "cygne",
          "t": "Notre Union a des critères, des valeurs, des procédures. Et en même temps, un contre magnifique. La porte est ouverte… à condition."
        },
        {
          "s": "sultan",
          "t": "« À condition » ! Toujours vos conditions ! Pendant que vous délibérez, moi je tiens les deux rives d'une seule main."
        },
        {
          "s": "cygne",
          "t": "Un détroit se traverse dans les deux sens, cher Sultan. Vous pouvez entrer, en même temps je peux fermer. C'est ça, l'équilibre."
        },
        {
          "s": "sultan",
          "t": "Ton équilibre, c'est une porte battante qui me claque au visage. Sers, technocrate. Je vais te la faire sortir de ses gonds."
        }
      ],
      "win": [
        {
          "s": "cygne",
          "t": "Reconnaissons de la puissance. On reparlera des critères au prochain sommet. En même temps ferme, en même temps ouvert : voilà."
        },
        {
          "s": "sultan",
          "t": "Tu gagnes le match, pas le détroit. Je reste sur le pas de ta porte. Debout. Immense. Et j'ai la clé."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "sultan",
          "t": "La porte a cédé ! Un jour, c'est ton Union qui frappera chez MOI. Et je délibérerai. Longtemps."
        },
        {
          "s": "cygne",
          "t": "Puissant, indéniablement. Défaite honorable. Nos critères, eux, restent debout. Comme mon obélisque."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le voile et le protocole",
      "sub": "Gallardie–Ramenie · l'accord introuvable",
      "left": "cygne",
      "right": "safran",
      "terrain": 9,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses, arcades turquoise, un paon qui fait la roue près du filet. Deux négociateurs se retrouvent après un accord jadis signé, jadis déchiré. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "safran",
          "t": "On avait un accord, Cygne. Élégant. Équilibré. Puis ton grand allié doré l'a jeté à la corbeille, et tu as regardé sans bouger."
        },
        {
          "s": "cygne",
          "t": "J'ai tout fait pour le sauver, croyez-moi. En même temps, on ne retient pas un ouragan blond par la manche. Je reste attaché au dialogue."
        },
        {
          "s": "safran",
          "t": "Le dialogue. Toujours le dialogue. Pendant ce temps, mon Voile d'Or ralentit ton camp, et ta patience s'effiloche."
        },
        {
          "s": "cygne",
          "t": "Vous ralentissez, je passe en force. C'est notre chorégraphie : vous freinez, j'accélère, et le paon nous juge."
        },
        {
          "s": "safran",
          "t": "Mesure tes accélérations, oiseau. Dans ce jardin, tout ce qui va trop vite finit dans les épines."
        }
      ],
      "win": [
        {
          "s": "cygne",
          "t": "Vous voyez : la fermeté et la main tendue, en même temps. Reprenons les négociations demain, à froid, autour d'un thé."
        },
        {
          "s": "safran",
          "t": "Joli point, technocrate. Mais tant que ton allié déchire mes accords, ton thé aura un goût de trahison."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "safran",
          "t": "Le Voile d'Or l'a emporté. La lenteur patiente use l'impatience élégante. Reviens quand tu tiendras parole."
        },
        {
          "s": "cygne",
          "t": "Défaite mesurée pour un adversaire mesuré. Je repars, en même temps déçu et déterminé. Nous rebâtirons cet accord."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "L'ami intransigeant",
      "sub": "Gallardie–Levantie · reconnaître ou ne pas reconnaître",
      "left": "cygne",
      "right": "faucon",
      "terrain": 8,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Citadelle du Levant, remparts de grès sur la mer. Un faucon tournoie. Ce soir, le ballon est un ballon enflammé : chaque contact brûle — à zéro PV, c’est perdu."
        },
        {
          "s": "faucon",
          "t": "Tu veux « reconnaître », Cygne ? Tu veux « équilibrer » ? Ici, on ne reconnaît que la sécurité. Le reste est du bavardage de salon."
        },
        {
          "s": "cygne",
          "t": "Je suis votre ami. Un ami exigeant. Je condamne, et en même temps j'appelle à la retenue. On peut tenir les deux : la fermeté et l'humanité."
        },
        {
          "s": "faucon",
          "t": "« En même temps. » Ton poison préféré. Sur ce terrain, tu choisis, ou le ballon enflammé choisit pour toi. Il n'y a pas de troisième rive."
        },
        {
          "s": "cygne",
          "t": "Il y a toujours une troisième rive. C'est même ma spécialité. Renvoyez le ballon enflammé, Faucon, et discutons comme des adultes."
        },
        {
          "s": "faucon",
          "t": "Les adultes ne discutent pas avec une brûlure allumée. Ils frappent. Sers, et prie pour que ton « en même temps » n'explose pas dans tes mains."
        }
      ],
      "win": [
        {
          "s": "cygne",
          "t": "Vous voyez ? On peut être un allié loyal ET une conscience. le ballon enflammé est repartie. Le dialogue, lui, reste sur la table."
        },
        {
          "s": "faucon",
          "t": "Tu as gagné un point, pas un débat. Je reste intransigeant. C'est la seule position qui ne fait pas de morts."
        }
      ],
      "lose": [
        {
          "s": "faucon",
          "t": "Boum. De ton côté. Voilà ce que coûte l'équilibre quand le terrain brûle : une explosion polie."
        },
        {
          "s": "cygne",
          "t": "Défaite. Grave. Je maintiens ma ligne : la fermeté et la nuance. Même sous les décombres, je refuse de choisir un seul bout de la corde."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le petit maréchal et la ligne rouge",
      "sub": "Gallardie–Ryonganie · la mèche et le radar",
      "left": "cygne",
      "right": "bebe",
      "terrain": 3,
      "mode": "bomb",
      "ai": 3,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé. Gradins de granit, arc abstrait, un radar militaire qui s'allume et s'éteint. Le ballon-bombe grésille déjà."
        },
        {
          "s": "bebe",
          "t": "Regarde mon radar clignoter, Cygne ! Le plus grand radar ! J'ai des bombes plus grosses que ton obélisque, et elles saluent au défilé !"
        },
        {
          "s": "cygne",
          "t": "Je vous propose la porte de sortie diplomatique. La main tendue, et en même temps, une ligne rouge très ferme. Ne franchissez pas la ligne."
        },
        {
          "s": "bebe",
          "t": "Une ligne rouge ! Ha ! Chez moi, les lignes rouges, on marche dessus au pas cadencé ! Un-deux, un-deux, boum !"
        },
        {
          "s": "cygne",
          "t": "L'isolement vous étouffe, Maréchal. Renvoyez la bombe, asseyons-nous, parlons. Je peux être votre interlocuteur. Le seul, peut-être."
        },
        {
          "s": "bebe",
          "t": "Parler ? Je préfère parader ! Éteins le radar si tu peux, technocrate. Sinon, il te verra exploser en direct."
        }
      ],
      "win": [
        {
          "s": "cygne",
          "t": "Vous voyez : la fermeté paie mieux que la parade. Ma porte reste ouverte. En même temps, ma ligne rouge reste tracée."
        },
        {
          "s": "bebe",
          "t": "Rejouons ! REJOUONS ! Mon radar exige une revanche ! Ce n'est pas une défaite, c'est un défilé interrompu !"
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "bebe",
          "t": "BOUM ! Le plus beau boum du défilé ! Mon radar l'a vu venir ! Salut, Cygne en miettes !"
        },
        {
          "s": "cygne",
          "t": "Une escalade regrettable. Je maintiens le canal de discussion. On ne referme jamais tout à fait une porte. Même soufflée par une bombe."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le poumon du monde",
      "sub": "Gallardie–Tropicalia · la querelle de la forêt",
      "left": "cygne",
      "right": "capitaine",
      "terrain": 7,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Grande Forêt. Canopée dorée, court en terre rouge, un ara qui crie dans la fumée. La forêt brûle à l'horizon. Le ballon est une bombe, et le Capitaine a l'aura rouge des grands soirs."
        },
        {
          "s": "capitaine",
          "t": "Alors, le donneur de leçons parisien vient m'expliquer MA forêt ? Elle est chez moi, Cygne. Je fais ce que je veux avec MON jardin."
        },
        {
          "s": "cygne",
          "t": "Cette forêt n'est pas qu'un jardin, Capitaine. C'est le poumon du monde. Notre maison brûle, et vous regardez ailleurs. Je ne peux pas l'accepter."
        },
        {
          "s": "capitaine",
          "t": "« Notre maison » ! Toujours le pluriel des riches ! Tu veux internationaliser ma jungle pour mieux la coloniser en costume. J'ai vu ton jeu."
        },
        {
          "s": "cygne",
          "t": "Je vous propose des fonds, des partenariats, une transition. La fermeté écologique, et en même temps la main tendue. Éteignez les feux, pas le dialogue."
        },
        {
          "s": "capitaine",
          "t": "Garde ton argent et tes leçons, l'énarque ! Je vais déforester ton camp au sol, tronc par tronc, et renvoyer ta bombe dans ta belle capitale à pigeons !"
        },
        {
          "s": "narrator",
          "t": "Le Capitaine se dope. L'ara s'envole. La Déforestation gronde. Renvoyez la bombe — ou la forêt vous ensevelit."
        }
      ],
      "win": [
        {
          "s": "cygne",
          "t": "Voilà. On peut aimer un peuple et condamner ses feux. En même temps ferme sur l'écologie, en même temps ouvert au partenariat. La forêt vous remercie."
        },
        {
          "s": "capitaine",
          "t": "Tsss. Tu gagnes un match, pas ma forêt. Reviens quand tu voudras, l'oiseau : mes troncs t'attendent, et mon ara aussi."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "capitaine",
          "t": "BOUM ! En pleine capitale ! Retourne compter tes pigeons, technocrate ! La forêt est à MOI, et elle vient de te le rappeler à l'explosif !"
        },
        {
          "s": "cygne",
          "t": "Une défaite qui ne change rien à ma ligne. Je continuerai à défendre le poumon du monde. Même seul. Même en miettes. En même temps déterminé, en même temps inflexible."
        }
      ]
    },
    {
      "act": 3,
      "title": "L'hiver au Palais Gallard",
      "sub": "Gallardie–Bourassie · la finale, chez le Cygne",
      "left": "cygne",
      "right": "volkoi",
      "terrain": 2,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Finale. Palais Gallard. Colonnes néoclassiques, obélisque abstrait, cygne doré sur azur. Les pigeons ont fui : ils sentent l'hiver arriver. La bombe est là, et le Tsar rougeoie."
        },
        {
          "s": "volkoi",
          "t": "Me voilà chez toi, Cygne. Sous ton beau palais de premier de la classe. J'ai apporté mon hiver. Il travaille toujours pour moi."
        },
        {
          "s": "cygne",
          "t": "J'ai passé des heures au téléphone avec vous, Tsar. Des heures. La main tendue, et en même temps la fermeté. On peut encore parler."
        },
        {
          "s": "volkoi",
          "t": "Parler. Tu adores parler. Pendant que tu parles, je gèle ton camp, tronçon par tronçon. Le dialogue, c'est du dégel. Et il n'y aura pas de dégel."
        },
        {
          "s": "cygne",
          "t": "Vous ne me gèlerez pas. Mon Passage en Force est imparable : quand je frappe, vous ne pouvez pas smasher. Ma balle passe. Ma ligne tient. Toujours."
        },
        {
          "s": "volkoi",
          "t": "Imparable ? Tout craque, à la longue, sous le gel. Même les cygnes. Surtout les cygnes. Ils ont le cou si fin."
        },
        {
          "s": "narrator",
          "t": "Le Tsar se dope. L'hiver tombe sur le Palais Gallard. La mèche crépite. Passe en force, Cygne — ou l'hiver gagne le Sommet."
        }
      ],
      "win": [
        {
          "s": "cygne",
          "t": "Sur mon terrain, sous mon emblème, l'hiver n'a pas passé. Fermeté ET dialogue, en même temps, jusqu'au bout. Voilà la Gallardie. Voilà le Sommet remporté."
        },
        {
          "s": "volkoi",
          "t": "Un revers. Temporaire. L'hiver est patient, et j'ai de la patience pour deux siècles. On se reverra sur la glace, oiseau."
        },
        {
          "s": "narrator",
          "t": "Le Cygne lève les bras. Les pigeons reviennent se poser sur l'obélisque. Le cygne doré, enfin, semble briller. Jeux du Sommet : Le Cygne triomphe. En même temps. Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "volkoi",
          "t": "Boum. Sous ton propre palais. Ton emblème a gelé les ailes ouvertes. Ton « en même temps » a fini en glaçon. Comme prévu."
        },
        {
          "s": "cygne",
          "t": "L'hiver a gagné une bataille, pas la partie. Je me relève. Je retends la main, et je retends la corde. Premier de la classe, on ne le reste qu'en recommençant."
        }
      ]
    }
  ],
  "bebe": [
    {
      "act": 1,
      "title": "Le grand frère en double",
      "sub": "Ryonganie–Panguo · binôme sous tutelle",
      "left": "bebe",
      "right": "timonier",
      "ally": "volkoi",
      "right2": "dorf",
      "terrain": 4,
      "mode": "2v2",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé. Le Maréchal a exigé un 2v2 : il veut le Tsar comme partenaire contre le Timonier et le Baron."
        },
        {
          "s": "bebe",
          "t": "Grand frère ! Tu digues avec MOI ! Mon radar couvre tout le terrain ! Les deux camps !"
        },
        {
          "s": "volkoi",
          "t": "Je suis ton partenaire, pas ton fan. Digue quand je te le dis. Silence ensuite."
        },
        {
          "s": "timonier",
          "t": "Deux enfants turbulents contre l'harmonie et… le bruit doré. Tempo."
        },
        {
          "s": "dorf",
          "t": "Je suis le bruit doré, oui. Et le meilleur partenaire de panda du monde."
        },
        {
          "s": "narrator",
          "t": "Double sous tutelle : l'alliance tient — ou le radar explose."
        }
      ],
      "win": [
        {
          "s": "bebe",
          "t": "BINÔME GLORIEUX ! Le Maréchal et le Tsar ! Gravez-nous en GRANIT DOUBLE !"
        },
        {
          "s": "volkoi",
          "t": "Correct, petit. Une fois. N'en fais pas une parade de douze mille pas."
        },
        {
          "s": "timonier",
          "t": "Un revers. L'harmonie corrige aussi les doubles."
        },
        {
          "s": "dorf",
          "t": "Mon partenaire a trop médité. Moi j'étais parfait."
        }
      ],
      "lose": [
        {
          "s": "timonier",
          "t": "Le tempo à quatre a tranché. Rentrez défiler moins fort."
        },
        {
          "s": "dorf",
          "t": "ON A GAGNÉ LE 2v2 ! Le plus beau !"
        },
        {
          "s": "bebe",
          "t": "CE N'EST PAS UNE DÉFAITE DE PARTENAIRES ! C'est un entraînement !"
        },
        {
          "s": "volkoi",
          "t": "Gamin… la prochaine fois, tu digues vraiment. L'alliance, ça se mérite."
        }
      ]
    },
    {
      "act": 1,
      "title": "Les camarades du froid",
      "sub": "Ryonganie–Bourassie · échange de bons procédés",
      "left": "bebe",
      "right": "volkoi",
      "terrain": 3,
      "mode": "volley",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé. Le radar tourne, les bannières unies claquent. Deux amateurs de très longues parades se serrent la main au filet."
        },
        {
          "s": "volkoi",
          "t": "Beau béton. Froid, gris, sans fioritures. J'aime ton goût, petit Maréchal."
        },
        {
          "s": "bebe",
          "t": "Tsar ! J'ai des fusées toutes neuves. Tu m'envoies du carburant, je t'envoie des obus, et on ne dit rien à personne, hein ?"
        },
        {
          "s": "volkoi",
          "t": "Je ne dis jamais rien. C'est même ma spécialité. Ton radar est allumé ? On n'est jamais trop prudent."
        },
        {
          "s": "bebe",
          "t": "Toujours allumé ! Chez moi, personne ne saute par-dessus le filet. Batterie AA. Souveraineté."
        },
        {
          "s": "volkoi",
          "t": "L'hiver et la flak. Nous parlons la même langue. Servons, camarade, avant que le monde nous surveille."
        }
      ],
      "win": [
        {
          "s": "bebe",
          "t": "Battu le Tsar ! Le plus jeune Maréchal humilie le plus vieux glaçon. Quelle journée !"
        },
        {
          "s": "volkoi",
          "t": "Savoure. Entre camarades, une défaite se rembourse en carburant. Tu me dois un plein."
        }
      ],
      "lose": [
        {
          "s": "volkoi",
          "t": "Le sang-froid bat l'enthousiasme. Range tes cuivres, petit. Et rallume ton radar."
        },
        {
          "s": "bebe",
          "t": "Tu as gagné parce qu'on est amis !Tu as de la chance."
        }
      ]
    },
    {
      "act": 1,
      "title": "Cher ennemi bien-aimé",
      "sub": "Ryonganie–Doria · les lettres magnifiques",
      "left": "bebe",
      "right": "dorf",
      "terrain": 3,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Sommet historique sur l'Esplanade. Deux hommes qui se sont menacés d'anéantissement se sourient devant les caméras. Personne ne comprend rien. C'est parfait."
        },
        {
          "s": "dorf",
          "t": "On s'est écrit des lettres. Les plus belles lettres. On est tombés amoureux, tout le monde le dit. Enfin, moi je le dis."
        },
        {
          "s": "bebe",
          "t": "Cher Baron ! Ta lettre était magnifique. La mienne était plus magnifique. J'ai le plus gros bouton, tu te souviens ?"
        },
        {
          "s": "dorf",
          "t": "Le plus gros bouton c'est le mien, et il marche. Mais on est potes. Un match entre potes qui pourraient finir le monde."
        },
        {
          "s": "bebe",
          "t": "Chez moi, on ne saute pas le filet, sinon flak. Mais pour toi, mon ami, je laisse le radar tourner tout doucement."
        },
        {
          "s": "dorf",
          "t": "Adorable. Vraiment. Sers, gamin, et souris à la caméra : ce sommet va faire un audimat historique."
        }
      ],
      "win": [
        {
          "s": "bebe",
          "t": "J'ai battu mon meilleur ennemi ! Écris-moi une lettre de félicitations. Une belle. Très belle."
        },
        {
          "s": "dorf",
          "t": "Match truqué, mais quel show ! On remet ça au prochain sommet, mon petit Maréchal terrible."
        }
      ],
      "lose": [
        {
          "s": "dorf",
          "t": "Gagné ! Le plus beau sommet de l'histoire ! Les gens pleuraient, il paraît. Moi aussi presque."
        },
        {
          "s": "bebe",
          "t": "Tu gagnes le match, pas mon cœur. Enfin si, un peu mon cœur. Mais je garde mes fusées, hein."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le sage et le pétard",
      "sub": "Ryonganie–Bharatie · le calme contre le vacarme",
      "left": "bebe",
      "right": "gourou",
      "terrain": 6,
      "mode": "flame",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Stade Ashram. Une vache traverse tranquillement le court. Le Maréchal la regarde comme s'il envisageait un défilé militaire de bétail. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "gourou",
          "t": "Namasté, jeune Maréchal. Tu cries beaucoup. Le vacarme est souvent le déguisement de la peur."
        },
        {
          "s": "bebe",
          "t": "Je n'ai peur de rien ! J'ai des fusées, un radar, et le plus gros bouton. Toi tu as… une vache."
        },
        {
          "s": "gourou",
          "t": "J'ai un milliard de spectateurs et une respiration lente. Tu vas te fatiguer avant moi, petit tonnerre."
        },
        {
          "s": "bebe",
          "t": "Me fatiguer ? Je suis né sur un arc-en-ciel ! Mais bon… tu médites, tu ne me menaces pas, alors on joue gentiment."
        },
        {
          "s": "gourou",
          "t": "Gentiment. Et chaque fois que tu voudras sauter chez moi pour smasher, je serai déjà là, assis, à t'attendre."
        }
      ],
      "win": [
        {
          "s": "bebe",
          "t": "Battu le sage ! Le tonnerre est plus fort que le silence. Notez-le en lettres d'or."
        },
        {
          "s": "gourou",
          "t": "Tu gagnes le point, pas la paix intérieure. Reviens quand le bruit t'aura lassé."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "gourou",
          "t": "Vois-tu ? L'endurance a raison de la poudre. Respire, jeune homme. Ça t'évitera des explosions."
        },
        {
          "s": "bebe",
          "t": "Ta vache m'a déconcentré ! Je réclame une revanche sans bétail sur le terrain !"
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Deux hommes forts, un seul filet",
      "sub": "Ryonganie–Bosforie · concours de fanfaronnade",
      "left": "bebe",
      "right": "sultan",
      "terrain": 5,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Pont des Deux Mondes. Un tapis vole au-dessus du détroit. Deux hommes habitués à ce qu'on les acclame se toisent, chacun persuadé d'être le plus grand. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "sultan",
          "t": "Je contrôle un détroit entre deux continents, jeune homme. Toi, tu contrôles une dalle de béton et une fanfare."
        },
        {
          "s": "bebe",
          "t": "Une dalle de béton avec des FUSÉES dessus ! Et le plus jeune Maréchal du monde au milieu. Respect, l'ancien."
        },
        {
          "s": "sultan",
          "t": "L'ancien te défonce au smash. Mais j'aime ta souveraineté têtue. Nous détestons les mêmes donneurs de leçons."
        },
        {
          "s": "bebe",
          "t": "Ça oui ! L'Ouest et ses procédures ! Chez moi c'est simple : on ne saute pas le filet, ou c'est la flak."
        },
        {
          "s": "sultan",
          "t": "Chez moi, la terre tremble quand je le décide. Voyons lequel de nos deux orgueils sert le mieux."
        }
      ],
      "win": [
        {
          "s": "bebe",
          "t": "Le plus jeune bat le plus grandiloquent ! Ton détroit peut trembler, mon radar tourne encore."
        },
        {
          "s": "sultan",
          "t": "Un point pour la jeunesse insolente. Mais l'orgueil, petit, ça se cultive toute une vie. Reviens."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "sultan",
          "t": "Le séisme a parlé. Tu fanfaronnes bien, mais moi je fais trembler pour de vrai."
        },
        {
          "s": "bebe",
          "t": "Un tapis volant contre moi, c'est de la triche ! Je veux un terrain sans magie et avec plus de béton !"
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le capitaine et le caporal",
      "sub": "Ryonganie–Tropicalia · deux grandes gueules en treillis",
      "left": "bebe",
      "right": "capitaine",
      "terrain": 7,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Grande Forêt. Un ara hurle dans la canopée. Deux amateurs d'uniforme et de gros mots se retrouvent sur la terre rouge."
        },
        {
          "s": "capitaine",
          "t": "Alors comme ça t'es le plus jeune Maréchal ? Moi j'étais capitaine. Un vrai. Avec de la boue aux bottes."
        },
        {
          "s": "bebe",
          "t": "De la boue ? J'ai du GRANIT ! Des gradins entiers en granit ! Et une Batterie AA qui interdit à ta jungle de sauter chez moi."
        },
        {
          "s": "capitaine",
          "t": "Ta batterie, je la brûle et je plante un parking dessus. Moi je déboise, tu vois ? C'est mon smash à moi."
        },
        {
          "s": "bebe",
          "t": "Déboiser, détruire… on est faits pour s'entendre, caporal ! Mais je reste le plus jeune, et le plus jeune sert en premier."
        },
        {
          "s": "capitaine",
          "t": "Sers, bébé Maréchal. Et gare à l'ara : lui non plus il respecte pas ton espace aérien."
        }
      ],
      "win": [
        {
          "s": "bebe",
          "t": "Battu le capitaine dans sa propre jungle ! Le béton est plus fort que la boue. Toujours."
        },
        {
          "s": "capitaine",
          "t": "Pas mal, le morveux. T'as du coffre. Reviens quand j'aurai fini de couper les arbres du court."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "capitaine",
          "t": "Le vieux capitaine t'a appris le respect. Retourne jouer avec tes fanfares, petit."
        },
        {
          "s": "bebe",
          "t": "C'est la faute de l'ara ! Il a survolé mon camp ! Ma Batterie AA aurait dû l'abattre !"
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 3,
      "title": "Frères pyromanes",
      "sub": "Ryonganie–Ramenie · à qui la plus grosse mèche",
      "left": "bebe",
      "right": "safran",
      "terrain": 9,
      "mode": "bomb",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses. Sous les arcades turquoise, deux parias sanctionnés se font l'accolade… puis se rappellent que la balle est une bombe."
        },
        {
          "s": "safran",
          "t": "Salutations, jeune Maréchal. On nous sanctionne tous les deux, on s'échange des plans de fusées. On est presque famille."
        },
        {
          "s": "bebe",
          "t": "Presque ! Mais entre nous : c'est MOI qui ai la plus grosse mèche. Et le plus gros bouton. Ne l'oublie jamais, Safran."
        },
        {
          "s": "safran",
          "t": "Mesurons, alors. En silence, avec le sourire. Un paria se reconnaît à sa patience, pas à ses cris."
        },
        {
          "s": "bebe",
          "t": "La patience ! Vous êtes tous obsédés par la patience. Moi je préfère le grand boum tout de suite."
        },
        {
          "s": "narrator",
          "t": "La bombe passe d'un camp à l'autre. Entre alliés, une compétition amicale peut vite devenir un cratère."
        }
      ],
      "win": [
        {
          "s": "bebe",
          "t": "Ha ! J'ai la plus grosse mèche, c'est prouvé ! Envoie-moi tes prochains plans, petit frère jaloux."
        },
        {
          "s": "safran",
          "t": "Bien joué. Nous restons amis — les parias n'ont pas les moyens des rancunes. Mais je note ta suffisance."
        }
      ],
      "lose": [
        {
          "s": "safran",
          "t": "Le voile d'or ralentit même les plus pressés. La patience gagne, jeune tonnerre. Chaque fois."
        },
        {
          "s": "bebe",
          "t": "Sabotage ! Tu as ralenti ma bombe avec ton voile ! Ce n'est pas une victoire, c'est de la sorcellerie !"
        }
      ]
    },
    {
      "act": 3,
      "title": "Le donneur de leçons",
      "sub": "Ryonganie–Gallardie · l'Ouest contre la souveraineté",
      "left": "bebe",
      "right": "cygne",
      "terrain": 3,
      "mode": "bomb",
      "ai": 3,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé. Le radar s'allume, s'éteint, se rallume. La balle est une bombe. Le premier des donneurs de leçons vient sermonner le Maréchal chez lui."
        },
        {
          "s": "cygne",
          "t": "Vos essais, vos provocations, vos parades… En même temps, il faut dialoguer. Je viens dialoguer. Fermement."
        },
        {
          "s": "bebe",
          "t": "Dialoguer ! L'Ouest ne dialogue que pour gagner du temps. Ici c'est chez moi : personne ne saute mon filet. Batterie AA !"
        },
        {
          "s": "cygne",
          "t": "Vos frappes ne peuvent pas être smashées, dites-vous ? Les miennes non plus. Passage en force. On est bien avancés."
        },
        {
          "s": "bebe",
          "t": "Tes belles phrases contre ma bombe à mèche. Vas-y, fais-moi la morale pendant que la mèche brûle."
        },
        {
          "s": "cygne",
          "t": "Je ne cède pas au chantage. En même temps… je n'aime pas trop où est posée cette bombe. Renvoyez-la."
        }
      ],
      "win": [
        {
          "s": "bebe",
          "t": "Boum ! Chez le donneur de leçons ! La souveraineté a parlé, et elle parle fort. Rentre écrire un communiqué."
        },
        {
          "s": "cygne",
          "t": "Ce n'est qu'un match. La communauté internationale, elle, ne renvoie jamais la bombe. Rendez-vous au conseil."
        }
      ],
      "lose": [
        {
          "s": "cygne",
          "t": "En même temps, voyez-vous, le droit international finit toujours par gagner le point. Fermement."
        },
        {
          "s": "bebe",
          "t": "Complot ! Vous étiez tous ligués ! Mon radar était éteint une seconde et vous en avez profité, tricheurs !"
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le duel des faucons",
      "sub": "Ryonganie–Levantie · la finale nucléaire",
      "left": "bebe",
      "right": "faucon",
      "terrain": 3,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Finale. Esplanade du Défilé, radar au maximum, bannières unies tendues à craquer. Deux doctrines qui ne reculent jamais, une bombe entre elles. Une aura rouge enveloppe le Faucon."
        },
        {
          "s": "faucon",
          "t": "Tu brandis tes fusées comme des jouets, Maréchal. Moi, je frappe le premier et je ne préviens jamais. Raid Éclair."
        },
        {
          "s": "bebe",
          "t": "Le premier ? Chez moi, tu ne sauteras même pas ! Batterie AA ! Personne ne survole l'Esplanade, personne !"
        },
        {
          "s": "faucon",
          "t": "Ta zone d'exclusion contre mon raid. Deux hommes qui interdisent le ciel à l'autre. C'est presque poétique. Presque."
        },
        {
          "s": "bebe",
          "t": "Poétique ? C'est la finale du monde ! J'ai le plus gros bouton, la plus grosse mèche et le radar le plus grand !"
        },
        {
          "s": "faucon",
          "t": "Le radar ne t'a jamais montré ce qui compte : je n'ai pas peur de la bombe. Je vis avec depuis toujours. Sers."
        },
        {
          "s": "narrator",
          "t": "Le Faucon est dopé — impitoyable, sans un battement de cil. Ne laisse surtout pas la mèche s'éteindre de ton côté."
        }
      ],
      "win": [
        {
          "s": "bebe",
          "t": "J'AI GAGNÉ LA FINALE ! Le plus jeune Maréchal du monde, invaincu, éternel ! Qu'on lance mille feux d'artifice !"
        },
        {
          "s": "faucon",
          "t": "Un point. Rien de plus. Nous rejouerons cette partie toute notre vie, toi et moi. Elle ne finit jamais."
        },
        {
          "s": "narrator",
          "t": "Sur les gradins de granit, la foule applaudit sur commande. Sous l'arc abstrait, le radar tourne encore, victorieux et paranoïaque. Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "faucon",
          "t": "Le raid a été plus rapide que ta batterie. Tes fusées faisaient du bruit ; les miennes, du silence."
        },
        {
          "s": "bebe",
          "t": "Impossible ! On m'a trafiqué la bombe ! Je suis né sur un arc-en-ciel, moi, je ne PERDS pas la finale !"
        }
      ]
    }
  ],
  "timonier": [
    {
      "act": 1,
      "title": "Le petit frère en face",
      "sub": "Panguo–Ryonganie · double de l'harmonie",
      "left": "timonier",
      "right": "bebe",
      "ally": "safran",
      "right2": "dorf",
      "terrain": 3,
      "mode": "2v2",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Cité du Matin. Le Timonier choisit Safran comme partenaire. En face : le Maréchal et le Baron. Un 2v2 pour enseigner le tempo."
        },
        {
          "s": "timonier",
          "t": "Toi, rose, tu joues avec moi. Peu de mots. Beaucoup de digues. L'harmonie en double."
        },
        {
          "s": "safran",
          "t": "Partenariat élégant. Je ralentis leur camp ; tu imposes le tempo. Marché conclu."
        },
        {
          "s": "bebe",
          "t": "Le Maréchal a le Baron comme partenaire ! On va gagner EN DÉFILANT !"
        },
        {
          "s": "dorf",
          "t": "Je défile pas. Je gagne. Digue, petit, et regarde le maître."
        },
        {
          "s": "narrator",
          "t": "Quatre sur le terrain. L'harmonie n'aime pas le bruit — elle va le corriger."
        }
      ],
      "win": [
        {
          "s": "timonier",
          "t": "Tempo tenu. Partenaire fiable. Le siècle continue."
        },
        {
          "s": "safran",
          "t": "Beau double. La lenteur a usé la parade."
        },
        {
          "s": "bebe",
          "t": "REVANCHE ! Mon partenaire a trop parlé !"
        },
        {
          "s": "dorf",
          "t": "Truqué. Évidemment. Mais magnifique quand même."
        }
      ],
      "lose": [
        {
          "s": "bebe",
          "t": "VICTOIRE DU BINÔME ! Radar + or = imbattable !"
        },
        {
          "s": "dorf",
          "t": "Le plus grand 2v2 ! Dis-le, panda !"
        },
        {
          "s": "timonier",
          "t": "Un set perdu. L'harmonie digère. On reprend."
        },
        {
          "s": "safran",
          "t": "Mesure pour la revanche. Les partenaires, ça se recalibre."
        }
      ]
    },
    {
      "act": 1,
      "title": "L'amitié sans limites",
      "sub": "Panguo–Bourassie · axe de revers",
      "left": "timonier",
      "right": "volkoi",
      "terrain": 0,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Place Écarlate, sous la neige. Deux géants signent une amitié « sans limites »… en relisant deux fois les petites lignes."
        },
        {
          "s": "volkoi",
          "t": "L'hiver travaille pour moi, Timonier. Je gèle ton camp, et tu grelottes comme les autres."
        },
        {
          "s": "timonier",
          "t": "Gèle ce que tu veux. C'est encore moi qui t'achète ton pétrole, à mon prix, dans ma monnaie."
        },
        {
          "s": "volkoi",
          "t": "« Sans limites », avions-nous dit. J'aime ce mot. Il n'engage à rien de précis."
        },
        {
          "s": "timonier",
          "t": "« Sans limites » veut dire : ma limite à moi. Tu me vends ton gaz au rabais, je te vends ma patience. Sers."
        },
        {
          "s": "volkoi",
          "t": "Un partenaire junior qui se croit senior. Amusant. Balle au centre, camarade."
        }
      ],
      "win": [
        {
          "s": "timonier",
          "t": "Une amitié équilibrée : tu offres le froid, j'offre le marché. Devine qui tient le portefeuille."
        },
        {
          "s": "volkoi",
          "t": "Tu gagnes le set. Moi je garde l'hiver. On se comprend. C'est déjà rare."
        }
      ],
      "lose": [
        {
          "s": "volkoi",
          "t": "Le gel a eu raison de ton rempart. Même les empires patients grelottent, parfois."
        },
        {
          "s": "timonier",
          "t": "Un revers. Temporaire. Tu as l'hiver ; moi j'ai le siècle. Je patiente."
        }
      ]
    },
    {
      "act": 1,
      "title": "La grande route",
      "sub": "Panguo–Bosforie · ports, ponts & dettes",
      "left": "timonier",
      "right": "sultan",
      "terrain": 5,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Pont des Deux Mondes. Un tapis volant passe au-dessus du détroit — bientôt il y aura aussi un port, une autoroute, et une facture."
        },
        {
          "s": "sultan",
          "t": "Sur MON détroit, entre deux continents, c'est moi le carrefour du monde ! Je défonce au smash !"
        },
        {
          "s": "timonier",
          "t": "Beau carrefour. Je voudrais y bâtir un port. Et un pont. Et une gare. Je paie tout. Tu signes ici."
        },
        {
          "s": "sultan",
          "t": "Tu déroules ta grande route jusque sous mes dômes ! Grandiose… mais coûteux, non ?"
        },
        {
          "s": "timonier",
          "t": "Coûteux pour toi plus tard. Gratuit pour toi maintenant. C'est la beauté du tapis : on ne voit pas où il mène."
        },
        {
          "s": "sultan",
          "t": "Un néo-sultan et un empereur, à négocier sur un pont. L'Histoire adore ce genre de scène. Servons !"
        }
      ],
      "win": [
        {
          "s": "timonier",
          "t": "Ton port est magnifique. Il m'appartiendra dans quatre-vingt-dix-neuf ans. Merci de l'entretenir d'ici là."
        },
        {
          "s": "sultan",
          "t": "J'ai perdu le match mais gardé ma superbe. Et… j'ai vraiment signé ce contrat de port ?"
        }
      ],
      "lose": [
        {
          "s": "sultan",
          "t": "Le carrefour du monde reste debout ! Ton tapis s'arrête à mon pont, l'empereur !"
        },
        {
          "s": "timonier",
          "t": "Reste debout. Le fil de soie, lui, est déjà passé sous tes fondations. Je ne suis pas pressé."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le dérisquage",
      "sub": "Panguo–Gallardie · « en même temps » stratégique",
      "left": "timonier",
      "right": "cygne",
      "terrain": 2,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Palais Gallard. Un cygne stylisé doré fanfaronne sur sa bannière bleue. En face, un mur cramoisi patiente. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "cygne",
          "t": "Cher Timonier, nous ne nous découplons pas. Nous « dérisquons ». En même temps, nous restons partenaires."
        },
        {
          "s": "timonier",
          "t": "« Dérisquer », « découpler »… jolis verbes. Pendant que tu les conjugues, je livre tes voitures et tes panneaux solaires."
        },
        {
          "s": "cygne",
          "t": "Gallardie cherche son autonomie stratégique. En même temps, elle aime beaucoup ton marché. C'est subtil."
        },
        {
          "s": "timonier",
          "t": "C'est surtout contradictoire. Le discours chante fort et court peu. Moi je marche lentement et j'arrive partout."
        },
        {
          "s": "cygne",
          "t": "En même temps… une verticale, ça réveille. Servons, empereur. On verra qui tient la distance."
        }
      ],
      "win": [
        {
          "s": "timonier",
          "t": "Autonomie stratégique : le rêve de dépendre un peu moins de moi, tout en achetant un peu plus. Charmant."
        },
        {
          "s": "cygne",
          "t": "Match perdu, position nuancée. En même temps, la nuance est une victoire en soi. Non ?"
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "cygne",
          "t": "La nuance a chanté juste ! Partenaires, rivaux, systémiques — tout à la fois. C'est ça, la Gallardie."
        },
        {
          "s": "timonier",
          "t": "Chante donc. Tes usines commandent mes batteries en coulisse. L'harmonie se moque des slogans."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le grenier du monde",
      "sub": "Panguo–Tropicalia · soja, minerais & BRICS",
      "left": "timonier",
      "right": "capitaine",
      "terrain": 7,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Grande Forêt. Un ara traverse la canopée dorée. En bas, l'empereur commande — poliment — la moitié de la récolte. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "capitaine",
          "t": "Ma tronçonneuse rugit, l'empereur ! J'abats, je plante du soja, je te le vends. Pas de chichi entre nous."
        },
        {
          "s": "timonier",
          "t": "Ton soja, ton minerai de fer, ton bœuf : j'achète tout. Coupe autant d'arbres qu'il faut. Je regarde ailleurs."
        },
        {
          "s": "capitaine",
          "t": "Un client qui ne fait jamais la morale sur ma forêt ! Toi au moins tu comprends le business."
        },
        {
          "s": "timonier",
          "t": "La morale, je la laisse au Cygne. Moi je passe commande. Un partenaire, ça ne fait pas la leçon. Ça signe."
        },
        {
          "s": "capitaine",
          "t": "Deux fauves d'accord sur le fric ! Servons avant que l'écolo ne débarque avec ses pancartes."
        }
      ],
      "win": [
        {
          "s": "timonier",
          "t": "Tu abats, je stocke. Ta forêt nourrit mes ports. Un partenariat sans questions gênantes."
        },
        {
          "s": "capitaine",
          "t": "Battu par l'empereur ! Bah, tant qu'il achète mon soja, je peux perdre au volley, moi."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "capitaine",
          "t": "Gagné contre le Timonier ! La tronçonneuse a smashé le rempart ! Grande soirée, patron !"
        },
        {
          "s": "timonier",
          "t": "Gagne le match. Je garde le carnet de commandes. C'est moi qui écris la fin de l'histoire."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le pétrole sous embargo",
      "sub": "Panguo–Ramenie · brut à prix d'ami",
      "left": "timonier",
      "right": "safran",
      "terrain": 9,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses. Un paon déploie sa roue sous les arcades turquoise. En face, un empereur qui n'admire jamais rien trop longtemps. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "safran",
          "t": "L'Occident m'étrangle de sanctions, empereur. Mais toi… toi tu achètes mon brut. Discrètement. Sagement."
        },
        {
          "s": "timonier",
          "t": "Sanctionné, tu vends moins cher. Moins cher, j'achète plus. Ta colère contre l'Ouest fait mes marges."
        },
        {
          "s": "safran",
          "t": "Le paon fait la roue, mais c'est toi qui comptes les plumes. Mesuré. Presque cruel."
        },
        {
          "s": "timonier",
          "t": "Pas cruel. Patient. Ton pétrole, ma monnaie, mon rythme. Un axe où j'écris le tempo. Sers."
        },
        {
          "s": "safran",
          "t": "Un partenariat de survie contre un partenariat de conquête. Faisons semblant que c'est le même. Balle au filet."
        }
      ],
      "win": [
        {
          "s": "timonier",
          "t": "Un client fidèle vaut mieux qu'un allié bruyant. Ton isolement, vois-tu, est ma meilleure remise."
        },
        {
          "s": "safran",
          "t": "Tu gagnes, et tu gagnes encore sur mon dos. Le Safran retient. Le paon aussi a de la mémoire."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "safran",
          "t": "Le voile d'or a ralenti ton rempart, empereur. Même les patients trébuchent sur une roseraie."
        },
        {
          "s": "timonier",
          "t": "Un set perdu dans un jardin. Le baril, lui, coule toujours vers mes ports. Je patiente."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 3,
      "title": "La puce et l'aigle",
      "sub": "Panguo–Levantie · silicium, espions & drones",
      "left": "timonier",
      "right": "faucon",
      "terrain": 8,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Citadelle du Levant. Sur les remparts de grès, un faucon guette. Le ballon est une bombe : ce soir, on ne parle plus commerce, mais secrets."
        },
        {
          "s": "faucon",
          "t": "Tes puces sont partout dans mes systèmes, empereur. Et tes ingénieurs copient les miens. Ça s'appelle un vol."
        },
        {
          "s": "timonier",
          "t": "« Vol », « copie »… Je préfère « transfert de technologie ». Tout ce qui traverse mon rempart devient mien. C'est la géographie."
        },
        {
          "s": "faucon",
          "t": "Je frappe vite et sans prévenir. Mon Raid Éclair t'interdit de sauter. Reste au sol, pendant que je vole tes brevets en retour."
        },
        {
          "s": "narrator",
          "t": "Le regard du Faucon vire au rouge. L'espionnage rend nerveux — et le carburant militaire, plus vif encore."
        },
        {
          "s": "timonier",
          "t": "Frappe vite. Moi je bâtis lent. Mon rempart coupe ton camp en deux avant que ton aigle n'ait battu de l'aile. Sers."
        }
      ],
      "win": [
        {
          "s": "timonier",
          "t": "Tu voles mes puces ; je bâtis les tiennes. Devine qui, dans dix ans, tient encore l'usine."
        },
        {
          "s": "faucon",
          "t": "Une manche perdue. Mes drones connaissent le chemin de ta Cité, maintenant. On se reverra."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "faucon",
          "t": "Raid réussi, rempart percé. La vitesse mange la patience quand la patience s'endort."
        },
        {
          "s": "timonier",
          "t": "Tu perces un mur. J'en bâtis mille. Frappe l'éclair ; moi je grave le silicium. Le siècle nous départagera."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    },
    {
      "act": 3,
      "title": "La guerre froide des tarifs",
      "sub": "Panguo–Doria · rempart d'or contre rempart rouge",
      "left": "timonier",
      "right": "dorf",
      "terrain": 4,
      "mode": "bomb",
      "ai": 3,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Cité du Matin. Les lanternes rouges se balancent. Face à l'empereur, le Baron dresse un mur d'or contre un mur cramoisi. La bombe compte les points."
        },
        {
          "s": "dorf",
          "t": "Des tarifs ! Des tarifs colossaux ! Cent pour cent sur tes ballons, deux cents sur ton filet, mille pour cent sur ton rempart !"
        },
        {
          "s": "timonier",
          "t": "Taxe tout. Tes usines, tes jouets, tes drapeaux « fabriqués chez toi »… c'est encore ma Cité qui les assemble."
        },
        {
          "s": "dorf",
          "t": "Je bâtis LE plus beau mur du monde, un mur d'or, et je te ferme mon marché ! On se découple, empereur !"
        },
        {
          "s": "timonier",
          "t": "Tu bâtis un mur devant toi ; moi j'en bâtis un au milieu de ton camp. Le tien te protège. Le mien t'enferme."
        },
        {
          "s": "dorf",
          "t": "Guerre commerciale ! La plus grande guerre commerciale de l'histoire ! Et je vais la GAGNER, comme toujours !"
        }
      ],
      "win": [
        {
          "s": "timonier",
          "t": "Deux murs, deux empires. Le tien brille ; le mien dure. Reviens quand tes rayons seront vides."
        },
        {
          "s": "dorf",
          "t": "Truqué ! Subventionné ! Manipulation de monnaie ! … Bon. Combien pour rouvrir tes chaînes, au fait ?"
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "dorf",
          "t": "Boum ! Chez toi ! On gagne la guerre des tarifs ! On gagne tellement que la Cité en pleure !"
        },
        {
          "s": "timonier",
          "t": "Une manche pour l'or. Le temps, lui, joue en rouge. J'attends. J'ai des siècles d'entraînement."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le toit du monde",
      "sub": "Finale · Panguo–Bharatie · la crête et le tempo",
      "left": "timonier",
      "right": "gourou",
      "terrain": 4,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Finale, à la Cité du Matin. Les lanternes rouges brûlent bas, les lions de pierre veillent. Deux milliards d'âmes retiennent leur souffle : c'est la frontière qui se joue."
        },
        {
          "s": "gourou",
          "t": "Namasté, empereur. Mais ce soir j'ai laissé le namasté au vestiaire. Sur la crête, tu as poussé ta ligne trop loin."
        },
        {
          "s": "timonier",
          "t": "La ligne passe où l'harmonie le décide. Et l'harmonie, c'est moi. Ta démographie ne joue pas au volley pour toi."
        },
        {
          "s": "gourou",
          "t": "Non. Mais elle carbure. Regarde mes veines : ce soir je ne médite plus, je brûle. Ton rempart va rencontrer ma colère."
        },
        {
          "s": "narrator",
          "t": "L'œil du Gourou s'injecte de rouge. La patience de l'empire contre la fureur ascétique — et une bombe entre les deux camps."
        },
        {
          "s": "timonier",
          "t": "Brûle donc. Le feu s'épuise ; le rempart reste. Je bâtis un mur au cœur de ton camp et je contrôle le tempo. Sers, voisin."
        }
      ],
      "win": [
        {
          "s": "timonier",
          "t": "Le calme a tenu la crête. Des siècles de patience contre une nuit de carburant : le siècle a choisi le rempart."
        },
        {
          "s": "gourou",
          "t": "J'ai troqué mon souffle contre du feu, et j'ai perdu la ligne. La montagne, elle, se souviendra de tout."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "gourou",
          "t": "Le feu a fendu ton rempart, empereur. Même la patience du panda a un versant qui s'effondre."
        },
        {
          "s": "timonier",
          "t": "Une frontière cède un soir. L'empire compte en dynasties, pas en défaites. Je rentre au palais. Et je patiente."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    }
  ],
  "sultan": [
    {
      "act": 1,
      "title": "Le marché à quatre",
      "sub": "Bosforie–Libertaria · double contre l'or",
      "left": "sultan",
      "right": "dorf",
      "ally": "safran",
      "right2": "cygne",
      "terrain": 1,
      "mode": "2v2",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Pont des Deux Mondes. Le Sultan s'allie à Safran pour un 2v2 contre le Baron et le Cygne — commerce, détroit, et filet."
        },
        {
          "s": "sultan",
          "t": "Toi, Safran, tu es mon partenaire. On vend, on digue, on ouvre les portes — les leurs."
        },
        {
          "s": "safran",
          "t": "Alliance de mesure. Tant que ton marché de missiles ne devient pas mon problème au milieu du set."
        },
        {
          "s": "dorf",
          "t": "J'ai le Cygne en partenaire ! Le plus cher ! Il paie enfin sa part — en points !"
        },
        {
          "s": "cygne",
          "t": "En même temps partenaire, en même temps critique. C'est ça, une alliance exigeante."
        },
        {
          "s": "narrator",
          "t": "Mode double : le détroit se joue à quatre mains."
        }
      ],
      "win": [
        {
          "s": "sultan",
          "t": "Le marché est conclu : notre camp marque. Merci, partenaire."
        },
        {
          "s": "safran",
          "t": "Élégant. Leur or a moins bien digué que notre patience."
        },
        {
          "s": "dorf",
          "t": "Truqué ! Mon partenaire parlait trop !"
        },
        {
          "s": "cygne",
          "t": "Défaite de binôme. On renégocie les critères. En même temps."
        }
      ],
      "lose": [
        {
          "s": "dorf",
          "t": "GAGNÉ ! Meilleure alliance payante du monde !"
        },
        {
          "s": "cygne",
          "t": "Partenariat efficace. Même avec un Baron. Surtout avec un Baron."
        },
        {
          "s": "sultan",
          "t": "La porte a tenu… contre nous. On reviendra plus nombreux — enfin, à deux."
        },
        {
          "s": "safran",
          "t": "Recalons la table. Les doubles, ça se renégocie."
        }
      ]
    },
    {
      "act": 1,
      "title": "Deux fiertés sur l'esplanade",
      "sub": "Bosforie–Ryonganie · deux orgueils de granit",
      "left": "sultan",
      "right": "bebe",
      "terrain": 3,
      "mode": "volley",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé. Le radar tourne, les gradins de granit sont pleins de figurants immobiles. Deux hommes qui adorent qu'on les regarde."
        },
        {
          "s": "bebe",
          "t": "Bienvenue au plus grand défilé de tous les temps ! Chaque pas synchronisé. Chaque cœur battant pour moi. Tu es impressionné, avoue."
        },
        {
          "s": "sultan",
          "t": "Impressionné ? J'ai mille salles dans mon palais, petit maréchal. Tes gradins tiendraient dans mon vestibule."
        },
        {
          "s": "bebe",
          "t": "Ha ! Mais mes gradins ne s'écroulent jamais. Ma Batterie t'interdira de sauter, vieux Sultan."
        },
        {
          "s": "sultan",
          "t": "Sauter ? Je ne saute pas, mon garçon. Je reste. Je frappe le sol. Et c'est TON esplanade qui tremble."
        },
        {
          "s": "bebe",
          "t": "On verra qui tremble le premier. Radar allumé, servons pour le peuple !"
        }
      ],
      "win": [
        {
          "s": "sultan",
          "t": "Deux hommes qui s'interdisent mutuellement de sauter, et c'est le plus lourd qui gagne. L'expérience, gamin."
        },
        {
          "s": "bebe",
          "t": "C'était un match d'entraînement ! Un vrai maréchal ne perd jamais officiellement. On coupera cette séquence."
        }
      ],
      "lose": [
        {
          "s": "bebe",
          "t": "Cloué au sol ! Le grand Sultan cloué comme tout le monde ! On le repassera au ralenti pendant le défilé !"
        },
        {
          "s": "sultan",
          "t": "Une esplanade, ça se traverse. Une porte, ça se défonce. Je reviendrai par le pont, maréchal."
        }
      ]
    },
    {
      "act": 1,
      "title": "Deux voix qui portent",
      "sub": "Bosforie–Tropicalia · populistes de la jungle et du détroit",
      "left": "sultan",
      "right": "capitaine",
      "terrain": 7,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Grande Forêt. Un ara traverse la canopée dorée. Deux tribuns habitués à crier plus fort que la raison se retrouvent sur la terre rouge."
        },
        {
          "s": "capitaine",
          "t": "Alors comme ça t'es le grand chef de l'Orient ? Ici c'est ma clairière, mon micro, ma tronçonneuse. Bienvenue, cousin."
        },
        {
          "s": "sultan",
          "t": "Capitaine, nous nous ressemblons : deux voix que le monde voudrait baisser et qui montent le volume à la place."
        },
        {
          "s": "capitaine",
          "t": "Ha ! Sauf que moi j'abats des arbres, toi t'abats des taux d'intérêt. On est fous tous les deux, mais moi j'assume mieux."
        },
        {
          "s": "sultan",
          "t": "Baisser les taux fait baisser les prix. C'est de la science. MA science. Comme mon talon fait trembler ta terre rouge."
        },
        {
          "s": "capitaine",
          "t": "T'es aussi économiste que je suis forestier. Servons, grand théoricien !"
        }
      ],
      "win": [
        {
          "s": "sultan",
          "t": "Ta forêt a tremblé, ton ara s'est envolé, et toi tu es resté cloué. La gravité impériale, Capitaine."
        },
        {
          "s": "capitaine",
          "t": "Bon, bon. T'as gagné. Mais je te préviens : la prochaine fois j'amène la tronçonneuse au filet."
        }
      ],
      "lose": [
        {
          "s": "capitaine",
          "t": "Déforestation totale ! Mur de troncs, plus de sol pour ton Séisme ! Rentre chez tes dômes, cousin !"
        },
        {
          "s": "sultan",
          "t": "Profite de ta clairière. Le vrai carrefour du monde est chez moi, pas sous tes arbres."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le toit et le tapis",
      "sub": "Bosforie–Bharatie · deux civilisations, une seule scène",
      "left": "sultan",
      "right": "gourou",
      "terrain": 6,
      "mode": "flame",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Stade Ashram. Guirlandes de soucis orange, une vache traverse tranquillement le terrain. Deux hommes qui parlent au nom de civilisations millénaires. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "gourou",
          "t": "Namasté, Sultan. Tu prends parti pour mon rival du nord sur la question de la crête. Le karma note tout, tu sais."
        },
        {
          "s": "sultan",
          "t": "Je prends parti pour l'équilibre, Gourou. Et l'équilibre, ces temps-ci, penche du côté de ceux qui m'achètent des faucons de fer."
        },
        {
          "s": "gourou",
          "t": "Toujours le marchand. Ici on médite avant de frapper. Toi tu factures avant de servir."
        },
        {
          "s": "sultan",
          "t": "Médite tant que tu veux : quand je frappe le sol, même ta vache qui traverse s'arrête de mâcher."
        },
        {
          "s": "gourou",
          "t": "Elle s'arrête par politesse, pas par peur. Servons, et respirons."
        }
      ],
      "win": [
        {
          "s": "sultan",
          "t": "Ton calme est une belle chose, Gourou. Mon Séisme est une chose plus lourde. Nul rancune : namasté à mon tour."
        },
        {
          "s": "gourou",
          "t": "Une secousse passe, la montagne reste. Tu as gagné le point, pas le sommet."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "gourou",
          "t": "La sérénité use le tonnerre. Ton talon a fatigué avant mon souffle, ami du détroit."
        },
        {
          "s": "sultan",
          "t": "Tu médites bien, mais tu ne possèdes pas de pont entre deux mondes. Moi si. On se retrouvera."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Les amis du détroit gelé",
      "sub": "Bosforie–Bourassie · S-400, corridor & manœuvres croisées",
      "left": "sultan",
      "right": "volkoi",
      "terrain": 0,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Place Écarlate sous la neige. Le canon d'apparat tonne au loin. Deux hommes qui se vendent des armes le matin et se marchent dessus l'après-midi. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "volkoi",
          "t": "Sultan. Tu m'achètes mes défenses, puis tu envoies tes faucons de fer contre mes amis. Curieuse amitié."
        },
        {
          "s": "sultan",
          "t": "La meilleure sorte, Tsar : celle où chacun sait exactement combien l'autre lui coûte. Tu gèles le camp, je fais trembler le sol. À forces égales."
        },
        {
          "s": "volkoi",
          "t": "L'hiver travaille pour moi. Ici, ton talon frappe la glace : il glisse. Il ne tremble pas."
        },
        {
          "s": "sultan",
          "t": "La glace se fissure aussi, Tsar. Demande à ton corridor. Je contrôle le détroit par où passe ton blé."
        },
        {
          "s": "volkoi",
          "t": "Le grain, le gaz, les mercenaires… on se doit trop de choses pour se détester. Sers, marchand de ponts."
        }
      ],
      "win": [
        {
          "s": "sultan",
          "t": "Même sur ta glace, la terre m'obéit. Bon partenariat, Tsar : je garde tes défenses, tu gardes ta rancune."
        },
        {
          "s": "volkoi",
          "t": "Un revers sans conséquence. Nous rejouerons. Nous rejouons toujours, toi et moi. C'est notre malédiction."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "volkoi",
          "t": "La glace a eu ton talon. Le froid gagne à la patience, l'agitation perd au bruit."
        },
        {
          "s": "sultan",
          "t": "Une manche pour l'hiver. Mais c'est mon détroit qui décide quand ton blé sort. Souviens-t'en."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "La route commerciale et du silence",
      "sub": "Bosforie–Panguo · peuples cousins, gros contrats",
      "left": "sultan",
      "right": "timonier",
      "terrain": 4,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Cité du Matin. Lanternes rouges, lions de pierre, toits d'or. Deux empereurs se jaugent au-dessus d'un carnet de commandes très épais. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "timonier",
          "t": "Sultan. Tu te dis protecteur des peuples cousins de mes provinces de l'ouest. Puis tu signes mes contrats de la Route. Le tempo te contredit."
        },
        {
          "s": "sultan",
          "t": "Un empire sait quand parler fort et quand compter bas, Timonier. Sur le terrain, au moins, je frappe franc."
        },
        {
          "s": "timonier",
          "t": "Franc et bruyant. Mon Rempart montera au milieu de ton camp. Il n'a pas besoin de trembler pour tenir."
        },
        {
          "s": "sultan",
          "t": "Ma bannière pourpre a régné quand ton rempart n'arrêtait déjà plus rien. Le talon d'abord, le tempo ensuite."
        },
        {
          "s": "timonier",
          "t": "L'orgueil est un bruit. L'harmonie est un silence. Servons, et écoutons lequel dure."
        }
      ],
      "win": [
        {
          "s": "sultan",
          "t": "Ton rempart a tremblé, Timonier. Belle pierre, mauvaises fondations. Le carrefour du monde reste chez moi."
        },
        {
          "s": "timonier",
          "t": "Le tempo se rétablira. Il se rétablit toujours. Va compter tes péages, marchand de ponts."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "timonier",
          "t": "Le rempart contient le tonnerre comme il contient les steppes. Patiemment. Définitivement."
        },
        {
          "s": "sultan",
          "t": "Un rempart finit toujours par avoir deux côtés, Timonier. Je reviendrai par l'autre."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 3,
      "title": "La porte de l'Union",
      "sub": "Bosforie–Gallardie · adhésion, détroit & mer intérieure",
      "left": "sultan",
      "right": "cygne",
      "terrain": 5,
      "mode": "bomb",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Pont des Deux Mondes. La balle est une bombe à mèche. Sous le pont glissent les barques ; au-dessus, le tapis volant traverse le ciel du soir."
        },
        {
          "s": "sultan",
          "t": "Bienvenue chez moi, Cygne. Entre deux continents, sur MON pont. Trente ans que je frappe à votre porte. Ce soir je la défonce au smash."
        },
        {
          "s": "cygne",
          "t": "En même temps, cher Sultan, une porte, ça respecte des critères. On ne défonce pas l'état de droit à coups de talon."
        },
        {
          "s": "sultan",
          "t": "L'état de droit ! Pendant que vous délibérez sur la mer intérieure, moi je fais des forages, des drones, des faits accomplis."
        },
        {
          "s": "cygne",
          "t": "En même temps il faut du dialogue, et en même temps il faut des limites. Cette bombe, par exemple : ne la gardez pas de votre côté."
        },
        {
          "s": "sultan",
          "t": "Je ne garde rien, technocrate. Je renvoie. Toujours. Et je fais trembler le pont sous tes pieds bien élevés."
        }
      ],
      "win": [
        {
          "s": "sultan",
          "t": "Boum, de ton côté, sur mon détroit. Un jour, Cygne, c'est ton Union qui demandera à entrer chez MOI."
        },
        {
          "s": "cygne",
          "t": "Reconnaissons-le : de la puissance, et une vraie détente au talon. On reparlera des critères. En même temps."
        }
      ],
      "lose": [
        {
          "s": "cygne",
          "t": "Critères respectés, bombe renvoyée, victoire accordée. La procédure a du bon, voyez-vous."
        },
        {
          "s": "sultan",
          "t": "Tu gagnes le match, pas le détroit. Je reste sur le pas de ta porte. Debout. Et j'ouvre ou je ferme le robinet quand je veux."
        }
      ]
    },
    {
      "act": 3,
      "title": "Frères de mosquée, rivaux de désert",
      "sub": "Bosforie–Ramenie · leadership du croissant régional",
      "left": "sultan",
      "right": "safran",
      "terrain": 9,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses. Arcades turquoise, roseraie du palais, un paon fait la roue. La balle-bombe siffle entre deux prétendants au même trône spirituel."
        },
        {
          "s": "safran",
          "t": "Sultan. Nous prions vers le même horizon et pourtant nous ne voulons pas le même maître de maison. Fâcheux, n'est-ce pas ?"
        },
        {
          "s": "sultan",
          "t": "Deux capitales, une seule couronne régionale, Safran. Et ta Ramenie, en Syrie comme ailleurs, joue contre mes pions."
        },
        {
          "s": "safran",
          "t": "Tes pions ? Tes faucons de fer bourdonnent au-dessus de mes alliés. Mon Voile d'Or ralentira ton talon jusqu'à l'immobilité."
        },
        {
          "s": "sultan",
          "t": "Ralentis tant que tu veux : plus je suis lourd, plus la terre tremble. Le Séisme n'a pas besoin de vitesse, il a besoin de MASSE."
        },
        {
          "s": "safran",
          "t": "Alors voyons si ta masse résiste à la patience. Mesurée. Longue. Et à cette bombe. Servons, frère-rival."
        }
      ],
      "win": [
        {
          "s": "sultan",
          "t": "Ton voile a ralenti mes pas, pas mon talon. La couronne du croissant reste sur le pont, entre deux mondes. Chez moi."
        },
        {
          "s": "safran",
          "t": "Une manche. La patience est mon arme longue, Sultan. Le désert, lui, ne se fatigue jamais. Nous rejouerons."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "safran",
          "t": "Boum, sous ton voile ralenti. La mesure use la grandiloquence, comme l'eau use la pierre du pont."
        },
        {
          "s": "sultan",
          "t": "Tu ralentis un empire, tu ne l'arrêtes pas. Ma bannière pourpre flottait avant ta roseraie. Elle flottera après."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le smash du Sultan",
      "sub": "Bosforie–Levantie · FINALE · le duel de tout le Levant",
      "left": "sultan",
      "right": "faucon",
      "terrain": 5,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "FINALE. Retour au Pont des Deux Mondes. La bannière pourpre à liseré doré couvre tout un continent du décor. La bombe attend. Le tapis volant fait un dernier passage."
        },
        {
          "s": "sultan",
          "t": "Faucon. Sur mon pont, entre l'Orient et l'Occident, tu vas comprendre pourquoi le monde entier attend chez MOI."
        },
        {
          "s": "faucon",
          "t": "Le monde attend, et pendant ce temps toi tu haranges les foules à mon sujet. Beaucoup de discours, Sultan. Peu de raids."
        },
        {
          "s": "sultan",
          "t": "Mes discours font tomber des gouvernements. Ton Raid Éclair m'interdit de sauter ? Parfait : je ne saute jamais. Je reste. Je frappe le sol."
        },
        {
          "s": "faucon",
          "t": "Reste donc. Cloué. Moi je frappe vite, sans prévenir, et je ne négocie pas. La bombe non plus ne négocie pas."
        },
        {
          "s": "sultan",
          "t": "Alors nous nous interdirons mutuellement de sauter, faucon contre séisme, et c'est le plus lourd, le plus fier, qui restera debout."
        },
        {
          "s": "narrator",
          "t": "Deux supers qui clouent l'adversaire au sol, une bombe entre eux, un pont entre deux mondes. Ne la gardez pas de votre côté."
        }
      ],
      "win": [
        {
          "s": "sultan",
          "t": "BOUM ! De ton côté, sur mon détroit, sous ma bannière pourpre ! Le Levant a un maître, et il tient le pont entre les deux mondes !"
        },
        {
          "s": "faucon",
          "t": "Un revers. Tactique, pas stratégique. Je frappe toujours deux fois, Sultan. La seconde, tu ne la verras pas venir."
        },
        {
          "s": "narrator",
          "t": "Le talon frappe une dernière fois. Tout le pont tremble. Le tapis volant s'incline. Le Sultan lève les bras : sa campagne s'achève, impériale."
        }
      ],
      "lose": [
        {
          "s": "faucon",
          "t": "Raid éclair, bombe renvoyée, match plié. La grandiloquence n'a jamais arrêté un faucon en piqué."
        },
        {
          "s": "sultan",
          "t": "Tu gagnes un soir sur mon pont. Mais le détroit reste à moi, la bannière reste pourpre, et je frappe encore à toutes les portes. Debout."
        }
      ]
    }
  ],
  "gourou": [
    {
      "act": 1,
      "title": "L'ami du désert en double",
      "sub": "Bharatie–Levantie · partenaires de crête",
      "left": "gourou",
      "right": "faucon",
      "ally": "safran",
      "right2": "volkoi",
      "terrain": 8,
      "mode": "2v2",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Stade Ashram. Le Gourou invite Safran en partenaire contre le Faucon et le Tsar. Un 2v2 pour tester la sérénité à quatre."
        },
        {
          "s": "gourou",
          "t": "Namasté, Safran. Tu ralentis, je dure. Ensemble, on respire plus longtemps qu'eux."
        },
        {
          "s": "safran",
          "t": "Partenariat zen et mesuré. Leur intransigeance va s'ennuyer avant nous."
        },
        {
          "s": "faucon",
          "t": "Je n'aime pas les doubles. Trop de bavardage. Digue, Tsar — ou je digue pour deux."
        },
        {
          "s": "volkoi",
          "t": "Je gèle. Tu sécurises. On verra si le calme tient sous la neige."
        },
        {
          "s": "narrator",
          "t": "Alliance de patience contre alliance de froid. Le filet tranche."
        }
      ],
      "win": [
        {
          "s": "gourou",
          "t": "Le calme en double a tenu. Merci, ami de la rose."
        },
        {
          "s": "safran",
          "t": "Beau 2v2. Leur ligne a tremblé avant notre souffle."
        },
        {
          "s": "faucon",
          "t": "Un set. On resserre. Moins de mots, plus de digues."
        },
        {
          "s": "volkoi",
          "t": "Temporaire. L'hiver n'a pas dit son dernier partenaire."
        }
      ],
      "lose": [
        {
          "s": "faucon",
          "t": "Ligne tenue. Double gagné. Rentrez méditer."
        },
        {
          "s": "volkoi",
          "t": "Le gel à deux a suffi. Votre zen a pris froid."
        },
        {
          "s": "gourou",
          "t": "On respire, on s'incline, on revient — partenaires inclus."
        },
        {
          "s": "safran",
          "t": "Mesure pour la revanche. La table reste là."
        }
      ]
    },
    {
      "act": 1,
      "title": "Le club des affamés",
      "sub": "Bharatie–Tropicalia · viande, soja et vaches sacrées",
      "left": "gourou",
      "right": "capitaine",
      "terrain": 7,
      "mode": "volley",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Grande Forêt, court en terre rouge. Deux mastodontes des grands ensembles émergents se toisent — l'un carnivore, l'autre non."
        },
        {
          "s": "capitaine",
          "t": "Bienvenue dans MA clairière, le maigre ! Ici on grille du bœuf à midi et on tronçonne à l'aube."
        },
        {
          "s": "gourou",
          "t": "Namasté, Capitaine. Grille ce que tu veux. Mais chez moi, la vache traverse le court et l'arbitre s'incline."
        },
        {
          "s": "capitaine",
          "t": "Ha ! Ta vache, moi j'en fais un barbecue pour tout le stade ! Ton ashram sentirait meilleur."
        },
        {
          "s": "gourou",
          "t": "Nos peuples commercent, ami. Ton soja nourrit mes bêtes, ton ara crie plus fort que ton jeu."
        },
        {
          "s": "capitaine",
          "t": "Assez parlé fleurs et méditation ! Sers, le yogi, qu'on transpire un peu !"
        }
      ],
      "win": [
        {
          "s": "gourou",
          "t": "Le végétarien tient la distance, vois-tu. Moins lourd sur les jambes. Namasté — et longue vie à ta forêt."
        },
        {
          "s": "capitaine",
          "t": "Rrraah ! Battu par un buveur de thé ! Bon… t'as du coffre, l'ascète. On remet ça au barbecue."
        }
      ],
      "lose": [
        {
          "s": "capitaine",
          "t": "HA ! La forêt broie le jardin ! Retourne méditer, le maigre, et ramène-moi du soja !"
        },
        {
          "s": "gourou",
          "t": "Bien joué. La force brute a son jour. Mais l'endurance a toutes les saisons. Namasté."
        }
      ]
    },
    {
      "act": 1,
      "title": "Le grand câlin",
      "sub": "Bharatie–Doria · l'accolade de deux showmen",
      "left": "gourou",
      "right": "dorf",
      "terrain": 1,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Country Club Doré. Deux maîtres de la foule, deux collectionneurs de records de tribune, se serrent dans les bras avant de se serrer la gorge."
        },
        {
          "s": "dorf",
          "t": "Regarde cette foule ! Immense ! La plus grande jamais vue ! On a rempli mon stade et le tien, mon ami !"
        },
        {
          "s": "gourou",
          "t": "Namasté, Baron. Nos foules se saluent. Cent mille voix chez toi, un milliard et demi chez moi. Compte."
        },
        {
          "s": "dorf",
          "t": "Un milliard ! Fantastique ! On fait un business ensemble, un très, très gros business, crois-moi."
        },
        {
          "s": "gourou",
          "t": "Fais donc ton Mur d'or. Moi, je m'assois, je respire, et je te gèle le sol pendant que tu comptes."
        },
        {
          "s": "dorf",
          "t": "Me geler ? Personne ne gèle le Baron ! Sers, le sage, et regarde le plus beau smash du monde !"
        }
      ],
      "win": [
        {
          "s": "gourou",
          "t": "Ton mur brille, mais un mur d'or, ça ne respire pas. Le lac gèle même l'or. Namasté, ami showman."
        },
        {
          "s": "dorf",
          "t": "Truqué ! Totalement truqué ! … Mais quelle foule, mon pote. On refait le show, plus grand encore."
        }
      ],
      "lose": [
        {
          "s": "dorf",
          "t": "Gagné ! Le plus grand câlin ET le plus grand match ! Les gens pleuraient, ils pleuraient !"
        },
        {
          "s": "gourou",
          "t": "Profite du bruit, Baron. Moi je garde le souffle. Le silence gagne à la fin. Namasté."
        }
      ]
    },
    {
      "act": 2,
      "title": "En même temps, namasté",
      "sub": "Bharatie–Gallardie · Rafales, valeurs et courtoisie",
      "left": "gourou",
      "right": "cygne",
      "terrain": 2,
      "mode": "flame",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Palais Gallard. Un partenaire d'armement en visite, entre ventes d'avions et petites leçons de morale. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "cygne",
          "t": "Cher Gourou, nous vous vendons nos plus beaux appareils. En même temps, parlons un peu de vos… libertés."
        },
        {
          "s": "gourou",
          "t": "Namasté, Cygne. J'achète tes avions, tu achètes mon marché. En même temps, garde tes leçons pour ton palais."
        },
        {
          "s": "cygne",
          "t": "La démocratie, voyez-vous, c'est un art de l'équilibre. Un contre, une passe, un principe."
        },
        {
          "s": "gourou",
          "t": "L'équilibre, je le tiens en tailleur les yeux fermés. Toi, tu vacilles dès que le pigeon s'envole."
        },
        {
          "s": "cygne",
          "t": "Touché. Servons donc — et que le meilleur en même temps l'emporte."
        }
      ],
      "win": [
        {
          "s": "gourou",
          "t": "En même temps, j'ai gagné. Tes avions volent, ma sérénité aussi. Reste partenaire, Cygne. Namasté."
        },
        {
          "s": "cygne",
          "t": "Une belle défaite, si tant est. Reconnaissons-le : de l'endurance. Nous rediscuterons des valeurs."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "cygne",
          "t": "L'équilibre l'emporte. En même temps, félicitez-vous d'avoir tenu si longtemps face au Cygne."
        },
        {
          "s": "gourou",
          "t": "Un revers courtois. Je le range dans le lac. La montagne, elle, ne bouge pas. Namasté."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le pétrole tiède",
      "sub": "Bharatie–Bourassie · brut à prix d'ami, froid contre froid",
      "left": "gourou",
      "right": "volkoi",
      "terrain": 0,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Place Écarlate, sous la neige. Deux geleurs se rencontrent : l'un par l'hiver, l'autre par le zen. Le thermomètre panique. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "volkoi",
          "t": "Tu m'achètes mon pétrole quand les autres me boudent. Sage. Le froid récompense les patients."
        },
        {
          "s": "gourou",
          "t": "Namasté, Tsar. Je fais mes courses partout, sans choisir de camp. Ton brut, mon marché : bon échange."
        },
        {
          "s": "volkoi",
          "t": "Deux hommes qui gèlent leurs rivaux. Curieux duel. Mon hiver contre ton silence."
        },
        {
          "s": "gourou",
          "t": "Ton hiver vient du dehors. Mon froid vient du dedans. Devine lequel dure plus longtemps."
        },
        {
          "s": "volkoi",
          "t": "Assez de philosophie. Sers. On verra quelle glace craque la première."
        }
      ],
      "win": [
        {
          "s": "gourou",
          "t": "Le lac immobile gèle plus profond que le fleuve de Bourassie. Bel échange froid, Tsar. Restons en affaires. Namasté."
        },
        {
          "s": "volkoi",
          "t": "Un revers. Rare. Ton calme est une arme d'hiver. Je m'en souviendrai — et je patiente."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "volkoi",
          "t": "Mon hiver gagne toujours à l'usure. Médite là-dessus, gourou. Le froid ne négocie pas."
        },
        {
          "s": "gourou",
          "t": "Deux glaces, une craque. J'apprends. Namasté. Le pétrole coule, la revanche mûrit."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le port des roses",
      "sub": "Bharatie–Ramenie · corridor d'énergie sous sanctions",
      "left": "gourou",
      "right": "safran",
      "terrain": 9,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses, arcades turquoise. Deux vieilles civilisations discutent d'un port stratégique entre deux odeurs de pétales. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "safran",
          "t": "Bienvenue, Gourou. Tu construis mon port, tu achètes mon brut — mais toujours d'un œil sur les sanctions des autres."
        },
        {
          "s": "gourou",
          "t": "Namasté, Safran. Je marche entre les gouttes, c'est un art. Ton Voile d'Or ralentit ; mon souffle gèle. Complémentaires."
        },
        {
          "s": "safran",
          "t": "Complémentaires jusqu'au jour où tes amis du désert te demandent de choisir. Ce jour-là, ton silence parlera."
        },
        {
          "s": "gourou",
          "t": "Ce jour-là, je méditerai. Choisir, c'est perdre la moitié du monde. Moi je garde tout le monde à table."
        },
        {
          "s": "safran",
          "t": "Prudent comme un paon avant l'orage. Servons, sage. Voyons qui ralentit l'autre."
        }
      ],
      "win": [
        {
          "s": "gourou",
          "t": "Ton voile ralentit, mais mon souffle gèle le voile lui-même. Bel échange, Safran. Le port tiendra. Namasté."
        },
        {
          "s": "safran",
          "t": "Concédé, avec mesure. Tu joues sur tous les tableaux et tu gagnes sur le mien. Habile funambule."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "safran",
          "t": "Le Voile d'Or endort même les sages. Repose-toi, Gourou. Le paon, lui, ne cligne pas des yeux."
        },
        {
          "s": "gourou",
          "t": "Ralenti, pas vaincu. Je respire, je repars. La roseraie reverra mon souffle. Namasté."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 3,
      "title": "La porte du détroit",
      "sub": "Bharatie–Bosforie · un pont trop bavard sur la crête",
      "left": "gourou",
      "right": "sultan",
      "terrain": 5,
      "mode": "bomb",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Pont des Deux Mondes. La balle est une bombe. Un sultan qui parle trop d'une montagne qui n'est pas la sienne : le calme du Gourou se fissure."
        },
        {
          "s": "sultan",
          "t": "Ta crête, Gourou, ta fameuse ligne de montagne… j'ai un avis. Fort. Et je le crie à toutes les tribunes du monde."
        },
        {
          "s": "gourou",
          "t": "Namasté, Sultan. Ton pont relie deux continents — mais il ne relie pas ta bouche à tes affaires. Ma crête ne te regarde pas."
        },
        {
          "s": "sultan",
          "t": "Tout me regarde ! Je suis le carrefour du monde ! Je défonce au smash, et je parle de qui je veux !"
        },
        {
          "s": "gourou",
          "t": "Parle. Pendant que tu grondes, je respire. Et cette balle qui fume, tu vas la garder de ton côté."
        },
        {
          "s": "sultan",
          "t": "Un séisme sous tes pieds, sage ! Que ta méditation danse sur le pont qui tremble !"
        },
        {
          "s": "narrator",
          "t": "Ne laissez pas la bombe côté ashram. Renvoyez. Le calme est aussi une contre-attaque."
        }
      ],
      "win": [
        {
          "s": "gourou",
          "t": "Le pont a tremblé, le lac non. Occupe-toi de ton détroit, Sultan, et laisse ma montagne méditer en paix. Namasté."
        },
        {
          "s": "sultan",
          "t": "Grr… ta sérénité m'exaspère plus que ta défense. Un jour, je crierai plus fort que ton silence."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "sultan",
          "t": "BOUM ! Sur l'ashram ! Le carrefour du monde a parlé, et le sage s'est tu ! Grandiose !"
        },
        {
          "s": "gourou",
          "t": "Tu gagnes le bruit, pas la crête. Je remonte la montagne. Namasté — on n'y entend plus tes cris."
        }
      ]
    },
    {
      "act": 3,
      "title": "Les boutons du voisinage",
      "sub": "Bharatie–Ryonganie · missiles au-dessus de la région",
      "left": "gourou",
      "right": "bebe",
      "terrain": 3,
      "mode": "bomb",
      "ai": 3,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé, radar allumé. La balle est une bombe. Un héritier qui joue avec ses jouets fait trembler tout le continent."
        },
        {
          "s": "bebe",
          "t": "Hé hé ! Regarde mon radar, mon défilé, mes boutons ! Le petit Maréchal fait trembler les grands sages !"
        },
        {
          "s": "gourou",
          "t": "Namasté, Maréchal. Tu paniques une région entière pour qu'on te regarde. Moi, on me regarde sans que je crie."
        },
        {
          "s": "bebe",
          "t": "Je tire quand je veux ! Interdit de sauter chez moi — ma Batterie AA cloue même les gourous au sol !"
        },
        {
          "s": "gourou",
          "t": "Alors je resterai assis. En tailleur. Les yeux clos. Et je gèlerai ton esplanade sans lever le petit doigt."
        },
        {
          "s": "bebe",
          "t": "Assis ?! Personne ne bat le Maréchal en restant ASSIS ! Feu sur le méditant !"
        },
        {
          "s": "narrator",
          "t": "La bombe siffle sous le radar. Un souffle profond, et on renvoie. Toujours renvoyer."
        }
      ],
      "win": [
        {
          "s": "gourou",
          "t": "Tu clous mes sauts, pas mon calme. Un enfant qui hurle finit par s'endormir. Range tes boutons, Maréchal. Namasté."
        },
        {
          "s": "bebe",
          "t": "Grrr ! Il a gagné SANS SAUTER ! C'est de la triche zen ! Je… je refais un défilé, na !"
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "bebe",
          "t": "BOUM ! HÉ HÉ ! Le grand sage explosé par le petit Maréchal ! Refaites le défilé, doublez les tribunes !"
        },
        {
          "s": "gourou",
          "t": "L'agité gagne un point, jamais la paix. Je respire, je reviens. Le radar s'éteindra avant mon souffle. Namasté."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le toit du monde",
      "sub": "Bharatie–Panguo · la crête, le rempart et la méditation",
      "left": "gourou",
      "right": "timonier",
      "terrain": 6,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Stade Ashram, chez le Gourou. Guirlandes de soucis, vache qui traverse en lisière, et une bombe pour ballon. La rivalité fondatrice, deux géants pour un sommet."
        },
        {
          "s": "timonier",
          "t": "Je suis venu sur ton grès miel, Gourou, poser mon Rempart au milieu de ton ashram. L'harmonie passe où je le décide."
        },
        {
          "s": "gourou",
          "t": "Namasté, Timonier. Bienvenue sous mes guirlandes. Mais la crête, au sommet du monde, est à moi. Ton rempart s'arrêtera au filet."
        },
        {
          "s": "timonier",
          "t": "Je contrôle le tempo. Toujours. Deux milliards d'hommes retiennent leur souffle — et moi je respire lentement."
        },
        {
          "s": "gourou",
          "t": "Respirer, c'est MON métier. Un milliard et demi de témoins m'accompagnent. Ton rempart est un mur ; mon lac gèle les murs."
        },
        {
          "s": "timonier",
          "t": "Alors gelons-nous, sage. Le plus impassible restera. La patience du panda contre l'endurance du gourou."
        },
        {
          "s": "gourou",
          "t": "Que la vache passe, que la bombe fume : je ne cille pas. Servons pour le toit du monde."
        },
        {
          "s": "narrator",
          "t": "L'aura du Timonier vire au rouge : il ne joue plus, il domine. Renvoyez la bombe, ou l'ashram s'embrase."
        }
      ],
      "win": [
        {
          "s": "gourou",
          "t": "Le rempart s'énerve, le lac reste lisse. Le calme bat le mur quand le mur veut tout. La crête est méditée : elle est mienne. Namasté, voisin."
        },
        {
          "s": "timonier",
          "t": "Un revers. Sur ton propre grès. Temporaire, forcément. L'harmonie corrigera la trajectoire… un jour, à mon tempo."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "timonier",
          "t": "Le tempo, toujours le tempo. Même chez toi, sous tes soucis, le rempart tient. La patience impériale absorbe la ferveur."
        },
        {
          "s": "gourou",
          "t": "Tu gagnes un set, pas la montagne. On médite, on respire, on remonte. La crête ne disparaît pas — et moi non plus. Namasté."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    }
  ],
  "capitaine": [
    {
      "act": 1,
      "title": "Casquettes en double",
      "sub": "Tropicalia–Libertaria · binôme de canopée",
      "left": "capitaine",
      "right": "dorf",
      "ally": "gourou",
      "right2": "faucon",
      "terrain": 1,
      "mode": "2v2",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Grande Forêt. Le Capitaine tire le Gourou comme partenaire contre le Baron et le Faucon. 2v2 sous la canopée."
        },
        {
          "s": "capitaine",
          "t": "Toi, calme, tu digues avec MOI. Ma forêt, ton souffle. On leur casse leur alliance dorée."
        },
        {
          "s": "gourou",
          "t": "Namasté, Capitaine. Je ralentis le tempo ; tu frappes les troncs. Partenariat clair."
        },
        {
          "s": "dorf",
          "t": "J'ai le Faucon ! Le plus dur partenaire ! On va déforester… euh… gagner !"
        },
        {
          "s": "faucon",
          "t": "Moins de métaphores. Plus de digues. Allez."
        },
        {
          "s": "narrator",
          "t": "Deux équipes. Une forêt. Quatre casquettes d'ego."
        }
      ],
      "win": [
        {
          "s": "capitaine",
          "t": "Voilà ! Binôme de jungle ! Merci, zen — t'es pas mauvais pour un moine."
        },
        {
          "s": "gourou",
          "t": "Beau double. La canopée a respiré plus fort qu'eux."
        },
        {
          "s": "dorf",
          "t": "Truqué ! Mon partenaire était trop sérieux !"
        },
        {
          "s": "faucon",
          "t": "On recommence. Sans casquette de cirque."
        }
      ],
      "lose": [
        {
          "s": "dorf",
          "t": "GAGNÉ LE 2v2 ! Meilleure équipe !"
        },
        {
          "s": "faucon",
          "t": "Ligne propre. Vous pouvez replanter."
        },
        {
          "s": "capitaine",
          "t": "Tsss. Mon partenaire a trop médité. Revanche — et plus d'ara."
        },
        {
          "s": "gourou",
          "t": "On revient. La montagne et la forêt ne boudent pas longtemps."
        }
      ]
    },
    {
      "act": 1,
      "title": "Deux menton-levés au filet",
      "sub": "Tropicalia–Levantie · la fraternité des durs",
      "left": "capitaine",
      "right": "faucon",
      "terrain": 8,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Citadelle du Levant, remparts de grès sur la colline. Deux hommes qui détestent la même presse se retrouvent du bon côté du filet — pour une fois presque alliés."
        },
        {
          "s": "faucon",
          "t": "On est amis, Capitaine. Tu m'as toujours soutenu. Mais l'amitié s'arrête à la ligne de service."
        },
        {
          "s": "capitaine",
          "t": "Amis, oui ! Deux types qu'on traite de brutes dans les journaux. Sauf que moi, mes brutes, elles ont des plumes."
        },
        {
          "s": "faucon",
          "t": "Je ne négocie pas au filet. Un raid, un point, on n'en parle plus. C'est ma doctrine."
        },
        {
          "s": "capitaine",
          "t": "La doctrine ! Chez moi la doctrine c'est la tronçonneuse. Bruyante, efficace, et ça sent bon le sciure. Balle au centre."
        }
      ],
      "win": [
        {
          "s": "capitaine",
          "t": "Désolé l'ami, même entre durs y'a un plus dur. Et le plus dur, il pousse des arbres dans ton camp."
        },
        {
          "s": "faucon",
          "t": "Bien joué. Rare que je le dise. Tu restes un allié — sur le terrain, un peu moins."
        }
      ],
      "lose": [
        {
          "s": "faucon",
          "t": "Le raid éclair a parlé. Pas de troncs qui tiennent contre la vitesse. Reviens quand tu veux."
        },
        {
          "s": "capitaine",
          "t": "Volé par un faucon ! Bon. Chez moi y'a un ara qui va lui expliquer les règles de l'air."
        }
      ]
    },
    {
      "act": 1,
      "title": "Deux forêts, un pont",
      "sub": "Tropicalia–Bosforie · les fiers susceptibles",
      "left": "capitaine",
      "right": "sultan",
      "terrain": 5,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Sur le Pont des Deux Mondes, entre deux continents, deux fiertés nationales grosses comme des dômes se toisent au-dessus du détroit."
        },
        {
          "s": "sultan",
          "t": "Je contrôle le passage entre deux mondes, Capitaine. Toi, tu contrôles quoi ? Des arbres et un perroquet."
        },
        {
          "s": "capitaine",
          "t": "Des arbres, un perroquet, un continent entier et zéro leçon à recevoir. C'est déjà pas mal, Sultan."
        },
        {
          "s": "sultan",
          "t": "Je défonce tout au smash. Le détroit tremble quand je saute. Prépare-toi à sentir la terre bouger."
        },
        {
          "s": "capitaine",
          "t": "Fais trembler ce que tu veux. Moi je plante, ça tremble plus après. Balle sur le pont, et arrête de causer."
        }
      ],
      "win": [
        {
          "s": "capitaine",
          "t": "Un mur de troncs sur ton beau tapis volant, et te voilà cloué au sol. Salue l'ara en partant."
        },
        {
          "s": "sultan",
          "t": "Une manche, rien de plus. Le pont reste à moi. Mais tu as du coffre, l'homme de la forêt."
        }
      ],
      "lose": [
        {
          "s": "sultan",
          "t": "Le séisme a fissuré ta clairière ! Deux mondes s'inclinent, le tien attendra son tour."
        },
        {
          "s": "capitaine",
          "t": "Pfff. Un tremblement de terre pour gagner un set. Chez moi, on appelle ça de la triche parfumée."
        }
      ]
    },
    {
      "act": 2,
      "title": "L'engrais et l'ours",
      "sub": "Tropicalia–Bourassie · le fournisseur qu'on admire",
      "left": "capitaine",
      "right": "volkoi",
      "terrain": 0,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Place Écarlate, neige et briques cramoisies. Sans les sacs d'engrais du Tsar, la Grande Forêt ne pousse plus. Le Capitaine est venu payer sa dette — sans jamais le dire. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "volkoi",
          "t": "Tu ne jures que par ta liberté, Capitaine, mais c'est mon engrais qui fait pousser ton soja. L'hiver travaille pour moi ; ta terre aussi."
        },
        {
          "s": "capitaine",
          "t": "T'es un dur, Tsar, ça je respecte. Deux vrais mâles alpha sur un terrain gelé. Mais mes bûches, elles gèlent pas, elles ÉCRASENT."
        },
        {
          "s": "volkoi",
          "t": "Le respect ne renvoie pas le ballon. Je vais geler ton camp, planter du givre entre tes troncs. Sers, et compte tes doigts."
        },
        {
          "s": "capitaine",
          "t": "Geler la forêt tropicale ? Bonne chance mon frère. Ici on transpire même sous ton blizzard. On y va !"
        }
      ],
      "win": [
        {
          "s": "capitaine",
          "t": "Fait tomber l'ours dans sa propre neige ! Et t'inquiète, je reprends une palette d'engrais la semaine pro. Entre durs, ça se paie."
        },
        {
          "s": "volkoi",
          "t": "Une défaite. Le froid n'a pas de rancune, il a de la mémoire. Tu reviendras acheter — tu reviens toujours."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "volkoi",
          "t": "L'Hiver Général ne négocie pas, Capitaine. Ta jungle bruyante s'est figée d'un coup. Rentre te réchauffer."
        },
        {
          "s": "capitaine",
          "t": "Gelé par le Tsar sur sa banquise ! Bon… au moins j'ai perdu contre un vrai dur. Ça compte, ça, non ?"
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Les frères du Sud",
      "sub": "Tropicalia–Bharatie · le club des grands orgueils",
      "left": "capitaine",
      "right": "gourou",
      "terrain": 6,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Stade Ashram, grès couleur miel et guirlandes de soucis orange. Une vache traverse tranquillement le terrain. Deux mastodontes du Sud se saluent — presque frères, presque rivaux. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "gourou",
          "t": "Namasté, Capitaine. Nous partageons tant : de grandes foules, de grands egos, et une allergie commune aux donneurs de leçons."
        },
        {
          "s": "capitaine",
          "t": "Namasté toi-même, Gourou. J'aime bien ton stade. Y'a une vache qui traverse. Chez moi c'est un ara qui vise ta tête. Chacun sa faune."
        },
        {
          "s": "gourou",
          "t": "Je respire, je médite, et je te fais courir jusqu'à ce que ta forêt te manque. L'endurance est ma prière."
        },
        {
          "s": "capitaine",
          "t": "Médite tant que tu veux, mon pote. Pendant que tu respires, je plante. Un mur, deux murs, et t'as plus de sol. Sers."
        }
      ],
      "win": [
        {
          "s": "capitaine",
          "t": "Le zen c'est joli, mais ça renvoie pas les troncs. Bon match, frère du Sud. Gaffe à ta vache en sortant."
        },
        {
          "s": "gourou",
          "t": "Le souffle a cédé à la hache, ce soir. Je m'incline, ami bruyant. On se retrouve au prochain sommet."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "gourou",
          "t": "La méditation vainc la précipitation. Respire, Capitaine. Ta forêt sera toujours là — enfin, espérons."
        },
        {
          "s": "capitaine",
          "t": "Épuisé par un type assis en tailleur ! Le monde est fou. Je reviens avec deux tronçonneuses et un thermos."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le jardin et la clairière",
      "sub": "Tropicalia–Ramenie · deux méfiances polies",
      "left": "capitaine",
      "right": "safran",
      "terrain": 9,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses, arcades turquoise et roseraie de palais. Un paon fait la roue. Deux hommes qui ne se comprennent pas s'observent avec une courtoisie glaçante. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "safran",
          "t": "Vous faites beaucoup de bruit, Capitaine, pour un homme qui n'a que des arbres à défendre."
        },
        {
          "s": "capitaine",
          "t": "Et vous, le mesuré, vous parlez tout bas pour cacher que vous ralentissez tout le monde. Votre voile d'or, là — moi j'appelle ça un rideau."
        },
        {
          "s": "safran",
          "t": "Le calme est une force que les bûcherons ne comprennent pas. Je ralentis. Vous vous épuisez. Voyons qui tient."
        },
        {
          "s": "capitaine",
          "t": "Ralentis-moi tant que tu veux, l'ami sardonique. Un mur de troncs, ça attend pas. Ça pousse d'un coup. Balle au paon."
        }
      ],
      "win": [
        {
          "s": "capitaine",
          "t": "Ton voile d'or contre mes bûches brutes : les bûches gagnent. Salue le paon, moi je rentre à la forêt."
        },
        {
          "s": "safran",
          "t": "Une victoire de la force sur la patience. Rare. Savourez — ce sera bref, Capitaine."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "safran",
          "t": "Le voile ralentit même les tronçonneuses. Vous avez couru dans le miel, et vous avez perdu. Sereinement."
        },
        {
          "s": "capitaine",
          "t": "Endormi par un mec en robe qui parle doucement ! Réveillez-moi. Mon camp est au ralenti, c'est un scandale."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 3,
      "title": "L'accusation du matin",
      "sub": "Tropicalia–Panguo · qui a lâché le virus ?",
      "left": "capitaine",
      "right": "timonier",
      "terrain": 4,
      "mode": "bomb",
      "ai": 3,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Cité du Matin, retour brutal. Le ballon est devenu bombe. Un fléau a traversé le monde, et Le Capitaine a désigné un coupable — à voix très, très haute."
        },
        {
          "s": "capitaine",
          "t": "Ton virus, Timonier. TON virus. Sorti de ton atelier, comme tes ballons. Sauf que celui-là, on l'a pas commandé."
        },
        {
          "s": "timonier",
          "t": "Des accusations, encore. Tu cries au monde entier pendant que tu m'achètes mes vaccins en douce. Sers ta bombe, bavard."
        },
        {
          "s": "capitaine",
          "t": "J'achète rien, c'est de la grippette ! Enfin… disons que j'achète pour les autres. Renvoie, et fais gaffe où tombe la mèche."
        },
        {
          "s": "timonier",
          "t": "Le tempo, la patience, le silence. Toi tu hurles ; moi je gagne. La bombe tourne — ne la laisse pas de ton côté."
        }
      ],
      "win": [
        {
          "s": "capitaine",
          "t": "BOUM chez le communiste ! Je l'avais dit, je l'avais crié ! La tronçonneuse et la vérité, même combat."
        },
        {
          "s": "timonier",
          "t": "Une explosion de bruit, rien de plus. L'histoire retiendra le tempo, pas les cris. Je patiente encore."
        }
      ],
      "lose": [
        {
          "s": "timonier",
          "t": "Tu accuses, tu t'agites, tu perds. Le rempart au milieu de ton camp t'a coûté la mèche. Silence, maintenant."
        },
        {
          "s": "capitaine",
          "t": "Explosé par le type que j'ai insulté toute la semaine ET à qui je dois du fric ! Vie compliquée, mon frère."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le camarade et le capitaine",
      "sub": "Tropicalia–Ryonganie · le rouge que je hais",
      "left": "capitaine",
      "right": "bebe",
      "terrain": 3,
      "mode": "bomb",
      "ai": 3,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé, granit et bannières unies. Le radar tourne, la bombe aussi. Le Capitaine a construit toute sa carrière sur la haine de ce que représente ce petit maréchal."
        },
        {
          "s": "bebe",
          "t": "Bienvenue chez moi, Capitaine. Ici, l'ordre est parfait, le peuple applaudit sur commande, et personne ne coupe d'arbres sans autorisation."
        },
        {
          "s": "capitaine",
          "t": "Ton ordre, gamin, c'est un défilé de pantins. Moi mon peuple il gueule, il rote, il vote de travers — mais il est VIVANT. C'est ça la liberté."
        },
        {
          "s": "bebe",
          "t": "La liberté ! Quel désordre charmant. Mon radar voit tout, ma discipline ne rate rien. Interdit de sauter dans mon camp."
        },
        {
          "s": "capitaine",
          "t": "Interdit de sauter ? Pas grave, je saute pas, je PLANTE. Un mur de troncs sur ton bel asphalte rouge. Renvoie ta bombe, petit soldat."
        }
      ],
      "win": [
        {
          "s": "capitaine",
          "t": "Fait sauter le mausolée ambulant ! Voilà ce qui arrive quand un vrai capitaine rencontre un capitaine en carton."
        },
        {
          "s": "bebe",
          "t": "Une défaite temporaire. Le défilé continue, le radar tourne, et la lettre de plainte est déjà rédigée."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "bebe",
          "t": "La discipline écrase le folklore, Capitaine. Ton chaos coloré a explosé sous mes projecteurs. Salue en sortant."
        },
        {
          "s": "capitaine",
          "t": "Battu par un gamin en uniforme dans une ville sans bruit ! L'horreur. Je rentre à la forêt écouter l'ara m'insulter, ça au moins c'est franc."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    },
    {
      "act": 3,
      "title": "La forêt en feu",
      "sub": "Grande Forêt · Tropicalia contre le Cygne · le grand duel",
      "left": "capitaine",
      "right": "cygne",
      "terrain": 7,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Grande Forêt. Terre rouge, huttes sur pilotis, canopée dorée — et à l'horizon, une lueur : des feux, ou « du barbecue », selon qui parle. La bombe est là. Le grand feuilleton des Jeux se joue ce soir."
        },
        {
          "s": "cygne",
          "t": "Votre forêt brûle, Capitaine, et c'est le poumon de la planète entière. Je viens défendre ce que vous laissez partir en fumée. En même temps."
        },
        {
          "s": "capitaine",
          "t": "MA forêt, Cygne. La MIENNE. Occupe-toi de ton emblème doré et de ton obélisque. Ici on plante, on coupe, on vit. C'est pas ton jardin."
        },
        {
          "s": "cygne",
          "t": "Le colonialisme vert, dites-vous ? Non. La responsabilité. En même temps, on peut protéger ET dialoguer. Ce soir, ce sera surtout se battre."
        },
        {
          "s": "narrator",
          "t": "Regardez ses yeux. Le premier de la classe s'est dopé pour ce match. L'aura rouge du Cygne éclaire la canopée. Ce n'est plus de la diplomatie — c'est une guerre de troncs."
        },
        {
          "s": "capitaine",
          "t": "Tu t'es shooté pour venir dans MA jungle me faire la leçon ? Parfait. TRONÇONNEUSE ! Un mur de troncs entre toi et le sol, et on cause plus. On smashe."
        }
      ],
      "win": [
        {
          "s": "capitaine",
          "t": "La forêt a gardé son maître ! Coupé, planté, gagné. Rentre à ton palais, Cygne, et lâche-moi la canopée."
        },
        {
          "s": "cygne",
          "t": "Vous gagnez le match, pas le débat. La planète, elle, ne joue pas au volley. On se retrouvera au prochain sommet. En même temps."
        },
        {
          "s": "narrator",
          "t": "Sous le cri de l'ara, Le Capitaine plante sa tronçonneuse comme un drapeau. Les Jeux du Sommet n'oublieront pas cette clairière en feu. Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "cygne",
          "t": "Le sport propre, dopé juste ce qu'il faut, a tenu debout. La forêt vous survivra, Capitaine. J'y veillerai. En même temps."
        },
        {
          "s": "capitaine",
          "t": "Volé chez MOI par un cygne sous carburant ! Le monde à l'envers. Mais je reviendrai. Avec deux tronçonneuses. Et l'ara. Il t'aime pas non plus."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    }
  ],
  "faucon": [
    {
      "act": 1,
      "title": "L'ami de l'est, le binôme de l'ouest",
      "sub": "Levantie–Bharatie · double de sécurité",
      "left": "faucon",
      "right": "gourou",
      "ally": "dorf",
      "right2": "volkoi",
      "terrain": 6,
      "mode": "2v2",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Citadelle du Levant. Le Faucon prend le Baron comme partenaire contre le Gourou et le Tsar. Un 2v2 où la sécurité joue à quatre."
        },
        {
          "s": "faucon",
          "t": "Baron : tu es mon partenaire. Tu parles moins, tu digues plus. C'est l'alliance."
        },
        {
          "s": "dorf",
          "t": "Je digue ET je parle. Meilleur des deux mondes. On va écraser le calme et le gel !"
        },
        {
          "s": "gourou",
          "t": "Namasté. Mon partenaire hiver et moi, on a le temps. Vous avez le bruit."
        },
        {
          "s": "volkoi",
          "t": "Je n'aime pas être partenaire. Je tolère. Digue, moine."
        },
        {
          "s": "narrator",
          "t": "Sécurité contre patience. Le double décide qui tient la ligne."
        }
      ],
      "win": [
        {
          "s": "faucon",
          "t": "Ligne tenue. Partenaire bruyant, résultat propre."
        },
        {
          "s": "dorf",
          "t": "ÉNORME alliance ! Je t'avais dit que j'étais le meilleur partenaire !"
        },
        {
          "s": "gourou",
          "t": "Un set. On respire, on revient."
        },
        {
          "s": "volkoi",
          "t": "Temporaire. Même en double, le froid revient seul."
        }
      ],
      "lose": [
        {
          "s": "gourou",
          "t": "Le calme à deux a suffi. Rentrez sécuriser autre chose."
        },
        {
          "s": "volkoi",
          "t": "Le gel partenaire a tranché. Votre alliance a parlé trop fort."
        },
        {
          "s": "faucon",
          "t": "Revanche. Moins de slogans, Baron."
        },
        {
          "s": "dorf",
          "t": "C'était pas moi ! C'était le filet ! Et le zen !"
        }
      ]
    },
    {
      "act": 1,
      "title": "Le capitaine et le rempart",
      "sub": "Levantie–Tropicalia · fraternité des durs",
      "left": "faucon",
      "right": "capitaine",
      "terrain": 7,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Clairière de jungle dorée, court en terre rouge, un ara braille dans la canopée. Deux hommes à poigne se reconnaissent de loin."
        },
        {
          "s": "capitaine",
          "t": "Le Faucon ! Enfin un type qui ne me fait pas la leçon sur les droits du filet. Tope là, mon frère de rempart."
        },
        {
          "s": "faucon",
          "t": "On me fait la leçon depuis quarante ans, Capitaine. J'ai arrêté d'écouter avant toi."
        },
        {
          "s": "capitaine",
          "t": "Moi je défriche, toi tu bâtirais un rempart. Deux façons de dire : chez moi, on ne rentre pas."
        },
        {
          "s": "faucon",
          "t": "Sauf que ta forêt repousse. Mes remparts, non : je les rebâtis moi-même, plus haut, chaque nuit."
        },
        {
          "s": "capitaine",
          "t": "Alors montre-moi ce fameux piqué. Ici on aime les prédateurs, ça fait bon effet à la télé."
        }
      ],
      "win": [
        {
          "s": "faucon",
          "t": "Sympathique, brutal, imprévisible. Un bon voisin de tranchée. Mais un rempart ne s'appuie sur personne."
        },
        {
          "s": "capitaine",
          "t": "Battu par un oiseau ! Bon. Au moins c'est un dur. Reviens quand tu veux, on rôtira quelque chose."
        }
      ],
      "lose": [
        {
          "s": "capitaine",
          "t": "Ah ! La terre rouge tient bon face au grès. Le Capitaine reste debout, mon frère."
        },
        {
          "s": "faucon",
          "t": "Tu gagnes le set, pas la doctrine. Continue de défricher ; moi je continue de veiller."
        }
      ]
    },
    {
      "act": 1,
      "title": "Le contrat silencieux",
      "sub": "Levantie–Panguo · affaires sans amitié",
      "left": "faucon",
      "right": "timonier",
      "terrain": 4,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Cité du Matin, murs cramoisis et toits d'or, lions de pierre à l'entrée. Ici on ne se serre pas la main : on signe."
        },
        {
          "s": "timonier",
          "t": "Faucon. Tu vends tes armes à mes rivaux, tu m'achètes mon silicium. L'harmonie tolère la contradiction rentable."
        },
        {
          "s": "faucon",
          "t": "Je fais des affaires avec tout le monde et je ne fais confiance à personne. Nous nous comprenons, Timonier."
        },
        {
          "s": "timonier",
          "t": "Je contrôle le tempo, tu contrôles la panique. Chacun sa spécialité. Ne saute pas trop haut chez moi."
        },
        {
          "s": "faucon",
          "t": "Justement. Reste dans ton camp, je resterai poli. Mon Raid Éclair déteste les surprises."
        },
        {
          "s": "timonier",
          "t": "Menace un mur de patience avec ta vitesse. On verra ce qui s'érode le premier."
        }
      ],
      "win": [
        {
          "s": "faucon",
          "t": "Un partenaire glacial vaut mieux qu'un ami tiède. Le contrat tient. On ne se reverra qu'aux chiffres."
        },
        {
          "s": "timonier",
          "t": "Un revers logistique. Sans conséquence. L'harmonie recalcule et la Cité rouvre demain."
        }
      ],
      "lose": [
        {
          "s": "timonier",
          "t": "Le tempo l'emporte sur le piqué. La patience, jeune faucon, est aussi une arme longue portée."
        },
        {
          "s": "faucon",
          "t": "Tu gagnes une manche, je garde le fournisseur. En affaires, ça s'appelle un match nul rentable."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le protecteur transactionnel",
      "sub": "Levantie–Doria · le prix du parapluie",
      "left": "faucon",
      "right": "dorf",
      "terrain": 1,
      "mode": "flame",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Country Club Doré. Fontaine, palmiers, gazon parfait. Le grand parrain de l'ouest reçoit son protégé le plus intense. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "dorf",
          "t": "Le Faucon ! Mon meilleur ami. Le meilleur. On te protège tellement, tellement, tu ne peux même pas imaginer."
        },
        {
          "s": "faucon",
          "t": "Je n'imagine pas, Baron : je facture le risque. Ta protection est excellente les jours où elle t'arrange."
        },
        {
          "s": "dorf",
          "t": "Ingrat ! Sans mon Mur d'or, tu jouerais tout seul contre dix. Dis merci, et sers."
        },
        {
          "s": "faucon",
          "t": "Je dis merci et je garde mon Raid Éclair armé. Un parapluie, ça se referme sans prévenir."
        },
        {
          "s": "dorf",
          "t": "Personne ne referme mes parapluies ! Les plus beaux parapluies du monde. Terriblement solides."
        }
      ],
      "win": [
        {
          "s": "faucon",
          "t": "Voilà pourquoi je ne dépends de personne : même mon meilleur protecteur perd au filet. Note-le, Baron."
        },
        {
          "s": "dorf",
          "t": "Match truqué ! Enfin… beau piqué. On refera un deal. Le plus grand deal de volley de l'histoire."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "dorf",
          "t": "GAGNÉ ! Le Mur d'or ! Imprenable ! Même le faucon rebondit dessus, incroyable, les gens pleuraient."
        },
        {
          "s": "faucon",
          "t": "Profite. Mais souviens-toi : un protégé qui perd apprend à ne plus avoir besoin de protecteur."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "La leçon de morale",
      "sub": "Levantie–Gallardie · l'allié qui sermonne",
      "left": "faucon",
      "right": "cygne",
      "terrain": 8,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Citadelle du Levant. Grès chaud, dômes anciens, tours de verre, remparts. Au-dessus des créneaux, le faucon tourne et pique. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "cygne",
          "t": "Cher Faucon, en même temps que je vous soutiens, je dois vous dire, avec amitié, que la mesure serait plus sage."
        },
        {
          "s": "faucon",
          "t": "La mesure. On me la conseille depuis mon berceau, sur cette colline, face à cette mer. J'ai survécu à tous ceux qui la prêchaient."
        },
        {
          "s": "cygne",
          "t": "Soutien indéfectible ET fermeté sur le droit. Les deux. C'est ma doctrine : et-en-même-temps."
        },
        {
          "s": "faucon",
          "t": "Chez moi, Cygne, on ne dit pas 'en même temps'. On dit 'd'abord'. La sécurité d'abord, ton sermon après."
        },
        {
          "s": "cygne",
          "t": "Alors gardez votre 'd'abord'. Mon contre, lui, arrive toujours au bon moment."
        }
      ],
      "win": [
        {
          "s": "faucon",
          "t": "Beau discours, revers lent. Retiens la leçon, Cygne : on ne sermonne pas un rempart, on le contourne — ou on perd."
        },
        {
          "s": "cygne",
          "t": "En même temps, une défaite est une forme de dialogue. Nous reprendrons cette conversation. Poliment."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "cygne",
          "t": "Vous voyez ? La mesure marque des points. Élégamment. Sans un mot plus haut que l'autre."
        },
        {
          "s": "faucon",
          "t": "Tu gagnes un set sous mes remparts. Souviens-toi qui les a bâtis, et qui rentre chez lui avec la leçon."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "La ligne rouge du nord",
      "sub": "Levantie–Bourassie · déconfliction sous tension",
      "left": "faucon",
      "right": "volkoi",
      "terrain": 0,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Place Écarlate, sous la neige. Le ballon est un ballon enflammé à brûlure : le camp où elle tombe saute. Le Tsar joue à domicile, glacial."
        },
        {
          "s": "volkoi",
          "t": "Faucon. Tu voles au-dessus d'un ciel que je surveille aussi. Nous nous croisons souvent. Trop souvent."
        },
        {
          "s": "faucon",
          "t": "On se croise poliment, Tsar, parce qu'aucun de nous ne veut du chaos de l'autre. Appelons ça une méfiance professionnelle."
        },
        {
          "s": "volkoi",
          "t": "La méfiance, oui. Tu frappes tes cibles, j'observe. Un jour, ta ballon enflammé tombera trop près de mes intérêts."
        },
        {
          "s": "faucon",
          "t": "Alors ne te tiens pas sur ma ligne de tir. Mon Raid Éclair ne demande pas la permission ; il informe après."
        },
        {
          "s": "narrator",
          "t": "Renvoyez le ballon enflammé. Toujours. Sur cette place, l'hiver ne pardonne pas l'hésitation."
        }
      ],
      "win": [
        {
          "s": "faucon",
          "t": "La déconfliction tient tant que je gagne. Bien. Reste au chaud, Tsar. Je surveille le ciel pour deux."
        },
        {
          "s": "volkoi",
          "t": "Une manche. L'hiver est patient. Tu voles vite, mais tu dois te poser un jour. Je serai là."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "volkoi",
          "t": "Boum. De ton côté. Le sang-froid bat toujours la précipitation, petit faucon pressé."
        },
        {
          "s": "faucon",
          "t": "un ballon enflammé mal renvoyée n'efface pas la doctrine. La prochaine fois, je pique avant que tu observes."
        }
      ]
    },
    {
      "act": 3,
      "title": "L'armurier de l'ombre",
      "sub": "Levantie–Ryonganie · les fournisseurs de mes ennemis",
      "left": "faucon",
      "right": "bebe",
      "terrain": 3,
      "mode": "bomb",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé, granit brutaliste, radar qui pivote. La bombe est de retour. En face, un héritier qui vend à tout le monde ce qu'il ne devrait vendre à personne."
        },
        {
          "s": "bebe",
          "t": "Ha ! Le Faucon en personne ! Tu détestes mes fusées ? C'est que je les vends bien. À tes voisins, surtout."
        },
        {
          "s": "faucon",
          "t": "Je connais chaque caisse que tu expédies, Maréchal. Je connais les navires, les ports, les mains. Tu approvisionnes mes nuits blanches."
        },
        {
          "s": "bebe",
          "t": "Jaloux ! Mon radar voit tout, mon défilé impressionne tout, et mes clients paient comptant. Business is business, faucon."
        },
        {
          "s": "faucon",
          "t": "Ton radar voit tout sauf le piqué. Un fournisseur d'ennemis est un ennemi qui prétend rester neutre. Il n'y a pas de neutre."
        },
        {
          "s": "narrator",
          "t": "Sous le radar, la mèche se consume. Ne laissez pas la bombe côté grès."
        }
      ],
      "win": [
        {
          "s": "faucon",
          "t": "Un maillon de la chaîne cassé ce soir. Il en reste mille. Mais 'jamais deux fois' commence par une première fois."
        },
        {
          "s": "bebe",
          "t": "Tricheur ! Mon radar était en panne ! Sabotage ! … Bon. Reviens, j'ai un nouveau modèle à te montrer. Pas à vendre. À montrer."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "bebe",
          "t": "BOUM ! Défilé de la victoire ! Le petit Maréchal fait sauter le grand Faucon ! Rediffusion toute la semaine !"
        },
        {
          "s": "faucon",
          "t": "Savoure. Chaque caisse que tu expédies, je la retrouverai. Ce n'est pas une menace, Maréchal : c'est un inventaire."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le voisin qui monte",
      "sub": "Levantie–Bosforie · deux ambitions sur une même mer",
      "left": "faucon",
      "right": "sultan",
      "terrain": 5,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Pont des Deux Mondes, entre deux continents, dômes et barques sous les bannières. La bombe siffle. Le Sultan joue dopé : aura rouge, smash impérial."
        },
        {
          "s": "sultan",
          "t": "Faucon ! Tu te crois seul maître du Levant ? Deux ambitions, une seule mer. Ce soir, l'une des deux se noie."
        },
        {
          "s": "faucon",
          "t": "Tu joues les protecteurs des causes lointaines, Sultan, pour oublier tes propres remparts fissurés. Beau discours, mauvais calcul."
        },
        {
          "s": "sultan",
          "t": "Mes remparts tiennent l'histoire ! J'étais un empire quand tu n'étais qu'une garnison sur ta colline. Je défonce ton piqué au smash !"
        },
        {
          "s": "faucon",
          "t": "Les empires, ça se souvient. Ça ne joue pas. Reste dans ton camp : mon Raid Éclair réserve un traitement spécial aux nostalgiques."
        },
        {
          "s": "sultan",
          "t": "Spécial ? Sens l'aura rouge, faucon. Ce soir, je frappe pour deux continents et je ne rends pas la balle."
        }
      ],
      "win": [
        {
          "s": "faucon",
          "t": "La nostalgie ne renvoie pas les bombes. Ton empire est un musée, Sultan. Le mien est un poste de garde. Il veille encore."
        },
        {
          "s": "sultan",
          "t": "Une manche au faucon. Une seule ! La mer est vaste et ma mémoire longue. On se retrouvera sur ce pont."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "sultan",
          "t": "BOUM impérial ! Deux mondes ont tremblé et le faucon est tombé du ciel ! Grandiose ! Historique !"
        },
        {
          "s": "faucon",
          "t": "Tu gagnes un soir dopé. Le rouge s'éteint, la doctrine reste. Je reviendrai à froid, et à froid je ne rate pas."
        }
      ]
    },
    {
      "act": 3,
      "title": "La guerre de toute une vie",
      "sub": "Levantie–Ramenie · l'ennemi jamais serré la main · FINALE",
      "left": "faucon",
      "right": "safran",
      "terrain": 8,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Finale. Citadelle du Levant, remparts fermés. Au-dessus des créneaux, le faucon pique trois fois. En face, venu des hautes terres, l'ennemi de toujours qu'il n'a jamais affronté en face."
        },
        {
          "s": "safran",
          "t": "Nous voilà donc. Après tant d'années de proxys, de communiqués, de bombes échangées à distance… enfin le filet entre nous. Presque décevant de tomber si près."
        },
        {
          "s": "faucon",
          "t": "Rien de décevant, Safran. J'ai un dossier sur toi épais comme mes remparts. Chaque ligne dit la même chose : ne jamais te laisser sauter."
        },
        {
          "s": "safran",
          "t": "Et moi le même dossier sur toi, mesuré au gramme près. Deux hommes convaincus que l'autre prépare la fin du monde. L'un de nous a peut-être raison."
        },
        {
          "s": "faucon",
          "t": "Il n'y a pas de peut-être dans la sécurité. Il y a l'action, et le regret. J'ai choisi mon camp il y a quarante ans, sur cette colline."
        },
        {
          "s": "safran",
          "t": "Ton Raid Éclair contre mon Voile d'Or. La vitesse contre la patience. Frappe donc, faucon — je ralentis déjà le ciel au-dessus de ta citadelle."
        },
        {
          "s": "narrator",
          "t": "La mèche brûle sous les vieux dômes et les tours de verre. Pas de deuxième chance : le camp où la bombe retombe, saute avec sa forteresse."
        }
      ],
      "win": [
        {
          "s": "faucon",
          "t": "Quarante ans pour ce point. Le voile se déchire, la citadelle tient, le faucon reste maître de son ciel. La guerre ne finit pas — mais ce soir, elle attend."
        },
        {
          "s": "safran",
          "t": "Une manche à toi, faucon. Pas la partie. Nous sommes deux vieux fauves qui ne mourront que le jour où l'autre baissera la garde. Ce ne sera pas ce soir."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "safran",
          "t": "Le Voile d'Or a ralenti ton piqué juste assez. La bombe est tombée sur ton grès, Faucon. Même les remparts les plus hauts finissent par entendre le silence."
        },
        {
          "s": "faucon",
          "t": "Un soir. Un seul. Tu peux voiler mon ciel, jamais ma vigilance. Je rebâtirai les remparts plus haut cette nuit, comme chaque nuit, et je t'attendrai. Jamais deux fois."
        }
      ]
    }
  ],
  "safran": [
    {
      "act": 1,
      "title": "La table à quatre places",
      "sub": "Ramenie–Gallardie · double de protocole",
      "left": "safran",
      "right": "cygne",
      "ally": "sultan",
      "right2": "dorf",
      "terrain": 2,
      "mode": "2v2",
      "ai": 0,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses. Safran invite le Sultan en partenaire contre le Cygne et le Baron. La table des négociations devient un 2v2."
        },
        {
          "s": "safran",
          "t": "Sultan : tu es mon partenaire. On mesure, on digue, on leur rappelle les accords."
        },
        {
          "s": "sultan",
          "t": "Marché conclu. Je tiens le détroit du filet ; toi, tu ralentis leur orgueil."
        },
        {
          "s": "cygne",
          "t": "En même temps adversaire, en même temps… partenaire du Baron. C'est un exercice."
        },
        {
          "s": "dorf",
          "t": "Je suis le meilleur partenaire du Cygne ! Il paie enfin — en smashs !"
        },
        {
          "s": "narrator",
          "t": "Quatre autour du filet. La table, elle, reste toujours là."
        }
      ],
      "win": [
        {
          "s": "safran",
          "t": "Beau double. Le protocole a tenu mieux que leur alliance."
        },
        {
          "s": "sultan",
          "t": "Le marché est bon : notre camp marque. Porte ouverte — pour nous."
        },
        {
          "s": "cygne",
          "t": "Défaite de binôme. On renégocie. En même temps."
        },
        {
          "s": "dorf",
          "t": "Truqué ! Mon partenaire hésitait entre gauche et droite !"
        }
      ],
      "lose": [
        {
          "s": "cygne",
          "t": "Partenariat efficace, même improbable. Point pour nous."
        },
        {
          "s": "dorf",
          "t": "MEILLEUR 2v2 ! Dis-leur, rose !"
        },
        {
          "s": "safran",
          "t": "On recalibre. Les partenaires aussi se renégocient."
        },
        {
          "s": "sultan",
          "t": "La porte a claqué. On reviendra — ensemble."
        }
      ]
    },
    {
      "act": 1,
      "title": "Le poumon et le crocus",
      "sub": "Ramenie–Tropicalia · deux façons de brûler",
      "left": "safran",
      "right": "capitaine",
      "terrain": 9,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses. Le Capitaine débarque en rangers dans la roseraie, un peu perdu au milieu des arcades turquoise."
        },
        {
          "s": "capitaine",
          "t": "C'est quoi, tout ce parfum ? Chez moi, on abat la forêt pour faire pousser du bœuf. Ça, au moins, ça se mange."
        },
        {
          "s": "safran",
          "t": "Vous brûlez votre poumon pour un steak. Moi je récolte mon or fleur par fleur, à l'aube. Devinez lequel de nos deux commerces dure mille ans."
        },
        {
          "s": "capitaine",
          "t": "Mille ans ! Moi je pense au prochain trimestre, à la tronçonneuse ! Assez de poésie, on joue."
        },
        {
          "s": "safran",
          "t": "La poésie, justement, c'est ce qui reste quand la tronçonneuse a fini. Servez, Capitaine. Doucement : le paon dort."
        }
      ],
      "win": [
        {
          "s": "safran",
          "t": "Vous avez foncé, coupé, hurlé. Et la balle vous a attendus, tranquille, dans le voile doré. La forêt vous salue."
        },
        {
          "s": "capitaine",
          "t": "Bah ! Trop de fleurs, ça endort. Je préfère perdre debout dans ma boue rouge."
        }
      ],
      "lose": [
        {
          "s": "capitaine",
          "t": "La tronçonneuse bat le jardinier ! Bruta força, mon vieux fleuriste !"
        },
        {
          "s": "safran",
          "t": "Prenez votre point. Le jardin, lui, sera encore là quand votre trimestre sera oublié."
        }
      ]
    },
    {
      "act": 1,
      "title": "Deux vieux mondes",
      "sub": "Ramenie–Bharatie · le safran et l'ashram",
      "left": "safran",
      "right": "gourou",
      "terrain": 6,
      "mode": "volley",
      "ai": 1,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Stade Ashram, guirlandes de soucis orange. Deux des plus anciennes civilisations du monde se saluent — poliment, longuement."
        },
        {
          "s": "gourou",
          "t": "Namasté, ami du plateau. Vous m'achetez mon marché, je vous achète votre essence. Le commerce, c'est déjà de la méditation."
        },
        {
          "s": "safran",
          "t": "Vous êtes bien le seul, avec le Timonier, à me payer sans me faire la morale. Ça repose. Un client qui médite au lieu de sermonner."
        },
        {
          "s": "gourou",
          "t": "Je médite ET j'encaisse. Ma dévotion a un très bon taux de change. Mon endurance aussi : vous allez courir, ami."
        },
        {
          "s": "safran",
          "t": "Courir ? Voyons. Je vais plutôt ralentir. Le safran ne court pas : il infuse. Voile d'Or, et laissez le temps s'épaissir."
        }
      ],
      "win": [
        {
          "s": "safran",
          "t": "Deux vieux mondes, un seul vainqueur ce soir. Nous nous reverrons dans mille ans pour la revanche."
        },
        {
          "s": "gourou",
          "t": "Namasté. Le safran a infusé plus vite que ma méditation. Je note. Je reviens. Je respire."
        }
      ],
      "lose": [
        {
          "s": "gourou",
          "t": "L'endurance de l'ashram triomphe du voile doré. Om, et bon commerce quand même."
        },
        {
          "s": "safran",
          "t": "Beau point, ami. Notre thé refroidit ; nos empires, non. À la prochaine caravane."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le club des sanctionnés",
      "sub": "Ramenie–Bourassie · camaraderie de l'embargo",
      "left": "safran",
      "right": "volkoi",
      "terrain": 0,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Place Écarlate sous la neige. Deux habitués des listes noires de l'Ouest se retrouvent au filet, entre gens qui se comprennent. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "volkoi",
          "t": "Safran. On nous sanctionne tous les deux. On nous déteste tous les deux. Ça crée des liens, le mépris de l'Ouest."
        },
        {
          "s": "safran",
          "t": "Nous ne nous aimons pas, Tsar. Nous nous comprenons. C'est bien plus solide qu'une amitié. Et bien moins cher à entretenir."
        },
        {
          "s": "volkoi",
          "t": "Je gèle, tu ralentis. Le froid et le miel. L'Ouest transpire entre les deux."
        },
        {
          "s": "safran",
          "t": "Vous figez d'un coup ; moi je laisse mariner. Deux écoles de la patience. Servez, camarade — je vous préviens que le miel colle."
        }
      ],
      "win": [
        {
          "s": "safran",
          "t": "Le miel a été plus lent que votre glace, et pourtant j'y suis arrivé le premier. Curieux, la patience."
        },
        {
          "s": "volkoi",
          "t": "Hm. Bien joué, Safran. On reste dans le même club. J'apporte la vodka, tu apportes le thé."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "volkoi",
          "t": "Le froid l'emporte sur le miel. Comme prévu. La glace, elle, n'attend jamais."
        },
        {
          "s": "safran",
          "t": "Gardez ce point, Tsar. Entre sanctionnés, on ne se compte plus les défaites. On se compte les hivers."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Le client idéal",
      "sub": "Ramenie–Panguo · l'or contre le silence",
      "left": "safran",
      "right": "timonier",
      "terrain": 4,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Cité du Matin, lanternes rouges. Le meilleur client du Safran l'accueille — celui qui paie rubis sur l'ongle et ne demande jamais rien. Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        },
        {
          "s": "timonier",
          "t": "Je t'achète ton safran, ton essence, ton pétrole. Je paie à l'heure. Et je ne pose aucune question. C'est ça, l'harmonie."
        },
        {
          "s": "safran",
          "t": "Un client qui paie et se tait : dans ce roster, c'est un miracle. Les autres m'achètent des sermons ; vous, du silence. Précieux."
        },
        {
          "s": "timonier",
          "t": "Je contrôle le tempo du monde. Toi celui du plateau. Deux patiences ne devraient pas s'affronter."
        },
        {
          "s": "safran",
          "t": "Elles devraient s'admirer. Mais admirons-nous en jouant : voyons quelle patience place la balle en premier. Voile d'Or."
        }
      ],
      "win": [
        {
          "s": "safran",
          "t": "Deux remparts de patience, et c'est la mienne qui a tenu. Continuez d'acheter, Timonier. Le safran monte encore."
        },
        {
          "s": "timonier",
          "t": "Un revers mineur dans un très long calendrier. J'ai le temps. Toi aussi. On se revend ça demain."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ],
      "lose": [
        {
          "s": "timonier",
          "t": "Le tempo, toujours le tempo. Mon rempart était plus lent que ton voile, et plus haut."
        },
        {
          "s": "safran",
          "t": "Belle patience, client fidèle. Vous gagnez le set ; moi je garde le contrat. Chacun son or."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 2,
      "title": "Deux fiertés sur un détroit",
      "sub": "Ramenie–Bosforie · rivalité des empires voisins",
      "left": "safran",
      "right": "sultan",
      "terrain": 5,
      "mode": "flame",
      "ai": 2,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Pont des Deux Mondes. Deux héritiers d'empires immenses se toisent — et le ballon, cette fois, est un ballon enflammé à brûlure."
        },
        {
          "s": "sultan",
          "t": "Mon empire régnait quand le tien s'endormait dans ses roses. Je défonce, je smashe, je m'étends. Toi, tu infuses."
        },
        {
          "s": "safran",
          "t": "Le vôtre s'est effondré en une génération, Sultan. Le mien dure depuis l'aube du monde. On ne mesure pas la même chose, vous et moi."
        },
        {
          "s": "sultan",
          "t": "Grandiloquence contre nostalgie ! Le détroit est à moi, la région est à moi, la brûlure brûle pour toi."
        },
        {
          "s": "safran",
          "t": "Elle brûle pour celui qui s'agite. Moi je ralentis. Renvoyez cette ballon enflammé doucement, Sultan — la précipitation fait de très beaux cratères."
        },
        {
          "s": "narrator",
          "t": "Ne gardez pas le ballon enflammé. Renvoyez. Le voile doré rend chaque geste plus lent qu'il n'y paraît."
        }
      ],
      "win": [
        {
          "s": "safran",
          "t": "Vous avez voulu défoncer. Le voile a épaissi l'air, la brûlure a fait le reste. La patience désamorce ce que l'orgueil allume."
        },
        {
          "s": "sultan",
          "t": "Un cratère de mon côté ! Impossible. Le détroit reste à moi, entends-tu ? Le détroit !"
        }
      ],
      "lose": [
        {
          "s": "sultan",
          "t": "BOUM ! De ton côté, fleuriste ! Deux continents m'admirent et un seul empire éclate ce soir : le tien."
        },
        {
          "s": "safran",
          "t": "Faites vibrer votre pont. Le mien n'a jamais eu besoin de deux rives pour tenir debout."
        },
        {
          "s": "narrator",
          "t": "Le ballon s’enflamme : chaque contact brûle — à zéro PV, le point est perdu."
        }
      ]
    },
    {
      "act": 3,
      "title": "Fraternité des parias",
      "sub": "Ramenie–Ryonganie · deux embargos, une tendresse",
      "left": "safran",
      "right": "bebe",
      "terrain": 3,
      "mode": "bomb",
      "ai": 3,
      "doped": null,
      "pre": [
        {
          "s": "narrator",
          "t": "Esplanade du Défilé, le radar tourne. Deux champions du monde de l'embargo se retrouvent — presque avec émotion. Le ballon est une bombe : le camp où elle tombe perd."
        },
        {
          "s": "bebe",
          "t": "Grand frère du plateau ! On nous sanctionne, on nous encercle, et on fanfaronne quand même ! On est pareils, toi et moi !"
        },
        {
          "s": "safran",
          "t": "Presque, petit Maréchal. Vous fanfaronnez ; moi je souris. Vous montrez vos fusées ; moi je cache mes crocus. Mais l'embargo, oui : c'est notre langue commune."
        },
        {
          "s": "bebe",
          "t": "Ma Batterie te cloue au sol, tu ne sauteras plus ! Applaudissez, applaudissez, le SUPER se charge !"
        },
        {
          "s": "safran",
          "t": "Sautez tant que vous voulez, moi je ralentis. Deux parias au filet, ce soir : au moins, personne ne viendra nous sermonner."
        }
      ],
      "win": [
        {
          "s": "safran",
          "t": "Le voile a été plus patient que votre batterie, petit frère. Restons soudés : le monde nous déteste, autant s'amuser ensemble."
        },
        {
          "s": "bebe",
          "t": "Perdu ! Mais contre toi, ça compte pas ! On est du même club, grand frère. Vive l'embargo !"
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ],
      "lose": [
        {
          "s": "bebe",
          "t": "VICTOIRE DU MARÉCHAL ! Même le safran plie devant ma Batterie ! On fêtera ça au défilé !"
        },
        {
          "s": "safran",
          "t": "Prenez votre point, jeune homme. Entre encerclés, la victoire de l'un console l'autre. C'est ça, la fraternité."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    },
    {
      "act": 3,
      "title": "Le mur d'or contre la roseraie",
      "sub": "Ramenie–Doria · la pression maximale",
      "left": "safran",
      "right": "dorf",
      "terrain": 9,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Jardin des Roses. Le Baron Dorf plante sa voiturette de golf dans la roseraie, klaxonne, et pose sur le filet une liasse d'embargos."
        },
        {
          "s": "dorf",
          "t": "Pression maximale ! La plus grande pression de l'histoire ! Tes petits alambics, je les ferme, et ton or safran, je le taxe. Fantastique !"
        },
        {
          "s": "safran",
          "t": "Vous bâtissez des murs d'or, Baron ; moi je cultive des roses. Devinez lequel de nous deux nourrit ses gens quand vient l'hiver."
        },
        {
          "s": "dorf",
          "t": "J'ai déchiré ton fameux Accord ! Déchiré ! Le plus beau déchirage jamais vu ! Maintenant paie, ou explose !"
        },
        {
          "s": "safran",
          "t": "Vous déchirez, vous klaxonnez, vous taxez. Beaucoup de bruit pour un homme si pressé. La bombe brûle, Baron. Et vous n'aimez pas attendre."
        },
        {
          "s": "narrator",
          "t": "L'aura rouge enveloppe le Baron : la pression maximale l'a dopé. Renvoyez la bombe. Le Voile d'Or est votre seule patience."
        }
      ],
      "win": [
        {
          "s": "safran",
          "t": "Tout ce mur d'or, et vous voilà au ralenti dans ma poussière dorée pendant que la mèche s'éteint chez vous. Le safran survit aux sanctions, Baron. Il les vieillit en bouteille."
        },
        {
          "s": "dorf",
          "t": "Truqué ! Le jardin est truqué, le paon est truqué, TOUT est truqué ! J'ajoute des sanctions ! Le double !"
        }
      ],
      "lose": [
        {
          "s": "dorf",
          "t": "BOUM chez le fleuriste ! Pression maximale, résultat maximal ! Personne ne fait exploser les roses comme moi !"
        },
        {
          "s": "safran",
          "t": "Emportez votre cratère et votre klaxon, Baron. Vous fermez mes ateliers ce soir ; ils rouvriront quand vous serez oublié. Le safran a l'éternité pour lui."
        }
      ]
    },
    {
      "act": 3,
      "title": "L'ombre et le raid",
      "sub": "Ramenie–Levantie · le grand duel du berceau du monde",
      "left": "safran",
      "right": "faucon",
      "terrain": 8,
      "mode": "bomb",
      "ai": 3,
      "doped": "R",
      "pre": [
        {
          "s": "narrator",
          "t": "Citadelle du Levant, un faucon tournoie au-dessus des remparts. Deux fiertés du même berceau, deux ennemis de toujours. La finale. La bombe."
        },
        {
          "s": "faucon",
          "t": "Je te surveille depuis toujours, Safran. Tes alambics, tes proxys, tes ombres. Je frappe vite, je frappe fort, je frappe le premier."
        },
        {
          "s": "safran",
          "t": "Vous voyez un ennemi dans chaque ombre, Faucon. Ça doit être épuisant, cette vigilance. Moi je n'ai qu'un adversaire — vous. Ça me laisse du temps pour les roses."
        },
        {
          "s": "faucon",
          "t": "Le temps ! Toujours le temps ! Pendant que tu récites tes quatrains, je démantèle tes ateliers en un raid éclair."
        },
        {
          "s": "safran",
          "t": "Vous frappez pour hier, Faucon. Moi je réponds pour dans cent ans. Voyons laquelle de nos deux mémoires tient le plus longtemps sur ce terrain."
        },
        {
          "s": "faucon",
          "t": "Assez de poésie du plateau. Raid Éclair : tu ne sauteras plus. La citadelle jugera."
        },
        {
          "s": "narrator",
          "t": "Deux auras rouges au-dessus des remparts : le vieux conflit les dope tous les deux. Renvoyez la bombe. Ici, la patience affronte enfin la vitesse."
        }
      ],
      "win": [
        {
          "s": "safran",
          "t": "Vous avez frappé vite, Faucon. Si vite que vous n'avez pas vu le voile d'or épaissir l'air. La mèche s'est éteinte de votre côté. La patience gagne le siècle, pas le raid."
        },
        {
          "s": "faucon",
          "t": "Ce n'est qu'un round. Ce conflit-là ne se règle pas en trois sets, Safran. Il ne se règle jamais."
        },
        {
          "s": "safran",
          "t": "Je sais. C'est pour ça que j'ai planté des roses. Elles, au moins, refleurissent chaque année. À la prochaine ombre, Faucon."
        }
      ],
      "lose": [
        {
          "s": "faucon",
          "t": "Le raid éclair désamorce la patience. Tes ateliers sont à terre, Safran, et ta roseraie avec. Frappé le premier, comme toujours."
        },
        {
          "s": "safran",
          "t": "Frappez, Faucon, frappez. Vous gagnez ce soir et vous recommencerez demain, épuisé, à guetter l'ombre. Moi je rentre tailler mes roses. Elles refleuriront bien avant que vous dormiez."
        },
        {
          "s": "narrator",
          "t": "Le ballon est une bombe : le camp où elle tombe perd."
        }
      ]
    }
  ]
};
