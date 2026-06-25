import time


def run(image_id: int) -> dict:
    time.sleep(1)  # simulates processing time for demo
    return {
        "algorithm": "placeholder_v1",
        "image_id": image_id,
        "prediction": "benign",
        "confidence": 0.87,
        "findings": [
            {"label": "Normal gland architecture", "score": 0.91},
            {"label": "No mitotic figures detected", "score": 0.84},
        ],
        "note": "Placeholder result — Phase 1 prototype only. Not for clinical use.",
    }
