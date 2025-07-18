import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  UserPlus,
  Users,
  Calendar,
  Cctv,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Activity,
} from "lucide-react";
import { redirect, useLoaderData, useSearchParams } from "react-router-dom";
import Navbar from "../components/navbar";
import AddStudentModal from "../components/modals/addStudent";
import EditStudentModal from "../components/modals/editStudent";
import DeleteStudentModal from "../components/modals/deleteStudent";
import ViewDetailsModal from "../components/modals/studentDetailModal";
import AttendanceEntryModal from "../components/modals/attendanceEntry";
import StudentAttendanceModal from "../components/modals/StudentAttendanceModal";
import AttendanceTab from "../components/attendanceTab";
import { useStore } from "../store/store";
import { getPageNumbers } from "../util/pagination";
import axios from "axios";

const StudentManagement = () => {
  const { data, count, success, error, message } = useLoaderData();
  const { activeModule, updateActiveModule, updateStudents } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStudentAttendanceModal, setShowStudentAttendanceModal] =
    useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, updateStudentData] = useState(data || []);
  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(
    parseInt(searchParams.get("perPage") || "10")
  );
  const currentPage = parseInt(searchParams.get("page") || "1");
  const totalPages = Math.ceil(count / itemsPerPage);

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [formValidation, setFormValidation] = useState({
    personal: false,
    academic: false,
    medical: false,
  });
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    other_name: "",
    admissionNo: "",
    class: "",
    stream: "",
    dateOfBirth: "",
    gender: "",
    medicalInfo: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelation: "",
    address: "",
    studentType: "",
    busRoute: "",
    hostel: "",
    allergies: [],
    previous_school: "",
  });

  // Attendance state
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    leaveCount: 0,
    presentPercentage: 0,
    absentPercentage: 0,
    latePercentage: 0,
    leavePercentage: 0,
  });
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceFilterOptions, setAttendanceFilterOptions] = useState({
    class: "",
    status: "all",
    dateRange: "today",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [errorStats, setError] = useState(null);
  const [stats, setStats] = useState({
    students: { total: 0, newThisTerm: 0 },
    attendance: { current: 0, previous: 0, change: 0 },
    performance: { currentGrade: "", previousGrade: "" },
  });

    const [isAdmin, setIsAdmin] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");

      const apiUrl = `/backend/api/students/detailed`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      updateStudentData(data.data || [])
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStudentStats = async () => {
    try {
      setLoading(true);

      // Get token from localStorage or your auth context
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "/backend/api/dashboard/studentstats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch student stats");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while fetching stats"
      );
      console.error("Student stats error:", err);
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => { 
    const adminRights = userInfo.role === "admin";
    setIsAdmin(adminRights);
    fetchStudents()
    fetchStudentStats();
  }, []);

  // Calculate pagination details
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, count);

  // Handle items per page change
  const handleItemsPerPageChange = (newSize) => {
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set("perPage", newSize.toString());
    newParams.set("page", "1"); // Reset to first page when changing items per page
    setSearchParams(newParams);
  };

  // Pagination navigation handlers
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;

    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  const handlePrevPage = () => {
    goToPage(currentPage - 1);
  };

  const handleNextPage = () => {
    goToPage(currentPage + 1);
  };

  const handleValidationChange = (section, isValid) => {
    setFormValidation((prev) => ({
      ...prev,
      [section]: isValid,
    }));
  };

  const handleClose = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
    setFormValidation({
      personal: false,
      academic: false,
      medical: false,
    });
  };

  const handleSave = (formData) => {
    // Check if all sections are valid
    const isAllValid = Object.values(formValidation).every((valid) => valid);
    if (isAllValid) {
      console.log("Saving form data:", formData);
      // Add your save logic here
      handleClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add form submission logic here
    fetchStudents()
    fetchStudentStats()
    setShowAddModal(false);
  };

  // Tabs data
  const tabs = [
    { id: "all", label: "All Students" },
    { id: "active", label: "Active" },
    { id: "alumni", label: "Alumni" },
    { id: "suspended", label: "Suspended" },
    { id: "attendance", label: "Attendance" },
  ];

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleViewAttendance = (student) => {
    setSelectedStudent(student);
    setShowStudentAttendanceModal(true);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tabId);
    newParams.set("page", "1"); // Reset to first page on tab change
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    // Only update on Enter key press or using the search button
    if (e.key === "Enter" || e.type === "click") {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("search", searchTerm);
      newParams.set("page", "1"); // Reset to first page on new search
      setSearchParams(newParams);
    }
  };

  const handleAttendanceFilterChange = (e) => {
    const { name, value } = e.target;
    setAttendanceFilterOptions((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyAttendanceFilters = () => {
    fetchAttendanceData();
  };

  // Function to fetch attendance data
  const fetchAttendanceData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Construct query parameters based on filters
      let queryParams = new URLSearchParams();
      if (attendanceFilterOptions.class) {
        queryParams.append("class", attendanceFilterOptions.class);
      }
      if (attendanceFilterOptions.status !== "all") {
        queryParams.append("status", attendanceFilterOptions.status);
      }

      // Handle date range
      if (attendanceFilterOptions.dateRange === "custom") {
        queryParams.append("startDate", attendanceFilterOptions.startDate);
        queryParams.append("endDate", attendanceFilterOptions.endDate);
      } else if (attendanceFilterOptions.dateRange === "today") {
        const today = new Date().toISOString().split("T")[0];
        queryParams.append("date", today);
      } else if (attendanceFilterOptions.dateRange === "week") {
        // Calculate one week ago
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        queryParams.append("startDate", weekAgo.toISOString().split("T")[0]);
        queryParams.append("endDate", today.toISOString().split("T")[0]);
      } else if (attendanceFilterOptions.dateRange === "month") {
        // Calculate one month ago
        const today = new Date();
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        queryParams.append("startDate", monthAgo.toISOString().split("T")[0]);
        queryParams.append("endDate", today.toISOString().split("T")[0]);
      }

      // Fetch attendance data
      const response = await fetch(
        `/backend/api/attendance?${queryParams.toString()}`,
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

      // Calculate summary statistics
      if (data.data && data.data.length > 0) {
        const presentCount = data.data.filter(
          (r) => r.status === "present"
        ).length;
        const absentCount = data.data.filter(
          (r) => r.status === "absent"
        ).length;
        const lateCount = data.data.filter((r) => r.status === "late").length;
        const leaveCount = data.data.filter(
          (r) => r.status === "on-leave"
        ).length;
        const totalCount = data.data.length;

        setAttendanceSummary({
          presentCount,
          absentCount,
          lateCount,
          leaveCount,
          presentPercentage: totalCount ? (presentCount / totalCount) * 100 : 0,
          absentPercentage: totalCount ? (absentCount / totalCount) * 100 : 0,
          latePercentage: totalCount ? (lateCount / totalCount) * 100 : 0,
          leavePercentage: totalCount ? (leaveCount / totalCount) * 100 : 0,
        });
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  useEffect(() => {
    // Parse the perPage parameter from the URL and update state
    updateStudents(data);
    const perPage = parseInt(searchParams.get("perPage") || "10");
    setItemsPerPage(perPage);
  }, [searchParams]);

  useEffect(() => {
    updateActiveModule("students");

    if (activeTab === "attendance") {
      // Fetch attendance data when attendance tab is selected
      fetchAttendanceData();
    } else {
      // Original logic for other tabs
      let filtered = [...studentData];
      // Filter by tab/status
      if (activeTab !== "all") {
        filtered = filtered?.filter((student) => student.status === activeTab);
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        //console.log("Search term:", term);

        filtered = filtered?.filter(
          (student) =>
            student.first_name.toLowerCase().includes(term) ||
            student.last_name.toLowerCase().includes(term) ||
            student.admissionNo.toLowerCase().includes(term) ||
            `${student.class} ${student.stream}`.toLowerCase().includes(term)
        );

        //console.log("Filtered results:", filtered);
      }

      setFilteredData(filtered);

      // Calculate the slice of data to display based on pagination
      const start = (currentPage - 1) * itemsPerPage;
      const end = Math.min(start + itemsPerPage, filtered?.length);
      setDisplayedData(filtered?.slice(start, end));
    }
  }, [
    data,
    activeTab,
    searchTerm,
    currentPage,
    itemsPerPage, // Add itemsPerPage as a dependency
    searchParams,
    attendanceFilterOptions.dateRange === "today" ? selectedDate : null,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function isGradeImproved(current, previous) {
    // Grade order from best to worst (simplified)
    const gradeOrder = [
      "A+",
      "A",
      "A-",
      "B+",
      "B",
      "B-",
      "C+",
      "C",
      "C-",
      "D+",
      "D",
      "D-",
      "E",
      "F",
    ];

    const currentIndex = gradeOrder.indexOf(current);
    const previousIndex = gradeOrder.indexOf(previous);

    if (currentIndex === -1 || previousIndex === -1) return false;

    // Lower index means better grade
    return currentIndex < previousIndex;
  }

  return (
    <Navbar>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Student Management
          </h1>
          <p className="text-gray-600">
            Manage student information, attendance, and academic records
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Total Students
              </h3>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{stats.students.total}</div>
            <p className="text-xs text-green-600">
              +{stats.students.newThisTerm} this term
            </p>
          </div>

          {/* Attendance Rate */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Attendance Rate
              </h3>
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              {stats.attendance.current}%
            </div>
            <p
              className={`text-xs ${
                stats.attendance.change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.attendance.change > 0 ? "+" : ""}
              {stats.attendance.change}% from last term
            </p>
          </div>

          {/* Average Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Average Performance
              </h3>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              {stats.performance.currentGrade}
            </div>
            <p className="text-xs text-green-600">
              {isGradeImproved(
                stats.performance.currentGrade,
                stats.performance.previousGrade
              )
                ? `Improved from ${stats.performance.previousGrade}`
                : `Was ${stats.performance.previousGrade} last term`}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                className="flex items-center space-x-2 px-4 cursor-pointer py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700  transform hover:scale-105 transition-transform duration-200 ease-in-out"
                onClick={() => setShowAddModal(true)}
              >
                <UserPlus className="h-5 w-5" />
                <span>Add Student</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700  transform hover:scale-105 transition-transform duration-200 ease-in-out"
                onClick={() => setShowAttendanceModal(true)}
              >
                <Cctv className="h-5 w-5" />
                <span>Record Attendance</span>
              </button>
              {/* <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                <Download className="h-5 w-5" />
                <span>Export</span>
              </button> */}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-4 text-sm font-medium cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "attendance" ? (
          // Use the imported AttendanceTab component
          <AttendanceTab
            attendanceFilterOptions={attendanceFilterOptions}
            handleAttendanceFilterChange={handleAttendanceFilterChange}
            applyAttendanceFilters={applyAttendanceFilters}
            attendanceSummary={attendanceSummary}
            attendanceData={attendanceData}
          />
        ) : (
          // Render original student list table
          <div className="bg-white rounded-lg shadow-sm">
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
                      Attendance
                    </th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                      Performance
                    </th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="py-4 px-4 text-left text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayedData?.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student.first_name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {student.first_name + " " + student.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {student.admissionNo}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {student.class} {student.stream}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <button
                          onClick={() => handleViewAttendance(student)}
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          {student.attendance}
                          <Eye className="h-3 w-3 ml-1" />
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          {student.performance}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium ${
                            student.status === "active"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-200 text-gray-800"
                          }  rounded-full`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setShowDetailsModal(true);
                              setSelectedStudent(student);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowEditModal(true);
                              setSelectedStudent(student);
                            }}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {isAdmin &&  <button
                            onClick={() => handleDelete(student)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>}
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination with Items Per Page Control */}
            <div className="px-4 py-3 border-t">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                  <span className="text-sm text-gray-600">
                    Showing {filteredData?.length > 0 ? startIndex + 1 : 0} to{" "}
                    {endIndex} of {count} students
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <div className="flex border rounded-md overflow-hidden">
                      {[10, 20, 50].map((size) => (
                        <button
                          key={`size-${size}`}
                          onClick={() => handleItemsPerPageChange(size)}
                          className={`px-3 py-1 text-sm cursor-pointer ${
                            itemsPerPage === size
                              ? "bg-blue-600 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center cursor-pointer justify-center w-8 h-8 border rounded mx-1 ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {getPageNumbers(currentPage, totalPages).map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 flex items-center cursor-pointer justify-center rounded mx-1 ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center cursor-pointer w-8 h-8 border rounded mx-1 ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddStudentModal
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          handleSubmit={handleSubmit}
          formData={formData}
          fetchStudents={fetchStudents}
          fetchStudentStats={fetchStudentStats}
          handleInputChange={handleInputChange}
        />
      )}

      {showDeleteModal && (
        <DeleteStudentModal
          isOpen={showDeleteModal}
          student={selectedStudent}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedStudent(null);
          }}
          onConfirm={(studentId) => {
            // Handle delete
            console.log("Deleting student:", studentId);
            setShowDeleteModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {showEditModal && (
        <EditStudentModal
          isOpen={showEditModal}
          student={selectedStudent}
          handleValidationChange={handleValidationChange}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSave={(studentId, formData) => {
            // Handle save
            console.log("Saving student:", studentId, formData);
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      <ViewDetailsModal
        isOpen={showDetailsModal}
        tads={tabs}
        student={selectedStudent}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedStudent(null);
        }}
      />

      <AttendanceEntryModal
        isOpen={showAttendanceModal}
        student={studentData}
        onClose={() => {
          setShowAttendanceModal(false);
          setSelectedStudent(null);
        }}
      />

      <StudentAttendanceModal
        isOpen={showStudentAttendanceModal}
        student={selectedStudent}
        onClose={() => {
          setShowStudentAttendanceModal(false);
          setSelectedStudent(null);
        }}
      />
    </Navbar>
  );
};

export default StudentManagement;

export async function loader({ params, request }) {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // If no token exists, redirect to login
  if (!token) {
    return redirect("/");
  }

  try {
    // Set correct API endpoint for detailed student data
    const apiUrl = `/backend/api/students/detailed`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // If token is invalid or expired

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }

    // Get response data
    const data = await response.json();
    // If there's an error in the response
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to fetch detailed student data");
    }
    // Return the detailed student data
    return data;
  } catch (error) {
    console.error("Error fetching detailed student data:", error);
    return [];
  }
}
