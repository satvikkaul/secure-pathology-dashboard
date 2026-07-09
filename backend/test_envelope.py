"""Result-envelope contract checks. Run: python test_envelope.py (no pytest).

Covers: placeholder_v1 conforms to ResultEnvelope; malformed envelopes are
rejected (which the jobs router turns into a failed job, never a stored blob).
"""
import os
os.environ.setdefault("SECRET_KEY", "test-only-secret-not-a-real-key-0123456789")

import json
from pydantic import ValidationError
from app import schemas
from app.algorithms.placeholder import run


# placeholder_v1 output conforms to the envelope.
env = schemas.ResultEnvelope.model_validate(run(image_id=1))
assert env.result_type == "classification"
assert env.metrics["predicted_class"] == "benign"
assert env.findings[0].label == "Normal gland architecture"
assert "image_id" not in json.loads(env.model_dump_json()), "image_id must not be echoed"

# Missing mandatory field is rejected.
bad = run(image_id=1)
del bad["result_type"]
try:
    schemas.ResultEnvelope.model_validate(bad)
    raise SystemExit("FAIL: envelope without result_type accepted")
except ValidationError:
    pass

# Over-long summary is rejected (max_length bound).
bad = run(image_id=1)
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

print("OK — result envelope contract checks passed")
