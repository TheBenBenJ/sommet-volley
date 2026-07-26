// sommet-volley · sprites (images PNG) — chargement asynchrone, fallback canvas
"use strict";

const SPRITES = {
  ballPurple: null,      // ballon volley violet / crème
  ballGold: null,        // cosmétique tournoi — or
  ballNight: null,       // cosmétique tournoi — nuit
  ballCream: null,       // cosmétique tournoi — crème
  ballFlame: [null, null, null, null], // mode Ballon enflammé — stages 0..3
  fxFlameFeet: [null, null, null],     // overlays feu pieds 0..2
  fxFlameBody: [null, null, null],     // overlays feu corps 0..2
  fxFlameHead: [null, null],           // overlays feu tête 0..1
  mapPlaceEcarlate: null,       // Place Écarlate (Volkoï)
  mapCountryClubDore: null,    // Country Club Doré (Dorf)
  mapPalaisGallard: null,       // Palais Gallard (Cygne)
  mapEsplanadeDuDefile: null,         // Esplanade du Défilé (Bébé)
  mapCiteDuMatin: null,        // Cité du Matin (Timonier)
  mapPontDesDeuxMondes: null,     // Pont des Deux Mondes (Sultan)
  mapStadeAshram: null,       // Stade Ashram (Gourou)
  mapGrandeForet: null,       // Grande Forêt (Capitaine)
  mapCitadelleDuLevant: null,      // Citadelle du Levant (Faucon)
  mapJardinDesRoses: null      // Jardin des Roses (Safran)
};

function loadSprite(path) {
  const img = new Image();
  // Anti-cache navigateur / CDN : les PNG ne passent pas par le ?v= des <script>.
  // GAME_VERSION change à chaque deploy → les nouvelles poses remplacent bien les anciennes.
  const v = (typeof GAME_VERSION === "string" && GAME_VERSION) ? GAME_VERSION : "dev";
  img.src = path + (path.indexOf("?") >= 0 ? "&" : "?") + "v=" + encodeURIComponent(v);
  return img;
}

function spriteReady(img) {
  return !!(img && img.complete && img.naturalWidth > 0);
}


/** Charge un pack de map `assets/maps/<key>/` (fichiers listés). */
function loadMapPack(key, files) {
  const base = "assets/maps/" + key + "/";
  const pack = {};
  for (const [prop, file] of Object.entries(files)) {
    pack[prop] = loadSprite(base + file);
  }
  return pack;
}

function initSprites() {
  SPRITES.ballPurple = loadSprite("assets/ball/volley_purple.png");
  SPRITES.ballGold = loadSprite("assets/ball/volley_gold.png");
  SPRITES.ballNight = loadSprite("assets/ball/volley_night.png");
  SPRITES.ballCream = loadSprite("assets/ball/volley_cream.png");
  for (let i = 0; i < 4; i++) {
    SPRITES.ballFlame[i] = loadSprite("assets/ball/flame_" + i + ".png");
  }
  for (let i = 0; i < 3; i++) {
    SPRITES.fxFlameFeet[i] = loadSprite("assets/fx/flame_feet_" + i + ".png");
    SPRITES.fxFlameBody[i] = loadSprite("assets/fx/flame_body_" + i + ".png");
  }
  for (let i = 0; i < 2; i++) {
    SPRITES.fxFlameHead[i] = loadSprite("assets/fx/flame_head_" + i + ".png");
  }
  initMapPlaceEcarlate();
  initMapCountryClubDore();
  initMapPalaisGallard();
  initMapEsplanadeDuDefile();
  initMapCiteDuMatin();
  initMapStadeAshram();
  initMapPontDesDeuxMondes();
  initMapGrandeForet();
  initMapCitadelleDuLevant();
  initMapJardinDesRoses();
}

/** Pack fond / props Citadelle du Levant (terrain Le Faucon). */
function initMapCitadelleDuLevant() {
  SPRITES.mapCitadelleDuLevant = loadMapPack("citadelle-du-levant", {
    skyline: "skyline.png", band: "band.png", thumb: "thumb.png",
    flag: "flag.png", netPost: "net_post.png", falcon: "falcon.png"
  });
}

