// sommet-volley · points & score
"use strict";

// ---------- Points / score ----------
function awardPoint(side, reason) {
  if (state !== "play" && state !== "serve") return;
  // Invité soft-owner : ne touche pas au score local — l'hôte valide via `pt`.
  if (netDeferScore) {
    if (!pendingNetPoint) pendingNetPoint = { side, reason: reason || "", seq: ++netPtSeq };
    ballScoreLock = true;
    ball.vx = 0; ball.vy = 0;
    return;
  }
  ballScoreLock = false;
  scores[side]++;
  scorePop[side] = 20;
  shake = 8;
  servingSide = side;
  sfxPoint(side);

  // le camp qui perd le point subit sa "punition" visuelle au maximum d'un
  // punition visuelle du camp perdant (ex. fureur Vladou), remise à zéro
  // au prochain service via Blob.reset() dans startRally().
  for (const b of activeBlobs) {
    if (b.side !== 1 - side) continue;
    const a = animOf(b);
    if (a.angry) b.anger = ANGER_MAX;
    // Ego en béton (Trompette) : perdre un point charge aussi le SUPER
    if (a.egoCharge && superCharge[b.side] === 0) {
      superCharge[b.side] = 1;
      beep(700, 0.1, "square", 0.12, 0, 900);
    }
  }

  // En même temps (Micron) : swap seedé vitesse ↔ puissance
  for (const b of activeBlobs) {
    const a = animOf(b);
    if (!a.swapStats) continue;
    if (rng() < 0.5) {
      b.kitSpeed = a.power;
      b.kitPower = a.speed;
    } else {
      b.kitSpeed = a.speed;
      b.kitPower = a.power;
    }
  }

  // combo : points d'affilée → charge le SUPER
  streak[side]++; streak[1 - side] = 0;
  // Applaudissements (Houn) : SUPER en 2 points d'affilée
  let need = SUPER_NEED;
  for (const b of activeBlobs) {
    if (b.side === side && animOf(b).clapDouble) { need = 2; break; }
  }
  if (streak[side] % need === 0 && superCharge[side] === 0) {
    superCharge[side] = 1;
    beep(700, 0.12, "square", 0.16, 0, 1050);
    beep(1050, 0.16, "square", 0.14, 0.1, 1500);
    superFlash = "SUPER PRÊT — " + sideLabel(side) + " !"; superFlashT = 70;
  }
  const name = sideLabel(side);
  pointMsg = reason ? reason + "  —  Point " + name : "Point pour " + name + " !";
  // réactions : public en délire, confettis, émotions des joueurs
  crowdHype = 60;
  const smashy = reason && (reason.indexOf("SMASH") >= 0 || reason.indexOf("crevée") >= 0);
  if (!noFx) {
    spawnConfetti(22, side === 0 ? W * 0.25 : W * 0.75);
    setEmote(side, "happy");
    setEmote(1 - side, smashy ? "wow" : "sad");
  }
  const lead = Math.abs(scores[0] - scores[1]);
  if (scores[side] >= WIN_SCORE && lead >= 2) {
    state = "gameover";
    pointMsg = name + " remporte le match " + scores[0] + " – " + scores[1] + " !";
    if (!noFx) { spawnConfetti(90); setEmote(side, "happy"); sfxMatchWin(); }
  } else {
    state = "point";
    pointTimer = POINT_MAX_WAIT;
  }
}

function startRally() {
  for (const b of activeBlobs) b.reset();
  if (typeof superEffects !== "undefined") superEffects.length = 0;
  ball.reset(servingSide);
  battle.active = false;
  battle.t = 0;
  battle.count = [0, 0];
  battle.prevJump = [false, false];
  battle.cooldown = 0;
  bombTimer = bombTime; // la mèche ne se consume qu'une fois la balle en jeu
  pendingNetPoint = null;
  ballScoreLock = false;
  // soft ownership : pas de balle fantôme au nouveau service
  if (typeof hostInvalidateGuestBall === "function") hostInvalidateGuestBall();
  state = "serve";
  serveCountdown = 69; // 3·2·1 (63, ~0.35s chacun) + "GO !" (6)
}

