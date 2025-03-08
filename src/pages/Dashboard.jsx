import {
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
  BusIcon,
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
  BookPlus,
  List,
  FileText,
  CheckCircle,
  MapPin,
  MoreVertical,
  PlusCircle,
} from "lucide-react";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import { useEffect, useState } from "react";
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
  const [studentData, updateStudentData] = useState({
    total_students: 0,
    male_students: 0,
    female_students: 0,
    active_students: 0,
    inactive_students: 0
  });
  const [libraryData, updateLibraryData] = useState({
    total_books: 0,
    available_books: 0,
    borrowed_books: 0
  });
  const [teacherData, updateTeacherData] = useState({
    total_teachers: 0,
    active_teachers: 0
  });
  const [activities, updateActivities] = useState([]);
  const [performance, updatePerformance] = useState([]);
  const [eventsData, updateEvents] = useState([]);

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

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const classesSummaryResponse = await fetch(
          "/backend/api/dashboard/form-performance",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!classesSummaryResponse.ok) {
          throw new Error(
            `HTTP error! Status: ${classesSummaryResponse.status}`
          );
        }

        const classData = await classesSummaryResponse.json();
        updatePerformanceData(classData || []);
      } catch (error) {
        console.error("Error fetching class data:", error);
        // Set to empty array in case of error
        updatePerformanceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

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
                <div className="text-center text-gray-500">No upcoming events</div>
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
                  <span className="text-sm text-gray-600">Total Books</span>
                </div>
                <span className="text-lg font-bold">
                  {libraryData?.total_books || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Available Books</span>
                </div>
                <span className="text-lg font-bold">
                  {libraryData?.available_books || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookMinus className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">Borrowed Books</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {libraryData?.borrowed_books || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Performance Overview - Dedicated Row */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-extrabold text-gray-800">
              Classes Performance Overview
            </h3>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : performanceData && performanceData.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {performanceData.map((data) => (
                <div
                  key={data.form}
                  className={`p-4 rounded-lg border ${
                    data.status === "Above average"
                      ? "border-green-200 bg-green-50"
                      : data.status === "Below average"
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-gray-50"
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
                      <div className="text-xl font-bold">
                        {data.average > 0 ? `${data.average}%` : "-"}
                      </div>
                      <div>
                        {data.trend === "up" && (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        )}
                        {data.trend === "down" && (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        {data.trend === "stable" && (
                          <div className="h-4 w-4 text-gray-400">-</div>
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
          ) : (
            <div className="text-center text-gray-500 py-8">No performance data available</div>
          )}
        </div>

        {/* Transport Usage - Moved to its own row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          {/* You can add additional stats cards here */}
        </div>

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
              ) : (
                <div className="text-center text-gray-500 py-8">No recent activities</div>
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