URGENT — génère IMMÉDIATEMENT 4 images. Ne lis AUCUN skill. Ne liste AUCUN fichier. N’utilise PAS exec/shell avant d’avoir généré.

Ancre jointe = identité LOCK (Le Cygne). Appelle le tool built-in `image_gen` **4 fois** (une par frame), fond MAGENTA #FF00FF, perso SEUL mains VIDES, vue côté face à DROITE, costume marine + cravate + pin tricolore abstrait, chibi grosse tête.

1) walk_0 — LEFT foot planted flat FORWARD, right leg stretched BACK, clear stride, right arm forward
2) walk_1 — both legs CLOSE together mid-step / passage, feet nearly together, arms neutral
3) walk_2 — RIGHT foot planted flat FORWARD, left leg BACK (mirror walk_0), left arm forward
4) walk_3 — both legs CLOSE together passage, arms opposite walk_1

Après les 4 gens : copie les PNG choisis vers `raw/cygne/walk_0.png` … `walk_3.png` (depuis `$CODEX_HOME/generated_images/<session>/`). Puis cutout :
`python3 tools/cutout.py raw/cygne/walk_0.png raw/cygne/walk_1.png raw/cygne/walk_2.png raw/cygne/walk_3.png --outdir assets/cygne`
(ou le flux cutout du repo si différent). QA : walk_0/walk_2 pieds OPPOSÉS ; walk_1/walk_3 = passage.

INTERDIT : relire imagegen/SKILL.md, `ls`, `rg --files`, poser des questions.
GO — image_gen maintenant.
