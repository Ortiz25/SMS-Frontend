import React from 'react';
import { X, Clock, Download, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

const ViewLeaveDetailsModal = ({ isOpen, onClose, leaveRequest }) => {
  if (!isOpen || !leaveRequest) return null;

  const getStatusStyles = (status) => {
    const styles = {
      approved: {
        bg: 'bg-green-50',
        text: 'text-green-800',
        icon: CheckCircle,
        message: 'Leave request approved'
      },
      rejected: {
        bg: 'bg-red-50',
        text: 'text-red-800',
        icon: XCircle,
        message: 'Leave request rejected'
      },
      pending: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        icon: Clock,
        message: 'Awaiting approval'
      }
    };
    return styles[status] || styles.pending;
  };

  const statusStyle = getStatusStyles(leaveRequest.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-medium">Leave Request Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg ${statusStyle.bg}`}>
              <div className="flex items-center space-x-3">
                <statusStyle.icon className={`h-5 w-5 ${statusStyle.text}`} />
                <div>
                  <p className={`font-medium ${statusStyle.text}`}>{statusStyle.message}</p>
                  {leaveRequest.updatedAt && (
                    <p className="text-sm text-gray-600 mt-1">
                      Updated on {new Date(leaveRequest.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Type</label>
                  <p className="mt-1 text-sm">{leaveRequest.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Duration</label>
                  <p className="mt-1 text-sm">{leaveRequest.days} days</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">From</label>
                  <p className="mt-1 text-sm">{leaveRequest.startDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">To</label>
                  <p className="mt-1 text-sm">{leaveRequest.endDate}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Reason</label>
                <p className="mt-1 text-sm">{leaveRequest.reason}</p>
              </div>

              {leaveRequest.remarks && (
                <div className="pt-4 border-t">
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Remarks</label>
                      <p className="mt-1 text-sm">{leaveRequest.remarks}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-4">
            {leaveRequest.attachments && (
              <button className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700">
                <Download className="h-4 w-4" />
                <span>Download Documents</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveDetailsModal;