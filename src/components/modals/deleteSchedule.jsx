import React from "react";
import { AlertTriangle, X } from "lucide-react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, schedule }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div
          className="fixed inset-0 bg-black opacity-75"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>

          <h3 className="text-lg font-medium text-center mb-2">
            Delete Schedule
          </h3>
          <p className="text-gray-500 text-center mb-6">
            Are you sure you want to delete{" "}
            <span className="font-bold">{schedule?.subject}</span> class for{" "}
            <span className="font-bold">{schedule?.class}</span> on{" "}
            <span className="font-bold" >{schedule?.day} {schedule?.time}</span>? This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Delete Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
