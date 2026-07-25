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

  // Mode Histoire : hub, dialogues, cartes d'acte et écran de fin absorbent les touches en amont.
  if ((state === "storySelect" || state === "storyCharIntro" || state === "storyMenu" || state === "storyScene" || state === "storyActIntro" || state === "storyEnding") &&
      typeof storyHandleKeys === "function") {
    if (storyHandleKeys(code)) return;
  }
  // Clics Histoire uniquement (évite qu'une hitbox Story* périmée vole Escape / Retour ailleurs).
  if (typeof storyHandleClickCode === "function" &&
      typeof code === "string" && code.indexOf("Story") === 0 &&
      storyHandleClickCode(code)) return;

  // Navigation grille (persos / terrains) : flèches / WASD
  if (state === "selectCharacter" || state === "selectTerrain") {
    const dir =
      (code === "ArrowRight" || code === "KeyD") ? "right" :
      (code === "ArrowLeft"  || code === "KeyA") ? "left"  :
      (code === "ArrowDown"  || code === "KeyS") ? "down"  :
      (code === "ArrowUp"    || code === "KeyW") ? "up"    : null;
    if (dir && moveMenuNav(dir)) return;
    if (code === "Enter" || code === "Space") {
      const opts = typeof navOptions === "function" ? navOptions() : null;
      if (opts && opts[navIdx] != null) {
        code = opts[navIdx];
        // tombe dans les handlers Digit ci-dessous
      }
    }
  }

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
    // Invitation 1ʳᵉ visite : bloque le reste du menu
    if (tutorialInviteOpen) {
      if (code === "TutPlay" || code === "KeyT" || code === "Enter" || code === "Space") startTutorial();
      else if (code === "TutLater" || code === "Escape") {
        tutorialInviteOpen = false;
        tutorialInviteSessionDismissed = true;
      } else if (code === "TutNever") {
        tutorialInviteOpen = false;
        markTutorialDone();
      }
      return;
    }
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
    if (code === "Digit4" && typeof storyOpen === "function") storyOpen();          // Mode Histoire
    if (code === "KeyR") state = "rules";
    if (code === "KeyT") startTutorial();
    if (code === "KeyH") { tutorialReset(); state = "tutorialHelp"; }
    if (code === "KeyC") state = "credits";
    if (code === "TutPlay") startTutorial();
    if (code === "TutLater") { tutorialInviteOpen = false; tutorialInviteSessionDismissed = true; }
    if (code === "TutNever") { tutorialInviteOpen = false; markTutorialDone(); }

  } else if (state === "credits") {
    if (code === "Escape" || code === "Enter" || code === "Space") goMenu();

  } else if (state === "tutorialHelp") {
    if (code === "Escape" || code === "Enter" || code === "Space" || code === "KeyH" || code === "TutBack") {
      goMenu();
      return;
    }
    if (code === "TutKey") tutorialTab = "keyboard";
    if (code === "TutPad") tutorialTab = "pad";
    if (code === "TutTouch") tutorialTab = "touch";
    if (code === "TutMouse") tutorialTab = "mouse";
    if (code === "TutAuto") tutorialTab = "auto";
    if (code === "TutAim") tutorialAimLob = !tutorialAimLob;
    if (code === "TutSide") tutorialSide = tutorialSide === 0 ? 1 : 0;
    if (code === "TutPlay") startTutorial();
  } else if (state === "aiDifficulty") {
    // Étape 2 (Solo vs IA) : la difficulté choisie amorce pendingMode, complété
    // ensuite par le mode de jeu dans "gameModeSelect".
    const lvl = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code];
    if (lvl !== undefined) {
      pendingMode = { vsAI: true, aiLevel: lvl, mode2v2: false };
      state = "gameModeSelect";
    }
    if (code === "Escape") goMenu();

  } else if (state === "gameModeSelect") {
    // Solo / en ligne : mode puis TOUJOURS 1v1 ou équipes (teamFormat).
    // Multijoueur local : 1v1 seulement.
    const teamChoice = pendingMode.vsAI || pendingMode.online;
    if (teamChoice) {
      if (code === "Digit1") { // Classique
        pendingMode.bomb = false; pendingMode.flame = false;
        state = "teamFormat";
      }
      if (code === "Digit2") { // Bombe
        pendingMode.bomb = true; pendingMode.flame = false;
        state = "teamFormat";
      }
      if (code === "Digit3") { // Ballon enflammé
        pendingMode.flame = true; pendingMode.bomb = false;
        state = "teamFormat";
      }
    } else {
      if (code === "Digit1") {
        pendingMode.bomb = false; pendingMode.flame = false;
        setTeamMode(false);
        startCharacterSelect();
      }
      if (code === "Digit2") {
        pendingMode.bomb = true; pendingMode.flame = false;
        setTeamMode(false);
        state = "bombDuration";
      }
      if (code === "Digit3") {
        pendingMode.flame = true; pendingMode.bomb = false;
        setTeamMode(false);
        startCharacterSelect();
      }
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

  } else if (state === "teamFormat" || state === "bombFormat" || state === "flameFormat") {
    // 1v1 ou 2v2 — commun à Classique / Bombe / Flamme (solo + hébergement)
    if (code === "Digit1") {
      setTeamMode(false);
      if (pendingMode.bomb) state = "bombDuration";
      else startCharacterSelect();
    }
    if (code === "Digit2") {
      setTeamMode(true);
      if (pendingMode.bomb) state = "bombDuration";
      else startCharacterSelect();
    }
    if (code === "Escape") {
      pendingMode.bomb = false;
      pendingMode.flame = false;
      setTeamMode(false);
      state = "gameModeSelect";
    }

  } else if (state === "bombDuration") {
    const d = { Digit1: 0, Digit2: 1, Digit3: 2 }[code];
    if (d !== undefined) { pendingMode.bombTime = BOMB_DURATIONS[d].ticks; startCharacterSelect(); }
    if (code === "Escape") state = (pendingMode.vsAI || pendingMode.online) ? "teamFormat" : "gameModeSelect";

  } else if (state === "rules") {
    if (code === "Escape" || code === "Enter" || code === "Space" || code === "KeyR") goMenu();

  } else if (state === "onlineMenu") {
    if (code === "Digit1") { pendingMode = { online: true, o2v2: false }; state = "gameModeSelect"; } // Créer → mode + 1v1/2v2
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
    // Parse le n° du code (Digit1..DigitN) → slot : marche au-delà de 9 (clic /
    // Entrée génèrent "Digit10"+ pour les slots ≥ 9 ; le clavier physique s'arrête
    // à Digit9, les suivants restent atteignables au clic ou aux flèches+Entrée).
    const _dmC = /^Digit(\d+)$/.exec(code);
    const slot = _dmC ? (parseInt(_dmC[1], 10) - 1) : undefined;
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
          navIdx = 0;
          state = "selectTerrain"; // l'hôte choisit aussi le terrain
        }
      } else if (selPlayer === 0 && !pendingMode.vsAI) {
        selPlayer = 1; // au joueur vert de choisir
        navIdx = 0;
      } else {
        if (pendingMode.vsAI) blobR.charId = randomCharacterIdx([blobL.charId]);
        navIdx = 0;
        state = "selectTerrain";
      }
    }
    if (code === "Escape") {
      if (pendingMode.online && netRole === "guest") quitOnline();
      else state = pendingMode.online ? "onlineMenu" : "gameModeSelect"; // garde le contexte (difficulté/local)
    }

  } else if (state === "selectTerrain") {
    const _dmT = /^Digit(\d+)$/.exec(code);
    const slotT = _dmT ? (parseInt(_dmT[1], 10) - 1) : undefined;
    const visT = terrainIndices();
    const n = slotT !== undefined && slotT < visT.length ? visT[slotT] : undefined;
    if (n !== undefined) { terrain = n; navIdx = 0; commitSetup(); }
    if (code === "KeyC") {
      mapEventsQuiet = !mapEventsQuiet;
      beep(mapEventsQuiet ? 360 : 520, 0.06, "square", 0.08);
    }
    if (code === "Escape") { selPlayer = 0; state = "selectCharacter"; }

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
      if (storyActive && storyInMatch && typeof storyOnMatchEnd === "function") storyOnMatchEnd();
      else goMenu();
    }

  } else if ((state === "serve" || state === "play") && tutorialMode &&
             code === "Enter") {
    // Entrée seule pour passer une étape (Espace n'est plus un saut)
    if (tutorialStepCanSkip()) advanceTutorialStep();

  } else if (code === "KeyP") {
    if (!online) paused = !paused; // pas de pause manuelle en ligne
  } else if (code === "Escape") {
    if (online) quitOnline();
    else { paused = false; goMenu(); }
  }
}

function startCharacterSelect() {
  selPlayer = 0;
  navIdx = 0;
  state = "selectCharacter";
}

// bascule le format "en équipes" sur le bon champ selon qu'on est en ligne
// (o2v2 -> lobby/hébergement 2v2, voir hostStartMatch2v2 dans net.js) ou
// solo vs IA (mode2v2 -> toi + IA coéquipière vs 2 IA, voir simulation.js).
function setTeamMode(v) {
  if (pendingMode.online) pendingMode.o2v2 = v;
  else pendingMode.mode2v2 = v;
}

// Valide la configuration choisie (fin de selectTerrain) et lance la partie
// ou l'hébergement en ligne. Point unique : applique bombMode + bombTime
// (5/7/10 s) pour TOUS les modes — 1v1, 2v2 et en ligne.
function commitSetup() {
  ballSkin = 0; // ballon cartoon unique
  bombMode = !!pendingMode.bomb;
  bombTime = pendingMode.bombTime || BOMB_TIME;
  flameMode = !!pendingMode.flame && !bombMode;
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
  // Stats physiques = celles du perso (speedMul 1). L'IA ne court pas plus vite.
  blobL.speedMul = 1;
  blobR.speedMul = 1;
  if (mode === "2v2" && !online && !(typeof storyActive !== "undefined" && storyActive)) {
    // HORS-LIGNE : coéquipier + adversaires IA — même vitesse qu'un humain.
    // (En ligne, l'hôte fixe persos — voir hostStartMatch2v2.)
    // Mode Histoire : les 4 slots sont déjà posés par storyStartMatch — ne pas écraser.
    blob2L.speedMul = 1; blobR.speedMul = 1; blob2R.speedMul = 1;
    const used = new Set([blobL.charId]);
    for (const b of [blob2L, blobR, blob2R]) {
      b.charId = randomCharacterIdx([...used]);
      used.add(b.charId);
    }
    blob2L._aiT = blobR._aiT = blob2R._aiT = 0; // timers IA neutres
  } else if (mode === "2v2" && !online) {
    blob2L.speedMul = 1; blobR.speedMul = 1; blob2R.speedMul = 1;
    blob2L._aiT = blobR._aiT = blob2R._aiT = 0;
  }
  particles.length = 0;
  aiErr = 0; aiErrTimer = 0; aiRush = false; // repart d'un état IA neutre (déterminisme)
  xOn.fill(false);
  for (const b of [blobL, blob2L, blobR, blob2R]) b._xSpd = undefined;
  streak[0] = streak[1] = 0; superCharge[0] = superCharge[1] = 0;
  if (typeof powerGauge !== "undefined") { powerGauge[0] = powerGauge[1] = 0; }
  if (typeof powerWindup !== "undefined") powerWindup = null;
  superFlash = ""; superFlashSub = ""; superFlashT = 0;
  mapEventFlash = ""; mapEventFlashSub = ""; mapEventFlashT = 0;
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
  tutorialMode = false;
  tutorialStep = 0;
  // sortie complète du flux histoire (ex. Échap pendant un match d'histoire)
  if (typeof storyActive !== "undefined") { storyActive = false; storyInMatch = false; storyScene = null; }
  state = "menu";
  shuffleMenuBackdrop();
  if (shouldShowTutorialInvite()) tutorialInviteOpen = true;
}

/** Lance la partie tutoriel guidée (1v1 vs IA Facile, premier à 3). */
function startTutorial() {
  tutorialInviteOpen = false;
  tutorialInviteSessionDismissed = true;
  tutorialMode = true;
  tutorialStep = 0;
  tutorialAdvanceLock = 0;
  tutorialStepArmed = true;
  bombMode = false;
  flameMode = false;
  mapEventsQuiet = true;
  vsAI = true;
  aiLevel = 0;
  online = false;
  pendingMode = null;
  setMode("1v1");
  blobL.charId = 2; // Micron
  blobR.charId = 1; // Trompette
  terrain = 2;      // Palais Gallard
  ballSkin = 0;
  paused = false;
  newGame(42);
}

/** Étapes coach du match tutoriel (textes + touches à mettre en avant). */
const TUTORIAL_STEPS = [
  {
    title: "Déplacement",
    body: "Cours avec Q / D. Entrée = passer l'étape.",
    keys: ["Q", "D"]
  },
  {
    title: "Saut",
    body: "Z, Espace ou ↑ pour sauter · en l'air, re-saute = double saut.",
    keys: ["Z", "Espace"]
  },
  {
    title: "Service",
    body: "F : lance la balle. Puis F à nouveau pour servir (sol = cloche, saut = smash).",
    keys: ["F", "Espace"]
  },
  {
    title: "Cloche",
    body: "Au sol, place-toi sous la balle : cloche auto selon ta position.",
    keys: ["Q", "D"]
  },
  {
    title: "Smash",
    body: "Saute vers la balle : smash auto au contact selon ta position.",
    keys: ["Espace", "Z"]
  },
  {
    title: "SUPER",
    body: "Jauge or sous le score : 3 points d'affilée → E pour ta technique (bandeau d'effet).",
    keys: ["E"]
  },
  {
    title: "Super Smash",
    body: "Jauge orange pleine → MAINTIENS F en smash aérien : freeze, dose, relâche. Sans maintien = smash normal.",
    keys: ["F", "Espace"]
  },
  {
    title: "Objectif",
    body: "Marque " + TUTORIAL_WIN_SCORE + " points. Astuce : au filet à deux en l'air = Smash Battle.",
    keys: ["Q", "D", "F"]
  }
];

function tutorialStepCanSkip() {
  // Entrée pour passer ; pas Espace (évite les skips accidentels)
  return tutorialStep >= 0 && tutorialStep < TUTORIAL_STEPS.length - 1;
}

function tutorialCoachComplete() {
  return tutorialStep >= TUTORIAL_STEPS.length - 1;
}

let tutorialAdvanceLock = 0; // tick jusqu'auquel on bloque l'auto-avance (anti-cascade)
let tutorialStepArmed = true; // false = attendre que la condition soit fausse (action anticipée)

function tutorialStepConditionMet(me) {
  if (tutorialStep === 0) return Math.abs(me.vx) > 1.2;
  if (tutorialStep === 1) return !me.onGround;
  if (tutorialStep === 2) return servingSide === 0 && ball.tossGrace > 0;
  if (tutorialStep === 3) return me.poseAnim === "receive";
  if (tutorialStep === 4) return me.poseAnim === "smash";
  // SUPER : uniquement l'activation (pas la jauge déjà pleine d'avant)
  if (tutorialStep === 5) return me.superT > 0;
  // Super Smash : dosage (freeze) ou frappe lourde déjà tirée
  if (tutorialStep === 6) {
    if (powerWindup && powerWindup.side === 0) return true;
    if (ball.smash > 40 && ball.lastTouchSide === 0) return true;
    return false;
  }
  return false;
}

function advanceTutorialStep() {
  if (!tutorialMode) return;
  if (tutorialStep < TUTORIAL_STEPS.length - 1) {
    tutorialStep++;
    tutorialAdvanceLock = (typeof tick === "number" ? tick : 0) + 40;
    // Tant que la condition est déjà vraie (ex. encore en l'air après un saut
    // anticipé), on n'arme pas : il faudra la relâcher puis la refaire.
    tutorialStepArmed = false;
    // Offrir les jauges pour les étapes techniques (sinon trop long à charger)
    if (tutorialStep === 5 && typeof superCharge !== "undefined") {
      superCharge[0] = 1;
    }
    if (tutorialStep === 6 && typeof powerGauge !== "undefined" &&
        typeof POWER_GAUGE_MAX === "number") {
      powerGauge[0] = POWER_GAUGE_MAX;
    }
    beep(520, 0.04, "square", 0.06);
    // Si le score est déjà bon et qu'on arrive à l'objectif → terminer
    if (typeof maybeFinishTutorialMatch === "function") maybeFinishTutorialMatch();
  }
}

/** Auto-progression du coach : uniquement une action fraîche sur l'étape courante. */
function tickTutorialCoach() {
  if (!tutorialMode) return;
  if (state !== "serve" && state !== "play") return;
  if (typeof tick === "number" && tick < tutorialAdvanceLock) return;
  const me = blobL;
  const met = tutorialStepConditionMet(me);
  if (!tutorialStepArmed) {
    if (!met) tutorialStepArmed = true; // condition retombée → prêt pour une vraie action
    return;
  }
  if (met) advanceTutorialStep();
}

/** Fin de match tutoriel seulement après le coach + score joueur. */
function maybeFinishTutorialMatch() {
  if (!tutorialMode || !tutorialCoachComplete()) return;
  if (state === "gameover") return;
  if (scores[0] < TUTORIAL_WIN_SCORE) return;
  state = "gameover";
  gameoverTimer = GAMEOVER_MIN_WAIT;
  pointMsg = "Tutoriel terminé !  " + scores[0] + " – " + scores[1];
  markTutorialDone();
  if (typeof spawnConfetti === "function") {
    spawnConfetti(120); spawnConfetti(40, W * 0.5);
  }
  if (typeof setEmote === "function") {
    setEmote(0, "happy"); setEmote(1, "sad");
  }
  if (typeof sfxMatchWin === "function") sfxMatchWin();
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
  // Vitesse en px/frame rendu — assez pour que la foulée soit visible
  const spd = 1.4;
  return {
    x: side === 0 ? W * 0.22 : W * 0.78,
    y: GROUND_Y, side, charId: charIdx,
    color: a.color, darkColor: a.darkColor,
    onGround: true, vx: 0, vy: 0,
    dispVx: side === 0 ? spd : -spd,
    walkPhase: Math.floor(Math.random() * 4), squash: 0,
    scramble: 0,
    _menuActor: true, // décor menu : marche ou saut, jamais patinage / slip
    _walking: true, _faceRight: side === 0, _faceLock: 0,
    _walkAcc: 0,
    minX, maxX, hopT: 90 + Math.floor(Math.random() * 160)
  };
}

function ensureMenuBackdrop() {
  if (!menuBg.init) shuffleMenuBackdrop();
  else if (state === "menu" && performance.now() - menuBg.t0 > 14000) shuffleMenuBackdrop();
}

function tickMenuActors() {
  // ~16 px par frame d'anim → ~64 px / cycle (4 frames) : foulée lisible
  const STRIDE = 16;
  for (const b of [menuActors.L, menuActors.R]) {
    if (!b) continue;
    b._menuActor = true;
    b.scramble = 0; // jamais de patinage décoratif (ex. Trompette slip)
    const spd = Math.max(1.2, Math.abs(b.dispVx) || 1.4);
    let dir = b.dispVx >= 0 ? 1 : -1;
    b.hopT--;
    if (b.hopT <= 0 && b.onGround) {
      b.vy = -3.4; b.onGround = false; b.hopT = 200 + Math.floor(Math.random() * 220);
    }
    if (!b.onGround) {
      // Saut : déplacement aérien + anim jump (pas de cycle walk)
      b.x += dir * spd;
      if (b.x <= b.minX) { b.x = b.minX; dir = 1; }
      if (b.x >= b.maxX) { b.x = b.maxX; dir = -1; }
      b.vy += 0.28; b.y += b.vy;
      if (b.y >= GROUND_Y) { b.y = GROUND_Y; b.vy = 0; b.onGround = true; b.squash = 4; }
      b._walking = false;
      b._walkAcc = 0;
    } else {
      // Marche au sol : avance synchro avec walkPhase
      b.x += dir * spd;
      if (b.x <= b.minX) { b.x = b.minX; dir = 1; }
      if (b.x >= b.maxX) { b.x = b.maxX; dir = -1; }
      b._walking = true;
      b._walkAcc = (b._walkAcc || 0) + spd;
      while (b._walkAcc >= STRIDE) {
        b._walkAcc -= STRIDE;
        b.walkPhase = (b.walkPhase | 0) + 1;
      }
      if (b.squash > 0) b.squash -= 0.25;
    }
    b.dispVx = dir * spd;
    b.vx = dir * spd;
    b._faceRight = dir > 0;
    b._faceLock = 0;
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
  // ballon déco = vrai sprite de jeu (pas un cercle canvas)
  {
    const bx = menuBg.ballX, by = menuBg.ballY;
    const shScale = Math.max(0.35, 1 - (GROUND_Y - by) / 400);
    ctx.fillStyle = "rgba(0,0,0," + (0.22 * shScale) + ")";
    ctx.beginPath();
    ctx.ellipse(bx, GROUND_Y + 6, BALL_R * shScale + 4, 5 * shScale + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(bx, by);
    // légère rotation liée au rebond
    ctx.rotate((menuBg.ballVy || 0) * 0.08 + performance.now() / 900);
    const spr = typeof SPRITES !== "undefined" ? SPRITES.ballPurple : null;
    if (typeof spriteReady === "function" && spriteReady(spr)) {
      const d = BALL_R * 2.15;
      ctx.drawImage(spr, -d / 2, -d / 2, d, d);
    } else {
      ctx.fillStyle = "#c9a0ff";
      ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
    }
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
    "4  —  Mode Histoire  ·  Les Jeux du Sommet",
    "T  —  Tutoriel" + (tutorialDone ? "" : "  · Nouveau"),
    "H  —  Aide commandes",
    "R  —  Règles du jeu",
    "C  —  Crédits"
  ];
  drawOptionList(items, 182, 32);

  uiLabel(controlsHint(), UI.mx, H - 52, 12, controlsHintColor(), 0.3);
  uiLabel("Premier à " + WIN_SCORE + " · 2 pts d'écart · " + MAX_TOUCHES + " touches max",
          UI.mx, H - 24, 12, UI.muted, 0.3);

  if (tutorialInviteOpen || shouldShowTutorialInvite()) {
    tutorialInviteOpen = true;
    menuHitboxes = []; // seule la modal est cliquable
    drawTutorialInvite();
  }
}

function drawTutorialInvite() {
  ctx.fillStyle = "rgba(8, 12, 28, 0.72)";
  ctx.fillRect(0, 0, W, H);
  const pw = 420, ph = 200;
  const px = (W - pw) / 2, py = (H - ph) / 2 - 10;
  ctx.fillStyle = "rgba(255,246,232,0.97)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 18); else ctx.rect(px, py, pw, ph);
  ctx.fill();
  ctx.strokeStyle = UI.stroke; ctx.lineWidth = 3.5; ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = UI.stroke;
  ctx.font = "800 22px " + UI.display;
  ctx.fillText("Première fois ?", W / 2, py + 42);
  ctx.font = "600 14px " + UI.sans;
  ctx.fillStyle = "rgba(27,23,48,0.75)";
  ctx.fillText("Match guidé : cloche, smash, SUPER,", W / 2, py + 72);
  ctx.fillText("Super Smash — 3 points, IA Facile.", W / 2, py + 92);

  drawTutorialTab("Jouer le tutoriel", "TutPlay", W / 2, py + 130, 220, true);
  drawTutorialTab("Plus tard", "TutLater", W / 2 - 70, py + 168, 120, false);
  drawTutorialTab("Ne plus demander", "TutNever", W / 2 + 90, py + 168, 150, false);
}

// résumé du mode de contrôle ACTIF (manette branchée > tactile détecté >
// clavier par défaut), utilisé partout où un rappel des commandes est affiché
// — sans ça, un joueur à la manette ou au doigt ne voyait toujours QUE des
// raccourcis clavier, jamais mis à jour selon son matériel réel.
function controlsHint() {
  if (padConnected) return "🎮 Manette — stick/croix choisir · A valider · B retour";
  if (hasTouch) return "📱 Tactile — pavé + SAUT / SMASH / SUPER / Super Smash";
  return "Solo  Q/D · Z/Espace · F action · E SUPER · jauge orange = Super Smash";
}
function controlsHintColor() { return (padConnected || hasTouch) ? "#7ed957" : UI.muted; }

// ---------- Assistant de configuration : position dans le parcours ----------
// Le nombre total d'étapes DÉPEND DU CHEMIN (IA ou non, Bombe ou non, en
// ligne ou non) — jamais fixe — TOUJOURS affiché "X/Y" (jamais un numéro
// seul). Tant que le choix Bombe n'est pas encore fait (Difficulté/Format),
// pendingMode.bomb est encore absent : le total affiché suppose alors "pas
// de Bombe" (le cas le plus courant) — pendingMode est réinitialisé à chaque
// entrée dans l'assistant pour ne jamais laisser un vieux total traîner.
// Solo / en ligne : après le mode de jeu, toujours "1v1 ou équipes".
// Multijoueur local : pas d'étape équipes (1v1 seulement).
function wizardTotal() {
  const hasTeamChoice = pendingMode.vsAI || pendingMode.online;
  return (pendingMode.vsAI ? 1 : 0)                                  /* Difficulté (solo uniquement) */
       + 1                                                            /* Mode de jeu */
       + (hasTeamChoice ? 1 : 0)                                      /* 1v1 ou équipes (2v2) */
       + (pendingMode.bomb ? 1 : 0)                                   /* Durée de mèche */
       + 2;                                                            /* Personnage + Terrain */
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
  menuScreenBase({ title: "Mode de jeu", kicker: wizardStep(pendingMode.vsAI ? 2 : 1, "Mode"),
                   subtitle: ctxLabel + " — choisis le mode de jeu" });

  // Solo / en ligne : le 2v2 se choisit à l'étape suivante (teamFormat).
  const items = [
    "1  —  Classique",
    "2  —  Bombe",
    "3  —  Ballon enflammé"
  ];
  drawOptionList(items, 236, 44);

  if (teamChoice) {
    uiLabel("Ensuite : 1v1 ou en équipes (2v2) pour chaque mode", UI.mx, 376, 11, UI.muted, 1);
  } else if (padConnected) {
    // clavier VS manette (1v1 local uniquement)
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

function drawTeamFormat() {
  const modeTitle = pendingMode.bomb ? "Mode Bombe"
    : pendingMode.flame ? "Ballon enflammé"
    : "Classique";
  const sub = pendingMode.flame
    ? "Chaque touche brûle — 1v1, ou en équipes (2v2) ?"
    : pendingMode.bomb
      ? "1v1, ou en équipes (2v2) ?"
      : "1v1, ou en équipes (toi + IA vs 2 IA) ?";
  const stepIdx = (pendingMode.vsAI ? 2 : 1) + 1; // après Mode de jeu
  menuScreenBase({ title: modeTitle, kicker: wizardStep(stepIdx, "Équipes"),
                   subtitle: sub });
  drawOptionList([
    "1  —  1v1",
    "2  —  En équipes (2v2)"
  ], 238, 50);
}
// rétro-compat noms d'état / appels éventuels
function drawBombFormat() { drawTeamFormat(); }
function drawFlameFormat() { drawTeamFormat(); }

function drawBombDuration() {
  menuScreenBase({ title: "Mode Bombe", kicker: wizardStep(wizardTotal() - 2, "Durée de mèche"),
                   subtitle: "Renvoie la bombe avant la fin de la mèche" });
  const items = [
    "1  —  Nerveux",
    "2  —  Équilibré",
    "3  —  Posé"
  ];
  drawOptionList(items, 240, 52);
}

// ---------- Tutoriel : commandes + démo de visée ----------
let tutorialTab = "auto";       // auto | keyboard | pad | touch | mouse
let tutorialAimLob = true;      // true = cloche, false = smash
let tutorialSide = 0;           // 0 = gauche (face droite)

function tutorialReset() {
  tutorialTab = "auto";
  tutorialAimLob = true;
  tutorialSide = 0;
}

/** Device effectif affiché (auto → détection live). */
function tutorialDevice() {
  if (tutorialTab !== "auto") return tutorialTab;
  if (padConnected) return "pad";
  if (hasTouch) return "touch";
  return "keyboard";
}

/** Entrée live pour la démo de visée (fidèle au device affiché). */
function tutorialLiveInput() {
  const dev = tutorialDevice();
  if (dev === "pad" && padsNow[0]) {
    const p = padsNow[0];
    return {
      left: p.left, right: p.right, up: p.up, down: p.down,
      ax: p.ax || 0, ay: p.ay || 0,
      smash: !!p.smash, jump: !!p.jump, super: !!p.superT
    };
  }
  if (dev === "touch") {
    // Les boutons tactiles écrivent déjà dans keys{}
    return {
      left: !!keys["KeyA"], right: !!keys["KeyD"],
      up: false, down: false, ax: 0, ay: 0,
      smash: !!keys["KeyF"],
      jump: !!(keys["KeyW"] || keys["Space"] || keys["ArrowUp"]),
      super: !!keys["KeyE"]
    };
  }
  // Clavier : visée démo = stick fictif neutre (géométrie en match)
  const leftSide = tutorialSide === 0;
  return {
    left:  leftSide ? !!keys["KeyA"] : !!keys["ArrowLeft"],
    right: leftSide ? !!keys["KeyD"] : !!keys["ArrowRight"],
    up: false, down: false, ax: 0, ay: 0,
    smash: leftSide
      ? !!keys["KeyF"]
      : !!(keys["ArrowDown"] || keys["Slash"]),
    jump:  leftSide ? !!(keys["KeyW"] || keys["Space"] || keys["ArrowUp"]) : !!keys["ArrowUp"],
    super: leftSide ? !!keys["KeyE"] : !!keys["ShiftRight"]
  };
}

function tutorialDemoBlob() {
  return {
    x: 0, y: 0, side: tutorialSide, charId: 0,
    color: CHARACTERS[0].color, darkColor: CHARACTERS[0].darkColor,
    onGround: true, vx: 0, vy: 0, dispVx: 0, walkPhase: 0, squash: 0,
    _walking: false, _faceRight: tutorialSide === 0,
    poseT: 0, poseAnim: null, superT: 0
  };
}

function drawTutorialTab(label, code, x, y, w, active) {
  hit(x, y, w, 28, code);
  const hov = isHover(code) || active;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x - w / 2, y - 14, w, 28, 10);
  else ctx.rect(x - w / 2, y - 14, w, 28);
  ctx.fillStyle = active ? "rgba(255,216,74,0.95)" : hov ? "rgba(255,246,232,0.55)" : "rgba(255,246,232,0.22)";
  ctx.fill();
  ctx.strokeStyle = UI.stroke; ctx.lineWidth = active ? 2.5 : 1.5; ctx.stroke();
  ctx.fillStyle = UI.stroke;
  ctx.font = (active ? "800 " : "700 ") + "11px " + UI.sans;
  ctx.textAlign = "center";
  ctx.fillText(label, x, y + 4);
}

function drawTutorialControls(dev, x, y, maxW) {
  const rows = {
    keyboard: [
      ["Bouger / sauter", "Q / D  bouger   ·   Z / Espace / ↑  sauter (double saut en l'air)"],
      ["Cloche (au sol)", "Place-toi sous la balle — cloche auto (angle = ta position)"],
      ["Smash (en l'air)", "Saute au contact : smash automatique selon ta position"],
      ["Service / action", "F pour lancer, puis F pour servir (pas d'auto)"],
      ["SUPER (jauge or)", "3 points d'affilée → E  (technique du perso)"],
      ["Super Smash (jauge orange)", "Plein → MAINTIENS F longtemps en l'air, puis relâche (sinon smash normal)"],
      ["Smash Battle", "Les deux au filet en l'air + balle proche → duel de sauts"],
      ["Camp droite (local 1v1)", "← →  ·  ↑ saut  ·  ↓ ou / frappe  ·  Shift dr. SUPER"],
      ["Pause / son", "P pause · M son · N musique · Échap menu"]
    ],
    pad: [
      ["Déplacement", "Stick gauche ou croix directionnelle"],
      ["Saut", "Bouton A (ou croix haut) — double saut en l'air"],
      ["Cloche / smash", "X/Y  —  sol = cloche · air = smash"],
      ["Dig d'un smash", "Stick vers la balle (ou haut) au sol : tu peux encore rattraper"],
      ["SUPER (jauge or)", "Bouton B — technique du perso"],
      ["Super Smash (jauge orange)", "Maintiens X/Y longtemps en l'air jauge pleine, puis relâche"],
      ["Visée", "Oriente le stick : flèche + trajectoire suivent l'angle"],
      ["Menus", "Stick/croix choisir · A valider · B retour"]
    ],
    touch: [
      ["Déplacement", "Pavé ◀ ▶ en bas à gauche"],
      ["Saut", "Bouton ⤒  (double saut en l'air)"],
      ["Cloche / smash", "Bouton ⚡  —  sol = cloche · air = smash"],
      ["SUPER (jauge or)", "Bouton ★ — technique du perso"],
      ["Super Smash (jauge orange)", "Maintiens ⚡ longtemps en l'air jauge pleine, puis relâche"],
      ["Visée", "Assistée comme au clavier ; manette = stick plus précis"],
      ["Note", "Pavé visible en partie (solo / en ligne)"]
    ],
    mouse: [
      ["En match", "La souris ne vise plus — menus uniquement"],
      ["Pour jouer", "Clavier : Q D bouger · Z/Espace saut · F action · E SUPER"],
      ["Smash / Super Smash", "Saute au contact ; jauge orange → maintiens F pour doser"],
      ["Cloche", "Au sol, place-toi sous la balle"]
    ]
  };
  const list = rows[dev] || rows.keyboard;
  let yy = y;
  ctx.textAlign = "left";
  for (const [title, body] of list) {
    ctx.fillStyle = "#7ed957";
    ctx.font = "800 12px " + UI.sans;
    ctx.fillText(title, x, yy);
    yy += 16;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "12px " + UI.sans;
    // wrap body
    const words = body.split(" ");
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, yy); yy += 15; line = w;
      } else line = test;
    }
    if (line) { ctx.fillText(line, x, yy); yy += 15; }
    yy += 8;
  }
  return yy;
}

