import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Check, AlertCircle, Loader } from "lucide-react";
import axios from "axios";

const AttendanceEntryModal = ({ isOpen, onClose }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [errors, setErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [academicSessionId, setAcademicSessionId] = useState(1); // Default to 1, can be fetched from API

  // Fetch available classes when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      fetchClasses();
      fetchCurrentSession();
      // Set today's date as default
      setSelectedDate(new Date().toISOString().split("T")[0]);
    } else {
      // Reset form when closing
      setSelectedClass("");
      setSelectedStream("");
      setAttendance({});
      setErrors({});
      setStudents([]);
      setFilteredStudents([]);
    }
  }, [isOpen]);

  // Fetch current academic session
  const fetchCurrentSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "/backend/api/sessions/academic-sessions/current",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success && response.data.data) {
        setAcademicSessionId(response.data.data.id);
      }
    } catch (error) {
      console.error("Error fetching current session:", error);
    }
  };

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/backend/api/classes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Group classes by name and collect streams
      const classData = response.data.data.reduce((acc, cls) => {
        if (!acc[cls.name]) {
          acc[cls.name] = {
            id: cls.id,
            name: cls.name,
            streams: [cls.stream]
          };
        } else if (!acc[cls.name].streams.includes(cls.stream)) {
          acc[cls.name].streams.push(cls.stream);
        }
        return acc;
      }, {});
         console.log(classData)
      setClasses(Object.values(classData));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setErrors({ api: "Failed to load classes" });
      setLoading(false);
    }
  };

  // Fetch students when class and stream are selected
  useEffect(() => {
    console.log(selectedClass, selectedStream)
    if (selectedClass && selectedStream) {
      fetchStudents();
    }
  }, [selectedClass, selectedStream]);

  // Fetch students from API based on class and stream
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/backend/api/students/by-class?classId=${selectedClass}&stream=${selectedStream}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    
      const studentData = response.data.data.map(student => ({
        id: student.id,
        name: student.name,
        admissionNo: student.admissionNo
      }));
      
      setStudents(studentData);
      setFilteredStudents(studentData);
      console.log(studentData)
      // Initialize attendance for all students
      const initialAttendance = {};
      studentData.forEach(student => {
        initialAttendance[student.id] = { status: "present", reason: "" };
      });
      setAttendance(initialAttendance);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setErrors({ api: "Failed to load students" });
      setLoading(false);
    }
  };

  // Check for existing attendance records
  useEffect(() => {
    if (selectedClass && selectedStream && selectedDate && students.length > 0) {
      checkExistingAttendance();
    }
  }, [selectedClass, selectedStream, selectedDate, students]);

  // Check if attendance already exists for the selected date
  const checkExistingAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/backend/api/attendance/class/${selectedClass}?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success && response.data.data.length > 0) {
        // If attendance exists, populate the form
        const existingAttendance = {};
        response.data.data.forEach(record => {
          existingAttendance[record.student_id] = {
            status: record.status,
            reason: record.reason || ""
          };
        });
        setAttendance(existingAttendance);
      }
    } catch (error) {
      console.error("Error checking existing attendance:", error);
    }
  };

  const handleAttendanceChange = (studentId, status, reason = "") => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { status, reason },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedStream || !selectedDate) {
      setErrors({ form: "Please fill in all required fields" });
      return;
    }

    if (filteredStudents.length === 0) {
      setErrors({ form: "No students to mark attendance for" });
      return;
    }

    try {
      setSaving(true);
      
      // Format attendance data for API
      const attendanceRecords = Object.entries(attendance).map(([studentId, data]) => ({
        student_id: parseInt(studentId),
        class_id: parseInt(selectedClass),
        academic_session_id: academicSessionId,
        date: selectedDate,
        session_type: "morning", // Could make this selectable in the form
        status: data.status,
        reason: data.reason,
        parent_notified: false
      }));
      
      // Save attendance
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/backend/api/attendance/bulk",
        { attendanceRecords },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data.success) {
        // Show success message or toast notification
        alert("Attendance saved successfully!");
        setSaving(false);
        onClose();
      } else {
        throw new Error(response.data.error || "Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      setErrors({ form: error.message || "Failed to save attendance" });
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isAnimating ? "opacity-50" : "opacity-0"
          }`}
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg w-full max-w-4xl">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-medium">Mark Attendance</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class*
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={loading || saving}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stream*
                  </label>
                  <select
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={!selectedClass || loading || saving}
                  >
                    <option value="">Select Stream</option>
                    {selectedClass && 
                      classes.find(c => c.id.toString() === selectedClass)?.streams.map(stream => (
                        <option key={stream} value={stream}>
                          {stream}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={loading || saving}
                  />
                </div>
              </div>

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              )}

              {/* Error display */}
              {errors.api && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{errors.api}</span>
                </div>
              )}

              {/* Attendance Table */}
              {!loading && filteredStudents.length > 0 && (
                <div className="mt-6 overflow-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Reason (if absent)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.admissionNo}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={attendance[student.id]?.status || "present"}
                              onChange={(e) =>
                                handleAttendanceChange(student.id, e.target.value)
                              }
                              className="px-3 py-2 border rounded-lg"
                              disabled={saving}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(attendance[student.id]?.status === "absent" ||
                              attendance[student.id]?.status === "late") && (
                              <input
                                type="text"
                                value={attendance[student.id]?.reason || ""}
                                onChange={(e) =>
                                  handleAttendanceChange(
                                    student.id,
                                    attendance[student.id]?.status,
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Enter reason"
                                disabled={saving}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* No students message */}
              {!loading && selectedClass && selectedStream && filteredStudents.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No students found for the selected class and stream
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              {errors.form && (
                <p className="text-sm text-red-600 mb-2">{errors.form}</p>
              )}
              <div className="flex space-x-4 justify-between items-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
                  disabled={loading || saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
                  disabled={loading || saving}
                >
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AttendanceEntryModal;