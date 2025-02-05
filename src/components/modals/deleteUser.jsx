import React from "react";
import { AlertCircle, X } from "lucide-react";

const DeleteConfirmationModal = ({ show, onClose, onConfirm, user }) => {
  if (!show || !user) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>{" "}
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 z-50 relative">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete {user.name}? This action cannot be
              undone and will remove all associated data.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900">User Details:</h4>
          <ul className="mt-2 text-sm text-gray-600 space-y-1">
            <li>Name: {user.name}</li>
            <li>Email: {user.email}</li>
            <li>Role: {user.role}</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(user.id)}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
