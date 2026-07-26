# Enrichissement narratif — campagnes Mode Histoire (Codex)

Tu travailles dans le repo Sommet Volley.
Référence absolue : `docs/histoires/_BRIEF.md` (format, Steam-safe, ⅓/⅓/⅓, 2v2, voix).

## Mission

Enrichir les **10 campagnes perso** déjà présentes dans `docs/histoires/<key>.md`
pour les rendre plus riches, drôles, cohérentes, avec un vrai fil narratif.

Fichiers à éditer (et **seulement** ceux-là pour le contenu) :
- `docs/histoires/volkoi.md`
- `docs/histoires/dorf.md`
- `docs/histoires/cygne.md`
- `docs/histoires/bebe.md`
- `docs/histoires/timonier.md`
- `docs/histoires/sultan.md`
- `docs/histoires/gourou.md`
- `docs/histoires/capitaine.md`
- `docs/histoires/faucon.md`
- `docs/histoires/safran.md`

Puis régénérer le JS shippé :
```bash
node tools/extract_campaigns.js
npm test
```

Ne touche PAS à `src/story.js` (campagne principale + barks déjà enrichis).
Ne touche PAS aux assets / code gameplay.

## Règles IMPÉRATIVES

1. **Steam-safe / fiction** : UNIQUEMENT noms fictionnels (Volkoï, Dorf, Cygne,
   Bourassie, Gallardie, Safranie, Consortium, Ligue des Émergents, etc.).
   INTERDIT : Ramenie, Syrie, Rafales, BRICS, Occident, mosquée, parisien,
   énarque, noms de vrais dirigeants/pays/partis, drapeaux réels.
2. **Structure** : garder biographie + Mode Histoire ; **9 rencontres** ;
   Acte I volley (dont 1× `2v2` d'ouverture) → Acte II `flame` → Acte III `bomb`.
3. **Mécaniques** : ne change PAS `left`/`right`/`ally`/`right2`/`terrain`/`mode`/
   `ai`/`doped` sauf correction d'alliance absurde. Enrichis surtout titres,
   sous-titres, dialogues `pre`/`win`/`lose`.
4. **Dialogues** :
   - `pre` : 5–7 répliques (narrateur + voix caractérisées)
   - `win` / `lose` : 3–4 répliques, **pas** de tutoriel mécanique
   - Le narrateur nomme la mécanique flame/bombe **une fois** par rencontre
     d'acte II/III (dans `pre` seulement)
   - Running gag / fil narratif clair sur les 9 chapitres de chaque campagne
5. **Voix** (bible courte) :
   - Volkoï : glacial, laconique, « l'hiver », listes, patience-menace
   - Dorf : superlatifs, « le plus … du monde », match truqué, vantardise
   - Cygne : « en même temps », premier de la classe, commission, hypocrisie chic
   - Bébé : fanfaron, compte tout, décrets, statues
   - Timonier : tempo, harmonie, calme impérial
   - Sultan : grandiloquent, smash, fierté de détroit
   - Gourou : Namasté, zen + pique, endurance
   - Capitaine : rude, blagues, forêt, anti-écolo vs Cygne
   - Faucon : intransigeant, sécurité, frappe chirurgicale
   - Safran : mesuré, sardonique, thé, roses, Voile d'Or
6. **Cygne dopé** : si `doped: "R"` sur le Cygne, cadre l'hypocrisie
   (« vitamines parfaitement légales quelque part… en même temps »).
7. Français, satirique, généreux, marrant — pas de filler creux.

## Ordre de travail

1. Lis `_BRIEF.md` puis un fichier, enrichis-le entièrement, sauve.
2. Passe au suivant (les 10).
3. `node tools/extract_campaigns.js`
4. `npm test` — doit rester vert. Si un test fiction échoue, corrige le md
   (terme banni) et régénère.
5. Résume : ce que tu as renforcé par campagne (1 ligne chacune).

Travaille séquentiellement. Qualité > vitesse. Ne laisse aucun fichier à moitié enrichi.
