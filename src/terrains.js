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
  const tk = TERRAINS[terrain] && TERRAINS[terrain].key;
  if (tk === "grande-foret" && typeof mapGrandeForetReady === "function" && mapGrandeForetReady()) {
    drawBgAmazonPng(performance.now() / 1000, raining, storm);
    return;
  }
  if (typeof mapCountryClubDoreReady === "function" && mapCountryClubDoreReady() && tk !== "grande-foret") {
    drawBgPlagePng(performance.now() / 1000, raining, storm);
    return;
  }
  drawBgPlageCanvas(raining, storm);
}

/** Grande Forêt PNG (Jair) — jungle, terre battue, bannières vert-jaune. */
function drawBgAmazonPng(t, raining, storm) {
  const p = SPRITES.mapGrandeForet;
  drawMapBackdrop(p, "#4a6a38");

  if (storm) {
    ctx.fillStyle = "rgba(40,60,30,0.35)";
    ctx.fillRect(0, 0, W, H);
  } else if (raining) {
    ctx.fillStyle = "rgba(50,70,40,0.18)";
    ctx.fillRect(0, 0, W, H);
  }

  // Public désactivé pour l’instant (crowd en raw seulement)

  // Sol : PNG visible ; apron léger sous les pieds
  drawCourtApron(raining ? "#5a7a40" : "#8a9a50", raining ? "#3a5a28" : "#5a7a38");
  drawCourtSeam("#2e7d32", "#f9a825");

  // Bannières vert-jaune
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.05) * 2;
    drawMapProp(p.flag, 70, GROUND_Y + 2 + bob, PROP_H.flag);
    ctx.save();
    ctx.translate(W - 70, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, PROP_H.flag);
    ctx.restore();
  }

  drawMapEventOverlay();
}

/** Fond générique skyline + sol (nouveaux terrains). */
function drawBgSkylinePack(p, t, raining, storm, cols) {
  drawMapBackdrop(p, cols.sky || "#6a8498");
  if (storm) {
    ctx.fillStyle = "rgba(60,70,80,0.3)";
    ctx.fillRect(0, 0, W, H);
  } else if (raining) {
    ctx.fillStyle = "rgba(90,100,110,0.14)";
    ctx.fillRect(0, 0, W, H);
  }
  drawCourtApron(cols.ground0, cols.ground1);
  drawCourtSeam();
}

/** Cité du Matin PNG (Panda) — portail rouge, muraille, bannières. */
function drawBgMatinPng(t, raining, storm) {
  const p = SPRITES.mapCiteDuMatin;

  drawMapBackdrop(p, "#c8beb0");

  if (storm) {
    ctx.fillStyle = "rgba(60,50,45,0.32)";
    ctx.fillRect(0, 0, W, H);
  } else if (raining) {
    ctx.fillStyle = "rgba(90,80,70,0.16)";
    ctx.fillRect(0, 0, W, H);
  }

  // Public désactivé pour l’instant (crowd_0 raté)

  drawCourtApron(raining ? "#8a8278" : "#c8beb0", raining ? "#5e5850" : "#a89e90");
  drawCourtSeam("#c62828", "#c9a227");

  // Bannières cérémonielles
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.1) * 2;
    drawMapProp(p.flag, 72, GROUND_Y + 2 + bob, PROP_H.flag);
    ctx.save();
    ctx.translate(W - 72, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, PROP_H.flag);
    ctx.restore();
  }

  drawMapEventOverlay();
}

/** Palais du Bosphore PNG (Sultan) — quay, mosquée, bannières pourpres. */
function drawBgBosphorePng(t, raining, storm) {
  const p = SPRITES.mapPontDesDeuxMondes;

  drawMapBackdrop(p, "#8aa0b8");

  if (storm) {
    ctx.fillStyle = "rgba(50,60,80,0.32)";
    ctx.fillRect(0, 0, W, H);
  } else if (raining) {
    ctx.fillStyle = "rgba(70,80,100,0.16)";
    ctx.fillRect(0, 0, W, H);
  }

  // Public désactivé pour l’instant (crowd en raw seulement)

  drawCourtApron(raining ? "#8a8070" : "#d0c4b0", raining ? "#5a5040" : "#b0a090");
  drawCourtSeam("#6a1b9a", "#c9a227");

  // Bannières pourpres
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.0) * 2;
    drawMapProp(p.flag, 70, GROUND_Y + 2 + bob, PROP_H.flag);
    ctx.save();
    ctx.translate(W - 70, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, PROP_H.flag);
    ctx.restore();
  }

  drawMapEventOverlay();
}

/** Citadelle du Levant (Le Faucon) — dispatcher : PNG si prêt, sinon fallback. */
function drawBgColline() {
  const t = performance.now() / 1000;
  const storm = weather === "storm";
  const raining = weather === "rain" || storm;
  if (typeof mapCitadelleDuLevantReady === "function" && mapCitadelleDuLevantReady()) {
    drawBgCollinePng(t, raining, storm);
    return;
  }
  ctx.fillStyle = "#bfe0f2";
  ctx.fillRect(0, 0, W, GROUND_Y);
  drawCourtApron("#e6d3a8", "#c9b482");
}

/** Citadelle du Levant PNG — capitale fortifiée en bord de Méditerranée, plein midi. */
function drawBgCollinePng(t, raining, storm) {
  const p = SPRITES.mapCitadelleDuLevant;

  drawMapBackdrop(p, "#bfe0f2");

  if (storm) {
    ctx.fillStyle = "rgba(50,60,80,0.30)";
    ctx.fillRect(0, 0, W, H);
  } else if (raining) {
    ctx.fillStyle = "rgba(70,80,100,0.14)";
    ctx.fillRect(0, 0, W, H);
  }

  drawCourtApron(raining ? "#b8a678" : "#e6d3a8", raining ? "#8a7a50" : "#c9b482");

  // Bannières (prop optionnel — généré via sommet-decor)
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.0) * 2;
    drawMapProp(p.flag, 70, GROUND_Y + 2 + bob, PROP_H.flag);
    ctx.save();
    ctx.translate(W - 70, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, PROP_H.flag);
    ctx.restore();
  }

  drawMapEventOverlay();
}

/** Jardin des Roses (Le Safran) — dispatcher : PNG si prêt, sinon fallback. */
function drawBgRoseraie() {
  const t = performance.now() / 1000;
  const storm = weather === "storm";
  const raining = weather === "rain" || storm;
  if (typeof mapJardinDesRosesReady === "function" && mapJardinDesRosesReady()) {
    drawBgRoseraiePng(t, raining, storm);
    return;
  }
  ctx.fillStyle = "#f0c878";
  ctx.fillRect(0, 0, W, GROUND_Y);
  drawCourtApron("#e8d4a8", "#c9b482");
}

/** Jardin des Roses PNG — cour à roses, cyprès, tuiles turquoise, lumière dorée. */
function drawBgRoseraiePng(t, raining, storm) {
  const p = SPRITES.mapJardinDesRoses;

  drawMapBackdrop(p, "#f0c878");

  if (storm) {
    ctx.fillStyle = "rgba(60,40,30,0.28)";
    ctx.fillRect(0, 0, W, H);
  } else if (raining) {
    ctx.fillStyle = "rgba(80,55,40,0.12)";
    ctx.fillRect(0, 0, W, H);
  }

  drawCourtApron(raining ? "#b8a070" : "#e8d4a8", raining ? "#8a7050" : "#c9b482");

  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.0) * 2;
    drawMapProp(p.flag, 70, GROUND_Y + 2 + bob, PROP_H.flag);
    ctx.save();
    ctx.translate(W - 70, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, PROP_H.flag);
    ctx.restore();
  }

  drawMapEventOverlay();
}

/** Stade Ashram PNG (Yogi) — palais grès miel, soucis, turquoise. */
function drawBgAshramPng(t, raining, storm) {
  const p = SPRITES.mapStadeAshram;

  drawMapBackdrop(p, "#f0d9a8");


  if (storm) {
    ctx.fillStyle = "rgba(30,20,45,0.40)";
    ctx.fillRect(0, 0, W, H);
  } else if (raining) {
    ctx.fillStyle = "rgba(45,30,60,0.20)";
    ctx.fillRect(0, 0, W, H);
  }

  // Public désactivé pour l’instant (crowd en raw seulement)

  drawCourtApron(raining ? "#5a4030" : "#7a5440", raining ? "#2a1c14" : "#4a3224");
  drawCourtSeam("#ef6c00", "#c9a227");

  // Bannières orange
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.0) * 2;
    drawMapProp(p.flag, 70, GROUND_Y + 2 + bob, PROP_H.flag);
    ctx.save();
    ctx.translate(W - 70, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, PROP_H.flag);
    ctx.restore();
  }

  drawMapEventOverlay();
}

/** Country Club Doré PNG (Baron Dorf) — voile ocre local ; sable via overlay. */
function drawBgPlagePng(t, raining, storm) {
  const p = SPRITES.mapCountryClubDore;

  drawMapBackdrop(p, "#87b0d0");

  if (storm) {
    ctx.fillStyle = "rgba(160,120,55,0.28)";
    ctx.fillRect(0, 0, W, H);
  } else if (raining) {
    ctx.fillStyle = "rgba(180,145,80,0.14)";
    ctx.fillRect(0, 0, W, H);
  }

  drawCourtApron(raining ? "#7a9a58" : "#8fbc6a", raining ? "#5a7a38" : "#6a9a48");
  // Pas de trait or code : la barrière est déjà dans le skyline PNG
  drawCourtSeam("#e8e4d8", "rgba(0,0,0,0.18)");

  // Pas de palmier « prop » : le fond a déjà ses éléments géants —
  // le doublon miniature au premier plan cassait la perspective.
  if (!spriteReady(p.far) && !spriteReady(p.skyline)) drawPalm(52, storm);

  // Bannières de club, symétriques (gauche + droite miroir)
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * (storm ? 3.2 : 2.2)) * (storm ? 3.5 : 2);
    drawMapProp(p.flag, 70, GROUND_Y + 2 + bob, PROP_H.flag);
    ctx.save();
    ctx.translate(W - 70, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, PROP_H.flag);
    ctx.restore();
  }

  // Voiturette / mini-cortège (event ou idle décoratif)
  drawResortCart(t);

  drawMapEventOverlay();
}

function drawResortCart(t) {
  const p = SPRITES.mapCountryClubDore;
  if (!p || (!spriteReady(p.cart) && !spriteReady(p.cartHorn))) return;
  if (typeof mapEvent === "undefined") return;
  // UNIQUEMENT pendant l'événement (plus de voiturette garée en plein court en idle).
  if (mapEvent.phase === "idle") return;
  // Une seule position continue (mapEvent.cartX) — plus de teleport idle ↔ event
  const cx = mapEvent.cartX;
  if (cx < -70 || cx > W + 70) return;
  const horn = !mapEventsQuiet &&
    (mapEvent.phase === "fire" || (mapEvent.phase === "flying" && mapEvent.t < 18));
  const img = horn && spriteReady(p.cartHorn) ? p.cartHorn : p.cart;
  // Roule SUR LE GAZON, un peu plus bas que la fontaine (au fond, derrière le
  // court), à une échelle réduite pour la profondeur.
  const footY = GROUND_Y - 115;
  const drawH = 78;
  let a = 1;
  if (cx < 50) a = Math.max(0, (cx + 70) / 120);
  if (cx > W - 50) a = Math.min(a, Math.max(0, (W + 70 - cx) / 120));
  ctx.save();
  ctx.globalAlpha = a;
  // Sprite PNG face à GAUCHE : miroir quand on roule vers la droite
  if (mapEvent.cartDir > 0) {
    ctx.translate(cx, 0);
    ctx.scale(-1, 1);
    drawMapProp(img, 0, footY, drawH);
  } else {
    drawMapProp(img, cx, footY, drawH);
  }
  ctx.restore();
}

