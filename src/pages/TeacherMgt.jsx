import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  MoreVertical,
  BookOpen,
  Briefcase,
} from "lucide-react";
import Navbar from "../components/navbar";
import TeacherProfiles from "../components/teacherProfile";
import WorkloadSchedule from "../components/workSchedule";
import PayrollTable from "../components/payrollTable";
import LeaveManagement from "../components/leaveMgt";
import AddTeacherModal from "../components/modals/addTeacher";
import { useStore } from "../store/store";
import { redirect, useLoaderData } from "react-router-dom";

const TeacherManagement = () => {
  const { activeModule, updateActiveModule } = useStore();
  const [activeTab, setActiveTab] = useState("profiles");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const data = useLoaderData();
  useEffect(() => {
    updateActiveModule("teachers");
    let filtered = [...data.teachers];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      console.log("Search term:", term);

      filtered = filtered?.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(term) ||
          teacher.department.toLowerCase().includes(term)
      );

      console.log("Filtered results:", filtered);
    }

    setFilteredData(filtered);
    // Calculate the slice of data to display based on pagination
    // const start = (currentPage - 1) * itemsPerPage;
    // const end = Math.min(start + itemsPerPage, filtered?.length);
    // setDisplayedData(filtered?.slice(start, end));
  }, [data, , searchTerm, searchTerm]);

  const handleAddTeacher = (teacherData) => {
    console.log("New teacher data:", teacherData);
    // Add your API call or data handling logic here
    setShowAddModal(false);
  };
  

  const tabs = [
    { id: "profiles", label: "Teacher Profiles", icon: Users },
    { id: "workload", label: "Workload & Schedule", icon: Clock },
    // { id: "payroll", label: "Payroll", icon: DollarSign },
    { id: "leave", label: "Leave Management", icon: Calendar },
  ];

  return (
    <Navbar>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Teacher Management
          </h1>
          <p className="text-gray-600">
            Manage teaching staff, workload, payroll, and leave requests
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search teachers..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {/* <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button> */}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus className="h-5 w-5" />
                <span>Add Teacher</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                <Download className="h-5 w-5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="px-3 py-2 border rounded-lg">
                <option>All Departments</option>
                <option>Sciences</option>
                <option>Languages</option>
                <option>Mathematics</option>
              </select>
              <select className="px-3 py-2 border rounded-lg">
                <option>All Positions</option>
                <option>Teacher</option>
                <option>Head of Department</option>
                <option>Administrator</option>
              </select>
              <select className="px-3 py-2 border rounded-lg">
                <option>Employment Status</option>
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Contract</option>
              </select>
            </div>
          )}
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

        {/* Content area - will be replaced with specific tab content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "profiles" && (
            <TeacherProfiles teachers={filteredData} />
          )}
          {activeTab === "workload" && (
            <WorkloadSchedule teachers={filteredData} />
          )}
          {/* {activeTab === "payroll" && <PayrollTable />} */}
          {activeTab === "leave" && <LeaveManagement />}
        </div>
        <AddTeacherModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTeacher}
        />
      </div>
    </Navbar>
  );
};

export default TeacherManagement;

export async function loader({ params, request }) {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // If no token exists, redirect to login
  if (!token) {
    return redirect("/");
  }

  try {
    // Determine if we're fetching all teachers or a specific teacher
    const url = new URL(request.url);
    const teacherId = params.teacherId;

    // API endpoint
    const apiUrl = `/backend/api/teachers`;

    // Fetch teachers or teacher details with authentication
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Log response status for debugging
    console.log("Response Status:", response.status);

    // Handle authentication failure
    if (response.status === 401 || response.status === 403) {
      // Clear stored credentials
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }

    // Parse the response data
    const data = await response.json();

    // Log API response for debugging
    console.log("API Response:", data);

    // Validate response
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to fetch teachers");
    }

    // Return data based on whether it's a list or single teacher
    return teacherId
      ? data.data // Single teacher details
      : {
          teachers: data.data,
          count: data.count,
        };
  } catch (error) {
    console.error("Error fetching teachers:", error);

    // Return error information
    return redirect("/");
  }
}
