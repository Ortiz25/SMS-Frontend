
import axios from 'axios';

const API_URL ='/backend/api';
const token = localStorage.getItem("token");

// Create axios instance with auth headers
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${token}`,
  }
});

// Add authorization header to every request
axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  const disciplinaryService = {
    // Get all incidents with optional filtering
    getIncidents: async (filters = {}) => {
      const { searchQuery, statusFilter, fromDate, toDate, classFilter, severityFilter } = filters;
      
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('searchQuery', searchQuery);
        if (statusFilter) params.append('statusFilter', statusFilter);
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        if (classFilter) params.append('classFilter', classFilter);
        if (severityFilter) params.append('severityFilter', severityFilter);
        
        const response = await axiosInstance.get(`/disciplinary/incidents?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching incidents:', error);
        throw error;
      }
    },
    
    // Get single incident by ID
    getIncidentById: async (id) => {
      try {
        const response = await axiosInstance.get(`/disciplinary/incidents/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching incident ${id}:`, error);
        throw error;
      }
    },
    
    // Create new incident
    createIncident: async (incidentData) => {
      try {
        // Map form fields to API fields
        const apiData = {
          ...incidentData,
          admissionNumber: incidentData.admissionNumber, // Use admissionNumber instead of studentId
          followUp: incidentData.followUp // Keep consistent naming
        };
        
        const response = await axiosInstance.post('/disciplinary/incidents', apiData);
        return response.data;
      } catch (error) {
        console.error('Error creating incident:', error);
        throw error;
      }
    },
    
    // Update existing incident
    updateIncident: async (id, incidentData) => {
      try {
        // Map form fields to API fields
        const apiData = {
          ...incidentData,
          followUp: incidentData.followUp, // Ensure consistent naming
          // Remove admissionNumber as it's not needed for updates
          admissionNumber: undefined
        };
        
        const response = await axiosInstance.put(`/disciplinary/incidents/${id}`, apiData);
        return response.data;
      } catch (error) {
        console.error(`Error updating incident ${id}:`, error);
        throw error;
      }
    },
    
    // Delete incident
    deleteIncident: async (id) => {
      try {
        const response = await axiosInstance.delete(`/disciplinary/incidents/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error deleting incident ${id}:`, error);
        throw error;
      }
    },
    
    // Get analytics data
    getAnalytics: async (period = 'year') => {
      try {
        const response = await axiosInstance.get(`/disciplinary/analytics?period=${period}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
      }
    },
    
    // Get actions for a specific incident
    getIncidentActions: async (incidentId) => {
      try {
        const response = await axiosInstance.get(`/disciplinary/actions/${incidentId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching actions for incident ${incidentId}:`, error);
        throw error;
      }
    },
    
    // Add new action to an incident
    addAction: async (actionData) => {
      try {
        const response = await axiosInstance.post('/disciplinary/actions', actionData);
        return response.data;
      } catch (error) {
        console.error('Error adding action:', error);
        throw error;
      }
    }
  };

export default disciplinaryService;