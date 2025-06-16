import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  X,
  Users,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { checkTokenAuth } from "../util/helperFunctions";

const WorkloadSchedule = ({ teachers, updateTeachers }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [formData, setFormData] = useState({
    class_id: "",
    subject_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    room_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [stats, setStats] = useState({
    teacherLoad: { avgHoursPerWeek: 0 },
    classes: { total: 0 },
    subjects: { total: 0 },
    utilization: { percentage: 0 },
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    const adminRights = userInfo.role === "admin";
    setIsAdmin(adminRights);
    async function validate() {
      const { valid } = await checkTokenAuth();
      if (!valid) navigate("/");
    }
    validate();
  }, []);

  const fetchTeachers = async () => {
    try {
      const apiUrl = `/backend/api/teachers`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // Parse the response data
      const data = await response.json();
      updateTeachers(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchAcademicStats = async () => {
      try {
        setLoading(true);

        // Get token from localStorage or your auth context
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "/backend/api/dashboard/workschedule",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch stats");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching stats"
        );
        console.error("Academic stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicStats();
  }, []);

  // Convert day name to day number
  const dayToNumber = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  // Get time slots for dropdown
  const timeSlots = [
    { label: "8:00 AM - 9:00 AM", start: "08:00", end: "09:00" },
    { label: "9:00 AM - 10:00 AM", start: "09:00", end: "10:00" },
    // { label: "10:00 AM - 11:00 AM", start: "10:00", end: "11:00" },
    { label: "11:00 AM - 12:00 PM", start: "11:00", end: "12:00" },
    { label: "12:00 PM - 1:00 PM", start: "12:00", end: "13:00" },
    { label: "2:00 PM - 3:00 PM", start: "14:00", end: "15:00" },
    { label: "3:00 PM - 4:00 PM", start: "15:00", end: "16:00" },
  ];
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch rooms when component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/backend/api/rooms", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch rooms");
        const data = await response.json();
        setRooms(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRooms();
  }, []);

  // Fetch classes and current academic session when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current academic session
        const sessionResponse = await fetch(
          "/backend/api/academic/current",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!sessionResponse.ok)
          throw new Error("Failed to fetch current academic session");
        const sessionData = await sessionResponse.json();
        setCurrentSession(sessionData);

        // Get classes for current session
        const classesResponse = await fetch(
          `/backend/api/classes/classes-academic-session?academic_session_id=${sessionData.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!classesResponse.ok) throw new Error("Failed to fetch classes");
        const classesData = await classesResponse.json();

        setClasses(classesData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  // Fetch subjects when a teacher is selected
  useEffect(() => {
    if (selectedTeacher && selectedTeacher.subjects) {
      const fetchSubjects = async () => {
        try {
          // Use the teacher_id to get subjects based on their specialization in the database
          const response = await fetch(
            `/backend/api/subjects/subjects?teacher_id=${selectedTeacher.id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch subjects");
          const data = await response.json();
          setSubjects(data.data);
        } catch (err) {
          setError(err.message);
        }
      };

      fetchSubjects();
    }
  }, [selectedTeacher]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear conflicts when form inputs change
    setConflicts([]);
  };
  // Handle time slot selection
  const handleTimeSlotChange = (e) => {
    const selectedSlot = timeSlots.find(
      (slot) => `${slot.start}-${slot.end}` === e.target.value
    );

    if (selectedSlot) {
      setFormData({
        ...formData,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
      });
    }
  };

  // Check for conflicts
  const checkConflicts = async () => {
    if (
      !formData.class_id ||
      !formData.day_of_week ||
      !formData.start_time ||
      !formData.end_time
    ) {
      return false;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "/backend/api/timetable/check-conflicts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacher_id: selectedTeacher.id,
            class_id: formData.class_id,
            day_of_week: dayToNumber[formData.day_of_week],
            start_time: formData.start_time,
            end_time: formData.end_time,
            room_number: formData.room_number,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setConflicts(data.conflicts || []);
        return false;
      }

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle assignment submission
  const handleAssign = async () => {
    // Validate form
    if (
      !formData.class_id ||
      !formData.subject_id ||
      !formData.day_of_week ||
      !formData.start_time ||
      !formData.end_time
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Check for conflicts first
    const noConflicts = await checkConflicts();
    if (!noConflicts) {
      return;
    }

    try {
      setLoading(true);

      // First, assign the teacher to the subject and class
      const teacherSubjectResponse = await fetch(
        "/backend/api/subjects/teacher-subjects",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacher_id: selectedTeacher.id,
            subject_id: formData.subject_id,
            class_id: formData.class_id,
            academic_session_id: currentSession.id,
          }),
        }
      );
      console.log(teacherSubjectResponse);

      if (!teacherSubjectResponse.ok) {
        throw new Error("Failed to assign teacher to subject");
      }

      // Then, create the timetable entry
      const timetableResponse = await fetch(
        "/backend/api/timetable/entry",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            class_id: formData.class_id,
            subject_id: formData.subject_id,
            teacher_id: selectedTeacher.id,
            day_of_week: dayToNumber[formData.day_of_week],
            start_time: formData.start_time,
            end_time: formData.end_time,
            room_number: formData.room_number,
            academic_session_id: currentSession.id,
          }),
        }
      );

      if (!timetableResponse.ok) {
        throw new Error("Failed to create timetable entry");
      }

      // Close modal and reset form
      setShowAssignModal(false);
      setFormData({
        class_id: "",
        subject_id: "",
        day_of_week: "",
        start_time: "",
        end_time: "",
        room_number: "",
      });

      // Refresh teacher data - this would typically be handled by your app's state management
      fetchTeachers();
      // For this example, we'll just show a success message
      alert("Class successfully assigned to teacher");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Average Load</h3>
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">
            {stats.teacherLoad.avgHoursPerWeek} hrs/week
          </div>
          <p className="text-xs text-gray-600">Per teacher</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Classes</h3>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{stats.classes.total}</div>
          <p className="text-xs text-gray-600">Active classes</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Subjects</h3>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">{stats.subjects.total}</div>
          <p className="text-xs text-gray-600">Teaching subjects</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Utilization</h3>
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">
            {stats.utilization.percentage}%
          </div>
          <p className="text-xs text-green-600">
            {stats.utilization.percentage >= 80
              ? "Optimal load"
              : "Below optimal"}
          </p>
        </div>
      </div>
      {/* Workload Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Load
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                {isAdmin ? (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                ) : (
                  <></>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">
                          {teacher.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {teacher.department}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            teacher.currentLoad / teacher.maxLoad > 0.9
                              ? "bg-red-500"
                              : teacher.currentLoad / teacher.maxLoad > 0.7
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${
                              (teacher.currentLoad / teacher.maxLoad) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Number.parseInt(teacher.currentLoad)}/{teacher.maxLoad}{" "}
                        hrs
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="text-blue-600 cursor-pointer hover:text-blue-800 text-sm font-medium"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setShowScheduleModal(true);
                      }}
                    >
                      View Schedule
                    </button>
                  </td>
                  {isAdmin ? (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setShowAssignModal(true);
                        }}
                        className="flex items-center cursor-pointer space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200  transform hover:scale-105 transition-transform duration-200 ease-in-out"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Assign</span>
                      </button>
                    </td>
                  ) : (
                    <></>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showScheduleModal && selectedTeacher && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="bg-black opacity-50 w-full h-full absolute z-40"></div>{" "}
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto z-50">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedTeacher.name}'s Schedule
                  </h2>
                  <p className="text-sm text-gray-600">
                    Current Load: {Number.parseInt(selectedTeacher.currentLoad)}
                    /{selectedTeacher.maxLoad} hours
                  </p>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Schedule Grid */}
              <div className="grid grid-cols-5 gap-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                  (day) => {
                    // Ensure `schedule` is always an array to prevent errors
                    const schedule = selectedTeacher?.schedule ?? [];

                    // Find the day's schedule or default to an empty object
                    const daySchedule = schedule.find((s) => s.day === day) || {
                      classes: [],
                    };

                    return (
                      <div key={day} className="space-y-3">
                        <div className="text-sm font-medium text-gray-900 bg-gray-100 p-2 rounded-t-lg">
                          {day}
                        </div>

                        {daySchedule.classes.length > 0 ? (
                          daySchedule.classes.map((cls, index) => (
                            <div
                              key={index}
                              className="bg-blue-50 border border-blue-100 p-2 rounded-lg text-sm"
                            >
                              <div className="font-medium text-blue-700">
                                {cls.class || "No Class"} -{" "}
                                {cls.subject || "No Subject"}
                              </div>
                              <div className="text-xs text-gray-600">
                                {cls.start_time || "--:--"} -{" "}
                                {cls.end_time || "--:--"} | Room:{" "}
                                {cls.room || "Not Assigned"}
                              </div>
                            </div>
                          ))
                        ) : (
                          // Show this when no classes exist for the day
                          <div className="text-sm text-gray-400 italic p-2">
                            No scheduled classes
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* Load Indicator */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Workload Utilization</span>
                    <span>
                      {Math.round(
                        (selectedTeacher.currentLoad /
                          selectedTeacher.maxLoad) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        selectedTeacher.currentLoad / selectedTeacher.maxLoad >
                        0.9
                          ? "bg-red-500"
                          : selectedTeacher.currentLoad /
                              selectedTeacher.maxLoad >
                            0.7
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${
                          (selectedTeacher.currentLoad /
                            selectedTeacher.maxLoad) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Class Modal - UPDATED */}
      {showAssignModal && selectedTeacher && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="bg-black opacity-50 w-full h-full absolute z-40"></div>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-bold">Assign Classes</h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setFormData({
                      class_id: "",
                      subject_id: "",
                      day_of_week: "",
                      start_time: "",
                      end_time: "",
                      room_number: "",
                    });
                    setError(null);
                    setConflicts([]);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {conflicts.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Scheduling conflicts detected:</p>
                  <ul className="list-disc pl-5 mt-2 text-sm">
                    {conflicts.map((conflict, index) => (
                      <li key={index}>{conflict.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.level} {cls.stream} - {cls.curriculum_type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects?.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      name="day_of_week"
                      value={formData.day_of_week}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select day</option>
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={`${formData.start_time}-${formData.end_time}`}
                      onChange={handleTimeSlotChange}
                      required
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((slot, index) => (
                        <option key={index} value={`${slot.start}-${slot.end}`}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      conflicts.some((c) => c.type === "room_conflict")
                        ? "border-red-500"
                        : ""
                    }`}
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.room_number}>
                        {room.room_number} - {room.name}
                      </option>
                    ))}
                  </select>
                  {conflicts.some((c) => c.type === "room_conflict") && (
                    <p className="mt-1 text-sm text-red-600">
                      {
                        conflicts.find((c) => c.type === "room_conflict")
                          .message
                      }
                    </p>
                  )}
                </div>
                {/* Current Schedule */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Current Schedule
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 max-h-64 overflow-y-auto">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                    ].map((day) => (
                      <div key={day} className="space-y-3">
                        <div className="text-sm font-medium text-gray-900 bg-gray-100 p-2 rounded-t-lg">
                          {day}
                        </div>
                        {selectedTeacher.schedule
                          ?.find((s) => s.day === day)
                          ?.classes.map((cls, index) => (
                            <div
                              key={index}
                              className="bg-blue-50 border border-blue-100 p-2 rounded-lg text-sm"
                            >
                              <div className="font-medium text-blue-700">
                                {cls.class_name || cls.class} -{" "}
                                {cls.subject_name || cls.subject}
                              </div>
                              <div className="text-xs text-gray-600">
                                {cls.start_time} - {cls.end_time} | Room:{" "}
                                {cls.room || "Not Assigned"}
                              </div>
                            </div>
                          )) || (
                          <div className="text-sm text-gray-400 italic p-2">
                            No classes
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border rounded-lg"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Assign Class"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkloadSchedule;
