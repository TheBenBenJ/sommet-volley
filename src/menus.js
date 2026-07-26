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

  // Mode Tournoi : bracket / fin absorbent les touches en amont.
  if ((state === "tournamentBracket" || state === "tournamentEnding") &&
      typeof tournamentHandleKeys === "function") {
    if (tournamentHandleKeys(code)) return;
  }
  if (typeof tournamentHandleClickCode === "function" &&
      typeof code === "string" && code.indexOf("Tour") === 0 &&
      tournamentHandleClickCode(code)) return;

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
  const musMatch = /^Mus([1-5])$/.exec(code);
  if (musMatch) { musicOn = true; setMusicVolume(Number(musMatch[1]) / 5); return; }

  // Pause actionable (hitboxes dessinées par drawPauseMenu).
  if (code === "PauseResume") { resumeFromPause(); return; }
  if (code === "PauseOptions") { openOptions(true); return; }
  if (code === "PauseQuit") { quitFromPause(); return; }

  // Navigation clavier du menu pause (tous modes, y compris en ligne).
  if (paused && canOpenPauseMenu()) {
    if (code === "ArrowUp" || code === "KeyW") {
      pauseNavIdx = (pauseNavIdx - 1 + 3) % 3;
      return;
    }
    if (code === "ArrowDown" || code === "KeyS") {
      pauseNavIdx = (pauseNavIdx + 1) % 3;
      return;
    }
    if (code === "Enter" || code === "Space") {
      handleMenuKeys(["PauseResume", "PauseOptions", "PauseQuit"][pauseNavIdx | 0], "");
      return;
    }
  }

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
    // Accueil : Solo / Multijoueur, puis sous-menus dédiés.
    if (code === "Digit1") { state = "soloMenu"; navIdx = 0; }
    if (code === "Digit2") { state = "multiMenu"; navIdx = 0; }
    if (code === "KeyR") state = "rules";
    if (code === "KeyT") startTutorial();
    if (code === "KeyH") { tutorialReset(); state = "tutorialHelp"; navIdx = 0; }
    if (code === "KeyC") state = "credits";
    if (code === "KeyO") openOptions(false);
    if (code === "TutPlay") startTutorial();
    if (code === "TutLater") { tutorialInviteOpen = false; tutorialInviteSessionDismissed = true; }
    if (code === "TutNever") { tutorialInviteOpen = false; markTutorialDone(); }

  } else if (state === "options") {
    if (code === "OptMute") { muted = !muted; saveSettings(); return; }
    if (code === "OptMusic") { musicOn = !musicOn; saveSettings(); return; }
    if (code === "OptQuiet") {
      mapEventsQuiet = !mapEventsQuiet;
      saveSettings();
      beep(mapEventsQuiet ? 360 : 520, 0.06, "square", 0.08);
      return;
    }
    if (code === "OptBinds") {
      state = "optionsBinds";
      navIdx = 0;
      if (typeof cancelRebind === "function") cancelRebind();
      return;
    }
    if (code === "OptComfort") {
      state = "optionsComfort";
      navIdx = 0;
      return;
    }
    if (code === "Escape" || code === "OptBack" || code === "Enter" || code === "Space") {
      leaveOptions();
      return;
    }

  } else if (state === "optionsComfort") {
    if (code === "OptMotion") {
      reduceMotion = !reduceMotion;
      saveSettings();
      beep(reduceMotion ? 360 : 520, 0.06, "square", 0.08);
      return;
    }
    if (code === "OptFlash") {
      flashSafe = !flashSafe;
      saveSettings();
      beep(flashSafe ? 360 : 520, 0.06, "square", 0.08);
      return;
    }
    if (code === "OptJuice") {
      juiceLite = !juiceLite;
      saveSettings();
      beep(juiceLite ? 360 : 520, 0.06, "square", 0.08);
      return;
    }
    if (code === "Escape" || code === "OptComfortBack" || code === "Enter" || code === "Space") {
      state = "options";
      navIdx = 0;
      return;
    }

  } else if (state === "optionsBinds") {
    if (code === "OptResetBinds") {
      if (typeof resetKeybinds === "function") resetKeybinds();
      return;
    }
    if (code === "Escape" || code === "OptBindsBack") {
      if (typeof cancelRebind === "function") cancelRebind();
      state = "options";
      navIdx = 0;
      return;
    }
    if (typeof code === "string" && code.startsWith("Bind_")) {
      const parts = code.split("_"); // Bind_p1_jump
      if (parts.length === 3 && typeof startRebind === "function") {
        startRebind(parts[1], parts[2]);
      }
      return;
    }
    // Enter / Espace : valider la ligne surlignée (manette ou nav clavier)
    if (code === "Enter" || code === "Space") {
      const opts = typeof navOptions === "function" ? navOptions() : null;
      if (opts && opts[navIdx] != null && opts[navIdx] !== "OptBindsBack") {
        handleMenuKeys(opts[navIdx], "");
      } else {
        if (typeof cancelRebind === "function") cancelRebind();
        state = "options";
        navIdx = 0;
      }
      return;
    }

  } else if (state === "soloMenu") {
    if (code === "Digit1" && typeof storyOpen === "function") storyOpen();          // Histoire
    if (code === "Digit2") {                                                       // Amical vs IA
      pendingMode = { vsAI: true };
      state = "aiDifficulty";
      navIdx = 0;
    }
    if (code === "Digit3" && typeof tournamentOpen === "function") tournamentOpen(); // Tournoi
    if (code === "Escape") goMenu();

  } else if (state === "multiMenu") {
    if (code === "Digit1") {                                                       // Local
      pendingMode = { vsAI: false };
      state = "gameModeSelect";
      navIdx = 0;
    }
    if (code === "Digit2") {                                                       // En ligne
      if (typeof Peer === "undefined") {
        netErrorMsg = "PeerJS n'a pas pu être chargé — le mode en ligne nécessite Internet.";
        state = "netError";
      } else {
        state = "onlineMenu";
        navIdx = 0;
      }
    }
    if (code === "Escape") goMenu();

  } else if (state === "credits") {
    if (code === "Escape" || code === "Enter" || code === "Space") goMenu();

  } else if (state === "tutorialHelp") {
    // Retour menu : Échap / B manette / clic Retour (pas Entrée : valide TutPlay via nav)
    if (code === "Escape" || code === "KeyH" || code === "TutBack") {
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
    if (code === "TutPlay" || code === "KeyT") startTutorial();
  } else if (state === "aiDifficulty") {
    // Étape 2 (Solo vs IA) : la difficulté choisie amorce pendingMode, complété
    // ensuite par le mode de jeu dans "gameModeSelect".
    // Tournoi : skip mode/format → sélection perso directe.
    const lvl = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code];
    if (lvl !== undefined) {
      if (pendingMode && pendingMode.tournament) {
        pendingMode.aiLevel = lvl;
        pendingMode.mode2v2 = false;
        pendingMode.bomb = false;
        pendingMode.flame = false;
        startCharacterSelect();
      } else {
        pendingMode = { vsAI: true, aiLevel: lvl, mode2v2: false };
        state = "gameModeSelect";
      }
    }
    if (code === "Escape") {
      if (pendingMode && pendingMode.tournament) state = "soloMenu";
      else if (pendingMode && pendingMode.vsAI) state = "soloMenu";
      else goMenu();
      navIdx = 0;
    }

  } else if (state === "gameModeSelect") {
    // Solo / en ligne : mode puis TOUJOURS 1v1 ou équipes (teamFormat).
    // Partie rapide : 1v1 forcé → matchmaking (pas de 2v2).
    // Multijoueur local : 1v1 seulement.
    const teamChoice = pendingMode.vsAI || pendingMode.online;
    const qp = !!(pendingMode && pendingMode.quickplay);
    if (teamChoice) {
      if (code === "Digit1") { // Classique
        pendingMode.bomb = false; pendingMode.flame = false;
        if (qp) { setTeamMode(false); startQuickplay(); }
        else state = "teamFormat";
      }
      if (code === "Digit2") { // Bombe
        pendingMode.bomb = true; pendingMode.flame = false;
        if (qp) { setTeamMode(false); state = "bombDuration"; }
        else state = "teamFormat";
      }
      if (code === "Digit3") { // Ballon enflammé
        pendingMode.flame = true; pendingMode.bomb = false;
        if (qp) { setTeamMode(false); startQuickplay(); }
        else state = "teamFormat";
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
      else { state = "multiMenu"; navIdx = 0; }
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
    if (d !== undefined) {
      pendingMode.bombTime = BOMB_DURATIONS[d].ticks;
      if (pendingMode.quickplay) startQuickplay();
      else startCharacterSelect();
    }
    if (code === "Escape") {
      if (pendingMode.quickplay) state = "gameModeSelect";
      else state = (pendingMode.vsAI || pendingMode.online) ? "teamFormat" : "gameModeSelect";
    }

  } else if (state === "rules") {
    if (code === "Escape" || code === "Enter" || code === "Space" || code === "KeyR") goMenu();

  } else if (state === "onlineMenu") {
    if (code === "Digit1") { // Partie rapide
      pendingMode = { online: true, quickplay: true, o2v2: false };
      state = "gameModeSelect";
      navIdx = 0;
    }
    if (code === "Digit2") { pendingMode = { online: true, o2v2: false }; state = "gameModeSelect"; } // Créer
    if (code === "Digit3") { joinCode = ""; state = "joinEntry"; } // Rejoindre
    if (code === "Escape") { state = "multiMenu"; navIdx = 0; }

  } else if (state === "matchmaking") {
    if (code === "MmBot" || code === "Digit1" || code === "KeyB") startQuickplayBot();
    if (code === "Escape" || code === "MmCancel") {
      cancelQuickplay();
      teardownNet();
      state = "onlineMenu";
      navIdx = 0;
    }

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
        } else if (pendingMode.quickplay && typeof quickplayHostAfterChar === "function") {
          quickplayHostAfterChar();
        } else {
          navIdx = 0;
          state = "selectTerrain"; // l'hôte choisit aussi le terrain
        }
      } else if (pendingMode.tournament && typeof tournamentBeginAfterChar === "function") {
        tournamentBeginAfterChar();
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
      else if (pendingMode.tournament) state = "aiDifficulty";
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
      saveSettings();
      beep(mapEventsQuiet ? 360 : 520, 0.06, "square", 0.08);
    }
    if (code === "KeyB" || code === "BallNext") {
      if (typeof metaCycleBallSkin === "function") {
        metaCycleBallSkin(1);
        beep(520, 0.05, "square", 0.07);
      }
    }
    if (code === "BallPrev") {
      if (typeof metaCycleBallSkin === "function") {
        metaCycleBallSkin(-1);
        beep(440, 0.05, "square", 0.07);
      }
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
      if (typeof tournamentActive !== "undefined" && tournamentActive && tournamentInMatch &&
          typeof tournamentOnMatchEnd === "function") tournamentOnMatchEnd();
      else if (storyActive && storyInMatch && typeof storyOnMatchEnd === "function") storyOnMatchEnd();
      else goMenu();
    }

  } else if ((state === "serve" || state === "play") && tutorialMode &&
             code === "Enter") {
    // Entrée seule pour passer une étape (Espace n'est plus un saut)
    if (tutorialStepCanSkip()) advanceTutorialStep();

  } else if (code === "KeyP") {
    if (canOpenPauseMenu()) togglePauseMenu();
  } else if (code === "KeyO" && paused && canOpenPauseMenu()) {
    openOptions(true);
  } else if (code === "Escape") {
    if (canOpenPauseMenu()) {
      // Match (solo / local / histoire / tournoi / en ligne) : Échap ouvre
      // ou ferme le menu pause — jamais d'abandon immédiat.
      if (paused) resumeFromPause();
      else openPauseMenu();
    } else if (online) {
      // Hors match (lobby / attente) : Échap ×2 pour abandonner.
      if (quitArmed()) { quitArmAt = 0; quitOnline(); }
      else quitArmAt = performance.now();
    } else {
      paused = false;
      goMenu();
    }
  }
}

