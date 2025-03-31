import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pb-16">
        <Outlet />
      </main>
      <footer className="bg-gray-100 py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          © 2023 TaskFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;