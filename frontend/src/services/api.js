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
      
      // Handle companies array
      if (filters.companies && filters.companies.length > 0) {
        params.companies = filters.companies;
      }
      
      console.log("Sending params to API:", params);
      const response = await axios.get(`${API_URL}/tasks/${taskId}/records`, { params });
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