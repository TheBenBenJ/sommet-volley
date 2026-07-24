// Tests « filet de sécurité » — sans dépendance externe (node tests/game.test.js).
// Objectif : garantir que la simulation se comporte comme avant le découpage en
// modules. On charge le jeu exactement comme le navigateur (concat de src/ dans
// l'ordre) puis on pilote la simulation via l'API exposée par tests/_load.js.
"use strict";
const assert = require("assert");
const { loadGame } = require("./_load.js");

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log("  ✓ " + name); }
  catch (e) { fail++; console.log("  ✗ " + name + "\n      " + (e && e.message)); }
}

// démarre une partie 1v1 prête à jouer (balle lancée), IA à droite
function freshRally(seed) {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(seed);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false; g.ball.x = 250; g.ball.y = 200; g.ball.vx = 4; g.ball.vy = -6;
  return g;
}

console.log("sommet-volley — tests");

test("les modules se chargent et exposent l'API", () => {
  const g = loadGame();
  assert.strictEqual(typeof g.stepGame, "function");
  assert.strictEqual(typeof g.getSnapshot, "function");
  assert.ok(g.ball && g.blobL && g.blobR);
});

test("newGame initialise un état de service propre", () => {
  const g = loadGame();
  g.newGame(1);
  assert.strictEqual(g.getState(), "serve");
  assert.deepStrictEqual(g.scores, [0, 0]);
});

test("gravité : une balle libre en l'air accélère vers le bas", () => {
  const g = loadGame();
  g.newGame(1);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false; g.ball.x = 120; g.ball.y = 80; g.ball.vx = 0; g.ball.vy = 0;
  const y0 = g.ball.y;
  g.stepGame({ left:false,right:false,jump:false }, { left:false,right:false,jump:false });
  assert.ok(g.ball.vy > 0, "vy devrait être positive après un tick");
  assert.ok(g.ball.y > y0, "la balle devrait être descendue");
});

test("déterminisme : même graine + mêmes entrées → snapshots identiques", () => {
  const run = () => {
    const g = freshRally(1234);
    const neutral = { left:false, right:false, jump:false };
    for (let i = 0; i < 400; i++) g.stepGame(neutral, g.aiInput());
    return JSON.stringify(g.getSnapshot());
  };
  const a = run(), b = run();
  assert.strictEqual(a, b, "deux exécutions identiques doivent produire le même snapshot");
});

test("un échange finit par marquer un point (physique + IA + score)", () => {
  const g = freshRally(7);
  const neutral = { left:false, right:false, jump:false };
  let scored = false;
  for (let i = 0; i < 3000 && !scored; i++) {
    g.stepGame(neutral, g.aiInput());
    if (g.scores[0] + g.scores[1] > 0) scored = true;
  }
  assert.ok(scored, "aucun point marqué en 3000 ticks");
});

test("round-trip snapshot : appliquer un snapshot reproduit le même snapshot", () => {
  const g = freshRally(99);
  const neutral = { left:false, right:false, jump:false };
  for (let i = 0; i < 120; i++) g.stepGame(neutral, g.aiInput());
  const s1 = g.getSnapshot();
  g.applySnapshot(JSON.parse(JSON.stringify(s1)));
  const s2 = g.getSnapshot();
  assert.strictEqual(JSON.stringify(s2), JSON.stringify(s1));
});

test("2v2 : setMode('2v2') active 4 joueurs et la simulation tourne", () => {
  const g = loadGame();
  g.setMode("2v2");
  g.setAiLevel(1);
  g.newGame(3);
  const blobs = g.getActiveBlobs();
  assert.strictEqual(blobs.length, 4, "4 blobs attendus en 2v2");
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false; g.ball.x = 300; g.ball.y = 150; g.ball.vx = 5; g.ball.vy = -3;
  const t0 = g.getTick();
  for (let i = 0; i < 300; i++) {
    const ins = blobs.map((b, s) => s === 0
      ? { left:false, right:false, jump:false, super:false }
      : g.aiInput2v2(b));
    g.stepGame(null, null, ins);
  }
  assert.ok(g.getTick() > t0, "le tick doit avancer");
  assert.ok(Number.isFinite(g.ball.x) && Number.isFinite(g.ball.y), "balle en état fini");
  assert.ok(Number.isFinite(g.scores[0]) && Number.isFinite(g.scores[1]));
});

test("bombe : la mèche à zéro fait perdre le camp qui détient la bombe", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.setBombMode(true);
  g.newGame(5);
  g.setState("play"); g.setServeCountdown(0);
  // bombe immobile côté GAUCHE, mèche presque terminée
  g.ball.frozen = false; g.ball.x = 200; g.ball.y = 150; g.ball.vx = 0; g.ball.vy = 0;
  g.setBombTimer(5);
  const neutral = { left:false, right:false, jump:false, super:false };
  for (let i = 0; i < 12; i++) g.stepGame(neutral, neutral);
  assert.strictEqual(g.scores[0] + g.scores[1], 1, "un point doit tomber à l'explosion");
  assert.strictEqual(g.scores[1], 1, "bombe à gauche → le camp droit marque");
  assert.ok(g.getBombTimer() <= 0, "la mèche doit être à zéro");
});

test("bombe : touche le sol → explosion et point à l'adversaire", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.setBombMode(true);
  g.newGame(9);
  g.setState("play"); g.setServeCountdown(0);
  g.setBombTimer(600); // mèche pleine : c'est la CHUTE qui doit déclencher
  // bombe qui plonge côté DROIT, loin des joueurs (pas de renvoi possible)
  g.ball.frozen = false; g.ball.x = 850; g.ball.y = 430; g.ball.vx = 0; g.ball.vy = 6;
  const neutral = { left:false, right:false, jump:false, super:false };
  let scored = false;
  for (let i = 0; i < 30 && !scored; i++) {
    g.stepGame(neutral, neutral);
    if (g.scores[0] + g.scores[1] > 0) scored = true;
  }
  assert.ok(scored, "la bombe au sol doit marquer un point");
  assert.strictEqual(g.scores[0], 1, "bombe à droite → le camp gauche marque");
});

test("filet : une balle très rapide ne traverse pas le poteau (anti-tunnel)", () => {
  const g = loadGame();
  const C = g.consts;
  g.newGame(1);
  g.setState("play"); g.setServeCountdown(0);
  // balle juste à gauche du filet, sous le sommet, lancée à droite plus vite
  // qu'un tick de filet ne peut « couvrir » (franchissement en un seul pas)
  g.ball.frozen = false;
  g.ball.x = C.NET_X - C.NET_W / 2 - C.BALL_R - 2;
  g.ball.y = C.NET_TOP + 80;
  g.ball.vx = 40; g.ball.vy = 0;
  g.stepGame({ left:false,right:false,jump:false }, { left:false,right:false,jump:false });
  assert.ok(g.ball.x < C.NET_X, "la balle ne doit pas s'être téléportée de l'autre côté du filet");
  assert.ok(g.ball.vx < 0, "la balle doit avoir rebondi (vx inversée)");
});

test("service : contact filet = faute (pas de rebond qui sauve)", () => {
  const g = loadGame();
  const C = g.consts;
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(7);
  g.setServingSide(0);
  g.setState("play"); g.setServeCountdown(0);
  g.scores[0] = 0; g.scores[1] = 0;
  // Service en vol qui frappe le filet sous le sommet (ex-frôle TOP_SLACK)
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.ball.serveFlight = true;
  g.ball.x = C.NET_X - C.NET_W / 2 - C.BALL_R - 1;
  g.ball.y = C.NET_TOP - C.BALL_R + 3; // dans la zone de frôle
  g.ball.vx = 10; g.ball.vy = 1;
  g.stepGame(N, N);
  assert.strictEqual(g.getState(), "point", "filet au service → point (état)");
  assert.strictEqual(g.scores[1], 1, "point pour le camp adverse");
  assert.strictEqual(g.scores[0], 0, "serveur ne marque pas");
  assert.ok(!g.ball.serveFlight, "serveFlight levé après faute");
});

test("roster : Tsar Volkoï est le perso pilote (index 0)", () => {
  const g = loadGame();
  assert.ok(g.CHARACTERS && g.CHARACTERS.length >= 3);
  assert.strictEqual(g.CHARACTERS[0].key, "volkoi");
  assert.strictEqual(g.CHARACTERS[0].name, "Tsar Volkoï");
  assert.strictEqual(g.CHARACTERS[1].key, "dorf");
  assert.strictEqual(g.CHARACTERS[2].key, "cygne");
  assert.ok(g.CHARACTERS[0].coldProof);
  assert.ok(g.CHARACTERS[1].egoCharge);
  assert.ok(g.CHARACTERS[2].swapStats);
});

test("roster : Le Faucon (Citadelle du Levant) est jouable", () => {
  const g = loadGame();
  const i = g.CHARACTERS.findIndex(c => c.key === "faucon");
  assert.ok(i >= 0, "faucon dans CHARACTERS");
  assert.strictEqual(g.CHARACTERS[i].name, "Le Faucon");
  assert.ok(g.CHARACTERS[i].egoCharge, "egoCharge");
  const col = g.TERRAINS.find(t => t.key === "citadelle-du-levant");
  assert.ok(col, "terrain colline");
  assert.strictEqual(col.character, i, "public Citadelle = Faucon");
});

