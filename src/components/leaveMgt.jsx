import React, { useState, useEffect } from "react";
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
import axios from "axios";

const LeaveManagement = () => {
  // Get token from localStorage
  const token = localStorage.getItem("token");
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeView, setActiveView] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTeacherId, setCurrentTeacherId] = useState(userInfo.teacher.teacher_id);
  const [isAdmin, setIsAdmin] = useState(false);
  const [leaveStats, setLeaveStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    const fetchLeaveStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get('/backend/api/dashboard/leavestats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
          console.log(response.data)
        if (response.data.success) {
          setLeaveStats(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch leave stats');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching stats');
        console.error('Leave stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveStats();
  }, []);
 

  useEffect(() => { 
    if (userInfo.teacher) {
      setCurrentTeacherId(userInfo.teacher.teacherId);
    } else {
      setCurrentTeacherId(null);
    }
    
    // Check if user is an admin
    setIsAdmin(userInfo.role === 'admin');
    
    console.log('Current user info:', userInfo);
  }, []);

  // Fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      try {
        const params = activeView !== "all" ? { status: activeView } : {};
        // If not admin, only fetch current teacher's leaves
        if (!isAdmin && currentTeacherId) {
          params.teacher_id = currentTeacherId;
        }
         console.log()
        const response = await axios.get("/backend/api/leaves", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: params,
        });
        setLeaveRequests(response.data.results);
         console.log(response.data.results)
        // Also fetch stats
        fetchLeaveStats();
      } catch (err) {
        setError(err.message);
        console.error("Error fetching leave requests:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentTeacherId || isAdmin) {
      fetchLeaveRequests();
    }
  }, [activeView, currentTeacherId, isAdmin]);

  // Fetch leave stats
  const fetchLeaveStats = async () => {
    try {
      const statsResponse = await axios.get("/backend/api/leaves/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { teacher_id: !isAdmin ? currentTeacherId : undefined },
      });


      const balanceResponse =
        !isAdmin && currentTeacherId
          ? await axios.get(`/backend/api/leaves/balances/${currentTeacherId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })
          : { data: [] };

      // Calculate total remaining balance (annual leave)
      console.log(balanceResponse)
      const annualLeaveBalance = balanceResponse.data.find(
        (b) => b.leave_type_name === "Annual Leave"
      );
             console.log(annualLeaveBalance)
      setLeaveStats({
        pending: statsResponse.data.pending || 0,
        approved: statsResponse.data.approved || 0,
        rejected: statsResponse.data.rejected || 0,
        balance: annualLeaveBalance ? annualLeaveBalance.remaining_days : 0,
      });
    } catch (err) {
      console.error("Error fetching leave stats:", err);
    }
  };

  // To open the modal
  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setShowDetailsModal(true);
  };

  const handleApproveLeave = async (data) => {
    try {
      const response = await axios.patch(
        `/backend/api/leaves/${data.id}/status`,
        {
          status: "approved",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Update the leave request in the list
      setLeaveRequests(
        leaveRequests.map((leave) =>
          leave.id === data.id ? response.data : leave
        )
      );

      // Refresh stats
      fetchLeaveStats();

      // Close modal
      setShowApprovalModal(false);
      setSelectedLeave(null);
      setApprovalAction(null);
    } catch (error) {
      console.error("Error approving leave:", error);
      setError(error.response?.data?.message || error.message);
    }
  };

  const handleRejectLeave = async (data) => {
    try {
      if (!data.rejection_reason) {
        return setError("Rejection reason is required");
      }

      const response = await axios.patch(
        `/backend/api/leaves/${data.id}/status`,
        {
          status: "rejected",
          rejection_reason: data.rejection_reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Update the leave request in the list
      setLeaveRequests(
        leaveRequests.map((leave) =>
          leave.id === data.id ? response.data : leave
        )
      );

      // Refresh stats
      fetchLeaveStats();

      // Close modal
      setShowApprovalModal(false);
      setSelectedLeave(null);
      setApprovalAction(null);
    } catch (error) {
      console.error("Error rejecting leave:", error);
      setError(error.response?.data?.message || error.message);
    }
  };

  // Handle new leave request submission
  const handleLeaveSubmission = async (formData) => {
    console.log(currentTeacherId)
    try {
      await axios.post(
        "/backend/api/leaves", 
        {
          ...formData,
          teacher_id: userInfo.teacher.teacher_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Refresh leave requests and stats
      setActiveView("pending");
      fetchLeaveStats();
      setShowRequestModal(false);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      setError(error.response?.data?.message || error.message);
    }
  };

  // Stats data calculation from state
  const statsData = [
    {
      title: "Pending Requests",
      count: leaveStats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved Leaves",
      count: leaveStats.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected Leaves",
      count: leaveStats.rejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    }
  ];

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button className="float-right" onClick={() => setError(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
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
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          <span>Request Leave</span>
        </button>
      </div>

      {/* Leave Requests Table */}
      <LeaveRequestsTable
        requests={leaveRequests}
        loading={loading}
        handleViewDetails={handleViewDetails}
        setShowApprovalModal={setShowApprovalModal}
        setSelectedLeave={setSelectedLeave}
        setApprovalAction={setApprovalAction}
        isAdmin={isAdmin}
      />

      {/* Modals */}
      {showRequestModal && (
        <RequestLeaveModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleLeaveSubmission} 
          teacherId={currentTeacherId}
        />
      )}

      <ViewLeaveDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLeave(null);
        }}
        leaveRequest={selectedLeave}
        isAdmin={isAdmin}
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
