#!/usr/bin/env python3
"""Casting FICTIONNALISÉ (Option A de FICTIONNALISATION.md) — données seules.

Archétypes satiriques, nations INVENTÉES, traits volontairement composites
(jamais le portrait 1:1 d'une personne réelle nommable). Clés internes
inchangées (dossiers assets/). Consommé par build_prompts.py.
"""

# key = clé technique (dossier assets/, roster) · name/nation = fiction ·
# look = description d'apparence injectée dans les prompts (archétype, pas un vrai nom).
CHARACTERS = [
    {"key": "vladou", "name": "Tsar Volkoï", "nation": "Bourassie",
     "look": "a short stocky barrel-chested eastern-bloc autocrat mascot, completely "
             "bald shiny head (head height ≈ ONE THIRD of full body crown-to-shoes — "
             "NOT half the body, NOT an oversized balloon skull; same head scale every "
             "pose), pale skin, cold steely stare, ALWAYS wearing a deep "
             "burgundy standing-collar wool overshirt (buttoned, NOT a tracksuit, NOT "
             "athletic jogging wear) over a black turtleneck, charcoal trousers, black "
             "leather shoes — NOT a tracksuit, NOT a military uniform, NOT an open dress shirt"},
    {"key": "trompette", "name": "Baron Dorf", "nation": "Doria",
     "look": "a boastful tycoon-turned-leader mascot, stocky chibi build, platinum-cream "
             "blond hair in a voluminous ASYMMETRIC wave swept to one side (NOT a classic "
             "comb-over bouffant), warm golden tan WITHOUT orange spray-tan skin, ALWAYS "
             "wearing an oversized navy business suit with wide cartoon lapels and shiny "
             "gold buttons, cream dress shirt, SHORT gold necktie OR champagne pocket square "
             "(NEVER a long bright-red necktie), black dress shoes, open-handed deal-maker "
             "gesture energy (raised index or open palms — NEVER a permanent thumbs-up)"},
    {"key": "micron", "name": "Le Cygne", "nation": "Gallardie",
     "look": "a slim young technocrat leader mascot, slicked-back dark hair, sharp navy "
             "tailored suit, small tricolor lapel pin, assured debating gesture"},
    {"key": "bebe", "name": "Maréchal Bébé", "nation": "Ryonganie",
     "look": "a chubby young dynastic heir-marshal mascot, glossy jet-black BOWL-CUT hair "
             "(straight fringe across the forehead), plump soft cheeks, tiny smug smile, "
             "dark grey plain Mao-style tunic with mandarin collar and no lapels, black "
             "trousers — NOT an older emperor, NOT swept-back hair, NOT a western suit"},
    {"key": "panda", "name": "Le Grand Timonier", "nation": "Panguo",
     "look": "an older round-jowled impassive emperor-leader mascot, high forehead with "
             "thin swept-back black hair (side part, NO bowl cut, NO fringe), heavy calm "
             "half-lidded eyes, charcoal Zhongshan jacket with four flap pockets and a "
             "single small red lapel pin, black trousers, stoic controlled expression — "
             "NOT a young chubby heir, NOT a glossy bowl cut, NOT a plain grey Mao tunic "
             "without pockets"},
    {"key": "sultan", "name": "Le Sultan", "nation": "Bosforie",
     "look": "a stern imposing neo-sultan leader mascot, thick dark mustache, dark tailored "
             "suit, broad commanding stance"},
    {"key": "yogi", "name": "Le Gourou", "nation": "Bharatie",
     "look": "a lean ascetic guru-manager leader mascot, short white beard, round glasses, "
             "saffron-orange sleeveless vest over a white tunic, serene intense eyes"},
    {"key": "jair", "name": "Le Capitaine", "nation": "Tropicalia",
     "look": "a stocky ex-military populist captain mascot, short dark hair, olive-green "
             "military-style jacket, rugged toothy grin"},
    {"key": "faucon", "name": "Le Faucon", "nation": "Levantie",
     "look": "a stern hardliner elder-statesman mascot, mostly bald head with short "
             "close-cropped grey side hair, thick grey eyebrows and a neat grey mustache, "
             "stocky square-jawed build, slate-grey double-breasted suit with a burgundy "
             "tie and a small plain silver pin, rigid arms-crossed stance "
             "(GENERIC composite hardliner — must NOT resemble any real leader; "
             "no national colors, no religious garb or symbols)"},
    {"key": "safran", "name": "Le Safran", "nation": "Ramenie",
     "look": "a composed highland-capital premier mascot, neatly trimmed dark beard, "
             "salt-and-pepper hair, charcoal tailored suit with a saffron-orange pocket "
             "square, calm measured stance (composite archetype, NO clerical robes, "
             "turbans, or religious symbols)"},
]

