import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Settings,
  Plus,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import WeeklySchedule from "../components/weeklySchedule";
import ClassAllocation from "../components/classAllocation";
import ExamSchedule from "../components/examSchedule";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import AddScheduleModal from "../components/modals/addSchedule";
import { redirect, useLoaderData, useNavigate } from "react-router-dom";

const TimetableManagement = () => {
  const token = localStorage.getItem("token");
  const { activeModule, updateActiveModule } = useStore();
  const { timetableData, error } = useLoaderData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [teachers, setTeachers] = useState();
  const [showAddModal, setShowAddModal] = useState(false);
  const [session, setCurrentSession] = useState();
  const [classes, setClasses] = useState();
  const [rooms, setRooms] = useState();

  // Added state for schedule errors and success messages
  const [scheduleError, setScheduleError] = useState(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTimetableData, setCurrentTimetableData] =
    useState(timetableData);

  useEffect(() => {
    updateActiveModule("timetable");
  }, [updateActiveModule]);

  // Update currentTimetableData when timetableData changes
  useEffect(() => {
    setCurrentTimetableData(timetableData);
  }, [timetableData]);

  const tabs = [
    { id: "weekly", label: "Weekly Schedule", icon: Calendar },
    { id: "class", label: "Class Allocation", icon: Users },
    { id: "exam", label: "Exam Schedule", icon: Clock },
  ];

  // Function to refetch timetable data from loader
  const refetchTimetableData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/backend/api/timetable/weekly`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load timetable");
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(
          responseData.message || "Failed to load timetable data"
        );
      }

      // Update the timetable data state
      setCurrentTimetableData(responseData.data);
      return true;
    } catch (error) {
      console.error("Error refetching timetable:", error);
      setScheduleError("Failed to refresh timetable data: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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

        // Get Rooms
        const roomsResponse = await fetch(`/backend/api/rooms`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!roomsResponse.ok) throw new Error("Failed to fetch classes");
        const roomsData = await roomsResponse.json();

        setRooms(roomsData);

        // Get teachers
        const teachersResponse = await fetch(
          `/backend/api/teachers`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!teachersResponse.ok) throw new Error("Failed to fetch classes");
        const teachersData = await teachersResponse.json();
       
        setTeachers(teachersData.data);
      } catch (err) {
        console.error(err);
        setScheduleError(err.message);
      }
    };

    fetchData();
  }, []);

  const handleAddSchedule = async (newSchedule) => {
    try {
      setIsLoading(true);
      // Clear previous messages
      setScheduleError(null);
      setScheduleSuccess(null);

      // API call to add a new schedule entry
      const response = await fetch("/backend/api/timetable/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          class_id: newSchedule.classId,
          subject_id: newSchedule.subjectId,
          teacher_id: newSchedule.teacherId,
          day_of_week: getDayNumber(newSchedule.day),
          start_time: newSchedule.startTime,
          end_time: newSchedule.endTime,
          room_number: newSchedule.room,
          academic_session_id: session.id,
        }),
      });

      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add schedule");
      }

      // Show success message
      setScheduleSuccess("Schedule added successfully!");

      // Close the modal
      setShowAddModal(false);

      // Refetch the timetable data
      const refetchSuccess = await refetchTimetableData();

      if (!refetchSuccess) {
        setScheduleSuccess(
          "Schedule was added, but the timetable couldn't be refreshed. Please reload the page."
        );
      }
    } catch (error) {
      console.error("Error adding schedule:", error);
      setScheduleError(error.message || "Failed to add schedule");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert day name to number
  const getDayNumber = (dayName) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days.indexOf(dayName) + 1;
  };

  const getFilteredData = () => {
    if (!currentTimetableData) return null;

    let filteredData = currentTimetableData;

    // Filter by class
    if (selectedClass !== "all") {
      filteredData = {
        ...filteredData,
        classes: filteredData.classes.filter(
          (c) => c.id.toString() === selectedClass
        ),
      };
    }

    // Filter by teacher
    if (selectedTeacher !== "all") {
      filteredData = {
        ...filteredData,
        teachers: filteredData.teachers.filter(
          (t) => t.id.toString() === selectedTeacher
        ),
      };
    }

    // Filter by room
    if (selectedRoom !== "all") {
      filteredData = {
        ...filteredData,
        rooms: filteredData.rooms.filter((r) => r.name === selectedRoom),
      };
    }

    return filteredData;
  };

  const filterOptions = {
    classes: currentTimetableData?.classes || [],
    teachers: currentTimetableData?.teachers || [],
    rooms: currentTimetableData?.rooms || [],
  };

  // Clear notification messages after 5 seconds
  useEffect(() => {
    let timer;

    if (scheduleError || scheduleSuccess) {
      timer = setTimeout(() => {
        setScheduleError(null);
        setScheduleSuccess(null);
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [scheduleError, scheduleSuccess]);

  return (
    <Navbar>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Timetable Management
          </h1>
          <p className="text-gray-600">
            Manage class schedules, allocations, and exam timetables
          </p>
        </div>

        {/* Notification Messages */}
        {scheduleError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {scheduleError}
          </div>
        )}

        {scheduleSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {scheduleSuccess}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Total Classes
              </h3>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              {currentTimetableData?.classes?.length || 0}
            </div>
            <p className="text-xs text-gray-600">Active classes</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Total Teachers
              </h3>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              {currentTimetableData?.teachers?.length || 0}
            </div>
            <p className="text-xs text-gray-600">Assigned teachers</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Rooms</h3>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              {currentTimetableData?.rooms?.length || 0}
            </div>
            <p className="text-xs text-gray-600">Available rooms</p>
          </div>

          {/* <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Conflicts</h3>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-600">All clear</p>
          </div> */}
        </div>

        {/* Controls */}
        {activeTab === "weekly" && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Classes</option>
                {filterOptions.classes.map((c, index) => (
                  <option key={`${c.id}-${index}`} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Teachers</option>
                {filterOptions.teachers.map((t,index) => (
                  <option key={`${t.id}-${index}`} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Rooms</option>
                {filterOptions.rooms.map((r,index) => (
                  <option key={`${r.name}-${index}`} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              {/* <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border rounded-lg hover:bg-gray-50">
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button> */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Add Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab,index) => (
                <button
                  key={`${tab.id}-${index}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <AddScheduleModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSchedule}
          classes={classes}
          teachers={teachers}
          rooms={rooms}
        />

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="text-gray-500">Loading timetable data...</div>
            </div>
          ) : (
            <>
              {activeTab === "weekly" && (
                <WeeklySchedule
                  timetableData={getFilteredData()}
                  selectedClass={selectedClass}
                  selectedTeacher={selectedTeacher}
                  selectedRoom={selectedRoom}
                  refetchTimetableData={refetchTimetableData}
                />
              )}
              {activeTab === "class" && (
                <ClassAllocation rooms={filterOptions.rooms} />
              )}
              {activeTab === "exam" && <ExamSchedule />}
            </>
          )}
        </div>
      </div>
    </Navbar>
  );
};

export default TimetableManagement;

export async function loader({ params }) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If no token exists, redirect to login
    if (!token) {
      return redirect("/");
    }

    const tokenUrl = "/backend/api/auth/verify-token";

    const tokenResponse = await fetch(tokenUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const tokenData = await tokenResponse.json();

    // If token is invalid or expired
    if (!tokenResponse.ok || tokenData.error) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }

    // Fetch timetable data
    const response = await fetch(`/backend/api/timetable/weekly`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load timetable");
    }

    const responseData = await response.json();

    if (!responseData.success) {
      throw new Error(responseData.message || "Failed to load timetable data");
    }

    return {
      timetableData: responseData.data,
    };
  } catch (error) {
    console.error("Error loading timetable:", error);
    return {
      error: {
        message: error.message,
        status: error.status || 500,
      },
    };
  }
}
