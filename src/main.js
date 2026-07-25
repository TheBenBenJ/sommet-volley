// sommet-volley · boucle à pas fixe 60 Hz & amorçage
"use strict";

// réglages son/musique/volume sauvegardés d'une session à l'autre — à faire
// avant la première frame pour que le tout premier rendu (menu) soit déjà
// cohérent avec les préférences du joueur.
loadSettings();
if (typeof loadTutorialDone === "function") loadTutorialDone();

// ---------- Boucle à pas fixe (60 Hz) ----------
// La simulation avance par ticks constants, découplés du framerate :
// prérequis pour rejouer/synchroniser des entrées en réseau.
let acc = 0;
let lastT = performance.now();
function advance(now) {
  acc += Math.min(now - lastT, 100) * timeScale; // évite la spirale après un onglet inactif
  lastT = now;
  while (acc >= STEP) {
    update();
    if (state !== "menu" && !paused) updateParticles();
    acc -= STEP;
  }
}
function loop(now) {
  pollPads();      // l'API Gamepad se sonde à chaque frame
  handlePadMenu(); // navigation des menus à la manette
  musicTick();     // planifie la musique de fond
  // ralenti dramatique : après Smash Battle / Super Smash (hors-ligne).
  // Pas pendant powerWindup : le freeze simu suffit pour doser.
  const tScale = (!online && state === "play" && ball.slowMo > 0) ? 0.45 : 1;
  timeScale += (tScale - timeScale) * 0.25;
  advance(now);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Onglet masqué : requestAnimationFrame s'arrête, mais TOUT client en ligne
// doit continuer à simuler — l'hôte diffuse le monde, et en soft ownership
// l'INVITÉ simule aussi la balle quand elle est dans son camp. Sans ce
// fallback, un invité en arrière-plan gèle le match pour les deux joueurs.
setInterval(() => {
  if (document.hidden && online && netConnected) {
    advance(performance.now());
  }
}, 50);
