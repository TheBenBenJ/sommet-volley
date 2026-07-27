# Dorf — mapping vidéos Gemini (2026-07-27)

Sources : `~/Downloads/Using_the_attached_images_as (N).mp4`
→ `raw/dorf/dorf_<anim>.mp4` → `assets/dorf/<anim>.webm`

Ordre des prompts d’origine : idle → walk → jump → receive → aim → **smash** → super → panic → victory → defeat.

**Smash n’a pas été généré** (sauté) → les numéros après aim sont décalés d’un cran :

| Fichier | Anim | Vérif frame |
|---------|------|-------------|
| `(2)` | **idle** (trim **2–6 s**) | mains sur les hanches |
| `(3)` | **walk** = idle **0–2 s** (intro transition) + course complète | `walkIntroSec: 2` |
| `(4)` | **jump** | en l’air |
| `(5)` | **receive** | manchette bras bas |
| `(6)` | **aim** | deux mains au-dessus de la tête |
| `(7)` | **super** | garde / « Le Mur » |
| `(8)` | **panic** | bras en l’air, peur |
| `(9)` | **victory** | poings / célébration |

Manquants :
- **smash** — PNG (jamais généré)
- **defeat** — temporairement = `idle.webm`
