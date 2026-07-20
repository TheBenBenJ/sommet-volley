// sommet-volley · menus & écrans de sélection
"use strict";

// ---------- Écrans de menu et de sélection ----------
function handleMenuKeys(code, key) {
  // pavé numérique équivalent au clavier principal dans tous les menus
  // (sélection de perso/terrain, difficulté, etc.) — sauf en saisie de code
  // de partie (joinEntry gère déjà Numpad lui-même, plus bas).
  if (state !== "joinEntry" && /^Numpad[0-9]$/.test(code)) code = "Digit" + code.slice(-1);
  if (code === "NumpadEnter") code = "Enter"; // Entrée du pavé numérique = Entrée
  // (c'était le « je remplis le code et rien ne se passe » des claviers à pavé)

  // M coupe le son — sauf pendant la saisie d'un code (M peut en faire partie).
  // code (position physique, norme QWERTY) ≠ lettre imprimée sur un clavier
  // AZERTY : la touche M y est déplacée à l'emplacement "Semicolon" (celle du
  // point-virgule QWERTY), et "KeyM" y correspond à la virgule. On accepte les
  // deux pour que "M" fonctionne, qu'on soit en QWERTY ou en AZERTY.
  if ((code === "KeyM" || code === "Semicolon") && state !== "joinEntry") { muted = !muted; saveSettings(); return; }
  if (code === "KeyN" && state !== "joinEntry") { musicOn = !musicOn; saveSettings(); return; }

  // clic sur l'icône/le libellé "VOLUME" (voir drawVolumeControl) : coupe/
  // rétablit le son, comme M — indépendant du niveau réglé sur les crans.
  if (code === "MuteToggle") { muted = !muted; saveSettings(); return; }

  // clic sur un cran du slider de volume (voir drawVolumeControl) : règle le
  // niveau et réactive le son au passage, où qu'on soit dans les menus.
  const volMatch = /^Vol([1-5])$/.exec(code);
  if (volMatch) { muted = false; setVolume(Number(volMatch[1]) / 5); return; }

  if (state === "menu") {
    // Écran d'accueil : 3 grandes catégories, chacune débouche sur ses propres
    // sous-choix (difficulté, mode de jeu…) au lieu d'un mur de 8 options.
    if (code === "Digit1") { pendingMode = { vsAI: true }; state = "aiDifficulty"; } // Solo vs IA — pendingMode neuf : évite qu'un ancien "bomb" traîne dans le compteur d'étapes
    if (code === "Digit2") { pendingMode = { vsAI: false }; state = "gameModeSelect"; } // Multijoueur local
    if (code === "Digit3") {                                                  // Jouer en ligne
      if (typeof Peer === "undefined") {
        netErrorMsg = "PeerJS n'a pas pu être chargé — le mode en ligne nécessite Internet.";
        state = "netError";
      } else {
        state = "onlineMenu";
      }
    }
    if (code === "KeyR") state = "rules";
    if (code === "KeyC") state = "credits";

  } else if (state === "credits") {
    if (code === "Escape" || code === "Enter" || code === "Space") goMenu();

  } else if (state === "aiDifficulty") {
    // Étape 2 (Solo vs IA) : la difficulté choisie amorce pendingMode, complété
    // ensuite par le mode de jeu dans "gameModeSelect".
    const lvl = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code];
    if (lvl !== undefined) { pendingMode = { vsAI: true, aiLevel: lvl }; state = "gameModeSelect"; }
    if (code === "Escape") goMenu();

  } else if (state === "gameModeSelect") {
    // Étape finale avant le choix de perso : type de partie. Le choix d'équipe
    // (2v2 : toi + IA coéquipière vs 2 IA, en solo ; ou 2v2 hébergé, en ligne)
    // n'a de sens QUE là où deux formats existent réellement — pas en
    // multijoueur local, qui ne prend en charge que le 1v1 (voir
    // update()/aiInput2v2 dans ai.js/simulation.js, et hostStartMatch2v2
    // dans net.js). La Bombe est un MODIFICATEUR, pas un format à part :
    // elle pose sa propre sous-question 1v1/équipes quand celle-ci a un sens
    // (voir "bombFormat"), sinon (local) va direct à la durée de mèche.
    const teamChoice = pendingMode.vsAI || pendingMode.online;
    if (teamChoice) {
      if (code === "Digit1") { startCharacterSelect(); }                       // Classique (1v1)
      if (code === "Digit2") { setTeamMode(true); startCharacterSelect(); }     // En équipes (2v2)
      if (code === "Digit3") { pendingMode.bomb = true; state = "bombFormat"; } // Bombe -> 1v1 ou équipes ?
    } else {
      if (code === "Digit1") { startCharacterSelect(); }                       // Classique (1v1)
      if (code === "Digit2") { pendingMode.bomb = true; state = "bombDuration"; } // Bombe (1v1 uniquement en local)
      // clavier VS manette : bascule le côté piloté par la manette unique
      if (code === "KeyG" && padConnected) {
        setPadSideLocal(padSideLocal === 1 ? 0 : 1);
        beep(padSideLocal === 1 ? 620 : 440, 0.06, "square", 0.08);
      }
    }
    if (code === "Escape") {
      if (pendingMode.online) state = "onlineMenu";
      else if (pendingMode.vsAI) state = "aiDifficulty";
      else goMenu();
    }

  } else if (state === "bombFormat") {
    // sous-question de la Bombe (uniquement quand le 1v1 ET les équipes sont
    // tous deux possibles — solo vs IA ou hébergement en ligne)
    if (code === "Digit1") { state = "bombDuration"; }                      // Bombe 1v1
    if (code === "Digit2") { setTeamMode(true); state = "bombDuration"; }   // Bombe en équipes
    if (code === "Escape") { pendingMode.bomb = false; state = "gameModeSelect"; }

  } else if (state === "bombDuration") {
    // durée de la mèche, commune à tous les modes (offline & hôte online)
    const d = { Digit1: 0, Digit2: 1, Digit3: 2 }[code];
    if (d !== undefined) { pendingMode.bombTime = BOMB_DURATIONS[d].ticks; startCharacterSelect(); }
    if (code === "Escape") state = (pendingMode.vsAI || pendingMode.online) ? "bombFormat" : "gameModeSelect";

  } else if (state === "rules") {
    if (code === "Escape" || code === "Enter" || code === "Space" || code === "KeyR") goMenu();

  } else if (state === "onlineMenu") {
    if (code === "Digit1") { pendingMode = { online: true }; state = "gameModeSelect"; } // Créer une partie -> format
    if (code === "Digit2") { joinCode = ""; state = "joinEntry"; }                        // Rejoindre avec un code
    if (code === "Escape") goMenu();

  } else if (state === "hostLobby") {
    if ((code === "Enter" || code === "Space") && guests.length >= 1) hostStartMatch2v2();
    if (code === "Escape") { quitOnline(); }

  } else if (state === "joinEntry") {
    if (code === "Escape") { state = "onlineMenu"; return; }
    if (code === "Backspace") { joinCode = joinCode.slice(0, -1); return; }
    if (code === "Enter" && joinCode.length === CODE_LEN) {
      initGuestPeer(joinCode);
      state = "connecting";
      return;
    }
    // chiffres : par touche physique (fiable sur AZERTY) ; lettres : par e.key
    let ch = null;
    if (/^(Digit|Numpad)[0-9]$/.test(code)) ch = code.slice(-1);
    else if (key && key.length === 1) ch = key.toUpperCase();
    if (ch && CODE_ALPHABET.includes(ch) && joinCode.length < CODE_LEN) joinCode += ch;

  } else if (state === "hostWait" || state === "connecting" || state === "netWait") {
    if (code === "Escape") { teardownNet(); state = "onlineMenu"; }

  } else if (state === "netError") {
    if (code === "Escape" || code === "Enter" || code === "Space") goMenu();

  } else if (state === "selectCharacter") {
    const slot = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4, Digit6: 5, Digit7: 6 }[code];
    const vis = characterIndices();
    const n = slot !== undefined && slot < vis.length ? vis[slot] : undefined;
    if (n !== undefined && !takenCharacterSet().has(n)) {
      (selPlayer === 0 ? blobL : blobR).charId = n;
      if (pendingMode.online) {
        if (netRole === "guest") {
          // l'invité a choisi : on prévient l'hôte, qui lancera la partie
          sendRel({ t: "hello", charId: n });
          state = "netWait";
        } else {
          state = "selectTerrain"; // l'hôte choisit aussi le terrain
        }
      } else if (selPlayer === 0 && !pendingMode.vsAI) {
        selPlayer = 1; // au joueur vert de choisir
      } else {
        if (pendingMode.vsAI) blobR.charId = randomCharacterIdx([blobL.charId]);
        state = "selectTerrain";
      }
    }
    if (code === "Escape") {
      if (pendingMode.online && netRole === "guest") quitOnline();
      else state = pendingMode.online ? "onlineMenu" : "gameModeSelect"; // garde le contexte (difficulté/local)
    }

  } else if (state === "selectTerrain") {
    const slotT = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4 }[code];
    const visT = terrainIndices();
    const n = slotT !== undefined && slotT < visT.length ? visT[slotT] : undefined;
    if (n !== undefined) { terrain = n; state = "selectBall"; }
    if (code === "KeyC") {
      mapEventsQuiet = !mapEventsQuiet;
      beep(mapEventsQuiet ? 360 : 520, 0.06, "square", 0.08);
    }
    if (code === "Escape") { selPlayer = 0; state = "selectCharacter"; }

  } else if (state === "selectBall") {
    const slotB = { Digit1: 0, Digit2: 1 }[code];
    if (slotB !== undefined && slotB < BALL_SKINS.length) {
      ballSkin = slotB;
      commitSetup();
    }
    if (code === "Escape") state = "selectTerrain";

  } else if (state === "gameover") {
    if (online && mode === "2v2") {
      // 2v2 : l'hôte relance directement (renvoie "start" à tous) ; les invités attendent
      if (netRole === "host" && gameoverTimer <= 0 &&
          (code === "Enter" || code === "Space" || code === "KeyR")) hostStartMatch2v2();
      if (code === "Escape") quitOnline();
    } else if (online) {
      if (code === "KeyR" && !rematchMe && gameoverTimer <= 0) {
        rematchMe = true;
        sendRel({ t: "rematch" });
        if (netRole === "host" && rematchPeer) hostStartMatch();
      }
      if (code === "Escape") quitOnline();
    } else if ((code === "Space" || code === "Enter") && gameoverTimer <= 0) {
      goMenu();
    }

  } else if (code === "KeyP") {
    if (!online) paused = !paused; // pas de pause manuelle en ligne
  } else if (code === "Escape") {
    if (online) quitOnline();
    else { paused = false; goMenu(); }
  }
}

function startCharacterSelect() {
  selPlayer = 0;
  state = "selectCharacter";
}

// bascule le format "en équipes" sur le bon champ selon qu'on est en ligne
// (o2v2 -> lobby/hébergement 2v2, voir hostStartMatch2v2 dans net.js) ou
// solo vs IA (mode2v2 -> toi + IA coéquipière vs 2 IA, voir simulation.js).
function setTeamMode(v) {
  if (pendingMode.online) pendingMode.o2v2 = v;
  else pendingMode.mode2v2 = v;
}

// Valide la configuration choisie (fin de selectBall) et lance la partie
// ou l'hébergement en ligne. Point unique : applique bombMode + bombTime
// (5/7/10 s) pour TOUS les modes — 1v1, 2v2 et en ligne.
function commitSetup() {
  bombMode = !!pendingMode.bomb;
  bombTime = pendingMode.bombTime || BOMB_TIME;
  if (pendingMode.online) {
    // l'hôte diffusera bombMode/bombTime dans son message "start" (voir net.js)
    if (pendingMode.o2v2) { state = "hostLobby"; initHostPeer2v2(); }
    else { state = "hostWait"; initHostPeer(); }
  } else {
    vsAI = pendingMode.vsAI;
    if (pendingMode.vsAI) aiLevel = pendingMode.aiLevel;
    setMode(pendingMode.mode2v2 ? "2v2" : "1v1");
    newGame();
  }
}

