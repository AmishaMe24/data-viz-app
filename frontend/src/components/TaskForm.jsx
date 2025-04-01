import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TaskForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [yearErrors, setYearErrors] = useState({ startYear: '', endYear: '' });

  const companyOptions = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes'];

  const handleCompanyChange = (company) => {
    if (companies.includes(company)) {
      setCompanies(companies.filter(c => c !== company));
    } else {
      setCompanies([...companies, company]);
    }
  };

  const validateYears = () => {
    const errors = { startYear: '', endYear: '' };
    let isValid = true;

    if (startYear && parseInt(startYear) < 0) {
      errors.startYear = 'Start year cannot be negative';
      isValid = false;
    }

    if (endYear && parseInt(endYear) < 0) {
      errors.endYear = 'End year cannot be negative';
      isValid = false;
    }

    if (startYear && endYear && parseInt(endYear) <= parseInt(startYear)) {
      errors.endYear = 'End year must be greater than start year';
      isValid = false;
    }

    setYearErrors(errors);
    return isValid;
  };

  const handleStartYearChange = (e) => {
    const value = e.target.value;
    setStartYear(value);
    if (yearErrors.startYear) {
      setYearErrors(prev => ({ ...prev, startYear: '' }));
    }
  };

  const handleEndYearChange = (e) => {
    const value = e.target.value;
    setEndYear(value);
    if (yearErrors.endYear) {
      setYearErrors(prev => ({ ...prev, endYear: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateYears()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const taskData = {
        name,
        parameters: {
          start_year: startYear || null,
          end_year: endYear || null,
          companies: companies.length > 0 ? companies : null
        }
      };

      const response = await api.createTask(taskData);
      navigate(`/tasks/${response.id}`);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        if (err.response.data.detail === "Task with this name already exists") {
          setError('A task with this name already exists. Please use a different name.');
        } else {
          setError(`Failed to create task: ${err.response.data.detail}`);
        }
      } else {
        setError('Failed to create task. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create New Data Task
          </h2>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                Task Name
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                id="name"
                type="text"
                placeholder="Enter a descriptive name for your task"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="startYear">
                  Start Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    className={`w-full pl-10 px-4 py-3 border ${yearErrors.startYear ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    id="startYear"
                    type="number"
                    min="0"
                    placeholder="e.g., 2023"
                    value={startYear}
                    onChange={handleStartYearChange}
                  />
                </div>
                {yearErrors.startYear && (
                  <p className="mt-1 text-sm text-red-600">{yearErrors.startYear}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="endYear">
                  End Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    className={`w-full pl-10 px-4 py-3 border ${yearErrors.endYear ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    id="endYear"
                    type="number"
                    min="0"
                    placeholder="e.g., 2024"
                    value={endYear}
                    onChange={handleEndYearChange}
                  />
                </div>
                {yearErrors.endYear && (
                  <p className="mt-1 text-sm text-red-600">{yearErrors.endYear}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Filter Companies
                <span className="ml-2 text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">Source B only</span>
              </label>
              <div className="mt-3 bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {companyOptions.map(company => (
                    <div key={company} className="flex items-center">
                      <input
                        id={`company-${company}`}
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={companies.includes(company)}
                        onChange={() => handleCompanyChange(company)}
                      />
                      <label htmlFor={`company-${company}`} className="ml-3 text-sm text-gray-700">
                        {company}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex items-center justify-end space-x-4 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center transition-all duration-200 disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Create Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">About Data Tasks</h3>
        <p className="text-sm text-gray-600">
          Data tasks allow you to analyze and visualize information across different time periods and companies. 
          Specify parameters above to customize your analysis. Once created, tasks will process in the background 
          and you'll be able to view detailed analytics when complete.
        </p>
      </div>
    </div>
  );
};

export default TaskForm;