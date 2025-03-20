import React, { useState, useEffect } from 'react';
import { Plus, Edit, Calendar, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import { format } from 'date-fns';

import examinationsAPI from '../../util/examinationSettingsApi';
import { toast } from 'react-toastify';

const ExaminationsTab = () => {
  const [examinations, setExaminations] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddExamForm, setShowAddExamForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null); // State for the exam being edited
  const [currentSession, setCurrentSession] = useState(null);
  const [filter, setFilter] = useState({
    academicSessionId: '',
    status: '',
    search: ''
  });
  
  const [formData, setFormData] = useState({
    name: '',
    examTypeId: '',
    academicSessionId: '',
    startDate: '',
    endDate: '',
    status: 'scheduled'
  });
  
  // Fetch all required data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all necessary data in parallel
        const [examinationsResponse, examTypesResponse, academicSessionsResponse] = await Promise.all([
          examinationsAPI.getExaminations(),
          examinationsAPI.getExamTypes(),
          examinationsAPI.getAcademicSessions()
        ]);
        
        console.log(examinationsResponse)
        if (examinationsResponse.data.success) {
          setExaminations(examinationsResponse.data.data);
        }
        
        if (examTypesResponse.data.success) {
          setExamTypes(examTypesResponse.data.data);
        }
        
        if (academicSessionsResponse.data.success) {
          const sessions = academicSessionsResponse.data.data;
          setAcademicSessions(sessions);
          
          // Find current academic session
          const current = sessions.find(session => session.is_current);
          if (current) {
            setCurrentSession(current);
            // Set current session as default filter
            setFilter(prev => ({
              ...prev,
              academicSessionId: current.id.toString()
            }));
            
            // Set current session as default for the form
            setFormData(prev => ({
              ...prev,
              academicSessionId: current.id.toString()
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If changing exam type, check if we need to update the name
    if (name === 'examTypeId' && value) {
      const selectedExamType = examTypes.find(type => type.id.toString() === value);
      const selectedSession = academicSessions.find(
        session => session.id.toString() === formData.academicSessionId
      );
      
      if (selectedExamType && selectedSession) {
        const autoName = generateExamName(selectedExamType, selectedSession);
        setFormData(prev => ({
          ...prev,
          name: autoName
        }));
      }
    }
    
    // If changing academic session, update the name as well
    if (name === 'academicSessionId' && value && formData.examTypeId) {
      const selectedExamType = examTypes.find(
        type => type.id.toString() === formData.examTypeId
      );
      const selectedSession = academicSessions.find(
        session => session.id.toString() === value
      );
      
      if (selectedExamType && selectedSession) {
        const autoName = generateExamName(selectedExamType, selectedSession);
        setFormData(prev => ({
          ...prev,
          name: autoName
        }));
      }
    }
  };
  
  // Helper to generate examination name based on exam type and session
  const generateExamName = (examType, session) => {
    // Extract curriculum type prefix
    let prefix = '';
    if (examType.curriculum_type === 'CBC' && examType.category !== 'National Exam') {
      if (examType.name.includes('Junior') || examType.name.includes('JSS')) {
        prefix = 'JSS';
      } else {
        prefix = 'CBC Primary';
      }
    } else if (examType.curriculum_type === '844' && examType.category !== 'National Exam') {
      prefix = 'Form';
    }
    
    // Create name in format "[Prefix] [Exam Type] - Term [Term] [Year]"
    return `${prefix} ${examType.name} - Term ${session.term} ${session.year}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate < startDate) {
      toast.error('End date cannot be before start date');
      return;
    }
    
    setLoading(true);
    try {
      let response;
      
      if (editingExam) {
        // Handle update logic here
        response = await examinationsAPI.updateExamination(editingExam.id, formData);
        if (response.data.success) {
          toast.success('Examination updated successfully');
          // Update the examination in the local state
          setExaminations(examinations.map(exam => 
            exam.id === editingExam.id ? response.data.data : exam
          ));
          setEditingExam(null);
        }
      } else {
        // Handle create logic
        response = await examinationsAPI.createExamination(formData);
        if (response.data.success) {
          toast.success('Examination created successfully');
          setExaminations([...examinations, response.data.data]);
        }
      }
      
      setShowAddExamForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving examination:', error);
      toast.error(error.response?.data?.message || 'Failed to save examination');
    } finally {
      setLoading(false);
    }
  };
  
  // Updated updateExamStatus function with validation
  const updateExamStatus = async (id, newStatus) => {
    // Validate id is a number
    if (!id || isNaN(parseInt(id))) {
      toast.error('Invalid examination ID');
      return;
    }
    
    setLoading(true);
    try {
      const response = await examinationsAPI.updateExaminationStatus(id, newStatus);
      
      if (response.data.success) {
        toast.success(`Examination status updated to ${newStatus}`);
        
        // Update local data
        setExaminations(examinations.map(exam => 
          exam.id === id ? { ...exam, status: newStatus } : exam
        ));
      } else {
        toast.error(response.data.message || 'Failed to update examination status');
      }
    } catch (error) {
      console.error('Error updating examination status:', error);
      toast.error(error.response?.data?.message || 'Failed to update examination status');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (exam) => {
    // Set the exam being edited
    setEditingExam(exam);
    
    // Populate form with exam data
    setFormData({
      name: exam.name,
      examTypeId: exam.exam_type_id.toString(),
      academicSessionId: exam.academic_session_id.toString(),
      startDate: new Date(exam.start_date).toISOString().split('T')[0],
      endDate: new Date(exam.end_date).toISOString().split('T')[0],
      status: exam.status
    });
    
    // Show the form
    setShowAddExamForm(true);
  };
  
  // Function to handle Manage Schedule or View Results button
  const handleManageResults = (exam) => {
    // This would typically navigate to a new route
    // For now, let's show a toast message
    if (exam.status === 'completed') {
      toast.info(`Navigating to view results for ${exam.name}`);
      // Example: history.push(`/examinations/${exam.id}/results`);
    } else {
      toast.info(`Navigating to manage schedule for ${exam.name}`);
      // Example: history.push(`/examinations/${exam.id}/schedule`);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      examTypeId: '',
      academicSessionId: currentSession ? currentSession.id.toString() : '',
      startDate: '',
      endDate: '',
      status: 'scheduled'
    });
    setEditingExam(null);
  };
  
  // Filter examinations based on selected filters
  const filteredExaminations = examinations.filter(exam => {
    // Filter by academic session
    if (filter.academicSessionId && exam.academic_session_id.toString() !== filter.academicSessionId) {
      return false;
    }
    
    // Filter by status
    if (filter.status && exam.status !== filter.status) {
      return false;
    }
    
    // Filter by search term (name)
    if (filter.search && !exam.name.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Get exam type name by ID with proper type checking
  const getExamTypeName = (id) => {
    // Ensure id is treated as a number for comparison
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const examType = examTypes.find(type => type.id === numericId);
    return examType ? examType.name : 'Unknown';
  };
  
  // Get academic session name by ID with proper type checking
  const getAcademicSessionName = (id) => {
    // Ensure id is treated as a number for comparison
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const session = academicSessions.find(session => session.id === numericId);
    return session ? `Term ${session.term} ${session.year}` : 'Unknown';
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock size={14} className="inline mr-1" />;
      case 'ongoing':
        return <Calendar size={14} className="inline mr-1" />;
      case 'completed':
        return <CheckCircle size={14} className="inline mr-1" />;
      case 'cancelled':
        return <XCircle size={14} className="inline mr-1" />;
      default:
        return null;
    }
  };
  
  return (

    <div className="w-full">
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">Examinations</h2>
            <p className="text-sm text-gray-500">Manage school examinations and assessments</p>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => {
              resetForm();
              setShowAddExamForm(!showAddExamForm);
            }}
          >
            <Plus size={16} />
            <span>{editingExam ? "Cancel Edit" : "Add Examination"}</span>
          </button>
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="academicSessionId">Academic Session</label>
            <select
              id="academicSessionId"
              name="academicSessionId"
              value={filter.academicSessionId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Sessions</option>
              {academicSessions.map(session => (
                <option key={session.id} value={session.id.toString()}>
                  Term {session.term} {session.year} {session.is_current ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium mb-1" htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              placeholder="Search examination name..."
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
        
        {/* Add/Edit Examination Form */}
        {showAddExamForm && (
          <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-100">
            <h3 className="font-semibold mb-4">{editingExam ? `Edit Examination: ${editingExam.name}` : 'Add New Examination'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="name">Examination Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md" 
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="examTypeId">Examination Type</label>
                  <select 
                    id="examTypeId"
                    name="examTypeId"
                    value={formData.examTypeId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Exam Type</option>
                    {examTypes.map(type => (
                      <option key={type.id} value={type.id.toString()}>
                        {type.name} ({type.curriculum_type})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="academicSessionId">Academic Session</label>
                  <select 
                    id="academicSessionId"
                    name="academicSessionId"
                    value={formData.academicSessionId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Academic Session</option>
                    {academicSessions.map(session => (
                      <option key={session.id} value={session.id.toString()}>
                        Term {session.term} {session.year} {session.is_current ? '(Current)' : ''}
                      </option>
                    ))}
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
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md order-2 sm:order-1"
                  onClick={() => {
                    setShowAddExamForm(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md order-1 sm:order-2"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingExam ? 'Update Examination' : 'Save Examination')}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Loading state */}
        {loading && !showAddExamForm && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Examinations Table - Responsive handling */}
        {!loading && (
          <>
            {/* Desktop/Tablet view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Exam Type</th>
                    <th className="py-3 px-4 text-left">Session</th>
                    <th className="py-3 px-4 text-left">Start Date</th>
                    <th className="py-3 px-4 text-left">End Date</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExaminations.map(exam => (
                    <tr key={exam.id}>
                      <td className="py-3 px-4">{exam.name}</td>
                      <td className="py-3 px-4">{getExamTypeName(exam.exam_type_id)}</td>
                      <td className="py-3 px-4">{getAcademicSessionName(exam.academic_session_id)}</td>
                      <td className="py-3 px-4">{new Date(exam.start_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(exam.end_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(exam.status)}`}>
                          {getStatusIcon(exam.status)}
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center flex-wrap gap-1">
                          {/* Status Update Buttons - Only show for non-completed exams */}
                          <div className="flex flex-wrap justify-center gap-1 mb-1">
                            {/* For completed exams, only show View Results button */}
                            {exam.status === 'completed' ? (
                              <button 
                                className="p-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-800 rounded px-2"
                                onClick={() => handleManageResults(exam)}
                                title="View exam results"
                              >
                                <FileText size={14} className="inline mr-1" />
                                View Results
                              </button>
                            ) : (
                              <>
                                {/* For scheduled exams */}
                                {exam.status === 'scheduled' && (
                                  <>
                                    <button 
                                      className="p-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 rounded px-2"
                                      onClick={() => updateExamStatus(Number(exam.id), 'ongoing')}
                                      title="Mark as ongoing"
                                    >
                                      <Calendar size={14} className="inline mr-1" />
                                      Start
                                    </button>
                                    <button 
                                      className="p-1 text-xs bg-red-50 hover:bg-red-100 text-red-800 rounded px-2"
                                      onClick={() => updateExamStatus(Number(exam.id), 'cancelled')}
                                      title="Cancel examination"
                                    >
                                      <XCircle size={14} className="inline mr-1" />
                                      Cancel
                                    </button>
                                  </>
                                )}
                                
                                {/* For ongoing exams */}
                                {exam.status === 'ongoing' && (
                                  <button 
                                    className="p-1 text-xs bg-green-50 hover:bg-green-100 text-green-800 rounded px-2"
                                    onClick={() => updateExamStatus(Number(exam.id), 'completed')}
                                    title="Mark as completed"
                                  >
                                    <CheckCircle size={14} className="inline mr-1" />
                                    Complete
                                  </button>
                                )}
                                
                                {/* Manage Schedule button - for non-completed/non-cancelled exams */}
                                {exam.status !== 'cancelled' && (
                                  <button 
                                    className="p-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-800 rounded px-2"
                                    onClick={() => handleManageResults(exam)}
                                    title="Manage exam schedule"
                                  >
                                    <FileText size={14} className="inline mr-1" />
                                    {window.innerWidth < 1024 ? "Schedule" : "Manage Schedule"}
                                  </button>
                                )}
                                
                                {/* Edit button - only for non-completed/non-cancelled exams */}
                                {(exam.status !== 'cancelled') && (
                                  <button 
                                    className="p-1 hover:bg-gray-100 rounded"
                                    onClick={() => handleEditClick(exam)}
                                    title="Edit examination"
                                  >
                                    <Edit size={16} className="text-blue-600" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredExaminations.length === 0 && !loading && (
                    <tr>
                      <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                        No examinations found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mobile view - Card layout */}
            <div className="md:hidden space-y-4">
              {filteredExaminations.map(exam => (
                <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{exam.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(exam.status)}`}>
                      {getStatusIcon(exam.status)}
                      {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm mb-4">
                    <p><span className="font-medium text-gray-500">Type:</span> {getExamTypeName(exam.exam_type_id)}</p>
                    <p><span className="font-medium text-gray-500">Session:</span> {getAcademicSessionName(exam.academic_session_id)}</p>
                    <p><span className="font-medium text-gray-500">Dates:</span> {new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* For completed exams, only show View Results button */}
                    {exam.status === 'completed' ? (
                      <button 
                        className="p-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-800 rounded px-2 flex-1"
                        onClick={() => handleManageResults(exam)}
                      >
                        <FileText size={14} className="inline mr-1" />
                        View Results
                      </button>
                    ) : (
                      <>
                        {/* For scheduled exams */}
                        {exam.status === 'scheduled' && (
                          <>
                            <button 
                              className="p-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 rounded px-2 flex-1"
                              onClick={() => updateExamStatus(Number(exam.id), 'ongoing')}
                            >
                              <Calendar size={14} className="inline mr-1" />
                              Start
                            </button>
                            <button 
                              className="p-1 text-xs bg-red-50 hover:bg-red-100 text-red-800 rounded px-2 flex-1"
                              onClick={() => updateExamStatus(Number(exam.id), 'cancelled')}
                            >
                              <XCircle size={14} className="inline mr-1" />
                              Cancel
                            </button>
                          </>
                        )}
                        
                        {/* For ongoing exams */}
                        {exam.status === 'ongoing' && (
                          <button 
                            className="p-1 text-xs bg-green-50 hover:bg-green-100 text-green-800 rounded px-2 flex-1"
                            onClick={() => updateExamStatus(Number(exam.id), 'completed')}
                          >
                            <CheckCircle size={14} className="inline mr-1" />
                            Complete
                          </button>
                        )}
                        
                        {/* Manage Schedule button - for non-completed/non-cancelled exams */}
                        {exam.status !== 'cancelled' && (
                          <button 
                            className="p-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-800 rounded px-2 flex-1"
                            onClick={() => handleManageResults(exam)}
                          >
                            <FileText size={14} className="inline mr-1" />
                            Manage Schedule
                          </button>
                        )}
                        
                        {/* Edit button - only for non-completed/non-cancelled exams */}
                        {(exam.status !== 'cancelled') && (
                          <button 
                            className="p-1 hover:bg-gray-100 rounded"
                            onClick={() => handleEditClick(exam)}
                          >
                            <Edit size={16} className="text-blue-600" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredExaminations.length === 0 && !loading && (
                <div className="text-center text-gray-500 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  No examinations found matching your filters.
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Help information */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <h4 className="font-medium mb-2">Examination Status Guide:</h4>
          <div className="space-y-1">
            <p><span className="font-medium text-yellow-700">Scheduled</span> - Examination is planned but has not yet started</p>
            <p><span className="font-medium text-blue-700">Ongoing</span> - Examination is currently in progress</p>
            <p><span className="font-medium text-green-700">Completed</span> - Examination has been concluded</p>
            <p><span className="font-medium text-red-700">Cancelled</span> - Examination was cancelled and did not take place</p>
          </div>
          <p className="mt-2">You can view and manage examination schedules by clicking the "Manage Schedule" button.</p>
          <p className="mt-1">Once an examination is marked as completed, you can view and analyze results by clicking "View Results".</p>
        </div>
      </div>
    </div>

  );
};

export default ExaminationsTab;