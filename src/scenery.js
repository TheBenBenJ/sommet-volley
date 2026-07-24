// sommet-volley · décors — public, astres, météo
"use strict";

// ---------- Décors ----------
function drawClouds(color) {
  ctx.fillStyle = color;
  for (const [cx, cy, sc] of [[150, 90, 1], [420, 60, 0.8], [680, 130, 0.65]]) {
    ctx.beginPath();
    ctx.arc(cx, cy, 22 * sc, 0, Math.PI * 2);
    ctx.arc(cx + 24 * sc, cy - 8 * sc, 18 * sc, 0, Math.PI * 2);
    ctx.arc(cx + 46 * sc, cy, 20 * sc, 0, Math.PI * 2);
    ctx.arc(cx + 22 * sc, cy + 8 * sc, 18 * sc, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------- Tribunes animées (public) ----------
// Bande de spectateurs derrière le terrain : ola permanente + explosion de joie
// (bras/ailes/oreilles levés, bonds) quand crowdHype grimpe (point marqué,
// smash). Le public de chaque terrain est composé du perso qui le
// possède. Purement visuel, dérivé du temps → rien à synchroniser en ligne.
function drawCrowd() {
  const t = performance.now() / 1000;
  const key = TERRAINS[terrain].key;
  const species = CHARACTERS[TERRAINS[terrain].character].key;
  const top = GROUND_Y - 118, bot = GROUND_Y - 78;
  let stand, rail, pal, glow = false;
  if (key === "place-ecarlate") {
    stand = "#aabecd"; rail = "#8299ab";
    pal = ["#e57373", "#64b5f6", "#ffffff", "#ffb74d", "#ba68c8", "#4db6ac"];
  } else if (key === "palais-du-coq") {
    stand = "#8fae52"; rail = "#6b8a3a";
    pal = ["#ff6f61", "#ffd93d", "#7ed957", "#4db3ff", "#c07bff", "#ffffff"];
  } else if (key === "esplanade-du-defile") {
    stand = "#6a7278"; rail = "#c62828";
    pal = ["#2d3a2e", "#c62828", "#c9a227", "#90a4ae", "#ffffff", "#546e7a"];
  } else {
    stand = "#b98a4b"; rail = "#8f6a38";
    pal = ["#ff6f61", "#ffd93d", "#4db3ff", "#7ed957", "#c07bff", "#ffffff"];
  }
  // gradins
  ctx.fillStyle = stand;
  ctx.fillRect(0, top, W, bot - top);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  for (let g = 1; g < 3; g++) ctx.fillRect(0, top + (bot - top) * g / 3, W, 2);

  const hype = Math.min(1, crowdHype / 60);
  for (let row = 0; row < 3; row++) {
    const ry = top + 12 + row * 12;
    const off = row * 9;
    for (let x = 8 + off; x < W; x += 18) {
      const i = (x * 7 + row * 131) | 0;
      const col = pal[(i >> 3) % pal.length];
      const wave = Math.sin(t * 3 - x * 0.05 + row);         // ola continue
      const jit = Math.sin(t * (8 + (i % 5)) + i);
      const bounce = Math.max(0, wave) * 2.5 + hype * Math.abs(jit) * 7;
      const hy = ry - bounce;
      const excited = hype > 0.35 && jit > 0.2; // explosion de joie du moment
      drawCrowdCritter(species, x, hy, col, excited, glow);
      // certains spectateurs agitent un fanion (plus fort quand ça chauffe)
      if (i % 5 === 0) {
        const wav = Math.sin(t * (3 + hype * 7) + i);
        const stx = x + 6, sty = hy + 2, topX = stx + wav * 2, topY = hy - 11 - hype * 5;
        ctx.strokeStyle = "rgba(110,80,55,0.85)"; ctx.lineWidth = 1.2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(stx, sty); ctx.lineTo(topX, topY); ctx.stroke();
        ctx.fillStyle = pal[(i >> 5) % pal.length];
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.lineTo(topX + 11, topY + 3 + wav * (1 + hype * 2.5));
        ctx.lineTo(topX + 2, topY + 8);
        ctx.closePath(); ctx.fill();
      }
    }
  }
  ctx.fillStyle = rail;
  ctx.fillRect(0, bot - 3, W, 4);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(0, bot - 3, W, 1);
}

// un spectateur, dessiné en version miniature du personnage du terrain.
// (x, hy) = position de la tête (déjà animée : ola + bonds d'excitation).
// col = teinte d'accessoire/plumage propre à ce spectateur (variété dans la
// foule). excited = bras/ailes/oreilles levés (explosion de joie du moment).
function drawCrowdCritter(species, x, hy, col, excited, glow) {
  // Silhouettes humanoïdes mini (casting satirique)
  ctx.fillStyle = glow ? "rgba(255,255,255,0.08)" : "transparent";
  if (glow) { ctx.beginPath(); ctx.arc(x, hy, 8, 0, Math.PI * 2); ctx.fill(); }
  const shirt = species === "volkoi" ? "#b43a2e"
    : species === "dorf" ? "#f0a060"
    : species === "cygne" ? "#3d5afe"
    : species === "bebe" ? "#2d3a2e"
    : col;
  ctx.fillStyle = shirt;
  ctx.beginPath(); ctx.ellipse(x, hy + 5, 4.5, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  // tête + mèche / coupe selon le perso du terrain
  if (species === "dorf") {
    ctx.fillStyle = "#f0a060";
    ctx.beginPath(); ctx.arc(x, hy - 2, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f5d76e";
    ctx.beginPath(); ctx.ellipse(x + 0.5, hy - 5, 3.4, 2.2, -0.3, 0, Math.PI * 2); ctx.fill();
  } else if (species === "bebe") {
    ctx.fillStyle = "#f0d5c0";
    ctx.beginPath(); ctx.arc(x, hy - 2, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#111";
    ctx.fillRect(x - 3.2, hy - 5.5, 6.4, 3.2);
  } else {
    ctx.fillStyle = "#f0d0b0";
    ctx.beginPath(); ctx.arc(x, hy - 2, 3.2, 0, Math.PI * 2); ctx.fill();
  }
  if (excited) {
    ctx.strokeStyle = col; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - 5, hy + 2); ctx.lineTo(x - 8, hy - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 5, hy + 2); ctx.lineTo(x + 8, hy - 8); ctx.stroke();
  }
}

function drawSkyBirds() {
  const t = performance.now() / 1000;
  ctx.strokeStyle = "rgba(60,60,80,0.55)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const x = ((t * (14 + i * 6) + i * 320) % (W + 120)) - 60;
    const y = 55 + i * 28 + Math.sin(t * 2 + i * 2) * 5;
    const w = Math.sin(t * 6 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + w);
    ctx.quadraticCurveTo(x - 4, y - 4, x, y);
    ctx.quadraticCurveTo(x + 4, y - 4, x + 8, y + w);
    ctx.stroke();
  }
}

// papillons voletant au-dessus de la prairie : trajectoire en zigzag doux,
// deux ailes qui battent en accordéon (purement décoratif).
const BUTTERFLY_COLS = ["#ff6fae", "#ffd93d", "#7ed957", "#ffffff"];
function drawButterflies() {
  const t = performance.now() / 1000;
  for (let i = 0; i < 5; i++) {
    const speed = 10 + (i % 3) * 4;
    const x = ((t * speed + i * 210) % (W + 80)) - 40;
    const y = 130 + i * 26 + Math.sin(t * 1.4 + i * 1.7) * 22;
    const flap = Math.sin(t * 14 + i * 2) * 0.5 + 0.55; // 0.05 → 1.05
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = BUTTERFLY_COLS[i % BUTTERFLY_COLS.length];
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      ctx.beginPath();
      ctx.ellipse(3, 0, 5 * flap, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}


// ---------- Course du soleil / de la lune ----------
// L'astre décrit lentement un arc d'est en ouest. La position dérive du
// temps réel (effet purement visuel, aucune incidence sur la simulation),
// avec un cycle volontairement long pour rester discret pendant une partie.
const SKY_CYCLE = 240; // secondes pour traverser le ciel
function celestialPos() {
  const t = (performance.now() / 1000) % SKY_CYCLE;
  const p = t / SKY_CYCLE;               // 0 → 1 sur toute la traversée
  const x = 60 + p * (W - 120);          // gauche → droite
  const y = 150 - Math.sin(p * Math.PI) * 95; // arc : haut au milieu
  return { x, y, p };
}

// ---------- Météo (toutes maps) ----------
// État déterministe (RNG + snapshots) pour le sync en ligne.
// "clear" → "rain" → "storm" | "clear". Habillage par flavor :
//   neige → flocons/blizzard · plage → sable · sinon → pluie/orage+éclairs.
let weather = "clear";        // "clear" | "rain" | "storm"
let weatherTimer = 0;         // ticks avant le prochain changement
let rainDrops = [];           // gouttes proches (visuel local)
let rainDropsFar = [];        // gouttes lointaines
let rainSplashes = [];        // impacts au sol
let sandGrains = [];          // grains (Country Club)
let fogPuffs = [];            // brume (legacy)
let weatherFlash = 0;         // frames d'éclair restantes (visuel local)
let weatherFlashCool = 0;     // cooldown entre éclairs

function resetWeather() {
  weather = "clear";
  weatherTimer = 600 + Math.floor(rng() * 1200); // ~10-30 s avant 1er changement
  rainDrops = [];
  rainDropsFar = [];
  rainSplashes = [];
  sandGrains = [];
  fogPuffs = [];
  weatherFlash = 0;
  weatherFlashCool = 0;
  resetMapEvent();
}

/** Habillage météo selon le terrain : snow | sand | rain. */
function weatherFlavor() {
  const key = TERRAINS[terrain] && TERRAINS[terrain].key;
  if (key === "place-ecarlate") return "snow";
  if (key === "country-club-dore" || key === "citadelle-du-levant") return "sand";
  return "rain";
}

// ---------- Événements de map ----------
// Chaque terrain a un event (canon, caddie, cortège, radar, lanternes, tapis,
// vache, aras). Annonce ~2 s, déterministe (rng + snapshots).
// Désactivable via mapEventsQuiet.
const MAP_EVENT_WARN_T = 120;  // ~2 s à 60 Hz
const MAP_EVENT_FIRE_T = 10;
const MAP_SHOT_R = 16;
const MAP_GOLF_R = 9;
const MAP_CART_RAIN_T = 90; // ~1,5 s de pluie
const MAP_MACAW_T = 200;    // vol horizontal un peu plus long / lent
const MAP_MACAW_R = 16;
const MAP_CROSSER_HIT_CD = 18;
const MAP_RADAR_PULSE_T = 100;

let mapEventsQuiet = false;
let mapEvent = {
  phase: "idle", // idle | warn | fire | flying
  t: 0,
  timer: 0,
  x: 0, y: 0, vx: 0, vy: 0,
  hit: false,
  lastHitTick: -999,
  cartX: 450,
  cartDir: 1,
  zoneX: 0,
  zoneW: 150,
  balls: []
};

function resetMapEvent() {
  mapEvent.phase = "idle";
  mapEvent.t = 0;
  mapEvent.timer = 900 + Math.floor(rng() * 900); // 1er event un peu plus tôt (~15–30 s)
  mapEvent.x = mapEvent.y = mapEvent.vx = mapEvent.vy = 0;
  mapEvent.hit = false;
  mapEvent.lastHitTick = -999;
  mapEvent.cartX = W * 0.5;
  mapEvent.cartDir = 1;
  mapEvent.zoneX = 0;
  mapEvent.zoneW = 150;
  mapEvent.balls = [];
  mapEventFlash = ""; mapEventFlashSub = ""; mapEventFlashT = 0;
}

function scheduleNextMapEvent() {
  mapEvent.phase = "idle";
  mapEvent.t = 0;
  mapEvent.timer = 1200 + Math.floor(rng() * 1200); // 20–40 s
  mapEvent.x = mapEvent.y = mapEvent.vx = mapEvent.vy = 0;
  mapEvent.hit = false;
  mapEvent.lastHitTick = -999;
  mapEvent.cartX = W * 0.5;
  mapEvent.cartDir = 1;
  mapEvent.zoneX = 0;
  mapEvent.balls = [];
  mapEventFlash = ""; mapEventFlashSub = ""; mapEventFlashT = 0;
}

function mapEventKind() {
  const k = TERRAINS[terrain] && TERRAINS[terrain].key;
  if (k === "place-ecarlate") return "cannon";
  if (k === "country-club-dore") return "cart";
  if (k === "palais-du-coq") return "march";
  if (k === "esplanade-du-defile") return "radar";
  if (k === "cite-du-matin") return "lantern";
  if (k === "pont-des-deux-mondes") return "carpet";
  if (k === "stade-ashram") return "cow";
  if (k === "grande-foret") return "macaw";
  if (k === "citadelle-du-levant") return "falcon";
  if (k === "jardin-des-roses") return "peacock";
  return null;
}

function mapEventIsRain(kind) {
  return kind === "cart" || kind === "lantern";
}

function mapEventIsCrosser(kind) {
  return kind === "march" || kind === "carpet" || kind === "cow" || kind === "falcon" || kind === "peacock";
}

/** Bornes horizontales du caddie sur le gazon plage : il ne doit PAS rouler
 *  plus loin que les buissons (sinon il « rentre dans le mur »/les bâtiments).
 *  Buissons ≈ [151,757] ; demi-largeur caddie ≈ 53 → centre borné pour garder
 *  la carrosserie dans les buissons. */
function cartLaneBounds() {
  return { lo: 204, hi: 704 };
}

/** Va-et-vient du caddie entre les buissons (rebond aux bornes). */
function stepCartBounce(spd) {
  const b = cartLaneBounds();
  if (mapEvent.cartDir !== 1 && mapEvent.cartDir !== -1) mapEvent.cartDir = 1;
  mapEvent.cartX += mapEvent.cartDir * spd;
  if (mapEvent.cartX >= b.hi) { mapEvent.cartX = b.hi; mapEvent.cartDir = -1; }
  else if (mapEvent.cartX <= b.lo) { mapEvent.cartX = b.lo; mapEvent.cartDir = 1; }
}

/** Déplacement continu hors event (caddie / tapis / vache). */
function stepCartIdleMotion() {
  const kind = mapEventKind();
  if (kind !== "cart" && kind !== "carpet" && kind !== "cow") return;
  if (mapEvent.phase !== "idle") return;
  if (mapEvent.cartDir !== 1 && mapEvent.cartDir !== -1) mapEvent.cartDir = 1;
  // Vache idle : petit va-et-vient central (sous la fontaine) ; caddie/tapis : idem
  const lo = W * 0.5 - (kind === "cow" ? 55 : 100);
  const hi = W * 0.5 + (kind === "cow" ? 55 : 100);
  const spd = kind === "cart" ? 0.28 : kind === "cow" ? 0.14 : 0.18;
  mapEvent.cartX += mapEvent.cartDir * spd;
  if (mapEvent.cartX >= hi) { mapEvent.cartX = hi; mapEvent.cartDir = -1; }
  else if (mapEvent.cartX <= lo) { mapEvent.cartX = lo; mapEvent.cartDir = 1; }
}

/** Textes d'annonce pour l'événement de map courant. */
function mapEventAnnounceCopy(kind, phase) {
  if (kind === "cannon") {
    if (phase === "warn") {
      return {
        title: "Canon d'apparat en approche !",
        sub: "Un boulet va traverser le terrain — il dévie la balle au contact."
      };
    }
    return { title: "Boulet en vol !", sub: "Évite le projectile — collision = déviation." };
  }
  if (kind === "cart") {
    if (phase === "warn") {
      return {
        title: "Cortège sécu en approche !",
        sub: "Zone orange dangereuse — pluie de balles de golf imminente."
      };
    }
    return { title: "Pluie de golf !", sub: "Les balles de golf dévient la volley au contact." };
  }
  if (kind === "march") {
    if (phase === "warn") {
      return {
        title: "Cortège en marche !",
        sub: "Les manifestants traversent le terrain — contact = déviation."
      };
    }
    return { title: "Ça défile !", sub: "Ne te fais pas bousculer par le cortège." };
  }
  if (kind === "radar") {
    if (phase === "warn") {
      return {
        title: "Radar Batterie AA !",
        sub: "Zone de détection — la balle sera déviée si elle y entre."
      };
    }
    return { title: "Impulsion radar !", sub: "Sors la balle de la zone orange." };
  }
  if (kind === "lantern") {
    if (phase === "warn") {
      return {
        title: "Lanternes en approche !",
        sub: "Pluie de lanternes dans la zone — elles dévient la balle."
      };
    }
    return { title: "Pluie de lanternes !", sub: "Évite les lanternes qui tombent." };
  }
  if (kind === "carpet") {
    if (phase === "warn") {
      return {
        title: "Tapis volant !",
        sub: "Un tapis traverse le terrain — contact = déviation."
      };
    }
    return { title: "Tapis en vol !", sub: "Ne te fais pas balayer." };
  }
  if (kind === "cow") {
    if (phase === "warn") {
      return {
        title: "Vache sacrée en promenade !",
        sub: "Elle traverse le terrain — contact = déviation."
      };
    }
    return { title: "Attention vache !", sub: "Laisse-la passer sans la toucher avec la balle." };
  }
  if (kind === "falcon") {
    if (phase === "warn") {
      return {
        title: "Le Faucon fond sur le terrain !",
        sub: "Un rapace traverse en vol — contact = déviation."
      };
    }
    return { title: "Faucon en piqué !", sub: "Évite sa trajectoire, il dévie la balle." };
  }
  if (kind === "peacock") {
    if (phase === "warn") {
      return {
        title: "Paon de cour !",
        sub: "Un paon traverse le terrain — contact = déviation."
      };
    }
    return { title: "Paon en parade !", sub: "Laisse-le passer, il dévie la balle." };
  }
  if (kind === "macaw") {
    if (phase === "warn") {
      return {
        title: "Vol de aras !",
        sub: "Les perroquets traversent le terrain en vol horizontal — contact = déviation."
      };
    }
    return { title: "Aras en vol !", sub: "Évite le passage des aras." };
  }
  return { title: "Événement de map !", sub: "" };
}

function flashMapEventAnnounce(kind, phase) {
  const copy = mapEventAnnounceCopy(kind, phase);
  mapEventFlash = copy.title;
  mapEventFlashSub = copy.sub;
  mapEventFlashT = phase === "warn" ? MAP_EVENT_WARN_T + 30 : 90;
}

function mapEventActiveTerrain() {
  return mapEventKind() != null;
}

/** Events / idle décoratif : uniquement en échange actif (pas pause, ni transition). */
function mapEventsCanStep() {
  if (typeof paused !== "undefined" && paused) return false;
  if (typeof battle !== "undefined" && battle.active) return false;
  if (state !== "play") return false;
  // Décompte 3-2-1 encore affiché (sécurité si state passe trop tôt)
  if (typeof serveCountdown !== "undefined" && serveCountdown > 0) return false;
  return true;
}

function deflectBallFromMap(px, py, pvx, pvy, pr) {
  if (ball.frozen || ball.popped || ball.inHands) return false;
  const dx = ball.x - px, dy = ball.y - py;
  let d = Math.hypot(dx, dy);
  if (d >= BALL_R + pr) return false;
  let nx = 1, ny = 0;
  if (d > 0.001) { nx = dx / d; ny = dy / d; }
  const boost = 7.5;
  ball.vx += nx * boost + pvx * 0.3;
  ball.vy += ny * boost * 0.65 - 2.2;
  ball.serveAimLock = false;
  ball.serveFlight = false;
  const sp = Math.hypot(ball.vx, ball.vy);
  if (sp > MAX_BALL_SPEED) {
    ball.vx *= MAX_BALL_SPEED / sp;
    ball.vy *= MAX_BALL_SPEED / sp;
  }
  shake = Math.max(shake, 5);
  sfxCannonHit();
  return true;
}

function collideMapShotBall() {
  if (mapEvent.hit) return;
  if (deflectBallFromMap(mapEvent.x, mapEvent.y, mapEvent.vx, mapEvent.vy, MAP_SHOT_R)) {
    mapEvent.hit = true;
  }
}

function stepMapShotPhysics() {
  mapEvent.vy += GRAV_BALL * 0.9;
  mapEvent.x += mapEvent.vx;
  mapEvent.y += mapEvent.vy;
  collideMapShotBall();
  if (mapEvent.y > GROUND_Y + 30 || mapEvent.x > W + 50 || mapEvent.x < -50 || mapEvent.y < -80) {
    scheduleNextMapEvent();
  }
}

function spawnGolfBall() {
  const zx = mapEvent.zoneX || W * 0.5;
  const zw = mapEvent.zoneW || 150;
  const bx = zx + (rng() - 0.5) * zw * 0.85;
  mapEvent.balls.push({
    x: bx,
    y: -20 - rng() * 40,
    vx: (rng() - 0.5) * 2.2,
    vy: 2.5 + rng() * 2.5,
    hit: false,
    dead: false
  });
}

function spawnMacaw() {
  // Vol horizontal lent, hauteur variable (pas une chute)
  const y = 70 + rng() * (GROUND_Y - 150);
  mapEvent.balls.push({
    x: -50 - rng() * 80,
    y,
    vx: 1.25 + rng() * 0.45,
    vy: (rng() - 0.5) * 0.28,
    bob: rng() * Math.PI * 2,
    hit: false,
    dead: false
  });
}

function stepGolfBalls() {
  let alive = 0;
  for (const b of mapEvent.balls) {
    if (b.dead) continue;
    b.vy += GRAV_BALL * 0.95;
    b.x += b.vx;
    b.y += b.vy;
    if (!b.hit && deflectBallFromMap(b.x, b.y, b.vx, b.vy, MAP_GOLF_R)) b.hit = true;
    if (b.y > GROUND_Y + 20 || b.x < -40 || b.x > W + 40) b.dead = true;
    else alive++;
  }
  return alive;
}

function stepMacaws() {
  let alive = 0;
  for (const b of mapEvent.balls) {
    if (b.dead) continue;
    b.bob = (b.bob || 0) + 0.07;
    b.x += b.vx;
    b.y += b.vy + Math.sin(b.bob) * 0.22;
    if (b.y < 36) { b.y = 36; b.vy = Math.abs(b.vy) * 0.4; }
    if (b.y > GROUND_Y - 24) { b.y = GROUND_Y - 24; b.vy = -Math.abs(b.vy) * 0.4; }
    if (!b.hit && deflectBallFromMap(b.x, b.y, b.vx, b.vy * 0.4, MAP_MACAW_R)) b.hit = true;
    if (b.x > W + 60) b.dead = true;
    else alive++;
  }
  return alive;
}

function collideMapCrosser(kind) {
  if (tick - (mapEvent.lastHitTick || -999) < MAP_CROSSER_HIT_CD) return;
  const cx = mapEvent.cartX;
  // Hitboxes calées sur PROP_H (src/core.js) — garder cohérent avec le rendu.
  const halfW = kind === "march" ? 110
    : kind === "carpet" ? 58
    : kind === "cow" ? 48
    : kind === "falcon" ? 48
    : kind === "peacock" ? 52
    : 55;
  const topY = kind === "carpet" ? GROUND_Y - (PROP_H.carpet + 40)
    : kind === "cow" ? GROUND_Y - (PROP_H.cow - 4)
    : kind === "falcon" ? GROUND_Y - 130
    : kind === "peacock" ? GROUND_Y - (PROP_H.peacock - 2)
    : GROUND_Y - 95;
  if (ball.x < cx - halfW || ball.x > cx + halfW) return;
  if (ball.y < topY || ball.y > GROUND_Y + 8) return;
  const dir = mapEvent.cartDir || 1;
  if (deflectBallFromMap(cx, GROUND_Y - 50, dir * 2.5, -1.5, halfW * 0.55)) {
    mapEvent.lastHitTick = tick;
  }
}

function stepMapCrosserEvent(kind) {
  if (mapEvent.phase !== "fire" && mapEvent.phase !== "flying") return;
  mapEvent.t++;
  mapEvent.cartDir = 1;
  const spd = kind === "march" ? 2.6 : kind === "carpet" ? 3.4 : kind === "falcon" ? 4.2 : 2.2;
  mapEvent.cartX += spd;
  if (mapEvent.phase === "fire" && mapEvent.t === 1) {
    sfxCannonFire();
    shake = Math.max(shake, 3);
  }
  if (mapEvent.phase === "fire" && mapEvent.t >= MAP_EVENT_FIRE_T) {
    mapEvent.phase = "flying";
  }
  collideMapCrosser(kind);
  if (mapEvent.cartX > W + 120) scheduleNextMapEvent();
}

function stepMapRadarEvent() {
  if (mapEvent.phase !== "fire" && mapEvent.phase !== "flying") return;
  mapEvent.t++;
  if (mapEvent.phase === "fire" && mapEvent.t === 1) {
    sfxCannonFire();
    shake = Math.max(shake, 4);
  }
  if (mapEvent.phase === "fire" && mapEvent.t >= MAP_EVENT_FIRE_T) {
    mapEvent.phase = "flying";
  }
  const zx = mapEvent.zoneX || W * 0.5;
  const zw = mapEvent.zoneW || 160;
  if (ball.x > zx - zw / 2 && ball.x < zx + zw / 2 &&
      ball.y < GROUND_Y && ball.y > NET_TOP - 40) {
    if (tick - (mapEvent.lastHitTick || -999) >= 16) {
      if (deflectBallFromMap(zx, GROUND_Y - 80, 0, -4, zw * 0.4)) {
        mapEvent.lastHitTick = tick;
      }
    }
  }
  if (mapEvent.t >= MAP_RADAR_PULSE_T) scheduleNextMapEvent();
}

function stepMapRainEvent(kind) {
  if (mapEvent.phase !== "fire" && mapEvent.phase !== "flying") return;
  mapEvent.t++;
  if (kind === "cart") stepCartBounce(3.2);
  if (mapEvent.phase === "fire" && mapEvent.t === 1) {
    sfxCannonFire();
    shake = Math.max(shake, 4);
    spawnGolfBall();
  }
  if (mapEvent.t > 1 && mapEvent.t < MAP_CART_RAIN_T && mapEvent.t % 12 === 0) {
    spawnGolfBall();
  }
  if (mapEvent.phase === "fire" && mapEvent.t >= MAP_EVENT_FIRE_T) {
    mapEvent.phase = "flying";
  }
  const alive = stepGolfBalls();
  // Le caddie ne sort plus de l'écran (il patrouille entre les buissons) :
  // fin d'event sur le minuteur dès que les balles sont retombées.
  if (mapEvent.t > MAP_CART_RAIN_T && alive === 0) {
    scheduleNextMapEvent();
  }
}

function stepMapMacawEvent() {
  if (mapEvent.phase !== "fire" && mapEvent.phase !== "flying") return;
  mapEvent.t++;
  if (mapEvent.phase === "fire" && mapEvent.t === 1) {
    sfxCannonFire();
    shake = Math.max(shake, 2);
    spawnMacaw();
    spawnMacaw();
  }
  // Spawn plus espacé → vol plus lisible / moins dense
  if (mapEvent.t > 1 && mapEvent.t < MAP_MACAW_T && mapEvent.t % 28 === 0) {
    spawnMacaw();
  }
  if (mapEvent.phase === "fire" && mapEvent.t >= MAP_EVENT_FIRE_T) {
    mapEvent.phase = "flying";
  }
  const alive = stepMacaws();
  if (mapEvent.t > MAP_MACAW_T && alive === 0) scheduleNextMapEvent();
}

/** Coupe un event en cours (warn/fire/flying) sans laisser props coincées à l'écran. */
function abortMapEventInFlight() {
  if (mapEvent.phase === "idle") return;
  scheduleNextMapEvent();
}

function stepMapEvent() {
  if (mapEventsQuiet || !mapEventActiveTerrain()) {
    if (mapEvent.phase !== "idle") abortMapEventInFlight();
    if (mapEventsCanStep()) stepCartIdleMotion();
    return;
  }
  // Pause / point / service / duel : pas de NOUVEAU trigger, et on coupe
  // tout event déjà lancé (sinon boulet / lanternes figés au service).
  if (!mapEventsCanStep()) {
    abortMapEventInFlight();
    return;
  }

  const kind = mapEventKind();

  if (mapEvent.phase === "idle") {
    stepCartIdleMotion();
    if (--mapEvent.timer <= 0) {
      mapEvent.phase = "warn";
      mapEvent.t = 0;
      flashMapEventAnnounce(kind, "warn");
      mapEvent.balls = [];
      mapEvent.lastHitTick = -999;
      if (mapEventIsRain(kind) || kind === "radar") {
        mapEvent.zoneW = 140 + Math.floor(rng() * 50);
        mapEvent.zoneX = 160 + Math.floor(rng() * (W - 320));
      }
      if (kind === "cart") {
        mapEvent.cartDir = 1;
        mapEvent.cartX = cartLaneBounds().lo; // entre par le buisson gauche, pas hors-champ
      }
      if (mapEventIsCrosser(kind)) {
        mapEvent.cartDir = 1;
        mapEvent.cartX = -80;
        mapEvent.zoneW = kind === "march" ? 180 : 120;
      }
      sfxCannonWarn();
    }
    return;
  }

  if (mapEvent.phase === "warn") {
    mapEvent.t++;
    if (kind === "cart") {
      stepCartBounce(1.35);
    }
    if (mapEventIsCrosser(kind)) {
      mapEvent.cartDir = 1;
      mapEvent.cartX += 0.9;
    }
    if (mapEvent.t % 30 === 0) beep(180 + (mapEvent.t | 0), 0.05, "square", 0.06);
    if (mapEvent.t >= MAP_EVENT_WARN_T) {
      mapEvent.phase = "fire";
      mapEvent.t = 0;
      flashMapEventAnnounce(kind, "fire");
    }
    return;
  }

  if (mapEventIsRain(kind)) {
    stepMapRainEvent(kind);
    return;
  }
  if (kind === "macaw") {
    stepMapMacawEvent();
    return;
  }
  if (mapEventIsCrosser(kind)) {
    stepMapCrosserEvent(kind);
    return;
  }
  if (kind === "radar") {
    stepMapRadarEvent();
    return;
  }

  // --- Place Écarlate : canon ---
  if (mapEvent.phase === "fire") {
    mapEvent.t++;
    if (mapEvent.t === 1) {
      mapEvent.x = 110;
      mapEvent.y = GROUND_Y - 85;
      mapEvent.vx = 6.4;
      mapEvent.vy = -9.8;
      mapEvent.hit = false;
      sfxCannonFire();
      shake = Math.max(shake, 6);
    } else {
      stepMapShotPhysics();
      if (mapEvent.phase !== "fire") return;
    }
    if (mapEvent.phase === "fire" && mapEvent.t >= MAP_EVENT_FIRE_T) {
      mapEvent.phase = "flying";
      mapEvent.t = 0;
    }
    return;
  }

  if (mapEvent.phase === "flying") {
    mapEvent.t++;
    stepMapShotPhysics();
  }
}

// avancé une fois par tick DANS la simulation (déterministe).
// Toutes les maps : même FSM ; l'habillage dépend de weatherFlavor().
function stepWeather() {
  if (--weatherTimer > 0) return;
  const r = rng();
  if (weather === "clear") {
    weather = "rain";
    weatherTimer = 480 + Math.floor(rng() * 720);
  } else if (weather === "rain") {
    weather = r < 0.5 ? "clear" : "storm";
    weatherTimer = 360 + Math.floor(rng() * 720);
  } else { // storm
    weather = "rain";
    weatherTimer = 360 + Math.floor(rng() * 600);
  }
}

// true si le soleil est (au moins partiellement) visible → arc-en-ciel possible
function sunVisible() { return weather === "clear" || weather === "rain"; }


// adhérence du sol : 1 (sec) → 0.8 (intempérie) → 0.6 (déchaînée). Tous terrains.
// Sur la banquise, la neige rend déjà le sol un peu glissant même au "sec".
function groundGrip(blob) {
  const icy = TERRAINS[terrain].key === "place-ecarlate" ? 0.92 : 1;
  let g = 1;
  if (weather === "storm") g = 0.6 * (icy < 1 ? 0.9 : 1);
  else if (weather === "rain") g = 0.8 * icy;
  else g = icy;
  // Hiver Général : glisse extrême sur le camp gelé (sauf Sang froid)
  if (blob && typeof hasSuperEffect === "function" && hasSuperEffect("ice", blob.side)) {
    if (!(charOf(blob) && charOf(blob).coldProof)) g *= 0.32;
  }
  return g;
}
// facteur appliqué à la gravité/rebond de la balle : plus lourd = monte moins haut
function ballLift() {
  if (weather === "storm") return 1.4;
  if (weather === "rain") return 1.2;
  return 1;
}

/** @deprecated utiliser drawWeatherOverlay — conservé pour compat éventuelle. */
function drawRain(intensity) {
  drawWeatherRain(intensity);
}

function drawWeatherRain(intensity) {
  const storm = weather === "storm";
  const wind = storm ? 5.5 : 2.8;
  // Couche lointaine (fine, pâle)
  const farN = Math.floor(intensity * (storm ? 110 : 70));
  while (rainDropsFar.length < farN) {
    rainDropsFar.push({
      x: Math.random() * (W + 80) - 40, y: Math.random() * H,
      len: 6 + Math.random() * 8, sp: 6 + Math.random() * 4
    });
  }
  if (rainDropsFar.length > farN) rainDropsFar.length = farN;
  ctx.strokeStyle = storm ? "rgba(160,180,210,0.28)" : "rgba(190,210,235,0.22)";
  ctx.lineWidth = 1.1;
  ctx.lineCap = "round";
  for (const d of rainDropsFar) {
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - wind * 0.7, d.y + d.len);
    ctx.stroke();
    d.y += d.sp; d.x -= wind * 0.25;
    if (d.y > H) { d.y = -d.len; d.x = Math.random() * (W + 80) - 40; }
  }
  // Couche proche (épaisse, rapide)
  const nearN = Math.floor(intensity * (storm ? 200 : 130));
  while (rainDrops.length < nearN) {
    rainDrops.push({
      x: Math.random() * (W + 60) - 30, y: Math.random() * H,
      len: 10 + Math.random() * 14, sp: 11 + Math.random() * 8
    });
  }
  if (rainDrops.length > nearN) rainDrops.length = nearN;
  ctx.strokeStyle = storm ? "rgba(175,195,225,0.62)" : "rgba(200,220,245,0.5)";
  ctx.lineWidth = storm ? 2 : 1.6;
  for (const d of rainDrops) {
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - wind, d.y + d.len);
    ctx.stroke();
    d.y += d.sp; d.x -= wind * 0.45;
    if (d.y > H) {
      // splash en bas de l'écran
      if (rainSplashes.length < 48) {
        rainSplashes.push({ x: d.x, y: H, life: 6 + Math.floor(Math.random() * 5), r: 2 + Math.random() * 3 });
      }
      d.y = -d.len; d.x = Math.random() * (W + 60) - 30;
    }
  }
  // Impacts
  ctx.fillStyle = storm ? "rgba(200,220,245,0.45)" : "rgba(210,225,245,0.35)";
  for (let i = rainSplashes.length - 1; i >= 0; i--) {
    const s = rainSplashes[i];
    const a = s.life / 10;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.ellipse(s.x, (s.y || GROUND_Y) - 1, s.r * (1.2 - a * 0.3), s.r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    s.life -= 1;
    if (s.life <= 0) rainSplashes.splice(i, 1);
  }
  ctx.globalAlpha = 1;
}

// tempête de sable (Country Club) : grains horizontaux + voile ocre
function drawSandstorm(intensity) {
  const storm = weather === "storm";
  const target = Math.floor(intensity * (storm ? 220 : 140));
  while (sandGrains.length < target) {
    sandGrains.push({
      x: Math.random() * (W + 100) - 50, y: Math.random() * H,
      len: 12 + Math.random() * 22, sp: 12 + Math.random() * 10,
      thick: 1 + Math.random() * 1.4
    });
  }
  if (sandGrains.length > target) sandGrains.length = target;
  // Voile ocre + bande basse plus dense
  ctx.fillStyle = "rgba(196,156,84," + (0.12 + intensity * 0.18).toFixed(2) + ")";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(170,130,70," + (0.08 + intensity * 0.12).toFixed(2) + ")";
  ctx.fillRect(0, GROUND_Y - 70, W, H - (GROUND_Y - 70));
  ctx.strokeStyle = storm ? "rgba(160,118,60,0.6)" : "rgba(190,150,95,0.48)";
  ctx.lineCap = "round";
  for (const g of sandGrains) {
    ctx.lineWidth = g.thick;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x - g.len, g.y + g.len * 0.22);
    ctx.stroke();
    g.x -= g.sp; g.y += g.sp * 0.18;
    if (g.x < -50) { g.x = W + 50; g.y = Math.random() * H; }
  }
}

/**
 * Overlay météo unique (après le décor) — pluie / sable / neige selon flavor.
 * Éclair = flash local (non syncé, comme les gouttes).
 */
function drawWeatherOverlay() {
  if (weather === "clear") {
    weatherFlash = 0;
    return;
  }
  const flavor = weatherFlavor();
  const storm = weather === "storm";
  const t = (typeof performance !== "undefined" ? performance.now() : 0) / 1000;

  if (flavor === "snow") {
    if (typeof drawNeigeWeatherFX === "function") {
      drawNeigeWeatherFX(t, true, storm);
    }
    return;
  }
  if (flavor === "sand") {
    drawSandstorm(storm ? 1 : 0.58);
    return;
  }

  // Grade pluie / orage
  ctx.fillStyle = storm ? "rgba(28,42,68,0.34)" : "rgba(40,58,88,0.16)";
  ctx.fillRect(0, 0, W, H);
  // Légère « désaturation » chaude → cool
  ctx.fillStyle = storm ? "rgba(20,30,50,0.1)" : "rgba(50,70,100,0.05)";
  ctx.fillRect(0, 0, W, H);

  drawWeatherRain(storm ? 1 : 0.55);

  // Éclairs (orage seulement)
  if (storm) {
    if (weatherFlashCool > 0) weatherFlashCool -= 1;
    else if (Math.random() < 0.012) {
      weatherFlash = 2 + (Math.random() < 0.35 ? 1 : 0);
      weatherFlashCool = 70 + Math.floor(Math.random() * 90);
    }
    if (weatherFlash > 0) {
      const peak = weatherFlash >= 2;
      ctx.fillStyle = peak ? "rgba(230,240,255,0.55)" : "rgba(180,200,255,0.22)";
      ctx.fillRect(0, 0, W, H);
      // trait d'éclair stylisé
      if (peak) {
        const lx = 80 + Math.random() * (W - 160);
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx - 18, GROUND_Y * 0.28);
        ctx.lineTo(lx + 10, GROUND_Y * 0.28);
        ctx.lineTo(lx - 8, GROUND_Y * 0.55);
        ctx.stroke();
      }
      weatherFlash -= 1;
    }
  } else {
    weatherFlash = 0;
  }
}

// brume qui se lève (marais) : bancs translucides dérivant lentement du sol
function drawFog(intensity) {
  const target = Math.floor(intensity * 9) + 3;
  while (fogPuffs.length < target) {
    fogPuffs.push({ x: Math.random() * (W + 200) - 100, y: GROUND_Y - Math.random() * 90,
                    r: 40 + Math.random() * 50, sp: 0.2 + Math.random() * 0.35, rise: 0.06 + Math.random() * 0.08 });
  }
  if (fogPuffs.length > target) fogPuffs.length = target;
  for (const f of fogPuffs) {
    ctx.fillStyle = "rgba(220,228,224," + (0.06 + intensity * 0.08).toFixed(2) + ")";
    ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r, f.r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    f.x += f.sp; f.y -= f.rise;
    if (f.x > W + 100) f.x = -100;
    if (f.y < GROUND_Y - 130) { f.y = GROUND_Y - 10 + Math.random() * 10; f.x = Math.random() * (W + 200) - 100; }
  }
  ctx.fillStyle = "rgba(200,212,208," + (0.05 + intensity * 0.07).toFixed(2) + ")";
  ctx.fillRect(0, GROUND_Y - 90, W, H - (GROUND_Y - 90));
}

function drawRainbow() {
  const cx = W / 2, cy = GROUND_Y + 40, rOut = 340;
  const cols = ["#ff5b5b", "#ffa23e", "#ffe14d", "#5bd97a", "#4db3ff", "#8a6bff"];
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 9;
  for (let i = 0; i < cols.length; i++) {
    ctx.strokeStyle = cols[i];
    ctx.beginPath();
    ctx.arc(cx, cy, rOut - i * 9, Math.PI, 0);
    ctx.stroke();
  }
  ctx.restore();
}


// ---------- Terrains ----------
function drawBackground() {
  // Fond neutre plein cadre (évite bandes blanches si un calque rate)
  ctx.fillStyle = "#2a3340";
  ctx.fillRect(0, 0, W, H);
  const key = TERRAINS[terrain].key;
  if (key === "country-club-dore") drawBgPlage();
  else if (key === "place-ecarlate") drawBgNeige();
  else if (key === "palais-du-coq" || key === "cite-du-matin" || key === "pont-des-deux-mondes") drawBgPrairie();
  else if (key === "esplanade-du-defile" || key === "stade-ashram") drawBgParade();
  else if (key === "grande-foret") drawBgPlage();
  else if (key === "citadelle-du-levant") drawBgColline();
  else if (key === "jardin-des-roses") drawBgRoseraie();
  else drawBgPlage();
  // Particules / grade / éclairs — une seule passe pour toutes les maps
  drawWeatherOverlay();
}

