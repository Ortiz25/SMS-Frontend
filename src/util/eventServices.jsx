// services/eventService.js
import axios from 'axios';

const API_URL = 'http://localhost:5010/api/events';
// Get token from local storage
const getToken = () => localStorage.getItem('token');

// Get all events with optional filters
export const getEvents = async (filters = {}) => {
  try {
    const token = getToken();
    const response = await axios.get(API_URL, {
      params: filters,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get a single event by ID
export const getEvent = async (eventId) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const token = getToken();
    const response = await axios.post(API_URL, eventData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const token = getToken();
    const response = await axios.put(`${API_URL}/${eventId}`, eventData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting event with ID ${eventId}:`, error);
    throw error;
  }
};

// Get upcoming events (convenience method)
export const getUpcomingEvents = async (limit = 5) => {
  try {
    return await getEvents({ upcoming: 'true', limit });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

// Get events by type
export const getEventsByType = async (eventType) => {
  try {
    return await getEvents({ event_type: eventType });
  } catch (error) {
    console.error(`Error fetching events of type ${eventType}:`, error);
    throw error;
  }
};