function newGame(seed) {
  // graine partagée : en ligne, l'hôte l'enverra à l'invité (voir MULTIJOUEUR.md)
  setSeed(seed !== undefined ? seed : (Math.random() * 2 ** 31) | 0);
  tick = 0;
  scores[0] = 0; scores[1] = 0;
  blobL.speedMul = 1;
  blobR.speedMul = vsAI ? AI_LEVELS[aiLevel].speedMul : 1;
  if (mode === "2v2" && !online) {
    // HORS-LIGNE : les trois IA (blob2L coéquipier, blobR + blob2R adverses)
    // prennent la vitesse du niveau ; le joueur (blobL) garde 1. Persos tous distincts.
    // (En ligne, l'hôte fixe persos et vitesses — voir hostStartMatch2v2.)
    const sm = AI_LEVELS[aiLevel].speedMul;
    blob2L.speedMul = sm; blobR.speedMul = sm; blob2R.speedMul = sm;
    const used = new Set([blobL.charId]);
    for (const b of [blob2L, blobR, blob2R]) {
      b.charId = randomCharacterIdx([...used]);
      used.add(b.charId);
    }
    blob2L._aiT = blobR._aiT = blob2R._aiT = 0; // timers IA neutres
  }
  particles.length = 0;
  aiErr = 0; aiErrTimer = 0; aiRush = false; // repart d'un état IA neutre (déterminisme)
  xOn.fill(false);
  for (const b of [blobL, blob2L, blobR, blob2R]) b._xSpd = undefined;
  streak[0] = streak[1] = 0; superCharge[0] = superCharge[1] = 0;
  superFlash = ""; superFlashT = 0;
  resetWeather();
  servingSide = rng() < 0.5 ? 0 : 1;
  startRally();
}

// ---------- Design-system menus (cartoon / match le jeu) ----------
const UI = {
  mx: 56,
  ink: "#fff6e8",
  muted: "rgba(255,246,232,0.72)",
  faint: "rgba(255,246,232,0.22)",
  accent: "#ff4d3d",
  gold: "#ffd84a",
  sky: "#3eb5ff",
  stroke: "#1b1730",
  panel: "rgba(16, 24, 48, 0.78)",
  display: "'Fredoka', 'Nunito', sans-serif",
  sans: "'Nunito', sans-serif",
  mono: "'Nunito', sans-serif"
};
function uiAccent() { return UI.accent; }

// Décor de menu : terrain + 2 persos aléatoires (distincts), animés en fond.
const menuBg = { init: false, terrain: 0, t0: 0, ballX: W * 0.5, ballY: 120, ballVy: 0 };
let menuActors = { L: null, R: null };

function goMenu() {
  state = "menu";
  shuffleMenuBackdrop();
}

function shuffleMenuBackdrop() {
  const nA = CHARACTERS.length, nT = TERRAINS.length;
  menuBg.terrain = Math.floor(Math.random() * nT);
  const a = Math.floor(Math.random() * nA);
  let b = Math.floor(Math.random() * nA);
  if (nA > 1) while (b === a) b = Math.floor(Math.random() * nA);
  menuActors.L = makeMenuActor(0, a);
  menuActors.R = makeMenuActor(1, b);
  menuBg.ballX = W * 0.42 + Math.random() * W * 0.16;
  menuBg.ballY = 90 + Math.random() * 40;
  menuBg.ballVy = -2.2;
  menuBg.init = true;
  menuBg.t0 = performance.now();
}

function makeMenuActor(side, charIdx) {
  const a = CHARACTERS[charIdx];
  const minX = side === 0 ? 70 : NET_X + 55;
  const maxX = side === 0 ? NET_X - 55 : W - 70;
  return {
    x: side === 0 ? W * 0.22 : W * 0.78,
    y: GROUND_Y, side, charId: charIdx,
    color: a.color, darkColor: a.darkColor,
    onGround: true, vx: 0, vy: 0,
    dispVx: side === 0 ? 0.65 : -0.65,
    walkPhase: Math.random() * 24, squash: 0,
    _walking: true, _faceRight: side === 0, _faceLock: 0,
    minX, maxX, hopT: 90 + Math.floor(Math.random() * 160)
  };
}

function ensureMenuBackdrop() {
  if (!menuBg.init) shuffleMenuBackdrop();
  else if (state === "menu" && performance.now() - menuBg.t0 > 14000) shuffleMenuBackdrop();
}

function tickMenuActors() {
  for (const b of [menuActors.L, menuActors.R]) {
    if (!b) continue;
    b.x += b.dispVx * 0.32;
    if (b.x <= b.minX) { b.x = b.minX; b.dispVx = Math.abs(b.dispVx); }
    if (b.x >= b.maxX) { b.x = b.maxX; b.dispVx = -Math.abs(b.dispVx); }
    b.vx = b.dispVx; // pour orientation sprite (charFaceRight)
    b._faceRight = b.dispVx >= 0;
    // Même rythme qu'en jeu : 1 frame / 8 ticks (appui → passage → …)
    b._walkTick = (b._walkTick || 0) + 1;
    if (b._walkTick % 8 === 0) b.walkPhase += 1;
    b.hopT--;
    if (b.hopT <= 0 && b.onGround) {
      b.vy = -4.2; b.onGround = false; b.hopT = 140 + Math.floor(Math.random() * 180);
    }
    if (!b.onGround) {
      b.vy += 0.28; b.y += b.vy;
      if (b.y >= GROUND_Y) { b.y = GROUND_Y; b.vy = 0; b.onGround = true; b.squash = 4; }
    } else if (b.squash > 0) b.squash -= 0.25;
  }
  // Ballon qui rebondit doucement au-dessus du filet
  menuBg.ballVy += 0.06;
  menuBg.ballY += menuBg.ballVy;
  if (menuBg.ballY > GROUND_Y - 160) {
    menuBg.ballY = GROUND_Y - 160;
    menuBg.ballVy = -2.2 - Math.random() * 0.7;
  }
  menuBg.ballX += Math.sin(performance.now() / 1400) * 0.18;
}

function drawMenuWorld() {
  ensureMenuBackdrop();
  tickMenuActors();
  const savedT = terrain, savedW = weather;
  terrain = menuBg.terrain;
  weather = "clear";
  drawBackground();
  drawNet();
  // ballon déco (pas la balle de jeu)
  {
    const bx = menuBg.ballX, by = menuBg.ballY;
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, BALL_R * 0.95, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(bx - 4, by - 5, 2, bx, by, BALL_R);
    g.addColorStop(0, "#fff6c8");
    g.addColorStop(1, "#f0a020");
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = UI.stroke; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
  }
  if (menuActors.L) drawCharacter(menuActors.L);
  if (menuActors.R) drawCharacter(menuActors.R);
  terrain = savedT;
  weather = savedW;
}

