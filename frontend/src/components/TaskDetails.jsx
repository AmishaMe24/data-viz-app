import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import TaskRecords from './TaskRecords';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const taskData = await api.getTask(id);
        setTask(taskData);
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
  }, [id, task?.status]);

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: (
          <svg
            className="w-5 h-5 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        ),
      },
      in_progress: {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: (
          <svg
            className="w-5 h-5 mr-1.5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
        ),
      },
      failed: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: (
          <svg
            className="w-5 h-5 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        ),
      },
      pending: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: (
          <svg
            className="w-5 h-5 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        ),
      },
    };

    const statusConfig = statusMap[status] || statusMap.pending;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
      >
        {statusConfig.icon}
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading task data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h2 className="text-center text-xl font-bold text-gray-800 mb-1">
            Error Loading Task
          </h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full p-6 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Task Not Found</h2>
          <p className="text-gray-600 mb-6">
            The task you're looking for doesn't exist or you may not have access
            to it.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        {/* Header with minimized info */}
        <div className="bg-white border-b border-gray-200">
          <div className="py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex flex-col">
                <div className="flex items-center text-sm text-gray-500">
                  <Link to="/" className="hover:text-indigo-600">
                    Tasks
                  </Link>
                  <svg
                    className="h-4 w-4 mx-1 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">{task.name}</span>
                </div>
                <div className="flex items-center mt-1">
                  <h1 className="text-lg font-semibold text-gray-900 mr-3">
                    Task #{task.id}
                  </h1>
                  {getStatusBadge(task.status)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Task quick stats */}
              <div className="hidden md:flex space-x-6 items-center mr-4">
                {task.parameters && task.parameters.start_year && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Start Year</span>
                    <span className="text-sm font-medium">
                      {task.parameters.start_year}
                    </span>
                  </div>
                )}
                {task.parameters && task.parameters.end_year && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">End Year</span>
                    <span className="text-sm font-medium">
                      {task.parameters.end_year}
                    </span>
                  </div>
                )}
                {task.parameters && task.parameters.companies && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Companies</span>
                    <div className="flex flex-wrap gap-1">
                      {task.parameters.companies.map((company, idx) => (
                        <span key={idx} className="text-sm font-medium bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Created</span>
                  <span className="text-sm font-medium">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3">
                <Link
                  to="/"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </Link>
                {task.status === 'completed' && (
                  <Link
                    to={`/tasks/${task.id}/analytics`}
                    className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg
                      className="mr-2 -ml-1 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Analytics
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6">
            {/* RECORDS SECTION - Now using the TaskRecords component */}
            {task.status === 'completed' && <TaskRecords taskId={id} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;