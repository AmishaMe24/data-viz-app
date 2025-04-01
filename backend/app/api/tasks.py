from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.models import Task, Record, TaskStatus
from app.schemas.schemas import TaskCreate, TaskResponse, RecordResponse, PaginatedTaskResponse
from app.services.job_queue import enqueue_task
import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/tasks/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    existing_task = db.query(Task).filter(Task.name == task.name).first()
    if existing_task:
        logger.warning(f"Attempted to create duplicate task with name: {task.name}")
        raise HTTPException(status_code=400, detail="Task with this name already exists")
    
    logger.info(f"Creating new task: {task.name}")
    db_task = Task(
        name=task.name,
        parameters=task.parameters.dict(),
        status=TaskStatus.PENDING
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    logger.info(f"Task created with ID: {db_task.id}, enqueueing for processing")
    enqueue_task(db_task.id)
    
    return db_task

@router.get("/tasks/", response_model=PaginatedTaskResponse)
def get_tasks(
    skip: int = 0, 
    limit: int = 10,
    db: Session = Depends(get_db)
):
    logger.info(f"Fetching tasks with pagination: skip={skip}, limit={limit}")
    
    total = db.query(Task).count()
    
    tasks = db.query(Task).order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": tasks,
        "total": total
    }

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    logger.info(f"Fetching task with ID: {task_id}")
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        logger.warning(f"Task with ID {task_id} not found")
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
    logger.info(f"Fetching records for task ID: {task_id} with filters - companies: {companies}, model: {model}, date range: {start_date} to {end_date}")
    
    query = db.query(Record).filter(Record.task_id == task_id)
    
    if companies:
        query = query.filter(Record.company.in_(companies))
    
    if model:
        query = query.filter(Record.model == model)
    if start_date:
        try:
            start_date_obj = datetime.datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Record.sale_date >= start_date_obj)
        except ValueError:
            try:
                start_date_obj = datetime.datetime.strptime(f"{start_date}-01-01", "%Y-%m-%d")
                query = query.filter(Record.sale_date >= start_date_obj)
                logger.debug(f"Converted year-only start date to: {start_date_obj}")
            except ValueError:
                logger.warning(f"Invalid start date format: {start_date}")
    if end_date:
        try:
            end_date_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(Record.sale_date <= end_date_obj)
        except ValueError:
            try:
                end_date_obj = datetime.datetime.strptime(f"{end_date}-12-31", "%Y-%m-%d")
                query = query.filter(Record.sale_date <= end_date_obj)
                logger.debug(f"Converted year-only end date to: {end_date_obj}")
            except ValueError:
                logger.warning(f"Invalid end date format: {end_date}")
    
    records = query.all()
    logger.info(f"Found {len(records)} records for task ID: {task_id} after applying filters")
    return records

@router.get("/tasks/{task_id}/analytics/companies")
def get_company_analytics(task_id: int, db: Session = Depends(get_db)):
    """Get sales analytics by company for a specific task."""
    logger.info(f"Generating company analytics for task ID: {task_id}")
    records = db.query(Record).filter(Record.task_id == task_id).all()
    
    company_data = {}
    for record in records:
        if record.company not in company_data:
            company_data[record.company] = {
                "total_sales": 0,
                "total_revenue": 0,
                "average_price": 0
            }
        
        company_data[record.company]["total_sales"] += 1
        company_data[record.company]["total_revenue"] += record.price
    
    for company in company_data:
        if company_data[company]["total_sales"] > 0:
            company_data[company]["average_price"] = (
                company_data[company]["total_revenue"] / company_data[company]["total_sales"]
            )
    
    result = [
        {
            "company": company,
            "total_sales": data["total_sales"],
            "total_revenue": data["total_revenue"],
            "average_price": data["average_price"]
        }
        for company, data in company_data.items()
    ]
    
    logger.info(f"Generated analytics for {len(result)} companies")
    return result

@router.get("/tasks/{task_id}/analytics/timeline")
def get_timeline_analytics(task_id: int, db: Session = Depends(get_db)):
    """Get sales timeline analytics for a specific task."""
    logger.info(f"Generating timeline analytics for task ID: {task_id}")
    records = db.query(Record).filter(Record.task_id == task_id).all()
    
    timeline_data = {}
    for record in records:
        month_key = record.sale_date.strftime("%Y-%m")
        company = record.company
        
        entry_key = f"{month_key}_{company}"
        
        if entry_key not in timeline_data:
            timeline_data[entry_key] = {
                "date": month_key,
                "company": company,
                "total_sales": 0,
                "total_revenue": 0
            }
        
        timeline_data[entry_key]["total_sales"] += 1
        timeline_data[entry_key]["total_revenue"] += record.price
    
    result = list(timeline_data.values())
    result.sort(key=lambda x: x["date"])
    
    logger.info(f"Generated timeline analytics with {len(result)} data points")
    return result

@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task and its associated records."""
    logger.info(f"Attempting to delete task with ID: {task_id}")
    
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        logger.warning(f"Task with ID {task_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Task not found")
    
    try:
        records_deleted = db.query(Record).filter(Record.task_id == task_id).delete()
        logger.info(f"Deleted {records_deleted} records associated with task {task_id}")
        
        db.delete(task)
        db.commit()
        logger.info(f"Successfully deleted task {task_id}")
        
        return None
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete task: {str(e)}")