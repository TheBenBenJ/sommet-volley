# Event Palais du Bosphore — tapis volant

Process event : [`docs/PIPELINE-MAP.md`](../../../docs/PIPELINE-MAP.md) § événement.

```yaml
prop: carpet.png
motion: traverse_horizontal
idleOffCourt: false
hitbox: ball_deflect
```

Prop : `carpet.png` → cutout → `assets/maps/bosphore/carpet.png`.

## carpet.png (16:9)

```
Single 2D cartoon game prop: ornate red-and-gold flying carpet side view facing RIGHT, thick black outlines, flat cel colors, pure solid white background #FFFFFF, no characters riding it, no text, no logos, no ground shadow. Readable long horizontal silhouette for travel across a volleyball court.
```

## Intégration
- Annonce `warn` ~2 s avant.
- Traverse **horizontale** du terrain ; dévie la balle au contact.
- Step seulement en échange jouable (`mapEventsCanStep`).
