import pytest
import asyncio
from unittest.mock import patch, MagicMock
import sys
import os

# Add the parent directory to sys.path to allow importing app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Now import app modules after modifying sys.path
from app.services.job_queue import fetch_source_a_data_async, fetch_source_b_data_async

@pytest.mark.asyncio
async def test_fetch_source_a_data():
    mock_response = MagicMock()
    mock_response.text.return_value = asyncio.Future()
    mock_response.text.return_value.set_result('''[
        {"company": "CompanyA", "model": "ModelX", "sale_date": "2022-01-15", "price": "100.50"},
        {"company": "CompanyB", "model": "ModelY", "sale_date": "2022-02-20", "price": "200.75"}
    ]''')
    mock_response.raise_for_status = MagicMock()
    
    mock_session = MagicMock()
    mock_session.get.return_value.__aenter__.return_value = mock_response
    
    with patch('aiohttp.ClientSession', return_value=MagicMock()) as mock_client_session:
        mock_client_session.return_value.__aenter__.return_value = mock_session
        
        params = {"start_year_a": 2022, "companies_a": ["CompanyA"]}
        result = await fetch_source_a_data_async(params)
        
        assert len(result) == 1
        assert result[0]["company"] == "CompanyA"
        assert result[0]["model"] == "ModelX"

@pytest.mark.asyncio
async def test_fetch_source_b_data():
    mock_response = MagicMock()
    mock_response.text.return_value = asyncio.Future()
    mock_response.text.return_value.set_result('''company,model,sale_date,price
CompanyA,ModelX,2022-01-15,100.50
CompanyB,ModelY,2022-02-20,200.75''')
    mock_response.raise_for_status = MagicMock()
    
    mock_session = MagicMock()
    mock_session.get.return_value.__aenter__.return_value = mock_response
    
    with patch('aiohttp.ClientSession', return_value=MagicMock()) as mock_client_session:
        mock_client_session.return_value.__aenter__.return_value = mock_session
        
        params = {"start_year_b": 2022, "companies_b": ["CompanyB"]}
        result = await fetch_source_b_data_async(params)
        
        assert len(result) == 1
        assert result[0]["company"] == "CompanyB"
        assert result[0]["model"] == "ModelY"