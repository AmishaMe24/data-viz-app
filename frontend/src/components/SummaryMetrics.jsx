import React from 'react';

const SummaryMetrics = ({ totalSales, avgPrice, topCompany, topModel }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
        <p className="text-2xl font-bold">{totalSales.toLocaleString()}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Average Price</h3>
        <p className="text-2xl font-bold">${avgPrice.toLocaleString()}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Top Company</h3>
        <p className="text-2xl font-bold">{topCompany}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Top Model</h3>
        <p className="text-2xl font-bold">{topModel}</p>
      </div>
    </div>
  );
};

export default SummaryMetrics;