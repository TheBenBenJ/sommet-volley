// Chargeur de test headless.
// Concatène les modules de src/ DANS L'ORDRE (comme index.html), les évalue
// dans un environnement Node avec un canvas factice, et expose les internes
// du jeu pour les assertions.
"use strict";
const fs = require("fs");
const path = require("path");

/** Ordre de chargement — doit rester aligné avec index.html. */
const SRC_ORDER = [
  "version.js",
  "core.js",
  "assets.js",
  "char-sprites.js",
  "audio.js",
  "input.js",
  "state.js",
  "characters.js",
  "physics.js",
  "scoring.js",
  "ai.js",
  "particles.js",
  "scenery.js",
  "terrains.js",
  "menus.js",
  "simulation.js",
  "snapshots.js",
  "net.js",
  "render.js",
  "main.js"
];

// --- canvas / navigateur factices (aucun rendu réel) ---
const noopCtx = new Proxy({}, {
  get: (t, p) => {
    if (p === "measureText") return () => ({ width: 100 });
    if (p === "createLinearGradient" || p === "createRadialGradient")
      return () => ({ addColorStop: () => {} });
    return typeof p === "string" ? () => noopCtx : undefined;
  },
  set: () => true
});

function define(name, value) {
  Object.defineProperty(global, name, { value, writable: true, configurable: true });
}
define("document", { getElementById: () => ({ getContext: () => noopCtx }), hidden: false });
define("window", { addEventListener: () => {} }); // pas d'innerWidth → resizeCanvas no-op
define("navigator", { getGamepads: () => [] });
define("requestAnimationFrame", () => 0);
define("setInterval", () => 0);
define("clearInterval", () => {});
if (typeof performance === "undefined") define("performance", require("perf_hooks").performance);
if (typeof Peer === "undefined") define("Peer", function () { return {}; }); // stub PeerJS
// Stub Image : les sprites chargent en async dans le navigateur ; en test
// headless on garde le fallback canvas (naturalWidth = 0 → spriteReady false).
if (typeof Image === "undefined") {
  define("Image", function () {
    this.complete = false;
    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this.src = "";
  });
}

// épilogue : ce que les tests peuvent inspecter/piloter
const EPILOGUE = `
;module.exports = {
  newGame, stepGame, startRally, update, getSnapshot, applySnapshot,
  startBattle, stepBattle,
  ball, blobL, blobR, blob2L, blob2R, scores, battle, aiInput, aiInput2v2, keys,
  setMode, getActiveBlobs: () => activeBlobs,
  getState: () => state, setState: v => { state = v; },
  getMode: () => mode, getTick: () => tick,
  setVsAI: v => { vsAI = v; }, setAiLevel: v => { aiLevel = v; },
  setServeCountdown: v => { serveCountdown = v; },
  setServingSide: v => { servingSide = v; },
  setBombMode: v => { bombMode = v; }, getBombMode: () => bombMode,
  getBombTimer: () => bombTimer, setBombTimer: v => { bombTimer = v; },
  setBombTime: v => { bombTime = v; }, getBombTime: () => bombTime,
  mapEvent, getMapEvent: () => mapEvent,
  mapEventKind: typeof mapEventKind === "function" ? mapEventKind : () => null,
  mapEventsCanStep: typeof mapEventsCanStep === "function" ? mapEventsCanStep : () => false,
  setTerrain: v => { terrain = Math.max(0, Math.min(TERRAINS.length - 1, v | 0)); },
  getTerrain: () => terrain,
  setMapEventsQuiet: v => { mapEventsQuiet = !!v; }, getMapEventsQuiet: () => mapEventsQuiet,
  setPaused: v => { paused = !!v; }, getPaused: () => paused,
  MAP_EVENT_WARN_T: typeof MAP_EVENT_WARN_T !== "undefined" ? MAP_EVENT_WARN_T : 120,
  updateBall,
  ballInGuestOwnZone, packBallState, applyBallState,
  simulateArc, aimAngleFromInput, clearBallHold,
  canActiveHit, setTick: v => { tick = v | 0; },
  getGameplayV2: () => GAMEPLAY_V2, setGameplayV2: v => { GAMEPLAY_V2 = !!v; },
  HOLD_MAX, RECEIVE_R, CHARGE_MAX, AIM_CONE,
  CHARACTERS, TERRAINS, superEffects,
  SPRITES: typeof SPRITES !== "undefined" ? SPRITES : null,
  spriteReady: typeof spriteReady === "function" ? spriteReady : () => false,
  SUPER_DUR: typeof SUPER_DUR !== "undefined" ? SUPER_DUR : {},
  consts: { W, H, NET_X, NET_W, NET_TOP, GROUND_Y, BALL_R, MAX_BALL_SPEED, GUEST_BALL_MARGIN, HOLD_LOB_SPD: typeof HOLD_LOB_SPD !== "undefined" ? HOLD_LOB_SPD : 0 }
};`;

function srcConcat() {
  const dir = path.join(__dirname, "..", "src");
  const present = new Set(fs.readdirSync(dir).filter(f => f.endsWith(".js")));
  const missing = SRC_ORDER.filter(f => !present.has(f));
  if (missing.length) {
    throw new Error("SRC_ORDER: fichiers manquants dans src/ : " + missing.join(", "));
  }
  const extra = [...present].filter(f => !SRC_ORDER.includes(f));
  if (extra.length) {
    throw new Error("SRC_ORDER: fichiers non listés (ajoute-les à SRC_ORDER / index.html) : " + extra.join(", "));
  }
  return SRC_ORDER.map(f => fs.readFileSync(path.join(dir, f), "utf8")).join("\n");
}

// charge une instance NEUVE du jeu (état frais à chaque appel)
function loadGame() {
  const mod = { exports: {} };
  const code = srcConcat() + EPILOGUE;
  new Function("module", "exports", "require", code)(mod, mod.exports, require);
  return mod.exports;
}

module.exports = { loadGame, SRC_ORDER };
