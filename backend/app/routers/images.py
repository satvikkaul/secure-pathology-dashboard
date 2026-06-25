import os
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_current_user, get_db

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

router = APIRouter(prefix="/images", tags=["images"])


def _get_upload_dir() -> str:
    path = os.getenv("UPLOAD_DIR", "uploads")
    os.makedirs(path, exist_ok=True)
    return path


@router.post("/", response_model=schemas.ImageOut, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename or "")[-1].lower()
    if file.content_type not in ALLOWED_CONTENT_TYPES or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=422, detail="Only JPG and PNG files are accepted")

    contents = await file.read()
    max_bytes = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50")) * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=413, detail="File exceeds maximum allowed size")

    stored_name = f"{uuid.uuid4()}{ext}"
    dest = os.path.join(_get_upload_dir(), stored_name)
    with open(dest, "wb") as f:
        f.write(contents)

    image = models.Image(
        owner_id=current_user.id,
        stored_filename=stored_name,
        content_type=file.content_type,
        file_size=len(contents),
    )
    db.add(image)
    db.commit()
    db.refresh(image)
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
