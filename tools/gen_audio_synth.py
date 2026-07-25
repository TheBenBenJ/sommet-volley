#!/usr/bin/env python3
"""Générateur audio procédural Sommet Volley (fallback sans API musique).

Produit des WAV (optionnellement MP3 via ffmpeg) : boucles map cartoon/fanfare
et SFX one-shot. Aucune VO, aucune voix reconnaissable — Steam-safe.

Usage:
  python3 tools/gen_audio_synth.py spike          # raw/audio/_spike/
  python3 tools/gen_audio_synth.py full           # assets/audio/{maps,sfx,story}/
  python3 tools/gen_audio_synth.py maps           # maps seulement
  python3 tools/gen_audio_synth.py sfx            # sfx + story
"""
from __future__ import annotations

import math
import random
import struct
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SR = 44100

# ---------------------------------------------------------------------------
# PCM helpers
# ---------------------------------------------------------------------------

def clamp(x: float, lo: float = -1.0, hi: float = 1.0) -> float:
    return lo if x < lo else hi if x > hi else x


def write_wav(path: Path, samples: list[float], sr: int = SR) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        frames = b"".join(struct.pack("<h", int(clamp(s) * 32767)) for s in samples)
        w.writeframes(frames)


def maybe_mp3(wav_path: Path) -> Path:
    """Encode en MP3 si ffmpeg est dispo ; sinon laisse le WAV."""
    mp3 = wav_path.with_suffix(".mp3")
    try:
        subprocess.check_call(
            [
                "ffmpeg", "-y", "-loglevel", "error",
                "-i", str(wav_path),
                "-ac", "2", "-ar", "44100",
                "-codec:a", "libmp3lame", "-b:a", "128k",
                str(mp3),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        wav_path.unlink(missing_ok=True)
        return mp3
    except (FileNotFoundError, subprocess.CalledProcessError):
        return wav_path


def env_adsr(i: int, n: int, a: float = 0.01, d: float = 0.05, s: float = 0.7, r: float = 0.08) -> float:
    t = i / max(1, n - 1)
    if t < a:
        return t / a
    if t < a + d:
        return 1.0 - (1.0 - s) * ((t - a) / d)
    if t > 1.0 - r:
        return s * (1.0 - t) / r
    return s


def osc(kind: str, phase: float) -> float:
    phase = phase % 1.0
    if kind == "sine":
        return math.sin(2 * math.pi * phase)
    if kind == "triangle":
        return 4 * abs(phase - 0.5) - 1
    if kind == "square":
        return 1.0 if phase < 0.5 else -1.0
    if kind == "saw":
        return 2 * phase - 1
    return math.sin(2 * math.pi * phase)


def note_freq(midi: int) -> float:
    return 440.0 * (2 ** ((midi - 69) / 12.0))


def render_note(
    samples: list[float],
    start: int,
    dur_s: float,
    midi: int,
    kind: str = "triangle",
    vol: float = 0.2,
    sr: int = SR,
) -> None:
    n = max(1, int(dur_s * sr))
    f = note_freq(midi)
    for i in range(n):
        idx = start + i
        if idx >= len(samples):
            break
        ph = (i * f) / sr
        samples[idx] += osc(kind, ph) * vol * env_adsr(i, n)


def noise(n: int, seed: int = 1) -> list[float]:
    rng = random.Random(seed)
    return [(rng.random() * 2 - 1) for _ in range(n)]


# ---------------------------------------------------------------------------
# Map themes (cartoon / fanfare satirical — distinct per terrain)
# ---------------------------------------------------------------------------

# (name, bpm, root_midi, scale_intervals, instrument, motif_degrees)
MAP_THEMES: dict[str, dict] = {
    "place-ecarlate": {
        "bpm": 96, "root": 50, "scale": [0, 2, 3, 5, 7, 8, 10],
        "inst": "saw", "motif": [0, 3, 5, 7, 5, 3, 0, -2], "vol": 0.16,
    },
    "country-club-dore": {
        "bpm": 112, "root": 57, "scale": [0, 2, 4, 5, 7, 9, 11],
        "inst": "square", "motif": [0, 4, 7, 4, 9, 7, 4, 0], "vol": 0.14,
    },
    "palais-du-coq": {
        "bpm": 118, "root": 62, "scale": [0, 2, 4, 5, 7, 9, 11],
        "inst": "triangle", "motif": [0, 2, 4, 5, 7, 5, 4, 2], "vol": 0.15,
    },
    "esplanade-du-defile": {
        "bpm": 108, "root": 48, "scale": [0, 2, 3, 5, 7, 8, 10],
        "inst": "square", "motif": [0, 0, 5, 5, 7, 7, 5, 3], "vol": 0.15,
    },
    "cite-du-matin": {
        "bpm": 88, "root": 55, "scale": [0, 2, 4, 7, 9],
        "inst": "sine", "motif": [0, 2, 4, 7, 4, 2, 0, 2], "vol": 0.18,
    },
    "pont-des-deux-mondes": {
        "bpm": 100, "root": 53, "scale": [0, 1, 4, 5, 7, 8, 11],
        "inst": "triangle", "motif": [0, 1, 4, 5, 7, 5, 4, 1], "vol": 0.15,
    },
    "stade-ashram": {
        "bpm": 84, "root": 52, "scale": [0, 2, 3, 7, 9],
        "inst": "sine", "motif": [0, 3, 7, 9, 7, 3, 0, -2], "vol": 0.17,
    },
    "grande-foret": {
        "bpm": 104, "root": 48, "scale": [0, 2, 4, 5, 7, 9, 10],
        "inst": "saw", "motif": [0, 5, 7, 10, 7, 5, 2, 0], "vol": 0.14,
    },
    "citadelle-du-levant": {
        "bpm": 110, "root": 58, "scale": [0, 1, 4, 5, 7, 8, 11],
        "inst": "square", "motif": [0, 4, 5, 7, 11, 7, 5, 4], "vol": 0.13,
    },
    "jardin-des-roses": {
        "bpm": 92, "root": 60, "scale": [0, 2, 3, 5, 7, 8, 10],
        "inst": "triangle", "motif": [0, 3, 5, 8, 7, 5, 3, 0], "vol": 0.16,
    },
}


def gen_map_loop(key: str, dur_s: float = 36.0) -> list[float]:
    th = MAP_THEMES[key]
    bpm = th["bpm"]
    beat = 60.0 / bpm
    n = int(dur_s * SR)
    samples = [0.0] * n
    root = th["root"]
    motif = th["motif"]
    inst = th["inst"]
    vol = th["vol"]
    # bass drone soft
    for i in range(n):
        t = i / SR
        samples[i] += 0.04 * math.sin(2 * math.pi * note_freq(root - 12) * t)
        samples[i] += 0.02 * math.sin(2 * math.pi * note_freq(root) * t * 0.5)
    # motif loop (eighth notes)
    step = beat / 2
    t = 0.0
    mi = 0
    while t < dur_s - 0.2:
        midi = root + motif[mi % len(motif)]
        start = int(t * SR)
        render_note(samples, start, step * 0.9, midi, inst, vol)
        # light harmony a fifth up every other beat
        if mi % 2 == 0:
            render_note(samples, start, step * 0.7, midi + 7, "sine", vol * 0.35)
        t += step
        mi += 1
    # soft snare-ish every beat (noise tick) for parade feel
    rng = random.Random(hash(key) & 0xFFFF)
    bt = 0.0
    while bt < dur_s:
        start = int(bt * SR)
        sn = int(0.04 * SR)
        for i in range(sn):
            idx = start + i
            if idx >= n:
                break
            samples[idx] += (rng.random() * 2 - 1) * 0.05 * env_adsr(i, sn, 0.005, 0.02, 0.3, 0.05)
        bt += beat
    # normalize softly + fade edges for loop
    peak = max(1e-6, max(abs(s) for s in samples))
    fade = int(0.08 * SR)
    for i in range(n):
        s = samples[i] / peak * 0.85
        if i < fade:
            s *= i / fade
        elif i > n - fade:
            s *= (n - i) / fade
        samples[i] = s
    return samples


# ---------------------------------------------------------------------------
# SFX
# ---------------------------------------------------------------------------

def gen_sfx_hit() -> list[float]:
    n = int(0.14 * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        f = 150 * math.exp(-t * 18)
        out[i] = 0.55 * math.sin(2 * math.pi * f * t) * env_adsr(i, n, 0.002, 0.04, 0.4, 0.08)
        out[i] += 0.2 * (random.random() * 2 - 1) * env_adsr(i, n, 0.001, 0.02, 0.2, 0.05)
    return out


def gen_sfx_smash() -> list[float]:
    n = int(0.28 * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        f = 220 * math.exp(-t * 12)
        out[i] = 0.6 * osc("triangle", f * t) * env_adsr(i, n, 0.002, 0.05, 0.35, 0.12)
        out[i] += 0.35 * (random.random() * 2 - 1) * math.exp(-t * 25)
    return out


def gen_sfx_warn() -> list[float]:
    n = int(0.35 * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        f = 220 if t < 0.14 else 280
        out[i] = 0.35 * osc("triangle", f * t) * env_adsr(i, n, 0.01, 0.05, 0.6, 0.1)
    return out


def gen_sfx_point() -> list[float]:
    n = int(0.4 * SR)
    out = [0.0] * n
    for midi, delay, dur in [(69, 0.0, 0.12), (73, 0.08, 0.18), (76, 0.16, 0.12)]:
        render_note(out, int(delay * SR), dur, midi, "sine", 0.35)
    return out


def gen_sfx_wall() -> list[float]:
    n = int(0.08 * SR)
    return [(random.random() * 2 - 1) * 0.4 * env_adsr(i, n, 0.001, 0.02, 0.3, 0.04) for i in range(n)]


def gen_sfx_net() -> list[float]:
    n = int(0.1 * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        out[i] = 0.25 * osc("triangle", 200 * t) * env_adsr(i, n)
        out[i] += 0.2 * (random.random() * 2 - 1) * math.exp(-t * 30)
    return out


def gen_sfx_jump() -> list[float]:
    n = int(0.12 * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        f = 180 + t * 220
        out[i] = 0.28 * osc("sine", f * t) * env_adsr(i, n, 0.005, 0.03, 0.4, 0.06)
    return out


def gen_sfx_bomb_tick() -> list[float]:
    n = int(0.05 * SR)
    return [
        0.3 * osc("square", 880 * (i / SR)) * env_adsr(i, n, 0.001, 0.01, 0.3, 0.02)
        + 0.15 * (random.random() * 2 - 1) * env_adsr(i, n)
        for i in range(n)
    ]


def gen_sfx_bomb_blast() -> list[float]:
    n = int(0.55 * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        f = 90 * math.exp(-t * 4)
        out[i] = 0.55 * osc("saw", f * t) * env_adsr(i, n, 0.005, 0.1, 0.4, 0.25)
        out[i] += 0.35 * (random.random() * 2 - 1) * math.exp(-t * 6)
    return out


def gen_sfx_cannon_fire() -> list[float]:
    n = int(0.45 * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        f = 110 * math.exp(-t * 5)
        out[i] = 0.5 * osc("saw", f * t) * env_adsr(i, n, 0.004, 0.08, 0.35, 0.2)
        out[i] += 0.3 * (random.random() * 2 - 1) * math.exp(-t * 8)
    return out


def gen_sfx_cannon_hit() -> list[float]:
    n = int(0.18 * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        out[i] = 0.4 * (random.random() * 2 - 1) * math.exp(-t * 18)
        out[i] += 0.25 * osc("triangle", 320 * t) * env_adsr(i, n)
    return out


def gen_sfx_battle_start() -> list[float]:
    n = int(0.35 * SR)
    out = [0.0] * n
    render_note(out, 0, 0.1, 81, "square", 0.3)
    render_note(out, int(0.04 * SR), 0.22, 69, "saw", 0.2)
    for i in range(int(0.06 * SR)):
        out[i] += (random.random() * 2 - 1) * 0.2 * env_adsr(i, int(0.06 * SR))
    return out


def gen_sfx_battle_end() -> list[float]:
    n = int(0.4 * SR)
    out = [0.0] * n
    for i in range(n):
        t = i / SR
        out[i] = 0.4 * osc("saw", 180 * math.exp(-t * 3) * t) * env_adsr(i, n, 0.01, 0.1, 0.4, 0.2)
    return out


def gen_sfx_match_win() -> list[float]:
    n = int(0.5 * SR)
    out = [0.0] * n
    for midi, delay in [(72, 0.0), (76, 0.1), (79, 0.2)]:
        render_note(out, int(delay * SR), 0.14 if delay < 0.2 else 0.24, midi, "triangle", 0.3)
    return out


def gen_stinger(kind: str) -> list[float]:
    n = int(0.6 * SR)
    out = [0.0] * n
    if kind == "hub":
        for midi, delay in [(60, 0.0), (64, 0.12), (67, 0.24)]:
            render_note(out, int(delay * SR), 0.2, midi, "triangle", 0.28)
    elif kind == "act":
        for midi, delay in [(55, 0.0), (62, 0.15), (67, 0.3)]:
            render_note(out, int(delay * SR), 0.22, midi, "saw", 0.22)
    elif kind == "win":
        for midi, delay in [(67, 0.0), (71, 0.1), (74, 0.2), (79, 0.32)]:
            render_note(out, int(delay * SR), 0.18, midi, "sine", 0.3)
    elif kind == "lose":
        for midi, delay in [(64, 0.0), (60, 0.15), (55, 0.3)]:
            render_note(out, int(delay * SR), 0.25, midi, "triangle", 0.28)
    elif kind == "blip":
        render_note(out, 0, 0.06, 76, "sine", 0.2)
        n = int(0.08 * SR)
        out = out[:n]
    else:
        render_note(out, 0, 0.2, 60, "sine", 0.25)
    return out


def gen_event_sfx(name: str) -> list[float]:
    """SFX events map — variations légères sur warn/fire."""
    if name.endswith("_warn") or name == "warn":
        return gen_sfx_warn()
    if "fire" in name or name in ("cart", "macaw", "peacock", "lantern", "carpet", "cow", "radar", "march"):
        base = gen_sfx_cannon_fire()
        # pitch-shift-ish by resampling feel via phase tweak
        factor = 0.85 + (hash(name) % 30) / 100.0
        n = len(base)
        out = [0.0] * n
        for i in range(n):
            src = int(i * factor) % n
            out[i] = base[src] * 0.9
        return out
    if "impact" in name or "hit" in name:
        return gen_sfx_cannon_hit()
    return gen_sfx_warn()


SFX_CORE = {
    "hit": gen_sfx_hit,
    "smash": gen_sfx_smash,
    "wall": gen_sfx_wall,
    "net": gen_sfx_net,
    "point": gen_sfx_point,
    "match_win": gen_sfx_match_win,
    "battle_start": gen_sfx_battle_start,
    "battle_end": gen_sfx_battle_end,
    "bomb_tick": gen_sfx_bomb_tick,
    "bomb_blast": gen_sfx_bomb_blast,
    "jump": gen_sfx_jump,
    "cannon_warn": gen_sfx_warn,
    "cannon_fire": gen_sfx_cannon_fire,
    "cannon_hit": gen_sfx_cannon_hit,
}

EVENT_SFX = [
    "warn",
    "cannon_fire", "cannon_impact",
    "cart", "macaw", "peacock", "lantern", "carpet", "cow", "radar", "march",
]

STORY_STINGS = ["hub", "act", "win", "lose", "blip"]


def emit(path: Path, samples: list[float], to_mp3: bool = True) -> Path:
    write_wav(path.with_suffix(".wav"), samples)
    if to_mp3:
        return maybe_mp3(path.with_suffix(".wav"))
    return path.with_suffix(".wav")


def write_spike() -> None:
    out = ROOT / "raw" / "audio" / "_spike"
    out.mkdir(parents=True, exist_ok=True)
    (out / "README.md").write_text(
        """# Spike audio Sommet Volley

Généré par `tools/gen_audio_synth.py spike` — fallback procédural.

## Inventaire outils (machine)

- Codex CLI : **imagegen seulement** (pas d'outil audio natif)
- `openai` CLI / pkg : absent ; `OPENAI_API_KEY` vide dans l'env
- ffmpeg : utilisé si installé (sinon WAV)
- Fallback plan : synth enrichi + boucles procédurales ; musiques Gemini/web
  peuvent remplacer les fichiers dans `assets/audio/maps/`

## Samples

| Fichier | Rôle |
|---------|------|
| `place-ecarlate_loop.*` | Boucle map ~36 s (Place Écarlate) |
| `hit.*` | SFX touche balle |
| `smash.*` | SFX smash |
| `warn.*` | SFX alerte event |
| `point.*` | Stinger point marqué |

## Checklist écoute

- [ ] Boucle propre (pas de clic audible aux joints)
- [ ] Pas de voix / paroles
- [ ] Poids fichier raisonnable (< ~1 Mo / map en MP3)
- [ ] Licence OK (contenu généré localement)
""",
        encoding="utf-8",
    )
    emit(out / "place-ecarlate_loop", gen_map_loop("place-ecarlate", 36.0))
    emit(out / "hit", gen_sfx_hit())
    emit(out / "smash", gen_sfx_smash())
    emit(out / "warn", gen_sfx_warn())
    emit(out / "point", gen_sfx_point())
    print(f"spike → {out}")


def write_manifest(maps_ext: str, sfx_ext: str) -> None:
    import json

    maps = {
        k: {"file": f"maps/{k}.{maps_ext}", "gain": 0.32, "loop": True}
        for k in MAP_THEMES
    }
    sfx = {
        name: {"file": f"sfx/{name}.{sfx_ext}", "gain": 1.0}
        for name in SFX_CORE
    }
    for name in EVENT_SFX:
        if name not in sfx:
            sfx[name] = {"file": f"sfx/event_{name}.{sfx_ext}", "gain": 1.0}
    story = {
        name: {"file": f"story/{name}.{sfx_ext}", "gain": 0.9}
        for name in STORY_STINGS
    }
    manifest = {
        "version": 1,
        "fallbackMusic": "mayor-parade.mp3",
        "musicGain": 0.32,
        "maps": maps,
        "sfx": sfx,
        "story": story,
    }
    path = ROOT / "assets" / "audio" / "manifest.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"manifest → {path}")


def write_full() -> None:
    maps_dir = ROOT / "assets" / "audio" / "maps"
    sfx_dir = ROOT / "assets" / "audio" / "sfx"
    story_dir = ROOT / "assets" / "audio" / "story"
    maps_ext = "mp3"
    sfx_ext = "mp3"
    for key in MAP_THEMES:
        p = emit(maps_dir / key, gen_map_loop(key, 36.0))
        maps_ext = p.suffix.lstrip(".")
        print(f"  map {key} → {p.name}")
    for name, fn in SFX_CORE.items():
        p = emit(sfx_dir / name, fn())
        sfx_ext = p.suffix.lstrip(".")
        print(f"  sfx {name}")
    for name in EVENT_SFX:
        if name in SFX_CORE:
            continue
        p = emit(sfx_dir / f"event_{name}", gen_event_sfx(name))
        sfx_ext = p.suffix.lstrip(".")
        print(f"  event {name}")
    for name in STORY_STINGS:
        p = emit(story_dir / name, gen_stinger(name))
        sfx_ext = p.suffix.lstrip(".")
        print(f"  story {name}")
    # keep legacy parade as fallback (already present)
    write_manifest(maps_ext, sfx_ext)


def main() -> None:
    cmd = (sys.argv[1] if len(sys.argv) > 1 else "spike").lower()
    if cmd == "spike":
        write_spike()
    elif cmd == "full":
        write_full()
    elif cmd == "maps":
        for key in MAP_THEMES:
            emit(ROOT / "assets" / "audio" / "maps" / key, gen_map_loop(key, 36.0))
            print(key)
        write_manifest("mp3", "mp3")
    elif cmd == "sfx":
        for name, fn in SFX_CORE.items():
            emit(ROOT / "assets" / "audio" / "sfx" / name, fn())
        for name in EVENT_SFX:
            if name not in SFX_CORE:
                emit(ROOT / "assets" / "audio" / "sfx" / f"event_{name}", gen_event_sfx(name))
        for name in STORY_STINGS:
            emit(ROOT / "assets" / "audio" / "story" / name, gen_stinger(name))
        write_manifest("mp3", "mp3")
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
