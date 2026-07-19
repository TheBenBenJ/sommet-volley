// sommet-volley · rendu des personnages & expressions faciales
"use strict";

// ---------- Dessin des personnages ----------
// Chaque fonction reçoit un objet "b" (Blob réel ou aperçu du menu) avec :
// x, y, side, color, darkColor, onGround, vx, walkPhase, squash, animal
// et éventuellement groundY (pour les aperçus hors du sol de jeu).

function drawAnimal(b) {
  const A = ANIMALS[b.animal];
  if (A.color) { b.color = A.color; b.darkColor = A.darkColor; }
  const key = A.key;
  drawSuperAura(b);
  // Sprites PNG (pipeline) en priorité ; sinon caricature canvas
  const menu = b.groundY != null;
  const sprited = menu
    ? (typeof drawSpriteCharMenu === "function" && drawSpriteCharMenu(b))
    : (typeof drawSpriteChar === "function" && drawSpriteChar(b));
  if (!sprited) {
    if (key === "vladou") drawVladou(b);
    else if (key === "trompette") drawTrompette(b);
    else if (key === "micron") drawMicron(b);
    else if (key === "houn") drawHoun(b);
    else drawVladou(b);
  }
  drawSuperOverlay(b, key);
  drawCharSuperFX(b);
  drawEmote(b);
}

// n'affiche les effets de super que pour les vrais joueurs (pas les aperçus menu)
function isLiveBlob(b) { return b === blobL || b === blobR; }

// ---------- Expressions faciales ----------
// Humeur PUREMENT visuelle, dérivée d'états déjà connus (émote récente en cours,
// super chargée/active, saut) : aucune donnée nouvelle → rien à synchroniser,
// l'invité affiche la même chose (il reçoit émotes/super via les événements).
function faceMood(b) {
  const key = animOf(b).key;
  if (key === "vladou") return "fierce";
  if (key === "trompette") return "happy";
  if (key === "micron") return "focus";
  const side = b === blobL ? 0 : b === blobR ? 1 : -1;
  if (side >= 0) {
    const e = emotes[side];
    if (e && e.t > 0) {
      if (e.kind === "happy") return "happy";
      if (e.kind === "sad") return "sad";
      if (e.kind === "wow") return "shock";
    }
    if (b.superT > 0 || superCharge[side] === 1) return "fierce";
  }
  if (!b.onGround) return "focus";
  return "idle";
}

// deux sourcils au-dessus des yeux ; leur inclinaison porte l'émotion.
// (ex1, ex2) = centres des yeux, eyeY = leur ordonnée, r = rayon de l'œil.
function drawBrows(ex1, ex2, eyeY, r, mood) {
  const cx = (ex1 + ex2) / 2;
  let inner, outer, lift;
  // mood peut être un objet {inner,outer,lift} calculé dynamiquement (ex.
  // fureur croissante du manchot) au lieu d'un des préréglages ci-dessous.
  if (mood && typeof mood === "object") {
    ({ inner, outer, lift } = mood);
  } else switch (mood) {
    case "fierce": inner = 4;  outer = -3; lift = 0;  break; // froncés (déterminé)
    case "focus":  inner = 3;  outer = -1; lift = 1;  break; // concentré
    case "happy":  inner = -3; outer = -4; lift = -3; break; // haussés, joyeux
    case "sad":    inner = -4; outer = 3;  lift = -1; break; // peinés (intérieurs hauts)
    case "shock":  inner = -5; outer = -5; lift = -6; break; // très haussés
    default:       inner = -1; outer = -1; lift = -2;        // repos, à peine levés
  }
  ctx.save();
  ctx.strokeStyle = "rgba(35,28,22,0.82)";
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  for (const ex of [ex1, ex2]) {
    const toCenter = ex <= cx ? 1 : -1;         // sens « vers l'intérieur du visage »
    const y0 = eyeY - r - 1 + lift;
    ctx.beginPath();
    ctx.moveTo(ex + toCenter * r * 0.55, y0 + inner); // extrémité interne
    ctx.lineTo(ex - toCenter * r * 0.75, y0 + outer); // extrémité externe
    ctx.stroke();
  }
  ctx.restore();
}

