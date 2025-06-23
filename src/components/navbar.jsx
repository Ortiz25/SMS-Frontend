import React, { useState, useEffect } from "react";
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
  CircleDollarSign,
  Scale,
  Send,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink, redirect, useNavigate } from "react-router-dom";
import { useStore } from "../store/store";

const Navbar = ({ children }) => {
  const { activeModule, isSidebarCollapsed, setIsSidebarCollapsed } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      // Reset collapse state on mobile screens
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(false);
        setSidebarOpen(false);
      }
    };
  
    window.addEventListener('resize', handleResize);
    handleResize();
  
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarCollapsed]);
  
  const logout = () => {
    // Clear the token and user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navigationItems = [
    { id: "overview", name: "Overview", icon: BarChart, route: "/dashboard" },
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
    { id: "finance", name: "Finance", icon: CircleDollarSign, route: "/finance"},
    { id: "inventory", name: "Inventory & Asset Management", icon: Layers, route: "/inventory" },
    { id: "communications", name: "Communication & Notifications", icon: Send, route: "/communications" },
    { id: "transport", name: "Hostel & Transport", icon: BusIcon, route: "/transport" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen transition-transform  ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className={`h-full ${isSidebarCollapsed && window.innerWidth >= 1024 ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 px-3 py-4 transition-all duration-300 shadow-lg overflow-y-auto`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div className={`flex items-center space-x-3 ${isSidebarCollapsed && window.innerWidth >= 1024 ? 'justify-center' : ''}`}>
              <Building2 className="h-8 w-8 text-blue-600" />
              {!(isSidebarCollapsed && window.innerWidth >= 1024) && <span className="text-xl font-bold text-gray-800">Shule SMS</span>}
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

        

          {/* Navigation Items */}
          <nav className="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {navigationItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.route}
                //onClick={() => setSelectedModule(item.id)}
                className={`w-full flex items-center ${
                  isSidebarCollapsed && window.innerWidth >= 1024 ? 'justify-center px-2' : 'space-x-3 px-4'
                } py-3 text-sm rounded-xl transition-all duration-200 group ${
                  activeModule === item.id
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={isSidebarCollapsed && window.innerWidth >= 1024 ? item.name : undefined}
              >
                <item.icon className={`h-5 w-5 ${activeModule === item.id ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-800'}`} />
                {!(isSidebarCollapsed && window.innerWidth >= 1024) && (
                  <span className="font-medium transition-all duration-200">
                    {item.name}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className="space-y-2">
              <NavLink 
                to={"/settings"} 
                className={`w-full flex items-center ${
                  isSidebarCollapsed && window.innerWidth >= 1024 ? 'justify-center px-2' : 'space-x-3 px-4'
                } py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200 group`}
                title={isSidebarCollapsed && window.innerWidth >= 1024 ? "Settings" : undefined}
              >
                <Settings className="h-5 w-5 text-gray-600 group-hover:text-gray-800" />
                {!(isSidebarCollapsed && window.innerWidth >= 1024) && <span className="font-medium">Settings</span>}
              </NavLink>
              <button 
                className={`w-full flex items-center ${
                  isSidebarCollapsed && window.innerWidth >= 1024 ? 'justify-center px-2' : 'space-x-3 px-4'
                } py-3 text-sm text-red-700 hover:bg-red-50 hover:text-red-800 rounded-xl transition-all duration-200 group cursor-pointer`} 
                onClick={logout}
                title={isSidebarCollapsed && window.innerWidth >= 1024 ? "Logout" : undefined}
              >
                <LogOut className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                {!(isSidebarCollapsed && window.innerWidth >= 1024) && <span className="font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isSidebarCollapsed && window.innerWidth >= 1024 ? 'lg:pl-16' : 'lg:pl-64'} transition-all duration-300`}>
        <div className="min-h-screen">
          {/* Top Navigation */}
          <nav className="bg-white/90 backdrop-blur-md shadow-sm px-6 py-4 border-b border-gray-200/50 sticky top-0 z-30">
            <div className="flex items-center justify-between ">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
                {/* Collapse Toggle for Desktop */}
         
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
            </button>
          
              <div className="flex items-center space-x-4">
                {/* <div className="relative">
                  <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </div> */}
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center font-semibold shadow-md">
                    {user.teacher ? user.teacher.first_name.charAt(0).toUpperCase() : user.role.charAt(0).toUpperCase()}
                  </div>
                  {!(isSidebarCollapsed && window.innerWidth >= 1024) && (
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.teacher ? `${user.teacher.first_name} ${user.teacher.last_name}` : user.role}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Navbar;