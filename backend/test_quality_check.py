"""quality_check_v1 behaviour checks. Run: python test_quality_check.py

The point of this algorithm is that its output depends on the actual pixels.
These checks fail if it ever degrades into returning constants.
"""
import os
import random
import tempfile
from pathlib import Path

os.environ.setdefault("SECRET_KEY", "test-only-secret-not-a-real-key-0123456789")

from PIL import Image, ImageDraw, ImageFilter

from app.algorithms.quality_check import run


def tissue(blur: float = 0.0) -> Image.Image:
    random.seed(1)
    im = Image.new("RGB", (640, 640), (238, 220, 232))
    d = ImageDraw.Draw(im)
    for _ in range(900):
        x, y = random.randint(0, 640), random.randint(0, 640)
        r = random.randint(3, 7)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(100, 60, 140))
    return im.filter(ImageFilter.GaussianBlur(blur)) if blur else im


tmp = Path(tempfile.mkdtemp())


def metrics_for(img: Image.Image, name: str) -> dict:
    p = tmp / f"{name}.png"
    img.save(p)
    return run(p)["metrics"]


sharp = metrics_for(tissue(0.5), "sharp")
blurry = metrics_for(tissue(7.0), "blurry")
blank = metrics_for(Image.new("RGB", (640, 640), (252, 252, 252)), "blank")
dark = metrics_for(Image.new("RGB", (640, 640), (18, 18, 18)), "dark")

# Output tracks the input: blurring an image must lower sharpness and quality.
assert sharp["sharpness"] > blurry["sharpness"], "blur did not reduce sharpness"
assert sharp["quality_score"] > blurry["quality_score"], "blur did not reduce quality"

# A flat image has no edges. Pillow leaves the convolution border unfiltered,
# which reads as fake edge energy unless it is cropped — guard that regression.
assert blank["sharpness"] == 0.0, f"flat image reported sharpness {blank['sharpness']}"
assert blank["tissue_coverage"] == 0.0, "blank slide should show no tissue"
assert blank["status"] == "fail", "blank slide should not pass the screen"

# Exposure extremes are detected.
assert dark["brightness"] < 0.2, "dark image should read as under-exposed"
assert sharp["status"] == "pass", f"clean tissue should pass, got {sharp['status']}"

# Every ratio stays a 0-1 fraction (the shared metric vocabulary).
for name, m in (("sharp", sharp), ("blurry", blurry), ("blank", blank), ("dark", dark)):
    for key in ("quality_score", "sharpness", "brightness", "tissue_coverage"):
        assert 0.0 <= m[key] <= 1.0, f"{name}.{key} out of range: {m[key]}"
    assert m["status"] in {"pass", "review", "fail"}, f"{name}: bad status {m['status']}"

# Warnings are raised, not silently swallowed.
assert any("focus" in w for w in run(tmp / "blurry.png")["warnings"]), "no blur warning"
assert any("background" in w for w in run(tmp / "blank.png")["warnings"]), "no coverage warning"

print("OK — quality_check_v1 behaviour checks passed")
