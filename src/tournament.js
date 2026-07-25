// sommet-volley · Mode Tournoi — tableau à 8, solo vs IA, élimination directe
"use strict";

// Bracket plat : 4 quarts (0–3) + 2 demis (4–5) + 1 finale (6).
// Le joueur est toujours `a` du quart 0.
const TOURNEY_QF = 4;
const TOURNEY_SF0 = 4;
const TOURNEY_SF1 = 5;
const TOURNEY_FINAL = 6;
const TOURNEY_N = 7;

let tournamentActive = false;
let tournamentInMatch = false;
let tournament = null; // { playerChar, aiBase, seed, matches[] }

function tournamentGetFlags() {
  return { active: tournamentActive, inMatch: tournamentInMatch };
}

function tournamentReset() {
  tournamentActive = false;
  tournamentInMatch = false;
  tournament = null;
}

function tournamentCharStrength(charId) {
  const c = CHARACTERS[charId | 0];
  if (!c) return 1;
  const st = c.stats || {};
  return 0.8 + (st.puissance || 3) * 0.12 + (st.controle || 3) * 0.1 +
    (st.vitesse || 3) * 0.08 + (st.detente || 3) * 0.06;
}

function tournamentRoundOfMatch(mi) {
  if (mi < TOURNEY_QF) return 0;
  if (mi < TOURNEY_FINAL) return 1;
  return 2;
}

function tournamentRoundLabel(r) {
  return r === 0 ? "Quarts de finale" : r === 1 ? "Demi-finales" : "Finale";
}

function tournamentParent(mi) {
  if (mi < TOURNEY_QF) return TOURNEY_SF0 + Math.floor(mi / 2);
  if (mi < TOURNEY_FINAL) return TOURNEY_FINAL;
  return -1;
}

function tournamentChildSlot(mi) {
  if (mi < TOURNEY_QF) return mi % 2;
  if (mi < TOURNEY_FINAL) return mi - TOURNEY_SF0;
  return 0;
}

function tournamentAiLevelForMatch(mi) {
  const base = tournament ? (tournament.aiBase | 0) : 0;
  return Math.min(3, base + tournamentRoundOfMatch(mi));
}

/** Ouvre le flux : difficulté → perso (flag pendingMode.tournament). */
function tournamentOpen() {
  pendingMode = { vsAI: true, tournament: true, mode2v2: false, bomb: false, flame: false };
  state = "aiDifficulty";
  navIdx = 0;
}

/**
 * Après choix du perso joueur : construit le tableau, simule les quarts IA,
 * affiche le bracket.
 */
function tournamentBeginAfterChar() {
  const playerChar = blobL.charId | 0;
  const aiBase = (pendingMode && pendingMode.aiLevel != null) ? (pendingMode.aiLevel | 0) : 1;
  const seed = (Math.random() * 2 ** 31) | 0;
  tournamentBuildBracket(playerChar, aiBase, seed);
  tournamentSimPendingAi();
  tournamentActive = true;
  tournamentInMatch = false;
  online = false;
  tutorialMode = false;
  if (typeof storyActive !== "undefined") { storyActive = false; storyInMatch = false; }
  state = "tournamentBracket";
  navIdx = 0;
}

function tournamentBuildBracket(playerCharId, aiBase, seed) {
  setSeed(seed | 0);
  const playerChar = playerCharId | 0;
  const pool = characterIndices().filter(i => i !== playerChar);
  // Mélange déterministe (Fisher–Yates via rng())
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
  }
  const rivals = pool.slice(0, 7);
  while (rivals.length < 7) {
    rivals.push(characterIndices().find(i => i !== playerChar && !rivals.includes(i)) | 0);
  }
  // Quarts : [joueur vs r0], [r1 vs r2], [r3 vs r4], [r5 vs r6]
  const seeds = [playerChar, rivals[0], rivals[1], rivals[2], rivals[3], rivals[4], rivals[5], rivals[6]];
  const matches = [];
  for (let i = 0; i < TOURNEY_N; i++) {
    matches.push({
      a: i < TOURNEY_QF ? seeds[i * 2] : null,
      b: i < TOURNEY_QF ? seeds[i * 2 + 1] : null,
      winner: null,
      scoreA: 0,
      scoreB: 0,
      played: false
    });
  }
  tournament = {
    playerChar,
    aiBase: aiBase | 0,
    seed: seed | 0,
    matches
  };
  tournamentActive = true;
  tournamentInMatch = false;
  return tournament;
}

function tournamentIsPlayerMatch(m) {
  if (!m || !tournament) return false;
  return m.a === tournament.playerChar || m.b === tournament.playerChar;
}

/** Premier match non joué impliquant le joueur (et dont a/b sont connus). */
function tournamentPlayerMatchIndex() {
  if (!tournament) return -1;
  for (let i = 0; i < TOURNEY_N; i++) {
    const m = tournament.matches[i];
    if (m.played) continue;
    if (m.a == null || m.b == null) continue;
    if (tournamentIsPlayerMatch(m)) return i;
  }
  return -1;
}

function tournamentSimOne(charA, charB) {
  const wa = tournamentCharStrength(charA);
  const wb = tournamentCharStrength(charB);
  const pA = wa / (wa + wb);
  const winner = rng() < pA ? charA : charB;
  const winNeed = typeof TOURNAMENT_WIN_SCORE !== "undefined" ? TOURNAMENT_WIN_SCORE : 7;
  const loseScore = Math.floor(rng() * Math.max(1, winNeed - 1));
  return {
    winner,
    scoreA: winner === charA ? winNeed : loseScore,
    scoreB: winner === charB ? winNeed : loseScore
  };
}

function tournamentApplyResult(mi, winner, scoreA, scoreB) {
  const m = tournament.matches[mi];
  m.winner = winner;
  m.scoreA = scoreA | 0;
  m.scoreB = scoreB | 0;
  m.played = true;
  const p = tournamentParent(mi);
  if (p >= 0) {
    const slot = tournamentChildSlot(mi);
    if (slot === 0) tournament.matches[p].a = winner;
    else tournament.matches[p].b = winner;
  }
}

/** Simule tous les matchs IA prêts (a/b connus, pas le joueur, non joués). */
function tournamentSimPendingAi() {
  if (!tournament) return;
  let guard = 0;
  let progressed = true;
  while (progressed && guard++ < 16) {
    progressed = false;
    for (let i = 0; i < TOURNEY_N; i++) {
      const m = tournament.matches[i];
      if (m.played || m.a == null || m.b == null) continue;
      if (tournamentIsPlayerMatch(m)) continue;
      const r = tournamentSimOne(m.a, m.b);
      tournamentApplyResult(i, r.winner, r.scoreA, r.scoreB);
      progressed = true;
    }
  }
}

function tournamentStartNextMatch() {
  if (!tournament) return false;
  const mi = tournamentPlayerMatchIndex();
  if (mi < 0) return false;
  const m = tournament.matches[mi];
  const rival = m.a === tournament.playerChar ? m.b : m.a;
  online = false;
  vsAI = true;
  tutorialMode = false;
  bombMode = false;
  flameMode = false;
  mapEventsQuiet = false;
  paused = false;
  aiLevel = tournamentAiLevelForMatch(mi);
  setMode("1v1");
  blobL.charId = tournament.playerChar;
  blobR.charId = rival;
  blobL.doped = false;
  blobR.doped = false;
  // Terrain = map du rival si possible
  let tIdx = TERRAINS.findIndex(t => t.character === rival);
  if (tIdx < 0) tIdx = rival % TERRAINS.length;
  terrain = tIdx;
  ballSkin = 0;
  tournamentInMatch = true;
  tournament._matchIndex = mi;
  newGame();
  return true;
}

function tournamentOnMatchEnd() {
  if (!tournament || !tournamentInMatch) return;
  const mi = tournament._matchIndex | 0;
  const m = tournament.matches[mi];
  const playerWon = scores[0] > scores[1];
  const winner = playerWon ? tournament.playerChar
    : (m.a === tournament.playerChar ? m.b : m.a);
  tournamentApplyResult(mi, winner, scores[0] | 0, scores[1] | 0);
  tournamentInMatch = false;
  tournamentSimPendingAi();

  if (!playerWon) {
    // Éliminé — simuler le reste pour afficher le champion éventuel
    tournamentSimPendingAi();
    // Forcer la simu même des matchs futurs en remplissant via boucle
    for (let k = 0; k < 8; k++) tournamentSimPendingAi();
    state = "tournamentEnding";
    tournament._eliminated = true;
    return;
  }
  if (mi === TOURNEY_FINAL) {
    state = "tournamentEnding";
    tournament._eliminated = false;
    return;
  }
  state = "tournamentBracket";
}

function tournamentLeave() {
  tournamentReset();
  state = "soloMenu";
  navIdx = 0;
}

function tournamentChampion() {
  if (!tournament) return null;
  const fin = tournament.matches[TOURNEY_FINAL];
  return fin.played ? fin.winner : null;
}

function tournamentHandleKeys(code) {
  if (state === "tournamentBracket") {
    if (code === "Enter" || code === "Space" || code === "KeyF" || code === "TourPlay") {
      tournamentStartNextMatch();
      return true;
    }
    if (code === "Escape" || code === "TourBack") {
      tournamentLeave();
      return true;
    }
    return true;
  }
  if (state === "tournamentEnding") {
    if (code === "Enter" || code === "Space" || code === "Escape" || code === "TourBack") {
      tournamentLeave();
      return true;
    }
    return true;
  }
  return false;
}

function tournamentHandleClickCode(code) {
  if (typeof code !== "string" || code.indexOf("Tour") !== 0) return false;
  return tournamentHandleKeys(code);
}

function tournamentDrawPortrait(charId, cx, cy, s) {
  const key = CHARACTERS[charId] && CHARACTERS[charId].key;
  if (key && typeof storyDrawPortrait === "function") {
    storyDrawPortrait(key, cx, cy, s, s, {});
    return;
  }
  const c = CHARACTERS[charId];
  ctx.save();
  ctx.fillStyle = (c && c.color) || "#888";
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = UI.stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = "800 " + Math.max(10, (s * 0.4) | 0) + "px " + UI.display;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((c ? c.name : "?").charAt(0), cx, cy + 1);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function tournamentMatchTitle(mi) {
  if (mi < TOURNEY_QF) return "1/4";
  if (mi < TOURNEY_FINAL) return "1/2";
  return "Finale";
}

function drawTournamentBracket() {
  menuScreenBase({
    title: "TOURNOI DU SOMMET",
    kicker: "Élimination directe · 8 dirigeants",
    titleSize: 42,
    noEscHint: true
  });
  const mx = UI.mx;
  if (!tournament) {
    uiLabel("Aucun tournoi en cours.", mx, 180, 14, UI.muted, 0.3);
    return;
  }
  const pmi = tournamentPlayerMatchIndex();
  const round = pmi >= 0 ? tournamentRoundOfMatch(pmi) : 2;
  uiLabel(tournamentRoundLabel(round) + "  ·  Premier à " +
    (typeof TOURNAMENT_WIN_SCORE !== "undefined" ? TOURNAMENT_WIN_SCORE : 7) +
    "  ·  IA : " + (AI_LEVELS[tournamentAiLevelForMatch(pmi >= 0 ? pmi : 0)] || {}).name,
    mx, 172, 13, UI.muted, 0.3);

  // Colonnes : quarts | demis | finale
  const colX = [mx + 20, W * 0.42, W * 0.72];
  const rowH = 52;
  const top0 = 198;
  const positions = [
    // QF 0..3
    { mi: 0, x: colX[0], y: top0 },
    { mi: 1, x: colX[0], y: top0 + rowH * 2 },
    { mi: 2, x: colX[0], y: top0 + rowH * 4 },
    { mi: 3, x: colX[0], y: top0 + rowH * 6 },
    // SF
    { mi: 4, x: colX[1], y: top0 + rowH },
    { mi: 5, x: colX[1], y: top0 + rowH * 5 },
    // Final
    { mi: 6, x: colX[2], y: top0 + rowH * 3 }
  ];

  for (const pos of positions) {
    const m = tournament.matches[pos.mi];
    const isNext = pos.mi === pmi;
    const bw = 200, bh = 44;
    const rx = pos.x, ry = pos.y;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(rx, ry, bw, bh, 10); else ctx.rect(rx, ry, bw, bh);
    ctx.fillStyle = isNext ? "rgba(255,216,74,0.92)" : "rgba(12,20,42,0.72)";
    ctx.fill();
    if (isNext) { ctx.strokeStyle = UI.stroke; ctx.lineWidth = 2.5; ctx.stroke(); }

    const ink = isNext ? UI.stroke : UI.ink;
    // portraits
    if (m.a != null) tournamentDrawPortrait(m.a, rx + 22, ry + bh / 2, 34);
    if (m.b != null) tournamentDrawPortrait(m.b, rx + bw - 22, ry + bh / 2, 34);

    ctx.textAlign = "center";
    ctx.fillStyle = ink;
    ctx.font = "700 11px " + UI.mono;
    ctx.fillText(tournamentMatchTitle(pos.mi), rx + bw / 2, ry + 14);
    ctx.font = "800 12px " + UI.sans;
    const nameA = m.a != null ? CHARACTERS[m.a].name : "…";
    const nameB = m.b != null ? CHARACTERS[m.b].name : "…";
    const short = (n) => (n.length > 12 ? n.slice(0, 11) + "…" : n);
    if (m.played) {
      ctx.fillStyle = isNext ? UI.stroke : UI.gold;
      ctx.fillText(m.scoreA + " – " + m.scoreB, rx + bw / 2, ry + 32);
    } else {
      ctx.fillStyle = isNext ? "rgba(27,23,48,0.75)" : UI.muted;
      ctx.font = "600 10px " + UI.sans;
      ctx.fillText(short(nameA) + " vs " + short(nameB), rx + bw / 2, ry + 32);
    }
    // Couronne sur le vainqueur
    if (m.played && m.winner != null) {
      const wx = m.winner === m.a ? rx + 22 : rx + bw - 22;
      ctx.fillStyle = UI.gold;
      ctx.font = "14px " + UI.sans;
      ctx.fillText("★", wx, ry + 8);
    }
  }

  hit(W / 2, H - 36, 280, 36, "TourPlay");
  hit(mx + 50, H - 26, 140, 28, "TourBack");
  const canPlay = pmi >= 0;
  uiLabel(canPlay
    ? (padConnected ? "A / Entrée — Jouer le match  ·  Échap abandonner" : "Entrée — Jouer le match  ·  Échap abandonner")
    : "Échap ← Menu",
    mx, H - 20, 12, canPlay ? UI.gold : UI.muted, 0.3);
}

function drawTournamentEnding() {
  const champ = tournamentChampion();
  const eliminated = !!(tournament && tournament._eliminated);
  const playerChar = tournament ? tournament.playerChar : 0;
  const won = !eliminated && champ === playerChar;
  menuScreenBase({
    title: won ? "CHAMPION !" : "ÉLIMINÉ",
    kicker: "Tournoi du Sommet",
    titleSize: 48,
    noEscHint: true
  });
  const mx = UI.mx;
  if (won) {
    uiLabel("Tu remportes le Tournoi du Sommet.", mx, 180, 16, UI.gold, 0.3);
  } else {
    uiLabel("La route s'arrête ici — pour cette fois.", mx, 180, 16, UI.muted, 0.3);
  }
  if (champ != null) {
    tournamentDrawPortrait(champ, W / 2, 280, 120);
    ctx.textAlign = "center";
    ctx.fillStyle = UI.ink;
    ctx.font = "800 22px " + UI.sans;
    ctx.fillText(CHARACTERS[champ].name, W / 2, 360);
    ctx.font = "600 14px " + UI.sans;
    ctx.fillStyle = UI.muted;
    ctx.fillText(won ? "Couronne du filet" : "Vainqueur du tournoi", W / 2, 386);
  }
  hit(W / 2, H - 36, 200, 36, "TourBack");
  uiLabel("Entrée / Échap — Menu", mx, H - 20, 12, UI.muted, 0.3);
}
