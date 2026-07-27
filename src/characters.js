// sommet-volley · rendu des personnages (sprites PNG + fallback canvas)
"use strict";

/**
 * Dessine un personnage (Blob de jeu ou aperçu menu).
 * Priorité : sprites PNG / WebM célébration (`char-sprites.js`) ; sinon canvas.
 */
function drawCharacter(b) {
  const A = CHARACTERS[b.charId];
  if (A.color) { b.color = A.color; b.darkColor = A.darkColor; }
  const key = A.key;
  drawSuperAura(b);
  const menu = b.groundY != null;
  const ghost = !menu && typeof isBallGhostBlob === "function" && isBallGhostBlob(b);
  const charred = !menu && (b.charredT | 0) > 0;
  if (ghost) { ctx.save(); ctx.globalAlpha *= 0.42; }
  if (charred) {
    ctx.save();
    ctx.filter = "brightness(0)";
  }
  const sprited = menu
    ? (typeof drawSpriteCharMenu === "function" && drawSpriteCharMenu(b))
    : (typeof drawSpriteChar === "function" && drawSpriteChar(b));
  if (!sprited) {
    if (key === "volkoi") drawVladou(b);
    else if (key === "dorf") drawDorfFallback(b);
    else if (key === "cygne") drawCygneFallback(b);
    else if (key === "bebe") drawBebe(b);
    else drawGenericChar(b);
  }
  if (charred) ctx.restore();
  if (ghost) ctx.restore();
  if (!menu && typeof drawFlameOverlay === "function") drawFlameOverlay(b);
  drawSuperOverlay(b);
  // Zones de cour : drawSuperCourtFX() (appel unique depuis render)
  if (b.superT > 0 && charOf(b).key === "cygne") drawCygneForceAura(b);
  drawEmote(b);
  if (!menu) draw2v2TouchCue(b, ghost);
}

