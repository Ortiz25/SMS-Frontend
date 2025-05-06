
import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle, Calendar, Clock, AlertTriangle, User } from "lucide-react";
import LoadingSpinner from "../../util/loaderSpinner";
import { useStore } from "../../store/store";

const IncidentFormDialog = ({ 
  show, 
  onClose, 
  formData, 
  setFormData, 
  onSave, 
  onActionChange,
  isEditing, 
  loading,
  actionStatusMappings = []
}) => {
  const [localFormData, setLocalFormData] = useState(formData);
  const { studentsData } = useStore();
  const [previewStatus, setPreviewStatus] = useState(null);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchingStudent, setSearchingStudent] = useState(false);
  
  // Severity options
  const severityOptions = ["Minor", "Moderate", "Severe"];
  
  // Status options
  const statusOptions = ["Pending", "In Progress", "Resolved"];
  
  // Student status options
  const studentStatusOptions = ["active", "inactive", "suspended", "on_probation", "expelled"];
  
  // Common action types
  const actionOptions = [
    "Verbal Warning",
    "Written Warning",
    "Detention",
    "Parent Conference",
    "Counseling Referral",
    "Suspension",
    "Expulsion",
    "Community Service",
    "Behavior Contract",
    "Probation",
    "Restorative Justice"
  ];

  // Reset local form data when formData changes
  useEffect(() => {
    setLocalFormData(formData);
    
    // Set preview status if editing an incident with status change
    if (formData.affectsStatus && formData.statusChange) {
      setPreviewStatus(formData.statusChange);
    } else {
      setPreviewStatus(null);
    }
  }, [formData]);

  // Check for severe status changes
  useEffect(() => {
    // Determine if this action requires approval
    const requiresHigherApproval = 
      localFormData.affectsStatus && 
      (localFormData.statusChange === 'expelled' || 
       (localFormData.statusChange === 'suspended' && 
       (localFormData.endDate && new Date(localFormData.endDate) > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))));
    
    setRequiresApproval(requiresHigherApproval);
  }, [localFormData]);
  const searchStudent = async () => {
    if (!localFormData.admissionNumber) return;
    
    try {
      setSearchingStudent(true);
      console.log(localFormData, studentsData)
      // Find the student by admission number
      const student = studentsData.find(
        s => s.admissionNo.toLowerCase().trim() === localFormData.admissionNumber.toLowerCase().trim()
      );
      
      if (student) {
        // Update form with found student data
        const updatedData = {
          ...localFormData,
          studentName: `${student.first_name} ${student.last_name}`,
          grade: `${student.class} ${student.stream}`,
          student_id: student.id
        };
        
        setLocalFormData(updatedData);
        setFormData(updatedData); // Sync with parent state
      } else {
        // Student not found
        alert("Student not found with this admission number.");
      }
      
      setSearchingStudent(false);
    } catch (error) {
      console.error("Error searching for student:", error);
      setSearchingStudent(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkboxes
    if (type === "checkbox") {
      const updatedData = {
        ...localFormData,
        [name]: checked
      };
      
      setLocalFormData(updatedData);
      
      // If unchecking affectsStatus, clear status change fields
      if (name === "affectsStatus" && !checked) {
        const clearedData = {
          ...updatedData,
          affectsStatus: false,
          statusChange: "",
          effectiveDate: new Date().toISOString().split('T')[0],
          endDate: "",
          autoRestore: true
        };
        setLocalFormData(clearedData);
        setFormData(clearedData); // Sync with parent state
        setPreviewStatus(null);
        return;
      }
      
      // Sync checkbox change with parent
      setFormData(updatedData);
      return;
    }
    
    // Special case for action field
    if (name === "action") {
      // Call the action change handler to check for status mappings
      if (onActionChange) {
        onActionChange(value);
        
        // Find mapping to preview status change
        const mapping = actionStatusMappings.find(m => m.action_type === value);
        if (mapping) {
          setPreviewStatus(mapping.resulting_status);
        }
      } else {
        // If no handler provided, just update the action
        const updatedData = {
          ...localFormData,
          action: value
        };
        setLocalFormData(updatedData);
        setFormData(updatedData); // Sync with parent state
      }
      return;
    }
    
    // Handle status change preview
    if (name === "statusChange") {
      setPreviewStatus(value);
    }
    
    // Handle all other fields
    const updatedData = {
      ...localFormData,
      [name]: value
    };
    
    setLocalFormData(updatedData);
    setFormData(updatedData); // Sync with parent state
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const required = [
      "studentName",
      "admissionNumber",
      "date", 
      "type", 
      "severity", 
      "description",
      "status"
    ];
    
    const missingFields = required.filter(field => !localFormData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(", ")}`);
      return;
    }
    
    // Validate status change fields if affectsStatus is checked
    if (localFormData.affectsStatus) {
      if (!localFormData.statusChange) {
        alert("Please select a status change type");
        return;
      }
      
      if (!localFormData.effectiveDate) {
        alert("Please select an effective date for the status change");
        return;
      }
      
      // If not a permanent change, end date is required
      if (localFormData.statusChange !== "expelled" && !localFormData.endDate) {
        alert("Please select an end date for the temporary status change");
        return;
      }
    }
    
    // Pass the form data to the parent component - this is redundant now
    // since we're keeping them in sync, but keeping it for safety
    setFormData(localFormData);
  
   onSave();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Incident Record" : "New Incident Record"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {loading && <LoadingSpinner />}

          <form onSubmit={handleSubmit}>
            {/* Student Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admission Number*
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      name="admissionNumber"
                      value={localFormData.admissionNumber || ""}
                      onChange={handleInputChange}
                      className="flex-grow border border-gray-300 rounded-l-md py-2 px-3"
                      placeholder="e.g. ADM/2023/001"
                    />
                    <button
                      type="button"
                      onClick={searchStudent}
                      className="bg-blue-600 text-white px-3 py-2 rounded-r-md"
                      disabled={searchingStudent || !localFormData.admissionNumber}
                    >
                      {searchingStudent ? "..." : "Find"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name*
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={localFormData.studentName || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                    placeholder="Full name"
                    readOnly={searchingStudent}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class/Grade
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={localFormData.grade || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                    placeholder="e.g. Grade 8B"
                    readOnly={searchingStudent}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Status
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                    Active
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Incident Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={localFormData.date || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type*
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={localFormData.type || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                    placeholder="e.g. Misconduct, Bullying, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity*
                  </label>
                  <select
                    name="severity"
                    value={localFormData.severity || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                  >
                    <option value="">Select Severity</option>
                    {severityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={localFormData.location || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                    placeholder="e.g. Classroom, Playground, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Witnesses
                  </label>
                  <input
                    type="text"
                    name="witnesses"
                    value={localFormData.witnesses || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                    placeholder="Names of any witnesses"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={localFormData.description || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  rows="4"
                  placeholder="Detailed description of the incident"
                ></textarea>
              </div>
            </div>

            {/* Actions & Status */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Actions & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Taken
                  </label>
                  <select
                    name="action"
                    value={localFormData.action || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                  >
                    <option value="">Select Action</option>
                    {actionOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status*
                  </label>
                  <select
                    name="status"
                    value={localFormData.status || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-Up Date
                  </label>
                  <input
                    type="date"
                    name="followUp"
                    value={localFormData.followUp || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3"
                  />
                </div>
              </div>
            </div>

            {/* Status Change Section */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="affectsStatus"
                  id="affectsStatus"
                  checked={localFormData.affectsStatus || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="affectsStatus" className="ml-2 font-semibold text-gray-900">
                  This incident affects student enrollment status
                </label>
              </div>

              {localFormData.affectsStatus && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status Change*
                      </label>
                      <select
                        name="statusChange"
                        value={localFormData.statusChange || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3"
                      >
                        <option value="">Select New Status</option>
                        {studentStatusOptions.map(option => (
                          <option key={option} value={option}>
                            {option.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Effective Date*
                      </label>
                      <input
                        type="date"
                        name="effectiveDate"
                        value={localFormData.effectiveDate || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date {localFormData.statusChange !== "expelled" && "*"}
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={localFormData.endDate || ""}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3"
                        disabled={localFormData.statusChange === "expelled"}
                      />
                      {localFormData.statusChange === "expelled" && (
                        <p className="text-xs text-gray-500 mt-1">Not applicable for expulsion</p>
                      )}
                    </div>
                  </div>

                  {localFormData.statusChange !== "expelled" && (
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        name="autoRestore"
                        id="autoRestore"
                        checked={localFormData.autoRestore}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="autoRestore" className="ml-2 text-sm text-gray-700">
                        Automatically restore previous status when end date is reached
                      </label>
                    </div>
                  )}

                  {/* Status change preview */}
                  {previewStatus && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-blue-800">Status Change Preview</h4>
                          <p className="text-sm text-blue-700">
                            Student status will change from <strong>active</strong> to <strong>{previewStatus.replace('_', ' ')}</strong>
                            {localFormData.endDate ? (
                              <span> until <strong>{new Date(localFormData.endDate).toLocaleDateString()}</strong></span>
                            ) : previewStatus !== "expelled" ? (
                              <span> (no end date specified)</span>
                            ) : (
                              <span> permanently</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning for actions requiring approval */}
                  {requiresApproval && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Administrative Approval Required</h4>
                        <p className="text-sm text-yellow-700">
                          This status change requires approval from a school administrator before taking effect.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {isEditing ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentFormDialog;