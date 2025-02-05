import React, { useState } from "react";
import {
  BarChart,
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  BusIcon,
  Building2,
  Bell,
  BookMarked,
  ChartLine,
  Scale,
  Send,
  Heart,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useStore } from "../store/store";

const Navbar = ({ children }) => {
  const { activeModule } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState("overview");
 

  const navigationItems = [
    { id: "overview", name: "Overview", icon: BarChart, route: "/" },
    {
      id: "students",
      name: "Student Management",
      icon: GraduationCap,
      route: "/students",
    },
    {
      id: "teachers",
      name: "Teacher Management",
      icon: Users,
      route: "/teachers",
    },
    { id: "timetable", name: "Timetable", icon: Calendar, route: "/timetable" },
    { id: "grading", name: "Exam Grading", icon: ChartLine, route: "/grading" },
    { id: "library", name: "Library", icon: BookOpen, route: "/library" },
    { id: "disciplinary", name: "Disciplinary", icon: Scale, route: "/disciplinary"},
    { id: "inventory", name: "Inventory & Asset Management", icon: Layers,route: "/inventory" },
    { id: "communications", name: "Communication & Notifications", icon: Send, route: "/communications"  },
    { id: "transport", name: "Hostel & Transport", icon: BusIcon,route: "/transport" },
    // { id: "elearning", name: "E-Learning", icon: BookMarked, route: "/" },
    // { id: "health", name: "Health Records", icon: Heart, route: "/" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full w-64 bg-white border-r border-gray-200 px-3 py-4">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Teqova SMS</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.route}
                onClick={() => setSelectedModule(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm rounded-lg transition-colors ${
                  activeModule === item.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="space-y-2">
              <NavLink to={"/settings"} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </NavLink>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-700 hover:bg-red-50 rounded-lg">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`${
          sidebarOpen ? "lg:ml-64" : ""
        } transition-margin duration-200 ease-in-out`}
      >
        {/* Top Navigation */}
        <nav className="bg-white shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                A
              </div>
            </div>
          </div>
        </nav>

        {children}
      </div>
    </div>
  );
};

export default Navbar;
