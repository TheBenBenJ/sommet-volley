// sommet-volley · intelligence artificielle (4 niveaux, chasse au duel)
"use strict";

// ---------- IA · Gameplay V2 ----------
// Volley : 1ʳᵉ touche = réception (passe haute), puis set / smash.
// Service : smash (X) pour lancer → frappe vers l'adversaire.

/** Déplacement avec hystérésis : évite gauche↔droite à chaque tick (sprite qui tourne). */
function aiSteerToward(me, input, dx, step, lvl) {
  // Remplace tout déplacement précédent (évite left+right simultanés si appelé 2×).
  input.left = false;
  input.right = false;
  // Zone morte proportionnelle à la vitesse, mais assez petite pour se placer sous la balle.
  // (Un plancher trop haut → l'IA s'arrête à 16 px et rate le contact.)
  const react = lvl.react != null ? lvl.react : 0.8;
  const enter = Math.max(7, Math.min(18, step * (1.05 + (1 - react) * 0.35)));
  const hold = enter * 0.48;
  if (me._aiSteer === undefined) me._aiSteer = 0;
  if (me._aiSteer < 0) {
    if (dx > -hold) me._aiSteer = 0;
    else input.left = true;
  } else if (me._aiSteer > 0) {
    if (dx < hold) me._aiSteer = 0;
    else input.right = true;
  } else {
    if (dx < -enter) { input.left = true; me._aiSteer = -1; }
    else if (dx > enter) { input.right = true; me._aiSteer = 1; }
  }
}

/** 0 = réception, 1 = passe/set, 2+ = attaque (ou service). */
function aiV2TouchRole(side) {
  if (ball.serveAimLock && side === servingSide) return 2; // service : envoyer
  return ball.touches[side] | 0;
}

/** Vise selon le rôle (réception ≠ tir). */
function aiV2FillAim(side, lvl, me, opp, input, role) {
  const fwd = side === 0 ? 1 : -1;
  // Service : cloche haute vers l'adversaire (évite le filet)
  if (ball.serveAimLock && side === servingSide) {
    input.ax = fwd * 0.65;
    input.ay = -0.88;
    return;
  }
  if (role === 0) {
    // Réception : passe haute quasi verticale (laisse le temps de set / smash)
    input.ax = fwd * 0.12;
    input.ay = -0.96;
    return;
  }
  if (role === 1 && !lvl.aim) {
    // 2ᵉ touche facile : encore une passe / renvoi doux
    input.ax = fwd * 0.5;
    input.ay = -0.75;
    return;
  }
  if (role < 2 && lvl.aim) {
    // Set vers l'avant (prépare un smash)
    input.ax = fwd * 0.32;
    input.ay = -0.92;
    return;
  }
  // Attaque / 3ᵉ touche : vers l'adversaire
  if (!lvl.aim) {
    input.ax = fwd * (0.82 + lvl.react * 0.12);
    input.ay = -0.28;
    return;
  }
  const oppNearNet = side === 0 ? opp.x < NET_X + 150 : opp.x > NET_X - 150;
  const oppDeep = side === 0 ? opp.x > NET_X + 240 : opp.x < NET_X - 240;
  if (oppNearNet) {
    input.ax = fwd * 0.5;
    input.ay = -0.82;
  } else if (oppDeep) {
    input.ax = fwd * 0.98;
    input.ay = 0.22;
  } else {
    input.ax = fwd * 0.88;
    input.ay = -0.28;
  }
  if (opp) {
    const oppCourtMid = side === 0 ? (NET_X + W) * 0.5 : NET_X * 0.5;
    if (side === 0) input.ax = opp.x > oppCourtMid ? 0.5 : 0.98;
    else input.ax = opp.x < oppCourtMid ? -0.5 : -0.98;
  }
}

/**
 * Actions V2 (lancer service, réception, smash). Retourne true si le service
 * « balle en mains » est en cours.
 */
