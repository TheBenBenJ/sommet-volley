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
  lastHitTick: -999,   // tick de la dernière frappe active (anti double-hit 2v2)
  touches: [0, 0], // touches consécutives par équipe
  // 2v2 : index dans activeBlobs autorisé pour la prochaine frappe normale
  // (null = libre). Après une touche, seul le coéquipier peut impacter la balle.
  nextToucher: [null, null],
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
    this.lastHitTick = -999;
    this.touches = [0, 0];
    this.nextToucher = [null, null];
    this.trail = [];
    this.heldBy = -1;
    this.holdT = 0;
    this.chargeT = 0;
    this.shotArmed = false;
    this.aimAngle = side === 0 ? -0.45 : Math.PI + 0.45;
  }
};

/** 2v2 : ce blob peut-il dig/smash/cloche normalement ? (supers gérés à part) */
function canNormalHit2v2(blob) {
  if (typeof mode === "undefined" || mode !== "2v2") return true;
  if (typeof state !== "undefined" && state !== "play") return true;
  if (typeof isServeHit === "function" && isServeHit(blob)) return true;
  const nt = ball.nextToucher[blob.side];
  if (nt == null || nt < 0) return true;
  return activeBlobs.indexOf(blob) === nt;
}

/** 2v2 : blob en « ghost » (bouge OK, pas d'impact balle hors super). */
function isBallGhostBlob(blob) {
  return typeof mode !== "undefined" && mode === "2v2" &&
    typeof state !== "undefined" && state === "play" &&
    !canNormalHit2v2(blob);
}

function clearNextTouchers() {
  ball.nextToucher[0] = null;
  ball.nextToucher[1] = null;
}

/** Après une frappe normale en 2v2 : seul l'allié pourra retoucher. */
function setNextToucherAfterHit(blob) {
  if (typeof mode === "undefined" || mode !== "2v2") return;
  // Service : pas de verrou (la balle doit partir de l'autre côté)
  if (typeof isServeHit === "function" && isServeHit(blob)) {
    ball.nextToucher[blob.side] = null;
    return;
  }
  if (typeof state !== "undefined" && state !== "play") {
    ball.nextToucher[blob.side] = null;
    return;
  }
  const mate = activeBlobs.find(b => b !== blob && b.side === blob.side);
  ball.nextToucher[blob.side] = mate ? activeBlobs.indexOf(mate) : null;
}

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
    // Super Smash : chaque contact propre accélère la jauge
    if (typeof powerGauge !== "undefined" && typeof POWER_GAUGE_MAX !== "undefined") {
      const bonus = typeof POWER_GAUGE_TOUCH === "number" ? POWER_GAUGE_TOUCH : 70;
      powerGauge[blob.side] = Math.min(POWER_GAUGE_MAX, (powerGauge[blob.side] | 0) + bonus);
    }
  }
  ball.lastTouchSide = blob.side;
  ball.lastTouchTick = tick;
  if (newContact) setNextToucherAfterHit(blob);
  if (ball.touches[blob.side] > MAX_TOUCHES) {
    awardPoint(1 - blob.side, `Plus de ${MAX_TOUCHES} touches !`);
    return;
  }
  if (flameMode && newContact) applyFlameBurn(blob);
}

function powerGaugeReady(side) {
  return typeof powerGauge !== "undefined" && typeof POWER_GAUGE_MAX !== "undefined" &&
    (powerGauge[side] | 0) >= POWER_GAUGE_MAX;
}

/** Peut déclencher un Super Smash (jauge pleine, échange, pas déjà en dosage). */
function canStartPowerSmash(blob) {
  if (!GAMEPLAY_V2) return false;
  if (powerWindup) return false;
  if (!powerGaugeReady(blob.side)) return false;
  if (state !== "play") return false;
  if (ball.frozen || ball.inHands || ball.popped) return false;
  if (isServeHit(blob)) return false; // pas au service — trop fort
  if (blob.onGround) return false;
  return true;
}

/** Super Smash : seulement si le joueur MAINTIENT smash (jamais forcé au contact auto). */
function wantsPowerSmashHold(blob) {
  return !!(blob._input && blob._input.smash);
}

