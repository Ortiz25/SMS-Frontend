import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, CheckSquare, Square } from 'lucide-react';

const RoleFormModal = ({ show, onClose, onSave, role = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    isDefault: false
  });

  const [expandedGroups, setExpandedGroups] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (role) {
      setFormData(role);
      setExpandedGroups(['User Management', 'Academic', 'System']); // Expand all by default when editing
    }
  }, [role]);

  // Permission groups with detailed permissions
  const permissionGroups = {
    'User Management': {
      description: 'Control user access and roles',
      permissions: [
        { id: 'view_users', label: 'View Users', description: 'Can view user list and profiles' },
        { id: 'create_users', label: 'Create Users', description: 'Can add new users to the system' },
        { id: 'edit_users', label: 'Edit Users', description: 'Can modify user information' },
        { id: 'delete_users', label: 'Delete Users', description: 'Can remove users from the system' },
        { id: 'manage_roles', label: 'Manage Roles', description: 'Can assign and modify user roles' }
      ]
    },
    'Academic': {
      description: 'Manage academic features',
      permissions: [
        { id: 'view_classes', label: 'View Classes', description: 'Can view class information' },
        { id: 'manage_grades', label: 'Manage Grades', description: 'Can add and modify grades' },
        { id: 'view_students', label: 'View Students', description: 'Can view student information' },
        { id: 'manage_assignments', label: 'Manage Assignments', description: 'Can create and edit assignments' },
        { id: 'view_reports', label: 'View Reports', description: 'Can access academic reports' }
      ]
    },
    'System': {
      description: 'System-wide settings and configurations',
      permissions: [
        { id: 'manage_settings', label: 'Manage Settings', description: 'Can modify system settings' },
        { id: 'view_logs', label: 'View Logs', description: 'Can access system logs' },
        { id: 'manage_backup', label: 'Manage Backup', description: 'Can perform system backups' },
        { id: 'manage_notifications', label: 'Manage Notifications', description: 'Can configure system notifications' }
      ]
    }
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const togglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const toggleAllInGroup = (group, permissions) => {
    const groupPermissionIds = permissions.map(p => p.id);
    const allSelected = groupPermissionIds.every(id => formData.permissions.includes(id));
    
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !groupPermissionIds.includes(p))
        : [...new Set([...prev.permissions, ...groupPermissionIds])]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Role name is required';
    if (!formData.permissions.length) newErrors.permissions = 'At least one permission must be selected';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name *
              </label>
              <input
                type="text"
                className={`w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} py-2 px-3`}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions *
            </label>
            {errors.permissions && <p className="text-red-500 text-xs mb-2">{errors.permissions}</p>}
            
            <div className="border border-gray-200 rounded-lg">
              {Object.entries(permissionGroups).map(([group, { description, permissions }]) => (
                <div key={group} className="border-b last:border-b-0 border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center">
                        {expandedGroups.includes(group) ? (
                          <ChevronDown className="w-5 h-5 mr-2" />
                        ) : (
                          <ChevronRight className="w-5 h-5 mr-2" />
                        )}
                        <span className="font-medium">{group}</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-7">{description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAllInGroup(group, permissions);
                      }}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      {permissions.every(p => formData.permissions.includes(p.id)) ? (
                        <CheckSquare className="w-4 h-4 mr-1" />
                      ) : (
                        <Square className="w-4 h-4 mr-1" />
                      )}
                      Select All
                    </button>
                  </button>

                  {expandedGroups.includes(group) && (
                    <div className="px-4 pb-4">
                      <div className="space-y-3">
                        {permissions.map(permission => (
                          <label
                            key={permission.id}
                            className="flex items-start cursor-pointer"
                          >
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                              />
                            </div>
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-900">
                                {permission.label}
                              </span>
                              <p className="text-sm text-gray-500">
                                {permission.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 mr-2"
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
              />
              <span className="text-sm text-gray-700">Set as default role for new users</span>
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
              {role ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal;