// File d'attente matchmaking — logique pure (testable sans WS).
"use strict";

const MODES = ["classic", "bomb", "flame"];
const TICKET_MS = 30000;

function createQueue(opts) {
  const ticketMs = (opts && opts.ticketMs) || TICKET_MS;
  const nowFn = (opts && opts.now) || (() => Date.now());
  /** @type {Record<string, Array<{id:string, send:Function, status:string, code?:string, t0:number}>>} */
  const queues = Object.create(null);
  for (const m of MODES) queues[m] = [];

  let seq = 0;
  function uid() { return "c" + (++seq); }

  function normalizeMode(mode) {
    const m = String(mode || "classic").toLowerCase();
    return MODES.includes(m) ? m : "classic";
  }

  function findClient(client) {
    for (const mode of MODES) {
      const i = queues[mode].indexOf(client);
      if (i >= 0) return { mode, i, list: queues[mode] };
    }
    return null;
  }

  function removeClient(client) {
    const hit = findClient(client);
    if (!hit) return null;
    hit.list.splice(hit.i, 1);
    return hit.mode;
  }

  function maybePromote(mode) {
    const q = queues[mode];
    if (q.some(c => c.status === "hosting" || c.status === "ready")) return;
    const next = q.find(c => c.status === "queued");
    if (!next) return;
    next.status = "hosting";
    next.t0 = nowFn();
    next.send({ t: "host" });
  }

  function pair(mode, host, guest) {
    removeClient(host);
    removeClient(guest);
    guest.send({ t: "join", code: host.code });
    host.send({ t: "matched" });
    maybePromote(mode);
  }

  /** @returns {{ client: object|null, mode: string }} */
  function onHello(send, mode) {
    mode = normalizeMode(mode);
    const q = queues[mode];
    const readyHost = q.find(c => c.status === "ready" && c.code);
    if (readyHost) {
      removeClient(readyHost);
      send({ t: "waiting" });
      send({ t: "join", code: readyHost.code });
      readyHost.send({ t: "matched" });
      maybePromote(mode);
      return { client: null, mode };
    }
    const client = { id: uid(), send, status: "queued", t0: nowFn() };
    q.push(client);
    send({ t: "waiting" });
    maybePromote(mode);
    return { client, mode };
  }

  function onReady(client, code) {
    if (!client || client.status !== "hosting") return false;
    const c = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (c.length < 4) return false;
    client.code = c;
    client.status = "ready";
    client.t0 = nowFn();
    const hit = findClient(client);
    if (!hit) return false;
    const guest = hit.list.find(x => x !== client && x.status === "queued");
    if (guest) pair(hit.mode, client, guest);
    return true;
  }

  function onCancel(client) {
    if (!client) return;
    const mode = removeClient(client);
    if (mode) maybePromote(mode);
  }

  function sweep() {
    const t = nowFn();
    for (const mode of MODES) {
      const q = queues[mode];
      for (let i = q.length - 1; i >= 0; i--) {
        const c = q[i];
        if (t - c.t0 > ticketMs) {
          try { c.send({ t: "timeout" }); } catch (e) { /* ignore */ }
          q.splice(i, 1);
        }
      }
      maybePromote(mode);
    }
  }

  function snapshot() {
    const out = {};
    for (const m of MODES) {
      out[m] = queues[m].map(c => ({ id: c.id, status: c.status, code: c.code || null }));
    }
    return out;
  }

  return { MODES, onHello, onReady, onCancel, sweep, snapshot, findClient, normalizeMode };
}

module.exports = { createQueue, MODES, TICKET_MS };
