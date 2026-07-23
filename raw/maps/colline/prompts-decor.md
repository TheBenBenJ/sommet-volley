# sommet-decor — Citadelle du Levant (`colline`)

Props : `net_post`, `flag`, `falcon` (event).
Style : joindre **`~/Downloads/JOINDRE_colline_skyline.png`** à CHAQUE prompt Grok.
Thème : Levantie — grès pâle, dômes abstraits + tours de verre, remparts, palmiers, midi dur.
Steam-friendly : PAS de vrai drapeau / monument / symbole religieux identifiable.

Après génération : déposer les 3 PNG (fond blanc) dans `raw/maps/colline/` puis :

```bash
python3 tools/cutout.py raw/maps/colline assets/maps/colline
npm test
```

---

## 1) net_post.png

```
En image jointe : le décor (skyline) d'un terrain de mon jeu de volley cartoon.
Génère UN SEUL objet de décor pour ce terrain, dans EXACTEMENT le même style que
l'image jointe : même trait (contours noirs épais), mêmes aplats plats de
couleur, mêmes teintes, même niveau de détail.

L'objet à générer : un poteau de filet de volley vertical, décoré aux couleurs et
motifs du décor joint (grès pâle, accents bleu Méditerranée / verre froid, petit
ornement géométrique abstrait en haut façon citadelle — PAS de croissant ni de
symbole religieux), vu de face.

Contraintes STRICTES de rendu :
- fond UNI BLANC pur (#FFFFFF), rien d'autre — PAS de sol, PAS d'ombre portée,
  PAS de décor ni de dégradé autour de l'objet ;
- objet SEUL, ENTIER, centré, debout, cadrage vertical, marge tout autour ;
- haute résolution, objet net aux bords ;
- aucun texte, aucun logo, aucun vrai drapeau national ni monument réel
  identifiable, aucun personnage humain.
```

---

## 2) flag.png

```
En image jointe : le décor (skyline) d'un terrain de mon jeu de volley cartoon.
Génère UN SEUL objet de décor pour ce terrain, dans EXACTEMENT le même style que
l'image jointe : même trait (contours noirs épais), mêmes aplats plats de
couleur, mêmes teintes, même niveau de détail.

L'objet à générer : une bannière / drapeau de supporters sur sa hampe, tissu qui
ondule, aux couleurs du décor joint (sable chaud + bleu mer / cyan verre, motif
géométrique abstrait de citadelle — PAS un vrai drapeau national ni symbole
religieux).

Contraintes STRICTES de rendu :
- fond UNI BLANC pur (#FFFFFF), rien d'autre — PAS de sol, PAS d'ombre portée,
  PAS de décor ni de dégradé autour de l'objet ;
- objet SEUL, ENTIER, centré, debout, cadrage vertical, marge tout autour ;
- haute résolution, objet net aux bords ;
- aucun texte, aucun logo, aucun vrai drapeau national ni monument réel
  identifiable, aucun personnage humain.
```

---

## 3) falcon.png (event)

```
En image jointe : le décor (skyline) d'un terrain de mon jeu de volley cartoon.
Génère UN SEUL objet de décor pour ce terrain, dans EXACTEMENT le même style que
l'image jointe : même trait (contours noirs épais), mêmes aplats plats de
couleur, mêmes teintes, même niveau de détail.

L'objet à générer : un faucon en vol de profil, ailes déployées, silhouette
claire et lisible à petite taille, plumage dans les teintes du décor joint
(brun-sable, accents chauds, bec/serres discrets) — oiseau seul, pas de proie,
pas de personnage.

Contraintes STRICTES de rendu :
- fond UNI BLANC pur (#FFFFFF), rien d'autre — PAS de sol, PAS d'ombre portée,
  PAS de décor ni de dégradé autour de l'objet ;
- objet SEUL, ENTIER, centré, debout / en vol cadré, marge tout autour ;
- haute résolution, objet net aux bords ;
- aucun texte, aucun logo, aucun vrai drapeau national ni monument réel
  identifiable, aucun personnage humain.
```
