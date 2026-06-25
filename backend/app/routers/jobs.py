import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_current_user, get_db
from ..algorithms.placeholder import run as run_placeholder

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])

ALGORITHM_REGISTRY: dict[str, callable] = {
    "placeholder_v1": run_placeholder,
}


@router.post("/", response_model=schemas.JobOut, status_code=status.HTTP_201_CREATED)
def submit_job(
    payload: schemas.JobCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    image = (
        db.query(models.Image)
        .filter(models.Image.id == payload.image_id, models.Image.owner_id == current_user.id)
        .first()
    )
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    if payload.algorithm_name not in ALGORITHM_REGISTRY:
        raise HTTPException(status_code=422, detail="Unknown algorithm")

    job = models.AlgorithmJob(
        image_id=image.id,
        owner_id=current_user.id,
        algorithm_name=payload.algorithm_name,
        status="running",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    try:
        result = ALGORITHM_REGISTRY[payload.algorithm_name](image_id=image.id)
        job.status = "completed"
        job.result_summary = json.dumps(result)
        job.completed_at = datetime.now(timezone.utc)
    except Exception as exc:
        logger.error(
            "Algorithm %s failed for job %d: %s",
            payload.algorithm_name,
            job.id,
            exc,
            exc_info=True,
        )
        job.status = "failed"
        job.result_summary = json.dumps({"error": "Algorithm execution failed. See server logs for details."})
        job.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(job)
    return job


@router.get("/", response_model=list[schemas.JobOut])
def list_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.AlgorithmJob)
        .filter(models.AlgorithmJob.owner_id == current_user.id)
        .order_by(models.AlgorithmJob.created_at.desc())
        .all()
    )


@router.get("/{job_id}", response_model=schemas.JobOut)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    job = (
        db.query(models.AlgorithmJob)
        .filter(
            models.AlgorithmJob.id == job_id,
            models.AlgorithmJob.owner_id == current_user.id,
        )
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
