import React, { useState, useEffect } from "react";
import { X, Clock, CheckCircle, XCircle, User } from "lucide-react";
import axios from "axios";

const ViewLeaveDetailsModal = ({ isOpen, onClose, leaveRequest, isAdmin }) => {
  const [teacherStatus, setTeacherStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch teacher status when modal opens
  useEffect(() => {
    if (isOpen && leaveRequest?.teacher_id) {
      const fetchTeacherStatus = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:5010/api/teachers/${leaveRequest.teacher_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
          
          if (response.data) {
            setTeacherStatus(response.data.status);
          }
        } catch (error) {
          console.error("Error fetching teacher status:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTeacherStatus();
    }
  }, [isOpen, leaveRequest]);

  // Get appropriate status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getTeacherStatusDisplay = () => {
    switch (teacherStatus) {
      case "active":
        return (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
            Active
          </span>
        );
      case "on_leave":
        return (
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
            On Leave
          </span>
        );
      case "suspended":
        return (
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs">
            Suspended
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
            {teacherStatus || "Unknown"}
          </span>
        );
    }
  };

  if (!isOpen || !leaveRequest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative z-10 bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium">Leave Request Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {getStatusIcon(leaveRequest.status)}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  leaveRequest.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : leaveRequest.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {leaveRequest.status.charAt(0).toUpperCase() +
                  leaveRequest.status.slice(1)}
              </span>
            </div>
            
            {/* Teacher status - only show if we have it */}
            {isAdmin && teacherStatus && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Teacher Status:</span>
                {getTeacherStatusDisplay()}
              </div>
            )}
          </div>

          {/* Details */}
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
            
            {leaveRequest.status === "rejected" && leaveRequest.rejection_reason && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium text-gray-500 mb-1">Rejection Reason:</div>
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {leaveRequest.rejection_reason}
                </div>
              </div>
            )}
          </div>

          {/* Status change timeline */}
          {leaveRequest.approval_date && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
              <div className="border-l-2 border-gray-200 pl-4 space-y-4">
                <div className="relative">
                  <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                  <div className="text-xs text-gray-500">
                    {new Date(leaveRequest.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm">Leave request submitted</div>
                </div>
                
                <div className="relative">
                  <div className={`absolute -left-6 mt-1 w-4 h-4 rounded-full ${
                    leaveRequest.status === "approved" 
                      ? "bg-green-100 border-2 border-green-500" 
                      : "bg-red-100 border-2 border-red-500"
                  }`}></div>
                  <div className="text-xs text-gray-500">
                    {new Date(leaveRequest.approval_date).toLocaleString()}
                  </div>
                  <div className="text-sm">
                    Leave request {leaveRequest.status}
                    {leaveRequest.status === "approved" && " (Teacher status changed to 'on_leave')"}
                  </div>
                </div>
                
                {leaveRequest.status === "approved" && new Date(leaveRequest.end_date) <= new Date() && (
                  <div className="relative">
                    <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-green-100 border-2 border-green-500"></div>
                    <div className="text-xs text-gray-500">
                      {formatDate(leaveRequest.end_date)}
                    </div>
                    <div className="text-sm">
                      Leave ended (Teacher status changed to 'active')
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveDetailsModal;