// examinationSettingsApi.js
import axios from 'axios';

// Base API URL 
const BASE_URL = 'http://localhost:5010/api';

const examinationsAPI = {
  // Get all examinations with optional filtering
  getExaminations: (filters = {}) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.academicSessionId) queryParams.append('academicSessionId', filters.academicSessionId);
    if (filters.examTypeId) queryParams.append('examTypeId', filters.examTypeId);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    
    const queryString = queryParams.toString();
    const url = `${BASE_URL}/examinations${queryString ? `?${queryString}` : ''}`;
    
    return axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  // Get examination by ID
  getExaminationById: (id) => {
    const token = localStorage.getItem('token');
    
    // Validate id is a number before making the request
    if (!id || isNaN(parseInt(id))) {
      return Promise.reject(new Error('Invalid examination ID. Must be a number.'));
    }
    
    return axios.get(`${BASE_URL}/examinations/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  // Get all exam types
  getExamTypes: () => {
    const token = localStorage.getItem('token');
    
    return axios.get(`${BASE_URL}/examinations/exam-types`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  // Get all academic sessions
  getAcademicSessions: () => {
    const token = localStorage.getItem('token');
    
    return axios.get(`${BASE_URL}/examinations/academic-sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  // Create new examination
  createExamination: (data) => {
    const token = localStorage.getItem('token');
    
    return axios.post(`${BASE_URL}/examinations`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },
  
  // Update examination (full update)
  updateExamination: (id, data) => {
    const token = localStorage.getItem('token');
    
    // Validate id is a number before making the request
    if (!id || isNaN(parseInt(id))) {
      return Promise.reject(new Error('Invalid examination ID. Must be a number.'));
    }
    
    return axios.put(`${BASE_URL}/examinations/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },
  
  // Update examination status
  updateExaminationStatus: (id, status) => {
    const token = localStorage.getItem('token');
    
    // Validate id is a number before making the request
    if (!id || isNaN(parseInt(id))) {
      return Promise.reject(new Error('Invalid examination ID. Must be a number.'));
    }
    
    return axios.patch(`${BASE_URL}/examinations/${id}/status`, { status }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },
  
  // Get examination schedules
  getExaminationSchedules: (examinationId) => {
    const token = localStorage.getItem('token');
    
    // Validate id is a number before making the request
    if (!examinationId || isNaN(parseInt(examinationId))) {
      return Promise.reject(new Error('Invalid examination ID. Must be a number.'));
    }
    
    return axios.get(`${BASE_URL}/examinations/${examinationId}/schedules`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  // Get examination results
  getExaminationResults: (examinationId) => {
    const token = localStorage.getItem('token');
    
    // Validate id is a number before making the request
    if (!examinationId || isNaN(parseInt(examinationId))) {
      return Promise.reject(new Error('Invalid examination ID. Must be a number.'));
    }
    
    return axios.get(`${BASE_URL}/examinations/${examinationId}/results`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

export default examinationsAPI;