import React, { useState, useEffect } from "react";
import { X, AlertCircle, Info, User, Mail, Lock, BadgeCheck } from "lucide-react";

const UserFormModal = ({ show, onClose, onSave, user, roles }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "staff",
    is_active: true,
  });
  
  // Define initial roles that should show the teacher link info
  const teacherRoles = ["teacher", "admin"];
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTeacherLinkInfo, setShowTeacherLinkInfo] = useState(false);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (show) {
      if (user) {
        // Edit mode: load user data (excluding password)
        const updatedData = {
          username: user.username || "",
          email: user.email || "",
          password: "", // Don't populate password field for security
          passwordConfirm: "", // Also reset password confirmation
          role: user.role || "staff",
          is_active: user.is_active !== undefined ? user.is_active : true,
        };
        setFormData(updatedData);
        // Show teacher link info if role is teacher or admin
        setShowTeacherLinkInfo(teacherRoles.includes(updatedData.role));
      } else {
        // Add mode: reset form
        const defaultData = {
          username: "",
          email: "",
          password: "",
          passwordConfirm: "",
          role: "staff",
          is_active: true,
        };
        setFormData(defaultData);
        // Initialize teacher link info based on the default role
        setShowTeacherLinkInfo(teacherRoles.includes(defaultData.role));
      }
      setErrors({});
    }
  }, [show, user]);

  // Show teacher link info when role changes to teacher or admin
  useEffect(() => {
    setShowTeacherLinkInfo(teacherRoles.includes(formData.role));
  }, [formData.role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Password validation (only required for new users)
    if (!user && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Password confirmation validation
    if (formData.password && formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = "Role is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Remove empty password field when editing and remove passwordConfirm field
    const dataToSubmit = { ...formData };
    if (user && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    
    // Always remove passwordConfirm as we don't need to send it to the API
    delete dataToSubmit.passwordConfirm;
    
    onSave(dataToSubmit)
      .catch(err => {
        console.error("Error submitting form:", err);
        // You could set API-specific errors here
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/25 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {user ? "Edit User" : "Add New User"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`block w-full pl-10 rounded-lg border ${
                      errors.username ? "border-red-300 ring-red-500" : "border-gray-300"
                    } px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.username}
                  </p>
                )}
              </div>
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 rounded-lg border ${
                      errors.email ? "border-red-300 ring-red-500" : "border-gray-300"
                    } px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              
              {/* Teacher Link Info - Shows when role is teacher or admin */}
              {showTeacherLinkInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    {user ? (
                      <p>
                        Changing this email will update the linked teacher's email if this account is linked to a teacher profile.
                      </p>
                    ) : (
                      <p>
                        If a teacher exists with this email address, the account will be automatically linked to that teacher's profile.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password {!user && <span className="text-red-500">*</span>}
                  {user && <span className="text-xs text-gray-500 ml-1">(Leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 rounded-lg border ${
                      errors.password ? "border-red-300 ring-red-500" : "border-gray-300"
                    } px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>
              
              {/* Password Confirmation Field */}
              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password {!user && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="passwordConfirm"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    className={`block w-full pl-10 rounded-lg border ${
                      errors.passwordConfirm ? "border-red-300 ring-red-500" : "border-gray-300"
                    } px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
                  />
                </div>
                {errors.passwordConfirm && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.passwordConfirm}
                  </p>
                )}
              </div>
              
              {/* Role Field */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BadgeCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`block w-full pl-10 rounded-lg border ${
                      errors.role ? "border-red-300 ring-red-500" : "border-gray-300"
                    } px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm appearance-none bg-none`}
                    style={{ backgroundPosition: "right 0.5rem center" }}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.role}
                  </p>
                )}
              </div>
              
              {/* Active Status */}
              <div className="flex items-center py-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-gray-700">
                  Active account
                </label>
              </div>
            </div>
            
            {/* Form Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting 
                  ? "Saving..." 
                  : user 
                    ? "Update User" 
                    : "Create User"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;