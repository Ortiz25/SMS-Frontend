import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  Clock,
  UserRoundPenIcon,
  Trash2,
  UserCheck,
  UserX,
  CalendarClock,
} from "lucide-react";
import UserFormModal from "./modals/userForm";
import DeleteConfirmationModal from "./modals/deleteUser";
import { format } from "date-fns";

const UserManagement = () => {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Roles based on the database schema
  const roles = [
    "admin",
    "teacher",
    "student",
    "parent",
    "staff",
    "accountant",
    "librarian",
  ];

  console.log(user)

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/backend/api/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError(`Failed to fetch users: ${err.message}`);
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users by search query and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Handlers for User Modal
  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSaveUser = async (userData) => {
    try {
      let response;

      if (selectedUser) {
        // Update existing user
        response = await fetch(
          `/backend/api/users/${selectedUser.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          }
        );
      } else {
        // Create new user
        response = await fetch("/backend/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedUser = await response.json();

      if (selectedUser) {
        // Update user in state
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? updatedUser : user
          )
        );
      } else {
        // Add new user to state
        setUsers([...users, updatedUser]);
      }

      setShowUserModal(false);
    } catch (err) {
      console.error("Error saving user:", err);
      // You could add error handling UI here
    }
  };

  // Handle delete initiation
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async (userId) => {
    try {
      const response = await fetch(
        `/backend/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Remove user from state
      setUsers(users.filter((user) => user.id !== userId));

      // Close modal and reset state
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      // You could add error handling UI here
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (user) => {
    try {
      const updatedStatus = !user.is_active;

      const response = await fetch(`/api/users/${user.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: updatedStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update user in state
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, is_active: updatedStatus } : u
        )
      );
    } catch (err) {
      console.error("Error toggling user status:", err);
      // You could add error handling UI here
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  if(user.role !== "admin"){return null}

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
            placeholder="Search users by username or email..."
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
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Responsive Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "User",
                  "Role",
                  "Status",
                  "Created",
                  "Last Login",
                  "Actions",
                ].map((header) => (
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className="text-sm text-gray-900 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarClock className="w-4 h-4 mr-1" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(user.last_login)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1 hover:bg-gray-100 rounded-md text-blue-600"
                          title="Edit User"
                        >
                          <UserRoundPenIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1 hover:bg-gray-100 rounded-md ${
                            user.is_active
                              ? "text-orange-500"
                              : "text-green-600"
                          }`}
                          title={
                            user.is_active ? "Deactivate User" : "Activate User"
                          }
                        >
                          {user.is_active ? (
                            <UserX className="w-5 h-5" />
                          ) : (
                            <UserCheck className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="p-1 hover:bg-gray-100 rounded-md text-red-500"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <UserFormModal
        show={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        roles={roles}
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
