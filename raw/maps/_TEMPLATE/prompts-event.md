# Template event map — `raw/maps/<key>/prompts-event.md`

Référence : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) § événement.

Renseigner avant de générer :

```yaml
prop: <file>.png
motion: traverse_horizontal | rain_zone | crowd_mask | other
idleOffCourt: false
hitbox: ball_deflect | visual_only | mask_view
```

---

## Prop (exemple traverse horizontal)

```
Single 2D cartoon game prop: <DESCRIPTION>, side view facing RIGHT, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, no floor, no characters riding it unless specified, no text, no logos. Readable silhouette for horizontal travel across a volleyball court.
```

## Prop (exemple pluie de zone)

```
Single 2D cartoon game prop: <DESCRIPTION>, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, no text. Single object only — the rain/scatter pattern is handled by game code, not drawn in this image.
```

---

## Contraintes code (ne pas oublier à l’intégration)

- Annonce `warn` ~2 s avant.
- RNG seedé uniquement.
- Step event **seulement** pendant un échange jouable (pas pause / service / point / Smash Battle).
- Vol / course : **horizontal** sauf design explicitement vertical documenté.
- Si idle hors terrain (ex. vache) : taille + Y différents en idle vs event ; documenter ici.
