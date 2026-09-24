"""Trace the Drug Free Kerala dove (green pixels only) to an SVG path.

Produced DOVE_PATH in src/components/brand/dove-path.ts. Only needed again if
the logo artwork changes.

    pip install potracer pillow numpy
    python scripts/trace-dove.py src/assets/images/logo-drug-free-kerala.png dove-path.txt
"""
import sys
import numpy as np
import potrace
from PIL import Image, ImageFilter

S = 16  # supersampling factor
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA").crop((0, 0, 50, 61))
a = np.asarray(im).astype(float)
saturation = a[..., :3].max(-1) - a[..., :3].min(-1)
coverage = np.clip((saturation - 20) / 60, 0, 1) * (a[..., 3] / 255)
big = Image.fromarray((coverage * 255).astype("uint8")).resize((50 * S, 61 * S), Image.LANCZOS)
big = big.filter(ImageFilter.GaussianBlur(S * 0.35))
mask = np.asarray(big) > 127
# potracer treats False as ink, so pass the inverse of the dove mask.
path = potrace.Bitmap(~mask).trace(turdsize=50, alphamax=1.1, opticurve=True, opttolerance=0.4)

fmt = lambda v: f"{v / S:.2f}".rstrip("0").rstrip(".")
parts = []
for curve in path:
    parts.append(f"M{fmt(curve.start_point.x)} {fmt(curve.start_point.y)}")
    for seg in curve.segments:
        if seg.is_corner:
            parts.append(f"L{fmt(seg.c.x)} {fmt(seg.c.y)}L{fmt(seg.end_point.x)} {fmt(seg.end_point.y)}")
        else:
            parts.append(
                f"C{fmt(seg.c1.x)} {fmt(seg.c1.y)} {fmt(seg.c2.x)} {fmt(seg.c2.y)} {fmt(seg.end_point.x)} {fmt(seg.end_point.y)}"
            )
    parts.append("Z")
open(out, "w").write("".join(parts))
print(len(path), "curves")