// bouche : ouverture (px) & courbure (+ sourire / − moue) selon l'humeur.
function mouthParams(mood) {
  switch (mood) {
    case "happy":  return { open: 3,   curve: 5 };
    case "sad":    return { open: 2,   curve: -5 };
    case "shock":  return { open: 8,   curve: 0 };
    case "fierce": return { open: 4,   curve: -2 };
    case "focus":  return { open: 5,   curve: 0 };
    default:       return { open: 1.5, curve: 1 };
  }
}
// facteur d'ouverture du bec (0 = fermé, 1 = grand ouvert) pour l'effort/le cri.
function mouthOpen(b) {
  switch (faceMood(b)) {
    case "shock":  return 1;
    case "focus":  return 0.7;
    case "fierce": return 0.5;
    default:       return 0;
  }
}

// bulle d'émotion au-dessus de la tête (réaction aux points/smash)
function drawEmote(b) {
  const side = b === blobL ? 0 : b === blobR ? 1 : -1;
  if (side < 0) return;
  const e = emotes[side];
  if (!e || e.t <= 0) return;
  const prog = 1 - e.t / 55;
  const ex = b.x, ey = b.y - 94 - prog * 14;
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
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#e84545"; ctx.lineWidth = 4; ctx.lineJoin = "round";
    ctx.font = "bold 30px 'Inter', system-ui, sans-serif";
    ctx.strokeText("!", ex, ey + 10); ctx.fillText("!", ex, ey + 10);
  }
  ctx.restore();
}

