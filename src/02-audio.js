// sommet-volley · audio — sons, cris, musique de fond
"use strict";

// ---------- Audio (bips simples) ----------
let audioCtx = null;
// volume général (0..1, persisté — voir loadSettings/saveSettings dans
// 17-main.js) : tous les sons/la musique passent par ce gain unique, pour
// qu'un seul réglage contrôle tout au lieu de recalculer chaque volume.
let volume = 1;
let masterGain = null;
function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}
function setVolume(v) {
  volume = Math.max(0, Math.min(1, v));
  if (masterGain) masterGain.gain.value = volume;
  saveSettings();
}

// ---------- Réglages persistés (son/musique/volume) ----------
// Simple confort : sans ça, on repart à zéro (son ON, 100%) à chaque
// rechargement de page — `muted` est déclaré plus tard (04-state.js), mais
// ces fonctions ne s'exécutent qu'au runtime, une fois tous les modules
// chargés, donc la référence est sûre.
const SETTINGS_KEY = "sommetVolleySettings";
const SETTINGS_KEY_LEGACY = "crabbyVolleySettings";
function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ muted, musicOn, volume }));
  } catch (e) { /* navigation privée, quota dépassé… tant pis, pas bloquant */ }
}
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY) || localStorage.getItem(SETTINGS_KEY_LEGACY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (typeof s.muted === "boolean") muted = s.muted;
    if (typeof s.musicOn === "boolean") musicOn = s.musicOn;
    if (typeof s.volume === "number") volume = Math.max(0, Math.min(1, s.volume));
  } catch (e) { /* réglages corrompus/absents : on garde les valeurs par défaut */ }
}

// delay : départ différé (s) · freqEnd : glissando vers cette fréquence
function beep(freq, dur = 0.07, type = "square", vol = 0.12, delay = 0, freqEnd = 0) {
  if (muted || noFx) return;
  try {
    ensureAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const t0 = audioCtx.currentTime + delay;
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (freqEnd > 0) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(masterGain);
    o.start(t0); o.stop(t0 + dur);
  } catch (e) { /* audio non dispo */ }
}

/** Bruit blanc filtré (attaque courte). */
function noiseBurst(dur = 0.05, vol = 0.14, freq = 1200, q = 0.9, delay = 0) {
  if (muted || noFx) return;
  try {
    ensureAudio();
    const t0 = audioCtx.currentTime + delay;
    const n = Math.max(1, Math.floor(audioCtx.sampleRate * dur));
    const buf = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = audioCtx.createBufferSource(); src.buffer = buf;
    const f = audioCtx.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(Math.max(0.0001, vol), t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start(t0); src.stop(t0 + dur + 0.02);
  } catch (e) { /* audio non dispo */ }
}

/** Thump basse + slap peaux — réception / touche. */
function sfxBallHit() {
  if (muted || noFx) return;
  try {
    ensureAudio();
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + 0.16);
    noiseBurst(0.05, 0.12, 1000, 1.5);
  } catch (e) { /* audio non dispo */ }
}

/** Smash : crack + corps grave. */
function sfxBallSmash() {
  if (muted || noFx) return;
  try {
    ensureAudio();
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.18);
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + 0.28);
    noiseBurst(0.07, 0.2, 1800, 0.9);
    noiseBurst(0.04, 0.1, 3200, 1.2, 0.02);
  } catch (e) { /* audio non dispo */ }
}

function sfxBallWall() {
  if (muted || noFx) return;
  noiseBurst(0.04, 0.1, 2400, 1.4);
  beep(300, 0.05, "triangle", 0.07);
}

function sfxBallNet() {
  if (muted || noFx) return;
  noiseBurst(0.08, 0.09, 900, 2.2);
  beep(200, 0.06, "triangle", 0.06);
}

function sfxPoint(side) {
  if (muted || noFx) return;
  const f0 = side === 0 ? 660 : 550;
  beep(f0, 0.12, "sine", 0.14);
  beep(f0 * 1.25, 0.18, "triangle", 0.11, 0.08);
  beep(f0 * 1.5, 0.1, "sine", 0.07, 0.16);
}

function sfxMatchWin() {
  if (muted || noFx) return;
  beep(523, 0.12, "triangle", 0.12);
  beep(659, 0.12, "triangle", 0.12, 0.1);
  beep(784, 0.22, "triangle", 0.14, 0.2);
}

function sfxBattleStart() {
  if (muted || noFx) return;
  noiseBurst(0.06, 0.14, 2200, 1.1);
  beep(880, 0.1, "square", 0.12);
  beep(440, 0.22, "sawtooth", 0.08, 0.04);
}

function sfxBattleEnd() {
  if (muted || noFx) return;
  beep(180, 0.35, "sawtooth", 0.18);
  noiseBurst(0.12, 0.12, 400, 0.7);
}

function sfxBombTick() {
  if (muted || noFx) return;
  noiseBurst(0.03, 0.08, 2800, 2.5);
  beep(880, 0.04, "square", 0.07);
}

function sfxBombBlast() {
  if (muted || noFx) return;
  try {
    ensureAudio();
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(28, t + 0.45);
    g.gain.setValueAtTime(0.32, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + 0.58);
    noiseBurst(0.35, 0.22, 500, 0.5);
    noiseBurst(0.2, 0.12, 1600, 0.8, 0.04);
  } catch (e) { /* audio non dispo */ }
}

