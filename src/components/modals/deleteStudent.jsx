import React, { useState } from 'react';
import { X, AlertTriangle, Loader } from 'lucide-react';
import AnimatedModal from './animateModal';
import axios from 'axios';

// Delete Confirmation Modal
const DeleteStudentModal = ({ student, onClose, onSuccess, isOpen }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  console.log(student)
  const handleDelete = async () => {
    if (!student || !student.id) {
      setError("Invalid student data");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5010/api/students/${student.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        if (onSuccess) {
          onSuccess(student.id);
        }
        onClose();
      } else {
        setError(response.data.error || "Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      setError(error.response?.data?.error || "Failed to delete student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen}>
      <div className="bg-white rounded-lg w-full p-6">
        <div className="flex items-center justify-center mb-4 text-red-600">
          <AlertTriangle className="h-12 w-12" />
        </div>
        
        <h2 className="text-xl font-bold text-center mb-2">Delete Student Record</h2>
        <p className="text-gray-600 text-center mb-4">
          Are you sure you want to delete <span className='font-extrabold'>{student?.name}'s</span> record? This action cannot be undone.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-center">
            <X className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};

export default DeleteStudentModal;