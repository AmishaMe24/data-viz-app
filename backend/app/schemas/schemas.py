from pydantic import BaseModel, field_validator, Field
import datetime
from typing import List, Optional, Union, Dict, Any

class TaskParameters(BaseModel):
    start_year_a: Optional[Union[str, None]] = None
    end_year_a: Optional[Union[str, None]] = None
    companies_a: Optional[List[str]] = []
    start_year_b: Optional[Union[str, None]] = None
    end_year_b: Optional[Union[str, None]] = None
    companies_b: Optional[List[str]] = []
    
    @field_validator('start_year_a', 'start_year_b')
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
    
    @field_validator('end_year_a', 'end_year_b')
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
    
    @field_validator('companies_a', 'companies_b')
    def validate_companies(cls, v):
        if v is None:
            return []
        return v


class TaskCreate(BaseModel):
    name: str = Field(..., min_length=1)
    parameters: TaskParameters
    
    @field_validator('name')
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

    model_config = {
        "from_attributes": True
    }

class RecordResponse(BaseModel):
    id: int
    task_id: int
    source: str
    company: str
    model: str
    sale_date: datetime.datetime
    price: float

    model_config = {
        "from_attributes": True
    }

class PaginatedTaskResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    
    model_config = {
        "from_attributes": True
    }