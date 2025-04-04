from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.models import TaskStatus
from app.schemas.schemas import TaskCreate, TaskResponse, RecordResponse, PaginatedTaskResponse
from app.services import task_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/tasks/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = task_service.create_task(task, db)
    if not db_task:
        raise HTTPException(status_code=400, detail="Task with this name already exists")
    return db_task

@router.get("/tasks/", response_model=PaginatedTaskResponse)
def get_tasks(
    skip: int = 0, 
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return task_service.get_tasks(skip, limit, db)

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = task_service.get_task_by_id(task_id, db)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/tasks/{task_id}/records", response_model=List[RecordResponse])
def get_task_records(
    task_id: int,
    companies: List[str] = Query(None),
    model: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return task_service.get_task_records(task_id, companies, model, start_date, end_date, db)

@router.get("/tasks/{task_id}/analytics/companies")
def get_company_analytics(task_id: int, db: Session = Depends(get_db)):
    """Get sales analytics by company for a specific task."""
    return task_service.get_company_analytics(task_id, db)

@router.get("/tasks/{task_id}/analytics/timeline")
def get_timeline_analytics(task_id: int, db: Session = Depends(get_db)):
    """Get sales timeline analytics for a specific task."""
    return task_service.get_timeline_analytics(task_id, db)

@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task and its associated records."""
    success = task_service.delete_task(task_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return None