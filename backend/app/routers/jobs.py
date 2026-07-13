import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, storage
from ..dependencies import get_approved_user, get_db
from ..algorithms import REGISTRY

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/", response_model=schemas.JobOut, status_code=status.HTTP_201_CREATED)
def submit_job(
    payload: schemas.JobCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_approved_user),
):
    image = (
        db.query(models.Image)
        .filter(models.Image.id == payload.image_id, models.Image.owner_id == current_user.id)
        .first()
    )
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    if payload.algorithm_name not in REGISTRY:
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
        # Algorithms receive only the path to this user's own stored image.
        result = REGISTRY[payload.algorithm_name].run(storage.image_path(image.stored_filename))
        # Validate the envelope contract before storage; a malformed envelope is
        # a programming error in the algorithm adapter and lands in the except
        # below (job failed, safe note stored) — it never reaches the frontend.
        envelope = schemas.ResultEnvelope.model_validate(result)
        job.status = "completed"
        job.result_summary = envelope.model_dump_json()
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
    current_user: models.User = Depends(get_approved_user),
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
    current_user: models.User = Depends(get_approved_user),
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
