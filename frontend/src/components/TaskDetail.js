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