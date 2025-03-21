import React, { useState } from "react";
import { X, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

const LeaveApprovalModal = ({ 
  isOpen, 
  onClose, 
  leaveRequest, 
  onApprove, 
  onReject, 
  action 
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !leaveRequest) return null;

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (action === "approve") {
        await onApprove(leaveRequest);
      } else if (action === "reject") {
        if (!rejectionReason.trim()) {
          throw new Error("Rejection reason is required");
        }
        await onReject({
          ...leaveRequest,
          rejection_reason: rejectionReason
        });
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative z-10 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {action === "approve" ? "Approve Leave" : "Reject Leave"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Change Information */}
          {action === "approve" && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-sm flex items-start mb-4">
              <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Teacher Status Change</p>
                <p>
                  Approving this leave will automatically change the teacher's status to "on_leave" 
                  for the duration of the leave period. When the leave ends, the system will 
                  automatically restore the status to "active".
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-md space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Teacher:</span>
              <span className="text-sm text-gray-900">{leaveRequest.teacher_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Leave Type:</span>
              <span className="text-sm text-gray-900">{leaveRequest.leave_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Duration:</span>
              <span className="text-sm text-gray-900">
                {formatDate(leaveRequest.start_date)} - {formatDate(leaveRequest.end_date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Days:</span>
              <span className="text-sm text-gray-900">{leaveRequest.days_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Reason:</span>
              <span className="text-sm text-gray-900">{leaveRequest.reason}</span>
            </div>
            {leaveRequest.substitute_teacher_name && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Substitute:</span>
                <span className="text-sm text-gray-900">{leaveRequest.substitute_teacher_name}</span>
              </div>
            )}
          </div>

          {action === "reject" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center ${
                action === "approve" 
                  ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" 
                  : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {action === "approve" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveApprovalModal;