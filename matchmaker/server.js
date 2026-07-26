// sommet-volley · matchmaker WebSocket (Partie rapide)
"use strict";

const http = require("http");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");
const { createQueue } = require("./queue");

const PORT = Number(process.env.PORT || 8787);
// 127.0.0.1 par défaut : le service tourne DERRIÈRE le reverse-proxy nginx
// (route /mm). En déploiement direct sans proxy, poser HOST=0.0.0.0.
const HOST = process.env.HOST || "127.0.0.1";

// TURN (coturn en `use-auth-secret`) : le client demande des credentials
// éphémères ici plutôt que d'embarquer un mot de passe en dur dans le JS
// public. username = timestamp d'expiration, credential = HMAC-SHA1(secret).
// Sans TURN_SECRET/TURN_URLS dans l'environnement (dev local), /turn répond
// 404 et le client reste en STUN seul.
const TURN_SECRET = process.env.TURN_SECRET || "";
const TURN_URLS = (process.env.TURN_URLS || "").split(",").map(s => s.trim()).filter(Boolean);
const TURN_TTL_S = 12 * 3600;

const queue = createQueue();

const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "sommet-mm", queues: queue.snapshot() }));
    return;
  }
  if (req.url === "/turn") {
    if (!TURN_SECRET || !TURN_URLS.length) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end("{}");
      return;
    }
    const username = String(Math.floor(Date.now() / 1000) + TURN_TTL_S);
    const credential = crypto.createHmac("sha1", TURN_SECRET).update(username).digest("base64");
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      // le jeu est servi depuis la même origine ; le * ne sert qu'aux tests
      // locaux et n'expose rien de durable (credentials à durée de vie limitée)
      "Access-Control-Allow-Origin": "*",
    });
    res.end(JSON.stringify({ urls: TURN_URLS, username, credential, ttl: TURN_TTL_S }));
    return;
  }
  res.writeHead(404);
  res.end("not found");
});

const wss = new WebSocketServer({ server, path: "/mm" });

function send(ws, msg) {
  if (ws.readyState === 1) {
    try { ws.send(JSON.stringify(msg)); } catch (e) { /* ignore */ }
  }
}

wss.on("connection", (ws) => {
  let client = null;

  ws.on("message", (raw) => {
    let m;
    try { m = JSON.parse(String(raw)); } catch (e) { return; }
    if (!m || typeof m !== "object") return;

    if (m.t === "ping") {
      send(ws, { t: "pong" });
      return;
    }
    if (m.t === "hello") {
      if (client) queue.onCancel(client);
      const r = queue.onHello((msg) => send(ws, msg), m.mode);
      client = r.client;
      // Si guest immédiat, client reste null (déjà pairé)
      return;
    }
    if (m.t === "ready") {
      if (!client) return;
      queue.onReady(client, m.code);
      // Après pair, client retiré de la file
      if (!queue.findClient(client)) client = null;
      return;
    }
    if (m.t === "cancel") {
      queue.onCancel(client);
      client = null;
    }
  });

  ws.on("close", () => {
    queue.onCancel(client);
    client = null;
  });
});

setInterval(() => queue.sweep(), 5000);

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log("sommet-mm listening ws://" + HOST + ":" + PORT + "/mm");
  });
}

module.exports = { server, queue, PORT, HOST };