function drawBgPlageCanvas(raining, storm) {
  const sun = celestialPos();

  // ciel : plombé / ocre quand tempête de sable
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  if (storm) {
    sky.addColorStop(0, "#8a7048"); sky.addColorStop(1, "#c4a060");
  } else if (raining) {
    sky.addColorStop(0, "#6a90b0"); sky.addColorStop(1, "#d2c090");
  } else {
    sky.addColorStop(0, "#4da6e8"); sky.addColorStop(1, "#bfe6ff");
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);

  drawHillLayer(GROUND_Y - 100, storm ? "#8a9aaa" : "#a9d4ec", 0.12,
    [[110, GROUND_Y - 150], [300, GROUND_Y - 118], [470, GROUND_Y - 162], [660, GROUND_Y - 122], [820, GROUND_Y - 152]]);
  drawHillLayer(GROUND_Y - 92, storm ? "#6a8090" : "#7fbfe0", 0.3,
    [[180, GROUND_Y - 128], [380, GROUND_Y - 104], [560, GROUND_Y - 134], [760, GROUND_Y - 108]]);

  if (!storm) {
    ctx.fillStyle = raining ? "rgba(255,230,128,0.18)" : "rgba(255,230,128,0.35)";
    ctx.beginPath(); ctx.arc(sun.x, sun.y, 52, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = raining ? "rgba(255,230,128,0.7)" : "#ffe680";
    ctx.beginPath(); ctx.arc(sun.x, sun.y, 38, 0, Math.PI * 2); ctx.fill();
  }

  drawClouds(storm ? "rgba(160,140,100,0.85)" : raining ? "rgba(220,210,180,0.8)" : "rgba(255,255,255,0.85)");

  ctx.fillStyle = "#2e86c1";
  ctx.fillRect(0, GROUND_Y - 55, W, 18);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(0, GROUND_Y - 55, W, 3);

  drawCourtApron(raining ? "#d4b87a" : "#f4d58d", raining ? "#b89450" : "#d9b25f");

  ctx.fillStyle = "rgba(120,90,30,0.18)";
  for (let i = 0; i < 42; i++) {
    const gx = (i * 193.7) % W;
    const gy = GROUND_Y + 4 + (i * 37.3) % (H - GROUND_Y - 10);
    ctx.fillRect(gx, gy, 2, 2);
  }

  const tw = performance.now() / 1000;
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 8) {
    const y = GROUND_Y - 38 + Math.sin(x / 26 + tw * 2) * 2;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  drawPalm(52, false);
  drawSkyBirds();
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

/**
 * Layout visuel par map (clé TERRAINS.key).
 * baselineFromBottom : px sous la ligne de fond du court dans le skyline —
 *   on les croppe pour que cette ligne tombe pile sur GROUND_Y
 *   (score en dessous, pieds + poteau sur le croisement).
 * netPost : compensations du PNG (padding transparent / poteau décentré).
 * codeSeam : dessiner une ligne de fond code (maps sans traits PNG fiables).
 */
const MAP_LAYOUT = {
  // baselineFromBottom inclut le pad sol sous la ligne de court (skylines
  // étendues pour couvrir la bande score H-GROUND_Y sans bande vide).
  "grande-foret":   { baselineFromBottom: 70,  netPost: { footPad: 3, xOff: 0, scale: 1 }, codeSeam: false, bgFullHeight: true },
  "country-club-dore":    { baselineFromBottom: 69,  netPost: { footPad: 2, xOff: 4, scale: 1 }, codeSeam: false, bgFullHeight: true },
  "place-ecarlate":    { baselineFromBottom: 60,  netPost: { footPad: 2, xOff: 0, scale: 1 }, codeSeam: false, bgFullHeight: true },
  "palais-du-coq":  { baselineFromBottom: 68,  netPost: { footPad: 2, xOff: 0, scale: 1 }, codeSeam: false, bgFullHeight: true },
  "esplanade-du-defile":   { baselineFromBottom: 123, netPost: { footPad: 2, xOff: 0, scale: 1 }, codeSeam: false, bgFullHeight: true },
  "cite-du-matin":    { baselineFromBottom: 48,  netPost: { footPad: 2, xOff: 0, scale: 1 }, codeSeam: false, bgFullHeight: true },
  "pont-des-deux-mondes": { baselineFromBottom: 57,  netPost: { footPad: 3, xOff: 0, scale: 1 }, codeSeam: false, bgFullHeight: true },
  "stade-ashram":   { baselineFromBottom: 133,  netPost: { footPad: 4, xOff: 0, scale: 1 }, codeSeam: false, bgFullHeight: true },
  "citadelle-du-levant":  { baselineFromBottom: 45,  netPost: { footPad: 2, xOff: 0, scale: 1 }, codeSeam: false, bgFullHeight: true },
  "jardin-des-roses": { baselineFromBottom: 43, netPost: { footPad: 2, xOff: 0, scale: 1 }, codeSeam: false, bgFullHeight: true }
};

function currentMapLayout() {
  const key = (typeof TERRAINS !== "undefined" && TERRAINS[terrain]) ? TERRAINS[terrain].key : "";
  // Défaut pour TOUTE nouvelle map (sans entrée explicite) : plein hauteur +
  // remplissage bas sable (via drawImgCoverBaseline) → cadrage 16:9 correct dès
  // le dépôt, sans bande grise ni zoom. La baseline précise (pieds sur la ligne)
  // se règle ensuite par map avec map_fit, mais 60 est un bon point de départ
  // pour une skyline Gemini 16:9 (court proche du bas). Les maps déjà listées
  // dans MAP_LAYOUT gardent leur réglage — aucune régression.
  return MAP_LAYOUT[key] || { baselineFromBottom: 60, netPost: { footPad: 2, xOff: 0, scale: 1 }, codeSeam: false, bgFullHeight: true };
}

/** Hauteur de dessin du décor : H si bgFullHeight (ex. Cité du Matin, Esplanade). */
function mapBgDrawH() {
  return currentMapLayout().bgFullHeight ? H : BG_DRAW_H;
}

/** Dessine une image en couvrant [dx,dy,dw,dh], alignée en bas (sol).
 *  Cover strict (bord à bord, pas de bandes latérales).
 *  baselineFromBottom : crop du bas source pour aligner la ligne de court. */
function drawImgCoverBottom(img, dx, dy, dw, dh, parallaxX, baselineFromBottom) {
  const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
  if (!sw || !sh) return;
  const bl = Math.max(0, Math.min(sh - 8, baselineFromBottom | 0));
  const usefulH = sh - bl;
  // Cover strict : remplit toute la zone (crop haut si besoin), jamais de letterbox
  const scale = Math.max(dw / sw, dh / usefulH);
  const tw = sw * scale, th = usefulH * scale;
  const ox = dx + (dw - tw) / 2 + (parallaxX || 0);
  const oy = dy + dh - th;
  ctx.drawImage(img, 0, 0, sw, usefulH, ox, oy, tw, th);
}

/**
 * Fond plein cadre : aligne la ligne de court source sur groundY, centre sur NET_X,
 * et laisse le pavé sous la ligne descendre jusqu'en bas du canvas.
 */
function drawImgCoverBaseline(img, dx, dw, groundY, canvasH, parallaxX, baselineFromBottom, fillImg) {
  const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
  if (!sw || !sh) return;
  const bl = Math.max(0, Math.min(sh - 8, baselineFromBottom | 0));
  const baselineSrcY = sh - bl;
  // Cover largeur + assez de zoom pour que le haut atteigne le haut du cadre
  const scale = Math.max(dw / sw, groundY / Math.max(1, baselineSrcY));
  const tw = sw * scale, th = sh * scale;
  const ox = dx + (dw - tw) / 2 + (parallaxX || 0);
  const oy = groundY - baselineSrcY * scale;
  // Comble le bas AVANT de dessiner : les skylines 16:9 s'arrêtent souvent
  // ~40–70 px avant le bas du canvas. On étire la bande sol du PNG (mieux
  // qu'un aplati uni) puis on dessine l'image par-dessus.
  const drawnBottom = oy + th;
  if (drawnBottom < canvasH - 0.5) {
    const gapTop = Math.floor(drawnBottom) - 1;
    const gapH = Math.ceil(canvasH - gapTop);
    if (fillImg && spriteReady(fillImg)) {
      // Combler l'espace vide avec la BANDE de sol dédiée (juste ce qu'il faut).
      // On NE touche PAS au skyline : il est redessiné par-dessus jusqu'à drawnBottom.
      // Anti-étirement : on ne prend que la TRANCHE BASSE de la bande (pavés les
      // plus proches), à l'échelle qui préserve les proportions (scaleX == scaleY).
      const fsw = fillImg.naturalWidth || fillImg.width, fsh = fillImg.naturalHeight || fillImg.height;
      const srcH = Math.min(fsh, Math.max(1, Math.round(gapH * fsw / dw)));
      ctx.drawImage(fillImg, 0, fsh - srcH, fsw, srcH, dx, gapTop, dw, gapH);
      mapBandSeamY = gapTop + 1; // raccord skyline↔bande → moulure de masquage
    } else {
      // Pas de bande dédiée : on COMBLE le vide en copiant une lamelle de SOL
      // prise dans le bas du skyline, au-dessus de la ligne blanche du court.
      ctx.fillStyle = bottomColorOf(img);
      ctx.fillRect(dx, gapTop, dw, gapH);
      try {
        const srcY = groundStripSrcY(img);                 // rangée « sable », pas la ligne blanche
        const srcStrip = Math.max(6, Math.min(40, Math.floor(sh * 0.03)));
        const srcTop = Math.max(0, srcY - srcStrip);
        ctx.drawImage(img, 0, srcTop, sw, srcStrip, ox, gapTop, tw, gapH);
      } catch (e) { /* canvas tainted → aplat déjà en place */ }
      mapBandSeamY = gapTop + 1; // même ligne blanche de délimitation que les maps à bande
    }
  }
  ctx.drawImage(img, 0, 0, sw, sh, ox, oy, tw, th);
}

/** Couleur dominante du bas d'une image (mise en cache) — pour combler proprement. */
/** Trouve, dans le bas de l'image, une rangée de SOL (sable/pierre) en SAUTANT
 *  la ligne blanche du court : on scanne la colonne centrale du bas vers le haut
 *  et on retient la 1re rangée « matière » (ni blanche, ni sombre). Mise en cache.
 *  Sert à combler le vide du bas avec du vrai sol copié, sans la bande blanche. */
function groundStripSrcY(img) {
  if (img._groundY != null) return img._groundY;
  const sh = img.naturalHeight || img.height, sw = img.naturalWidth || img.width;
  let y = sh - 3;
  try {
    const c = document.createElement("canvas");
    c.width = 1; c.height = sh;
    const cx = c.getContext("2d");
    cx.drawImage(img, (sw / 2) | 0, 0, 1, sh, 0, 0, 1, sh);
    const d = cx.getImageData(0, 0, 1, sh).data;
    const lo = Math.floor(sh * 0.80);
    for (let yy = sh - 3; yy > lo; yy--) {
      const i = yy * 4, r = d[i], g = d[i + 1], b = d[i + 2], lum = (r + g + b) / 3;
      const white = r > 236 && g > 236 && b > 236;      // ligne blanche du court
      const material = lum > 110 && lum < 232 && r >= b - 6; // sable/pierre
      if (material && !white) { y = yy; break; }
    }
  } catch (e) { y = sh - 3; }
  img._groundY = y;
  return y;
}

function bottomColorOf(img) {
  if (img._botColor) return img._botColor;
  try {
    const sw = img.naturalWidth || img.width, sh = img.naturalHeight || img.height;
    const c = document.createElement("canvas");
    c.width = 1; c.height = 1;
    const cx = c.getContext("2d");
    const stripH = Math.max(2, Math.floor(sh * 0.03));
    cx.drawImage(img, 0, sh - stripH, sw, stripH, 0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    img._botColor = `rgb(${d[0]},${d[1]},${d[2]})`;
  } catch (e) {
    img._botColor = "#b89a6a"; // sable de secours
  }
  return img._botColor;
}

/** Far / skyline de la map courante, baseline alignée sur GROUND_Y. */
function drawMapBgLayer(img, parallaxX, bandImg) {
  const layout = currentMapLayout();
  const px = (parallaxX || 0) + (layout.bgXOff || 0);
  if (layout.bgFullHeight && (layout.baselineFromBottom | 0) > 0) {
    drawImgCoverBaseline(img, 0, W, GROUND_Y, H, px, layout.baselineFromBottom, bandImg);
    return;
  }
  drawImgCoverBottom(img, 0, 0, W, mapBgDrawH(), px, layout.baselineFromBottom);
}

/**
 * Un seul décor map, plein cadre : fond uni puis skyline (ou far en secours).
 * Évite le mélange far+skyline semi-transparent et les bandes blanches.
 */
function drawMapBackdrop(pack, fillColor) {
  const dh = mapBgDrawH();
  ctx.fillStyle = fillColor || "#6a8498";
  ctx.fillRect(0, 0, W, dh);
  mapBandActive = false;
  mapBandSeamY = 0;
  if (spriteReady(pack.skyline)) drawMapBgLayer(pack.skyline, 0, pack.band);
  else if (spriteReady(pack.far)) drawMapBgLayer(pack.far, 0);
  drawMapBandSeam();
}

/** Moulure décorative (thème UI : navy + liseré crème) posée sur le raccord
 *  skyline↔bande pour masquer la couture. Ne s'affiche que si une bande a
 *  rempli un vide (mapBandSeamY > 0). */
let mapBandSeamY = 0;
function drawMapBandSeam() {
  if (mapBandSeamY <= 0 || mapBandSeamY >= H) return;
  const y = mapBandSeamY;
  const LINE_H = 5;   // épaisseur de la ligne blanche
  const STROKE = 1;   // contour noir cartoon (fin)
  // 1) contour noir (encrage cartoon) : au-dessus + en dessous de la ligne
  ctx.fillStyle = "rgba(20,17,26,0.95)";
  ctx.fillRect(0, y - 1 - STROKE, W, LINE_H + STROKE * 2);
  // 2) LIGNE BLANCHE de délimitation de terrain (comme les lignes du court)
  ctx.fillStyle = "rgba(248,246,240,0.97)";
  ctx.fillRect(0, y - 1, W, LINE_H);
}

let mapBandActive = false;
/** Compositing 2 zones : la BANDE (sol de premier plan) remplit le bas à SA
 *  taille (largeur pleine, ratio conservé) ; la SKYLINE remplit le HAUT, calée
 *  pour que sa ligne de court tombe sur le raccord (seam) — son haut débordant
 *  est COUPÉ. Résultat : bâtiments en haut, sol-bande en bas, joint net. */
function drawMapTwoZone(pack) {
  const band = pack.band, sky = pack.skyline;
  const bsw = band.naturalWidth || band.width, bsh = band.naturalHeight || band.height;
  const bandH = Math.round(W * bsh / bsw);   // bande à sa taille (remplit la largeur)
  const seam = Math.max(0, H - bandH);       // raccord : la bande commence ici
  // --- SKYLINE : échelle = remplir la LARGEUR (JAMAIS déformée/compressée),
  //     BAS calé sur le raccord, HAUT qui dépasse = COUPÉ (clip). ---
  const ssw = sky.naturalWidth || sky.width, ssh = sky.naturalHeight || sky.height;
  const scale = W / ssw;
  const th = ssh * scale;
  const oy = seam - th;                       // bas du skyline exactement au seam
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, seam); ctx.clip();
  ctx.drawImage(sky, 0, 0, ssw, ssh, 0, oy, W, th);
  ctx.restore();
  // --- BANDE : posée EN DESSOUS (seam..H), pas par-dessus le skyline ---
  ctx.drawImage(band, 0, 0, bsw, bsh, 0, seam, W, bandH);
  mapBandActive = true;
}

/** Ligne de fond code (quand le PNG n'en a pas de fiable). */
function drawCourtSeam(stroke, accent) {
  if (!currentMapLayout().codeSeam) return;
  ctx.fillStyle = stroke || "rgba(255,248,230,0.92)";
  ctx.fillRect(0, GROUND_Y - 2, W, 2);
  if (accent) {
    ctx.fillStyle = accent;
    ctx.fillRect(0, GROUND_Y - 1, W, 1);
  }
  // Trait médian court pour matérialiser le croisement avec le poteau
  ctx.strokeStyle = stroke || "rgba(255,248,230,0.75)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(NET_X, GROUND_Y - 70);
  ctx.lineTo(NET_X, GROUND_Y - 1);
  ctx.stroke();
}

/**
 * Bande sous les pieds pour le HUD — n'empiète pas sur les lignes PNG
 * (qui s'arrêtent à GROUND_Y via BG_DRAW_H).
 */
function drawCourtApron(topColor, botColor) {
  // Une bande de sol dédiée est dessinée → pas de voile (elle ferait office d'apron laid).
  if (mapBandActive) return;
  // Décor plein cadre (Cité du Matin) : voile léger pour laisser voir le PNG sous le HUD
  if (currentMapLayout().bgFullHeight) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = topColor;
    ctx.fillRect(0, GROUND_Y + 2, W, H - GROUND_Y - 2);
    ctx.restore();
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(0, GROUND_Y, W, 2);
    return;
  }
  const solid = ctx.createLinearGradient(0, GROUND_Y + 2, 0, H);
  solid.addColorStop(0, topColor);
  solid.addColorStop(1, botColor);
  ctx.save();
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = solid;
  ctx.fillRect(0, GROUND_Y + 2, W, H - GROUND_Y - 2);
  ctx.restore();
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.fillRect(0, GROUND_Y, W, 2);
}

/** Prop ancré pieds (x centre) ; `drawH` depuis PROP_H — réf. CHAR_BASE_H. */
function drawMapProp(img, x, footY, drawH) {
  if (!spriteReady(img)) return;
  const aspect = img.naturalWidth / img.naturalHeight;
  const h = drawH, w = h * aspect;
  ctx.drawImage(img, x - w / 2, footY - h, w, h);
}

function drawBgNeigePng(t, heavy, blizzard) {
  const p = SPRITES.mapPlaceEcarlate;

  // Un seul fond (skyline) — la météo se joue en overlays code, pas en 2e PNG
  drawMapBackdrop(p, "#d7e4ee");

  // Voile météo sur le décor (ciel plus plombé sans changer d'image)
  if (blizzard) {
    ctx.fillStyle = "rgba(90,110,130,0.28)";
    ctx.fillRect(0, 0, W, H);
  } else if (heavy) {
    ctx.fillStyle = "rgba(120,140,165,0.14)";
    ctx.fillRect(0, 0, W, H);
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

  drawCourtApron("#fbfdff", "#d7e4ee");
  drawCourtSeam("rgba(180,200,220,0.95)", "rgba(100,130,160,0.55)");

  // Bannières Place Écarlate (côtés — décalées du canon à gauche)
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.05) * 2;
    drawMapProp(p.flag, 168, GROUND_Y + 2 + bob, PROP_H.flag); // un seul drapeau, à gauche
  }

  // Canon d'apparat (gauche) — idle / tir piloté par l'événement de map
  const firing = typeof mapEvent !== "undefined" &&
    (mapEvent.phase === "fire" || (mapEvent.phase === "flying" && mapEvent.t < 8));
  drawMapProp(firing && spriteReady(p.cannonFire) ? p.cannonFire : p.cannon, 72, GROUND_Y + 2, PROP_H.cannon);

  // Bonhomme de neige (droite) — se baisse quand la balle approche
  if (spriteReady(p.snowman)) {
    const sx = 838;
    const sbd = Math.hypot(sx - ball.x, (GROUND_Y - 40) - ball.y);
    const duck = sbd < 90 ? (1 - sbd / 90) * 10 : 0;
    drawMapProp(p.snowman, sx, GROUND_Y + 2 + duck, PROP_H.snowman - duck * 0.3);
  }


  drawMapEventOverlay();
}

/** Flocons, rafales et voile — météo Place Écarlate sans 2e fond PNG. */
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
      const fy = ((i * 67.1 + t * (40 + (i % 5) * 10)) % (H + 10));
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
    const fy = (i * 53.7 + t * (30 + (i % 7) * 8) * spd) % (H + 20);
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
    ctx.fillRect(0, 0, W, H);
    // bande basse un peu plus dense (rafales au sol)
    const mist = ctx.createLinearGradient(0, GROUND_Y - 90, 0, H);
    mist.addColorStop(0, "rgba(255,255,255,0)");
    mist.addColorStop(0.55, "rgba(255,255,255,0.22)");
    mist.addColorStop(1, "rgba(255,255,255,0.22)");
    ctx.fillStyle = mist;
    ctx.fillRect(0, GROUND_Y - 90, W, H - (GROUND_Y - 90));
  } else if (heavy) {
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(0, 0, W, H);
  }
}

/** Warn + projectiles / traverseurs selon le terrain. */
function mapEventWarnPack(kind) {
  if (kind === "cannon") return SPRITES.mapPlaceEcarlate;
  if (kind === "cart") return SPRITES.mapCountryClubDore;
  if (kind === "march") return SPRITES.mapPalaisDuCoq;
  if (kind === "radar") return SPRITES.mapEsplanadeDuDefile;
  if (kind === "lantern") return SPRITES.mapCiteDuMatin;
  if (kind === "carpet") return SPRITES.mapPontDesDeuxMondes;
  if (kind === "cow") return SPRITES.mapStadeAshram;
  if (kind === "macaw") return SPRITES.mapGrandeForet;
  if (kind === "falcon") return SPRITES.mapCitadelleDuLevant;
  if (kind === "peacock") return SPRITES.mapJardinDesRoses;
  return null;
}

/** Icône d'annonce unique : celle de la map française (Micron), lisible partout. */
function mapEventWarnIcon() {
  const fr = SPRITES.mapPalaisDuCoq;
  return (fr && spriteReady(fr.warn)) ? fr.warn : null;
}

function drawMapEventRainProp(kind, x, y, vx) {
  if (kind === "cart") { drawGolfBall(x, y); return; }
  const pack = mapEventWarnPack(kind);
  let img = null, h = 36;
  if (kind === "lantern" && pack && spriteReady(pack.lantern)) { img = pack.lantern; h = PROP_H.lanternShot; }
  if (kind === "macaw" && pack && spriteReady(pack.macaw)) { img = pack.macaw; h = PROP_H.macawShot; }
  if (img) {
    const sc = h / img.height;
    const dw = img.width * sc;
    ctx.save();
    ctx.translate(x, y);
    // Sprite face à droite ; si un jour vx<0, miroir
    if (vx != null && vx < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -dw / 2, -h / 2, dw, h);
    ctx.restore();
  } else {
    ctx.fillStyle = kind === "lantern" ? "#e53935" : "#26a69a";
    ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
  }
}

function drawMapEventCrosser(kind) {
  const pack = mapEventWarnPack(kind);
  const cx = mapEvent.cartX;
  const face = mapEvent.cartDir >= 0 ? 1 : -1;
  ctx.save();
  ctx.translate(cx, 0);
  if (face < 0) ctx.scale(-1, 1);
  if (kind === "march" && pack && spriteReady(pack.marchers0)) {
    // Strip détouré : un cran > CHAR_BASE_H (lisibilité du cortège)
    drawMapProp(pack.marchers0, 0, GROUND_Y + 4, PROP_H.marchers);
  } else if (kind === "carpet" && pack && spriteReady(pack.carpet)) {
    drawMapProp(pack.carpet, 0, GROUND_Y - 36, PROP_H.carpet);
  } else if (kind === "cow" && pack && spriteReady(pack.cow)) {
    // Idle : fond central sous la fontaine ; event : traverse le court
    const onCourt = mapEvent.phase !== "idle";
    drawMapProp(pack.cow, 0, onCourt ? GROUND_Y + 8 : GROUND_Y - 98,
      onCourt ? PROP_H.cow : PROP_H.cowIdle);
  } else if (kind === "falcon") {
    // Faucon en vol horizontal au-dessus du terrain.
    if (pack && spriteReady(pack.falcon)) {
      drawMapProp(pack.falcon, 0, GROUND_Y - 70, PROP_H.falcon);
    } else {
      // Fallback canvas tant que falcon.png n'existe pas (sommet-decor) : silhouette d'oiseau.
      const y = GROUND_Y - 100, wf = Math.sin(t2() * 10) * 6;
      ctx.strokeStyle = "#2b2b33"; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-26, y + wf); ctx.quadraticCurveTo(-8, y - 12, 0, y);
      ctx.quadraticCurveTo(8, y - 12, 26, y + wf);
      ctx.stroke();
      ctx.fillStyle = "#2b2b33";
      ctx.beginPath(); ctx.ellipse(0, y + 1, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (kind === "peacock") {
    // Paon qui traverse la cour.
    if (pack && spriteReady(pack.peacock)) {
      drawMapProp(pack.peacock, 0, GROUND_Y + 8, PROP_H.peacock);
    } else {
      // Fallback canvas tant que peacock.png n'existe pas (sommet-decor).
      const y = GROUND_Y - 8;
      ctx.fillStyle = "#1a6b5a";
      ctx.beginPath(); ctx.ellipse(0, y - 18, 14, 22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#2a9b7a";
      ctx.beginPath(); ctx.ellipse(10, y - 40, 18, 28, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c9a227";
      ctx.beginPath(); ctx.arc(0, y - 42, 5, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

/** Horloge locale (s) — pour l'animation de secours du faucon. */
function t2() { return performance.now() / 1000; }

function drawMapEventOverlay() {
  if (typeof mapEvent === "undefined" || mapEventsQuiet || !mapEventActiveTerrain()) return;
  const kind = typeof mapEventKind === "function" ? mapEventKind() : "cannon";
  const pWarn = mapEventWarnPack(kind);

  const showZone = mapEventIsRain(kind) || kind === "radar";
  if ((mapEvent.phase === "warn" || mapEvent.phase === "fire" || mapEvent.phase === "flying") &&
      showZone && mapEvent.zoneX) {
    drawEventDangerZone(mapEvent.zoneX, mapEvent.zoneW || 150, mapEvent.t || 0, pWarn);
  }

  if (mapEvent.phase === "warn") {
    const pulse = 0.72 + 0.28 * Math.sin(mapEvent.t * 0.4);
    const bob = Math.sin(mapEvent.t * 0.32) * 4;
    const scale = 1 + 0.08 * Math.sin(mapEvent.t * 0.5);
    const wx = NET_X;
    // Au-dessus du finial du poteau (sommet PNG ≈ NET_TOP - 28) — sinon
    // drawNet (après le fond) masque l'icône.
    const wh = PROP_H.warnIcon;
    const wy = NET_TOP - 28 - wh - 18 + bob;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.translate(wx, wy);
    ctx.scale(scale, scale);
    const warnImg = mapEventWarnIcon();
    if (warnImg) {
      ctx.drawImage(warnImg, -wh / 2, -wh, wh, wh);
    } else {
      ctx.fillStyle = showZone ? "#ff9800" : "#e53935";
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(-16, 2);
      ctx.lineTo(16, 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("!", 0, -10);
    }
    ctx.restore();
  }

  // Crossers visibles dès l'annonce
  if (mapEventIsCrosser(kind) && mapEvent.phase !== "idle") {
    drawMapEventCrosser(kind);
  }

  // Carpet / cow idle patrol
  if ((kind === "carpet" || kind === "cow") && mapEvent.phase === "idle") {
    drawMapEventCrosser(kind);
  }

  if (mapEvent.phase === "fire" || mapEvent.phase === "flying") {
    if (mapEvent.phase === "fire" && mapEvent.t < 1) return;
    if (mapEventIsRain(kind) || kind === "macaw") {
      if (mapEvent.balls && mapEvent.balls.length) {
        for (const b of mapEvent.balls) {
          if (!b.dead) drawMapEventRainProp(kind, b.x, b.y, b.vx);
        }
      }
    } else if (kind === "cannon") {
      drawCannonShotBall(mapEvent.x, mapEvent.y, mapEvent.vx, mapEvent.vy);
    }
  }
}

/** Zone d'impact event (golf) : ellipses pulsantes + rayures, sans fillRect. */
function drawEventDangerZone(zx, zw, t, pWarn) {
  const pulse = 0.45 + 0.35 * Math.sin(t * 0.38);
  const breathe = 1 + 0.06 * Math.sin(t * 0.55);
  const rx = (zw * 0.52) * breathe;
  const ry = 16 * breathe;
  const cy = GROUND_Y - 10;

  ctx.save();
  // ombre / hot spot au sol
  const g = ctx.createRadialGradient(zx, cy, 4, zx, cy, rx);
  g.addColorStop(0, "rgba(255,80,40," + (0.35 * pulse).toFixed(2) + ")");
  g.addColorStop(0.55, "rgba(255,180,40," + (0.22 * pulse).toFixed(2) + ")");
  g.addColorStop(1, "rgba(255,200,60,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(zx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // anneaux concentriques
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.045 + i * 0.33) % 1;
    const a = (1 - k) * 0.55 * pulse;
    ctx.strokeStyle = "rgba(255,87,34," + a.toFixed(2) + ")";
    ctx.lineWidth = 2.2 - i * 0.4;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.ellipse(zx, cy, rx * (0.35 + k * 0.7), ry * (0.35 + k * 0.7), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // bord net
  ctx.strokeStyle = "rgba(255,235,59," + (0.75 * pulse).toFixed(2) + ")";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(zx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // petit warn flottant au centre (toujours l'icône FR)
  const bob = Math.sin(t * 0.35) * 3;
  const warnImg = mapEventWarnIcon();
  if (warnImg) {
    const wh = 28;
    ctx.globalAlpha = 0.85 * pulse;
    ctx.drawImage(warnImg, zx - wh / 2, cy - ry - wh - 4 + bob, wh, wh);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = "rgba(255,193,7," + (0.9 * pulse).toFixed(2) + ")";
    ctx.beginPath();
    ctx.moveTo(zx, cy - ry - 28 + bob);
    ctx.lineTo(zx - 12, cy - ry - 6 + bob);
    ctx.lineTo(zx + 12, cy - ry - 6 + bob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("!", zx, cy - ry - 12 + bob);
  }
  ctx.restore();
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

  // Place Écarlate PNG (Volkoï) — fallback canvas si pas encore chargé
  if (typeof mapPlaceEcarlateReady === "function" && mapPlaceEcarlateReady()) {
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

  drawCourtApron("#fbfdff", "#d7e4ee");

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
  const tk = TERRAINS[terrain] && TERRAINS[terrain].key;
  if (tk === "cite-du-matin" && typeof mapCiteDuMatinReady === "function" && mapCiteDuMatinReady()) {
    drawBgMatinPng(t, raining, storm);
    return;
  }
  if (tk === "pont-des-deux-mondes" && typeof mapPontDesDeuxMondesReady === "function" && mapPontDesDeuxMondesReady()) {
    drawBgBosphorePng(t, raining, storm);
    return;
  }
  if (typeof mapPalaisDuCoqReady === "function" && mapPalaisDuCoqReady() && tk === "palais-du-coq") {
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
  drawCourtApron(raining ? "#5a7a3e" : "#7ed957", raining ? "#425c2c" : "#5aab3c");
  if (raining) {
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(0, GROUND_Y, W, 6);
  }

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
}

/** Esplanade du Défilé — fond PNG Bébé. */
function drawBgParade() {
  const t = performance.now() / 1000;
  const storm = weather === "storm";
  const raining = weather === "rain" || storm;
  const tk = TERRAINS[terrain] && TERRAINS[terrain].key;
  if (tk === "stade-ashram" && typeof mapStadeAshramReady === "function" && mapStadeAshramReady()) {
    drawBgAshramPng(t, raining, storm);
    return;
  }
  if (typeof mapEsplanadeDuDefileReady === "function" && mapEsplanadeDuDefileReady() && tk !== "stade-ashram") {
    drawBgParadePng(t, raining, storm);
    return;
  }
  // fallback minimal
  ctx.fillStyle = "#8a9aaa";
  ctx.fillRect(0, 0, W, GROUND_Y);
  drawCrowd();
  drawCourtApron("#7a8088", "#5a6068");
}

function drawBgParadePng(t, raining, storm) {
  const p = SPRITES.mapEsplanadeDuDefile;

  drawMapBackdrop(p, "#9aa2aa");

  if (storm) {
    ctx.fillStyle = "rgba(60,70,80,0.35)";
    ctx.fillRect(0, 0, W, H);
  } else if (raining) {
    ctx.fillStyle = "rgba(90,100,110,0.16)";
    ctx.fillRect(0, 0, W, H);
  }

  // Public calque désactivé (déjà dans le skyline)

  drawCourtApron(raining ? "#6a7078" : "#9aa2aa", raining ? "#4a5058" : "#7a828a");
  drawCourtSeam("#c62828", "#c9a227");

  // Bannière
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.1) * 2;
    drawMapProp(p.flag, 78, GROUND_Y + 2 + bob, PROP_H.flag);
    ctx.save();
    ctx.translate(W - 78, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, PROP_H.flag);
    ctx.restore();
  }

  // Bouquets
  if (spriteReady(p.flower)) {
    drawMapProp(p.flower, 200, GROUND_Y + 2, PROP_H.flower);
    drawMapProp(p.flower, W - 200, GROUND_Y + 2, PROP_H.flower);
  }

  // Radar — idle décoratif ; actif pendant l'event Batterie AA
  if (spriteReady(p.radar)) {
    const eventOn = typeof mapEvent !== "undefined" && !mapEventsQuiet &&
      typeof mapEventKind === "function" && mapEventKind() === "radar" &&
      mapEvent.phase !== "idle";
    const ping = (eventOn || Math.sin(t * 4) > 0.65) && spriteReady(p.radarActive);
    drawMapProp(ping ? p.radarActive : p.radar, 130, GROUND_Y + 2, PROP_H.radar);
  }

  drawMapEventOverlay();
}

/** Palais du Coq — fond PNG Micron. */
function drawBgPrairiePng(t, raining, storm) {
  const p = SPRITES.mapPalaisDuCoq;

  // far optionnel (scène différente) : léger voile seulement
  drawMapBackdrop(p, "#b5c4d2");

  if (storm) {
    ctx.fillStyle = "rgba(70,80,90,0.32)";
    ctx.fillRect(0, 0, W, H);
  } else if (raining) {
    ctx.fillStyle = "rgba(100,120,130,0.16)";
    ctx.fillRect(0, 0, W, H);
  }

  // Public PNG désactivé pour l’instant (même raison que Resort)

  drawCourtApron(raining ? "#9a9080" : "#d2c4a8", raining ? "#6e6558" : "#b5a68a");
  drawCourtSeam("#1a237e", "#c9a227");

  // Drapeaux (gauche / droite)
  if (spriteReady(p.flag)) {
    const bob = Math.sin(t * 2.4) * 2;
    drawMapProp(p.flag, 70, GROUND_Y + 2 + bob, PROP_H.flag);
    ctx.save();
    ctx.translate(W - 70, 0);
    ctx.scale(-1, 1);
    drawMapProp(p.flag, 0, GROUND_Y + 2 - bob, PROP_H.flag);
    ctx.restore();
  }

  // Pigeons décoratifs
  if (spriteReady(p.pigeon)) {
    const bob1 = Math.sin(t * 3.1) * 1.5;
    const bob2 = Math.sin(t * 2.7 + 1.2) * 1.5;
    drawMapProp(p.pigeon, 160, GROUND_Y - 2 + bob1, PROP_H.pigeon);
    drawMapProp(p.pigeon, W - 180, GROUND_Y - 4 + bob2, PROP_H.pigeon);
  }

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
  if (key === "place-ecarlate" && SPRITES.mapPlaceEcarlate && spriteReady(SPRITES.mapPlaceEcarlate.netPost)) {
    return SPRITES.mapPlaceEcarlate.netPost;
  }
  if (key === "country-club-dore" && SPRITES.mapCountryClubDore && spriteReady(SPRITES.mapCountryClubDore.netPost)) {
    return SPRITES.mapCountryClubDore.netPost;
  }
  if (key === "palais-du-coq" && SPRITES.mapPalaisDuCoq && spriteReady(SPRITES.mapPalaisDuCoq.netPost)) {
    return SPRITES.mapPalaisDuCoq.netPost;
  }
  if (key === "esplanade-du-defile" && SPRITES.mapEsplanadeDuDefile && spriteReady(SPRITES.mapEsplanadeDuDefile.netPost)) {
    return SPRITES.mapEsplanadeDuDefile.netPost;
  }
  if (key === "cite-du-matin" && SPRITES.mapCiteDuMatin && spriteReady(SPRITES.mapCiteDuMatin.netPost)) {
    return SPRITES.mapCiteDuMatin.netPost;
  }
  if (key === "stade-ashram" && SPRITES.mapStadeAshram && spriteReady(SPRITES.mapStadeAshram.netPost)) {
    return SPRITES.mapStadeAshram.netPost;
  }
  if (key === "pont-des-deux-mondes" && SPRITES.mapPontDesDeuxMondes && spriteReady(SPRITES.mapPontDesDeuxMondes.netPost)) {
    return SPRITES.mapPontDesDeuxMondes.netPost;
  }
  if (key === "grande-foret" && SPRITES.mapGrandeForet && spriteReady(SPRITES.mapGrandeForet.netPost)) {
    return SPRITES.mapGrandeForet.netPost;
  }
  if (key === "citadelle-du-levant" && SPRITES.mapCitadelleDuLevant && spriteReady(SPRITES.mapCitadelleDuLevant.netPost)) {
    return SPRITES.mapCitadelleDuLevant.netPost;
  }
  if (key === "jardin-des-roses" && SPRITES.mapJardinDesRoses && spriteReady(SPRITES.mapJardinDesRoses.netPost)) {
    return SPRITES.mapJardinDesRoses.netPost;
  }
  return null;
}

function drawNet() {
  // Poteau PNG : pied sur GROUND_Y (= ligne de fond map) × NET_X (= médiane).
  const img = terrainNetPostImg();
  const np = (currentMapLayout().netPost) || {};
  const footPad = np.footPad || 0;
  const xOff = np.xOff || 0;
  const sc = np.scale || 1;
  const aspectMul = (np.aspectMul != null) ? np.aspectMul : 0.78;

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(NET_X + xOff, GROUND_Y + 3, img ? 16 : 12, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (img) {
    const drawH = ((GROUND_Y - NET_TOP) + 28) * sc;
    const aspect = (img.naturalWidth || img.width) / Math.max(1, img.naturalHeight || img.height);
    const drawW = drawH * aspect * aspectMul;
    // footPad compense le padding transparent bas du PNG
    ctx.drawImage(img, NET_X - drawW / 2 + xOff, GROUND_Y - drawH + footPad, drawW, drawH);
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
  // mode flamme : ballon toujours en feu (stages 0..3)
  if (flameMode) { drawFlameBall(); return; }
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
  const spr = SPRITES.ballPurple;
  if (spriteReady(spr)) {
    const d = BALL_R * 2.15; // léger débord pour que le trait noir du PNG colle au rayon physique
    ctx.drawImage(spr, -d / 2, -d / 2, d, d);
  } else {
    // Fallback minimal si le PNG n'est pas encore chargé
    ctx.fillStyle = "#c9a0ff";
    ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** Intensité du ballon enflammé : 0 (braises) → 3 (brasier), selon le pire PV. */
function flameBallStage() {
  let burn = 0;
  for (const b of activeBlobs) {
    const hp = (b.flameHp == null) ? FLAME_HP_MAX : b.flameHp;
    burn = Math.max(burn, FLAME_HP_MAX - hp);
  }
  return Math.max(0, Math.min(3, burn));
}

function drawFlameBall() {
  const stage = flameBallStage();
  // traînée orange toujours allumée
  for (let i = 0; i < ball.trail.length; i++) {
    const t = ball.trail[i];
    const f = (i + 1) / ball.trail.length;
    ctx.fillStyle = "rgba(255," + Math.floor(40 + f * 140) + ",0," + (f * 0.45).toFixed(2) + ")";
    ctx.beginPath(); ctx.arc(t.x, t.y, BALL_R * (0.45 + f * 0.75), 0, Math.PI * 2); ctx.fill();
  }
  const pulse = 0.5 + 0.5 * Math.sin((typeof tick === "number" ? tick : 0) / 7);
  ctx.fillStyle = "rgba(255," + (80 + stage * 30) + ",0," + (0.18 + stage * 0.08 + pulse * 0.08).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R + 6 + stage * 3 + pulse * 2, 0, Math.PI * 2); ctx.fill();

  const shScale = Math.max(0.3, 1 - (GROUND_Y - ball.y) / 400);
  ctx.fillStyle = "rgba(0,0,0," + (0.25 * shScale) + ")";
  ctx.beginPath();
  ctx.ellipse(ball.x, GROUND_Y + 6, BALL_R * shScale + 4, 5 * shScale + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.angle);
  const flames = SPRITES.ballFlame;
  let spr = flames && flames[stage];
  if (!spriteReady(spr) && flames) {
    for (let i = stage; i >= 0; i--) { if (spriteReady(flames[i])) { spr = flames[i]; break; } }
  }
  if (!spriteReady(spr)) spr = SPRITES.ballPurple;
  if (spriteReady(spr)) {
    const d = BALL_R * (2.25 + stage * 0.08);
    ctx.drawImage(spr, -d / 2, -d / 2, d, d);
  } else {
    ctx.fillStyle = "#ff6a20";
    ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/** Jauge PV flamme au-dessus de chaque joueur. */
function drawFlameHUD() {
  for (const b of activeBlobs) {
    const max = FLAME_HP_MAX;
    const hp = Math.max(0, b.flameHp == null ? max : b.flameHp);
    const pipW = 10, gap = 3;
    const totalW = max * pipW + (max - 1) * gap;
    const x0 = b.x - totalW / 2;
    const y0 = b.y - ((typeof CHAR_BASE_H !== "undefined") ? CHAR_BASE_H : 110) - 14;
    for (let i = 0; i < max; i++) {
      const on = i < hp;
      ctx.fillStyle = on ? "#ff6a20" : "rgba(20,12,8,0.55)";
      ctx.strokeStyle = on ? "#ffe08a" : "rgba(255,200,120,0.25)";
      ctx.lineWidth = 1.2;
      const x = x0 + i * (pipW + gap);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y0, pipW, 7, 2);
      else ctx.rect(x, y0, pipW, 7);
      ctx.fill(); ctx.stroke();
    }
    if (b.flameIgniteT > 0) {
      ctx.fillStyle = "rgba(255,80,0," + Math.min(0.7, b.flameIgniteT / 70).toFixed(2) + ")";
      ctx.beginPath();
      ctx.arc(b.x, b.y - 55, 28 + (70 - b.flameIgniteT) * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
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
  if (flameMode && (state === "play" || state === "serve" || state === "point")) drawFlameHUD();

  // ---- scores strictement sous le terrain (bande SCORE_BAND)
  const DISP = (typeof UI !== "undefined" ? UI.display : "'Fredoka', sans-serif");
  const SANS = (typeof UI !== "undefined" ? UI.sans : "'Nunito', sans-serif");
  const STROKE = (typeof UI !== "undefined" ? UI.stroke : "#1b1730");
  const CREAM = "rgba(255,246,232,0.55)";
  const sideLbl = s => (mode === "2v2" ? (s === 0 ? "Équipe 1" : "Équipe 2") : sideLabel(s));
  const pw = 132, ph = 62;
  const py = GROUND_Y + 14; // sous la ligne de fond du terrain
  // Fond de bande score (plus léger si le décor PNG descend jusqu'en bas)
  ctx.fillStyle = currentMapLayout().bgFullHeight
    ? "rgba(18,22,32,0.42)"
    : "rgba(18,22,32,0.62)";
  ctx.fillRect(0, GROUND_Y + 2, W, H - GROUND_Y - 2);
  for (const s of [0, 1]) {
    const cx = s === 0 ? W * 0.22 : W * 0.78;
    const col = sideColor(s);
    const pop = scorePop[s] || 0;
    const px = cx - pw / 2;
    ctx.fillStyle = CREAM;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 12);
    else ctx.rect(px, py, pw, ph);
    ctx.fill();
    ctx.strokeStyle = "rgba(27,23,48,0.35)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = col;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px + 3, py + 3, pw - 6, 15, 8);
    else ctx.rect(px + 3, py + 3, pw - 6, 15);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff6e8";
    ctx.font = "700 10px " + SANS;
    ctx.strokeStyle = "rgba(27,23,48,0.55)"; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.strokeText(sideLbl(s), cx, py + 14);
    ctx.fillText(sideLbl(s), cx, py + 14);
    const scSize = 24 + pop * 1.2;
    ctx.font = "700 " + scSize + "px " + DISP;
    ctx.strokeStyle = "rgba(27,23,48,0.75)"; ctx.lineWidth = 4;
    ctx.strokeText(String(scores[s]), cx, py + 40);
    ctx.fillStyle = col;
    ctx.fillText(String(scores[s]), cx, py + 40);
    if (scorePop[s] > 0) scorePop[s]--;
  }
  // pastille VS
  ctx.textAlign = "center";
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(NET_X - 20, py + 18, 40, 24, 10);
  else ctx.rect(NET_X - 20, py + 18, 40, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(27,23,48,0.35)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = STROKE;
  ctx.font = "700 12px " + DISP;
  ctx.fillText("VS", NET_X, py + 35);

  // touches (pastilles) dans la bande score, sous la ligne de terrain
  for (const side of [0, 1]) {
    const baseX = side === 0 ? W * 0.22 - 24 : W * 0.78 - 24;
    for (let i = 0; i < MAX_TOUCHES; i++) {
      const on = i < ball.touches[side];
      ctx.beginPath();
      ctx.arc(baseX + i * 24, GROUND_Y + 8, 5, 0, Math.PI * 2);
      ctx.fillStyle = on ? sideColor(side) : "rgba(255,255,255,0.2)";
      ctx.fill();
      ctx.strokeStyle = STROKE; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }

  // jauges SUPER — clairement sous le chiffre du score
  for (const s of [0, 1]) {
    const cx = s === 0 ? W * 0.22 : W * 0.78;
    const col = sideColor(s);
    const bw = 100, bx = cx - bw / 2, by = py + ph - 12;
    const ready = superCharge[s] === 1;
    const frac = ready ? 1 : (streak[s] % SUPER_NEED) / SUPER_NEED;
    ctx.fillStyle = "rgba(27,23,48,0.18)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, bw, 6, 3); else ctx.rect(bx, by, bw, 6);
    ctx.fill();
    if (frac > 0) {
      if (ready) {
        const t = performance.now() / 300;
        ctx.fillStyle = (Math.sin(t * 6) > 0) ? "#ffd84a" : "#fff2a0";
      } else ctx.fillStyle = col;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, Math.max(3, bw * frac), 6, 3);
      else ctx.rect(bx, by, bw * frac, 6);
      ctx.fill();
    }
  }

  // message flash de SUPER (nom + description longue, temps de lecture)
  if (superFlashT > 0 && superFlash) {
    const alpha = Math.min(1, superFlashT / 36);
    ctx.textAlign = "center";
    ctx.globalAlpha = alpha;
    const titleY = 108;
    const boxW = Math.min(720, W - 36);
    // Mesure le sous-titre wrapé pour dimensionner la boîte
    ctx.font = "700 13px " + SANS;
    const subLines = [];
    if (superFlashSub) {
      const words = superFlashSub.split(" ");
      let line = "";
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (ctx.measureText(test).width > boxW - 36 && line) {
          subLines.push(line); line = w;
        } else line = test;
      }
      if (line) subLines.push(line);
    }
    const boxH = 40 + (subLines.length ? 8 + subLines.length * 17 : 0);
    const bx = NET_X - boxW / 2, by = titleY - 26;
    ctx.fillStyle = "rgba(12,20,42,0.82)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, boxW, boxH, 12); else ctx.rect(bx, by, boxW, boxH);
    ctx.fill();
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 3; ctx.lineJoin = "round";
    ctx.font = "700 24px " + DISP;
    ctx.strokeText(superFlash, NET_X, titleY);
    ctx.fillStyle = "#ffd84a";
    ctx.fillText(superFlash, NET_X, titleY);
    if (subLines.length) {
      ctx.font = "700 13px " + SANS;
      ctx.fillStyle = "rgba(255,246,232,0.96)";
      let sy = titleY + 22;
      for (const ln of subLines) {
        ctx.fillText(ln, NET_X, sy);
        sy += 17;
      }
    }
    ctx.globalAlpha = 1;
  }

  // Annonce événement de map
  if (typeof mapEventFlashT !== "undefined" && mapEventFlashT > 0 && mapEventFlash) {
    const alpha = Math.min(1, mapEventFlashT / 16);
    ctx.textAlign = "center";
    ctx.globalAlpha = alpha;
    const titleY = (superFlashT > 0 && superFlash) ? 210 : 118;
    const boxW = Math.min(660, W - 40);
    const boxH = mapEventFlashSub ? 58 : 40;
    const bx = NET_X - boxW / 2, by = titleY - 24;
    ctx.fillStyle = "rgba(12,20,42,0.78)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, boxW, boxH, 12); else ctx.rect(bx, by, boxW, boxH);
    ctx.fill();
    ctx.font = "700 22px " + DISP;
    ctx.strokeStyle = STROKE; ctx.lineWidth = 3; ctx.lineJoin = "round";
    ctx.strokeText(mapEventFlash, NET_X, titleY);
    ctx.fillStyle = "#ff9800";
    ctx.fillText(mapEventFlash, NET_X, titleY);
    if (mapEventFlashSub) {
      ctx.font = "700 12px " + SANS;
      ctx.fillStyle = "rgba(255,246,232,0.95)";
      ctx.fillText(mapEventFlashSub, NET_X, titleY + 20);
    }
    ctx.globalAlpha = 1;
  }

  // balle de match
  if (state === "play" || state === "serve") {
    for (const s of [0, 1]) {
      if (scores[s] >= matchWinScore() - 1 && scores[s] - scores[1 - s] >= 1) {
        const txt = "★ Balle de match — " + sideLabel(s) + " ★";
        ctx.textAlign = "center";
        ctx.font = "700 16px " + DISP;
        ctx.strokeStyle = STROKE; ctx.lineWidth = 4; ctx.lineJoin = "round";
        ctx.strokeText(txt, NET_X, 36);
        ctx.fillStyle = sideColor(s);
        ctx.fillText(txt, NET_X, 36);
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
    // Haut d'écran libre (coach tutoriel en bas)
    const pw = tw + 36, ph = 34, px = NET_X - pw / 2;
    const py = 28;
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

