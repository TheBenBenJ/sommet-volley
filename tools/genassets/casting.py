#!/usr/bin/env python3
"""Casting FICTIONNALISÉ (Option A de FICTIONNALISATION.md) — données seules.

Archétypes satiriques, nations INVENTÉES, traits volontairement composites
(jamais le portrait 1:1 d'une personne réelle nommable). Clés internes
inchangées (dossiers assets/). Consommé par build_prompts.py.
"""

# key = clé technique (dossier assets/, roster) · name/nation = fiction ·
# look = description d'apparence injectée dans les prompts (archétype, pas un vrai nom).
CHARACTERS = [
    # Looks = archétypes COMPOSITES (Steam). Exagérer le chibi ; mash-up facial ;
    # JAMAIS le portrait 1:1 d'un dirigeant réel. Tenue = LOCK pour gen.
    {"key": "volkoi", "name": "Tsar Volkoï", "nation": "Bourassie",
     "look": "COMPOSITE eastern-bloc autocrat mascot (mash-up, NOT a real person), "
             "short stocky barrel body, chibi head ≈ 1/3 body height, ROUND softer skull "
             "(NOT a long rectangular real-politician head), pale cool skin, SMALL narrow "
             "ice-blue eyes set wide apart, THICK straight brow ridge, short broad nose, "
             "thin unsmiling mouth, NO facial hair, completely bald with a subtle purple "
             "scalp sheen, ALWAYS deep burgundy buttoned standing-collar wool overshirt "
             "over black turtleneck, charcoal trousers, black leather shoes — NOT tracksuit, "
             "NOT military medals, NOT open dress shirt"},
    {"key": "dorf", "name": "Baron Dorf", "nation": "Doria",
     "look": "COMPOSITE boastful tycoon-leader caricature in the SAME polished game style "
             "as the rest of the roster (clean thick outlines, cel shading, adult satire — "
             "NOT cute toddler mascot, NOT rosy cheeks, NOT buck teeth, NOT kindergarten art), "
             "stocky chibi-lite build, confident smug smirk, sharp small blue eyes, strong "
             "jaw softened into mash-up (NOT a photo likeness of any real tycoon), "
             "platinum-cream blond hair in a voluminous ASYMMETRIC side-wave (NOT classic "
             "comb-over), warm golden-tan skin WITHOUT orange spray-tan, ALWAYS navy business "
             "suit with gold buttons, cream shirt, SHORT gold necktie (NEVER long bright-red "
             "tie), white pocket square, black dress shoes, hands in pockets or open deal "
             "gesture — NEVER permanent thumbs-up"},
    {"key": "cygne", "name": "Le Cygne", "nation": "Gallardie",
     "look": "COMPOSITE young technocrat mascot (mash-up, NOT a real person), slim chibi "
             "build, OVAL face with slightly oversized forehead, soft jaw (NOT a photo "
             "likeness), short wavy dark hair with a SIDE PART (NOT slicked-back wet look), "
             "round wire glasses optional thin frames, bright curious eyes, small polite "
             "smile, ALWAYS sharp navy tailored suit, white shirt, navy tie, ONE tiny plain "
             "gold circle lapel pin (NO national flag colors, NO tricolor), black shoes"},
    {"key": "bebe", "name": "Maréchal Bébé", "nation": "Ryonganie",
     "look": "COMPOSITE chubby dynastic heir-marshal mascot (mash-up, NOT a real person), "
             "VERY round moon face, glossy jet-black BOWL-CUT with thick straight fringe, "
             "tiny dot eyes, tiny smug smile, soft double chin, ALWAYS dark grey plain "
             "mandarin-collar tunic without medals or stars, black trousers — NOT older "
             "emperor, NOT swept-back hair, NOT western suit"},
    {"key": "timonier", "name": "Le Grand Timonier", "nation": "Panguo",
     "look": "COMPOSITE older impassive emperor-leader mascot (mash-up, NOT a real person), "
             "ROUND heavy jowls, HIGH forehead, thin swept-back black hair with side part "
             "(NO bowl cut), calm HALF-LIDDED eyes set in soft cartoon wrinkles, ALWAYS "
             "charcoal Zhongshan jacket with four flap pockets and one SMALL plain red "
             "dot pin (NO stars, NO real emblems), black trousers — NOT young chubby heir"},
    {"key": "sultan", "name": "Le Sultan", "nation": "Bosforie",
     "look": "COMPOSITE imposing neo-sultan leader mascot (mash-up, NOT a real person), "
             "SQUARE cartoon jaw, THICK dark mustache that is slightly UPSWEPT (stylized, "
             "not photo-real), heavy brows, deep-set eyes, ALWAYS dark charcoal tailored "
             "suit with subtle burgundy pocket square, white shirt, dark tie, broad "
             "commanding stance — NO fez, NO religious garb, NO national flag colors"},
    {"key": "gourou", "name": "Le Gourou", "nation": "Bharatie",
     "look": "COMPOSITE lean ascetic guru-manager mascot (mash-up, NOT a real person), "
             "narrow face, short NEAT white beard, ROUND cartoon glasses, calm intense "
             "eyes, ALWAYS saffron-orange sleeveless vest over white tunic and white "
             "trousers — NO religious symbols, NO turbans, NO real party badges"},
    {"key": "capitaine", "name": "Le Capitaine", "nation": "Tropicalia",
     "look": "COMPOSITE stocky populist captain mascot (mash-up, NOT a real person), "
             "SQUARE friendly face, short dark hair with a slight curl, thick brows, "
             "WIDE toothy cartoon grin, ALWAYS olive-green utility jacket (no rank "
             "insignia), dark trousers, rugged boots — NOT a photo likeness of any leader"},
    {"key": "faucon", "name": "Le Faucon", "nation": "Levantie",
     "look": "COMPOSITE stern hardliner elder mascot (mash-up, NOT a real person), "
             "mostly bald with short grey side hair, THICK grey brows, neat grey "
             "mustache, stocky square build, ALWAYS slate-grey double-breasted suit, "
             "burgundy tie, tiny plain silver pin — NO national colors, NO religious garb"},
    {"key": "safran", "name": "Le Safran", "nation": "Safranie",
     "look": "COMPOSITE highland-capital premier mascot (mash-up, NOT a real person), "
             "neatly trimmed dark beard, salt-and-pepper hair, calm oval face, ALWAYS "
             "charcoal tailored suit with saffron-orange pocket square — NO clerical "
             "robes, turbans, or religious symbols"},
]

