// sommet-volley · balle & physique (collisions, filet, murs)
"use strict";

// ---------- Balle ----------
const ball = {
  x: W * 0.25, y: 200, vx: 0, vy: 0, spin: 0, angle: 0,
  frozen: true,
  inHands: true,       // service V2 : balle dans les mains du serveur
  tossGrace: 0,        // ignore collision serveur juste après le lancer
  serveAimLock: true,  // 1ʳᵉ frappe du service : toujours vers l'adversaire
  serveFlight: false,  // après la frappe de service : filet = faute (pas de rebond sauveur)
  popped: false,       // balle crevée (plantée sur un bec)
  smash: 0,            // ticks restants de l'effet "smash destructeur" (visuel)
  slowMo: 0,           // ralenti caméra — uniquement Smash Battle au filet
  lastTouchSide: -1,
  lastTouchTick: -999, // tick du dernier contact (anti double-comptage)
  touches: [0, 0], // touches consécutives par équipe
  trail: [],
  // Gameplay V2
  heldBy: -1,
  holdT: 0,
  chargeT: 0,
  aimAngle: 0,
  shotArmed: false,
  reset(side) {
    this.x = side === 0 ? W * 0.25 : W * 0.75;
    this.y = GROUND_Y - 150;
    this.vx = 0; this.vy = 0;
    this.angle = 0; this.spin = 0;
    this.frozen = true;
    this.inHands = true;
    this.tossGrace = 0;
    this.serveAimLock = true;
    this.serveFlight = false;
    this.popped = false;
    this.smash = 0;
    this.slowMo = 0;
    this.lastTouchSide = -1;
    this.lastTouchTick = -999;
    this.touches = [0, 0];
    this.trail = [];
    this.heldBy = -1;
    this.holdT = 0;
    this.chargeT = 0;
    this.shotArmed = false;
    this.aimAngle = side === 0 ? -0.45 : Math.PI + 0.45;
  }
};

// ---------- Gameplay V2 : helpers ----------
function clearBallHold() {
  ball.heldBy = -1;
  ball.holdT = 0;
  ball.chargeT = 0;
  ball.shotArmed = false;
}

function registerTouch(blob) {
  const newContact = ball.lastTouchSide !== blob.side ||
                     tick - ball.lastTouchTick > TOUCH_COOLDOWN;
  if (newContact) {
    if (ball.lastTouchSide !== blob.side) ball.touches[blob.side] = 1;
    else ball.touches[blob.side]++;
  }
  ball.lastTouchSide = blob.side;
  ball.lastTouchTick = tick;
  if (ball.touches[blob.side] > MAX_TOUCHES) {
    awardPoint(1 - blob.side, `Plus de ${MAX_TOUCHES} touches !`);
  }
}

function clampAimToCone(blob, ang, center) {
  const half = AIM_CONE / 2;
  const norm = a => {
    while (a < -Math.PI) a += Math.PI * 2;
    while (a > Math.PI) a -= Math.PI * 2;
    return a;
  };
  const delta = Math.max(-half, Math.min(half, norm(ang - center)));
  return center + delta;
}

/** Visée « digitale » (clavier / tactile / croix sans stick) : pas d'analogique. */
function isKeyboardStyleAim(input) {
  if (!input) return true;
  const ax = Number(input.ax) || 0;
  const ay = Number(input.ay) || 0;
  if (Math.hypot(ax, ay) >= 0.18) return false;
  // Croix haut/bas = intention de viser (manette) → pas d'assist clavier
  if (input.up || input.down) return false;
  return true;
}

/**
 * Visée clavier : angle selon la position du joueur par rapport à la balle.
 * (Manette : stick inchangé via stickAimRaw.)
 * relX > 0 = balle plus vers le filet que le joueur ; relY > 0 = balle plus bas que la tête.
 */
function keyboardGeomAimAngle(blob, mode) {
  const h = blob.headCircle;
  const fwd = blob.side === 0 ? 1 : -1;
  const center = mode === "lob"
    ? (blob.side === 0 ? -0.92 : Math.PI + 0.92)
    : (blob.side === 0 ? -0.45 : Math.PI + 0.45);

  const relX = (ball.x - blob.x) * fwd;
  const relY = ball.y - h.y;

  if (mode === "lob") {
    // Réception clavier : passe haute avec léger biais avant (vers le filet)
    // pour préparer un smash — plus quasi-verticale pure (retombait pile sur la tête).
    const fwdNudge = fwd * 0.26;
    return Math.atan2(-1, fwdNudge);
  }
  // Smash : près du filet + balle haute → piqué ; en fond / balle trop basse
  // → trajectoire plus montante pour passer le filet (évite le « dans le filet »
  // des persos rapides type Yogi qui smashent souvent sous le bandeau).
  const deep = Math.max(0, Math.min(1, (Math.abs(NET_X - blob.x) - 120) / 200));
  const belowNet = Math.max(0, Math.min(1, (ball.y - (NET_TOP - 24)) / 90));
  const deepEff = Math.max(deep, belowNet * 0.9);
  const centerSmash = blob.side === 0
    ? 0.22 - 1.05 * deepEff
    : Math.PI - (0.22 - 1.05 * deepEff);
  const spike = Math.max(-0.22, Math.min(0.95, -relY * 0.014));
  const down = 0.10 + spike * (1 - 0.9 * deepEff) - 1.05 * deepEff
    + Math.max(0, Math.min(0.28, relX * 0.009));
  const push = 0.65 + 0.28 * deepEff + Math.max(-0.2, Math.min(0.52, relX * 0.017));
  return clampAimToCone(blob, Math.atan2(down, fwd * push), centerSmash);
}

function stickAimRaw(blob, input, center) {
  let dx = 0, dy = 0;
  if (input) {
    dx = Number(input.ax);
    dy = Number(input.ay);
    if (!Number.isFinite(dx)) dx = 0;
    if (!Number.isFinite(dy)) dy = 0;
    // Stick prioritaire ; sinon croix / touches
    if (Math.hypot(dx, dy) < 0.18) {
      dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    }
  }
  if (Math.hypot(dx, dy) < 0.12) return center;
  return Math.atan2(dy, dx);
}

function aimAngleFromInput(blob, input) {
  // Smash / tir tendu : cône vers l'adversaire.
  const center = blob.side === 0 ? -0.45 : Math.PI + 0.45;
  if (isKeyboardStyleAim(input)) return keyboardGeomAimAngle(blob, "smash");
  return clampAimToCone(blob, stickAimRaw(blob, input, center), center);
}

function isServeHit(blob) {
  return !!(GAMEPLAY_V2 && ball.serveAimLock && blob.side === servingSide);
}

function aimLobAngleFromInput(blob, input) {
  // Service : cloche forcée vers l'adversaire (pas de multi-touche dans son camp).
  // Clavier : géométrie joueur/balle. Manette : stick dans le cône.
  const center = blob.side === 0 ? -0.92 : Math.PI + 0.92;
  if (isServeHit(blob)) return center;
  if (isKeyboardStyleAim(input)) return keyboardGeomAimAngle(blob, "lob");
  return clampAimToCone(blob, stickAimRaw(blob, input, center), center);
}

/** Simu rapide : passe au-dessus du bord du filet (face collision), avec marge. */
function serveArcClearsNet(x0, y0, vx, vy, dir) {
  // Même plan que resolveNetBall (leftC / rightC), pas le centre NET_X
  const faceX = dir > 0
    ? NET_X - NET_W / 2 - BALL_R
    : NET_X + NET_W / 2 + BALL_R;
  const needY = NET_TOP - BALL_R - 10;
  let x = x0, y = y0, vyy = vy;
  const lift = (typeof ballLift === "function") ? ballLift() : 1;
  for (let i = 0; i < 140; i++) {
    const ox = x, oy = y;
    vyy += GRAV_BALL * lift;
    x += vx;
    y += vyy;
    const crossed = dir > 0 ? (ox < faceX && x >= faceX) : (ox > faceX && x <= faceX);
    if (crossed) {
      const t = Math.abs(x - ox) < 1e-6 ? 1 : (faceX - ox) / (x - ox);
      const yFace = oy + (y - oy) * t;
      return yFace <= needY;
    }
    if (y + BALL_R >= GROUND_Y) return false;
  }
  return false;
}

/**
 * Service : impose une trajectoire qui passe vraiment le filet (tous persos /
 * toutes positions). Appeler APRÈS applyDirectedHit (serveAimLock déjà levé).
 * Service aérien (balle déjà haute) : garde la portée / smash, sans cloche
 * courte forcée.
 */
function forceServeClearsNet(blob) {
  const dir = blob.side === 0 ? 1 : -1;
  const faceX = dir > 0
    ? NET_X - NET_W / 2 - BALL_R
    : NET_X + NET_W / 2 + BALL_R;
  // Évite de partir déjà collé à la face du filet (après reposition frappe)
  if (dir > 0 && ball.x > faceX - 28) ball.x = faceX - 28;
  if (dir < 0 && ball.x < faceX + 28) ball.x = faceX + 28;

  const dist = Math.abs(faceX - ball.x);
  // Vrai smash de service seulement si contact assez haut ; sinon cloche sûre
  const aerial = !blob.onGround && ball.y <= NET_TOP + 40;

  if (aerial) {
    // Smash de service : garder la vitesse, aplatir si trop vertical
    if (ball.y > NET_TOP - 40) ball.y = NET_TOP - 40;
    let ang = Math.atan2(ball.vy, ball.vx);
    if (Math.cos(ang) * dir < 0.25) ang = dir > 0 ? -0.55 : Math.PI + 0.55;
    const tooSteep = Math.abs(Math.sin(ang)) > 0.88;
    if (tooSteep) ang = dir > 0 ? -0.62 : Math.PI + 0.62;
    let spd = Math.max(HOLD_LOB_SPD * 1.1, Math.hypot(ball.vx, ball.vy));
    spd = Math.min(MAX_BALL_SPEED, spd);
    for (let n = 0; n < 18; n++) {
      ball.vx = Math.cos(ang) * spd;
      ball.vy = Math.sin(ang) * spd;
      ball.aimAngle = ang;
      if (serveArcClearsNet(ball.x, ball.y, ball.vx, ball.vy, dir)) break;
      if (dir > 0) ang = Math.max(ang - 0.05, -1.15);
      else ang = Math.min(ang + 0.05, Math.PI + 1.15);
      spd = Math.min(MAX_BALL_SPEED, spd * 1.03);
    }
    clampBallSpeed();
    return;
  }

  if (ball.y > NET_TOP - 40) ball.y = NET_TOP - 40;

  // Sol : cloche sûre (près du filet → plus verticale)
  let steep = dist < 100 ? 1.35 : dist < 180 ? 1.2 : dist < 260 ? 1.05 : 0.98;
  let spd = Math.max(HOLD_LOB_SPD, Math.hypot(ball.vx, ball.vy));
  const serveCap = HOLD_LOB_SPD * 1.18;
  for (let n = 0; n < 24; n++) {
    const ang = dir > 0 ? -steep : Math.PI + steep;
    ball.vx = Math.cos(ang) * spd;
    ball.vy = Math.sin(ang) * spd;
    ball.aimAngle = ang;
    if (serveArcClearsNet(ball.x, ball.y, ball.vx, ball.vy, dir)) break;
    if (steep < 1.45) steep += 0.04;
    else spd = Math.min(serveCap, spd * 1.04);
    if (spd >= serveCap && steep >= 1.45) break;
  }
  const ang = dir > 0 ? -steep : Math.PI + steep;
  ball.vx = Math.cos(ang) * Math.min(spd, serveCap);
  ball.vy = Math.sin(ang) * Math.min(spd, serveCap);
}

/** Échange : pour une cloche déjà haute (avec léger biais avant), laisser vivre. */
function ensureLobClearsNet(blob) {
  const dir = blob.side === 0 ? 1 : -1;
  let ang = Math.atan2(ball.vy, ball.vx);
  const spd0 = Math.hypot(ball.vx, ball.vy);
  // Passe haute clavier (verticale + léger avant) : ne pas recentrer
  if (spd0 > 0.5 && Math.abs(ball.vx) < Math.abs(ball.vy) * 0.45 && ball.vy < 0) {
    clampBallSpeed();
    return;
  }
  if (Math.cos(ang) * dir < 0) {
    ang = Math.atan2(-1, dir * 0.26);
  }
  let spd = spd0;
  if (spd < HOLD_LOB_SPD * 0.9) spd = HOLD_LOB_SPD;
  ball.vx = Math.cos(ang) * spd;
  ball.vy = Math.sin(ang) * spd;
  ball.aimAngle = ang;
  clampBallSpeed();
}

/**
 * Smash d'échange sous / au niveau du bandeau : remonte l'angle pour passer
 * le filet (sinon plat → faute). Au-dessus du filet : smash libre (piqué OK).
 */
function ensureSmashClearsNet(blob) {
  const dir = blob.side === 0 ? 1 : -1;
  // Déjà au-dessus du bandeau → piqué / angle libre
  if (ball.y <= NET_TOP - 8) {
    clampBallSpeed();
    return;
  }
  if (serveArcClearsNet(ball.x, ball.y, ball.vx, ball.vy, dir)) {
    clampBallSpeed();
    return;
  }
  let ang = Math.atan2(ball.vy, ball.vx);
  if (Math.cos(ang) * dir < 0.2) ang = dir > 0 ? -0.7 : Math.PI + 0.7;
  let spd = Math.max(HOLD_LOB_SPD * 0.92, Math.hypot(ball.vx, ball.vy));
  for (let n = 0; n < 22; n++) {
    ball.vx = Math.cos(ang) * spd;
    ball.vy = Math.sin(ang) * spd;
    ball.aimAngle = ang;
    if (serveArcClearsNet(ball.x, ball.y, ball.vx, ball.vy, dir)) break;
    if (dir > 0) ang = Math.max(ang - 0.055, -1.28);
    else ang = Math.min(ang + 0.055, Math.PI + 1.28);
    spd = Math.min(MAX_BALL_SPEED, spd * 1.025);
  }
  clampBallSpeed();
}

function applyDirectedHit(blob, ang, speed, smashTicks) {
  ball.aimAngle = ang;
  ball.vx = Math.cos(ang) * speed;
  ball.vy = Math.sin(ang) * speed;
  ball.spin = ball.vx * 0.02;
  ball.frozen = false;
  ball.smash = smashTicks || 0;
  clearBallHold();
  // Garde le point de contact (pas de téléport « collé aux mains ») :
  // on ne sépare que si la balle chevauche encore la hitbox.
  const h = blob.headCircle;
  const dx = ball.x - h.x, dy = ball.y - h.y;
  const dist = Math.hypot(dx, dy);
  const minSep = BALL_R + h.r + 1;
  if (dist > 0.001 && dist < minSep) {
    ball.x = h.x + (dx / dist) * minSep;
    ball.y = h.y + (dy / dist) * minSep;
  } else if (dist <= 0.001) {
    ball.x = h.x + Math.cos(ang) * minSep;
    ball.y = h.y + Math.sin(ang) * minSep;
  }
  clampBallSpeed();
  registerTouch(blob);
  if (blob.side === servingSide && ball.serveAimLock) {
    ball.serveAimLock = false;
    ball.serveFlight = true; // jusqu'à passer le filet sans le toucher
  }
}

// Simulation d'arc pour préviz (rendu local) et tests.
// Retourne des points {x,y} jusqu'au sol / maxSteps.
function simulateArc(x0, y0, vx0, vy0, maxSteps) {
  maxSteps = maxSteps || 90;
  const pts = [{ x: x0, y: y0 }];
  let x = x0, y = y0, vx = vx0, vy = vy0;
  const lift = (typeof ballLift === "function") ? ballLift() : 1;
  for (let i = 0; i < maxSteps; i++) {
    const ox = x, oy = y;
    vy += GRAV_BALL * lift;
    x += vx; y += vy;
    const r = resolveNetBall(ox, oy, x, y, vx, vy);
    x = r.x; y = r.y; vx = r.vx; vy = r.vy;
    if (x - BALL_R < 0) { x = BALL_R; vx = Math.abs(vx) * 0.9; }
    if (x + BALL_R > W) { x = W - BALL_R; vx = -Math.abs(vx) * 0.9; }
    pts.push({ x, y });
    if (y + BALL_R >= GROUND_Y) break;
  }
  return pts;
}

function ballDistToBlob(blob) {
  const h = blob.headCircle;
  return Math.hypot(ball.x - h.x, ball.y - h.y);
}

/** Distance mini balle↔tête sur le segment du tick (anti-tunneling). */
function ballPathDistToBlob(blob) {
  const h = blob.headCircle;
  const x0 = ball.x - ball.vx, y0 = ball.y - ball.vy;
  const x1 = ball.x, y1 = ball.y;
  const d0 = Math.hypot(x0 - h.x, y0 - h.y);
  const d1 = Math.hypot(x1 - h.x, y1 - h.y);
  const sx = x1 - x0, sy = y1 - y0;
  const len2 = sx * sx + sy * sy;
  if (len2 < 1e-6) return d1;
  let t = ((h.x - x0) * sx + (h.y - y0) * sy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x0 + sx * t - h.x, y0 + sy * t - h.y);
}

/** Balle qui retombe vraiment SUR le joueur au sol (jamais en l'air → smash auto clavier). */
function ballLandsOnPlayer(blob) {
  if (!blob.onGround) return false; // en saut : pas d'auto, il faut X
  if (ball.vy < 0.6) return false; // doit descendre
  if (Math.abs(ball.x - blob.x) > AUTO_LOB_DX) return false;
  const headY = blob.y - 64;
  // Sur la tête / épaules — pas loin au-dessus ni sous le ventre
  if (ball.y < headY - 28 || ball.y > blob.y - 26) return false;
  return ballPathDistToBlob(blob) <= AUTO_LOB_R;
}

function serverBlob() {
  for (const b of activeBlobs) if (b.side === servingSide) return b;
  return servingSide === 0 ? blobL : blobR;
}

function serveHandsPos(blob) {
  // Ancré sur la pose receive (manifest.serveHands), côté vers lequel le
  // sprite regarde — si le serveur se retourne, la balle suit les mains.
  const faceRight = (typeof charFaceRight === "function")
    ? !!charFaceRight(blob)
    : (blob.side === 0);
  const face = faceRight ? 1 : -1;
  let dx = 28, dy = -48;
  if (typeof charOf === "function" && typeof charPack === "function") {
    const pack = charPack(charOf(blob).key);
    const sh = pack && pack.manifest && pack.manifest.serveHands;
    if (sh) {
      if (sh.dx != null) dx = +sh.dx;
      if (sh.dy != null) dy = +sh.dy;
    }
  }
  return { x: blob.x + face * dx, y: blob.y + dy };
}

function attachBallToServerHands() {
  const s = serverBlob();
  if (!s) return;
  const p = serveHandsPos(s);
  ball.x = p.x; ball.y = p.y;
  ball.vx = 0; ball.vy = 0;
}

function tossServeBall(blob) {
  // Lancer vertical depuis les mains — vraiment vers le haut, puis frappe libre.
  const p = serveHandsPos(blob);
  ball.x = p.x;
  ball.y = p.y - 8;
  ball.vx = 0;
  ball.vy = -SERVE_TOSS_SPD;
  ball.spin = 0;
  ball.frozen = false;
  ball.inHands = false;
  ball.tossGrace = SERVE_TOSS_GRACE;
  ball.smash = 0;
  clearBallHold();
  // Manette/clavier : exiger de relâcher X/F avant de pouvoir servir
  // (sinon le maintien du lancer frappe tout seul à la retombée).
  blob._serveAwaitRelease = true;
  // Le lancer ne compte PAS comme une touche
  beep(520, 0.08, "sine", 0.1, 0, 780);
  return true;
}

function tryTossServe(blob) {
  // Lancer au service : uniquement smash (X) — le saut ne doit pas envoyer la balle
  if (!GAMEPLAY_V2 || !ball.inHands || !ball.frozen || ball.popped) return false;
  if (blob.side !== servingSide) return false;
  if (!blob._smashEdge) return false;
  return tossServeBall(blob);
}

/** CLAVIER uniquement : le SAUT sert directement (cloche par-dessus le filet)
 *  en un seul appui. La manette garde le service en 2 temps (X lancer + X frapper). */
function keyboardJumpServe(blob) {
  const p = serveHandsPos(blob);
  ball.x = p.x;
  ball.y = p.y - 18;
  ball.spin = 0;
  ball.smash = 0;
  ball.frozen = false;
  ball.inHands = false;
  ball.tossGrace = 0;
  clearBallHold();
  const dir = blob.side === 0 ? 1 : -1;
  const ang = dir > 0 ? -1.12 : Math.PI + 1.12;   // cloche haute vers l'adversaire
  ball.vx = Math.cos(ang) * HOLD_LOB_SPD;
  ball.vy = Math.sin(ang) * HOLD_LOB_SPD;
  forceServeClearsNet(blob);                        // garantit le passage du filet
  ball.lastTouchSide = blob.side;
  markActiveHit(blob);
  blob._serveAwaitRelease = false;
  if (typeof setCharPose === "function") setCharPose(blob, "aim", 30);
  beep(520, 0.08, "sine", 0.1, 0, 820);
  return true;
}

function canActiveHit(blob) {
  return tick - (blob.lastActiveHitTick || -999) >= ACTIVE_HIT_COOLDOWN;
}

function markActiveHit(blob) {
  blob.lastActiveHitTick = tick;
}

function wantSmash(blob) {
  return !!(blob._smashEdge || (blob._input && blob._input.smash));
}

/** Contact simple = cloche automatique vers l'adversaire. */
function tryLobBall(blob) {
  if (ball.inHands && ball.frozen) return false;
  if (ball.tossGrace > 0 && blob.side === servingSide) return false;
  if (ballPathDistToBlob(blob) > RECEIVE_R) return false;
  if (!canActiveHit(blob)) return false;
  const a = charOf(blob);
  const serving = isServeHit(blob);
  const ang = aimLobAngleFromInput(blob, blob._input);
  const spd = HOLD_LOB_SPD * (0.95 + a.control * 0.12);
  applyDirectedHit(blob, ang, spd, 0);
  if (serving) forceServeClearsNet(blob);
  else ensureLobClearsNet(blob);
  markActiveHit(blob);
  // Pose réception un peu tenue pour qu'on la lise (~0.7 s)
  if (typeof setCharPose === "function") setCharPose(blob, "receive", 42);
  return true;
}

function trySmashBall(blob) {
  // Pas de smash tant que la balle est dans les mains (il faut d'abord lancer)
  if (ball.inHands && ball.frozen) return false;
  if (ball.tossGrace > 0 && blob.side === servingSide) return false;
  if (blob.onGround) return false;
  // Passage en Force (Cygne / micron) : frappes immunisées au smash adverse
  if (ball.lastTouchSide !== blob.side && ball.lastTouchSide >= 0) {
    for (const o of activeBlobs) {
      if (o.side === ball.lastTouchSide && o.superKind === "micron" && o.superT > 0) return false;
    }
  }
  // Balle au-dessus de la taille (plus tolérant que « au-dessus des épaules »)
  if (ball.y > blob.y - 36) return false;
  if (ballPathDistToBlob(blob) > RECEIVE_R) return false;
  if (!canActiveHit(blob)) return false;
  const serving = isServeHit(blob);
  // Service aérien « smash » seulement si la balle est assez haute ;
  // un petit hop au sol garde la cloche sûre (évite filet).
  const aerialServe = serving && !blob.onGround && ball.y <= NET_TOP + 40;
  const ang = aerialServe
    ? aimAngleFromInput(blob, blob._input)
    : serving
      ? aimLobAngleFromInput(blob, blob._input)
      : aimAngleFromInput(blob, blob._input);
  const pow = blob.kitPower != null ? blob.kitPower : charOf(blob).power;
  const spd = (serving && !aerialServe)
    ? HOLD_LOB_SPD * 1.05
    : HIT_SPEED * pow * SMASH_MUL;
  applyDirectedHit(blob, ang, spd, 0); // smashTicks=0 → pas de slowMo / zoom
  if (serving) forceServeClearsNet(blob);
  else ensureSmashClearsNet(blob);
  markActiveHit(blob);
  shake = Math.max(shake, 4);
  if (typeof setCharPose === "function") setCharPose(blob, "smash", 28);
  return true;
}

// ---------- Filet (partagé simu + vue invité) ----------
// Même collision sur tous les terrains (NET_W). Pour passer, tout le ballon
// doit être au-dessus du sommet (clearY = NET_TOP - BALL_R).
// Résout prev→curr contre le filet. Pure (pas de sons). Utilisée par updateBall
// ET par la prédiction visuelle de l'invité (sinon dead-reckoning traverse le
// poteau puis le snap ramène = « balle coincée à chaque échange » en ligne).
function resolveNetBall(prevX, prevY, x, y, vx, vy) {
  const nl = NET_X - NET_W / 2, nr = NET_X + NET_W / 2;
  const leftC = nl - BALL_R, rightC = nr + BALL_R;
  const TOP_SLACK = 5;
  const clearY = NET_TOP - BALL_R;
  let hit = false;
  const yAlong = (atX) => {
    if (Math.abs(x - prevX) < 1e-6) return y;
    return prevY + ((atX - prevX) / (x - prevX)) * (y - prevY);
  };
  let clearsOver = false;
  if ((prevX - NET_X) * (x - NET_X) < 0 && Math.abs(vx) > 1e-6) {
    clearsOver = yAlong(NET_X) <= clearY;
  }
  if (clearsOver) return { x, y, vx, vy, hit: false };

  const tryFace = (dir) => {
    const face = dir > 0 ? leftC : rightC;
    const crossing = dir > 0
      ? (vx > 0 && prevX <= face && x > face)
      : (vx < 0 && prevX >= face && x < face);
    if (!crossing) return false;
    const yHit = yAlong(face);
    // Entièrement au-dessus du sommet : pas de face latérale
    if (yHit <= clearY) return false;
    // Frôle le bord supérieur du filet → petit rebond vers le haut.
    if (yHit <= clearY + TOP_SLACK) {
      if (y > clearY) y = clearY;
      if (vy > -1.5) vy = -Math.max(2.5, Math.abs(vy) * 0.5 + 1.2);
      hit = true;
      return true;
    }
    x = face;
    vx = (dir > 0 ? -1 : 1) * Math.abs(vx) * 0.8;
    hit = true;
    return true;
  };
  if (!tryFace(+1)) tryFace(-1);

  if (x > leftC && x < rightC && y > clearY + TOP_SLACK) {
    if (x < NET_X) { x = leftC; vx = -Math.max(2.5, Math.abs(vx) * 0.85); }
    else { x = rightC; vx = Math.max(2.5, Math.abs(vx) * 0.85); }
    hit = true;
  } else if (x > leftC && x < rightC && y > clearY && y <= clearY + TOP_SLACK) {
    y = clearY;
    if (vy > -1.5) vy = -2.5;
    hit = true;
  }
  return { x, y, vx, vy, hit };
}

// Dead-reckoning balle avec filet/gravité (vue invité uniquement).
function predictBallMotion(bx, by, bvx, bvy, dt) {
  let x = bx, y = by, vx = bvx, vy = bvy;
  let rem = Math.max(0, Math.min(dt, EXTRAP_MAX || 8));
  const lift = (typeof ballLift === "function") ? ballLift() : 1;
  while (rem > 1e-6) {
    const step = Math.min(1, rem);
    const ox = x, oy = y;
    vy += GRAV_BALL * lift * step;
    x += vx * step;
    y += vy * step;
    const r = resolveNetBall(ox, oy, x, y, vx, vy);
    x = r.x; y = r.y; vx = r.vx; vy = r.vy;
    if (x - BALL_R < 0) { x = BALL_R; vx = Math.abs(vx) * 0.9; }
    if (x + BALL_R > W) { x = W - BALL_R; vx = -Math.abs(vx) * 0.9; }
    rem -= step;
  }
  return { x, y, vx, vy };
}

// ---------- Physique balle ----------
function clampBallSpeed() {
  const sp = Math.hypot(ball.vx, ball.vy);
  if (sp > MAX_BALL_SPEED) {
    ball.vx = ball.vx / sp * MAX_BALL_SPEED;
    ball.vy = ball.vy / sp * MAX_BALL_SPEED;
  }
}

function collideCircle(c, blob, isHead) {
  const dx = ball.x - c.x, dy = ball.y - c.y;
  const dist = Math.hypot(dx, dy);
  const minDist = BALL_R + c.r;
  if (dist >= minDist || dist === 0) return false;

  const a = charOf(blob);
  const nx = dx / dist, ny = dy / dist;
  // repousser la balle hors du cercle
  ball.x = c.x + nx * minDist;
  ball.y = c.y + ny * minDist;
  // vitesse de frappe : direction normale * puissance (échelle douce) + mouvement
  const hs = HIT_SPEED * (0.7 + a.power * 0.25);
  ball.vx = nx * hs + blob.vx * 0.55;
  ball.vy = ny * hs + blob.vy * 0.35 - 2.0;

  // défaut de contrôle de base : légère déviation aléatoire (seedée).
  const baseSpread = (1 - a.control) * 0.6;
  if (baseSpread > 0.001) {
    const ang = Math.atan2(ball.vy, ball.vx) + (rng() - 0.5) * baseSpread;
    const mag = Math.hypot(ball.vx, ball.vy);
    ball.vx = Math.cos(ang) * mag;
    ball.vy = Math.sin(ang) * mag;
  }

  clampBallSpeed();
  return true;
}

function applyHitExtras(blob, a) {
  let heavy = false;
  if (blob.superSmash && blob.superT > 0) {
    const dir = blob.side === 0 ? 1 : -1;
    ball.vx = dir * SMASH_VX;
    ball.vy = 2.5;
    ball.smash = 60; ball.spin = dir * 0.3;
    clampBallSpeed();
    blob.superSmash = false; blob.superT = 0; blob.superKind = "";
    shake = 13;
    spawnBoom(ball.x, ball.y);
    heavy = true;
  }
  heavy = heavy || Math.hypot(ball.vx, ball.vy) > 10.5 ||
    (blob.poseAnim === "smash" && blob.poseT > 0);
  if (heavy) sfxBallSmash();
  else sfxBallHit();
  charHitSound(a, heavy);
  if (Math.hypot(ball.vx, ball.vy) > 11.5) shake = Math.min(shake + 4, 9);
}

function ballBlobCollision(blob) {
  if (ball.heldBy >= 0) return; // balle contrôlée : pas de collision passive
  if (blob.battleStunT > 0) return; // perdant du Smash Battle : ne digue pas
  const a = charOf(blob);

  // Gameplay V2 :
  // - Manette : X/Y près de la balle → smash (air) sinon cloche
  // - Clavier : contact AUTO en échange — sol = cloche, air = smash
  // - Service (après lancer) : toujours un appui explicite (pas d'auto)
  if (GAMEPLAY_V2) {
    if (ball.inHands && ball.frozen) {
      if (tryTossServe(blob)) return; // F = lancer la balle
      return; // collée aux mains : saut OK (Espace), pas de frappe sans lancer
    }
    // Grace post-lancer : pas de cloche accidentelle sur le serveur
    if (ball.tossGrace > 0 && blob.side === servingSide) return;

    const aiBlob = !online && vsAI && blob !== blobL;
    const kbHuman = !aiBlob && isKeyboardStyleAim(blob._input);
    const servingNow = isServeHit(blob);

    // Service : après le lancer (F), on saute (Espace) DANS la balle → smash auto
    // au contact (clavier). La manette garde la frappe explicite (X).
    if (servingNow) {
      if (blob._serveAwaitRelease) {
        if (!(blob._input && blob._input.smash)) blob._serveAwaitRelease = false;
        else return; // encore le maintien du lancer
      }
      // CLAVIER : sauter (Espace) DANS la balle → smash AUTO au contact en l'air.
      // (Au sol, pas d'auto : il faut sauter ou appuyer F.)
      if (kbHuman && !blob.onGround) {
        const d = ballPathDistToBlob(blob);
        const aligned = Math.abs(ball.x - blob.x) < 44;
        if (d <= 40 && aligned) {
          if (trySmashBall(blob)) { applyHitExtras(blob, a); return; }
          if (tryLobBall(blob)) { applyHitExtras(blob, a); return; }
        }
      }
      // Frappe explicite (manette X, ou F re-appuyé)
      if (wantSmash(blob)) {
        const near = ballPathDistToBlob(blob) <= RECEIVE_R;
        if (near && trySmashBall(blob)) { applyHitExtras(blob, a); return; }
        if (near && tryLobBall(blob)) applyHitExtras(blob, a);
      }
      return;
    }

    // Manette (ou appui S clavier) : frappe explicite
    if (wantSmash(blob)) {
      const near = ballPathDistToBlob(blob) <= RECEIVE_R;
      if (near && trySmashBall(blob)) { applyHitExtras(blob, a); return; }
      if (near && tryLobBall(blob)) applyHitExtras(blob, a);
      return;
    }

    // Clavier humain : smash auto en l'air au contact (échange seulement)
    if (kbHuman && !blob.onGround) {
      const d = ballPathDistToBlob(blob);
      const aligned = Math.abs(ball.x - blob.x) < 40;
      if (d <= 34 && aligned && trySmashBall(blob)) { applyHitExtras(blob, a); return; }
    }

    // Clavier humain : cloche auto au sol (échange seulement)
    if (kbHuman && blob.onGround && ballLandsOnPlayer(blob) && tryLobBall(blob)) {
      applyHitExtras(blob, a);
      return;
    }

    if (ballLandsOnPlayer(blob) && tryLobBall(blob)) applyHitExtras(blob, a);
    return;
  }

  // --- V1 : bounce géométrique passif ---
  const hit = collideCircle(blob.headCircle, blob, true) ||
              collideCircle(blob.bodyCircle, blob, false);
  if (hit) {
    ball.spin = ball.vx * 0.02;
    if (ball.frozen) ball.frozen = false;
    ball.smash = 0;
    registerTouch(blob);
    applyHitExtras(blob, a);
  }
}

function updateBall() {
  // Invité : point différé déjà armé — on fige la balle jusqu'à validation hôte.
  if (ballScoreLock) return;
  if (ball.frozen) {
    if (GAMEPLAY_V2 && ball.inHands) {
      attachBallToServerHands();
      for (const b of activeBlobs) ballBlobCollision(b); // lance via Réception
      return;
    }
    ball.y += Math.sin(tick / 18) * 0.3;
    for (const b of activeBlobs) ballBlobCollision(b);
    return;
  }
  if (ball.smash > 0) ball.smash--;
  if (ball.slowMo > 0) ball.slowMo--;
  if (ball.tossGrace > 0) ball.tossGrace--;
  ball.vy += GRAV_BALL * ballLift();
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.angle += ball.vx * 0.03 + ball.spin;

  ball.trail.push({ x: ball.x, y: ball.y });
  if (ball.trail.length > 8) ball.trail.shift();

  if (ball.x - BALL_R < 0)   { ball.x = BALL_R;     ball.vx = Math.abs(ball.vx) * 0.9;  sfxBallWall(); }
  if (ball.x + BALL_R > W)   { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx) * 0.9; sfxBallWall(); }

  const nr0 = resolveNetBall(ball.x - ball.vx, ball.y - ball.vy, ball.x, ball.y, ball.vx, ball.vy);
  // Service : tout contact filet = faute (plus de « frôle → rebond → ça passe »)
  if (ball.serveFlight && nr0.hit) {
    ball.x = nr0.x; ball.y = nr0.y; ball.vx = 0; ball.vy = 0;
    ball.serveFlight = false;
    if (!noFx) sfxBallNet();
    awardPoint(1 - servingSide, "Filet au service !");
    return;
  }
  if (nr0.hit && !noFx) sfxBallNet();
  ball.x = nr0.x; ball.y = nr0.y; ball.vx = nr0.vx; ball.vy = nr0.vy;
  if (ball.serveFlight) {
    const crossed = servingSide === 0 ? ball.x > NET_X : ball.x < NET_X;
    if (crossed) ball.serveFlight = false;
  }

  const sideNow = ball.x < NET_X ? 0 : 1;
  if (ball.lastTouchSide !== -1 && sideNow !== ball.lastTouchSide) {
    ball.touches[sideNow] = 0;
  }

  if (ball.y + BALL_R >= GROUND_Y) {
    if (bombMode) {
      bombBlast(ball.x, GROUND_Y);
      awardPoint(ball.x < NET_X ? 1 : 0, "💥 BOUM !");
    } else {
      if (ball.smash > 0) { spawnBoom(ball.x, GROUND_Y); shake = 12; }
      awardPoint(ball.x < NET_X ? 1 : 0, ball.smash > 0 ? "SMASH !" : "");
    }
  }

  for (const b of activeBlobs) ballBlobCollision(b);
}

