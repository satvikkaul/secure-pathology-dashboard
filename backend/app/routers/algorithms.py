from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_current_user, get_db

router = APIRouter(prefix="/algorithms", tags=["algorithms"])


@router.get("/", response_model=list[schemas.AlgorithmOut])
def list_algorithms(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    return db.query(models.Algorithm).all()