# Maps : terrainKey = TERRAINS[].key (mapping historique) · theme = décor abstrait,
# AUCUN vrai drapeau/monument/symbole national — silhouettes abstraites seulement.
MAPS = [
    {"key": "place-ecarlate",    "char": "volkoi",    "name": "Place Écarlate",
     "theme": "a monumental snowy crimson-brick rectangular fortress palace with "
              "flat snow-covered roofs and square towers (cream trim); at most ONE "
              "distant plain dark-red bulb silhouette in solid single color — NO "
              "cathedral, NO Saint Basil, NO Kremlin, NO candy-stripe or spiral "
              "multicolored domes; crenellated walls, plain blue/green parade "
              "banners on poles (no real flags), frosted lamp posts, bare snowy "
              "trees, packed white snow volleyball court (empty, no ice rink, no "
              "vehicles), pale grey overcast winter sky"},
    {"key": "country-club-dore",    "char": "dorf", "name": "Country Club Doré",
     "theme": "a golden luxury seaside country-club resort: a long cream-and-gold clubhouse "
              "with striped awnings and palm-lined terraces, ONE rectangular gilded-glass "
              "hotel tower with a FLAT top (a boxy modern high-rise), a marble fountain, "
              "manicured green lawns and clipped hedges, tall palm trees; NO White House, NO "
              "neoclassical dome or columned portico, NO US Capitol, NO Statue of Liberty, NO "
              "Eiffel tower, NO tapered lattice/iron spire of any kind; no real US flags; flat "
              "pale sand volleyball court with painted lines, bright sunny blue sky (empty, no "
              "cars, no people, no boats)"},
    {"key": "palais-gallard",  "char": "cygne",    "name": "Palais Gallard",
     "theme": "a grand neoclassical palace courtyard, a slender ornamental stone spire far in "
              "the distance (abstract, NOT the Eiffel tower), formal hedges, pigeons, blue sky"},
    {"key": "esplanade-du-defile",   "char": "bebe",      "name": "Esplanade du Défilé",
     "theme": "a vast monumental parade esplanade: plain grey-beige brutalist government "
              "towers, a wide tiered granite grandstand, ONE plain abstract triumphal arch, "
              "tall solid-color banners on poles (no real flags); NO giant leader portraits, "
              "NO state emblems or seals, NO ranks of marching people; a broad empty flagstone "
              "volleyball court with painted lines, flat overcast grey sky (empty, no crowds, "
              "no vehicles)"},
    {"key": "cite-du-matin",    "char": "timonier",     "name": "Cité du Matin",
     "theme": "an imperial red-walled palace plaza at dawn: long crimson walls with sweeping "
              "golden-tiled hip roofs and upturned eaves, ONE plain ceremonial gate (abstract, "
              "NO portrait over it, NOT Tiananmen), rows of red lanterns on posts, a pair of "
              "stone guardian-lion statues, soft misty morning light; NO real Forbidden City, "
              "NO Great Wall, no real flags or emblems; pale stone volleyball court with "
              "painted lines (empty, no people, no vehicles)"},
    {"key": "pont-des-deux-mondes", "char": "sultan",    "name": "Pont des Deux Mondes",
     "theme": "a sunlit sandstone palace courtyard with twin colonnaded wings, central "
              "tiered round tower with plain gold cupola (abstract — NOT Hagia Sophia, "
              "NOT Blue Mosque, NO crescents, NO real flags), cypress alleys, terracotta "
              "pots, geometric garden path, packed sandy volleyball court with white lines, "
              "clear blue sky; 100% static décor"},
    {"key": "stade-ashram",   "char": "gourou",      "name": "Stade Ashram",
     "theme": "a sunbaked honey-sandstone stadium beside an ornate palace: tiered sandstone "
              "stands, a palace facade with scalloped arches and small jharokha balconies "
              "(abstract, NOT the Taj Mahal, NO white marble domed mausoleum), marigold-orange "
              "garlands strung on poles, tall palm trees, hazy heat shimmer; NO temple idols "
              "or religious symbols, no real flags; warm clay volleyball court with painted "
              "lines, bright hazy sky (empty, no people, no animals, no vehicles)"},
    {"key": "grande-foret",   "char": "capitaine",      "name": "Grande Forêt",
     "theme": "a golden rainforest clearing: dense layered jungle canopy in warm greens, a "
              "distant plain rounded stone hill, wooden lodge huts on stilts at the sides, "
              "lush ferns and hanging vines, warm humid golden light; NO Christ the Redeemer "
              "statue, NO giant figure with outstretched arms on a hill, no real flags or "
              "emblems; packed reddish-clay volleyball court with painted lines (empty, no "
              "people, no animals, no vehicles)"},
    {"key": "citadelle-du-levant",  "char": "faucon",    "name": "Citadelle du Levant",
     "theme": "a fortified pale-sandstone capital on a desert hilltop overlooking the "
              "Mediterranean sea, abstract old stone domes mixed with modern glass towers, "
              "crenellated ramparts, palm trees, harsh bright midday sun (no real flags, "
              "monuments or religious symbols)"},
    {"key": "jardin-des-roses", "char": "safran",    "name": "Jardin des Roses",
     "theme": "a sunlit highland palace rose garden: turquoise-tiled arcades and pointed "
              "brick arches (abstract, NOT any real monument), rows of rose beds and tall "
              "cypress trees, a central reflecting pool, saffron-ochre walls, distant hazy "
              "mountains, warm golden afternoon light (no real flags, crescents, monuments "
              "or religious symbols)"},
]
