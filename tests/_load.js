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
  "tournament.js",
  "story-campaigns.js",
  "story-bios.js",
  "story.js",
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
// localStorage mémoire (Node n'en a pas) — settings / méta / histoire.
if (typeof localStorage === "undefined" || !global.localStorage) {
  const _store = Object.create(null);
  define("localStorage", {
    getItem: (k) => (k in _store ? _store[k] : null),
    setItem: (k, v) => { _store[k] = String(v); },
    removeItem: (k) => { delete _store[k]; },
    clear: () => { for (const k of Object.keys(_store)) delete _store[k]; }
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
  setFlameMode: v => { flameMode = !!v; }, getFlameMode: () => flameMode,
  FLAME_HP_MAX: typeof FLAME_HP_MAX !== "undefined" ? FLAME_HP_MAX : 9,
  applyFlameBurn: typeof applyFlameBurn === "function" ? applyFlameBurn : null,
  mapEvent, getMapEvent: () => mapEvent,
  mapEventKind: typeof mapEventKind === "function" ? mapEventKind : () => null,
  mapEventsCanStep: typeof mapEventsCanStep === "function" ? mapEventsCanStep : () => false,
  setTerrain: v => { terrain = Math.max(0, Math.min(TERRAINS.length - 1, v | 0)); },
  getTerrain: () => terrain,
  musicForTerrain: typeof musicForTerrain === "function" ? musicForTerrain : null,
  musicKeyForState: typeof musicKeyForState === "function" ? musicKeyForState : null,
  loadAudioManifest: typeof loadAudioManifest === "function" ? loadAudioManifest : null,
  weatherFlavor: typeof weatherFlavor === "function" ? weatherFlavor : () => "rain",
  weatherClimate: typeof weatherClimate === "function" ? weatherClimate : null,
  stepWeather: typeof stepWeather === "function" ? stepWeather : () => {},
  resetWeather: typeof resetWeather === "function" ? resetWeather : () => {},
  getWeather: () => weather,
  setWeather: (w, timer) => { weather = w; if (timer !== undefined) weatherTimer = timer | 0; },
  getWeatherTimer: () => weatherTimer,
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
  navOptions: typeof navOptions === "function" ? navOptions : null,
  terrainIndices: typeof terrainIndices === "function" ? terrainIndices : null,
  CHAR_ANIM_DEFAULTS: typeof CHAR_ANIM_DEFAULTS !== "undefined" ? CHAR_ANIM_DEFAULTS : null,
  STORY: typeof STORY !== "undefined" ? STORY : null,
  getSTORY: () => (typeof STORY !== "undefined" ? STORY : null),
  STORY_BY_CHAR: typeof STORY_BY_CHAR !== "undefined" ? STORY_BY_CHAR : null,
  STORY_CAMPAIGNS: typeof STORY_CAMPAIGNS !== "undefined" ? STORY_CAMPAIGNS : null,
  storySelectCampaign: typeof storySelectCampaign === "function" ? storySelectCampaign : null,
  storyConfirmIntro: typeof storyConfirmIntro === "function" ? storyConfirmIntro : null,
  storyCharFiche: typeof storyCharFiche === "function" ? storyCharFiche : null,
  STORY_BIOS: typeof STORY_BIOS !== "undefined" ? STORY_BIOS : null,
  storyCharIdx: typeof storyCharIdx === "function" ? storyCharIdx : null,
  storyStartMatch: typeof storyStartMatch === "function" ? storyStartMatch : null,
  storySelectChapter: typeof storySelectChapter === "function" ? storySelectChapter : null,
  storyOnMatchEnd: typeof storyOnMatchEnd === "function" ? storyOnMatchEnd : null,
  storyAfterPostScene: typeof storyAfterPostScene === "function" ? storyAfterPostScene : null,
  storyBeginScene: typeof storyBeginScene === "function" ? storyBeginScene : null,
  getStoryScene: () => (typeof storyScene !== "undefined" ? storyScene : null),
  setStoryChapter: v => { if (typeof storyChapter !== "undefined") storyChapter = v | 0; },
  getStoryProgress: () => (typeof storyProgress !== "undefined" ? storyProgress : null),
  setStoryProgress: p => { if (typeof storyProgress !== "undefined") storyProgress = p; },
  getStoryFlags: () => ({
    active: typeof storyActive !== "undefined" ? storyActive : null,
    inMatch: typeof storyInMatch !== "undefined" ? storyInMatch : null
  }),
  TOURNAMENT_WIN_SCORE: typeof TOURNAMENT_WIN_SCORE !== "undefined" ? TOURNAMENT_WIN_SCORE : 7,
  matchWinScore: typeof matchWinScore === "function" ? matchWinScore : null,
  tournamentBuildBracket: typeof tournamentBuildBracket === "function" ? tournamentBuildBracket : null,
  tournamentSimPendingAi: typeof tournamentSimPendingAi === "function" ? tournamentSimPendingAi : null,
  tournamentStartNextMatch: typeof tournamentStartNextMatch === "function" ? tournamentStartNextMatch : null,
  tournamentOnMatchEnd: typeof tournamentOnMatchEnd === "function" ? tournamentOnMatchEnd : null,
  tournamentPlayerMatchIndex: typeof tournamentPlayerMatchIndex === "function" ? tournamentPlayerMatchIndex : null,
  tournamentChampion: typeof tournamentChampion === "function" ? tournamentChampion : null,
  tournamentReset: typeof tournamentReset === "function" ? tournamentReset : null,
  tournamentSimOne: typeof tournamentSimOne === "function" ? tournamentSimOne : null,
  getTournament: () => (typeof tournament !== "undefined" ? tournament : null),
  getTournamentFlags: () => ({
    active: typeof tournamentActive !== "undefined" ? tournamentActive : null,
    inMatch: typeof tournamentInMatch !== "undefined" ? tournamentInMatch : null
  }),
  setScores: (a, b) => { scores[0] = a | 0; scores[1] = b | 0; },
  BALL_SKINS: typeof BALL_SKINS !== "undefined" ? BALL_SKINS : [],
  getBallSkin: () => (typeof ballSkin !== "undefined" ? ballSkin : 0),
  setBallSkin: v => { ballSkin = v | 0; },
  getMeta: () => (typeof meta !== "undefined" ? meta : null),
  metaLoad: typeof metaLoad === "function" ? metaLoad : null,
  metaSave: typeof metaSave === "function" ? metaSave : null,
  metaOnTournamentWin: typeof metaOnTournamentWin === "function" ? metaOnTournamentWin : null,
  metaUseEquippedBall: typeof metaUseEquippedBall === "function" ? metaUseEquippedBall : null,
  metaCycleBallSkin: typeof metaCycleBallSkin === "function" ? metaCycleBallSkin : null,
  commitSetup: typeof commitSetup === "function" ? commitSetup : null,
  openOptions: typeof openOptions === "function" ? openOptions : null,
  leaveOptions: typeof leaveOptions === "function" ? leaveOptions : null,
  getReduceMotion: () => !!reduceMotion,
  setReduceMotion: v => { reduceMotion = !!v; },
  getFlashSafe: () => !!flashSafe,
  setFlashSafe: v => { flashSafe = !!v; },
  getJuiceLite: () => !!juiceLite,
  setJuiceLite: v => { juiceLite = !!v; },
  fxParticleMul: typeof fxParticleMul === "function" ? fxParticleMul : null,
  fxShakeMul: typeof fxShakeMul === "function" ? fxShakeMul : null,
  fxAllowFlash: typeof fxAllowFlash === "function" ? fxAllowFlash : null,
  fxCount: typeof fxCount === "function" ? fxCount : null,
  tossServeBall: typeof tossServeBall === "function" ? tossServeBall : null,
  applyHitExtras: typeof applyHitExtras === "function" ? applyHitExtras : null,
  getShake: () => shake,
  setShake: v => { shake = +v || 0; },
  getParticles: () => particles,
  localInputs: typeof localInputs === "function" ? localInputs : null,
  KEYBIND_DEFAULTS: typeof KEYBIND_DEFAULTS !== "undefined" ? KEYBIND_DEFAULTS : null,
  getKeybinds: () => (typeof keybinds !== "undefined" ? keybinds : null),
  applyKeybinds: typeof applyKeybinds === "function" ? applyKeybinds : null,
  resetKeybinds: typeof resetKeybinds === "function" ? resetKeybinds : null,
  startRebind: typeof startRebind === "function" ? startRebind : null,
  tryApplyRebind: typeof tryApplyRebind === "function" ? tryApplyRebind : null,
  cancelRebind: typeof cancelRebind === "function" ? cancelRebind : null,
  keyHeldPlayer: typeof keyHeldPlayer === "function" ? keyHeldPlayer : null,
  formatKeyCode: typeof formatKeyCode === "function" ? formatKeyCode : null,
  setPendingMode: v => { pendingMode = v; },
  saveSettings: typeof saveSettings === "function" ? saveSettings : null,
  loadSettings: typeof loadSettings === "function" ? loadSettings : null,
  handleMenuKeys: typeof handleMenuKeys === "function" ? handleMenuKeys : null,
  startQuickplay: typeof startQuickplay === "function" ? startQuickplay : null,
  startQuickplayBot: typeof startQuickplayBot === "function" ? startQuickplayBot : null,
  cancelQuickplay: typeof cancelQuickplay === "function" ? cancelQuickplay : null,
  getMmQuickplay: () => (typeof mmQuickplay !== "undefined" ? !!mmQuickplay : false),
  getOnline: () => !!online,
  getVsAI: () => !!vsAI,
  SPRITES: typeof SPRITES !== "undefined" ? SPRITES : null,
  spriteReady: typeof spriteReady === "function" ? spriteReady : () => false,
  SUPER_DUR: typeof SUPER_DUR !== "undefined" ? SUPER_DUR : {},
  SUPER_NEED: typeof SUPER_NEED !== "undefined" ? SUPER_NEED : 3,
  SUPER_SLOW_MUL: typeof SUPER_SLOW_MUL !== "undefined" ? SUPER_SLOW_MUL : 0.55,
  POWER_GAUGE_MAX: typeof POWER_GAUGE_MAX !== "undefined" ? POWER_GAUGE_MAX : 840,
  POWER_GAUGE_TOUCH: typeof POWER_GAUGE_TOUCH !== "undefined" ? POWER_GAUGE_TOUCH : 36,
  POWER_WINDUP_MIN: typeof POWER_WINDUP_MIN !== "undefined" ? POWER_WINDUP_MIN : 40,
  POWER_WINDUP_MAX: typeof POWER_WINDUP_MAX !== "undefined" ? POWER_WINDUP_MAX : 84,
  getPowerGauge: () => [powerGauge[0]|0, powerGauge[1]|0],
  setPowerGauge: (a, b) => {
    powerGauge[0] = a | 0;
    if (b !== undefined) powerGauge[1] = b | 0;
  },
  getPowerWindup: () => powerWindup,
  firePowerSmash: typeof firePowerSmash === "function" ? firePowerSmash : null,
  startPowerWindup: typeof startPowerWindup === "function" ? startPowerWindup : null,
  awardPoint: typeof awardPoint === "function" ? awardPoint : null,
  trySmashBall: typeof trySmashBall === "function" ? trySmashBall : null,
  getSuperCharge: () => [superCharge[0], superCharge[1]],
  setSuperCharge: (a, b) => {
    superCharge[0] = a | 0;
    if (b !== undefined) superCharge[1] = b | 0;
  },
  getStreak: () => [streak[0], streak[1]],
  CHAR_BASE_H: typeof CHAR_BASE_H !== "undefined" ? CHAR_BASE_H : 110,
  PROP_H: typeof PROP_H !== "undefined" ? PROP_H : null,
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
