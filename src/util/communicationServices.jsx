// services/communicationService.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/communications';

// Create a reusable function to get headers with the current token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${token}`
  };
};

// Create an axios instance with baseURL
const apiClient = axios.create({
  baseURL: API_URL
});

// Add request interceptor to always use fresh token
apiClient.interceptors.request.use(config => {
  config.headers = getAuthHeaders();
  return config;
});

// Get communication stats
export const getCommunicationStats = async () => {
  try {
    const response = await apiClient.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching communication stats:', error);
    throw error;
  }
};

// Get announcements
export const getAnnouncements = async () => {
  try {
    const response = await apiClient.get('/announcements');
    return response.data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

// Create announcement
export const createAnnouncement = async (announcementData) => {
  try {
    const response = await apiClient.post('/announcements', announcementData);
    return response.data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

// Get emails
export const getEmails = async () => {
  try {
    const response = await apiClient.get('/emails');
    return response.data;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

// Send email
export const sendEmail = async (emailData) => {
  try {
    const response = await apiClient.post('/emails', emailData);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Get SMS messages
export const getSmsMessages = async () => {
  try {
    const response = await apiClient.get('/sms');
    return response.data;
  } catch (error) {
    console.error('Error fetching SMS messages:', error);
    throw error;
  }
};

// Send SMS
export const sendSms = async (smsData) => {
  try {
    const response = await apiClient.post('/sms', smsData);
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// Get SMS templates
export const getSmsTemplates = async () => {
  try {
    const response = await apiClient.get('/templates');
    return response.data;
  } catch (error) {
    console.error('Error fetching SMS templates:', error);
    throw error;
  }
};

// Create SMS template
export const createSmsTemplate = async (templateData) => {
  try {
    const response = await apiClient.post('/templates', templateData);
    return response.data;
  } catch (error) {
    console.error('Error creating SMS template:', error);
    throw error;
  }
};

// Get classes (for recipient selection)
export const getClasses = async () => {
  try {
    // Note: This endpoint is outside our base URL
    const response = await axios.get('http://localhost:5001/api/helpers/classes', {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

// Get departments (for recipient selection)
export const getDepartments = async () => {
  try {
    // Note: This endpoint is outside our base URL
    const response = await axios.get('http://localhost:5001/api/helpers/departments', {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};