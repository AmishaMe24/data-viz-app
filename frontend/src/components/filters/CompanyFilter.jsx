import React from 'react';

const CompanyFilter = ({ 
  allCompanies, 
  selectedCompanies, 
  handleCompanyToggle, 
  selectAllCompanies, 
  clearAllCompanies 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter by Company</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {allCompanies.map(company => (
          <button
            key={company}
            onClick={() => handleCompanyToggle(company)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCompanies.includes(company)
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {company}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={selectAllCompanies}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
        >
          Select All
        </button>
        <button
          onClick={clearAllCompanies}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default CompanyFilter;