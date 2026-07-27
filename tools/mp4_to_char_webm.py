#!/usr/bin/env python3
"""MP4 fond rose/magenta → WebM VP9+alpha pour sprites perso Sommet Volley.

Usage:
  python3 tools/mp4_to_char_webm.py ~/Downloads/cygne_idle.mp4 assets/cygne/idle.webm
  python3 tools/mp4_to_char_webm.py --batch cygne
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ANIMS = [
    "idle", "walk", "jump", "receive", "aim", "smash",
    "super", "panic", "victory", "defeat",
]


def convert_mp4(src: Path, out: Path, fps: int = 24, height: int = 536) -> None:
    tmp = tempfile.mkdtemp(prefix="sv_webm_")
    try:
        subprocess.check_call(
            ["ffmpeg", "-y", "-i", str(src), "-vf", f"fps={fps}", f"{tmp}/f_%04d.png"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.STDOUT,
        )
        frames = sorted(f for f in os.listdir(tmp) if f.endswith(".png"))
        if not frames:
            raise RuntimeError(f"no frames from {src}")

        im0 = np.array(Image.open(f"{tmp}/{frames[0]}").convert("RGB"), dtype=np.float32)
        h, w, _ = im0.shape
        corners = np.array([
            im0[2, 2], im0[2, w - 3], im0[h - 3, 2], im0[h - 3, w - 3],
            im0[2, w // 2], im0[h // 2, 2],
        ])
        bg = corners.mean(axis=0)

        def key_rgba(rgb: np.ndarray) -> np.ndarray:
            dist = np.linalg.norm(rgb - bg, axis=2)
            alpha = np.clip((dist - 28) / 22, 0, 1)
            r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
            pinkish = (r > 120) & (b > 80) & (g < 120) & (r > g + 40) & (b > g + 20)
            alpha = np.where(pinkish & (dist < 90), 0, alpha)
            a8 = (alpha * 255).astype(np.uint8)
            return np.dstack([rgb.astype(np.uint8), a8])

        keyed, boxes = [], []
        for f in frames:
            rgb = np.array(Image.open(f"{tmp}/{f}").convert("RGB"), dtype=np.float32)
            rgba = key_rgba(rgb)
            a = rgba[:, :, 3] > 20
            if a.any():
                ys, xs = np.where(a)
                boxes.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
            keyed.append(rgba)
        if not boxes:
            raise RuntimeError(f"no foreground in {src}")

        x0 = min(b[0] for b in boxes)
        y0 = min(b[1] for b in boxes)
        x1 = max(b[2] for b in boxes)
        y1 = max(b[3] for b in boxes)
        pad = 12
        x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
        x1, y1 = min(w, x1 + pad), min(h, y1 + pad)

        th = height // 2 * 2
        tw = int(round((x1 - x0) * th / (y1 - y0) / 2) * 2)
        out_dir = Path(tmp) / "out"
        out_dir.mkdir()
        for i, rgba in enumerate(keyed):
            crop = rgba[y0:y1, x0:x1]
            Image.fromarray(crop, "RGBA").resize((tw, th), Image.Resampling.LANCZOS).save(
                out_dir / f"f_{i:04d}.png"
            )

        out.parent.mkdir(parents=True, exist_ok=True)
        subprocess.check_call(
            [
                "ffmpeg", "-y",
                "-framerate", str(fps),
                "-i", str(out_dir / "f_%04d.png"),
                "-c:v", "libvpx-vp9",
                "-pix_fmt", "yuva420p",
                "-auto-alt-ref", "0",
                "-b:v", "0", "-crf", "36",
                "-an",
                str(out),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.STDOUT,
        )
        print(f"OK {out} ({out.stat().st_size} bytes, {tw}x{th}, {len(frames)}f)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def batch_cygne(dl: Path) -> None:
    raw = ROOT / "raw" / "cygne"
    out_dir = ROOT / "assets" / "cygne"
    raw.mkdir(parents=True, exist_ok=True)
    for anim in DEFAULT_ANIMS:
        src = dl / f"cygne_{anim}.mp4"
        if not src.exists():
            print(f"SKIP missing {src.name}")
            continue
        shutil.copy2(src, raw / f"cygne_{anim}.mp4")
        convert_mp4(src, out_dir / f"{anim}.webm")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src", nargs="?", type=Path)
    ap.add_argument("out", nargs="?", type=Path)
    ap.add_argument("--batch", choices=["cygne"])
    ap.add_argument("--downloads", type=Path, default=Path.home() / "Downloads")
    args = ap.parse_args()
    if args.batch == "cygne":
        batch_cygne(args.downloads)
        return
    if not args.src or not args.out:
        ap.error("src out required, or --batch cygne")
    convert_mp4(args.src.expanduser(), args.out)


if __name__ == "__main__":
    main()