/** 2v2 : anneau sur le joueur autorisé à frapper ; rien de plus sur le ghost. */
function draw2v2TouchCue(b, ghost) {
  if (typeof mode === "undefined" || mode !== "2v2") return;
  if (typeof state === "undefined" || state !== "play") return;
  if (ghost) return;
  if (typeof ball === "undefined" || !ball.nextToucher) return;
  const nt = ball.nextToucher[b.side];
  if (nt == null || nt < 0) return;
  if (typeof activeBlobs === "undefined" || activeBlobs.indexOf(b) !== nt) return;
  const t = (typeof tick === "number" ? tick : 0) / 8;
  ctx.save();
  ctx.globalAlpha = 0.55 + Math.sin(t) * 0.15;
  ctx.strokeStyle = (typeof UI !== "undefined" && UI.gold) ? UI.gold : "#ffd27a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(b.x, b.y - 40, 28 + Math.sin(t) * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Overlays feu (pieds / corps / tête) selon les PV restants en mode flamme. */
function drawFlameOverlay(b) {
  if (typeof flameMode === "undefined" || !flameMode) return;
  if (b.groundY != null) return;
  const max = (typeof FLAME_HP_MAX !== "undefined") ? FLAME_HP_MAX : 9;
  const hp = (b.flameHp == null) ? max : b.flameHp;
  let burn = max - hp;
  if ((b.flameIgniteT | 0) > 0) burn = Math.max(burn, max);
  if (burn <= 0) return;
  // Paliers 1..3 selon la fraction de PV perdus (indépendant du max)
  const tier = Math.max(1, Math.min(3, Math.ceil((burn / max) * 3)));

  let spr = null;
  const t = (typeof tick === "number" ? tick : 0);
  if (tier >= 3) {
    const frames = SPRITES.fxFlameHead || [];
    spr = frames[Math.min(frames.length - 1, (t >> 3) % Math.max(1, frames.length))];
  } else if (tier === 2) {
    const frames = SPRITES.fxFlameBody || [];
    spr = frames[Math.min(frames.length - 1, ((t >> 4) & 1))];
    if (!spriteReady(spr)) spr = frames[Math.min(2, frames.length - 1)];
  } else {
    const frames = SPRITES.fxFlameFeet || [];
    spr = frames[Math.min(frames.length - 1, (t >> 4) % Math.max(1, frames.length))];
  }
  if (!spriteReady(spr)) return;

  const pack = (typeof charPack === "function") ? charPack(CHARACTERS[b.charId].key) : null;
  const baseH = (pack && pack.manifest && pack.manifest.baseH) || CHAR_BASE_H;
  const footPad = (pack && pack.manifest && pack.manifest.footPad) || 2;
  const scaleX = (pack && pack.manifest && pack.manifest.scaleX) || 1;
  const h = baseH * 1.08;
  const w = h * (spr.naturalWidth / spr.naturalHeight) * scaleX;
  const faceRight = (typeof charFaceRight === "function") ? charFaceRight(b) : (b.side === 0);
  ctx.save();
  ctx.translate(b.x, b.y);
  if (!faceRight) ctx.scale(-1, 1);
  ctx.globalAlpha = (b.flameIgniteT | 0) > 0 ? 0.95 : 0.82;
  ctx.drawImage(spr, -w / 2, -h + footPad, w, h);
  ctx.restore();
}

/** Vrais joueurs uniquement (pas les aperçus menu). Inclut le 2v2. */
function isLiveBlob(b) {
  return b === blobL || b === blobR ||
    (typeof blob2L !== "undefined" && b === blob2L) ||
    (typeof blob2R !== "undefined" && b === blob2R);
}

function drawEmote(b) {
  const side = b === blobL ? 0 : b === blobR ? 1 : -1;
  if (side < 0) return;
  const e = emotes[side];
  if (!e || e.t <= 0) return;
  const prog = 1 - e.t / 55;
  const ex = b.x, ey = b.y - 94 - prog * 14;
  const font = (typeof UI !== "undefined" ? UI.display : "'Fredoka', sans-serif");
  ctx.save();
  ctx.globalAlpha = Math.min(1, e.t / 12);
  ctx.textAlign = "center";
  if (e.kind === "happy") {
    ctx.fillStyle = "#ffd93d";
    ctx.save(); ctx.translate(ex - 11, ey + 2); ctx.rotate(prog); drawStarShape(5); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(ex + 11, ey - 3); ctx.rotate(-prog); drawStarShape(4); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(ex, ey - 8); drawStarShape(6); ctx.fill(); ctx.restore();
  } else if (e.kind === "sad") {
    ctx.fillStyle = "#5db3ff";
    ctx.beginPath();
    ctx.moveTo(ex, ey - 7);
    ctx.quadraticCurveTo(ex + 6, ey + 2, ex, ey + 8);
    ctx.quadraticCurveTo(ex - 6, ey + 2, ex, ey - 7);
    ctx.fill();
  } else if (e.kind === "wow") {
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#e84545";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.font = "700 30px " + font;
    ctx.strokeText("!", ex, ey + 10);
    ctx.fillText("!", ex, ey + 10);
  }
  ctx.restore();
}

function drawSuperAura(b) {
  if (!isLiveBlob(b)) return;
  const t = performance.now() / 1000;
  if (b.superT > 0) {
    const pulse = 0.45 + Math.sin(t * 6) * 0.12;
    ctx.save();
    ctx.globalAlpha = pulse;
    const g = ctx.createRadialGradient(b.x, b.y - 36, 6, b.x, b.y - 36, 68);
    g.addColorStop(0, "rgba(255,230,140,0.75)");
    g.addColorStop(0.45, "rgba(255,200,80,0.28)");
    g.addColorStop(1, "rgba(255,200,60,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y - 36, 68, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "rgba(255,230,120,0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(b.x, b.y - 36, 48 + Math.sin(t * 5) * 4, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  } else if (superCharge[b.side] === 1) {
    ctx.save();
    ctx.globalAlpha = 0.55 + Math.sin(t * 5) * 0.15;
    ctx.strokeStyle = "rgba(255,220,90,0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(b.x, b.y - 38, 44, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,240,180,0.9)";
    for (let i = 0; i < 5; i++) {
      const a = t * 2.2 + i * (Math.PI * 2 / 5);
      ctx.beginPath();
      ctx.arc(b.x + Math.cos(a) * 44, b.y - 38 + Math.sin(a) * 44, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawSuperOverlay(b) {
  if (!isLiveBlob(b)) return;
  const t = performance.now() / 1000;
  const windupHere = powerWindup && powerWindup.side === b.side;
  const powerReady = typeof powerGaugeReady === "function" && powerGaugeReady(b.side);
  if ((b.superSmash && b.superT > 0) || windupHere || (powerReady && !powerWindup)) {
    ctx.save();
    ctx.globalAlpha = 0.28 + Math.sin(t * 7) * 0.08;
    const g = ctx.createRadialGradient(b.x, b.y - 36, 4, b.x, b.y - 36, windupHere ? 48 : 38);
    g.addColorStop(0, windupHere ? "rgba(255,120,60,0.65)" : "rgba(255,245,160,0.5)");
    g.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y - 36, windupHere ? 48 : 38, 0, Math.PI * 2); ctx.fill();
    if (windupHere) {
      // Anneau de dosage
      const ch = Math.max(0.05, Math.min(1, powerWindup.charge || 0));
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = "#ff8a3d";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y - 36, 44, -Math.PI / 2, -Math.PI / 2 + ch * Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawCharBody(b, paint) {
  const footY = b.groundY != null ? b.groundY : b.y;
  const faceRight = typeof charFaceRight === "function" ? charFaceRight(b) : b.side === 0;
  const dir = faceRight ? 1 : -1;
  const squash = b.squash > 0 ? 1 - b.squash * 0.03 : 1;
  ctx.save();
  ctx.translate(b.x, footY);
  ctx.scale(dir, squash);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath(); ctx.ellipse(0, 2, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
  paint(ctx, b);
  ctx.restore();
}

function drawVladou(b) {
  drawCharBody(b, (c) => {
    c.fillStyle = "#3a3f4a";
    c.fillRect(-12, -28, 10, 28); c.fillRect(2, -28, 10, 28);
    c.fillStyle = "#e8d9b0";
    c.beginPath(); c.ellipse(0, -48, 20, 24, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#b43a2e";
    c.beginPath(); c.moveTo(-18, -55); c.lineTo(-8, -70); c.lineTo(-4, -40); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(18, -55); c.lineTo(8, -70); c.lineTo(4, -40); c.closePath(); c.fill();
    c.fillStyle = "#e8d9b0";
    c.beginPath(); c.arc(0, -82, 16, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#1a1a1a";
    c.fillRect(-8, -86, 5, 2); c.fillRect(3, -86, 5, 2);
    c.strokeStyle = "#2a2a2a"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-10, -90); c.lineTo(10, -90); c.stroke();
    c.fillStyle = "#6a6e78";
    c.beginPath(); c.arc(0, -92, 14, Math.PI, 0); c.fill();
  });
}

/** Fallback canvas pour les nouveaux persos (sprites pas encore prêts). */
function drawGenericChar(b) {
  const A = charOf(b);
  const col = A.color || "#888";
  const dark = A.darkColor || "#444";
  drawCharBody(b, (c) => {
    c.fillStyle = dark;
    c.fillRect(-12, -28, 10, 28); c.fillRect(2, -28, 10, 28);
    c.fillStyle = col;
    c.beginPath(); c.ellipse(0, -50, 18, 22, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#f5d0b0";
    c.beginPath(); c.arc(0, -84, 16, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#1a1a1a";
    c.fillRect(-7, -88, 4, 2); c.fillRect(3, -88, 4, 2);
    c.strokeStyle = dark; c.lineWidth = 2;
    c.beginPath(); c.arc(0, -78, 5, 0.2, Math.PI - 0.2); c.stroke();
  });
}

function drawDorfFallback(b) {
  drawCharBody(b, (c) => {
    c.fillStyle = "#1a237e";
    c.fillRect(-11, -30, 9, 30); c.fillRect(2, -30, 9, 30);
    c.fillStyle = "#f0a060";
    c.beginPath(); c.ellipse(0, -52, 16, 22, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#c62828";
    c.beginPath();
    c.moveTo(0, -68); c.lineTo(5, -40); c.lineTo(0, -28); c.lineTo(-5, -40);
    c.closePath(); c.fill();
    c.fillStyle = "#f0a060";
    c.beginPath(); c.arc(0, -86, 17, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#c9a227";
    c.beginPath(); c.moveTo(-14, -92); c.quadraticCurveTo(0, -112, 18, -88); c.lineTo(10, -86); c.closePath(); c.fill();
    c.fillStyle = "#1a1a1a";
    c.beginPath(); c.arc(-5, -88, 2, 0, Math.PI * 2); c.arc(6, -88, 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#f0a060";
    c.beginPath(); c.ellipse(18, -58, 5, 8, 0.3, 0, Math.PI * 2); c.fill();
  });
}

function drawCygneFallback(b) {
  drawCharBody(b, (c) => {
    c.fillStyle = "#1a237e";
    c.fillRect(-10, -32, 8, 32); c.fillRect(2, -32, 8, 32);
    c.fillStyle = "#283593";
    c.beginPath(); c.moveTo(-14, -38); c.lineTo(-10, -72); c.lineTo(10, -72); c.lineTo(14, -38); c.closePath(); c.fill();
    c.fillStyle = "#f5f5f5";
    c.fillRect(-3, -70, 6, 28);
    c.fillStyle = "#0055a4"; c.fillRect(10, -65, 4, 14);
    c.fillStyle = "#ffffff"; c.fillRect(10, -51, 4, 8);
    c.fillStyle = "#ef4135"; c.fillRect(10, -43, 4, 10);
    c.fillStyle = "#f0d0b0";
    c.beginPath(); c.arc(0, -88, 14, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#3e2723";
    c.beginPath(); c.ellipse(2, -96, 12, 8, -0.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#1a1a1a";
    c.fillRect(-6, -90, 4, 2); c.fillRect(3, -90, 4, 2);
  });
}

function drawBebe(b) {
  drawCharBody(b, (c) => {
    c.fillStyle = "#1a241c";
    c.fillRect(-11, -30, 9, 30); c.fillRect(2, -30, 9, 30);
    c.fillStyle = "#2d3a2e";
    c.beginPath(); c.moveTo(-16, -36); c.lineTo(-12, -74); c.lineTo(12, -74); c.lineTo(16, -36); c.closePath(); c.fill();
    c.fillStyle = "#c62828";
    c.beginPath(); c.arc(8, -58, 3.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#f0d5c0";
    c.beginPath(); c.arc(0, -90, 15, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#111111";
    c.beginPath(); c.ellipse(0, -98, 15, 10, 0, Math.PI, 0); c.fill();
    c.fillRect(-15, -98, 30, 10);
    c.fillStyle = "#1a1a1a";
    c.fillRect(-7, -92, 4, 2); c.fillRect(3, -92, 4, 2);
    c.strokeStyle = "#5a4030"; c.lineWidth = 1.5;
    c.beginPath(); c.arc(0, -84, 4, 0.15, Math.PI - 0.15); c.stroke();
  });
}

/** Aura Cygne (buff soi) — anneaux bleus bien visibles. */
function drawCygneForceAura(b) {
  if (!b || b.superT <= 0) return;
  const fade = Math.min(1, b.superT / 50);
  const t = (typeof tick === "number" ? tick : 0) / 8;
  const pulse = 0.55 + 0.25 * Math.sin(t * 2.2);
  ctx.save();
  ctx.globalAlpha = 0.55 * fade * pulse;
  for (let r = 28; r <= 62; r += 17) {
    ctx.strokeStyle = "rgba(80,140,255,0.95)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y - 40, r + Math.sin(t + r) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(b.x, b.y - 40, 6, b.x, b.y - 40, 70);
  g.addColorStop(0, "rgba(120,180,255,0.45)");
  g.addColorStop(1, "rgba(60,120,255,0)");
  ctx.globalAlpha = 0.5 * fade;
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(b.x, b.y - 40, 70, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function superZoneBounds(side) {
  const x0 = side === 0 ? 0 : NET_X;
  const x1 = side === 0 ? NET_X : W;
  return { x0, x1, span: Math.max(1, x1 - x0), mid: (x0 + x1) / 2 };
}

function superFxSprite(name) {
  const pack = typeof SPRITES !== "undefined" && SPRITES.superFx;
  const img = pack && pack[name];
  return (typeof spriteReady === "function" && spriteReady(img)) ? img : null;
}

/** Dessine un prop SUPER ancré au sol (pieds bas), centré en x. */
function drawSuperFxProp(img, cx, footY, drawH, alpha) {
  if (!img) return false;
  const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
  const h = drawH;
  const w = h * aspect;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, cx - w / 2, footY - h, w, h);
  ctx.restore();
  return true;
}

/** Tuile un prop au sol sur une largeur de camp. */
function drawSuperFxGroundTile(img, x0, x1, footY, tileH, alpha) {
  if (!img) return false;
  const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
  const h = tileH;
  const w = h * aspect;
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let x = x0 - w * 0.15; x < x1; x += w * 0.72) {
    ctx.drawImage(img, x, footY - h, w, h);
  }
  ctx.restore();
  return true;
}

function drawSuperZoneLabel(mid, text, color, fade) {
  const bounce = Math.sin((typeof tick === "number" ? tick : 0) / 10) * 3;
  ctx.save();
  ctx.globalAlpha = Math.min(1, 0.85 * fade);
  ctx.textAlign = "center";
  ctx.font = "800 22px " + (typeof UI !== "undefined" ? UI.display : "sans-serif");
  ctx.lineJoin = "round";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(12,20,42,0.85)";
  ctx.fillStyle = color;
  const y = 78 + bounce;
  ctx.strokeText(text, mid, y);
  ctx.fillText(text, mid, y);
  ctx.restore();
}

/** Couche sol / voile — sous les joueurs. */
function drawSuperCourtBack() {
  if (typeof superEffects === "undefined") return;
  for (const e of superEffects) {
    if (!e || e.t <= 0) continue;
    const fade = Math.min(1, e.t / 50);
    const { x0, x1, span, mid } = superZoneBounds(e.side | 0);
    if (e.kind === "ice") {
      ctx.save();
      ctx.globalAlpha = 0.28 * fade;
      ctx.fillStyle = "rgba(160,210,255,0.35)";
      ctx.fillRect(x0, 0, span, GROUND_Y + 4);
      ctx.restore();
      const ice = superFxSprite("ice");
      if (!drawSuperFxGroundTile(ice, x0, x1, GROUND_Y + 4, 78, 0.82 * fade)) {
        // Fallback canvas
        ctx.save();
        ctx.globalAlpha = 0.55 * fade;
        const band = ctx.createLinearGradient(x0, GROUND_Y - 28, x0, GROUND_Y + 6);
        band.addColorStop(0, "rgba(200,235,255,0)");
        band.addColorStop(1, "rgba(255,255,255,0.65)");
        ctx.fillStyle = band;
        ctx.fillRect(x0, GROUND_Y - 28, span, 34);
        ctx.restore();
      }
      drawSuperZoneLabel(mid, "❄ GLACE", "#b8e0ff", fade);
    } else if (e.kind === "slow") {
      ctx.save();
      ctx.globalAlpha = 0.22 * fade;
      ctx.fillStyle = "rgba(255,180,60,0.35)";
      ctx.fillRect(x0, 0, span, GROUND_Y + 4);
      ctx.restore();
      const slow = superFxSprite("slow");
      if (!drawSuperFxGroundTile(slow, x0, x1, GROUND_Y - 20, 110, 0.7 * fade)) {
        ctx.save();
        ctx.globalAlpha = 0.35 * fade;
        for (let i = 0; i < 8; i++) {
          const yy = 60 + i * 42 + Math.sin(tick / 20 + i) * 6;
          ctx.strokeStyle = "rgba(255,220,100,0.55)";
          ctx.lineWidth = 2;
          ctx.setLineDash([10, 14]);
          ctx.beginPath(); ctx.moveTo(x0 + 8, yy); ctx.lineTo(x1 - 8, yy); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }
      drawSuperZoneLabel(mid, "⏱ RALENTI", "#ffd060", fade);
    } else if (e.kind === "noground") {
      const pulse = 0.55 + 0.45 * Math.sin(tick / 8);
      ctx.save();
      ctx.globalAlpha = 0.28 * fade * pulse;
      ctx.fillStyle = "rgba(220,40,40,0.4)";
      ctx.fillRect(x0, GROUND_Y - 90, span, 94);
      ctx.restore();
      const ng = superFxSprite("noground");
      if (!drawSuperFxGroundTile(ng, x0, x1, GROUND_Y + 2, 90, 0.78 * fade * pulse)) {
        ctx.save();
        ctx.globalAlpha = 0.5 * fade * pulse;
        ctx.fillStyle = "rgba(220,40,40,0.5)";
        ctx.fillRect(x0, GROUND_Y - 40, span, 44);
        ctx.restore();
      }
      drawSuperZoneLabel(mid, "⬇ PLUS DE SAUT", "#ff6a5a", fade);
    }
  }
}

/** Murs + labels devant — après les joueurs. */
function drawSuperCourtFront() {
  if (typeof superEffects === "undefined") return;
  for (const e of superEffects) {
    if (!e || e.t <= 0 || e.kind !== "wall") continue;
    const fade = Math.min(1, e.t / 50);
    const side = e.side | 0;
    // Aligné Blob.update : mur dans le camp victime
    const wallX = side === 0 ? NET_X * 0.58 : NET_X + (W - NET_X) * 0.42;
    const pulse = 0.75 + 0.25 * Math.sin(tick / 9);
    // Variante forêt si un Capitaine a cast
    let forest = false;
    for (const b of activeBlobs) {
      if (b.superT > 0 && b.superKind === "capitaine" && b.side !== side) forest = true;
    }
    const spr = superFxSprite(forest ? "forest" : "wall");
    const ok = drawSuperFxProp(spr, wallX, GROUND_Y + 2, 150, 0.9 * fade * pulse);
    if (!ok) {
      // Fallback canvas
      const top = GROUND_Y - 130;
      ctx.save();
      ctx.globalAlpha = 0.75 * fade * pulse;
      if (forest) {
        for (let i = -2; i <= 2; i++) {
          const tx = wallX + i * 14;
          ctx.fillStyle = "#5d4037";
          ctx.fillRect(tx - 5, top + 20, 10, GROUND_Y - top - 20);
          ctx.fillStyle = "#2e7d32";
          ctx.beginPath();
          ctx.moveTo(tx, top); ctx.lineTo(tx + 16, top + 40); ctx.lineTo(tx - 16, top + 40);
          ctx.closePath(); ctx.fill();
        }
      } else {
        ctx.fillStyle = "rgba(255,230,120,0.9)";
        ctx.fillRect(wallX - 7, top + 6, 14, GROUND_Y - top - 10);
      }
      ctx.restore();
    }
    drawSuperZoneLabel(wallX, forest ? "🌲 FORÊT" : "🧱 MUR", forest ? "#7ed957" : "#ffe14d", fade);
  }
}

/** @deprecated — zones via drawSuperCourtBack/Front */
function drawCharSuperFX(_b) {}

function hasSuperEffect(kind, side) {
  for (const e of superEffects) if (e.kind === kind && e.side === side && e.t > 0) return e;
  return null;
}

function tickSuperEffects() {
  for (let i = superEffects.length - 1; i >= 0; i--) {
    if (--superEffects[i].t <= 0) superEffects.splice(i, 1);
  }
}
