// api.js - Create this file to handle API requests
import axios from 'axios';

// Base API URL - adjust as needed for your environment
const API_URL = 'http://localhost:5010/api/academic-settings';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Academic Settings API functions
export const academicSettingsAPI = {
   // Academic Sessions
   getAcademicSessions: (params) => 
    api.get('/academic-sessions', { params }),
  
  createAcademicSession: (sessionData) => 
    api.post('/academic-sessions', sessionData),
  
  updateAcademicSession: (id, sessionData) => 
    api.put(`/academic-sessions/${id}`, sessionData),
  
  setCurrentSession: (id) => 
    api.patch(`/academic-sessions/${id}/set-current`),
  
  // Dedicated method for updating session status
  updateSessionStatus: (id, status) => 
    api.patch(`/academic-sessions/${id}/status`, { status }),
  
  // Grading Systems
  getGradingSystems: (params) => 
    api.get('/grading-systems', { params }),
  
  createGradingSystem: (gradingSystemData) => 
    api.post('/grading-systems', gradingSystemData),
  
  updateGradingSystem: (id, gradingSystemData) => 
    api.put(`/grading-systems/${id}`, gradingSystemData),
  
  // Exam Types
  getExamTypes: (params) => 
    api.get('/exam-types', { params }),
  
  createExamType: (examTypeData) => 
    api.post('/exam-types', examTypeData),
  
  updateExamType: (id, examTypeData) => 
    api.put(`/exam-types/${id}`, examTypeData),
  
  // Reference Data
  getReferenceData: () => 
    api.get('/reference-data')
};

// Add this to your api.js file to include examinations endpoint


export default api;