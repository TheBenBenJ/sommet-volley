#!/usr/bin/env python3
"""MP4 fond rose/magenta → WebM VP9+alpha pour sprites perso Sommet Volley.

Usage:
  python3 tools/mp4_to_char_webm.py ~/Downloads/cygne_idle.mp4 assets/cygne/idle.webm
  python3 tools/mp4_to_char_webm.py --batch volkoi
  python3 tools/mp4_to_char_webm.py --batch timonier
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

# Noms Gemini tronqués → anim (préfixe Animation_<MOT>_)
ANIM_PREFIX = {
    "idle": "Animation_IDLE_",
    "walk": "Animation_WALK_",
    "jump": "Animation_JUMP_",
    "receive": "Animation_RECEIVE_",
    "aim": "Animation_AIM_",
    "smash": "Animation_SMASH_",
    "super": "Animation_SUPER_",
    "panic": "Animation_PANIC_",
    "victory": "Animation_VICTORY_",
    "defeat": "Animation_DEFEAT_",
}


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


def _glob_one(dl: Path, pattern: str) -> Path | None:
    matches = sorted(dl.glob(pattern))
    if not matches:
        return None
    if len(matches) > 1:
        print(f"WARN several {pattern}, using {matches[0].name}")
    return matches[0]


def find_anim_mp4(dl: Path, key: str, anim: str) -> Path | None:
    """Résout un MP4 Downloads.

    Ordre : <key>_<anim>.mp4 → Animation_<ANIM>_*.mp4.
    Pour walk : RUN d'abord (<key>_run.mp4 / Animation_RUN_*), puis WALK.
    """
    if anim == "walk":
        for candidate in (
            dl / f"{key}_run.mp4",
            _glob_one(dl, "Animation_RUN_*.mp4"),
            dl / f"{key}_walk.mp4",
            _glob_one(dl, "Animation_WALK_*.mp4"),
        ):
            if candidate and Path(candidate).exists():
                return Path(candidate)
        return None

    short = dl / f"{key}_{anim}.mp4"
    if short.exists():
        return short
    prefix = ANIM_PREFIX.get(anim)
    if prefix:
        return _glob_one(dl, f"{prefix}*.mp4")
    return None


def batch_key(key: str, dl: Path) -> None:
    """Convertit les 10 anims pour un perso (cygne, volkoi, timonier, …)."""
    raw = ROOT / "raw" / key
    out_dir = ROOT / "assets" / key
    raw.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)
    for anim in DEFAULT_ANIMS:
        src = find_anim_mp4(dl, key, anim)
        if src is None:
            if anim == "walk":
                print(f"SKIP missing {key}_run.mp4 / Animation_RUN_* / walk")
            else:
                prefix = ANIM_PREFIX.get(anim, f"Animation_{anim.upper()}_")
                print(f"SKIP missing {prefix}*.mp4 / {key}_{anim}.mp4")
            continue
        # Conserver le nom source (run vs walk) dans raw/
        raw_name = src.name if src.name.startswith(f"{key}_") else f"{key}_{anim}.mp4"
        if anim == "walk" and "run" in src.name.lower():
            raw_name = f"{key}_run.mp4"
        shutil.copy2(src, raw / raw_name)
        convert_mp4(src, out_dir / f"{anim}.webm")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src", nargs="?", type=Path)
    ap.add_argument("out", nargs="?", type=Path)
    ap.add_argument(
        "--batch",
        metavar="KEY",
        help="Perso (ex. cygne, volkoi, timonier) — lit ~/Downloads",
    )
    ap.add_argument("--downloads", type=Path, default=Path.home() / "Downloads")
    args = ap.parse_args()
    if args.batch:
        batch_key(args.batch.strip().lower(), args.downloads)
        return
    if not args.src or not args.out:
        ap.error("src out required, or --batch <key>")
    convert_mp4(args.src.expanduser(), args.out)


if __name__ == "__main__":
    main()