test("roster : Le Safran est jouable (Voile d’Or)", () => {
  const g = loadGame();
  const i = g.CHARACTERS.findIndex(c => c.key === "safran");
  assert.ok(i >= 0, "safran dans CHARACTERS");
  assert.strictEqual(g.CHARACTERS[i].name, "Le Safran");
  assert.strictEqual(g.CHARACTERS[i].superName, "Voile d’Or");
  assert.ok(g.CHARACTERS[i].control >= 0.91, "contrôle élevé");
});

test("roster : noms fictionnalisés (casting Steam)", () => {
  const g = loadGame();
  const want = {
    volkoi: "Tsar Volkoï", dorf: "Baron Dorf", cygne: "Le Cygne",
    bebe: "Maréchal Bébé", timonier: "Le Grand Timonier", sultan: "Le Sultan",
    gourou: "Le Gourou", capitaine: "Le Capitaine", faucon: "Le Faucon", safran: "Le Safran"
  };
  for (const c of g.CHARACTERS) {
    if (want[c.key]) assert.strictEqual(c.name, want[c.key], c.key);
  }
  assert.strictEqual(g.CHARACTERS.find(c => c.key === "cygne").superName, "Passage en Force");
  const maps = Object.fromEntries(g.TERRAINS.map(t => [t.key, t.name]));
  assert.strictEqual(maps["country-club-dore"], "Country Club Doré");
  assert.strictEqual(maps["palais-du-coq"], "Palais du Coq");
  assert.strictEqual(maps["cite-du-matin"], "Cité du Matin");
  assert.strictEqual(maps["pont-des-deux-mondes"], "Pont des Deux Mondes");
  assert.strictEqual(maps["grande-foret"], "Grande Forêt");
});

test("sprites : défaut walk = 4 frames (packs walk_0..3)", () => {
  const g = loadGame();
  assert.strictEqual(g.CHAR_ANIM_DEFAULTS.walk, 4,
    "walk:8 cassait charAnimReady (PNG 4..7 absents)");
});

test("sprites : aucun PNG partagé entre deux persos (anti-contamination)", () => {
  const fs = require("fs");
  const path = require("path");
  const crypto = require("crypto");
  const root = path.join(__dirname, "..", "assets");
  const keys = fs.readdirSync(root).filter(d => {
    const man = path.join(root, d, "manifest.json");
    return fs.existsSync(man) && d !== "maps";
  });
  const byHash = new Map();
  for (const key of keys) {
    const dir = path.join(root, key);
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".png") || f.startsWith("_")) continue;
      const buf = fs.readFileSync(path.join(dir, f));
      const h = crypto.createHash("md5").update(buf).digest("hex");
      if (!byHash.has(h)) byHash.set(h, []);
      byHash.get(h).push(key + "/" + f);
    }
  }
  const bad = [...byHash.values()].filter(g => new Set(g.map(x => x.split("/")[0])).size > 1);
  assert.deepStrictEqual(bad, [], "PNG partagés entre persos : " + JSON.stringify(bad));
});

test("échelles décor : PROP_H cohérent vs CHAR_BASE_H", () => {
  const g = loadGame();
  assert.strictEqual(g.CHAR_BASE_H, 110);
  assert.ok(g.PROP_H, "PROP_H exposé");
  // Au sol : plus petits qu'un perso (sauf cortège lisible)
  assert.ok(g.PROP_H.cow < g.CHAR_BASE_H);
  assert.ok(g.PROP_H.peacock < g.CHAR_BASE_H);
  assert.ok(g.PROP_H.flag < g.CHAR_BASE_H);
  assert.ok(g.PROP_H.cannon < g.CHAR_BASE_H);
  assert.ok(g.PROP_H.snowman < g.CHAR_BASE_H);
  assert.ok(g.PROP_H.cart < g.CHAR_BASE_H);
  assert.ok(g.PROP_H.marchers > g.CHAR_BASE_H, "cortège un cran plus grand");
  assert.ok(g.PROP_H.cowIdle < g.PROP_H.cow);
  assert.ok(g.PROP_H.falcon < g.PROP_H.cow, "oiseau vol < animal sol");
  assert.ok(g.PROP_H.pigeon < g.PROP_H.peacock);
});

test("events map : chaque terrain a un kind non-null", () => {
  const g = loadGame();
  for (let i = 0; i < g.TERRAINS.length; i++) {
    g.setTerrain(i);
    const kind = g.mapEventKind();
    assert.ok(kind, g.TERRAINS[i].key + " sans mapEventKind");
  }
});

test("météo : flavor snow/sand/rain selon terrain", () => {
  const g = loadGame();
  const byKey = Object.fromEntries(g.TERRAINS.map((t, i) => [t.key, i]));
  g.setTerrain(byKey["place-ecarlate"]);
  assert.strictEqual(g.weatherFlavor(), "snow");
  g.setTerrain(byKey["country-club-dore"]);
  assert.strictEqual(g.weatherFlavor(), "sand");
  g.setTerrain(byKey["jardin-des-roses"]);
  assert.strictEqual(g.weatherFlavor(), "rain");
  g.setTerrain(byKey["palais-du-coq"]);
  assert.strictEqual(g.weatherFlavor(), "rain");
});

test("météo : plage et roseraie ne sont plus bloquées au clear", () => {
  const g = loadGame();
  const byKey = Object.fromEntries(g.TERRAINS.map((t, i) => [t.key, i]));
  for (const key of ["country-club-dore", "jardin-des-roses"]) {
    g.setTerrain(byKey[key]);
    g.resetWeather();
    g.setWeather("clear", 1);
    g.stepWeather();
    assert.strictEqual(g.getWeather(), "rain", key + " doit pouvoir passer en rain");
  }
});

test("V2 : balle rapide + smash touche malgré la vitesse", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(88);
  g.setState("play"); g.setServeCountdown(0);
  g.blobR.x = 650; g.blobR.y = g.consts.GROUND_Y; g.blobR.onGround = true;
  g.blobR.lastActiveHitTick = -999;
  // Segment du tick croise encore la tête malgré vx élevé (anti-tunnel)
  g.ball.x = 610; g.ball.y = g.blobR.y - 64; g.ball.vx = 14; g.ball.vy = 1;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.ball.lastTouchSide = 0; g.ball.lastTouchTick = -999; g.ball.touches = [1, 0];
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.stepGame(N, { ...N, smash:true, ax: -0.28, ay: -0.92 });
  assert.ok(g.ball.touches[1] >= 1, "contact malgré la vitesse (touches=" + g.ball.touches + ")");
  assert.ok(g.ball.vy < 0, "renvoi vers le haut, pas vers le bas (vy=" + g.ball.vy + ")");
});

test("V2 : saut latéral sans smash → la balle traverse", () => {
  const g = freshRally(89);
  const idle = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y - 70; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  // Frôlement latéral (pas une retombée sur la tête)
  g.ball.x = 295; g.ball.y = g.blobL.y - 50; g.ball.vx = -10; g.ball.vy = -1;
  g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  const vx0 = g.ball.vx;
  g.stepGame(idle, idle);
  assert.strictEqual(g.ball.touches[0], 0, "frôlement ≠ touche auto");
  assert.ok(g.ball.vx < 0, "la balle continue vers la gauche (vx=" + g.ball.vx + ")");
  assert.ok(Math.abs(g.ball.vx - vx0) < 0.5, "pas de renvoi auto");
});

test("V2 : en l'air sans X, balle sur la tête → smash auto clavier", () => {
  const g = freshRally(91);
  const idle = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y - 80; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 250; g.ball.y = g.blobL.y - 58; g.ball.vx = 0; g.ball.vy = 3;
  g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.stepGame(idle, idle);
  assert.strictEqual(g.ball.touches[0], 1, "clavier en l'air au contact = smash auto");
  assert.ok(g.ball.vx > 0, "smash vers l'adversaire");
});

test("V2 : balle qui tombe sur le joueur → cloche auto", () => {
  const g = freshRally(90);
  const idle = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 250; g.ball.y = g.blobL.y - 58; g.ball.vx = 0; g.ball.vy = 3;
  g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false; // échange, pas service
  g.stepGame(idle, idle);
  assert.strictEqual(g.ball.touches[0], 1, "retombée sur le joueur = 1 touche");
  assert.ok(g.ball.vy < -6, "réception clavier vers le haut (vy=" + g.ball.vy + ")");
  assert.ok(Math.abs(g.ball.vx) < Math.abs(g.ball.vy) * 0.35,
    "réception clavier ≠ vers l'avant (vx=" + g.ball.vx + ", vy=" + g.ball.vy + ")");
});

test("V2 : IA récupère une balle (réception, pas smash)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(101);
  g.setState("play"); g.setServeCountdown(0);
  g.blobR.x = 700; g.blobR.y = g.consts.GROUND_Y; g.blobR.onGround = true;
  g.ball.x = 500; g.ball.y = 160; g.ball.vx = 4.5; g.ball.vy = -1;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.ball.lastTouchSide = 0; g.ball.lastTouchTick = 0; g.ball.touches = [1, 0];
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  let got = false;
  for (let i = 0; i < 250; i++) {
    g.stepGame(N, g.aiInput(1));
    if (g.ball.touches[1] >= 1) {
      got = true;
      // 1ʳᵉ touche = réception haute (peu d'avance horizontale)
      assert.ok(g.ball.vy < -4, "réception vers le haut (vy=" + g.ball.vy + ")");
      assert.ok(Math.abs(g.ball.vx) < Math.abs(g.ball.vy) * 0.55,
        "réception ≠ tir vers l'avant (vx=" + g.ball.vx + ", vy=" + g.ball.vy + ")");
      break;
    }
    if (g.getState() === "point") break;
  }
  assert.ok(got, "l'IA doit toucher la balle au moins une fois");
});

