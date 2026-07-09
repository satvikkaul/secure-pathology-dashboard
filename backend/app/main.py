from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect
from .database import Base, engine, SessionLocal
from . import models
from .routers import auth, images, algorithms, jobs, profile


def verify_schema():
    """create_all() adds missing tables but never ALTERs existing ones. A DB from
    before a column was added would 500 with `no such column` at request time.
    Fail loud at startup instead, with a fix, since this prototype has no migrations."""
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    for table in Base.metadata.tables.values():
        if table.name not in tables:
            continue  # create_all just made it fresh
        actual = {c["name"] for c in inspector.get_columns(table.name)}
        missing = {c.name for c in table.columns} - actual
        if missing:
            raise RuntimeError(
                f"Database schema is out of date: table '{table.name}' is missing "
                f"columns {sorted(missing)}. This prototype has no migrations — "
                f"delete backend/pathology.db and restart to recreate the schema."
            )


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    verify_schema()
    db = SessionLocal()
    try:
        if not db.query(models.Algorithm).first():
            db.add(models.Algorithm(
                name="placeholder_v1",
                display_name="Placeholder Classifier v1",
                description="Synthetic placeholder for Phase 1 demo. Returns mock classification results.",
                version="1.0.0",
                result_type="classification",
                input_requirements="JPG/PNG, max 10 MB",
                experimental=True,
            ))
            db.commit()
    finally:
        db.close()
    yield


app = FastAPI(
    title="Secure Pathology Dashboard API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(images.router)
app.include_router(algorithms.router)
app.include_router(jobs.router)
app.include_router(profile.router)
