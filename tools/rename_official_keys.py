#!/usr/bin/env python3
"""One-shot: rename character/map keys to official game slugs (1C + 2A)."""
from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Longest-first for safe substitution
CHAR_MAP = [
    ("trompette", "dorf"),
    ("vladou", "volkoi"),
    ("micron", "cygne"),
    ("panda", "timonier"),
    ("yogi", "gourou"),
    ("jair", "capitaine"),
]

# TERRAINS.key / map pack folders → official terrain slug
# (old_assets_maps_folder OR old_terrains_key) → new
MAP_FOLDER_MAP = [
    # character-keyed packs currently loaded
    ("vladou", "place-ecarlate"),
    ("trompette", "country-club-dore"),
    ("micron", "palais-du-coq"),
    ("bebe", "esplanade-du-defile"),
    # thematic packs
    ("matin", "cite-du-matin"),
    ("bosphore", "pont-des-deux-mondes"),
    ("ashram", "stade-ashram"),
    ("amazon", "grande-foret"),
    ("colline", "citadelle-du-levant"),
    ("roseraie", "jardin-des-roses"),
    # old TERRAINS.key folders in raw/maps
    ("neige", "place-ecarlate"),
    ("plage", "country-club-dore"),
    ("prairie", "palais-du-coq"),
    ("parade", "esplanade-du-defile"),
]

# SPRITES / function identifier renames
SPRITE_MAP = [
    ("mapVladou", "mapPlaceEcarlate"),
    ("mapTrompette", "mapCountryClubDore"),
    ("mapMicron", "mapPalaisDuCoq"),
    ("mapBebe", "mapEsplanadeDuDefile"),
    ("mapMatin", "mapCiteDuMatin"),
    ("mapBosphore", "mapPontDesDeuxMondes"),
    ("mapAshram", "mapStadeAshram"),
    ("mapAmazon", "mapGrandeForet"),
    ("mapColline", "mapCitadelleDuLevant"),
    ("mapRoseraie", "mapJardinDesRoses"),
    ("initMapVladou", "initMapPlaceEcarlate"),
    ("initMapTrompette", "initMapCountryClubDore"),
    ("initMapMicron", "initMapPalaisDuCoq"),
    ("initMapBebe", "initMapEsplanadeDuDefile"),
    ("initMapMatin", "initMapCiteDuMatin"),
    ("initMapBosphore", "initMapPontDesDeuxMondes"),
    ("initMapAshram", "initMapStadeAshram"),
    ("initMapAmazon", "initMapGrandeForet"),
    ("initMapColline", "initMapCitadelleDuLevant"),
    ("initMapRoseraie", "initMapJardinDesRoses"),
    ("mapVladouReady", "mapPlaceEcarlateReady"),
    ("mapTrompetteReady", "mapCountryClubDoreReady"),
    ("mapMicronReady", "mapPalaisDuCoqReady"),
    ("mapBebeReady", "mapEsplanadeDuDefileReady"),
    ("mapMatinReady", "mapCiteDuMatinReady"),
    ("mapBosphoreReady", "mapPontDesDeuxMondesReady"),
    ("mapAshramReady", "mapStadeAshramReady"),
    ("mapAmazonReady", "mapGrandeForetReady"),
    ("mapCollineReady", "mapCitadelleDuLevantReady"),
    ("mapRoseraieReady", "mapJardinDesRosesReady"),
]

SKIP_DIR_PARTS = {
    "node_modules", ".git", "_bak_", "_old_bak", "vladou_grok_backup",
    "_bak_bebe", "_bak_panda",
}

TEXT_EXTS = {
    ".js", ".py", ".md", ".yaml", ".yml", ".json", ".html", ".txt", ".sh",
}


def git_mv(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        print(f"  SKIP exists: {dst.relative_to(ROOT)}")
        return
    if not src.exists():
        print(f"  SKIP missing: {src.relative_to(ROOT)}")
        return
    try:
        subprocess.check_call(
            ["git", "mv", str(src), str(dst)],
            cwd=ROOT,
            stderr=subprocess.DEVNULL,
        )
        print(f"  git mv {src.relative_to(ROOT)} → {dst.relative_to(ROOT)}")
    except subprocess.CalledProcessError:
        import shutil
        shutil.move(str(src), str(dst))
        # stage if under git
        try:
            subprocess.check_call(["git", "add", "-A", str(dst)], cwd=ROOT, stderr=subprocess.DEVNULL)
        except subprocess.CalledProcessError:
            pass
        print(f"  mv (untracked) {src.relative_to(ROOT)} → {dst.relative_to(ROOT)}")


def should_skip_path(p: Path) -> bool:
    s = str(p)
    for part in SKIP_DIR_PARTS:
        if part in s:
            return True
    return False


def rename_char_dirs() -> None:
    print("== character dirs ==")
    for old, new in CHAR_MAP:
        for base in (ROOT / "assets", ROOT / "raw", ROOT / "docs" / "chars", ROOT / "docs" / "histoires"):
            if base.name == "chars":
                src, dst = base / f"{old}.yaml", base / f"{new}.yaml"
            elif base.name == "histoires":
                src, dst = base / f"{old}.md", base / f"{new}.md"
            else:
                src, dst = base / old, base / new
            git_mv(src, dst)


def rename_map_dirs() -> None:
    print("== map dirs ==")
    # Character-keyed orphans in assets/maps (jair, panda, …) → new char slug
    for old, new in CHAR_MAP:
        for base in (ROOT / "assets" / "maps", ROOT / "raw" / "maps"):
            src, dst = base / old, base / new
            if src.exists() and not dst.exists():
                git_mv(src, dst)

    # Terrain packs → official names (order: unique targets)
    # Process assets/maps used packs
    assets_maps = ROOT / "assets" / "maps"
    raw_maps = ROOT / "raw" / "maps"

    assets_renames = [
        ("vladou", "place-ecarlate"),  # may already be volkoi if char map ran on maps — handle both
        ("volkoi", "place-ecarlate"),
        ("trompette", "country-club-dore"),
        ("dorf", "country-club-dore"),
        ("micron", "palais-du-coq"),
        ("cygne", "palais-du-coq"),
        ("bebe", "esplanade-du-defile"),
        ("matin", "cite-du-matin"),
        ("bosphore", "pont-des-deux-mondes"),
        ("ashram", "stade-ashram"),
        ("amazon", "grande-foret"),
        ("colline", "citadelle-du-levant"),
        ("roseraie", "jardin-des-roses"),
    ]
    for old, new in assets_renames:
        git_mv(assets_maps / old, assets_maps / new)

    raw_renames = [
        ("neige", "place-ecarlate"),
        ("vladou", "place-ecarlate"),
        ("volkoi", "place-ecarlate"),
        ("plage", "country-club-dore"),
        ("trompette", "country-club-dore"),
        ("dorf", "country-club-dore"),
        ("prairie", "palais-du-coq"),
        ("micron", "palais-du-coq"),
        ("cygne", "palais-du-coq"),
        ("parade", "esplanade-du-defile"),
        ("bebe", "esplanade-du-defile"),
        ("matin", "cite-du-matin"),
        ("bosphore", "pont-des-deux-mondes"),
        ("ashram", "stade-ashram"),
        ("amazon", "grande-foret"),
        ("colline", "citadelle-du-levant"),
        ("roseraie", "jardin-des-roses"),
        # leftover char-keyed
        ("jair", "capitaine"),
        ("panda", "timonier"),
        ("yogi", "gourou"),
        ("sultan", "sultan"),  # noop
    ]
    for old, new in raw_renames:
        if old == new:
            continue
        git_mv(raw_maps / old, raw_maps / new)


def replace_in_text(text: str) -> str:
    # SPRITES first (unique identifiers)
    for old, new in SPRITE_MAP:
        text = text.replace(old, new)
    # TERRAINS keys (quoted / bare in comparisons)
    terrain_keys = [
        ("neige", "place-ecarlate"),
        ("plage", "country-club-dore"),
        ("prairie", "palais-du-coq"),
        ("parade", "esplanade-du-defile"),
        ("matin", "cite-du-matin"),
        ("bosphore", "pont-des-deux-mondes"),
        ("ashram", "stade-ashram"),
        ("amazon", "grande-foret"),
        ("colline", "citadelle-du-levant"),
        ("roseraie", "jardin-des-roses"),
    ]
    for old, new in terrain_keys:
        text = re.sub(rf'(["\']){re.escape(old)}\1', rf'\1{new}\1', text)
        # object keys like  neige:  or amazon:
        text = re.sub(rf'^(\s*){re.escape(old)}(\s*:)', rf'\1{new}\2', text, flags=re.M)
        # loadMapPack("old"
        text = text.replace(f'loadMapPack("{old}"', f'loadMapPack("{new}"')
        text = text.replace(f"loadMapPack('{old}'", f"loadMapPack('{new}'")

    for old, new in CHAR_MAP:
        # quoted keys only (évite de manger le français : « trompette », etc.)
        text = re.sub(rf'(["\']){re.escape(old)}\1', rf'\1{new}\1', text)
        # path segments
        text = text.replace(f"assets/{old}/", f"assets/{new}/")
        text = text.replace(f"raw/{old}/", f"raw/{new}/")
        text = text.replace(f"raw/{old}", f"raw/{new}")
        text = text.replace(f"docs/chars/{old}", f"docs/chars/{new}")
        text = text.replace(f"docs/histoires/{old}", f"docs/histoires/{new}")
        text = text.replace(f"maps/{old}/", f"maps/{new}/")
        text = text.replace(f"maps/{old}", f"maps/{new}")
        # YAML / object keys en début de ligne
        text = re.sub(rf'^(\s*){re.escape(old)}(\s*:)', rf'\1{new}\2', text, flags=re.M)
        # backticks docs `old`
        text = text.replace(f"`{old}`", f"`{new}`")

    return text


def rewrite_files() -> None:
    print("== rewrite text ==")
    roots = [
        ROOT / "src",
        ROOT / "tests",
        ROOT / "tools",
        ROOT / "docs",
        ROOT / ".claude",
        ROOT,
    ]
    files: list[Path] = []
    for r in roots:
        if not r.exists():
            continue
        if r.is_file():
            files.append(r)
            continue
        for p in r.rglob("*"):
            if not p.is_file():
                continue
            if should_skip_path(p):
                continue
            if p.suffix.lower() not in TEXT_EXTS and p.name not in ("SKILL.md",):
                continue
            # skip this script itself mid-run content? allow — it's the mapping source
            if "node_modules" in p.parts:
                continue
            if p.name == "rename_official_keys.py":
                continue
            files.append(p)

    # de-dupe
    seen = set()
    uniq = []
    for p in files:
        if p in seen:
            continue
        seen.add(p)
        uniq.append(p)

    n = 0
    for p in uniq:
        try:
            raw = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        new = replace_in_text(raw)
        if new != raw:
            p.write_text(new, encoding="utf-8")
            n += 1
            print(f"  edit {p.relative_to(ROOT)}")
    print(f"  {n} files updated")


def main() -> None:
    rename_char_dirs()
    rename_map_dirs()
    rewrite_files()
    print("done")


if __name__ == "__main__":
    main()
