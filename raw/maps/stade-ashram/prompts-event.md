# Event Stade Ashram — vache sacrée

Process event : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) § événement.

```yaml
prop: cow.png
motion: traverse_horizontal
idleOffCourt: true
hitbox: ball_deflect  # pendant l’event seulement
```

Prop : `cow.png` → cutout avec blancs du pelage conservés → `assets/maps/ashram/cow.png`.

## cow.png (16:9)

```
Single 2D cartoon friendly sacred white cow side view facing RIGHT, marigold garland, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, no text, no logos. Full animal visible, readable silhouette for horizontal walk across screen. Solid body fills — no white gaps inside the silhouette except natural white fur (fur is fine; holes between legs OK only if clearly outside the body).
```

## Comportement (code — ne pas improviser)
- **Idle** : devant le public, **hors terrain**, petite taille (perspective fond).
- **Event** : sur le terrain, **plus grande**, traverse horizontalement, dévie la balle.
- Annonce `warn` ; step seulement en échange jouable.
