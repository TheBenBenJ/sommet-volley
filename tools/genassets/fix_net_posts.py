#!/usr/bin/env python3
"""Recentrer / redresser les poteaux de filet (assets/maps/*/net_post.png).

Le rendu (`drawNet`) centre le PNG sur NET_X. Si le fût n'est pas au centre
du fichier (fanion latéral, padding asymétrique, lean), le poteau paraît de
travers. Ce script :
  1. suit le fût (bas → haut, runs étroits)
  2. retire les appendices latéraux (fanions)
  3. redresse le lean
  4. recadre à 720 px avec le fût au centre horizontal

Usage:
  python3 tools/genassets/fix_net_posts.py
  python3 tools/genassets/fix_net_posts.py amazon trompette
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets" / "maps"
TARGET_H = 720
H_PAD = 4
W_PAD = 12


def mask_opaque(arr: np.ndarray) -> np.ndarray:
    a = arr[:, :, 3] > 40
    rgb = arr[:, :, :3]
    white = (rgb[:, :, 0] > 248) & (rgb[:, :, 1] > 248) & (rgb[:, :, 2] > 248)
    return a & ~white


def track_shaft(a: np.ndarray):
    ys, xs = np.where(a)
    if len(ys) == 0:
        return None
    y0, y1 = int(ys.min()), int(ys.max())
    centers = []
    prev = None
    for y in range(y1, y0 - 1, -1):
        row = np.where(a[y])[0]
        if len(row) == 0:
            continue
        runs = []
        s = p = row[0]
        for x in row[1:]:
            if x == p + 1:
                p = x
            else:
                runs.append((s, p))
                s = p = x
        runs.append((s, p))
        target = prev if prev is not None else 0.5 * (row.min() + row.max())

        def score(r):
            cx = 0.5 * (r[0] + r[1])
            width = r[1] - r[0] + 1
            return abs(cx - target) + 0.25 * width

        best = min(runs, key=score)
        cx = 0.5 * (best[0] + best[1])
        half = 0.5 * (best[1] - best[0]) + 1.5
        centers.append((y, cx, half))
        prev = cx
    centers.reverse()
    return centers, y0, y1


def measure(arr: np.ndarray):
    a = mask_opaque(arr)
    tracked = track_shaft(a)
    if not tracked:
        return None
    centers, y0, y1 = tracked
    ys = np.array([c[0] for c in centers], float)
    xs = np.array([c[1] for c in centers], float)
    cut = y0 + 0.5 * (y1 - y0)
    base = ys >= cut
    if base.sum() < 8:
        base = np.ones_like(ys, bool)
    m, _ = np.polyfit(ys[base], xs[base], 1)
    scx = float(np.median(xs[base]))
    off = scx - (arr.shape[1] - 1) / 2
    lean = float(np.degrees(np.arctan(m)))
    return off, lean


def fix_post(arr: np.ndarray) -> Image.Image:
    a = mask_opaque(arr)
    tracked = track_shaft(a)
    if not tracked:
        raise ValueError("empty post")
    centers, y0, y1 = tracked
    ys = np.array([c[0] for c in centers], float)
    xs = np.array([c[1] for c in centers], float)
    halves = np.array([c[2] for c in centers], float)
    cut = y0 + 0.5 * (y1 - y0)
    base = ys >= cut
    if base.sum() < 10:
        base = np.ones_like(ys, bool)
    m, b = np.polyfit(ys[base], xs[base], 1)
    lean = float(np.degrees(np.arctan(m)))
    shaft_w = float(np.median(halves[base])) * 2

    out = arr.copy()
    h, w = a.shape
    for y in range(h):
        if not a[y].any():
            continue
        t = (y - y0) / max(1.0, y1 - y0)
        sx = m * y + b
        if t > 0.55:
            rad = max(shaft_w * 0.9, 14)
        elif t > 0.2:
            rad = max(shaft_w * 1.15, 18)
        else:
            rad = max(shaft_w * 1.6, 26)
        xs_row = np.arange(w)
        kill = (np.abs(xs_row - sx) > rad) & (out[y, :, 3] > 40)
        out[y, kill, 3] = 0

    pil = Image.fromarray(out, "RGBA")
    # deskew iteratively
    for _ in range(6):
        cur = measure(np.array(pil))
        if not cur:
            break
        _, lean_now = cur
        if abs(lean_now) < 0.35:
            break
        pil = pil.rotate(
            -lean_now,
            resample=Image.Resampling.BICUBIC,
            expand=True,
            fillcolor=(0, 0, 0, 0),
        )

    arr2 = np.array(pil)
    a2 = mask_opaque(arr2)
    tracked2 = track_shaft(a2)
    if not tracked2:
        raise ValueError("empty after strip")
    centers2, y0, y1 = tracked2
    ys2 = np.array([c[0] for c in centers2], float)
    xs2 = np.array([c[1] for c in centers2], float)
    cut = y0 + 0.5 * (y1 - y0)
    shaft_cx = float(np.median(xs2[ys2 >= cut]))
    ys, xs = np.where(a2)
    x0, x1 = int(xs.min()), int(xs.max())
    crop = pil.crop((x0, y0, x1 + 1, y1 + 1))
    shaft_in = shaft_cx - x0
    inner_h = TARGET_H - 2 * H_PAD
    scale = inner_h / crop.height
    nw = max(1, int(round(crop.width * scale)))
    crop = crop.resize((nw, inner_h), Image.Resampling.LANCZOS)
    shaft_s = shaft_in * scale
    half = max(int(round(shaft_s)) + W_PAD, nw - int(round(shaft_s)) + W_PAD)
    cw = 2 * half
    canvas = Image.new("RGBA", (cw, TARGET_H), (0, 0, 0, 0))
    paste_x = int(round(cw / 2 - shaft_s))
    canvas.paste(crop, (paste_x, H_PAD), crop)
    return canvas


def main():
    keys = sys.argv[1:]
    posts = sorted(ASSETS.glob("*/net_post.png"))
    posts = [p for p in posts if "_bak" not in str(p)]
    if keys:
        posts = [p for p in posts if p.parent.name in keys]
    for p in posts:
        bak = p.parent / "_bak_net_post" / "net_post.png"
        if not bak.exists():
            bak.parent.mkdir(parents=True, exist_ok=True)
            Image.open(p).save(bak)
            src = p
        else:
            src = bak
        before = measure(np.array(Image.open(src).convert("RGBA")))
        canvas = fix_post(np.array(Image.open(src).convert("RGBA")))
        canvas.save(p)
        after = measure(np.array(canvas))
        b = f"off={before[0]:+.1f} lean={before[1]:+.2f}" if before else "?"
        a = f"off={after[0]:+.1f} lean={after[1]:+.2f}" if after else "?"
        print(f"{p.parent.name:12} {b} → {a}  {canvas.size[0]}x{canvas.size[1]}")


if __name__ == "__main__":
    main()
