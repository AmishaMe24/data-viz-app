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

  const companyOptions = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes'];

  const handleCompanyChange = (company) => {
    if (companies.includes(company)) {
      setCompanies(companies.filter(c => c !== company));
    } else {
      setCompanies([...companies, company]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setError('Failed to create task. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Create New Data Task</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Task Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Enter task name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startYear">
            Start Year
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="startYear"
            type="number"
            placeholder="e.g., 2023"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endYear">
            End Year
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="endYear"
            type="number"
            placeholder="e.g., 2024"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Filter Companies (Source B only)
          </label>
          <div className="flex flex-wrap gap-2">
            {companyOptions.map(company => (
              <label key={company} className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                  checked={companies.includes(company)}
                  onChange={() => handleCompanyChange(company)}
                />
                <span className="ml-2 text-gray-700">{company}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;