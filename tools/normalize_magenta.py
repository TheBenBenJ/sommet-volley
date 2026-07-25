#!/usr/bin/env python3
"""Normalize generated chroma-key backgrounds to exact #FF00FF."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def normalize(path: Path) -> None:
    image = Image.open(path).convert("RGB")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue = pixels[x, y]
            if red > 170 and blue > 170 and green < 110:
                pixels[x, y] = (255, 0, 255)
    image.save(path)


def main() -> None:
    for value in sys.argv[1:]:
        normalize(Path(value))


if __name__ == "__main__":
    main()
