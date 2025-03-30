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