function sfxCannonWarn() {
  if (muted || noFx) return;
  beep(220, 0.14, "triangle", 0.11);
  beep(280, 0.2, "triangle", 0.09, 0.14);
}

function sfxCannonFire() {
  if (muted || noFx) return;
  try {
    ensureAudio();
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.35);
    g.gain.setValueAtTime(0.26, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + 0.48);
    noiseBurst(0.2, 0.16, 600, 0.6);
    beep(180, 0.12, "triangle", 0.07, 0.08);
  } catch (e) { /* audio non dispo */ }
}

function sfxCannonHit() {
  if (muted || noFx) return;
  noiseBurst(0.08, 0.16, 1400, 1.0);
  beep(320, 0.1, "triangle", 0.1);
  beep(180, 0.14, "sine", 0.08, 0.04);
}

// "ola" : foule plus pleine (deux bandes + grave).
function crowdCheer(intensity) {
  if (muted || noFx) return;
  try {
    ensureAudio();
    const dur = 0.9 + intensity * 0.5;
    const t0 = audioCtx.currentTime;
    const n = Math.floor(audioCtx.sampleRate * dur);
    const buf = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) {
      const env = Math.sin(Math.PI * (i / n));
      data[i] = (Math.random() * 2 - 1) * env * env;
    }
    const mk = (freq, q, vol, type) => {
      const src = audioCtx.createBufferSource(); src.buffer = buf;
      const f = audioCtx.createBiquadFilter();
      f.type = type || "bandpass"; f.frequency.value = freq; f.Q.value = q;
      const g = audioCtx.createGain(); g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(masterGain);
      src.start(t0);
    };
    const v = 0.04 + intensity * 0.06;
    mk(420, 0.45, v * 0.7);
    mk(780, 0.55, v);
    mk(160, 0.7, v * 0.55, "lowpass");
  } catch (e) { /* audio non dispo */ }
}

// ---------- Cris / SFX personnages à la frappe ----------
function animalHitSound(a, heavy) {
  if (!a) return;
  switch (a.key) {
    case "vladou":
      sfxVladouHit(!!heavy);
      break;
    case "trompette":
      beep(280, 0.08, "square", 0.12); beep(420, 0.1, "square", 0.1, 0.05);
      break;
    case "micron":
      beep(520, 0.07, "sine", 0.1); beep(660, 0.09, "sine", 0.08, 0.05);
      break;
    case "houn":
      beep(180, 0.08, "square", 0.12); beep(240, 0.1, "triangle", 0.1, 0.05);
      break;
    default:
      beep(240, 0.1, "triangle", 0.12);
      break;
  }
}

/** Effort grave Vladou (grunt synthé, pas de voix). */
function sfxVladouHit(heavy) {
  if (muted || noFx) return;
  try {
    ensureAudio();
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "sawtooth";
    const f0 = heavy ? 110 : 95;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(heavy ? 55 : 70, t + (heavy ? 0.22 : 0.14));
    g.gain.setValueAtTime(heavy ? 0.2 : 0.14, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (heavy ? 0.26 : 0.16));
    // léger filtre pour éviter le « buzz » cru
    const f = audioCtx.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = heavy ? 700 : 550;
    o.connect(f); f.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + 0.3);
    noiseBurst(heavy ? 0.08 : 0.05, heavy ? 0.1 : 0.06, 500, 0.8);
  } catch (e) { /* audio non dispo */ }
}

/** SUPER Hiver Général — souffle glacé + cuivre grave. */
function sfxVladouSuper() {
  if (muted || noFx) return;
  try {
    ensureAudio();
    const t = audioCtx.currentTime;
    noiseBurst(0.55, 0.14, 2400, 0.4);
    noiseBurst(0.7, 0.1, 900, 0.5, 0.05);
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(180, t + 0.08);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.55);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t + 0.8);
    beep(120, 0.28, "sawtooth", 0.12, 0.15, 60);
  } catch (e) { /* audio non dispo */ }
}

// ---------- Musique de fond (MP3 bouclé) ----------
// « The Mayor's Morning Parade » — marche / fanfare (Gemini). Toggle N, mute M.
let musicOn = true;
let musicEl = null;
let musicNode = null;
let musicGain = null;
const MUSIC_URL = "assets/audio/mayor-parade.mp3";
const MUSIC_GAIN = 0.32; // sous les SFX, assez présent pour la profondeur du mix

function ensureMusicEl() {
  if (musicEl) return musicEl;
  musicEl = new Audio(MUSIC_URL);
  musicEl.loop = true;
  musicEl.preload = "auto";
  musicEl.crossOrigin = "anonymous";
  return musicEl;
}

function ensureMusicGraph() {
  ensureAudio();
  ensureMusicEl();
  if (!musicGain) {
    musicGain = audioCtx.createGain();
    musicGain.gain.value = MUSIC_GAIN;
    musicGain.connect(masterGain);
  }
  // createMediaElementSource ne peut être appelé qu'une fois par élément
  if (!musicNode) {
    musicNode = audioCtx.createMediaElementSource(musicEl);
    musicNode.connect(musicGain);
  }
}

function musicTick() {
  try {
    ensureMusicGraph();
  } catch (e) { return; }
  const want = musicOn && !muted && state !== "netError" && audioCtx.state === "running";
  if (want) {
    if (musicEl.paused) musicEl.play().catch(() => { /* geste utilisateur requis */ });
  } else if (musicEl && !musicEl.paused) {
    musicEl.pause();
  }
}

