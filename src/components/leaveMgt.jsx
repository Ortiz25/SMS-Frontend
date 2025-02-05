import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import LeaveRequestsTable from "./leaveRequestTable";
import RequestLeaveModal from "./modals/requestLeave";
import ViewLeaveDetailsModal from "./modals/viewLeaveDetails";
import LeaveApprovalModal from "./modals/leaveApproval";

const LeaveManagement = () => {
  const [activeView, setActiveView] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const [approvalAction, setApprovalAction] = useState(null);

  // To open the modal
  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setShowDetailsModal(true);
  };

  const handleApproveLeave = async (data) => {
    try {
      // Add your API call here
      console.log("Approving leave:", data);
      // Update the leave request in your list
      // Show success notification
    } catch (error) {
      console.error("Error approving leave:", error);
      // Show error notification
    }
  };

  const handleRejectLeave = async (data) => {
    try {
      // Add your API call here
      console.log("Rejecting leave:", data);
      // Update the leave request in your list
      // Show success notification
    } catch (error) {
      console.error("Error rejecting leave:", error);
      // Show error notification
    }
  };

  // Stats data
  const leaveStats = [
    {
      title: "Pending Requests",
      count: 5,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved Leaves",
      count: 12,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected Leaves",
      count: 3,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Leave Balance",
      count: "15 days",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {leaveStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                {stat.title}
              </h3>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold">{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            className="px-3 py-2 border rounded-lg"
            value={activeView}
            onChange={(e) => setActiveView(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>

        <button
          onClick={() => {
            console.log(showRequestModal);
            setShowRequestModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Request Leave</span>
        </button>
      </div>

      {/* Leave Requests Table */}
      <LeaveRequestsTable
        handleViewDetails={handleViewDetails}
        setShowApprovalModal={setShowApprovalModal}
        setSelectedLeave={setSelectedLeave}
        setApprovalAction={setApprovalAction}
      />

      {/* Modals */}
      {showRequestModal && (
        <RequestLeaveModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={(data) => {
            console.log("Leave request submitted:", data);
            setShowRequestModal(false);
          }}
        />
      )}
      <ViewLeaveDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLeave(null);
        }}
        leaveRequest={selectedLeave}
      />
      <LeaveApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedLeave(null);
          setApprovalAction(null);
        }}
        leaveRequest={selectedLeave}
        onApprove={handleApproveLeave}
        onReject={handleRejectLeave}
        action={approvalAction}
      />
    </div>
  );
};

export default LeaveManagement;