function startPowerWindup(blob) {
  if (!canStartPowerSmash(blob)) return false;
  if (!wantsPowerSmashHold(blob)) return false;
  const ang = aimAngleFromInput(blob, blob._input || { ax: 0, ay: 0 });
  // En ligne : pas de freeze (désync) — tir immédiat à charge moyenne
  if (online) {
    firePowerSmash(blob, 0.72, ang);
    return true;
  }
  powerWindup = {
    side: blob.side,
    who: activeBlobs.indexOf(blob), // 2v2 : le lanceur, pas le 1er du camp
    t: 0,
    charge: 0.28,
    ang,
    auto: false // dosage uniquement au maintien ; relâche = tir
  };
  // Fige la balle le temps du dosage
  ball.vx = 0;
  ball.vy = 0;
  ball.frozen = false;
  clearBallHold();
  // Colle près de la tête pour la lecture
  const h = blob.headCircle;
  const dir = blob.side === 0 ? 1 : -1;
  ball.x = h.x + dir * 10;
  ball.y = h.y - 8;
  if (!noFx) {
    superFlash = "SUPER SMASH";
    superFlashSub = "Maintiens · vise · relâche";
    superFlashT = Math.max(superFlashT, 90);
    shake = Math.max(shake, 5);
    beep(660, 0.06, "square", 0.12, 0, 900);
  }
  return true;
}

/** Relâche trop tôt : smash normal, jauge non consommée. */
function abortPowerWindupToNormalSmash(blob) {
  const ang = (powerWindup && powerWindup.ang != null)
    ? powerWindup.ang
    : aimAngleFromInput(blob, blob._input || { ax: 0, ay: 0 });
  powerWindup = null;
  const serving = isServeHit(blob);
  const pow = blob.kitPower != null ? blob.kitPower : charOf(blob).power;
  const aerialServe = serving && !blob.onGround && ball.y <= NET_TOP + 40;
  const useAng = aerialServe || !serving
    ? ang
    : aimLobAngleFromInput(blob, blob._input || { ax: 0, ay: 0 });
  const spd = (serving && !aerialServe)
    ? HOLD_LOB_SPD * 1.05
    : HIT_SPEED * pow * SMASH_MUL;
  applyDirectedHit(blob, useAng, spd, 0);
  if (serving) forceServeClearsNet(blob);
  else ensureSmashClearsNet(blob);
  markActiveHit(blob);
  shake = Math.max(shake, 4);
  if (typeof setCharPose === "function") setCharPose(blob, "smash", 28);
  if (!noFx) {
    superFlash = "";
    superFlashSub = "";
    superFlashT = 0;
  }
}

function firePowerSmash(blob, charge, ang) {
  powerWindup = null;
  charge = Math.max(0.2, Math.min(1, charge || 0.7));
  if (ang == null) ang = aimAngleFromInput(blob, blob._input || { ax: 0, ay: 0 });
  const pow = blob.kitPower != null ? blob.kitPower : charOf(blob).power;
  const mul = (typeof POWER_SMASH_MUL === "number" ? POWER_SMASH_MUL : 1.28) *
    (1.05 + 0.22 * charge);
  const spd = HIT_SPEED * pow * SMASH_MUL * mul;
  const smashT = typeof POWER_SMASH_TICKS === "number" ? POWER_SMASH_TICKS : 78;
  const prevMax = MAX_BALL_SPEED;
  applyDirectedHit(blob, ang, spd, smashT);
  {
    const cap = typeof POWER_MAX_BALL_SPEED === "number" ? POWER_MAX_BALL_SPEED : prevMax;
    const sp = Math.hypot(ball.vx, ball.vy);
    if (sp > prevMax && sp > 0.001) {
      const target = Math.min(sp, cap);
      ball.vx = ball.vx / sp * target;
      ball.vy = ball.vy / sp * target;
    }
  }
  // Consomme la jauge APRÈS le contact (registerTouch aurait rechargé sinon)
  if (typeof powerGauge !== "undefined") powerGauge[blob.side] = 0;
  ensureSmashClearsNet(blob);
  markActiveHit(blob);
  if (!online && typeof POWER_SLOWMO === "number") ball.slowMo = POWER_SLOWMO;
  shake = Math.max(shake, 12 + Math.floor(charge * 4));
  crowdHype = Math.max(crowdHype, 55);
  if (typeof setCharPose === "function") setCharPose(blob, "smash", 36);
  if (!noFx) {
    spawnBoom(ball.x, ball.y);
    spawnBoom(ball.x + (blob.side === 0 ? 12 : -12), ball.y - 6);
    sfxBallSmash();
    superFlash = "SUPER SMASH !";
    superFlashSub = sideLabel(blob.side);
    superFlashT = Math.max(superFlashT, 80);
    beep(220, 0.1, "sawtooth", 0.16);
    beep(480, 0.12, "square", 0.14, 0.06, 720);
  }
  return true;
}