/** Retour après Options : menu, ou reprise de la pause en match. */
let optionsReturnState = "menu";
let optionsFromPause = false;
let pauseNavIdx = 0;

// Abandon en ligne hors match : Échap ×2 (anti appui accidentel).
let quitArmAt = 0;
const QUIT_CONFIRM_MS = 2500;
function quitArmed() {
  return performance.now() - quitArmAt < QUIT_CONFIRM_MS;
}

/** Match en cours où le menu pause a du sens (tous modes). */
function canOpenPauseMenu() {
  return state === "serve" || state === "play" || state === "point";
}

function openPauseMenu() {
  if (!canOpenPauseMenu()) return;
  paused = true;
  pauseNavIdx = 0;
  quitArmAt = 0;
}

function resumeFromPause() {
  paused = false;
  pauseNavIdx = 0;
  quitArmAt = 0;
}

function togglePauseMenu() {
  if (paused) resumeFromPause();
  else openPauseMenu();
}

/** Quitter depuis le menu pause : retour contextuel selon le mode. */
function quitFromPause() {
  paused = false;
  pauseNavIdx = 0;
  quitArmAt = 0;
  if (online) {
    if (typeof quitOnline === "function") quitOnline();
    return;
  }
  if (typeof storyActive !== "undefined" && storyActive && storyInMatch) {
    storyInMatch = false;
    storyScene = null;
    if (typeof storyOpenHub === "function") storyOpenHub();
    else goMenu();
    return;
  }
  if (typeof tournamentInMatch !== "undefined" && tournamentInMatch) {
    tournamentInMatch = false;
    state = "tournamentBracket";
    navIdx = 0;
    return;
  }
  goMenu();
}

function openOptions(fromPause) {
  optionsFromPause = !!fromPause;
  optionsReturnState = fromPause ? state : "menu";
  state = "options";
  navIdx = 0;
}

