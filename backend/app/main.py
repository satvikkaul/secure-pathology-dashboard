from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from . import models
from .routers import auth, images, algorithms, jobs, profile


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(models.Algorithm).first():
            db.add(models.Algorithm(
                name="placeholder_v1",
                display_name="Placeholder Classifier v1",
                description="Synthetic placeholder for Phase 1 demo. Returns mock classification results.",
                version="1.0.0",
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
