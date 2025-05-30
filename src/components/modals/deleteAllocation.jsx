import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const DeleteAllocationModal = ({ isOpen, onClose, onConfirm, allocation }) => {
  if (!isOpen || !allocation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delete Allocation</h2>
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
          <p className="text-center text-gray-700">
            Are you sure you want to delete this class allocation?
          </p>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p><span className="font-medium">Class:</span> {allocation.class_name}</p>
            <p><span className="font-medium">Subject:</span> {allocation.subject_name}</p>
            <p><span className="font-medium">Teacher:</span> {allocation.teacher_name}</p>
          </div>
          <p className="mt-4 text-center text-red-600 text-sm">
            This action cannot be undone. Deleting this allocation will remove the teacher from this class and subject combination.
            Any related timetable entries will also be affected.
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
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

export default DeleteAllocationModal;