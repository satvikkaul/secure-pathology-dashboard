"""Algorithm registry + input-contract checks. Run: python test_registry.py

Covers: every registered algorithm honours run(image_path) and returns a valid
envelope; sync_algorithms upserts, updates, and prunes the algorithms table.
"""
import os
import tempfile
from pathlib import Path

os.environ.setdefault("SECRET_KEY", "test-only-secret-not-a-real-key-0123456789")

from PIL import Image
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import models, schemas
from app.algorithms import REGISTRY, AlgorithmSpec
from app.database import Base
from app.main import sync_algorithms


def _session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)()


# ── Input contract: every algorithm reads a real image and returns a valid envelope
with tempfile.TemporaryDirectory() as tmp:
    img_path = Path(tmp) / "sample.png"
    Image.new("RGB", (128, 96), (200, 160, 190)).save(img_path)

    assert REGISTRY, "registry must not be empty"
    for name, spec in REGISTRY.items():
        result = spec.run(img_path)  # positional path — the contract
        env = schemas.ResultEnvelope.model_validate(result)
        assert env.algorithm_name == name, f"{name}: envelope name mismatch"
        assert env.result_type == spec.result_type, f"{name}: result_type mismatch"
        assert env.algorithm_version == spec.version, f"{name}: version mismatch"

    # The algorithm actually opened the file (proves the input contract works).
    ph = REGISTRY["placeholder_v1"].run(img_path)
    assert ph["model_metadata"]["image_width"] == 128
    assert ph["model_metadata"]["image_height"] == 96

    # A missing image surfaces as an error, not a silent bogus result.
    try:
        REGISTRY["placeholder_v1"].run(Path(tmp) / "does_not_exist.png")
        raise SystemExit("FAIL: missing image did not raise")
    except FileNotFoundError:
        pass

# ── sync_algorithms: insert
db = _session()
sync_algorithms(db)
rows = {a.name: a for a in db.query(models.Algorithm).all()}
assert set(rows) == set(REGISTRY), f"expected {set(REGISTRY)}, got {set(rows)}"
assert rows["placeholder_v1"].result_type == "classification"

# ── sync_algorithms: update in place (no duplicate row)
rows["placeholder_v1"].display_name = "STALE"
db.commit()
sync_algorithms(db)
refreshed = db.query(models.Algorithm).filter_by(name="placeholder_v1").one()
assert refreshed.display_name == REGISTRY["placeholder_v1"].display_name, "stale row not refreshed"
assert db.query(models.Algorithm).count() == len(REGISTRY), "duplicate row created"

# ── sync_algorithms: prune rows no longer in the registry
db.add(models.Algorithm(
    name="retired_v0", display_name="Retired", description="gone",
    version="0.0.1", result_type="generic",
))
db.commit()
sync_algorithms(db)
names = {a.name for a in db.query(models.Algorithm).all()}
assert "retired_v0" not in names, "stale algorithm not pruned"

# ── A second algorithm is picked up (the old "seed if empty" guard missed this)
REGISTRY["fake_v1"] = AlgorithmSpec(
    name="fake_v1", display_name="Fake", description="test only",
    version="9.9.9", result_type="generic", run=lambda p: {},
)
try:
    sync_algorithms(db)
    names = {a.name for a in db.query(models.Algorithm).all()}
    assert "fake_v1" in names, "second algorithm not added to catalog"
finally:
    del REGISTRY["fake_v1"]

print("OK — algorithm registry and input-contract checks passed")
