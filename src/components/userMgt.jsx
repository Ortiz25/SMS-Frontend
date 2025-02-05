import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  UserCheck,
  UserRoundPenIcon,
} from "lucide-react";
import UserFormModal from "./modals/userForm";
import RoleFormModal from "./modals/roleForm";
import DeleteConfirmationModal from "./modals/deleteUser";

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@school.com",
      role: "Administrator",
      department: "Management",
      status: "Active",
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      name: "Sarah Wilson",
      email: "sarah.wilson@school.com",
      role: "Teacher",
      department: "Science",
      status: "Active",
      lastActive: "1 day ago",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Handlers for User Modal
  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    console.log(user);
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = (userData) => {
    if (selectedUser) {
      console.log("Updating user:", userData);
    } else {
      console.log("Adding new user:", userData);
    }
    setShowUserModal(false);
  };

  // Handlers for Role Modal
  const handleAddRole = () => {
    setSelectedRole(null); // Clear any selected role
    setShowRoleModal(true); // Show modal in 'add' mode
  };

  const handleEditRole = (role) => {
    setSelectedRole(role); // Set the role to edit
    setShowRoleModal(true); // Show modal in 'edit' mode
  };

  const handleSaveRole = (roleData) => {
    if (selectedRole) {
      // Update existing role
      console.log("Updating role:", roleData);
    } else {
      // Add new role
      console.log("Adding new role:", roleData);
    }
    setShowRoleModal(false);
  };

  // Handle delete initiation
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (userId) => {
    // Delete user logic
    setUsers(users.filter((user) => user.id !== userId));

    // Show success message (you can implement a toast notification here)
    console.log("User deleted successfully");

    // Close modal and reset state
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const roles = ["Administrator", "Teacher", "Staff", "Department Head"];
  const departments = [
    "Management",
    "Science",
    "Mathematics",
    "English",
    "History",
  ];

  return (
    <div className="space-y-6">
    {/* Header - Responsive Layout */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          User Management
        </h1>
        <p className="text-sm text-gray-500">
          Manage system users and their access
        </p>
      </div>
      <button
        onClick={handleAddUser}
        className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add User
      </button>
    </div>

    {/* Filters - Responsive Layout */}
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          className="w-full sm:w-auto rounded-md border border-gray-300 py-2 px-3"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </button>
      </div>
    </div>

    {/* Responsive Table */}
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['User', 'Role', 'Department', 'Status', 'Last Active', 'Actions'].map((header) => (
              <th 
                key={header} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              {/* Mobile-Friendly Responsive Columns */}
              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <span className="text-sm text-gray-900">{user.role}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <span className="text-sm text-gray-900">{user.department}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <span className="text-sm text-gray-500">{user.lastActive}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-1 hover:bg-gray-100 rounded-md"
                  >
                    <UserRoundPenIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="p-1 hover:bg-gray-100 rounded-md text-red-500"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Modals */}
    <UserFormModal
      show={showUserModal}
      onClose={() => setShowUserModal(false)}
      onSave={handleSaveUser}
      user={selectedUser}
    />

    <DeleteConfirmationModal
      show={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false);
        setUserToDelete(null);
      }}
      onConfirm={handleDeleteConfirm}
      user={userToDelete}
    />
  </div>
  );
};

export default UserManagement;
