// components/eventsSection.js
import React, { useState, useEffect } from 'react';
import { PlusCircle, Filter, ChevronDown, Calendar, Tag, MapPin, Clock, Search, Trash2, Edit, Eye } from 'lucide-react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../util/eventServices';
import { format, parseISO } from 'date-fns';

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    event_type: 'academic',
    is_public: true
  });
  const [filter, setFilter] = useState({
    event_type: '',
    upcoming: 'true'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Event type options
  const eventTypes = [
    { value: 'academic', label: 'Academic' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'exam', label: 'Exam' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents(filter);
      setEvents(data);
      setError(null);
    } catch (error) {
      setError('Failed to load events');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      location: '',
      event_type: 'academic',
      is_public: true
    });
    setEditingEvent(null);
  };

  // Set up form for editing
  const handleEdit = (event) => {
    const eventData = {
      ...event,
      event_date: event.event_date.split('T')[0], // Format date for input field
      start_time: event.start_time || '',
      end_time: event.end_time || '',
    };
    setFormData(eventData);
    setEditingEvent(event.id);
    setShowNewForm(true);
    setViewingEvent(null);
  };

  // View event details
  const handleView = (event) => {
    setViewingEvent(event);
    setEditingEvent(null);
    setShowNewForm(false);
  };

  // Handle event deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await deleteEvent(id);
      fetchEvents();
      if (viewingEvent && viewingEvent.id === id) {
        setViewingEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingEvent) {
        await updateEvent(editingEvent, formData);
      } else {
        await createEvent(formData);
      }
      // Clear form and hide it
      resetForm();
      setShowNewForm(false);
      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      setError(editingEvent ? 'Failed to update event' : 'Failed to create event');
    }
  };

  // Filter events by search term
  const filteredEvents = searchTerm 
    ? events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : events;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">School Events</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <div className="relative">
            <select 
              name="event_type"
              value={filter.event_type}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white"
            >
              <option value="">All Event Types</option>
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex items-center">
            <input
              type="checkbox"
              id="upcoming"
              name="upcoming"
              checked={filter.upcoming === 'true'}
              onChange={(e) => handleFilterChange({
                target: {
                  name: 'upcoming',
                  value: e.target.checked ? 'true' : 'false'
                }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            <label htmlFor="upcoming" className="text-sm text-gray-700">
              Upcoming Only
            </label>
          </div>
          <button 
            onClick={() => {
              setShowNewForm(true);
              setEditingEvent(null);
              resetForm();
              setViewingEvent(null);
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Event
          </button>
        </div>
      </div>

      {/* Event Details View */}
      {viewingEvent && (
        <div className="bg-white p-6 rounded-md border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{viewingEvent.title}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(viewingEvent)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(viewingEvent.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewingEvent(null)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center text-gray-600 mb-3">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{format(parseISO(viewingEvent.event_date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              
              {(viewingEvent.start_time || viewingEvent.end_time) && (
                <div className="flex items-center text-gray-600 mb-3">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>
                    {viewingEvent.start_time && format(parseISO(`2000-01-01T${viewingEvent.start_time}`), 'h:mm a')}
                    {viewingEvent.start_time && viewingEvent.end_time && ' - '}
                    {viewingEvent.end_time && format(parseISO(`2000-01-01T${viewingEvent.end_time}`), 'h:mm a')}
                  </span>
                </div>
              )}
              
              {viewingEvent.location && (
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{viewingEvent.location}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-600 mb-3">
                <Tag className="h-5 w-5 mr-2" />
                <span className="capitalize">{viewingEvent.event_type}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${viewingEvent.is_public ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {viewingEvent.is_public ? 'Public Event' : 'Private Event'}
                </span>
              </div>
            </div>
            
            <div>
              {viewingEvent.description && (
                <div className="text-gray-700 whitespace-pre-line">
                  {viewingEvent.description}
                </div>
              )}
              
              <div className="text-sm text-gray-500 mt-4">
                Created by: {viewingEvent.created_by_name || 'Unknown'}
                <br />
                Created at: {format(parseISO(viewingEvent.created_at), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Event Form */}
      {showNewForm && (
        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">{editingEvent ? 'Edit Event' : 'New Event'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date*
                  </label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type*
                  </label>
                  <select 
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter event description..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                  Make this event visible to all users (including parents and students)
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                    resetForm();
                  }}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Events list */
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events found
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {event.title}
                    </h3>
                    <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3 mb-2">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(parseISO(event.event_date), 'MMM d, yyyy')}
                      </span>
                      
                      {event.start_time && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {format(parseISO(`2000-01-01T${event.start_time}`), 'h:mm a')}
                          {event.end_time && ` - ${format(parseISO(`2000-01-01T${event.end_time}`), 'h:mm a')}`}
                        </span>
                      )}
                      
                      {event.location && (
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </span>
                      )}
                      
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        <span className="capitalize">{event.event_type}</span>
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className="text-gray-600 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-1 ml-4">
                    <button
                      onClick={() => handleView(event)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="View details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit event"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete event"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EventsSection;