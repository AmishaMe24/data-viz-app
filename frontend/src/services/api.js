import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = {
  // Task endpoints
  createTask: async (taskData) => {
    const response = await axios.post(`${API_URL}/tasks/`, taskData);
    return response.data;
  },
  
  getTasks: async () => {
    const response = await axios.get(`${API_URL}/tasks/`);
    return response.data;
  },
  
  getTask: async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`);
    return response.data;
  },
  
  getTaskRecords: async (taskId, filters = {}) => {
    try {
      // Create params object for axios
      const params = {};
      
      // Add regular filters
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'companies' && value) {
          params[key] = value;
        }
      });
      
      // Handle companies array - ensure it's properly formatted for FastAPI
      if (filters.companies && filters.companies.length > 0) {
        // Use paramsSerializer to ensure arrays are properly formatted
        params.companies = filters.companies;
      }
      
      console.log("Sending params to API:", params);
      
      // Use paramsSerializer to ensure arrays are properly formatted for the backend
      const response = await axios.get(`${API_URL}/tasks/${taskId}/records`, { 
        params,
        paramsSerializer: params => {
          const queryParams = new URLSearchParams();
          
          // Handle regular params
          Object.entries(params).forEach(([key, value]) => {
            if (key !== 'companies') {
              queryParams.append(key, value);
            }
          });
          
          // Handle companies array - explicitly append each company as a separate parameter
          if (params.companies) {
            params.companies.forEach(company => {
              queryParams.append('companies', company);
            });
          }
          
          return queryParams.toString();
        }
      });
      
      console.log("Received records:", response.data.length);
      return response.data;
    } catch (error) {
      console.error('Error fetching task records:', error);
      throw error;
    }
  },
  
  // Analytics endpoints
  getCompanyAnalytics: async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/analytics/companies`);
    return response.data;
  },
  
  getTimelineAnalytics: async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/analytics/timeline`);
    return response.data;
  }
};

export default api;