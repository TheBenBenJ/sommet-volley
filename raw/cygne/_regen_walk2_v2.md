image_gen ×1 seulement. Ne lis rien d'autre.

Images jointes :
1) idle_1 = identité LOCK
2) walk_0 = pose INTERDITE à recopier (c’est l’appui actuel)

Mission : créer `walk_2.png` = foulée MIROIR de walk_0.

Dans walk_0 le pied d’appui AVANT est d’un côté.
Dans walk_2 le pied AVANT doit être l’AUTRE jambe — clairement visible.

Prompt image (copie tel quel) :
"Same character as reference 1, chibi navy suit, side view facing RIGHT, FULL BODY.
CRITICAL POSE: the FOOT CLOSEST TO THE RIGHT EDGE of the image is the RIGHT foot planted flat forward; the LEFT foot is far to the LEFT stretched behind.
Wide stride. Left arm forward. Empty hands. Solid MAGENTA #FF00FF background.
Do NOT copy reference 2 pose; invert the legs completely."

Puis cp → raw/cygne/walk_2.png et `python3 tools/cutout.py raw/cygne assets/cygne`.
