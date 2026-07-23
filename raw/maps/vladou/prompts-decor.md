# sommet-decor — Place Écarlate (`neige` → pack `vladou`)

Props : `net_post`, `flag`, `cannon` + `cannon_fire` (event idle/tir).
Style : joindre **`assets/maps/vladou/skyline.png`** à CHAQUE génération.
Thème : Bourassie — forteresse rouge, neige, bannières bleu/vert, hiver.
Steam-friendly : PAS de vrai drapeau / Saint-Basile / symbole religieux.

```bash
# raw ne contient QUE les props (pas skyline/far/thumb)
python3 tools/cutout.py raw/maps/vladou assets/maps/vladou
cp assets/maps/vladou/cannon.png assets/maps/vladou/cannon_0.png
cp assets/maps/vladou/cannon_fire.png assets/maps/vladou/cannon_1.png
sips --resampleWidth 640 assets/maps/vladou/skyline.png --out assets/maps/vladou/thumb.png
npm test
```

Aliases loader : `cannon`→`cannon_0.png`, `cannonFire`→`cannon_1.png`.
