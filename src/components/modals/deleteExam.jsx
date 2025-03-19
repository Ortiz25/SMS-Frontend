import React from "react";
import { X, AlertTriangle } from "lucide-react";

const DeleteExamModal = ({ isOpen, onClose, onConfirm, examData }) => {
  if (!isOpen || !examData) return null;

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delete Exam Schedule</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center text-amber-500 mb-4">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <p className="text-center text-gray-700 mb-4">
            Are you sure you want to delete this exam schedule? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-900 mb-2">{examData.subject_name}</h3>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Class:</div>
              <div className="font-medium">{examData.class_name}</div>
              
              <div className="text-gray-500">Date:</div>
              <div className="font-medium">{formatDate(examData.exam_date)}</div>
              
              <div className="text-gray-500">Time:</div>
              <div className="font-medium">
                {formatTime(examData.start_time)} - {formatTime(examData.end_time)}
              </div>
              
              <div className="text-gray-500">Venue:</div>
              <div className="font-medium">{examData.venue}</div>
            </div>
          </div>
          
          <p className="text-center text-red-600 text-sm">
            Deleting this exam schedule will remove all associated information including any entries in the timetable.
            {examData.status === 'completed' && 
              " This exam is marked as completed. Deleting it may affect student records and results."}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteExamModal;