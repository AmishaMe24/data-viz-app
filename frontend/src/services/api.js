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
    const response = await axios.get(`${API_URL}/tasks/${taskId}/records`, {
      params: filters
    });
    return response.data;
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