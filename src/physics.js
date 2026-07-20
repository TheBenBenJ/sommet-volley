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
 * Angle de base clavier : cloche/smash sûrs vers le camp adverse
 * (le stick analogique n'est pas disponible → on évite les bords du cône).
 */
function keyboardAutoAimRaw(blob, mode) {
  const fwd = blob.side === 0 ? 1 : -1;
  if (mode === "lob") {
    // Cloche haute avec un peu d'avance — passe le filet facilement
    return Math.atan2(-0.88, fwd * 0.42);
  }
  // Smash : un peu plus tendu, toujours vers l'avant
  return Math.atan2(-0.38, fwd * 0.82);
}

/** ← / → = léger réglage autour de l'auto-aim (pas les extrémités du cône). */
function keyboardAimAngle(blob, input, center, mode) {
  let ang = keyboardAutoAimRaw(blob, mode);
  const left = !!(input && input.left);
  const right = !!(input && input.right);
  if (left !== right) {
    // P1 : ← = plus lobé, → = plus tendu ; P2 miroir
    const loft = blob.side === 0
      ? (left ? -0.34 : 0.30)
      : (right ? -0.34 : 0.30);
    ang += loft;
  }
  return clampAimToCone(blob, ang, center);
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
  // Smash / tir tendu : cône vers l'adversaire, stick = direction.
  const center = blob.side === 0 ? -0.45 : Math.PI + 0.45;
  if (isKeyboardStyleAim(input)) return keyboardAimAngle(blob, input, center, "smash");
  return clampAimToCone(blob, stickAimRaw(blob, input, center), center);
}

function isServeHit(blob) {
  return !!(GAMEPLAY_V2 && ball.serveAimLock && blob.side === servingSide);
}

function aimLobAngleFromInput(blob, input) {
  // Service : cloche forcée vers l'adversaire (pas de multi-touche dans son camp).
  // Échange : l'angle du stick est respecté dans le cône.
  const center = blob.side === 0 ? -0.92 : Math.PI + 0.92;
  if (isServeHit(blob)) return center;
  if (isKeyboardStyleAim(input)) return keyboardAimAngle(blob, input, center, "lob");
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
 * Service : impose une cloche qui passe vraiment le filet (tous persos / toutes
 * positions). Appeler APRÈS applyDirectedHit (serveAimLock déjà levé).
 */
function forceServeClearsNet(blob) {
  const dir = blob.side === 0 ? 1 : -1;
  const faceX = dir > 0
    ? NET_X - NET_W / 2 - BALL_R
    : NET_X + NET_W / 2 + BALL_R;
  // Évite de partir déjà collé à la face du filet (après reposition frappe)
  if (dir > 0 && ball.x > faceX - 28) ball.x = faceX - 28;
  if (dir < 0 && ball.x < faceX + 28) ball.x = faceX + 28;
  if (ball.y > NET_TOP - 40) ball.y = NET_TOP - 40;

  const dist = Math.abs(faceX - ball.x);
  // Près du filet → cloche très verticale
  const steep = dist < 100 ? 1.35 : dist < 180 ? 1.2 : dist < 260 ? 1.05 : 0.98;
  const ang = dir > 0 ? -steep : Math.PI + steep;
  let spd = Math.max(HOLD_LOB_SPD * 1.15, Math.hypot(ball.vx, ball.vy));
  const serveCap = MAX_BALL_SPEED * 1.25;
  for (let n = 0; n < 20; n++) {
    ball.vx = Math.cos(ang) * spd;
    ball.vy = Math.sin(ang) * spd;
    ball.aimAngle = ang;
    if (serveArcClearsNet(ball.x, ball.y, ball.vx, ball.vy, dir)) break;
    spd *= 1.09;
    if (spd >= serveCap) { spd = serveCap; break; }
  }
  ball.vx = Math.cos(ang) * Math.min(spd, serveCap);
  ball.vy = Math.sin(ang) * Math.min(spd, serveCap);
}

/** Échange : conserve l'angle du stick, assure une portée mini. */
function ensureLobClearsNet(blob) {
  const dir = blob.side === 0 ? 1 : -1;
  let ang = Math.atan2(ball.vy, ball.vx);
  if (Math.cos(ang) * dir < 0) {
    ang = Math.atan2(-1, dir * 0.08);
  }
  let spd = Math.hypot(ball.vx, ball.vy);
  if (spd < HOLD_LOB_SPD * 0.9) spd = HOLD_LOB_SPD;
  ball.vx = Math.cos(ang) * spd;
  ball.vy = Math.sin(ang) * spd;
  ball.aimAngle = ang;
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
  const h = blob.headCircle;
  ball.x = h.x + Math.cos(ang) * (BALL_R + h.r + 2);
  ball.y = h.y + Math.sin(ang) * (BALL_R + h.r + 2);
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

/** Balle qui retombe vraiment SUR le joueur au sol (jamais en l'air → laisse le smash). */
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
  // Ancré sur la pose receive_0 du perso (manifest.serveHands), face adversaire.
  const face = blob.side === 0 ? 1 : -1;
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
  return true;
}

function trySmashBall(blob) {
  // Pas de smash tant que la balle est dans les mains (il faut d'abord lancer)
  if (ball.inHands && ball.frozen) return false;
  if (ball.tossGrace > 0 && blob.side === servingSide) return false;
  if (blob.onGround) return false;
  // 49.3 (Micron) : ses frappes ne peuvent pas être smashées en retour
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
  // Service aérien : même cloche forcée (évite les smashs plats dans le filet)
  const ang = serving
    ? aimLobAngleFromInput(blob, blob._input)
    : aimAngleFromInput(blob, blob._input);
  const pow = blob.kitPower != null ? blob.kitPower : charOf(blob).power;
  const spd = serving
    ? HOLD_LOB_SPD * 1.05
    : HIT_SPEED * pow * SMASH_MUL;
  applyDirectedHit(blob, ang, spd, 0); // smashTicks=0 → pas de slowMo / zoom
  if (serving) forceServeClearsNet(blob);
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
  // vitesse de frappe : direction normale * puissance du personnage + mouvement du joueur
  const hs = HIT_SPEED * a.power;
  ball.vx = nx * hs + blob.vx * 0.55;
  ball.vy = ny * hs + blob.vy * 0.35 - 2.5;

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
  heavy = heavy || Math.hypot(ball.vx, ball.vy) > 11.5 ||
    (blob.poseAnim === "smash" && blob.poseT > 0);
  if (heavy) sfxBallSmash();
  else sfxBallHit();
  charHitSound(a, heavy);
  if (Math.hypot(ball.vx, ball.vy) > 12) shake = Math.min(shake + 4, 9);
}

function ballBlobCollision(blob) {
  if (ball.heldBy >= 0) return; // balle contrôlée : pas de collision passive
  const a = charOf(blob);

  // Gameplay V2 :
  // - Smash/X près de la balle → smash (air) sinon cloche
  // - Sans appui → cloche auto SEULEMENT au sol si la balle tombe dessus
  //   (jamais en l'air : laisse le temps de smash ; jamais au service)
  // - Sinon la balle traverse (saut latéral, frôlement…)
  if (GAMEPLAY_V2) {
    if (ball.inHands && ball.frozen) {
      if (tryTossServe(blob)) return;
      return; // collée aux mains : saut OK, pas de frappe sans lancer
    }
    // Grace post-lancer : pas de cloche accidentelle sur le serveur
    if (ball.tossGrace > 0 && blob.side === servingSide) return;
    if (wantSmash(blob)) {
      const near = ballPathDistToBlob(blob) <= RECEIVE_R;
      if (near && trySmashBall(blob)) { applyHitExtras(blob, a); return; }
      if (near && tryLobBall(blob)) applyHitExtras(blob, a);
      return;
    }
    // Service : sauter dans le lancer ≠ frappe — il faut X
    if (isServeHit(blob)) return;
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

