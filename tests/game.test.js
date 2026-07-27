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
  assert.ok(g.blobR.charredT > 0, "perso du camp touché noirci");
});

test("flamme : FLAME_HP_MAX touches brûlent le joueur et donnent le point à l'adversaire", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(0);
  g.setFlameMode(true);
  g.setBombMode(false);
  g.newGame(11);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false; g.ball.inHands = false;
  assert.strictEqual(g.blobL.flameHp, g.FLAME_HP_MAX, "PV pleins en début de rallye");
  for (let i = 0; i < g.FLAME_HP_MAX; i++) g.applyFlameBurn(g.blobL);
  assert.strictEqual(g.blobL.flameHp, 0, "PV à zéro après FLAME_HP_MAX brûlures");
  assert.strictEqual(g.scores[1], 1, "brûlé → point à l'adversaire");
  assert.ok(g.blobL.flameIgniteT > 0, "embrasement visuel armé");
});

test("flamme : startRally recharge les PV ; snapshot sérialise flameMode", () => {
  const g = loadGame();
  g.setFlameMode(true);
  g.newGame(3);
  g.blobL.flameHp = 1;
  g.startRally();
  assert.strictEqual(g.blobL.flameHp, g.FLAME_HP_MAX, "PV reset au service");
  const snap = g.getSnapshot();
  assert.strictEqual(snap.flameMode, true, "flameMode sérialisé");
  assert.strictEqual(snap.blobs[0].flameHp, g.FLAME_HP_MAX, "flameHp sérialisé");
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

test("filet : pas de touche à travers le filet (service collé)", () => {
  const g = loadGame();
  const C = g.consts;
  const N0 = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setVsAI(false); g.setMode("1v1");
  g.newGame(42);
  g.setState("play"); g.setServeCountdown(0);
  g.setServingSide(0);
  // Serveur loin ; adversaire collé au filet ; balle encore côté serveur
  g.blobL.x = 200; g.blobL.y = C.GROUND_Y; g.blobL.onGround = true;
  g.blobR.x = C.NET_X + C.NET_W / 2 + 34 - 6;
  g.blobR.y = C.GROUND_Y - 50; g.blobR.onGround = false;
  g.blobR.lastActiveHitTick = -999;
  g.ball.x = C.NET_X - 18; g.ball.y = g.blobR.y - 50;
  g.ball.vx = 0; g.ball.vy = 1;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false; g.ball.serveFlight = true;
  g.ball.lastTouchSide = 0; g.ball.lastTouchTick = -999;
  g.ball.touches[0] = 1; g.ball.touches[1] = 0;
  assert.ok(g.ball.x < C.NET_X, "balle encore à gauche");
  assert.ok(!g.canHitBallThroughNet(g.blobR), "adversaire ne peut pas traverser le filet");
  g.stepGame(N0, { ...N0, smash:true });
  assert.strictEqual(g.ball.touches[1], 0, "pas de touche adverse à travers le filet");
  assert.strictEqual(g.ball.lastTouchSide, 0, "dernier toucheur = serveur");
  assert.ok(g.ball.x < C.NET_X, "balle reste côté serveur");
});

test("filet : contestation OK si balle entièrement au-dessus du bandeau", () => {
  const g = loadGame();
  const C = g.consts;
  g.setVsAI(false); g.setMode("1v1");
  g.newGame(43);
  g.blobR.x = C.NET_X + 40;
  g.ball.x = C.NET_X - 10; // encore « côté gauche » en X
  g.ball.y = C.NET_TOP - C.BALL_R - 2; // tout le ballon au-dessus
  assert.ok(g.canHitBallThroughNet(g.blobR), "au-dessus du filet = contestable");
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
  assert.ok(!g.CHARACTERS[i].egoCharge, "Faucon : plus d'egoCharge (équilibre)");
  const col = g.TERRAINS.find(t => t.key === "citadelle-du-levant");
  assert.ok(col, "terrain citadelle-du-levant");
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
  assert.strictEqual(maps["palais-gallard"], "Palais Gallard");
  assert.strictEqual(maps["cite-du-matin"], "Cité du Matin");
  assert.strictEqual(maps["pont-des-deux-mondes"], "Pont des Deux Mondes");
  assert.strictEqual(maps["grande-foret"], "Grande Forêt");
});

test("audio : musique map en match, parade en menu ; fichiers sur disque", () => {
  const fs = require("fs");
  const path = require("path");
  const g = loadGame();
  assert.ok(typeof g.musicForTerrain === "function", "musicForTerrain exposé");
  assert.ok(g.musicForTerrain(null).includes("mayor-parade"), "menu → parade");
  for (const t of g.TERRAINS) {
    const url = g.musicForTerrain(t.key);
    assert.ok(url.includes(t.key), t.key + " → " + url);
    const mapPath = path.join(__dirname, "..", "assets", "audio", "maps", t.key + ".mp3");
    assert.ok(fs.existsSync(mapPath), "fichier musique " + t.key);
  }
  g.setState("menu");
  assert.strictEqual(g.musicKeyForState(), null, "menu → pas de BGM map");
  g.setTerrain(0);
  g.setState("play");
  assert.strictEqual(g.musicKeyForState(), g.TERRAINS[0].key, "play → BGM map");
  g.setState("serve");
  assert.strictEqual(g.musicKeyForState(), g.TERRAINS[0].key, "serve → BGM map");
  const man = path.join(__dirname, "..", "assets", "audio", "manifest.json");
  assert.ok(fs.existsSync(man), "manifest.json");
  const j = JSON.parse(fs.readFileSync(man, "utf8"));
  assert.ok(j.maps && Object.keys(j.maps).length >= 10, "10 maps dans manifest");
  assert.ok(j.fallbackMusic, "fallbackMusic menu");
  // Garde-fou régression : setMusicTerrain ne doit pas clearTimeout à chaque
  // musicTick pendant un fondu (sinon silence en match — gain coincé à ~0).
  const src = fs.readFileSync(path.join(__dirname, "..", "src", "audio.js"), "utf8");
  assert.ok(
    src.includes("musicTerrainKey === trackId && musicSwitchTimer"),
    "fondu musique : ne pas relancer le timer chaque frame"
  );
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
  // Faucon en vol : assez grand pour être lisible (ailes), mais < perso
  assert.ok(g.PROP_H.falcon < g.CHAR_BASE_H, "faucon < perso");
  assert.ok(g.PROP_H.falcon >= 80, "faucon assez grand pour la traversée");
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
  g.setTerrain(byKey["palais-gallard"]);
  assert.strictEqual(g.weatherFlavor(), "rain");
});

test("météo : climats secs = long clear ; intempéries possibles sans ping-pong", () => {
  const g = loadGame();
  assert.ok(typeof g.weatherClimate === "function", "weatherClimate exposé");
  const byKey = Object.fromEntries(g.TERRAINS.map((t, i) => [t.key, i]));

  g.setTerrain(byKey["citadelle-du-levant"]);
  const desert = g.weatherClimate();
  g.setTerrain(byKey["grande-foret"]);
  const jungle = g.weatherClimate();
  assert.ok(desert.clear[0] > jungle.clear[0], "désert : clear plus long que tropical");
  assert.ok(desert.pLeaveClear < jungle.pLeaveClear, "désert : quitte moins souvent le beau temps");
  assert.ok(desert.pStormFromRain < 0.2, "désert : peu d'orages");

  // Maps arides : peuvent quand même passer en rain (pas bloquées au clear)
  for (const key of ["country-club-dore", "jardin-des-roses"]) {
    g.setTerrain(byKey[key]);
    g.newGame(77);
    g.resetWeather();
    let sawWet = false;
    for (let i = 0; i < 80; i++) {
      g.setWeather("clear", 1);
      g.stepWeather();
      if (g.getWeather() === "rain" || g.getWeather() === "storm") { sawWet = true; break; }
    }
    assert.ok(sawWet, key + " doit pouvoir avoir de l'intempérie");
  }

  // Après un orage, retour clear fréquent (pas rain↔storm brutal)
  g.setTerrain(byKey["palais-gallard"]);
  g.newGame(12);
  let toClear = 0;
  for (let i = 0; i < 40; i++) {
    g.setWeather("storm", 1);
    g.stepWeather();
    if (g.getWeather() === "clear") toClear++;
  }
  assert.ok(toClear >= 20, "orage → clear majoritaire (" + toClear + "/40)");
});

test("V2 : balle rapide + smash touche malgré la vitesse", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(88);
  g.setState("play"); g.setServeCountdown(0);
  g.blobR.x = 650; g.blobR.y = g.consts.GROUND_Y; g.blobR.onGround = true;
  g.blobR.lastActiveHitTick = -999;
  // Segment du tick croise encore la tête malgré vx élevé (anti-tunnel)
  g.ball.x = 610; g.ball.y = g.blobR.y - 46; g.ball.vx = 14; g.ball.vy = 1;
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
  // Profil dédié (pas Impitoyable « jeu ») : smoke dig propre après nerf difficulté
  const digLvl = { err: 18, rush: 0, attack: 2, react: 0.55, dbl: false, aim: 0 };
  g.setVsAI(true); g.setAiLevel(3);
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
    g.stepGame(N, g.aiInput(1, digLvl));
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

test("IA : speedMul reste 1 (pas de buff vitesse selon la difficulté)", () => {
  const g = loadGame();
  g.setVsAI(true);
  for (const lvl of [0, 1, 2, 3]) {
    g.setAiLevel(lvl);
    g.newGame(100 + lvl);
    assert.strictEqual(g.blobR.speedMul, 1, "1v1 niveau " + lvl);
  }
  g.setMode("2v2");
  g.setAiLevel(3);
  g.newGame(99);
  assert.strictEqual(g.blobR.speedMul, 1, "2v2 adversaire");
  assert.strictEqual(g.blob2R.speedMul, 1, "2v2 adversaire 2");
  assert.strictEqual(g.blob2L.speedMul, 1, "2v2 coéquipier");
});

test("IA : profil compétent bat un adversaire scripté moyen (garde-fou placement)", () => {
  const NET_X = 450; // W/2
  const g = loadGame();
  // Garde-fou placement IA (physique V1). Le profil JEU Impitoyable est volontairement
  // plus faible / bruité — on utilise ici un profil dédié « compétent ».
  g.setGameplayV2(false);
  g.setVsAI(true); g.setAiLevel(3);
  const levels = g.AI_LEVELS;
  const prev = levels[3];
  levels[3] = { name: "Guard", err: 36, rush: 0.04, attack: 10, react: 0.62, dbl: false, aim: 0 };
  try {
    g.newGame(3);
    function driveLeft() {
      const me = g.blobL, b = g.ball;
      let target = me.x;
      if (b.frozen) target = b.x;
      else if (b.x < NET_X + 40) target = Math.min(b.x, NET_X - 45);
      const dx = target - me.x;
      g.keys.KeyA = dx < -6; g.keys.KeyD = dx > 6;
      const close = Math.abs(b.x - me.x) < 46 && b.y < me.y - 34 && b.y > me.y - 150;
      g.keys.KeyW = (!b.frozen && b.x < NET_X && close && me.onGround) ||
                    (b.frozen && Math.abs(b.x - me.x) < 20 && me.onGround);
      if (!b.frozen && b.x < NET_X && Math.hypot(b.x - me.x, b.y - (me.y - 64)) < 70) {
        g.keys.KeyD = b.x > me.x + 6; g.keys.KeyA = b.x < me.x - 6;
      }
    }
    for (let f = 0; f < 300000 && g.getState() !== "gameover"; f++) { driveLeft(); g.update(); }
    assert.strictEqual(g.getState(), "gameover", "le match doit se terminer");
    assert.ok(g.scores[1] > g.scores[0],
      "l'IA compétente (" + g.scores[1] + ") doit battre le bot (" + g.scores[0] + ")");
  } finally {
    levels[3] = prev;
  }
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

test("filet : frôle TOP_SLACK pousse de l'autre côté (pas flip vx mi-court)", () => {
  // Régression multi : frôle sommet → balle restait dans le poteau →
  // anti-stick inversait vx → retombée à mi-terrain au lieu de traverser.
  const g = loadGame();
  const C = g.consts;
  const clearY = C.NET_TOP - C.BALL_R;
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(13);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false; g.ball.inHands = false; g.ball.serveFlight = false;
  g.ball.x = C.NET_X - C.NET_W / 2 - C.BALL_R - 1;
  g.ball.y = clearY + 3; // dans la bande de frôle (TOP_SLACK = 5)
  g.ball.vx = 9; g.ball.vy = 0.5;
  for (let i = 0; i < 20; i++) g.updateBall();
  assert.ok(g.ball.x > C.NET_X + 20,
    "frôle doit finir à droite (x=" + g.ball.x + ")");
  assert.ok(g.ball.vx > 0, "vx reste vers la droite (pas de rebond mi-court)");
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
  const A = g.consts.GUEST_BALL_ACQUIRE;
  assert.ok(M >= 40, "marge release assez large pour éviter le poteau");
  assert.ok(A >= 12 && A < M, "acquire plus tôt que release (hystérésis)");
  assert.strictEqual(g.ballInGuestOwnZone(g.consts.NET_X + M + 1), true);
  assert.strictEqual(g.ballInGuestOwnZone(g.consts.NET_X + M), false);
  assert.strictEqual(g.ballInGuestOwnZone(g.consts.NET_X), false);
  assert.strictEqual(g.ballInGuestOwnZone(g.consts.NET_X - 40), false);
  assert.strictEqual(g.ballInGuestAcquireZone(g.consts.NET_X + A + 1), true);
  assert.strictEqual(g.ballInGuestAcquireZone(g.consts.NET_X + A), false);
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

test("multi fluidité : constantes coast / soft-correct", () => {
  const g = loadGame();
  assert.ok(g.BALL_SOFT_CORRECT >= 24 && g.BALL_SOFT_CORRECT <= 48, "seuil blend balle");
  assert.ok(g.GUEST_COAST_TICKS >= 12, "coast handoff assez long");
  assert.ok(g.hostApplyGuestBallSoft && g.guestLiveBallFromSnap && g.predictBallMotion);
});

test("multi fluidité : hostApplyGuestBallSoft blend si petit écart", () => {
  const g = loadGame();
  g.newGame(4);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false;
  g.ball.x = 600; g.ball.y = 200; g.ball.vx = 0; g.ball.vy = 0; g.ball.angle = 0;
  g.setHostBallSmooth(0, 0);
  g.hostApplyGuestBallSoft({
    x: 620, y: 210, vx: -2, vy: 3, a: 0.5,
    f: 0, p: 0, sm: 0, t0: 0, t1: 1, lts: 1, ltt: -999, lh: -999
  });
  assert.ok(g.ball.x > 600 && g.ball.x < 620, "position blendée (x=" + g.ball.x + ")");
  assert.ok(g.ball.y > 200 && g.ball.y < 210, "y blendé");
  assert.strictEqual(g.ball.vx, -2, "vx = autorité paquet");
  assert.strictEqual(g.ball.vy, 3);
  const sm = g.getHostBallSmooth();
  assert.ok(Math.abs(sm[0]) < 0.01 && Math.abs(sm[1]) < 0.01, "pas de smooth sur petit écart");
});

test("multi fluidité : hostApplyGuestBallSoft snap + smooth si gros écart", () => {
  const g = loadGame();
  g.newGame(5);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false;
  g.ball.x = 500; g.ball.y = 180; g.ball.vx = 0; g.ball.vy = 0;
  g.setHostBallSmooth(0, 0);
  g.hostApplyGuestBallSoft({
    x: 700, y: 220, vx: 1, vy: -1, a: 0,
    f: 0, p: 0, sm: 0, t0: 0, t1: 0, lts: 1, ltt: -999, lh: -999
  });
  assert.strictEqual(g.ball.x, 700, "gros écart → apply franc");
  const sm = g.getHostBallSmooth();
  assert.ok(Math.abs(sm[0]) > 10, "smooth visuel hôte non nul");
});

test("multi fluidité : guestLiveBallFromSnap + predict respecte le filet", () => {
  const g = loadGame();
  const C = g.consts;
  g.newGame(8);
  g.setState("play"); g.setServeCountdown(0);
  g.guestTestClearSnaps();
  // Balle basse vers le filet — le live DR ne doit pas traverser le poteau
  g.guestTestPushSnap({
    tick: 100, state: "play",
    ball: {
      x: C.NET_X - 30, y: C.NET_TOP + 70, vx: 14, vy: 0, angle: 0,
      frozen: false, popped: false
    }
  });
  const live = g.guestLiveBallFromSnap();
  assert.ok(live, "live produit");
  assert.ok(live.x < C.NET_X + C.NET_W, "pas de téléport à travers le filet (x=" + live.x + ")");
  // Predict long sous le bandeau → rebond (vx négatif ou reste à gauche)
  const pb = g.predictBallMotion(C.NET_X - 25, C.NET_TOP + 80, 16, 0, 6);
  assert.ok(pb.x < C.NET_X || pb.vx <= 0, "predict filet cohérent");
});

test("multi fluidité : handoff coast non nul après lâcher zone", () => {
  const g = loadGame();
  g.newGame(9);
  g.setGuestCoast({ x: 700, y: 160, vx: -4, vy: 2, angle: 0 }, g.GUEST_COAST_TICKS);
  assert.strictEqual(g.getGuestCoastLeft(), g.GUEST_COAST_TICKS);
  // Vue hors ownership avec coast : ne doit pas planter
  g.ball.x = 680; g.ball.y = 170; g.ball.angle = 0;
  g.guestTestClearSnaps();
  g.guestTestPushSnap({
    tick: 50, state: "play",
    ball: { x: 640, y: 180, vx: -3, vy: 1, angle: 0.1, frozen: false, popped: false }
  });
  // Remettre coast après clear
  g.setGuestCoast({ x: 700, y: 160, vx: -4, vy: 2, angle: 0 }, g.GUEST_COAST_TICKS);
  const last = { tick: 50, state: "play", ball: { x: 640, y: 180, vx: -3, vy: 1, angle: 0.1, frozen: false, popped: false } };
  g.guestApplyBallView(last, last, 1, last);
  assert.ok(g.ball.x <= 700 && g.ball.x >= 640, "blend coast→live (x=" + g.ball.x + ")");
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

test("online : snapshot round-trip superEffects / lastHitTick / kitSpeed-kitPower", () => {
  // Régression : ces champs manquaient de getSnapshot/applySnapshot → l'invité
  // prédisait sans le Mur/glace/slow, avec les mauvaises stats Cygne, et sans
  // la garde anti double-frappe 2v2.
  const g = loadGame();
  g.newGame(31);
  g.setState("play"); g.setServeCountdown(0);
  g.superEffects.push({ kind: "wall", side: 1, t: 200 });
  g.ball.lastHitTick = 123;
  g.blobL.kitSpeed = 1.3; g.blobL.kitPower = 0.8;
  const s = JSON.parse(JSON.stringify(g.getSnapshot()));
  g.superEffects.length = 0;
  g.ball.lastHitTick = -999;
  g.blobL.kitSpeed = null; g.blobL.kitPower = null;
  g.applySnapshot(s);
  assert.strictEqual(g.superEffects.length, 1, "superEffects resynchronisé");
  assert.deepStrictEqual(
    { kind: g.superEffects[0].kind, side: g.superEffects[0].side, t: g.superEffects[0].t },
    { kind: "wall", side: 1, t: 200 });
  assert.strictEqual(g.ball.lastHitTick, 123, "lastHitTick suit le snapshot");
  assert.strictEqual(g.blobL.kitSpeed, 1.3, "kitSpeed suit le snapshot");
  assert.strictEqual(g.blobL.kitPower, 0.8, "kitPower suit le snapshot");
});

test("online : packBallState/applyBallState transporte lastHitTick", () => {
  const g = loadGame();
  g.newGame(32);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.lastHitTick = 456;
  const p = JSON.parse(JSON.stringify(g.packBallState(true)));
  g.ball.lastHitTick = -999;
  g.applyBallState(p);
  assert.strictEqual(g.ball.lastHitTick, 456);
});

// ---------- Gameplay V2 ----------
const N0 = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };

test("V2 : smash/X au sol = cloche dirigée", () => {
  const g = freshRally(42);
  assert.ok(g.getGameplayV2(), "Gameplay V2 actif par défaut");
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
  g.ball.x = 250; g.ball.y = g.blobL.y - 46; g.ball.vx = 0; g.ball.vy = 0;
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
  // Contact ancré au milieu du corps (pas sur le crâne y-64)
  assert.ok(g.ball.y > g.blobL.y - 58, "balle sous la tête après dig (y=" + g.ball.y + ")");
  assert.ok(g.ball.y < g.blobL.y - 20, "balle au-dessus du sol (y=" + g.ball.y + ")");
});

test("2v2 : coéquipiers empilés → une seule réception (pas de téléport)", () => {
  // Régression : sans lastHitTick, blobL puis blob2L frappaient le même tick
  // (cooldown par joueur seulement) → 2e applyDirectedHit téléportait la balle.
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.setMode("2v2");
  g.newGame(77);
  g.setState("play"); g.setServeCountdown(0);
  const gy = g.consts.GROUND_Y;
  g.blobL.x = 250; g.blobL.y = gy; g.blobL.onGround = true;
  g.blobL.vx = 0; g.blobL.vy = 0;
  g.blob2L.x = 258; g.blob2L.y = gy; g.blob2L.onGround = true;
  g.blob2L.vx = 0; g.blob2L.vy = 0;
  g.blobR.x = 750; g.blob2R.x = 700;
  g.ball.x = 254; g.ball.y = gy - 46; g.ball.vx = 0; g.ball.vy = 2;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false; g.ball.serveFlight = false;
  g.ball.lastTouchSide = 1; // échange, pas service
  g.blobL.lastActiveHitTick = -999;
  g.blob2L.lastActiveHitTick = -999;
  const x0 = g.ball.x, y0 = g.ball.y;
  const smash = { ...N0, smash: true };
  g.stepGame(null, null, [smash, smash, N0, N0]);
  assert.strictEqual(g.ball.touches[0], 1, "une seule touche d'équipe");
  const hitters = [g.blobL, g.blob2L].filter(b => b.lastActiveHitTick === g.getTick());
  assert.strictEqual(hitters.length, 1, "un seul coéquipier marque la frappe");
  const jump = Math.hypot(g.ball.x - x0, g.ball.y - y0);
  assert.ok(jump < 90, "balle ne téléporte pas (Δ=" + jump.toFixed(1) + "px)");
  assert.ok(g.ball.x < g.consts.NET_X, "balle reste côté réception");
});

test("2v2 : alternance — après touche, ghost ne peut plus digger (allié oui)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.setMode("2v2");
  g.newGame(701);
  g.setState("play"); g.setServeCountdown(0);
  const gy = g.consts.GROUND_Y;
  g.blobL.x = 220; g.blobL.y = gy; g.blobL.onGround = true;
  g.blob2L.x = 320; g.blob2L.y = gy; g.blob2L.onGround = true;
  g.blobR.x = 750; g.blob2R.x = 700;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false; g.ball.serveFlight = false;
  g.ball.lastTouchSide = 1; g.ball.lastTouchTick = -999; g.ball.touches = [0, 0];
  g.ball.nextToucher = [null, null];
  g.blobL.lastActiveHitTick = -999;
  g.blob2L.lastActiveHitTick = -999;
  // 1) blobL dig
  g.ball.x = 220; g.ball.y = gy - 46; g.ball.vx = 0; g.ball.vy = 2;
  g.stepGame(null, null, [{ ...N0, smash: true }, N0, N0, N0]);
  assert.strictEqual(g.ball.touches[0], 1, "1ère touche blobL");
  assert.strictEqual(g.ball.nextToucher[0], 1, "prochain = blob2L (idx 1)");
  assert.ok(g.isBallGhostBlob(g.blobL), "blobL devient ghost");
  assert.ok(!g.isBallGhostBlob(g.blob2L), "blob2L peut frapper");
  // 2) ghost peut encore bouger (balle reste côté gauche — sinon reset nextToucher)
  const xGhost0 = g.blobL.x;
  g.ball.x = 400; g.ball.y = 80;
  g.stepGame(null, null, [{ ...N0, right: true }, N0, N0, N0]);
  assert.ok(g.blobL.x > xGhost0, "ghost se déplace encore");
  assert.ok(g.isBallGhostBlob(g.blobL), "toujours ghost après déplacement");
  // 3) ghost ne dig plus
  g.blobL.lastActiveHitTick = -999;
  g.blob2L.lastActiveHitTick = -999;
  g.setTick(g.getTick() + 20); // hors cooldown touche
  g.ball.x = g.blobL.x; g.ball.y = gy - 46; g.ball.vx = 0; g.ball.vy = 2;
  g.ball.lastHitTick = -999;
  g.ball.lastTouchSide = 0; // toujours notre camp
  const tGhost = g.ball.touches[0];
  g.stepGame(null, null, [{ ...N0, smash: true }, N0, N0, N0]);
  assert.strictEqual(g.ball.touches[0], tGhost, "ghost n'augmente pas les touches");
  // 4) allié dig → touche 2, rôles inversés
  g.blob2L.lastActiveHitTick = -999;
  g.ball.x = g.blob2L.x; g.ball.y = gy - 46; g.ball.vx = 0; g.ball.vy = 2;
  g.ball.lastHitTick = -999;
  g.stepGame(null, null, [N0, { ...N0, smash: true }, N0, N0]);
  assert.strictEqual(g.ball.touches[0], 2, "2ᵉ touche = allié");
  assert.strictEqual(g.ball.nextToucher[0], 0, "prochain redevient blobL");
  assert.ok(g.isBallGhostBlob(g.blob2L) && !g.isBallGhostBlob(g.blobL), "rôles inversés");
});

test("2v2 : alternance — nextToucher sync snapshot / packBall", () => {
  const g = loadGame();
  g.setMode("2v2");
  g.newGame(702);
  g.setState("play");
  g.ball.nextToucher = [1, null];
  const packed = g.packBallState(true);
  assert.strictEqual(packed.nt0, 1);
  assert.strictEqual(packed.nt1, -1);
  g.ball.nextToucher = [null, null];
  g.applyBallState(packed);
  assert.strictEqual(g.ball.nextToucher[0], 1);
  assert.strictEqual(g.ball.nextToucher[1], null);
  const snap = g.getSnapshot();
  g.ball.nextToucher = [null, 3];
  g.applySnapshot(JSON.parse(JSON.stringify(snap)));
  assert.strictEqual(g.ball.nextToucher[0], 1);
  assert.strictEqual(g.ball.nextToucher[1], null);
});

test("2v2 : alternance — passage du filet libère les deux", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.setMode("2v2");
  g.newGame(703);
  g.setState("play"); g.setServeCountdown(0);
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false; g.ball.serveFlight = false;
  g.ball.lastTouchSide = 0;
  g.ball.nextToucher = [1, null];
  g.ball.touches = [2, 0];
  // Balle traverse le filet vers la droite
  g.ball.x = g.consts.NET_X - 20; g.ball.y = 120;
  g.ball.vx = 8; g.ball.vy = -2;
  for (let i = 0; i < 12; i++) g.stepGame(null, null, [N0, N0, N0, N0]);
  assert.ok(g.ball.x > g.consts.NET_X, "balle côté droit");
  assert.strictEqual(g.ball.nextToucher[0], null, "nextToucher gauche reset");
  assert.strictEqual(g.ball.nextToucher[1], null, "nextToucher droit reset");
});

test("V2 : smash dirigé sans ralenti", () => {
  const g = freshRally(45);
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y - 80;
  g.blobL.onGround = false; g.blobL.vy = -2;
  g.ball.x = 250; g.ball.y = g.blobL.y - 46; g.ball.vx = 0; g.ball.vy = 1;
  g.stepGame({ ...N0, smash:true, ax:0.8, ay:0.5 }, N0);
  assert.strictEqual(g.ball.heldBy, -1, "smash ne fige pas la balle");
  assert.ok(g.ball.vx > 0, "smash vers l'adversaire");
  assert.strictEqual(g.ball.slowMo, 0, "ralenti réservé au Smash Battle");
  assert.strictEqual(g.ball.smash, 0, "pas d'effet drama sur smash normal");
});

test("V2 : snapshots round-trip (heldBy reste -1)", () => {
  const g = freshRally(46);
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y;
  g.ball.x = 250; g.ball.y = g.blobL.y - 46;
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

test("V2 : au service, Espace / A ne servent plus au sol (il faut lancer + sauter)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(51);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.reset(0);
  g.stepGame(N0, N0); // pose
  assert.ok(g.ball.inHands, "balle en mains");
  g.stepGame({ ...N0, jump:true, ax:0.5 }, N0);
  assert.ok(g.ball.inHands && g.ball.frozen, "saut manette ≠ service");
  g.stepGame({ ...N0, jump:true, kbdJump:true }, N0);
  assert.ok(g.ball.inHands && g.ball.frozen, "Espace ≠ service direct au sol");
});

test("V2 : au service, F lance encore verticalement (2 temps)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(52);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.reset(0);
  g.stepGame(N0, N0);
  g.stepGame({ ...N0, smash:true }, N0);
  assert.strictEqual(g.ball.inHands, false, "F lance la balle");
  assert.ok(g.ball.vy < 0, "lancer vertical");
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

test("V2 : service — pas de frappe au sol (il faut sauter)", () => {
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
  assert.strictEqual(g.ball.touches[0], 0, "F au sol ≠ service");
  assert.strictEqual(g.ball.serveAimLock, true, "lock encore actif au sol");
  // En l'air + F → service OK
  g.blobL.y = g.consts.GROUND_Y - 70; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  g.ball.y = g.blobL.y - 50; g.ball.vy = 2;
  g.stepGame({ ...N0, smash:true }, N0);
  assert.strictEqual(g.ball.touches[0], 1, "F en l'air = frappe de service");
  assert.strictEqual(g.ball.serveAimLock, false, "lock levé");
  assert.ok(g.ball.vx > 0, "vers l'adversaire");
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
  // Manette : X/Y distincts (padFace)
  const padX = {
    ...N0, smash: true, smashX: true, smashY: false, padFace: true, ax: 0.4, ay: -0.2
  };
  g.stepGame(padX, N0);
  assert.strictEqual(g.ball.inHands, false, "X lance");
  assert.strictEqual(g.blobL._serveAwaitRelease, true, "attente relâchement");
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 250; g.ball.y = g.blobL.y - 64; g.ball.vx = 0; g.ball.vy = 2;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = true;
  g.stepGame(padX, N0);
  assert.strictEqual(g.ball.serveAimLock, true, "maintenir X ne sert pas");
  assert.strictEqual(g.ball.touches[0], 0, "pas de touche");
  g.stepGame({ ...N0, padFace: true, ax: 0.4, ay: -0.2 }, N0);
  assert.strictEqual(g.blobL._serveAwaitRelease, false, "relâché");
  // X au sol → toujours refusé
  g.blobL.lastActiveHitTick = -999;
  g.ball.y = g.blobL.y - 64; g.ball.vy = 2; g.ball.serveAimLock = true;
  g.stepGame(padX, N0);
  assert.strictEqual(g.ball.serveAimLock, true, "X au sol ne sert pas");
  // En l'air + X → ne sert PAS (il faut Y)
  g.stepGame({ ...N0, padFace: true, ax: 0.4, ay: -0.2 }, N0);
  g.blobL.y = g.consts.GROUND_Y - 70; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  g.ball.y = g.blobL.y - 50; g.ball.vy = 2; g.ball.serveAimLock = true;
  g.stepGame(padX, N0);
  assert.strictEqual(g.ball.serveAimLock, true, "X en l'air ≠ frappe");
  // Y en l'air → sert (smash, pas lob forcé)
  g.blobL.lastActiveHitTick = -999;
  g.ball.y = g.blobL.y - 50; g.ball.vy = 2; g.ball.serveAimLock = true;
  const padY = {
    ...N0, smash: true, smashX: false, smashY: true, padFace: true, ax: 0.4, ay: -0.2
  };
  g.stepGame(padY, N0);
  assert.strictEqual(g.ball.serveAimLock, false, "Y en l'air sert");
  assert.ok(g.ball.vx > 0, "vers l'adversaire");
});

test("V2 : service manette — Y lance pas, X frappe pas", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(63);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.reset(0);
  const base = { ...N0, padFace: true, ax: 0.5, ay: 0 };
  // Y seul pendant les mains → pas de lancer
  g.stepGame({ ...base, smash: true, smashY: true }, N0);
  assert.ok(g.ball.inHands && g.ball.frozen, "Y ne lance pas");
  // X → lance
  g.stepGame({ ...base, smash: true, smashX: true }, N0);
  assert.ok(!g.ball.inHands, "X lance");
  g.stepGame(base, N0); // relâche
  // Après lancer : X en l'air ne frappe pas
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y - 80; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 250; g.ball.y = g.blobL.y - 48; g.ball.vx = 0; g.ball.vy = 1;
  g.ball.frozen = false; g.ball.tossGrace = 0; g.ball.serveAimLock = true;
  g.stepGame({ ...base, smash: true, smashX: true }, N0);
  assert.strictEqual(g.ball.serveAimLock, true, "X ne frappe pas au service");
  assert.strictEqual(g.ball.touches[0], 0);
  // Y en l'air frappe en smash (vx soutenu)
  g.blobL.lastActiveHitTick = -999;
  g.ball.y = g.blobL.y - 48; g.ball.serveAimLock = true;
  g.stepGame({ ...base, smash: true, smashY: true }, N0);
  assert.strictEqual(g.ball.serveAimLock, false, "Y frappe");
  assert.ok(g.ball.vx > 3, "smash de service, pas lob mou");
});

test("V2 : service — double-tap X pendant la grâce ne sert pas tout seul", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(62);
  g.setState("serve"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.ball.reset(0);
  const padX = {
    ...N0, smash: true, smashX: true, smashY: false, padFace: true, ax: 0.4, ay: -0.2
  };
  const idle = { ...N0, padFace: true, ax: 0.4, ay: -0.2 };
  g.stepGame(padX, N0);
  assert.ok(!g.ball.inHands, "lancé");
  g.stepGame(idle, N0);
  g.stepGame(padX, N0);
  assert.ok((g.ball.tossGrace | 0) > 0 || g.ball.serveAimLock, "encore phase service");
  const grace = g.consts.SERVE_TOSS_GRACE || 10;
  for (let i = 0; i < grace + 2; i++) {
    g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
    g.ball.x = 250; g.ball.y = g.blobL.y - 64; g.ball.vx = 0; g.ball.vy = 2;
    g.ball.frozen = false; g.ball.inHands = false;
    g.ball.serveAimLock = true;
    g.stepGame(padX, N0);
  }
  assert.strictEqual(g.ball.serveAimLock, true, "maintien après double-tap ≠ service auto");
  assert.strictEqual(g.ball.touches[0], 0, "pas de touche auto");
  // X en l'air ne sert toujours pas — il faut Y
  g.stepGame(idle, N0);
  g.blobL.y = g.consts.GROUND_Y - 70; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  g.ball.y = g.blobL.y - 50; g.ball.vy = 2; g.ball.serveAimLock = true;
  g.stepGame(padX, N0);
  assert.strictEqual(g.ball.serveAimLock, true, "X en l'air ≠ frappe");
  g.blobL.lastActiveHitTick = -999;
  g.ball.y = g.blobL.y - 50; g.ball.serveAimLock = true;
  g.stepGame({
    ...N0, smash: true, smashX: false, smashY: true, padFace: true, ax: 0.4, ay: -0.2
  }, N0);
  assert.strictEqual(g.ball.serveAimLock, false, "Y en l'air sert");
});

test("V2 : service — X tenu pendant le décompte ne lance pas au GO", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(63);
  g.setState("serve");
  g.setServeCountdown(5);
  g.setServingSide(0);
  g.ball.reset(0);
  const pad = { ...N0, smash:true, ax: 0.4 };
  // 5 ticks de décompte avec X tenu, puis 1ʳᵉ frame jouable (cd=0) toujours tenu
  for (let i = 0; i < 6; i++) g.stepGame(pad, N0);
  assert.ok(g.ball.inHands && g.ball.frozen, "X tenu pendant GO ≠ lancer");
  // Relâche puis vrai appui
  g.stepGame({ ...N0, ax: 0.4 }, N0);
  g.stepGame(pad, N0);
  assert.strictEqual(g.ball.inHands, false, "nouvel appui après GO lance");
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
    // Service en l'air obligatoire
    g.blobL.x = 330; g.blobL.y = C.GROUND_Y - 70; g.blobL.onGround = false;
    g.blobL.lastActiveHitTick = -999;
    g.ball.x = 335; g.ball.y = g.blobL.y - 50; g.ball.vx = 0; g.ball.vy = 1;
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

test("V2 : service aérien — smash haut plus de punch qu'une cloche basse (Gourou)", () => {
  const g = loadGame();
  const C = g.consts;
  const N0 = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  const gourouIdx = g.CHARACTERS.findIndex(c => c.key === "gourou");
  assert.ok(gourouIdx >= 0, "Gourou présent");

  function hit(highSmash) {
    g.setVsAI(true); g.setAiLevel(1);
    g.newGame(77);
    g.setServingSide(0);
    g.setState("play"); g.setServeCountdown(0);
    g.blobL.charId = gourouIdx;
    g.blobL.x = 280;
    // Les deux en l'air (service au sol interdit) : haut = vrai smash, bas = cloche
    g.blobL.y = highSmash ? C.GROUND_Y - 120 : C.GROUND_Y - 55;
    g.blobL.onGround = false;
    g.blobL.lastActiveHitTick = -999;
    g.blobR.x = C.W - 40; g.blobR.y = C.GROUND_Y; g.blobR.onGround = true;
    g.ball.x = 285;
    g.ball.y = highSmash ? C.NET_TOP - 10 : g.blobL.y - 40;
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
  const lob = hit(false);
  const smash = hit(true);
  assert.ok(smash.spd > lob.spd + 0.4, "smash haut plus rapide que cloche basse");
  assert.ok(smash.vx > lob.vx + 2, "smash haut plus de composante avant");
  assert.ok(g.CHARACTERS[gourouIdx].power >= 1.06, "Gourou n'est plus sous-puissance");
});

test("V2 : smash sous le bandeau — passe le filet (Gourou milieu de court)", () => {
  const g = loadGame();
  const C = g.consts;
  const N0 = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  const gourouIdx = g.CHARACTERS.findIndex(c => c.key === "gourou");
  g.setVsAI(true); g.setAiLevel(0);
  g.newGame(81);
  g.setServingSide(1);
  g.setState("play"); g.setServeCountdown(0);
  g.blobL.charId = gourouIdx;
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
  assert.ok(cleared, "smash Gourou sous le bandeau doit passer le filet");
  assert.strictEqual(g.scores[1], 0, "pas de faute filet");
});

test("V2 : service — cloche forcée vers l'adversaire", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(55);
  g.setState("play"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y - 60; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 250; g.ball.y = g.blobL.y - 40; g.ball.vx = 0; g.ball.vy = 1;
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
  g.ball.x = 250; g.ball.y = g.blobL.y - 46; g.ball.vx = 0; g.ball.vy = 3;
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
    g.ball.x = 250; g.ball.y = g.blobL.y - 46; g.ball.vx = 0; g.ball.vy = 1;
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
    g.ball.x = 250 + ballOffX; g.ball.y = g.blobL.y - 46; g.ball.vx = 0; g.ball.vy = 1;
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
  g.ball.x = 120; g.ball.y = g.blobL.y - 46; g.ball.vx = 0; g.ball.vy = 2;
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

test("event cortège : Palais Gallard traverse le terrain", () => {
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

test("menu : Solo / Multijoueur puis sous-menus", () => {
  const g = loadGame();
  g.setState("menu");
  assert.deepStrictEqual(g.navOptions().slice(0, 2), ["Digit1", "Digit2"]);
  assert.ok(g.navOptions().includes("KeyO"), "Options au menu");
  g.setState("soloMenu");
  assert.deepStrictEqual(g.navOptions(), ["Digit1", "Digit2", "Digit3"]);
  g.setState("multiMenu");
  assert.deepStrictEqual(g.navOptions(), ["Digit1", "Digit2"]);
  g.setState("options");
  assert.ok(g.navOptions().includes("OptQuiet"));
});

test("menu terrain : navOptions couvre tous les terrains (Digit1..N)", () => {
  const g = loadGame();
  assert.ok(typeof g.navOptions === "function", "navOptions exposé");
  g.setState("selectTerrain");
  const opts = g.navOptions();
  const n = g.TERRAINS.length;
  assert.strictEqual(opts.length, n, "un Digit par terrain (était plafonné à 9)");
  assert.strictEqual(opts[n - 1], "Digit" + n, "dernier terrain = Digit" + n);
  assert.ok(g.TERRAINS.some(t => t.key === "jardin-des-roses"), "Jardin des Roses présent");
});

test("Le Mur : une fois passé, pas de téléport derrière", () => {
  const g = freshRally(42);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  const { NET_X, GROUND_Y } = g.consts;
  const wallX = NET_X * 0.58;
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

test("SUPER équilibre : flags charge + durées", () => {
  const g = loadGame();
  const by = Object.fromEntries(g.CHARACTERS.map(c => [c.key, c]));
  assert.ok(!by.bebe.clapDouble, "Bébé : plus de clapDouble");
  assert.ok(!by.faucon.egoCharge, "Faucon : plus d'egoCharge");
  assert.ok(by.dorf.egoCharge && by.capitaine.egoCharge, "Dorf/Capitaine gardent egoCharge");
  assert.ok(!by.timonier.egoCharge, "Timonier : mur long sans egoCharge");
  const D = g.SUPER_DUR;
  assert.strictEqual(D.bebe, 220);
  assert.strictEqual(D.sultan, 220);
  assert.strictEqual(D.faucon, 220);
  assert.strictEqual(D.volkoi, 300);
  assert.strictEqual(D.cygne, 300);
  assert.strictEqual(D.gourou, 280);
  assert.strictEqual(D.safran, 280);
  assert.strictEqual(D.dorf, 320);
  assert.strictEqual(D.capitaine, 320);
  assert.strictEqual(D.timonier, 360);
  assert.strictEqual(g.SUPER_NEED, 3);
  assert.ok(Math.abs(g.SUPER_SLOW_MUL - 0.55) < 1e-9);
  assert.ok(/ralentit/i.test(by.safran.superDesc), "Safran décrit un vrai ralentissement");
});

test("SUPER charge : Bébé charge en 3 points (pas 2)", () => {
  const g = freshRally(11);
  const bebe = g.CHARACTERS.findIndex(c => c.key === "bebe");
  g.blobL.charId = bebe;
  g.setSuperCharge(0, 0);
  g.awardPoint(0, "test");
  assert.deepStrictEqual(g.getSuperCharge(), [0, 0], "après 1 point : pas prêt");
  g.setState("play");
  g.awardPoint(0, "test");
  assert.deepStrictEqual(g.getSuperCharge(), [0, 0], "après 2 points : pas prêt");
  g.setState("play");
  g.awardPoint(0, "test");
  assert.deepStrictEqual(g.getSuperCharge(), [1, 0], "après 3 points : SUPER prêt");
});

test("SUPER charge : Faucon ne charge pas en perdant ; Dorf oui", () => {
  const g = freshRally(12);
  const faucon = g.CHARACTERS.findIndex(c => c.key === "faucon");
  const dorf = g.CHARACTERS.findIndex(c => c.key === "dorf");
  g.blobL.charId = faucon;
  g.blobR.charId = dorf;
  g.setSuperCharge(0, 0);
  // Point pour la droite → Faucon (gauche) perd : plus d'egoCharge
  g.awardPoint(1, "test");
  assert.strictEqual(g.getSuperCharge()[0], 0, "Faucon perdant : pas de charge");
  assert.strictEqual(g.getSuperCharge()[1], 0, "Dorf gagnant après 1 pt : pas encore streak SUPER");

  // Point pour la gauche → Dorf perd → egoCharge
  g.setState("play");
  g.setSuperCharge(0, 0);
  g.awardPoint(0, "test");
  assert.strictEqual(g.getSuperCharge()[1], 1, "Dorf perdant : egoCharge");
});

test("SUPER Safran : active slow (pas ice)", () => {
  const g = freshRally(13);
  const safran = g.CHARACTERS.findIndex(c => c.key === "safran");
  g.blobL.charId = safran;
  g.setSuperCharge(1, 0);
  g.superEffects.length = 0;
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.stepGame({ ...N, super:true }, N);
  assert.strictEqual(g.blobL.superKind, "safran");
  // Même frame : activation puis tickSuper → SUPER_DUR - 1
  assert.strictEqual(g.blobL.superT, g.SUPER_DUR.safran - 1);
  assert.ok(g.superEffects.some(e => e.kind === "slow" && e.side === 1 && e.t > 0), "effet slow camp adverse");
  assert.ok(!g.superEffects.some(e => e.kind === "ice"), "pas d'ice Safran");
});

test("Super Smash : jauge se remplit en échange + bonus contact", () => {
  const g = freshRally(21);
  assert.ok(g.POWER_GAUGE_MAX >= 800, "jauge assez longue (moins fréquent)");
  assert.ok(g.POWER_GAUGE_TOUCH <= 45, "bonus contact modéré");
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setPowerGauge(0, 0);
  const before = g.getPowerGauge()[0];
  for (let i = 0; i < 40; i++) g.stepGame(N, N);
  assert.ok(g.getPowerGauge()[0] > before, "jauge monte pendant l'échange");
  assert.ok(g.getPowerGauge()[0] >= before + 35, "au moins ~1 tick/frame");
  g.setPowerGauge(100, 0);
  // Contact : registerTouch via frappe
  const { GROUND_Y } = g.consts;
  g.blobL.x = 220; g.blobL.y = GROUND_Y; g.blobL.onGround = true;
  g.ball.x = 220; g.ball.y = GROUND_Y - 70; g.ball.vx = 0; g.ball.vy = 2;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.heldBy = -1;
  g.stepGame({ ...N, smash:true }, N);
  assert.ok(g.getPowerGauge()[0] >= 100 + Math.min(20, g.POWER_GAUGE_TOUCH - 5) ||
            g.getPowerGauge()[0] > 100, "contact peut booster la jauge");
});

test("Manette : stick bien orienté digue un smash adverse", () => {
  const g = freshRally(33);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setMapEventsQuiet(true);
  const { NET_X, GROUND_Y } = g.consts;
  // Smash adverse qui arrive sur le joueur gauche au sol
  g.blobL.x = 220; g.blobL.y = GROUND_Y; g.blobL.onGround = true;
  g.blobL.vy = 0; g.blobL.lastActiveHitTick = -999;
  g.ball.x = 260; g.ball.y = GROUND_Y - 70;
  g.ball.vx = -11; g.ball.vy = 3;
  g.ball.smash = 50; g.ball.frozen = false; g.ball.inHands = false;
  g.ball.heldBy = -1; g.ball.lastTouchSide = 1;
  // Stick vers la balle (droite-bas relatif) sans appuyer X
  const pad = { ...N, ax: 0.55, ay: -0.45 };
  let dug = false;
  for (let i = 0; i < 18; i++) {
    g.stepGame(pad, N);
    if (g.ball.lastTouchSide === 0) { dug = true; break; }
    if (g.getState() === "point") break;
  }
  assert.ok(dug, "dig manette au stick sans X");
  assert.ok(g.ball.vy < -2, "cloche de dig vers le haut");
});

test("Super Smash : freeze dosage puis frappe lourde + ralenti", () => {
  const g = freshRally(22);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setMapEventsQuiet(true);
  g.setPowerGauge(g.POWER_GAUGE_MAX, 0);
  const { NET_X, GROUND_Y } = g.consts;
  g.blobL.x = NET_X - 80;
  g.blobL.y = GROUND_Y - 90;
  g.blobL.onGround = false;
  g.blobL.vy = -2;
  g.ball.x = g.blobL.x + 8;
  g.ball.y = g.blobL.y - 50;
  g.ball.vx = 1; g.ball.vy = 0;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.heldBy = -1;
  g.ball.serveAimLock = false; g.ball.serveFlight = false;
  // Maintien smash → entre en windup
  g.stepGame({ ...N, smash:true, ax:0.8, ay:0.2 }, N);
  assert.ok(g.getPowerWindup(), "entre en dosage Super Smash");
  assert.strictEqual(g.getPowerWindup().side, 0);
  // Maintien long (≥ POWER_WINDUP_MIN) puis relâche
  const hold = Math.max(10, (g.POWER_WINDUP_MIN | 0) + 4);
  for (let i = 0; i < hold; i++) g.stepGame({ ...N, smash:true, ax:0.8, ay:0.3 }, N);
  assert.ok(g.getPowerWindup(), "toujours en dosage pendant maintien");
  g.stepGame({ ...N, smash:false, ax:0.8, ay:0.3 }, N);
  assert.ok(!g.getPowerWindup(), "relâche → tir");
  assert.strictEqual(g.getPowerGauge()[0], 0, "jauge consommée");
  assert.ok(g.ball.smash > 0, "traînée smash destructeur");
  assert.ok(g.ball.slowMo > 0, "ralenti après Super Smash");
  assert.ok(g.ball.vx > 2, "balle projetée vers l'adversaire");
});

test("Super Smash : contact auto sans maintien = smash normal (pas forcé)", () => {
  const g = freshRally(23);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setMapEventsQuiet(true);
  g.setPowerGauge(g.POWER_GAUGE_MAX, 0);
  const { NET_X, GROUND_Y } = g.consts;
  g.blobL.x = NET_X - 80;
  g.blobL.y = GROUND_Y - 90;
  g.blobL.onGround = false;
  g.blobL.vy = -2;
  g.ball.x = g.blobL.x + 8;
  g.ball.y = g.blobL.y - 50;
  g.ball.vx = 1; g.ball.vy = 0;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.heldBy = -1;
  g.ball.serveAimLock = false; g.ball.serveFlight = false;
  // Pas de smash maintenu → même au contact aérien, pas de Super Smash forcé
  let hit = false;
  for (let i = 0; i < 12; i++) {
    g.stepGame({ ...N, smash:false, ax:0.8, ay:0.2 }, N);
    assert.ok(!g.getPowerWindup(), "pas de dosage sans maintien");
    if (g.ball.lastTouchSide === 0) { hit = true; break; }
    if (g.getState() === "point") break;
  }
  assert.strictEqual(g.getPowerGauge()[0], g.POWER_GAUGE_MAX, "jauge intacte");
  assert.ok(!(g.ball.slowMo > 0), "pas de ralenti Super Smash");
  assert.ok(hit || g.getState() === "play", "échange continue sans Super Smash forcé");
});

test("Super Smash : relâche trop tôt = smash normal, jauge gardée", () => {
  const g = freshRally(24);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setMapEventsQuiet(true);
  g.setPowerGauge(g.POWER_GAUGE_MAX, 0);
  const { NET_X, GROUND_Y } = g.consts;
  g.blobL.x = NET_X - 80;
  g.blobL.y = GROUND_Y - 90;
  g.blobL.onGround = false;
  g.blobL.vy = -2;
  g.ball.x = g.blobL.x + 8;
  g.ball.y = g.blobL.y - 50;
  g.ball.vx = 1; g.ball.vy = 0;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.heldBy = -1;
  g.ball.serveAimLock = false; g.ball.serveFlight = false;
  g.stepGame({ ...N, smash:true, ax:0.8, ay:0.2 }, N);
  assert.ok(g.getPowerWindup(), "entre en dosage");
  // Relâche immédiatement (avant minT)
  g.stepGame({ ...N, smash:false, ax:0.8, ay:0.2 }, N);
  assert.ok(!g.getPowerWindup(), "sortie du dosage");
  assert.strictEqual(g.getPowerGauge()[0], g.POWER_GAUGE_MAX, "jauge non consommée");
  assert.ok(!(g.ball.slowMo > 0), "pas de Super Smash");
});

test("Super Smash : relâche à mi-charge = Super Smash, jauge consommée", () => {
  const g = freshRally(25);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.setMapEventsQuiet(true);
  g.setPowerGauge(g.POWER_GAUGE_MAX, 0);
  const { NET_X, GROUND_Y } = g.consts;
  g.blobL.x = NET_X - 80;
  g.blobL.y = GROUND_Y - 90;
  g.blobL.onGround = false;
  g.blobL.vy = -2;
  g.ball.x = g.blobL.x + 8;
  g.ball.y = g.blobL.y - 50;
  g.ball.vx = 1; g.ball.vy = 0;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.heldBy = -1;
  g.ball.serveAimLock = false; g.ball.serveFlight = false;
  g.stepGame({ ...N, smash:true, ax:0.8, ay:0.2 }, N);
  assert.ok(g.getPowerWindup(), "entre en dosage");
  // ~mi-parcours du dosage (charge ~0.5), au-delà de minT
  const half = Math.max((g.POWER_WINDUP_MIN | 0) + 2, Math.floor((g.POWER_WINDUP_MAX | 0) * 0.45));
  for (let i = 0; i < half; i++) g.stepGame({ ...N, smash:true, ax:0.8, ay:0.3 }, N);
  const ch = g.getPowerWindup() && g.getPowerWindup().charge;
  assert.ok(ch >= 0.4 && ch <= 0.75, "mi-charge (ch=" + ch + ")");
  g.stepGame({ ...N, smash:false, ax:0.8, ay:0.3 }, N);
  assert.ok(!g.getPowerWindup(), "relâche → tir");
  assert.strictEqual(g.getPowerGauge()[0], 0, "jauge consommée à mi-puissance");
  assert.ok(g.ball.smash > 0, "Super Smash (pas smash normal)");
  assert.ok(g.ball.slowMo > 0, "ralenti Super Smash");
});

test("SUPER Cygne : durée 300 + anti-smash retour", () => {
  const g = freshRally(14);
  const cygne = g.CHARACTERS.findIndex(c => c.key === "cygne");
  g.blobL.charId = cygne;
  g.setSuperCharge(1, 0);
  g.superEffects.length = 0;
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.stepGame({ ...N, super:true }, N);
  assert.strictEqual(g.blobL.superKind, "cygne");
  assert.strictEqual(g.blobL.superT, g.SUPER_DUR.cygne - 1);
  // Frappe Cygne récente → smash adverse refusé
  g.ball.lastTouchSide = 0;
  g.ball.inHands = false;
  g.ball.frozen = false;
  g.blobR.onGround = false;
  g.blobR._input = N;
  assert.strictEqual(typeof g.trySmashBall, "function");
  assert.strictEqual(g.trySmashBall(g.blobR), false, "smash retour bloqué pendant Passage en Force");
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
  const modeCount = { volley: 0, flame: 0, bomb: 0, "2v2": 0 };
  g.STORY.forEach((ch, i) => {
    assert.ok(keys.has(ch.left), "ch" + i + " left invalide: " + ch.left);
    assert.ok(keys.has(ch.right), "ch" + i + " right invalide: " + ch.right);
    assert.notStrictEqual(ch.left, ch.right, "ch" + i + " oppose un perso à lui-même");
    assert.ok(ch.terrain >= 0 && ch.terrain < g.TERRAINS.length, "ch" + i + " terrain hors bornes");
    assert.ok(ch.mode === "volley" || ch.mode === "bomb" || ch.mode === "flame" || ch.mode === "2v2", "ch" + i + " mode invalide");
    modeCount[ch.mode]++;
    if (ch.mode === "2v2") {
      assert.ok(keys.has(ch.ally) && ch.ally !== ch.left && ch.ally !== ch.right, "ch" + i + " ally invalide");
      assert.ok(keys.has(ch.right2) && ch.right2 !== ch.left && ch.right2 !== ch.right && ch.right2 !== ch.ally, "ch" + i + " right2 invalide");
    }
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
  // Campagne Sommet (9 ch.) : 1×2v2 + 2 volley / 3 flame / 3 bomb
  if (g.STORY.length === 9) {
    assert.deepStrictEqual(modeCount, { volley: 2, flame: 3, bomb: 3, "2v2": 1 }, "Sommet : 2v2+volley/flame/bomb");
  }
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
    const modeCount = { volley: 0, flame: 0, bomb: 0, "2v2": 0 };
    camp.forEach((ch, i) => {
      assert.strictEqual(ch.left, key, key + "[" + i + "] left doit être le protagoniste");
      assert.ok(keySet.has(ch.right) && ch.right !== key, key + "[" + i + "] rival valide");
      assert.ok(ch.terrain >= 0 && ch.terrain < g.TERRAINS.length, key + "[" + i + "] terrain hors bornes");
      assert.ok(ch.mode === "volley" || ch.mode === "bomb" || ch.mode === "flame" || ch.mode === "2v2", key + "[" + i + "] mode invalide");
      modeCount[ch.mode]++;
      // Montée en rivalité : 0–2 volley|2v2, 3–5 flame, 6–8 bomb
      if (i < 3) assert.ok(ch.mode === "volley" || ch.mode === "2v2", key + "[" + i + "] acte I = volley/2v2");
      else if (i < 6) assert.strictEqual(ch.mode, "flame", key + "[" + i + "] mode selon rivalité");
      else assert.strictEqual(ch.mode, "bomb", key + "[" + i + "] mode selon rivalité");
      assert.strictEqual(ch.act, i < 3 ? 1 : i < 6 ? 2 : 3, key + "[" + i + "] acte");
      assert.ok(ch.doped === null || ch.doped === "R", key + "[" + i + "] seul l'adversaire (R) est dopé");
      const preTxt = (ch.pre || []).map(l => l.t).join(" ");
      if (ch.mode === "2v2") {
        assert.ok(keySet.has(ch.ally) && ch.ally !== key && ch.ally !== ch.right, key + "[" + i + "] ally");
        assert.ok(keySet.has(ch.right2) && ![key, ch.right, ch.ally].includes(ch.right2), key + "[" + i + "] right2");
        assert.ok(/2v2|double|partenair|équipe|alliance|binôme|duo/i.test(preTxt), key + "[" + i + "] dialogue 2v2");
      }
      if (ch.mode === "flame") {
        assert.ok(/enflamm|brûl|flamme|braise|PV/i.test(preTxt), key + "[" + i + "] dialogue flame");
      }
      if (ch.mode === "bomb") {
        assert.ok(/bombe|mèche|BOUM|boum|explose/i.test(preTxt), key + "[" + i + "] dialogue bombe");
      }
      for (const phase of ["pre", "win", "lose"]) {
        assert.ok(Array.isArray(ch[phase]) && ch[phase].length > 0, key + "[" + i + "] " + phase + " vide");
        for (const line of ch[phase]) {
          assert.ok(typeof line.t === "string" && line.t.length > 0, key + "[" + i + "] réplique vide");
          assert.ok(line.s === "narrator" || keySet.has(line.s), key + "[" + i + "] locuteur inconnu: " + line.s);
        }
      }
    });
    assert.deepStrictEqual(modeCount, { volley: 2, flame: 3, bomb: 3, "2v2": 1 }, key + " : 2v2+volley / flame / bomb");
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
  assert.strictEqual(g.getState(), "storyCharIntro", "sélection → fiche perso");
  const fiche = g.storyCharFiche && g.storyCharFiche(heroKey);
  assert.ok(fiche && fiche.blurb && fiche.blurb.length > 40, "bio présente");
  assert.ok(fiche.nation, "nation présente");
  if (g.storyConfirmIntro) g.storyConfirmIntro();
  assert.strictEqual(g.getState(), "storyMenu", "fiche → hub");
  // lancer le 1er match utilise bien la campagne active
  g.setStoryChapter(0);
  g.storyStartMatch();
  assert.strictEqual(g.blobL.charId, g.storyCharIdx(story[0].left), "protagoniste à gauche");
  assert.strictEqual(g.blobR.charId, g.storyCharIdx(story[0].right), "rival à droite");
  if (story[0].mode === "2v2") {
    assert.strictEqual(g.getMode(), "2v2", "chapitre alliance → mode 2v2");
    assert.strictEqual(g.blob2L.charId, g.storyCharIdx(story[0].ally), "partenaire à gauche");
    assert.strictEqual(g.blob2R.charId, g.storyCharIdx(story[0].right2), "2e adversaire");
  }
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

test("story 2v2 : balle reste en mains ; F lance ; IA adverse sert aussi", () => {
  const g = loadGame();
  const idx = g.STORY.findIndex(c => c.mode === "2v2");
  assert.ok(idx >= 0, "au moins un chapitre 2v2");
  g.storySelectCampaign(0);
  if (g.storyConfirmIntro) g.storyConfirmIntro();
  g.setStoryChapter(idx);
  g.storyStartMatch();
  assert.strictEqual(g.getMode(), "2v2");
  // Service camp joueur (sinon RNG → camp IA qui lance pendant l'attente)
  g.setServingSide(0);
  g.startRally();
  g.setServeCountdown(0);
  const N = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  // Sans input humain : balle reste en mains (pas d'allié qui vole le service)
  for (let i = 0; i < 250; i++) {
    const ins = g.getActiveBlobs().map((b, j) => (j === 0 ? { ...N } : g.aiInput2v2(b)));
    g.stepGame(null, null, ins);
  }
  assert.ok(g.ball.inHands && g.ball.frozen, "balle toujours en mains du joueur");
  // Espace ≠ service ; F = lancer
  {
    const ins = g.getActiveBlobs().map((b, j) => (
      j === 0 ? { ...N, jump:true, kbdJump:true } : g.aiInput2v2(b)
    ));
    g.stepGame(null, null, ins);
  }
  assert.ok(g.ball.inHands && g.ball.frozen, "Espace ne sert plus au sol");
  {
    const ins = g.getActiveBlobs().map((b, j) => (
      j === 0 ? { ...N, smash:true } : g.aiInput2v2(b)
    ));
    g.stepGame(null, null, ins);
  }
  assert.strictEqual(g.ball.inHands, false, "F lance la balle");

  // Service camp IA : le porteur adverse lance malgré le chaser
  g.setServingSide(1);
  g.startRally();
  g.setServeCountdown(0);
  let aiTossed = false;
  for (let i = 0; i < 80; i++) {
    const ins = g.getActiveBlobs().map((b, j) => (j === 0 ? { ...N } : g.aiInput2v2(b)));
    g.stepGame(null, null, ins);
    if (!g.ball.inHands) { aiTossed = true; break; }
  }
  assert.ok(aiTossed, "IA adverse lance son service en 2v2");
});

test("V2 : smash auto clavier malgré dérive manette (ax)", () => {
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
  // kbdJump prioritaire sur ax dérivé (manette branchée au repos)
  g.stepGame({ ...N0, jump:true, kbdJump:true, ax:0.25, ay:0.1 }, N0);
  assert.ok(g.ball.vx > 2 || Math.hypot(g.ball.vx, g.ball.vy) > 4,
    "smash auto clavier malgré dérive stick");
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
  assert.strictEqual(g.getFlameMode(), false, "volley = pas de flamme");
  assert.strictEqual(g.blobR.doped, false, "pas de dopage en rivalité légère");

  // chapitre Ballon enflammé (campagne curée ou perso)
  const flameIdx = g.STORY.findIndex(c => c.mode === "flame");
  assert.ok(flameIdx >= 0, "au moins un chapitre flame dans STORY active");
  g.setStoryChapter(flameIdx);
  g.storyStartMatch();
  assert.strictEqual(g.getFlameMode(), true, "mode flamme actif");
  assert.strictEqual(g.getBombMode(), false, "flamme exclut bombe");
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

// ---------- Mode Tournoi ----------
test("tournoi : bracket 8 persos uniques, joueur présent", () => {
  const g = loadGame();
  assert.ok(g.tournamentBuildBracket, "tournamentBuildBracket exposé");
  g.tournamentBuildBracket(2, 1, 4242);
  const t = g.getTournament();
  assert.ok(t, "état tournoi créé");
  assert.strictEqual(t.playerChar, 2);
  const chars = new Set();
  for (let i = 0; i < 4; i++) {
    chars.add(t.matches[i].a);
    chars.add(t.matches[i].b);
  }
  assert.strictEqual(chars.size, 8, "8 dirigeants distincts");
  assert.ok(chars.has(2), "joueur dans le tableau");
  assert.strictEqual(t.matches[0].a, 2, "joueur en slot a du quart 0");
});

test("tournoi : simu IA vs IA produit un vainqueur", () => {
  const g = loadGame();
  g.tournamentBuildBracket(0, 0, 99);
  const r = g.tournamentSimOne(1, 3);
  assert.ok(r.winner === 1 || r.winner === 3);
  assert.ok(r.scoreA === g.TOURNAMENT_WIN_SCORE || r.scoreB === g.TOURNAMENT_WIN_SCORE);
  g.tournamentSimPendingAi();
  const t = g.getTournament();
  // Quarts 1–3 (IA) joués ; quart 0 (joueur) intact
  assert.strictEqual(t.matches[0].played, false);
  assert.strictEqual(t.matches[1].played, true);
  assert.strictEqual(t.matches[2].played, true);
  assert.strictEqual(t.matches[3].played, true);
  assert.ok(t.matches[1].winner != null);
});

test("tournoi : victoire joueur progresse vers le tour suivant", () => {
  const g = loadGame();
  g.tournamentBuildBracket(0, 1, 7);
  g.tournamentSimPendingAi();
  assert.strictEqual(g.tournamentPlayerMatchIndex(), 0);
  assert.ok(g.tournamentStartNextMatch());
  assert.strictEqual(g.getTournamentFlags().inMatch, true);
  assert.strictEqual(g.getState(), "serve");
  g.setScores(7, 3);
  g.tournamentOnMatchEnd();
  assert.strictEqual(g.getTournamentFlags().inMatch, false);
  assert.strictEqual(g.getState(), "tournamentBracket");
  assert.strictEqual(g.getTournament().matches[0].played, true);
  assert.strictEqual(g.getTournament().matches[0].winner, 0);
  // Prochain match joueur = demi (index 4)
  assert.strictEqual(g.tournamentPlayerMatchIndex(), 4);
});

test("tournoi : matchWinScore = 7", () => {
  const g = loadGame();
  assert.strictEqual(g.matchWinScore(), 15);
  g.tournamentBuildBracket(1, 2, 1);
  assert.strictEqual(g.matchWinScore(), g.TOURNAMENT_WIN_SCORE);
  assert.strictEqual(g.matchWinScore(), 7);
});

test("tournoi : défaite joueur → écran fin (éliminé)", () => {
  const g = loadGame();
  g.tournamentBuildBracket(0, 1, 11);
  g.tournamentSimPendingAi();
  g.tournamentStartNextMatch();
  g.setScores(2, 7);
  g.tournamentOnMatchEnd();
  assert.strictEqual(g.getState(), "tournamentEnding");
  assert.strictEqual(g.getTournament()._eliminated, true);
  assert.notStrictEqual(g.tournamentChampion(), 0);
  // Pas de match joueur suivant
  assert.strictEqual(g.tournamentPlayerMatchIndex(), -1);
});

// ---------- Polish Steam : options / méta / skins ----------
test("options : ouverture depuis le menu", () => {
  const g = loadGame();
  g.setState("menu");
  g.openOptions(false);
  assert.strictEqual(g.getState(), "options");
  g.leaveOptions();
  assert.strictEqual(g.getState(), "menu");
});

test("fiction : dialogues shippés sans Amérique / Europe / S-400", () => {
  const g = loadGame();
  const blob = JSON.stringify([g.STORY_CAMPAIGNS || g.STORY_BY_CHAR || {}, g.STORY_BIOS || {}]);
  assert.ok(blob.indexOf("Amérique") < 0, "pas Amérique");
  assert.ok(blob.indexOf("Europe") < 0, "pas Europe");
  assert.ok(blob.indexOf("S-400") < 0, "pas S-400");
  // Références réelles bannies (fictionnalisation) — pays, armées, institutions, religions.
  const banned = /Ramenie|Syrie|Rafale|BRICS|parisien|énarque|mosquée|Occident|occidental|transatlantique/i;
  const hit = blob.match(banned);
  assert.ok(!hit, "référence bannie dans le texte shippé : " + (hit && hit[0]));
});

test("confort : Options → Confort + toggles persistés", () => {
  const g = loadGame();
  g.setReduceMotion(false);
  g.setFlashSafe(false);
  g.setJuiceLite(false);
  g.openOptions(false);
  g.handleMenuKeys("OptComfort", "");
  assert.strictEqual(g.getState(), "optionsComfort");
  g.handleMenuKeys("OptMotion", "");
  assert.ok(g.getReduceMotion());
  g.handleMenuKeys("OptFlash", "");
  assert.ok(g.getFlashSafe());
  g.handleMenuKeys("OptJuice", "");
  assert.ok(g.getJuiceLite());
  g.saveSettings();
  g.setReduceMotion(false);
  g.setFlashSafe(false);
  g.setJuiceLite(false);
  g.loadSettings();
  assert.ok(g.getReduceMotion() && g.getFlashSafe() && g.getJuiceLite());
  g.setReduceMotion(false);
  g.setFlashSafe(false);
  g.setJuiceLite(false);
  g.saveSettings();
});

test("confort : reduceMotion atténue shake et flash", () => {
  const g = loadGame();
  g.setReduceMotion(false);
  g.setFlashSafe(false);
  g.setJuiceLite(false);
  assert.ok(g.fxShakeMul() >= 0.99);
  assert.ok(g.fxAllowFlash());
  assert.strictEqual(g.fxCount(100), 100);
  g.setReduceMotion(true);
  assert.ok(g.fxShakeMul() < 0.2);
  assert.ok(!g.fxAllowFlash());
  assert.ok(g.fxCount(100) < 40);
  g.setReduceMotion(false);
  g.setFlashSafe(true);
  assert.ok(!g.fxAllowFlash());
  g.setFlashSafe(false);
  g.setJuiceLite(true);
  assert.ok(g.fxCount(100) < 60);
  g.setJuiceLite(false);
});

test("juice : lancer de service produit un puff", () => {
  const g = loadGame();
  g.setVsAI(true);
  g.setAiLevel(1);
  g.newGame(11);
  g.setState("serve");
  g.setServeCountdown(0);
  g.setServingSide(0);
  g.startRally();
  g.setServeCountdown(0);
  assert.ok(g.ball.inHands);
  const before = g.getParticles().length;
  g.tossServeBall(g.blobL);
  assert.ok(!g.ball.inHands);
  assert.ok(g.getParticles().length > before || g.getShake() > 0, "puff ou micro-shake");
});

test("rebind : Options → Contrôles + capture touche", () => {
  const g = loadGame();
  g.resetKeybinds();
  g.openOptions(false);
  g.handleMenuKeys("OptBinds", "");
  assert.strictEqual(g.getState(), "optionsBinds");
  g.startRebind("p1", "left");
  assert.ok(g.tryApplyRebind("KeyQ"));
  assert.strictEqual(g.getKeybinds().p1.left, "KeyQ");
  g.keys.KeyQ = true;
  assert.ok(g.keyHeldPlayer("p1", "left"));
  g.keys.KeyQ = false;
  g.resetKeybinds();
  assert.strictEqual(g.getKeybinds().p1.left, "KeyA");
});

test("rebind : localInputs suit les binds J1", () => {
  const g = loadGame();
  g.resetKeybinds();
  g.setVsAI(true);
  g.setAiLevel(1);
  g.newGame(7);
  g.setState("play");
  g.setServeCountdown(0);
  g.applyKeybinds({ p1: { left: "KeyQ", right: "KeyD", jump: "KeyW", smash: "KeyF", super: "KeyE" } });
  g.keys.KeyQ = true;
  const inp = g.localInputs(0);
  assert.ok(inp.left, "KeyQ = gauche après rebind");
  g.keys.KeyQ = false;
  g.keys.KeyA = true;
  assert.ok(!g.localInputs(0).left, "ancien KeyA ne bouge plus");
  g.keys.KeyA = false;
  g.resetKeybinds();
});

test("rebind : conflit échange les touches", () => {
  const g = loadGame();
  g.resetKeybinds();
  g.startRebind("p1", "smash");
  g.tryApplyRebind("KeyE"); // E était Super
  assert.strictEqual(g.getKeybinds().p1.smash, "KeyE");
  assert.strictEqual(g.getKeybinds().p1.super, "KeyF", "Super récupère l'ancienne frappe");
  g.resetKeybinds();
});

test("rebind : persistance saveSettings / loadSettings", () => {
  const g = loadGame();
  g.applyKeybinds({ p1: { left: "KeyZ", right: "KeyX", jump: "KeyC", smash: "KeyV", super: "KeyB" } });
  g.saveSettings();
  // reset mémoire sans réécrire le storage (resetKeybinds persiste aussi)
  g.applyKeybinds(g.KEYBIND_DEFAULTS);
  assert.strictEqual(g.getKeybinds().p1.left, "KeyA");
  g.loadSettings();
  assert.strictEqual(g.getKeybinds().p1.left, "KeyZ");
  g.resetKeybinds(); // remet défaut + storage propre pour les tests suivants
});

test("meta : victoire finale tournoi débloque un skin", () => {
  const g = loadGame();
  const before = g.getMeta().tournamentWins | 0;
  g.tournamentBuildBracket(0, 1, 33);
  g.tournamentSimPendingAi();
  // Quarts → demis → finale
  for (let round = 0; round < 3; round++) {
    assert.ok(g.tournamentStartNextMatch(), "match joueur tour " + round);
    g.setScores(7, 1);
    g.tournamentOnMatchEnd();
  }
  assert.strictEqual(g.getState(), "tournamentEnding");
  assert.strictEqual(g.getTournament()._eliminated, false);
  assert.ok(g.getMeta().tournamentWins > before, "compteur couronnes");
  assert.ok(g.getMeta().ballUnlocked.indexOf(1) >= 0, "skin Or débloqué");
  assert.ok(g.getBallSkin() >= 1, "skin équipé");
});

test("meta : commitSetup conserve le ballon équipé", () => {
  const g = loadGame();
  g.metaOnTournamentWin();
  const equipped = g.getBallSkin();
  assert.ok(equipped >= 1, "skin non-cartoon après couronne");
  g.setPendingMode({ vsAI: true, aiLevel: 0, mode2v2: false, bomb: false, flame: false });
  g.commitSetup();
  assert.strictEqual(g.getBallSkin(), equipped, "commitSetup ne force pas 0");
});

// ---------- Quickplay / matchmaking ----------
test("online menu : Partie rapide exposée", () => {
  const g = loadGame();
  g.setState("onlineMenu");
  assert.deepStrictEqual(g.navOptions(), ["Digit1", "Digit2", "Digit3"]);
});

test("quickplay bot-backfill → partie vs IA", () => {
  const g = loadGame();
  g.setPendingMode({ online: true, quickplay: true, o2v2: false, bomb: false, flame: false });
  g.setState("matchmaking");
  assert.ok(g.startQuickplayBot, "startQuickplayBot exposé");
  g.startQuickplayBot();
  assert.strictEqual(g.getOnline(), false);
  assert.strictEqual(g.getVsAI(), true);
  assert.ok(g.getState() === "serve" || g.getState() === "play", "partie locale lancée");
});

test("pause : Échap ouvre le menu, Reprendre ferme, Quitter revient au menu", () => {
  const g = loadGame();
  g.setMode("1v1");
  g.setVsAI(true);
  g.newGame(7);
  assert.ok(g.getState() === "serve" || g.getState() === "play");
  assert.strictEqual(g.getPaused(), false);
  g.handleMenuKeys("Escape", "");
  assert.strictEqual(g.getPaused(), true, "Échap ouvre la pause");
  g.handleMenuKeys("PauseResume", "");
  assert.strictEqual(g.getPaused(), false, "Reprendre ferme la pause");
  g.handleMenuKeys("KeyP", "");
  assert.strictEqual(g.getPaused(), true, "P ouvre la pause");
  g.handleMenuKeys("PauseQuit", "");
  assert.strictEqual(g.getPaused(), false);
  assert.strictEqual(g.getState(), "menu", "Quitter → menu principal");
});

test("manette : SUPER lit superT (B), pas le champ super", () => {
  const g = loadGame();
  assert.ok(g.padMergeGameInput, "padMergeGameInput exposé");
  g.setPadsNow([{
    left: false, right: false, jump: false, smash: false,
    superT: true, up: false, down: false, ax: 0, ay: 0
  }]);
  const m = g.padMergeGameInput();
  assert.strictEqual(m.super, true, "B/superT → input.super");
  g.setPadsNow([{
    left: false, right: false, jump: false, smash: false,
    super: true, superT: false, up: false, down: false, ax: 0, ay: 0
  }]);
  assert.strictEqual(g.padMergeGameInput().super, false, "ancien champ .super ignoré");
  g.setPadsNow([]);
});

test("aide commandes : Escape / TutBack reviennent au menu", () => {
  const g = loadGame();
  g.setState("tutorialHelp");
  assert.ok(g.navOptions().indexOf("TutBack") >= 0, "nav manette expose Retour");
  g.handleMenuKeys("Escape", "");
  assert.strictEqual(g.getState(), "menu");
  g.setState("tutorialHelp");
  g.handleMenuKeys("TutBack", "");
  assert.strictEqual(g.getState(), "menu");
});

test("tutoriel : scénario en dur (pas de service avant l'étape Service)", () => {
  const g = loadGame();
  assert.ok(g.startTutorial, "startTutorial exposé");
  g.startTutorial();
  assert.ok(g.getTutorialMode(), "mode tutoriel");
  assert.strictEqual(g.getTutorialStep(), 0, "départ Déplacement");
  assert.strictEqual(g.getState(), "play", "pas d'état service au départ");
  assert.ok(!g.ball.inHands, "balle hors des mains (étape 0)");
  assert.ok(g.ball.frozen, "balle garée figée");
  assert.ok(g.tutorialPracticeActive(), "pratique guidée");

  // Étape Saut (index 1) : toujours pas de service
  g.setTick(1000);
  g.setTutorialStepShownAt(1000 - g.TUTORIAL_STEP_MIN_T);
  g.advanceTutorialStep();
  assert.strictEqual(g.getTutorialStep(), 1);
  assert.ok(!g.ball.inHands, "pas de service à l'étape Saut");
  assert.strictEqual(g.getState(), "play");

  // Étape Service (index 2) : balle dans les mains du joueur
  g.setTick(2000);
  g.setTutorialStepShownAt(2000 - g.TUTORIAL_STEP_MIN_T);
  g.advanceTutorialStep();
  assert.strictEqual(g.getTutorialStep(), 2);
  assert.strictEqual(g.getServingSide(), 0, "service camp joueur");
  assert.ok(g.ball.inHands && g.ball.frozen, "balle rendue au joueur");
  assert.strictEqual(g.getState(), "serve");
});

test("menus : démo 1v1 IA vs IA en fond", () => {
  const g = loadGame();
  assert.ok(g.goMenu && g.tickMenuDemo && g.menuDemoWanted);
  g.goMenu();
  assert.ok(g.menuDemoWanted(), "menu principal veut la démo");
  assert.ok(g.getMenuDemo().live, "démo démarrée");
  const ui = g.getState();
  assert.strictEqual(ui, "menu");
  const x0 = g.blobL.x;
  for (let i = 0; i < 90; i++) g.update();
  assert.strictEqual(g.getState(), "menu", "UI menu préservée");
  assert.ok(g.getMenuDemo().live, "démo toujours live");
  // La simu a avancé (balle ou joueur a bougé, ou service/play interne)
  const moved = g.blobL.x !== x0 || !g.ball.frozen || g.ball.tossGrace > 0 ||
    g.getMenuDemo().matchState === "play";
  assert.ok(moved, "IA a joué un peu");
  g.newGame(1);
  assert.ok(!g.getMenuDemo().live, "newGame coupe la démo");
});

test("menus : démo ne coupe pas online (sélection perso en ligne)", () => {
  const g = loadGame();
  g.goMenu();
  assert.ok(g.getMenuDemo().live, "démo démarrée hors-ligne");
  // Simule une session WebRTC active pendant la sélection de perso
  g.setOnline(true);
  g.setState("selectCharacter");
  assert.ok(!g.menuDemoWanted(), "pas de démo tant que online");
  g.startMenuDemoMatch(true);
  assert.ok(g.getOnline(), "startMenuDemoMatch ne coupe pas online");
  g.setOnline(false);
});

test("online : close canal pendant négociation ne tue pas le lobby", () => {
  const g = loadGame();
  assert.ok(g.onConnClosed, "onConnClosed exporté");
  g.setOnline(true);
  g.setNetConnected(false);
  g.setState("hostWait");
  g.onConnClosed({ label: "rel" });
  assert.ok(g.getOnline(), "reste online");
  assert.strictEqual(g.getState(), "hostWait", "lobby intact");
  assert.ok(!g.getNetErrorMsg(), "pas d'erreur net");
});

test("tutoriel : chaque étape reste au moins 5 s", () => {
  const g = loadGame();
  g.startTutorial();
  assert.ok(g.TUTORIAL_STEP_MIN_T >= 300, "mini ≥ 5 s @ 60 Hz");
  g.setTick(100);
  g.setTutorialStepShownAt(100);
  assert.ok(!g.tutorialStepCanSkip(), "pas de skip avant 5 s");
  g.advanceTutorialStep();
  assert.strictEqual(g.getTutorialStep(), 0, "avance bloquée trop tôt");
  g.setTick(100 + g.TUTORIAL_STEP_MIN_T);
  assert.ok(g.tutorialStepCanSkip(), "skip OK après 5 s");
  g.advanceTutorialStep();
  assert.strictEqual(g.getTutorialStep(), 1, "avance après délai");
});

test("tutoriel : feeds Réception/Smash + pas de point en pratique", () => {
  const g = loadGame();
  g.startTutorial();
  const steps = g.TUTORIAL_STEPS;
  assert.ok(steps.some(s => s.kind === "receive"), "étape Réception présente");
  assert.ok(steps.some(s => s.title === "Réception"), "titre Réception");
  const recv = steps.findIndex(s => s.kind === "receive");
  g.setTutorialStep(recv);
  g.tutorialApplyScenario(recv);
  assert.strictEqual(g.getState(), "play");
  assert.ok(!g.ball.inHands && !g.ball.frozen, "feed réception en jeu");
  assert.ok(g.ball.y < g.consts.GROUND_Y - 40, "balle en l'air");
  // Feed réception : vient du serveur adverse (camp droit)
  assert.ok(g.ball.x > g.consts.NET_X, "balle part du camp adverse");
  assert.ok(g.ball.vx < 0, "balle vient vers le joueur");
  assert.ok(g.ball.y < g.consts.GROUND_Y - 180, "lob assez haut");
  assert.strictEqual(g.getServingSide(), 1, "serveur = adversaire");
  const s0 = g.scores[0], s1 = g.scores[1];
  g.ball.y = g.consts.GROUND_Y;
  g.ball.vy = 4;
  g.awardPoint(1, "test");
  assert.strictEqual(g.scores[0], s0, "pas de score en pratique");
  assert.strictEqual(g.scores[1], s1, "pas de score adverse");
  assert.ok(!g.ball.frozen && g.ball.y < g.consts.GROUND_Y - 40, "feed relancé");
});

test("tutoriel : réception ne valide pas sans dig explicite", () => {
  const g = loadGame();
  g.startTutorial();
  const recv = g.TUTORIAL_STEPS.findIndex(s => s.kind === "receive");
  g.setTutorialStep(recv);
  g.tutorialApplyScenario(recv);
  g.setTutorialStepArmed(true);
  g.blobL.poseAnim = "receive";
  g.blobL.vx = 2.5;
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "bouger seul ≠ succès");
  g.blobL._smashEdge = true;
  g.tutorialNoteStepIntent(g.blobL);
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "dig sans payoff (balle) ≠ succès");
  // Balle tombée de l'autre côté → on a vu le résultat
  g.ball.x = g.consts.NET_X + 50;
  g.ball.y = g.consts.GROUND_Y;
  g.tutorialNoteStepIntent(g.blobL);
  assert.ok(g.tutorialStepConditionMet(g.blobL), "dig + balle partie = succès");
});

test("tutoriel : pose smash résiduelle ne valide pas l'étape Smash", () => {
  const g = loadGame();
  g.startTutorial();
  const smash = g.TUTORIAL_STEPS.findIndex(s => s.kind === "smash");
  g.setTutorialStep(smash);
  g.tutorialApplyScenario(smash);
  // Encore la pose du service précédent : pas armé → pas de succès
  g.blobL.poseAnim = "smash";
  g.setTutorialStepArmed(false);
  g.tutorialNoteStepIntent(g.blobL);
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "sans armement ≠ succès");
  // Après armement : il faut une NOUVELLE pose smash + payoff
  g.blobL.poseAnim = "";
  g.setTutorialStepArmed(true);
  g.tutorialNoteStepIntent(g.blobL);
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "armé sans smash ≠ succès");
  g.blobL.poseAnim = "smash";
  g.tutorialNoteStepIntent(g.blobL);
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "smash sans payoff ≠ succès");
  g.ball.x = g.consts.NET_X + 50;
  g.ball.y = g.consts.GROUND_Y;
  g.tutorialNoteStepIntent(g.blobL);
  assert.ok(g.tutorialStepConditionMet(g.blobL), "smash + balle partie = succès");
});

test("tutoriel : hold payoff tant que la frappe est en vol", () => {
  const g = loadGame();
  g.startTutorial();
  const smash = g.TUTORIAL_STEPS.findIndex(s => s.kind === "smash");
  g.setTutorialStep(smash);
  g.tutorialApplyScenario(smash);
  g.setTutorialStepArmed(true);
  g.blobL.poseAnim = "smash";
  g.tutorialNoteStepIntent(g.blobL);
  g.ball.x = g.consts.NET_X + 40;
  g.ball.y = 100;
  assert.ok(g.tutorialHoldPayoff(), "frappe en vol = hold (pas de reclaim)");
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "pas encore au sol");
  g.ball.y = g.consts.GROUND_Y;
  g.tutorialNoteStepIntent(g.blobL);
  assert.ok(!g.tutorialHoldPayoff(), "au sol = fin hold");
  assert.ok(g.tutorialStepConditionMet(g.blobL), "payoff vu = succès");
});

test("tutoriel : Smash = lob du serveur en face", () => {
  const g = loadGame();
  g.startTutorial();
  const smash = g.TUTORIAL_STEPS.findIndex(s => s.kind === "smash");
  assert.ok(smash >= 0, "étape Smash");
  g.setTutorialStep(smash);
  g.tutorialApplyScenario(smash);
  assert.strictEqual(g.getState(), "play");
  assert.ok(!g.ball.inHands && !g.ball.frozen, "balle en jeu");
  assert.ok(g.ball.x > g.consts.NET_X, "part du camp adverse");
  assert.ok(g.ball.vx < 0, "vient vers le joueur");
  assert.ok(g.ball.vy < 0, "lob montant");
  assert.ok(g.ball.y < g.consts.GROUND_Y - 200, "assez haut pour smash");
});

test("tutoriel : feeds adverses passent le filet (pas de rebond filet)", () => {
  const g = loadGame();
  g.startTutorial();
  const NET = g.consts.NET_X;
  for (const kind of ["receive", "smash", "hud", "super", "power"]) {
    const idx = g.TUTORIAL_STEPS.findIndex(s => s.kind === kind);
    assert.ok(idx >= 0, "étape " + kind);
    g.setTutorialStep(idx);
    g.tutorialApplyScenario(idx);
    let minX = g.ball.x;
    for (let t = 0; t < 200; t++) {
      g.updateBall();
      minX = Math.min(minX, g.ball.x);
      // Atterrissage / refeed éventuel : dès qu'on a profondément croisé, OK
      if (minX < NET - 40) break;
    }
    assert.ok(minX < NET - 40,
      kind + " : doit passer le filet et entrer en camp joueur (minX=" + minX.toFixed(1) + ")");
  }
});

test("tutoriel : Smash Battle scripté — marteler le saut pour gagner", () => {
  const g = loadGame();
  g.startTutorial();
  const battle = g.TUTORIAL_STEPS.findIndex(s => s.kind === "battle");
  assert.ok(battle >= 0, "étape Smash Battle");
  assert.strictEqual(g.TUTORIAL_STEPS.length, 10, "10 étapes (battle ajoutée)");
  g.setTutorialStep(battle);
  g.tutorialApplyScenario(battle);
  assert.ok(g.battle.active, "duel démarré");
  assert.ok(!g.blobL.onGround && !g.blobR.onGround, "les deux en l'air");
  assert.ok(Math.abs(g.ball.x - g.consts.NET_X) < 20, "balle au filet");

  const N = { left: false, right: false, jump: false, smash: false, super: false, ax: 0, ay: 0 };
  // Joueur martele, adversaire (AI soft) ne suit pas dans stepBattle direct
  g.battle.t = 1;
  g.battle.count = [0, 0];
  g.battle.prevJump = [false, false];
  g.stepBattle({ ...N, jump: true }, N);
  assert.ok(!g.battle.active, "duel résolu");
  assert.ok(g.getTutorialBattleOk(), "victoire joueur enregistrée");
  assert.ok(g.ball.vx > 0, "smash vers le camp adverse");
});

test("tutoriel : SUPER / HUD = balle du serveur en face", () => {
  const g = loadGame();
  g.startTutorial();
  for (const kind of ["hud", "super", "power"]) {
    const idx = g.TUTORIAL_STEPS.findIndex(s => s.kind === kind);
    assert.ok(idx >= 0, "étape " + kind);
    g.setTutorialStep(idx);
    g.tutorialApplyScenario(idx);
    assert.ok(g.ball.x > g.consts.NET_X, kind + " : camp adverse");
    assert.ok(g.ball.vx < 0, kind + " : vers le joueur");
    assert.strictEqual(g.getServingSide(), 1, kind + " : serveur adverse");
  }
});

test("tutoriel : textes distincts clavier vs manette (réception)", () => {
  const g = loadGame();
  g.startTutorial(); // clavier (pas de pad en headless)
  assert.ok(!g.tutorialUsesPad(), "tuto clavier par défaut");
  const kb = g.TUTORIAL_STEPS.find(s => s.kind === "receive");
  assert.ok(/digue|frappe/i.test(kb.body), "clavier = dig explicite");
  assert.ok(kb.body.indexOf("[[X:") < 0, "pas de pictos manette en clavier");
  g.setTutorialPadLocked(true);
  const pad = g.TUTORIAL_STEPS.find(s => s.kind === "receive");
  assert.ok(/HAUT|haut/i.test(pad.body), "manette : stick vers le haut");
  assert.ok(pad.body.indexOf("[[X:LS]]") >= 0, "picto stick dans le texte");
});

test("tutoriel clavier : service = F lance puis saute (pas F pour frapper)", () => {
  const g = loadGame();
  g.startTutorial();
  assert.ok(!g.tutorialUsesPad(), "tuto clavier");
  const serve = g.TUTORIAL_STEPS.find(s => s.kind === "serve");
  assert.ok(serve, "étape Service");
  assert.ok(/lance/i.test(serve.body), "mentionne le lancer");
  assert.ok(/saute/i.test(serve.body), "mentionne le saut");
  assert.ok(/smash auto/i.test(serve.body), "frappe = smash auto");
  // Un seul picto F (le lancer) — pas « F … F frappe »
  const fMarks = serve.body.match(/\[\[K:[^\]]+\]\]/g) || [];
  assert.strictEqual(fMarks.length, 1, "un seul picto touche (lance), pas F×2");
  assert.ok(!/frappe/i.test(serve.body), "pas de « frappe » manuelle F");
});

test("tutoriel manette : service ne valide pas au seul lancer X", () => {
  const g = loadGame();
  g.startTutorial();
  g.setTutorialPadLocked(true);
  const serveIdx = g.TUTORIAL_STEPS.findIndex(s => s.kind === "serve");
  assert.ok(serveIdx >= 0, "étape service");
  g.setTutorialStep(serveIdx);
  g.setServingSide(0);
  // Après lancer seulement (tossGrace) → pas validé
  g.ball.inHands = false;
  g.ball.frozen = false;
  g.ball.tossGrace = 8;
  g.ball.serveAimLock = true;
  g.ball.lastTouchSide = -1;
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "lancer X seul ≠ succès");
  // Frappe Y en vol → pas encore (il faut l'atterrissage adverse)
  g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.ball.lastTouchSide = 0;
  g.ball.vx = 5;
  g.ball.x = g.consts.NET_X - 80;
  g.ball.y = g.consts.GROUND_Y - 120;
  g.blobL.poseAnim = "smash";
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "en vol ≠ succès");
  // Atterrissage camp adverse → validé
  g.ball.x = g.consts.NET_X + 60;
  g.ball.y = g.consts.GROUND_Y;
  g.ball.vx = 0;
  assert.ok(g.tutorialStepConditionMet(g.blobL), "tombée de l'autre côté = succès");
});

test("tutoriel : service attend l'atterrissage adverse (clavier)", () => {
  const g = loadGame();
  g.startTutorial();
  const serveIdx = g.TUTORIAL_STEPS.findIndex(s => s.kind === "serve");
  g.setTutorialStep(serveIdx);
  g.setServingSide(0);
  g.ball.inHands = false;
  g.ball.frozen = false;
  g.ball.serveAimLock = false;
  g.ball.lastTouchSide = 0;
  g.ball.x = g.consts.NET_X - 40;
  g.ball.y = 80;
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "frappe en vol ≠ succès");
  // Mur du fond en l'air ≠ atterrissage (ancien bug : balle « flottante »)
  g.ball.x = g.consts.W - 10;
  g.ball.y = g.consts.GROUND_Y - 120;
  g.ball.vx = 3; g.ball.vy = 2;
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "mur en l'air ≠ succès");
  g.ball.x = g.consts.NET_X + 40;
  g.ball.y = g.consts.GROUND_Y;
  g.ball.vx = 0; g.ball.vy = 0;
  assert.ok(g.tutorialStepConditionMet(g.blobL), "atterrissage adverse = succès");
});

test("tutoriel : adversaire AFK ne touche pas la balle en pratique", () => {
  const g = loadGame();
  g.startTutorial();
  assert.ok(g.tutorialPracticeActive(), "pratique");
  assert.ok(g.tutorialSkipBlobBall(g.blobR), "skip camp droit");
  assert.ok(!g.tutorialSkipBlobBall(g.blobL), "joueur peut toucher");
});

test("tutoriel : étape Score & barres explique les 3 éléments HUD", () => {
  const g = loadGame();
  g.startTutorial();
  const hud = g.TUTORIAL_STEPS.find(s => s.kind === "hud");
  assert.ok(hud, "étape hud présente");
  assert.ok(/touches/i.test(hud.body), "explique les touches");
  assert.ok(/orange/i.test(hud.body), "explique Super Smash orange");
  assert.ok(/or|SUPER/i.test(hud.body), "explique SUPER or");
  assert.ok(!/\[\[X:SELECT\]\]|\[\[K:Entrée\]\]/.test(hud.body), "pas de SELECT dupliqué dans le body");
  const hudIdx = g.TUTORIAL_STEPS.findIndex(s => s.kind === "hud");
  g.setTutorialStep(hudIdx);
  assert.ok(!g.tutorialStepConditionMet(g.blobL), "HUD ne s'auto-valide pas");
  const sup = g.TUTORIAL_STEPS.find(s => s.kind === "super");
  const pow = g.TUTORIAL_STEPS.find(s => s.kind === "power");
  assert.ok(/or/i.test(sup.title), "titre SUPER = barre or");
  assert.ok(/orange/i.test(pow.title), "titre Super Smash = orange");
});

test("pictos commandes : markup K / X / stick parsé", () => {
  const g = loadGame();
  assert.ok(g.parseControlMarkup);
  const parts = g.parseControlMarkup("Appuie [[K:E]] ou [[X:B]] · [[X:LS]] [[X:DPAD]]");
  assert.ok(parts.some(p => p.key === "E"));
  assert.ok(parts.some(p => p.xbox === "B"));
  assert.ok(parts.some(p => p.xbox === "LS"), "stick LS");
  assert.ok(parts.some(p => p.xbox === "DPAD"), "croix DPAD");
});

test("pause : inputs gelés tant que le menu est ouvert", () => {
  const g = loadGame();
  g.setMode("1v1");
  g.setVsAI(true);
  g.newGame(8);
  g.keys.KeyA = true;
  assert.ok(g.localInputs(0).left, "gauche actif hors pause");
  g.setPaused(true);
  assert.ok(!g.localInputs(0).left, "gauche ignoré en pause");
  g.keys.KeyA = false;
  g.setPaused(false);
});

console.log("\n" + pass + " réussis, " + fail + " échoués");
process.exit(fail ? 1 : 0);
