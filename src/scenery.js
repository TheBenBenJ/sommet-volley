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
  if (key === "neige") {
    stand = "#aabecd"; rail = "#8299ab";
    pal = ["#e57373", "#64b5f6", "#ffffff", "#ffb74d", "#ba68c8", "#4db6ac"];
  } else if (key === "prairie") {
    stand = "#8fae52"; rail = "#6b8a3a";
    pal = ["#ff6f61", "#ffd93d", "#7ed957", "#4db3ff", "#c07bff", "#ffffff"];
  } else if (key === "parade") {
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
  const shirt = species === "vladou" ? "#b43a2e"
    : species === "trompette" ? "#f0a060"
    : species === "micron" ? "#3d5afe"
    : species === "houn" ? "#2d3a2e"
    : col;
  ctx.fillStyle = shirt;
  ctx.beginPath(); ctx.ellipse(x, hy + 5, 4.5, 6.5, 0, 0, Math.PI * 2); ctx.fill();
  // tête + mèche / coupe selon le perso du terrain
  if (species === "trompette") {
    ctx.fillStyle = "#f0a060";
    ctx.beginPath(); ctx.arc(x, hy - 2, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f5d76e";
    ctx.beginPath(); ctx.ellipse(x + 0.5, hy - 5, 3.4, 2.2, -0.3, 0, Math.PI * 2); ctx.fill();
  } else if (species === "houn") {
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

// ---------- Météo (plage) ----------
// État météo déterministe : dérivé du RNG seedé et rangé dans les snapshots,
// pour que l'hôte et l'invité voient exactement le même ciel en ligne.
// "clear" → "rain" (sable humide) ; si le soleil perce → arc-en-ciel ;
// si la pluie s'intensifie → ciel sombre (orage).
let weather = "clear";        // "clear" | "rain" | "storm"
let weatherTimer = 0;         // ticks avant le prochain changement (0 = jamais planifié)
let rainDrops = [];           // gouttes (visuel, régénéré localement)
let sandGrains = [];          // grains soufflés (plage, visuel, régénéré localement)
let fogPuffs = [];            // bancs de brume (marais, visuel, régénéré localement)

function resetWeather() {
  weather = "clear";
  weatherTimer = 600 + Math.floor(rng() * 1200); // ~10-30 s avant 1er changement
  rainDrops = [];
  sandGrains = [];
  fogPuffs = [];
  resetMapEvent();
}

// ---------- Événements de map ----------
// Place Grand-Rouge : canon d'apparat. Resort Doré : voiturette + pluie de balles.
// Annonce ~2 s, déterministe (rng + snapshots). Désactivable via mapEventsQuiet.
const MAP_EVENT_WARN_T = 120;  // ~2 s à 60 Hz
const MAP_EVENT_FIRE_T = 10;
const MAP_SHOT_R = 16;
const MAP_GOLF_R = 9;
const MAP_CART_RAIN_T = 90; // ~1,5 s de pluie

let mapEventsQuiet = false;
let mapEvent = {
  phase: "idle", // idle | warn | fire | flying
  t: 0,
  timer: 0,
  x: 0, y: 0, vx: 0, vy: 0,
  hit: false,
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
  mapEvent.cartX = W * 0.5;
  mapEvent.cartDir = 1;
  mapEvent.zoneX = 0;
  mapEvent.zoneW = 150;
  mapEvent.balls = [];
}

function scheduleNextMapEvent() {
  mapEvent.phase = "idle";
  mapEvent.t = 0;
  mapEvent.timer = 1200 + Math.floor(rng() * 1200); // 20–40 s
  mapEvent.x = mapEvent.y = mapEvent.vx = mapEvent.vy = 0;
  mapEvent.hit = false;
  // Resort : reste au centre (près des barrières) — pas de téléport hors écran
  mapEvent.cartX = W * 0.5;
  mapEvent.cartDir = 1;
  mapEvent.zoneX = 0;
  mapEvent.balls = [];
}

/** Déplacement continu du caddie hors event (une seule position, jamais de pop).
 *  Va-et-vient lent ; le rendu miroite le sprite selon cartDir (jamais en marche arrière). */
function stepCartIdleMotion() {
  if (mapEventKind() !== "cart") return;
  if (mapEvent.phase !== "idle") return;
  if (mapEvent.cartDir !== 1 && mapEvent.cartDir !== -1) mapEvent.cartDir = 1;
  const lo = W * 0.5 - 100;
  const hi = W * 0.5 + 100;
  mapEvent.cartX += mapEvent.cartDir * 0.28;
  if (mapEvent.cartX >= hi) { mapEvent.cartX = hi; mapEvent.cartDir = -1; }
  else if (mapEvent.cartX <= lo) { mapEvent.cartX = lo; mapEvent.cartDir = 1; }
}

function mapEventKind() {
  const k = TERRAINS[terrain] && TERRAINS[terrain].key;
  if (k === "neige") return "cannon";
  if (k === "plage") return "cart";
  return null;
}

function mapEventActiveTerrain() {
  return mapEventKind() != null;
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

function stepMapEvent() {
  if (mapEventsQuiet || !mapEventActiveTerrain()) {
    if (mapEvent.phase !== "idle") {
      mapEvent.phase = "idle";
      mapEvent.t = 0;
      mapEvent.hit = false;
      mapEvent.balls = [];
      if (mapEvent.cartX < 0 || mapEvent.cartX > W) mapEvent.cartX = W * 0.5;
    }
    // décor : le caddie continue de patrouiller même en mode calme
    if (state === "play" || state === "serve") stepCartIdleMotion();
    return;
  }
  if (state !== "play" && state !== "serve") return;

  const kind = mapEventKind();

  if (mapEvent.phase === "idle") {
    stepCartIdleMotion();
    if (--mapEvent.timer <= 0) {
      mapEvent.phase = "warn";
      mapEvent.t = 0;
      if (kind === "cart") {
        mapEvent.zoneW = 140 + Math.floor(rng() * 40);
        mapEvent.zoneX = 160 + Math.floor(rng() * (W - 320));
        // garde la position courante — accélère vers la droite (pas de reset à -100)
        mapEvent.cartDir = 1;
        if (mapEvent.cartX < -40) mapEvent.cartX = -40;
        mapEvent.balls = [];
        sfxCannonWarn();
      } else {
        sfxCannonWarn();
      }
    }
    return;
  }

  if (mapEvent.phase === "warn") {
    mapEvent.t++;
    if (kind === "cart") {
      mapEvent.cartDir = 1;
      mapEvent.cartX += 1.35;
    }
    if (mapEvent.t % 30 === 0) beep(180 + (mapEvent.t | 0), 0.05, "square", 0.06);
    if (mapEvent.t >= MAP_EVENT_WARN_T) {
      mapEvent.phase = "fire";
      mapEvent.t = 0;
    }
    return;
  }

  // --- Resort Doré : voiturette + pluie de balles ---
  if (kind === "cart") {
    if (mapEvent.phase === "fire" || mapEvent.phase === "flying") {
      mapEvent.t++;
      mapEvent.cartX += 3.2;
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
      if (mapEvent.t > MAP_CART_RAIN_T && alive === 0 && mapEvent.cartX > W + 60) {
        scheduleNextMapEvent();
      }
    }
    return;
  }

  // --- Place Grand-Rouge : canon ---
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
// Même machine à états sur les 4 terrains ; seul l'habillage change :
//  plage → tempête de sable · banquise → chute de neige/blizzard
//  prairie → averse
function stepWeather() {
  if (--weatherTimer > 0) return;
  const r = rng();
  if (weather === "clear") {
    weather = "rain";
    weatherTimer = 480 + Math.floor(rng() * 720);
  } else if (weather === "rain") {
    // soit ça se dégage, soit l'orage éclate
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
  const icy = TERRAINS[terrain].key === "neige" ? 0.92 : 1;
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

function drawRain(intensity) {
  // gouttes purement visuelles : densité selon l'intensité
  const target = Math.floor(intensity * 140);
  while (rainDrops.length < target) {
    rainDrops.push({ x: Math.random() * (W + 60) - 30, y: Math.random() * GROUND_Y,
                     len: 8 + Math.random() * 10, sp: 9 + Math.random() * 6 });
  }
  if (rainDrops.length > target) rainDrops.length = target;
  ctx.strokeStyle = weather === "storm" ? "rgba(150,170,200,0.5)" : "rgba(180,200,230,0.45)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  const wind = 2.2;
  for (const d of rainDrops) {
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - wind, d.y + d.len);
    ctx.stroke();
    d.y += d.sp; d.x -= wind * 0.4;
    if (d.y > GROUND_Y) { d.y = -d.len; d.x = Math.random() * (W + 60) - 30; }
  }
}

// tempête de sable (plage) : grains soufflés quasi à l'horizontale + voile ocre
function drawSandstorm(intensity) {
  const target = Math.floor(intensity * 150);
  while (sandGrains.length < target) {
    sandGrains.push({ x: Math.random() * (W + 80) - 40, y: Math.random() * GROUND_Y,
                     len: 10 + Math.random() * 16, sp: 10 + Math.random() * 8 });
  }
  if (sandGrains.length > target) sandGrains.length = target;
  ctx.fillStyle = "rgba(196,156,84," + (0.1 + intensity * 0.14).toFixed(2) + ")";
  ctx.fillRect(0, 0, W, GROUND_Y);
  ctx.strokeStyle = weather === "storm" ? "rgba(150,112,58,0.55)" : "rgba(180,145,90,0.45)";
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  for (const g of sandGrains) {
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x - g.len, g.y + g.len * 0.28);
    ctx.stroke();
    g.x -= g.sp; g.y += g.sp * 0.22;
    if (g.x < -40) { g.x = W + 40; g.y = Math.random() * GROUND_Y; }
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
  ctx.fillRect(0, GROUND_Y - 90, W, 90);
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
  const key = TERRAINS[terrain].key;
  if (key === "plage") drawBgPlage();
  else if (key === "neige") drawBgNeige();
  else if (key === "prairie" || key === "matin" || key === "bosphore") drawBgPrairie();
  else if (key === "parade" || key === "ashram") drawBgParade();
  else if (key === "amazon") drawBgPlage();
  else drawBgPlage();
}

