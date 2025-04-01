import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskAnalytics from './components/TaskAnalytics';
import TaskDetails from './components/TaskDetails';

const NavLink = ({ to, children, currentPath }) => {
  const isActive = currentPath === to ||
    (to !== '/' && currentPath.startsWith(to));

  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
        }`}
    >
      {children}
    </Link>
  );
};

const MainContent = ({ children, currentPath }) => {
  const isAnalyticsView = currentPath.includes('/analytics');

  return (
    <main className={`w-full mx-auto flex-grow ${isAnalyticsView ? 'p-0' : 'py-6 sm:px-6 lg:px-8'}`}>
      <div className={`${isAnalyticsView ? 'w-full' : 'px-4 sm:px-0'}`}>
        {children}
      </div>
    </main>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isAnalyticsView = currentPath.includes('/analytics');

  const [showNav, setShowNav] = useState(!isAnalyticsView);

  useEffect(() => {
    setShowNav(!isAnalyticsView);
  }, [isAnalyticsView, currentPath]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showNav && (
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <Link to="/" className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    SourceSight
                  </Link>
                </div>

                <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-2">
                  <NavLink to="/" currentPath={currentPath}>Dashboard</NavLink>
                  <NavLink to="/tasks/new" currentPath={currentPath}>New Task</NavLink>
                </div>
              </div>

              <div className="flex items-center">
                <div className="ml-4 relative flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                    TF
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      <MainContent currentPath={currentPath}>
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/tasks/:id/analytics" element={<TaskAnalytics />} />
        </Routes>
      </MainContent>

      {showNav && (
        <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>© 2025 TaskFlow. All rights reserved.</div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;