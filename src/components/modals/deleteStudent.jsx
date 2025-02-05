import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import AnimatedModal from './animateModal';


// Delete Confirmation Modal
const DeleteStudentModal = ({ student, onClose, onConfirm,isOpen }) => {
  return (
    <AnimatedModal isOpen={isOpen}>
      <div className="bg-white rounded-lg  w-full p-6">
        <div className="flex items-center justify-center mb-4 text-red-600">
          <AlertTriangle className="h-12 w-12" />
        </div>
        
        <h2 className="text-xl font-bold text-center mb-2">Delete Student Record</h2>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to delete {student.name}'s record? This action cannot be undone.
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(student.id);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default DeleteStudentModal;