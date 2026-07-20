// sommet-volley · sprites (images PNG) — chargement asynchrone, fallback canvas
"use strict";

const SPRITES = {
  ballPurple: null,      // ballon volley violet / crème
  mapVladou: null,       // Place Grand-Rouge (pack PNG)
  mapTrompette: null,    // Pelouse Oval (pack PNG)
  mapMicron: null,       // Palais de l'Hexagone (pack PNG)
  mapHoun: null,         // Esplanade du Défilé (pack PNG)
  mapMatin: null,        // Place du Matin (Panda)
  mapBosphore: null,     // Palais du Bosphore (Sultan)
  mapAshram: null,       // Stade Ashram (Yogi)
  mapAmazon: null        // Amazonie Dorée (Jair)
};

function loadSprite(path) {
  const img = new Image();
  img.src = path;
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
  initMapVladou();
  initMapTrompette();
  initMapMicron();
  initMapHoun();
  initMapMatin();
  initMapAshram();
  initMapBosphore();
  initMapAmazon();
}

/** Pack fond / props Amazonie Dorée (terrain Jair). */
function initMapAmazon() {
  SPRITES.mapAmazon = loadMapPack("amazon", {
    skyline: "skyline.png", far: "far.png",
    flag: "flag.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapAmazonReady() {
  const p = SPRITES.mapAmazon;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Palais du Bosphore (terrain Sultan). */
function initMapBosphore() {
  SPRITES.mapBosphore = loadMapPack("bosphore", {
    skyline: "skyline.png", far: "far.png",
    flag: "flag.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapBosphoreReady() {
  const p = SPRITES.mapBosphore;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Place du Matin (terrain Panda). */
function initMapMatin() {
  SPRITES.mapMatin = loadMapPack("matin", {
    skyline: "skyline.png", far: "far.png",
    flag: "flag.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapMatinReady() {
  const p = SPRITES.mapMatin;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Stade Ashram (terrain Yogi). */
function initMapAshram() {
  SPRITES.mapAshram = loadMapPack("ashram", {
    skyline: "skyline.png", far: "far.png",
    flag: "flag.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapAshramReady() {
  const p = SPRITES.mapAshram;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Place Grand-Rouge (terrain Vladou). */
function initMapVladou() {
  SPRITES.mapVladou = loadMapPack("vladou", {
    skyline: "skyline.png", far: "far.png", crowd0: "crowd_0.png",
    snowman: "snowman.png", cannon: "cannon_0.png", cannonFire: "cannon_1.png",
    shot: "shot.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapVladouReady() {
  const p = SPRITES.mapVladou;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Pelouse Oval (terrain Trompette). */
function initMapTrompette() {
  SPRITES.mapTrompette = loadMapPack("trompette", {
    skyline: "skyline.png", far: "far.png", crowd0: "crowd_0.png",
    cart: "cart_0.png", cartHorn: "cart_1.png", palm: "palm.png",
    flag: "flag.png", warn: "warn.png", thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapTrompetteReady() {
  const p = SPRITES.mapTrompette;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Palais de l'Hexagone (terrain Micron). */
function initMapMicron() {
  SPRITES.mapMicron = loadMapPack("micron", {
    skyline: "skyline.png", far: "far.png", crowd0: "crowd_0.png",
    flag: "flag.png", pigeon: "pigeon.png", warn: "warn.png",
    whistle: "whistle.png", marchers0: "marchers_0.png",
    thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapMicronReady() {
  const p = SPRITES.mapMicron;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Esplanade du Défilé (terrain Houn). */
function initMapHoun() {
  SPRITES.mapHoun = loadMapPack("houn", {
    skyline: "skyline.png", far: "far.png", crowd0: "crowd_0.png",
    flag: "flag.png", flower: "flower.png", warn: "warn.png",
    radar: "radar_0.png", radarActive: "radar_1.png",
    thumb: "thumb.png", netPost: "net_post.png"
  });
}

function mapHounReady() {
  const p = SPRITES.mapHoun;
  return !!(p && spriteReady(p.skyline));
}

/** Vignette menu terrain : thumb PNG dédié (cover crop). */
function drawTerrainMenuThumb(terrainIdx, dx, dy, dw, dh) {
  const t = TERRAINS[terrainIdx];
  if (!t) return false;
  let img = null;
  if (t.key === "neige" && SPRITES.mapVladou && spriteReady(SPRITES.mapVladou.thumb)) {
    img = SPRITES.mapVladou.thumb;
  }
  if (t.key === "plage" && SPRITES.mapTrompette && spriteReady(SPRITES.mapTrompette.thumb)) {
    img = SPRITES.mapTrompette.thumb;
  }
  if (t.key === "prairie" && SPRITES.mapMicron && spriteReady(SPRITES.mapMicron.thumb)) {
    img = SPRITES.mapMicron.thumb;
  }
  if (t.key === "parade" && SPRITES.mapHoun && spriteReady(SPRITES.mapHoun.thumb)) {
    img = SPRITES.mapHoun.thumb;
  }
  if (t.key === "matin" && SPRITES.mapMatin && spriteReady(SPRITES.mapMatin.thumb)) {
    img = SPRITES.mapMatin.thumb;
  }
  if (t.key === "bosphore" && SPRITES.mapBosphore && spriteReady(SPRITES.mapBosphore.thumb)) {
    img = SPRITES.mapBosphore.thumb;
  }
  if (t.key === "ashram" && SPRITES.mapAshram && spriteReady(SPRITES.mapAshram.thumb)) {
    img = SPRITES.mapAshram.thumb;
  }
  if (t.key === "amazon" && SPRITES.mapAmazon && spriteReady(SPRITES.mapAmazon.thumb)) {
    img = SPRITES.mapAmazon.thumb;
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
