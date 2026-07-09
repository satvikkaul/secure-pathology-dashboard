import time
from pathlib import Path

from PIL import Image


def run(image_path: Path) -> dict:
    """Synthetic placeholder. Performs no real inference.

    Reads only the image dimensions, to exercise the input contract — the
    classification output below is fixed and carries no medical meaning.
    Emits the ResultEnvelope shape, validated by the jobs router before storage.
    """
    time.sleep(1)  # simulates processing time for demo
    with Image.open(image_path) as img:
        width, height = img.size

    return {
        "algorithm_name": "placeholder_v1",
        "algorithm_version": "1.0.0",
        "result_type": "classification",
        "summary": "Experimental placeholder classification result.",
        "metrics": {
            "predicted_class": "benign",
            "confidence": 0.87,
        },
        "findings": [
            {"label": "Normal gland architecture", "score": 0.91},
            {"label": "No mitotic figures detected", "score": 0.84},
        ],
        "warnings": [],
        "disclaimer": "Placeholder result — prototype only. Not for clinical use.",
        "model_metadata": {
            "notes": "synthetic placeholder",
            "image_width": width,
            "image_height": height,
        },
    }
