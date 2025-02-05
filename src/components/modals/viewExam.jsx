import React from 'react';
import { X, Calendar, Clock, User, MapPin } from 'lucide-react';

const ViewExamModal = ({ isOpen, onClose, exam }) => {
  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Exam Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Subject</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{exam.subject}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Class</label>
                <p className="mt-1 text-sm font-medium text-gray-900">{exam.class}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{exam.date}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">Time</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {exam.time} ({exam.duration})
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Invigilator */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">Room</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{exam.room}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <label className="block text-sm font-medium text-gray-500">Invigilator</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{exam.invigilator}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {exam.instructions && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Special Instructions
                </label>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">{exam.instructions}</p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  exam.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  exam.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExamModal;