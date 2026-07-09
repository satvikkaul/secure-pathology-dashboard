"""Result-envelope schema checks. Run: python test_envelope.py (no pytest).

Covers the envelope contract itself: mandatory fields, bounds, and defaults.
Malformed envelopes are rejected, which the jobs router turns into a failed job
rather than a stored blob the frontend would have to render.

Conformance of each real algorithm to this envelope is checked in test_registry.py.
"""
import os
os.environ.setdefault("SECRET_KEY", "test-only-secret-not-a-real-key-0123456789")

from pydantic import ValidationError
from app import schemas


def valid() -> dict:
    return {
        "algorithm_name": "example_v1",
        "algorithm_version": "1.0.0",
        "result_type": "classification",
        "summary": "Experimental placeholder classification result.",
        "metrics": {"predicted_class": "benign", "confidence": 0.87},
        "findings": [{"label": "Normal gland architecture", "score": 0.91}],
        "disclaimer": "Prototype only — not for clinical use.",
    }


# A well-formed envelope validates and preserves its parts.
env = schemas.ResultEnvelope.model_validate(valid())
assert env.result_type == "classification"
assert env.metrics["predicted_class"] == "benign"
assert env.findings[0].label == "Normal gland architecture"

# Each mandatory field is genuinely required.
for field in ("algorithm_name", "algorithm_version", "result_type", "summary"):
    bad = valid()
    del bad[field]
    try:
        schemas.ResultEnvelope.model_validate(bad)
        raise SystemExit(f"FAIL: envelope without {field} accepted")
    except ValidationError:
        pass

# Over-long free text is rejected (max_length bound at the trust boundary).
bad = valid()
bad["summary"] = "x" * 501
try:
    schemas.ResultEnvelope.model_validate(bad)
    raise SystemExit("FAIL: over-long summary accepted")
except ValidationError:
    pass

# Optional fields default cleanly (minimal envelope is valid).
minimal = schemas.ResultEnvelope.model_validate({
    "algorithm_name": "x", "algorithm_version": "0", "result_type": "generic",
    "summary": "s",
})
assert minimal.metrics == {} and minimal.findings == [] and minimal.warnings == []
assert minimal.visual_outputs == [] and minimal.model_metadata == {}

print("OK — result envelope schema checks passed")
