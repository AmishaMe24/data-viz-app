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