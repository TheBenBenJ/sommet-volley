# Event Amazonie Dorée — aras

Process event : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) § événement.

```yaml
prop: macaw.png
motion: traverse_horizontal
idleOffCourt: false
hitbox: ball_deflect
```

Prop : `macaw.png` → `assets/maps/amazon/macaw.png`.

## macaw.png (1:1)

```
Single 2D cartoon colorful macaw in flight facing RIGHT, wings spread for LEVEL horizontal flight (NOT diving, NOT falling like rain), thick black outlines, flat cel colors, pure solid white background #FFFFFF, no ground shadow, no text. Clear side silhouette suitable for slow horizontal travel across a volleyball court.
```

## Comportement (code)
- **Vol horizontal lent** à travers le terrain — **pas** une pluie verticale.
- Plusieurs aras possibles, mais chacun suit une trajectoire horizontale.
- Annonce ; step seulement en échange jouable.
