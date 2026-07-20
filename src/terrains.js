// sommet-volley · terrains, HUD match, décors
"use strict";

// ---------- Parallaxe (profondeur multi-couches) ----------
// Drift temporel très léger uniquement — plus de suivi balle/joystick
// (en service la balle suit le joueur → le fond « glissait » avec le stick).
function paraX(depth) {
  const drift = Math.sin(performance.now() / 4500);
  return -drift * 5 * depth;
}

// silhouette de collines/reliefs remplie, décalée selon sa profondeur.
// pts = crêtes [x, y] ; la base plate (baseY) est ensuite masquée par les
// couches dessinées par-dessus (gradins, montagnes…), ce qui empile les plans.
function drawHillLayer(baseY, color, depth, pts) {
  const ox = paraX(depth);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-60 + ox, baseY);
  for (const p of pts) ctx.lineTo(p[0] + ox, p[1]);
  ctx.lineTo(W + 60 + ox, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawBgPlage() {
  const storm = weather === "storm";
  const raining = weather === "rain" || storm;
  if (typeof mapTrompetteReady === "function" && mapTrompetteReady()) {
    drawBgPlagePng(performance.now() / 1000, raining, storm);
    return;
  }
  drawBgPlageCanvas(raining, storm);
}

/** Resort Doré PNG (Trompette) — un fond + FX sable en code. */
function drawBgPlagePng(t, raining, storm) {
  const p = SPRITES.mapTrompette;

  if (spriteReady(p.far)) {
    ctx.globalAlpha = storm ? 0.7 : 0.9;
    drawImgCoverBottom(p.far, 0, 0, W, GROUND_Y, 0);
    ctx.globalAlpha = 1;
  }
  if (spriteReady(p.skyline)) drawImgCoverBottom(p.skyline, 0, 0, W, GROUND_Y, 0);

  if (storm) {
    ctx.fillStyle = "rgba(140,110,50,0.28)";
    ctx.fillRect(0, 0, W, GROUND_Y);
  } else if (raining) {
    ctx.fillStyle = "rgba(180,140,60,0.14)";
    ctx.fillRect(0, 0, W, GROUND_Y);
  }

  // Public désactivé pour l’instant (pas de crowd_0 / pas de drawCrowd)

  // Sol sable jouable
  const sand = ctx.createLinearGradient(0, GROUND_Y - 38, 0, H);
  if (raining) {
    sand.addColorStop(0, "#c9a25a");
    sand.addColorStop(1, "#a07f3f");
  } else {
    sand.addColorStop(0, "#f4d58d");
    sand.addColorStop(1, "#d9b25f");
  }
  ctx.fillStyle = sand;
  ctx.fillRect(0, GROUND_Y - 37, W, H - GROUND_Y + 37);
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(0, GROUND_Y, W, 2);

  // barrière dorée au bord du terrain
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(0, GROUND_Y - 41, W, 4);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(0, GROUND_Y - 41, W, 1);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, GROUND_Y - 37, W, 1);

  // Vaguelettes
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 8) {
    const y = GROUND_Y - 34 + Math.sin(x / 26 + t * 2) * 2;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Pas de palmier « prop » : le fond du resort a déjà ses palmiers géants —
  // le doublon miniature au premier plan cassait la perspective.
  if (!spriteReady(p.far) && !spriteReady(p.skyline)) drawPalm(52, storm);

  // Drapeau de green (droite) — à l'échelle d'un vrai drapeau de golf
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.2) * 2;
    drawMapProp(p.flag, 845, GROUND_Y + 2 + bob, 88);
  }

  // Voiturette (event ou idle décoratif)
  drawResortCart(t);

  if (raining) drawSandstorm(storm ? 1 : 0.55);
  drawMapEventOverlay();
}

function drawResortCart(t) {
  const p = SPRITES.mapTrompette;
  if (!p || (!spriteReady(p.cart) && !spriteReady(p.cartHorn))) return;
  if (typeof mapEvent === "undefined") return;
  // Une seule position continue (mapEvent.cartX) — plus de teleport idle ↔ event
  const cx = mapEvent.cartX;
  if (cx < -70 || cx > W + 70) return;
  const horn = !mapEventsQuiet &&
    (mapEvent.phase === "fire" || (mapEvent.phase === "flying" && mapEvent.t < 18));
  const img = horn && spriteReady(p.cartHorn) ? p.cartHorn : p.cart;
  // fondu aux bords pour éviter l'apparition/disparition sèche
  let a = 1;
  if (cx < 50) a = Math.max(0, (cx + 70) / 120);
  if (cx > W - 50) a = Math.min(a, Math.max(0, (W + 70 - cx) / 120));
  ctx.save();
  ctx.globalAlpha = a;
  drawMapProp(img, cx, GROUND_Y + 2, 92);
  ctx.restore();
}

