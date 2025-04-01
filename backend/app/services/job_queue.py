import queue
import threading
import time
import random
import json
import pandas as pd
import datetime
import os
import requests
import asyncio
import aiohttp
from io import StringIO
from sqlalchemy.orm import Session
from app.models.models import Task, Record, TaskStatus

task_queue = queue.Queue()

async def process_task_async(task_id: int, db: Session):
    """Process a task from the queue asynchronously."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        print(f"Task {task_id} not found")
        return
    
    task.status = TaskStatus.IN_PROGRESS
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Failed to update task status to IN_PROGRESS: {str(e)}")
        return
    
    # Simulate processing delay (2-5 seconds)
    await asyncio.sleep(random.uniform(2, 5))
    
    try:
        # Get task parameters
        params = task.parameters
        
        # Process sources concurrently
        try:
            source_a_task = fetch_source_a_data_async(params)
            source_b_task = fetch_source_b_data_async(params)
            
            # Await both tasks concurrently
            source_a_data, source_b_data = await asyncio.gather(
                source_a_task, 
                source_b_task,
                return_exceptions=True  # This prevents one failure from canceling both tasks
            )
            
            # Check if either result is an exception
            if isinstance(source_a_data, Exception):
                raise Exception(f"Source A data fetch failed: {str(source_a_data)}")
            
            if isinstance(source_b_data, Exception):
                raise Exception(f"Source B data fetch failed: {str(source_b_data)}")
            
        except Exception as e:
            raise Exception(f"Data fetching error: {str(e)}")
        
        # Prepare all records for batch insertion
        records_to_add = []
        
        # Prepare source A records
        for record in source_a_data:
            try:
                db_record = Record(
                    task_id=task_id,
                    source="A",
                    company=record["company"],
                    model=record["model"],
                    sale_date=datetime.datetime.strptime(record["sale_date"], "%Y-%m-%d"),
                    price=float(record["price"])
                )
                records_to_add.append(db_record)
            except (KeyError, ValueError, TypeError) as e:
                print(f"Error processing Source A record: {str(e)}, Record: {record}")
                # Continue processing other records
        
        # Prepare source B records
        for record in source_b_data:
            try:
                db_record = Record(
                    task_id=task_id,
                    source="B",
                    company=record["company"],
                    model=record["model"],
                    sale_date=datetime.datetime.strptime(record["sale_date"], "%Y-%m-%d"),
                    price=float(record["price"])
                )
                records_to_add.append(db_record)
            except (KeyError, ValueError, TypeError) as e:
                print(f"Error processing Source B record: {str(e)}, Record: {record}")
                # Continue processing other records
        
        # Check if we have any records to save
        if not records_to_add:
            raise Exception("No valid records found to save after filtering and processing")
        
        # Batch add all records at once
        try:
            db.bulk_save_objects(records_to_add)
            db.flush()  # Flush to catch any database errors before committing
        except Exception as e:
            db.rollback()
            raise Exception(f"Database error while saving records: {str(e)}")
        
        # Update task status to completed
        task.status = TaskStatus.COMPLETED
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to commit completed status: {str(e)}")
            
    except Exception as e:
        # Update task status to failed and store error message
        error_message = str(e)
        print(f"Task {task_id} failed: {error_message}")
        
        try:
            task.status = TaskStatus.FAILED
            task.parameters = {**task.parameters, "error_message": error_message}
            db.commit()
        except Exception as commit_error:
            db.rollback()
            print(f"Failed to update task failure status: {str(commit_error)}")

def process_task(task_id: int, db: Session):
    """Process a task from the queue (synchronous wrapper for async function)."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(process_task_async(task_id, db))
    finally:
        loop.close()

async def fetch_source_a_data_async(params):
    """Fetch data from source A (JSON API) asynchronously."""
    # Use the raw URL for the GitHub Gist JSON file
    url = "https://gist.githubusercontent.com/AmishaMe24/f4aadff1bcabac79f6e882d1637d7401/raw"
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as response:
                response.raise_for_status()
                
                # Get the text content first, then parse it manually
                text_content = await response.text()
                
                # Try to parse the text as JSON
                try:
                    data = json.loads(text_content)
                except json.JSONDecodeError as json_err:
                    raise Exception(f"Invalid JSON format: {str(json_err)}. Content: {text_content[:100]}...")
                
                # Apply filters based on parameters
                filtered_data = []
                start_year = params.get("start_year")
                end_year = params.get("end_year")
                companies = params.get("companies", [])
                
                for record in data:
                    sale_date = datetime.datetime.strptime(record["sale_date"], "%Y-%m-%d")
                    
                    # Apply year filters
                    if start_year and sale_date.year < int(start_year):
                        continue
                    if end_year and sale_date.year > int(end_year):
                        continue
                        
                    # Apply company filter
                    if companies and record["company"] not in companies:
                        continue
                        
                    filtered_data.append(record)
                
                return filtered_data
                
        except Exception as e:
            raise Exception(f"Failed to fetch data from Source A: {str(e)}")

async def fetch_source_b_data_async(params):
    """Fetch data from source B (CSV from hosted file) asynchronously."""
    # Use the raw URL for the GitHub Gist CSV file
    url = "https://gist.githubusercontent.com/AmishaMe24/d97130df157eb2c978ed5f838903033e/raw"
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as response:
                response.raise_for_status()
                text = await response.text()
                
                # Read CSV data from the response
                csv_data = StringIO(text)
                df = pd.read_csv(csv_data)
                
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
                
        except Exception as e:
            raise Exception(f"Failed to fetch data from Source B: {str(e)}")

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