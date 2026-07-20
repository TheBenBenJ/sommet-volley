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

test("roster : Tsar Vladou est le perso pilote (index 0)", () => {
  const g = loadGame();
  assert.ok(g.CHARACTERS && g.CHARACTERS.length >= 3);
  assert.strictEqual(g.CHARACTERS[0].key, "vladou");
  assert.strictEqual(g.CHARACTERS[0].name, "Tsar Vladou");
  assert.strictEqual(g.CHARACTERS[1].key, "trompette");
  assert.strictEqual(g.CHARACTERS[2].key, "micron");
  assert.ok(g.CHARACTERS[0].coldProof);
  assert.ok(g.CHARACTERS[1].egoCharge);
  assert.ok(g.CHARACTERS[2].swapStats);
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

test("V2 : en l'air sans X, même balle sur la tête → pas d'auto (smash possible)", () => {
  const g = freshRally(91);
  const idle = { left:false, right:false, jump:false, smash:false, super:false, ax:0, ay:0 };
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y - 80; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  g.ball.x = 250; g.ball.y = g.blobL.y - 58; g.ball.vx = 0; g.ball.vy = 3;
  g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.stepGame(idle, idle);
  assert.strictEqual(g.ball.touches[0], 0, "en l'air : pas de cloche auto");
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
  assert.ok(g.ball.vx > 0, "cloche vers l'adversaire");
  assert.ok(g.ball.vy < 0, "impulsion vers le haut");
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
    // Gameplay V2 : se placer sous la balle (contact = cloche) ; S = smash parfois
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
  assert.ok(g.ball.vx > 0, "renvoi vers l'adversaire");
  assert.ok(g.ball.vy < 0, "cloche : composante vers le haut");
  assert.strictEqual(g.ball.touches[0], 1, "contact = 1 touche");
  assert.strictEqual(g.ball.slowMo, 0, "pas de ralenti");
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
  g.stepGame({ ...N0, jump:true }, N0); // saut seul ≠ lancer
  assert.ok(g.ball.inHands && g.ball.frozen, "saut sans X ne lance pas");
  g.stepGame({ ...N0, smash:true }, N0); // lancer = smash (X)
  assert.strictEqual(g.ball.frozen, false);
  assert.strictEqual(g.ball.inHands, false);
  assert.ok(Math.abs(g.ball.vx) < 0.5, "lancer vraiment vertical (vx≈0)");
  assert.ok(g.ball.vy < -8, "fortement vers le haut (vy=" + g.ball.vy + ")");
  assert.ok(g.ball.y < y0, "la balle a quitté les mains vers le haut");
});

test("V2 : service — sauter dans le lancer sans X ne frappe pas", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(56);
  g.setState("play"); g.setServeCountdown(0);
  g.setServingSide(0);
  g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y - 60; g.blobL.onGround = false;
  g.blobL.lastActiveHitTick = -999;
  // Retombée du lancer pile sur le serveur qui saute — sans smash
  g.ball.x = 250; g.ball.y = g.blobL.y - 58; g.ball.vx = 0; g.ball.vy = 3;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = true;
  g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  g.stepGame(N0, N0);
  assert.strictEqual(g.ball.touches[0], 0, "saut seul ≠ 1ʳᵉ frappe de service");
  assert.strictEqual(g.ball.serveAimLock, true, "lock toujours actif");
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
  assert.ok(g.ball.vx > 5, "service : part vers l'adversaire malgré stick haut (vx=" + g.ball.vx + ")");
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
  assert.ok(g.ball.vx > 2, "la cloche doit partir vers l'adversaire (vx=" + g.ball.vx + ")");
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

test("V2 : clavier — visée assistée vers l'adversaire (sans stick)", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(55);
  g.setState("play"); g.setServeCountdown(0);
  const setup = () => {
    g.blobL.x = 250; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
    g.blobL.lastActiveHitTick = -999;
    g.ball.x = 250; g.ball.y = g.blobL.y - 70; g.ball.vx = 0; g.ball.vy = 1;
    g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
    g.ball.serveAimLock = false;
    g.ball.lastTouchSide = -1; g.ball.lastTouchTick = -999;
  };
  // Neutre clavier : doit partir vers l'adversaire (pas un angle extrême)
  setup();
  g.stepGame({ ...N0, smash:true }, N0);
  assert.ok(g.ball.vx > 3, "clavier neutre → vers l'adversaire (vx=" + g.ball.vx + ")");
  assert.ok(g.ball.vy < -2, "clavier neutre → cloche (vy=" + g.ball.vy + ")");
  const vxMid = g.ball.vx;
  // ← = plus lobé (moins de vx), → = plus tendu
  setup();
  g.stepGame({ ...N0, smash:true, left:true }, N0);
  const vxLeft = g.ball.vx;
  setup();
  g.stepGame({ ...N0, smash:true, right:true }, N0);
  const vxRight = g.ball.vx;
  assert.ok(vxRight > vxLeft + 0.4, "← plus lobé que → (vx L=" + vxLeft + " R=" + vxRight + ")");
  assert.ok(vxMid > 2 && vxRight > 2, "les deux directions restent vers l'adversaire");
});

test("V2 : cloche depuis le fond passe au-dessus du filet", () => {
  const g = loadGame();
  g.setVsAI(true); g.setAiLevel(1);
  g.newGame(53);
  g.setState("play"); g.setServeCountdown(0);
  g.blobL.x = 120; g.blobL.y = g.consts.GROUND_Y; g.blobL.onGround = true;
  g.ball.x = 120; g.ball.y = g.blobL.y - 70; g.ball.vx = 0; g.ball.vy = 2;
  g.ball.frozen = false; g.ball.inHands = false; g.ball.tossGrace = 0;
  g.ball.serveAimLock = false;
  g.stepGame({ ...N0, smash:true }, N0);
  assert.ok(g.ball.vx > 5.5, "assez de portée horizontale");
  assert.ok(g.ball.vy < -6.5, "assez de cloche");
  let cleared = false;
  for (let i = 0; i < 120; i++) {
    g.updateBall();
    if (g.ball.x > g.consts.NET_X + 20 && g.ball.y < g.consts.NET_TOP) { cleared = true; break; }
    if (g.getState() === "point") break;
  }
  assert.ok(cleared, "la cloche depuis le fond doit passer le filet");
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

test("event canon : annonce puis tir déterministe (Place Grand-Rouge)", () => {
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

console.log("\n" + pass + " réussis, " + fail + " échoués");
process.exit(fail ? 1 : 0);
