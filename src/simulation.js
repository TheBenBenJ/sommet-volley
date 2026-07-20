// sommet-volley · simulation — Smash Battle, stepGame, techniques SUPER
"use strict";

// ---------- Smash Battle : logique ----------
function canStartBattle() {
  // En ligne : JAMAIS de Smash Battle. Le duel fige la balle ~1,3 s au filet —
  // avec la latence, ça se lit comme un « blocage réseau » (balle coincée).
  // Hors-ligne / même clavier : le duel reste actif (c'est le fun du mode local).
  if (typeof online !== "undefined" && online) return false;
  return !bombMode && // pas de duel au filet en mode bombe (la mèche tourne !)
         state === "play" && !ball.frozen && !ball.popped && ball.heldBy < 0 &&
         battle.cooldown === 0 &&
         !blobL.onGround && !blobR.onGround &&
         Math.abs(blobL.x - NET_X) < BATTLE_NET_DIST &&
         Math.abs(blobR.x - NET_X) < BATTLE_NET_DIST &&
         Math.abs(ball.x - NET_X) < BATTLE_BALL_DIST &&
         ball.y > -40 && ball.y < NET_TOP + 60;
}

function startBattle(inL, inR) {
  battle.active = true;
  battle.t = BATTLE_TICKS;
  battle.count = [0, 0];
  battle.prevJump = [!!inL.jump, !!inR.jump];
  shake = 6;
  sfxBattleStart();
}

function stepBattle(inL, inR) {
  // seuls les fronts montants comptent : il faut MARTELER, pas rester appuyé
  const ins = [inL, inR];
  for (const s of [0, 1]) {
    if (ins[s].jump && !battle.prevJump[s]) {
      battle.count[s]++;
      beep(600 + battle.count[s] * 18, 0.03, "square", 0.07);
    }
    battle.prevJump[s] = !!ins[s].jump;
  }
  if (--battle.t > 0) return;

  // résolution du duel
  battle.active = false;
  battle.cooldown = BATTLE_COOLDOWN;
  let winner;
  if (battle.count[0] > battle.count[1]) winner = 0;
  else if (battle.count[1] > battle.count[0]) winner = 1;
  else winner = rng() < 0.5 ? 0 : 1; // égalité parfaite : tirage seedé
  const dir = winner === 0 ? 1 : -1;

  // smash destructeur : la balle plonge en flammes dans le camp adverse
  ball.x = NET_X + dir * (BALL_R + NET_W);
  ball.y = NET_TOP - 30;
  ball.vx = dir * SMASH_VX;
  ball.vy = SMASH_VY;
  ball.smash = 60;
  ball.slowMo = 60; // ralenti / zoom réservés au duel au filet
  ball.spin = dir * 0.3;
  ball.lastTouchSide = winner;
  ball.lastTouchTick = tick;
  ball.touches[winner] = 1;
  ball.touches[1 - winner] = 0;

  // le perdant est projeté loin du filet
  const winnerBlob = winner === 0 ? blobL : blobR;
  const loser = winner === 0 ? blobR : blobL;
  loser.x += dir * 45;
  loser.vy = -5;
  loser.onGround = false;
  if (typeof setCharPose === "function") {
    setCharPose(winnerBlob, "smash", 36);
    setCharPose(loser, "panic", 40);
  }

  shake = 14;
  sfxBattleEnd();
}

// ---------- Simulation ----------
// stepGame(inL, inR) est le cœur déterministe du jeu : mêmes entrées + même
// graine = même partie. C'est l'unité de synchronisation du futur mode en ligne.
// ---------- Techniques signature (SUPER) ----------
function superReadyFor(blob) {
  return state === "play" && superCharge[blob.side] === 1 && blob.superT <= 0 ;
}

function maybeActivateSuper(blob, input) {
  const pressed = input.super && !blob.prevSuper;
  blob.prevSuper = !!input.super;
  if (!pressed || !superReadyFor(blob)) return;
  const a = charOf(blob);
  superCharge[blob.side] = 0;
  blob.superKind = a.key;
  blob.superT = SUPER_DUR[a.key] || 50;
  superFlash = a.superName || (a.name + " !");
  superFlashSub = a.superDesc || "";
  superFlashT = 110;
  shake = Math.max(shake, 7);
  crowdHype = Math.max(crowdHype, 45);
  spawnSuperBurst(blob);
  superSound(a.key);
  if (a.key === "vladou" || a.key === "yogi") {
    // Hiver Général / Méditation : gèle le camp adverse
    superEffects.push({ kind: "ice", side: 1 - blob.side, t: blob.superT });
  } else if (a.key === "trompette" || a.key === "panda" || a.key === "jair") {
    // Le Mur / Grande Muraille / Déforestation
    superEffects.push({ kind: "wall", side: 1 - blob.side, t: blob.superT });
  } else if (a.key === "micron") {
    // 49.3 : frappes immunisées au smash adverse (voir trySmashBall)
    blob.superSmash = false;
  } else if (a.key === "houn" || a.key === "sultan") {
    // Batterie AA / Séisme : interdit de sauter au camp adverse
    superEffects.push({ kind: "noground", side: 1 - blob.side, t: blob.superT });
  }
}

function tickSuper(blob) {
  if (blob.superT > 0 && --blob.superT <= 0) { blob.superKind = ""; blob.superSmash = false; }
}

function superSound(key) {
  if (key === "vladou") { sfxVladouSuper(); return; }
  beep(520, 0.08, "square", 0.14, 0, 800);
  beep(800, 0.1, "square", 0.13, 0.08, 1150);
  if (key === "trompette") { beep(400, 0.1, "square", 0.14); beep(600, 0.14, "square", 0.12, 0.08); }
  if (key === "micron") beep(880, 0.18, "sine", 0.14, 0.05, 440);
  if (key === "houn") {
    beep(200, 0.06, "square", 0.14); beep(280, 0.08, "square", 0.12, 0.05);
    beep(160, 0.12, "triangle", 0.16, 0.1);
  }
}

// ---------- Mode Bombe : logique ----------
// L'explosion (mèche à zéro OU balle au sol) : le camp où se trouve la bombe
// perd le point → l'adversaire marque. Même formule que la chute classique :
// ball.x < NET_X ? 1 : 0  = le camp qui GAGNE le point.
function bombBlast(x, y) {
  spawnBoom(x, y);
  spawnBoom(x, y - 8);   // gerbe plus dense qu'un simple smash
  shake = Math.max(shake, 18);
  bombFlash = 1;         // éclair plein écran (visuel, se résorbe au rendu)
  sfxBombBlast();
}

// décompte de la mèche + explosion en fin de compte. Appelé en fin de stepGame,
// donc uniquement quand la balle est réellement en jeu et déterministe.
function tickBomb() {
  if (state !== "play" || ball.frozen || ball.popped) return;
  if (bombTimer > 0) {
    bombTimer--;
    // bips d'alerte : une fois par seconde, puis plus serrés dans les 3 dernières
    if (bombTimer > 180) { if (bombTimer % 60 === 0) sfxBombTick(); }
    else if (bombTimer % 20 === 0) sfxBombTick();
  }
  if (bombTimer <= 0) {
    bombBlast(ball.x, ball.y);
    awardPoint(ball.x < NET_X ? 1 : 0, "💥 BOUM !");
  }
}

// stepGame(inL, inR)                    → 1v1 / online
// stepGame(null, null, ins)             → 2v2
// stepGame(inL, inR, null, {skipBall})  → online 1v1 : corps seuls (balle chez l'invité)
function stepGame(inL, inR, ins, opts) {
  opts = opts || {};
  const skipBall = !!opts.skipBall;
  tick++;
  stepWeather();
  if (superFlashT > 0) superFlashT--;
  if (typeof mapEventFlashT !== "undefined" && mapEventFlashT > 0) mapEventFlashT--;
  if (battle.cooldown > 0) battle.cooldown--;
  if (battle.active && !ins) {
    stepBattle(inL, inR);
    return; // le monde est figé pendant le duel (1v1 uniquement)
  }
  // IMPORTANT : tester l'ÉTAT (pas seulement le compteur). En soft ownership,
  // skipBall laisse serveCountdown figé côté hôte ; sans le test d'état on
  // resterait coincé dans cette branche une fois en "play".
  if (state === "serve" && serveCountdown > 0) {
    // pendant le décompte : on peut se déplacer mais pas sauter ni servir
    if (ins) {
      activeBlobs.forEach((b, i) => b.update({ left: ins[i].left, right: ins[i].right, jump: false }));
    } else {
      blobL.update({ left: inL.left, right: inL.right, jump: false });
      blobR.update({ left: inR.left, right: inR.right, jump: false });
    }
    // skipBall : le propriétaire distant gère décompte + balle
    if (!skipBall) {
      serveCountdown--;
      if (GAMEPLAY_V2 && ball.inHands) attachBallToServerHands();
      else ball.y += Math.sin(tick / 18) * 0.3;
    }
  } else if (ins) {
    // 2v2 : pas de Smash Battle (duel à 2), on met à jour les 4 joueurs
    activeBlobs.forEach((b, i) => maybeActivateSuper(b, ins[i]));
    activeBlobs.forEach((b, i) => b.update(ins[i]));
    if (!skipBall) updateBall();
    activeBlobs.forEach(b => tickSuper(b));
  } else {
    // déclenchement des techniques signature avant le mouvement
    maybeActivateSuper(blobL, inL);
    maybeActivateSuper(blobR, inR);
    blobL.update(inL);
    blobR.update(inR);
    // déclenchement du duel : les deux en l'air au filet, balle proche
    if (!skipBall && canStartBattle()) startBattle(inL, inR);
    else if (!skipBall) updateBall();
    tickSuper(blobL);
    tickSuper(blobR);
  }
  if (bombMode) tickBomb();
  if (typeof tickSuperEffects === "function") tickSuperEffects();
  if (typeof stepMapEvent === "function") stepMapEvent();
  if (state === "serve" && !ball.frozen) state = "play";
}