function drawTutorialAimDemo(cx, cy) {
  const blob = tutorialDemoBlob();
  blob.x = cx;
  blob.y = cy;

  const input = tutorialLiveInput();
  const center = tutorialAimLob
    ? (blob.side === 0 ? -0.92 : Math.PI + 0.92)
    : (blob.side === 0 ? -0.45 : Math.PI + 0.45);
  const aim = tutorialAimLob
    ? aimLobAngleFromInput(blob, input)
    : aimAngleFromInput(blob, input);
  const half = AIM_CONE / 2;
  const originX = cx;
  const originY = cy - 52;
  const R = 78;

  // Sol indicatif
  ctx.strokeStyle = "rgba(255,246,232,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 70, cy + 2);
  ctx.lineTo(cx + 70, cy + 2);
  ctx.stroke();

  // Cône de visée
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.arc(originX, originY, R, center - half, center + half);
  ctx.closePath();
  ctx.fillStyle = "rgba(62,181,255,0.18)";
  ctx.fill();
  ctx.strokeStyle = "rgba(62,181,255,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Axe central (direction « naturelle »)
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + Math.cos(center) * R, originY + Math.sin(center) * R);
  ctx.strokeStyle = "rgba(255,246,232,0.35)";
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Flèche d'aim live
  const ax = originX + Math.cos(aim) * (R - 6);
  const ay = originY + Math.sin(aim) * (R - 6);
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(ax, ay);
  ctx.strokeStyle = UI.gold;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  // pointe
  const ang = aim;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax - Math.cos(ang - 0.4) * 12, ay - Math.sin(ang - 0.4) * 12);
  ctx.lineTo(ax - Math.cos(ang + 0.4) * 12, ay - Math.sin(ang + 0.4) * 12);
  ctx.closePath();
  ctx.fillStyle = UI.gold;
  ctx.fill();

  // Trajectoire honnête (même intégrateur que le match)
  if (typeof simulateArc === "function") {
    const spd = tutorialAimLob ? 12.5 : 14.5;
    const pts = simulateArc(
      originX, originY - 2,
      Math.cos(aim) * spd, Math.sin(aim) * spd, 50
    );
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
      if (pts[i].y > cy + 8) break;
    }
    ctx.strokeStyle = tutorialAimLob ? "rgba(255,216,74,0.8)" : "rgba(255,77,61,0.85)";
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.beginPath();
    ctx.moveTo(originX, originY - 2);
    let px = originX, py = originY - 2;
    let pvx = Math.cos(aim) * 9, pvy = Math.sin(aim) * 9;
    for (let i = 0; i < 28; i++) {
      pvy += 0.35;
      px += pvx; py += pvy;
      ctx.lineTo(px, py);
      if (py > cy + 4) break;
    }
    ctx.strokeStyle = "rgba(255,77,61,0.75)";
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Perso
  drawCharacter(blob);

  // Stick / croix fantôme
  const stickR = 28;
  const sx = cx + (blob.side === 0 ? 96 : -96);
  const sy = cy - 30;
  ctx.beginPath();
  ctx.arc(sx, sy, stickR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,246,232,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
  let sdx = input.ax || 0, sdy = input.ay || 0;
  if (Math.hypot(sdx, sdy) < 0.18) {
    sdx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    sdy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  }
  const slen = Math.hypot(sdx, sdy);
  if (slen > 0.05) { sdx /= slen; sdy /= slen; }
  ctx.beginPath();
  ctx.arc(sx + sdx * 14, sy + sdy * 14, 9, 0, Math.PI * 2);
  ctx.fillStyle = slen > 0.12 ? UI.gold : "rgba(255,246,232,0.45)";
  ctx.fill();
  ctx.strokeStyle = UI.stroke; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = UI.muted;
  ctx.font = "700 10px " + UI.sans;
  ctx.textAlign = "center";
  ctx.fillText(tutorialDevice() === "pad" ? "STICK" : "DIR", sx, sy + stickR + 14);
}

function drawTutorial() {
  drawMenuWorld();
  menuVeil(false);
  ctx.fillStyle = "rgba(12, 20, 42, 0.88)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(UI.mx - 16, 14, W - UI.mx * 2 + 32, H - 36, 18);
  else ctx.rect(UI.mx - 16, 14, W - UI.mx * 2 + 32, H - 36);
  ctx.fill();
  ctx.strokeStyle = UI.stroke; ctx.lineWidth = 3; ctx.stroke();

  uiLabel("Référence des commandes", UI.mx, 36, 12, uiAccent(), 0.4);
  uiTitle("Aide commandes", UI.mx, 60, 26);
  uiRule(UI.mx, UI.mx + 90, 72, UI.gold);

  // Onglets device
  const tabs = [
    ["Auto", "TutAuto"],
    ["Clavier", "TutKey"],
    ["Manette", "TutPad"],
    ["Tactile", "TutTouch"],
    ["Souris", "TutMouse"]
  ];
  const tw = 78;
  const tabY = 96;
  const tab0 = UI.mx + tw / 2;
  tabs.forEach((t, i) => {
    const active = tutorialTab === (
      t[1] === "TutAuto" ? "auto" :
      t[1] === "TutKey" ? "keyboard" :
      t[1] === "TutPad" ? "pad" :
      t[1] === "TutTouch" ? "touch" : "mouse"
    );
    drawTutorialTab(t[0], t[1], tab0 + i * (tw + 8), tabY, tw, active);
  });

  const dev = tutorialDevice();
  const detected = padConnected ? "manette" : hasTouch ? "tactile" : "clavier";
  uiLabel(
    tutorialTab === "auto" ? ("Détecté : " + detected) : ("Affichage : " + (
      { keyboard: "clavier", pad: "manette", touch: "tactile", mouse: "souris" }[dev]
    )),
    UI.mx, 122, 11, "#7ed957", 0.2
  );

  // Colonne gauche : commandes
  const leftX = UI.mx;
  const leftW = W * 0.42;
  drawTutorialControls(dev, leftX, 148, leftW - 8);

  // Colonne droite : démo aim
  const demoCx = W * 0.72;
  const demoCy = H * 0.58;
  ctx.fillStyle = "rgba(255,246,232,0.08)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(W * 0.48, 140, W * 0.46, H - 210, 14);
  else ctx.rect(W * 0.48, 140, W * 0.46, H - 210);
  ctx.fill();

  uiLabel("Visée live — bouge la souris, l'arc suit", W * 0.50, 158, 12, UI.gold, 0.2);

  // Boutons mode aim + côté
  drawTutorialTab(tutorialAimLob ? "Mode : Cloche" : "Mode : Smash", "TutAim", W * 0.58, 182, 120, true);
  drawTutorialTab(tutorialSide === 0 ? "Camp : Gauche" : "Camp : Droite", "TutSide", W * 0.78, 182, 120, false);

  ctx.save();
  ctx.beginPath();
  ctx.rect(W * 0.48 + 4, 200, W * 0.46 - 8, H - 280);
  ctx.clip();
  drawTutorialAimDemo(demoCx, demoCy);
  ctx.restore();

  uiLabel(
    "Clavier : sol = cloche · air = smash · jauge orange = Super Smash · E = SUPER",
    W * 0.50, H - 78, 10, UI.muted, 0.15
  );

  // Bouton Retour bien visible (clic / tactile) + Échap / Entrée / B manette.
  drawTutorialTab("← Retour", "TutBack", UI.mx + 72, H - 28, hasTouch ? 168 : 148, false);
  drawTutorialTab("Jouer le tutoriel", "TutPlay", W - UI.mx - 90, H - 28, 160, true);
}

/** Bandeau coach pendant la partie tutoriel (bas d'écran, entre les scores). */
function drawTutorialCoach() {
  if (!tutorialMode || (state !== "serve" && state !== "play")) return;
  const tip = TUTORIAL_STEPS[Math.min(tutorialStep, TUTORIAL_STEPS.length - 1)];
  const pw = Math.min(340, W - 40);
  const ph = 70;
  const px = (W - pw) / 2;
  // Dans la bande score, entre les deux pastilles (laisse le terrain libre en haut)
  const py = GROUND_Y + 8;
  ctx.fillStyle = "rgba(12,20,42,0.92)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 14); else ctx.rect(px, py, pw, ph);
  ctx.fill();
  ctx.strokeStyle = UI.gold; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = UI.gold;
  ctx.font = "800 12px " + UI.sans;
  ctx.fillText(
    "Tutoriel · " + (tutorialStep + 1) + "/" + TUTORIAL_STEPS.length + "  —  " + tip.title,
    W / 2, py + 18
  );
  ctx.fillStyle = "rgba(255,246,232,0.92)";
  ctx.font = "600 11px " + UI.sans;
  // wrap court si besoin
  const body = tip.body;
  if (ctx.measureText(body).width > pw - 16) {
    ctx.font = "600 10px " + UI.sans;
  }
  ctx.fillText(body, W / 2, py + 38);

  const keys = tip.keys || [];
  let kx = W / 2 - (keys.length * 30 - 6) / 2;
  for (const k of keys) {
    const kw = Math.max(26, 6 + ctx.measureText(k).width);
    ctx.fillStyle = "rgba(255,216,74,0.95)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(kx, py + 48, kw, 16, 5); else ctx.rect(kx, py + 48, kw, 16);
    ctx.fill();
    ctx.fillStyle = UI.stroke;
    ctx.font = "800 9px " + UI.sans;
    ctx.textAlign = "center";
    ctx.fillText(k, kx + kw / 2, py + 60);
    kx += kw + 6;
  }
}

/** Prévisualisation trajectoire désactivée (visée clavier géométrique). */
function drawTutorialAimPreview() {}

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
  p("Solo : Q/D bouger · Z/Espace saut · F action · E SUPER");
  p("Clavier : contact auto — sol = cloche, air = smash (selon ta position).");
  p("Manette : stick viser · A saut · X/Y frappe · B SUPER (inchangé).");
  p("Droite local : ← → · ↑ · ↓ ou / frappe · Shift dr. SUPER");
  p("P pause · M son · N musique · Échap menu");
  y += 4;
  h("Gameplay");
  p("Au sol, balle sur toi = cloche auto. En l'air = smash auto au contact.");
  p("Service : F pour lancer, puis F à nouveau pour servir. Double saut en l'air.");
  y += 4;
  h("★ SUPER", "#ffd93d");
  p("3 points d'affilée chargent la jauge or. E / B lance la technique : un bandeau explique l'effet ~4 s.");
  y += 4;
  h("⚡ SUPER SMASH", "#ff6a2a");
  p("Jauge orange : se remplit lentement en échange. Plein → MAINTIENS smash aérien (F/X) pour doser ; sans maintien = smash normal. Relâche pour frapper (plus fort + ralenti).");
  y += 4;
  h("Smash Battle", "#ff8a65");
  p("Les deux joueurs en l'air près du filet + balle proche = duel de sauts. Le gagnant smash mortel, le perdant est stun.");
  y += 4;
  h("Météo & événements", "#4db3ff");
  p("Météo sur toutes les maps : pluie/orage, neige/blizzard (Place Écarlate), tempête de sable (Country Club). Sol glissant, balle plus lourde.");
  p("Chaque terrain a un événement (canon, voiturette, cortège, radar, lanternes, tapis, vache, aras, faucon, paon…).");
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
  p("Benjamin Mille");
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
  uiLabel(guestPicking ? "En ligne · Ton personnage" : wizardStep(wizardTotal() - 1, "Perso"),
          UI.mx, 34, 13, uiAccent(), 0.4);
  const twoLocalHumans = !pendingMode.vsAI && !pendingMode.online;
  const pick = "Choisis ton personnage";
  uiTitle(twoLocalHumans ? "Joueur " + sideName(selPlayer) + " — " + pick : pick, UI.mx, 62, 24);

  const vis = characterIndices();
  const taken = takenCharacterSet();
  const n = vis.length;
  const grid = (typeof menuNavGrid === "function" ? menuNavGrid(n) : null) || { cols: n, rows: 1 };
  const cols = grid.cols, rows = grid.rows;
  const gapX = 12, gapY = 10;
  const pw = Math.min(210, Math.floor((W - 32 - (cols - 1) * gapX) / cols));
  const ph = rows === 1 ? 340 : 188;
  const totalW = cols * pw + (cols - 1) * gapX;
  const totalH = rows * ph + (rows - 1) * gapY;
  const ox = (W - totalW) / 2;
  const oy = Math.max(72, Math.floor((H - totalH) / 2) - 14);

  for (let slot = 0; slot < n; slot++) {
    const i = vis[slot];
    const a = CHARACTERS[i];
    const row = Math.floor(slot / cols), col = slot % cols;
    const px = ox + col * (pw + gapX);
    const py = oy + row * (ph + gapY);
    const cx = px + pw / 2;
    const code = "Digit" + (slot + 1);
    const isTaken = taken.has(i);
    if (!isTaken) hit(cx, py + ph / 2, pw, ph, code);
    const sel = (!isTaken && (navIdx === slot || isHover(code)));
    if (sel) {
      ctx.strokeStyle = UI.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 10); else ctx.rect(px, py, pw, ph);
      ctx.stroke();
    }

    const previewY = py + (rows === 1 ? 88 : 118);
    const preview = {
      x: cx, y: previewY, groundY: previewY,
      side: selPlayer, color: pcolor, darkColor: pdark,
      onGround: true, vx: 0, walkPhase: 0, squash: 0, charId: i
    };
    ctx.save();
    if (isTaken) ctx.globalAlpha = 0.35;
    if (rows > 1) {
      ctx.translate(cx, previewY);
      ctx.scale(1.05, 1.05);
      preview.x = 0; preview.y = 0; preview.groundY = 0;
      drawCharacter(preview);
    } else {
      drawCharacter(preview);
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    ctx.fillStyle = isTaken ? "rgba(255,255,255,0.35)" : UI.ink;
    const nameSize = rows > 1 ? 13 : (n >= 6 ? 13 : 16);
    ctx.font = "800 " + nameSize + "px " + UI.display;
    const nameY = rows > 1 ? py + ph - 42 : py + 118;
    ctx.fillText(isTaken ? "Pris — " + a.name : (slot + 1) + " — " + a.name, cx, nameY);

    if (rows === 1) {
      const gx = cx - Math.min(68, pw / 2 - 8), gy0 = py + 140;
      drawStatGauge(gx, gy0,      "Vitesse",   a.stats.vitesse);
      drawStatGauge(gx, gy0 + 20, "Détente",   a.stats.detente);
      drawStatGauge(gx, gy0 + 40, "Puissance", a.stats.puissance);
      drawStatGauge(gx, gy0 + 60, "Contrôle",  a.stats.controle);
      ctx.textAlign = "center";
      ctx.font = "700 12px " + UI.sans;
      ctx.fillStyle = UI.gold;
      wrapText(a.trait, cx, py + 230, pw - 20, 14);
      ctx.fillStyle = UI.gold;
      ctx.font = "800 13px " + UI.display;
      ctx.fillText("★ " + a.superName, cx, py + 280);
      ctx.fillStyle = "rgba(255,246,232,0.85)";
      ctx.font = "600 11px " + UI.sans;
      wrapText(a.superDesc, cx, py + 296, pw - 18, 13);
    } else {
      ctx.fillStyle = UI.gold;
      ctx.font = "700 12px " + UI.display;
      ctx.fillText("★ " + a.superName, cx, py + ph - 22);
    }
  }

  uiLabel("↑↓←→ / stick pour naviguer   ·   Entrée pour valider   ·   Choisis 1 – " + n + "   ·   Échap ← retour",
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
  uiLabel(wizardStep(wizardTotal(), "Terrain"), UI.mx, 40, 13, uiAccent(), 0.4);
  uiTitle("Choisis le terrain", UI.mx, 74, 30);
  uiRule(UI.mx, UI.mx + 100, 90, UI.gold);

  const visT = terrainIndices();
  // 1 rangée si ≤5, sinon 2 rangées pour garder des vignettes lisibles
  const n = visT.length, cols = n <= 5 ? n : Math.ceil(n / 2);
  const gap = 16;
  const pw = Math.min(250, Math.floor((W - 40 - (cols - 1) * gap) / cols));
  const ph = n <= 5 ? 170 : 120;
  const rows = Math.ceil(n / cols);
  const rowGap = 56;
  const totalH = rows * ph + (rows - 1) * rowGap;
  const py0 = Math.max(110, Math.floor((H - totalH) / 2) - 20);
  for (let slot = 0; slot < n; slot++) {
    const i = visT[slot];
    const row = Math.floor(slot / cols), col = slot % cols;
    const colsInRow = row === rows - 1 ? n - row * cols : cols;
    const rowW = colsInRow * pw + (colsInRow - 1) * gap;
    const startX = (W - rowW) / 2;
    const px = startX + col * (pw + gap);
    const py = py0 + row * (ph + rowGap);
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
    const sel = (navIdx === slot) || isHover(code);
    ctx.strokeStyle = sel ? UI.gold : UI.stroke;
    ctx.lineWidth = sel ? 5 : 3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 14); else ctx.rect(px, py, pw, ph);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = sel ? UI.gold : UI.ink;
    ctx.font = "800 14px " + UI.display;
    ctx.fillText(String(slot + 1), px + pw / 2, py + ph + 22);
    ctx.fillStyle = UI.ink;
    ctx.font = (n > 4 ? "800 13px " : "800 16px ") + UI.sans;
    ctx.fillText(TERRAINS[i].name, px + pw / 2, py + ph + 40);
  }

  uiLabel("↑↓←→ / stick pour naviguer   ·   Entrée pour valider   ·   C terrain calme : " + (mapEventsQuiet ? "ON" : "OFF") +
          "   ·   Échap ← retour", UI.mx, 466, 10, UI.muted, 1);
}

