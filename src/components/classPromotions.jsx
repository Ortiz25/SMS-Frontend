import React, { useState, useEffect } from 'react';
import { ChevronDown, Users, User, Calendar, BookOpen, Trophy, AlertCircle, CheckCircle, X, RefreshCw } from 'lucide-react';

const PromotionManagement = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // API base URL - adjust according to your setup
  const API_BASE = '/backend/api/promotions';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        fetchStudents(),
        fetchClasses()
      ]);
    } catch (error) {
      showNotification('Failed to load initial data', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchStudents = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.class_name) queryParams.append('class_name', filters.class_name);
      if (filters.stream) queryParams.append('stream', filters.stream);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await fetch(`${API_BASE}/students?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      console.log()
      if (data.success) {
        setStudents(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification(error.message || 'Failed to fetch students', 'error');
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/classes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      if (data.success) {
        setClasses(data.data.classes);
        setCurrentSession(data.data.currentSession);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showNotification(error.message || 'Failed to fetch classes', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const IndividualPromotion = () => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [newClass, setNewClass] = useState('');
    const [newStream, setNewStream] = useState('');
    const [promotionStatus, setPromotionStatus] = useState('promoted');
    const [remarks, setRemarks] = useState('');
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);

    const validatePromotion = async () => {
      if (!selectedStudent || !newClass) return;

      setValidating(true);
      try {
        const response = await fetch(`${API_BASE}/validate-promotion`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            student_id: parseInt(selectedStudent),
            new_class_name: newClass, // This is now the level (e.g., "Form 3")
            new_stream: newStream || null
          })
        });

        const data = await response.json();
        if (data.success) {
          setValidationResult(data.data);
        } else {
          showNotification(data.message, 'error');
          setValidationResult(null);
        }
      } catch (error) {
        showNotification('Failed to validate promotion', 'error');
        setValidationResult(null);
      } finally {
        setValidating(false);
      }
    };

    useEffect(() => {
      if (selectedStudent && newClass) {
        validatePromotion();
      } else {
        setValidationResult(null);
      }
    }, [selectedStudent, newClass, newStream]);

    const handlePromoteStudent = async () => {
      if (!selectedStudent || !newClass) {
        showNotification('Please select a student and new class', 'error');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/promote-student`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            student_id: parseInt(selectedStudent),
            new_class_name: newClass, // This is now the level (e.g., "Form 3")
            new_stream: newStream || null,
            promotion_status: promotionStatus,
            remarks: remarks || null
          })
        });

        const data = await response.json();
        
        if (data.success) {
          showNotification(data.message);
          
          // Reset form
          setSelectedStudent('');
          setNewClass('');
          setNewStream('');
          setRemarks('');
          setValidationResult(null);
          
          // Refresh students data
          await fetchStudents();
        } else {
          showNotification(data.message, 'error');
        }
      } catch (error) {
        showNotification('Failed to promote student', 'error');
      } finally {
        setLoading(false);
      }
    };

    const selectedStudentData = students.find(s => s.id === parseInt(selectedStudent));
    const selectedClassData = classes.find(c => c.level === newClass);

    return (
      <div className="bg-white">
        <div className="flex items-center mb-6">
          <User className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Individual Student Promotion</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <div className="relative">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm"
                disabled={dataLoading}
              >
                <option value="">Choose a student...</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.admission_number} - {student.first_name} {student.last_name} ({student.current_class} {student.stream})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {selectedStudentData && (
              <div className="mt-2 px-3 py-2 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Current:</span> {selectedStudentData.current_class} {selectedStudentData.stream}
                  <span className="ml-2 text-blue-600">({selectedStudentData.curriculum_type})</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Class
            </label>
            <div className="relative">
              <select
                value={newClass}
                onChange={(e) => {
                  setNewClass(e.target.value);
                  setNewStream('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm"
                disabled={dataLoading}
              >
                <option value="">Select new class...</option>
                {classes.map(cls => (
                  <option key={`${cls.level}-${cls.curriculum_type}`} value={cls.level}>
                    {cls.level} ({cls.curriculum_type})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              {validating && (
                <RefreshCw className="absolute right-8 top-2.5 w-4 h-4 text-blue-500 animate-spin" />
              )}
            </div>
          </div>

          {selectedClassData && selectedClassData.streams && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stream
              </label>
              <div className="relative">
                <select
                  value={newStream}
                  onChange={(e) => setNewStream(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm"
                >
                  <option value="">Select stream...</option>
                  {selectedClassData.streams.map(stream => (
                    <option key={stream} value={stream}>Stream {stream}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Status
            </label>
            <div className="relative">
              <select
                value={promotionStatus}
                onChange={(e) => setPromotionStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm"
              >
                <option value="promoted">Promoted</option>
                <option value="repeated">Repeated</option>
                <option value="transferred">Transferred</option>
                <option value="graduated">Graduated</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Validation Warnings */}
          {validationResult && validationResult.warnings && (
            <div className="md:col-span-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">Validation Warnings</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any additional notes about this promotion..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              rows="3"
            />
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handlePromoteStudent}
              disabled={loading || !selectedStudent || !newClass || validating}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Trophy className="w-4 h-4 mr-2" />
              )}
              Promote Student
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BulkPromotion = () => {
    const [currentClass, setCurrentClass] = useState('');
    const [currentStream, setCurrentStream] = useState('');
    const [newClass, setNewClass] = useState('');
    const [newStream, setNewStream] = useState('');
    const [previewStudents, setPreviewStudents] = useState([]);
    const [previewLoading, setPreviewLoading] = useState(false);

    console.log(currentClass,currentStream)

    const loadPreviewStudents = async () => {
        if (!currentClass || !currentStream) {
          setPreviewStudents([]);
          return;
        }
      
        setPreviewLoading(true);
        try {
          // Fetch students with specific filters
          const queryParams = new URLSearchParams();
          queryParams.append('class_name', currentClass);
          queryParams.append('stream', currentStream);
          queryParams.append('status', 'active');
      
          const response = await fetch(`${API_BASE}/students?${queryParams}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
      
          if (!response.ok) {
            throw new Error('Failed to fetch students');
          }
      
          const data = await response.json();
          if (data.success) {
            // Directly set the filtered students from the API response
            setPreviewStudents(data.data);
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          showNotification('Failed to load student preview', 'error');
          setPreviewStudents([]);
        } finally {
          setPreviewLoading(false);
        }
      };

    useEffect(() => {
      loadPreviewStudents();
    }, [currentClass, currentStream]);

    const handleBulkPromotion = async () => {
      if (!currentClass || !currentStream || !newClass) {
        showNotification('Please select current class, stream, and new class', 'error');
        return;
      }

      if (previewStudents.length === 0) {
        showNotification('No students found to promote', 'error');
        return;
      }

      const confirmPromotion = window.confirm(
        `Are you sure you want to promote ${previewStudents.length} students from ${currentClass} ${currentStream} to ${newClass} ${newStream || ''}?`
      );

      if (!confirmPromotion) return;

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/bulk-promote`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            current_class_name: currentClass,
            current_stream: currentStream,
            new_class_name: newClass,
            new_stream: newStream || null
          })
        });

        const data = await response.json();
        
        if (data.success) {
          showNotification(data.message);
          
          // Show detailed results if there were any errors
          if (data.data.errors && data.data.errors.length > 0) {
            showNotification(`Promoted ${data.data.promoted_count}/${data.data.total_students} students. Some students had errors.`, 'warning');
          }
          
          // Reset form
          setCurrentClass('');
          setCurrentStream('');
          setNewClass('');
          setNewStream('');
          setPreviewStudents([]);
          
          // Refresh students data
          await fetchStudents();
        } else {
          showNotification(data.message, 'error');
        }
      } catch (error) {
        showNotification('Failed to promote students', 'error');
      } finally {
        setLoading(false);
      }
    };

    const currentClassData = classes.find(c => c.level === currentClass);
    const newClassData = classes.find(c => c.level === newClass);

    return (
      <div className="bg-white">
        <div className="flex items-center mb-6">
          <Users className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Bulk Class Promotion</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Current Class</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <div className="relative">
                  <select
                    value={currentClass}
                    onChange={(e) => {
                      setCurrentClass(e.target.value);
                      setCurrentStream('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm"
                    disabled={dataLoading}
                  >
                    <option value="">Select current class...</option>
                    {classes.map(cls => (
                      <option key={`current-${cls.level}-${cls.curriculum_type}`} value={cls.level}>
                        {cls.level} ({cls.curriculum_type})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {currentClassData && currentClassData.streams && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream
                  </label>
                  <div className="relative">
                    <select
                      value={currentStream}
                      onChange={(e) => setCurrentStream(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm"
                    >
                      <option value="">Select stream...</option>
                      {currentClassData.streams.map(stream => (
                        <option key={stream} value={stream}>Stream {stream}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    {previewLoading && (
                      <RefreshCw className="absolute right-8 top-2.5 w-4 h-4 text-blue-500 animate-spin" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">New Class</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <div className="relative">
                  <select
                    value={newClass}
                    onChange={(e) => {
                      setNewClass(e.target.value);
                      setNewStream('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm"
                    disabled={dataLoading}
                  >
                    <option value="">Select new class...</option>
                    {classes.map(cls => (
                      <option key={`new-${cls.level}-${cls.curriculum_type}`} value={cls.level}>
                        {cls.level} ({cls.curriculum_type})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {newClassData && newClassData.streams && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream
                  </label>
                  <div className="relative">
                    <select
                      value={newStream}
                      onChange={(e) => setNewStream(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm"
                    >
                      <option value="">Select stream...</option>
                      {newClassData.streams.map(stream => (
                        <option key={stream} value={stream}>Stream {stream}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {previewStudents.length > 0 && (
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3">
              Students to be promoted ({previewStudents.length})
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {previewStudents.map(student => (
                  <div key={student.id} className="flex items-center px-3 py-2 bg-white rounded border border-gray-200">
                    <BookOpen className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-900 truncate">
                      {student.admission_number} - {student.first_name} {student.last_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleBulkPromotion}
          disabled={loading || !currentClass || !currentStream || !newClass || previewStudents.length === 0 || previewLoading}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Users className="w-4 h-4 mr-2" />
          )}
          Promote {previewStudents.length > 0 ? previewStudents.length : ''} Students
        </button>
      </div>
    );
  };

  if (dataLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading promotion data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Class Promotion Management</h1>
        <p className="text-gray-600 text-sm">Promote students to their next academic level</p>
        {currentSession && (
          <p className="text-sm text-blue-600 mt-1">
            Current Session: {currentSession.year} Term {currentSession.term}
          </p>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : notification.type === 'warning'
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : notification.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <span className={`text-sm ${
              notification.type === 'success' ? 'text-green-800' : 
              notification.type === 'warning' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {notification.message}
            </span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* No current session warning */}
      {!currentSession && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm text-red-800">
              No current academic session found. Please set up the new academic session before promoting students.
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('individual')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'individual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Individual Promotion
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'bulk'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Bulk Promotion
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        {activeTab === 'individual' ? <IndividualPromotion /> : <BulkPromotion />}
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1 text-sm">Academic Session Management</h3>
            <p className="text-sm text-blue-700">
              Make sure to set up the new academic session before promoting students. 
              All promotion records will be linked to the current active academic session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionManagement;