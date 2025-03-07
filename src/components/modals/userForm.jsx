import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const UserFormModal = ({ show, onClose, onSave, user, roles }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "staff",
    is_active: true,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (show) {
      if (user) {
        // Edit mode: load user data (excluding password)
        setFormData({
          username: user.username || "",
          email: user.email || "",
          password: "", // Don't populate password field for security
          passwordConfirm: "", // Also reset password confirmation
          role: user.role || "staff",
          is_active: user.is_active !== undefined ? user.is_active : true,
        });
      } else {
        // Add mode: reset form
        setFormData({
          username: "",
          email: "",
          password: "",
          passwordConfirm: "",
          role: "staff",
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [show, user]);

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black opacity-25 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {user ? "Edit User" : "Add New User"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.username ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password {!user && <span className="text-red-500">*</span>}
                  {user && <span className="text-xs text-gray-500 ml-1">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              
              {/* Password Confirmation Field */}
              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                  Confirm Password {!user && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.passwordConfirm ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                />
                {errors.passwordConfirm && (
                  <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm}</p>
                )}
              </div>
              
              {/* Role Field */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.role ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                )}
              </div>
              
              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Active account
                </label>
              </div>
            </div>
            
            {/* Form Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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