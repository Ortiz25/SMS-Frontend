import {
  ChevronDown,
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
  Bell,
  Activity,
  UserPlus,
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  BookmarkPlus,
  BookMinus,
  BookCheck,
  List,
  CheckCircle,
  MapPin,
  Layers,
  CalendarClock,
} from "lucide-react";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import { useCallback, useEffect, useState } from "react";
import YearlyAttendanceChart from "../components/yearlyAttendance";
import { redirect, useLoaderData } from "react-router-dom";
import { format, formatDistance } from "date-fns";
import { extractDate } from "../util/helperFunctions";

const Dashboard = () => {
  const token = localStorage.getItem("token");
  const data = useLoaderData();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { updateActiveModule, activeModule } = useStore();
  const [performanceData, updatePerformanceData] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [studentData, updateStudentData] = useState({
    total_students: 0,
    male_students: 0,
    female_students: 0,
    active_students: 0,
    inactive_students: 0,
  });
  const [libraryData, updateLibraryData] = useState({
    total_books: 0,
    total_copies: 0,
    available_books: 0,
    available_titles: 0,
    borrowed_books: 0,
    borrowed_titles: 0,
  });
  const [teacherData, updateTeacherData] = useState({
    total_teachers: 0,
    active_teachers: 0,
    male_teachers: 0,
    female_teachers: 0,
    inactive_teachers: 0,
  });
  const [activities, updateActivities] = useState([]);
  const [performance, updatePerformance] = useState([]);
  const [eventsData, updateEvents] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [academicSessions, setAcademicSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false);

  useEffect(() => {
    // Initialize with default values, then update if data exists
    if (data && data.dashboard) {
      if (data.dashboard.student_stats) {
        updateStudentData(data.dashboard.student_stats);
      }

      if (data.dashboard.library_stats) {
        updateLibraryData(data.dashboard.library_stats);
      }

      if (data.dashboard.teacher_stats) {
        updateTeacherData(data.dashboard.teacher_stats);
      }

      if (data.dashboard.recent_activities) {
        updateActivities(data.dashboard.recent_activities);
      }

      if (data.dashboard.form_performance) {
        updatePerformance(data.dashboard.form_performance);
      }

      if (data.dashboard.upcoming_events) {
        updateEvents(data.dashboard.upcoming_events);
      }
    }
  }, [data]);

  const year = new Date().getFullYear();
  // 1. First effect: Fetch academic sessions once when component mounts
  useEffect(() => {
    const fetchSessions = async () => {
      if (!token) return;

      try {
        const sessionsResponse = await fetch(
          "/backend/api/sessions/academic-sessions",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();

          if (
            !sessionsData ||
            !sessionsData.data ||
            !Array.isArray(sessionsData.data)
          ) {
            console.error("Invalid sessions data format:", sessionsData);
            return;
          }

          // Format dates from ISO strings to more readable format
          const formattedSessions = sessionsData.data.map((session) => ({
            ...session,
            // Format start_date
            start_date: session.start_date
              ? new Date(session.start_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : null,
            // Format end_date
            end_date: session.end_date
              ? new Date(session.end_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : null,
          }));

          // Group sessions by year for better organization
          const groupedSessions = formattedSessions.reduce((acc, session) => {
            const year = session.year;
            if (!acc[year]) {
              acc[year] = [];
            }
            acc[year].push(session);
            return acc;
          }, {});

          // For each year, sort terms in ascending order (Term 1, 2, 3)
          Object.keys(groupedSessions).forEach((year) => {
            groupedSessions[year].sort((a, b) => a.term - b.term);
          });

          const sortedSessions = Object.keys(groupedSessions)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .flatMap((year) => groupedSessions[year]);

          setAcademicSessions(sortedSessions);
          // Set the current session as default if it exists
          const currentSession = sortedSessions.find(
            (session) => session.is_current
          );
          if (currentSession) {
            setSelectedSession(currentSession);
          } else if (sortedSessions.length > 0) {
            // Otherwise set the first (most recent) session
            setSelectedSession(sortedSessions[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching academic sessions:", error);
      }
    };

    fetchSessions();
  }, [token]); // Only depends on token, runs once when component mounts

  // 2. Second effect: Fetch performance data when selectedSession changes
  // 2. Second effect: Fetch performance data when selectedSession changes
  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Use selectedSession to filter if available
        const url = selectedSession
          ? `/backend/api/dashboard/form-performance?academicSessionId=${selectedSession.id}`
          : "/backend/api/dashboard/form-performance";

        const classesSummaryResponse = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!classesSummaryResponse.ok) {
          throw new Error(
            `HTTP error! Status: ${classesSummaryResponse.status}`
          );
        }

        const classData = await classesSummaryResponse.json();
        

        // Filter examinations by the selected session if one is selected
        let filteredExaminations = classData.examinations;
        if (
          selectedSession &&
          classData.examinations &&
          classData.examinations.length > 0
        ) {
          filteredExaminations = classData.examinations.filter(
            (exam) => exam.academicSessionId === selectedSession.id
          );
        }

        // Store filtered examinations
        if (filteredExaminations && filteredExaminations.length > 0) {
          setExaminations(filteredExaminations);
          // Set first examination as default selected
          setSelectedExam(filteredExaminations[0]);
          // Use the formData from the first examination as performanceData
          updatePerformanceData(filteredExaminations[0].formData || []);
        } else {
          updatePerformanceData([]);
          setExaminations([]);
          setSelectedExam(null);
        }
      } catch (error) {
        console.error("Error fetching performance data:", error);
        updatePerformanceData([]);
        setExaminations([]);
        setSelectedExam(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, [token, selectedSession]);

  // 1. Memoize the session selection handler
  const handleSessionSelection = useCallback((session) => {
    setSelectedSession(session);
    setSessionDropdownOpen(false);
  }, []);

  // 2. Memoize the exam selection handler
  const handleExamSelection = useCallback((exam) => {
    setSelectedExam(exam);
    updatePerformanceData(exam.formData || []);
    setDropdownOpen(false);
  }, []);

  // 3. Memoize the "all sessions" handler
  const handleAllSessionsSelection = useCallback(() => {
    setSelectedSession(null);
    setSessionDropdownOpen(false);
  }, []);

  // 4. Add proper error state handling
  const [error, setError] = useState(null);

  useEffect(() => {
    updateActiveModule("overview");
  }, [updateActiveModule]);

  // Function to get icon based on activity type
  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case "New Student":
        return UserPlus;
      case "Attendance Marked":
        return CheckCircle;
      case "Parent Meeting":
        return Bell;
      default:
        return List;
    }
  };

  // Function to get icon color based on activity type
  const getIconColor = (activityType) => {
    switch (activityType) {
      case "New Student":
        return "text-green-600 bg-green-100";
      case "Attendance Marked":
        return "text-blue-600 bg-blue-100";
      case "Parent Meeting":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Function to get trend icon
  const getTrendIcon1 = (trend) => {
    if (trend === "up") {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === "down") {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  // Function to get status color
  const getStatusColor1 = (status) => {
    switch (status) {
      case "Average":
        return "text-yellow-600";
      case "Below average":
        return "text-red-600";
      case "Excellent":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const attendanceData = [
    { name: "Mon", students: 450 },
    { name: "Tue", students: 470 },
    { name: "Wed", students: 460 },
    { name: "Thu", students: 455 },
    { name: "Fri", students: 465 },
  ];

  const getTrendIcon = (trend) => {
    if (trend === "up") {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (status) => {
    return status.includes("Above") ? "text-green-600" : "text-red-600";
  };

  return (
    <Navbar>
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Error loading data</h3>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Refresh page
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Quick Stats - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-gray-800">
                Student Overview
              </h3>
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Total Students</span>
                </div>
                <span className="text-lg font-bold">
                  {studentData?.total_students || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Male Students</span>
                </div>
                <span className="text-lg font-bold">
                  {studentData?.male_students || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-pink-500" />
                  <span className="text-sm text-gray-600">Female Students</span>
                </div>
                <span className="text-lg font-bold">
                  {studentData?.female_students || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Active Students</span>
                </div>
                <span className="text-lg font-bold">
                  {studentData?.active_students || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserX className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">
                    Inactive Students
                  </span>
                </div>
                <span className="text-lg font-bold">
                  {studentData?.inactive_students || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Total Teachers */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-gray-800">
                Teacher Overview
              </h3>
              <Users className="h-5 w-5 text-blue-600" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Total Teachers</span>
                </div>
                <span className="text-lg font-bold">
                  {teacherData?.total_teachers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Male Teachers</span>
                </div>
                <span className="text-lg font-bold">
                  {teacherData?.male_teachers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-pink-500" />
                  <span className="text-sm text-gray-600">Female Teachers</span>
                </div>
                <span className="text-lg font-bold">
                  {teacherData?.female_teachers || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Active Teachers</span>
                </div>
                <span className="text-lg font-bold">
                  {teacherData?.active_teachers || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserX className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">
                    Inactive Teachers
                  </span>
                </div>
                <span className="text-lg font-bold">
                  {parseInt(teacherData?.total_teachers || 0) -
                    parseInt(teacherData?.active_teachers || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upcoming Events
                </h3>
              </div>
            </div>
            <div className="space-y-4">
              {/* Map through the events array */}
              {eventsData && eventsData.length > 0 ? (
                eventsData.map((event) => (
                  <div
                    key={event.id}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition duration-200 ease-in-out"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium dark:bg-indigo-900 dark:text-indigo-300">
                            <Clock className="h-3 w-3" />
                            {extractDate(event.event_date)}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium dark:bg-emerald-900 dark:text-emerald-300">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No upcoming events
                </div>
              )}
            </div>
          </div>

          {/* Library Book Inventory */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-gray-800">
                Library Book Inventory
              </h3>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookmarkPlus className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Total Titles</span>
                </div>
                <span className="text-lg font-bold">
                  {libraryData?.total_books || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Available Copies
                  </span>
                </div>
                <span className="text-lg font-bold">
                  {libraryData?.available_books || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookMinus className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Borrowed Titles</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {libraryData?.borrowed_titles || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm text-gray-600">Total Copies</span>
                </div>
                <span className="text-lg font-bold text-indigo-600">
                  {libraryData?.total_copies || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Performance Overview - Dedicated Row */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-extrabold text-gray-800">
                Classes Performance Overview
              </h3>
              {/* Academic Session Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSessionDropdownOpen(!sessionDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 group"
                >
                  <Calendar className="h-4 w-4 text-indigo-600 group-hover:text-indigo-700" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">
                    {selectedSession
                      ? `${selectedSession.year} Term ${selectedSession.term}${
                          selectedSession.is_current ? " (Current)" : ""
                        }`
                      : "All Sessions"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 group-hover:text-indigo-700 transition-transform duration-200 ${
                      sessionDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {sessionDropdownOpen && (
                  <>
                    {/* Backdrop for clicking outside */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setSessionDropdownOpen(false)}
                    ></div>

                    {/* Session Dropdown menu with animation */}
                    <div
                      className="absolute z-20 mt-2 w-64 rounded-lg border border-gray-200 shadow-lg bg-white overflow-hidden transition-all duration-200 animate-slideDown"
                      style={{
                        transformOrigin: "top center",
                      }}
                    >
                      <div className="py-1 max-h-72 overflow-y-auto">
                        (
                        <button
                          onClick={() =>
                            setSessionDropdownOpen(!sessionDropdownOpen)
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 group"
                        >
                          <Calendar className="h-4 w-4 text-indigo-600 group-hover:text-indigo-700" />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">
                            {selectedSession
                              ? `${selectedSession.year} Term ${
                                  selectedSession.term
                                }${
                                  selectedSession.is_current ? " (Current)" : ""
                                }`
                              : "All Sessions"}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-gray-500 group-hover:text-indigo-700 transition-transform duration-200 ${
                              sessionDropdownOpen ? "transform rotate-180" : ""
                            }`}
                          />
                        </button>
                        {academicSessions.map((session) => (
                          <button
                            key={session.id}
                            onClick={() => handleSessionSelection(session)}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 hover:bg-gray-50 flex items-center justify-between ${
                              selectedSession &&
                              selectedSession.id === session.id
                                ? "bg-blue-50/70 border-l-4 border-blue-500"
                                : "border-l-4 border-transparent"
                            }`}
                          >
                            <div className="flex items-center">
                              <CalendarClock className="h-4 w-4 mr-2 text-gray-400" />
                              <div className="flex flex-col">
                                <span
                                  className={`font-medium ${
                                    selectedSession &&
                                    selectedSession.id === session.id
                                      ? "text-blue-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {session.year} Term {session.term}
                                </span>
                                <span className="text-xs text-gray-500 mt-0.5">
                                  {session.status.charAt(0).toUpperCase() +
                                    session.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            {session.is_current && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                Current
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {examinations.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {selectedExam ? selectedExam.name : "Select Examination"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-transform duration-200 ${
                        dropdownOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <>
                      {/* Backdrop for clicking outside */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      ></div>

                      {/* Dropdown menu with animation */}
                      <div
                        className="absolute z-20 mt-2 w-80 rounded-lg border border-gray-200 shadow-lg bg-white overflow-hidden transition-all duration-200 animate-slideDown"
                        style={{
                          transformOrigin: "top center",
                        }}
                      >
                        <div className="py-1 max-h-72 overflow-y-auto">
                          {examinations.map((exam) => (
                            <button
                              key={exam.id}
                              onClick={() => handleExamSelection(exam)}
                              className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 hover:bg-gray-50 flex items-center justify-between ${
                                selectedExam && selectedExam.id === exam.id
                                  ? "bg-blue-50/70 border-l-4 border-blue-500"
                                  : "border-l-4 border-transparent"
                              }`}
                            >
                              <div className="flex flex-col">
                                <span
                                  className={`font-medium ${
                                    selectedExam && selectedExam.id === exam.id
                                      ? "text-blue-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {exam.name}
                                </span>
                                <span className="text-xs text-gray-500 mt-0.5">
                                  {exam.status === "completed"
                                    ? "Completed"
                                    : "In Progress"}
                                </span>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full flex items-center ${
                                  exam.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {exam.status === "completed" ? (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 mr-1"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3 mr-1"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    In Progress
                                  </>
                                )}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          {/* Add this right after the title section in the performance overview section */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : examinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-lg border border-gray-200">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No Examinations Available
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                {selectedSession
                  ? `No examinations found for ${selectedSession.year} Term ${selectedSession.term}. Please select a different academic session or check back later.`
                  : "No examination data found across any sessions. Please check back later when examinations have been recorded."}
              </p>
            </div>
          ) : performanceData && performanceData.length > 0 ? (
            <div className="space-y-6">
              {/* Session & Exam Info Tags */}
              {selectedExam && (
                <div className="flex flex-wrap gap-3 items-center mb-4">
                  {selectedSession && (
                    <div className="px-3 py-1.5 bg-indigo-50 rounded-md border border-indigo-100 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      <span className="text-xs font-medium text-indigo-800">
                        {selectedSession.year} Term {selectedSession.term}
                        {selectedSession.is_current ? " (Current)" : ""}
                      </span>
                    </div>
                  )}

                  {!selectedSession && (
                    <div className="px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-800">
                        All Sessions
                      </span>
                    </div>
                  )}

                  {selectedExam.curriculumType && (
                    <div className="px-3 py-1.5 bg-violet-50 rounded-md border border-violet-100 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-violet-600" />
                      <span className="text-xs font-medium text-violet-800">
                        {selectedExam.curriculumType === "CBC"
                          ? "CBC Curriculum"
                          : "8-4-4 Curriculum"}
                      </span>
                    </div>
                  )}

                  <div
                    className={`px-3 py-1.5 rounded-md border flex items-center gap-2 ${
                      selectedExam.status === "completed"
                        ? "bg-green-50 border-green-100"
                        : "bg-amber-50 border-amber-100"
                    }`}
                  >
                    <Clock
                      className={`h-4 w-4 ${
                        selectedExam.status === "completed"
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        selectedExam.status === "completed"
                          ? "text-green-800"
                          : "text-amber-800"
                      }`}
                    >
                      {selectedExam.status.charAt(0).toUpperCase() +
                        selectedExam.status.slice(1)}
                    </span>
                  </div>
                </div>
              )}

              {/* Performance Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {/* Overall Average Card */}
                {selectedExam && selectedExam.overallAverage && (
                  <div className="p-4 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="space-y-2">
                      <h4
                        className="text-sm font-medium text-gray-700 truncate"
                        title="Overall Average"
                      >
                        Overall Average
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-blue-700">
                          {selectedExam.overallAverage > 0
                            ? `${selectedExam.overallAverage}%`
                            : "-"}
                        </div>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-xs font-medium px-1.5 py-0.5 rounded-full inline-block bg-blue-100 text-blue-800">
                        Exam Average
                      </p>
                    </div>
                  </div>
                )}

                {/* Class Performance Cards */}
                {performanceData.map((data) => (
                  <div
                    key={data.form}
                    className={`p-4 rounded-lg border hover:shadow-md transition-all duration-200 ${
                      data.status === "Above average"
                        ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                        : data.status === "Below average"
                        ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-50"
                        : data.status === "No data"
                        ? "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50"
                        : "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50"
                    }`}
                  >
                    <div className="space-y-2">
                      <h4
                        className="text-sm font-medium text-gray-700 truncate"
                        title={data.form}
                      >
                        {data.form}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div
                          className={`text-xl font-bold ${
                            data.status === "Above average"
                              ? "text-green-700"
                              : data.status === "Below average"
                              ? "text-red-700"
                              : "text-gray-700"
                          }`}
                        >
                          {data.average > 0 ? `${data.average}%` : "-"}
                        </div>
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            data.trend === "up"
                              ? "bg-green-100"
                              : data.trend === "down"
                              ? "bg-red-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {data.trend === "up" && (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          )}
                          {data.trend === "down" && (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          {data.trend === "stable" && (
                            <div className="h-4 w-4 text-gray-400">•</div>
                          )}
                        </div>
                      </div>
                      <p
                        className={`text-xs font-medium px-1.5 py-0.5 rounded-full inline-block ${
                          data.status === "Above average"
                            ? "bg-green-100 text-green-800"
                            : data.status === "Below average"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {data.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-lg border border-gray-200">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No Performance Data Available
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                {selectedSession
                  ? `No examination data found for ${selectedSession.year} Term ${selectedSession.term}. Please select a different academic session or check back later.`
                  : "No examination data found across any sessions. Please check back later when examinations have been recorded."}
              </p>
            </div>
          )}
        </div>

        {/* Transport Usage - Moved to its own row */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-gray-800">
                Transport Usage
              </h3>
              <BusIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-green-600">
              Students using school buses
            </p>
          </div>
        </div> */}

        {/* Charts and Activity Feed - Last Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Attendance Chart */}
          <div className="lg:col-span-2">
            <YearlyAttendanceChart />
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-extrabold mb-4">Recent Activities</h3>
              {activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 4).map((activity, index) => {
                    const ActivityIcon = getActivityIcon(
                      activity.activity_type
                    );
                    const iconColorClass = getIconColor(activity.activity_type);

                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${iconColorClass}`}>
                          <ActivityIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.activity_type}: {activity.name}
                            {activity.reference
                              ? ` (${activity.reference})`
                              : ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistance(
                              new Date(activity.timestamp),
                              new Date(),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No recent activities
                </div>
              )}
              {activities && activities.length > 4 && (
                <div className="mt-4 text-center">
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => setIsOpen(true)}
                  >
                    View All Activities
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {isOpen && activities && activities.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="relative z-50 bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                All Activities
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 space-y-4">
              {activities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.activity_type);
                const iconColorClass = getIconColor(activity.activity_type);

                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${iconColorClass}`}>
                      <ActivityIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.activity_type}: {activity.name}
                        {activity.reference ? ` (${activity.reference})` : ""}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistance(
                          new Date(activity.timestamp),
                          new Date(),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t text-center">
              <p className="text-xs text-gray-500">
                {activities.length} total activities
              </p>
            </div>
          </div>
        </div>
      )}
    </Navbar>
  );
};

export default Dashboard;

export async function loader({ params, request }) {
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // If no token exists, redirect to login
  if (!token) {
    return redirect("/");
  }

  const tokenUrl = "/backend/api/auth/verify-token";

  try {
    const tokenResponse = await fetch(tokenUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const tokenData = await tokenResponse.json();

    // If token is invalid or expired
    if (!tokenResponse.ok) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return redirect("/");
    }

    // Check if we have cached dashboard data and it's not expired
    const cachedData = localStorage.getItem("dashboardData");
    const performanceData = localStorage.getItem("classData");
    const cacheTimestamp = localStorage.getItem("dashboardCacheTime");
    const cacheAge = cacheTimestamp
      ? Date.now() - parseInt(cacheTimestamp)
      : Infinity;
    const cacheTTL = 5 * 60 * 1000; // 5 minutes cache

    // Use cached data if available and not expired
    if (cachedData && cacheAge < cacheTTL) {
      return {
        user: JSON.parse(localStorage.getItem("user") || "{}"),
        dashboard: JSON.parse(cachedData),
        performance: performanceData ? JSON.parse(performanceData) : [],
        fromCache: true,
      };
    }

    // Make API call to fetch dashboard data
    const dashboardResponse = await fetch(
      "/backend/api/dashboard/summary",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Handle dashboard data
    if (!dashboardResponse.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const dashboardData = await dashboardResponse.json();

    // Cache the data for future use
    localStorage.setItem("dashboardData", JSON.stringify(dashboardData));
    // Note: classData is no longer referenced here, removed it
    localStorage.setItem("dashboardCacheTime", Date.now().toString());

    return {
      user: JSON.parse(localStorage.getItem("user") || "{}"),
      dashboard: dashboardData,
      fromCache: false,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    // Try to return cached data if available even if it's expired
    const cachedData = localStorage.getItem("dashboardData");
    if (cachedData) {
      return {
        user: JSON.parse(localStorage.getItem("user") || "{}"),
        dashboard: JSON.parse(cachedData),
        fromCache: true,
        staleData: true,
      };
    }

    return {
      error: true,
      message: "Failed to fetch dashboard data. Please try again later.",
    };
  }
}
