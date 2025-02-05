import React, { useState } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

const LeaveApprovalModal = ({ isOpen, onClose, leaveRequest, onApprove, onReject }) => {
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState(null); // 'approve' or 'reject'

  const handleSubmit = async (status) => {
    setIsSubmitting(true);
    try {
      const response = {
        leaveId: leaveRequest.id,
        status,
        remarks,
        updatedAt: new Date().toISOString()
      };

      if (status === 'approved') {
        await onApprove(response);
      } else {
        await onReject(response);
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg max-w-md w-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium">
              {action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Leave Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm"><span className="font-medium">Employee:</span> {leaveRequest.teacher}</p>
              <p className="text-sm"><span className="font-medium">Type:</span> {leaveRequest.type}</p>
              <p className="text-sm">
                <span className="font-medium">Duration:</span> {leaveRequest.startDate} to {leaveRequest.endDate}
              </p>
            </div>

            {/* Remarks Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add any comments or notes..."
              />
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <p className="ml-3 text-sm text-yellow-700">
                  This action cannot be undone. Please review before confirming.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            {action === 'approve' ? (
              <button
                onClick={() => handleSubmit('approved')}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center"
                disabled={isSubmitting}
              >
                <Check className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Approving...' : 'Approve Leave'}
              </button>
            ) : (
              <button
                onClick={() => handleSubmit('rejected')}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Rejecting...' : 'Reject Leave'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApprovalModal;