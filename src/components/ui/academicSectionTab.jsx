import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, Clock, CheckSquare } from 'lucide-react';
import { academicSettingsAPI } from '../../util/academicSettingsApi';
import { toast } from 'react-toastify'; // Assuming you use react-toastify for notifications

const AcademicSessionsTab = () => {
  const [academicSessions, setAcademicSessions] = useState([]);
  const [showAddSessionForm, setShowAddSessionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    year: '',
    term: 1,
    startDate: '',
    endDate: '',
    isCurrent: false,
    status: 'active'
  });
  
  // Fetch academic sessions from API
  const fetchAcademicSessions = async () => {
    setLoading(true);
    try {
      const response = await academicSettingsAPI.getAcademicSessions();
      if (response.data.success) {
        setAcademicSessions(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch academic sessions');
      }
    } catch (error) {
      console.error('Error fetching academic sessions:', error);
      toast.error('Failed to fetch academic sessions');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchAcademicSessions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format data for API
    const sessionData = {
      year: formData.year,
      term: parseInt(formData.term),
      startDate: formData.startDate,
      endDate: formData.endDate,
      isCurrent: formData.isCurrent,
      status: formData.status
    };
    
    setLoading(true);
    try {
      const response = await academicSettingsAPI.createAcademicSession(sessionData);
      if (response.data.success) {
        toast.success('Academic session created successfully');
        fetchAcademicSessions(); // Refresh data
        setShowAddSessionForm(false);
        // Reset form
        setFormData({
          year: '',
          term: 1,
          startDate: '',
          endDate: '',
          isCurrent: false,
          status: 'active'
        });
      } else {
        toast.error(response.data.message || 'Failed to create academic session');
      }
    } catch (error) {
      console.error('Error creating academic session:', error);
      toast.error(error.response?.data?.message || 'Failed to create academic session');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (session) => {
    // Check if session is completed
    if (session.status === 'completed') {
      toast.warning('Completed sessions cannot be edited. Create a new session if needed.');
      return;
    }
    
    // Populate form with session data
    setFormData({
      year: session.year,
      term: session.term,
      startDate: new Date(session.start_date).toISOString().split('T')[0],
      endDate: new Date(session.end_date).toISOString().split('T')[0],
      isCurrent: session.is_current,
      status: session.status
    });
    setShowAddSessionForm(true);
  };

  const toggleCurrentSession = async (id) => {
    const session = academicSessions.find(s => s.id === id);
    
    // Check if session is completed
    if (session && session.status === 'completed') {
      toast.warning('Completed sessions cannot be set as current. Please activate the session first.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await academicSettingsAPI.setCurrentSession(id);
      if (response.data.success) {
        toast.success('Academic session set as current');
        fetchAcademicSessions(); // Refresh data
      } else {
        toast.error(response.data.message || 'Failed to set current session');
      }
    } catch (error) {
      console.error('Error setting current session:', error);
      toast.error('Failed to set current session');
    } finally {
      setLoading(false);
    }
  };

  // Function to update session status
  // Function to update session status - updated to use dedicated API endpoint
const updateSessionStatus = async (id, newStatus) => {
  setLoading(true);
  try {
    // Use the dedicated method for updating status
    const response = await academicSettingsAPI.updateSessionStatus(id, newStatus);
    
    if (response.data.success) {
      toast.success(`Session status updated to ${newStatus}`);
      
      // If marking as completed and it was the current session, warn the admin
      const sessionToUpdate = academicSessions.find(session => session.id === id);
      if (newStatus === 'completed' && sessionToUpdate.is_current) {
        toast.warning('You\'ve marked the current session as completed. Please set another active session as current.');
      }
      
      fetchAcademicSessions(); // Refresh data
    } else {
      toast.error(response.data.message || 'Failed to update session status');
    }
  } catch (error) {
    console.error('Error updating session status:', error);
    
    // Display the specific error message from the backend
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Failed to update session status');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Academic Sessions</h2>
            <p className="text-sm text-gray-500">Manage school terms and academic years</p>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            onClick={() => setShowAddSessionForm(!showAddSessionForm)}
            disabled={loading}
          >
            <Plus size={16} />
            <span>Add Session</span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Add Session Form - Fields match API structure */}
        {showAddSessionForm && (
          <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-100">
            <h3 className="font-semibold mb-4">Add New Academic Session</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="year">Year</label>
                  <input 
                    type="text" 
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md" 
                    placeholder="e.g. 2025"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="term">Term</label>
                  <select 
                    id="term"
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="1">Term 1</option>
                    <option value="2">Term 2</option>
                    <option value="3">Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="startDate">Start Date</label>
                  <input 
                    type="date" 
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="endDate">End Date</label>
                  <input 
                    type="date" 
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="status">Status</label>
                  <select 
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-center self-end">
                  <input 
                    type="checkbox" 
                    id="isCurrent"
                    name="isCurrent"
                    checked={formData.isCurrent}
                    onChange={handleInputChange}
                    className="mr-2" 
                  />
                  <label htmlFor="isCurrent">Set as current academic session</label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                  onClick={() => setShowAddSessionForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Loading state */}
        {loading && !showAddSessionForm && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Academic Sessions Table */}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">Year</th>
                  <th className="py-3 px-4 text-left">Term</th>
                  <th className="py-3 px-4 text-left">Start Date</th>
                  <th className="py-3 px-4 text-left">End Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {academicSessions.map(session => (
                  <tr key={session.id} className={session.is_current ? 'bg-blue-50' : ''}>
                    <td className="py-3 px-4">{session.year}</td>
                    <td className="py-3 px-4">Term {session.term}</td>
                    <td className="py-3 px-4">{new Date(session.start_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{new Date(session.end_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.status === 'active' ? 'bg-green-100 text-green-800' : 
                        session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                      {session.is_current && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center flex-wrap gap-1">
                        {/* Status Buttons - Displayed or disabled based on completed status */}
                        <div className="flex flex-wrap justify-center gap-1 mb-1">
                          {/* Set Current Session Button - Disabled if completed */}
                          {!session.is_current && (
                            <button 
                              className={`p-1 text-xs ${
                                session.status === 'completed' 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                              } rounded px-2`}
                              onClick={() => toggleCurrentSession(session.id)}
                              disabled={loading || session.status === 'completed'}
                              title={session.status === 'completed' 
                                ? 'Completed sessions cannot be set as current' 
                                : 'Set as current session'}
                            >
                              Set Current
                            </button>
                          )}
                          
                          {/* Activate Button - Hidden if completed */}
                          {session.status !== 'active' && session.status !== 'completed' && (
                            <button 
                              className="p-1 text-xs bg-green-50 hover:bg-green-100 text-green-800 rounded px-2"
                              onClick={() => updateSessionStatus(session.id, 'active')}
                              disabled={loading}
                              title="Set as active"
                            >
                              <Check size={14} className="inline mr-1" />
                              Activate
                            </button>
                          )}
                          
                          {/* Schedule Button - Hidden if completed */}
                          {session.status !== 'scheduled' && session.status !== 'completed' && (
                            <button 
                              className="p-1 text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded px-2"
                              onClick={() => updateSessionStatus(session.id, 'scheduled')}
                              disabled={loading}
                              title="Set as scheduled"
                            >
                              <Clock size={14} className="inline mr-1" />
                              Schedule
                            </button>
                          )}
                          
                          {/* Complete Button - Only shown if not already completed */}
                          {session.status !== 'completed' && (
                            <button 
                              className="p-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-800 rounded px-2"
                              onClick={() => updateSessionStatus(session.id, 'completed')}
                              disabled={loading}
                              title="Set as completed"
                            >
                              <CheckSquare size={14} className="inline mr-1" />
                              Complete
                            </button>
                          )}
                        </div>
                        
                        {/* Edit Button - Disabled if completed */}
                        <button 
                          className={`p-1 ${
                            session.status === 'completed' 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-gray-100'
                          } rounded`}
                          onClick={() => handleEdit(session)}
                          disabled={loading || session.status === 'completed'}
                          title={session.status === 'completed' ? 'Completed sessions cannot be edited' : 'Edit session'}
                        >
                          <Edit size={16} className={session.status === 'completed' ? 'text-gray-400' : 'text-blue-600'} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {academicSessions.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                      No academic sessions found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Help information */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <h4 className="font-medium mb-2">Session Status Guide:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><span className="font-medium text-green-700">Active</span> - The session is currently in progress or ready to be used</li>
            <li><span className="font-medium text-yellow-700">Scheduled</span> - Future session that is planned but not yet active</li>
            <li><span className="font-medium text-gray-700">Completed</span> - Past session that has been concluded</li>
            <li><span className="font-medium text-blue-700">Current</span> - The session that is currently selected across the system</li>
          </ul>
          <p className="mt-2">Only one session can be set as current at a time. This determines which academic period is used for new entries across the system.</p>
          <p className="mt-1"><strong>Note:</strong> Once a session is marked as "Completed", it becomes read-only and cannot be modified. This preserves the integrity of historical academic data.</p>
        </div>
      </div>
    </div>
  );
};

export default AcademicSessionsTab;