import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const DeleteExamModal = ({ isOpen, onClose, exam, onConfirm }) => {
  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg w-full max-w-md">
          <div className="p-6">
            {/* Warning Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            {/* Title */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Delete Exam</h3>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete this exam? This action cannot be undone.
              </p>
            </div>

            {/* Exam Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-900">{exam.subject}</p>
              <p className="text-sm text-gray-500">{exam.class}</p>
              <p className="text-sm text-gray-500">
                {exam.date} at {exam.time}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm(exam.id);
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteExamModal;