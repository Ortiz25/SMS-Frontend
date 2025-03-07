import React from "react";
import { X, AlertTriangle } from "lucide-react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, schedule }) => {
  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delete Schedule</h2>
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
            Are you sure you want to delete this schedule?
          </p>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
            <p><span className="font-medium">Class:</span> {schedule.class}</p>
            <p><span className="font-medium">Subject:</span> {schedule.subject}</p>
            <p><span className="font-medium">Day:</span> {schedule.day}</p>
            <p><span className="font-medium">Time:</span> {schedule.time}</p>
          </div>
          <p className="mt-4 text-center text-red-600 text-sm">
            This action cannot be undone.
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

export default DeleteConfirmationModal;