function menuVeil(denseLeft) {
  const g = ctx.createLinearGradient(0, 0, denseLeft ? W * 0.85 : W, 0);
  g.addColorStop(0, "rgba(12, 20, 42, 0.82)");
  g.addColorStop(0.55, "rgba(12, 20, 42, 0.55)");
  g.addColorStop(1, "rgba(12, 20, 42, 0.28)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // léger dégradé bas → lisibilité du folio
  const vg = ctx.createLinearGradient(0, H * 0.7, 0, H);
  vg.addColorStop(0, "rgba(12,20,42,0)");
  vg.addColorStop(1, "rgba(12,20,42,0.55)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}

function uiLabel(txt, x, y, size, col, spacing, align) {
  ctx.save();
  ctx.textAlign = align || "left";
  ctx.fillStyle = col || UI.muted;
  ctx.font = "700 " + (size || 13) + "px " + UI.sans;
  try { ctx.letterSpacing = (spacing == null ? 0.5 : spacing) + "px"; } catch (e) {}
  ctx.fillText(String(txt), x, y);
  ctx.restore();
}

function uiTitle(txt, x, y, size, align) {
  ctx.save();
  ctx.textAlign = align || "left";
  ctx.font = "700 " + size + "px " + UI.display;
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(5, size * 0.14);
  ctx.strokeStyle = UI.stroke;
  ctx.strokeText(txt, x, y);
  ctx.fillStyle = UI.ink;
  ctx.fillText(txt, x, y);
  ctx.restore();
}

/** Découpe un texte en lignes qui tiennent dans maxW (font déjà posée sur ctx). */
function uiWrapLines(txt, maxW) {
  const words = String(txt || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Titre cartoon qui reste dans une boîte : réduit la taille puis wrap (max 3 lignes).
 * Retourne { lines, size, height } pour dimensionner le popup.
 * fill : couleur de remplissage (défaut UI.ink — foncé sur popup crème).
 */
function uiTitleBoxed(txt, cx, cy, maxW, maxSize, opts) {
  opts = opts || {};
  const align = opts.align || "center";
  const minSize = opts.minSize || 14;
  const maxLines = opts.maxLines || 3;
  const fill = opts.fill || UI.ink;
  const stroke = opts.stroke || UI.stroke;
  let size = maxSize;
  let lines = [String(txt || "")];
  while (size >= minSize) {
    ctx.font = "700 " + size + "px " + UI.display;
    lines = uiWrapLines(txt, maxW);
    const widest = lines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
    if (lines.length <= maxLines && widest <= maxW + 0.5) break;
    size -= 1;
  }
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    const last = lines[maxLines - 1];
    ctx.font = "700 " + size + "px " + UI.display;
    if (ctx.measureText(last + "…").width <= maxW) lines[maxLines - 1] = last + "…";
  }
  const lh = size * 1.18;
  const totalH = lines.length * lh;
  const y0 = cy - (lines.length - 1) * lh * 0.5;
  ctx.save();
  ctx.textAlign = align;
  ctx.font = "700 " + size + "px " + UI.display;
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(4, size * 0.12);
  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;
  for (let i = 0; i < lines.length; i++) {
    const yy = y0 + i * lh;
    ctx.strokeText(lines[i], cx, yy);
    ctx.fillText(lines[i], cx, yy);
  }
  ctx.restore();
  return { lines, size, height: totalH };
}

function uiRule(x1, x2, y, col) {
  ctx.strokeStyle = col || UI.faint;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
}

// Habillage commun : monde cartoon + voile + titre avec léger bounce.
// Signature objet : { title, subtitle, kicker, titleSize, noEscHint }.
function menuScreenBase(o) {
  if (typeof o === "string") o = { title: o, subtitle: arguments[1], titleSize: arguments[2] };
  drawMenuWorld();
  menuVeil(true);

  const mx = UI.mx, acc = uiAccent();
  const bounce = Math.sin(performance.now() / 280) * 2.5;
  uiLabel(o.kicker || "Sommet Volley", mx, 78, 13, acc, 0.5);
  // Titre calé à gauche, borné à la largeur utile (pas de débordement)
  const titleMax = o.titleSize || 44;
  uiTitleBoxed(o.title, mx, 128 + bounce, W - mx - 48, titleMax, {
    align: "left", fill: UI.ink, stroke: UI.stroke, maxLines: 2, minSize: 22
  });
  uiRule(mx, mx + 120, 148, UI.gold);
  if (o.subtitle) uiLabel(o.subtitle, mx, 172, 14, UI.muted, 0.3);

  if (!o.noEscHint) {
    if (hasTouch) hit(mx + 110, H - 24, 260, 52, "Escape");
    else hit(mx + 45, H - 32, 130, 24, "Escape");
    uiLabel("Échap ← Retour", mx, H - 24, 12, UI.muted, 0.3);
  }
  uiLabel("Sommet Volley", W - mx, H - 24, 12, UI.muted, 0.3, "right");
}


// ---------- Souris : clic pour naviguer dans les menus ----------
// Chaque écran de menu enregistre ses zones cliquables via hit() pendant son
// tracé. menuHitboxes (en construction cette frame) devient menuHitboxesPrev
// au tout début du prochain render() — ainsi hover/clic testent toujours des
// zones correspondant à ce qui est RÉELLEMENT affiché à l'écran (pas de zone
// à moitié construite), avec un décalage d'une seule frame, imperceptible.
let menuHitboxes = [];
let menuHitboxesPrev = [];
function hit(cx, cy, w, h, code) {
  menuHitboxes.push({ x: cx - w / 2, y: cy - h / 2, w, h, code });
}
function hitTestIn(list, x, y) {
  for (let i = list.length - 1; i >= 0; i--) {
    const b = list[i];
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.code;
  }
  return null;
}
function isHover(code) {
  return mouseActive && hitTestIn(menuHitboxesPrev, mouseX, mouseY) === code;
}

// Liste d'options en gros boutons cartoon (interaction → pastilles OK).
// Format des chaînes : "N — Libellé" (index → DigitN / KeyX).
function drawOptionList(items, y0, spacing) {
  const mx = UI.mx;
  const bw = Math.min(420, W - mx * 2 - 40);
  items.forEach((txt, i) => {
    const y = y0 + i * spacing;
    const parts = txt.split("—");
    const idx = parts[0].trim();
    const label = parts.length > 1 ? parts.slice(1).join("—").trim() : txt;
    const code = /^[0-9]$/.test(idx) ? "Digit" + idx : "Key" + idx;
    const rh = Math.min(42, spacing - 6);
    const rx = mx - 8, ry = y - rh * 0.72;
    hit(rx + bw / 2, y - 6, bw + 24, spacing - 4, code);
    const sel = (padConnected && navIdx === i) || isHover(code);
    // ombre décalée
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(rx + 3, ry + 4, bw, rh, 14); else ctx.rect(rx + 3, ry + 4, bw, rh);
    ctx.fill();
    ctx.fillStyle = sel ? "rgba(255,216,74,0.95)" : "rgba(255,246,232,0.92)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(rx, ry, bw, rh, 14); else ctx.rect(rx, ry, bw, rh);
    ctx.fill();
    ctx.strokeStyle = UI.stroke;
    ctx.lineWidth = sel ? 3.5 : 2.5;
    ctx.stroke();
    // pastille index
    const ix = rx + 22, iy = ry + rh / 2;
    ctx.beginPath();
    ctx.arc(ix, iy, 12, 0, Math.PI * 2);
    ctx.fillStyle = sel ? UI.accent : UI.sky;
    ctx.fill();
    ctx.strokeStyle = UI.stroke; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "800 13px " + UI.display;
    ctx.textAlign = "center";
    ctx.fillText(idx, ix, iy + 4);
    ctx.textAlign = "left";
    ctx.fillStyle = UI.stroke;
    ctx.font = "800 18px " + UI.sans;
    ctx.fillText(label, rx + 46, ry + rh * 0.68);
  });
}

// petit contrôle de volume (5 crans cliquables, même langage visuel que les
// jauges de stats) — un clic sur un cran règle le volume
// directement à ce niveau, et réactive le son au passage s'il était coupé.
// (x, y) = coin haut-droit (aligné à droite, comme le kicker est à gauche).
function drawVolumeControl(x, y) {
  const bw = 14, gap = 4, n = 5;
  const totalW = n * bw + (n - 1) * gap;
  const labelGap = 78; // place réservée au libellé à gauche des crans
  const bx0 = x - labelGap - totalW;
  // icône + libellé : clic = coupe/rétablit le son (comme M), indépendamment du niveau
  const hov = isHover("MuteToggle");
  hit(x - labelGap / 2, y - 5, labelGap, 18, "MuteToggle");
  ctx.textAlign = "right";
  ctx.font = "700 10px " + UI.mono;
  ctx.fillStyle = hov ? UI.gold : UI.muted;
  ctx.fillText((muted ? "🔇" : "🔊") + " VOLUME", x, y);
  for (let i = 0; i < n; i++) {
    const bxi = bx0 + i * (bw + gap);
    const code = "Vol" + (i + 1);
    hit(bxi + bw / 2, y - 4, bw + gap, 18, code);
    const filled = !muted && volume * n > i + 0.001;
    ctx.fillStyle = filled ? UI.gold : "rgba(255,255,255,0.18)";
    ctx.fillRect(bxi, y - 9, bw, 9);
    if (isHover(code)) { ctx.strokeStyle = UI.gold; ctx.lineWidth = 1.5; ctx.strokeRect(bxi - 1, y - 10, bw + 2, 11); }
  }
}

function drawMenu() {
  const nP = characterIndices().length, nT = terrainIndices().length;
  menuScreenBase({
    title: "SOMMET VOLLEY",
    kicker: "Volley satirique · " + nP + " persos · " + nT + " terrains",
    titleSize: 56,
    noEscHint: true
  });
  drawVolumeControl(W - UI.mx, 78);

  const items = [
    "1  —  Solo",
    "2  —  Multijoueur local",
    "3  —  Multijoueur en ligne",
    "R  —  Règles du jeu",
    "C  —  Crédits"
  ];
  drawOptionList(items, 210, 42);

  uiLabel(controlsHint(), UI.mx, H - 52, 12, controlsHintColor(), 0.3);
  uiLabel("Premier à " + WIN_SCORE + " · 2 pts d'écart · " + MAX_TOUCHES + " touches max",
          UI.mx, H - 24, 12, UI.muted, 0.3);
}

// résumé du mode de contrôle ACTIF (manette branchée > tactile détecté >
// clavier par défaut), utilisé partout où un rappel des commandes est affiché
// — sans ça, un joueur à la manette ou au doigt ne voyait toujours QUE des
// raccourcis clavier, jamais mis à jour selon son matériel réel.
function controlsHint() {
  if (padConnected) return "🎮 Manette — stick/croix choisir · A valider · B retour";
  if (hasTouch) return "📱 Tactile — pavé + SAUT / SMASH / SUPER à l'écran";
  return "Gauche  Q/D + Z/Espace · S super        Droite  ← → + ↑ · ↓ super";
}
function controlsHintColor() { return (padConnected || hasTouch) ? "#7ed957" : UI.muted; }

// ---------- Assistant de configuration : position dans le parcours ----------
// Le nombre total d'étapes DÉPEND DU CHEMIN (IA ou non, Bombe ou non, en
// ligne ou non) — jamais fixe — TOUJOURS affiché "X/Y" (jamais un numéro
// seul). Tant que le choix Bombe n'est pas encore fait (Difficulté/Format),
// pendingMode.bomb est encore absent : le total affiché suppose alors "pas
// de Bombe" (le cas le plus courant) — pendingMode est réinitialisé à chaque
// entrée dans l'assistant pour ne jamais laisser un vieux total traîner.
// La sous-question "bombFormat" (1v1 ou équipes pour la Bombe) n'existe QUE
// là où les deux formats sont possibles (solo vs IA, ou hébergement en
// ligne) — pas en multijoueur local, qui ne connaît que le 1v1.
function wizardTotal() {
  const hasTeamChoice = pendingMode.vsAI || pendingMode.online;
  return (pendingMode.vsAI ? 1 : 0)                                  /* Difficulté (solo uniquement) */
       + 1                                                            /* Format */
       + (pendingMode.bomb && hasTeamChoice ? 1 : 0)                  /* Bombe : 1v1 ou équipes ? */
       + (pendingMode.bomb ? 1 : 0)                                   /* Durée de mèche */
       + 3;                                                            /* Personnage + Terrain + Ballon */
}
function wizardStep(idx, label) { return "Étape " + idx + "/" + wizardTotal() + " · " + label; }

function drawAiDifficulty() {
  menuScreenBase({ title: "Solo", kicker: wizardStep(1, "Difficulté"),
                   subtitle: "Choisis la difficulté de l'adversaire" });
  const items = [
    "1  —  Facile",
    "2  —  Normale",
    "3  —  Difficile",
    "4  —  Impitoyable"
  ];
  drawOptionList(items, 238, 50);
}

function drawGameModeSelect() {
  const teamChoice = pendingMode.vsAI || pendingMode.online;
  const ctxLabel = pendingMode.online ? "En ligne"
    : pendingMode.vsAI ? "Solo — " + AI_LEVELS[pendingMode.aiLevel].name
    : "Multijoueur local";
  menuScreenBase({ title: "Mode de jeu", kicker: wizardStep(pendingMode.vsAI ? 2 : 1, "Format"),
                   subtitle: ctxLabel + " — choisis le mode de jeu" });

  const items = teamChoice ? [
    "1  —  Classique",
    "2  —  En équipes",
    "3  —  Bombe"
  ] : [
    "1  —  Classique",
    "2  —  Bombe"
  ];
  drawOptionList(items, 236, 48);

  // clavier VS manette (1v1 local uniquement) : qui prend la manette ?
  if (!teamChoice) {
    if (padConnected) {
      const twoP = padsNow.length >= 2;
      const label = twoP
        ? "🎮 Deux manettes : une chacun (1 → Gauche, 2 → Droite)"
        : "🎮 G — Manette : joueur " + (padSideLocal === 1 ? "Droite" : "Gauche") +
          "   ·   clavier : joueur " + (padSideLocal === 1 ? "Gauche (Q/D/Z/S)" : "Droite (flèches)");
      if (!twoP) hit(W / 2, 372, 560, 26, "KeyG"); // clic = bascule, comme G
      uiLabel(label, UI.mx, 376, 10, "#7ed957", 1);
    } else {
      uiLabel("Branche une manette pour jouer clavier vs manette", UI.mx, 376, 10, UI.muted, 1);
    }
  }
}

function drawBombFormat() {
  menuScreenBase({ title: "Mode Bombe", kicker: wizardStep(wizardTotal() - 4, "Format"),
                   subtitle: "1v1, ou en équipes ?" });
  const items = [
    "1  —  1v1",
    "2  —  En équipes"
  ];
  drawOptionList(items, 238, 50);
}

function drawBombDuration() {
  menuScreenBase({ title: "Mode Bombe", kicker: wizardStep(wizardTotal() - 3, "Durée de mèche"),
                   subtitle: "Renvoie la bombe avant la fin de la mèche" });
  const items = [
    "1  —  Nerveux",
    "2  —  Équilibré",
    "3  —  Posé"
  ];
  drawOptionList(items, 240, 52);
}

function drawRules() {
  drawMenuWorld();
  menuVeil(false);
  // panneau lisible par-dessus le décor
  ctx.fillStyle = "rgba(12, 20, 42, 0.82)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(UI.mx - 16, 18, W - UI.mx * 2 + 32, H - 50, 18);
  else ctx.rect(UI.mx - 16, 18, W - UI.mx * 2 + 32, H - 50);
  ctx.fill();
  ctx.strokeStyle = UI.stroke; ctx.lineWidth = 3; ctx.stroke();
  uiLabel("Manuel du joueur", UI.mx, 40, 13, uiAccent(), 0.4);
  uiTitle("Règles du jeu", UI.mx, 68, 26);
  uiRule(UI.mx, UI.mx + 90, 80, UI.gold);

  const mid = W * 0.52;
  const lx = UI.mx;
  const leftW = mid - UI.mx - 18;
  const rx = mid + 10;
  const rightW = W - UI.mx - rx;
  const hCol = "#7ed957";
  const footY = H - 28;

  // --- Colonne gauche (clip) : règles condensées ---
  ctx.save();
  ctx.beginPath();
  ctx.rect(lx - 4, 88, leftW + 8, footY - 92);
  ctx.clip();

  ctx.textAlign = "left";
  let y = 100;
  const h = (txt, c) => {
    ctx.fillStyle = c || hCol;
    ctx.font = "700 13px " + UI.sans;
    ctx.fillText(txt, lx, y);
    y += 18;
  };
  const p = (txt) => {
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "12px " + UI.sans;
    const words = txt.split(" ");
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > leftW && line) {
        ctx.fillText(line, lx, y); y += 15; line = w;
      } else line = test;
    }
    if (line) { ctx.fillText(line, lx, y); y += 15; }
  };

  h("But");
  p("Fais tomber la balle dans le camp adverse. Premier à " + WIN_SCORE + " avec 2 d'écart. Max " + MAX_TOUCHES + " touches par camp.");
  y += 4;
  h("Commandes");
  p("Gauche : Q/D · Z/Espace · S/F smash · E SUPER");
  p("Droite : ← → · ↑ · ↓ ou / smash · Shift droit SUPER");
  p("Manette : stick · A saut · X/Y smash · B SUPER");
  p("P pause · M son · N musique · Échap menu");
  y += 4;
  h("Gameplay");
  p("Au sol, balle sur toi = cloche auto. En l'air sans smash, tu traverses la balle.");
  p("Smash près de la balle : cloche au sol, smash en l'air (stick pour viser).");
  p("Service : smash pour lancer, puis smash pour frapper. Double saut en l'air.");
  y += 4;
  h("★ SUPER", "#ffd93d");
  p("3 points d'affilée chargent la jauge (Houn : 2). Puis la technique du perso (à droite).");
  y += 4;
  h("Météo & événements", "#4db3ff");
  p("Pluie / tempête : sol glissant, balle plus lourde.");
  p("Place Grand-Rouge : canon. Resort Doré : voiturette. Palais / Esplanade : décors PNG.");
  p("Deux joueurs au filet + balle proche = Smash Battle.");
  ctx.restore();

  // --- Colonne droite (clip) : persos en liste ---
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx - 4, 88, rightW + 8, footY - 92);
  ctx.clip();

  ctx.textAlign = "left";
  ctx.fillStyle = hCol;
  ctx.font = "800 14px " + UI.display;
  ctx.fillText("Personnages", rx, 108);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "600 11px " + UI.sans;
  ctx.fillText("V vitesse · D détente · P puissance · C contrôle", rx, 124);

  const visR = characterIndices();
  const rowH = Math.min(112, Math.floor((footY - 132) / Math.max(1, visR.length)));
  for (let slot = 0; slot < visR.length; slot++) {
    const i = visR[slot];
    const a = CHARACTERS[i];
    const ay = 132 + slot * rowH;
    const previewX = rx + 26;
    const previewY = ay + 52;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rx, ay - 2, 56, rowH - 6);
    ctx.clip();
    ctx.translate(previewX, previewY);
    ctx.scale(0.52, 0.52);
    drawCharacter({
      x: 0, y: 0, groundY: 0, side: 0,
      color: a.color, darkColor: a.darkColor,
      onGround: true, vx: 0, walkPhase: 0, squash: 0, charId: i
    });
    ctx.restore();

    const tx = rx + 58;
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = "700 13px " + UI.sans;
    ctx.fillText(a.name, tx, ay + 14);

    const st = a.stats;
    const pairs = [["V", st.vitesse], ["D", st.detente], ["P", st.puissance], ["C", st.controle]];
    ctx.font = "10px " + UI.sans;
    let bx = tx;
    for (let k = 0; k < pairs.length; k++) {
      const pr = pairs[k];
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillText(pr[0], bx, ay + 30);
      for (let s = 0; s < 5; s++) {
        ctx.fillStyle = s < pr[1] ? "#ffcc00" : "rgba(255,255,255,0.15)";
        ctx.fillRect(bx + 10 + s * 8, ay + 22, 6, 6);
      }
      bx += 58;
    }

    ctx.fillStyle = UI.gold;
    ctx.font = "600 11px " + UI.sans;
    ctx.fillText(a.superName, tx, ay + 46);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "11px " + UI.sans;
    wrapText2(a.trait, tx, ay + 60, rightW - 62, 13);
  }
  ctx.restore();

  hit(UI.mx + 80, H - 20, 200, 24, "Escape");
  uiLabel("Échap ← Retour au menu", UI.mx, H - 14, 10, UI.muted, 1.5);
}

