import time


def run(image_id: int) -> dict:
    time.sleep(1)  # simulates processing time for demo
    # Emits the ResultEnvelope shape (schemas.ResultEnvelope) — validated by the
    # jobs router before storage. image_id is not echoed; the job row stores it.
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
        "model_metadata": {"notes": "synthetic placeholder"},
    }
