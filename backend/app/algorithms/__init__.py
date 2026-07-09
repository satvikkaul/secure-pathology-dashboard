"""Algorithm registry — the single source of truth for available algorithms.

Adding an algorithm means adding one AlgorithmSpec below. The `algorithms` DB
table is a projection of this registry (synced at startup), so the dropdown can
never offer something the dispatcher cannot run, and vice versa.

Contract every algorithm must satisfy:

    run(image_path: Path) -> dict

    Input : absolute path to the caller's own stored image (JPG/PNG, <=10 MB,
            already type/size/magic-byte validated by the images router).
    Output: a dict conforming to schemas.ResultEnvelope, validated at job
            completion. See ALGORITHM_RESULT_TEMPLATE_PLAN.md.

Algorithms receive only the image path: no DB session, no user, no request.
They must not read or write anything outside the file they are handed.
"""
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from .placeholder import run as _run_placeholder


@dataclass(frozen=True)
class AlgorithmSpec:
    name: str
    display_name: str
    description: str
    version: str
    # Must match a key in the frontend template registry, or the generic
    # fallback renders it. See frontend/src/results/registry.js.
    result_type: str
    run: Callable[[Path], dict]
    input_requirements: str = "JPG/PNG, max 10 MB"
    experimental: bool = True


REGISTRY: dict[str, AlgorithmSpec] = {
    spec.name: spec
    for spec in (
        AlgorithmSpec(
            name="placeholder_v1",
            display_name="Placeholder Classifier v1",
            description=(
                "Synthetic placeholder for the prototype demo. "
                "Returns mock classification results; performs no real inference."
            ),
            version="1.0.0",
            result_type="classification",
            run=_run_placeholder,
        ),
    )
}