function mapCitadelleDuLevantReady() {
  const p = SPRITES.mapCitadelleDuLevant;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Jardin des Roses (terrain Le Safran).
 *  Skyline/props à générer via sommet-map + sommet-decor. */
function initMapJardinDesRoses() {
  SPRITES.mapJardinDesRoses = loadMapPack("jardin-des-roses", {
    skyline: "skyline.png", band: "band.png", thumb: "thumb.png",
    flag: "flag.png", netPost: "net_post.png", peacock: "peacock.png"
  });
}

function mapJardinDesRosesReady() {
  const p = SPRITES.mapJardinDesRoses;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Grande Forêt (terrain Jair). */
function initMapGrandeForet() {
  SPRITES.mapGrandeForet = loadMapPack("grande-foret", {
    skyline: "skyline.png", band: "band.png", far: "far.png",
    flag: "flag.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png",
    macaw: "macaw.png"
  });
}

function mapGrandeForetReady() {
  const p = SPRITES.mapGrandeForet;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Pont des Deux Mondes (terrain Sultan). */
function initMapPontDesDeuxMondes() {
  SPRITES.mapPontDesDeuxMondes = loadMapPack("pont-des-deux-mondes", {
    skyline: "skyline.png", band: "band.png", far: "far.png",
    flag: "flag.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png",
    carpet: "carpet.png"
  });
}

function mapPontDesDeuxMondesReady() {
  const p = SPRITES.mapPontDesDeuxMondes;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Cité du Matin (terrain Panda). */
function initMapCiteDuMatin() {
  SPRITES.mapCiteDuMatin = loadMapPack("cite-du-matin", {
    skyline: "skyline.png", band: "band.png", far: "far.png",
    flag: "flag.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png",
    lantern: "lantern.png"
  });
}

function mapCiteDuMatinReady() {
  const p = SPRITES.mapCiteDuMatin;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Stade Ashram (terrain Yogi). */
function initMapStadeAshram() {
  SPRITES.mapStadeAshram = loadMapPack("stade-ashram", {
    skyline: "skyline.png", band: "band.png", far: "far.png",
    flag: "flag.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png",
    cow: "cow.png"
  });
}

function mapStadeAshramReady() {
  const p = SPRITES.mapStadeAshram;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Place Écarlate (terrain Volkoï / clé volkoi). */
function initMapPlaceEcarlate() {
  SPRITES.mapPlaceEcarlate = loadMapPack("place-ecarlate", {
    skyline: "skyline.png", band: "band.png", far: "far.png",
    flag: "flag.png",
    snowman: "snowman.png", cannon: "cannon_0.png", cannonFire: "cannon_1.png",
    shot: "shot.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapPlaceEcarlateReady() {
  const p = SPRITES.mapPlaceEcarlate;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Country Club Doré (terrain Trompette). */
function initMapCountryClubDore() {
  SPRITES.mapCountryClubDore = loadMapPack("country-club-dore", {
    skyline: "skyline.png", far: "far.png", crowd0: "crowd_0.png",
    cart: "cart_0.png", cartHorn: "cart_1.png", palm: "palm.png",
    flag: "flag.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapCountryClubDoreReady() {
  const p = SPRITES.mapCountryClubDore;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Palais Gallard (terrain Cygne). */
function initMapPalaisGallard() {
  SPRITES.mapPalaisGallard = loadMapPack("palais-gallard", {
    skyline: "skyline.png", band: "band.png", far: "far.png", crowd0: "crowd_0.png",
    flag: "flag.png", pigeon: "pigeon.png", warn: "warn.png",
    whistle: "whistle.png", marchers0: "marchers_0.png",
    thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapPalaisGallardReady() {
  const p = SPRITES.mapPalaisGallard;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Esplanade du Défilé (terrain Bébé). */
function initMapEsplanadeDuDefile() {
  SPRITES.mapEsplanadeDuDefile = loadMapPack("esplanade-du-defile", {
    skyline: "skyline.png", band: "band.png", far: "far.png", crowd0: "crowd_0.png",
    flag: "flag.png", flower: "flower.png", warn: "warn.png",
    radar: "radar_0.png", radarActive: "radar_1.png",
    thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapEsplanadeDuDefileReady() {
  const p = SPRITES.mapEsplanadeDuDefile;
  return !!(p && spriteReady(p.skyline));
}

/** Vignette menu terrain : thumb PNG dédié (cover crop). */
function drawTerrainMenuThumb(terrainIdx, dx, dy, dw, dh) {
  const t = TERRAINS[terrainIdx];
  if (!t) return false;
  let img = null;
  if (t.key === "place-ecarlate" && SPRITES.mapPlaceEcarlate && spriteReady(SPRITES.mapPlaceEcarlate.thumb)) {
    img = SPRITES.mapPlaceEcarlate.thumb;
  }
  if (t.key === "country-club-dore" && SPRITES.mapCountryClubDore && spriteReady(SPRITES.mapCountryClubDore.thumb)) {
    img = SPRITES.mapCountryClubDore.thumb;
  }
  if (t.key === "palais-gallard" && SPRITES.mapPalaisGallard && spriteReady(SPRITES.mapPalaisGallard.thumb)) {
    img = SPRITES.mapPalaisGallard.thumb;
  }
  if (t.key === "esplanade-du-defile" && SPRITES.mapEsplanadeDuDefile && spriteReady(SPRITES.mapEsplanadeDuDefile.thumb)) {
    img = SPRITES.mapEsplanadeDuDefile.thumb;
  }
  if (t.key === "cite-du-matin" && SPRITES.mapCiteDuMatin && spriteReady(SPRITES.mapCiteDuMatin.thumb)) {
    img = SPRITES.mapCiteDuMatin.thumb;
  }
  if (t.key === "pont-des-deux-mondes" && SPRITES.mapPontDesDeuxMondes && spriteReady(SPRITES.mapPontDesDeuxMondes.thumb)) {
    img = SPRITES.mapPontDesDeuxMondes.thumb;
  }
  if (t.key === "stade-ashram" && SPRITES.mapStadeAshram && spriteReady(SPRITES.mapStadeAshram.thumb)) {
    img = SPRITES.mapStadeAshram.thumb;
  }
  if (t.key === "grande-foret" && SPRITES.mapGrandeForet && spriteReady(SPRITES.mapGrandeForet.thumb)) {
    img = SPRITES.mapGrandeForet.thumb;
  }
  if (t.key === "citadelle-du-levant" && SPRITES.mapCitadelleDuLevant && spriteReady(SPRITES.mapCitadelleDuLevant.thumb)) {
    img = SPRITES.mapCitadelleDuLevant.thumb;
  }
  if (t.key === "jardin-des-roses" && SPRITES.mapJardinDesRoses && spriteReady(SPRITES.mapJardinDesRoses.thumb)) {
    img = SPRITES.mapJardinDesRoses.thumb;
  }
  if (!img) return false;
  const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
  if (!sw || !sh) return false;
  const scale = Math.max(dw / sw, dh / sh);
  const tw = sw * scale, th = sh * scale;
  ctx.drawImage(img, dx + (dw - tw) / 2, dy + (dh - th) / 2, tw, th);
  return true;
}

initSprites();
