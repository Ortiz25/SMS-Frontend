import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

const DeleteConfirmationModal = ({ show, onClose, onConfirm, user }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!show || !user) {
    return null;
  }

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(user.id);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black opacity-25 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="ml-3 text-lg font-medium leading-6 text-gray-900">
                Delete User
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-3">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete <span className="font-medium">{user.username}</span>? This action cannot be undone.
            </p>
            
            <div className="mt-2 bg-red-50 border border-red-100 rounded-md p-3">
              <div className="text-sm text-red-700">
                <p>Deleting this user will:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Remove their account</li>
                  <li>Delete all access to the system</li>
                  <li>Disassociate from any linked records</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;