function aiGameplayV2(side, lvl, me, opp, input) {
  if (!GAMEPLAY_V2) return false;

  // --- Service : balle dans les mains → lancer au smash (X), jamais au saut ---
  if (ball.frozen && ball.inHands && servingSide === side && serveCountdown <= 0 &&
      (state === "serve" || state === "play")) {
    if (me._aiTossTick == null) {
      me._aiTossTick = tick + 8 + Math.floor((1.05 - lvl.react) * 28) + (lvl.err > 18 ? 12 : 0);
    }
    if (tick >= me._aiTossTick) input.smash = true;
    input.jump = false;
    return true;
  }
  if (!ball.inHands) me._aiTossTick = null;

  if (ball.frozen || ball.popped) return false;

  const overMySide = side === 0 ? ball.x < NET_X - BALL_R : ball.x > NET_X + BALL_R;
  if (!overMySide) return false;

  const headY = me.y - 64;
  const dist = Math.hypot(ball.x - me.x, ball.y - headY);
  const role = aiV2TouchRole(side);
  const servingHit = !!(ball.serveAimLock && side === servingSide);
  const receiving = role === 0;
  const mustClear = role >= 2 && !servingHit;
  const descending = ball.vy > -1.2;

  // Grace post-lancer : placement laissé à aiInput (predictLandingX).
  if (ball.tossGrace > 0 && servingSide === side) return false;

  // Trop loin : pas encore d'action (le placement continue via aiInput)
  if (dist > RECEIVE_R + 70) return false;

  aiV2FillAim(side, lvl, me, opp, input, role);

  const alignSlop = 50 + (1 - (lvl.react || 0.8)) * 8;
  const aligned = Math.abs(ball.x - me.x) < alignSlop;
  const tooHighToStand = ball.y < me.y - 138;
  const goodSmashH = ball.y < me.y - 48 && ball.y > me.y - 175;
  const nearNet = Math.abs(me.x - NET_X) < (lvl.aim ? 155 : 120);
  const fwd = side === 0 ? 1 : -1;

  // Fenêtre de frappe un peu généreuse : mieux frapper que « coller » / rater
  const inHitWindow = dist <= RECEIVE_R + 10 && descending && aligned &&
    (ball.y < me.y - 24) && (ball.y > me.y - 205);
  const canReachHit = inHitWindow ||
    (dist <= RECEIVE_R + 2 && descending && Math.abs(ball.x - me.x) < alignSlop + 8 &&
     ball.y < me.y - 20 && ball.y > me.y - 210);

  function tryJumpForBall() {
    if (!me.onGround || !tooHighToStand || !descending || !aligned) return;
    if (ball.vy < 0.4) return;
    input.jump = true;
  }

  function tryDoubleJumpSmash() {
    if (!lvl.dbl || me.onGround || me.jumpsUsed !== 1) return;
    if (me.vy > -1.2 && goodSmashH && nearNet && aligned && dist < RECEIVE_R + 8) {
      input.jump = true;
    }
  }

  // Service : cloche au sol de préférence
  if (servingHit) {
    tryJumpForBall();
    if (canReachHit) input.smash = true;
    return false;
  }

  // Réception : rester au sol ; passe haute
  if (receiving) {
    tryJumpForBall();
    if (canReachHit || (!me.onGround && dist <= RECEIVE_R + 4 && descending && aligned)) {
      input.smash = true;
    }
    return false;
  }

  // 2ᵉ touche : set ; niveaux aim peuvent smash tôt près du filet
  if (role === 1) {
    tryJumpForBall();
    tryDoubleJumpSmash();
    if (lvl.aim && !me.onGround && goodSmashH && nearNet && dist < RECEIVE_R + 6 && aligned &&
        ball.y < NET_TOP + 55) {
      input.smash = true;
      input.ax = fwd * 0.95;
      input.ay = 0.05;
    } else if (canReachHit) {
      input.smash = true;
    }
    return false;
  }

  // Dégagement / 3ᵉ touche : smash si possible, sinon cloche
  if (mustClear) {
    input.ax = fwd * 0.92;
    input.ay = -0.4;
    tryJumpForBall();
    tryDoubleJumpSmash();
    if (!me.onGround && goodSmashH && nearNet && dist < RECEIVE_R + 6 && aligned &&
        ball.y < NET_TOP + 55) {
      input.smash = true;
      input.ax = fwd * 0.98;
      input.ay = lvl.aim ? 0.12 : -0.05;
    } else if (canReachHit) {
      input.smash = true;
    }
    return false;
  }

  return false;
}

// ---------- IA ----------
function predictLandingX() {
  // simulation de la trajectoire jusqu'à la hauteur de frappe, en tenant compte
  // des murs ET du rebond sur le sommet du filet.
  let x = ball.x, y = ball.y, vx = ball.vx, vy = ball.vy;
  const hitY = GROUND_Y - 75;
  const lift = (typeof ballLift === "function") ? ballLift() : 1;
  for (let i = 0; i < 400; i++) {
    const ox = x, oy = y;
    vy += GRAV_BALL * lift;
    x += vx; y += vy;
    const r = resolveNetBall(ox, oy, x, y, vx, vy);
    x = r.x; y = r.y; vx = r.vx; vy = r.vy;
    if (x - BALL_R < 0) { x = BALL_R; vx = Math.abs(vx) * 0.9; }
    if (x + BALL_R > W) { x = W - BALL_R; vx = -Math.abs(vx) * 0.9; }
    if (y >= hitY && vy > 0) return x;
  }
  return x;
}

/** La balle (re)tombera-t-elle dans mon camp ? */
function aiBallLandsMySide(side) {
  const land = predictLandingX();
  return side === 0 ? land < NET_X - 8 : land > NET_X + 8;
}

// side (optionnel, défaut 1 = camp droit, comportement historique) : 0 pour
// piloter le camp gauche à la place — toute la géométrie ci-dessous est
// symétrique par rapport au filet selon ce paramètre.
// lvlOverride (optionnel) : profil à utiliser au lieu de AI_LEVELS[aiLevel].
function aiInput(side, lvlOverride, god) {
  if (side === undefined) side = 1;
  const lvl = lvlOverride || AI_LEVELS[aiLevel];
  const input = { left: false, right: false, jump: false, smash: false, super: false };
  if (battle.active) {
    const period = [8, 5, 3, 2][aiLevel];
    input.jump = Math.floor(tick / period) % 2 === 0;
    return input;
  }
  const me = side === 0 ? blobL : blobR;
  const opp = side === 0 ? blobR : blobL;

  if (--aiErrTimer <= 0) {
    aiErr = (rng() - 0.5) * 2 * lvl.err;
    aiRush = rng() < lvl.rush;
    aiErrTimer = 48 + Math.floor((1 - lvl.react) * 20);
  }

  if (!(typeof tutorialMode !== "undefined" && tutorialMode) &&
      superCharge[side] === 1 && me.superT <= 0 && !ball.frozen && state === "play") {
    const key = charOf(me).key;
    const onMySide = side === 0 ? ball.x < NET_X : ball.x > NET_X;
    const hitReach = god ? 100 : 72;
    const nearHit = Math.abs(ball.x - me.x) < hitReach && ball.y > me.y - 210 && ball.vy > -1;
    if (key === "volkoi" || key === "dorf" || key === "cygne") {
      if (onMySide && nearHit) input.super = true;
    } else if (onMySide && (side === 0 ? ball.vx < 0 : ball.vx > 0)) {
      input.super = true;
    }
  }

  const ballHighNearNet = !ball.frozen && state === "play" &&
        Math.abs(ball.x - NET_X) < BATTLE_BALL_DIST + 40 &&
        ball.y > -40 && ball.y < NET_TOP + 70;
  const oppTowardNet = Math.abs(opp.x - NET_X) < BATTLE_NET_DIST + 60;
  const landsNearNet = !god || !ballHighNearNet || Math.abs(predictLandingX() - NET_X) < BATTLE_BALL_DIST + 80;
  // V2 : ne pas abandonner la défense pour un rush filet si la balle arrive chez soi
  const defending = GAMEPLAY_V2 && (side === 0 ? ball.x < NET_X + 80 : ball.x > NET_X - 80);
  if (!defending && aiRush && battle.cooldown === 0 && ballHighNearNet && oppTowardNet && landsNearNet) {
    const rushX = side === 0 ? NET_X - NET_W / 2 - 42 : NET_X + NET_W / 2 + 42;
    const dxr = rushX - me.x;
    aiSteerToward(me, input, dxr, 14, lvl);
    if (me.onGround && Math.abs(dxr) < 30 &&
        (!opp.onGround || Math.abs(opp.x - NET_X) < BATTLE_NET_DIST)) {
      input.jump = true;
    }
    return input;
  }

  // Anticipation : lookahead selon react (niveaux forts partent plus tôt)
  const look = GAMEPLAY_V2 ? (160 + lvl.react * 140) : 120;
  const ballComing = side === 0
    ? (ball.x < NET_X + look || (ball.vx < -0.2 && !ball.frozen && ball.x < NET_X + 320) ||
       (!ball.frozen && aiBallLandsMySide(0)))
    : (ball.x > NET_X - look || (ball.vx > 0.2 && !ball.frozen && ball.x > NET_X - 320) ||
       (!ball.frozen && aiBallLandsMySide(1)));
  let targetX;

  if (ball.frozen && servingSide === side) {
    targetX = ball.inHands ? me.x : ball.x + (side === 0 ? -8 : 8);
  } else if (GAMEPLAY_V2 && servingSide === side && ball.serveAimLock && !ball.inHands) {
    // Après lancer : se placer sous la retombée pour la 1ʳᵉ frappe
    targetX = predictLandingX() + (side === 0 ? -4 : 4);
  } else if (ballComing) {
    const land = predictLandingX();
    const notReachingMe = side === 0 ? land >= NET_X : land <= NET_X;
    const shortNearNet = side === 0 ? land > NET_X - 90 : land < NET_X + 90;
    // Facile : réaction un peu tardive si la balle est encore très haute / montante
    const lateReact = lvl.react < 0.75 && ball.vy < -2 && ball.y < GROUND_Y - 220 &&
      (side === 0 ? ball.x > NET_X - 40 : ball.x < NET_X + 40);
    if (notReachingMe || lateReact) {
      targetX = me.homeX;
    } else if (GAMEPLAY_V2) {
      const under = side === 0 ? -2 : 2;
      // Moins d'erreur sur les niveaux forts ; blend fin de chute pour coller le contact
      const errScale = 0.12 + (1 - lvl.react) * 0.2;
      targetX = land + under + aiErr * errScale;
      const onSide = side === 0 ? ball.x < NET_X : ball.x > NET_X;
      if (onSide && ball.vy > 0.8 && ball.y > GROUND_Y - 200) {
        const blend = 0.35 + lvl.react * 0.25; // plus fort → suit plus la X live en fin
        targetX = land * (1 - blend) + ball.x * blend + under + aiErr * errScale * 0.5;
      }
    } else if (shortNearNet) {
      targetX = land + (side === 0 ? -8 : 8);
    } else if (lvl.aim) {
      const oppNearNet = side === 0 ? opp.x < NET_X + 150 : opp.x > NET_X - 150;
      const place = oppNearNet ? 26 : 15;
      targetX = land + (side === 0 ? -(place + aiErr) : (place + aiErr));
    } else {
      const place = Math.min(lvl.attack, 22);
      targetX = land + (side === 0 ? -(place + aiErr) : (place + aiErr));
    }
  } else {
    targetX = me.homeX;
  }
  targetX = side === 0
    ? Math.max(40, Math.min(NET_X - 36, targetX))
    : Math.max(NET_X + 36, Math.min(W - 40, targetX));

  const dx = targetX - me.x;
  const step = BLOB_SPEED * lvl.speedMul * charOf(me).speed;
  aiSteerToward(me, input, dx, step, lvl);

  // V1 : sauts de frappe passifs. V2 : géré dans aiGameplayV2 (cloche / smash).
  if (!GAMEPLAY_V2) {
    const overMySide = side === 0 ? ball.x < NET_X - BALL_R : ball.x > NET_X + BALL_R;
    const reachX = Math.abs(ball.x - me.x) < 40;
    const descending = ball.vy > -1;
    const highBall = ball.y < me.y - 70 && ball.y > me.y - 230;
    if (!ball.frozen && overMySide && reachX && descending && highBall) {
      if (me.onGround) input.jump = true;
      else if (lvl.dbl && me.jumpsUsed === 1 && me.vy > -1.5 && ball.y < me.y - 150) {
        input.jump = true;
      }
    }
    if (ball.frozen && servingSide === side && Math.abs(ball.x - me.x) < 20 && me.onGround) {
      input.jump = true;
    }
  } else {
    aiGameplayV2(side, lvl, me, opp, input);
  }
  return input;
}

