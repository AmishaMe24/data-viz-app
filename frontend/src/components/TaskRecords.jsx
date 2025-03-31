import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TaskRecords = ({ taskId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [company, setCompany] = useState('');
  const [model, setModel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Companies for checkbox filtering
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const companies = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes'];

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        // Fetch records with any applied filters
        const filters = {};
        if (model) filters.model = model;
        if (startDate) filters.start_date = startDate;
        if (endDate) filters.end_date = endDate;
        
        // Only use selectedCompanies for filtering
        if (selectedCompanies.length > 0) {
          // Change from filters.companies to filters.companies[]
          // This ensures each company is sent as a separate query parameter
          selectedCompanies.forEach(company => {
            if (!filters.companies) filters.companies = [];
            filters.companies.push(company);
          });
          console.log('Applying company filters:', selectedCompanies);
        }

        console.log('Sending filters to API:', filters);
        const recordsData = await api.getTaskRecords(taskId, filters);
        console.log('Received records:', recordsData.length);
        setRecords(recordsData);
      } catch (err) {
        setError('Failed to fetch records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Remove the delay as it's not necessary and could cause issues
    fetchRecords();
  }, [taskId, model, startDate, endDate, selectedCompanies]);

  // Remove the company state since we're using selectedCompanies instead
  const handleCompanyToggle = (companyName) => {
    setSelectedCompanies(prev => {
      const newSelection = prev.includes(companyName) 
        ? prev.filter(c => c !== companyName)
        : [...prev, companyName];
      
      console.log('Updated selected companies:', newSelection);
      return newSelection;
    });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    // The useEffect will trigger a refetch with the new filters
    console.log('Filter form submitted with:', {
      model,
      startDate,
      endDate,
      selectedCompanies
    });
  };

  const clearFilters = () => {
    setCompany('');
    setModel('');
    setStartDate('');
    setEndDate('');
    setSelectedCompanies([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="ml-2 text-gray-600">Loading records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-indigo-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
            <h2 className="text-lg font-medium text-gray-900">Records</h2>
          </div>
          {(selectedCompanies.length > 0 || model || startDate || endDate) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Filters Applied
            </span>
          )}
        </div>
      </div>

      {/* Filter section - updated to match the image aesthetic */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filter Companies</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {companies.map((companyName) => (
              <div key={companyName} className="flex items-center">
                <input
                  id={`company-${companyName}`}
                  name={`company-${companyName}`}
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={selectedCompanies.includes(companyName)}
                  onChange={() => handleCompanyToggle(companyName)}
                />
                <label htmlFor={`company-${companyName}`} className="ml-2 text-sm text-gray-700">
                  {companyName}
                </label>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Model
            </label>
            <input
              type="text"
              name="model"
              id="model"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md h-10"
              placeholder="e.g., Camry"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Year
            </label>
            <input
              type="text"
              name="startDate"
              id="startDate"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md h-10"
              placeholder="e.g., 2023"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Year
            </label>
            <input
              type="text"
              name="endDate"
              id="endDate"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md h-10"
              placeholder="e.g., 2025"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-10"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Records table - updated styling */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto" style={{ height: '450px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Source
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Company
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Model
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sale Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        ></path>
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No records found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters or check back later.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-medium text-gray-900">
                        {record.company}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.sale_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${record.price.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskRecords;