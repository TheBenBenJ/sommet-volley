// sommet-volley · instantanés (sérialisation d'état pour le réseau)
"use strict";

// ---------- Instantanés (préparation du mode en ligne) ----------
// L'hôte envoie périodiquement getSnapshot() ; l'invité applique les champs
// discrets + interpole les poses (voir net.js). Voir MULTIJOUEUR.md.

// Soft ownership : la balle est-elle assez profondément dans le camp droit
// pour que l'invité la simule ? (hôte exclusive près du filet)
function ballInGuestOwnZone(x) {
  return x > NET_X + GUEST_BALL_MARGIN;
}

function packBallState(owning) {
  return {
    x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, a: ball.angle,
    f: ball.frozen ? 1 : 0, p: ball.popped ? 1 : 0, sm: ball.smash | 0,
    ih: ball.inHands ? 1 : 0, tg: ball.tossGrace | 0,
    sal: ball.serveAimLock ? 1 : 0,
    sf: ball.serveFlight ? 1 : 0,
    lts: ball.lastTouchSide, ltt: ball.lastTouchTick,
    t0: ball.touches[0], t1: ball.touches[1],
    hb: ball.heldBy | 0, ht: ball.holdT | 0, ch: ball.chargeT | 0,
    aa: ball.aimAngle || 0, sa: ball.shotArmed ? 1 : 0,
    rs: rngSeed,
    sc: serveCountdown,
    // own:1 = invité simule vraiment (l'hôte n'accepte QUE ça — évite qu'un
    // paquet de sortie / rally précédent fasse « tomber » la balle à l'arrivée)
    own: owning ? 1 : 0,
    // point différé renvoyé jusqu'à validation hôte (canal non fiable)
    pt: pendingNetPoint ? [pendingNetPoint.side, pendingNetPoint.reason, pendingNetPoint.seq | 0] : null
  };
}

function applyBallState(b) {
  if (!b) return;
  ball.x = b.x; ball.y = b.y; ball.vx = b.vx; ball.vy = b.vy;
  ball.angle = b.a !== undefined ? b.a : ball.angle;
  ball.frozen = !!b.f; ball.popped = !!b.p;
  ball.smash = b.sm || 0;
  if (b.ih !== undefined) ball.inHands = !!b.ih;
  if (b.tg !== undefined) ball.tossGrace = b.tg | 0;
  if (b.sal !== undefined) ball.serveAimLock = !!b.sal;
  if (b.sf !== undefined) ball.serveFlight = !!b.sf;
  ball.lastTouchSide = b.lts;
  ball.lastTouchTick = b.ltt !== undefined ? b.ltt : -999;
  ball.touches = [b.t0 | 0, b.t1 | 0];
  if (b.hb !== undefined) ball.heldBy = b.hb;
  if (b.ht !== undefined) ball.holdT = b.ht;
  if (b.ch !== undefined) ball.chargeT = b.ch;
  if (b.aa !== undefined) ball.aimAngle = b.aa;
  if (b.sa !== undefined) ball.shotArmed = !!b.sa;
  if (b.rs !== undefined) rngSeed = b.rs;
  if (b.sc !== undefined && state === "serve") serveCountdown = b.sc;
}

function getSnapshot() {
  return {
    state, servingSide, pointTimer, pointMsg, tick, serveCountdown,
    scores: [scores[0], scores[1]],
    rngSeed, weather, weatherTimer, bombMode, bombTimer,
    mapEventsQuiet: mapEventsQuiet ? 1 : 0,
    mapEvent: {
      p: mapEvent.phase, t: mapEvent.t | 0, tm: mapEvent.timer | 0,
      x: mapEvent.x, y: mapEvent.y, vx: mapEvent.vx, vy: mapEvent.vy,
      h: mapEvent.hit ? 1 : 0,
      lh: mapEvent.lastHitTick | 0,
      cx: mapEvent.cartX || 0, cd: mapEvent.cartDir || 1,
      zx: mapEvent.zoneX || 0, zw: mapEvent.zoneW || 150,
      balls: (mapEvent.balls || []).map(b => ({
        x: b.x, y: b.y, vx: b.vx, vy: b.vy, h: b.hit ? 1 : 0, d: b.dead ? 1 : 0
      }))
    },
    streak: [streak[0], streak[1]], superCharge: [superCharge[0], superCharge[1]],
    battle: { active: battle.active, t: battle.t,
              count: [battle.count[0], battle.count[1]],
              prevJump: [battle.prevJump[0], battle.prevJump[1]],
              cooldown: battle.cooldown },
    ball: {
      x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, angle: ball.angle,
      frozen: ball.frozen, popped: ball.popped, smash: ball.smash,
      inHands: !!ball.inHands, tossGrace: ball.tossGrace | 0,
      serveAimLock: !!ball.serveAimLock,
      serveFlight: !!ball.serveFlight,
      lastTouchSide: ball.lastTouchSide, lastTouchTick: ball.lastTouchTick,
      touches: [ball.touches[0], ball.touches[1]],
      heldBy: ball.heldBy, holdT: ball.holdT, chargeT: ball.chargeT,
      aimAngle: ball.aimAngle, shotArmed: !!ball.shotArmed
    },
    blobs: activeBlobs.map(b => ({
      x: b.x, y: b.y, vx: b.vx, vy: b.vy, onGround: b.onGround,
      walkPhase: b.walkPhase, squash: b.squash,
      charId: b.charId, scramble: b.scramble,
      superT: b.superT, superKind: b.superKind, superSmash: b.superSmash,
      poseAnim: b.poseAnim || "", poseT: b.poseT | 0, poseDur: b.poseDur | 0,
      battleStunT: b.battleStunT | 0
    }))
  };
}

function applySnapshot(s) {
  state = s.state; servingSide = s.servingSide;
  pointTimer = s.pointTimer; pointMsg = s.pointMsg; tick = s.tick; serveCountdown = s.serveCountdown || 0;
  scores[0] = s.scores[0]; scores[1] = s.scores[1];
  rngSeed = s.rngSeed;
  if (s.streak) { streak[0] = s.streak[0]; streak[1] = s.streak[1]; }
  if (s.superCharge) { superCharge[0] = s.superCharge[0]; superCharge[1] = s.superCharge[1]; }
  if (s.weather !== undefined) { weather = s.weather; weatherTimer = s.weatherTimer; }
  if (s.bombMode !== undefined) { bombMode = s.bombMode; bombTimer = s.bombTimer || 0; }
  if (s.mapEventsQuiet !== undefined) mapEventsQuiet = !!s.mapEventsQuiet;
  if (s.mapEvent) {
    mapEvent.phase = s.mapEvent.p || "idle";
    mapEvent.t = s.mapEvent.t | 0;
    mapEvent.timer = s.mapEvent.tm | 0;
    mapEvent.x = s.mapEvent.x || 0; mapEvent.y = s.mapEvent.y || 0;
    mapEvent.vx = s.mapEvent.vx || 0; mapEvent.vy = s.mapEvent.vy || 0;
    mapEvent.hit = !!s.mapEvent.h;
    if (s.mapEvent.lh !== undefined) mapEvent.lastHitTick = s.mapEvent.lh | 0;
    mapEvent.cartX = s.mapEvent.cx || 0;
    mapEvent.cartDir = s.mapEvent.cd === -1 ? -1 : 1;
    mapEvent.zoneX = s.mapEvent.zx || 0;
    mapEvent.zoneW = s.mapEvent.zw || 150;
    mapEvent.balls = (s.mapEvent.balls || []).map(b => ({
      x: b.x, y: b.y, vx: b.vx, vy: b.vy, hit: !!b.h, dead: !!b.d
    }));
  }
  ball.x = s.ball.x; ball.y = s.ball.y;
  ball.vx = s.ball.vx; ball.vy = s.ball.vy;
  ball.angle = s.ball.angle;
  ball.frozen = s.ball.frozen; ball.popped = !!s.ball.popped;
  ball.smash = s.ball.smash || 0;
  if (s.ball.inHands !== undefined) ball.inHands = !!s.ball.inHands;
  if (s.ball.tossGrace !== undefined) ball.tossGrace = s.ball.tossGrace | 0;
  if (s.ball.serveAimLock !== undefined) ball.serveAimLock = !!s.ball.serveAimLock;
  if (s.ball.serveFlight !== undefined) ball.serveFlight = !!s.ball.serveFlight;
  ball.lastTouchSide = s.ball.lastTouchSide;
  ball.lastTouchTick = s.ball.lastTouchTick !== undefined ? s.ball.lastTouchTick : -999;
  ball.touches = [s.ball.touches[0], s.ball.touches[1]];
  if (s.ball.heldBy !== undefined) ball.heldBy = s.ball.heldBy;
  if (s.ball.holdT !== undefined) ball.holdT = s.ball.holdT;
  if (s.ball.chargeT !== undefined) ball.chargeT = s.ball.chargeT;
  if (s.ball.aimAngle !== undefined) ball.aimAngle = s.ball.aimAngle;
  if (s.ball.shotArmed !== undefined) ball.shotArmed = !!s.ball.shotArmed;
  if (s.battle) {
    battle.active = s.battle.active; battle.t = s.battle.t;
    battle.count = [s.battle.count[0], s.battle.count[1]];
    battle.prevJump = [!!s.battle.prevJump[0], !!s.battle.prevJump[1]];
    battle.cooldown = s.battle.cooldown;
  }
  activeBlobs.forEach((b, i) => {
    if (!s.blobs[i]) return;
    b.x = s.blobs[i].x; b.y = s.blobs[i].y;
    b.vx = s.blobs[i].vx; b.vy = s.blobs[i].vy;
    b.onGround = s.blobs[i].onGround;
    b.walkPhase = s.blobs[i].walkPhase; b.squash = s.blobs[i].squash;
    if (s.blobs[i].charId !== undefined) b.charId = s.blobs[i].charId;
    b.scramble = s.blobs[i].scramble || 0;
    b.superT = s.blobs[i].superT || 0; b.superKind = s.blobs[i].superKind || ""; b.superSmash = !!s.blobs[i].superSmash;
    if (s.blobs[i].poseAnim !== undefined) b.poseAnim = s.blobs[i].poseAnim || "";
    if (s.blobs[i].poseT !== undefined) b.poseT = s.blobs[i].poseT | 0;
    if (s.blobs[i].poseDur !== undefined) b.poseDur = s.blobs[i].poseDur | 0;
    b.battleStunT = s.blobs[i].battleStunT | 0;
  });
}