// IA 2v2 : version « côté-agnostique » de aiInput, avec répartition d'équipe.
function aiInput2v2(me, lvlOverride) {
  const lvl = lvlOverride || AI_LEVELS[aiLevel];
  const input = { left: false, right: false, jump: false, smash: false, super: false };
  const side = me.side;
  const back = side === 0 ? -1 : 1;
  const half = 34;
  const minX = side === 0 ? half : NET_X + NET_W / 2 + half - 6;
  const maxX = side === 0 ? NET_X - NET_W / 2 - half + 6 : W - half;
  const mid = (minX + maxX) / 2;
  const onMySide = side === 0 ? ball.x < NET_X : ball.x > NET_X;
  const mate = activeBlobs.find(b => b !== me && b.side === side);

  if (me._aiT === undefined) { me._aiT = 0; me._aiErr = 0; }
  if (--me._aiT <= 0) {
    me._aiErr = (rng() - 0.5) * 2 * lvl.err;
    me._aiT = 45 + Math.floor((1 - lvl.react) * 15);
  }

  const land = predictLandingX();
  let chaser = me;
  if (mate && (onMySide || ball.frozen || aiBallLandsMySide(side))) {
    const dMe = Math.abs(land - me.x), dMate = Math.abs(land - mate.x);
    if (dMate < dMe - 4) chaser = mate;
    else if (Math.abs(dMate - dMe) <= 4) {
      const meFront = side === 0 ? me.homeX > mate.homeX : me.homeX < mate.homeX;
      const landFront = side === 0 ? land > mid : land < mid;
      chaser = (meFront === landFront) ? me : mate;
    }
  }
  const iChase = chaser === me;

  let targetX;
  if (ball.frozen && servingSide === side) {
    targetX = iChase ? (ball.inHands ? me.x : ball.x + back * 6) : me.homeX;
  } else if (GAMEPLAY_V2 && iChase && servingSide === side && ball.serveAimLock && !ball.inHands) {
    targetX = land + back * 4;
  } else if ((onMySide || aiBallLandsMySide(side)) && iChase) {
    if (GAMEPLAY_V2) {
      const errScale = 0.12 + (1 - lvl.react) * 0.2;
      targetX = land + back * 3 + me._aiErr * errScale;
      if (ball.vy > 0.8 && ball.y > GROUND_Y - 200) {
        const blend = 0.35 + lvl.react * 0.25;
        targetX = land * (1 - blend) + ball.x * blend + back * 3 + me._aiErr * errScale * 0.5;
      }
    } else {
      targetX = land + back * lvl.attack + me._aiErr;
    }
  } else {
    targetX = me.homeX;
  }
  targetX = Math.max(minX + 6, Math.min(maxX - 6, targetX));

  const dx = targetX - me.x;
  const step2v2 = BLOB_SPEED * lvl.speedMul * charOf(me).speed;
  aiSteerToward(me, input, dx, step2v2, lvl);

  const opp = activeBlobs.find(b => b.side !== side) || (side === 0 ? blobR : blobL);

  if (!GAMEPLAY_V2) {
    const overMySide = side === 0 ? ball.x < NET_X - BALL_R : ball.x > NET_X + BALL_R;
    const closeX = Math.abs(ball.x - me.x) < 42 + lvl.attack;
    const descending = ball.vy > -2;
    const strikeZone = ball.y < me.y - 34 && ball.y > me.y - 205;
    if (iChase && !ball.frozen && overMySide && closeX && descending && strikeZone) {
      if (me.onGround) input.jump = true;
      else if (lvl.dbl && me.jumpsUsed === 1 && me.vy > -1.5 && ball.y < me.y - 130) input.jump = true;
    }
    if (iChase && ball.frozen && servingSide === side &&
        Math.abs(ball.x - me.x) < 20 && me.onGround) {
      input.jump = true;
    }
  } else if (iChase) {
    aiGameplayV2(side, lvl, me, opp, input);
  }

  if (!(typeof tutorialMode !== "undefined" && tutorialMode) &&
      iChase && superCharge[side] === 1 && me.superT <= 0 && !ball.frozen && state === "play") {
    const key = charOf(me).key;
    const nearHit = Math.abs(ball.x - me.x) < 72 && ball.y > me.y - 210 && ball.vy > -1;
    if (key === "volkoi" || key === "dorf" || key === "cygne") {
      if (onMySide && nearHit) input.super = true;
    } else if (onMySide && (side === 0 ? ball.vx < 0 : ball.vx > 0)) {
      input.super = true;
    }
  }
  return input;
}

function xAI(blob) {
  if (battle.active) return { left: false, right: false, jump: tick % 2 === 0, smash: false, super: false };
  if (mode === "2v2") return aiInput2v2(blob, X_LEVEL);
  return aiInput(blob.side, X_LEVEL, true);
}

function setX(blob, on) {
  if (on) {
    if (blob._xSpd === undefined) blob._xSpd = blob.speedMul;
    blob.speedMul = X_LEVEL.speedMul;
  } else if (blob._xSpd !== undefined) {
    blob.speedMul = blob._xSpd;
    blob._xSpd = undefined;
  }
}

function xToggleLocal() {
  const inMatch = state === "play" || state === "serve" || state === "point";
  if (!inMatch) return;
  const slot = online ? mySlot : 0;
  const blob = activeBlobs[slot];
  if (!blob) return;
  xOn[slot] = !xOn[slot];
  setX(blob, xOn[slot]);
  beep(xOn[slot] ? 760 : 320, 0.05, "sine", 0.06);
}

function xInput(idx, blob, raw) {
  return xOn[idx] ? xAI(blob) : raw;
}
