// sommet-volley · entrées — clavier & manettes (Gamepad API)
"use strict";

// ---------- Entrées clavier ----------
const keys = {};
let xSeq = "";
window.addEventListener("keydown", e => {
  keys[e.code] = true;
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","KeyW","KeyA","KeyS","KeyD","KeyE","KeyF","Slash","ShiftRight"].includes(e.code)) e.preventDefault();
  const ch = (e.key || "").toLowerCase();
  if (ch.length === 1) { xSeq = (xSeq + ch).slice(-4); if (xSeq === "rler" && typeof xToggleLocal === "function") xToggleLocal(); }
  // Toggle Gameplay V2 (touche `) — hors saisie de code en ligne
  if (e.code === "Backquote" && state !== "joinEntry") {
    GAMEPLAY_V2 = !GAMEPLAY_V2;
    if (typeof beep === "function") beep(GAMEPLAY_V2 ? 720 : 320, 0.06, "square", 0.08);
  }
  handleMenuKeys(e.code, e.key);
});
window.addEventListener("keyup", e => { keys[e.code] = false; });

// ---------- Souris (navigation des menus uniquement) ----------
// Convertit une position écran (px CSS) en repère logique 900×500 : le canvas
// est affiché à une taille CSS variable (voir resizeCanvas() dans core.js),
// donc on ne peut pas comparer directement clientX/Y aux coordonnées de jeu.
let mouseX = -1, mouseY = -1, mouseActive = false;
function toGameXY(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return { x: (clientX - rect.left) / rect.width * W, y: (clientY - rect.top) / rect.height * H };
}
// portée globale (pas seulement dans le bloc ci-dessous) : les menus (menus.js)
// s'en servent pour adapter le texte d'aide (clavier/manette/tactile).
const hasTouch = (typeof window !== "undefined") &&
  (("ontouchstart" in window) || (navigator && navigator.maxTouchPoints > 0));
