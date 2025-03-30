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
4. Open your browser and navigate to: ## Trae AI
Used 1 Reference

I'll complete the TaskList component by adding the table row content for each task. Here's the updated code:

```javascript
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="py-2 px-4 border-b border-gray-200">{task.id}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{task.name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {new Date(task.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      View
                    </Link>
                    {task.status === 'completed' && (
                      <Link
                        to={`/tasks/${task.id}/analytics`}
                        className="text-green-500 hover:text-green-700"
                      >
                        Analytics
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskList;
 ```
```

This code adds the following to each table row:

1. Task ID
2. Task name
3. Status with color-coded badges (green for completed, blue for in progress, etc.)
4. Formatted creation date
5. Action links to view the task details and analytics (analytics link only shows for completed tasks)
The styling uses Tailwind CSS classes to create a clean, responsive table with appropriate spacing and visual hierarchy.

## AmishaMe24
Copy

Delete

what other files are needed? or what other changes needs to be done for the succesful completin of the project?

## Trae AI
Used 1 Reference

# Completing the Data Visualization Web App Project
To successfully complete the project, we need to update the App.js file to include routing and create several additional components. Let's start with updating App.js:

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskDetail from './components/TaskDetail';
import TaskAnalytics from './components/TaskAnalytics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-xl font-bold text-blue-600">
                    Data Viz App
                  </Link>
                </div>
                <div className="ml-6 flex items-center space-x-4">
                  <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                    Tasks
                  </Link>
                  <Link to="/tasks/new" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                    New Task
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/" element={<TaskList />} />
              <Route path="/tasks/new" element={<TaskForm />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/tasks/:id/analytics" element={<TaskAnalytics />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
 ```
```

Here are the additional files we need to create:

## 1. TaskDetail Component
```javascript
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [company, setCompany] = useState('');
  const [model, setModel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const taskData = await api.getTask(id);
        setTask(taskData);
        
        // Fetch records with any applied filters
        const filters = {};
        if (company) filters.company = company;
        if (model) filters.model = model;
        if (startDate) filters.start_date = startDate;
        if (endDate) filters.end_date = endDate;
        
        const recordsData = await api.getTaskRecords(id, filters);
        setRecords(recordsData);
      } catch (err) {
        setError('Failed to fetch task data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
    
    // Poll for updates if task is not completed
    let interval;
    if (task && task.status !== 'completed' && task.status !== 'failed') {
      interval = setInterval(() => fetchTaskData(), 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, company, model, startDate, endDate, task?.status]);

  const handleFilter = (e) => {
    e.preventDefault();
    // The useEffect will trigger a refetch with the new filters
  };

  const clearFilters = () => {
    setCompany('');
    setModel('');
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return <div className="text-center py-10">Loading task data...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!task) {
    return <div className="text-center py-10">Task not found</div>;
  }

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Task: {task.name}</h2>
        <div>
          <Link to="/" className="text-blue-500 hover:text-blue-700 mr-4">
            Back to Tasks
          </Link>
          {task.status === 'completed' && (
            <Link
              to={`/tasks/${task.id}/analytics`}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              View Analytics
            </Link>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-700"><strong>ID:</strong> {task.id}</p>
            <p className="text-gray-700"><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                task.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-700"><strong>Created:</strong> {new Date(task.created_at).toLocaleString()}</p>
            <p className="text-gray-700"><strong>Updated:</strong> {new Date(task.updated_at).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Parameters:</h3>
          <pre className="bg-gray-100 p-3 rounded">
            {JSON.stringify(task.parameters, null, 2)}
          </pre>
        </div>
      </div>
      
      {task.status === 'completed' && (
        <>
          <h3 className="text-xl font-semibold mb-4">Records</h3>
          
          <div className="mb-6 bg-gray-50 p-4 rounded">
            <h4 className="text-lg font-medium mb-2">Filter Records</h4>
            <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                  Company
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="company"
                  type="text"
                  placeholder="e.g., Toyota"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="model">
                  Model
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="model"
                  type="text"
                  placeholder="e.g., Camry"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                  Start Date
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                  End Date
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              
              <div className="md:col-span-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sale Date
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id}>
                      <td className="py-2 px-4 border-b border-gray-200">{record.id}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{record.source}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{record.company}</td>
                      <td className="py-2 px-4 border-b border-gray-200">{record.model}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        {new Date(record.sale_date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        ${record.price.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDetail;
 ```
```

## 2. TaskAnalytics Component with D3.js Visualizations
```javascript
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as d3 from 'd3';
import api from '../services/api';

const TaskAnalytics = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [companyData, setCompanyData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  
  // Refs for chart containers
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const taskData = await api.getTask(id);
        setTask(taskData);
        
        if (taskData.status !== 'completed') {
          setError('Task is not completed yet. Analytics are only available for completed tasks.');
          setLoading(false);
          return;
        }
        
        const companyAnalytics = await api.getCompanyAnalytics(id);
        setCompanyData(companyAnalytics);
        
        const timelineAnalytics = await api.getTimelineAnalytics(id);
        setTimelineData(timelineAnalytics);
        
        // Set default selected companies (all)
        setSelectedCompanies(companyAnalytics.map(item => item.company));
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  useEffect(() => {
    if (!loading && !error && companyData.length > 0) {
      renderBarChart();
    }
  }, [loading, error, companyData, selectedCompanies]);
  
  useEffect(() => {
    if (!loading && !error && timelineData.length > 0) {
      renderLineChart();
    }
  }, [loading, error, timelineData, startDate, endDate, selectedCompanies]);
  
  const renderBarChart = () => {
    // Clear previous chart
    d3.select(barChartRef.current).selectAll('*').remove();
    
    // Filter data based on selected companies
    const filteredData = companyData.filter(d => selectedCompanies.includes(d.company));
    
    // Set up dimensions
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(barChartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(filteredData.map(d => d.company))
      .padding(0.2);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');
    
    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.total_sales) * 1.1])
      .range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y));
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 0 - (margin.top / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Total Sales by Company');
    
    // Add bars
    svg.selectAll('mybar')
      .data(filteredData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.company))
      .attr('y', d => y(d.total_sales))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.total_sales))
      .attr('fill', '#4f46e5')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#818cf8');
        
        // Add tooltip
        svg.append('text')
          .attr('id', 'tooltip')
          .attr('x', x(d.company) + x.bandwidth() / 2)
          .attr('y', y(d.total_sales) - 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .text(`${d.total_sales} sales, $${Math.round(d.total_revenue).toLocaleString()}`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#4f46e5');
        d3.select('#tooltip').remove();
      });
  };
  
  const renderLineChart = () => {
    // Clear previous chart
    d3.select(lineChartRef.current).selectAll('*').remove();
    
    // Filter data based on date range and selected companies
    let filteredData = [...timelineData];
    
    if (startDate) {
      filteredData = filteredData.filter(d => d.date >= startDate);
    }
    
    if (endDate) {
      filteredData = filteredData.filter(d => d.date <= endDate);
    }
    
    // If no data after filtering, return
    if (filteredData.length === 0) return;
    
    // Set up dimensions
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(lineChartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Parse dates
    filteredData.forEach(d => {
      d.parsedDate = d3.timeParse('%Y-%m')(d.date);
    });
    
    // Sort by date
    filteredData.sort((a, b) => a.parsedDate - b.parsedDate);
    
    // X axis
    const x = d3.scaleTime()
      .domain(d3.extent(filteredData, d => d.parsedDate))
      .range([0, width]);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %Y')))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
    
    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.total_sales) * 1.1])
      .range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y));
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 0 - (margin.top / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Sales Over Time');
    
    // Add the line
    svg.append('path')
      .datum(filteredData)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2)
      .attr('d', d3.line()
        .x(d => x(d.parsedDate))
        .y(d => y(d.total_sales))
      );
    
    // Add dots
    svg.selectAll('dot')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.parsedDate))
      .attr('cy', d => y(d.total_sales))
      .attr('r', 5)
      .attr('fill', '#4f46e5')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 8).attr('fill', '#818cf8');
        
        // Add tooltip
        svg.append('text')
          .attr('id', 'tooltip')
          .attr('x', x(d.parsedDate))
          .attr('y', y(d.total_sales) - 10)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .text(`${d.date}: ${d.total_sales} sales`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 5).attr('fill', '#4f46e5');
        d3.select('#tooltip').remove();
      });
  };
  
  const handleCompanyToggle = (company) => {
    if (selectedCompanies.includes(company)) {
      setSelectedCompanies(selectedCompanies.filter(c => c !== company));
    } else {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };
  
  const selectAllCompanies = () => {
    setSelectedCompanies(companyData.map(item => item.company));
  };
  
  const clearAllCompanies = () => {
    setSelectedCompanies([]);
  };
  
  if (loading) {
    return <div className="text-center py-10">Loading analytics data...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analytics: {task?.name}</h2>
        <Link to={`/tasks/${id}`} className="text-blue-500 hover:text-blue-700">
          Back to Task
        </Link>
      </div>
      
      <div className="mb-6 bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium mb-2">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="month"
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <input
                type="month"
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Companies
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {companyData.map(item => (
                <label key={item.company} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={selectedCompanies.includes(item.company)}
                    onChange={() => handleCompanyToggle(item.company)}
                  />
                  <span className="ml-2 text-gray-700">{item.company}</span>
                </label>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={selectAllCompanies}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Select All
              </button>
              <button
                onClick={clearAllCompanies}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Sales by Company</h3>
          <div ref={barChartRef} className="w-full"></div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Sales Timeline</h3>
          <div ref={lineChartRef} className="w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics;
 ```
```

## 3. Update index.css for Tailwind
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
 ```

## 4. Backend Entry Point
Create a file to run the FastAPI server:

```python
import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
 ```
```

## 5. Create Sample Data Files
Make sure to run the script to create the sample CSV file:

```bash
cd d:\Amisha\Projects\data-viz-app
python data\create_source_b.py
 ```

## 6. Project Setup Instructions
Create a README.md file with setup instructions:

```markdown
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
 ```
```

cd d:\Amisha\Projects\data-viz-app\backend

```plaintext

2. Create a virtual environment:
 ```

python -m venv venv
venv\Scripts\activate

```plaintext

3. Install dependencies:
 ```

pip install fastapi uvicorn sqlalchemy pandas requests python-multipart

```plaintext

4. Run the server:
 ```

python run.py

```plaintext

### Frontend Setup

1. Navigate to the frontend directory:
 ```

cd d:\Amisha\Projects\data-viz-app\frontend

```plaintext

2. Install dependencies:
 ```

npm install

```plaintext

3. Start the development server:
 ```

npm start

```plaintext

4. Open your browser and navigate to:
 ```

http://localhost:3000
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