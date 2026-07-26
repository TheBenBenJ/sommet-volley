// sommet-volley · rendu — punch caméra, boucle de rendu
"use strict";

// ---------- Smash Battle : affichage ----------
// éclairs entre les joueurs et la balle pendant le duel (purement visuel)
function drawBattleFx() {
  ctx.save();
  ctx.lineWidth = 2.5;
  for (const b of [blobL, blobR]) {
    ctx.strokeStyle = sideColor(b.side);
    ctx.beginPath();
    const x0 = b.x, y0 = b.y - 64;
    ctx.moveTo(x0, y0);
    const steps = 4;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      ctx.lineTo(
        x0 + (ball.x - x0) * t + (i < steps ? (Math.random() - 0.5) * 18 : 0),
        y0 + (ball.y - y0) * t + (i < steps ? (Math.random() - 0.5) * 18 : 0)
      );
    }
    ctx.stroke();
  }
  // halo pulsant autour de la balle figée
  ctx.strokeStyle = "rgba(255,204,0,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R + 6 + Math.sin(performance.now() / 50) * 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBattleHUD() {
  if (!battle.active) return;
  const blink = (typeof fxAllowFlash !== "function" || fxAllowFlash()) &&
    Math.sin(performance.now() / 70) > 0;
  ctx.save();
  const bx = W / 2 - 320, by = 112, bw = 640, bh = 132;
  ctx.fillStyle = "rgba(10,12,18,0.78)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 10);
  else ctx.rect(bx, by, bw, bh);
  ctx.fill();
  ctx.strokeStyle = blink ? "#ffcc00" : "rgba(255,204,0,0.45)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  uiLabel("Duel au filet", W / 2, by + 22, 10, blink ? "#ffcc00" : "#ff9800", 2.5, "center");
  ctx.textAlign = "center";
  ctx.fillStyle = UI.ink;
  ctx.font = "800 28px " + UI.sans;
  ctx.fillText("SMASH BATTLE", W / 2, by + 54);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "400 13px " + UI.sans;
  ctx.fillText("Martelez SAUT le plus vite possible", W / 2, by + 76);

  // jauges de martelage, dos à dos depuis le centre + gros chiffres
  const maxC = Math.max(10, battle.count[0], battle.count[1]);
  const barY = by + 90;
  for (const s of [0, 1]) {
    const w = 240 * (battle.count[s] / maxC);
    ctx.fillStyle = sideColor(s);
    ctx.fillRect(s === 0 ? W / 2 - 16 - w : W / 2 + 16, barY, w, 14);
    ctx.font = "800 18px " + UI.sans;
    ctx.fillText(String(battle.count[s]), s === 0 ? W / 2 - 280 : W / 2 + 280, barY + 13);
  }
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(W / 2 - 1.5, barY - 2, 3, 18);

  // barre de temps restant
  const tw = 360 * battle.t / BATTLE_TICKS;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(W / 2 - 180, by + bh - 14, 360, 5);
  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(W / 2 - tw / 2, by + bh - 14, tw, 5);
  ctx.restore();
}

// ---------- Rendu ----------
// ---------- Punch de caméra & ralenti (temps forts) ----------
// Le ZOOM est 100 % rendu : chaque client l'applique localement, sans jamais
// toucher la simulation → aucun risque de désynchronisation en ligne.
// Le RALENTI (timeScale) n'est activé QU'EN HORS-LIGNE, justement pour ne pas
// désynchroniser l'hôte et l'invité (qui doivent avancer au même rythme).
let camZoom = 1, camFX = W / 2, camFY = H / 2;
let timeScale = 1;

