import React, { useState, useEffect } from "react";
import { Edit, ChevronLeft, ChevronRight } from "lucide-react";

const AttendanceTab = ({
  attendanceFilterOptions,
  handleAttendanceFilterChange,
  applyAttendanceFilters,
  attendanceSummary,
  attendanceData
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [paginatedData, setPaginatedData] = useState([]);
  
  // Calculate pagination whenever attendanceData or pagination settings change
  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    setPaginatedData(attendanceData.slice(indexOfFirstRecord, indexOfLastRecord));
  }, [attendanceData, currentPage, recordsPerPage]);
  
  // Total pages
  const totalPages = Math.ceil(attendanceData.length / recordsPerPage);
  
  // Pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Attendance Filters */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium mb-4">Attendance Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              name="class"
              value={attendanceFilterOptions.class}
              onChange={handleAttendanceFilterChange}
              className="w-full border rounded-lg p-2"
            >
              <option value="">All Classes</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              {/* Add more class options */}
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={attendanceFilterOptions.status}
              onChange={handleAttendanceFilterChange}
              className="w-full border rounded-lg p-2"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
          
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              name="dateRange"
              value={attendanceFilterOptions.dateRange}
              onChange={handleAttendanceFilterChange}
              className="w-full border rounded-lg p-2"
            >
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Show custom date inputs if custom range is selected */}
          {attendanceFilterOptions.dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={attendanceFilterOptions.startDate}
                  onChange={handleAttendanceFilterChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={attendanceFilterOptions.endDate}
                  onChange={handleAttendanceFilterChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </>
          )}
          
        
        </div>
      </div>
      
      {/* Attendance Statistics */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-medium mb-4">Attendance Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Present */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">Present</h4>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">P</span>
              </div>
            </div>
            <div className="text-2xl font-bold">
              {attendanceSummary.presentCount || 0}
            </div>
            <p className="text-xs text-gray-500">
              {attendanceSummary.presentPercentage.toFixed(1)}% of total
            </p>
          </div>
          
          {/* Absent */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">Absent</h4>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-sm font-medium text-red-600">A</span>
              </div>
            </div>
            <div className="text-2xl font-bold">
              {attendanceSummary.absentCount || 0}
            </div>
            <p className="text-xs text-gray-500">
              {attendanceSummary.absentPercentage.toFixed(1)}% of total
            </p>
          </div>
          
          {/* Late */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">Late</h4>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-sm font-medium text-yellow-600">L</span>
              </div>
            </div>
            <div className="text-2xl font-bold">
              {attendanceSummary.lateCount || 0}
            </div>
            <p className="text-xs text-gray-500">
              {attendanceSummary.latePercentage.toFixed(1)}% of total
            </p>
          </div>
          
          {/* On Leave */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-600">On Leave</h4>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">L</span>
              </div>
            </div>
            <div className="text-2xl font-bold">
              {attendanceSummary.leaveCount || 0}
            </div>
            <p className="text-xs text-gray-500">
              {attendanceSummary.leavePercentage.toFixed(1)}% of total
            </p>
          </div>
        </div>
      </div>
      
      {/* Attendance Records Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                Student Name
              </th>
              <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                Admission No.
              </th>
              <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                Class
              </th>
              <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                Date
              </th>
              <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                Session
              </th>
              <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                Reason
              </th>
              {/* <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedData.length > 0 ? (
              paginatedData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {record.first_name?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {record.first_name + " " + record.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {record.admission_number}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {record.class_level} {record.stream}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {record.session_type}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      record.status === 'present' ? 'bg-green-100 text-green-700' :
                      record.status === 'absent' ? 'bg-red-100 text-red-700' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {record.reason || '-'}
                  </td>
                  {/* <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          // Handle edit attendance record
                          console.log("Edit attendance record:", record.id);
                        }}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-6 text-center text-gray-500">
                  No attendance records found. Adjust filters or add new records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {attendanceData.length > 0 && (
        <div className="px-4 py-5 flex flex-col sm:flex-row justify-between items-center border-t">
          <div className="flex items-center space-x-2 mb-3 sm:mb-0">
            <label className="text-sm text-gray-600">Records per page:</label>
            <select
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing {paginatedData.length} of {attendanceData.length} records
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-1 rounded-md ${
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex space-x-1">
              {/* Show pagination numbers */}
              {[...Array(totalPages)].map((_, index) => {
                // Show limited page buttons with ellipsis for better UX
                const page = index + 1;
                
                // Always show first, last, current, and pages around current
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                
                // Show ellipsis (but only once on each side)
                if (
                  (page === 2 && currentPage > 3) || 
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <span key={page} className="px-2 py-1 text-gray-500">...</span>;
                }
                
                return null;
              })}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-1 rounded-md ${
                currentPage === totalPages 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;