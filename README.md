# SourceSight- Data Visualization Application
This project is a full-stack data visualization application that processes and displays automotive sales data from multiple sources.

![image](https://github.com/user-attachments/assets/9b4ac363-e636-4310-9b2c-da227c4882f3)

Demo Link: https://youtu.be/3Rnrg_yPfIk

## Overview
The application consists of:

- A backend API built with FastAPI, SQLAlchemy, and SQLite
- A frontend interface built with React, D3.js, Tailwind CSS
- Data processing and visualization components
The system allows users to submit data processing tasks, which fetch and analyze automotive sales data from external sources. The processed data is then visualized through interactive charts and dashboards.

## Features
- Task submission and management
- Asynchronous data processing with status tracking
- Interactive data visualizations including:
  - Line charts for time-series analysis
  - Bar charts for comparative analysis
  - Pie charts for distribution analysis
  - Box plots for statistical analysis
- Filtering capabilities by company, time range, and other parameters
- Real-time KPI metrics and analytics
## Technical Stack
### Backend
- FastAPI
- SQLAlchemy ORM
- Asynchronous task processing
- SQLite database
### Frontend
- React
- D3.js for data visualization
- Tailwind CSS for styling
## Getting Started
### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn
### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/data-viz-app.git
cd data-viz-app
 ```
```

2. Set up the backend:
```bash
cd backend
pip install -r requirements.txt
 ```

3. Set up the frontend:
```bash
cd frontend
npm install
 ```

### Running the Application
1. Start the backend server:
```bash
cd backend
uvicorn app.main:app --reload
 ```

2. Start the frontend development server:
```bash
cd frontend
npm start
 ```

3. Access the application at http://localhost:3000
## Usage
1. Navigate to the dashboard
2. Create a new task with desired parameters
3. Wait for the task to complete (status will change from "pending" to "in progress" to "completed")
4. View the analytics dashboard with visualizations of the processed data
5. Use filters to explore different aspects of the data
## Project Structure
```plaintext
data-viz-app/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   └── requirements.txt
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   └── charts/
    │   ├── services/
    │   └── App.js
    └── package.json
 ```

## Data Sources
The application fetches data from two external sources:

- Source A: JSON API providing automotive sales data:  https://gist.github.com/AmishaMe24/f4aadff1bcabac79f6e882d1637d7401
- Source B: CSV data source with complementary sales information, https://gist.github.com/AmishaMe24/d97130df157eb2c978ed5f838903033e
