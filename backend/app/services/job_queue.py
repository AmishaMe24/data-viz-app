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
import logging
from io import StringIO
from sqlalchemy.orm import Session
from app.models.models import Task, Record, TaskStatus

# Set up logger
logger = logging.getLogger(__name__)

task_queue = queue.Queue()

async def process_task_async(task_id: int, db: Session):
    """Process a task from the queue asynchronously."""
    logger.info(f"Starting to process task {task_id}")
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        logger.error(f"Task {task_id} not found")
        return
    
    delay = random.uniform(5, 10)
    logger.debug(f"Task {task_id} waiting in PENDING state for {delay:.2f} seconds")
    await asyncio.sleep(delay)
    
    logger.info(f"Updating task {task_id} status to IN_PROGRESS")
    task.status = TaskStatus.IN_PROGRESS
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update task status to IN_PROGRESS: {str(e)}")
        return
    
    processing_delay = random.uniform(5, 10)
    logger.debug(f"Task {task_id} processing for {processing_delay:.2f} seconds")
    await asyncio.sleep(processing_delay)
    
    try:
        params = task.parameters
        logger.info(f"Task {task_id} parameters: {params}")
        
        try:
            logger.info(f"Fetching data from sources for task {task_id}")
            source_a_task = fetch_source_a_data_async(params)
            source_b_task = fetch_source_b_data_async(params)
            
            source_a_data, source_b_data = await asyncio.gather(
                source_a_task, 
                source_b_task,
                return_exceptions=True
            )
            
            if isinstance(source_a_data, Exception):
                logger.error(f"Source A data fetch failed for task {task_id}: {str(source_a_data)}")
                raise Exception(f"Source A data fetch failed: {str(source_a_data)}")
            
            if isinstance(source_b_data, Exception):
                logger.error(f"Source B data fetch failed for task {task_id}: {str(source_b_data)}")
                raise Exception(f"Source B data fetch failed: {str(source_b_data)}")
            
            logger.info(f"Successfully fetched data from both sources for task {task_id}")
            logger.debug(f"Source A records: {len(source_a_data)}, Source B records: {len(source_b_data)}")
            
        except Exception as e:
            logger.error(f"Data fetching error for task {task_id}: {str(e)}")
            raise Exception(f"Data fetching error: {str(e)}")
        
        records_to_add = []
        
        # Process source A records
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
                logger.warning(f"Error processing Source A record for task {task_id}: {str(e)}, Record: {record}")
        
        # Process source B records
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
                logger.warning(f"Error processing Source B record for task {task_id}: {str(e)}, Record: {record}")
        
        if not records_to_add:
            logger.error(f"No valid records found to save for task {task_id}")
            raise Exception("No valid records found to save after filtering and processing")
        
        logger.info(f"Saving {len(records_to_add)} records for task {task_id}")
        try:
            db.bulk_save_objects(records_to_add)
            db.flush()
        except Exception as e:
            db.rollback()
            logger.error(f"Database error while saving records for task {task_id}: {str(e)}")
            raise Exception(f"Database error while saving records: {str(e)}")
        
        logger.info(f"Updating task {task_id} status to COMPLETED")
        task.status = TaskStatus.COMPLETED
        try:
            db.commit()
            logger.info(f"Task {task_id} completed successfully")
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to commit completed status for task {task_id}: {str(e)}")
            raise Exception(f"Failed to commit completed status: {str(e)}")
            
    except Exception as e:
        error_message = str(e)
        logger.error(f"Task {task_id} failed: {error_message}")
        
        try:
            task.status = TaskStatus.FAILED
            task.parameters = {**task.parameters, "error_message": error_message}
            db.commit()
            logger.info(f"Updated task {task_id} status to FAILED with error message")
        except Exception as commit_error:
            db.rollback()
            logger.error(f"Failed to update task {task_id} failure status: {str(commit_error)}")

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
    url = "https://gist.githubusercontent.com/AmishaMe24/f4aadff1bcabac79f6e882d1637d7401/raw"
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as response:
                response.raise_for_status()
                
                text_content = await response.text()
                
                try:
                    data = json.loads(text_content)
                except json.JSONDecodeError as json_err:
                    raise Exception(f"Invalid JSON format: {str(json_err)}. Content: {text_content[:100]}...")
                
                filtered_data = []
                start_year = params.get("start_year")
                end_year = params.get("end_year")
                companies = params.get("companies", [])
                
                for record in data:
                    sale_date = datetime.datetime.strptime(record["sale_date"], "%Y-%m-%d")
                    
                    if start_year and sale_date.year < int(start_year):
                        continue
                    if end_year and sale_date.year > int(end_year):
                        continue
                        
                    if companies and record["company"] not in companies:
                        continue
                        
                    filtered_data.append(record)
                
                return filtered_data
                
        except Exception as e:
            raise Exception(f"Failed to fetch data from Source A: {str(e)}")

async def fetch_source_b_data_async(params):
    """Fetch data from source B (CSV from hosted file) asynchronously."""
    url = "https://gist.githubusercontent.com/AmishaMe24/d97130df157eb2c978ed5f838903033e/raw"
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url) as response:
                response.raise_for_status()
                text = await response.text()
                
                csv_data = StringIO(text)
                df = pd.read_csv(csv_data)
                
                start_year = params.get("start_year")
                end_year = params.get("end_year")
                companies = params.get("companies", [])
                
                df["sale_date"] = pd.to_datetime(df["sale_date"])
                
                if start_year:
                    df = df[df["sale_date"].dt.year >= int(start_year)]
                if end_year:
                    df = df[df["sale_date"].dt.year <= int(end_year)]
                
                if companies:
                    df = df[df["company"].isin(companies)]
                
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
    logger.info(f"Enqueueing task {task_id}")
    task_queue.put(task_id)