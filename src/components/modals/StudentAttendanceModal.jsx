import React, { useEffect, useState } from "react";
import { X, Calendar, Download, ChevronLeft, ChevronRight } from "lucide-react";

const StudentAttendanceModal = ({ isOpen, student, onClose }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    leaveDays: 0,
    totalDays: 0,
    attendancePercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState([]);

  // Fetch student attendance data when modal opens
  useEffect(() => {
    if (isOpen && student) {
      fetchStudentAttendance();
    }
  }, [isOpen, student, selectedMonth, selectedYear]);

  // Generate calendar days for the selected month
  useEffect(() => {
    if (isOpen) {
      generateCalendarDays();
    }
  }, [selectedMonth, selectedYear, attendanceData]);

  const fetchStudentAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Get first and last day of the selected month
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

      const startDate = firstDay.toISOString().split("T")[0];
      const endDate = lastDay.toISOString().split("T")[0];

      // Fetch attendance data
      const response = await fetch(
        `/backend/api/students/student/${student.id}?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

    

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return redirect("/");
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch attendance data");
      }

      setAttendanceData(data.data || []);

      // Set summary data if available
      if (data.statistics) {
        setAttendanceSummary({
          presentDays: data.statistics.presentDays || 0,
          absentDays: data.statistics.absentDays || 0,
          lateDays: data.statistics.lateDays || 0,
          leaveDays: data.statistics.leaveDays || 0,
          totalDays: data.statistics.totalDays || 0,
          attendancePercentage: data.statistics.attendancePercentage || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching student attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    // Get number of days in the month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();

    // Create array of day objects for the calendar
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isEmpty: true });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day)
        .toISOString()
        .split("T")[0];

      // Find attendance record for this day
      const dayRecord = attendanceData?.find((record) => {
        const recordDate = new Date(record.date).toISOString().split("T")[0];
        return recordDate === date;
      });

      days.push({
        day,
        date,
        isEmpty: false,
        attendance: dayRecord ? dayRecord.status : null,
        sessionType: dayRecord ? dayRecord.session_type : null,
        reason: dayRecord ? dayRecord.reason : null,
      });
    }

    setCalendarDays(days);
  };

  const handlePrevMonth = () => {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((year) => year - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((year) => year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Get month name
  const monthName = new Date(selectedYear, selectedMonth).toLocaleString(
    "default",
    { month: "long" }
  );

  // Get attendance status color
  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "on-leave":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="bg-black opacity-50 w-full h-full absolute"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            Attendance Record - {student.first_name} {student.last_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Attendance Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium mb-4">Attendance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceSummary.presentDays}
                    </div>
                    <div className="text-sm text-gray-600">Present</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {attendanceSummary.absentDays}
                    </div>
                    <div className="text-sm text-gray-600">Absent</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {attendanceSummary.lateDays}
                    </div>
                    <div className="text-sm text-gray-600">Late</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {attendanceSummary.leaveDays}
                    </div>
                    <div className="text-sm text-gray-600">On Leave</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {attendanceSummary.totalDays}
                    </div>
                    <div className="text-sm text-gray-600">Total Days</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Number(attendanceSummary.attendancePercentage).toFixed(
                        1
                      )}
                      %
                    </div>
                    <div className="text-sm text-gray-600">Attendance Rate</div>
                  </div>
                </div>
              </div>

              {/* Month Calendar */}
              <div className="bg-white rounded-lg border mb-6">
                <div className="flex items-center justify-between p-4 border-b">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-lg font-medium">
                    {monthName} {selectedYear}
                  </h3>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Calendar */}
                <div className="p-4">
                  {/* Day labels */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-medium text-gray-500 py-2"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((dayObj, index) => (
                      <div
                        key={index}
                        className={`p-1 aspect-square ${
                          dayObj.isEmpty ? "bg-gray-50" : "border rounded-lg"
                        }`}
                      >
                        {!dayObj.isEmpty && (
                          <div className="h-full flex flex-col">
                            <div className="text-right text-sm p-1">
                              {dayObj.day}
                            </div>
                            {dayObj.attendance ? (
                              <div
                                className={`mt-auto text-center text-xs p-1 rounded ${getStatusColor(
                                  dayObj.attendance
                                )}`}
                              >
                                {dayObj.attendance === "present"
                                  ? "P"
                                  : dayObj.attendance === "absent"
                                  ? "A"
                                  : dayObj.attendance === "late"
                                  ? "L"
                                  : dayObj.attendance === "on-leave"
                                  ? "OL"
                                  : ""}
                                {dayObj.sessionType && (
                                  <span className="text-[8px] block">
                                    {dayObj.sessionType === "morning"
                                      ? "AM"
                                      : dayObj.sessionType === "afternoon"
                                      ? "PM"
                                      : "Full"}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="mt-auto h-7"></div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Attendance Records */}
              <div className="bg-white rounded-lg border">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-medium">
                    Recent Attendance Records
                  </h3>
                  {/* <button className="flex items-center space-x-2 px-3 py-1 border rounded-lg text-gray-600 hover:bg-gray-50">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button> */}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                          Date
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                          Session
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                          Status
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                          Reason
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                          Recorded By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {attendanceData.length > 0 ? (
                        attendanceData.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-800">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {record.session_type === "morning"
                                ? "Morning"
                                : record.session_type === "afternoon"
                                ? "Afternoon"
                                : "Whole Day"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                  record.status
                                )}`}
                              >
                                {record.status.charAt(0).toUpperCase() +
                                  record.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {record.reason || "-"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {record.recorded_by_name || "System"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="py-6 text-center text-gray-500"
                          >
                            No attendance records found for this month.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceModal;
