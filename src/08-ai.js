// sommet-volley · intelligence artificielle (3 niveaux, chasse au duel)
"use strict";

// ---------- IA · Gameplay V2 ----------
// Volley : 1ʳᵉ touche = réception (passe haute), puis renvoi / smash.
// Service : smash (X) pour lancer → frappe vers l'adversaire.

/** Déplacement avec hystérésis : évite gauche↔droite à chaque tick (sprite qui tourne). */
function aiSteerToward(me, input, dx, step, lvl) {
  // Remplace tout déplacement précédent (évite left+right simultanés si appelé 2×).
  input.left = false;
  input.right = false;
  const enter = Math.max(10, step * 1.15, 8 - (lvl.react || 0) * 2);
  const hold = enter * 0.45;
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
  // Service : cloche vers l'adversaire (jamais piqué vers le bas)
  if (ball.serveAimLock && side === servingSide) {
    input.ax = fwd * 0.85;
    input.ay = -0.55;
    return;
  }
  if (role === 0) {
    // Réception : cloche haute avec un peu d'avance (évite de se remanger la balle)
    input.ax = fwd * 0.28;
    input.ay = -0.92;
    return;
  }
  if (role === 1 && !lvl.aim) {
    // 2ᵉ touche facile : encore une passe / renvoi doux
    input.ax = fwd * 0.55;
    input.ay = -0.7;
    return;
  }
  if (role < 2 && lvl.aim) {
    // Set vers l'avant (prépare un smash)
    input.ax = fwd * 0.35;
    input.ay = -0.9;
    return;
  }
  // Attaque / service / 3ᵉ touche : vers l'adversaire
  if (!lvl.aim) {
    input.ax = fwd * (0.8 + lvl.react * 0.15);
    input.ay = -0.35;
    return;
  }
  const oppNearNet = side === 0 ? opp.x < NET_X + 150 : opp.x > NET_X - 150;
  const oppDeep = side === 0 ? opp.x > NET_X + 240 : opp.x < NET_X - 240;
  if (oppNearNet) {
    input.ax = fwd * 0.55;
    input.ay = -0.8;
  } else if (oppDeep) {
    input.ax = fwd * 0.95;
    input.ay = 0.15;
  } else {
    input.ax = fwd * 0.85;
    input.ay = -0.35;
  }
  if (opp) {
    const oppCourtMid = side === 0 ? (NET_X + W) * 0.5 : NET_X * 0.5;
    if (side === 0) input.ax = opp.x > oppCourtMid ? 0.55 : 0.95;
    else input.ax = opp.x < oppCourtMid ? -0.55 : -0.95;
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
      me._aiTossTick = tick + 10 + Math.floor((1.05 - lvl.react) * 40) + (lvl.err > 20 ? 18 : 0);
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
  const receiving = role === 0;           // 1ʳᵉ touche = passe, pas de tir
  const mustClear = role >= 2 && !servingHit;
  const descending = ball.vy > -1.5;

  // Grace post-lancer : se placer sous la balle
  if (ball.tossGrace > 0 && servingSide === side) {
    aiSteerToward(me, input, ball.x - me.x, 12, lvl);
    return false;
  }

  // Se coller sous la balle dès qu'elle est dans le camp (priorité réception)
  aiSteerToward(me, input, ball.x - me.x, 10, lvl);

  if (dist > RECEIVE_R + 50) return false;

  aiV2FillAim(side, lvl, me, opp, input, role);

  const aligned = Math.abs(ball.x - me.x) < 50;
  const reachH = ball.y < me.y - 30 && ball.y > me.y - 200;
  const tooHighToStand = ball.y < me.y - 110;
  const goodSmashH = ball.y < me.y - 55 && ball.y > me.y - 170;

  // Près de la balle : appuyer smash/X pour frapper (plus de cloche auto)
  const inHitWindow = dist <= RECEIVE_R + 10 && descending && aligned &&
    (ball.y < me.y - 20) && (ball.y > me.y - 210);

  // Service : cloche forcée — pas de smash piqué
  if (servingHit) {
    if (me.onGround && tooHighToStand && descending && aligned) input.jump = true;
    if (inHitWindow) input.smash = true;
    return false;
  }

  // Réception : rester au sol (sauf balle vraiment trop haute)
  if (receiving) {
    if (me.onGround && tooHighToStand && descending && aligned) input.jump = true;
    if (inHitWindow) input.smash = true; // X = cloche (smash échoue au sol)
    return false;
  }

  // Dégagement / 3ᵉ touche : cloche vers l'adversaire — smash rare près du filet
  if (mustClear) {
    const fwd = side === 0 ? 1 : -1;
    input.ax = fwd * 0.9;
    input.ay = -0.45;
    if (me.onGround && tooHighToStand && descending && aligned) input.jump = true;
    const nearNet = Math.abs(me.x - NET_X) < 130;
    if (!me.onGround && goodSmashH && nearNet && dist < RECEIVE_R + 4 && aligned &&
        ball.y < NET_TOP + 50) {
      input.smash = true;
      input.ax = fwd * 0.95;
      input.ay = -0.05;
    } else if (inHitWindow) {
      input.smash = true; // X = cloche
    }
    return false;
  }

  if (role === 1) {
    // 2ᵉ touche : cloche, saut seulement si trop haut
    if (me.onGround && tooHighToStand && descending && aligned) input.jump = true;
    if (inHitWindow) input.smash = true;
  }
  return false;
}

// ---------- IA ----------
function predictLandingX() {
  // simulation de la trajectoire jusqu'à la hauteur de frappe, en tenant compte
  // des murs ET du rebond sur le sommet du filet (l'IA ne se fait plus surprendre
  // par une balle qui accroche la bande).
  let x = ball.x, y = ball.y, vx = ball.vx, vy = ball.vy;
  const hitY = GROUND_Y - 75;
  const minN = BALL_R + NET_W / 2 + 3;
  for (let i = 0; i < 400; i++) {
    vy += GRAV_BALL;
    x += vx; y += vy;
    if (x - BALL_R < 0) { x = BALL_R; vx = Math.abs(vx) * 0.9; }
    if (x + BALL_R > W) { x = W - BALL_R; vx = -Math.abs(vx) * 0.9; }
    // rebond sur le sommet du filet (cercle), miroir de updateBall
    const dxn = x - NET_X, dyn = y - NET_TOP, dn = Math.hypot(dxn, dyn);
    if (dn < minN && dn > 0) {
      const nx = dxn / dn, ny = dyn / dn;
      x = NET_X + nx * minN; y = NET_TOP + ny * minN;
      const dot = vx * nx + vy * ny;
      vx = (vx - 2 * dot * nx) * 0.75; vy = (vy - 2 * dot * ny) * 0.75;
    }
    if (y >= hitY && vy > 0) return x;
  }
  return x;
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
    aiErrTimer = 40;
  }

  if (superCharge[side] === 1 && me.superT <= 0 && !ball.frozen && state === "play") {
    const key = animOf(me).key;
    const onMySide = side === 0 ? ball.x < NET_X : ball.x > NET_X;
    const hitReach = god ? 100 : 72;
    const nearHit = Math.abs(ball.x - me.x) < hitReach && ball.y > me.y - 210 && ball.vy > -1;
    if (key === "vladou" || key === "trompette" || key === "micron") {
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

  // Anticiper plus tôt en V2 (sinon l'IA part trop tard et rate la retombée)
  const ballComing = side === 0
    ? (ball.x < NET_X + (GAMEPLAY_V2 ? 200 : 120) || (ball.vx < -0.3 && !ball.frozen && ball.x < NET_X + 280))
    : (ball.x > NET_X - (GAMEPLAY_V2 ? 200 : 120) || (ball.vx > 0.3 && !ball.frozen && ball.x > NET_X - 280));
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
    if (notReachingMe) {
      targetX = me.homeX;
    } else if (GAMEPLAY_V2) {
      // Sous la balle pour la réception (pas décalé « attaque » derrière)
      const under = side === 0 ? -3 : 3;
      targetX = land + under + aiErr * 0.25;
      // Si la balle est déjà dans le camp, tracker sa X actuelle en priorité
      const onSide = side === 0 ? ball.x < NET_X : ball.x > NET_X;
      if (onSide && ball.y < GROUND_Y - 40) {
        targetX = ball.x + under + aiErr * 0.15;
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
  const step = BLOB_SPEED * lvl.speedMul * animOf(me).speed;
  // Zone morte + hystérésis : évite l'oscillation gauche/droite (sprite qui tourne)
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
// Chaque IA connaît son camp (me.side) et son coéquipier ; celui qui est le
// plus proche du point de chute prend la balle, l'autre couvre sa zone (home).
// Pas de Smash Battle en 2v2 → logique de duel retirée ici.
function aiInput2v2(me, lvlOverride) {
  const lvl = lvlOverride || AI_LEVELS[aiLevel];
  const input = { left: false, right: false, jump: false, smash: false, super: false };
  const side = me.side;
  const back = side === 0 ? -1 : 1;               // « derrière la balle » côté son mur
  const half = 34;
  const minX = side === 0 ? half : NET_X + NET_W / 2 + half - 6;
  const maxX = side === 0 ? NET_X - NET_W / 2 - half + 6 : W - half;
  const mid = (minX + maxX) / 2;
  const onMySide = side === 0 ? ball.x < NET_X : ball.x > NET_X;
  const mate = activeBlobs.find(b => b !== me && b.side === side);

  // erreur de placement renouvelée régulièrement (seedée → déterministe)
  if (me._aiT === undefined) { me._aiT = 0; me._aiErr = 0; }
  if (--me._aiT <= 0) { me._aiErr = (rng() - 0.5) * 2 * lvl.err; me._aiT = 40; }

  // qui prend la balle : le plus proche du point de chute ; à égalité, l'avant
  // (dont le camp est le plus proche du filet) couvre les balles proches du filet.
  const land = predictLandingX();
  let chaser = me;
  if (mate && (onMySide || ball.frozen)) {
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
  } else if (onMySide && iChase) {
    // V2 : sous la balle pour réception ; V1 : décalage attaque derrière
    targetX = GAMEPLAY_V2
      ? (ball.y < GROUND_Y - 40 ? ball.x : land) + back * 3 + me._aiErr * 0.25
      : land + back * lvl.attack + me._aiErr;
  } else {
    targetX = me.homeX;                                    // couvrir sa zone
  }
  targetX = Math.max(minX + 6, Math.min(maxX - 6, targetX));

  const dx = targetX - me.x;
  const step2v2 = BLOB_SPEED * lvl.speedMul * animOf(me).speed;
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

  // technique SUPER : charge partagée par l'équipe (superCharge[side])
  if (iChase && superCharge[side] === 1 && me.superT <= 0 && !ball.frozen && state === "play") {
    const key = animOf(me).key;
    const nearHit = Math.abs(ball.x - me.x) < 72 && ball.y > me.y - 210 && ball.vy > -1;
    if (key === "vladou" || key === "trompette" || key === "micron") {
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

