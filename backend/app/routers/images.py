import io
import logging
import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from PIL import Image as PILImage
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_current_user, get_db
from ..storage import get_upload_dir

logger = logging.getLogger(__name__)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_PIL_FORMATS = {"JPEG", "PNG"}
_CHUNK_SIZE = 64 * 1024  # 64 KB per read call

router = APIRouter(prefix="/images", tags=["images"])


async def _read_upload(file: UploadFile, max_bytes: int) -> bytes:
    """Stream file in chunks, rejecting as soon as the size limit is exceeded."""
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await file.read(_CHUNK_SIZE)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds the {max_bytes // (1024 * 1024)} MB size limit",
            )
        chunks.append(chunk)
    return b"".join(chunks)


def _verify_image(contents: bytes) -> None:
    """Confirm bytes decode as a valid JPEG or PNG using Pillow."""
    try:
        img = PILImage.open(io.BytesIO(contents))
        if img.format not in ALLOWED_PIL_FORMATS:
            raise HTTPException(status_code=422, detail="File is not a valid JPG or PNG image")
        img.verify()  # detects truncation and corruption
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=422, detail="File is not a valid JPG or PNG image")


@router.post("/", response_model=schemas.ImageOut, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if file.content_type not in ALLOWED_CONTENT_TYPES or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=422, detail="Only JPG and PNG files are accepted")

    max_bytes = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10")) * 1024 * 1024
    contents = await _read_upload(file, max_bytes)

    _verify_image(contents)

    stored_name = f"{uuid.uuid4()}{ext}"
    dest = get_upload_dir() / stored_name
    dest.write_bytes(contents)

    image = models.Image(
        owner_id=current_user.id,
        stored_filename=stored_name,
        content_type=file.content_type,
        file_size=len(contents),
    )
    db.add(image)
    try:
        db.commit()
        db.refresh(image)
    except Exception:
        db.rollback()
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Upload failed. Please try again.")
    return image


@router.get("/", response_model=list[schemas.ImageOut])
def list_images(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Image)
        .filter(models.Image.owner_id == current_user.id)
        .order_by(models.Image.created_at.desc())
        .all()
    )


@router.get("/{image_id}", response_model=schemas.ImageOut)
def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    image = (
        db.query(models.Image)
        .filter(models.Image.id == image_id, models.Image.owner_id == current_user.id)
        .first()
    )
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image
