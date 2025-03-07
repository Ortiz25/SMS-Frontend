// src/components/modals/incidentForm.jsx
import React, { useEffect } from "react";
import { X } from "lucide-react";

const IncidentFormDialog = ({
  show,
  onClose,
  formData,
  setFormData,
  onSave,
  isEditing,
  studentOptions,
  loading
}) => {
  // Handle click outside to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (show) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [show, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Edit Incident Record" : "New Incident Record"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Form content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-4">
            {!isEditing && (
              <div className="mb-4">
                <label htmlFor="admissionNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Admission Number
                </label>
                <input
                  id="admissionNumber"
                  name="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={handleChange}
                  placeholder="Enter student admission number"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Where did it happen?"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Select type</option>
                  <option value="Misconduct">Misconduct</option>
                  <option value="Bullying">Bullying</option>
                  <option value="Academic">Academic</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Property Damage">Property Damage</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Select severity</option>
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the incident in detail"
                rows={3}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="witnesses" className="block text-sm font-medium text-gray-700 mb-1">
                Witnesses
              </label>
              <input
                id="witnesses"
                name="witnesses"
                value={formData.witnesses}
                onChange={handleChange}
                placeholder="List any witnesses to the incident"
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                  Action Taken
                </label>
                <select
                  id="action"
                  name="action"
                  value={formData.action}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Select action</option>
                  <option value="Verbal Warning">Verbal Warning</option>
                  <option value="Written Warning">Written Warning</option>
                  <option value="Detention">Detention</option>
                  <option value="Parent Conference">Parent Conference</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Expulsion">Expulsion</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="followUp" className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Date
              </label>
              <input
                id="followUp"
                name="followUp"
                type="date"
                value={formData.followUp}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {formData.status === "Resolved" && (
              <div>
                <label htmlFor="resolutionNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Notes
                </label>
                <textarea
                  id="resolutionNotes"
                  name="resolutionNotes"
                  value={formData.resolutionNotes || ""}
                  onChange={handleChange}
                  placeholder="Provide details about the resolution"
                  rows={2}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? "Saving..." : isEditing ? "Update" : "Save"}
          </button>
        </div>
      </div>

      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0 z-[-1]" 
        onClick={onClose}
      />
    </div>
  );
};

export default IncidentFormDialog;