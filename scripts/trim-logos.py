"""Trims partner logos to their visible artwork for the site's logo loop.

Source files carry large transparent margins and stray marks, which make
logos look uneven side by side. A pixel counts as artwork when it is solid
and coloured or dark (the same rule as the certificate strip,
scripts/certificate/template.html).

    pip install pillow numpy
    python scripts/trim-logos.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

IMAGES = Path(__file__).resolve().parent.parent / "src" / "assets" / "images"
OUT = IMAGES / "partners"

LOGOS = {
    "logo-Emblom.webp": "kerala-excise.webp",
    "logo-mayangilla Keralam.webp": "mayangilla-keralam.webp",
    "logo-operation-thunder.webp": "operation-thunder.webp",
}

# The loop shows logos about 56 px tall; 400 px covers high-density screens.
MAX_HEIGHT = 400


def trim(image: Image.Image) -> Image.Image:
    rgba = np.asarray(image).astype(int)
    rgb, alpha = rgba[..., :3], rgba[..., 3]
    artwork = (alpha >= 128) & ((rgb.max(-1) - rgb.min(-1) >= 40) | (rgb.max(-1) <= 110))
    ys, xs = np.nonzero(artwork)
    return image.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for source, target in LOGOS.items():
        logo = trim(Image.open(IMAGES / source).convert("RGBA"))
        if logo.height > MAX_HEIGHT:
            width = round(logo.width * MAX_HEIGHT / logo.height)
            logo = logo.convert("RGBa").resize((width, MAX_HEIGHT), Image.LANCZOS).convert("RGBA")
        logo.save(OUT / target, quality=90, method=6)
        print(f"{target}: {logo.width} × {logo.height}")


if __name__ == "__main__":
    main()