function render() {
  // repère logique 900×500 → pixels physiques (Hi-DPI)
  ctx.setTransform(viewScale, 0, 0, viewScale, 0, 0);
  // zones cliquables (souris) : celles de cette frame passent en "précédentes"
  // (utilisées pour le survol/clic), on repart de zéro pour en reconstruire
  // de nouvelles au fil du tracé — voir hit()/isHover() dans menus.js.
  menuHitboxesPrev = menuHitboxes; menuHitboxes = [];
  // décroissance des éléments purement visuels
  // ola sonore : rugissement quand la ferveur bondit (point/smash)
  if (crowdHype > prevCrowdHype + 15) crowdCheer(Math.min(1, crowdHype / 60));
  prevCrowdHype = crowdHype;
  if (crowdHype > 0) crowdHype -= 1;
  for (const e of emotes) if (e && e.t > 0) e.t--;
  if (state === "menu") { drawMenu(); return; }
  if (state === "soloMenu") { drawSoloMenu(); return; }
  if (state === "multiMenu") { drawMultiMenu(); return; }
  if (state === "options") { drawOptions(); return; }
  if (state === "optionsBinds") { drawOptionsBinds(); return; }
  if (state === "optionsComfort") { drawOptionsComfort(); return; }
  if (state === "aiDifficulty") { drawAiDifficulty(); return; }
  if (state === "gameModeSelect") { drawGameModeSelect(); return; }
  if (state === "teamFormat" || state === "bombFormat" || state === "flameFormat") {
    drawTeamFormat(); return;
  }
  if (state === "bombDuration") { drawBombDuration(); return; }
  if (state === "rules") { drawRules(); return; }
  if (state === "tutorialHelp") { drawTutorial(); return; }
  if (state === "credits") { drawCredits(); return; }
  if (state === "selectCharacter") { drawSelectCharacter(); return; }
  if (state === "selectTerrain") { drawSelectTerrain(); return; }
  if (state === "onlineMenu") { drawOnlineMenu(); return; }
  if (state === "matchmaking") { drawMatchmaking(); return; }
  if (state === "joinEntry") { drawJoinEntry(); return; }
  if (state === "hostWait") { drawHostWait(); return; }
  if (state === "hostLobby") { drawHostLobby(); return; }
  if (state === "connecting") { drawNetScreen("Connexion", "Recherche de la partie"); return; }
  if (state === "netWait") { drawNetScreen("Tu joues à droite", "En attente du lancement par l'hôte"); return; }
  if (state === "netError") { drawNetError(); return; }
  if (state === "storySelect") { drawStorySelect(); return; }
  if (state === "storyCharIntro") { drawStoryCharIntro(); return; }
  if (state === "storyMenu") { drawStoryHub(); return; }
  if (state === "storyActIntro") { drawStoryActIntro(); return; }
  if (state === "storyScene") { drawStoryScene(); return; }
  if (state === "storyEnding") { drawStoryEnding(); return; }
  if (state === "tournamentBracket") { drawTournamentBracket(); return; }
  if (state === "tournamentEnding") { drawTournamentEnding(); return; }

  // invité : le monde affiché vient de l'interpolation des instantanés
  if (online && netRole === "guest") guestApplyView();

  ctx.save();
  const shakeMul = typeof fxShakeMul === "function" ? fxShakeMul() : 1;
  if (shake > 0) {
    // tremblement d'écran sur les frappes puissantes et les points
    const amt = shake * shakeMul;
    if (amt > 0.15) ctx.translate((Math.random() - 0.5) * amt, (Math.random() - 0.5) * amt);
    shake *= 0.88;
    if (shake < 0.4) shake = 0;
  }
  // punch de caméra : uniquement Smash Battle (slowMo) ou point marqué
  let tz = 1;
  const camOk = typeof fxAllowCamPunch !== "function" || fxAllowCamPunch();
  if (camOk) {
    if (state === "play" && (ball.slowMo > 0 || powerWindup)) tz = 1.16;
    else if (state === "point") tz = 1.10;
  }
  camZoom += (tz - camZoom) * 0.12;
  if (camZoom > 1.002) {
    const fx = Math.max(W * 0.30, Math.min(W * 0.70, ball.x));
    const fy = Math.max(H * 0.32, Math.min(H * 0.72, ball.y));
    camFX += (fx - camFX) * 0.15;
    camFY += (fy - camFY) * 0.15;
    ctx.translate(camFX, camFY);
    ctx.scale(camZoom, camZoom);
    ctx.translate(-camFX, -camFY);
  }
  drawBackground();
  drawNet();
  const drawBallLayer = () => {
    if (online && netRole === "guest" && (guestBallSmoothX || guestBallSmoothY)) {
      ball.x += guestBallSmoothX; ball.y += guestBallSmoothY;
      drawBall();
      ball.x -= guestBallSmoothX; ball.y -= guestBallSmoothY;
    } else {
      drawBall();
    }
  };
  // dessin des joueurs (1 à 4). Le personnage prédit de l'invité est dessiné
  // avec le décalage de lissage, qui se résorbe après chaque réconciliation.
  const mine = (online && netRole === "guest") ? activeBlobs[mySlot] : null;
  for (const b of activeBlobs) {
    if (b === mine && (guestSmoothX || guestSmoothY)) {
      b.x += guestSmoothX; b.y += guestSmoothY;
      b.draw();
      b.x -= guestSmoothX; b.y -= guestSmoothY;
    } else {
      b.draw();
    }
  }
  // Mode Histoire : aura rouge « dopé » autour des blobs concernés (repère caméra)
  if (typeof storyDrawAuras === "function") storyDrawAuras();
  // Service inclus : balle au premier plan (sur les bras receive)
  drawBallLayer();
  if (typeof drawTutorialAimPreview === "function") drawTutorialAimPreview();
  if (battle.active) drawBattleFx();
  drawParticles();
  ctx.restore();
  drawHUD();
  drawBattleHUD();
  if (online && netConnected) drawNetHUD();
  if (typeof drawTutorialCoach === "function") drawTutorialCoach();
  drawBallMarker();

  if (state === "point") {
    drawPointCelebBanner();
    if (typeof storyDrawBark === "function") storyDrawBark();
  } else if (state === "gameover") {
    drawGameoverCeleb();
    if (typeof storyDrawGameoverTag === "function") storyDrawGameoverTag();
  }

  // Menu pause au-dessus de tout le HUD (solo, histoire, tournoi, en ligne).
  if (paused && typeof drawPauseMenu === "function") drawPauseMenu();
  else if (paused) overlay("PAUSE", "P / Échap pour reprendre");
}