function stepPowerWindup(inL, inR, ins) {
  if (!powerWindup) return;
  const side = powerWindup.side;
  let who = powerWindup.who | 0;
  let blob = activeBlobs[who];
  // Snapshot ancien sans `who`, ou index périmé → 1er du camp
  if (!blob || blob.side !== side) {
    blob = null;
    for (let i = 0; i < activeBlobs.length; i++) {
      if (activeBlobs[i].side === side) { blob = activeBlobs[i]; who = i; break; }
    }
  }
  if (!blob) { powerWindup = null; return; }
  powerWindup.who = who;
  const input = ins
    ? (ins[who] || {})
    : (side === 0 ? inL : inR);
  // Micro-ajustement latéral pendant le freeze (lecture + skill)
  const a = charOf(blob);
  const kitSp = blob.kitSpeed != null ? blob.kitSpeed : a.speed;
  const sp = BLOB_SPEED * 0.35 * kitSp;
  if (input.left) blob.x -= sp;
  if (input.right) blob.x += sp;
  const half = 34;
  const minX = side === 0 ? half : NET_X + NET_W / 2 + half - 6;
  const maxX = side === 0 ? NET_X - NET_W / 2 - half + 6 : W - half;
  blob.x = Math.max(minX, Math.min(maxX, blob.x));
  blob._input = input;
  powerWindup.t++;
  const maxT = typeof POWER_WINDUP_MAX === "number" ? POWER_WINDUP_MAX : 84;
  const minT = typeof POWER_WINDUP_MIN === "number" ? POWER_WINDUP_MIN : 40;
  powerWindup.charge = Math.min(1, 0.22 + (powerWindup.t / maxT) * 0.78);
  powerWindup.ang = aimAngleFromInput(blob, input);
  // Balle collée à la tête
  const h = blob.headCircle;
  const dir = side === 0 ? 1 : -1;
  ball.x = h.x + dir * 10;
  ball.y = h.y - 8;
  ball.vx = 0;
  ball.vy = 0;
  // Tir = relâche après minT ; maintien jusqu'au max = tir max charge.
  // Relâche trop tôt = smash normal (jauge gardée) — jamais forcé.
  if (!input.smash) {
    if (powerWindup.t >= minT) firePowerSmash(blob, powerWindup.charge, powerWindup.ang);
    else abortPowerWindupToNormalSmash(blob);
  } else if (powerWindup.t >= maxT) {
    firePowerSmash(blob, powerWindup.charge, powerWindup.ang);
  }
}

