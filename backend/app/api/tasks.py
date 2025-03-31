from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.models import Task, Record, TaskStatus
from app.services.job_queue import enqueue_task
from pydantic import BaseModel
import datetime

router = APIRouter()

class TaskCreate(BaseModel):
    name: str
    parameters: dict

class TaskResponse(BaseModel):
    id: int
    name: str
    status: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    parameters: dict

    class Config:
        orm_mode = True

class RecordResponse(BaseModel):
    id: int
    task_id: int
    source: str
    company: str
    model: str
    sale_date: datetime.datetime
    price: float

    class Config:
        orm_mode = True

@router.post("/tasks/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(
        name=task.name,
        parameters=task.parameters,
        status=TaskStatus.PENDING
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Add task to the queue for processing
    enqueue_task(db_task.id)
    
    return db_task

@router.get("/tasks/", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/tasks/{task_id}/records", response_model=List[RecordResponse])
def get_task_records(
    task_id: int,
    companies: List[str] = Query(None),  # Use Query with default None to handle multiple values
    model: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    print(f"Companies filter: {companies}")
    
    # Start building the query
    query = db.query(Record).filter(Record.task_id == task_id)
    
    # Apply company filter if provided
    if companies:
        query = query.filter(Record.company.in_(companies))
    
    # Rest of the filtering logic remains the same
    if model:
        query = query.filter(Record.model == model)
    if start_date:
        try:
            start_date = datetime.datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Record.sale_date >= start_date)
        except ValueError:
            # Try parsing as just a year
            try:
                start_date = datetime.datetime.strptime(f"{start_date}-01-01", "%Y-%m-%d")
                query = query.filter(Record.sale_date >= start_date)
            except ValueError:
                pass
    if end_date:
        try:
            end_date = datetime.datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(Record.sale_date <= end_date)
        except ValueError:
            # Try parsing as just a year
            try:
                end_date = datetime.datetime.strptime(f"{end_date}-12-31", "%Y-%m-%d")
                query = query.filter(Record.sale_date <= end_date)
            except ValueError:
                pass
    
    records = query.all()
    print(f"Filtered records count: {len(records)}")
    return records

@router.get("/tasks/{task_id}/analytics/companies")
def get_company_analytics(task_id: int, db: Session = Depends(get_db)):
    """Get sales analytics by company for a specific task."""
    records = db.query(Record).filter(Record.task_id == task_id).all()
    
    # Group by company and calculate total sales
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
    
    # Calculate average price
    for company in company_data:
        if company_data[company]["total_sales"] > 0:
            company_data[company]["average_price"] = (
                company_data[company]["total_revenue"] / company_data[company]["total_sales"]
            )
    
    # Format for D3.js
    result = [
        {
            "company": company,
            "total_sales": data["total_sales"],
            "total_revenue": data["total_revenue"],
            "average_price": data["average_price"]
        }
        for company, data in company_data.items()
    ]
    
    return result

@router.get("/tasks/{task_id}/analytics/timeline")
def get_timeline_analytics(task_id: int, db: Session = Depends(get_db)):
    """Get sales timeline analytics for a specific task."""
    records = db.query(Record).filter(Record.task_id == task_id).all()
    
    # Group by month and calculate total sales
    timeline_data = {}
    for record in records:
        month_key = record.sale_date.strftime("%Y-%m")
        if month_key not in timeline_data:
            timeline_data[month_key] = {
                "date": month_key,
                "total_sales": 0,
                "total_revenue": 0
            }
        
        timeline_data[month_key]["total_sales"] += 1
        timeline_data[month_key]["total_revenue"] += record.price
    
    # Format for D3.js
    result = list(timeline_data.values())
    result.sort(key=lambda x: x["date"])
    
    return result