import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Settings,
  Plus,
  Download,
  Repeat,
  AlertCircle,
} from "lucide-react";
import WeeklySchedule from "../components/weeklySchedule";
import ClassAllocation from "../components/classAllocation";
import ExamSchedule from "../components/examSchedule";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import AddScheduleModal from "../components/modals/addSchedule";

// Define teachers data
const teachers = [
  {
    id: 1,
    name: "Mr. John Doe",
    subjects: ["Mathematics", "Physics"],
    color: "bg-blue-50 border-blue-100 text-blue-700",
  },
  {
    id: 2,
    name: "Mrs. Sarah Smith",
    subjects: ["English", "Literature"],
    color: "bg-green-50 border-green-100 text-green-700",
  },
  {
    id: 3,
    name: "Mr. David Wilson",
    subjects: ["Chemistry", "Biology"],
    color: "bg-purple-50 border-purple-100 text-purple-700",
  },
];

const TimetableManagement = () => {
  const { activeModule, updateActiveModule } = useStore();
  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedClass, setSelectedClass] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
 
  useEffect(() => {
    updateActiveModule("timetable");
  }, [activeModule]);

  const tabs = [
    { id: "weekly", label: "Weekly Schedule", icon: Calendar },
    { id: "class", label: "Class Allocation", icon: Users },
    { id: "exam", label: "Exam Schedule", icon: Clock },
  ];

  const handleAddSchedule = (newSchedule) => {
    const teacherData = teachers.find((t) => t.name === newSchedule.teacher);

    setSchedule((prev) => ({
      ...prev,
      [newSchedule.day]: prev[newSchedule.day].map((timeSlot) => {
        if (timeSlot.time === newSchedule.time) {
          return {
            ...timeSlot,
            classes: [
              ...timeSlot.classes,
              {
                class: newSchedule.class,
                subject: newSchedule.subject,
                teacher: newSchedule.teacher,
                room: newSchedule.room,
                color: teacherData.color,
              },
            ],
          };
        }
        return timeSlot;
      }),
    }));
  };

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
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-600">Active classes</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Total Subjects
              </h3>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-600">Subjects scheduled</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Weekly Hours
              </h3>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">40</div>
            <p className="text-xs text-gray-600">Hours per week</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Conflicts</h3>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-red-600">Needs resolution</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Classes</option>
              <option value="form1">Form 1</option>
              <option value="form2">Form 2</option>
              <option value="form3">Form 3</option>
              <option value="form4">Form 4</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border rounded-lg hover:bg-gray-50">
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Add Schedule</span>
            </button>
          </div>
        </div>

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
          teachers={teachers}
        />

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "weekly" && <WeeklySchedule teachers={teachers} />}
          {activeTab === "class" && <ClassAllocation />}
          {activeTab === "exam" && <ExamSchedule />}
        </div>
      </div>
    </Navbar>
  );
};

export default TimetableManagement;
