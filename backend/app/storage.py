import os
from pathlib import Path

# Anchored to backend/ so the path is stable regardless of the working
# directory uvicorn is launched from.
_BACKEND_DIR = Path(__file__).resolve().parents[1]


def get_upload_dir() -> Path:
    raw = os.getenv("UPLOAD_DIR", "uploads")
    path = Path(raw)
    if not path.is_absolute():
        path = _BACKEND_DIR / path
    path.mkdir(parents=True, exist_ok=True)
    return path


def image_path(stored_filename: str) -> Path:
    """Absolute path to a stored upload. Private dir, never served over HTTP."""
    return get_upload_dir() / stored_filename
