#!/usr/bin/env python3
"""Aperçu d'intégration d'une map dans la perspective du jeu.

Applique EXACTEMENT le placement du moteur (drawImgCoverBottom / baseline
alignée sur GROUND_Y) sur une skyline candidate, et superpose les repères de
jeu : ligne de sol, poteau du filet, deux joueurs à l'échelle, bande de score.
→ On voit d'un coup d'œil si une map générée est « bien adaptée » AVANT de la
câbler. Sert aussi à régler `baselineFromBottom` (MAP_LAYOUT) visuellement.

Constantes reprises de src/core.js : W=900 H=500 GROUND_Y=418 NET_X=450
NET_TOP=233 (poteau ~185 px) · perso debout ~110 px.

Usage :
  python3 tools/genassets/map_fit.py <skyline.png> [baselineFromBottom] [--full]
  python3 tools/genassets/map_fit.py assets/maps/palais-du-coq/skyline.png 43
  python3 tools/genassets/map_fit.py raw/maps/bosforie/skyline.png --auto
Sortie : <skyline>_fit.png (aperçu 900x500).
"""
from __future__ import annotations
import sys
from pathlib import Path
try:
    from PIL import Image, ImageDraw
except ImportError:
    print("pip install Pillow", file=sys.stderr); sys.exit(1)

W, H, GROUND_Y, NET_X, NET_TOP = 900, 500, 418, 450, 233


def cover_bottom(img, dw, dh, bl):
    """Réplique drawImgCoverBottom : crop bas `bl`, cover, aligné en bas."""
    sw, sh = img.size
    bl = max(0, min(sh - 8, int(bl)))
    useful = sh - bl
    scale = max(dw / sw, dh / useful)
    tw, th = int(sw * scale), int(useful * scale)
    crop = img.crop((0, 0, sw, useful)).resize((tw, th), Image.Resampling.LANCZOS)
    ox, oy = (dw - tw) // 2, dh - th
    return crop, ox, oy


def cover_baseline(img, dw, groundY, bl):
    """Réplique drawImgCoverBaseline (maps bgFullHeight) : ligne court → groundY."""
    sw, sh = img.size
    bl = max(0, min(sh - 8, int(bl)))
    baseline_src = sh - bl
    scale = max(dw / sw, groundY / max(1, baseline_src))
    tw, th = int(sw * scale), int(sh * scale)
    crop = img.resize((tw, th), Image.Resampling.LANCZOS)
    ox = (dw - tw) // 2
    oy = int(groundY - baseline_src * scale)
    return crop, ox, oy


def auto_baseline(img):
    """Devine la baseline : ligne horizontale la plus sombre dans le bas 45 %."""
    g = img.convert("L")
    w, h = g.size
    px = g.load()
    y0 = int(h * 0.55)
    best_y, best_score = h - 1, 1e9
    for y in range(y0, h - 2):
        row = sum(px[x, y] for x in range(0, w, 4))
        if row < best_score:
            best_score, best_y = row, y
    return h - best_y  # px depuis le bas


def main():
    args = [a for a in sys.argv[1:]]
    if not args:
        print(__doc__); sys.exit(1)
    src = Path(args[0])
    full = "--full" in args
    auto = "--auto" in args
    bl = None
    for a in args[1:]:
        if a.lstrip("-").isdigit():
            bl = int(a)
    img = Image.open(src).convert("RGBA")
    if auto or bl is None:
        bl = auto_baseline(img)
        print(f"baselineFromBottom auto ≈ {bl} px (ajuste si les pieds ne sont pas sur la ligne)")

    canvas = Image.new("RGBA", (W, H), (30, 34, 40, 255))
    if full:
        layer, ox, oy = cover_baseline(img, W, GROUND_Y, bl)
    else:
        layer, ox, oy = cover_bottom(img, W, GROUND_Y, bl)
    canvas.alpha_composite(layer.convert("RGBA"), (ox, oy))
    # miroir du moteur : prolonge le bas jusqu'au bord si l'image s'arrête avant
    drawn_bottom = oy + layer.height
    if full and drawn_bottom < H - 0.5:
        strip = layer.crop((0, layer.height - 3, layer.width, layer.height))
        strip = strip.resize((layer.width, H - drawn_bottom + 2), Image.Resampling.LANCZOS)
        canvas.alpha_composite(strip.convert("RGBA"), (ox, drawn_bottom - 1))

    d = ImageDraw.Draw(canvas, "RGBA")
    # bande de score
    d.rectangle([0, GROUND_Y, W, H], fill=(18, 20, 28, 235))
    d.text((10, GROUND_Y + 6), "HUD / score band", fill=(200, 200, 210, 255))
    # ligne de sol
    d.line([(0, GROUND_Y), (W, GROUND_Y)], fill=(255, 80, 80, 255), width=2)
    d.text((10, GROUND_Y - 14), "GROUND_Y (pieds / ligne de court)", fill=(255, 120, 120, 255))
    # poteau de filet
    d.rectangle([NET_X - 5, NET_TOP, NET_X + 5, GROUND_Y], fill=(230, 230, 240, 230),
                outline=(20, 20, 30, 255))
    for yy in range(NET_TOP, GROUND_Y, 12):
        d.line([(NET_X - 5, yy), (NET_X + 5, yy + 6)], fill=(120, 120, 140, 200))
    # deux joueurs à l'échelle (~110 px), pieds sur GROUND_Y, à 0.25W / 0.75W
    ph = 110
    for cx, col in ((int(W * 0.25), (60, 120, 255, 170)), (int(W * 0.75), (255, 90, 90, 170))):
        pw = int(ph * 0.42)
        d.rounded_rectangle([cx - pw // 2, GROUND_Y - ph, cx + pw // 2, GROUND_Y],
                            radius=10, fill=col, outline=(10, 10, 20, 255), width=2)
        d.ellipse([cx - 16, GROUND_Y - ph - 20, cx + 16, GROUND_Y - ph + 12], fill=col,
                  outline=(10, 10, 20, 255))
    # balle
    d.ellipse([NET_X - 11, 150 - 11, NET_X + 11, 150 + 11], fill=(255, 240, 180, 255),
              outline=(20, 20, 30, 255))

    out = src.with_name(src.stem + "_fit.png")
    canvas.convert("RGB").save(out)
    print(f"Aperçu → {out}")
    print("Bien adapté si : silhouettes posées SUR la ligne rouge, poteau au sol,")
    print("court visible entre/derrière les joueurs, aucun décor important sous la ligne.")


if __name__ == "__main__":
    main()