/** Mode flamme : 1 PV par contact. À 0 → embrasement + point pour l'adversaire. */
function applyFlameBurn(blob) {
  if (!flameMode) return;
  if (state !== "play" && state !== "serve") return;
  if (blob.flameHp == null) blob.flameHp = FLAME_HP_MAX;
  if (blob.flameHp <= 0) return;
  blob.flameHp--;
  if (!noFx) {
    beep(380, 0.05, "sawtooth", 0.07, 0, 220);
    spawnSand(blob.x, blob.y - 20, 3);
  }
  if (blob.flameHp <= 0) {
    blob.flameIgniteT = 70;
    if (!noFx) {
      spawnBoom(blob.x, blob.y - 48);
      shake = Math.max(shake, 12);
    }
    awardPoint(1 - blob.side, "🔥 BRÛLÉ !");
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
  // Saut clavier explicite → assist clavier même si une manette dérive au repos
  if (input.kbdJump) return true;
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
  ball.lastHitTick = tick; // 1 frappe / tick (évite téléport coéquipier 2v2)
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
  // Passage en Force : punch vers l'adversaire (~10 %)
  if (blob.superKind === "cygne" && blob.superT > 0) {
    const dir = blob.side === 0 ? 1 : -1;
    if (ball.vx * dir > 0) ball.vx *= 1.10;
    else ball.vx += dir * Math.max(1.2, Math.abs(ball.vx) * 0.08);
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

/**
 * Interdit de toucher la balle À TRAVERS le filet.
 * Camp gauche (0) : balle encore à droite → non (sauf au-dessus du bandeau).
 * Contestation aérienne OK si tout le ballon est au-dessus de NET_TOP.
 */
function canHitBallThroughNet(blob) {
  if (!blob) return false;
  const ballSide = ball.x < NET_X ? 0 : 1;
  if (ballSide === blob.side) return true;
  // Au-dessus du filet : les deux camps peuvent contester (Smash Battle / block)
  return (ball.y + BALL_R) <= NET_TOP;
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

/** Rayon de dig : un peu plus large contre smash / balle très rapide. */
function receiveHitRadius() {
  const spd = Math.hypot(ball.vx, ball.vy);
  if (ball.smash > 0 || spd > 11.2) return RECEIVE_R + 18;
  if (spd > 9.2) return RECEIVE_R + 8;
  return RECEIVE_R;
}

/**
 * Manette : intention de dig via le stick (vers la balle ou vers le haut)
 * face à un smash / une balle menaçante — permet de rattraper sans X parfait.
 */
function padStickDigIntent(blob) {
  const input = blob._input;
  if (!input || isKeyboardStyleAim(input)) return false;
  if (!blob.onGround) return false;
  const ax = Number(input.ax) || 0;
  const ay = Number(input.ay) || 0;
  const mag = Math.hypot(ax, ay);
  if (mag < 0.32) return false;
  const h = blob.headCircle;
  const dx = ball.x - h.x, dy = ball.y - h.y;
  const dist = Math.hypot(dx, dy);
  const digUp = ay < -0.4;
  let towardBall = dist < 8;
  if (!towardBall && dist > 0.001) {
    towardBall = (ax * dx + ay * dy) / (mag * dist) > 0.35;
  }
  if (!towardBall && !digUp) return false;
  const spd = Math.hypot(ball.vx, ball.vy);
  const incoming = blob.side === 0 ? ball.vx < -0.8 : ball.vx > 0.8;
  return ball.smash > 0 || spd > 9.5 || (incoming && ball.y < GROUND_Y - 40);
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
  if (!noFx && typeof spawnAirPuff === "function") spawnAirPuff(ball.x, ball.y + 10);
  shake = Math.max(shake, 2.5);
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
  if (!canNormalHit2v2(blob)) return false;
  if (!canHitBallThroughNet(blob)) return false;
  if (ball.inHands && ball.frozen) return false;
  if (ball.tossGrace > 0 && blob.side === servingSide) return false;
  // Service : pas de frappe au sol — il faut sauter dans la balle.
  if (isServeHit(blob) && blob.onGround) return false;
  if (ballPathDistToBlob(blob) > receiveHitRadius()) return false;
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
  if (!canHitBallThroughNet(blob)) return false;
  if (ball.tossGrace > 0 && blob.side === servingSide) return false;
  if (blob.onGround) return false;
  // Passage en Force (Cygne / cygne) : frappes immunisées au smash adverse
  if (ball.lastTouchSide !== blob.side && ball.lastTouchSide >= 0) {
    for (const o of activeBlobs) {
      if (o.side === ball.lastTouchSide && o.superKind === "cygne" && o.superT > 0) return false;
    }
  }
  // Balle au-dessus de la taille (plus tolérant que « au-dessus des épaules »)
  if (ball.y > blob.y - 36) return false;
  if (ballPathDistToBlob(blob) > RECEIVE_R) return false;
  if (!canActiveHit(blob)) return false;
  // Super Smash : jauge pleine + maintien smash uniquement (pas le contact auto)
  // Autorisé même en « ghost » 2v2 (seul impact balle hors tour normal).
  if (canStartPowerSmash(blob) && wantsPowerSmashHold(blob)) {
    if (startPowerWindup(blob)) return true;
  }
  if (!canNormalHit2v2(blob)) return false;
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

  // Sortie du volume poteau dans le sens du trajet (évite anti-stick → flip vx).
  const pushPastPost = () => {
    if (x > leftC && x < rightC) {
      if (vx > 0.05) x = rightC + 0.5;
      else if (vx < -0.05) x = leftC - 0.5;
      else x = x < NET_X ? leftC - 0.5 : rightC + 0.5;
    }
  };

  const tryFace = (dir) => {
    const face = dir > 0 ? leftC : rightC;
    const crossing = dir > 0
      ? (vx > 0 && prevX <= face && x > face)
      : (vx < 0 && prevX >= face && x < face);
    if (!crossing) return false;
    const yHit = yAlong(face);
    // Entièrement au-dessus du sommet : pas de face latérale
    if (yHit <= clearY) return false;
    // Frôle le bord supérieur → aide à PASSER (pas un mur qui renvoie).
    // Avant : on remontait vy sans sortir du poteau → tick suivant anti-stick
    // inversait vx → balle « rebond filet » qui retombe à mi-court (multi).
    if (yHit <= clearY + TOP_SLACK) {
      if (y > clearY - 2) y = clearY - 2;
      if (vy > -1.5) vy = -Math.max(2.5, Math.abs(vy) * 0.5 + 1.2);
      pushPastPost();
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
    // Déjà dans le volume en zone de frôle : pousser de l'autre côté
    y = clearY - 2;
    if (vy > -1.5) vy = -2.5;
    pushPastPost();
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
  let didBoom = false;
  if (blob.superSmash && blob.superT > 0) {
    const dir = blob.side === 0 ? 1 : -1;
    ball.vx = dir * SMASH_VX;
    ball.vy = 2.5;
    ball.smash = 60; ball.spin = dir * 0.3;
    clampBallSpeed();
    blob.superSmash = false; blob.superT = 0; blob.superKind = "";
    shake = 13;
    spawnBoom(ball.x, ball.y);
    didBoom = true;
    heavy = true;
  }
  heavy = heavy || Math.hypot(ball.vx, ball.vy) > 10.5 ||
    (blob.poseAnim === "smash" && blob.poseT > 0);
  if (heavy) {
    sfxBallSmash();
    // Juice smash normal (hors superSmash déjà boomé plus haut)
    if (!didBoom && !noFx && blob.poseAnim === "smash" && typeof spawnBoom === "function") {
      spawnBoom(ball.x, ball.y);
      shake = Math.max(shake, 6);
    } else if (!didBoom && !noFx && typeof spawnSand === "function") {
      spawnSand(ball.x, ball.y, 10);
      shake = Math.max(shake, 5);
    }
  } else {
    sfxBallHit();
    if (!noFx && typeof spawnSand === "function") spawnSand(ball.x, ball.y, 5);
  }
  charHitSound(a, heavy);
  if (Math.hypot(ball.vx, ball.vy) > 11.5) shake = Math.min(shake + 4, 9);
}

function ballBlobCollision(blob) {
  if (ball.heldBy >= 0) return; // balle contrôlée : pas de collision passive
  if (blob.battleStunT > 0) return; // perdant du Smash Battle : ne digue pas
  // Pas de dig / smash à travers le filet (service au filet, bras qui passent…)
  if (!canHitBallThroughNet(blob)) return;
  // 2v2 : coéquipiers se traversent → sans ça, 2 frappes le même tick
  // (auto-cloche + dig IA) et applyDirectedHit téléporte la balle.
  if (ball.lastHitTick === tick) return;
  const a = charOf(blob);

  // 2v2 ghost : pas d'impact balle sauf Super Smash (jauge) plus bas via trySmashBall
  if (isBallGhostBlob(blob)) {
    if (GAMEPLAY_V2 && state === "play" &&
        canStartPowerSmash(blob) && wantsPowerSmashHold(blob)) {
      const near = ballPathDistToBlob(blob) <= receiveHitRadius();
      if (near && trySmashBall(blob)) {
        if (!powerWindup) applyHitExtras(blob, a);
      }
    }
    return;
  }

  // Gameplay V2 :
  // - Manette : X/Y près de la balle → smash (air) sinon cloche
  // - Clavier : contact AUTO en échange — sol = cloche, air = smash
  // - Service (après lancer) : toujours un appui explicite (pas d'auto)
  if (GAMEPLAY_V2) {
    if (ball.inHands && ball.frozen) {
      if (tryTossServe(blob)) return; // F/X = lancer vertical
      // Espace = saut normal (balle reste en mains) — plus de service 1 appui au sol
      return; // collée aux mains tant qu'on n'a pas lancé
    }
    // Grace post-lancer : pas de cloche accidentelle sur le serveur
    if (ball.tossGrace > 0 && blob.side === servingSide) return;

    const aiBlob = !online && vsAI && blob !== blobL;
    const kbHuman = !aiBlob && isKeyboardStyleAim(blob._input);
    const padHuman = !aiBlob && !kbHuman;
    const servingNow = isServeHit(blob);

    // Service : après le lancer (F/X), frappe UNIQUEMENT en l'air.
    if (servingNow) {
      if (blob._serveAwaitRelease) {
        if (!(blob._input && blob._input.smash)) blob._serveAwaitRelease = false;
        else return; // encore le maintien du lancer
      }
      // CLAVIER : sauter DANS la balle → smash/cloche AUTO au contact en l'air.
      if (kbHuman && !blob.onGround) {
        const d = ballPathDistToBlob(blob);
        const aligned = Math.abs(ball.x - blob.x) < 44;
        if (d <= 40 && aligned) {
          if (trySmashBall(blob)) {
            if (!powerWindup) applyHitExtras(blob, a);
            return;
          }
          if (tryLobBall(blob)) { applyHitExtras(blob, a); return; }
        }
      }
      // Frappe explicite : FRONT montant seulement (pas le maintien).
      // Sinon un double-tap X pendant la grâce post-lancer « mange » le 2ᵉ
      // front, puis le maintien sert tout seul dès que tossGrace tombe à 0.
      if (blob._smashEdge) {
        const near = ballPathDistToBlob(blob) <= RECEIVE_R;
        if (near && trySmashBall(blob)) {
          if (!powerWindup) applyHitExtras(blob, a);
          return;
        }
        if (near && tryLobBall(blob)) applyHitExtras(blob, a);
      }
      return;
    }

    // Manette (ou appui S clavier) : frappe explicite
    if (wantSmash(blob)) {
      const near = ballPathDistToBlob(blob) <= receiveHitRadius();
      if (near && trySmashBall(blob)) {
        if (!powerWindup) applyHitExtras(blob, a);
        return;
      }
      if (near && tryLobBall(blob)) applyHitExtras(blob, a);
      return;
    }

    // Manette : stick bien orienté → dig même sans X (smashs / balles rapides)
    if (padHuman && padStickDigIntent(blob) && tryLobBall(blob)) {
      applyHitExtras(blob, a);
      return;
    }

    // Clavier humain : smash auto en l'air au contact (échange seulement)
    if (kbHuman && !blob.onGround) {
      const d = ballPathDistToBlob(blob);
      const aligned = Math.abs(ball.x - blob.x) < 40;
      if (d <= 34 && aligned && trySmashBall(blob)) {
        if (!powerWindup) applyHitExtras(blob, a);
        return;
      }
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
    ball.lastHitTick = tick;
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
    clearNextTouchers(); // nouveau camp : tout le monde peut frapper
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