function drawBgPlageCanvas(raining, storm) {
  const sun = celestialPos();

  // ciel : bleu clair par beau temps, voilé d'ocre pendant la tempête de sable
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  if (storm) {
    sky.addColorStop(0, "#8a6a3f");
    sky.addColorStop(1, "#c2a367");
  } else if (raining) {
    sky.addColorStop(0, "#a68a58");
    sky.addColorStop(1, "#d8c088");
  } else {
    sky.addColorStop(0, "#4da6e8");
    sky.addColorStop(1, "#bfe6ff");
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);

  // parallaxe : collines côtières lointaine (bleutée) + intermédiaire, noyées dans le sable en l'air
  drawHillLayer(GROUND_Y - 100, storm ? "#8f7a52" : raining ? "#b8a374" : "#a9d4ec", 0.12,
    [[110, GROUND_Y - 150], [300, GROUND_Y - 118], [470, GROUND_Y - 162], [660, GROUND_Y - 122], [820, GROUND_Y - 152]]);
  drawHillLayer(GROUND_Y - 92, storm ? "#7c6a48" : raining ? "#a08e64" : "#7fbfe0", 0.3,
    [[180, GROUND_Y - 128], [380, GROUND_Y - 104], [560, GROUND_Y - 134], [760, GROUND_Y - 108]]);

  // soleil (dérive lente) — voilé de sable, presque invisible pendant la tempête
  if (!storm) {
    const halo = raining ? 0.15 : 0.35;
    ctx.fillStyle = "rgba(255,230,128," + halo + ")";
    ctx.beginPath(); ctx.arc(sun.x, sun.y, 52, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = raining ? "rgba(255,225,170,0.6)" : "#ffe680";
    ctx.beginPath(); ctx.arc(sun.x, sun.y, 38, 0, Math.PI * 2); ctx.fill();
  }

  drawClouds(storm ? "rgba(150,120,75,0.9)" : raining ? "rgba(210,185,135,0.8)" : "rgba(255,255,255,0.85)");

  // Public Resort désactivé pour l’instant (ni PNG ni canvas)

  // mer au loin (plus sombre sous l'orage)
  ctx.fillStyle = storm ? "#1f4c6b" : "#2e86c1";
  ctx.fillRect(0, GROUND_Y - 55, W, 18);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(0, GROUND_Y - 55, W, 3);

  // sable : clair par beau temps, terni/voilé de poussière pendant la tempête
  const sand = ctx.createLinearGradient(0, GROUND_Y - 38, 0, H);
  if (raining) {
    sand.addColorStop(0, "#c9a25a");
    sand.addColorStop(1, "#a07f3f");
  } else {
    sand.addColorStop(0, "#f4d58d");
    sand.addColorStop(1, "#d9b25f");
  }
  ctx.fillStyle = sand;
  ctx.fillRect(0, GROUND_Y - 37, W, H - GROUND_Y + 37);
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(0, GROUND_Y, W, 2);

  // grains de sable (positions fixes, purement décoratif)
  ctx.fillStyle = "rgba(120,90,30,0.18)";
  for (let i = 0; i < 42; i++) {
    const gx = (i * 193.7) % W;
    const gy = GROUND_Y + 4 + (i * 37.3) % (H - GROUND_Y - 10);
    ctx.fillRect(gx, gy, 2, 2);
  }

  // vaguelettes d'écume animées au bord de l'eau
  const tw = performance.now() / 1000;
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 8) {
    const y = GROUND_Y - 38 + Math.sin(x / 26 + tw * 2) * 2;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  drawPalm(52, storm);
  drawSkyBirds();
  if (raining) drawSandstorm(storm ? 1 : 0.55);
}

// palmier qui se balance doucement (plus fort sous l'orage)
function drawPalm(px, storm) {
  const t = performance.now() / 1000;
  const sway = Math.sin(t * (storm ? 3 : 0.8)) * (storm ? 6 : 2.5);
  const topY = GROUND_Y - 148;
  // interactif : la cime est repoussée quand la balle passe tout près
  const bd = Math.hypot((px + 16) - ball.x, topY - ball.y);
  const bend = bd < 95 ? (1 - bd / 95) * ((px + 16) >= ball.x ? 16 : -16) : 0;
  const topX = px + 16 + sway + bend;
  ctx.save();
  // tronc courbé
  ctx.strokeStyle = "#8d6e63";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(px - 6, GROUND_Y - 30);
  ctx.quadraticCurveTo(px + 2, GROUND_Y - 95, topX, topY);
  ctx.stroke();
  // anneaux du tronc
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 2;
  for (let i = 1; i <= 4; i++) {
    const ty = GROUND_Y - 30 - i * 24;
    ctx.beginPath();
    ctx.moveTo(px - 9 + i, ty);
    ctx.lineTo(px + 1 + i, ty - 4);
    ctx.stroke();
  }
  // palmes en éventail
  ctx.strokeStyle = "#2e7d32";
  ctx.lineWidth = 5;
  for (let i = 0; i < 6; i++) {
    const ang = -Math.PI * 0.15 - i * 0.35 + sway * 0.02;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(ang) * 30, topY + Math.sin(ang) * 30 - 12,
      topX + Math.cos(ang) * 52, topY + Math.sin(ang) * 52 + 10
    );
    ctx.stroke();
  }
  // noix de coco
  ctx.fillStyle = "#5d4037";
  for (const [ox, oy] of [[-5, 4], [4, 6]]) {
    ctx.beginPath(); ctx.arc(topX + ox, topY + oy, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** Dessine une image en couvrant [dx,dy,dw,dh], alignée en bas (sol). */
function drawImgCoverBottom(img, dx, dy, dw, dh, parallaxX) {
  const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
  if (!sw || !sh) return;
  const scale = Math.max(dw / sw, dh / sh);
  const tw = sw * scale, th = sh * scale;
  const ox = dx + (dw - tw) / 2 + (parallaxX || 0);
  const oy = dy + dh - th;
  ctx.drawImage(img, ox, oy, tw, th);
}

/** Prop ancré aux pieds (x centre, y = ligne de sol). */
function drawMapProp(img, x, footY, drawH) {
  if (!spriteReady(img)) return;
  const aspect = img.naturalWidth / img.naturalHeight;
  const h = drawH, w = h * aspect;
  ctx.drawImage(img, x - w / 2, footY - h, w, h);
}

function drawBgNeigePng(t, heavy, blizzard) {
  const p = SPRITES.mapVladou;

  // Un seul fond (skyline) — la météo se joue en overlays code, pas en 2e PNG
  if (spriteReady(p.far)) {
    ctx.globalAlpha = 0.85;
    drawImgCoverBottom(p.far, 0, 0, W, GROUND_Y, 0);
    ctx.globalAlpha = 1;
  }
  if (spriteReady(p.skyline)) drawImgCoverBottom(p.skyline, 0, 0, W, GROUND_Y, 0);

  // Voile météo sur le décor (ciel plus plombé sans changer d'image)
  if (blizzard) {
    ctx.fillStyle = "rgba(90,110,130,0.28)";
    ctx.fillRect(0, 0, W, GROUND_Y);
  } else if (heavy) {
    ctx.fillStyle = "rgba(120,140,165,0.14)";
    ctx.fillRect(0, 0, W, GROUND_Y);
  }

  // Tribune fixe (un seul PNG — pas de swap crowd_0/1) et plus en retrait
  if (spriteReady(p.crowd0)) {
    const crowd = p.crowd0;
    const sw = crowd.naturalWidth || crowd.width;
    const sh = crowd.naturalHeight || crowd.height;
    const srcH = Math.max(1, Math.floor(sh * 0.34)); // bande foule en haut
    const cw = W * 0.78;
    const ch = Math.min(78, cw * (srcH / sw) * 1.15);
    const cx = (W - cw) / 2;
    const cy = GROUND_Y - 118 - ch; // plus haut = plus loin du terrain
    ctx.globalAlpha = blizzard ? 0.7 : 0.88;
    ctx.drawImage(crowd, 0, 0, sw, srcH, cx, cy, cw, ch);
    ctx.globalAlpha = 1;
  }

  // Sol jouable (bande sous les pieds)
  const snow = ctx.createLinearGradient(0, GROUND_Y - 38, 0, H);
  snow.addColorStop(0, "#fbfdff");
  snow.addColorStop(1, "#d7e4ee");
  ctx.fillStyle = snow;
  ctx.fillRect(0, GROUND_Y - 37, W, H - GROUND_Y + 37);
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0, GROUND_Y, W, 2);

  // Canon d'apparat (gauche) — idle / tir piloté par l'événement de map
  const firing = typeof mapEvent !== "undefined" &&
    (mapEvent.phase === "fire" || (mapEvent.phase === "flying" && mapEvent.t < 8));
  drawMapProp(firing && spriteReady(p.cannonFire) ? p.cannonFire : p.cannon, 78, GROUND_Y + 2, 78);

  // Bonhomme de neige (droite) — se baisse quand la balle approche
  if (spriteReady(p.snowman)) {
    const sx = 838;
    const sbd = Math.hypot(sx - ball.x, (GROUND_Y - 40) - ball.y);
    const duck = sbd < 90 ? (1 - sbd / 90) * 10 : 0;
    drawMapProp(p.snowman, sx, GROUND_Y + 2 + duck, 86 - duck * 0.3);
  }

  // Neige / blizzard animés en code (un seul décor)
  drawNeigeWeatherFX(t, heavy, blizzard);

  drawMapEventOverlay();
}

/** Flocons, rafales et voile — météo Place Grand-Rouge sans 2e fond PNG. */
function drawNeigeWeatherFX(t, heavy, blizzard) {
  const flakes = blizzard ? 220 : heavy ? 120 : 48;
  const wind = blizzard ? 95 : heavy ? 28 : 4;
  const spd = blizzard ? 2.2 : heavy ? 1.45 : 1;

  // Rafales horizontales (blizzard)
  if (blizzard || heavy) {
    const n = blizzard ? 28 : 10;
    ctx.strokeStyle = blizzard ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)";
    ctx.lineWidth = blizzard ? 1.6 : 1;
    ctx.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const fy = ((i * 67.1 + t * (40 + (i % 5) * 10)) % (GROUND_Y + 10));
      const fx = ((i * 131.7 + t * (80 + wind) + Math.sin(t * 2 + i) * 30) % (W + 120)) - 60;
      const len = blizzard ? 28 + (i % 5) * 8 : 14 + (i % 3) * 5;
      ctx.globalAlpha = 0.25 + (i % 4) * 0.08;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx - len, fy + 3 + (i % 3));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Flocons
  ctx.fillStyle = "#fff";
  for (let i = 0; i < flakes; i++) {
    const fx = ((i * 97.3 + t * (18 + (i % 5) * 6) * spd + wind * t + Math.sin(t + i) * 12) % (W + 40)) - 20;
    const fy = (i * 53.7 + t * (30 + (i % 7) * 8) * spd) % (GROUND_Y + 20);
    ctx.globalAlpha = 0.4 + (i % 4) * 0.14;
    const r = blizzard ? 1.4 + (i % 4) * 0.7 : 1.2 + (i % 3);
    ctx.beginPath();
    ctx.arc(fx, fy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Brume blanche / voile de blizzard
  if (blizzard) {
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(0, 0, W, GROUND_Y);
    // bande basse un peu plus dense (rafales au sol)
    const mist = ctx.createLinearGradient(0, GROUND_Y - 90, 0, GROUND_Y);
    mist.addColorStop(0, "rgba(255,255,255,0)");
    mist.addColorStop(1, "rgba(255,255,255,0.22)");
    ctx.fillStyle = mist;
    ctx.fillRect(0, GROUND_Y - 90, W, 90);
  } else if (heavy) {
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(0, 0, W, GROUND_Y);
  }
}

/** Warn + projectiles (canon Place Grand-Rouge / voiturette Resort Doré). */
function drawMapEventOverlay() {
  if (typeof mapEvent === "undefined" || mapEventsQuiet || !mapEventActiveTerrain()) return;
  const kind = typeof mapEventKind === "function" ? mapEventKind() : "cannon";
  const pVlad = (typeof SPRITES !== "undefined" && SPRITES.mapVladou) ? SPRITES.mapVladou : null;
  const pResort = (typeof SPRITES !== "undefined" && SPRITES.mapTrompette) ? SPRITES.mapTrompette : null;
  const pWarn = kind === "cart" ? pResort : pVlad;

  if (mapEvent.phase === "warn" || (kind === "cart" && (mapEvent.phase === "fire" || mapEvent.phase === "flying"))) {
    // Zone dangereuse au sol (Resort) + alerte filet
    if (kind === "cart" && mapEvent.zoneX) {
      const pulse = 0.35 + 0.25 * Math.sin((mapEvent.t || 0) * 0.35);
      const zx = mapEvent.zoneX, zw = mapEvent.zoneW || 150;
      ctx.fillStyle = "rgba(255,193,7," + pulse.toFixed(2) + ")";
      ctx.fillRect(zx - zw / 2, GROUND_Y - 36, zw, 34);
      ctx.strokeStyle = "rgba(255,87,34,0.85)";
      ctx.lineWidth = 2;
      ctx.strokeRect(zx - zw / 2, GROUND_Y - 36, zw, 34);
    }
  }

  if (mapEvent.phase === "warn") {
    const pulse = 0.7 + 0.3 * Math.sin(mapEvent.t * 0.35);
    const bob = Math.sin(mapEvent.t * 0.28) * 3;
    const wx = NET_X;
    const wy = NET_TOP - 6 + bob;
    ctx.save();
    ctx.globalAlpha = pulse;
    if (pWarn && spriteReady(pWarn.warn)) {
      const wh = 36;
      ctx.drawImage(pWarn.warn, wx - wh / 2, wy - wh, wh, wh);
    } else {
      ctx.fillStyle = kind === "cart" ? "#ff9800" : "#e53935";
      ctx.beginPath();
      ctx.moveTo(wx, wy - 28);
      ctx.lineTo(wx - 14, wy);
      ctx.lineTo(wx + 14, wy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("!", wx, wy - 6);
    }
    ctx.restore();
  }

  if (mapEvent.phase === "fire" || mapEvent.phase === "flying") {
    if (mapEvent.phase === "fire" && mapEvent.t < 1) return;
    if (kind === "cart") {
      if (mapEvent.balls && mapEvent.balls.length) {
        for (const b of mapEvent.balls) {
          if (!b.dead) drawGolfBall(b.x, b.y);
        }
      }
    } else {
      drawCannonShotBall(mapEvent.x, mapEvent.y, mapEvent.vx, mapEvent.vy);
    }
  }
}

function drawGolfBall(x, y) {
  const r = 9;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(x + 1, y + 3, r * 0.9, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#bdbdbd";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  for (let i = 0; i < 5; i++) {
    const a = i * 1.1;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 3.5, y + Math.sin(a) * 3.5, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Boulet bien rond et lisible (le PNG shot a un fond noir + ratio 512×335). */
function drawCannonShotBall(x, y, vx, vy) {
  const r = MAP_SHOT_R;
  ctx.save();
  // ombre
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 4, r * 0.95, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // corps
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
  g.addColorStop(0, "#6a6a6a");
  g.addColorStop(0.45, "#2f2f2f");
  g.addColorStop(1, "#0c0c0c");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.stroke();
  // reflet
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.3, y - r * 0.32, r * 0.32, r * 0.2, -0.55, 0, Math.PI * 2);
  ctx.fill();
  // mèche + flamme (direction opposée à la vitesse)
  const ang = Math.atan2(-(vy || 0), -(vx || 1));
  const fx = x + Math.cos(ang) * (r * 0.85);
  const fy = y + Math.sin(ang) * (r * 0.85);
  ctx.strokeStyle = "#6d4c2b";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(ang) * (r * 0.55), y + Math.sin(ang) * (r * 0.55));
  ctx.lineTo(fx, fy);
  ctx.stroke();
  ctx.fillStyle = "#ff9800";
  ctx.beginPath();
  ctx.arc(fx, fy, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe082";
  ctx.beginPath();
  ctx.arc(fx - 0.5, fy - 0.5, 2, 0, Math.PI * 2);
  ctx.fill();
  // traînée
  ctx.fillStyle = "rgba(255,140,40,0.35)";
  ctx.beginPath();
  ctx.arc(x - (vx || 0) * 0.8, y - (vy || 0) * 0.5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBgNeige() {
  const t = performance.now() / 1000;
  const heavy = weather === "rain";    // chute de neige soutenue
  const blizzard = weather === "storm"; // blizzard

  // Place Grand-Rouge PNG (Vladou) — fallback canvas si pas encore chargé
  if (typeof mapVladouReady === "function" && mapVladouReady()) {
    drawBgNeigePng(t, heavy, blizzard);
    return; // overlay event déjà dessiné dans drawBgNeigePng
  }

  // ciel pâle, plombé quand il neige fort / blizzard
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  if (blizzard) { sky.addColorStop(0, "#7d8ea0"); sky.addColorStop(1, "#b9c9d8"); }
  else if (heavy) { sky.addColorStop(0, "#93aac2"); sky.addColorStop(1, "#d3e2ef"); }
  else { sky.addColorStop(0, "#a8c4dd"); sky.addColorStop(1, "#e9f4fc"); }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);

  // soleil voilé (dérive lente) — caché par le blizzard
  if (!blizzard) {
    const sunN = celestialPos();
    ctx.fillStyle = heavy ? "rgba(255,250,230,0.45)" : "rgba(255,250,230,0.7)";
    ctx.beginPath(); ctx.arc(sunN.x, sunN.y, 32, 0, Math.PI * 2); ctx.fill();
  }

  drawClouds(blizzard ? "rgba(200,210,220,0.9)" : "rgba(255,255,255,0.7)");

  // parallaxe : chaîne très lointaine (pâle) + chaîne intermédiaire, derrière
  // les montagnes proches → trois plans de relief qui glissent à des vitesses
  // différentes selon la balle.
  drawHillLayer(GROUND_Y - 95, "#eaf2fb", 0.1,
    [[90, GROUND_Y - 165], [280, GROUND_Y - 120], [470, GROUND_Y - 188], [680, GROUND_Y - 128], [860, GROUND_Y - 170]]);
  drawHillLayer(GROUND_Y - 78, "#d3e2f0", 0.28,
    [[160, GROUND_Y - 122], [360, GROUND_Y - 96], [560, GROUND_Y - 126], [780, GROUND_Y - 100]]);

  // montagnes
  ctx.fillStyle = "#dfe9f2";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 55);
  ctx.lineTo(150, GROUND_Y - 170); ctx.lineTo(320, GROUND_Y - 55);
  ctx.lineTo(430, GROUND_Y - 140); ctx.lineTo(600, GROUND_Y - 55);
  ctx.lineTo(720, GROUND_Y - 185); ctx.lineTo(W, GROUND_Y - 55);
  ctx.closePath();
  ctx.fill();

  // tribunes (devant les montagnes)
  drawCrowd();

  // lac gelé
  ctx.fillStyle = "#a8cfe3";
  ctx.fillRect(0, GROUND_Y - 55, W, 18);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(0, GROUND_Y - 55, W, 3);

  // neige au sol
  const snow = ctx.createLinearGradient(0, GROUND_Y - 38, 0, H);
  snow.addColorStop(0, "#fbfdff");
  snow.addColorStop(1, "#d7e4ee");
  ctx.fillStyle = snow;
  ctx.fillRect(0, GROUND_Y - 37, W, H - GROUND_Y + 37);
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0, GROUND_Y, W, 2);

  // sapins
  for (const [px, sc] of [[50, 1], [110, 0.7], [815, 0.9]]) {
    ctx.fillStyle = "#2e5e46";
    for (let l = 0; l < 3; l++) {
      const w2 = (26 - l * 6) * sc, yTop = GROUND_Y - (52 - l * 14) * sc;
      ctx.beginPath();
      ctx.moveTo(px, yTop);
      ctx.lineTo(px - w2, yTop + 22 * sc);
      ctx.lineTo(px + w2, yTop + 22 * sc);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#5d4037";
    ctx.fillRect(px - 3 * sc, GROUND_Y - 10 * sc, 6 * sc, 10 * sc);
  }

  // bonhomme de neige — interactif : il rentre la tête quand la balle approche
  const sx = 862;
  const sbd = Math.hypot(sx - ball.x, (GROUND_Y - 30) - ball.y);
  const sy = GROUND_Y + (sbd < 80 ? (1 - sbd / 80) * 8 : 0);
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(sx, sy - 12, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx, sy - 34, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(sx - 3, sy - 36, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx + 3, sy - 36, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ff9800";
  ctx.beginPath();
  ctx.moveTo(sx, sy - 33); ctx.lineTo(sx + 9, sy - 31); ctx.lineTo(sx, sy - 29);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#5d4037";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(sx - 12, sy - 14); ctx.lineTo(sx - 22, sy - 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx + 12, sy - 14); ctx.lineTo(sx + 22, sy - 22); ctx.stroke();

  // flocons (positions dérivées du temps : aucun état à synchroniser).
  // Densité et vent selon la météo : léger / chute soutenue / blizzard.
  drawNeigeWeatherFX(t, heavy, blizzard);

  // Canon + event (fallback canvas — pas de PNG)
  if (typeof mapEvent !== "undefined") {
    const firing = mapEvent.phase === "fire" || (mapEvent.phase === "flying" && mapEvent.t < 8);
    ctx.fillStyle = firing ? "#4a3728" : "#3a2a1c";
    ctx.fillRect(52, GROUND_Y - 48, 52, 28);
    ctx.beginPath();
    ctx.ellipse(104, GROUND_Y - 40, 22, 12, -0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  drawMapEventOverlay();
}

// aurore boréale : rubans lumineux ondoyants (fondu additif → effet de lueur).

function drawBgPrairie() {
  const t = performance.now() / 1000;
  const storm = weather === "storm";
  const raining = weather === "rain" || storm;

  if (typeof mapMicronReady === "function" && mapMicronReady()) {
    drawBgPrairiePng(t, raining, storm);
    return;
  }

  // ciel : bleu vif par beau temps, verdâtre plombé à l'orage
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  if (storm) {
    sky.addColorStop(0, "#4a5245");
    sky.addColorStop(1, "#7c8a6f");
  } else if (raining) {
    sky.addColorStop(0, "#7d9a7a");
    sky.addColorStop(1, "#b8d0a8");
  } else {
    sky.addColorStop(0, "#57b8ea");
    sky.addColorStop(1, "#c9ecff");
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);

  // collines verdoyantes en parallaxe (lointaine puis intermédiaire)
  drawHillLayer(GROUND_Y - 100, storm ? "#5c6b4a" : raining ? "#8fa876" : "#a8d67e", 0.12,
    [[100, GROUND_Y - 148], [290, GROUND_Y - 116], [480, GROUND_Y - 160], [670, GROUND_Y - 120], [830, GROUND_Y - 150]]);
  drawHillLayer(GROUND_Y - 90, storm ? "#4a5c3a" : raining ? "#7d9a62" : "#7ec654", 0.3,
    [[170, GROUND_Y - 122], [370, GROUND_Y - 100], [550, GROUND_Y - 130], [770, GROUND_Y - 104]]);

  // arc-en-ciel : quand il pleut mais que le soleil reste visible
  if (raining && sunVisible() && !storm) drawRainbow();

  // soleil (dérive lente) — voilé sous la pluie, masqué à l'orage
  if (!storm) {
    const sun = celestialPos();
    const halo = raining ? 0.18 : 0.35;
    ctx.fillStyle = "rgba(255,250,180," + halo + ")";
    ctx.beginPath(); ctx.arc(sun.x, sun.y, 50, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = raining ? "rgba(255,250,210,0.75)" : "#fff2a0";
    ctx.beginPath(); ctx.arc(sun.x, sun.y, 36, 0, Math.PI * 2); ctx.fill();
  }

  drawClouds(storm ? "rgba(90,100,90,0.9)" : raining ? "rgba(220,225,210,0.85)" : "rgba(255,255,255,0.9)");

  // tribunes
  drawCrowd();

  // clôture en bois au loin (remplace la mer/le lac des autres terrains)
  ctx.strokeStyle = storm ? "#5a4530" : "#7a5c3c";
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y - 46); ctx.lineTo(W, GROUND_Y - 46); ctx.stroke();
  ctx.lineWidth = 3;
  for (let px = 20; px < W; px += 70) {
    ctx.beginPath(); ctx.moveTo(px, GROUND_Y - 58); ctx.lineTo(px, GROUND_Y - 36); ctx.stroke();
  }

  // herbe : vive par beau temps, sombre et terne sous la pluie
  const grass = ctx.createLinearGradient(0, GROUND_Y - 38, 0, H);
  if (raining) { grass.addColorStop(0, "#5a7a3e"); grass.addColorStop(1, "#425c2c"); }
  else { grass.addColorStop(0, "#7ed957"); grass.addColorStop(1, "#5aab3c"); }
  ctx.fillStyle = grass;
  ctx.fillRect(0, GROUND_Y - 37, W, H - GROUND_Y + 37);
  if (raining) {
    // flaques luisantes sur l'herbe détrempée
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(0, GROUND_Y, W, 6);
  }
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, GROUND_Y, W, 2);

  // brins d'herbe (positions fixes, purement décoratif) qui se penchent
  ctx.strokeStyle = raining ? "rgba(30,50,15,0.5)" : "rgba(40,90,20,0.45)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 50; i++) {
    const gx = (i * 173.3) % W;
    const gy = GROUND_Y + 3 + (i * 31.1) % (H - GROUND_Y - 8);
    const lean = Math.sin(t * 2 + i) * 2;
    ctx.beginPath(); ctx.moveTo(gx, gy + 5); ctx.lineTo(gx + lean, gy - 3); ctx.stroke();
  }

  // trèfles à trois feuilles, éparpillés dans l'herbe
  ctx.fillStyle = raining ? "#4a6a34" : "#5fae3f";
  for (let i = 0; i < 10; i++) {
    const cx2 = (i * 251.7) % W;
    const cy2 = GROUND_Y + 8 + (i * 47.3) % (H - GROUND_Y - 14);
    for (const [ox, oy] of [[-2.5, 0], [2.5, 0], [0, -2.5]]) {
      ctx.beginPath(); ctx.ellipse(cx2 + ox, cy2 + oy, 2.2, 1.6, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawCarrotPatch(60, storm);
  drawHayBale(W - 60);
  drawButterflies();
  if (raining) drawRain(storm ? 1 : 0.55);
}

/** Esplanade du Défilé — fond PNG Houn. */
function drawBgParade() {
  const t = performance.now() / 1000;
  const storm = weather === "storm";
  const raining = weather === "rain" || storm;
  if (typeof mapHounReady === "function" && mapHounReady()) {
    drawBgParadePng(t, raining, storm);
    return;
  }
  // fallback minimal
  ctx.fillStyle = "#8a9aaa";
  ctx.fillRect(0, 0, W, GROUND_Y);
  drawCrowd();
  ctx.fillStyle = "#7a8088";
  ctx.fillRect(0, GROUND_Y - 37, W, H - GROUND_Y + 37);
  if (raining) drawRain(storm ? 1 : 0.55);
}

function drawBgParadePng(t, raining, storm) {
  const p = SPRITES.mapHoun;

  if (spriteReady(p.far)) {
    ctx.globalAlpha = storm ? 0.55 : 0.75;
    drawImgCoverBottom(p.far, 0, 0, W, GROUND_Y, 0);
    ctx.globalAlpha = 1;
  }
  if (spriteReady(p.skyline)) drawImgCoverBottom(p.skyline, 0, 0, W, GROUND_Y, 0);

  if (storm) {
    ctx.fillStyle = "rgba(60,70,80,0.35)";
    ctx.fillRect(0, 0, W, GROUND_Y);
  } else if (raining) {
    ctx.fillStyle = "rgba(90,100,110,0.16)";
    ctx.fillRect(0, 0, W, GROUND_Y);
  }

  // Public calque désactivé (déjà dans le skyline)

  // Sol pavé
  const pave = ctx.createLinearGradient(0, GROUND_Y - 38, 0, H);
  if (raining) {
    pave.addColorStop(0, "#6a7078");
    pave.addColorStop(1, "#4a5058");
  } else {
    pave.addColorStop(0, "#9aa2aa");
    pave.addColorStop(1, "#7a828a");
  }
  ctx.fillStyle = pave;
  ctx.fillRect(0, GROUND_Y - 37, W, H - GROUND_Y + 37);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, GROUND_Y, W, 2);

  // bordure rouge / or
  ctx.fillStyle = "#c62828";
  ctx.fillRect(0, GROUND_Y - 41, W, 3);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(0, GROUND_Y - 38, W, 1);

  // Bannière
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.1) * 2;
    drawMapProp(p.flag, 78, GROUND_Y + 2 + bob, 100);
    ctx.save();
    ctx.translate(W - 78, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, 100);
    ctx.restore();
  }

  // Bouquets
  if (spriteReady(p.flower)) {
    drawMapProp(p.flower, 200, GROUND_Y + 2, 42);
    drawMapProp(p.flower, W - 200, GROUND_Y + 2, 40);
  }

  // Radar décoratif (gauche) — idle / « actif » léger
  if (spriteReady(p.radar)) {
    const ping = Math.sin(t * 4) > 0.65 && spriteReady(p.radarActive);
    drawMapProp(ping ? p.radarActive : p.radar, 130, GROUND_Y + 2, 70);
  }

  if (raining) drawRain(storm ? 1 : 0.55);
  drawMapEventOverlay();
}

/** Palais de l'Hexagone — fond PNG Micron. */
function drawBgPrairiePng(t, raining, storm) {
  const p = SPRITES.mapMicron;

  // far optionnel (scène différente) : léger voile seulement
  if (spriteReady(p.far)) {
    ctx.globalAlpha = storm ? 0.35 : 0.45;
    drawImgCoverBottom(p.far, 0, 0, W, GROUND_Y, 0);
    ctx.globalAlpha = 1;
  }
  if (spriteReady(p.skyline)) drawImgCoverBottom(p.skyline, 0, 0, W, GROUND_Y, 0);

  if (storm) {
    ctx.fillStyle = "rgba(70,80,90,0.32)";
    ctx.fillRect(0, 0, W, GROUND_Y);
  } else if (raining) {
    ctx.fillStyle = "rgba(100,120,130,0.16)";
    ctx.fillRect(0, 0, W, GROUND_Y);
  }

  // Public PNG désactivé pour l’instant (même raison que Resort)

  // Sol graviers / cour jouable
  const gravel = ctx.createLinearGradient(0, GROUND_Y - 38, 0, H);
  if (raining) {
    gravel.addColorStop(0, "#9a9080");
    gravel.addColorStop(1, "#6e6558");
  } else {
    gravel.addColorStop(0, "#d2c4a8");
    gravel.addColorStop(1, "#b5a68a");
  }
  ctx.fillStyle = gravel;
  ctx.fillRect(0, GROUND_Y - 37, W, H - GROUND_Y + 37);
  ctx.fillStyle = "rgba(0,0,0,0.07)";
  ctx.fillRect(0, GROUND_Y, W, 2);

  // bordure institutionnelle
  ctx.fillStyle = "#1a237e";
  ctx.fillRect(0, GROUND_Y - 41, W, 3);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(0, GROUND_Y - 38, W, 1);

  // Drapeaux (gauche / droite)
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.4) * 2;
    drawMapProp(p.flag, 70, GROUND_Y + 2 + bob, 96);
    ctx.save();
    ctx.translate(W - 70, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, 96);
    ctx.restore();
  }

  // Pigeons décoratifs
  if (spriteReady(p.pigeon)) {
    const bob1 = Math.sin(t * 3.1) * 1.5;
    const bob2 = Math.sin(t * 2.7 + 1.2) * 1.5;
    drawMapProp(p.pigeon, 160, GROUND_Y - 2 + bob1, 28);
    drawMapProp(p.pigeon, W - 180, GROUND_Y - 4 + bob2, 26);
  }

  if (raining) drawRain(storm ? 1 : 0.55);
  drawMapEventOverlay();
}

// touffe de carottes plantées dans l'herbe (décor)
function drawCarrotPatch(px, storm) {
  const t = performance.now() / 1000;
  const sway = Math.sin(t * (storm ? 3 : 1)) * (storm ? 4 : 1.5);
  for (const [ox, h] of [[-14, 26], [-4, 32], [8, 24], [16, 30]]) {
    const topX = px + ox + sway, topY = GROUND_Y - 34 - h;
    ctx.strokeStyle = "#2e7d32";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    for (const spread of [-4, 0, 4]) {
      ctx.beginPath();
      ctx.moveTo(px + ox, GROUND_Y - 34);
      ctx.quadraticCurveTo(px + ox + spread * 0.5 + sway * 0.5, topY + 8, topX + spread, topY);
      ctx.stroke();
    }
    // petit sommet de carotte affleurant (orange)
    ctx.fillStyle = "#ff9800";
    ctx.beginPath();
    ctx.moveTo(px + ox - 4, GROUND_Y - 34);
    ctx.lineTo(px + ox + 4, GROUND_Y - 34);
    ctx.lineTo(px + ox, GROUND_Y - 26);
    ctx.closePath();
    ctx.fill();
  }
}

// botte de foin ronde, décorative
function drawHayBale(px) {
  const py = GROUND_Y - 24;
  ctx.fillStyle = "#d4a843";
  ctx.beginPath(); ctx.arc(px, py, 26, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(120,85,20,0.5)";
  ctx.lineWidth = 2;
  for (const a of [-0.6, 0, 0.6]) {
    ctx.beginPath();
    ctx.arc(px, py, 26, Math.PI * 0.5 + a - 0.25, Math.PI * 0.5 + a + 0.25);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(120,85,20,0.7)";
  ctx.beginPath(); ctx.moveTo(px - 26, py); ctx.lineTo(px + 26, py); ctx.stroke();
}



/** Poteau PNG du terrain courant, ou null → fallback canvas. */
function terrainNetPostImg() {
  const key = TERRAINS[terrain].key;
  if (key === "neige" && SPRITES.mapVladou && spriteReady(SPRITES.mapVladou.netPost)) {
    return SPRITES.mapVladou.netPost;
  }
  if (key === "plage" && SPRITES.mapTrompette && spriteReady(SPRITES.mapTrompette.netPost)) {
    return SPRITES.mapTrompette.netPost;
  }
  if (key === "prairie" && SPRITES.mapMicron && spriteReady(SPRITES.mapMicron.netPost)) {
    return SPRITES.mapMicron.netPost;
  }
  if (key === "parade" && SPRITES.mapHoun && spriteReady(SPRITES.mapHoun.netPost)) {
    return SPRITES.mapHoun.netPost;
  }
  return null;
}

function drawNet() {
  // Uniforme : poteau PNG centré sur NET_X, sans maille. Sinon poteau canvas.
  const img = terrainNetPostImg();

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(NET_X, GROUND_Y + 4, img ? 18 : 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (img) {
    const drawH = (GROUND_Y - NET_TOP) + 42;
    const aspect = (img.naturalWidth || img.width) / Math.max(1, img.naturalHeight || img.height);
    const drawW = drawH * aspect * 0.8;
    ctx.drawImage(img, NET_X - drawW / 2, GROUND_Y - drawH + 2, drawW, drawH);
    return;
  }

  // Fallback canvas (pas de pack poteau)
  const pg = ctx.createLinearGradient(NET_X - NET_W / 2, 0, NET_X + NET_W / 2, 0);
  pg.addColorStop(0, "#a1887f");
  pg.addColorStop(0.45, "#8d6e63");
  pg.addColorStop(1, "#5d4037");
  ctx.fillStyle = pg;
  ctx.fillRect(NET_X - NET_W / 2, NET_TOP, NET_W, GROUND_Y - NET_TOP);
  const kg = ctx.createRadialGradient(NET_X - 2, NET_TOP - 2, 1, NET_X, NET_TOP, NET_W / 2 + 4);
  kg.addColorStop(0, "#8d6e63");
  kg.addColorStop(1, "#4e342e");
  ctx.fillStyle = kg;
  ctx.beginPath(); ctx.arc(NET_X, NET_TOP, NET_W / 2 + 3, 0, Math.PI * 2); ctx.fill();
}

// ---------- Mode Bombe : dessin de la bombe ----------
function drawBomb() {
  const frac = Math.max(0, bombTimer) / (bombTime || BOMB_TIME); // 1 (pleine) → 0 (explosion)
  const danger = 1 - frac;
  const now = performance.now();

  // fumée de la mèche (réutilise la traînée de la balle)
  for (let i = 0; i < ball.trail.length; i++) {
    const t = ball.trail[i];
    const f = (i + 1) / ball.trail.length;
    ctx.fillStyle = "rgba(120,120,130," + (f * 0.18).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(t.x, t.y - BALL_R, BALL_R * (0.4 + f * 0.5), 0, Math.PI * 2); ctx.fill();
  }

  // ombre au sol
  const shScale = Math.max(0.3, 1 - (GROUND_Y - ball.y) / 400);
  ctx.fillStyle = "rgba(0,0,0," + (0.3 * shScale) + ")";
  ctx.beginPath();
  ctx.ellipse(ball.x, GROUND_Y + 6, BALL_R * shScale + 5, 5 * shScale + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // halo de danger rouge pulsé : de plus en plus rapide et large
  const pulse = 0.5 + 0.5 * Math.sin(now / (90 - danger * 66));
  const haloR = BALL_R + 6 + pulse * (4 + danger * 12);
  ctx.fillStyle = "rgba(255,50,40," + (0.12 + danger * 0.3 * pulse).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(ball.x, ball.y, haloR, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.angle * 0.4);
  // corps : sphère métallique sombre. Vire au rouge et clignote en fin de mèche.
  const flashRed = frac < 0.25 && Math.floor(now / 120) % 2 === 0;
  const bgrad = ctx.createRadialGradient(-4, -5, 2, 0, 0, BALL_R + 2);
  bgrad.addColorStop(0, flashRed ? "#ff6a5a" : "#5a5f6b");
  bgrad.addColorStop(0.6, flashRed ? "#c62a1c" : "#2b2f38");
  bgrad.addColorStop(1, flashRed ? "#7d160c" : "#15171c");
  ctx.fillStyle = bgrad;
  ctx.beginPath(); ctx.arc(0, 0, BALL_R + 1, 0, Math.PI * 2); ctx.fill();
  // reflet
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath(); ctx.ellipse(-5, -6, 3.5, 2.2, -0.6, 0, Math.PI * 2); ctx.fill();

  // embout (col) au sommet
  ctx.fillStyle = "#3a3d45";
  ctx.fillRect(-4, -BALL_R - 5, 8, 6);
  ctx.restore();

  // mèche + étincelle (repère fixe au sommet de la bombe)
  const capX = ball.x, capY = ball.y - BALL_R - 5;
  ctx.strokeStyle = "#8a6b3a";
  ctx.lineWidth = 2.4; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(capX, capY);
  ctx.quadraticCurveTo(capX + 8, capY - 10, capX + 3, capY - 18);
  ctx.stroke();
  // étincelle : scintille et grossit à mesure que la mèche se consume
  const sx = capX + 3, sy = capY - 18;
  const spark = 3 + danger * 3 + Math.random() * 2;
  ctx.fillStyle = "#fff3b0";
  ctx.beginPath(); ctx.arc(sx, sy, spark * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,150,0," + (0.6 + Math.random() * 0.4).toFixed(2) + ")";
  ctx.beginPath(); ctx.arc(sx, sy, spark, 0, Math.PI * 2); ctx.fill();
  // petites braises
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "rgba(255," + (120 + ((Math.random() * 120) | 0)) + ",0,0.9)";
    ctx.beginPath();
    ctx.arc(sx + (Math.random() - 0.5) * 10, sy - Math.random() * 8, 1 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBall() {
  // balle crevée : galette flasque dégonflée, sans traînée
  if (ball.popped) {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.fillStyle = "#e0b400";
    ctx.beginPath();
    ctx.ellipse(0, BALL_R * 0.4, BALL_R * 1.1, BALL_R * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b58a00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, BALL_R * 0.4, BALL_R * 1.1, BALL_R * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    // petits plis
    ctx.beginPath(); ctx.moveTo(-BALL_R * 0.6, BALL_R * 0.4); ctx.lineTo(-BALL_R * 0.2, BALL_R * 0.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(BALL_R * 0.5, BALL_R * 0.4); ctx.lineTo(BALL_R * 0.15, BALL_R * 0.15); ctx.stroke();
    ctx.restore();
    return;
  }
  // mode bombe : la balle est une bombe à mèche
  if (bombMode) { drawBomb(); return; }
  // traînée (enflammée pendant un smash destructeur)
  const fiery = ball.smash > 0;
  for (let i = 0; i < ball.trail.length; i++) {
    const t = ball.trail[i];
    const f = (i + 1) / ball.trail.length;
    ctx.fillStyle = fiery
      ? "rgba(255," + Math.floor(60 + f * 120) + ",0," + (f * 0.5).toFixed(2) + ")"
      : "rgba(255,204,0," + (f * 0.15).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(t.x, t.y, BALL_R * (0.5 + f * (fiery ? 0.8 : 0.5)), 0, Math.PI * 2); ctx.fill();
  }
  if (fiery) {
    // halo de feu autour de la balle
    ctx.fillStyle = "rgba(255,120,0,0.35)";
    ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R + 7, 0, Math.PI * 2); ctx.fill();
  }
  // lignes de vitesse quand la balle fuse (lecture de la vélocité → visuel pur)
  const bspd = Math.hypot(ball.vx, ball.vy);
  if (!ball.frozen && bspd > 9) {
    const inten = Math.min(1, (bspd - 9) / 12);
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(Math.atan2(ball.vy, ball.vx));
    ctx.strokeStyle = fiery ? "rgba(255,150,40," + (0.55 * inten).toFixed(2) + ")"
                            : "rgba(255,255,255," + (0.42 * inten).toFixed(2) + ")";
    ctx.lineCap = "round";
    for (let i = -1; i <= 1; i++) {
      const off = i * (BALL_R * 0.55);
      const len = 16 + inten * 26;
      ctx.lineWidth = 2.4 - Math.abs(i) * 0.7;
      ctx.beginPath();
      ctx.moveTo(-BALL_R - 2, off);
      ctx.lineTo(-BALL_R - 2 - len, off * 1.35);
      ctx.stroke();
    }
    ctx.restore();
  }
  // ombre
  const shScale = Math.max(0.3, 1 - (GROUND_Y - ball.y) / 400);
  ctx.fillStyle = "rgba(0,0,0," + (0.25 * shScale) + ")";
  ctx.beginPath();
  ctx.ellipse(ball.x, GROUND_Y + 6, BALL_R * shScale + 4, 5 * shScale + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.angle);
  const skin = BALL_SKINS[ballSkin];
  const spr = skin && skin.sprite ? SPRITES[skin.sprite] : null;
  if (spriteReady(spr)) {
    const d = BALL_R * 2.15; // léger débord pour que le trait noir du PNG colle au rayon physique
    ctx.drawImage(spr, -d / 2, -d / 2, d, d);
  } else {
    // volume : dégradé radial éclairé en haut-gauche + liseré (ballon classique)
    const bgrad = ctx.createRadialGradient(-4, -5, 2, 0, 0, BALL_R);
    bgrad.addColorStop(0, "#ffe98a");
    bgrad.addColorStop(0.65, "#ffcc00");
    bgrad.addColorStop(1, "#dfa300");
    ctx.fillStyle = bgrad;
    ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#c78f00";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, BALL_R - 0.5, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#e6a800";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, BALL_R - 1, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, BALL_R - 1, BALL_R * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, BALL_R * 0.45, BALL_R - 1, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath(); ctx.arc(-4, -5, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// bandeau du mode bombe : compte à rebours central + camp en danger
function drawBombHUD() {
  // voile rouge pulsé sur la moitié de terrain où se trouve la bombe
  if (state === "play" && !ball.frozen && !ball.popped) {
    const low = bombTimer <= 180;
    const p = 0.10 + 0.10 * (0.5 + 0.5 * Math.sin(performance.now() / (low ? 80 : 220)));
    const gx = ball.x < NET_X ? 0 : NET_X;
    const g = ctx.createLinearGradient(0, GROUND_Y, 0, GROUND_Y - 160);
    g.addColorStop(0, "rgba(255,40,40," + p.toFixed(3) + ")");
    g.addColorStop(1, "rgba(255,40,40,0)");
    ctx.fillStyle = g;
    ctx.fillRect(gx, GROUND_Y - 160, NET_X, 160);
  }
  const secs = Math.max(0, Math.ceil(bombTimer / 60));
  const frac = Math.max(0, bombTimer) / (bombTime || BOMB_TIME);
  const low = bombTimer <= 180;
  const col = frac > 0.5 ? "#7ed957" : frac > 0.25 ? "#ffcc00" : "#ff4030";
  const blink = low && Math.floor(performance.now() / 140) % 2 === 0;
  ctx.save();
  const bx = NET_X - 56, by = 18, bw = 112, bh = 44;
  ctx.fillStyle = "rgba(10,12,18,0.72)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 8);
  else ctx.rect(bx, by, bw, bh);
  ctx.fill();
  ctx.strokeStyle = blink ? "#fff" : col;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = blink ? "#fff" : col;
  ctx.font = "800 24px " + (typeof UI !== "undefined" ? UI.sans : "'Inter', system-ui, sans-serif");
  ctx.fillText(secs + "s", NET_X, by + 32);
  ctx.restore();
}

function drawHUD() {
  // mode bombe : éclair d'explosion plein écran (visuel, se résorbe au rendu)
  if (bombFlash > 0) {
    ctx.fillStyle = "rgba(255,240,205," + (bombFlash * 0.6).toFixed(3) + ")";
    ctx.fillRect(0, 0, W, H);
    bombFlash *= 0.8;
    if (bombFlash < 0.02) bombFlash = 0;
  }
  if (bombMode && (state === "play" || state === "serve")) drawBombHUD();

  // ---- tableau de score cartoon, panneaux légers (la balle haute doit rester lisible)
  const DISP = (typeof UI !== "undefined" ? UI.display : "'Fredoka', sans-serif");
  const SANS = (typeof UI !== "undefined" ? UI.sans : "'Nunito', sans-serif");
  const STROKE = (typeof UI !== "undefined" ? UI.stroke : "#1b1730");
  const CREAM = "rgba(255,246,232,0.38)";
  const sideLbl = s => (mode === "2v2" ? (s === 0 ? "Équipe 1" : "Équipe 2") : sideLabel(s));
  for (const s of [0, 1]) {
    const cx = s === 0 ? W * 0.25 : W * 0.75;
    const col = sideColor(s);
    const pop = scorePop[s] || 0;
    const pw = 140, ph = 118, px = cx - pw / 2, py = 10;
    ctx.fillStyle = CREAM;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 16);
    else ctx.rect(px, py, pw, ph);
    ctx.fill();
    ctx.strokeStyle = "rgba(27,23,48,0.35)"; ctx.lineWidth = 2.5; ctx.stroke();
    // bandeau couleur camp (semi-transparent)
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = col;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px + 3, py + 3, pw - 6, 22, 12);
    else ctx.rect(px + 3, py + 3, pw - 6, 22);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff6e8";
    ctx.font = "700 12px " + SANS;
    ctx.strokeStyle = "rgba(27,23,48,0.55)"; ctx.lineWidth = 3; ctx.lineJoin = "round";
    ctx.strokeText(sideLbl(s), cx, py + 19);
    ctx.fillText(sideLbl(s), cx, py + 19);
    // gros score (contour pour rester lisible sur fond transparent)
    const scSize = 36 + pop * 1.4;
    ctx.font = "700 " + scSize + "px " + DISP;
    ctx.strokeStyle = "rgba(27,23,48,0.75)"; ctx.lineWidth = 5;
    ctx.strokeText(String(scores[s]), cx, py + 58);
    ctx.fillStyle = col;
    ctx.fillText(String(scores[s]), cx, py + 58);
    if (scorePop[s] > 0) scorePop[s]--;
  }
  // pastille VS légère
  ctx.textAlign = "center";
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(NET_X - 22, 36, 44, 28, 12);
  else ctx.rect(NET_X - 22, 36, 44, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(27,23,48,0.35)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = STROKE;
  ctx.font = "700 14px " + DISP;
  ctx.fillText("VS", NET_X, 55);

  // indicateur de touches (pastilles)
  for (const side of [0, 1]) {
    const baseX = side === 0 ? W * 0.25 - 26 : W * 0.75 - 26;
    for (let i = 0; i < MAX_TOUCHES; i++) {
      const on = i < ball.touches[side];
      ctx.beginPath();
      ctx.arc(baseX + i * 26, 86, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = on ? sideColor(side) : "rgba(27,23,48,0.18)";
      ctx.fill();
      ctx.strokeStyle = STROKE; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  // jauges de SUPER (combo) dans le panneau, sous les touches
  for (const s of [0, 1]) {
    const cx = s === 0 ? W * 0.25 : W * 0.75;
    const col = sideColor(s);
    const bw = 108, bx = cx - bw / 2, by = 100;
    const ready = superCharge[s] === 1;
    const frac = ready ? 1 : (streak[s] % SUPER_NEED) / SUPER_NEED;
    ctx.fillStyle = "rgba(27,23,48,0.12)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, 8, 4); else ctx.rect(bx, by, bw, 8);
    ctx.fill();
    ctx.strokeStyle = STROKE; ctx.lineWidth = 1.5; ctx.stroke();
    if (frac > 0) {
      if (ready) {
        const t = performance.now() / 300;
        ctx.fillStyle = (Math.sin(t * 6) > 0) ? "#ffd84a" : "#fff2a0";
      } else ctx.fillStyle = col;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, Math.max(4, bw * frac), 8, 4);
      else ctx.rect(bx, by, bw * frac, 8);
      ctx.fill();
    }
    ctx.textAlign = "center";
    ctx.font = "800 11px " + SANS;
    if (ready) {
      ctx.fillStyle = "#c48a00";
      ctx.fillText("SUPER — " + (s === 0 ? "E" : "Shift"), cx, by + 20);
    } else {
      ctx.fillStyle = "rgba(27,23,48,0.7)";
      ctx.fillText("Combo " + (streak[s] % SUPER_NEED) + "/" + SUPER_NEED, cx, by + 20);
    }
  }

  // message flash de SUPER
  if (superFlashT > 0 && superFlash) {
    ctx.textAlign = "center";
    ctx.globalAlpha = Math.min(1, superFlashT / 12);
    ctx.fillStyle = "#ffd84a";
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 5; ctx.lineJoin = "round";
    ctx.font = "700 34px " + DISP;
    ctx.strokeText(superFlash, NET_X, 150);
    ctx.fillText(superFlash, NET_X, 150);
    ctx.globalAlpha = 1;
  }

  // balle de match
  if (state === "play" || state === "serve") {
    for (const s of [0, 1]) {
      if (scores[s] >= WIN_SCORE - 1 && scores[s] - scores[1 - s] >= 1) {
        const txt = "★ Balle de match — " + sideLabel(s) + " ★";
        ctx.textAlign = "center";
        ctx.font = "700 16px " + DISP;
        ctx.strokeStyle = STROKE; ctx.lineWidth = 4; ctx.lineJoin = "round";
        ctx.strokeText(txt, NET_X, 148);
        ctx.fillStyle = sideColor(s);
        ctx.fillText(txt, NET_X, 148);
      }
    }
  }

  // décompte avant service, puis invite de service — fond plein arrondi
  // systématique : jamais de texte flottant nu directement sur le décor
  // (illisible dès que le fond est clair ou que sa couleur varie).
  if (state === "serve" && serveCountdown > 0) {
    const beat = typeof SERVE_BEAT !== "undefined" ? SERVE_BEAT : 51;
    const go = typeof SERVE_GO !== "undefined" ? SERVE_GO : 30;
    const n = Math.ceil((serveCountdown - go) / beat); // 3 → 2 → 1 → (GO)
    const label = n <= 0 ? "GO !" : String(n);
    const bounce = Math.sin(performance.now() / 120) * 4;
    ctx.textAlign = "center";
    const bw = n <= 0 ? 240 : 150, bh = 120, bx = NET_X - bw / 2, by = H / 2 - 74;
    ctx.fillStyle = "rgba(12,20,42,0.72)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 20); else ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.strokeStyle = "#1b1730"; ctx.lineWidth = 4; ctx.stroke();
    const font = typeof UI !== "undefined" ? UI.display : "'Fredoka', sans-serif";
    ctx.font = "700 84px " + font;
    ctx.lineJoin = "round";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#1b1730";
    ctx.strokeText(label, NET_X, H / 2 + 22 + bounce);
    ctx.fillStyle = n <= 0 ? "#7ed957" : "#ffd84a";
    ctx.fillText(label, NET_X, H / 2 + 22 + bounce);
  } else if (state === "serve") {
    const txt = "Service : " + sideLabel(servingSide) + " — X lancer, puis X frapper (pas le saut) !";
    ctx.textAlign = "center";
    ctx.font = "700 17px " + (typeof UI !== "undefined" ? UI.sans : "sans-serif");
    const tw = ctx.measureText(txt).width;
    // sous les panneaux de score (qui vont jusqu'à y=126) : avec le nom de
    // le perso (souvent plus long que "Gauche"/"Droite"), la pastille est
    // parfois plus large qu'eux — la garder plus haut la faisait chevaucher.
    const pw = tw + 36, ph = 34, px = NET_X - pw / 2, py = 134;
    // pastille pleine (au lieu de texte nu semi-transparent) : lisible sur
    // n'importe quel terrain/ciel, clair ou sombre, sans distinction à gérer.
    ctx.fillStyle = "rgba(10,12,18,0.68)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 10); else ctx.rect(px, py, pw, ph);
    ctx.fill();
    ctx.fillStyle = "#ffcc00";
    ctx.fillText(txt, NET_X, py + 23);
  }

  if (paused) {
    overlay("PAUSE", "Appuyez sur P pour reprendre");
  }
}

function overlay(title, subtitle) {
  ctx.fillStyle = "rgba(12, 20, 42, 0.72)";
  ctx.fillRect(0, 0, W, H);

  const pw = Math.min(640, W - 48);
  const maxTextW = pw - 48;
  // Mesure le titre pour dimensionner la carte (wrap + taille adaptée)
  let titleH = 40, titleSize = 28;
  if (typeof uiTitleBoxed === "function") {
    ctx.save();
    // dry-run : même logique sans dessiner — on mesure via une passe
    let size = 28;
    const minSize = 15;
    let lines = [String(title || "")];
    while (size >= minSize) {
      ctx.font = "700 " + size + "px " + UI.display;
      lines = uiWrapLines(title, maxTextW);
      const widest = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
      if (lines.length <= 3 && widest <= maxTextW + 0.5) break;
      size -= 1;
    }
    if (lines.length > 3) lines = lines.slice(0, 3);
    titleSize = size;
    titleH = lines.length * size * 1.18;
    ctx.restore();
  }

  let subLines = [];
  if (subtitle) {
    ctx.font = "700 15px " + UI.sans;
    subLines = typeof uiWrapLines === "function" ? uiWrapLines(subtitle, maxTextW) : [subtitle];
    if (subLines.length > 2) subLines = subLines.slice(0, 2);
  }
  const subH = subLines.length ? subLines.length * 20 + 8 : 0;
  const ph = Math.max(160, 56 + titleH + subH + 36);
  const px = (W - pw) / 2, py = (H - ph) / 2 - 8;

  ctx.fillStyle = "rgba(255,246,232,0.95)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 18);
  else ctx.rect(px, py, pw, ph);
  ctx.fill();
  ctx.strokeStyle = UI.stroke; ctx.lineWidth = 4; ctx.stroke();

  uiLabel("Sommet Volley", W / 2, py + 28, 13, uiAccent(), 0.4, "center");
  const titleCy = py + 36 + titleH * 0.55;
  if (typeof uiTitleBoxed === "function") {
    uiTitleBoxed(title, W / 2, titleCy, maxTextW, titleSize, {
      fill: UI.stroke, stroke: "rgba(255,246,232,0.9)", maxLines: 3, minSize: 15
    });
  } else {
    ctx.textAlign = "center";
    ctx.fillStyle = UI.stroke;
    ctx.font = "800 " + titleSize + "px " + UI.sans;
    ctx.fillText(title, W / 2, titleCy);
  }
  if (subLines.length) {
    ctx.textAlign = "center";
    ctx.font = "700 15px " + UI.sans;
    ctx.fillStyle = "rgba(27,23,48,0.7)";
    const subY0 = py + ph - 28 - (subLines.length - 1) * 20;
    for (let i = 0; i < subLines.length; i++) {
      ctx.fillText(subLines[i], W / 2, subY0 + i * 20);
    }
  }
}