/** Bandeau de point : message + indices Gagné / Perdu + hint skip. */
function drawPointCelebBanner() {
  const elapsed = POINT_MAX_WAIT - pointTimer;
  const canSkip = elapsed >= POINT_MIN_WAIT;
  const bounce = Math.sin((celebT || 0) / 8) * 3;
  const pw = Math.min(720, W - 40);
  const maxTextW = pw - 40;

  // Hauteur selon le message (1–2 lignes)
  let msgSize = 20, msgLines = [pointMsg];
  if (typeof uiWrapLines === "function") {
    ctx.font = "700 20px " + UI.display;
    let size = 20;
    while (size >= 13) {
      ctx.font = "700 " + size + "px " + UI.display;
      msgLines = uiWrapLines(pointMsg, maxTextW);
      const widest = msgLines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
      if (msgLines.length <= 2 && widest <= maxTextW + 0.5) { msgSize = size; break; }
      size -= 1;
      msgSize = size;
    }
    if (msgLines.length > 2) msgLines = msgLines.slice(0, 2);
  }
  const msgH = msgLines.length * msgSize * 1.18;
  const ph = Math.max(96, 52 + msgH + 28);
  const px = (W - pw) / 2, py = 36 + bounce;

  ctx.fillStyle = "rgba(12,20,42,0.45)";
  ctx.fillRect(0, 0, W, Math.min(H * 0.28, py + ph + 16));

  ctx.fillStyle = "rgba(255,246,232,0.95)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 18); else ctx.rect(px, py, pw, ph);
  ctx.fill();
  ctx.strokeStyle = "#1b1730"; ctx.lineWidth = 4; ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "700 12px " + UI.sans;
  ctx.fillStyle = UI.accent;
  ctx.fillText("POINT !", W / 2, py + 22);

  const titleCy = py + 28 + msgH * 0.55;
  if (typeof uiTitleBoxed === "function") {
    uiTitleBoxed(pointMsg, W / 2, titleCy, maxTextW, msgSize, {
      fill: UI.stroke, stroke: "rgba(255,246,232,0.95)", maxLines: 2, minSize: 13
    });
  } else {
    ctx.fillStyle = "#1b1730";
    ctx.font = "800 " + msgSize + "px " + UI.sans;
    ctx.fillText(pointMsg, W / 2, titleCy);
  }

  ctx.font = "700 12px " + UI.sans;
  ctx.fillStyle = canSkip ? "rgba(27,23,48,0.65)" : "rgba(27,23,48,0.35)";
  ctx.fillText(canSkip ? "Saut / Espace — continuer" : "…", W / 2, py + ph - 14);

  // Au-dessus de la bande score (pas superposé aux chiffres)
  const statusY = GROUND_Y - 8;
  const font = UI.display || UI.sans;
  ctx.font = "800 15px " + font;
  ctx.lineWidth = 4; ctx.lineJoin = "round";
  const winL = servingSide === 0;
  for (const [cx, won] of [[W * 0.22, winL], [W * 0.78, !winL]]) {
    const label = won ? "★ Gagné" : "Perdu…";
    ctx.strokeStyle = "rgba(12,20,42,0.85)";
    ctx.strokeText(label, cx, statusY);
    ctx.fillStyle = won ? "#7ed957" : "rgba(255,140,120,0.95)";
    ctx.fillText(label, cx, statusY);
  }
}

function drawGameoverCeleb() {
  const winSide = scores[0] > scores[1] ? 0 : 1;
  const ready = gameoverTimer <= 0;
  const sub = online
    ? ((winSide === (netRole === "host" ? 0 : (mode === "2v2" ? (mySlot < 2 ? 0 : 1) : 1)))
        ? "Gagné !" : "Perdu…")
    : tutorialMode
      ? (ready ? "Espace — retour au menu" : "Tutoriel terminé !")
      : (ready ? "Espace ou Entrée — menu" : "Gagné !");

  if (online) {
    overlay(pointMsg, sub);
    let line;
    if (!ready) {
      line = "Célébration…";
    } else if (mode === "2v2") {
      line = netRole === "host" ? "Entrée · rejouer    ·    Échap · quitter"
                                : "En attente de l'hôte…    ·    Échap · quitter";
    } else {
      line = "R · revanche";
      if (rematchMe) line += " ✓ toi";
      if (rematchPeer) line += " ✓ adversaire";
      line += "    ·    Échap · quitter";
    }
    // Sous la carte (pas dedans) pour ne pas chevaucher un titre long
    uiLabel(line, W / 2, H * 0.78, 12, ready ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)", 0.3, "center");
  } else {
    if (ready) hit(W / 2, H / 2, W, H, "Space");
    overlay(pointMsg, sub);
    ctx.textAlign = "center";
    ctx.font = "800 15px " + (UI.display || UI.sans);
    ctx.fillStyle = winSide === 0 ? "#7ed957" : "rgba(255,120,100,0.95)";
    ctx.fillText(winSide === 0 ? "★ Camp gauche" : "★ Camp droite", W / 2, H * 0.78);
  }
}


