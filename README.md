# Data Visualization Web App

A web application for sourcing data from multiple external sources and visualizing it with interactive charts.

## Features

- Create data sourcing tasks with custom filters
- Process tasks in a job queue
- View task details and records
- Interactive data visualizations with D3.js
- Filter and analyze data

## Tech Stack

- **Frontend**: React, D3.js, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy
- **Database**: SQLite
- **Data Processing**: Pandas

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
cd d:\Amisha\Projects\data-viz-app\backend

2. Create a virtual environment:
python -m venv venv
venv\Scripts\activate

3. Install dependencies: 
pip install fastapi uvicorn sqlalchemy pandas requests python-multipart
4. Run the server: python run.py

### Frontend Setup

1. Navigate to the frontend directory:
cd d:\Amisha\Projects\data-viz-app\frontend

2. Install dependencies: npm install
3. Run the development server: npm start
4. Open your browser and navigate to: http://localhost:3000

## Usage

1. Create a new task with filtering parameters
2. Wait for the task to complete
3. View the task details and records
4. Explore the data visualizations
5. Apply filters to analyze specific data subsets

## Project Structure

- `/frontend`: React application
- `/src/components`: React components
- `/src/services`: API services
- `/backend`: FastAPI application
- `/app/api`: API endpoints
- `/app/models`: Database models
- `/app/services`: Business logic
- `/app/db`: Database configuration
- `/data`: Sample data files