function drawCredits() {
  menuScreenBase({ title: "Crédits", kicker: "À propos", subtitle: "Sommet Volley" });

  const lx = UI.mx;
  let y = 210;
  const h = (txt) => { ctx.textAlign = "left"; ctx.fillStyle = uiAccent(); ctx.font = "700 15px " + UI.sans; ctx.fillText(txt, lx, y); y += 24; };
  const p = (txt) => { ctx.textAlign = "left"; ctx.fillStyle = UI.ink; ctx.font = "500 15px " + UI.sans; ctx.fillText(txt, lx, y); y += 24; };
  const m = (txt) => { ctx.textAlign = "left"; ctx.fillStyle = UI.muted; ctx.font = "13px " + UI.mono; ctx.fillText(txt, lx, y); y += 20; };

  h("Créé par");
  {
    y += 24;
  }
  y += 10;

  h("Technique");
  m("PeerJS — signalisation WebRTC (peerjs.com)");
  m("Polices Fredoka & Nunito — Google Fonts");
  y += 10;

  h("Licence");
  p("MIT — voir le fichier LICENSE du dépôt");
  y += 10;

  h("Version");
  m(GAME_VERSION);
}

// texte multi-lignes aligné à gauche
function wrapText2(text, x, y, maxW, lh) {
  const words = text.split(" ");
  let line = "", yy = y;
  ctx.textAlign = "left";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; }
    else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

function drawStatGauge(x, y, label, val) {
  ctx.textAlign = "left";
  ctx.font = "700 11px " + UI.sans;
  ctx.fillStyle = "rgba(255,246,232,0.75)";
  ctx.fillText(label, x, y - 3);
  for (let k = 0; k < 5; k++) {
    ctx.fillStyle = k < val ? UI.gold : "rgba(255,255,255,0.18)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x + 62 + k * 13, y - 11, 10, 9, 2);
    else ctx.rect(x + 62 + k * 13, y - 11, 10, 9);
    ctx.fill();
  }
}

function drawSelectCharacter() {
  drawMenuWorld();
  menuVeil(false);

  const pcolor = "#ffd36b";
  const pdark  = "#d99e18";
  const guestPicking = pendingMode.online && netRole === "guest";
  uiLabel(guestPicking ? "En ligne · Ton personnage" : wizardStep(wizardTotal() - 2, "Perso"),
          UI.mx, 34, 13, uiAccent(), 0.4);
  const twoLocalHumans = !pendingMode.vsAI && !pendingMode.online;
  const pick = "Choisis ton personnage";
  uiTitle(twoLocalHumans ? "Joueur " + sideName(selPlayer) + " — " + pick : pick, UI.mx, 62, 26);

  const vis = characterIndices();
  const taken = takenCharacterSet();
  const navOpts = typeof navOptions === "function" ? navOptions() : null;
  const navCode = navOpts ? navOpts[navIdx] : null;
  const cw = W / vis.length; // largeur de carte adaptative
  for (let slot = 0; slot < vis.length; slot++) {
    const i = vis[slot];
    const cx = cw * slot + cw / 2;
    const a = CHARACTERS[i];
    const code = "Digit" + (slot + 1);
    const isTaken = taken.has(i);
    if (!isTaken) hit(cx, 240, cw, 336, code);
    if (!isTaken && ((padConnected && navCode === code) || isHover(code))) {
      // carte surlignée (manette ou survol souris) — or : seule couleur de
      // sélection dans tout le jeu (voir drawOptionList/drawSelectTerrain)
      ctx.strokeStyle = UI.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      const rx = cw * slot + 8, ry = 72, rw = cw - 16, rh = 336;
      if (ctx.roundRect) ctx.roundRect(rx, ry, rw, rh, 10); else ctx.rect(rx, ry, rw, rh);
      ctx.stroke();
    }
    // Sprites hauts : pieds plus bas pour ne pas couper la tête
    const previewY = 168;
    const preview = {
      x: cx, y: previewY, groundY: previewY,
      side: selPlayer, color: pcolor, darkColor: pdark,
      onGround: true, vx: 0, walkPhase: 0, squash: 0, charId: i
    };
    if (isTaken) ctx.globalAlpha = 0.35;
    drawCharacter(preview);
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    ctx.fillStyle = isTaken ? "rgba(255,255,255,0.35)" : UI.ink;
    ctx.font = "800 " + (vis.length >= 6 ? 13 : vis.length === 5 ? 15 : 18) + "px " + UI.display;
    ctx.fillText(isTaken ? "Pris — " + a.name : (slot + 1) + " — " + a.name, cx, 205);

    const gx = cx - 68, gy0 = 232;
    drawStatGauge(gx, gy0,      "Vitesse",   a.stats.vitesse);
    drawStatGauge(gx, gy0 + 20, "Détente",   a.stats.detente);
    drawStatGauge(gx, gy0 + 40, "Puissance", a.stats.puissance);
    drawStatGauge(gx, gy0 + 60, "Contrôle",  a.stats.controle);

    ctx.textAlign = "center";
    ctx.font = "700 12px " + UI.sans;
    ctx.fillStyle = UI.gold;
    wrapText(a.trait, cx, 322, cw - 30, 14);

    ctx.fillStyle = UI.gold;
    ctx.font = "800 13px " + UI.display;
    ctx.fillText("★ " + a.superName, cx, 372);
    ctx.fillStyle = "rgba(255,246,232,0.85)";
    ctx.font = "600 11px " + UI.sans;
    wrapText(a.superDesc, cx, 388, cw - 26, 13);
  }

  uiLabel("3 points d'affilée chargent le SUPER (E / Shift)   ·   Choisis 1 – " + vis.length + "   ·   Échap ← retour",
          UI.mx, 466, 10, UI.muted, 1);
}

// utilitaire : texte multi-lignes centré
function wrapText(text, cx, y, maxW, lh) {
  const words = text.split(" ");
  let line = "", lines = [];
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lh));
}

function drawSelectTerrain() {
  drawMenuWorld();
  menuVeil(false);
  uiLabel(wizardStep(wizardTotal() - 1, "Terrain"), UI.mx, 40, 13, uiAccent(), 0.4);
  uiTitle("Choisis le terrain", UI.mx, 74, 30);
  uiRule(UI.mx, UI.mx + 100, 90, UI.gold);

  const visT = terrainIndices();
  // largeur de vignette adaptée au nombre de terrains (tient sur 900px de large)
  const n = visT.length, gap = 20;
  const pw = Math.min(250, Math.floor((W - 40 - (n - 1) * gap) / n)), ph = 170, py = 130;
  const rowW = n * pw + (n - 1) * gap, startX = (W - rowW) / 2;
  for (let slot = 0; slot < n; slot++) {
    const i = visT[slot];
    const px = startX + slot * (pw + gap);
    // aperçu : thumb PNG dédié si dispo, sinon rendu live réduit
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 10); else ctx.rect(px, py, pw, ph);
    ctx.clip();
    if (!drawTerrainMenuThumb(i, px, py, pw, ph)) {
      ctx.translate(px, py);
      ctx.scale(pw / W, ph / H);
      const saved = terrain;
      terrain = i;
      drawBackground();
      drawNet();
      terrain = saved;
    }
    ctx.restore();

    const code = "Digit" + (slot + 1);
    hit(px + pw / 2, py + ph / 2, pw, ph + 40, code);
    const sel = (padConnected && navIdx === slot) || isHover(code);
    ctx.strokeStyle = sel ? UI.gold : UI.stroke;
    ctx.lineWidth = sel ? 5 : 3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 14); else ctx.rect(px, py, pw, ph);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = sel ? UI.gold : UI.ink;
    ctx.font = "800 14px " + UI.display;
    ctx.fillText(String(slot + 1), px + pw / 2, py + ph + 26);
    ctx.fillStyle = UI.ink;
    ctx.font = (n > 3 ? "800 14px " : "800 16px ") + UI.sans;
    ctx.fillText(TERRAINS[i].name, px + pw / 2, py + ph + 46);
  }

  uiLabel("Choisis 1 – " + n + "   ·   C terrain calme : " + (mapEventsQuiet ? "ON" : "OFF") +
          "   ·   Échap ← retour", UI.mx, 466, 10, UI.muted, 1);
}

function drawSelectBall() {
  drawMenuWorld();
  menuVeil(false);
  uiLabel(wizardStep(wizardTotal(), "Ballon"), UI.mx, 40, 13, uiAccent(), 0.4);
  uiTitle("Choisis le ballon", UI.mx, 74, 30);
  uiRule(UI.mx, UI.mx + 100, 90, UI.gold);

  const n = BALL_SKINS.length, gap = 36;
  const pw = 200, ph = 200, py = 130;
  const rowW = n * pw + (n - 1) * gap, startX = (W - rowW) / 2;
  for (let i = 0; i < n; i++) {
    const skin = BALL_SKINS[i];
    const px = startX + i * (pw + gap);
    const code = "Digit" + (i + 1);
    hit(px + pw / 2, py + ph / 2, pw, ph + 40, code);
    const sel = (padConnected && navIdx === i) || isHover(code);

    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 12); else ctx.rect(px, py, pw, ph);
    ctx.fill();
    ctx.strokeStyle = sel ? UI.gold : "rgba(255,255,255,0.55)";
    ctx.lineWidth = sel ? 4 : 2;
    ctx.stroke();

    // aperçu du ballon au centre de la carte (clip : l'ombre de drawBall part au sol)
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 12); else ctx.rect(px, py, pw, ph);
    ctx.clip();
    ctx.translate(px + pw / 2, py + ph / 2);
    const prevSkin = ballSkin;
    ballSkin = i;
    const saved = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, angle: ball.angle,
                    trail: ball.trail, smash: ball.smash, frozen: ball.frozen, popped: ball.popped };
    ball.x = 0; ball.y = 0; ball.vx = 0; ball.vy = 0;
    ball.angle = performance.now() / 900;
    ball.trail = []; ball.smash = 0; ball.frozen = false; ball.popped = false;
    ctx.scale(2.6, 2.6);
    drawBall();
    Object.assign(ball, saved);
    ballSkin = prevSkin;
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = sel ? uiAccent() : UI.muted;
    ctx.font = "700 12px " + UI.mono;
    ctx.fillText(String(i + 1), px + pw / 2, py + ph + 24);
    ctx.fillStyle = sel ? UI.ink : "rgba(244,245,247,0.85)";
    ctx.font = "600 18px " + UI.sans;
    ctx.fillText(skin.name, px + pw / 2, py + ph + 44);
  }

  uiLabel("Choisis 1 – " + n + "   ·   Échap ← retour", UI.mx, 466, 10, UI.muted, 1);
}