if (typeof canvas.addEventListener === "function") { // absent en environnement de test (voir tests/_load.js)
  canvas.addEventListener("mousemove", e => {
    const p = toGameXY(e.clientX, e.clientY);
    mouseX = p.x; mouseY = p.y; mouseActive = true;
  });
  canvas.addEventListener("mouseleave", () => { mouseActive = false; });
  canvas.addEventListener("click", e => {
    const p = toGameXY(e.clientX, e.clientY);
    const code = hitTestIn(menuHitboxesPrev, p.x, p.y);
    if (code) handleMenuKeys(code, "");
  });

  // ---------- Contrôles tactiles (mobile) ----------
  // Pilotent directement `keys{}`, exactement comme le clavier : aucun
  // changement requis dans localInputs()/onlineLocalInput(), qui lisent déjà
  // cet objet partagé. Le pavé tactile est UNIQUE (pas un par joueur) : sur
  // un téléphone, un seul joueur humain tient l'appareil, donc on détermine
  // dynamiquement QUEL jeu de touches physiques il pilote selon le contexte.
  if (hasTouch) {
    const tc = document.getElementById("touchControls");
    function touchKeySet() {
      if (online) {
        if (mySlot === 0) return { left: "KeyA", right: "KeyD", jump: "KeyW", smash: "KeyF", super: "KeyE" };
        if (mySlot === 1) return { left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp", smash: "KeyF", super: "ShiftRight" };
        return null; // 2v2 en ligne (slots 2/3) : pas pris en charge au tactile
      }
      if (vsAI || mode === "2v2") return { left: "KeyA", right: "KeyD", jump: "KeyW", smash: "KeyF", super: "KeyE" };
      return null; // 2 joueurs locaux sur le même appareil : peu pertinent au tactile
    }
    function bindTouchBtn(sel, field) {
      const btn = tc.querySelector(sel);
      let heldCode = null;
      const press = e => {
        e.preventDefault();
        const set = touchKeySet();
        heldCode = set && set[field];
        if (heldCode) { keys[heldCode] = true; btn.classList.add("tc-active"); }
      };
      const release = e => {
        if (e) e.preventDefault();
        if (heldCode) keys[heldCode] = false;
        heldCode = null;
        btn.classList.remove("tc-active");
      };
      btn.addEventListener("touchstart", press, { passive: false });
      btn.addEventListener("touchend", release, { passive: false });
      btn.addEventListener("touchcancel", release, { passive: false });
    }
    bindTouchBtn('[data-tc="left"]', "left");
    bindTouchBtn('[data-tc="right"]', "right");
    bindTouchBtn('[data-tc="jump"]', "jump");
    bindTouchBtn('[data-tc="smash"]', "smash");
    bindTouchBtn('[data-tc="super"]', "super");

    // affiché uniquement pendant une manche jouable, et seulement si un jeu
    // de touches s'applique effectivement (sinon les boutons ne feraient rien)
    setInterval(() => {
      const show = (state === "play" || state === "serve") && !!touchKeySet();
      tc.classList.toggle("tc-visible", show);
    }, 200);
  }
}

// ---------- Manettes (Gamepad API) ----------
// Manette 1 → joueur Rouge, manette 2 → joueur Vert. Le clavier reste actif
// en parallèle. Stick gauche / croix : bouger · A, B, X, Y ou croix-haut : sauter.
// Dans les menus : croix/stick pour surligner, A pour valider, B pour revenir.
const PAD_DEADZONE = 0.4;
let padsNow = [], padsPrev = [];
let padConnected = false;
let navIdx = 0; // option surlignée à la manette dans les menus

function readPad(gp) {
  if (!gp || !gp.connected) return null;
  const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed);
  const rawAx = gp.axes[0] || 0, rawAy = gp.axes[1] || 0;
  // Deadzone aussi sur la visée : un stick au repos (dérive ~0.2) cassait
  // isKeyboardStyleAim (≥0.18) → plus de smash/cloche auto au clavier.
  const ax = Math.abs(rawAx) < PAD_DEADZONE ? 0 : rawAx;
  const ay = Math.abs(rawAy) < PAD_DEADZONE ? 0 : rawAy;
  return {
    left:    rawAx < -PAD_DEADZONE || b(14),
    right:   rawAx >  PAD_DEADZONE || b(15),
    jump:    b(0) || b(12),                             // A / croix-haut
    smash:   b(2) || b(3),                              // X ou Y → smash
    superT:  b(1) || b(4) || b(5) || b(6) || b(7),      // B / gâchettes → SUPER
    up:      rawAy < -0.5 || b(12),
    down:    rawAy >  0.5 || b(13),
    ax, ay,                 // stick analog (visée à l'appui)
    confirm: b(0),          // A / Croix
    back:    b(1) || b(8)   // B / Rond, ou Select
  };
}

// relu à chaque frame d'affichage (l'API Gamepad se sonde, pas d'événements)
function pollPads() {
  padsPrev = padsNow;
  padsNow = [];
  const list = (navigator.getGamepads && navigator.getGamepads()) || [];
  for (const gp of list) {
    const r = readPad(gp);
    if (r) padsNow.push(r);
  }
  padConnected = padsNow.length > 0;
}

// front montant du bouton sur au moins une manette (pour les menus)
function padEdge(field) {
  for (let i = 0; i < padsNow.length; i++) {
    if (padsNow[i][field] && !(padsPrev[i] && padsPrev[i][field])) return true;
  }
  return false;
}

// entrées de jeu de la manette n° i (fusionnées avec le clavier)
function padGameInput(i) {
  const p = padsNow[i];
  return p
    ? { left: p.left, right: p.right, jump: p.jump, smash: p.smash, super: p.superT, up: p.up, down: p.down, ax: p.ax, ay: p.ay }
    : { left: false, right: false, jump: false, smash: false, super: false, up: false, down: false, ax: 0, ay: 0 };
}