# Maps : terrainKey = TERRAINS[].key (mapping historique) · theme = décor abstrait,
# AUCUN vrai drapeau/monument/symbole national — silhouettes abstraites seulement.
MAPS = [
    {"key": "neige",    "char": "vladou",    "name": "Place Écarlate",
     "theme": "a monumental snowy crimson-brick rectangular fortress palace with "
              "flat snow-covered roofs and square towers (cream trim); at most ONE "
              "distant plain dark-red bulb silhouette in solid single color — NO "
              "cathedral, NO Saint Basil, NO Kremlin, NO candy-stripe or spiral "
              "multicolored domes; crenellated walls, plain blue/green parade "
              "banners on poles (no real flags), frosted lamp posts, bare snowy "
              "trees, packed white snow volleyball court (empty, no ice rink, no "
              "vehicles), pale grey overcast winter sky"},
    {"key": "plage",    "char": "trompette", "name": "Country Club Doré",
     "theme": "a golden luxury seaside country-club resort: a long cream-and-gold clubhouse "
              "with striped awnings and palm-lined terraces, ONE rectangular gilded-glass "
              "hotel tower with a FLAT top (a boxy modern high-rise), a marble fountain, "
              "manicured green lawns and clipped hedges, tall palm trees; NO White House, NO "
              "neoclassical dome or columned portico, NO US Capitol, NO Statue of Liberty, NO "
              "Eiffel tower, NO tapered lattice/iron spire of any kind; no real US flags; flat "
              "pale sand volleyball court with painted lines, bright sunny blue sky (empty, no "
              "cars, no people, no boats)"},
    {"key": "prairie",  "char": "micron",    "name": "Palais du Coq",
     "theme": "a grand neoclassical palace courtyard, a slender ornamental stone spire far in "
              "the distance (abstract, NOT the Eiffel tower), formal hedges, pigeons, blue sky"},
    {"key": "parade",   "char": "bebe",      "name": "Esplanade du Défilé",
     "theme": "a vast monumental parade esplanade: plain grey-beige brutalist government "
              "towers, a wide tiered granite grandstand, ONE plain abstract triumphal arch, "
              "tall solid-color banners on poles (no real flags); NO giant leader portraits, "
              "NO state emblems or seals, NO ranks of marching people; a broad empty flagstone "
              "volleyball court with painted lines, flat overcast grey sky (empty, no crowds, "
              "no vehicles)"},
    {"key": "matin",    "char": "panda",     "name": "Cité du Matin",
     "theme": "an imperial red-walled palace plaza at dawn: long crimson walls with sweeping "
              "golden-tiled hip roofs and upturned eaves, ONE plain ceremonial gate (abstract, "
              "NO portrait over it, NOT Tiananmen), rows of red lanterns on posts, a pair of "
              "stone guardian-lion statues, soft misty morning light; NO real Forbidden City, "
              "NO Great Wall, no real flags or emblems; pale stone volleyball court with "
              "painted lines (empty, no people, no vehicles)"},
    {"key": "bosphore", "char": "sultan",    "name": "Pont des Deux Mondes",
     "theme": "a strait-side palace between two continents, abstract domed silhouettes and "
              "slender towers, small boats on the water, warm dusk light"},
    {"key": "ashram",   "char": "yogi",      "name": "Stade Ashram",
     "theme": "a sunbaked honey-sandstone stadium beside an ornate palace: tiered sandstone "
              "stands, a palace facade with scalloped arches and small jharokha balconies "
              "(abstract, NOT the Taj Mahal, NO white marble domed mausoleum), marigold-orange "
              "garlands strung on poles, tall palm trees, hazy heat shimmer; NO temple idols "
              "or religious symbols, no real flags; warm clay volleyball court with painted "
              "lines, bright hazy sky (empty, no people, no animals, no vehicles)"},
    {"key": "amazon",   "char": "jair",      "name": "Grande Forêt",
     "theme": "a golden rainforest clearing: dense layered jungle canopy in warm greens, a "
              "distant plain rounded stone hill, wooden lodge huts on stilts at the sides, "
              "lush ferns and hanging vines, warm humid golden light; NO Christ the Redeemer "
              "statue, NO giant figure with outstretched arms on a hill, no real flags or "
              "emblems; packed reddish-clay volleyball court with painted lines (empty, no "
              "people, no animals, no vehicles)"},
    {"key": "colline",  "char": "faucon",    "name": "Citadelle du Levant",
     "theme": "a fortified pale-sandstone capital on a desert hilltop overlooking the "
              "Mediterranean sea, abstract old stone domes mixed with modern glass towers, "
              "crenellated ramparts, palm trees, harsh bright midday sun (no real flags, "
              "monuments or religious symbols)"},
    {"key": "roseraie", "char": "safran",    "name": "Jardin des Roses",
     "theme": "a sunlit highland palace rose garden: turquoise-tiled arcades and pointed "
              "brick arches (abstract, NOT any real monument), rows of rose beds and tall "
              "cypress trees, a central reflecting pool, saffron-ochre walls, distant hazy "
              "mountains, warm golden afternoon light (no real flags, crescents, monuments "
              "or religious symbols)"},
]
