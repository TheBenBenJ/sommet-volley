# Images à générer avec Gemini — Portraits « dopés » du Mode Histoire

## Pourquoi ces images
Dans le Mode Histoire, les adversaires d'Acte III se **« dopent »** (IA impitoyable,
aura rouge). Le moteur cherche déjà un fichier `assets/story/<key>_doped.png` pour
chaque perso ; **s'il ne le trouve pas, il se contente de teinter le portrait normal
en rouge** (`storyDrawPortrait` → `storyDopedPortrait`). On veut remplacer ce bricolage
par de **vrais portraits « dopés »** : mêmes têtes, mais version enragée/survoltée.

Les 10 persos peuvent apparaître dopés dans au moins une campagne → on génère **les 10**.

## ⚠️ Règles communes (à répéter à Gemini à chaque image)
- **Steam-safe** : caricature 100 % fictive, aucun vrai nom / drapeau / emblème / texte lisible.
- **Même personnage que l'image jointe** : garde le visage, la coupe, la tenue, les couleurs.
- **Même style** : cartoon 2D, gros contours noirs, aplats colorés (style « blobby/volley »).
- **Même cadrage que la référence** : buste/tête, perso centré, regard vers le spectateur.
- **Fond** : **fond uni magenta pur `#FF00FF`** (aucun dégradé, aucune ombre portée sur le fond) — c'est ce qui permet le détourage automatique.
- **Un seul personnage**, pas de bord de cadre, pas d'étoiles ni décor.
- **Transformation « dopé »** : yeux injectés de sang qui **luisent rouge**, veines rouges
  saillantes sur les tempes et le cou, sueur, expression **agressive/enragée** (dents serrées,
  sourcils froncés), légère **aura d'énergie rouge** autour de la tête. Reste une caricature,
  pas du gore.

> Format de sortie souhaité : PNG carré (ou portrait), ~720 px de haut, perso net sur le magenta.

---

## La liste (une image à la fois)

Pour **chaque** image : joins le fichier de référence indiqué, colle les *Règles communes*
ci-dessus, puis ajoute la ligne « Prompt » spécifique. Destination finale entre parenthèses.

### 1. Tsar Volkoï — dopé
- **Référence à joindre** : `assets/vladou/idle_face_0.png`
- **Prompt** : « Version *dopée* de ce dirigeant slave glacial : même visage, même manteau
  sombre. Yeux bleu pâle devenus rouge luisant, veines saillantes sur le crâne, buée froide,
  rictus mauvais. Aura rouge glacée. Fond magenta `#FF00FF`. »
- **Destination** : `assets/story/vladou_doped.png`

### 2. Baron Dorf — dopé
- **Référence à joindre** : `assets/trompette/idle_face_0.png`
- **Prompt** : « Version *dopée* de ce magnat blond bronzé, costume bleu et longue cravate rouge :
  visage cramoisi, yeux injectés rouge vif, veines gonflées au front, sueur, air survolté et furieux.
  Aura rouge. Fond magenta `#FF00FF`. »
- **Destination** : `assets/story/trompette_doped.png`

### 3. Le Cygne — dopé
- **Référence à joindre** : `assets/micron/idle_face_0.png`
- **Prompt** : « Version *dopée* de ce jeune technocrate en costume bleu, chemise blanche :
  le sourire diplomate remplacé par un regard fixe et rouge luisant, veines aux tempes, sueur,
  mâchoire crispée. Aura rouge. Fond magenta `#FF00FF`. »
- **Destination** : `assets/story/micron_doped.png`

### 4. Maréchal Bébé — dopé
- **Référence à joindre** : `assets/bebe/idle_face_0.png`
- **Prompt** : « Version *dopée* de ce jeune maréchal joufflu en tunique sombre :
  joues rouges, yeux petits devenus rouge luisant, veines au front, sueur, sourire mauvais.
  Aura rouge. Fond magenta `#FF00FF`. »
- **Destination** : `assets/story/bebe_doped.png`

### 5. Le Grand Timonier — dopé
- **Référence à joindre** : `assets/panda/idle_face_0.png`
- **Prompt** : « Version *dopée* de ce dirigeant impassible aux cheveux noirs peignés, costume sombre :
  le calme impérial vire à la fureur froide, yeux rouge luisant, veines au cou, mâchoire serrée.
  Aura rouge. Fond magenta `#FF00FF`. »
- **Destination** : `assets/story/panda_doped.png`

### 6. Le Sultan — dopé
- **Référence à joindre** : `assets/sultan/idle_face_0.png`
- **Prompt** : « Version *dopée* de ce néo-sultan moustachu en costume sombre :
  regard rouge luisant, veines saillantes, sueur, expression grandiloquente et enragée.
  Aura rouge. Fond magenta `#FF00FF`. »
- **Destination** : `assets/story/sultan_doped.png`

### 7. Le Gourou — dopé
- **Référence à joindre** : `assets/yogi/idle_face_0.png`
- **Prompt** : « Version *dopée* de ce gourou à barbe blanche en tenue safran/orange :
  la sérénité zen remplacée par des yeux rouge luisant grand ouverts, veines au front, sueur,
  rictus. Aura rouge. Fond magenta `#FF00FF`. »
- **Destination** : `assets/story/yogi_doped.png`

### 8. Le Capitaine — dopé
- **Référence à joindre** : `assets/jair/idle_face_0.png`
- **Prompt** : « Version *dopée* de cet ex-militaire populiste au visage rude :
  yeux injectés rouge luisant, veines gonflées aux tempes et au cou, sueur, air brutal et hargneux.
  Aura rouge. Fond magenta `#FF00FF`. »
- **Destination** : `assets/story/jair_doped.png`

### 9. Le Faucon — dopé
- **Référence à joindre** : `assets/faucon/idle_face_0.png`
- **Prompt** : « Version *dopée* de ce faucon composite aux cheveux gris/blancs, costume sombre :
  regard dur devenu rouge luisant, veines saillantes, mâchoire crispée, intransigeance poussée à
  l'extrême. Aura rouge. Fond magenta `#FF00FF`. »
- **Destination** : `assets/story/faucon_doped.png`

### 10. Le Safran — dopé
- **Référence à joindre** : `assets/safran/idle_face_0.png`
- **Prompt** : « Version *dopée* de ce dirigeant barbu élégant des hautes terres :
  calme mesuré remplacé par des yeux rouge luisant, veines au front, sueur, rictus sardonique.
  Aura rouge. Fond magenta `#FF00FF`. »
- **Destination** : `assets/story/safran_doped.png`

---

## Après génération (intégration — je m'en occupe)
1. Tu me déposes chaque image (dans `Downloads` ou en la joignant).
2. Je passe le détourage magenta et je pose le fichier en `assets/story/<key>_doped.png`
   (le magenta `#FF00FF` est détouré automatiquement par `tools/cutout.py` ; si Gemini rend un
   magenta un peu terne, je le remappe d'abord en `#FF00FF` pur).
3. Le moteur les charge tout seul : dès qu'un `assets/story/<key>_doped.png` existe, il remplace
   la teinte rouge dans les portraits de dialogue d'Acte III. Aucune autre modif nécessaire.

> Astuce : commence par les **plus vus dopés** (Le Faucon, Le Safran, Le Cygne, le Tsar) —
> ce sont eux qui reviennent le plus souvent en finale des campagnes.