function leaveOptions() {
  if (optionsFromPause) {
    state = optionsReturnState;
    paused = true;
    optionsFromPause = false;
    pauseNavIdx = 0;
  } else {
    optionsFromPause = false;
    goMenu();
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
  if (typeof metaUseEquippedBall === "function") metaUseEquippedBall();
  else ballSkin = 0;
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
  // Coupe la démo menu pour ne pas polluer le vrai match
  if (typeof menuDemo !== "undefined") menuDemo.live = false;
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
    // Casting IA tiré UNE fois : « Rejouer » (R) garde le même quatuor.
    // On ne re-tire que si le casting est invalide (doublons / ids hors roster).
    const cast = [blobL.charId, blob2L.charId, blobR.charId, blob2R.charId];
    const castOk = cast.every(id => Number.isInteger(id) && id >= 0 && id < CHARACTERS.length) &&
                   new Set(cast).size === 4;
    if (!castOk) {
      const used = new Set([blobL.charId]);
      for (const b of [blob2L, blobR, blob2R]) {
        b.charId = randomCharacterIdx([...used]);
        used.add(b.charId);
      }
    }
    blob2L._aiT = blobR._aiT = blob2R._aiT = 0; // timers IA neutres
  } else if (mode === "2v2" && !online) {
    blob2L.speedMul = 1; blobR.speedMul = 1; blob2R.speedMul = 1;
    blob2L._aiT = blobR._aiT = blob2R._aiT = 0;
  }
  particles.length = 0;
  xOn.fill(false);
  for (const b of [blobL, blob2L, blobR, blob2R]) {
    b._xSpd = undefined;
    b._aiErr1 = 0; b._aiRush = false; b._aiErrT = 0; // état IA neutre (déterminisme)
  }
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

// Décor de menu : vraie démo 1v1 IA vs IA (balle + échanges), sinon marche.
const menuBg = {
  init: false, terrain: 0, t0: 0, charL: 0, charR: 1,
  ballX: W * 0.5, ballY: 120, ballVy: 0
};
let menuActors = { L: null, R: null };
const menuDemo = { live: false, matchState: "serve" };
/** Menus où tourne la démo IA (pas la sélection perso/terrain — elle écrit charId). */
const MENU_DEMO_STATES = {
  menu: 1, soloMenu: 1, multiMenu: 1,
  options: 1, optionsBinds: 1, optionsComfort: 1,
  aiDifficulty: 1, gameModeSelect: 1,
  teamFormat: 1, bombFormat: 1, flameFormat: 1, bombDuration: 1,
  rules: 1, tutorialHelp: 1, credits: 1, onlineMenu: 1
};
function menuDemoWanted() {
  return !!(MENU_DEMO_STATES[state]);
}

function goMenu() {
  tutorialMode = false;
  tutorialStep = 0;
  paused = false;
  pauseNavIdx = 0;
  // sortie complète du flux histoire (ex. Échap pendant un match d'histoire)
  if (typeof storyActive !== "undefined") { storyActive = false; storyInMatch = false; storyScene = null; }
  if (typeof tournamentReset === "function") tournamentReset();
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
  TUTORIAL_STEPS = buildTutorialSteps(); // suit un rebind fait entre-temps
  bombMode = false;
  flameMode = false;
  mapEventsQuiet = true;
  vsAI = true;
  aiLevel = 0;
  online = false;
  pendingMode = null;
  setMode("1v1");
  // Persos par CLÉ (l'ordre du roster peut changer sans casser le tutoriel)
  blobL.charId = Math.max(0, CHARACTERS.findIndex(c => c.key === "cygne"));
  blobR.charId = Math.max(0, CHARACTERS.findIndex(c => c.key === "dorf"));
  terrain = 2;      // Palais Gallard
  ballSkin = 0;
  paused = false;
  newGame(42);
  // Scénario en dur dès l'étape 0 (Déplacement) — PAS de service au départ.
  tutorialApplyScenario(0);
  tutorialStepShownAt = typeof tick === "number" ? tick : 0;
}

/** true = étapes guidées (0..avant-dernier) : pas de score ni d'IA. */
function tutorialPracticeActive() {
  return !!tutorialMode && tutorialStep < TUTORIAL_STEPS.length - 1;
}

/** Remet les joueurs en place neutre (camp gauche / droite). */
function tutorialResetBlobs() {
  for (const b of activeBlobs) {
    if (typeof b.reset === "function") b.reset();
  }
  if (blobL) {
    blobL.x = W * 0.25;
    blobL.y = GROUND_Y;
    blobL.vx = 0; blobL.vy = 0;
    blobL.onGround = true;
  }
  if (blobR) {
    blobR.x = W * 0.75;
    blobR.y = GROUND_Y;
    blobR.vx = 0; blobR.vy = 0;
    blobR.onGround = true;
  }
}

/** Balle figée hors jeu (côté IA, haut) — Déplacement / Saut sans service. */
function tutorialParkBall() {
  if (!tutorialMode) return;
  servingSide = 0;
  state = "play";
  serveCountdown = 0;
  if (typeof powerWindup !== "undefined") powerWindup = null;
  if (typeof clearBallHold === "function") clearBallHold();
  ball.frozen = true;
  ball.inHands = false;
  ball.tossGrace = 0;
  ball.serveAimLock = false;
  ball.serveFlight = false;
  ball.popped = false;
  ball.smash = 0;
  ball.vx = 0; ball.vy = 0; ball.spin = 0;
  ball.x = W * 0.82;
  ball.y = 56;
  ball.touches = [0, 0];
  ball.lastTouchSide = -1;
  if (typeof clearNextTouchers === "function") clearNextTouchers();
}

/** Service propre au joueur (camp gauche) — uniquement à l'étape Service. */
function tutorialGivePlayerServe() {
  if (!tutorialMode) return;
  servingSide = 0;
  if (typeof powerWindup !== "undefined") powerWindup = null;
  if (typeof startRally === "function") {
    startRally();
    serveCountdown = 0; // prêt à lancer tout de suite
  } else {
    ball.reset(0);
    state = "serve";
    serveCountdown = 0;
  }
}

/**
 * Feed scripté pour Cloche / Smash / SUPER / Super Smash.
 * kind: "lob" | "smash" | "super" | "power"
 */
function tutorialFeedBall(kind) {
  if (!tutorialMode) return;
  state = "play";
  serveCountdown = 0;
  servingSide = 0;
  if (typeof powerWindup !== "undefined") powerWindup = null;
  if (typeof clearBallHold === "function") clearBallHold();
  // Garde le joueur dans son camp, sous la trajectoire
  const px = Math.min(Math.max(blobL.x || W * 0.28, 110), NET_X - 90);
  blobL.x = px;
  blobL.y = GROUND_Y;
  blobL.vx = 0; blobL.vy = 0;
  blobL.onGround = true;
  blobL.jumpsUsed = 0;
  ball.frozen = false;
  ball.inHands = false;
  ball.tossGrace = 0;
  ball.serveAimLock = false;
  ball.serveFlight = false;
  ball.popped = false;
  ball.smash = 0;
  ball.spin = 0;
  ball.touches = [0, 0];
  ball.lastTouchSide = -1;
  ball.lastTouchTick = -999;
  ball.lastHitTick = -999;
  if (typeof clearNextTouchers === "function") clearNextTouchers();
  if (kind === "lob" || kind === "super") {
    // Cloche / SUPER : balle qui descend au-dessus du joueur (réception sol)
    ball.x = px;
    ball.y = GROUND_Y - 200;
    ball.vx = 0;
    ball.vy = 2.2;
  } else {
    // Smash / Super Smash : balle un peu plus haute, légèrement décalée
    ball.x = px + 8;
    ball.y = GROUND_Y - 210;
    ball.vx = 0.4;
    ball.vy = 1.6;
  }
}

/** Applique le scénario en dur de l'étape coach (entrée d'étape). */
function tutorialApplyScenario(step) {
  if (!tutorialMode) return;
  const s = step | 0;
  if (s === 0) {
    // Déplacement — terrain libre, PAS de service
    tutorialResetBlobs();
    tutorialParkBall();
  } else if (s === 1) {
    // Saut — toujours pas de service (on garde la position du joueur)
    tutorialParkBall();
  } else if (s === 2) {
    // Service — balle dans les mains du joueur
    tutorialGivePlayerServe();
  } else if (s === 3) {
    tutorialFeedBall("lob");
  } else if (s === 4) {
    tutorialFeedBall("smash");
  } else if (s === 5) {
    if (typeof superCharge !== "undefined") superCharge[0] = 1;
    tutorialFeedBall("super");
  } else if (s === 6) {
    if (typeof powerGauge !== "undefined" && typeof POWER_GAUGE_MAX === "number") {
      powerGauge[0] = POWER_GAUGE_MAX;
    }
    tutorialFeedBall("power");
  } else {
    // Objectif — match libre, service joueur
    tutorialGivePlayerServe();
  }
}

/** Maintient le scénario pendant l'étape (balle perdue / trop loin). */
function tickTutorialScenario() {
  if (!tutorialMode) return;
  if (state !== "serve" && state !== "play") return;
  const s = tutorialStep | 0;
  if (s === 0 || s === 1) {
    // Toujours hors service pendant Déplacement / Saut
    const parked = ball.frozen && !ball.inHands && state === "play";
    if (!parked) tutorialParkBall();
    return;
  }
  if (s === 2) {
    const playerHolding = servingSide === 0 && ball.inHands && ball.frozen;
    const playerTossing = servingSide === 0 && (
      (ball.tossGrace | 0) > 0 || (ball.serveAimLock && !ball.inHands)
    );
    if (!playerHolding && !playerTossing) tutorialGivePlayerServe();
    return;
  }
  if (s >= 3 && s <= 6) {
    // Feed mort / parti trop loin → renvoi scripté (sans point)
    const onGround = ball.y + (typeof BALL_R === "number" ? BALL_R : 14) >= GROUND_Y - 1;
    const lost = ball.popped || ball.inHands || ball.frozen || onGround ||
      ball.x < 20 || ball.x > W - 20 || ball.y < -80;
    if (lost) tutorialApplyScenario(s);
  }
}

/** Étapes coach du match tutoriel — markup [[K:]] / [[X:]] (mêmes pictos que l'aide). */
function buildTutorialSteps() {
  const L = bindLabel("left"), R = bindLabel("right"), J = bindLabel("jump");
  const F = bindLabel("smash"), S = bindLabel("super");
  return [
    {
      title: "Déplacement",
      bodyK: "Cours avec [[K:" + L + "]] [[K:" + R + "]]",
      bodyP: "Cours avec [[X:LS]] ou [[X:DPAD]]"
    },
    {
      title: "Saut",
      bodyK: "Saute [[K:" + J + "]] / [[K:Espace]] / [[K:↑]]  ·  en l'air = double saut",
      bodyP: "Saute [[X:A]]  ·  en l'air = double saut"
    },
    {
      title: "Service",
      bodyK: "[[K:" + F + "]] lance  →  saute  →  frappe en l'air  ·  pas au sol",
      bodyP: "[[X:X]] lance  →  [[X:A]] saute  →  frappe en l'air  ·  pas au sol"
    },
    {
      title: "Cloche",
      bodyK: "Au sol, place-toi sous la balle [[K:" + L + "]] [[K:" + R + "]]  ·  cloche auto",
      bodyP: "Au sol, place-toi sous la balle [[X:LS]]  ·  cloche auto"
    },
    {
      title: "Smash",
      bodyK: "Saute [[K:" + J + "]] / [[K:Espace]] vers la balle  ·  smash auto au contact",
      bodyP: "Saute [[X:A]] vers la balle  ·  smash auto au contact"
    },
    {
      title: "SUPER",
      bodyK: "Jauge or pleine → [[K:" + S + "]] technique",
      bodyP: "Jauge or pleine → [[X:B]] technique"
    },
    {
      title: "Super Smash",
      bodyK: "Jauge orange → maintiens [[K:" + F + "]] en l'air, dose, relâche",
      bodyP: "Jauge orange → maintiens [[X:Y]] en l'air, dose, relâche"
    },
    {
      title: "Objectif",
      bodyK: "Marque " + TUTORIAL_WIN_SCORE + " points  ·  filet à deux en l'air = Smash Battle",
      bodyP: "Marque " + TUTORIAL_WIN_SCORE + " points  ·  filet à deux en l'air = Smash Battle"
    }
  ];
}
let TUTORIAL_STEPS = buildTutorialSteps();

/** Corps d'étape selon périphérique branché (clavier ou manette). */
function tutorialStepBody(tip) {
  if (!tip) return "";
  const pad = typeof padConnected !== "undefined" && padConnected;
  if (pad && tip.bodyP) return tip.bodyP;
  return tip.bodyK || tip.body || "";
}

const TUTORIAL_STEP_MIN_T = 300; // 5 s @ 60 Hz — durée mini d'affichage par étape
let tutorialStepShownAt = 0;     // tick où l'étape courante a été affichée

function tutorialStepMinElapsed() {
  const t = typeof tick === "number" ? tick : 0;
  return (t - tutorialStepShownAt) >= TUTORIAL_STEP_MIN_T;
}

function tutorialStepCanSkip() {
  // Entrée / Select pour passer — seulement après le délai mini d'affichage
  return tutorialStep >= 0 && tutorialStep < TUTORIAL_STEPS.length - 1 &&
    tutorialStepMinElapsed();
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
  // Garde aussi le skip clavier / Select (handleMenuKeys → ici)
  if (!tutorialStepMinElapsed()) return;
  if (tutorialStep < TUTORIAL_STEPS.length - 1) {
    tutorialStep++;
    const now = typeof tick === "number" ? tick : 0;
    tutorialStepShownAt = now;
    tutorialAdvanceLock = now + 40;
    // Tant que la condition est déjà vraie (ex. encore en l'air après un saut
    // anticipé), on n'arme pas : il faudra la relâcher puis la refaire.
    tutorialStepArmed = false;
    tutorialApplyScenario(tutorialStep);
    beep(520, 0.04, "square", 0.06);
    // Si le score est déjà bon et qu'on arrive à l'objectif → terminer
    if (typeof maybeFinishTutorialMatch === "function") maybeFinishTutorialMatch();
  }
}

/** Auto-progression du coach : uniquement une action fraîche sur l'étape courante. */
function tickTutorialCoach() {
  if (!tutorialMode) return;
  if (state !== "serve" && state !== "play") return;
  if (typeof tickTutorialScenario === "function") tickTutorialScenario();
  if (typeof tick === "number" && tick < tutorialAdvanceLock) return;
  if (!tutorialStepMinElapsed()) return; // 5 s mini avant auto-avance / skip
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
  menuBg.charL = a;
  menuBg.charR = b;
  menuActors.L = makeMenuActor(0, a);
  menuActors.R = makeMenuActor(1, b);
  menuBg.ballX = W * 0.42 + Math.random() * W * 0.16;
  menuBg.ballY = 90 + Math.random() * 40;
  menuBg.ballVy = -2.2;
  menuBg.init = true;
  menuBg.t0 = performance.now();
  if (menuDemoWanted()) startMenuDemoMatch(false);
  else menuDemo.live = false;
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

/** Lance / relance le match fantôme IA vs IA derrière les menus. */
function startMenuDemoMatch(reshuffleChars) {
  if (reshuffleChars !== false) {
    const nA = CHARACTERS.length, nT = TERRAINS.length;
    menuBg.terrain = Math.floor(Math.random() * nT);
    const a = Math.floor(Math.random() * nA);
    let b = Math.floor(Math.random() * nA);
    if (nA > 1) while (b === a) b = Math.floor(Math.random() * nA);
    menuBg.charL = a;
    menuBg.charR = b;
    menuActors.L = makeMenuActor(0, a);
    menuActors.R = makeMenuActor(1, b);
  }
  menuBg.init = true;
  menuBg.t0 = performance.now();

  const uiState = state;
  const savedNoFx = noFx;
  if (typeof setMode === "function") setMode("1v1");
  else { mode = "1v1"; activeBlobs = [blobL, blobR]; }
  vsAI = true;
  online = false;
  tutorialMode = false;
  bombMode = false;
  flameMode = false;
  mapEventsQuiet = true;
  paused = false;
  if (typeof setSeed === "function") setSeed((Math.random() * 2 ** 31) | 0);

  const applyChar = (blob, idx) => {
    const ch = CHARACTERS[idx];
    blob.charId = idx;
    if (ch) { blob.color = ch.color; blob.darkColor = ch.darkColor; }
    blob.speedMul = 1;
    blob.kitSpeed = undefined;
    blob.kitPower = undefined;
    blob._aiErr1 = 0; blob._aiRush = false; blob._aiErrT = 0;
  };
  applyChar(blobL, menuBg.charL);
  applyChar(blobR, menuBg.charR);
  scores[0] = 0; scores[1] = 0;
  streak[0] = 0; streak[1] = 0;
  superCharge[0] = 0; superCharge[1] = 0;
  if (typeof powerGauge !== "undefined") { powerGauge[0] = 0; powerGauge[1] = 0; }
  powerWindup = null;
  battle.active = false; battle.t = 0; battle.cooldown = 0;
  superFlash = ""; superFlashSub = ""; superFlashT = 0;
  servingSide = Math.random() < 0.5 ? 0 : 1;

  noFx = true;
  if (typeof startRally === "function") {
    startRally();
    serveCountdown = 0;
  }
  menuDemo.matchState = state; // "serve" après startRally
  menuDemo.live = true;
  state = uiState;
  noFx = savedNoFx;
}

function ensureMenuBackdrop() {
  if (!menuBg.init) shuffleMenuBackdrop();
  else if (menuDemoWanted() && performance.now() - menuBg.t0 > 22000) {
    startMenuDemoMatch(true);
  } else if (!menuDemoWanted()) {
    menuDemo.live = false;
    if (!menuActors.L || !menuActors.R) {
      menuActors.L = makeMenuActor(0, menuBg.charL | 0);
      menuActors.R = makeMenuActor(1, menuBg.charR | 0);
    }
  } else if (!menuDemo.live) {
    startMenuDemoMatch(false);
  }
}

/**
 * Simu 60 Hz : deux IA en 1v1. Préserve l'état UI (menus) autour du tick.
 * Muet (noFx) pour ne pas spammer les SFX.
 */
function tickMenuDemo() {
  if (!menuDemoWanted()) {
    menuDemo.live = false;
    return;
  }
  ensureMenuBackdrop();
  if (!menuDemo.live) return;

  const uiState = state;
  const saved = {
    noFx, mapEventsQuiet, bombMode, flameMode, vsAI, mode, online,
    tutorialMode, paused, aiLevel, terrain, weather, shake
  };

  noFx = true;
  mapEventsQuiet = true;
  bombMode = false;
  flameMode = false;
  online = false;
  tutorialMode = false;
  vsAI = true;
  paused = false;
  aiLevel = 2; // Difficile — échanges lisibles
  if (typeof setMode === "function") setMode("1v1");
  terrain = menuBg.terrain;
  weather = "clear";
  state = menuDemo.matchState;

  if (state === "point") {
    if (typeof settleAirborneBlobs === "function") settleAirborneBlobs();
    if (typeof tickCelebration === "function") tickCelebration();
    pointTimer--;
    if (pointTimer <= 24) {
      startRally();
      serveCountdown = 0;
    }
  } else if (state === "gameover") {
    scores[0] = 0; scores[1] = 0;
    streak[0] = 0; streak[1] = 0;
    superCharge[0] = 0; superCharge[1] = 0;
    startRally();
    serveCountdown = 0;
  } else if (state === "serve" || state === "play") {
    // Cap score démo : relance avant fin de match officielle
    if (scores[0] >= 3 || scores[1] >= 3) {
      scores[0] = 0; scores[1] = 0;
      streak[0] = 0; streak[1] = 0;
    }
    const lvl = AI_LEVELS[Math.min(2, AI_LEVELS.length - 1)];
    const inL = typeof aiInput === "function" ? aiInput(0, lvl) : {
      left: false, right: false, jump: false, smash: false, super: false
    };
    const inR = typeof aiInput === "function" ? aiInput(1, lvl) : {
      left: false, right: false, jump: false, smash: false, super: false
    };
    if (typeof stepGame === "function") stepGame(inL, inR);
  }

  menuDemo.matchState = state;

  state = uiState;
  noFx = saved.noFx;
  mapEventsQuiet = saved.mapEventsQuiet;
  bombMode = saved.bombMode;
  flameMode = saved.flameMode;
  vsAI = saved.vsAI;
  online = saved.online;
  tutorialMode = saved.tutorialMode;
  paused = saved.paused;
  aiLevel = saved.aiLevel;
  terrain = saved.terrain;
  weather = saved.weather;
  // Pas de tremblement caméra sur les écrans menu
  shake = typeof saved.shake === "number" ? saved.shake : 0;
  if (saved.mode && typeof setMode === "function") setMode(saved.mode);
  else mode = saved.mode;
}

function tickMenuActors() {
  // ~16 px par frame rendu → foulée lisible (fallback hors démo IA)
  const STRIDE = 16;
  for (const b of [menuActors.L, menuActors.R]) {
    if (!b) continue;
    b._menuActor = true;
    b.scramble = 0;
    const spd = Math.max(1.2, Math.abs(b.dispVx) || 1.4);
    let dir = b.dispVx >= 0 ? 1 : -1;
    b.hopT--;
    if (b.hopT <= 0 && b.onGround) {
      b.vy = -3.4; b.onGround = false; b.hopT = 200 + Math.floor(Math.random() * 220);
    }
    if (!b.onGround) {
      b.x += dir * spd;
      if (b.x <= b.minX) { b.x = b.minX; dir = 1; }
      if (b.x >= b.maxX) { b.x = b.maxX; dir = -1; }
      b.vy += 0.28; b.y += b.vy;
      if (b.y >= GROUND_Y) { b.y = GROUND_Y; b.vy = 0; b.onGround = true; b.squash = 4; }
      b._walking = false;
      b._walkAcc = 0;
    } else {
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
  const useDemo = menuDemo.live && menuDemoWanted();
  if (!useDemo) tickMenuActors();
  const savedT = terrain, savedW = weather;
  terrain = menuBg.terrain;
  weather = "clear";
  drawBackground();
  drawNet();
  if (useDemo) {
    if (typeof drawBall === "function") drawBall();
    drawCharacter(blobL);
    drawCharacter(blobR);
  } else {
    const bx = menuBg.ballX, by = menuBg.ballY;
    const shScale = Math.max(0.35, 1 - (GROUND_Y - by) / 400);
    ctx.fillStyle = "rgba(0,0,0," + (0.22 * shScale) + ")";
    ctx.beginPath();
    ctx.ellipse(bx, GROUND_Y + 6, BALL_R * shScale + 4, 5 * shScale + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate((menuBg.ballVy || 0) * 0.08 + performance.now() / 900);
    const skin = (typeof BALL_SKINS !== "undefined" && BALL_SKINS[ballSkin]) || null;
    const sprName = (skin && skin.sprite) || "ballPurple";
    let spr = (typeof SPRITES !== "undefined") ? (SPRITES[sprName] || SPRITES.ballPurple) : null;
    if (typeof spriteReady === "function" && !spriteReady(spr) && SPRITES) spr = SPRITES.ballPurple;
    if (typeof spriteReady === "function" && spriteReady(spr)) {
      const d = BALL_R * 2.15;
      ctx.drawImage(spr, -d / 2, -d / 2, d, d);
    } else {
      ctx.fillStyle = "#c9a0ff";
      ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    if (menuActors.L) drawCharacter(menuActors.L);
    if (menuActors.R) drawCharacter(menuActors.R);
  }
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

// ---------- Pictos commandes (clavier vs Xbox) ----------
const XBOX_PICTO = {
  A: "#3ddc84", B: "#e74c3c", X: "#3d9bdb", Y: "#f1c40f",
  LB: "#5a6270", RB: "#5a6270", LT: "#5a6270", RT: "#5a6270",
  START: "#6b7280", VIEW: "#6b7280", SELECT: "#6b7280", MENU: "#6b7280"
};

/** Capuchon clavier — retourne la largeur dessinée. */
function drawKeyPicto(x, y, label, size) {
  const s = size || 14;
  const txt = String(label || "?");
  ctx.save();
  ctx.font = "800 " + Math.max(9, s - 2) + "px " + UI.sans;
  const tw = ctx.measureText(txt).width;
  const padX = 6, h = s + 4, w = Math.max(h, tw + padX * 2);
  const bx = x, by = y - h + 3;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, w, h, 5); else ctx.rect(bx, by, w, h);
  ctx.fillStyle = "rgba(255,246,232,0.95)";
  ctx.fill();
  ctx.strokeStyle = UI.stroke; ctx.lineWidth = 1.6; ctx.stroke();
  // petit repère « clavier »
  ctx.fillStyle = "rgba(27,23,48,0.35)";
  ctx.font = "700 7px " + UI.sans;
  ctx.textAlign = "left";
  ctx.fillText("⌨", bx + 2, by + 7);
  ctx.fillStyle = UI.stroke;
  ctx.font = "800 " + Math.max(9, s - 2) + "px " + UI.sans;
  ctx.textAlign = "center";
  ctx.fillText(txt, bx + w / 2, y - 1);
  ctx.restore();
  return w;
}

/** Stick analogique (manette) — retourne la largeur. */
function drawStickPicto(x, y, size) {
  const s = size || 14;
  const r = Math.max(8, s * 0.72);
  const cx = x + r, cy = y - r * 0.18;
  ctx.save();
  // Culot
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#3d4658";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Anneau
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,246,232,0.35)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Capuchon (légèrement décalé = « poussé »)
  ctx.beginPath();
  ctx.arc(cx + r * 0.18, cy - r * 0.12, r * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = "#eef2f8";
  ctx.fill();
  ctx.strokeStyle = "rgba(27,23,48,0.45)";
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.restore();
  return r * 2;
}

/** Croix directionnelle (D-pad) — retourne la largeur. */
function drawDpadPicto(x, y, size) {
  const s = size || 14;
  const w = s + 6, arm = Math.max(4, s * 0.38);
  const cx = x + w / 2, cy = y - 2;
  ctx.save();
  ctx.fillStyle = "#3d4658";
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1.3;
  // Bras horizontal + vertical
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(cx - w / 2, cy - arm / 2, w, arm, 2);
    ctx.roundRect(cx - arm / 2, cy - w / 2, arm, w, 2);
  } else {
    ctx.rect(cx - w / 2, cy - arm / 2, w, arm);
    ctx.rect(cx - arm / 2, cy - w / 2, arm, w);
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  return w;
}

/** Bouton Xbox (cercle couleur) — retourne la largeur. */
function drawXboxPicto(x, y, btn, size) {
  const s = size || 14;
  const label = String(btn || "?").toUpperCase();
  // Stick / croix : pictos dédiés (pas une pilule de texte)
  if (label === "LS" || label === "STICK" || label === "L3" || label === "JOY") {
    return drawStickPicto(x, y, s);
  }
  if (label === "DPAD" || label === "CROIX" || label === "PAD") {
    return drawDpadPicto(x, y, s);
  }
  const col = XBOX_PICTO[label] || "#888";
  const isPill = label.length > 1;
  ctx.save();
  if (isPill) {
    ctx.font = "800 " + Math.max(8, s - 3) + "px " + UI.sans;
    const tw = ctx.measureText(label).width;
    const w = tw + 14, h = s + 2; // pad un peu plus large (SELECT / START…)
    const bx = x, by = y - h + 3;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, w, h, h / 2); else ctx.rect(bx, by, w, h);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(label, bx + w / 2, y - 1);
    ctx.restore();
    return w;
  }
  const r = s * 0.55;
  const cx = x + r, cy = y - r * 0.15;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = col;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "800 " + Math.max(9, s - 3) + "px " + UI.sans;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy + 0.5);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
  return r * 2;
}

/**
 * Markup : texte + [[K:E]] (clavier) + [[X:B]] (Xbox) + [[X:LS]] (stick) + [[X:DPAD]].
 * Dessine une ligne (wrap soft) ; retourne y suivant.
 */
function parseControlMarkup(str) {
  const s = String(str || "");
  const parts = [];
  const re = /\[\[([KXkx]):([^\]]+)\]\]/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push({ text: s.slice(last, m.index) });
    const kind = m[1].toUpperCase();
    const val = m[2];
    if (kind === "K") parts.push({ key: val });
    else parts.push({ xbox: val });
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push({ text: s.slice(last) });
  return parts.length ? parts : [{ text: s }];
}

/** Largeur estimée d'un markup (pour centrage) — pictos inclus. */
function measureControlMarkup(markup, size) {
  const parts = parseControlMarkup(markup);
  const s = size || 12;
  let w = 0;
  const gap = 6;
  ctx.save();
  ctx.font = Math.max(10, s) + "px " + UI.sans;
  for (const p of parts) {
    if (p.text) {
      w += ctx.measureText(p.text).width;
    } else if (p.key) {
      const txt = String(p.key || "?");
      ctx.font = "800 " + Math.max(9, s - 2) + "px " + UI.sans;
      const tw = ctx.measureText(txt).width;
      w += Math.max(s + 6, tw + 12) + gap;
      ctx.font = Math.max(10, s) + "px " + UI.sans;
    } else if (p.xbox) {
      const xl = String(p.xbox || "?").toUpperCase();
      if (xl === "LS" || xl === "STICK" || xl === "L3" || xl === "JOY" ||
          xl === "DPAD" || xl === "CROIX" || xl === "PAD") {
        w += s + 8 + gap;
      } else if (xl.length > 1) {
        ctx.font = "800 " + Math.max(8, s - 3) + "px " + UI.sans;
        w += ctx.measureText(xl).width + 14 + gap;
        ctx.font = Math.max(10, s) + "px " + UI.sans;
      } else {
        w += s + 4 + gap;
      }
    }
  }
  ctx.restore();
  return w;
}

function drawControlMarkup(x, y, markup, maxW, size) {
  const parts = parseControlMarkup(markup);
  const s = size || 12;
  let cx = x, cy = y;
  const gap = 6;
  ctx.save();
  ctx.font = Math.max(10, s) + "px " + UI.sans;
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.textAlign = "left";
  for (const p of parts) {
    if (p.text) {
      const words = p.text.split(/(\s+)/);
      for (const w of words) {
        if (!w) continue;
        const tw = ctx.measureText(w).width;
        if (cx > x && cx + tw > x + maxW && /\S/.test(w)) {
          cy += s + 4; cx = x;
        }
        ctx.fillText(w, cx, cy);
        cx += tw;
      }
    } else if (p.key) {
      if (cx > x) cx += gap; // air avant le picto (évite chevauchement texte)
      const approx = Math.max(s + 4, String(p.key).length * 8 + 12);
      if (cx > x + gap && cx + approx > x + maxW) { cy += s + 6; cx = x; }
      const w = drawKeyPicto(cx, cy, p.key, s + 2);
      cx += w + gap;
    } else if (p.xbox) {
      if (cx > x) cx += gap;
      const xl = String(p.xbox).toUpperCase();
      const isStick = xl === "LS" || xl === "STICK" || xl === "L3" || xl === "JOY";
      const isDpad = xl === "DPAD" || xl === "CROIX" || xl === "PAD";
      const approx = isStick || isDpad ? s + 8 : (p.xbox.length > 1 ? 56 : s + 4);
      if (cx > x + gap && cx + approx > x + maxW) { cy += s + 6; cx = x; }
      const w = drawXboxPicto(cx, cy, p.xbox, s + 2);
      cx += w + gap;
    }
  }
  ctx.restore();
  return cy + s + 2;
}

/** Rappel SUPER clavier + Xbox (bandeau / coach). */
function superBindHintMarkup() {
  const k = bindLabel("super");
  return "[[K:" + k + "]]  ou  [[X:B]]";
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
  // Marque à droite seulement s'il n'y a pas déjà un pied custom à droite
  if (!o.noBrand) {
    uiLabel("Sommet Volley", W - mx, H - 24, 12, UI.muted, 0.3, "right");
  }
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
    noEscHint: true,
    noBrand: true
  });
  drawVolumeControl(W - UI.mx, 78);

  const items = [
    "1  —  Solo",
    "2  —  Multijoueur",
    "T  —  Tutoriel" + (tutorialDone ? "" : "  · Nouveau"),
    "O  —  Options",
    "H  —  Aide commandes",
    "R  —  Règles du jeu",
    "C  —  Crédits"
  ];
  drawOptionList(items, 190, 34);

  // Pied : hint contrôles à gauche, règles à droite (évite superposition)
  drawControlsHint(UI.mx, H - 22, W * 0.48);
  uiLabel("Premier à " + WIN_SCORE + " · 2 d'écart · " + MAX_TOUCHES + " touches",
          W - UI.mx, H - 22, 11, UI.muted, 0.3, "right");

  if (tutorialInviteOpen || shouldShowTutorialInvite()) {
    tutorialInviteOpen = true;
    menuHitboxes = []; // seule la modal est cliquable
    drawTutorialInvite();
  }
}

function drawSoloMenu() {
  menuScreenBase({
    title: "Solo",
    kicker: "Contre l'IA",
    subtitle: "Histoire · match amical · tournoi"
  });
  drawOptionList([
    "1  —  Mode Histoire  ·  Les Jeux du Sommet",
    "2  —  Amical",
    "3  —  Tournoi"
  ], 220, 48);
}

function drawMultiMenu() {
  menuScreenBase({
    title: "Multijoueur",
    kicker: "À plusieurs",
    subtitle: "Sur le même écran, ou en ligne"
  });
  drawOptionList([
    "1  —  Local",
    "2  —  En ligne"
  ], 238, 52);
}

function drawMusicVolumeControl(x, y) {
  const bw = 14, gap = 4, n = 5;
  const totalW = n * bw + (n - 1) * gap;
  const labelGap = 88;
  const bx0 = x - labelGap - totalW;
  const hov = isHover("OptMusic");
  hit(x - labelGap / 2, y - 5, labelGap, 18, "OptMusic");
  ctx.textAlign = "right";
  ctx.font = "700 10px " + UI.mono;
  ctx.fillStyle = hov ? UI.gold : UI.muted;
  ctx.fillText((musicOn ? "♪" : "♩") + " MUSIQUE", x, y);
  for (let i = 0; i < n; i++) {
    const bxi = bx0 + i * (bw + gap);
    const code = "Mus" + (i + 1);
    hit(bxi + bw / 2, y - 4, bw + gap, 18, code);
    const filled = musicOn && musicVolume * n > i + 0.001;
    ctx.fillStyle = filled ? UI.gold : "rgba(255,255,255,0.18)";
    ctx.fillRect(bxi, y - 9, bw, 9);
    if (isHover(code)) { ctx.strokeStyle = UI.gold; ctx.lineWidth = 1.5; ctx.strokeRect(bxi - 1, y - 10, bw + 2, 11); }
  }
}

function drawOptions() {
  menuScreenBase({
    title: "Options",
    kicker: optionsFromPause ? "Pause · réglages" : "Préférences",
    subtitle: "Son, contrôles, confort"
  });
  const mx = UI.mx;
  drawVolumeControl(W - UI.mx, 200);
  drawMusicVolumeControl(W - UI.mx, 228);

  const rows = [
    { code: "OptMute", label: muted ? "Son : coupé" : "Son : activé" },
    { code: "OptMusic", label: musicOn ? "Musique : activée" : "Musique : coupée" },
    { code: "OptQuiet", label: "Terrain calme : " + (mapEventsQuiet ? "ON" : "OFF") },
    { code: "OptBinds", label: "Contrôles clavier…" },
    { code: "OptComfort", label: "Confort & accessibilité…" }
  ];
  rows.forEach((r, i) => {
    const y = 262 + i * 36;
    const sel = (padConnected && navIdx === i) || isHover(r.code);
    hit(mx + 200, y, 400, 34, r.code);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(mx - 4, y - 20, 420, 34, 12); else ctx.rect(mx - 4, y - 20, 420, 34);
    ctx.fillStyle = sel ? "rgba(255,216,74,0.95)" : "rgba(255,246,232,0.92)";
    ctx.fill();
    ctx.strokeStyle = UI.stroke;
    ctx.lineWidth = sel ? 3 : 2;
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.fillStyle = UI.stroke;
    ctx.font = "700 15px " + UI.sans;
    ctx.fillText(r.label, mx + 14, y + 2);
  });

  const wins = (typeof meta !== "undefined" && meta) ? (meta.tournamentWins | 0) : 0;
  const skin = BALL_SKINS[ballSkin] || BALL_SKINS[0];
  uiLabel("Tournoi · " + wins + " couronne" + (wins !== 1 ? "s" : "") +
    "  ·  Ballon : " + (skin ? skin.name : "Cartoon"), mx, 448, 11, UI.muted, 0.3);
  hit(mx + 70, H - 28, 160, 28, "OptBack");
}

function drawOptionsComfort() {
  menuScreenBase({
    title: "Confort",
    kicker: "Accessibilité",
    subtitle: "Mouvements, flashs, densité des effets"
  });
  const mx = UI.mx;
  const rows = [
    { code: "OptMotion", label: "Réduire les mouvements : " + (reduceMotion ? "ON" : "OFF") },
    { code: "OptFlash", label: "Anti-flash : " + (flashSafe ? "ON" : "OFF") },
    { code: "OptJuice", label: "Effets : " + (juiceLite ? "légers" : "complets") }
  ];
  rows.forEach((r, i) => {
    const y = 230 + i * 48;
    const sel = (padConnected && navIdx === i) || isHover(r.code);
    hit(mx + 200, y, 400, 40, r.code);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(mx - 4, y - 22, 420, 40, 12); else ctx.rect(mx - 4, y - 22, 420, 40);
    ctx.fillStyle = sel ? "rgba(255,216,74,0.95)" : "rgba(255,246,232,0.92)";
    ctx.fill();
    ctx.strokeStyle = UI.stroke;
    ctx.lineWidth = sel ? 3 : 2;
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.fillStyle = UI.stroke;
    ctx.font = "700 15px " + UI.sans;
    ctx.fillText(r.label, mx + 14, y + 3);
  });
  uiLabel("Réduire mouvements = moins de shake / zoom / slow-mo", mx, 400, 12, UI.muted, 0.35);
  uiLabel("Anti-flash = pas d’éclair bombe ni clignotements agressifs", mx, 420, 12, UI.muted, 0.35);
  hit(mx + 70, H - 28, 160, 28, "OptComfortBack");
}

function drawOptionsBinds() {
  menuScreenBase({
    title: "Contrôles",
    kicker: "Clavier · Joueur 1",
    subtitle: rebindWait
      ? "Appuie sur une touche… (Échap pour annuler)"
      : "Clique une action, puis la nouvelle touche · J2 = flèches"
  });
  const mx = UI.mx;
  const actions = typeof KEYBIND_ACTIONS !== "undefined" ? KEYBIND_ACTIONS : [];
  actions.forEach((action, i) => {
    const code = "Bind_p1_" + action;
    const y = 210 + i * 38;
    const waiting = rebindWait && rebindWait.player === "p1" && rebindWait.action === action;
    const sel = waiting || (padConnected && navIdx === i) || isHover(code);
    hit(mx + 200, y, 400, 32, code);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(mx - 4, y - 18, 420, 32, 10); else ctx.rect(mx - 4, y - 18, 420, 32);
    ctx.fillStyle = waiting ? "rgba(255,180,80,0.95)" : (sel ? "rgba(255,216,74,0.95)" : "rgba(255,246,232,0.92)");
    ctx.fill();
    ctx.strokeStyle = UI.stroke;
    ctx.lineWidth = sel || waiting ? 3 : 2;
    ctx.stroke();
    const label = (KEYBIND_LABELS && KEYBIND_LABELS[action]) || action;
    const keyLabel = waiting
      ? "…"
      : formatKeyCode(keybinds.p1[action]);
    ctx.textAlign = "left";
    ctx.fillStyle = UI.stroke;
    ctx.font = "700 14px " + UI.sans;
    ctx.fillText(label, mx + 14, y + 3);
    ctx.textAlign = "right";
    ctx.font = "800 14px " + UI.mono;
    ctx.fillText(keyLabel, mx + 400, y + 3);
  });

  const resetY = 210 + actions.length * 38 + 10;
  const resetSel = (padConnected && navIdx === actions.length) || isHover("OptResetBinds");
  hit(mx + 200, resetY, 400, 30, "OptResetBinds");
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(mx - 4, resetY - 16, 420, 30, 10); else ctx.rect(mx - 4, resetY - 16, 420, 30);
  ctx.fillStyle = resetSel ? "rgba(255,216,74,0.95)" : "rgba(255,246,232,0.88)";
  ctx.fill();
  ctx.strokeStyle = UI.stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillStyle = UI.stroke;
  ctx.font = "700 13px " + UI.sans;
  ctx.fillText("Réinitialiser (défaut A D W F E)", mx + 14, resetY + 2);

  uiLabel("Espace = alias saut · Slash = frappe J2", mx, H - 48, 11, UI.muted, 0.35);
  hit(mx + 70, H - 28, 160, 28, "OptBindsBack");
  // « Échap ← Retour » vient de menuScreenBase — pas de 2e ligne ici
}

function drawPauseMenu() {
  ctx.fillStyle = "rgba(12, 20, 42, 0.72)";
  ctx.fillRect(0, 0, W, H);
  const pw = 360, ph = online ? 268 : 240;
  const px = (W - pw) / 2, py = (H - ph) / 2 - 8;
  ctx.fillStyle = "rgba(255,246,232,0.97)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 18); else ctx.rect(px, py, pw, ph);
  ctx.fill();
  ctx.strokeStyle = UI.stroke; ctx.lineWidth = 3.5; ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = UI.stroke;
  ctx.font = "800 28px " + UI.display;
  ctx.fillText("PAUSE", W / 2, py + 42);
  if (online) {
    ctx.font = "600 12px " + UI.sans;
    ctx.fillStyle = "rgba(27,23,48,0.62)";
    ctx.fillText("Menu local — la partie continue en ligne", W / 2, py + 66);
  }

  const btns = [
    { code: "PauseResume", label: "Reprendre" },
    { code: "PauseOptions", label: "Options" },
    { code: "PauseQuit", label: online ? "Abandonner" : "Quitter" }
  ];
  if (pauseNavIdx < 0 || pauseNavIdx >= btns.length) pauseNavIdx = 0;
  const btnTop = online ? 96 : 88;
  btns.forEach((b, i) => {
    const y = py + btnTop + i * 42;
    const sel = pauseNavIdx === i || isHover(b.code);
    if (isHover(b.code)) pauseNavIdx = i;
    hit(W / 2, y, 220, 34, b.code);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(W / 2 - 110, y - 16, 220, 34, 12);
    else ctx.rect(W / 2 - 110, y - 16, 220, 34);
    ctx.fillStyle = sel ? "rgba(255,216,74,0.95)" : "rgba(255,255,255,0.55)";
    ctx.fill();
    ctx.strokeStyle = UI.stroke; ctx.lineWidth = sel ? 3 : 2; ctx.stroke();
    ctx.fillStyle = UI.stroke;
    ctx.font = "700 15px " + UI.sans;
    ctx.fillText(b.label, W / 2, y + 5);
  });
  ctx.font = "600 11px " + UI.sans;
  ctx.fillStyle = "rgba(27,23,48,0.55)";
  ctx.fillText("P / Échap reprendre  ·  ↑↓ Entrée", W / 2, py + ph - 16);
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
  if (padConnected) {
    return "Manette · [[X:LS]] · [[X:A]] valider · [[X:B]] retour";
  }
  if (hasTouch) return "Tactile — pavé + SAUT / SMASH / SUPER";
  return "Clavier  [[K:" + bindLabel("left") + "]][[K:" + bindLabel("right") + "]]  " +
    "[[K:" + bindLabel("jump") + "]] saut  [[K:" + bindLabel("smash") + "]] frappe  " +
    "[[K:" + bindLabel("super") + "]] SUPER";
}
function controlsHintColor() { return (padConnected || hasTouch) ? "#7ed957" : UI.muted; }

/** Affiche controlsHint() avec pictos (si markup présent). */
function drawControlsHint(x, y, maxW) {
  const h = controlsHint();
  if (h.indexOf("[[") >= 0) {
    ctx.fillStyle = controlsHintColor();
    return drawControlMarkup(x, y, h, maxW || 420, 11);
  }
  uiLabel(h, x, y, 11, controlsHintColor(), 0.3);
  return y + 14;
}

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
  // Partie rapide = 1v1 forcé (pas d'étape équipes)
  const hasTeamChoice = (pendingMode.vsAI || pendingMode.online) && !pendingMode.quickplay;
  return (pendingMode.vsAI ? 1 : 0)                                  /* Difficulté (solo uniquement) */
       + 1                                                            /* Mode de jeu */
       + (hasTeamChoice ? 1 : 0)                                      /* 1v1 ou équipes (2v2) */
       + (pendingMode.bomb ? 1 : 0)                                   /* Durée de mèche */
       + (pendingMode.quickplay ? 0 : 2);                              /* Perso+terrain (sauf QP) */
}
function wizardStep(idx, label) { return "Étape " + idx + "/" + wizardTotal() + " · " + label; }

function drawAiDifficulty() {
  const title = (pendingMode && pendingMode.tournament) ? "Tournoi" : "Amical";
  menuScreenBase({ title: title, kicker: wizardStep(1, "Difficulté"),
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
    : pendingMode.vsAI ? "Amical — " + AI_LEVELS[pendingMode.aiLevel].name
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

  if (pendingMode && pendingMode.quickplay) {
    uiLabel("Partie rapide : 1v1 uniquement · recherche d’adversaire (bot si besoin)", UI.mx, 376, 11, UI.muted, 1);
  } else if (teamChoice) {
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
      left: keyHeldPlayer("p1", "left"), right: keyHeldPlayer("p1", "right"),
      up: false, down: false, ax: 0, ay: 0,
      smash: keyHeldPlayer("p1", "smash"),
      jump: keyHeldPlayer("p1", "jump"),
      super: keyHeldPlayer("p1", "super")
    };
  }
  // Clavier : visée démo = stick fictif neutre (géométrie en match)
  const leftSide = tutorialSide === 0;
  const p = leftSide ? "p1" : "p2";
  return {
    left:  keyHeldPlayer(p, "left"),
    right: keyHeldPlayer(p, "right"),
    up: false, down: false, ax: 0, ay: 0,
    smash: keyHeldPlayer(p, "smash"),
    jump:  keyHeldPlayer(p, "jump"),
    super: keyHeldPlayer(p, "super")
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
  const kL = bindLabel("left"), kR = bindLabel("right"), kJ = bindLabel("jump");
  const kF = bindLabel("smash"), kS = bindLabel("super");
  // [[K:…]] = picto clavier · [[X:…]] = picto Xbox
  const rows = {
    keyboard: [
      ["Bouger / sauter", "[[K:" + kL + "]] [[K:" + kR + "]] bouger  ·  [[K:" + kJ + "]] / [[K:Espace]] sauter"],
      ["Cloche (au sol)", "Place-toi sous la balle — cloche auto"],
      ["Smash (en l'air)", "Saute au contact : smash auto"],
      ["Service", "[[K:" + kF + "]] lancer, puis saute et frappe en l'air"],
      ["SUPER (jauge or)", "3 points d'affilée → [[K:" + kS + "]]"],
      ["Super Smash", "Jauge orange → maintiens [[K:" + kF + "]] en l'air, relâche"],
      ["Pause", "[[K:P]] ou [[K:Échap]]"]
    ],
    pad: [
      ["Déplacement", "[[X:LS]] stick gauche  ou  [[X:DPAD]] croix"],
      ["Saut", "[[X:A]]  (double saut en l'air)"],
      ["Cloche / smash", "[[X:X]] / [[X:Y]]  —  sol = cloche · air = smash"],
      ["SUPER (jauge or)", "[[X:B]]  (ou [[X:RB]]) — technique du perso"],
      ["Super Smash", "Jauge orange → maintiens [[X:Y]] en l'air, relâche"],
      ["Pause", "[[X:START]]"],
      ["Menus", "[[X:LS]] · [[X:A]] valider · [[X:B]] retour"]
    ],
    touch: [
      ["Déplacement", "Pavé ◀ ▶ en bas à gauche"],
      ["Saut", "Bouton ⤒"],
      ["Cloche / smash", "Bouton ⚡"],
      ["SUPER", "Bouton ★"],
      ["Super Smash", "Maintiens ⚡ en l'air jauge pleine"]
    ],
    mouse: [
      ["En match", "Souris = menus uniquement"],
      ["Pour jouer", "[[K:" + kL + "]] [[K:" + kR + "]] · [[K:" + kJ + "]] saut · [[K:" + kF + "]] frappe · [[K:" + kS + "]] SUPER"]
    ]
  };
  const list = rows[dev] || rows.keyboard;
  let yy = y;
  ctx.textAlign = "left";
  for (const [title, body] of list) {
    ctx.fillStyle = "#7ed957";
    ctx.font = "800 12px " + UI.sans;
    ctx.fillText(title, x, yy);
    yy += 18;
    yy = drawControlMarkup(x, yy, body, maxW, 12);
    yy += 6;
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
  const footH = 48;
  const panelX = UI.mx - 16, panelY = 14;
  const panelW = W - UI.mx * 2 + 32, panelH = H - 36;
  ctx.fillStyle = "rgba(12, 20, 42, 0.88)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 18);
  else ctx.rect(panelX, panelY, panelW, panelH);
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

  // Contenu au-dessus du pied (évite de recouvrir Retour)
  const contentBottom = panelY + panelH - footH;
  ctx.save();
  ctx.beginPath();
  ctx.rect(panelX + 4, 130, panelW - 8, contentBottom - 130);
  ctx.clip();

  // Colonne gauche : commandes
  const leftX = UI.mx;
  const leftW = W * 0.42;
  drawTutorialControls(dev, leftX, 148, leftW - 8);

  // Colonne droite : démo aim
  const demoCx = W * 0.72;
  const demoCy = Math.min(H * 0.52, contentBottom - 90);
  ctx.fillStyle = "rgba(255,246,232,0.08)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(W * 0.48, 140, W * 0.46, contentBottom - 148, 14);
  else ctx.rect(W * 0.48, 140, W * 0.46, contentBottom - 148);
  ctx.fill();

  uiLabel("Visée live — bouge stick / touches", W * 0.50, 158, 12, UI.gold, 0.2);

  drawTutorialTab(tutorialAimLob ? "Mode : Cloche" : "Mode : Smash", "TutAim", W * 0.58, 182, 120, true);
  drawTutorialTab(tutorialSide === 0 ? "Camp : Gauche" : "Camp : Droite", "TutSide", W * 0.78, 182, 120, false);

  ctx.save();
  ctx.beginPath();
  ctx.rect(W * 0.48 + 4, 200, W * 0.46 - 8, Math.max(40, contentBottom - 208));
  ctx.clip();
  drawTutorialAimDemo(demoCx, demoCy);
  ctx.restore();

  ctx.restore(); // fin clip contenu

  // Pied fixe : 2 boutons seuls (pas de hint centré qui se superpose)
  const footY = contentBottom;
  ctx.fillStyle = "rgba(12, 20, 42, 0.96)";
  ctx.fillRect(panelX + 2, footY, panelW - 4, footH - 4);
  ctx.strokeStyle = "rgba(255,246,232,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(panelX + 12, footY);
  ctx.lineTo(panelX + panelW - 12, footY);
  ctx.stroke();

  const backW = hasTouch ? 180 : 168;
  const playW = hasTouch ? 180 : 170;
  const btnY = footY + footH / 2 - 2;
  if (navIdx < 0 || navIdx > 1) navIdx = 0;
  const selBack = !padConnected || navIdx === 0;
  const selPlay = padConnected && navIdx === 1;
  const backLbl = padConnected ? "← Retour · B" : "← Retour · Échap";
  drawTutorialTab(backLbl, "TutBack", UI.mx + backW / 2, btnY, backW, selBack);
  drawTutorialTab("Jouer le tutoriel", "TutPlay", W - UI.mx - playW / 2, btnY, playW, selPlay);
}

/** Bandeau coach tutoriel — créneau central de la bande score (entre les 2 pastilles). */
function drawTutorialCoach() {
  if (!tutorialMode || (state !== "serve" && state !== "play")) return;
  const tip = TUTORIAL_STEPS[Math.min(tutorialStep, TUTORIAL_STEPS.length - 1)];
  if (!tip) return;
  const pad = typeof padConnected !== "undefined" && padConnected;
  const body = tutorialStepBody(tip);
  const canSkip = tutorialStepCanSkip();

  // Géométrie alignée sur drawHUD : pastilles à W*0.22 / W*0.78, pw=132, py=GROUND_Y+14
  const pillR = W * 0.22 + 66;   // bord droit pastille gauche
  const pillL = W * 0.78 - 66;   // bord gauche pastille droite
  const gap = pillL - pillR;
  const pw = Math.min(340, Math.max(200, gap - 16));
  const ph = 62;                 // même hauteur que les pastilles score
  const px = (W - pw) / 2;
  const py = GROUND_Y + 14;
  // Ne pas dépasser le bas du canvas (SCORE_BAND)
  if (py + ph > H - 2) return;

  ctx.save();
  ctx.fillStyle = "rgba(12,20,42,0.96)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 12); else ctx.rect(px, py, pw, ph);
  ctx.fill();
  ctx.strokeStyle = UI.gold; ctx.lineWidth = 2.5; ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = UI.gold;
  ctx.font = "800 12px " + UI.sans;
  ctx.fillText(
    "Tutoriel · " + (tutorialStep + 1) + "/" + TUTORIAL_STEPS.length + "  —  " + tip.title,
    W / 2, py + 14
  );

  const textW = pw - 20;
  // Avec « Passer », laisser de l'air vertical entre body et pictos skip
  const bodyY = canSkip ? py + 32 : py + 36;
  if (typeof drawControlMarkup === "function" && body.indexOf("[[") >= 0) {
    const est = typeof measureControlMarkup === "function"
      ? Math.min(textW, measureControlMarkup(body, 12))
      : Math.min(textW, 200);
    drawControlMarkup(px + (pw - est) / 2, bodyY, body, textW, 12);
  } else {
    ctx.fillStyle = "rgba(255,246,232,0.95)";
    ctx.font = "700 12px " + UI.sans;
    ctx.fillText(body, W / 2, bodyY);
  }

  if (canSkip) {
    // Manette : Select/View — jamais A (saut) ni B (SUPER)
    const skip = pad ? "Passer [[X:SELECT]]" : "Passer [[K:Entrée]]";
    if (typeof drawControlMarkup === "function") {
      ctx.globalAlpha = 0.85;
      const est = typeof measureControlMarkup === "function"
        ? Math.min(textW, measureControlMarkup(skip, 10))
        : Math.min(textW, 120);
      drawControlMarkup(px + (pw - est) / 2, py + ph - 9, skip, textW, 10);
    }
  }
  ctx.restore();
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
  y = drawControlMarkup(lx, y,
    "Clavier [[K:" + bindLabel("left") + "]][[K:" + bindLabel("right") + "]] " +
    "[[K:" + bindLabel("jump") + "]] saut [[K:" + bindLabel("smash") + "]] frappe " +
    "[[K:" + bindLabel("super") + "]] SUPER", leftW, 12);
  y = drawControlMarkup(lx, y,
    "Manette [[X:LS]] · [[X:A]] saut · [[X:X]]/[[X:Y]] frappe · [[X:B]] SUPER · [[X:START]] pause",
    leftW, 12);
  p("Clavier : sol = cloche · air = smash. Droite local : flèches + Shift dr. SUPER.");
  y = drawControlMarkup(lx, y, "Pause [[K:P]] / [[K:Échap]] · son [[K:M]] · musique [[K:N]]", leftW, 12);
  y += 4;
  h("Gameplay");
  p("Au sol, balle sur toi = cloche auto. En l'air = smash auto au contact.");
  y = drawControlMarkup(lx, y,
    "Service : [[K:" + bindLabel("smash") + "]] / [[X:X]] lancer, puis saute et frappe (pas au sol).",
    leftW, 12);
  y += 4;
  h("★ SUPER", "#ffd93d");
  y = drawControlMarkup(lx, y,
    "3 points d'affilée → [[K:" + bindLabel("super") + "]] ou [[X:B]] (technique du perso).",
    leftW, 12);
  y += 4;
  h("⚡ SUPER SMASH", "#ff6a2a");
  y = drawControlMarkup(lx, y,
    "Jauge orange pleine → maintiens [[K:" + bindLabel("smash") + "]] / [[X:Y]] en l'air, relâche.",
    leftW, 12);
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

  uiLabel("↑↓←→ · Entrée valider · 1–" + n + "  ·  Échap ← retour",
          UI.mx, H - 18, 11, UI.muted, 0.3);
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

  // Picker ballon cosmétique (skins débloqués via tournoi)
  const skin = BALL_SKINS[ballSkin] || BALL_SKINS[0];
  const unlockedN = (typeof meta !== "undefined" && meta && meta.ballUnlocked)
    ? meta.ballUnlocked.length : 1;
  hit(UI.mx + 70, 448, 48, 24, "BallPrev");
  hit(UI.mx + 220, 448, 48, 24, "BallNext");
  uiLabel("◀ ▶ Ballon : " + (skin ? skin.name : "Cartoon") +
    " (" + unlockedN + "/" + BALL_SKINS.length + ")" +
    "  ·  C calme : " + (mapEventsQuiet ? "ON" : "OFF"),
    UI.mx, H - 34, 11, UI.muted, 0.3);
  uiLabel("Échap ← retour", UI.mx, H - 16, 11, UI.muted, 0.3);
}

