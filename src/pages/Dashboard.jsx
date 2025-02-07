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
  Settings,
  LogOut,
} from "lucide-react";
import Navbar from "../components/navbar";
import { useStore } from "../store/store";
import { useEffect } from "react";

const Dashboard = () => {
  const { updateActiveModule, activeModule } = useStore();

  useEffect(() => {
    updateActiveModule("overview");
  }, [activeModule]);

  const attendanceData = [
    { name: "Mon", students: 450 },
    { name: "Tue", students: 470 },
    { name: "Wed", students: 460 },
    { name: "Thu", students: 455 },
    { name: "Fri", students: 465 },
  ];

  return (
    <Navbar>
      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-green-600">+15% from last term</p>
          </div>

          {/* Total Teachers */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Teachers</h3>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-green-600">+3 new this month</p>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-600">Upcoming Events</h3>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm text-gray-700">Sports Day - March 10</div>
            <div className="text-sm text-gray-700">Science Fair - March 15</div>
          </div>

          {/* Average Student Performance */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-600">Avg Student Performance</h3>
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-green-600">Above school average</p>
          </div>

          {/* Books Borrowed */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-600">Library Books Borrowed</h3>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">350</div>
            <p className="text-xs text-green-600">This month</p>
          </div>

          {/* Transport Usage */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-600">Transport Usage</h3>
              <BusIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-green-600">Students using school buses</p>
          </div>
        </div>

        {/* Charts and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Attendance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Attendance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="students" fill="#3B82F6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
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
