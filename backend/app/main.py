from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import tasks
from app.db.database import engine, get_db
from app.models.models import Base
from app.services.job_queue import start_worker

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Data Visualization API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router, prefix="/api")

# Start the worker thread
start_worker(get_db)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Data Visualization API"}