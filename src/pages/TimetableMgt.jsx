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
} from "lucide-react";
import WeeklySchedule from "../components/weeklySchedule";
import ClassAllocation from "../components/classAllocation";
import ExamSchedule from "../components/examSchedule";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import AddScheduleModal from "../components/modals/addSchedule";
import { redirect, useLoaderData } from "react-router-dom";

const TimetableManagement = () => {
  const { activeModule, updateActiveModule } = useStore();
  const { timetableData, error } = useLoaderData();
  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
     console.log(timetableData)
  useEffect(() => {
    updateActiveModule("timetable");
  }, [updateActiveModule]);
  console.log(timetableData)
  const tabs = [
    { id: "weekly", label: "Weekly Schedule", icon: Calendar },
    { id: "class", label: "Class Allocation", icon: Users },
    { id: "exam", label: "Exam Schedule", icon: Clock },
  ];

  const handleAddSchedule = async (newSchedule) => {
    try {
      const token = localStorage.getItem("token");

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
          academic_session_id: newSchedule.academicSessionId || 1, // Default to current session
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add schedule");
      }

      // Reload the timetable data after adding
      window.location.reload();
    } catch (error) {
      console.error("Error adding schedule:", error);
      // Handle error (show notification, etc.)
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
    if (!timetableData) return null;

    let filteredData = timetableData;

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
    classes: timetableData?.classes || [],
    teachers: timetableData?.teachers || [],
    rooms: timetableData?.rooms || [],
  };

  if (error) {
    return (
      <Navbar>
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            Error loading timetable: {error.message}
          </div>
        </div>
      </Navbar>
    );
  }

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
              {timetableData?.classes?.length || 0}
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
              {timetableData?.teachers?.length || 0}
            </div>
            <p className="text-xs text-gray-600">Assigned teachers</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Rooms</h3>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              {timetableData?.rooms?.length || 0}
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
                {filterOptions.classes.map((c) => (
                  <option key={c.id} value={c.id}>
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
                {filterOptions.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
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
                {filterOptions.rooms.map((r) => (
                  <option key={r.name} value={r.name}>
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
              >
                <Plus className="h-5 w-5" />
                <span>Add Schedule</span>
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
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
          classes={filterOptions.classes}
          teachers={filterOptions.teachers}
          rooms={filterOptions.rooms}
        />

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "weekly" && (
            <WeeklySchedule
              timetableData={getFilteredData()}
              selectedClass={selectedClass}
              selectedTeacher={selectedTeacher}
              selectedRoom={selectedRoom}
            />
          )}
          {activeTab === "class" && <ClassAllocation  rooms={filterOptions.rooms}/>}
          {activeTab === "exam" && <ExamSchedule />}
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

    // Return the timetable data
    console.log(responseData.data);
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
