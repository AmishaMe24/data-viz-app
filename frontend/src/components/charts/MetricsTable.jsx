import React, { useMemo, useState, useEffect } from 'react';

const MetricsTable = ({ data, selectedCompanies, colorPalette }) => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [data, selectedCompanies]);

  const tableData = useMemo(() => {
    if (!data || data.length === 0 || !selectedCompanies || selectedCompanies.length === 0) {
      return [];
    }

    const companiesWithData = [...new Set(data.map(item => item.company))];
    
    return selectedCompanies
      .filter(company => companiesWithData.includes(company))
      .map(company => {
        const companyData = data.filter(item => item.company === company);
        
        const totalSales = companyData.reduce((sum, item) => sum + (Number(item.total_sales) || 0), 0);
        const totalRevenue = companyData.reduce((sum, item) => sum + (Number(item.total_revenue) || 0), 0);
        const avgPrice = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;
        
        return {
          company,
          totalSales,
          totalRevenue,
          avgPrice
        };
      });
  }, [data, selectedCompanies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available for the selected filters</p>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Company
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Sales
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Revenue
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Avg. Price
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {tableData.map((item, index) => (
          <tr key={item.company || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {item.company}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {Math.round(item.totalSales).toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${Math.round(item.totalRevenue).toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              ${item.avgPrice.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MetricsTable;