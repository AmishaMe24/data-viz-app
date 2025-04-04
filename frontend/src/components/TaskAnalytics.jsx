import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

// Import components
import BarChart from "./charts/BarChart";
import PieChart from "./charts/PieChart";
import LineChart from "./charts/LineChart";
import BoxPlot from "./charts/BoxPlot";
import KpiCard from "./charts/KpiCard";
import MetricsTable from "./charts/MetricsTable";

const TaskAnalytics = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kpis, setKpis] = useState(null);

  // Filter states
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [timeRange, setTimeRange] = useState("all"); // Default to 6 months

  // Summary metrics
  const [totalSales, setTotalSales] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [topCompany, setTopCompany] = useState("");
  const [topModel, setTopModel] = useState("");
  const [successRate, setSuccessRate] = useState(0);
  const [errorRate, setErrorRate] = useState(0);

  // List of all available companies
  const allCompanies = [
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "BMW",
    "Mercedes",
  ];

  // Color palette
  const colorPalette = {
    primary: ["#4F46E5", "#06B6D4", "#8B5CF6", "#F97316", "#10B981", "#EC4899"],
    secondary: [
      "#6366F1", 
      "#0EA5E9", 
      "#A78BFA", 
      "#FB923C", 
      "#34D399", 
      "#F472B6"
    ],
    light: ["#C7D2FE", "#BAE6FD", "#DDD6FE", "#FED7AA", "#A7F3D0", "#FBCFE8"],
  };

  const filterDataByTimeRange = (data) => {
    if (!data || timeRange === "all") return data;

    const now = new Date();
    let cutoffDate;

    switch (timeRange) {
      case "6m":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "1y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "3y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 3));
        break;
      case "5y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      default:
        return data;
    }

    return data.filter((item) => new Date(item.date) >= cutoffDate);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const taskData = await api.getTask(id);
        console.log("Fetched task data:", taskData);
        setTask(taskData);

        if (taskData.status !== "completed") {
          setError(
            "Task is not completed yet. Analytics are only available for completed tasks."
          );
          setLoading(false);
          return;
        }

        const companyAnalytics = await api.getCompanyAnalytics(id);

        const timelineAnalytics = await api.getTimelineAnalytics(id);
        const filteredTimelineData = filterDataByTimeRange(timelineAnalytics);
        setTimelineData(filteredTimelineData);

        setSelectedCompanies([...allCompanies]);

        const kpiData = calculateKPIs(filteredTimelineData);
        setKpis(kpiData);
      } catch (err) {
        setError("Failed to fetch analytics data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, timeRange]);

  useEffect(() => {
    if (timelineData && timelineData.length > 0) {
      const kpiData = calculateKPIs(timelineData);
      setKpis(kpiData);
    }
  }, [timelineData]);

  const calculateKPIs = (timelineData) => {
    if (!timelineData || timelineData.length === 0) return null;

    const totalRevenue = timelineData.reduce(
      (sum, item) => sum + (Number(item.total_revenue || item.revenue) || 0),
      0
    );

    const totalSales = timelineData.reduce(
      (sum, item) => sum + (Number(item.total_sales || item.sales) || 0),
      0
    );

    const avgPrice = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;

    const modelSales = {};
    timelineData.forEach((item) => {
      if (item.model) {
        if (!modelSales[item.model]) {
          modelSales[item.model] = { count: 0, revenue: 0 };
        }
        modelSales[item.model].count += Number(item.sales) || 0;
        modelSales[item.model].revenue += Number(item.revenue) || 0;
      }
    });

    let topModel = { name: "None", count: 0 };
    Object.entries(modelSales).forEach(([model, data]) => {
      if (data.count > topModel.count) {
        topModel = { name: model, count: data.count };
      }
    });

    const sortedData = [...timelineData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const months = {};

    sortedData.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!months[monthKey]) {
        months[monthKey] = { sales: 0, revenue: 0 };
      }

      months[monthKey].sales += Number(item.total_sales || item.sales || 0);
      months[monthKey].revenue += Number(
        item.total_revenue || item.revenue || 0
      );
    });

    const monthKeys = Object.keys(months).sort();
    let salesTrend = 0;
    let revenueTrend = 0;

    if (monthKeys.length >= 2) {
      const lastMonth = months[monthKeys[monthKeys.length - 1]];
      const prevMonth = months[monthKeys[monthKeys.length - 2]];

      if (prevMonth.sales > 0) {
        salesTrend =
          ((lastMonth.sales - prevMonth.sales) / prevMonth.sales) * 100;
      }

      if (prevMonth.revenue > 0) {
        revenueTrend =
          ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
      }
    }

    const yearSales = {};
    timelineData.forEach((item) => {
      const year = new Date(item.date).getFullYear();
      if (!yearSales[year]) {
        yearSales[year] = { count: 0, revenue: 0 };
      }
      yearSales[year].count += Number(item.sales) || 0;
      yearSales[year].revenue += Number(item.revenue) || 0;
    });

    let topYear = { year: "None", count: 0 };
    Object.entries(yearSales).forEach(([year, data]) => {
      if (data.count > topYear.count) {
        topYear = { year, count: data.count };
      }
    });

    return {
      totalRevenue,
      totalSales,
      avgPrice,
      topModel,
      salesTrend: salesTrend.toFixed(1),
      revenueTrend: revenueTrend.toFixed(1),
      topYear,
    };
  };

  const handleCompanyToggle = (company) => {
    if (selectedCompanies.includes(company)) {
      setSelectedCompanies(selectedCompanies.filter((c) => c !== company));
    } else {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };

  const selectAllCompanies = () => {
    setSelectedCompanies([...allCompanies]);
  };

  const clearAllCompanies = () => {
    setSelectedCompanies([]);
  };

  const handleTimeRangeChange = (e) => {
    const newTimeRange = typeof e === "string" ? e : e.target.value;
    setTimeRange(newTimeRange);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <div className="mt-4">
            <Link
              to={`/tasks/${id}`}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Return to task
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStartDateFromTimeRange = (range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case "6m":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1y":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "3y":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 3);
        break;
      case "5y":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 5);
        break;
      default:
        return null;
    }

    return startDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-gray-600 hover:text-indigo-600 mr-2">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </Link>
          <span className="text-gray-400 mx-1">/</span>
          <Link
            to="/tasks"
            className="text-gray-600 hover:text-indigo-600 mr-2"
          >
            Tasks
          </Link>
          <span className="text-gray-400 mx-1">/</span>
          <Link
            to={`/tasks/${id}`}
            className="text-gray-600 hover:text-indigo-600 mr-2"
          >
            {task?.name}
          </Link>
          <span className="text-gray-400 mx-1">/</span>
          <span className="font-medium text-gray-800">Analytics</span>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="border border-gray-300 rounded-md text-xs py-1 px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="6m">Last 6 months</option>
            <option value="1y">Last 1 year</option>
            <option value="3y">Last 3 years</option>
            <option value="5y">Last 5 years</option>
            <option value="all">All time</option>
          </select>

          <select
            value={
              selectedCompanies.length === allCompanies.length
                ? "all"
                : selectedCompanies.length === 0
                ? "none"
                : selectedCompanies[0]
            }
            onChange={(e) => {
              const company = e.target.value;
              // Remove setCompanyFilter since it's not defined and not needed

              if (company === "all") {
                selectAllCompanies();
              } else if (company === "none") {
                clearAllCompanies();
              } else {
                setSelectedCompanies([company]);
              }
            }}
            className="border border-gray-300 rounded-md text-xs py-1 px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Companies</option>
            <option value="none">None</option>
            {allCompanies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>

          <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs hover:bg-indigo-700">
            Share
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-screen py-12">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-3 mb-4">
              <KpiCard
                title="Total Sales"
                value={
                  kpis
                    ? `$${Math.round(kpis.totalRevenue).toLocaleString()}`
                    : "$0"
                }
                icon="sales"
                color="green"
                subtitle="Sum of all sales"
                size="small"
              />

              <KpiCard
                title="Average Sale Price"
                value={kpis ? `$${kpis.avgPrice.toLocaleString()}` : "$0"}
                icon="average"
                color="blue"
                subtitle="Price comparison value"
                size="small"
              />

              <KpiCard
                title="Sales Volume"
                value={kpis ? kpis.totalSales.toLocaleString() : "0"}
                icon="sales"
                color="purple"
                subtitle="Total cars sold"
                size="small"
              />

              <KpiCard
                title="Monthly Growth"
                value={kpis ? `${kpis.salesTrend}%` : "0%"}
                trend={kpis && parseFloat(kpis.salesTrend) > 0 ? "up" : "down"}
                trendDirection={
                  kpis && parseFloat(kpis.salesTrend) > 0 ? "up" : "down"
                }
                icon="calendar"
                color="green"
                subtitle="Last 30 days"
                size="small"
              />

              <KpiCard
                title="Sales by Make"
                value={kpis ? findTopCompany(timelineData) : "None"}
                subtitle="Top performing brand"
                icon="volume"
                color="yellow"
                size="small"
              />
            </div>

            {/* Rest of your dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Sales Trend Chart */}
              <div className="bg-white p-4 rounded-md shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Sales - Real time
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-gray-500 hover:text-indigo-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  <LineChart
                    data={timelineData}
                    selectedCompanies={selectedCompanies}
                    colorPalette={colorPalette}
                    startDate={
                      timeRange === "all"
                        ? null
                        : getStartDateFromTimeRange(timeRange)
                    }
                    endDate={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Sales by Company */}
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Sales by Company
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-gray-500 hover:text-indigo-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  <BarChart
                    data={timelineData}
                    selectedCompanies={selectedCompanies}
                    colorPalette={colorPalette}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Company Distribution */}
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Revenue Distribution
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-gray-500 hover:text-indigo-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  <PieChart
                    data={timelineData}
                    selectedCompanies={selectedCompanies}
                    colorPalette={colorPalette}
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Price Distribution by Make/Model
                  </h2>
                </div>
                <div className="h-64">
                  <BoxPlot
                    data={timelineData}
                    selectedCompanies={selectedCompanies}
                    colorPalette={colorPalette}
                  />
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Key Metrics by Company
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-gray-500 hover:text-indigo-600">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="h-64 overflow-auto">
                  <MetricsTable
                    data={timelineData}
                    selectedCompanies={selectedCompanies}
                    colorPalette={colorPalette}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskAnalytics;

const findTopCompany = (data) => {
  if (!data || data.length === 0) return "None";

  // Group sales by company
  const companySales = {};
  data.forEach((item) => {
    const company = item.company;
    if (!company) return;

    if (!companySales[company]) {
      companySales[company] = 0;
    }

    companySales[company] += Number(item.total_sales || item.sales) || 0;
  });

  // Find company with highest sales
  let topCompany = { name: "None", sales: 0 };
  Object.entries(companySales).forEach(([company, sales]) => {
    if (sales > topCompany.sales) {
      topCompany = { name: company, sales };
    }
  });

  return topCompany.name;
};
