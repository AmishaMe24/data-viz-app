import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = {
  // Task endpoints
  createTask: async (taskData) => {
    const response = await axios.post(`${API_URL}/tasks/`, taskData);
    return response.data;
  },
  
  getTasks: async (skip = 0, limit = 10) => {
    const response = await axios.get(`${API_URL}/tasks/?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  getTask: async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}`);
    return response.data;
  },
  
  getTaskRecords: async (taskId, filters = {}) => {
    try {
      const params = {};
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key !== 'companies' && value) {
          params[key] = value;
        }
      });
      
      if (filters.companies && filters.companies.length > 0) {
        params.companies = filters.companies;
      }
      
      const response = await axios.get(`${API_URL}/tasks/${taskId}/records`, { 
        params,
        paramsSerializer: params => {
          const queryParams = new URLSearchParams();
          
          Object.entries(params).forEach(([key, value]) => {
            if (key !== 'companies') {
              queryParams.append(key, value);
            }
          });
          
          if (params.companies) {
            params.companies.forEach(company => {
              queryParams.append('companies', company);
            });
          }
          
          return queryParams.toString();
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching task records:', error);
      throw error;
    }
  },
  
  getCompanyAnalytics: async (taskId) => {
    const response = await axios.get(`${API_URL}/tasks/${taskId}/analytics/companies`);
    return response.data;
  },
  
  getTimelineAnalytics: async (taskId) => {
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}/analytics/timeline`);
      
      const formattedData = response.data.map(item => ({
        ...item,
        company: item.company || '',
        date: item.date || new Date().toISOString(),
        sales: Number(item.sales || 0),
        revenue: Number(item.revenue || 0)
      }));
      
      return formattedData;
    } catch (error) {
      console.error('Error fetching timeline analytics:', error);
      return [];
    }
  },
};

export default api;