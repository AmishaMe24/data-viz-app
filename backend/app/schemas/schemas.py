from pydantic import BaseModel, validator, Field
import datetime
from typing import List, Optional, Union, Dict, Any

class TaskParameters(BaseModel):
    start_year: Optional[Union[str, None]] = None
    end_year: Optional[Union[str, None]] = None
    companies: Optional[List[str]] = []
    
    @validator('start_year')
    def validate_start_year(cls, v):
        if v is None or v == "":
            return v
        if v == "string":
            return None
        try:
            year = int(v)
            if year < 0:
                raise ValueError("Start year cannot be negative")
            return str(year)
        except ValueError as e:
            if "Start year cannot be negative" in str(e):
                raise
            raise ValueError("Start year must be a valid number")
    
    @validator('end_year')
    def validate_end_year(cls, v):
        if v is None or v == "":
            return v
        if v == "string":
            return None
        try:
            year = int(v)
            if year < 0:
                raise ValueError("End year cannot be negative")
            return str(year)
        except ValueError as e:
            if "End year cannot be negative" in str(e):
                raise
            raise ValueError("End year must be a valid number")
    
    @validator('companies')
    def validate_companies(cls, v):
        if v is None:
            return []
        return v

class TaskCreate(BaseModel):
    name: str = Field(..., min_length=1)
    parameters: TaskParameters
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v or v.strip() == "":
            raise ValueError("Task name cannot be empty")
        return v

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

class PaginatedTaskResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    
    class Config:
        orm_mode = True