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
    try {
      const response = await axios.get(`${API_URL}/tasks/${taskId}/analytics/timeline`);
      
      // Ensure the data has the expected format for filtering
      const formattedData = response.data.map(item => ({
        ...item,
        // Ensure company property exists and is a string
        company: item.company || '',
        // Ensure date property exists and is a valid date string
        date: item.date || new Date().toISOString(),
        // Ensure sales and revenue are numbers
        sales: Number(item.sales || 0),
        revenue: Number(item.revenue || 0)
      }));
      
      return formattedData;
    } catch (error) {
      console.error('Error fetching timeline analytics:', error);
      // Return empty array on error
      return [];
    }
  },
  
  // Helper method to generate sample data for testing
  generateSampleTimelineData: () => {
    const data = [];
    const companies = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes'];
    const now = new Date();
    
    // Generate data for the past 3 years
    for (let i = 0; i < 36; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      companies.forEach(company => {
        data.push({
          date: date.toISOString(),
          company: company,
          sales: Math.floor(Math.random() * 50) + 10,
          revenue: (Math.floor(Math.random() * 50) + 10) * 35000,
          model: ['Camry', 'Accord', 'F-150', 'Silverado', 'X5', 'C-Class'][Math.floor(Math.random() * 6)]
        });
      });
    }
    
    return data;
  }
};

export default api;