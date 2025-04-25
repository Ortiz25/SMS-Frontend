import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
     <div className="bg-black opacity-50 w-full h-full absolute"></div>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 z-100">
        <div className="flex items-center mb-4">
          <AlertTriangle size={24} className="text-red-600 mr-3" />
          <h2 className="text-xl font-semibold">Confirm Deletion</h2>
        </div>
        
        <p className="mb-6">
          Are you sure you want to delete <span className="font-semibold">{itemName}</span>? 
          This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;