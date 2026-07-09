"""Lightweight tissue-quality heuristic.

Classical image statistics, not machine learning: no model, no inference, no
training. Every metric is computed deterministically from the uploaded pixels,
so the output changes with the input. Results are experimental and carry no
diagnostic meaning.
"""
from pathlib import Path

from PIL import Image, ImageFilter, ImageStat

# Analysis is done on a downscaled copy: the metrics below are all global
# statistics, so full resolution buys nothing but latency.
_MAX_DIM = 512

# ponytail: hand-tuned constants, calibrated on synthetic patches. These are the
# knobs to adjust if real sample images read consistently high or low.
_SHARPNESS_REF = 18.0   # edge-energy stddev treated as fully sharp
_TISSUE_LEVEL = 220     # grayscale below this counts as tissue, not slide background
_TISSUE_REF = 0.15      # tissue fraction treated as fully sufficient
_IDEAL_BRIGHTNESS = 0.55
_PASS, _REVIEW = 0.70, 0.40

# 3x3 Laplacian. offset=128 keeps negative responses representable in 8-bit,
# so a flat region lands on 128 and contributes no spread.
_LAPLACIAN = ImageFilter.Kernel((3, 3), [0, 1, 0, 1, -4, 1, 0, 1, 0], scale=1, offset=128)


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def _edge_energy(gray: Image.Image) -> float:
    """Spread of the Laplacian response — high for sharp images, ~0 for flat ones.

    Pillow's convolution leaves the 1px border unfiltered, so those pixels keep
    their original value while the interior sits at the kernel offset. Left in,
    that split alone reads as edge energy on a perfectly blank image, putting a
    floor under every score. Crop the border before measuring.
    """
    width, height = gray.size
    if width < 3 or height < 3:
        return 0.0
    edges = gray.filter(_LAPLACIAN).crop((1, 1, width - 1, height - 1))
    return ImageStat.Stat(edges).stddev[0]


def run(image_path: Path) -> dict:
    with Image.open(image_path) as img:
        gray = img.convert("L")
        gray.thumbnail((_MAX_DIM, _MAX_DIM))

        brightness = ImageStat.Stat(gray).mean[0] / 255.0
        edge_energy = _edge_energy(gray)

        histogram = gray.histogram()
        total = sum(histogram) or 1
        tissue_coverage = sum(histogram[:_TISSUE_LEVEL]) / total

    sharpness = _clamp01(edge_energy / _SHARPNESS_REF)
    coverage_score = _clamp01(tissue_coverage / _TISSUE_REF)
    # Triangular falloff either side of the ideal exposure.
    brightness_score = _clamp01(1.0 - abs(brightness - _IDEAL_BRIGHTNESS) / _IDEAL_BRIGHTNESS)

    quality_score = round(
        0.5 * sharpness + 0.3 * coverage_score + 0.2 * brightness_score, 3
    )
    status = "pass" if quality_score >= _PASS else "review" if quality_score >= _REVIEW else "fail"

    warnings = []
    if sharpness < 0.4:
        warnings.append("Low edge detail — the image may be out of focus.")
    if tissue_coverage < _TISSUE_REF:
        warnings.append("Little tissue detected — the image is mostly background.")
    if brightness > 0.85:
        warnings.append("Image appears over-exposed.")
    elif brightness < 0.20:
        warnings.append("Image appears under-exposed.")

    return {
        "algorithm_name": "quality_check_v1",
        "algorithm_version": "1.0.0",
        "result_type": "quality_check",
        "summary": "Experimental image-quality screen computed from the uploaded image.",
        "metrics": {
            # All ratios are 0-1 fractions; the frontend formats them.
            "quality_score": quality_score,
            "status": status,
            "sharpness": round(sharpness, 3),
            "brightness": round(brightness, 3),
            "tissue_coverage": round(tissue_coverage, 3),
        },
        "findings": [],
        "warnings": warnings,
        "disclaimer": "Prototype only — not for clinical use. This is a heuristic quality screen, not a diagnosis.",
        "model_metadata": {
            "method": "grayscale statistics + Laplacian edge energy",
            "analysed_at_max_dim": _MAX_DIM,
        },
    }
