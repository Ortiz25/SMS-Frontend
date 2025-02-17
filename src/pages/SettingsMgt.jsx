import React, { useState } from "react";
import {
  Users,
  Settings,
  Shield,
  Key,
  Bell,
  ArrowLeftToLine,
} from "lucide-react";
import UserManagement from "../components/userMgt";
import SecuritySettings from "../components/securitySettings";
import NotificationSettings from "../components/notificationSettings";
import SystemSettings from "../components/systemSettings";
import RoleFormModal from "../components/modals/roleForm";
import UserFormModal from "../components/modals/userForm";
import LogDetailModal from "../components/modals/logDetail";
import Navbar from "../components/navbar";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    id: "users",
    label: "User Management",
    icon: Users,
    subItems: [],
  },
  {
    id: "security",
    label: "Security Settings",
    icon: Shield,
    subItems: ["Password Policy", "Two-Factor Auth", "Session Management"],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    subItems: ["Email Templates", "SMS Templates", "Alert Settings"],
  },
  {
    id: "system",
    label: "System Settings",
    icon: Settings,
    subItems: ["General", "Backup & Restore", "Maintenance"],
  },
];

const SettingsModule = () => {
  
  const [activeSection, setActiveSection] = useState('users');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  // Handlers for Log Modal
  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowLogModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div 
        className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )}

    {/* Sidebar - Desktop */}
    <div className="hidden lg:block w-64 bg-white border-r border-gray-200 pt-2">
      <SidebarContent 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
    </div>

    {/* Mobile Sidebar */}
    <div className={`
      fixed top-0 left-0 z-50 w-64 h-full bg-white 
      transform transition-transform duration-300 ease-in-out
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:hidden
    `}>
      <SidebarContent 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onItemClick={() => setIsMobileMenuOpen(false)}
      />
    </div>

    {/* Main Content */}
    <div className="flex-1 px-4 py-6 lg:px-8">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between mb-4 border-b">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-9 w-9" 
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
        {activeSection === "users" && <UserManagement />}
        {activeSection === "security" && <SecuritySettings />}
        {activeSection === "notifications" && <NotificationSettings />}
        {activeSection === "system" && <SystemSettings />}
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
  <div className="px-6 pb-6 border-b border-gray-300 ">
    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-4 mt-4">
      <NavLink to={"/"} className="text-gray-600 hover:text-gray-900">
        <ArrowLeftToLine className="w-6 h-6 border-2 border-gray-500 rounded-sm p-1" />
      </NavLink>
      Settings
    </h2>
    <p className="text-sm text-gray-500 mt-2">Manage your system preferences</p>
  </div>

  <nav className="mt-6 p-4 space-y-2">
    {menuItems.map((item) => (
      <div key={item.id} className="px-2">
        <button
          onClick={() => {
            setActiveSection(item.id);
            onItemClick && onItemClick();
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
            activeSection === item.id
              ? "bg-blue-100 text-blue-700 shadow-sm"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <item.icon className="w-6 h-6 text-gray-500" />
          {item.label}
        </button>
      </div>
    ))}
  </nav>
</>

  );

export default SettingsModule;
