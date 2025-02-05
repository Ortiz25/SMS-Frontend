import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, CheckSquare, Square } from 'lucide-react';

const RoleManagement = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access',
      users: 3,
      permissions: ['all'],
      isDefault: true
    },
    {
      id: 2,
      name: 'Teacher',
      description: 'Access to teaching-related features',
      users: 45,
      permissions: [
        'view_classes',
        'manage_grades',
        'view_students',
        'manage_assignments'
      ],
      isDefault: false
    }
  ]);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Available permissions grouped by module
  const permissionGroups = {
    'User Management': [
      'view_users',
      'create_users',
      'edit_users',
      'delete_users'
    ],
    'Academic': [
      'view_classes',
      'manage_grades',
      'view_students',
      'manage_assignments'
    ],
    'System': [
      'manage_settings',
      'view_reports',
      'manage_roles'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Role Management</h1>
          <p className="text-sm text-gray-500">Define roles and their permissions</p>
        </div>
        <button
          onClick={() => {
            setSelectedRole(null);
            setShowRoleModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {role.name}
                  {role.isDefault && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Default
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRole(role);
                    setShowRoleModal(true);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-md"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!role.isDefault && (
                  <button className="p-1 hover:bg-gray-100 rounded-md text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Users</p>
                <p className="text-lg font-semibold text-gray-900">{role.users}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Permissions</p>
                <p className="text-lg font-semibold text-gray-900">
                  {role.permissions.includes('all') 
                    ? 'Full Access' 
                    : `${role.permissions.length} Permissions`}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Key Permissions</h4>
              <div className="space-y-2">
                {Object.entries(permissionGroups).slice(0, 2).map(([group, permissions]) => (
                  <div key={group}>
                    <p className="text-xs text-gray-500">{group}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {permissions.slice(0, 3).map(permission => (
                        <span
                          key={permission}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            role.permissions.includes(permission) || role.permissions.includes('all')
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {permission.split('_').join(' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;