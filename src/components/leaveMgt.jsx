import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Users,
  Calendar as CalendarIcon,
  Briefcase
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentTeacherId, setCurrentTeacherId] = useState(userInfo?.teacher?.teacher_id);
  const [isAdmin, setIsAdmin] = useState(false);
  const [leavesEndingToday, setLeavesEndingToday] = useState([]);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [leaveStats, setLeaveStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    balance: 0,
    leavesEndingToday: 0,
    teachersOnLeave: 0,
    leaveUtilization: 0,
    totalLeaveRequests: 0
  });
  const [leaveBalances, setLeaveBalances] = useState([]);

  useEffect(() => {
    const fetchLeaveStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // If we're using a stats endpoint
        const response = await axios.get('/backend/api/dashboard/leavestats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setLeaveStats(prevStats => ({
            ...prevStats,
            ...response.data.data
          }));
        } else {
          // If the stats endpoint doesn't exist or doesn't return what we need,
          // we'll handle it in fetchComprehensiveStats
          await fetchComprehensiveStats();
        }
      } catch (err) {
        // If the endpoint doesn't exist, fetch stats another way
        console.log('Fetching comprehensive stats instead');
        await fetchComprehensiveStats();
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveStats();
  }, []);
 
  // Check for admin rights and fetch leaves ending today
  useEffect(() => { 
    if (userInfo.teacher) {
      setCurrentTeacherId(userInfo.teacher.teacherId);
    } else {
      setCurrentTeacherId(null);
    }
    
    // Check if user is an admin
    const adminRights = userInfo.role === 'admin';
    setIsAdmin(adminRights);
    
    // If admin, fetch leaves ending today for status updates
    if (adminRights) {
      fetchLeavesEndingToday();
    }
    
    console.log('Current user info:', userInfo);
  }, []);

  // Comprehensive stats calculation
  const fetchComprehensiveStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get all leave requests with different statuses
      const allLeavesResponse = await axios.get("/backend/api/leaves", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: { 
          limit: 1000 // Fetch a high number to get all records
        }
      });
      
      const leaves = allLeavesResponse.data.results || [];
      
      // Count different stats
      const pending = leaves.filter(leave => leave.status === 'pending').length;
      const approved = leaves.filter(leave => leave.status === 'approved').length;
      const rejected = leaves.filter(leave => leave.status === 'rejected').length;
      
      // Get teachers currently on leave
      const today = new Date().toISOString().split('T')[0];
      const teachersOnLeave = leaves.filter(leave => 
        leave.status === 'approved' && 
        new Date(leave.start_date) <= new Date(today) && 
        new Date(leave.end_date) >= new Date(today)
      ).length;
      
      // Get leaves ending today
      const leavesEndingToday = leaves.filter(leave => 
        leave.status === 'approved' && 
        leave.end_date === today
      ).length;
      
      // If user is a teacher, fetch their leave balances
      let balance = 0;
      if (currentTeacherId) {
        try {
          const balanceResponse = await axios.get(`/backend/api/leaves/balances/${currentTeacherId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          });
          
          const balances = balanceResponse.data || [];
          setLeaveBalances(balances);
          
          // Find annual leave balance
          const annualLeave = balances.find(b => b.leave_type_name === 'Annual Leave');
          if (annualLeave) {
            balance = annualLeave.remaining_days;
          }
          
          // Calculate leave utilization (used days ÷ total days × 100)
          let totalDays = 0;
          let usedDays = 0;
          
          balances.forEach(b => {
            totalDays += parseInt(b.total_days);
            usedDays += parseInt(b.used_days);
          });
          
          const leaveUtilization = totalDays > 0 ? Math.round((usedDays / totalDays) * 100) : 0;
          
          // Update stats with the calculated values
          setLeaveStats({
            pending,
            approved, 
            rejected,
            balance,
            teachersOnLeave,
            leavesEndingToday,
            leaveUtilization,
            totalLeaveRequests: leaves.length
          });
        } catch (err) {
          console.error("Error fetching leave balances:", err);
          
          // Still update the other stats
          setLeaveStats(prev => ({
            ...prev,
            pending,
            approved,
            rejected,
            teachersOnLeave,
            leavesEndingToday,
            totalLeaveRequests: leaves.length
          }));
        }
      } else {
        // For admin users without teacher ID
        setLeaveStats({
          pending,
          approved,
          rejected,
          balance: 0,
          teachersOnLeave,
          leavesEndingToday,
          leaveUtilization: 0,
          totalLeaveRequests: leaves.length
        });
      }
      
    } catch (err) {
      console.error("Error fetching comprehensive stats:", err);
      setError("Failed to load leave statistics");
    }
  };

  // Fetch leaves that are ending today (for admin status updates)
  const fetchLeavesEndingToday = async () => {
    try {
      const response = await axios.get("/backend/api/leaves/ending-today", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      
      if (response.data.success) {
        setLeavesEndingToday(response.data.results || []);
        setLeaveStats(prev => ({
          ...prev,
          leavesEndingToday: response.data.results.length
        }));
      }
    } catch (err) {
      console.error("Error fetching leaves ending today:", err);
    }
  };

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
         
        const response = await axios.get("/backend/api/leaves", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: params,
        });
        setLeaveRequests(response.data.results);
        
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
      // This can re-use the comprehensive stats function to ensure all stats are up to date
      await fetchComprehensiveStats();
      
    } catch (err) {
      console.error("Error fetching leave stats:", err);
    }
  };

  // Handle updating teacher statuses for leaves that ended
  const handleUpdateTeacherStatuses = async () => {
    if (!isAdmin) return;

    setStatusUpdateLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post(
        "/backend/api/leaves/check-status-updates",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage("Teacher statuses updated successfully");
        fetchLeavesEndingToday(); // Refresh the list of leaves ending today
        fetchLeaveStats(); // Refresh stats
      } else {
        setError(response.data.message || "Failed to update teacher statuses");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred updating teacher statuses");
      console.error("Error updating teacher statuses:", err);
    } finally {
      setStatusUpdateLoading(false);
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

      // Show success message 
      setSuccessMessage("Leave request approved successfully. Teacher status will be updated to 'on_leave'.");

      // Refresh stats
      fetchLeaveStats();

      // Close modal
      setShowApprovalModal(false);
      setSelectedLeave(null);
      setApprovalAction(null);
      
      // After a short delay, clear success message
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
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
      setSuccessMessage("Leave request submitted successfully.");
      
      // After a short delay, clear success message
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      setError(error.response?.data?.message || error.message);
    }
  };

  // Create more meaningful stats data
  const statsData = [
    {
      title: "Pending Requests",
      count: leaveStats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Leave requests awaiting approval"
    },
    {
      title: "Approved Leaves",
      count: leaveStats.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Total leaves approved"
    },
    {
      title: isAdmin ? "Teachers on Leave" : "Leave Balance",
      count: isAdmin ? leaveStats.teachersOnLeave : leaveStats.balance,
      icon: isAdmin ? Users : Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: isAdmin ? "Currently on leave" : "Available leave days"
    },
    {
      title: isAdmin ? "Leaves Ending Today" : "Leave Utilization",
      count: isAdmin ? leaveStats.leavesEndingToday : `${leaveStats.leaveUtilization}%`,
      icon: isAdmin ? CalendarIcon : Briefcase,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: isAdmin ? "Returns expected today" : "Of total leave used"
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

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
          <button className="float-right" onClick={() => setSuccessMessage(null)}>
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
            <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Admin-only section: Leaves ending today */}
      {isAdmin && leavesEndingToday.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">
              Leaves Ending Today ({leavesEndingToday.length})
            </h3>
            <button 
              onClick={handleUpdateTeacherStatuses}
              disabled={statusUpdateLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {statusUpdateLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Update Teacher Statuses</span>
                </>
              )}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leavesEndingToday.map(leave => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{leave.teacher_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{leave.leave_type_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(leave.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Ending Today
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teacher-only section: Leave balances breakdown */}
      {!isAdmin && leaveBalances.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-medium text-gray-800 mb-4">
            Your Leave Balances
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Used
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Remaining
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveBalances.map(balance => (
                  <tr key={balance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {balance.leave_type_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {balance.total_days} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {balance.used_days} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-green-600">
                      {balance.remaining_days} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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