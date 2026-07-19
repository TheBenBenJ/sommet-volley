// sommet-volley · sprites (images PNG) — chargement asynchrone, fallback canvas
"use strict";

const SPRITES = {
  ballPurple: null,      // ballon volley violet / crème
  mapVladou: null,       // Place Grand-Rouge (pack PNG)
  mapTrompette: null,    // Resort Doré (pack PNG)
  mapMicron: null,       // Palais de l'Hexagone (pack PNG)
  mapHoun: null          // Esplanade du Défilé (pack PNG)
};

function loadSprite(path) {
  const img = new Image();
  img.src = path;
  return img;
}

function spriteReady(img) {
  return !!(img && img.complete && img.naturalWidth > 0);
}

function initSprites() {
  SPRITES.ballPurple = loadSprite("assets/ball/volley_purple.png");
  initMapVladou();
  initMapTrompette();
  initMapMicron();
  initMapHoun();
}

/** Pack fond / props Place Grand-Rouge (terrain Vladou). */
function initMapVladou() {
  const b = "assets/maps/vladou/";
  SPRITES.mapVladou = {
    skyline: loadSprite(b + "skyline.png"),
    far: loadSprite(b + "far.png"),
    // blizzard.png retiré : un seul fond + effets neige/vent en code
    crowd0: loadSprite(b + "crowd_0.png"),
    // crowd_1.png : swap d’images trop saccadé, tribune fixe sur crowd_0
    snowman: loadSprite(b + "snowman.png"),
    cannon: loadSprite(b + "cannon_0.png"),
    cannonFire: loadSprite(b + "cannon_1.png"),
    shot: loadSprite(b + "shot.png"),
    warn: loadSprite(b + "warn.png"),
    thumb: loadSprite(b + "thumb.png"),
    netPost: loadSprite(b + "net_post.png")
  };
}

function mapVladouReady() {
  const p = SPRITES.mapVladou;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Resort Doré (terrain Trompette). */
function initMapTrompette() {
  const b = "assets/maps/trompette/";
  SPRITES.mapTrompette = {
    skyline: loadSprite(b + "skyline.png"),
    far: loadSprite(b + "far.png"),
    crowd0: loadSprite(b + "crowd_0.png"),
    cart: loadSprite(b + "cart_0.png"),
    cartHorn: loadSprite(b + "cart_1.png"),
    palm: loadSprite(b + "palm.png"),
    flag: loadSprite(b + "flag.png"),
    warn: loadSprite(b + "warn.png"),
    thumb: loadSprite(b + "thumb.png"),
    netPost: loadSprite(b + "net_post.png")
  };
}

function mapTrompetteReady() {
  const p = SPRITES.mapTrompette;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Palais de l'Hexagone (terrain Micron). */
function initMapMicron() {
  const b = "assets/maps/micron/";
  SPRITES.mapMicron = {
    skyline: loadSprite(b + "skyline.png"),
    far: loadSprite(b + "far.png"),
    crowd0: loadSprite(b + "crowd_0.png"),
    flag: loadSprite(b + "flag.png"),
    pigeon: loadSprite(b + "pigeon.png"),
    warn: loadSprite(b + "warn.png"),
    whistle: loadSprite(b + "whistle.png"),
    marchers0: loadSprite(b + "marchers_0.png"),
    thumb: loadSprite(b + "thumb.png"),
    netPost: loadSprite(b + "net_post.png")
  };
}

function mapMicronReady() {
  const p = SPRITES.mapMicron;
  return !!(p && spriteReady(p.skyline));
}

/** Pack fond / props Esplanade du Défilé (terrain Houn). */
function initMapHoun() {
  const b = "assets/maps/houn/";
  SPRITES.mapHoun = {
    skyline: loadSprite(b + "skyline.png"),
    far: loadSprite(b + "far.png"),
    crowd0: loadSprite(b + "crowd_0.png"),
    flag: loadSprite(b + "flag.png"),
    flower: loadSprite(b + "flower.png"),
    warn: loadSprite(b + "warn.png"),
    radar: loadSprite(b + "radar_0.png"),
    radarActive: loadSprite(b + "radar_1.png"),
    thumb: loadSprite(b + "thumb.png"),
    netPost: loadSprite(b + "net_post.png")
  };
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
  if (!img) return false;
  const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
  if (!sw || !sh) return false;
  const scale = Math.max(dw / sw, dh / sh);
  const tw = sw * scale, th = sh * scale;
  ctx.drawImage(img, dx + (dw - tw) / 2, dy + (dh - th) / 2, tw, th);
  return true;
}

initSprites();
