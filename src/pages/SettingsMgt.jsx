import React, { useState } from "react";
import {
  Users,
  Settings,
  Shield,
  Key,
  Bell,
  ArrowLeftToLine,
  BookOpen,
  School,
  GraduationCapIcon,
  GraduationCap
} from "lucide-react";
import UserManagement from "../components/userMgt";
import AcademicSettings from "../components/academicSettings";
import SchoolStructureTab from "../components/schoolStructureSetting";
import SystemSettings from "../components/systemSettings";
import RoleFormModal from "../components/modals/roleForm";
import UserFormModal from "../components/modals/userForm";
import LogDetailModal from "../components/modals/logDetail";
import Navbar from "../components/navbar";
import { NavLink, redirect, useLoaderData } from "react-router-dom";
import PromotionManagement from "../components/classPromotions";

const menuItems = [
  {
    id: "users",
    label: "User Management",
    icon: Users,
    subItems: [],
  },
  {
    id: "academic",
    label: "Academic Settings",
    icon: BookOpen,
    subItems: [],
  },
  {
    id: "structure",
    label: "School Structure",
    icon: School,
    subItems: [],
  },
  {
    id: "promotions",
    label: "Class Promotions",
    icon: GraduationCap,
    subItems: [],
  },
  // {
  //   id: "system",
  //   label: "System Settings",
  //   icon: Settings,
  //   subItems: ["General", "Backup & Restore", "Maintenance"],
  // },
];

const SettingsModule = () => {
  const [activeSection, setActiveSection] = useState("users");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const userData = useLoaderData()

  // Handlers for Log Modal
  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowLogModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-xl shadow-slate-900/5">
        <SidebarContent
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
      fixed top-0 left-0 z-50 w-64 h-full bg-white/95 backdrop-blur-xl
      transform transition-transform duration-300 ease-in-out shadow-2xl
      ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      lg:hidden
    `}
      >
        <SidebarContent
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onItemClick={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 lg:px-8">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="mr-4 p-3 text-slate-600 hover:bg-white/80 hover:text-slate-900 rounded-xl transition-all duration-200 shadow-sm border border-slate-200/60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div>
          {activeSection === "users" && <UserManagement userData={userData}/>}
          {activeSection === "academic" && <AcademicSettings userData={userData} />}
          {activeSection === "structure" && <SchoolStructureTab userData={userData} />}
          {activeSection === "system" && <SystemSettings userData={userData} />}
          {activeSection === "promotions" && <PromotionManagement />}
        </div>
      </div>

      {/* Modal Components */}
      <LogDetailModal
        show={showLogModal}
        onClose={() => setShowLogModal(false)}
        log={selectedLog}
      />
    </div>
  );
};

const SidebarContent = ({ activeSection, setActiveSection, onItemClick }) => (
  <>
    {/* Header Section */}
    <div className="px-6 py-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
              <div className="flex items-center gap-3">
        <NavLink 
          to={"/students"} 
          className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-700 rounded-full hover:bg-white/60 transition-all duration-200 shadow-sm border border-slate-200/40 backdrop-blur-sm group"
        >
          <ArrowLeftToLine className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
        </NavLink>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Settings
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage your system preferences
          </p>
        </div>
      </div>
    </div>

    {/* Navigation Menu */}
    <nav className="mt-6 px-4 space-y-2">
      {menuItems.map((item, index) => (
        <div key={item.id} className="relative">
          <button
            onClick={() => {
              setActiveSection(item.id);
              onItemClick && onItemClick();
            }}
            className={`
              group w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl 
              transition-all duration-300 ease-out relative overflow-hidden
              ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/60 hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50 hover:scale-[1.01] border border-transparent hover:border-slate-200/40"
              }
            `}
          >
            {/* Active indicator */}
            {activeSection === item.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl blur-xl" />
            )}
            
            {/* Icon container */}
            <div className={`
              relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
              ${
                activeSection === item.id
                  ? "bg-white/20 shadow-inner"
                  : "bg-slate-100/60 group-hover:bg-white/80 group-hover:shadow-sm"
              }
            `}>
              <item.icon className={`
                w-4 h-4 transition-all duration-200 
                ${
                  activeSection === item.id
                    ? "text-white"
                    : "text-slate-500 group-hover:text-slate-700"
                }
              `} />
            </div>
            
            {/* Label */}
            <span className="relative z-10 tracking-wide">
              {item.label}
            </span>

            {/* Hover glow effect */}
            <div className={`
              absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
              ${activeSection !== item.id ? "bg-gradient-to-r from-slate-50 to-blue-50/40" : ""}
            `} />
          </button>


        </div>
      ))}
    </nav>

    {/* Footer Section */}
    <div className="absolute bottom-6 left-4 right-4">
      <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">System Status</h4>
            <p className="text-xs text-slate-500">All systems operational</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
          <span className="text-xs text-slate-600 font-medium">Online</span>
        </div>
      </div>
    </div>
  </>
);

export default SettingsModule;

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

    return null
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