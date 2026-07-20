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
  scorePop[side] = 48;
  shake = 10;
  servingSide = side;
  celebT = 0;
  sfxPoint(side);

  // le camp qui perd le point subit sa "punition" visuelle au maximum d'un
  // punition visuelle du camp perdant (ex. fureur Vladou), remise à zéro
  // au prochain service via Blob.reset() dans startRally().
  for (const b of activeBlobs) {
    if (b.side !== 1 - side) continue;
    const a = charOf(b);
    // Ego en béton (Trompette) : perdre un point charge aussi le SUPER
    if (a.egoCharge && superCharge[b.side] === 0) {
      superCharge[b.side] = 1;
      beep(700, 0.1, "square", 0.12, 0, 900);
    }
  }

  // En même temps (Micron) : swap seedé vitesse ↔ puissance
  for (const b of activeBlobs) {
    const a = charOf(b);
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
    if (b.side === side && charOf(b).clapDouble) { need = 2; break; }
  }
  if (streak[side] % need === 0 && superCharge[side] === 0) {
    superCharge[side] = 1;
    beep(700, 0.12, "square", 0.16, 0, 1050);
    beep(1050, 0.16, "square", 0.14, 0.1, 1500);
    superFlash = "SUPER PRÊT — " + sideLabel(side) + " !";
    const readyBlob = activeBlobs.find(b => b.side === side);
    if (readyBlob) {
      const a = charOf(readyBlob);
      superFlashSub = "Appuie sur SUPER — " + (a.superName || "technique") + " : " + (a.superDesc || "");
    } else {
      superFlashSub = "Appuie sur SUPER pour lancer ta technique.";
    }
    superFlashT = 90;
  }
  const name = sideLabel(side);
  pointMsg = reason ? reason + "  —  Point " + name : "Point pour " + name + " !";
  // réactions : public en délire, confettis, émotions + petits sauts de joie
  crowdHype = 90;
  const smashy = reason && (reason.indexOf("SMASH") >= 0 || reason.indexOf("crevée") >= 0);
  if (!noFx) {
    spawnConfetti(36, side === 0 ? W * 0.25 : W * 0.75);
    setEmote(side, "happy");
    setEmote(1 - side, smashy ? "wow" : "sad");
  }
  for (const b of activeBlobs) {
    b._celebHop = b.side === side ? (18 + (b === blobL || b === blobR ? 0 : 8)) : 0;
  }
  const lead = Math.abs(scores[0] - scores[1]);
  const winNeed = typeof matchWinScore === "function" ? matchWinScore() : WIN_SCORE;
  const winOk = tutorialMode
    ? scores[side] >= winNeed
    : (scores[side] >= winNeed && lead >= 2);
  if (winOk) {
    state = "gameover";
    gameoverTimer = GAMEOVER_MIN_WAIT;
    pointMsg = tutorialMode
      ? "Tutoriel terminé !  " + scores[0] + " – " + scores[1]
      : (name + " remporte le match " + scores[0] + " – " + scores[1] + " !");
    if (tutorialMode) markTutorialDone();
    if (!noFx) {
      spawnConfetti(120); spawnConfetti(40, W * 0.5);
      setEmote(side, "happy"); setEmote(1 - side, "sad");
      sfxMatchWin();
    }
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
  celebT = 0;
  // soft ownership : pas de balle fantôme au nouveau service
  if (typeof hostInvalidateGuestBall === "function") hostInvalidateGuestBall();
  state = "serve";
  serveCountdown = SERVE_COUNTDOWN_START;
}

/** Avance la célébration (anims victory/defeat, confettis, hops). */
function tickCelebration() {
  celebT++;
  for (const b of activeBlobs) {
    if (b._celebHop > 0) {
      b._celebHop--;
      if (b._celebHop === 0 && b.onGround) {
        b.vy = -9;
        b.onGround = false;
        b.jumpsUsed = 1;
      }
    }
  }
  // confettis qui continuent de tomber pendant la pose
  if (!noFx && celebT % 20 === 0) {
    const winSide = state === "gameover"
      ? (scores[0] > scores[1] ? 0 : 1)
      : servingSide;
    spawnConfetti(state === "gameover" ? 8 : 3, winSide === 0 ? W * 0.28 : W * 0.72);
  }
}

