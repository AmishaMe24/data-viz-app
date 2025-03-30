import queue
import threading
import time
import random
import json
import pandas as pd
import datetime
from sqlalchemy.orm import Session
from app.models.models import Task, Record, TaskStatus

# Create a simple in-memory queue
task_queue = queue.Queue()

def process_task(task_id: int, db: Session):
    """Process a task from the queue."""
    # Update task status to in progress
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return
    
    task.status = TaskStatus.IN_PROGRESS
    db.commit()
    
    # Simulate processing delay (5-10 seconds)
    time.sleep(random.uniform(5, 10))
    
    try:
        # Get task parameters
        params = task.parameters
        
        # Process source A (JSON)
        source_a_data = fetch_source_a_data(params)
        
        # Process source B (CSV)
        source_b_data = fetch_source_b_data(params)
        
        # Save records to database
        for record in source_a_data:
            db_record = Record(
                task_id=task_id,
                source="A",
                company=record["company"],
                model=record["model"],
                sale_date=datetime.datetime.strptime(record["sale_date"], "%Y-%m-%d"),
                price=float(record["price"])
            )
            db.add(db_record)
        
        for record in source_b_data:
            db_record = Record(
                task_id=task_id,
                source="B",
                company=record["company"],
                model=record["model"],
                sale_date=datetime.datetime.strptime(record["sale_date"], "%Y-%m-%d"),
                price=float(record["price"])
            )
            db.add(db_record)
        
        # Update task status to completed
        task.status = TaskStatus.COMPLETED
        db.commit()
    except Exception as e:
        # Update task status to failed
        task.status = TaskStatus.FAILED
        db.commit()
        print(f"Task {task_id} failed: {str(e)}")

def fetch_source_a_data(params):
    """Fetch data from source A (JSON)."""
    # In a real app, this would make an HTTP request to an external API
    # For this example, we'll use a local JSON file
    with open("d:/Amisha/Projects/data-viz-app/data/source_a.json", "r") as f:
        data = json.load(f)
    
    # Apply filters based on parameters
    filtered_data = []
    start_year = params.get("start_year")
    end_year = params.get("end_year")
    
    for record in data:
        sale_date = datetime.datetime.strptime(record["sale_date"], "%Y-%m-%d")
        if start_year and sale_date.year < int(start_year):
            continue
        if end_year and sale_date.year > int(end_year):
            continue
        filtered_data.append(record)
    
    return filtered_data

def fetch_source_b_data(params):
    """Fetch data from source B (CSV)."""
    # In a real app, this might download a CSV from a URL
    # For this example, we'll use a local CSV file
    df = pd.read_csv("d:/Amisha/Projects/data-viz-app/data/source_b.csv")
    
    # Apply filters based on parameters
    start_year = params.get("start_year")
    end_year = params.get("end_year")
    companies = params.get("companies", [])
    
    # Convert sale_date to datetime
    df["sale_date"] = pd.to_datetime(df["sale_date"])
    
    # Apply year filters
    if start_year:
        df = df[df["sale_date"].dt.year >= int(start_year)]
    if end_year:
        df = df[df["sale_date"].dt.year <= int(end_year)]
    
    # Apply company filter
    if companies:
        df = df[df["company"].isin(companies)]
    
    # Convert back to records
    df["sale_date"] = df["sale_date"].dt.strftime("%Y-%m-%d")
    return df.to_dict("records")

def worker(db_factory):
    """Worker thread to process tasks from the queue."""
    while True:
        task_id = task_queue.get()
        if task_id is None:
            break
        
        db = next(db_factory())
        try:
            process_task(task_id, db)
        finally:
            db.close()
        
        task_queue.task_done()

def start_worker(db_factory):
    """Start the worker thread."""
    threading.Thread(target=worker, args=(db_factory,), daemon=True).start()

def enqueue_task(task_id: int):
    """Add a task to the queue."""
    task_queue.put(task_id)