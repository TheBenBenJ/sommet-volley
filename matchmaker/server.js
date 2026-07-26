// sommet-volley · matchmaker WebSocket (Partie rapide)
"use strict";

const http = require("http");
const { WebSocketServer } = require("ws");
const { createQueue } = require("./queue");

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";

const queue = createQueue();

const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "sommet-mm", queues: queue.snapshot() }));
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