function drawSuperAura(b) {
  if (!isLiveBlob(b)) return;
  const t = performance.now() / 1000;
  if (b.superT > 0) {
    // Super active : halo doux, peu saturé
    const pulse = 0.22 + Math.sin(t * 5) * 0.06;
    ctx.save();
    ctx.globalAlpha = pulse;
    const g = ctx.createRadialGradient(b.x, b.y - 36, 8, b.x, b.y - 36, 52);
    g.addColorStop(0, "rgba(255,230,140,0.55)");
    g.addColorStop(0.55, "rgba(255,200,80,0.12)");
    g.addColorStop(1, "rgba(255,200,60,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y - 36, 52, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (superCharge[b.side] === 1) {
    // Super prête : fin anneau + points discrets (plus d'étoiles canvas)
    ctx.save();
    ctx.globalAlpha = 0.35 + Math.sin(t * 4) * 0.1;
    ctx.strokeStyle = "rgba(255,220,90,0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(b.x, b.y - 38, 40, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,240,180,0.7)";
    for (let i = 0; i < 3; i++) {
      const a = t * 1.8 + i * (Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.arc(b.x + Math.cos(a) * 40, b.y - 38 + Math.sin(a) * 40, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawTurboGhosts(b, key) {
  ctx.save();
  for (let i = 1; i <= 3; i++) {
    ctx.globalAlpha = 0.12 * (4 - i);
    const gx = b.x - b.vx * i * 2.2;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.ellipse(gx, b.y - 30, 26, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSuperOverlay(b, key) {
  if (!isLiveBlob(b)) return;
  if (b.superSmash && b.superT > 0) {
    // 49.3 : léger scintillement, pas de traits « etoiles canvas »
    const t = performance.now() / 1000;
    ctx.save();
    ctx.globalAlpha = 0.28 + Math.sin(t * 7) * 0.08;
    const g = ctx.createRadialGradient(b.x, b.y - 36, 4, b.x, b.y - 36, 38);
    g.addColorStop(0, "rgba(255,245,160,0.5)");
    g.addColorStop(1, "rgba(255,220,80,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y - 36, 38, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function groundOf(b) { return b.groundY !== undefined ? b.groundY : GROUND_Y; }

// liseré cartoon : trace le contour du chemin courant (après un fill)
function outline(alpha = 0.18) {
  ctx.strokeStyle = "rgba(0,0,0," + alpha + ")";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawShadow(b) {
  // ombre douce (dégradé radial) qui rétrécit et pâlit quand l'animal saute
  const gy = groundOf(b);
  const air = Math.max(0, Math.min(1, (gy - b.y) / 200)); // 0 au sol → 1 en l'air
  const rx = 34 - air * 14, ry = 8 - air * 3;
  const alpha = 0.28 * (1 - air * 0.6);
  const g = ctx.createRadialGradient(b.x, gy + 6, 1, b.x, gy + 6, rx);
  g.addColorStop(0, "rgba(0,0,0," + alpha.toFixed(3) + ")");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(b.x, gy + 6, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// œil blanc dont la pupille suit la balle.
// (gx,gy) optionnel : origine commune du regard → les deux yeux pointent
// PARALLÈLEMENT (fini le strabisme quand la balle est proche entre les yeux).
// redTint (0..1) optionnel : injecte du rouge dans le blanc de l'œil (colère
// croissante du manchot), appliqué avant la pupille pour ne pas la recouvrir.
// spin (0..1) + spinDir (-1/1) optionnels : la pupille délaisse peu à peu la
// balle pour tourner sur elle-même (folie grandissante de la grenouille).
function drawTrackingEye(ex, ey, r, pr, gx, gy, redTint, spin, spinDir) {
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.fill();
  if (redTint) {
    ctx.fillStyle = "rgba(220,25,20," + Math.min(0.7, redTint * 0.6).toFixed(2) + ")";
    ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.fill();
  }
  const ox = gx !== undefined ? gx : ex, oy = gy !== undefined ? gy : ey;
  let dx = ball.x - ox, dy = ball.y - oy;
  let d = Math.hypot(dx, dy) || 1;
  dx /= d; dy /= d;
  if (spin) {
    const ang = performance.now() / 1000 * (5 + spin * 22) * (spinDir || 1);
    dx = dx * (1 - spin) + Math.cos(ang) * spin;
    dy = dy * (1 - spin) + Math.sin(ang) * spin;
    const nd = Math.hypot(dx, dy) || 1;
    dx /= nd; dy /= nd;
  }
  const amp = r - pr - 0.5;
  const px = ex + dx * amp, py = ey + dy * amp;
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fill();
  // petit reflet pour donner du relief
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(px - pr * 0.35, py - pr * 0.35, Math.max(0.6, pr * 0.35), 0, Math.PI * 2);
  ctx.fill();
}

// pattes fines animées (oiseau, lapin) — renvoie les positions des pieds
// Liseré sombre systématique sous les pattes/pieds : sans lui, des pattes
// claires (blanches sur le lapin) se fondent presque totalement dans un
// terrain clair (neige de la banquise notamment).
function drawLegs(b, dir, s, legColor, footStyle) {
  ctx.lineCap = "round";
  for (let i = 0; i < 2; i++) {
    const hipX = b.x + (i === 0 ? -9 : 9);
    const hipY = b.y - 16 + s;
    let footX, footY;
    if (!b.onGround) {
      footX = hipX - dir * 7;
      footY = b.y - 2;
    } else if (b.vx !== 0) {
      const amp = b.scramble ? 13 : 9;   // patinage : grandes foulées désordonnées
      const lift = b.scramble ? 9 : 6;
      const ph = b.walkPhase + i * Math.PI;
      footX = hipX + Math.sin(ph) * amp;
      footY = b.y - Math.max(0, Math.cos(ph)) * lift;
    } else {
      footX = hipX;
      footY = b.y;
    }
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(footX, footY); ctx.stroke();
    ctx.strokeStyle = legColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(footX, footY);
    ctx.stroke();
    if (footStyle === "toes") {
      for (const toe of [-4, 0, 4]) {
        ctx.beginPath();
        ctx.moveTo(footX, footY);
        ctx.lineTo(footX + toe + dir * 3, footY + 3);
        ctx.stroke();
      }
    } else { // grands pieds (lapin)
      ctx.fillStyle = legColor;
      ctx.beginPath();
      ctx.ellipse(footX + dir * 5, footY + 1, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.22)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
  }
}

function drawCharBody(b, paint) {
  // Même ancrage que les sprites : b.y en jeu, groundY en aperçu menu
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

function drawTrompette(b) {
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

function drawMicron(b) {
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

function drawHoun(b) {
  drawCharBody(b, (c) => {
    // jambes + tunique olive
    c.fillStyle = "#1a241c";
    c.fillRect(-11, -30, 9, 30); c.fillRect(2, -30, 9, 30);
    c.fillStyle = "#2d3a2e";
    c.beginPath(); c.moveTo(-16, -36); c.lineTo(-12, -74); c.lineTo(12, -74); c.lineTo(16, -36); c.closePath(); c.fill();
    // pin rouge
    c.fillStyle = "#c62828";
    c.beginPath(); c.arc(8, -58, 3.5, 0, Math.PI * 2); c.fill();
    // tête ronde + coupe au bol
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

function drawCharSuperFX(b) {
  if (!b.superT || b.superT <= 0) return;
  const key = animOf(b).key;
  const fade = Math.min(1, b.superT / 40); // s'estompe en fin d'effet
  // Camp adverse (là où l'effet s'applique)
  const x0 = b.side === 0 ? NET_X : 0;
  const x1 = b.side === 0 ? W : NET_X;
  const span = Math.max(1, x1 - x0);

  if (key === "vladou") {
    // Hiver : voile glacé doux + flocons flous (pas de gros blobs blancs)
    ctx.save();
    ctx.globalAlpha = 0.22 * fade;
    const wash = ctx.createLinearGradient(x0, GROUND_Y, x0, GROUND_Y - 140);
    wash.addColorStop(0, "rgba(180,220,255,0.55)");
    wash.addColorStop(0.55, "rgba(180,220,255,0.12)");
    wash.addColorStop(1, "rgba(180,220,255,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(x0, GROUND_Y - 140, span, 140);
    ctx.globalAlpha = 0.35 * fade;
    for (let i = 0; i < 10; i++) {
      const fx = x0 + ((tick * 1.6 + i * 73) % span);
      const fy = 50 + ((tick * 1.2 + i * 41) % (GROUND_Y - 100));
      const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 3.5);
      g.addColorStop(0, "rgba(240,250,255,0.7)");
      g.addColorStop(1, "rgba(200,230,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(fx, fy, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  } else if (key === "trompette") {
    // Mur : pilier doré flou (dégradés), plus de rectangle strokeRect
    const wallX = b.side === 0 ? NET_X + (W - NET_X) * 0.52 : NET_X * 0.48;
    const top = GROUND_Y - 108;
    ctx.save();
    ctx.globalAlpha = 0.55 * fade;
    const glow = ctx.createLinearGradient(wallX - 28, 0, wallX + 28, 0);
    glow.addColorStop(0, "rgba(255,210,80,0)");
    glow.addColorStop(0.45, "rgba(255,210,80,0.18)");
    glow.addColorStop(0.5, "rgba(255,230,140,0.42)");
    glow.addColorStop(0.55, "rgba(255,210,80,0.18)");
    glow.addColorStop(1, "rgba(255,210,80,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(wallX - 28, top, 56, GROUND_Y - top);
    // cœur fin, sans contour dur
    const core = ctx.createLinearGradient(wallX - 5, top, wallX + 5, top);
    core.addColorStop(0, "rgba(220,170,40,0)");
    core.addColorStop(0.5, "rgba(255,220,120,0.55)");
    core.addColorStop(1, "rgba(220,170,40,0)");
    ctx.fillStyle = core;
    ctx.fillRect(wallX - 5, top + 8, 10, GROUND_Y - top - 12);
    // base au sol, douce
    const base = ctx.createRadialGradient(wallX, GROUND_Y, 2, wallX, GROUND_Y, 36);
    base.addColorStop(0, "rgba(255,220,100,0.35)");
    base.addColorStop(1, "rgba(255,200,60,0)");
    ctx.fillStyle = base;
    ctx.beginPath(); ctx.ellipse(wallX, GROUND_Y + 2, 36, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else if (key === "houn") {
    // Batterie AA : bande au sol + points d'avertissement discrets (plus de croix)
    ctx.save();
    ctx.globalAlpha = 0.4 * fade;
    const band = ctx.createLinearGradient(x0, GROUND_Y, x0, GROUND_Y - 70);
    band.addColorStop(0, "rgba(180,40,40,0.35)");
    band.addColorStop(1, "rgba(180,40,40,0)");
    ctx.fillStyle = band;
    ctx.fillRect(x0, GROUND_Y - 70, span, 70);
    ctx.globalAlpha = 0.28 * fade;
    for (let i = 0; i < 5; i++) {
      const fx = x0 + 30 + ((tick * 0.8 + i * 89) % Math.max(1, span - 60));
      const pulse = 0.5 + 0.5 * Math.sin(tick / 14 + i);
      const g = ctx.createRadialGradient(fx, GROUND_Y - 18, 1, fx, GROUND_Y - 18, 10);
      g.addColorStop(0, "rgba(255,120,100," + (0.35 * pulse).toFixed(2) + ")");
      g.addColorStop(1, "rgba(255,80,60,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(fx, GROUND_Y - 18, 10, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

function hasSuperEffect(kind, side) {
  for (const e of superEffects) if (e.kind === kind && e.side === side && e.t > 0) return e;
  return null;
}

function tickSuperEffects() {
  for (let i = superEffects.length - 1; i >= 0; i--) {
    if (--superEffects[i].t <= 0) superEffects.splice(i, 1);
  }
}
