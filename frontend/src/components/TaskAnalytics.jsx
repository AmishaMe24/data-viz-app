import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

// Import components
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import LineChart from './charts/LineChart';
import StackedBarChart from './charts/StackedBarChart';
import KpiCard from './charts/KpiCard';
import MetricsTable from './charts/MetricsTable';
import CompanyFilter from './filters/CompanyFilter';
import DateFilter from './filters/DateFilter';

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
  const [timeRange, setTimeRange] = useState('6m'); // Default to 6 months
  
  // Summary metrics
  const [totalSales, setTotalSales] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [topCompany, setTopCompany] = useState('');
  const [topModel, setTopModel] = useState('');
  const [successRate, setSuccessRate] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  
  // List of all available companies
  const allCompanies = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes'];
  
  // Color palette
  const colorPalette = {
    primary: ['#3949AB', '#5E97F6', '#9FA8DA', '#FFB74D', '#FFA726', '#FF9800'],
    secondary: ['#5C6BC0', '#42A5F5', '#7986CB', '#FFA000', '#FF8F00', '#FFC107'],
    light: ['#C5CAE9', '#BBDEFB', '#D1C4E9', '#FFECB3', '#FFE0B2', '#FFCC80']
  };

  // Add this function to filter data based on time range
  const filterDataByTimeRange = (data) => {
    if (!data || timeRange === 'all') return data;
    
    const now = new Date();
    let cutoffDate;
    
    switch(timeRange) {
      case '6m':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case '3y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 3));
        break;
      case '5y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };
  
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
        const filteredTimelineData = filterDataByTimeRange(timelineAnalytics);
        setTimelineData(filteredTimelineData);
        
        // Set default selected companies (all available companies)
        setSelectedCompanies([...allCompanies]);
        
        // Calculate summary metrics
        calculateSummaryMetrics(companyAnalytics, filteredTimelineData);
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, timeRange]); // Add timeRange as a dependency
  
  const calculateSummaryMetrics = (companies, timeline) => {
    // Calculate total sales
    const total = companies.reduce((sum, company) => sum + company.total_sales, 0);
    setTotalSales(total);
    
    // Calculate average price
    const totalRevenue = companies.reduce((sum, company) => sum + company.total_revenue, 0);
    setAvgPrice(total > 0 ? Math.round(totalRevenue / total) : 0);
    
    // Find top company by sales
    if (companies.length > 0) {
      const top = companies.reduce((prev, current) => 
        (prev.total_sales > current.total_sales) ? prev : current
      );
      setTopCompany(top.company);
    }
    
    // Set placeholder values for demo
    setTopModel("Camry");
    setSuccessRate(0.900);
    setErrorRate(0.100);
  };
  
  const handleCompanyToggle = (company) => {
    if (selectedCompanies.includes(company)) {
      setSelectedCompanies(selectedCompanies.filter(c => c !== company));
    } else {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };
  
  const selectAllCompanies = () => {
    setSelectedCompanies([...allCompanies]);
  };
  
  const clearAllCompanies = () => {
    setSelectedCompanies([]);
  };
  
  // Update the time range handler
  const handleTimeRangeChange = (e) => {
    // If e is an event (from dropdown), use e.target.value
    // If e is a string (from button click), use e directly
    const newTimeRange = typeof e === 'string' ? e : e.target.value;
    setTimeRange(newTimeRange);
  };
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <div className="mt-4">
            <Link to={`/tasks/${id}`} className="text-indigo-600 hover:text-indigo-800">
              Return to task
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-gray-600 hover:text-indigo-600 mr-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <span className="text-gray-400 mx-1">/</span>
          <Link to="/tasks" className="text-gray-600 hover:text-indigo-600 mr-2">Tasks</Link>
          <span className="text-gray-400 mx-1">/</span>
          <Link to={`/tasks/${id}`} className="text-gray-600 hover:text-indigo-600 mr-2">{task?.name}</Link>
          <span className="text-gray-400 mx-1">/</span>
          <span className="font-medium text-gray-800">Analytics</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="border border-gray-300 rounded-md text-xs py-1 px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="6m">Last 6 months</option>
            <option value="1y">Last 1 year</option>
            <option value="3y">Last 3 years</option>
            <option value="5y">Last 5 years</option>
            <option value="all">All time</option>
          </select>
          
          <select
            value={selectedCompanies.length === allCompanies.length ? "all" : selectedCompanies.length === 0 ? "none" : selectedCompanies[0]}
            onChange={(e) => {
              const company = e.target.value;
              // Remove setCompanyFilter since it's not defined and not needed
              
              if (company === "all") {
                selectAllCompanies();
              } else if (company === "none") {
                clearAllCompanies();
              } else {
                setSelectedCompanies([company]);
              }
            }}
            className="border border-gray-300 rounded-md text-xs py-1 px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Companies</option>
            <option value="none">None</option>
            {allCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
          
          <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700">
            Share
          </button>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          <KpiCard 
            title="Total Sales" 
            value={totalSales} 
            trend="+5%" 
            trendDirection="up" 
            icon="sales" 
            color="green"
          />
          <KpiCard 
            title="Average Price" 
            value={`$${avgPrice.toLocaleString()}`} 
            trend="+2.5%" 
            trendDirection="up" 
            icon="price" 
            color="blue"
          />
          <KpiCard 
            title="Success Rate" 
            value={`${(successRate * 100).toFixed(1)}%`} 
            trend="+0.8%" 
            trendDirection="up" 
            icon="success" 
            color="green"
          />
          <KpiCard 
            title="Error Rate" 
            value={`${(errorRate * 100).toFixed(1)}%`} 
            trend="-0.3%" 
            trendDirection="down" 
            icon="error" 
            color="red"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Sales Trend Chart */}
          <div className="bg-white p-4 rounded-md shadow-sm lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Sales - Real time</h2>
              <div className="flex items-center space-x-2">
                <button className="text-xs text-gray-500 hover:text-indigo-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="h-64">
              <LineChart 
                data={timelineData} 
                startDate={startDate} 
                endDate={endDate} 
                colorPalette={colorPalette}
              />
            </div>
          </div>
          
          {/* Sales by Category */}
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Sales by Category</h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">(hover)</span>
              </div>
            </div>
            <div className="h-64">
              <StackedBarChart 
                data={timelineData} 
                selectedCompanies={selectedCompanies} 
                colorPalette={colorPalette}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Company Distribution */}
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Revenue Distribution</h2>
              <div className="flex items-center space-x-2">
                <button className="text-xs text-gray-500 hover:text-indigo-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="h-64">
              <PieChart 
                data={companyData} 
                selectedCompanies={selectedCompanies} 
                colorPalette={colorPalette}
              />
            </div>
          </div>
          
          {/* Sales by Company */}
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Sales by Company</h2>
              <div className="flex items-center space-x-2">
                <button className="text-xs text-gray-500 hover:text-indigo-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="h-64">
              <BarChart 
                data={companyData} 
                selectedCompanies={selectedCompanies} 
                colorPalette={colorPalette}
              />
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">Key Metrics by Company</h2>
              <div className="flex items-center space-x-2">
                <button className="text-xs text-gray-500 hover:text-indigo-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="h-64 overflow-auto">
              <MetricsTable 
                data={companyData} 
                selectedCompanies={selectedCompanies} 
                colorPalette={colorPalette}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics;