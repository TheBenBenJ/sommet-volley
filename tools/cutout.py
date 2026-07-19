#!/usr/bin/env python3
"""Détourage anti-aliasé + ancrage pieds — pipeline Sommet Volley (Phase 2).

Usage:
  python3 tools/cutout.py raw/vladou assets/vladou

Entrée : PNG fond blanc (raw/<key>/*.png)
Sortie : PNG détourés + _contact.png (planche de contrôle)
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError:
    print("Installe Pillow : pip install Pillow", file=sys.stderr)
    sys.exit(1)

WHITE_THR = 245          # au-dessus = candidat fond
ALPHA_RAMP = 18          # largeur de rampe anti-alias (px distance)
FOOT_ALIGN = True
STAND_H = 512            # hauteur normalisée debout
MARGIN = 0.04


def flood_bg_mask(im: Image.Image) -> Image.Image:
    """Masque du fond : flood fill depuis les bords (protège blancs internes)."""
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    # seed : pixels quasi-blancs sur le bord
    from collections import deque
    seen = [[False] * w for _ in range(h)]
    q = deque()

    def is_white(x, y):
        r, g, b, a = px[x, y]
        return a > 10 and r >= WHITE_THR and g >= WHITE_THR and b >= WHITE_THR

    for x in range(w):
        for y in (0, h - 1):
            if is_white(x, y) and not seen[y][x]:
                seen[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_white(x, y) and not seen[y][x]:
                seen[y][x] = True
                q.append((x, y))

    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and is_white(nx, ny):
                seen[ny][nx] = True
                q.append((nx, ny))

    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            if seen[y][x]:
                mp[x, y] = 255
    # rampe douce : dilate légèrement le masque via blur → alpha
    soft = mask.filter(ImageFilter.GaussianBlur(radius=ALPHA_RAMP / 3))
    return soft


def apply_cutout(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    bg = flood_bg_mask(rgba)
    out = rgba.copy()
    op, bp = out.load(), bg.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = op[x, y]
            # bg=255 → transparent ; bg=0 → opaque
            fade = bp[x, y] / 255.0
            na = int(a * (1.0 - fade))
            op[x, y] = (r, g, b, na)
    return out


def content_bbox(im: Image.Image, alpha_min=8):
    a = im.split()[-1]
    return a.getbbox() if a.getbbox() else (0, 0, im.width, im.height)


def foot_y(im: Image.Image, alpha_min=20) -> int:
    """Ligne de sol = dernière rangée avec assez d'alpha."""
    a = im.split()[-1]
    px = a.load()
    w, h = im.size
    for y in range(h - 1, -1, -1):
        for x in range(w):
            if px[x, y] >= alpha_min:
                return y
    return h - 1


def normalize(im: Image.Image, target_h=STAND_H) -> Image.Image:
    bb = content_bbox(im)
    cropped = im.crop(bb)
    # marge
    mw = int(cropped.width * MARGIN)
    mh = int(cropped.height * MARGIN)
    padded = Image.new("RGBA", (cropped.width + 2 * mw, cropped.height + 2 * mh), (0, 0, 0, 0))
    padded.paste(cropped, (mw, mh), cropped)
    # scale to target_h
    scale = target_h / padded.height
    nw, nh = max(1, int(padded.width * scale)), target_h
    return padded.resize((nw, nh), Image.Resampling.LANCZOS)


def anchor_feet(im: Image.Image, canvas_h=STAND_H + 24) -> Image.Image:
    fy = foot_y(im)
    # place foot line at canvas_h - 4
    out = Image.new("RGBA", (im.width, canvas_h), (0, 0, 0, 0))
    dy = (canvas_h - 4) - fy
    out.paste(im, (0, dy), im)
    return out


def process_one(src: Path, dst: Path):
    im = Image.open(src)
    cut = apply_cutout(im)
    norm = normalize(cut)
    if FOOT_ALIGN:
        norm = anchor_feet(norm)
    dst.parent.mkdir(parents=True, exist_ok=True)
    norm.save(dst)
    print(f"  {src.name} → {dst}")


def contact_sheet(paths, out: Path, cols=6):
    imgs = [Image.open(p) for p in paths if p.exists()]
    if not imgs:
        return
    tw, th = imgs[0].size
    rows = (len(imgs) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * tw, rows * th), (40, 40, 48, 255))
    for i, im in enumerate(imgs):
        x, y = (i % cols) * tw, (i // cols) * th
        sheet.paste(im, (x, y), im)
    sheet.save(out)
    print(f"  planche → {out}")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    raw_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    outs = []
    for src in sorted(raw_dir.glob("*.png")):
        if src.name.startswith("_"):
            continue
        dst = out_dir / src.name
        process_one(src, dst)
        outs.append(dst)
    contact_sheet(outs, out_dir / "_contact.png")


if __name__ == "__main__":
    main()
