import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await api.getTasks();
        setTasks(data);
      } catch (err) {
        setError('Failed to fetch tasks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading tasks...</div>;
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
        <h2 className="text-2xl font-bold">Your Tasks</h2>
        <Link
          to="/tasks/new"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Task
        </Link>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No tasks found. Create your first task!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created At
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
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