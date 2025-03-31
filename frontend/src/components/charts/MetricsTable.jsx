import React from 'react';

const MetricsTable = ({ data, selectedCompanies }) => {
  const filteredData = data.filter(company => selectedCompanies.includes(company.company));
  
  return (
    <div className="w-full h-full overflow-hidden">
      <table className="w-full table-fixed divide-y divide-gray-200 text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-1/4 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th scope="col" className="w-1/4 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Sales
            </th>
            <th scope="col" className="w-1/4 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Revenue
            </th>
            <th scope="col" className="w-1/4 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg. Price
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.length > 0 ? (
            filteredData.map((company, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-2 py-1 text-xs font-medium text-gray-900 text-center truncate">
                  {company.company}
                </td>
                <td className="px-2 py-1 text-xs text-gray-500 text-center">
                  {company.total_sales.toLocaleString()}
                </td>
                <td className="px-2 py-1 text-xs text-gray-500 text-center">
                  ${Math.round(company.total_revenue).toLocaleString()}
                </td>
                <td className="px-2 py-1 text-xs text-gray-500 text-center">
                  ${Math.round(company.total_revenue / company.total_sales).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-2 py-1 text-center text-xs text-gray-500">
                No data available. Please select at least one company.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MetricsTable;