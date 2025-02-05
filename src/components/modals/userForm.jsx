import React, { useState, useEffect } from "react";
import { X, Shield, Mail, Key } from "lucide-react";

const UserFormModal = ({ show, onClose, onSave, user = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    status: "Active",
    permissions: [],
    sendInvite: true,
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        password: "",
        confirmPassword: "",
      });
    }else{
        setFormData({
            name: "",
            email: "",
            role: "",
            department: "",
            status: "Active",
            permissions: [],
            sendInvite: true,
            password: "",
            confirmPassword: "",
          })
    }
  }, [user]);

  const roles = [
    { id: "admin", name: "Administrator", permissions: ["all"] },
    {
      id: "teacher",
      name: "Teacher",
      permissions: ["view_classes", "edit_grades"],
    },
    { id: "staff", name: "Staff", permissions: ["view_basic"] },
  ];

  const departments = [
    "Management",
    "Science",
    "Mathematics",
    "English",
    "History",
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!user && !formData.password)
      newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="bg-black opacity-50 w-full h-full absolute"></div>{" "}
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 z-50 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                className={`w-full rounded-md border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } py-2 px-3`}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                className={`w-full rounded-md border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } py-2 px-3`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Role and Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                className={`w-full rounded-md border ${
                  errors.role ? "border-red-500" : "border-gray-300"
                } py-2 px-3`}
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password Section */}
          {(!user || (user && formData.password)) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {!user && "*"}
                </label>
                <input
                  type="password"
                  className={`w-full rounded-md border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } py-2 px-3`}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password {!user && "*"}
                </label>
                <input
                  type="password"
                  className={`w-full rounded-md border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } py-2 px-3`}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 mr-2"
                checked={formData.sendInvite}
                onChange={(e) =>
                  setFormData({ ...formData, sendInvite: e.target.checked })
                }
              />
              <span className="text-sm text-gray-700">
                Send welcome email with login credentials
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {user ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
