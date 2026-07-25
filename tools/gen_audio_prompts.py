#!/usr/bin/env python3
"""Prompts audio canon (Gemini / outil web) pour Sommet Volley.

  python3 tools/gen_audio_prompts.py           # tout
  python3 tools/gen_audio_prompts.py maps
  python3 tools/gen_audio_prompts.py sfx
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from gen_audio_synth import EVENT_SFX, MAP_THEMES, SFX_CORE, STORY_STINGS  # noqa: E402

MAP_MOOD = {
    "place-ecarlate": "cold fortress winter parade, crimson bricks, distant cannon pomp",
    "country-club-dore": "sunny gold resort golf club swagger, brass and kitsch",
    "palais-du-coq": "neoclassical palace witty technocrat bounce, bright fanfare",
    "esplanade-du-defile": "brutalist military parade square, radar beep motif, stern march",
    "cite-du-matin": "imperial red-gold palace dawn, calm patient drone with chimes",
    "pont-des-deux-mondes": "strait between continents, dramatic bridges, modal brass",
    "stade-ashram": "honey sandstone stadium, meditative drone, soft pulse (no sacred chant)",
    "grande-foret": "golden jungle clearing, wood percussion, bright stabs",
    "citadelle-du-levant": "desert citadel sea cliff, sharp strings (no real bird samples)",
    "jardin-des-roses": "turquoise arcade rose garden, elegant waltz-march hybrid",
}


def prompt_map(key: str) -> str:
    mood = MAP_MOOD.get(key, key)
    return (
        f"Instrumental only cartoon political satire theme for a volleyball stage. "
        f"Short marching-band / light chiptune hybrid, seamless ~36s loop, "
        f"no vocals, no lyrics, no spoken voice, no real anthem. Mood: {mood}."
    )


def prompt_sfx(name: str) -> str:
    return (
        f"Short arcade/cartoon volleyball game SFX named '{name}', under 0.5 seconds, "
        f"no voice, no speech, clean one-shot, Steam-safe."
    )


def main() -> None:
    mode = (sys.argv[1] if len(sys.argv) > 1 else "all").lower()
    if mode in ("all", "maps"):
        print("## Maps\n")
        for key in MAP_THEMES:
            print(f"### {key}")
            print(prompt_map(key))
            print(f"→ assets/audio/maps/{key}.mp3\n")
    if mode in ("all", "sfx"):
        print("## SFX core\n")
        for name in SFX_CORE:
            print(f"- `{name}`: {prompt_sfx(name)}")
        print("\n## Events\n")
        for name in EVENT_SFX:
            print(f"- `event_{name}`: {prompt_sfx('event_' + name)}")
        print("\n## Story\n")
        for name in STORY_STINGS:
            print(f"- `{name}`: {prompt_sfx('story_' + name)}")


if __name__ == "__main__":
    main()
