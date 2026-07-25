# sommet-decor — Place Écarlate (`neige` → pack `volkoi`)

Props : `net_post`, `flag`, `cannon` + `cannon_fire` (event idle/tir).
Style : joindre **`assets/maps/place-ecarlate/skyline.png`** à CHAQUE génération.
Thème : Bourassie — forteresse rouge, neige, bannières bleu/vert, hiver.
Steam-friendly : PAS de vrai drapeau / Saint-Basile / symbole religieux.

```bash
# raw ne contient QUE les props (pas skyline/far/thumb)
python3 tools/cutout.py raw/maps/place-ecarlate assets/maps/place-ecarlate
cp assets/maps/place-ecarlate/cannon.png assets/maps/place-ecarlate/cannon_0.png
cp assets/maps/place-ecarlate/cannon_fire.png assets/maps/place-ecarlate/cannon_1.png
sips --resampleWidth 640 assets/maps/place-ecarlate/skyline.png --out assets/maps/place-ecarlate/thumb.png
npm test
```

Aliases loader : `cannon`→`cannon_0.png`, `cannonFire`→`cannon_1.png`.
