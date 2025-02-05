import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Check, AlertCircle } from "lucide-react";
import AnimatedModal from "./animateModal";

const AttendanceEntryModal = ({ isOpen, onClose, onSave }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [errors, setErrors] = useState({});

  // Sample students - in real app, fetch based on selected class
  const students = [
    { id: 1, name: "John Doe", admissionNo: "KPS2024001" },
    { id: 2, name: "Jane Smith", admissionNo: "KPS2024002" },
    { id: 3, name: "Mike Johnson", admissionNo: "KPS2024003" },
  ];

  const handleAttendanceChange = (studentId, status, reason = "") => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { status, reason },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedDate) {
      setErrors({ form: "Please fill in all required fields" });
      return;
    }

    onSave({
      class: selectedClass,
      date: selectedDate,
      attendance,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose}>
      
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class*
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select Class</option>
                      <option value="Form 1">Form 1</option>
                      <option value="Form 2">Form 2</option>
                      <option value="Form 3">Form 3</option>
                      <option value="Form 4">Form 4</option>
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
                    />
                  </div>
                </div>

                {/* Attendance Table */}
                <div className="mt-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
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
                    <tbody className="divide-y divide-gray-200">
                      {students.map((student) => (
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
                              value={
                                attendance[student.id]?.status || "present"
                              }
                              onChange={(e) =>
                                handleAttendanceChange(
                                  student.id,
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border rounded-lg"
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
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t ">
                {errors.form && (
                  <p className="text-sm text-red-600">{errors.form}</p>
                )}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Save Attendance
                  </button>
                </div>
              </div>
            </form>
          </div>
       
    </AnimatedModal>
  );
};

export default AttendanceEntryModal;
