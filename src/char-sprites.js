// sommet-volley · sprites personnages (manifest générique)
"use strict";

// SPRITES.chars[key][anim] = Image[]  (chargé depuis assets/<key>/)
if (!SPRITES.chars) SPRITES.chars = {};

const CHAR_ANIM_DEFAULTS = {
  // walk: 4 — cycle appui / passage / appui / passage (packs walk_0..3).
  idle_face: 1, idle: 2, walk: 4, jump: 3, receive: 2, aim: 2,
  smash: 3, super: 4, panic: 2, victory: 2, defeat: 2
};

function charManifestPath(key) {
  return "assets/" + key + "/manifest.json";
}

function charFramePath(key, anim, n) {
  return "assets/" + key + "/" + anim + "_" + n + ".png";
}

function loadCharSprites(key, manifest) {
  const anims = (manifest && manifest.anims) || CHAR_ANIM_DEFAULTS;
  const pack = { manifest: manifest || { baseH: CHAR_BASE_H, footPad: 2 }, frames: {} };
  for (const anim of Object.keys(anims)) {
    const n = anims[anim] | 0;
    pack.frames[anim] = [];
    for (let i = 0; i < n; i++) {
      pack.frames[anim].push(loadSprite(charFramePath(key, anim, i)));
    }
  }
  SPRITES.chars[key] = pack;
  return pack;
}

function loadCharManifest(key) {
  // Navigateur : fetch async. Tests headless : pas de sprites → fallback canvas.
  if (typeof fetch !== "function") {
    loadCharSprites(key, null);
    return;
  }
  fetch(charManifestPath(key))
    .then(r => (r.ok ? r.json() : null))
    .then(m => { loadCharSprites(key, m); })
    .catch(() => { loadCharSprites(key, null); });
}

function initCharSprites() {
  for (const a of CHARACTERS) {
    if (a.hidden) continue;
    loadCharManifest(a.key);
  }
}

function charPack(key) {
  return SPRITES.chars[key] || null;
}

function charAnimReady(key, anim) {
  const p = charPack(key);
  if (!p || !p.frames[anim] || !p.frames[anim].length) return false;
  return p.frames[anim].every(spriteReady);
}

function charAnyReady(key) {
  const p = charPack(key);
  if (!p) return false;
  for (const anim of Object.keys(p.frames)) {
    if (charAnimReady(key, anim)) return true;
  }
  return false;
}

/** Pose sprite courte (smash / panic / receive). Pose posée même sans PNG
 *  (tests headless / net) — le rendu ignore si l'anim n'est pas chargée. */
function setCharPose(blob, anim, dur) {
  if (!blob || !anim) return;
  blob.poseAnim = anim;
  blob.poseDur = dur | 0;
  blob.poseT = dur | 0;
}

/** Balle qui tombe sur le joueur → panique (réactif, sans timer). */
function charWantPanic(b) {
  if (typeof ball === "undefined" || ball.frozen || ball.popped || ball.inHands) return false;
  if (!b.onGround) return false;
  const d = Math.hypot(ball.x - b.x, ball.y - (b.y - 48));
  // proche + chute rapide + légèrement en approche horizontale
  return d < 100 && ball.vy > 3.2 && Math.abs(ball.x - b.x) < 70;
}

/** Choisit l'anim selon l'état physique (commun à tous les sprités). */
function charPickAnim(b) {
  const key = charOf(b).key;

  // Décor de menu : uniquement marche (sol) ou saut (air) — pas de slip / idle en glisse.
  if (b._menuActor) {
    if (!b.onGround && charAnimReady(key, "jump")) return "jump";
    if (b.onGround && charAnimReady(key, "walk")) return "walk";
    if (charAnimReady(key, "idle")) return "idle";
    if (charAnimReady(key, "idle_face")) return "idle_face";
    return null;
  }

  // Fin de point / match : célébration ou défaite — seulement au sol
  // (sinon le perso « s'assoit » en l'air pendant la chute).
  if ((state === "point" || state === "gameover") && b.onGround) {
    const won = state === "gameover"
      ? scores[b.side] > scores[1 - b.side]
      : b.side === servingSide; // servingSide = marqueur du point
    if (won && charAnimReady(key, "victory")) return "victory";
    if (!won && charAnimReady(key, "defeat")) return "defeat";
  }
  if ((state === "point" || state === "gameover") && !b.onGround &&
      charAnimReady(key, "jump")) {
    return "jump";
  }

  // Pose forcée (smash aérien, panique one-shot…)
  if (b.poseT > 0 && b.poseAnim && charAnimReady(key, b.poseAnim)) return b.poseAnim;

  // Service : pose réception tant que la balle est en mains
  if (typeof ball !== "undefined" && ball.inHands && ball.frozen &&
      typeof servingSide !== "undefined" && b.side === servingSide &&
      charAnimReady(key, "receive")) {
    return "receive";
  }

  const held = typeof ball !== "undefined" && ball.heldBy >= 0 &&
    activeBlobs[ball.heldBy] === b;
  if (b.superT > 0 && charAnimReady(key, "super")) return "super";
  if (!b.onGround && charAnimReady(key, "jump")) return "jump";
  if (held && charAnimReady(key, "aim")) return "aim";
  if (typeof ball !== "undefined" && !ball.frozen && !ball.inHands &&
      Math.hypot(ball.x - b.x, ball.y - (b.y - 64)) < RECEIVE_R + 10 &&
      charAnimReady(key, "receive")) {
    return "receive";
  }
  if (charWantPanic(b) && charAnimReady(key, "panic")) return "panic";
  // Marche avec hystérésis collante — évite idle↔walk qui clignote.
  const a = charOf(b);
  const disp = (a.slip && typeof b.dispVx === "number") ? b.dispVx : (b.vx || 0);
  const spd = Math.max(Math.abs(disp), a.slip ? Math.abs(b.vx || 0) * 0.85 : 0);
  const enter = a.slip ? 0.30 : 0.55;
  const exit = a.slip ? 0.06 : 0.15;
  if (b._walking) {
    if (spd < exit) b._walking = false;
  } else if (spd > enter) {
    b._walking = true;
  }
  if (b._walking && charAnimReady(key, "walk")) return "walk";
  if (charAnimReady(key, "idle")) return "idle";
  if (charAnimReady(key, "idle_face")) return "idle_face";
  return null;
}

function charPickFrame(b, anim) {
  const key = charOf(b).key;
  const frames = charPack(key).frames[anim];
  if (!frames || !frames.length) return null;
  let idx = 0;
  if (anim === "walk") {
    // walkPhase entier — cycle 4 frames : appui / passage / appui / passage
    idx = Math.floor(Math.abs(b.walkPhase || 0)) % frames.length;
  } else if (anim === "jump") {
    if (b.vy < -2) idx = 0;
    else if (b.vy > 2) idx = Math.min(2, frames.length - 1);
    else idx = Math.min(1, frames.length - 1);
  } else if (anim === "super") {
    const dur = SUPER_DUR[key] || 60;
    idx = Math.min(frames.length - 1, Math.floor((1 - (b.superT || 0) / dur) * frames.length));
  } else if (anim === "smash" || anim === "panic") {
    // déroule les frames sur la durée de la pose (sinon cycle rapide)
    if (b.poseT > 0 && b.poseDur > 0 && b.poseAnim === anim) {
      const progress = 1 - b.poseT / b.poseDur;
      idx = Math.min(frames.length - 1, Math.floor(progress * frames.length));
    } else {
      idx = Math.floor((tick || 0) / 8) % frames.length;
    }
  } else if (anim === "victory" || anim === "defeat") {
    // celebT avance pendant point/fin (tick de simu est figé)
    const ct = typeof celebT === "number" ? celebT : (tick || 0);
    idx = Math.floor(ct / 28) % frames.length;
  } else if (anim === "receive" && typeof ball !== "undefined" &&
             ball.inHands && ball.frozen) {
    // Service : pose stable (sinon receive_0/1 alterne et la balle décroche)
    idx = 0;
  } else if (frames.length > 1) {
    idx = Math.floor((tick || 0) / 20) % frames.length;
  }
  return frames[idx];
}

/** Orientation : suit le déplacement, sinon face à l'adversaire. */
function charFaceRight(b) {
  // Aperçus menu : toujours orientés vers le centre du terrain
  if (b.groundY != null) return b.side === 0;
  // Acteurs décor menu : direction de marche explicite (ignore slip)
  if (b._menuActor) {
    if (b._faceRight !== undefined) return !!b._faceRight;
    return (b.vx || b.dispVx || 0) >= 0;
  }
  const a = charOf(b);
  const mv = (a && a.slip && typeof b.dispVx === "number") ? b.dispVx : (b.vx || 0);
  if (b._faceRight === undefined) b._faceRight = b.side === 0;
  // Verrou anti-tourniquet (IA qui oscille gauche/droite)
  if (b._faceLock > 0) {
    b._faceLock--;
    return !!b._faceRight;
  }
  // Quasi à l'arrêt → face adversaire ; sinon seulement si déplacement franc
  let want;
  if (Math.abs(mv) < 0.45) want = b.side === 0;
  else if (mv > 1.0) want = true;
  else if (mv < -1.0) want = false;
  else want = b._faceRight;
  if (want !== b._faceRight) {
    b._faceRight = want;
    b._faceLock = 20; // ~1/3 s sans re-flip
  }
  return !!b._faceRight;
}

/** Rendu générique. true si dessiné, false → fallback canvas. */
function drawSpriteChar(b) {
  const key = charOf(b).key;
  if (!charAnyReady(key)) return false;
  const anim = charPickAnim(b);
  if (!anim) return false;
  const img = charPickFrame(b, anim);
  if (!spriteReady(img)) return false;

  const pack = charPack(key);
  const baseH = (pack.manifest && pack.manifest.baseH) || CHAR_BASE_H;
  const footPad = (pack.manifest && pack.manifest.footPad) || 2;
  const scaleX = (pack.manifest && pack.manifest.scaleX) || 1;
  // Menus : groundY forcé. En jeu : ancrer aux pieds via b.y (sinon collé au sol).
  const footY = b.groundY != null ? b.groundY : b.y;
  const faceRight = charFaceRight(b);
  const h = baseH * (b.squash > 0 ? 1 - b.squash * 0.02 : 1);
  // Largeur stable (évite le « pulse » quand les PNG walk ont des largeurs différentes)
  const lockAsp = pack.manifest && pack.manifest.lockAspect;
  const aspect = lockAsp || (img.naturalWidth / img.naturalHeight);
  const w = h * aspect * scaleX;

  ctx.save();
  ctx.translate(b.x, footY);
  if (!faceRight) ctx.scale(-1, 1);
  const natW = h * (img.naturalWidth / img.naturalHeight) * scaleX;
  const ox = -w / 2 + (w - natW) / 2;
  ctx.drawImage(img, ox, -h + footPad, natW, h);
  ctx.restore();
  return true;
}

// Menus : préfère idle_face si dispo
function drawSpriteCharMenu(b) {
  const key = charOf(b).key;
  if (charAnimReady(key, "idle_face")) {
    const img = charPack(key).frames.idle_face[0];
    if (spriteReady(img)) {
      const pack = charPack(key);
      const baseH = (pack.manifest && pack.manifest.baseH) || CHAR_BASE_H;
      const scaleX = (pack.manifest && pack.manifest.scaleX) || 1;
      const footY = b.groundY != null ? b.groundY : b.y;
      const h = baseH * 0.95;
      const w = h * (img.naturalWidth / img.naturalHeight) * scaleX;
      ctx.save();
      ctx.translate(b.x, footY);
      if (b.side !== 0) ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, -h + 2, w, h);
      ctx.restore();
      return true;
    }
  }
  return drawSpriteChar(b);
}

// initCharSprites() est appelé depuis state.js (après CHARACTERS).
