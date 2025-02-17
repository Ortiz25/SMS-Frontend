import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart,
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
  CreditCard,
  BusIcon,
  Building2,
  Bell,
  BookMarked,
  Activity,
  Box,
  UserPlus,
  Heart,
  Menu,
  X,
  Clock,
  LogOut,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import { useEffect } from "react";
import YearlyAttendanceChart from "../components/yearlyAttendance";

const Dashboard = () => {
  const { updateActiveModule, activeModule } = useStore();

  useEffect(() => {
    updateActiveModule("overview");
  }, [activeModule]);

  const events = [
    {
      title: "Sports Day",
      date: "March 10",
      time: "9:00 AM",
      type: "sports",
    },
    {
      title: "Science Fair",
      date: "March 15",
      time: "1:00 PM",
      type: "academic",
    },
  ];

  const attendanceData = [
    { name: "Mon", students: 450 },
    { name: "Tue", students: 470 },
    { name: "Wed", students: 460 },
    { name: "Thu", students: 455 },
    { name: "Fri", students: 465 },
  ];

  const formData = [
    {
      form: "Form 1",
      average: 82,
      trend: "up",
      status: "Above average",
    },
    {
      form: "Form 2",
      average: 78,
      trend: "down",
      status: "Below average",
    },
    {
      form: "Form 3",
      average: 85,
      trend: "up",
      status: "Above average",
    },
    {
      form: "Form 4",
      average: 88,
      trend: "up",
      status: "Above average",
    },
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-lg  shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-gray-800">
                Total Students
              </h3>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-green-600">+15% from last term</p>
          </div>

          {/* Total Teachers */}
          <div className="bg-white rounded-xl  shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-gray-800">
                Total Teachers
              </h3>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-green-600">+3 new this month</p>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h3 className="text-xl font-bold text-gray-900">
                  Upcoming Events
                </h3>
              </div>
              {/* <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                This Month
              </span> */}
            </div>

            <div className="space-y-4">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {event.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {event.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      event.type === "sports"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Average Student Performance */}
          <div className="bg-white rounded-lg  shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-extrabold text-gray-800">
                Classes Performance Overview
              </h3>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-2">
              {formData.map((data) => (
                <div
                  key={data.form}
                  className="border-r last:border-r-0 px-2 first:pl-0 last:pr-0"
                >
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-600">
                      {data.form}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">{data.average}%</div>
                      {getTrendIcon(data.trend)}
                    </div>
                    <p className={`text-xs ${getStatusColor(data.status)}`}>
                      {data.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Books Borrowed */}
          <div className="bg-white rounded-lg  shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-gray-800">
                Library Books Borrowed
              </h3>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">350</div>
            <p className="text-xs text-green-600">This month</p>
          </div>

          {/* Transport Usage */}
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
        </div>

        {/* Charts and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Attendance Chart */}
          <YearlyAttendanceChart />
          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-extrabold  mb-4">
                Recent Activities
              </h3>
              <div className="space-y-4">
                {[
                  {
                    icon: UserPlus,
                    text: "New student admission - John Doe",
                    time: "2 hours ago",
                  },
                  {
                    icon: Bell,
                    text: "Parent meeting scheduled for Form 4",
                    time: "5 hours ago",
                  },
                  {
                    icon: BookOpen,
                    text: "New books added to library inventory",
                    time: "1 day ago",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <activity.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default Dashboard;