test("V2 : IA sert (lancer X) puis envoie la balle", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(2);
  g.newGame(77);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(1); // IA = droite
  g.ball.reset(1);
  let tossed = false, hit = false, hitVy = 0;
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  for (let i = 0; i < 400; i++) {
    const ai = g.aiInput(1);
    g.stepGame(N, ai);
    if (!g.ball.inHands && !g.ball.frozen) tossed = true;
    if (tossed && g.ball.vx < -2 && g.ball.serveAimLock === false) {
      hit = true;
      hitVy = g.ball.vy;
      break;
    }
    if (g.getState() === "point") break;
  }
  assert.ok(tossed, "l'IA doit lancer au smash");
  assert.ok(hit, "l'IA doit frapper vers l'adversaire après le lancer");
  assert.ok(hitVy < -3, "service en cloche (pas piqué vers le bas), vy=" + hitVy);
});

test("IA : le niveau Impitoyable bat un adversaire scripté moyen", () => {
  const NET_X = 450; // W/2
  const g = loadGame();
  // Garde-fou placement IA écrit pour la physique V1 (bounce passif).
  g.setGameplayV2(false);
  g.setVsAI(true); g.setAiLevel(3); // Impitoyable (IA = joueur droit)
  g.newGame(2026);
  // adversaire GAUCHE piloté par un bot « moyen » : se met sous la balle, sert,
  // saute pour renvoyer. Sert de garde-fou : si l'IA se remet à rater ses renvois
  // (ex. bug de placement hors du rayon de frappe), elle ne gagnera plus.
  function driveLeft() {
    const me = g.blobL, b = g.ball, serving = g.getServing?.() === 0;
    let target = me.x;
    if (b.frozen) target = b.x;
    else if (b.x < NET_X + 40) target = Math.min(b.x, NET_X - 45);
    const dx = target - me.x;
    g.keys.KeyA = dx < -6; g.keys.KeyD = dx > 6;
    const close = Math.abs(b.x - me.x) < 46 && b.y < me.y - 34 && b.y > me.y - 150;
    g.keys.KeyW = (!b.frozen && b.x < NET_X && close && me.onGround) ||
                  (b.frozen && Math.abs(b.x - me.x) < 20 && me.onGround);
    // Gameplay V2 : se placer sous la balle (contact = cloche) ; F = smash parfois
    if (!b.frozen && b.x < NET_X && Math.hypot(b.x - me.x, b.y - (me.y - 64)) < 70) {
      g.keys.KeyD = b.x > me.x + 6; g.keys.KeyA = b.x < me.x - 6;
    }
  }
  let f = 0;
  for (; f < 300000 && g.getState() !== "gameover"; f++) { driveLeft(); g.update(); }
  assert.strictEqual(g.getState(), "gameover", "le match doit se terminer");
  assert.ok(g.scores[1] > g.scores[0],
    "l'IA Impitoyable (" + g.scores[1] + ") doit battre le bot (" + g.scores[0] + ")");
});

test("bombe : fonctionne en 2v2 (mèche à zéro → point à l'autre équipe)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.setMode("2v2");
  g.setBombMode(true);
  g.newGame(11);
  g.setState("play"); g.setServeCountdown(0);
  // bombe immobile côté GAUCHE, mèche presque finie
  g.ball.frozen = false; g.ball.x = 180; g.ball.y = 150; g.ball.vx = 0; g.ball.vy = 0;
  g.setBombTimer(4);
  const N = { left:false, right:false, jump:false, super:false };
  const ins = g.getActiveBlobs().map(() => N);
  for (let i = 0; i < 12; i++) g.stepGame(null, null, ins);
  assert.strictEqual(g.scores[0] + g.scores[1], 1, "un point doit tomber à l'explosion en 2v2");
  assert.strictEqual(g.scores[1], 1, "bombe à gauche → l'équipe de droite marque");
});

test("bombe : durée choisie appliquée (startRally) et présente dans le snapshot", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.setBombMode(true); g.setBombTime(300); // 5 secondes
  g.newGame(3); // startRally doit initialiser bombTimer = bombTime
  assert.strictEqual(g.getBombTimer(), 300, "la mèche démarre à la durée choisie (5 s)");
  const snap = g.getSnapshot();
  assert.strictEqual(snap.bombMode, true, "bombMode sérialisé pour l'invité");
  assert.strictEqual(snap.bombTimer, 300, "bombTimer sérialisé pour le compte à rebours invité");
});

test("filet : une balle qui passe AU-DESSUS n'est pas bloquée", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(5);
  g.setState("play"); g.setServeCountdown(0);
  // balle clairement au-dessus du filet, en traversée gauche → droite
  g.ball.frozen = false;
  g.ball.x = g.consts.NET_X - 40;
  g.ball.y = g.consts.NET_TOP - 40;
  g.ball.vx = 10; g.ball.vy = -1;
  const startX = g.ball.x;
  for (let i = 0; i < 20; i++) g.updateBall();
  assert.ok(g.ball.x > g.consts.NET_X + 20, "la balle doit passer de l'autre côté (x=" + g.ball.x + ", start=" + startX + ")");
  assert.ok(g.ball.vx > 0, "la vitesse horizontale reste vers la droite");
});

test("filet : un lob qui frôle le sommet passe (pas de rejet latéral)", () => {
  // Régression du bug « balle coincée au filet » : la gravité faisait
  // retomber y sous NET_TOP pile dans le poteau → rebond latéral alors
  // que la trajectoire était un passage par-dessus.
  // Clearance = NET_TOP - BALL_R (tout le ballon au-dessus du filet).
  const g = loadGame();
  const C = g.consts;
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(7);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false;
  g.ball.x = C.NET_X - 30;
  g.ball.y = C.NET_TOP - C.BALL_R - 4;
  g.ball.vx = 8; g.ball.vy = 2;
  for (let i = 0; i < 25; i++) g.updateBall();
  assert.ok(g.ball.x > C.NET_X + 30, "le lob frôlant doit passer (x=" + g.ball.x + ")");
  assert.ok(g.ball.vx > 0, "vx reste vers la droite (pas de rebond poteau)");
});

test("filet : une balle trop basse ne passe pas (anti sous-filet)", () => {
  const g = loadGame();
  const C = g.consts;
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(11);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false;
  g.ball.x = C.NET_X - 40;
  // centre juste sous la ligne de clearance → doit rebondir
  g.ball.y = C.NET_TOP - C.BALL_R + 6;
  g.ball.vx = 10; g.ball.vy = 0;
  for (let i = 0; i < 15; i++) g.updateBall();
  assert.ok(g.ball.x < C.NET_X, "la balle ne doit pas passer sous/à travers le filet");
  assert.ok(g.ball.vx < 0, "rebond attendu");
});

test("filet : balle coincée dans le poteau est éjectée (anti-stick)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(6);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false;
  g.ball.x = g.consts.NET_X; // pile dans le poteau
  g.ball.y = g.consts.NET_TOP + 40;
  g.ball.vx = 0.3; g.ball.vy = 1;
  for (let i = 0; i < 8; i++) g.updateBall();
  const clear = Math.abs(g.ball.x - g.consts.NET_X) > g.consts.NET_W / 2 + g.consts.BALL_R - 1;
  assert.ok(clear, "la balle doit sortir du poteau (x=" + g.ball.x + ")");
  assert.ok(Math.abs(g.ball.vx) >= 2, "vitesse d'éjection minimale");
});

test("soft ownership : zone invité hors filet (marge)", () => {
  const g = loadGame();
  const M = g.consts.GUEST_BALL_MARGIN;
  assert.ok(M >= 40, "marge assez large pour éviter le poteau");
  assert.strictEqual(g.ballInGuestOwnZone(g.consts.NET_X + M + 1), true);
  assert.strictEqual(g.ballInGuestOwnZone(g.consts.NET_X + M), false);
  assert.strictEqual(g.ballInGuestOwnZone(g.consts.NET_X), false);
  assert.strictEqual(g.ballInGuestOwnZone(g.consts.NET_X - 40), false);
});

test("soft ownership : skipBall avance les corps sans bouger la balle", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(9);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false;
  g.ball.x = 700; g.ball.y = 120; g.ball.vx = 0; g.ball.vy = 0;
  const bx = g.ball.x, by = g.ball.y;
  const x0 = g.blobL.x;
  const N = { left: false, right: true, jump: false, super: false };
  g.stepGame(N, N, null, { skipBall: true });
  assert.strictEqual(g.ball.x, bx, "skipBall ne déplace pas la balle");
  assert.strictEqual(g.ball.y, by);
  assert.ok(g.blobL.x !== x0 || g.blobL.vx !== 0, "les corps avancent quand même");
});

test("soft ownership : pack/applyBallState round-trip", () => {
  const g = loadGame();
  g.newGame(2);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false;
  g.ball.x = 620; g.ball.y = 150; g.ball.vx = -3; g.ball.vy = 4;
  g.ball.angle = 1.2; g.ball.touches = [1, 2];
  const packed = g.packBallState(true);
  assert.strictEqual(packed.own, 1, "own:1 quand l'invité simule");
  assert.strictEqual(g.packBallState(false).own, 0, "own:0 hors possession");
  g.ball.x = 0; g.ball.y = 0; g.ball.vx = 0; g.ball.vy = 0;
  g.applyBallState(packed);
  assert.strictEqual(g.ball.x, 620);
  assert.strictEqual(g.ball.y, 150);
  assert.strictEqual(g.ball.vx, -3);
  assert.strictEqual(g.ball.vy, 4);
  assert.deepStrictEqual(g.ball.touches, [1, 2]);
});

test("soft ownership : cooldown frappe avance avec tick (smash post-réception invité)", () => {
  // Régression : sans tick++ pendant guestBallAuthority, lastActiveHitTick
  // restait égal à tick → canActiveHit faux pour toute la possession.
  const g = loadGame();
  g.newGame(3);
  g.setTick(1000);
  g.blobR.lastActiveHitTick = 1000; // vient de réceptionner
  assert.strictEqual(g.canActiveHit(g.blobR), false, "cooldown actif juste après frappe");
  for (let i = 0; i < 15; i++) g.setTick(g.getTick() + 1);
  assert.strictEqual(g.canActiveHit(g.blobR), false, "encore en cooldown à +15");
  g.setTick(g.getTick() + 1);
  assert.strictEqual(g.canActiveHit(g.blobR), true, "smash autorisé après cooldown (tick qui avance)");
});

// ---------- Gameplay V2 ----------
const N0 = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };

test("V2 : smash/X au sol = cloche dirigée", () => {
  const g = freshRally(42);
  assert.ok(g.getGameplayV2(), "Gameplay V2 actif par défaut");
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
  g.ball.x = 250; g.ball.y = g.blobL.y - 64; g.ball.vx = 0; g.ball.vy = 0;
  g.ball.inHands = false; g.ball.tossGrace = 0;
  g.stepGame({ ...N0, smash:true }, N0);
  assert.strictEqual(g.ball.heldBy, -1, "pas de phase de contrôle");
  assert.ok(g.ball.vy < -6, "cloche clavier vers le haut (vy=" + g.ball.vy + ")");
  assert.ok(Math.abs(g.ball.vx) < Math.abs(g.ball.vy) * 0.35,
    "réception clavier ≠ tir vers l'avant (vx=" + g.ball.vx + ")");
  assert.strictEqual(g.ball.touches[0], 1, "contact = 1 touche");
  assert.strictEqual(g.ball.slowMo, 0, "pas de ralenti");
  assert.strictEqual(g.blobL.poseAnim, "receive", "pose réception après cloche");
  assert.ok(g.blobL.poseT >= 35, "réception tenue assez longtemps (poseT=" + g.blobL.poseT + ")");
});

test("V2 : smash dirigé sans ralenti", () => {
  const g = freshRally(45);
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y - 80;
  g.blobL.onGround = false; g.blobL.vy = -2;
  g.ball.x = 250; g.ball.y = g.blobL.y - 70; g.ball.vx = 0; g.ball.vy = 1;
  g.stepGame({ ...N0, smash:true, ax:0.8, ay:0.5 }, N0);
  assert.strictEqual(g.ball.heldBy, -1, "smash ne fige pas la balle");
  assert.ok(g.ball.vx > 0, "smash vers l'adversaire");
  assert.strictEqual(g.ball.slowMo, 0, "ralenti réservé au Smash Battle");
  assert.strictEqual(g.ball.smash, 0, "pas d'effet drama sur smash normal");
});

test("V2 : snapshots round-trip (heldBy reste -1)", () => {
  const g = freshRally(46);
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y;
  g.ball.x = 250; g.ball.y = g.blobL.y - 64;
  g.ball.inHands = false; g.ball.tossGrace = 0;
  g.stepGame({ ...N0, smash:true }, N0); // X = cloche
  const s1 = g.getSnapshot();
  g.applySnapshot(JSON.parse(JSON.stringify(s1)));
  assert.strictEqual(g.ball.heldBy, -1);
  assert.strictEqual(g.packBallState(true).hb, -1);
});

test("V2 off : bounce passif V1 inchangé (smoke)", () => {
  const g = freshRally(47);
  g.setGameplayV2(false);
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.vx = 0;
  g.ball.x = 250; g.ball.y = g.blobL.y - 64; g.ball.vx = 2; g.ball.vy = 3;
  const vx0 = g.ball.vx;
  g.stepGame(N0, N0);
  assert.strictEqual(g.ball.heldBy, -1, "pas de contrôle sans Action en V1");
  assert.ok(g.ball.vx !== vx0 || g.ball.vy !== 3 || g.ball.y !== g.blobL.y - 64);
});

test("V2 : simulateArc renvoie une trajectoire qui finit au sol", () => {
  const g = loadGame();
  const pts = g.simulateArc(200, 100, 6, -4, 120);
  assert.ok(pts.length > 5);
  assert.ok(pts[pts.length - 1].y + g.consts.BALL_R >= g.consts.GROUND_Y - 1);
});

test("persos uniques : 2v2 hors-ligne ne duplique pas", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.setMode("2v2");
  for (let animal = 0; animal < g.CHARACTERS.length; animal++) {
    g.blobL.charId = animal;
    g.newGame(42 + animal);
    const ids = [g.blobL, g.blob2L, g.blobR, g.blob2R].map(b => b.charId);
    assert.strictEqual(new Set(ids).size, 4, "4 persos distincts (joueur=" + animal + ") → " + ids);
  }
});

test("V2 : service — balle dans les mains, lancer vertical (smash/X)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(50);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.reset(0);
  assert.ok(g.ball.inHands && g.ball.frozen, "balle en mains au service");
  const y0 = g.blobL.y - 48; // serveHandsPos : hauteur bras (pose receive)
  g.stepGame(N0, N0);
  assert.ok(g.ball.inHands && g.ball.frozen);
  assert.ok(Math.abs(g.ball.y - (g.blobL.y - 48)) < 3, "balle collée aux bras");
  assert.ok(g.ball.x > g.blobL.x + 16, "balle devant le corps (côté face)");
  g.stepGame({ ...N0, ax:0.6, jump:true }, N0); // saut MANETTE ≠ lancer
  assert.ok(g.ball.inHands && g.ball.frozen, "saut manette sans X ne lance pas");
  g.stepGame({ ...N0, smash:true }, N0); // lancer = smash (X)
  assert.strictEqual(g.ball.frozen, false);
  assert.strictEqual(g.ball.inHands, false);
  assert.ok(Math.abs(g.ball.vx) < 0.5, "lancer vraiment vertical (vx≈0)");
  assert.ok(g.ball.vy < -8, "fortement vers le haut (vy=" + g.ball.vy + ")");
  assert.ok(g.ball.y < y0, "la balle a quitté les mains vers le haut");
});

test("V2 : au service, le SAUT seul ne sert pas — il faut F pour lancer", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(51);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.reset(0);
  g.stepGame(N0, N0); // pose
  assert.ok(g.ball.inHands, "balle en mains");
  // Saut (Espace) seul : la balle reste en mains (on ne sert pas au saut)
  g.stepGame({ ...N0, jump:true, kbdJump:true }, N0);
  assert.ok(g.ball.inHands && g.ball.frozen, "le saut seul ne lance pas");
  // F lance la balle (toss vertical)
  g.stepGame({ ...N0, smash:true }, N0);
  assert.strictEqual(g.ball.inHands, false, "F lance la balle");
});

test("V2 : service — se retourner déplace la balle avec les mains", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(51);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.reset(0);
  // Face adversaire (droite) : balle à droite du corps
  for (let i = 0; i < 5; i++) g.stepGame(N0, N0);
  assert.ok(g.ball.inHands && g.ball.frozen);
  const dxFace = g.ball.x - g.blobL.x;
  assert.ok(dxFace > 16, "face adversaire → balle à droite (dx=" + dxFace + ")");
  // Marche vers la gauche → sprite se retourne, balle doit suivre
  for (let i = 0; i < 25; i++) g.stepGame({ ...N0, left:true }, N0);
  assert.ok(g.ball.inHands && g.ball.frozen, "toujours en mains");
  const dxBack = g.ball.x - g.blobL.x;
  assert.ok(dxBack < -16, "dos à l'adversaire → balle à gauche (dx=" + dxBack + ")");
  assert.ok(Math.abs(Math.abs(dxBack) - Math.abs(dxFace)) < 4,
    "même écart aux mains (face=" + dxFace + " back=" + dxBack + ")");
});

test("V2 : service — pas de cloche auto après lancer (il faut F)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(57);
  g.setState("play"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 250; g.ball.y = g.blobL.y - 58; g.ball.vx = 0; g.ball.vy = 3;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = true;
  g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  g.stepGame(N0, N0); // pas de F
  assert.strictEqual(g.ball.touches[0], 0, "sans F : pas de frappe auto au service");
  assert.strictEqual(g.ball.serveAimLock, true, "lock encore actif");
  g.blobL.lastActiveHitTick = -999;
  g.ball.y = g.blobL.y - 58; g.ball.vy = 3;
  g.stepGame({ ...N0, smash:true }, N0);
  assert.strictEqual(g.ball.touches[0], 1, "F = frappe de service");
  assert.strictEqual(g.ball.serveAimLock, false, "lock levé");
  assert.ok(g.ball.vx > 0, "vers l'adversaire");
  assert.ok(g.ball.vy < 0, "cloche");
});

test("V2 : service — sauter DANS la balle en l'air = smash auto (clavier), pas la manette", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(56);
  g.setState("play"); g.setServeCountdown(0);
  g.setServingSide(0);
  const setup = () => {
    g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y - 60; g.blobL.onGround = false;
    g.blobL.lastActiveHitTick = -999;
    g.ball.x = 250; g.ball.y = g.blobL.y - 58; g.ball.vx = 0; g.ball.vy = 3;
    g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
    g.ball.serveAimLock = true;
    g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
    if (g.ball.touches) { g.ball.touches[0] = 0; g.ball.touches[1] = 0; }
  };
  // CLAVIER : contact en l'air sans F → smash auto (« sauter dans la balle »)
  setup();
  g.stepGame(N0, N0);
  assert.strictEqual(g.ball.touches[0], 1, "contact clavier en l'air = smash auto");
  assert.strictEqual(g.ball.serveAimLock, false, "lock levé après la frappe");
  assert.ok(g.ball.vx > 0, "service vers l'adversaire");
  // MANETTE (ax≠0) : contact en l'air sans X → PAS de smash auto (frappe explicite)
  setup();
  g.stepGame({ ...N0, ax:0.6 }, N0);
  assert.strictEqual(g.ball.touches[0], 0, "manette sans X ≠ smash auto");
});

test("V2 : service — X manette maintenu après lancer ne sert pas tout seul", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(59);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.reset(0);
  // Stick légèrement poussé = style manette (pas clavier)
  const pad = { ...N0, smash:true, ax: 0.4, ay: -0.2 };
  g.stepGame(pad, N0);
  assert.strictEqual(g.ball.inHands, false, "X lance");
  assert.strictEqual(g.blobL._serveAwaitRelease, true, "attente relâchement");
  // Place la balle à portée tout de suite, X toujours maintenu
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 250; g.ball.y = g.blobL.y - 64; g.ball.vx = 0; g.ball.vy = 2;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = true;
  g.stepGame(pad, N0);
  assert.strictEqual(g.ball.serveAimLock, true, "maintenir X ne sert pas");
  assert.strictEqual(g.ball.touches[0], 0, "pas de touche");
  // Relâche
  g.stepGame({ ...N0, ax: 0.4, ay: -0.2 }, N0);
  assert.strictEqual(g.blobL._serveAwaitRelease, false, "relâché");
  // Nouvel appui
  g.blobL.lastActiveHitTick = -999;
  g.ball.y = g.blobL.y - 64; g.ball.vy = 2; g.ball.serveAimLock = true;
  g.stepGame({ ...N0, smash:true, ax: 0.4, ay: -0.2 }, N0);
  assert.strictEqual(g.ball.serveAimLock, false, "nouvel appui X sert");
  assert.ok(g.ball.vx > 0, "vers l'adversaire");
});

test("V2 : service — F + saut immédiat interdit (anti-triche)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(58);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.reset(0);
  // Même frame : lancer + saut (MANETTE : ax≠0 → le saut ne sert pas, F lance)
  g.stepGame({ ...N0, smash:true, jump:true, ax:0.6 }, N0);
  assert.strictEqual(g.ball.inHands, false, "F lance bien");
  assert.ok(g.blobL.onGround, "pas de saut le frame du lancer");
  // Grâce post-lancer : A tenu ne saute pas encore
  const grace = g.consts.SERVE_TOSS_GRACE || 10;
  let leftGround = false;
  for (let i = 0; i < grace; i++) {
    g.stepGame({ ...N0, jump:true }, N0);
    if (!g.blobL.onGround) leftGround = true;
  }
  assert.ok(!leftGround, "pas de saut pendant la grâce post-lancer");
  // Après la grâce : saut OK même si la balle monte encore (service aérien)
  g.stepGame(N0, N0); // relâche pour front propre
  g.stepGame({ ...N0, jump:true }, N0);
  assert.ok(!g.blobL.onGround, "après la grâce, A saute");
});

test("V2 : service — saut manette pendant la montée du lancer", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(61);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.reset(0);
  const pad = { ...N0, smash:true, ax: 0.3, ay: -0.4 };
  g.stepGame({ ...pad, jump:true }, N0);
  assert.ok(g.blobL.onGround, "pas de saut au lancer");
  const grace = g.consts.SERVE_TOSS_GRACE || 10;
  for (let i = 0; i < grace; i++) g.stepGame({ ...N0, jump:true, ax: 0.3, ay: -0.4 }, N0);
  assert.ok(g.blobL.onGround, "grâce = encore au sol");
  assert.ok(g.ball.vy < 0, "balle encore en montée");
  g.stepGame(N0, N0);
  g.stepGame({ ...N0, jump:true, ax: 0.3, ay: -0.4 }, N0);
  assert.ok(!g.blobL.onGround, "manette : saute pendant la montée après grâce");
});

test("V2 : service — passe le filet depuis près du filet (tous persos)", () => {
  const g = loadGame();
  const C = g.consts;
  const N0 = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  for (let animal = 0; animal < g.CHARACTERS.length; animal++) {
    g.setVsAI(true); g.setAiLevel(1);
    g.newGame(10 + animal);
    g.setServingSide(0);
    g.setState("play"); g.setServeCountdown(0);
    g.blobL.charId = animal;
    g.blobL.x = 330; g.blobL.y = C.GROUND_Y; g.blobL.onGround = true;
    g.blobL.lastActiveHitTick = -999;
    g.ball.x = 335; g.ball.y = g.blobL.y - 70; g.ball.vx = 0; g.ball.vy = 1;
    g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
    g.ball.serveAimLock = true; g.ball.serveFlight = false;
    g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
    g.scores[0] = 0; g.scores[1] = 0;
    g.stepGame({ ...N0, smash:true }, N0);
    let cleared = false;
    for (let i = 0; i < 150; i++) {
      g.updateBall();
      if (g.ball.x > C.NET_X + 16 && g.ball.y < C.NET_TOP - 4) { cleared = true; break; }
      if (g.getState() === "point") break;
    }
    assert.ok(cleared, "service " + g.CHARACTERS[animal].key + " depuis x=330 doit passer le filet");
    assert.strictEqual(g.scores[1], 0, "pas de faute filet (" + g.CHARACTERS[animal].key + ")");
  }
});

test("V2 : service aérien (smash) — passe aussi le filet", () => {
  const g = loadGame();
  const C = g.consts;
  const N0 = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(11);
  g.setServingSide(0);
  g.setState("play"); g.setServeCountdown(0);
  g.blobL.charId = 1; // Trompette
  g.blobL.x = 300; g.blobL.y = C.GROUND_Y - 70; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 305; g.ball.y = g.blobL.y - 50; g.ball.vx = 0; g.ball.vy = 1;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = true; g.ball.serveFlight = false;
  g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  g.scores[0] = 0; g.scores[1] = 0;
  g.stepGame({ ...N0, smash:true }, N0);
  let cleared = false;
  for (let i = 0; i < 150; i++) {
    g.updateBall();
    if (g.ball.x > C.NET_X + 16 && g.ball.y < C.NET_TOP - 4) { cleared = true; break; }
    if (g.getState() === "point") break;
  }
  assert.ok(cleared, "service aérien Trompette doit passer le filet");
  assert.strictEqual(g.scores[1], 0, "pas de faute filet en smash de service");
});

test("V2 : service aérien — plus de punch qu'au sol (Yogi)", () => {
  const g = loadGame();
  const C = g.consts;
  const N0 = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  const yogi = g.CHARACTERS.findIndex(c => c.key === "gourou");
  assert.ok(yogi >= 0, "Yogi présent");

  function hit(aerial) {
    g.setVsAI(true); g.setAiLevel(1);
    g.newGame(77);
    g.setServingSide(0);
    g.setState("play"); g.setServeCountdown(0);
    g.blobL.charId = yogi;
    g.blobL.x = 280;
    // Assez haut pour le vrai smash de service (balle proche du bandeau)
    g.blobL.y = aerial ? C.GROUND_Y - 120 : C.GROUND_Y;
    g.blobL.onGround = !aerial;
    g.blobL.lastActiveHitTick = -999;
    g.blobR.x = C.W - 40; g.blobR.y = C.GROUND_Y; g.blobR.onGround = true;
    g.ball.x = 285;
    g.ball.y = aerial ? C.NET_TOP - 10 : g.blobL.y - 70;
    g.ball.vx = 0; g.ball.vy = 1;
    g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
    g.ball.serveAimLock = true; g.ball.serveFlight = false;
    g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
    g.scores[0] = 0; g.scores[1] = 0;
    g.stepGame({ ...N0, smash:true, ax: 0.6, ay: -0.3 }, N0);
    return {
      spd: Math.hypot(g.ball.vx, g.ball.vy),
      vx: Math.abs(g.ball.vx),
    };
  }
  const ground = hit(false);
  const air = hit(true);
  assert.ok(air.spd > ground.spd + 0.4, "smash aérien plus rapide que cloche sol");
  assert.ok(air.vx > ground.vx + 2, "smash aérien plus de composante avant");
  assert.ok(g.CHARACTERS[yogi].power >= 1.06, "Yogi n'est plus sous-puissance");
});

test("V2 : smash sous le bandeau — passe le filet (Yogi milieu de court)", () => {
  const g = loadGame();
  const C = g.consts;
  const N0 = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  const yogi = g.CHARACTERS.findIndex(c => c.key === "gourou");
  g.setVsAI(true); g.setAiLevel(0);
  g.newGame(81);
  g.setServingSide(1);
  g.setState("play"); g.setServeCountdown(0);
  g.blobL.charId = yogi;
  g.blobL.x = 300; g.blobL.y = C.GROUND_Y - 75; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  g.blobR.x = C.W - 40;
  g.ball.x = 308; g.ball.y = g.blobL.y - 50; // sous le bandeau
  g.ball.vx = 0; g.ball.vy = 1;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  g.scores[0] = 0; g.scores[1] = 0;
  assert.ok(g.ball.y > C.NET_TOP, "balle sous le sommet du filet");
  g.stepGame({ ...N0, smash:true, ax: 0.75, ay: -0.15 }, N0);
  let cleared = false;
  for (let i = 0; i < 160; i++) {
    g.updateBall();
    if (g.ball.x > C.NET_X + 20 && g.ball.y < C.NET_TOP) { cleared = true; break; }
    if (g.getState() === "point") break;
  }
  assert.ok(cleared, "smash Yogi sous le bandeau doit passer le filet");
  assert.strictEqual(g.scores[1], 0, "pas de faute filet");
});

test("V2 : service — cloche forcée vers l'adversaire", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(55);
  g.setState("play"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 250; g.ball.y = g.blobL.y - 70; g.ball.vx = 0; g.ball.vy = 1;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = true;
  g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  g.stepGame({ ...N0, smash:true, ax: 0, ay: -1 }, N0); // X + stick plein haut
  assert.ok(g.ball.vx > 4.5, "service : part vers l'adversaire malgré stick haut (vx=" + g.ball.vx + ")");
  assert.strictEqual(g.ball.serveAimLock, false, "lock levé après la frappe");
});

test("V2 : après lancer, smash/X = cloche", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(51);
  g.setState("play"); g.setServeCountdown(0);
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 250; g.ball.y = g.blobL.y - 70; g.ball.vx = 0; g.ball.vy = 3;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  const vy0 = g.ball.vy;
  g.stepGame({ ...N0, smash:true }, N0);
  assert.ok(g.ball.vy < -6, "cloche clavier vers le haut (vy=" + g.ball.vy + ")");
  assert.ok(Math.abs(g.ball.vx) < Math.abs(g.ball.vy) * 0.35,
    "réception clavier verticale (vx=" + g.ball.vx + ")");
  assert.ok(g.ball.vy < vy0, "impulsion vers le haut sur contact");
});

test("V2 : cloche suit l'angle du stick", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(54);
  g.setState("play"); g.setServeCountdown(0);
  const setup = () => {
    g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
    g.blobL.lastActiveHitTick = -999;
    g.ball.x = 250; g.ball.y = g.blobL.y - 70; g.ball.vx = 0; g.ball.vy = 1;
    g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
    g.ball.serveAimLock = false;
    g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  };
  setup();
  g.stepGame({ ...N0, smash:true, ax: 0.95, ay: -0.7 }, N0); // stick avant-haut
  const angUp = Math.atan2(g.ball.vy, g.ball.vx);
  setup();
  g.stepGame({ ...N0, smash:true, ax: 0.95, ay: 0.55 }, N0); // stick avant-bas
  const angDown = Math.atan2(g.ball.vy, g.ball.vx);
  assert.ok(angDown > angUp + 0.15, "stick bas → angle plus piqué que stick haut (" + angUp + " vs " + angDown + ")");
  assert.ok(g.ball.vx > 0, "toujours vers l'adversaire");
  setup();
  g.stepGame({ ...N0, smash:true, ax: 0, ay: -1 }, N0); // stick plein haut
  assert.ok(g.ball.vy < -10, "plein haut → forte impulsión verticale (vy=" + g.ball.vy + ")");
  assert.ok(Math.abs(g.ball.vx) < Math.abs(g.ball.vy) * 0.35, "plein haut ≠ tir vers l'avant (vx=" + g.ball.vx + ", vy=" + g.ball.vy + ")");
});

test("V2 : clavier — réception légèrement vers l'avant (setup smash)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(55);
  g.setState("play"); g.setServeCountdown(0);
  const setup = (ballOffX) => {
    g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
    g.blobL.lastActiveHitTick = -999;
    g.ball.x = 250 + ballOffX; g.ball.y = g.blobL.y - 70; g.ball.vx = 0; g.ball.vy = 1;
    g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
    g.ball.serveAimLock = false;
    g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  };
  setup(0);
  g.stepGame({ ...N0, smash:true }, N0);
  assert.ok(g.ball.vy < -6, "clavier → passe haute (vy=" + g.ball.vy + ")");
  assert.ok(g.ball.vx > 1.2, "légère poussée vers le filet (vx=" + g.ball.vx + ")");
  assert.ok(Math.abs(g.ball.vx) < Math.abs(g.ball.vy) * 0.45,
    "reste surtout vertical (vx=" + g.ball.vx + " vy=" + g.ball.vy + ")");
  const vxMid = g.ball.vx;
  setup(36);
  g.stepGame({ ...N0, smash:true }, N0);
  const vxFront = g.ball.vx;
  setup(-28);
  g.stepGame({ ...N0, smash:true }, N0);
  const vxBack = g.ball.vx;
  // Toutes les réceptions clavier poussent un peu vers l'avant (setup smash)
  assert.ok(vxMid > 1 && vxFront > 1 && vxBack > 1,
    "réceptions clavier vers l'avant (mid=" + vxMid + " F=" + vxFront + " B=" + vxBack + ")");
});

test("V2 : clavier — smash auto au contact en saut", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(56);
  g.setState("play"); g.setServeCountdown(0);
  g.blobL.x = 280; g.blobL.y = g.consts.GROUND_Y - 80; g.blobL.onGround = false;
  g.blobL.vy = -2; g.blobL.lastActiveHitTick = -999;
  g.ball.x = 285; g.ball.y = g.blobL.y - 50; g.ball.vx = 0; g.ball.vy = 2;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  // Pas de smash enfoncé — le contact en l'air doit smash quand même
  g.stepGame({ ...N0 }, N0);
  assert.ok(g.ball.vx > 2 || g.ball.vy !== 2, "smash auto a dévié la balle");
  assert.ok(g.blobL.poseAnim === "smash" || Math.hypot(g.ball.vx, g.ball.vy) > 4,
    "contact aérien clavier → smash");
});

test("V2 : clavier — smash piqué quand la balle est haute", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(59);
  g.setState("play"); g.setServeCountdown(0);
  // Près du filet, sauté haut : balle au-dessus du bandeau → piqué
  g.blobL.x = 370; g.blobL.y = g.consts.NET_TOP + 40; g.blobL.onGround = false;
  g.blobL.vy = 0; g.blobL.lastActiveHitTick = -999;
  const headY = g.blobL.y - 64;
  g.ball.x = 378; g.ball.y = headY - 12; // proche de la tête, au-dessus du filet
  assert.ok(g.ball.y < g.consts.NET_TOP - 8, "balle au-dessus du bandeau");
  g.ball.vx = 0; g.ball.vy = 1;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  g.stepGame({ ...N0 }, N0);
  assert.ok(g.ball.vx > 4, "smash vers l'adversaire (vx=" + g.ball.vx + ")");
  assert.ok(g.ball.vy > 1, "près du filet + balle haute → piqué (vy=" + g.ball.vy + ")");
});

test("V2 : clavier — smash depuis le fond passe le filet", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(60);
  g.setState("play"); g.setServeCountdown(0);
  g.blobL.x = 130; g.blobL.y = g.consts.GROUND_Y - 85; g.blobL.onGround = false;
  g.blobL.vy = 0; g.blobL.lastActiveHitTick = -999;
  const headY = g.blobL.y - 64;
  g.ball.x = 145; g.ball.y = headY - 18; g.ball.vx = 0; g.ball.vy = 1;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  g.scores[0] = 0; g.scores[1] = 0;
  g.stepGame({ ...N0 }, N0);
  assert.ok(g.ball.vx > 5, "smash fond vers l'adversaire (vx=" + g.ball.vx + ")");
  assert.ok(g.ball.vy < 0, "depuis le fond → trajectoire montante (vy=" + g.ball.vy + ")");
  let cleared = false;
  for (let i = 0; i < 150; i++) {
    g.updateBall();
    if (g.ball.x > g.consts.NET_X + 20 && g.ball.y < g.consts.NET_TOP) { cleared = true; break; }
    if (g.getState() === "point") break;
  }
  assert.ok(cleared, "smash depuis le fond doit passer le filet");
  assert.strictEqual(g.scores[1], 0, "pas de faute filet");
});

test("V2 : cloche depuis le fond = passe haute légèrement avant (clavier)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(53);
  g.setState("play"); g.setServeCountdown(0);
  g.blobL.x = 120; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
  g.ball.x = 120; g.ball.y = g.blobL.y - 70; g.ball.vx = 0; g.ball.vy = 2;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.stepGame({ ...N0, smash:true }, N0);
  assert.ok(g.ball.vy < -6.5, "assez de cloche verticale");
  assert.ok(g.ball.vx > 1.2, "léger biais vers le filet (vx=" + g.ball.vx + ")");
  assert.ok(Math.abs(g.ball.vx) < Math.abs(g.ball.vy) * 0.45,
    "reste une passe haute, pas un lob plat (vx=" + g.ball.vx + ")");
});

test("V2 : après lancer, smash maintenu frappe vraiment", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(52);
  g.setState("play"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.inHands = false; g.ball.frozen = false; g.ball.tossGrace = 0;
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y - 70;
  g.blobL.onGround = false; g.blobL.vy = -2;
  g.ball.x = 255; g.ball.y = g.blobL.y - 50; g.ball.vx = 0; g.ball.vy = 2;
  g.stepGame({ ...N0, smash:true, ax:0.9, ay:0.3 }, N0);
  assert.ok(g.ball.vx > 3, "smash vers l'adversaire (vx=" + g.ball.vx + ")");
});

test("event canon : annonce puis tir déterministe (Place Écarlate)", () => {
  const g = freshRally(42);
  const N = { left:false, right:false, jump:false };
  // balle hors jeu pour ne pas marquer pendant l'annonce
  g.ball.y = 80; g.ball.vy = -2; g.ball.vx = 0; g.ball.frozen = false;
  g.mapEvent.phase = "idle";
  g.mapEvent.timer = 1;
  g.stepGame(N, N);
  assert.strictEqual(g.mapEvent.phase, "warn", "timer écoulé → annonce");
  g.mapEvent.t = (g.MAP_EVENT_WARN_T || 120) - 1;
  g.stepGame(N, N); // warn → fire (t=0)
  assert.strictEqual(g.mapEvent.phase, "fire");
  g.stepGame(N, N); // fire t=1 → spawn boulet
  assert.ok(g.mapEvent.phase === "fire" || g.mapEvent.phase === "flying");
  assert.ok(g.mapEvent.x > 100, "le boulet est spawné hors du canon");
});

test("event canon : collision dévie la balle", () => {
  const g = freshRally(1);
  const N = { left:false, right:false, jump:false };
  g.mapEvent.phase = "flying";
  g.mapEvent.t = 5;
  g.mapEvent.x = 250; g.mapEvent.y = 200;
  g.mapEvent.vx = 6; g.mapEvent.vy = 0;
  g.mapEvent.hit = false;
  g.ball.x = 250; g.ball.y = 200; g.ball.vx = 0; g.ball.vy = 0;
  g.ball.frozen = false; g.ball.inHands = false;
  g.stepGame(N, N);
  assert.ok(g.mapEvent.hit, "le boulet doit toucher la balle");
  assert.ok(Math.hypot(g.ball.vx, g.ball.vy) > 2, "la balle doit être déviée");
});

test("terrain calme : aucun événement canon", () => {
  const g = freshRally(1);
  const N = { left:false, right:false, jump:false };
  g.setMapEventsQuiet(true);
  g.mapEvent.phase = "idle";
  g.mapEvent.timer = 1;
  g.stepGame(N, N);
  assert.strictEqual(g.mapEvent.phase, "idle");
});

test("event cortège : Palais du Coq traverse le terrain", () => {
  const g = freshRally(77);
  const N = { left:false, right:false, jump:false };
  g.setTerrain(2); // prairie / Micron
  assert.strictEqual(g.mapEventKind(), "march");
  g.setMapEventsQuiet(false);
  g.mapEvent.phase = "idle";
  g.mapEvent.timer = 1;
  g.stepGame(N, N);
  assert.strictEqual(g.mapEvent.phase, "warn");
  g.mapEvent.t = (g.MAP_EVENT_WARN_T || 120) - 1;
  g.stepGame(N, N);
  assert.strictEqual(g.mapEvent.phase, "fire");
  const x0 = g.mapEvent.cartX;
  for (let i = 0; i < 20; i++) g.stepGame(N, N);
  assert.ok(g.mapEvent.cartX > x0, "le cortège avance");
});

test("chaque terrain a un événement de map", () => {
  const g = loadGame();
  const kinds = new Set();
  for (let i = 0; i < g.TERRAINS.length; i++) {
    g.setTerrain(i);
    const k = g.mapEventKind();
    assert.ok(k, "terrain " + g.TERRAINS[i].key + " doit avoir un event");
    kinds.add(k);
  }
  assert.strictEqual(kinds.size, g.TERRAINS.length, "un kind unique par terrain");
});

test("Le Mur : une fois passé, pas de téléport derrière", () => {
  const g = freshRally(42);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  const { NET_X, GROUND_Y } = g.consts;
  const wallX = NET_X * 0.48;
  // Mur actif sur le camp gauche (victime = blobL)
  g.superEffects.length = 0;
  g.superEffects.push({ kind: "wall", side: 0, t: 300 });
  // Derrière le mur : ne peut pas marcher vers le filet
  g.blobL.x = wallX - 40;
  g.blobL.y = GROUND_Y;
  g.blobL.onGround = true;
  g.blobL.vy = 0;
  for (let i = 0; i < 20; i++) g.stepGame({ ...N, right:true }, N);
  assert.ok(g.blobL.x <= wallX + 1, "bloqué derrière le mur au sol");
  // Déjà passé (atterri côté filet) : reste libre devant, pas de téléport
  const past = wallX + 50;
  g.blobL.x = past;
  g.blobL.y = GROUND_Y;
  g.blobL.onGround = true;
  g.blobL.vy = 0;
  for (let i = 0; i < 10; i++) g.stepGame(N, N);
  assert.ok(g.blobL.x > wallX + 20, "reste passé le mur sans être recalé");
  assert.ok(Math.abs(g.blobL.x - past) < 3, "pas de téléport vers l’arrière");
});

test("Smash Battle : le gagnant marque — le perdant est stun et ne digue pas", () => {
  const g = freshRally(55);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setMapEventsQuiet(true);
  // Place les deux au filet en l'air, balle au milieu
  const { NET_X, GROUND_Y, NET_TOP } = g.consts;
  g.blobL.x = NET_X - 40; g.blobL.y = GROUND_Y - 80; g.blobL.onGround = false;
  g.blobR.x = NET_X + 40; g.blobR.y = GROUND_Y - 80; g.blobR.onGround = false;
  g.ball.x = NET_X; g.ball.y = NET_TOP; g.ball.vx = 0; g.ball.vy = 0;
  g.ball.frozen = false; g.ball.popped = false; g.ball.heldBy = -1;
  g.battle.cooldown = 0;
  g.startBattle(N, N);
  // Gauche martèle, droite pas
  g.battle.t = 1;
  g.battle.count = [0, 0];
  g.battle.prevJump = [false, false];
  g.stepBattle({ ...N, jump:true }, N);
  assert.strictEqual(g.battle.active, false, "duel résolu");
  assert.ok(g.ball.vx > 0, "balle vers la droite (gagnant = gauche)");
  assert.ok(g.blobR.battleStunT > 0, "perdant stun");
  assert.ok(g.blobR.x > NET_X + 80, "perdant projeté au fond");
  const scoresBefore = [g.scores[0], g.scores[1]];
  // Simuler jusqu'au sol : le perdant stun ne doit pas diguer
  for (let i = 0; i < 90 && g.getState() === "play"; i++) {
    g.stepGame(N, { ...N, jump:true, smash:true, left:true }); // perdant spam sans effet
  }
  assert.ok(g.getState() === "point" || g.getState() === "gameover", "point marqué");
  assert.ok(g.scores[0] > scoresBefore[0], "le gagnant du duel marque le point");
});

test("events map : pas de trigger en pause / service / point", () => {
  const g = freshRally(12);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setMapEventsQuiet(false);
  g.setTerrain(0); // Place Écarlate / canon
  g.mapEvent.phase = "idle";
  g.mapEvent.timer = 1;

  g.setPaused(true);
  assert.strictEqual(g.mapEventsCanStep(), false, "pause = gel");
  g.stepGame(N, N);
  assert.strictEqual(g.mapEvent.phase, "idle", "pas d'event en pause");
  assert.strictEqual(g.mapEvent.timer, 1, "timer figé en pause");
  g.setPaused(false);

  g.ball.frozen = true; // reste en service (sinon stepGame force play)
  g.setState("serve");
  g.setServeCountdown(90);
  assert.strictEqual(g.mapEventsCanStep(), false, "service = transition");
  g.stepGame(N, N);
  assert.strictEqual(g.mapEvent.phase, "idle", "pas d'event au service");
  assert.strictEqual(g.mapEvent.timer, 1, "timer figé au service");

  g.setServeCountdown(0);
  g.setState("point");
  assert.strictEqual(g.mapEvent.phase, "idle");
  g.stepGame(N, N);
  assert.strictEqual(g.mapEvent.phase, "idle");
  assert.strictEqual(g.mapEvent.timer, 1);

  g.ball.frozen = false;
  g.setState("play");
  g.mapEvent.timer = 1;
  assert.strictEqual(g.mapEventsCanStep(), true, "play = ok");
  g.stepGame(N, N);
  assert.strictEqual(g.mapEvent.phase, "warn", "event démarre en play");
});

test("events map : boulet en vol coupé au passage en service (pas coincé)", () => {
  const g = freshRally(12);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setMapEventsQuiet(false);
  g.setTerrain(0);
  g.mapEvent.phase = "flying";
  g.mapEvent.t = 10;
  g.mapEvent.x = 300;
  g.mapEvent.y = 180;
  g.mapEvent.vx = 4;
  g.mapEvent.vy = -2;
  g.mapEvent.balls = [{ x: 1, y: 2, vx: 0, vy: 0, hit: false, dead: false }];
  g.ball.frozen = true;
  g.setState("serve");
  g.setServeCountdown(60);
  g.stepGame(N, N);
  assert.strictEqual(g.mapEvent.phase, "idle", "event aborté");
  assert.strictEqual(g.mapEvent.balls.length, 0, "projectiles vidés");
  assert.ok(g.mapEvent.y === 0 && g.mapEvent.x === 0, "boulet plus en l'air");
  assert.ok(g.mapEvent.timer > 1, "prochain event replanifié");
});

// ---------- Mode Histoire ----------
test("campagne : chapitres cohérents (persos, terrain, mode, dopage, dialogues)", () => {
  const g = loadGame();
  assert.ok(Array.isArray(g.STORY) && g.STORY.length >= 6, "au moins 6 chapitres");
  const keys = new Set(g.CHARACTERS.map(c => c.key));
  g.STORY.forEach((ch, i) => {
    assert.ok(keys.has(ch.left), "ch" + i + " left invalide: " + ch.left);
    assert.ok(keys.has(ch.right), "ch" + i + " right invalide: " + ch.right);
    assert.notStrictEqual(ch.left, ch.right, "ch" + i + " oppose un perso à lui-même");
    assert.ok(ch.terrain >= 0 && ch.terrain < g.TERRAINS.length, "ch" + i + " terrain hors bornes");
    assert.ok(ch.mode === "volley" || ch.mode === "bomb", "ch" + i + " mode invalide");
    assert.ok(ch.ai >= 0 && ch.ai <= 3, "ch" + i + " niveau IA hors bornes");
    // design : le joueur (gauche) AFFRONTE des dopés — il ne joue jamais le dopé.
    assert.ok(ch.doped === null || ch.doped === "R", "ch" + i + " : seul l'adversaire (R) peut être dopé");
    for (const phase of ["pre", "win", "lose"]) {
      assert.ok(Array.isArray(ch[phase]) && ch[phase].length > 0, "ch" + i + " dialogue " + phase + " vide");
      for (const line of ch[phase]) {
        assert.ok(typeof line.t === "string" && line.t.length > 0, "ch" + i + " réplique vide");
        const okSpeaker = line.s === "narrator" || keys.has(line.s);
        assert.ok(okSpeaker, "ch" + i + " locuteur inconnu: " + line.s);
      }
    }
  });
});

test("campagnes par personnage : 10 campagnes, chacune = les 9 rivaux, format valide", () => {
  const g = loadGame();
  assert.ok(g.STORY_BY_CHAR, "STORY_BY_CHAR chargé (src/story-campaigns.js)");
  assert.ok(Array.isArray(g.STORY_CAMPAIGNS), "STORY_CAMPAIGNS présent");
  // 1 campagne curée + 10 par personnage
  assert.strictEqual(g.STORY_CAMPAIGNS.length, 11, "sommet + 10 persos");
  const keys = g.CHARACTERS.map(c => c.key);
  const keySet = new Set(keys);
  for (const key of keys) {
    const camp = g.STORY_BY_CHAR[key];
    assert.ok(Array.isArray(camp) && camp.length === 9, key + " : 9 rencontres");
    const rivals = camp.map(c => c.right).sort();
    const expected = keys.filter(k => k !== key).sort();
    assert.deepStrictEqual(rivals, expected, key + " : affronte exactement ses 9 rivaux");
    camp.forEach((ch, i) => {
      assert.strictEqual(ch.left, key, key + "[" + i + "] left doit être le protagoniste");
      assert.ok(keySet.has(ch.right) && ch.right !== key, key + "[" + i + "] rival valide");
      assert.ok(ch.terrain >= 0 && ch.terrain < g.TERRAINS.length, key + "[" + i + "] terrain hors bornes");
      assert.ok(ch.mode === "volley" || ch.mode === "bomb", key + "[" + i + "] mode invalide");
      assert.ok(ch.doped === null || ch.doped === "R", key + "[" + i + "] seul l'adversaire (R) est dopé");
      for (const phase of ["pre", "win", "lose"]) {
        assert.ok(Array.isArray(ch[phase]) && ch[phase].length > 0, key + "[" + i + "] " + phase + " vide");
        for (const line of ch[phase]) {
          assert.ok(typeof line.t === "string" && line.t.length > 0, key + "[" + i + "] réplique vide");
          assert.ok(line.s === "narrator" || keySet.has(line.s), key + "[" + i + "] locuteur inconnu: " + line.s);
        }
      }
    });
  }
});

test("storySelectCampaign : bascule STORY sur la campagne du perso + progression dédiée", () => {
  const g = loadGame();
  if (!g.storySelectCampaign) return; // pas de campagnes par perso → skip
  // index 1 = 1re campagne perso (ordre roster) ; STORY doit pointer dessus
  g.storySelectCampaign(1);
  const story = g.getSTORY();
  const heroKey = g.CHARACTERS[0].key; // roster[0] = 1re campagne perso
  assert.ok(story.every(ch => ch.left === heroKey), "tous les chapitres pilotés par le héros");
  assert.strictEqual(g.getState(), "storyMenu", "sélection → hub");
  // lancer le 1er match utilise bien la campagne active
  g.setStoryChapter(0);
  g.storyStartMatch();
  assert.strictEqual(g.blobL.charId, g.storyCharIdx(story[0].left), "protagoniste à gauche");
  assert.strictEqual(g.blobR.charId, g.storyCharIdx(story[0].right), "rival à droite");
});

test("story : le premier chapitre est débloqué, les suivants verrouillés", () => {
  const g = loadGame();
  g.setStoryProgress({ unlocked: 0, completed: [] });
  g.setStoryChapter(0);
  g.storySelectChapter(0); // ch0 = début d'acte → carte d'intro d'acte
  assert.strictEqual(g.getState(), "storyActIntro");
  g.storyBeginScene("pre"); // (via avance de la carte) → dialogue d'avant-match
  assert.strictEqual(g.getState(), "storyScene");
  assert.ok(g.getStoryScene() && g.getStoryScene().phase === "pre");
  // chapitre verrouillé : reste ignoré
  g.setState("storyMenu");
  g.storySelectChapter(3);
  assert.strictEqual(g.getState(), "storyMenu", "chapitre verrouillé non jouable");
});

test("storyStartMatch configure persos / terrain / mode / dopage", () => {
  const g = loadGame();
  // trouve un chapitre Bombe avec adversaire dopé
  const dopedIdx = g.STORY.findIndex(c => c.mode === "bomb" && c.doped === "R");
  assert.ok(dopedIdx >= 0, "au moins un chapitre bombe+dopé");
  const ch = g.STORY[dopedIdx];
  g.setStoryChapter(dopedIdx);
  g.storyStartMatch();
  assert.strictEqual(g.blobL.charId, g.storyCharIdx(ch.left), "protagoniste à gauche");
  assert.strictEqual(g.blobR.charId, g.storyCharIdx(ch.right), "adversaire à droite");
  assert.strictEqual(g.getTerrain(), ch.terrain, "terrain du chapitre");
  assert.strictEqual(g.getBombMode(), true, "mode bombe actif");
  assert.strictEqual(g.blobR.doped, true, "adversaire dopé");
  assert.ok(g.blobR.speedMul >= 1.5, "dopé = vitesse impitoyable");
  assert.strictEqual(g.getStoryFlags().inMatch, true);

  // chapitre volley non dopé
  const volIdx = g.STORY.findIndex(c => c.mode === "volley" && !c.doped);
  const chV = g.STORY[volIdx];
  g.setStoryChapter(volIdx);
  g.storyStartMatch();
  assert.strictEqual(g.getBombMode(), false, "volley = pas de bombe");
  assert.strictEqual(g.blobR.doped, false, "pas de dopage en rivalité légère");
});

test("progression : victoire débloque le chapitre suivant, défaite non", () => {
  const g = loadGame();
  g.setStoryProgress({ unlocked: 0, completed: [] });
  // défaite au chapitre 0 : rien ne se débloque
  g.setStoryChapter(0);
  g.storyAfterPostScene(false);
  assert.strictEqual(g.getStoryProgress().unlocked, 0, "défaite ne débloque pas");
  assert.ok(!g.getStoryProgress().completed[0], "défaite ne complète pas");
  // victoire au chapitre 0 : complète 0 et débloque 1
  g.setStoryChapter(0);
  g.storyAfterPostScene(true);
  assert.strictEqual(g.getStoryProgress().completed[0], true, "victoire complète le chapitre");
  assert.strictEqual(g.getStoryProgress().unlocked, 1, "victoire débloque le suivant");
});

test("story : chaque début d'acte affiche une carte d'intro, pas les autres", () => {
  const g = loadGame();
  g.setStoryProgress({ unlocked: 8, completed: [] });
  const firsts = [];
  for (let i = 0; i < g.STORY.length; i++) {
    if (i === 0 || g.STORY[i].act !== g.STORY[i - 1].act) firsts.push(i);
  }
  assert.ok(firsts.length === 3, "3 débuts d'acte");
  // début d'acte → carte d'intro
  g.setState("storyMenu"); g.storySelectChapter(firsts[1]);
  assert.strictEqual(g.getState(), "storyActIntro");
  // chapitre au milieu d'un acte → dialogue direct
  const mid = firsts[1] + 1;
  g.setState("storyMenu"); g.storySelectChapter(mid);
  assert.strictEqual(g.getState(), "storyScene");
});

test("story : gagner la finale ouvre l'écran de fin ; sinon retour au hub", () => {
  const g = loadGame();
  const last = g.STORY.length - 1;
  g.setStoryProgress({ unlocked: last, completed: [] });
  g.setStoryChapter(last);
  g.storyAfterPostScene(true); // victoire en finale
  assert.strictEqual(g.getState(), "storyEnding");
  assert.strictEqual(g.getStoryProgress().completed[last], true);
  // victoire hors finale → hub
  g.setStoryChapter(0);
  g.storyAfterPostScene(true);
  assert.strictEqual(g.getState(), "storyMenu");
});

test("storyOnMatchEnd choisit la bonne branche selon le score", () => {
  const g = loadGame();
  g.setStoryChapter(0);
  g.scores[0] = 15; g.scores[1] = 8; // joueur (gauche) gagne
  g.storyOnMatchEnd();
  assert.strictEqual(g.getStoryScene().phase, "win");
  g.scores[0] = 9; g.scores[1] = 15; // joueur perd
  g.storyOnMatchEnd();
  assert.strictEqual(g.getStoryScene().phase, "lose");
});

console.log("\n" + pass + " réussis, " + fail + " échoués");
process.exit(fail ? 1 : 0);
