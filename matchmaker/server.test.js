"use strict";
const assert = require("assert");
const { createQueue } = require("./queue");

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log("  ✓ " + name); }
  catch (e) { fail++; console.log("  ✗ " + name + "\n      " + e.message); }
}

test("2 clients hello → host/join + code", () => {
  const msgs = { a: [], b: [] };
  const q = createQueue();
  const a = q.onHello((m) => msgs.a.push(m), "classic");
  assert.ok(a.client, "A enfilé");
  assert.ok(msgs.a.some(m => m.t === "waiting"));
  assert.ok(msgs.a.some(m => m.t === "host"), "A devient host");

  assert.ok(q.onReady(a.client, "ABC12"));
  assert.strictEqual(a.client.status, "ready");

  q.onHello((m) => msgs.b.push(m), "classic");
  assert.ok(msgs.b.some(m => m.t === "join" && m.code === "ABC12"), "B reçoit le code");
  assert.ok(msgs.a.some(m => m.t === "matched"), "A matched");
  assert.deepStrictEqual(q.snapshot().classic, []);
});

test("guest immédiat si host déjà ready", () => {
  const msgs = { a: [], b: [] };
  const q = createQueue();
  const a = q.onHello((m) => msgs.a.push(m), "bomb");
  q.onReady(a.client, "XYZ99");
  q.onHello((m) => msgs.b.push(m), "bomb");
  assert.ok(msgs.b.some(m => m.t === "join" && m.code === "XYZ99"));
  assert.ok(msgs.a.some(m => m.t === "matched"));
});

test("modes isolés", () => {
  const q = createQueue();
  const a = q.onHello(() => {}, "classic");
  q.onReady(a.client, "AAAAA");
  const b = q.onHello(() => {}, "flame");
  assert.ok(b.client, "flame a sa propre file");
  assert.strictEqual(q.snapshot().classic.length, 1);
  assert.strictEqual(q.snapshot().flame.length, 1);
});

test("cancel libère le slot host", () => {
  const msgs = { a: [], b: [] };
  const q = createQueue();
  const a = q.onHello((m) => msgs.a.push(m), "classic");
  q.onCancel(a.client);
  const b = q.onHello((m) => msgs.b.push(m), "classic");
  assert.ok(msgs.b.some(m => m.t === "host"), "B promu host après cancel");
  assert.ok(b.client);
});

test("timeout ticket", () => {
  let t = 1000;
  const msgs = [];
  const q = createQueue({ ticketMs: 100, now: () => t });
  q.onHello((m) => msgs.push(m), "classic");
  // promu "hosting" : il attend légitimement un invité → survit au ticket
  // court (avant, il était éjecté à 30 s pile alors qu'un invité pouvait
  // arriver la seconde d'après)
  t = 1200;
  q.sweep();
  assert.ok(!msgs.some(m => m.t === "timeout"), "hôte pas expiré à 2x ticket");
  assert.strictEqual(q.snapshot().classic.length, 1);
  // mais expire sur le ticket long (connexion morte / oubliée)
  t = 1401;
  q.sweep();
  assert.ok(msgs.some(m => m.t === "timeout"));
  assert.deepStrictEqual(q.snapshot().classic, []);
});

test("timeout ticket : un 2e client queued expire au ticket court", () => {
  let t = 1000;
  const hostMsgs = [], guestMsgs = [];
  const q = createQueue({ ticketMs: 100, now: () => t });
  q.onHello((m) => hostMsgs.push(m), "classic");        // promu hosting
  // 2e arrivant : reste "queued" (l'hôte n'a pas encore publié son code)
  q.onHello((m) => guestMsgs.push(m), "classic");
  t = 1150;
  q.sweep();
  assert.ok(guestMsgs.some(m => m.t === "timeout"), "queued expiré à 1x ticket");
  assert.ok(!hostMsgs.some(m => m.t === "timeout"), "hosting encore vivant");
});

console.log("\n" + pass + " réussis, " + fail + " échoués (matchmaker)");
process.exit(fail ? 1 : 0);
