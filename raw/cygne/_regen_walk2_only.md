UNE seule image : `walk_2.png`. Appelle `image_gen` UNE fois immédiatement. Pas de skill, pas de ls.

Ancre jointe = identité LOCK.

Le bug : walk_0 a déjà le pied GAUCHE devant. walk_2 doit être l’OPPOSÉ EXACT.

POSE OBLIGATOIRE (écris ces mots dans le prompt image) :
"RIGHT FOOT PLANTED FLAT ON THE GROUND IN FRONT, LEFT LEG STRETCHED STRAIGHT BACK BEHIND THE BODY, clear long walking stride, left arm swung forward, right arm back, side view facing RIGHT"

INTERDIT : left foot forward, standing idle, legs together.

Fond MAGENTA #FF00FF, mains vides, même costume marine que l’ancre.

Ensuite :
cp …/generated…png raw/cygne/walk_2.png
python3 tools/cutout.py raw/cygne assets/cygne

QA : sur la planche, walk_0 = gauche devant, walk_2 = DROITE devant — visible sans ambiguïté.
GO.
