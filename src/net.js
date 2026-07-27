// sommet-volley · mode en ligne — PeerJS, 1v1/2v2, HUD réseau
"use strict";

// ============================================================
//                     MODE EN LIGNE (WebRTC)
// ============================================================
// Architecture hybride (voir MULTIJOUEUR.md) — 1v1 :
//  - SOFT OWNERSHIP : l'invité simule la balle UNIQUEMENT quand elle est
//    clairement dans son camp (x > NET_X + GUEST_BALL_MARGIN). Zone filet,
//    camp hôte, scoring, service/point → toujours l'hôte. Pas de handoff
//    bilatéral (évite les deadlocks poteau de l'ancien ownership 0↔1).
//  - BALLE HORS CAMP : dead-reckoning live (âge + RTT/2), pas lerp retardé ;
//    corps adverses restent en interpolation adaptative.
//  - CORPS : chacun prédit son perso ; snaps pour le monde distant.
//  - 2v2 : hôte pleinement autoritaire.
// La signalisation passe par le cloud PeerJS ; ensuite WebRTC en direct.

const SNAP_EVERY = 2;          // cadence de base (~30 Hz)
const SNAP_NEAR_NET = 1;       // près du filet : 60 Hz (passage de balle fluide)
const NET_SNAP_ZONE = 160;     // px autour de NET_X → snaps accélérés
const INTERP_DELAY = 3;        // délai d'interpolation de base (~50 ms), adaptatif
const INTERP_MIN = 2;          // plancher du délai (bonne connexion)
const INTERP_MAX = 7;          // plafond du délai (connexion instable)
const EXTRAP_MAX = 8;          // ticks d'extrapolation max quand un snapshot tarde
const NET_TIMEOUT = 2500;      // ms de silence → pause "connexion instable"
const RECONCILE_SNAP = 60;     // px d'écart corps → téléport
const BALL_SOFT_CORRECT = 36;  // px — blend doux balle distante ; au-delà = snap
const BALL_STALE_MS = 200;     // sans paquet balle invité → l'hôte reprend
const GUEST_BALL_HOLD = 8;     // ticks de renvoi balle après sortie de zone
const GUEST_COAST_TICKS = 18;  // après sortie : dead-reckoning local avant snaps
const CODE_LEN = 5;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I/O/0/1
const PEER_PREFIX = "vda26-";  // espace de noms sur le cloud PeerJS

// serveurs ICE : STUN (par défaut) + TURN de secours. Sans TURN, deux joueurs
// derrière un NAT strict/pare-feu d'entreprise (fréquent en 4G ou au bureau)
// ne peuvent tout simplement jamais établir de connexion directe — la partie
// restait bloquée sur "Recherche…" (voir CONNECT_TIMEOUT) sans que rien ne
// puisse la débloquer. Le TURN relaie le trafic quand le direct échoue.
// Un coturn tourne sur le même serveur que le matchmaker : le client récupère
// des credentials ÉPHÉMÈRES via GET /mm/turn (voir matchmaker/server.js) — pas
// de mot de passe en dur dans ce fichier public. Si l'appel échoue (dev local
// sans matchmaker, endpoint absent…), on reste en STUN seul comme avant.
const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ]
};

function turnCredsUrl() {
  try {
    const loc = typeof location !== "undefined" ? location : null;
    if (!loc || !loc.host || loc.protocol === "file:") return "http://127.0.0.1:8787/turn";
    return loc.protocol + "//" + loc.host + "/mm/turn";
  } catch (e) {
    return "http://127.0.0.1:8787/turn";
  }
}

/** Journal multi visible (console + overlay écrans net). */
const NET_LOG_MAX = 14;
const netLogLines = [];
function netLog(msg, extra) {
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()) | 0;
  let line = String(msg);
  if (extra != null) {
    try {
      line += " | " + (typeof extra === "string" ? extra : JSON.stringify(extra));
    } catch (e) {
      line += " | [extra]";
    }
  }
  const stamped = ((t / 1000) % 1000).toFixed(1) + "s  " + line;
  netLogLines.push(stamped);
  while (netLogLines.length > NET_LOG_MAX) netLogLines.shift();
  try {
    if (typeof console !== "undefined" && console.log) console.log("[SV-NET]", line, extra != null ? extra : "");
  } catch (e) { /* ignore */ }
}
function netLogClear() { netLogLines.length = 0; }
function drawNetLogPanel(x, y, maxW) {
  if (!netLogLines.length) return;
  ctx.save();
  ctx.textAlign = "left";
  ctx.font = "11px " + (typeof UI !== "undefined" && UI.mono ? UI.mono : "monospace");
  let yy = y;
  for (let i = 0; i < netLogLines.length; i++) {
    const raw = netLogLines[i];
    ctx.fillStyle = i === netLogLines.length - 1 ? "#9fef9f" : "rgba(255,255,255,0.55)";
    let s = raw;
    while (s.length > 2 && ctx.measureText(s).width > maxW) s = s.slice(0, -2);
    if (s !== raw) s += "…";
    ctx.fillText(s, x, yy);
    yy += 13;
  }
  ctx.restore();
}

// Rafraîchit les serveurs ICE avec des credentials TURN frais (ttl 12 h côté
// serveur). Retourne une Promise : on attend le TURN avant new Peer (sinon la
// 1ʳᵉ tentative reste en STUN seul → timeout fréquent en NAT strict / 4G).
let turnFetchedAt = 0;
let turnFetchPromise = null;

/** Sonde rapide : le navigateur arrive-t-il à obtenir un candidat relay ? */
function probeTurnRelay() {
  try {
    if (typeof RTCPeerConnection === "undefined") return;
    const pc = new RTCPeerConnection({
      iceServers: ICE_CONFIG.iceServers,
      iceCandidatePoolSize: 0
    });
    let relay = 0;
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    const finish = (tag) => {
      netLog("TURN probe " + tag, { relay, ms: ((typeof performance !== "undefined" ? performance.now() : Date.now()) - t0) | 0 });
      try { pc.close(); } catch (e) { /* ignore */ }
    };
    pc.addEventListener("icecandidate", ev => {
      const c = ev.candidate && ev.candidate.candidate;
      if (c && /\styp relay\b/.test(c)) relay++;
      if (!ev.candidate) finish(relay ? "OK" : "NO-RELAY");
    });
    pc.createDataChannel("sv-probe");
    pc.createOffer().then(o => pc.setLocalDescription(o)).catch(() => finish("err"));
    setTimeout(() => {
      if (pc.signalingState !== "closed") finish(relay ? "partial-OK" : "partial-NO-RELAY");
    }, 4500);
  } catch (e) {
    netLog("TURN probe skip", String(e && e.message || e));
  }
}

function refreshTurnCredentials() {
  if (typeof fetch !== "function") return Promise.resolve(false);
  const now = Date.now();
  if (now - turnFetchedAt < 60 * 60 * 1000 && ICE_CONFIG.iceServers.length > 1) {
    return Promise.resolve(true);
  }
  if (turnFetchPromise) return turnFetchPromise;
  const url = turnCredsUrl();
  netLog("TURN fetch…", url);
  turnFetchPromise = fetch(url, { cache: "no-store" })
    .then(r => {
      netLog("TURN HTTP " + (r && r.status));
      return (r && r.ok ? r.json() : null);
    })
    .then(j => {
      turnFetchedAt = Date.now();
      turnFetchPromise = null;
      if (!j || !Array.isArray(j.urls) || !j.urls.length || !j.username || !j.credential) {
        netLog("TURN absent → STUN seul");
        return false;
      }
      // Un iceServer par URL (meilleure compat WebRTC que urls:[...]).
      // Chrome EXIGE username+credential dès que le schéma est turn/turns
      // (sinon RTCPeerConnection refuse de se construire).
      // On pousse : 1) credentials API ; 2) credentials factices (coturn
      // actuellement ouvert / secret désaligné — les vrais HMAC cassent
      // l'Allocate côté Chrome) ; 3) TURN PeerJS en secours.
      const stun = { urls: "stun:stun.l.google.com:19302" };
      const user = String(j.username);
      const cred = String(j.credential);
      const turns = [];
      const seen = Object.create(null);
      const pushUrl = (u) => {
        const s = String(u);
        if (!s) return;
        // Factices EN PREMIER : si le secret matchmaker ≠ coturn, Chrome
        // n'obtient aucun relay avec les HMAC API seuls.
        if (!seen["open:" + s]) {
          seen["open:" + s] = 1;
          turns.push({ urls: s, username: "sommet", credential: "sommet" });
        }
        if (!seen["auth:" + s]) {
          seen["auth:" + s] = 1;
          turns.push({ urls: s, username: user, credential: cred });
        }
      };
      j.urls.forEach(pushUrl);
      try {
        const host = (typeof location !== "undefined" && location.hostname) || "";
        if (host && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
          pushUrl("turn:" + host + ":3478?transport=udp");
          pushUrl("turn:" + host + ":3478?transport=tcp");
        }
      } catch (e) { /* ignore */ }
      turns.push({
        urls: ["turn:eu-0.turn.peerjs.com:3478", "turn:us-0.turn.peerjs.com:3478"],
        username: "peerjs",
        credential: "peerjsp"
      });
      ICE_CONFIG.iceServers = [stun].concat(turns);
      ICE_CONFIG.iceCandidatePoolSize = 2;
      netLog("TURN OK", { n: turns.length, urls: j.urls, openFallback: "dummy-creds" });
      probeTurnRelay();
      return true;
    })
    .catch(err => {
      turnFetchPromise = null;
      netLog("TURN fail → STUN", String(err && err.message || err));
      return false; /* STUN seul */
    });
  return turnFetchPromise;
}
// premier fetch dès le chargement (le lobby online arrive bien après)
if (typeof window !== "undefined") refreshTurnCredentials();

/** Attente courte du TURN avant new Peer (max ~2,5 s). */
function withIceReady(fn) {
  netLog("ICE wait (TURN≤2.5s, servers=" + ICE_CONFIG.iceServers.length + ")");
  const p = refreshTurnCredentials();
  const timeout = new Promise(resolve => setTimeout(resolve, 2500));
  Promise.race([p, timeout]).then(() => {
    netLog("ICE go", { stunTurn: ICE_CONFIG.iceServers.length, hasTurn: ICE_CONFIG.iceServers.length > 1 });
    try { fn(); } catch (e) { netLog("ICE fn error", String(e && e.message || e)); }
  });
}

/** Détruit un Peer éventuel avant d'en créer un nouveau (évite les fantômes). */
function destroyPeerQuiet() {
  const p = peer;
  peer = null;
  peerReady = false;
  connRel = null;
  connFast = null;
  if (p) {
    try { p.destroy(); } catch (e) { /* ignore */ }
  }
}

let online = false;            // mode en ligne actif (dès le lobby)
let netRole = null;            // "host" | "guest"
let netConnected = false;      // canal fiable WebRTC ouvert (fast optionnel)
let peer = null;               // objet Peer (PeerJS)
let connRel = null;            // canal fiable : hello/start/rematch/bye
let connFast = null;           // canal non fiable : inputs/snapshots/ping
let peerReady = false;         // l'hôte est enregistré (code utilisable)
let netCode = "";              // code de la partie (hôte)
let joinCode = "";             // saisie du code (invité)
let netErrorMsg = "";
let netErrorDetail = "";       // diagnostic technique (état ICE/canaux) affiché en petit sous l'erreur

let matchId = 0;               // n° de manche : ignore les paquets périmés
// ms max pour établir les 2 canaux avant d'abandonner. 20s (pas moins) : une
// négociation ICE qui doit basculer sur le relais TURN (direct/STUN en échec)
// peut légitimement prendre 15-20s avant d'aboutir ou d'échouer pour de bon —
// un ancien essai à 12s a coupé une connexion encore "checking", donc pas
// forcément vouée à l'échec.
const CONNECT_TIMEOUT = 20000;
let connectTimer = null;       // garde-fou : évite de rester bloqué sur "Recherche…"

// --- côté hôte ---
let guestIn = { left: false, right: false, jump: false }; // dernière entrée reçue (1v1)
let guestInSeq = 0;            // n° de séquence de cette entrée (= ack renvoyé)
let netFrame = 0;              // cadence d'envoi des snapshots
let lastPeerMsg = 0;           // horodatage du dernier message reçu
let netFrozen = false;         // simulation gelée (invité silencieux)
let guestBall = null;          // dernier état balle reçu de l'invité
let lastGuestBallAt = 0;       // horodatage de ce paquet
let guestBallGen = 0;          // incrémenté à chaque nouveau paquet own:1
let appliedGuestBallGen = -1;  // dernier paquet déjà posé (anti-freeze RTT)
let lastGuestPtSeq = 0;        // dernier point différé consommé (idempotence)
let guestBallHold = 0;         // invité : renvoi balle après sortie de zone
let guestBallAuthority = false; // possession explicite (PAS dérivée de ball.x affiché)
let guestBallSmoothX = 0, guestBallSmoothY = 0; // lissage visuel handoff filet
// Côte visuelle après sortie de zone : on continue la physique locale un
// instant au lieu de sauter sur l'interp retardée (= gros freeze au filet).
let guestCoast = null;         // {x,y,vx,vy,angle} | null
let guestCoastLeft = 0;
// Hôte : lissage visuel quand un paquet own:1 « saute » ou reprise d'autorité
let hostBallSmoothX = 0, hostBallSmoothY = 0;
let hostWasUsingGuestBall = false;

// --- 2v2 en ligne ---
// L'hôte accepte jusqu'à 3 invités. Chaque joueur occupe un « slot » = son
// index dans activeBlobs : 0 = hôte (Rouge), 1 = coéquipier (Orange),
// 2 = adversaire (Vert), 3 = adversaire (Bleu). Les slots libres sont pilotés
// par l'IA de l'hôte. L'ordre d'attribution équilibre les équipes au fur et à
// mesure des arrivées : 1er invité → adversaire, 2e → coéquipier, 3e → dernier.
const SLOT_ORDER = [2, 1, 3];
let mySlot = 1;                // slot du joueur local (hôte = 0 ; invité 1v1 = 1)
let guests = [];               // hôte 2v2 : {id, rel, fast, slot, charId, …}
let lobbyStarted = false;      // hôte 2v2 : la partie a été lancée

// --- côté invité ---
const snapBuf = [];            // instantanés reçus, triés par tick
let renderTick = 0;            // tête de lecture (float) pour l'interpolation
let inputSeq = 0;
const inputHistory = [];       // entrées locales pas encore acquittées
let guestSmoothX = 0, guestSmoothY = 0; // lissage visuel post-réconciliation
let prevSnap = null;           // pour détecter les événements (sons, popups)
let lastSnapTime = 0;
// délai d'interpolation adaptatif : mesuré sur l'espacement réel des snapshots
let interpDelay = INTERP_DELAY; // en ticks, ajusté selon la gigue réseau
let lastSnapArrival = 0;        // horodatage du snapshot précédent
let snapGapEMA = 0, snapJitterEMA = 0; // moyennes lissées (ms)

// --- commun ---
let pingMs = -1;
let pingTimer = null;
let rematchMe = false, rematchPeer = false;

function makeCode() {
  let c = "";
  for (let i = 0; i < CODE_LEN; i++) {
    c += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return c;
}

function sendRel(m)  { if (connRel  && connRel.open)  connRel.send(m); }
function sendFast(m) {
  // Prefer le canal non fiable ; sinon tout passe sur rel (fast optionnel).
  const c = (connFast && connFast.open) ? connFast : (connRel && connRel.open ? connRel : null);
  if (c) try { c.send(m); } catch (e) { /* ignore */ }
}

function onlineLocalInput() {
  // Menu pause local : on ne pilote plus le blob (la simu réseau continue).
  if (paused) {
    return {
      left: false, right: false, jump: false, kbdJump: false,
      smash: false, super: false, up: false, down: false, ax: 0, ay: 0
    };
  }
  // en ligne, chacun est seul devant son écran : tous les mappings clavier
  // marchent, et n'importe quelle manette branchée pilote le joueur local
  let pl = false, pr = false, pj = false, psm = false, ps = false, pu = false, pd = false;
  let pax = 0, pay = 0;
  for (const p of padsNow) {
    pl = pl || p.left; pr = pr || p.right; pj = pj || p.jump;
    psm = psm || p.smash;
    // readPad expose `superT` (B / gâchettes) — pas `super`
    ps = ps || p.superT; pu = pu || p.up; pd = pd || p.down;
    if (Math.hypot(p.ax || 0, p.ay || 0) > Math.hypot(pax, pay)) {
      pax = p.ax || 0; pay = p.ay || 0;
    }
  }
  const raw = {
    left:  keyHeldOnline("left") || pl,
    right: keyHeldOnline("right") || pr,
    jump:  keyHeldOnline("jump") || pj,
    kbdJump: keyHeldOnline("jump"), // service clavier « un appui » aussi en ligne
    smash: keyHeldOnline("smash") || psm,
    super: keyHeldOnline("super") || ps,
    up:    pu,
    down:  pd,
    ax:    pax,
    ay:    pay
  };
  return xInput(mySlot, activeBlobs[mySlot], raw);
}

// ---------- Connexion ----------
function initHostPeer() {
  netLogClear();
  online = true; netRole = "host";
  netConnected = false; peerReady = false;
  netCode = makeCode(); // immédiat pour l'UI / matchmaker ready
  netLog("HOST init", { code: netCode, id: PEER_PREFIX + netCode, Peer: typeof Peer });
  if (typeof Peer === "undefined") {
    netFail("PeerJS n'a pas pu être chargé — le mode en ligne nécessite Internet.", "code: no-Peer");
    return;
  }
  withIceReady(() => {
    // Ne pas destroyPeerQuiet ici : ça nullifierait peer en cours ; on remplace.
    const old = peer;
    peer = null;
    peerReady = false;
    connRel = null;
    connFast = null;
    if (old) { try { old.destroy(); } catch (e) { /* ignore */ } }
    online = true; netRole = "host";
    netConnected = false;
    peer = new Peer(PEER_PREFIX + netCode, { config: ICE_CONFIG, debug: 2 });
    peer.on("open", id => {
      peerReady = true;
      netLog("HOST peer open", id);
    });
    peer.on("connection", c => {
      netLog("HOST incoming", { label: c && c.label, from: c && c.peer });
      hostAcceptConn1v1(c);
    });
    peer.on("error", onPeerError);
    peer.on("disconnected", () => {
      netLog("HOST signaling disconnected → reconnect");
      if (peer && !peer.destroyed) peer.reconnect();
    });
  });
}

/** Accepte rel/fast ; pendant la négociation, remplace un canal périmé (retry ICE). */
function hostAcceptConn1v1(c) {
  if (c.label !== "rel" && c.label !== "fast") {
    netLog("HOST reject label", c && c.label);
    setTimeout(() => { try { c.close(); } catch (e) {} }, 500);
    return;
  }
  if (!netConnected) {
    const prev = c.label === "rel" ? connRel : connFast;
    // Nouvel invité (autre peer id) alors que d'anciens canaux traînent → purge
    if (prev && prev.peer && prev.peer !== c.peer) {
      netLog("HOST purge old peer", { old: prev.peer, neu: c.peer });
      try { if (connRel) connRel.close(); } catch (e) {}
      try { if (connFast) connFast.close(); } catch (e) {}
      connRel = null;
      connFast = null;
    } else if (prev && prev !== c) {
      netLog("HOST replace channel", c.label);
      try { prev.close(); } catch (e) {}
      if (c.label === "rel") connRel = null; else connFast = null;
    }
  } else if ((connRel && connRel.peer !== c.peer) || (connFast && connFast.peer !== c.peer)) {
    netLog("HOST reject (already connected)");
    setTimeout(() => { try { c.close(); } catch (e) {} }, 500);
    return;
  }
  hookConn(c);
}

function initGuestPeer(code) {
  const clean = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  netLogClear();
  online = true; netRole = "guest";
  netConnected = false;
  netLog("GUEST init", { code: clean, target: PEER_PREFIX + clean, Peer: typeof Peer });
  if (typeof Peer === "undefined") {
    netFail("PeerJS n'a pas pu être chargé — le mode en ligne nécessite Internet.", "code: no-Peer");
    return;
  }
  withIceReady(() => {
    destroyPeerQuiet();
    online = true; netRole = "guest";
    netConnected = false;
    peer = new Peer({ config: ICE_CONFIG, debug: 2 });
    peer.on("open", id => {
      netLog("GUEST peer open", id);
      guestConnectChannels(PEER_PREFIX + clean);
    });
    peer.on("error", onPeerError);
    peer.on("disconnected", () => {
      netLog("GUEST signaling disconnected → reconnect");
      if (peer && !peer.destroyed) peer.reconnect();
    });
    clearTimeout(connectTimer);
    connectTimer = setTimeout(() => {
      if (!netConnected) {
        netLog("GUEST TIMEOUT 20s", netDiag());
        netFail("Connexion impossible — vérifie le code, ou la connexion réseau de ton ami.",
                "code: connect-timeout · " + netDiag() + " · logs: " + netLogLines.slice(-4).join(" · "));
      }
    }, CONNECT_TIMEOUT);
  });
}

/**
 * Ouvre d'abord le canal fiable. Le canal fast est optionnel (après coup) :
 * 2 négociations ICE en parallèle faisaient échouer les deux (checking→failed).
 */
function guestConnectChannels(target) {
  netLog("GUEST connect rel → " + target);
  const rel = peer.connect(target, { label: "rel", reliable: true, serialization: "json" });
  hookConn(rel);
  const tryFast = () => {
    if (!peer || peer.destroyed) return;
    if (connFast) return;
    netLog("GUEST connect fast (optionnel) → " + target);
    try {
      hookConn(peer.connect(target, { label: "fast", reliable: false, serialization: "json" }));
    } catch (e) {
      netLog("GUEST fast skip", String(e && e.message || e));
    }
  };
  if (rel) {
    // Fast seulement après que rel soit UP (évite double ICE)
    rel.on("open", () => setTimeout(tryFast, 400));
  }
}

function hookIceWatch(c) {
  try {
    const pc = c && c.peerConnection;
    if (!pc || pc._svIceHooked) return;
    pc._svIceHooked = true;
    const counts = { host: 0, srflx: 0, relay: 0, other: 0 };
    pc.addEventListener("icecandidate", ev => {
      const cand = ev.candidate && ev.candidate.candidate;
      if (!cand) {
        netLog("ICE " + (c.label || "?") + " gather done", counts);
        return;
      }
      let kind = "other";
      if (/\styp host\b/.test(cand)) kind = "host";
      else if (/\styp srflx\b/.test(cand)) kind = "srflx";
      else if (/\styp relay\b/.test(cand)) kind = "relay";
      counts[kind]++;
      if (kind === "relay" || counts[kind] <= 1) {
        netLog("ICE cand " + (c.label || "?") + " " + kind);
      }
    });
    try {
      const cfg = pc.getConfiguration && pc.getConfiguration();
      const nTurn = cfg && cfg.iceServers
        ? cfg.iceServers.filter(s => {
            const u = s && s.urls;
            const arr = Array.isArray(u) ? u : [u];
            return arr.some(x => String(x || "").indexOf("turn:") === 0);
          }).length
        : 0;
      netLog("PC cfg " + (c.label || "?"), { iceServers: cfg && cfg.iceServers && cfg.iceServers.length, turnEntries: nTurn });
    } catch (e) { /* ignore */ }
    pc.addEventListener("iceconnectionstatechange", () => {
      netLog("ICE " + (c.label || "?"), pc.iceConnectionState);
    });
    pc.addEventListener("connectionstatechange", () => {
      netLog("PC " + (c.label || "?"), pc.connectionState);
    });
  } catch (e) { /* ignore */ }
}

function hookConn(c) {
  if (!c) { netLog("hookConn null"); return; }
  if (c.label === "rel") connRel = c;
  else if (c.label === "fast") connFast = c;
  else { netLog("hookConn bad label", c.label); return; }
  netLog("hook " + c.label, { open: !!c.open, peer: c.peer });
  hookIceWatch(c);
  c.on("data", onNetData);
  c.on("open", () => {
    netLog("channel OPEN " + c.label);
    checkBothOpen();
  });
  c.on("close", () => {
    netLog("channel CLOSE " + c.label);
    onConnClosed(c);
  });
  // Pendant la négociation, une erreur de canal est fréquente (ICE/TURN) :
  // ne pas tuer la session ici — close + CONNECT_TIMEOUT suffisent.
  c.on("error", err => {
    netLog("channel ERR " + c.label, (err && (err.type || err.message)) || err);
  });
  if (c.open) checkBothOpen();
}

function checkBothOpen() {
  const relOk = !!(connRel && connRel.open);
  const fastOk = !!(connFast && connFast.open);
  netLog("checkBothOpen", {
    connected: netConnected, rel: relOk, fast: fastOk, role: netRole, state
  });
  if (netConnected) return;
  // Suffit que le canal fiable soit ouvert (fast est un bonus).
  if (!relOk) return;
  netConnected = true;
  clearTimeout(connectTimer); connectTimer = null;
  lastPeerMsg = lastSnapTime = performance.now();
  startPinging();
  netLog("CONNECTED ✓", { role: netRole, state, fast: fastOk });
  if (netRole === "guest") {
    if (!pendingMode) pendingMode = { online: true };
    pendingMode.online = true;
    if (mmQuickplay) pendingMode.quickplay = true;
    selPlayer = 1;
    peerTakenCharacters = [];
    state = "selectCharacter";
  } else if (netRole === "host") {
    if (mmQuickplay) {
      if (!pendingMode) pendingMode = { online: true, quickplay: true };
      pendingMode.online = true;
      pendingMode.quickplay = true;
      selPlayer = 0;
      state = "selectCharacter";
    } else {
      sendRel({ t: "taken", a: [blobL.charId] });
    }
  }
}

// diagnostic technique (état des 2 canaux + de la négociation ICE sous-jacente)
// affiché en petit sous le message d'erreur — utile pour nous remonter ce qui
// bloque exactement (signalisation PeerJS OK mais WebRTC direct qui échoue,
// TURN jamais atteint, etc.), à capturer AVANT teardownNet() (qui vide tout).
function netDiag() {
  const chan = c => !c ? "absent" : c.open ? "ouvert" : "en attente";
  const ice = c => c && c.peerConnection ? c.peerConnection.iceConnectionState : "-";
  return "rel:" + chan(connRel) + "/" + ice(connRel) + " · fast:" + chan(connFast) + "/" + ice(connFast);
}

function onPeerError(err) {
  const t = err && err.type;
  netLog("peer error", { type: t, message: err && err.message });
  if (netRole === "host" && t === "unavailable-id" &&
      (state === "hostWait" || state === "matchmaking")) {
    // collision de code (rarissime) : on en retire un autre
    netLog("HOST id collision → new code");
    const p = peer; peer = null;
    try { p.destroy(); } catch (e) {}
    mmHostReadySent = false;
    initHostPeer();
    if (mmQuickplay) mmWaitPeerReadyThenReady();
    return;
  }
  let msg = "Erreur réseau" + (t ? " (" + t + ")" : "") + ".";
  if (t === "peer-unavailable") msg = "Partie introuvable — vérifie le code !";
  if (t === "network" || t === "server-error" || t === "socket-error") {
    msg = "Impossible de joindre le serveur de mise en relation.";
  }
  netFail(msg, "code: " + (t || "inconnu") + " · " + netDiag());
}

function onConnClosed(c) {
  if (!online || state === "netError" || state === "menu") return;
  // Canal fast optionnel : sa fermeture ne coupe jamais la session.
  if (c && c.label === "fast") {
    netLog("fast closed (ok, rel only)", { connected: netConnected });
    if (connFast === c) connFast = null;
    return;
  }
  // Pendant la négociation : un canal qui drop ne doit PAS tuer le lobby hôte
  // (sinon 1ʳᵉ tentative ICE flaky → "Adversaire déconnecté" / invité en timeout).
  if (!netConnected) {
    netLog("close during nego (keep lobby)", c && c.label);
    if (c && c.label === "rel" && connRel === c) connRel = null;
    if (c && c.label === "fast" && connFast === c) connFast = null;
    if (!c) {
      if (connRel && !connRel.open) connRel = null;
      if (connFast && !connFast.open) connFast = null;
    }
    return;
  }
  netFail("Adversaire déconnecté.", "code: connection-closed · " + netDiag());
}

function netFail(msg, detail) {
  netLog("FAIL: " + msg, detail);
  teardownNet();
  netErrorMsg = msg;
  netErrorDetail = (detail || "") + (netLogLines.length
    ? "\n" + netLogLines.slice(-6).join(" · ")
    : "");
  state = "netError";
}

function teardownNet() {
  online = false; netRole = null; netConnected = false;
  peerReady = false; netFrozen = false;
  if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
  clearTimeout(connectTimer); connectTimer = null;
  const p = peer;
  peer = connRel = connFast = null;
  if (p) { try { p.destroy(); } catch (e) {} }
  snapBuf.length = 0; inputHistory.length = 0;
  prevSnap = null; pingMs = -1;
  guestSmoothX = guestSmoothY = 0;
  rematchMe = rematchPeer = false;
  guests = []; lobbyStarted = false; mySlot = 1;
  peerTakenCharacters = [];
  paused = false;
  netErrorDetail = "";
  mmCloseSocketOnly();
  mmQuickplay = false;
  mmStatus = "";
  mmHostReadySent = false;
  mmPendingGuestChar = null;
}

/** Persos déjà réservés côté hôte 2v2 (hôte + invités prêts). */
function hostTakenAnimals(exceptGuest) {
  const t = [blobL.charId];
  for (const g of guests) {
    if (exceptGuest && g === exceptGuest) continue;
    if (g.ready) t.push(g.charId);
  }
  return t;
}

function hostBroadcastTaken() {
  const a = hostTakenAnimals(null);
  for (const g of guests) {
    if (g.rel && g.rel.open) {
      try { g.rel.send({ t: "taken", a: hostTakenAnimals(g) }); } catch (e) {}
    }
  }
  return a;
}

function quitOnline() {
  if (netRole === "host" && guests.length) {
    for (const g of guests) { try { if (g.rel && g.rel.open) g.rel.send({ t: "bye" }); } catch (e) {} }
  } else {
    sendRel({ t: "bye" });
  }
  teardownNet();
  if (typeof goMenu === "function") goMenu();
  else state = "menu";
}

function startPinging() {
  if (pingTimer) clearInterval(pingTimer);
  pingTimer = setInterval(() => {
    if (netRole === "host" && mode === "2v2") {
      for (const g of guests) if (g.fast && g.fast.open) g.fast.send({ t: "ping", ts: performance.now() });
    } else {
      sendFast({ t: "ping", ts: performance.now() });
    }
  }, 500);
}

// ---------- Protocole ----------
function onNetData(m) {
  if (!m || typeof m !== "object") return;
  lastPeerMsg = performance.now();
  switch (m.t) {
    case "ping": sendFast({ t: "pong", ts: m.ts }); break;
    case "pong": {
      const rtt = performance.now() - m.ts;
      pingMs = pingMs < 0 ? rtt : pingMs * 0.7 + rtt * 0.3; // moyenne lissée
      break;
    }
    case "hello": { // hôte : l'invité a choisi son personnage → on lance !
      if (netRole !== "host") break;
      let a = clampCharacterIdx(m.charId);
      if (a === blobL.charId) a = randomCharacterIdx([blobL.charId]);
      // Partie rapide : l'hôte peut encore être en selectCharacter
      if (mmQuickplay && state === "selectCharacter") {
        mmPendingGuestChar = a;
        break;
      }
      blobR.charId = a;
      hostStartMatch();
      break;
    }
    case "taken": // invité : persos déjà réservés (pas de doublon)
      if (netRole !== "guest") break;
      peerTakenCharacters = Array.isArray(m.a) ? m.a.map(clampCharacterIdx) : [];
      break;
    case "start": { // invité : configuration reçue de l'hôte → départ
      if (netRole !== "guest") break;
      matchId = m.m;
      terrain = Math.max(0, Math.min(TERRAINS.length - 1, m.terrain | 0));
      ballSkin = Math.max(0, Math.min(BALL_SKINS.length - 1, m.ballSkin | 0));
      bombMode = !!m.bomb;                          // l'hôte décide de la règle Bombe…
      bombTime = m.bt || BOMB_TIME;                 // …et de la durée de mèche
      flameMode = !!m.flame && !bombMode;           // …ou Ballon enflammé
      mapEventsQuiet = !!m.quiet;                   // …et terrain calme (sans events)
      guestResetMatch();
      vsAI = false;
      const clampA = v => Math.max(0, Math.min(CHARACTERS.length - 1, v | 0));
      if (m.mode === "2v2") {
        setMode("2v2");
        mySlot = Math.max(0, Math.min(3, m.slot | 0));
        activeBlobs.forEach((b, s) => { b.charId = clampCharacterIdx((m.a && m.a[s]) || 0); });
      } else {
        setMode("1v1"); mySlot = 1;       // invité 1v1 = Vert (slot 1)
        blobL.charId = clampCharacterIdx(m.a[0]);
        blobR.charId = clampCharacterIdx(m.a[1]);
      }
      newGame(m.seed); // même graine → mêmes positions/service de départ
      break;
    }
    case "in": // hôte : entrées de l'invité (+ balle soft-own éventuelle)
      if (netRole !== "host" || m.m !== matchId) break;
      if (m.s > guestInSeq) {
        guestInSeq = m.s;
        guestIn = { left: !!m.l, right: !!m.r, jump: !!m.j, kbdJump: !!m.kj,
                    smash: !!(m.sh || m.rc),
                    super: !!m.sp, up: !!m.u, down: !!m.d,
                    ax: (m.ax || 0) / 100, ay: (m.ay || 0) / 100 };
        setX(blobR, !!m.x);
      }
      if (m.b) {
        if (m.b.own === 1) {
          guestBall = m.b;
          lastGuestBallAt = performance.now();
          guestBallGen++;
        } else {
          // own:0 = sortie immédiate — ne PAS garder le dernier own:1
          // (sinon l'hôte le réapplique pendant tout le RTT = freeze filet)
          if (m.b.pt) guestBall = m.b; // garder un pt éventuel
          else hostInvalidateGuestBall();
          if (m.b.pt) { guestBall.own = 0; lastGuestBallAt = 0; }
        }
      }
      break;
    case "snap": // invité : instantané de l'hôte
      if (netRole !== "guest" || m.m !== matchId) break;
      onSnapMsg(m);
      break;
    case "rematch":
      rematchPeer = true;
      if (netRole === "host" && rematchMe) hostStartMatch();
      break;
    case "bye":
      netFail("L'adversaire a quitté la partie.");
      break;
  }
}

function hostStartMatch() {
  matchId++;
  rematchMe = rematchPeer = false;
  guestInSeq = 0;
  guestIn = { left: false, right: false, jump: false };
  netFrame = 0;
  guestBall = null; lastGuestBallAt = 0; lastGuestPtSeq = 0;
  guestBallGen = 0; appliedGuestBallGen = -1;
  hostBallSmoothX = hostBallSmoothY = 0;
  hostWasUsingGuestBall = false;
  const seed = (Math.random() * 2 ** 31) | 0;
  sendRel({ t: "start", m: matchId, seed, terrain, ballSkin, a: [blobL.charId, blobR.charId],
            bomb: bombMode ? 1 : 0, bt: bombTime, flame: flameMode ? 1 : 0,
            quiet: mapEventsQuiet ? 1 : 0 });
  vsAI = false;
  setMode("1v1"); mySlot = 0; // hôte 1v1 = Rouge (slot 0)
  newGame(seed);
}

function guestResetMatch() {
  rematchMe = rematchPeer = false;
  snapBuf.length = 0;
  inputHistory.length = 0;
  inputSeq = 0;
  renderTick = 0;
  prevSnap = null;
  guestSmoothX = guestSmoothY = 0;
  lastSnapTime = performance.now();
  interpDelay = INTERP_DELAY;
  lastSnapArrival = 0; snapGapEMA = 0; snapJitterEMA = 0;
  pendingNetPoint = null;
  netPtSeq = 0;
  guestBallHold = 0;
  guestBallAuthority = false;
  guestBallSmoothX = guestBallSmoothY = 0;
  guestCoast = null; guestCoastLeft = 0;
  hostBallSmoothX = hostBallSmoothY = 0;
  hostWasUsingGuestBall = false;
  ballScoreLock = false;
}

// Possession soft-own : flag explicite. Ne JAMAIS dériver de ball.x affiché
// (l'interp retardée le remettait dans la zone → reprise en boucle = freeze).
function guestOwnsBall() {
  return guestBallAuthority;
}

function guestCanAcquireBall() {
  if (mode !== "1v1" || battle.active) return false;
  if (state !== "play" && state !== "serve") return false;
  const n = snapBuf.length;
  if (!n) return false;
  const b = snapBuf[n - 1].ball;
  // frozen OK (notre service) ; refuser seulement crevée / hors zone
  return b && !b.popped && ballInGuestOwnZone(b.x);
}

// Balle « live » depuis le dernier snap (âge + RTT/2) — vue hors camp entière.
function guestLiveBallFromSnap() {
  const n = snapBuf.length;
  if (!n) return null;
  const last = snapBuf[n - 1];
  if (!last.ball || (last.state !== "play" && last.state !== "serve")) return null;
  if (last.ball.frozen || last.ball.popped) return null;
  const tickMs = 1000 / 60;
  const age = lastSnapArrival ? (performance.now() - lastSnapArrival) / tickMs : 0;
  const rttHalf = pingMs > 0 ? (pingMs * 0.5) / tickMs : 1.5;
  const dt = Math.max(0, Math.min(EXTRAP_MAX, age + rttHalf));
  const pb = predictBallMotion(last.ball.x, last.ball.y, last.ball.vx, last.ball.vy, dt);
  return { x: pb.x, y: pb.y, vx: pb.vx, vy: pb.vy, angle: last.ball.angle + pb.vx * 0.03 * dt };
}

/** Hôte : applique un paquet balle invité avec correction douce (anti micro-stutter RTT). */
function hostApplyGuestBallSoft(b) {
  if (!b) return;
  const ox = ball.x, oy = ball.y;
  applyBallState(b);
  const dx = ball.x - ox, dy = ball.y - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > 0.5 && dist < BALL_SOFT_CORRECT) {
    // Blend ~45 % vers le paquet — vitesses = autorité invité
    ball.x = ox + dx * 0.45;
    ball.y = oy + dy * 0.45;
  } else if (dist >= BALL_SOFT_CORRECT) {
    // Gros saut : lissage visuel (affichage reste près de l'ancienne pose)
    hostBallSmoothX += ox - ball.x;
    hostBallSmoothY += oy - ball.y;
  }
}

// Hôte : n'applique la balle invité QUE si l'invité revendique explicitement
// la possession (own:1) ET que l'hôte a déjà la balle à droite. Sinon un
// paquet périmé du rally / de la sortie précédente téléportait la balle
// vers le sol → « tombe toute seule à l'arrivée dans le camp adverse ».
function hostUsesGuestBall() {
  const HOST_ACCEPT = NET_X + 24;
  return mode === "1v1" && !battle.active &&
         guestBall && guestBall.own === 1 &&
         (performance.now() - lastGuestBallAt) < BALL_STALE_MS &&
         guestBall.x > HOST_ACCEPT &&
         ball.x > NET_X;
}

function hostInvalidateGuestBall() {
  guestBall = null;
  lastGuestBallAt = 0;
  appliedGuestBallGen = -1;
}

/** Hôte : decay du lissage balle + reprise d'autorité après own:1. */
function hostTickBallSmooth() {
  hostBallSmoothX *= 0.78;
  hostBallSmoothY *= 0.78;
  if (Math.abs(hostBallSmoothX) < 0.15) hostBallSmoothX = 0;
  if (Math.abs(hostBallSmoothY) < 0.15) hostBallSmoothY = 0;
}

// Au moment où l'invité prend la balle : partir du DERNIER snap hôte
// (présent), pas de l'interpolation retardée (sinon la balle « chute » d'un coup).
function guestSeedBallFromSnap() {
  const n = snapBuf.length;
  if (!n) return;
  const b = snapBuf[n - 1].ball;
  if (!b) return;
  ball.x = b.x; ball.y = b.y; ball.vx = b.vx; ball.vy = b.vy;
  ball.angle = b.angle;
  ball.frozen = b.frozen; ball.popped = !!b.popped;
  ball.smash = b.smash || 0;
  if (b.inHands !== undefined) ball.inHands = !!b.inHands;
  if (b.tossGrace !== undefined) ball.tossGrace = b.tossGrace | 0;
  if (b.sal !== undefined) ball.serveAimLock = !!b.sal;
  if (b.serveAimLock !== undefined) ball.serveAimLock = !!b.serveAimLock;
  if (b.sf !== undefined) ball.serveFlight = !!b.sf;
  if (b.serveFlight !== undefined) ball.serveFlight = !!b.serveFlight;
  ball.lastTouchSide = b.lastTouchSide;
  ball.touches = [b.touches[0], b.touches[1]];
  if (b.nextToucher) {
    ball.nextToucher = [
      (b.nextToucher[0] == null || b.nextToucher[0] < 0) ? null : (b.nextToucher[0] | 0),
      (b.nextToucher[1] == null || b.nextToucher[1] < 0) ? null : (b.nextToucher[1] | 0)
    ];
  }
  if (b.heldBy !== undefined) ball.heldBy = b.heldBy;
  if (b.holdT !== undefined) ball.holdT = b.holdT;
  if (b.chargeT !== undefined) ball.chargeT = b.chargeT;
  if (b.aimAngle !== undefined) ball.aimAngle = b.aimAngle;
  if (b.shotArmed !== undefined) ball.shotArmed = !!b.shotArmed;
  ballScoreLock = false;
}

// Point différé invité — idempotent par séquence (anti multi-score).
function hostTakeGuestBallPoint() {
  if (!guestBall || !guestBall.pt || !Array.isArray(guestBall.pt)) return;
  const side = guestBall.pt[0] | 0;
  const reason = guestBall.pt[1] || "";
  const seq = guestBall.pt[2] | 0;
  guestBall.pt = null;
  if (seq <= lastGuestPtSeq) return;
  lastGuestPtSeq = seq;
  if (state === "play" || state === "serve") awardPoint(side, reason);
}

// Pose les blobs distants d'après le dernier snap (collisions locales invité).
function guestSyncRemoteBlobs() {
  const n = snapBuf.length;
  if (!n) return;
  const last = snapBuf[n - 1];
  activeBlobs.forEach((b, i) => {
    if (i === mySlot) return;
    const sb = last.blobs[i]; if (!sb) return;
    b.x = sb.x; b.y = sb.y; b.vx = sb.vx; b.vy = sb.vy;
    b.onGround = sb.onGround; b.walkPhase = sb.walkPhase; b.squash = sb.squash;
  });
}

function hostSnapCadence() {
  // près du filet / balle rapide vers l'autre camp → snaps à 60 Hz
  if (state !== "play" && state !== "serve") return SNAP_EVERY;
  if (Math.abs(ball.x - NET_X) < NET_SNAP_ZONE) return SNAP_NEAR_NET;
  if (Math.abs(ball.vx) > 8) return SNAP_NEAR_NET;
  return SNAP_EVERY;
}

// ============================================================
//                 MODE EN LIGNE 2v2 (HÔTE)
// ============================================================
// L'hôte reste autoritaire (il simule tout) et accepte jusqu'à 3 invités.
// Chaque invité ouvre ses 2 canaux (rel/fast) ; on les regroupe par id de pair.
// Les slots libres sont pilotés par l'IA de l'hôte. Les invités, eux, gardent
// exactement le même code que le 1v1 (connRel/connFast, onNetData) : ils
// apprennent juste leur slot via le message "start".

function initHostPeer2v2() {
  online = true; netRole = "host";
  netConnected = false; peerReady = false;
  guests = []; lobbyStarted = false;
  setMode("2v2"); mySlot = 0;
  aiLevel = 1; vsAI = false;
  netCode = makeCode();
  withIceReady(() => {
    const old = peer;
    peer = null;
    peerReady = false;
    connRel = null;
    connFast = null;
    if (old) { try { old.destroy(); } catch (e) { /* ignore */ } }
    online = true; netRole = "host";
    netConnected = false;
    guests = []; lobbyStarted = false;
    setMode("2v2"); mySlot = 0;
    aiLevel = 1; vsAI = false;
    peer = new Peer(PEER_PREFIX + netCode, { config: ICE_CONFIG });
    peer.on("open", () => { peerReady = true; });
    peer.on("connection", c => hostAcceptConn(c));
    peer.on("error", onPeerError);
    peer.on("disconnected", () => { if (peer && !peer.destroyed) peer.reconnect(); });
  });
}

function hostAcceptConn(c) {
  if (c.label !== "rel" && c.label !== "fast") {
    setTimeout(() => { try { c.close(); } catch (e) {} }, 500);
    return;
  }
  let g = guests.find(x => x.id === c.peer);
  if (!g) {
    const taken = new Set(guests.map(x => x.slot));
    const slot = SLOT_ORDER.find(s => !taken.has(s));
    if (slot === undefined || lobbyStarted) { // complet ou partie lancée → refus
      setTimeout(() => { try { c.close(); } catch (e) {} }, 500);
      return;
    }
    g = { id: c.peer, rel: null, fast: null, slot, charId: 0,
          inSeq: 0, in: { left: false, right: false, jump: false, smash: false, super: false },
          ready: false, connected: false, ping: null };
    guests.push(g);
  }
  if (c.label === "rel") g.rel = c; else g.fast = c;
  c.on("data", m => onHostData(g, m));
  c.on("open", () => hostGuestCheck(g));
  c.on("close", () => onGuestClosed(g));
  c.on("error", () => {});
  if (c.open) hostGuestCheck(g);
}

function hostGuestCheck(g) {
  if (g.connected || !g.rel || !g.rel.open || !g.fast || !g.fast.open) return;
  g.connected = true;
  netConnected = true;             // au moins un invité relié
  lastPeerMsg = performance.now();
  if (!pingTimer) startPinging();
  // liste des persos déjà pris (hôte + autres prêts) pour éviter les doublons
  try { g.rel.send({ t: "taken", a: hostTakenAnimals(g) }); } catch (e) {}
}

function onGuestClosed(g) {
  const i = guests.indexOf(g);
  if (i >= 0) guests.splice(i, 1);
  try { if (g.rel)  g.rel.close();  } catch (e) {}
  try { if (g.fast) g.fast.close(); } catch (e) {}
  // en pleine partie : le slot libéré repasse simplement à l'IA (aucun blocage)
  if (guests.length === 0 && !lobbyStarted) netConnected = false;
}

function onHostData(g, m) {
  if (!m || typeof m !== "object") return;
  lastPeerMsg = performance.now();
  switch (m.t) {
    case "ping": if (g.fast && g.fast.open) g.fast.send({ t: "pong", ts: m.ts }); break;
    case "pong": {
      const rtt = performance.now() - m.ts;
      g.ping = g.ping == null ? rtt : g.ping * 0.7 + rtt * 0.3;
      pingMs = Math.max(0, ...guests.map(x => x.ping || 0));
      break;
    }
    case "hello": { // l'invité a choisi son personnage (lobby)
      let a = clampCharacterIdx(m.charId);
      const taken = hostTakenAnimals(g);
      if (taken.includes(a)) a = randomCharacterIdx(taken);
      g.charId = a;
      g.ready = true;
      hostBroadcastTaken();
      break;
    }
    case "in": // entrées de cet invité (on ne garde que la plus récente)
      if (m.m !== matchId) break;
      if (m.s > g.inSeq) {
        g.inSeq = m.s;
        g.in = { left: !!m.l, right: !!m.r, jump: !!m.j, kbdJump: !!m.kj,
                 smash: !!(m.sh || m.rc),
                 super: !!m.sp, up: !!m.u, down: !!m.d,
                 ax: (m.ax || 0) / 100, ay: (m.ay || 0) / 100 };
        setX(activeBlobs[g.slot], !!m.x);
      }
      break;
    case "bye": onGuestClosed(g); break;
  }
}

function hostStartMatch2v2() {
  if (guests.length === 0) return; // au moins un humain en face
  matchId++;
  lobbyStarted = true;
  netFrame = 0;
  vsAI = false; aiLevel = 1;
  setMode("2v2"); mySlot = 0;
  const seed = (Math.random() * 2 ** 31) | 0;
  const occ = {}; for (const g of guests) occ[g.slot] = g;
  // persos : slot 0 = hôte ; slots invités = leur choix ; slots libres = IA
  // tous distincts (re-tirage si collision)
  const anims = [];
  const used = new Set();
  for (let s = 0; s < 4; s++) {
    let a = s === 0 ? blobL.charId : occ[s] ? occ[s].charId : -1;
    if (a < 0 || used.has(a)) a = randomCharacterIdx([...used]);
    used.add(a);
    anims[s] = a;
  }
  newGame(seed); // réinitialise positions/scores (n'écrase pas charId/speedMul en ligne)
  activeBlobs.forEach((b, s) => {
    b.charId = anims[s];
    b.speedMul = 1; // humain ou IA : mêmes stats perso (pas de boost difficulté)
  });
  for (const g of guests) {
    if (g.rel && g.rel.open) {
      g.rel.send({ t: "start", m: matchId, mode: "2v2", slot: g.slot, seed, terrain, ballSkin, a: anims,
                   bomb: bombMode ? 1 : 0, bt: bombTime, flame: flameMode ? 1 : 0,
                   quiet: mapEventsQuiet ? 1 : 0 });
    }
  }
}

// boucle de l'hôte 2v2 (appelée par netUpdate)
function hostUpdate2v2() {
  if (!lobbyStarted) return; // encore dans le lobby
  const inMatch = state === "play" || state === "serve" ||
                  state === "point" || state === "gameover";
  if (!inMatch) return;

  if (state === "point" || state === "gameover") {
    if (typeof settleAirborneBlobs === "function") settleAirborneBlobs();
    if (typeof tickCelebration === "function") tickCelebration();
  }
  if (state === "point") {
    pointTimer--;
    // n'importe quel joueur connecté (hôte ou invité) peut faire avancer
    // l'écran "Point pour ..." en appuyant sur saut/confirmation, comme
    // hors-ligne (voir update() dans simulation.js) — sinon, filet de
    // sécurité au bout de POINT_MAX_WAIT.
    const elapsed = POINT_MAX_WAIT - pointTimer;
    const guestWants = guests.some(g => g.connected && g.in.jump);
    if ((elapsed >= POINT_MIN_WAIT && (pointAdvanceRequested() || guestWants)) || pointTimer <= 0) startRally();
  } else if (state === "gameover") {
    if (gameoverTimer > 0) gameoverTimer--;
  } else if (state === "play" || state === "serve") {
    const bySlot = {}; for (const g of guests) if (g.connected) bySlot[g.slot] = g;
    const ins = activeBlobs.map((b, s) => {
      if (s === 0) return onlineLocalInput();           // l'hôte
      const g = bySlot[s];
      return g ? g.in : aiInput2v2(b);                  // invité, sinon IA
    });
    stepGame(null, null, ins);
  }
  // diffusion d'un instantané à tous les invités, ack propre à chacun
  netFrame++;
  if (netFrame % hostSnapCadence() === 0) {
    const snap = getSnapshot();
    for (const g of guests) {
      if (g.fast && g.fast.open) g.fast.send({ t: "snap", m: matchId, ack: g.inSeq, d: snap });
    }
  }
}

// ---------- Boucle réseau (appelée à 60 Hz par update) ----------
function netUpdate() {
  if (!netConnected) return;
  const now = performance.now();

  if (netRole === "host") {
    if (mode === "2v2") { hostUpdate2v2(); return; } // hôte 2v2 : boucle dédiée
    // silence de l'invité → gel de la simulation (personne n'est lésé)
    netFrozen = now - lastPeerMsg > NET_TIMEOUT;
    const inMatch = state === "play" || state === "serve" ||
                    state === "point" || state === "gameover";
    if (!inMatch) return; // encore dans le lobby

    if (!netFrozen) {
      if (state === "point" || state === "gameover") {
        if (typeof settleAirborneBlobs === "function") settleAirborneBlobs();
        if (typeof tickCelebration === "function") tickCelebration();
      }
      if (state === "point") {
        pointTimer--;
        // hôte OU invité peut faire avancer l'écran "Point pour ..." en
        // appuyant sur saut/confirmation (comme hors-ligne) — sinon, filet
        // de sécurité au bout de POINT_MAX_WAIT.
        const elapsed = POINT_MAX_WAIT - pointTimer;
        if ((elapsed >= POINT_MIN_WAIT && (pointAdvanceRequested() || guestIn.jump)) || pointTimer <= 0) startRally();
      } else if (state === "gameover") {
        if (gameoverTimer > 0) gameoverTimer--;
      } else if (state === "play" || state === "serve") {
        // Soft ownership : invité revendique (own:1) + balle déjà à droite.
        const usingGuest = hostUsesGuestBall();
        if (usingGuest) {
          hostWasUsingGuestBall = true;
          if (appliedGuestBallGen !== guestBallGen) {
            hostApplyGuestBallSoft(guestBall);
            appliedGuestBallGen = guestBallGen;
          } else {
            // Même paquet (trou RTT après sortie / jitter) : avancer 1 tick
            // au lieu de reposer la même pose → anti-freeze filet côté hôte.
            const pb = predictBallMotion(ball.x, ball.y, ball.vx, ball.vy, 1);
            ball.x = pb.x; ball.y = pb.y; ball.vx = pb.vx; ball.vy = pb.vy;
          }
          // Predict / paquet a ramené la balle près du filet → autorité hôte
          if (ball.x <= NET_X + GUEST_BALL_MARGIN) hostInvalidateGuestBall();
          // skipBall : la balle a déjà été posée / avancée ci-dessus
          stepGame(onlineLocalInput(), guestIn, null, { skipBall: true });
        } else {
          // Reprise d'autorité : lisser le micro-saut simu hôte vs dernière pose guest
          if (hostWasUsingGuestBall) {
            hostWasUsingGuestBall = false;
            const ox = ball.x, oy = ball.y;
            if (ball.x <= NET_X + GUEST_BALL_MARGIN) hostInvalidateGuestBall();
            stepGame(onlineLocalInput(), guestIn);
            const dist = Math.hypot(ball.x - ox, ball.y - oy);
            if (dist >= 2 && dist < RECONCILE_SNAP) {
              hostBallSmoothX += ox - ball.x;
              hostBallSmoothY += oy - ball.y;
            }
          } else {
            if (ball.x <= NET_X + GUEST_BALL_MARGIN) hostInvalidateGuestBall();
            stepGame(onlineLocalInput(), guestIn);
          }
          if (ball.x <= NET_X + 24) hostInvalidateGuestBall();
        }
        hostTickBallSmooth();
        hostTakeGuestBallPoint(); // y compris pt arrivé avec own:0
      }
    }
    netFrame++;
    if (netFrame % hostSnapCadence() === 0) {
      sendFast({ t: "snap", m: matchId, ack: guestInSeq, d: getSnapshot() });
    }

  } else {
    // ---- invité ----
    // tête de lecture : avance de 1 tick, se recale en douceur ~INTERP_DELAY
    // ticks derrière le dernier instantané, sans jamais sortir du tampon
    if (snapBuf.length) {
      const latestTick = snapBuf[snapBuf.length - 1].tick;
      const target = latestTick - interpDelay;
      renderTick += 1;
      const err = target - renderTick;
      renderTick += err * (Math.abs(err) > 4 ? 0.35 : 0.12);
      renderTick = Math.max(snapBuf[0].tick,
                            Math.min(renderTick, latestTick + EXTRAP_MAX));
    }
    guestSmoothX *= 0.75; guestSmoothY *= 0.75;
    // Handoff : X se résorbe plus lentement (composante qui « saute » au filet)
    guestBallSmoothX *= 0.84; guestBallSmoothY *= 0.72;
    if (Math.abs(guestBallSmoothX) < 0.12) guestBallSmoothX = 0;
    if (Math.abs(guestBallSmoothY) < 0.12) guestBallSmoothY = 0;

    if (state === "play" || state === "serve") {
      const input = onlineLocalInput();
      inputSeq++;
      inputHistory.push({ s: inputSeq, i: input });
      if (inputHistory.length > 240) inputHistory.shift();

      let ballPkt = null;

      // Acquisition : uniquement si le DERNIER snap hôte a la balle dans
      // la zone (pas le ball.x affiché retardé — ça causait le freeze).
      if (!guestBallAuthority && !battle.active && guestCanAcquireBall()) {
        const ox = ball.x, oy = ball.y;
        guestBallAuthority = true;
        guestCoast = null; guestCoastLeft = 0;
        guestSeedBallFromSnap();
        guestBallSmoothX = ox - ball.x;
        guestBallSmoothY = oy - ball.y;
        // Trop gros (reset) : pas de blend, snap franc
        if (Math.hypot(guestBallSmoothX, guestBallSmoothY) > RECONCILE_SNAP) {
          guestBallSmoothX = guestBallSmoothY = 0;
        }
      }

      if (guestBallAuthority) {
        // Même horloge que stepGame : sans tick++, le cooldown post-réception
        // (canActiveHit) reste figé → smash impossible après une cloche.
        tick++;
        guestSyncRemoteBlobs();
        netDeferScore = true;
        const me = activeBlobs[mySlot];
        if (state === "serve" && serveCountdown > 0) {
          me.update({ left: input.left, right: input.right, jump: false });
          serveCountdown--;
          if (GAMEPLAY_V2 && ball.inHands) attachBallToServerHands();
          else ball.y += Math.sin(tick / 18) * 0.3;
        } else {
          maybeActivateSuper(me, input);
          me.update(input);
          updateBall();
          tickSuper(me);
        }
        if (state === "serve" && !ball.frozen) state = "play";
        // Crevaison : la collision pose popped en FIN de updateBall, le point
        // ne tombe qu'au tick suivant. Si on libère l'autorité sur `popped`
        // tout de suite, ce tick n'arrive jamais → pas de `pt` → partie bloquée.
        if (ball.popped && !pendingNetPoint && (state === "play" || state === "serve")) {
          const ls = ball.lastTouchSide;
          awardPoint(ls >= 0 ? 1 - ls : (ball.x < NET_X ? 1 : 0), "Balle crevée !");
        }
        netDeferScore = false;
        ballPkt = packBallState(true);
        // Libération : zone / battle. Garder l'autorité tant que crevée + pt
        // en vol (renvoi jusqu'à ce que l'hôte passe en "point").
        if (battle.active ||
            (!ball.popped && !pendingNetPoint && !ballInGuestOwnZone(ball.x))) {
          guestBallAuthority = false;
          guestBallHold = GUEST_BALL_HOLD;
          guestCoast = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, angle: ball.angle };
          guestCoastLeft = GUEST_COAST_TICKS;
        }
      } else if (!battle.active) {
        activeBlobs[mySlot].update(input);
        if (guestBallHold > 0) {
          guestBallHold--;
          ballPkt = packBallState(false);
        }
        // Côte : avancer la prédiction locale 1 tick / frame
        if (guestCoastLeft > 0 && guestCoast) {
          const pb = predictBallMotion(guestCoast.x, guestCoast.y,
                                       guestCoast.vx, guestCoast.vy, 1);
          guestCoast.x = pb.x; guestCoast.y = pb.y;
          guestCoast.vx = pb.vx; guestCoast.vy = pb.vy;
          guestCoast.angle += pb.vx * 0.03;
          guestCoastLeft--;
          if (guestCoastLeft <= 0) guestCoast = null;
        }
      }

      const msg = { t: "in", m: matchId, s: inputSeq,
                    l: input.left ? 1 : 0, r: input.right ? 1 : 0,
                    j: input.jump ? 1 : 0, kj: input.kbdJump ? 1 : 0,
                    sh: input.smash ? 1 : 0,
                    sp: input.super ? 1 : 0,
                    u: input.up ? 1 : 0, d: input.down ? 1 : 0,
                    ax: Math.round((input.ax || 0) * 100),
                    ay: Math.round((input.ay || 0) * 100),
                    x: xOn[mySlot] ? 1 : 0 };
      if (ballPkt) msg.b = ballPkt;
      sendFast(msg);
    }

    // Célébration locale (anims victory/defeat + confettis) pendant point / fin
    if (state === "point" || state === "gameover") {
      if (typeof settleAirborneBlobs === "function") settleAirborneBlobs();
      if (typeof tickCelebration === "function") tickCelebration();
      if (state === "gameover" && gameoverTimer > 0) gameoverTimer--;
    }
  }
}

// ---------- Invité : réception d'un instantané ----------
function onSnapMsg(m) {
  const now = performance.now();
  // mesure de l'espacement réel des snapshots + gigue → délai d'interpolation
  // adaptatif : juste ce qu'il faut pour absorber la gigue, pas plus (latence mini)
  if (lastSnapArrival) {
    const gap = now - lastSnapArrival;
    snapGapEMA = snapGapEMA ? snapGapEMA * 0.85 + gap * 0.15 : gap;
    snapJitterEMA = snapJitterEMA * 0.85 + Math.abs(gap - snapGapEMA) * 0.15;
    const tickMs = 1000 / 60;
    const wanted = (snapGapEMA + snapJitterEMA * 2.5) / tickMs;
    interpDelay = Math.max(INTERP_MIN, Math.min(INTERP_MAX, wanted));
  }
  lastSnapArrival = now;
  lastSnapTime = now;
  const d = m.d, n = snapBuf.length;
  if (n && d.tick < snapBuf[n - 1].tick) return;            // paquet périmé
  if (n && d.tick === snapBuf[n - 1].tick) snapBuf[n - 1] = d; // même tick (pause, point…)
  else { snapBuf.push(d); if (snapBuf.length > 12) snapBuf.shift(); }
  guestDetectEvents(prevSnap, d);
  applyDiscrete(d);
  reconcileGuest(d, m.ack);
  prevSnap = d;
}

// champs "discrets" (non interpolables) : appliqués dès réception
function applyDiscrete(d) {
  const iOwnBall = guestOwnsBall() || guestBallHold > 0;
  const prevState = state;
  state = d.state; servingSide = d.servingSide;
  pointMsg = d.pointMsg;
  if (!iOwnBall) tick = d.tick;
  if (!iOwnBall) serveCountdown = d.serveCountdown || 0;
  scores[0] = d.scores[0]; scores[1] = d.scores[1];
  // Changement d'état (point / serve / fin) : adopter ENTIÈREMENT la balle
  // hôte (évite balle périmée du rally précédent → service bloqué).
  if (prevState !== d.state &&
      (d.state === "point" || d.state === "gameover" || d.state === "serve")) {
    pendingNetPoint = null;
    ballScoreLock = false;
    guestBallHold = 0;
    guestBallAuthority = false;
    guestCoast = null; guestCoastLeft = 0;
    guestBallSmoothX = guestBallSmoothY = 0;
    ball.x = d.ball.x; ball.y = d.ball.y;
    ball.vx = d.ball.vx; ball.vy = d.ball.vy;
    ball.angle = d.ball.angle;
    ball.frozen = d.ball.frozen; ball.popped = !!d.ball.popped;
    ball.smash = d.ball.smash || 0;
    ball.lastTouchSide = d.ball.lastTouchSide;
    ball.touches = [d.ball.touches[0], d.ball.touches[1]];
    if (d.ball.nextToucher) {
      ball.nextToucher = [
        (d.ball.nextToucher[0] == null || d.ball.nextToucher[0] < 0) ? null : (d.ball.nextToucher[0] | 0),
        (d.ball.nextToucher[1] == null || d.ball.nextToucher[1] < 0) ? null : (d.ball.nextToucher[1] | 0)
      ];
    }
    ball.trail.length = 0;
    if (d.serveCountdown !== undefined) serveCountdown = d.serveCountdown;
    if (d.state === "point" || d.state === "gameover") {
      celebT = 0;
      if (d.state === "gameover") gameoverTimer = GAMEOVER_MIN_WAIT;
    }
  }
  if (d.streak) { streak[0] = d.streak[0]; streak[1] = d.streak[1]; }
  if (d.superCharge) { superCharge[0] = d.superCharge[0]; superCharge[1] = d.superCharge[1]; }
  if (d.weather !== undefined) { weather = d.weather; weatherTimer = d.weatherTimer; }
  if (d.bombMode !== undefined) { bombMode = d.bombMode; bombTimer = d.bombTimer || 0; }
  if (d.flameMode !== undefined) flameMode = !!d.flameMode;
  // Physique balle : ne pas écraser si on simule localement (anti rubber-band)
  if (!iOwnBall) {
    ball.frozen = d.ball.frozen; ball.popped = !!d.ball.popped;
    ball.smash = d.ball.smash || 0;
    ball.lastTouchSide = d.ball.lastTouchSide;
    ball.touches = [d.ball.touches[0], d.ball.touches[1]];
    if (d.ball.nextToucher) {
      ball.nextToucher = [
        (d.ball.nextToucher[0] == null || d.ball.nextToucher[0] < 0) ? null : (d.ball.nextToucher[0] | 0),
        (d.ball.nextToucher[1] == null || d.ball.nextToucher[1] < 0) ? null : (d.ball.nextToucher[1] | 0)
      ];
    }
  }
  // Reprise hôte confirmée par snap (balle hors zone) → lâcher l'autorité
  if (guestBallAuthority && d.ball && !ballInGuestOwnZone(d.ball.x) &&
      (d.state === "play" || d.state === "serve") && prevState === d.state) {
    guestBallAuthority = false;
    guestBallHold = 0;
    ballScoreLock = false;
    guestCoast = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, angle: ball.angle };
    guestCoastLeft = GUEST_COAST_TICKS;
  }
  if (d.battle) {
    battle.active = d.battle.active; battle.t = d.battle.t;
    battle.count = [d.battle.count[0], d.battle.count[1]];
    battle.cooldown = d.battle.cooldown;
  }
  activeBlobs.forEach((b, i) => {
    const sb = d.blobs[i]; if (!sb) return;
    if (sb.charId !== undefined) b.charId = sb.charId;
    b.scramble = sb.scramble || 0;
    b.superT = sb.superT || 0; b.superKind = sb.superKind || ""; b.superSmash = !!sb.superSmash;
    if (sb.flameHp !== undefined) b.flameHp = sb.flameHp | 0;
    if (sb.flameIgniteT !== undefined) b.flameIgniteT = sb.flameIgniteT | 0;
    if (sb.charredT !== undefined) b.charredT = sb.charredT | 0;
  });
}

// sons et effets côté invité, déduits des transitions entre instantanés
function guestDetectEvents(prev, d) {
  if (!prev) return;
  // début / fin d'un Smash Battle
  if (d.battle && prev.battle) {
    if (d.battle.active && !prev.battle.active) { shake = 6; sfxBattleStart(); }
    if (!d.battle.active && prev.battle.active) { shake = 14; sfxBattleEnd(); }
  }
  // explosion de la bombe : la mèche vient de passer à zéro → éclair + boum
  if (d.bombMode && prev.bombTimer > 0 && (d.bombTimer || 0) <= 0) {
    bombFlash = 1; shake = Math.max(shake, 18);
    sfxBombBlast();
    const hitSide = (d.ball && d.ball.x < NET_X) ? 0 : 1;
    for (const b of activeBlobs) {
      if (b.side === hitSide) b.charredT = Math.max(b.charredT || 0, 110);
    }
  }
  // déclenchement d'un SUPER (superT passe de 0 à >0)
  for (let i = 0; i < activeBlobs.length; i++) {
    const pb = prev.blobs[i], cb = d.blobs[i];
    if (cb && pb && (cb.superT || 0) > 0 && (pb.superT || 0) <= 0) {
      shake = Math.max(shake, 7);
      crowdHype = Math.max(crowdHype, 45);
      superSound(cb.superKind || charOf(activeBlobs[i]).key);
      const ch = CHARACTERS[cb.charId];
      superFlash = "★ " + ((ch && ch.superName) || "SUPER");
      superFlashSub = (ch && ch.superTag) || (ch && ch.superDesc) || "";
      superFlashT = typeof SUPER_FLASH_T !== "undefined" ? SUPER_FLASH_T : 100;
      spawnSuperBurst(activeBlobs[i]);
      if (typeof spawnSuperZoneBurst === "function") {
        spawnSuperZoneBurst(1 - activeBlobs[i].side, (ch && ch.key) || "");
      }
    }
  }
  for (const s of [0, 1]) {
    if (d.scores[s] > prev.scores[s]) {
      scorePop[s] = 20;
      shake = 8;
      crowdHype = 60;
      spawnConfetti(22, s === 0 ? W * 0.25 : W * 0.75);
      setEmote(s, "happy");
      setEmote(1 - s, "sad");
      sfxPoint(s);
    }
  }
  const t0 = prev.ball.touches[0] + prev.ball.touches[1];
  const t1 = d.ball.touches[0] + d.ball.touches[1];
  if (t1 > t0 || (d.ball.lastTouchSide !== prev.ball.lastTouchSide &&
                  d.ball.lastTouchSide !== -1)) {
    // frappeur : le blob du bon camp le plus proche de la balle (visuel/son)
    let hitter = blobL, best = 1e9;
    for (const b of activeBlobs) {
      if (b.side !== d.ball.lastTouchSide) continue;
      const dd = Math.hypot(b.x - d.ball.x, b.y - d.ball.y);
      if (dd < best) { best = dd; hitter = b; }
    }
    const heavy = Math.hypot(d.ball.vx || 0, d.ball.vy || 0) > 11.5;
    if (heavy) sfxBallSmash(); else sfxBallHit();
    charHitSound(charOf(hitter), heavy);
  }
}

// réconciliation : état serveur + rejeu silencieux des entrées non acquittées
function reconcileGuest(d, ack) {
  while (inputHistory.length && inputHistory[0].s <= ack) inputHistory.shift();
  const me = activeBlobs[mySlot];
  const sb = d.blobs[mySlot]; if (!sb) return;
  const px = me.x + guestSmoothX, py = me.y + guestSmoothY; // position affichée
  me.x = sb.x; me.y = sb.y;
  me.vx = sb.vx; me.vy = sb.vy;
  me.onGround = sb.onGround;
  noFx = true;
  if (!battle.active) for (const h of inputHistory) me.update(h.i);
  noFx = false;
  const dx = px - me.x, dy = py - me.y;
  if (Math.hypot(dx, dy) < RECONCILE_SNAP) {
    // petit écart : on le résorbe visuellement sur quelques frames
    guestSmoothX = dx; guestSmoothY = dy;
  } else {
    // gros écart (reset de manche, gros lag) : téléportation franche
    guestSmoothX = guestSmoothY = 0;
  }
}

// Pose la balle vue invité hors ownership.
// Toujours dead-reckoning live (pas lerp retardé au fond de court) +
// correction temporelle douce ; corps adverses gardent interpDelay.
function guestApplyBallView(s0, s1, a, last) {
  const L = (u, v) => u + (v - u) * a;
  const live = guestLiveBallFromSnap();

  let sx, sy, sa;
  if (live) {
    sx = live.x; sy = live.y; sa = live.angle;
    // Soft-correct vs pose affichée précédente (anti micro-sauts RTT)
    if (!guestCoast || guestCoastLeft <= 0) {
      const err = Math.hypot(sx - ball.x, sy - ball.y);
      if (err > 0.5 && err < BALL_SOFT_CORRECT) {
        const k = 0.55;
        sx = ball.x + (sx - ball.x) * k;
        sy = ball.y + (sy - ball.y) * k;
        sa = ball.angle + (sa - ball.angle) * k;
      }
      // err >= BALL_SOFT_CORRECT : snap franc vers live (hit distant, etc.)
    }
  } else {
    // frozen / crevée / hors play : lerp snapshots + garde filet
    const x0 = s0.ball.x, y0 = s0.ball.y, x1 = s1.ball.x, y1 = s1.ball.y;
    const clearY = NET_TOP - BALL_R;
    let yAtNet = null;
    if ((x0 - NET_X) * (x1 - NET_X) < 0 && Math.abs(x1 - x0) > 1e-6) {
      yAtNet = y0 + ((NET_X - x0) / (x1 - x0)) * (y1 - y0);
    }
    const clearsOver = yAtNet !== null && yAtNet <= clearY;
    const throughPost = yAtNet !== null && yAtNet > clearY;
    if (throughPost && s0.tick !== s1.tick &&
        s0.state === "play" && !s0.ball.frozen && !s0.ball.popped) {
      const dt = Math.max(0, renderTick - s0.tick);
      const pb = predictBallMotion(x0, y0, s0.ball.vx, s0.ball.vy, dt);
      const k = a * 0.4;
      sx = pb.x + (x1 - pb.x) * k;
      sy = pb.y + (y1 - pb.y) * k;
      sa = L(s0.ball.angle, s1.ball.angle);
    } else {
      sx = L(x0, x1); sy = L(y0, y1); sa = L(s0.ball.angle, s1.ball.angle);
      if (!clearsOver && sy > clearY) {
        const leftC = NET_X - NET_W / 2 - BALL_R;
        const rightC = NET_X + NET_W / 2 + BALL_R;
        if (sx > leftC && sx < rightC) sx = sx < NET_X ? leftC : rightC;
      }
    }
  }

  // Blend côte locale → live pendant le handoff (X plus lent que Y)
  if (guestCoast && guestCoastLeft > 0) {
    const k = 1 - (guestCoastLeft / GUEST_COAST_TICKS); // 0 → 1
    const easeY = k * k;
    const easeX = k * k * k;
    ball.x = guestCoast.x + (sx - guestCoast.x) * easeX;
    ball.y = guestCoast.y + (sy - guestCoast.y) * easeY;
    ball.angle = guestCoast.angle + (sa - guestCoast.angle) * easeY;
  } else {
    ball.x = sx; ball.y = sy; ball.angle = sa;
  }
}

// avant le rendu : écrit dans ball/blobs les positions interpolées
function guestApplyView() {
  const n = snapBuf.length;
  if (!n) return;
  const last = snapBuf[n - 1];
  const iOwnBall = guestOwnsBall();

  // --- extrapolation adversaire (+ balle si pas owner / pas côte gérée plus bas)
  if (renderTick > last.tick + 0.001 && last.state === "play" &&
      !last.ball.frozen && !last.ball.popped && !(last.battle && last.battle.active)) {
    const dt = Math.min(renderTick - last.tick, EXTRAP_MAX);
    if (!iOwnBall) {
      // près du filet / côte : même chemin que l'interp (live + blend)
      guestApplyBallView(last, last, 1, last);
    }
    activeBlobs.forEach((b, i) => {
      if (i === mySlot) return;
      const b1 = last.blobs[i]; if (!b1) return;
      b.x = b1.x + b1.vx * dt;
      b.y = b1.onGround ? b1.y : b1.y + b1.vy * dt + 0.5 * GRAV_BLOB * dt * dt;
      // walkPhase = index de frame entier — ne pas extrapoler (sinon clignote)
      b.walkPhase = b1.walkPhase;
      b.vx = b1.vx; b.onGround = b1.onGround; b.squash = b1.squash;
    });
    if (!ball.frozen) { ball.trail.push({ x: ball.x, y: ball.y }); if (ball.trail.length > 8) ball.trail.shift(); }
    return;
  }

  let i0 = 0;
  for (let i = n - 1; i >= 0; i--) {
    if (snapBuf[i].tick <= renderTick) { i0 = i; break; }
  }
  const s0 = snapBuf[i0], s1 = snapBuf[Math.min(i0 + 1, n - 1)];
  let a = s1.tick > s0.tick ? (renderTick - s0.tick) / (s1.tick - s0.tick) : 1;
  a = Math.max(0, Math.min(1, a));
  if (s0.state !== s1.state) a = 1;

  const L = (u, v) => u + (v - u) * a;
  if (!iOwnBall) guestApplyBallView(s0, s1, a, last);

  activeBlobs.forEach((b, i) => {
    if (i === mySlot) return;
    const b0 = s0.blobs[i], b1 = s1.blobs[i];
    if (!b0 || !b1) return;
    b.x = L(b0.x, b1.x);
    b.y = L(b0.y, b1.y);
    // Frame de marche discrète (lerp float → clignotement entre 2 images proches)
    b.walkPhase = a < 0.5 ? b0.walkPhase : b1.walkPhase;
    b.vx = b1.vx; b.onGround = b1.onGround; b.squash = b1.squash;
  });

  if (!ball.frozen) {
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 8) ball.trail.shift();
  } else {
    ball.trail.length = 0;
  }
}

// ---------- HUD et écrans du mode en ligne ----------
function drawNetHUD() {
  if (pingMs >= 0) {
    const p = Math.round(pingMs);
    const col = p < 80 ? "#7ed957" : p < 150 ? "#ffb84d" : "#ff6b6b";
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(W - 70, 20, 5, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = "right";
    ctx.font = "700 14px " + (typeof UI !== "undefined" ? UI.sans : "sans-serif");
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(p + " ms", W - 14, 25);
  }
  ctx.textAlign = "right";
  ctx.font = "600 13px " + (typeof UI !== "undefined" ? UI.sans : "sans-serif");
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(netRole === "host" ? "Tu joues à gauche" : "Tu joues à droite", W - 14, 44);

  // Confirmation d'abandon hors match (lobby) : Échap ×2
  if (typeof quitArmed === "function" && quitArmed() &&
      state !== "serve" && state !== "play" && state !== "point") {
    ctx.textAlign = "center";
    ctx.font = "700 15px " + (typeof UI !== "undefined" ? UI.sans : "sans-serif");
    ctx.fillStyle = "#ffb84d";
    ctx.fillText("Encore Échap pour quitter", W / 2, 66);
  }

  // pause automatique si l'autre ne donne plus signe de vie
  const stale = netRole === "host"
    ? netFrozen
    : performance.now() - lastSnapTime > NET_TIMEOUT &&
      (state === "play" || state === "serve" || state === "point");
  if (stale) overlay("Connexion instable…", "La partie reprendra automatiquement");
}

// ---------- Partie rapide (matchmaker WS) ----------
const MM_BOT_MS = 15000;
let mmWs = null;
let mmQuickplay = false;
let mmStatus = "";           // waiting | hosting | matched | error
let mmStartedAt = 0;
let mmBotTimer = null;
let mmPendingGuestChar = null;
let mmHostReadySent = false;

function matchmakerUrl() {
  if (typeof window !== "undefined" && window.SOMMET_MM_URL) return String(window.SOMMET_MM_URL);
  try {
    const loc = typeof location !== "undefined" ? location : null;
    if (!loc || !loc.host) return "ws://127.0.0.1:8787/mm";
    const proto = loc.protocol === "https:" ? "wss:" : "ws:";
    return proto + "//" + loc.host + "/mm";
  } catch (e) {
    return "ws://127.0.0.1:8787/mm";
  }
}

function quickplayModeKey() {
  if (pendingMode && pendingMode.flame) return "flame";
  if (pendingMode && pendingMode.bomb) return "bomb";
  return "classic";
}

function mmCloseSocketOnly() {
  if (mmBotTimer) { clearTimeout(mmBotTimer); mmBotTimer = null; }
  if (mmWs) {
    try { mmWs.onclose = null; mmWs.onerror = null; mmWs.onmessage = null; } catch (e) {}
    try { mmWs.close(); } catch (e) {}
    mmWs = null;
  }
}

function mmSend(msg) {
  if (mmWs && mmWs.readyState === 1) {
    try { mmWs.send(JSON.stringify(msg)); } catch (e) { /* ignore */ }
  }
}

function cancelQuickplay() {
  mmSend({ t: "cancel" });
  mmCloseSocketOnly();
  mmQuickplay = false;
  mmStatus = "";
  mmHostReadySent = false;
  mmPendingGuestChar = null;
}

/** Démarre la recherche d'adversaire (pendingMode déjà posé : bomb/flame/online/quickplay). */
function startQuickplay() {
  cancelQuickplay();
  netLogClear();
  mmQuickplay = true;
  mmStatus = "waiting";
  mmStartedAt = performance.now();
  mmHostReadySent = false;
  mmPendingGuestChar = null;
  if (!pendingMode) pendingMode = {};
  pendingMode.online = true;
  pendingMode.quickplay = true;
  pendingMode.o2v2 = false;
  state = "matchmaking";
  navIdx = 0;

  const url = matchmakerUrl();
  netLog("MM connect", url);
  let ws;
  try { ws = new WebSocket(url); } catch (e) {
    netLog("MM WebSocket ctor fail", String(e && e.message || e));
    mmStatus = "error";
    scheduleQuickplayBot(1200);
    return;
  }
  mmWs = ws;
  ws.onopen = () => {
    netLog("MM open → hello");
    mmSend({ t: "hello", mode: quickplayModeKey() });
    mmBotTimer = setTimeout(() => {
      if (state === "matchmaking" && !netConnected) offerOrStartBotHint();
    }, MM_BOT_MS);
  };
  ws.onmessage = (ev) => {
    let m;
    try { m = JSON.parse(ev.data); } catch (e) { return; }
    if (!m || !m.t) return;
    netLog("MM << " + m.t, m.code ? { code: m.code } : undefined);
    if (m.t === "waiting") { mmStatus = "waiting"; return; }
    if (m.t === "host") {
      mmStatus = "hosting";
      initHostPeer();
      mmWaitPeerReadyThenReady();
      return;
    }
    if (m.t === "join" && m.code) {
      mmStatus = "matched";
      mmCloseSocketOnly();
      initGuestPeer(String(m.code).toUpperCase());
      state = "connecting";
      return;
    }
    if (m.t === "matched") {
      mmStatus = "matched";
      mmCloseSocketOnly(); // garde mmQuickplay=true pour le flux perso
      // host : reste jusqu'à netConnected → selectCharacter (checkBothOpen)
      return;
    }
    if (m.t === "timeout") {
      mmStatus = "error";
      scheduleQuickplayBot(400);
    }
  };
  ws.onerror = () => {
    netLog("MM error");
    if (state === "matchmaking") {
      mmStatus = "error";
      scheduleQuickplayBot(800);
    }
  };
  ws.onclose = () => {
    netLog("MM close");
    if (mmWs === ws) mmWs = null;
  };
}

function mmWaitPeerReadyThenReady() {
  const trySend = () => {
    if (!mmQuickplay) return;
    // peer peut être null le temps que TURN soit prêt (withIceReady)
    if (peerReady && peer && netCode && !mmHostReadySent) {
      mmHostReadySent = true;
      netLog("MM >> ready", netCode);
      mmSend({ t: "ready", code: netCode });
      return;
    }
    if (state === "matchmaking" || state === "hostWait") setTimeout(trySend, 50);
  };
  trySend();
}

function offerOrStartBotHint() {
  // L'UI affiche le bouton bot ; on ne force pas le lancement auto.
  mmStatus = mmStatus === "error" ? "error" : "bot_ready";
}

function scheduleQuickplayBot(delay) {
  if (mmBotTimer) clearTimeout(mmBotTimer);
  mmBotTimer = setTimeout(() => {
    if (state === "matchmaking") mmStatus = "error";
  }, delay | 0);
}

/** Quitte la file et lance une partie locale vs IA (même mode bombe/flamme). */
function startQuickplayBot() {
  const bomb = !!(pendingMode && pendingMode.bomb);
  const flame = !!(pendingMode && pendingMode.flame);
  const bombTimeSaved = (pendingMode && pendingMode.bombTime) || BOMB_TIME;
  cancelQuickplay();
  teardownNet();
  pendingMode = {
    vsAI: true, aiLevel: 1, mode2v2: false,
    bomb: bomb, flame: flame && !bomb, bombTime: bombTimeSaved
  };
  online = false;
  vsAI = true;
  aiLevel = 1;
  bombMode = bomb;
  bombTime = bombTimeSaved;
  flameMode = !!(flame && !bomb);
  mapEventsQuiet = false;
  setMode("1v1");
  if (typeof metaUseEquippedBall === "function") metaUseEquippedBall();
  blobL.charId = blobL.charId | 0;
  blobR.charId = randomCharacterIdx([blobL.charId]);
  terrain = (Math.random() * TERRAINS.length) | 0;
  newGame();
}

/** Après choix perso hôte en quickplay : terrain auto, attendre le guest. */
function quickplayHostAfterChar() {
  terrain = (Math.random() * TERRAINS.length) | 0;
  if (typeof metaUseEquippedBall === "function") metaUseEquippedBall();
  bombMode = !!(pendingMode && pendingMode.bomb);
  bombTime = (pendingMode && pendingMode.bombTime) || BOMB_TIME;
  flameMode = !!(pendingMode && pendingMode.flame) && !bombMode;
  sendRel({ t: "taken", a: [blobL.charId] });
  if (mmPendingGuestChar != null) {
    let a = clampCharacterIdx(mmPendingGuestChar);
    if (a === blobL.charId) a = randomCharacterIdx([blobL.charId]);
    blobR.charId = a;
    mmPendingGuestChar = null;
    hostStartMatch();
    return;
  }
  state = "hostWait";
}

// En-tête commun aux écrans en ligne (= menus cartoon + décor aléatoire).
// opts.noEscHint : quand l'écran dessine déjà son propre pied « Échap… ».
function netScreenBase(title, kicker, subtitle, opts) {
  menuScreenBase({
    title,
    kicker: kicker || "En ligne · WebRTC",
    subtitle,
    titleSize: title.length > 20 ? 34 : 42,
    noEscHint: !!(opts && opts.noEscHint)
  });
}

function drawOnlineMenu() {
  netScreenBase("En ligne", "Multijoueur · Partie rapide ou code",
                "WebRTC · matchmaking ou entre amis");
  const opts = [
    "1  —  Partie rapide",
    "2  —  Créer une partie",
    "3  —  Rejoindre avec un code"
  ];
  drawOptionList(opts, 210, 42);
  uiLabel("Partie rapide : 1v1 · bot si personne en ~15 s", UI.mx, H - 70, 10, UI.muted, 1);
}

function drawMatchmaking() {
  const sec = Math.max(0, ((performance.now() - mmStartedAt) / 1000) | 0);
  const modeLabel = pendingMode && pendingMode.flame ? "Ballon enflammé"
    : pendingMode && pendingMode.bomb ? "Bombe" : "Classique";
  netScreenBase("Partie rapide", "En ligne · " + modeLabel,
                "Recherche d'un adversaire…", { noEscHint: true });
  const mx = UI.mx;
  const dots = ".".repeat(1 + Math.floor(performance.now() / 400) % 3);
  let line = "Recherche" + dots + "  (" + sec + " s)";
  if (mmStatus === "hosting") line = "Salon créé — en attente d'un joueur" + dots;
  if (mmStatus === "matched") line = "Adversaire trouvé — connexion" + dots;
  if (mmStatus === "error") line = "Matchmaker injoignable — joue contre un bot ?";
  if (mmStatus === "bot_ready") line = "Toujours personne — lance un bot ou patiente.";
  ctx.textAlign = "left";
  ctx.fillStyle = UI.ink;
  ctx.font = "600 18px " + UI.sans;
  ctx.fillText(line, mx, 230);
  drawNetLogPanel(mx, 250, W - mx * 2);

  const showBot = mmStatus === "bot_ready" || mmStatus === "error" || sec >= 15;
  if (showBot) {
    hit(W / 2, 360, 280, 40, "MmBot");
    const sel = (typeof padConnected !== "undefined" && padConnected && navIdx === 0) ||
      (typeof isHover === "function" && isHover("MmBot"));
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(W / 2 - 140, 340, 280, 40, 12); else ctx.rect(W / 2 - 140, 340, 280, 40);
    ctx.fillStyle = sel ? "rgba(255,216,74,0.95)" : "rgba(255,246,232,0.92)";
    ctx.fill();
    ctx.strokeStyle = UI.stroke; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = UI.stroke;
    ctx.font = "700 16px " + UI.sans;
    ctx.fillText("Jouer contre un bot", W / 2, 366);
  }
  hit(mx + 70, H - 28, 160, 28, "MmCancel");
  uiLabel("Échap — Annuler  ·  logs [SV-NET] aussi en console (F12)", mx, H - 20, 11, UI.muted, 0.3);
}

// gros code de partie, calé à gauche sous l'en-tête
function drawHostCode(size, y) {
  uiLabel("Code de la partie", UI.mx, y - 30, 11, UI.muted, 2);
  ctx.textAlign = "left"; ctx.fillStyle = UI.gold;
  ctx.font = "700 " + size + "px " + UI.mono;
  ctx.fillText(peerReady ? netCode.split("").join(" ") : "· · · · ·", UI.mx, y);
}

function drawHostWait() {
  netScreenBase("Partie 1v1 en ligne", "En ligne · Hôte · Tu joues à gauche");
  drawHostCode(52, 230);
  const dots = ".".repeat(1 + Math.floor(performance.now() / 400) % 3);
  ctx.textAlign = "left"; ctx.fillStyle = UI.ink; ctx.font = "500 16px " + UI.sans;
  ctx.fillText(
    netConnected ? "Joueur connecté ! Il choisit son personnage" + dots
    : peerReady  ? "En attente d'un joueur — envoie-lui ce code"
    :              "Création de la partie" + dots,
    UI.mx, 268);
  drawNetLogPanel(UI.mx, 290, W - UI.mx * 2);
  uiLabel("F12 = console [SV-NET]  ·  Échap = annuler", UI.mx, H - 24, 11, UI.muted, 0.3);
}

function drawHostLobby() {
  netScreenBase("Partie 2v2 en ligne", "En ligne · Hôte · Salon");
  drawHostCode(44, 214);

  // 4 cartes de slots : 0 hôte + 1 coéquipier (gauche) ; 2 + 3 (droite)
  const occ = {}; for (const g of guests) occ[g.slot] = g;
  const labels = { 0: "Toi (hôte)", 1: "Coéquipier", 2: "Adversaire", 3: "Adversaire" };
  const cols   = { 0: "#e84545", 1: "#ff8a3d", 2: "#4caf50", 3: "#3d8bff" };
  const cw = 172, gap = 14, x0 = UI.mx, y = 250, ch = 88;
  ctx.textAlign = "left";
  [0, 1, 2, 3].forEach((s, i) => {
    const x = x0 + i * (cw + gap);
    const g = occ[s];
    const human = s === 0 || !!g;
    ctx.fillStyle = "rgba(10,12,18,0.42)";
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 8); ctx.fill(); }
    else ctx.fillRect(x, y, cw, ch);
    ctx.fillStyle = cols[s]; ctx.fillRect(x, y, 4, ch); // liseré d'équipe à gauche
    uiLabel(i < 2 ? "Équipe gauche" : "Équipe droite", x + 16, y + 22, 9, UI.muted, 1);
    ctx.fillStyle = cols[s]; ctx.font = "700 17px " + UI.sans; ctx.textAlign = "left";
    ctx.fillText(labels[s], x + 16, y + 46);
    ctx.fillStyle = human ? UI.ink : UI.muted; ctx.font = "500 14px " + UI.sans;
    ctx.fillText(s === 0 ? "prêt" : g ? (g.ready ? "connecté — prêt" : "connecté…") : "IA (place libre)", x + 16, y + 68);
  });

  const n = guests.length;
  const dots = ".".repeat(1 + Math.floor(performance.now() / 400) % 3);
  if (n >= 1) hit(W / 2, 372, W - UI.mx * 2, 32, "Enter"); // clic = lancer la partie (comme Entrée)
  ctx.textAlign = "left"; ctx.fillStyle = UI.ink; ctx.font = "500 18px " + UI.sans;
  ctx.fillText(n === 0
    ? "En attente de joueurs — envoie le code (jusqu'à 3)" + dots
    : n + (n > 1 ? " joueurs connectés" : " joueur connecté") + "  ·  Entrée : lancer", UI.mx, 380);
  uiLabel("Places libres tenues par l'IA", UI.mx, H - 70, 10, UI.muted, 1);
}

function drawJoinEntry() {
  netScreenBase("Rejoindre une partie", "En ligne · Invité", "Saisis le code donné par l'hôte");
  const cw = 56, gap = 12, x0 = UI.mx, y = 220;
  for (let i = 0; i < CODE_LEN; i++) {
    const x = x0 + i * (cw + gap);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, cw, 66, 8); ctx.fill(); }
    else ctx.fillRect(x, y, cw, 66);
    ctx.strokeStyle = i === joinCode.length ? UI.gold : "rgba(255,255,255,0.28)";
    ctx.lineWidth = i === joinCode.length ? 2.5 : 1.5;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, cw, 66, 8); ctx.stroke(); }
    else ctx.strokeRect(x, y, cw, 66);
    if (joinCode[i]) {
      ctx.fillStyle = UI.gold; ctx.textAlign = "center";
      ctx.font = "700 40px " + UI.mono;
      ctx.fillText(joinCode[i], x + cw / 2, y + 46);
    }
  }
  ctx.textAlign = "left"; ctx.fillStyle = UI.ink; ctx.font = "500 17px " + UI.sans;
  ctx.fillText(joinCode.length === CODE_LEN
    ? "Entrée : se connecter"
    : "Lettres et chiffres · Retour arrière pour corriger", UI.mx, 328);
}

function drawNetScreen(title, sub) {
  netScreenBase(title, "En ligne · Connexion");
  const dots = ".".repeat(1 + Math.floor(performance.now() / 400) % 3);
  ctx.textAlign = "left"; ctx.fillStyle = UI.ink; ctx.font = "500 20px " + UI.sans;
  ctx.fillText(sub + dots, UI.mx, 220);
  drawNetLogPanel(UI.mx, 250, W - UI.mx * 2);
  uiLabel("F12 = console [SV-NET]", UI.mx, H - 24, 11, UI.muted, 0.3);
}

function drawNetError() {
  hit(W / 2, H / 2, W, H, "Enter"); // clic n'importe où = retour au menu
  netScreenBase("Oups", "En ligne · Erreur", null, { noEscHint: true });
  ctx.textAlign = "left"; ctx.fillStyle = "#ff8a8a"; ctx.font = "600 18px " + UI.sans;
  ctx.fillText(netErrorMsg, UI.mx, 210);
  // diagnostic technique (état des canaux/ICE) : à remonter tel quel si
  // le problème persiste — évite de deviner où ça bloque.
  if (netErrorDetail) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px " + UI.mono;
    const maxW = W - UI.mx * 2;
    const words = String(netErrorDetail).split(" ");
    let line = "", y = 238;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, UI.mx, y); y += 14; line = w;
      } else line = test;
    }
    if (line) { ctx.fillText(line, UI.mx, y); y += 18; }
    drawNetLogPanel(UI.mx, Math.min(y + 8, H - 160), maxW);
  } else {
    drawNetLogPanel(UI.mx, 250, W - UI.mx * 2);
  }
  // Un seul pied (évite le doublon avec menuScreenBase « Échap ← Retour »)
  uiLabel("Entrée / Échap — retour  ·  copie les lignes vertes / F12", UI.mx, H - 24, 11, UI.muted, 0.3);
}