function localInputs(side) {
  // 1v1 local à DEUX humains : la manette va au côté assigné (padForSide —
  // clavier vs manette, ou une manette chacun). Sinon (solo vs IA, 2v2 local),
  // comportement historique : manette n° i → joueur i (l'humain est en 0).
  const twoHumans = !vsAI && !online && mode === "1v1";
  const pad = twoHumans ? padForSide(side) : padGameInput(side);
  // Gameplay V2 : contact = cloche · S/F ou ↓// = smash · E / Shift = SUPER
  const raw = side === 0 ? {
    left:  !!keys["KeyA"] || pad.left,
    right: !!keys["KeyD"] || pad.right,
    jump:  !!(keys["KeyW"] || keys["Space"]) || pad.jump,
    smash: !!(keys["KeyS"] || keys["KeyF"]) || !!pad.smash,
    super: !!keys["KeyE"] || pad.super,
    up:    !!pad.up,
    down:  !!pad.down,
    ax:    pad.ax || 0,
    ay:    pad.ay || 0
  } : {
    left:  !!keys["ArrowLeft"] || pad.left,
    right: !!keys["ArrowRight"] || pad.right,
    jump:  !!keys["ArrowUp"] || pad.jump,
    smash: !!(keys["ArrowDown"] || keys["Slash"]) || !!pad.smash,
    super: !!keys["ShiftRight"] || pad.super,
    up:    !!pad.up,
    down:  !!pad.down,
    ax:    pad.ax || 0,
    ay:    pad.ay || 0
  };
  return xInput(side, activeBlobs[side], raw);
}

/** Pendant point / fin de match : laisse retomber les joueurs en l'air. */
function settleAirborneBlobs() {
  for (const b of activeBlobs) {
    if (b.onGround) continue;
    b.vx = 0;
    b.dispVx = 0;
    b.vy += GRAV_BLOB;
    b.y += b.vy;
    if (b.y >= GROUND_Y) {
      b.y = GROUND_Y;
      b.vy = 0;
      b.onGround = true;
      b.jumpsUsed = 0;
      b.squash = Math.max(b.squash, 4);
    }
  }
}

function update() {
  if (online) { netUpdate(); return; }
  if (paused) return;

  if (state === "point" || state === "gameover") {
    settleAirborneBlobs();
    if (typeof tickCelebration === "function") tickCelebration();
    if (state === "point") {
      pointTimer--;
      const elapsed = POINT_MAX_WAIT - pointTimer;
      if ((elapsed >= POINT_MIN_WAIT && pointAdvanceRequested()) || pointTimer <= 0) startRally();
    } else if (gameoverTimer > 0) {
      gameoverTimer--;
    }
    return;
  }
  if (state !== "play" && state !== "serve") return;

  if (mode === "2v2") {
    // toi = blobL (activeBlobs[0]) ; les trois autres sont pilotés par l'IA
    const ins = activeBlobs.map((b, i) => i === 0 ? localInputs(0) : aiInput2v2(b));
    stepGame(null, null, ins);
    return;
  }
  const inL = localInputs(0);
  const inR = vsAI ? aiInput() : localInputs(1);
  stepGame(inL, inR);
  if (typeof tickTutorialCoach === "function") tickTutorialCoach();
}