// ---------- Assignation manette en 1v1 local (clavier VS manette) ----------
// Deux humains sur la même machine :
//  · DEUX manettes branchées → une chacun (manette 1 → Gauche, 2 → Droite) ;
//  · UNE seule manette → elle pilote le côté assigné ci-dessous. Défaut :
//    Droite, pour que le clavier « principal » (Q/D/Z/S) reste au joueur
//    Gauche — un joueur au clavier, l'autre à la manette, sans se marcher
//    dessus. Basculable sur l'écran « Mode de jeu » local (touche G / clic),
//    et mémorisé d'une session à l'autre.
let padSideLocal = 1;
try {
  const v = localStorage.getItem("sommet-pad-side");
  if (v === "0" || v === "1") padSideLocal = +v;
} catch (e) { /* localStorage indisponible : défaut conservé */ }

function setPadSideLocal(side) {
  padSideLocal = side ? 1 : 0;
  try { localStorage.setItem("sommet-pad-side", String(padSideLocal)); } catch (e) {}
}

// entrées manette pour un CÔTÉ donné en 1v1 local à deux humains
function padForSide(side) {
  if (padsNow.length >= 2) return padGameInput(side);            // une manette chacun
  if (padsNow.length === 1 && side === padSideLocal) return padGameInput(0);
  return { left: false, right: false, jump: false, smash: false, super: false, up: false, down: false, ax: 0, ay: 0 };
}

// une touche de saut/confirmation est-elle enfoncée ? Sert à faire avancer
// manuellement l'écran "Point pour ..." (voir stepGame/netUpdate) — couvre
// clavier (les deux jeux de touches de saut, + Espace/Entrée universels),
// manette, et tactile (qui pilote déjà KeyW/ArrowUp via les mêmes touches,
// voir touchKeySet plus haut).
function pointAdvanceRequested() {
  if (keys["Space"] || keys["Enter"] || keys["KeyW"] || keys["ArrowUp"]) return true;
  for (const p of padsNow) if (p.jump) return true;
  return false;
}

// options navigables à la manette, par état (mêmes codes que le clavier)
function navOptions() {
  switch (state) {
    case "menu":          return tutorialInviteOpen
      ? ["TutPlay", "TutLater", "TutNever"]
      : ["Digit1", "Digit2", "KeyT", "KeyH", "KeyR", "KeyC"];
    case "soloMenu":      return ["Digit1", "Digit2", "Digit3"];
    case "multiMenu":     return ["Digit1", "Digit2"];
    case "tournamentBracket": return ["TourPlay", "TourBack"];
    case "tournamentEnding":  return ["TourBack"];
    case "aiDifficulty":  return ["Digit1", "Digit2", "Digit3", "Digit4"];
    case "bombDuration":  return ["Digit1", "Digit2", "Digit3"];
    case "teamFormat":
    case "bombFormat":
    case "flameFormat":   return ["Digit1", "Digit2"];
    // Solo / en ligne : Classique / Bombe / Flamme (puis teamFormat).
    // Multijoueur local : mêmes 3 modes, 1v1 seulement.
    case "gameModeSelect": return ["Digit1", "Digit2", "Digit3"];
    case "onlineMenu":    return ["Digit1", "Digit2"];
    case "selectCharacter": {
      const vis = characterIndices();
      return vis.map((_, slot) => "Digit" + (slot + 1));
    }
    case "selectTerrain": {
      // Comme selectCharacter : Digit1..N (y compris Digit10+ pour le 10ᵉ terrain).
      // Avant : liste figée à Digit9 → Jardin des Roses (index 9) inatteignable
      // aux flèches / Entrée / manette (seul le clic Digit10 passait).
      const visT = terrainIndices();
      return visT.map((_, slot) => "Digit" + (slot + 1));
    }
    default: return null;
  }
}

// Grille de navigation menus (persos / terrains) : { cols, rows } ou null = linéaire.
function menuNavGrid(n) {
  if (state === "selectCharacter") {
    if (n <= 4) return { cols: n, rows: 1 };
    const cols = Math.ceil(n / 2);
    return { cols, rows: Math.ceil(n / cols) };
  }
  if (state === "selectTerrain") {
    if (n <= 5) return { cols: n, rows: 1 };
    const cols = Math.ceil(n / 2);
    return { cols, rows: Math.ceil(n / cols) };
  }
  return null;
}

/** Déplace navIdx selon une grille 2D (haut/bas/gauche/droite). Retourne true si bougé. */
function moveMenuNav(dir) {
  const opts = navOptions();
  if (!opts || !opts.length) return false;
  if (navIdx >= opts.length) navIdx = 0;
  const n = opts.length;
  const grid = menuNavGrid(n);
  let next = navIdx;
  if (!grid || grid.rows <= 1) {
    if (dir === "right" || dir === "down") next = (navIdx + 1) % n;
    else if (dir === "left" || dir === "up") next = (navIdx - 1 + n) % n;
    else return false;
  } else {
    const cols = grid.cols;
    let row = Math.floor(navIdx / cols);
    let col = navIdx % cols;
    if (dir === "left") col = (col - 1 + cols) % cols;
    else if (dir === "right") col = (col + 1) % cols;
    else if (dir === "up") row = (row - 1 + grid.rows) % grid.rows;
    else if (dir === "down") row = (row + 1) % grid.rows;
    else return false;
    next = row * cols + col;
    if (next >= n) {
      // dernière rangée plus courte : rester sur la dernière case de la rangée
      next = Math.min(n - 1, row * cols + Math.min(col, (n - 1) % cols));
      if (next >= n) next = n - 1;
    }
  }
  if (next === navIdx) return false;
  navIdx = next;
  beep(500, 0.03, "square", 0.05);
  return true;
}

function handlePadMenu() {
  const opts = navOptions();
  if (opts) {
    if (navIdx >= opts.length) navIdx = 0;
    const grid = menuNavGrid(opts.length);
    if (grid && grid.rows > 1) {
      if (padEdge("right")) moveMenuNav("right");
      if (padEdge("left")) moveMenuNav("left");
      if (padEdge("down")) moveMenuNav("down");
      if (padEdge("up")) moveMenuNav("up");
    } else {
      const horiz = state === "selectCharacter" || state === "selectTerrain";
      if (padEdge(horiz ? "right" : "down")) moveMenuNav("right");
      if (padEdge(horiz ? "left" : "up")) moveMenuNav("left");
    }
    if (padEdge("confirm")) { const c = opts[navIdx]; navIdx = 0; handleMenuKeys(c, ""); return; }
    if (padEdge("back")) { navIdx = 0; handleMenuKeys("Escape", ""); }
  } else if (state === "storyMenu" || state === "storySelect") {
    if (padEdge("down")) handleMenuKeys("ArrowDown", "");
    if (padEdge("up")) handleMenuKeys("ArrowUp", "");
    if (padEdge("confirm")) handleMenuKeys("Enter", "");
    if (padEdge("back")) handleMenuKeys("Escape", "");
  } else if (state === "storyScene" || state === "storyCharIntro" || state === "storyActIntro" || state === "storyEnding") {
    if (padEdge("confirm")) handleMenuKeys("Enter", "");
    if (padEdge("back")) handleMenuKeys("Escape", "");
  } else if (state === "tournamentBracket" || state === "tournamentEnding") {
    if (padEdge("confirm")) handleMenuKeys("Enter", "");
    if (padEdge("back")) handleMenuKeys("Escape", "");
  } else if (state === "rules" || state === "tutorialHelp" || state === "netError" || state === "credits") {
    if (padEdge("confirm") || padEdge("back")) handleMenuKeys("Escape", "");
  } else if ((state === "serve" || state === "play") && tutorialMode) {
    if (padEdge("confirm")) handleMenuKeys("Enter", "");
    if (padEdge("back")) handleMenuKeys("Escape", "");
  } else if (state === "gameover") {
    if (padEdge("confirm") && gameoverTimer <= 0) handleMenuKeys(online ? "KeyR" : "Space", "");
    if (padEdge("back")) handleMenuKeys("Escape", "");
  } else if (state === "hostWait" || state === "connecting" || state === "netWait" || state === "joinEntry") {
    if (padEdge("back")) handleMenuKeys("Escape", "");
  } else if (state === "hostLobby") {
    if (padEdge("confirm")) handleMenuKeys("Enter", "");
    if (padEdge("back")) handleMenuKeys("Escape", "");
  }
}

