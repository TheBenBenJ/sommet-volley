# Event Place du Matin — lanternes

Process event : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) § événement.

```yaml
prop: lantern.png
motion: rain_zone
idleOffCourt: false
hitbox: ball_deflect  # ou selon implémentation zone
```

Prop : `lantern.png` → `assets/maps/matin/lantern.png`.

## lantern.png (1:1)

```
Single 2D cartoon game prop: traditional Chinese red paper lantern with gold caps and tassel, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, no text. Single lantern only — the rain/scatter pattern is handled by game code, not drawn in this image.
```

## Comportement (code)
- Pluie de lanternes dans une **zone annoncée** (même famille que l’event golf Pelouse Oval).
- Le PNG = une lanterne ; le motif de chute est code.
- Step seulement en échange jouable.
