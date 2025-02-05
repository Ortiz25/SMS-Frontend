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
  const [activeSection, setActiveSection] = useState("users");

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
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 pt-6">
        <div className="px-4 pb-4 border-b border-gray-200">
          <NavLink to={"/"} >
            <ArrowLeftToLine className="mb-4 border-2 rounded-sm border-gray-500 w-6 h-6"/>
          </NavLink>

          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500">
            Manage your system preferences
          </p>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => (
            <div key={item.id} className="px-2">
              <button
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
              {/* 
              {activeSection === item.id && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.subItems.map(subItem => (
                    <button
                      key={subItem}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                      {subItem}
                    </button>
                  ))}
                </div>
              )} */}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-6">
        {activeSection === "users" && <UserManagement />}
        {activeSection === "security" && <SecuritySettings />}
        {activeSection === "notifications" && <NotificationSettings />}
        {activeSection === "system" && <SystemSettings />}
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

export default SettingsModule;
