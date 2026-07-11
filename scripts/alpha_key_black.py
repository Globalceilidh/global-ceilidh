"""Alpha-key the black background out of the /AnTonn/test PNGs.

Each source PNG has a solid black canvas around a white/grey/glowing
figure or letterform. We want the black to become transparent so the
image sits cleanly on top of the wave shader, WITHOUT washing out the
figure itself.

Approach: threshold-based luminance-to-alpha with a soft edge.
  * Compute luminance L for each pixel (Rec. 709 weights).
  * If L >= UPPER, alpha stays fully opaque.
  * If L <= LOWER, alpha goes to 0 (fully transparent).
  * Between LOWER and UPPER, alpha ramps linearly.

The ramp band handles anti-aliased edges gracefully — no hard cut-out
halo around the figures.

Tunables:
  LOWER=6   — below this luminance, pixel is background.
  UPPER=28  — above this, pixel is figure. Ramp lives between.

Runs on the six /AnTonn/test PNGs in place — overwrites originals.
"""
from __future__ import annotations
import sys
from pathlib import Path
import numpy as np
from PIL import Image

LOWER = 6.0
UPPER = 28.0

# Rec. 709 luminance weights.
WR, WG, WB = 0.2126, 0.7152, 0.0722


def alpha_key(path: Path) -> None:
    im = Image.open(path).convert("RGBA")
    arr = np.array(im).astype(np.float32)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    lum = WR * r + WG * g + WB * b

    # Piecewise-linear ramp: 0 below LOWER, 1 above UPPER, linear in between.
    ramp = np.clip((lum - LOWER) / (UPPER - LOWER), 0.0, 1.0)

    # Apply to alpha channel. Preserves any existing alpha the source
    # already had by taking the min of the two.
    new_alpha = np.minimum(a / 255.0, ramp) * 255.0
    arr[..., 3] = new_alpha

    out = Image.fromarray(arr.astype(np.uint8), mode="RGBA")
    out.save(path, format="PNG", optimize=True)
    print(f"  {path.name:35s} -> alpha-keyed ({im.size[0]}x{im.size[1]})")


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    target_dir = root / "public" / "AnTonn" / "test"
    targets = [
        "sniomh.png",
        "antonn-wordmark.png",
        "music-ceol.png",
        "film-bhidio.png",
        "books-leabhraichean.png",
        "podcast.png",
    ]
    print(f"Alpha-keying {len(targets)} images in {target_dir}")
    for name in targets:
        p = target_dir / name
        if not p.exists():
            print(f"  MISSING: {p}", file=sys.stderr)
            continue
        alpha_key(p)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
