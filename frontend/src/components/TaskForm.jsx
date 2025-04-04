import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const TaskForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  // Source A states
  const [startYearA, setStartYearA] = useState("");
  const [endYearA, setEndYearA] = useState("");
  const [companiesA, setCompaniesA] = useState([]);
  // Source B states
  const [startYearB, setStartYearB] = useState("");
  const [endYearB, setEndYearB] = useState("");
  const [companiesB, setCompaniesB] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [yearErrorsA, setYearErrorsA] = useState({
    startYear: "",
    endYear: "",
  });
  const [yearErrorsB, setYearErrorsB] = useState({
    startYear: "",
    endYear: "",
  });
  const [dateErrorsA, setDateErrorsA] = useState({
    startDate: "",
    endDate: "",
  });
  const [dateErrorsB, setDateErrorsB] = useState({
    startDate: "",
    endDate: "",
  });

  const companyOptionsA = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "BMW",
    "Mercedes",
  ];
  const companyOptionsB = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "BMW",
    "Mercedes",
  ];

  // Company selection handlers
  const handleCompanyChangeA = (company) => {
    if (companiesA.includes(company)) {
      setCompaniesA(companiesA.filter((c) => c !== company));
    } else {
      setCompaniesA([...companiesA, company]);
    }
  };

  const handleCompanyChangeB = (company) => {
    if (companiesB.includes(company)) {
      setCompaniesB(companiesB.filter((c) => c !== company));
    } else {
      setCompaniesB([...companiesB, company]);
    }
  };

  // Year validation for Source A
  const validateYearsA = () => {
    const errors = { startYear: "", endYear: "" };
    let isValid = true;

    if (startYearA && parseInt(startYearA) < 0) {
      errors.startYear = "Start year cannot be negative";
      isValid = false;
    }

    if (endYearA && parseInt(endYearA) < 0) {
      errors.endYear = "End year cannot be negative";
      isValid = false;
    }

    if (startYearA && endYearA && parseInt(endYearA) <= parseInt(startYearA)) {
      errors.endYear = "End year must be greater than start year";
      isValid = false;
    }

    setYearErrorsA(errors);
    return isValid;
  };

  // Year validation for Source B
  const validateYearsB = () => {
    const errors = { startYear: "", endYear: "" };
    let isValid = true;

    if (startYearB && parseInt(startYearB) < 0) {
      errors.startYear = "Start year cannot be negative";
      isValid = false;
    }

    if (endYearB && parseInt(endYearB) < 0) {
      errors.endYear = "End year cannot be negative";
      isValid = false;
    }

    if (startYearB && endYearB && parseInt(endYearB) <= parseInt(startYearB)) {
      errors.endYear = "End year must be greater than start year";
      isValid = false;
    }

    setYearErrorsB(errors);
    return isValid;
  };

  // Input change handlers for Source A
  const handleStartYearChangeA = (e) => {
    const value = e.target.value;
    setStartYearA(value);
    if (yearErrorsA.startYear) {
      setYearErrorsA((prev) => ({ ...prev, startYear: "" }));
    }
  };

  const handleEndYearChangeA = (e) => {
    const value = e.target.value;
    setEndYearA(value);
    if (yearErrorsA.endYear) {
      setYearErrorsA((prev) => ({ ...prev, endYear: "" }));
    }
  };

  // Input change handlers for Source B
  const handleStartYearChangeB = (e) => {
    const value = e.target.value;
    setStartYearB(value);
    if (yearErrorsB.startYear) {
      setYearErrorsB((prev) => ({ ...prev, startYear: "" }));
    }
  };

  const handleEndYearChangeB = (e) => {
    const value = e.target.value;
    setEndYearB(value);
    if (yearErrorsB.endYear) {
      setYearErrorsB((prev) => ({ ...prev, endYear: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate based on active source
    let isValid = true;

    isValid = validateYearsA() && isValid;

    isValid = validateYearsB() && isValid;

    if (!isValid) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const taskData = {
        name,
        parameters: {
          start_year_a: startYearA || null,
          end_year_a: endYearA || null,
          companies_a: companiesA.length > 0 ? companiesA : [],
          start_year_b: startYearB || null,
          end_year_b: endYearB || null,
          companies_b: companiesB.length > 0 ? companiesB : [],
        },
      };

      const response = await api.createTask(taskData);
      navigate(`/tasks/${response.id}`);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        if (err.response.data.detail === "Task with this name already exists") {
          setError(
            "A task with this name already exists. Please use a different name."
          );
        } else {
          setError(`Failed to create task: ${err.response.data.detail}`);
        }
      } else {
        setError("Failed to create task. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Create New Data Task
          </h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-start">
              <svg
                className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
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
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="name"
              >
                Task Name
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                id="name"
                type="text"
                placeholder="Enter a descriptive name for your task"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Source A Parameters */}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h3 className="text-lg font-medium text-blue-800 mb-4">
                Source A Parameters
              </h3>

              {/* Year Range for Source A */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="startYearA"
                  >
                    Start Year
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      className={`w-full pl-10 px-4 py-3 border ${
                        yearErrorsA.startYear
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      id="startYearA"
                      type="number"
                      min="0"
                      placeholder="e.g., 2023"
                      value={startYearA}
                      onChange={handleStartYearChangeA}
                    />
                  </div>
                  {yearErrorsA.startYear && (
                    <p className="mt-1 text-sm text-red-600">
                      {yearErrorsA.startYear}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="endYearA"
                  >
                    End Year
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      className={`w-full pl-10 px-4 py-3 border ${
                        yearErrorsA.endYear
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      id="endYearA"
                      type="number"
                      min="0"
                      placeholder="e.g., 2024"
                      value={endYearA}
                      onChange={handleEndYearChangeA}
                    />
                  </div>
                  {yearErrorsA.endYear && (
                    <p className="mt-1 text-sm text-red-600">
                      {yearErrorsA.endYear}
                    </p>
                  )}
                </div>
              </div>

              {/* Companies for Source A */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Filter Companies
                </label>
                <div className="mt-3 bg-white p-4 rounded-md border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {companyOptionsA.map((company) => (
                      <div key={company} className="flex items-center">
                        <input
                          id={`company-a-${company}`}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={companiesA.includes(company)}
                          onChange={() => handleCompanyChangeA(company)}
                        />
                        <label
                          htmlFor={`company-a-${company}`}
                          className="ml-3 text-sm text-gray-700"
                        >
                          {company}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Source B Parameters */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
              <h3 className="text-lg font-medium text-indigo-800 mb-4">
                Source B Parameters
              </h3>

              {/* Year Range for Source B */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="startYearB"
                  >
                    Start Year
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      className={`w-full pl-10 px-4 py-3 border ${
                        yearErrorsB.startYear
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      id="startYearB"
                      type="number"
                      min="0"
                      placeholder="e.g., 2023"
                      value={startYearB}
                      onChange={handleStartYearChangeB}
                    />
                  </div>
                  {yearErrorsB.startYear && (
                    <p className="mt-1 text-sm text-red-600">
                      {yearErrorsB.startYear}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="endYearB"
                  >
                    End Year
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      className={`w-full pl-10 px-4 py-3 border ${
                        yearErrorsB.endYear
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      id="endYearB"
                      type="number"
                      min="0"
                      placeholder="e.g., 2024"
                      value={endYearB}
                      onChange={handleEndYearChangeB}
                    />
                  </div>
                  {yearErrorsB.endYear && (
                    <p className="mt-1 text-sm text-red-600">
                      {yearErrorsB.endYear}
                    </p>
                  )}
                </div>
              </div>

              {/* Companies for Source B */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Filter Companies
                </label>
                <div className="mt-3 bg-white p-4 rounded-md border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {companyOptionsB.map((company) => (
                      <div key={company} className="flex items-center">
                        <input
                          id={`company-b-${company}`}
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={companiesB.includes(company)}
                          onChange={() => handleCompanyChangeB(company)}
                        />
                        <label
                          htmlFor={`company-b-${company}`}
                          className="ml-3 text-sm text-gray-700"
                        >
                          {company}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-md shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      ></path>
                    </svg>
                    Create Task
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
